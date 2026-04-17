import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5000';
const OUT_DIR = '/tmp/screenshots';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const publicPages = [
  { name: '01_login', url: '/login' },
  { name: '02_register', url: '/register' },
];

const loggedInPages = [
  { name: '03_dashboard', url: '/dashboard' },
  { name: '04_gov-programs', url: '/gov-programs' },
  { name: '05_investment-programs', url: '/investment-programs' },
  { name: '06_recommendations', url: '/recommendations' },
  { name: '07_bookmarks', url: '/bookmarks' },
  { name: '08_settings', url: '/settings' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  // Public pages
  for (const p of publicPages) {
    try {
      console.log(`Capturing ${p.name}...`);
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle2', timeout: 20000 });
      await sleep(2000);
      await page.screenshot({ path: path.join(OUT_DIR, `${p.name}.png`), fullPage: true });
      console.log(`  ✓ ${p.name}.png`);
    } catch (e) {
      console.error(`  ✗ ${p.name}: ${e.message}`);
    }
  }

  // Login
  try {
    console.log('Logging in...');
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(1000);
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'test1234');
    await page.click('button[type="submit"]');
    await sleep(3000);
    console.log(`  -> URL: ${page.url()}`);
  } catch (e) {
    console.error(`  ✗ Login: ${e.message}`);
  }

  // Logged-in pages
  for (const p of loggedInPages) {
    try {
      console.log(`Capturing ${p.name}...`);
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle2', timeout: 20000 });
      await sleep(2500);
      await page.screenshot({ path: path.join(OUT_DIR, `${p.name}.png`), fullPage: true });
      console.log(`  ✓ ${p.name}.png`);
    } catch (e) {
      console.error(`  ✗ ${p.name}: ${e.message}`);
    }
  }

  // Program detail - try to find a real link
  try {
    console.log('Capturing 09_program-detail...');
    await page.goto(BASE_URL + '/gov-programs', { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(2500);
    const link = await page.$('a[href*="/program"], .card a, article a');
    if (link) {
      const href = await page.evaluate(el => el.href, link);
      console.log(`  -> found link: ${href}`);
      await page.goto(href, { waitUntil: 'networkidle2', timeout: 20000 });
      await sleep(2000);
      await page.screenshot({ path: path.join(OUT_DIR, '09_program-detail.png'), fullPage: true });
      console.log('  ✓ 09_program-detail.png');
    } else {
      // Try /program-detail directly
      await page.goto(BASE_URL + '/program-detail', { waitUntil: 'networkidle2', timeout: 10000 });
      await sleep(1500);
      await page.screenshot({ path: path.join(OUT_DIR, '09_program-detail.png'), fullPage: true });
      console.log('  ✓ 09_program-detail.png (direct)');
    }
  } catch (e) {
    console.error(`  ✗ program-detail: ${e.message}`);
  }

  await browser.close();

  console.log('\n=== Done! Screenshots saved to /tmp/screenshots/ ===');
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).sort();
  files.forEach(f => {
    const size = fs.statSync(path.join(OUT_DIR, f)).size;
    console.log(`  ${f} (${(size/1024).toFixed(0)}KB)`);
  });
})();
