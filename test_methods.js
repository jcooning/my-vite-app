import { Client } from '@notionhq/client';
const notion = new Client({ auth: 'abc' });

function getAllProperties(obj) {
    let properties = new Set();
    let currentObj = obj;
    while (currentObj) {
        Object.getOwnPropertyNames(currentObj).forEach(item => properties.add(item));
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return Array.from(properties);
}

console.log('Notion Databases properties:', getAllProperties(notion.databases));
