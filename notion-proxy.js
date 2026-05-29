import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { DAVClient } from 'tsdav';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const notion = new Client({ auth: process.env.VITE_NOTION_API_KEY });
const databaseId = process.env.VITE_NOTION_DATABASE_ID;

// iCloud CalDAV 공통 유틸
async function getICloudContext() {
    const appleId = process.env.APPLE_ID;
    const applePassword = process.env.APPLE_APP_PASSWORD;
    if (!appleId || !applePassword) return null;
    const client = new DAVClient({
        serverUrl: 'https://caldav.icloud.com',
        credentials: { username: appleId, password: applePassword },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
    });
    await client.login();
    const calendars = await client.fetchCalendars();
    const calendar = calendars.find(c => c.displayName === '직장') || calendars[0];
    if (!calendar) return null;
    return { client, calendar };
}

function buildIcs({ uid, name, date, time, location, groomPhone, bridePhone, products, memo }) {
    const dtstamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    let dtstart, dtend;
    if (date && time) {
        const cleanTime = time.replace(/[^0-9:]/g, '');
        const [h, m] = cleanTime.split(':');
        const start = new Date(`${date}T${h.padStart(2,'0')}:${(m||'00').padStart(2,'0')}:00`);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
        dtstart = `DTSTART:${start.toISOString().replace(/[-:.]/g,'').slice(0,15)}`;
        dtend = `DTEND:${end.toISOString().replace(/[-:.]/g,'').slice(0,15)}`;
    } else if (date) {
        const d = date.replace(/-/g, '');
        dtstart = `DTSTART;VALUE=DATE:${d}`;
        dtend = `DTEND;VALUE=DATE:${d}`;
    } else {
        return null;
    }
    const summary = name ? `${name} 예식` : '예식 예약';
    const productStr = products && products.length > 0 ? `\\n상품: ${products.join(', ')}` : '';
    const escapedMemo = memo ? memo.replace(/\n/g, '\\n') : '';
    const memoStr = escapedMemo ? `\\n메모: ${escapedMemo}` : '';
    const desc = `연락처: ${groomPhone || '-'} / ${bridePhone || '-'}${productStr}${memoStr}`;
    return [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//WeddingApp//KO',
        'BEGIN:VEVENT',
        `UID:${uid}`, `DTSTAMP:${dtstamp}`, dtstart, dtend,
        `SUMMARY:${summary}`, `DESCRIPTION:${desc}`,
        location ? `LOCATION:${location}` : null,
        'END:VEVENT', 'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');
}

// iCloud 이벤트 생성 (신규 예약)
async function addToICloudCalendar({ notionPageId, name, date, time, location, groomPhone, bridePhone, products, memo }) {
    try {
        const ctx = await getICloudContext();
        if (!ctx) { console.log('iCloud 인증 정보 없음'); return; }
        const { client, calendar } = ctx;
        const uid = `wedding-${notionPageId}@app`;
        const ics = buildIcs({ uid, name, date, time, location, groomPhone, bridePhone, products, memo });
        if (!ics) return;
        await client.createCalendarObject({ calendar, filename: `${uid}.ics`, iCalString: ics });
        console.log('iCloud 캘린더 등록 완료:', name);
    } catch (error) {
        console.error('iCloud 캘린더 오류:', error.message);
    }
}

// iCloud 이벤트 수정 (기존 예약 업데이트)
async function updateICloudCalendar({ notionPageId, name, date, time, location, groomPhone, bridePhone, products, memo }) {
    try {
        const ctx = await getICloudContext();
        if (!ctx) return;
        const { client, calendar } = ctx;
        const uid = `wedding-${notionPageId}@app`;
        const ics = buildIcs({ uid, name, date, time, location, groomPhone, bridePhone, products, memo });
        if (!ics) return;
        const objects = await client.fetchCalendarObjects({ calendar });
        const existing = objects.find(o => o.data?.includes(`UID:${uid}`));
        if (existing) {
            await client.updateCalendarObject({ calendarObject: { url: existing.url, data: ics, etag: existing.etag } });
            console.log('iCloud 캘린더 수정 완료:', name);
        } else {
            await client.createCalendarObject({ calendar, filename: `${uid}.ics`, iCalString: ics });
            console.log('iCloud 캘린더 신규 등록(수정fallback):', name);
        }
    } catch (error) {
        console.error('iCloud 캘린더 수정 오류:', error.message);
    }
}

// iCloud 이벤트 삭제
async function deleteFromICloudCalendar(notionPageId) {
    try {
        const ctx = await getICloudContext();
        if (!ctx) return;
        const { client, calendar } = ctx;
        const uid = `wedding-${notionPageId}@app`;
        const objects = await client.fetchCalendarObjects({ calendar });
        const existing = objects.find(o => o.data?.includes(`UID:${uid}`));
        if (existing) {
            await client.deleteCalendarObject({ calendarObject: existing });
            console.log('iCloud 캘린더 삭제 완료:', uid);
        }
    } catch (error) {
        console.error('iCloud 캘린더 삭제 오류:', error.message);
    }
}

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
        // iCloud 캘린더 자동 등록
        addToICloudCalendar({ notionPageId: response.id, name, date, time, location, groomPhone, bridePhone, products, memo });
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
        // iCloud 캘린더 수정
        updateICloudCalendar({ notionPageId: pageId, name, date, time, location, groomPhone, bridePhone, products, memo });
        res.json({ success: true, pageId: response.id });
    } catch (error) {
        console.error('--- Notion Update API Error Details ---');
        console.error('Message:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE (Archive page in Notion)
app.delete('/api/notion/:pageId', async (req, res) => {
    const { pageId } = req.params;
    console.log('Delete (Archive) request for Page ID:', pageId);
    try {
        const response = await notion.pages.update({
            page_id: pageId,
            archived: true
        });

        console.log('Notion archive success:', response.id);
        deleteFromICloudCalendar(pageId);
        res.json({ success: true, pageId: response.id });
    } catch (error) {
        console.error('--- Notion Archive API Error Details ---');
        console.error('Message:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Product/option price data for calculating totalPrice when Notion field is empty
const PRODUCT_PRICES = {
    'Premium Album Package': 849000,
    'Special Album': 640000,
    'Basic Album': 496000,
    'Private Data': 389000,
    'Special Data': 318000,
    '식전원판': 99000,
    '2부피로연': 220000,
    '피로연장 인사촬영': 99000,
    '야외웨딩': 110000,
    '교회예배': 77000,
};

// READ ALL
app.get('/api/notion', async (req, res) => {
    try {
        console.log('Querying database via fetch:', databaseId);

        let allResults = [];
        let hasMore = true;
        let startCursor = undefined;

        while (hasMore) {
            const body = {
                sorts: [{ property: '예식 날짜', direction: 'ascending' }],
                page_size: 100,
            };
            if (startCursor) body.start_cursor = startCursor;

            const fetchResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.VITE_NOTION_API_KEY}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
            });

            if (!fetchResponse.ok) {
                const errorData = await fetchResponse.json();
                throw new Error(errorData.message || 'Notion API error');
            }

            const response = await fetchResponse.json();
            allResults = allResults.concat(response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor;
        }

        console.log(`총 ${allResults.length}건 로드 완료`);

        const reservations = allResults.map(page => {
            const props = page.properties;
            return {
                id: page.id,
                notionPageId: page.id,
                name: props['예약자명']?.title[0]?.plain_text || '이름 없음',
                date: props['예식 날짜']?.date?.start || '',
                time: props['예식 시간']?.rich_text[0]?.plain_text || '',
                location: props['예식 장소']?.rich_text[0]?.plain_text || '',
                totalPrice: (() => {
                    const notionPrice = props['총 금액']?.number;
                    if (notionPrice) return notionPrice;
                    // 금액이 없으면 상품 및 옵션에서 자동 계산
                    const items = props['상품 및 옵션']?.multi_select.map(item => item.name) || [];
                    return items.reduce((sum, name) => sum + (PRODUCT_PRICES[name] || 0), 0);
                })(),
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
