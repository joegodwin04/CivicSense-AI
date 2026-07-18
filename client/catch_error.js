import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR LOG:', msg.text());
    } else {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('BROWSER PAGE ERROR:', err.toString());
  });

  console.log('Navigating to http://[::1]:5174/');
  try {
    await page.goto('http://[::1]:5174/', { waitUntil: 'domcontentloaded' });
    
    console.log('Waiting for button...');
    await page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.textContent.includes('Enable Heatmap'));
    }, { timeout: 10000 });
    
    console.log('Clicking the button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent.includes('Enable Heatmap'));
      if (btn) btn.click();
    });
    
    // Wait a bit to let the error happen
    await new Promise(r => setTimeout(r, 2000));
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  } finally {
    await browser.close();
  }
})();
