import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

const notion = new Client({ auth: process.env.VITE_NOTION_API_KEY });

async function test() {
    try {
        const response = await notion.users.me();
        console.log('Token is VALID!');
        console.log('Bot Name:', response.name);
    } catch (error) {
        console.log('Token is INVALID!');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
    }
}

test();
