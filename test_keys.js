import { Client } from '@notionhq/client';
const notion = new Client({ auth: 'abc' });
console.log('Notion keys:', Object.keys(notion));
if (notion.databases) {
    console.log('Notion.databases keys:', Object.keys(notion.databases));
}
