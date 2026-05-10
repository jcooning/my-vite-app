import { Client } from '@notionhq/client';
const notion = new Client({ auth: 'abc' });
console.log(notion.databases);
