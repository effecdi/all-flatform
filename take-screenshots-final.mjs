import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5000';
const OUT_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const pages = [
  { name: '01_dashboard',            url: '/' },
  { name: '02_gov-programs',         url: '/programs/government' },
  { name: '03_investment-programs',  url: '/programs/investment' },
  { name: '04_recommendations',      url: '/recommendations' },
  { name: '05_discover',             url: '/discover' },
  { name: '06_bookmarks',            url: '/bookmarks' },
  { name: '07_settings',             url: '/settings' },
  { name: '08_onboarding',           url: '/onboarding' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 }
  });
  const page = await browser.newPage();

  for (const p of pages) {
    try {
      console.log(`Capturing ${p.name}...`);
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle2', timeout: 20000 });
      await sleep(2500);
      await page.screenshot({ path: path.join(OUT_DIR, `${p.name}.png`), fullPage: true });
      const size = fs.statSync(path.join(OUT_DIR, `${p.name}.png`)).size;
      console.log(`  ✓ ${p.name}.png (${(size/1024).toFixed(0)}KB)`);
    } catch (e) {
      console.error(`  ✗ ${p.name}: ${e.message}`);
    }
  }

  // Program detail - grab first gov program card
  try {
    console.log('Capturing 09_gov-program-detail...');
    await page.goto(BASE_URL + '/programs/government', { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(2500);
    const link = await page.$('a[href*="/programs/government/"]');
    if (link) {
      const href = await page.evaluate(el => el.href, link);
      console.log(`  -> ${href}`);
      await page.goto(href, { waitUntil: 'networkidle2', timeout: 20000 });
      await sleep(2500);
      await page.screenshot({ path: path.join(OUT_DIR, '09_gov-program-detail.png'), fullPage: true });
      const size = fs.statSync(path.join(OUT_DIR, '09_gov-program-detail.png')).size;
      console.log(`  ✓ 09_gov-program-detail.png (${(size/1024).toFixed(0)}KB)`);
    } else {
      console.log('  -> No gov program link found');
    }
  } catch (e) {
    console.error(`  ✗ gov-program-detail: ${e.message}`);
  }

  // Investment program detail
  try {
    console.log('Capturing 10_investment-program-detail...');
    await page.goto(BASE_URL + '/programs/investment', { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(2500);
    const link = await page.$('a[href*="/programs/investment/"]');
    if (link) {
      const href = await page.evaluate(el => el.href, link);
      console.log(`  -> ${href}`);
      await page.goto(href, { waitUntil: 'networkidle2', timeout: 20000 });
      await sleep(2500);
      await page.screenshot({ path: path.join(OUT_DIR, '10_investment-program-detail.png'), fullPage: true });
      const size = fs.statSync(path.join(OUT_DIR, '10_investment-program-detail.png')).size;
      console.log(`  ✓ 10_investment-program-detail.png (${(size/1024).toFixed(0)}KB)`);
    } else {
      console.log('  -> No investment program link found');
    }
  } catch (e) {
    console.error(`  ✗ investment-program-detail: ${e.message}`);
  }

  await browser.close();

  console.log('\n=== Done! Screenshots saved to ./screenshots/ ===');
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png')).sort();
  files.forEach(f => {
    const size = fs.statSync(path.join(OUT_DIR, f)).size;
    console.log(`  ${f} (${(size/1024).toFixed(0)}KB)`);
  });
})();
