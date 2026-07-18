const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('BROWSER PAGE ERROR:', err.toString());
  });

  console.log('Navigating to http://localhost:5173/');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  console.log('Looking for the button...');
  // Wait for the button.
  // The button has text "Enable Heatmap"
  await page.waitForXPath("//button[contains(., 'Enable Heatmap')]");
  
  const [button] = await page.$x("//button[contains(., 'Enable Heatmap')]");
  
  if (button) {
    console.log('Clicking the button...');
    await button.click();
    
    // Wait a bit to let the error happen
    await new Promise(r => setTimeout(r, 2000));
  } else {
    console.log('Button not found');
  }

  await browser.close();
})();
