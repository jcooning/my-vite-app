import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
dotenv.config();

const notion = new Client({ auth: process.env.VITE_NOTION_API_KEY });
console.log('Type of notion.databases.query:', typeof notion.databases?.query);
console.log('Keys of notion.databases:', Object.keys(notion.databases || {}));
