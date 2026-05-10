const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  const daum = await page.evaluate(() => {
    return {
      daum: typeof window.daum,
      postcode: window.daum ? typeof window.daum.Postcode : 'undefined',
      keys: window.daum ? Object.keys(window.daum) : []
    };
  });
  console.log('Daum object:', daum);
  await browser.close();
})();
