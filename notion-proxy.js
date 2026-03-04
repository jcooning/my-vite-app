import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.VITE_NOTION_API_KEY });
const databaseId = process.env.VITE_NOTION_DATABASE_ID;

// CREATE
app.post('/api/notion', async (req, res) => {
    console.log('Received data:', req.body);
    try {
        const { name, date, time, location, products, totalPrice, memo, groomPhone, bridePhone } = req.body;

        const properties = {
            '예약자명': {
                title: [{ text: { content: name || '이벤트명 없음' } }]
            }
        };

        if (date) {
            properties['예식 날짜'] = { date: { start: date } };
        }
        if (time) {
            properties['예식 시간'] = { rich_text: [{ text: { content: time } }] };
        }
        if (location) {
            properties['예식 장소'] = { rich_text: [{ text: { content: location } }] };
        }
        if (totalPrice !== undefined) {
            properties['총 금액'] = { number: totalPrice };
        }
        if (products && products.length > 0) {
            properties['상품 및 옵션'] = { multi_select: products.map(p => ({ name: p })) };
        }
        if (memo) {
            properties['상담메모'] = { rich_text: [{ text: { content: memo } }] };
        }
        if (groomPhone) {
            properties['신랑 연락처'] = { rich_text: [{ text: { content: groomPhone } }] };
        }
        if (bridePhone) {
            properties['신부 연락처'] = { rich_text: [{ text: { content: bridePhone } }] };
        }

        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: properties
        });

        console.log('Notion success:', response.id);
        res.json({ success: true, pageId: response.id });
    } catch (error) {
        console.error('--- Notion API Error Details ---');
        console.error('Message:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE
app.patch('/api/notion/:pageId', async (req, res) => {
    const { pageId } = req.params;
    console.log('Update request for Page ID:', pageId, 'Data:', req.body);
    try {
        const { name, date, time, location, products, totalPrice, memo, groomPhone, bridePhone } = req.body;

        const properties = {};
        if (name) {
            properties['예약자명'] = { title: [{ text: { content: name } }] };
        }
        if (date) {
            properties['예식 날짜'] = { date: { start: date } };
        }
        if (time) {
            properties['예식 시간'] = { rich_text: [{ text: { content: time } }] };
        }
        if (location) {
            properties['예식 장소'] = { rich_text: [{ text: { content: location } }] };
        }
        if (totalPrice !== undefined) {
            properties['총 금액'] = { number: totalPrice };
        }
        if (products && products.length > 0) {
            properties['상품 및 옵션'] = { multi_select: products.map(p => ({ name: p })) };
        }
        if (memo !== undefined) {
            properties['상담메모'] = { rich_text: [{ text: { content: memo } }] };
        }
        if (groomPhone !== undefined) {
            properties['신랑 연락처'] = { rich_text: [{ text: { content: groomPhone } }] };
        }
        if (bridePhone !== undefined) {
            properties['신부 연락처'] = { rich_text: [{ text: { content: bridePhone } }] };
        }

        const response = await notion.pages.update({
            page_id: pageId,
            properties: properties
        });

        console.log('Notion update success:', response.id);
        res.json({ success: true, pageId: response.id });
    } catch (error) {
        console.error('--- Notion Update API Error Details ---');
        console.error('Message:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// READ ALL
app.get('/api/notion', async (req, res) => {
    try {
        console.log('Querying database via fetch:', databaseId);
        const fetchResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VITE_NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sorts: [
                    {
                        property: '예식 날짜',
                        direction: 'ascending',
                    },
                ],
            }),
        });

        if (!fetchResponse.ok) {
            const errorData = await fetchResponse.json();
            throw new Error(errorData.message || 'Notion API error');
        }

        const response = await fetchResponse.json();

        const reservations = response.results.map(page => {
            const props = page.properties;
            return {
                id: page.id,
                notionPageId: page.id,
                name: props['예약자명']?.title[0]?.plain_text || '이름 없음',
                date: props['예식 날짜']?.date?.start || '',
                time: props['예식 시간']?.rich_text[0]?.plain_text || '',
                location: props['예식 장소']?.rich_text[0]?.plain_text || '',
                totalPrice: props['총 금액']?.number || 0,
                products: props['상품 및 옵션']?.multi_select.map(item => item.name) || [],
                memo: props['상담메모']?.rich_text[0]?.plain_text || '',
                groomPhone: props['신랑 연락처']?.rich_text[0]?.plain_text || '',
                bridePhone: props['신부 연락처']?.rich_text[0]?.plain_text || ''
            };
        });

        res.json(reservations);
    } catch (error) {
        console.error('Notion Fetch API Error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// VENUE SEARCH (PROXY TO KAKAO)
// VENUE SEARCH (PROXY TO KAKAO)
app.get('/api/search-venue', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.json([]);

    // Fallback to a hardcoded key if .env is not set (for safety), or error out
    const kakaoKey = process.env.VITE_KAKAO_REST_API_KEY || '701614f16b2518e93248386f68c7438e'; // Temporary fallback

    try {
        const response = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `KakaoAK ${kakaoKey}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Kakao API Error:', response.status, errorText);
            return res.status(response.status).json({ error: 'KaKao API Error', details: errorText });
        }

        const data = await response.json();
        res.json(data.documents || []);
    } catch (error) {
        console.error('Search Venue Internal Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Notion Proxy Server running at http://localhost:${PORT}`);
});
