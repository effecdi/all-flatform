const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';
const OUT_DIR = '/tmp/screenshots';

// 페이지 목록 (로그인 없이 접근 가능한 것 + 로그인 후)
const pages = [
  { name: '01_login', url: '/login', waitFor: 'h1, h2, form' },
  { name: '02_register', url: '/register', waitFor: 'h1, h2, form' },
];

const loggedInPages = [
  { name: '03_dashboard', url: '/dashboard', waitFor: 'main, .dashboard' },
  { name: '04_gov-programs', url: '/gov-programs', waitFor: 'main' },
  { name: '05_investment-programs', url: '/investment-programs', waitFor: 'main' },
  { name: '06_recommendations', url: '/recommendations', waitFor: 'main' },
  { name: '07_bookmarks', url: '/bookmarks', waitFor: 'main' },
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  // Public pages
  for (const p of pages) {
    try {
      console.log(`Screenshotting ${p.name}...`);
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await sleep(1500);
      await page.screenshot({ path: path.join(OUT_DIR, `${p.name}.png`), fullPage: true });
      console.log(`  -> saved ${p.name}.png`);
    } catch (e) {
      console.error(`  !! ${p.name} failed: ${e.message}`);
    }
  }

  // Login first
  try {
    console.log('Logging in...');
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1000);

    // Fill login form
    await page.type('input[type="email"], input[name="email"]', 'admin@example.com');
    await page.type('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await sleep(3000);
    console.log(`  -> Now at: ${page.url()}`);
  } catch (e) {
    console.error(`  !! Login failed: ${e.message}`);
  }

  // Logged-in pages
  for (const p of loggedInPages) {
    try {
      console.log(`Screenshotting ${p.name}...`);
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await sleep(2000);
      await page.screenshot({ path: path.join(OUT_DIR, `${p.name}.png`), fullPage: true });
      console.log(`  -> saved ${p.name}.png`);
    } catch (e) {
      console.error(`  !! ${p.name} failed: ${e.message}`);
    }
  }

  // Program detail (try to click first item)
  try {
    console.log('Screenshotting program-detail...');
    await page.goto(BASE_URL + '/gov-programs', { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(2000);
    // Try clicking first program card
    const firstCard = await page.$('a[href*="/program/"], a[href*="/programs/"], .program-card a, [data-program-id] a, .card a');
    if (firstCard) {
      await firstCard.click();
      await sleep(2000);
      await page.screenshot({ path: path.join(OUT_DIR, '08_program-detail.png'), fullPage: true });
      console.log('  -> saved 08_program-detail.png');
    } else {
      console.log('  -> No program card link found');
    }
  } catch (e) {
    console.error(`  !! program-detail failed: ${e.message}`);
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to /tmp/screenshots/');
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png'));
  files.forEach(f => console.log('  ' + f));
})();
