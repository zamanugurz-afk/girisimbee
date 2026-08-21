import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('🚀 Launching Browser for Contact Request Model Verification...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    try {
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    } catch {
      browser = await chromium.launch({ headless: true });
    }
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const results = [];

  // Helper
  function record(testName, passed, details = '') {
    results.push({ testName, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // 1. Visit Home Page
    console.log('\n--- 1. Testing Home Page ---');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const homeTitle = await page.title();
    record('Home page loads successfully', homeTitle.length > 0, homeTitle);

    // 2. Visit /is (Career & Job Opportunities)
    console.log('\n--- 2. Testing /is Page ---');
    await page.goto(`${BASE_URL}/is`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Check tabs or listing cards on /is
    const isPageContent = await page.content();
    record('/is page loads', isPageContent.includes('İş ve Kariyer') || isPageContent.includes('Kariyer'));

    // 3. Visit /girisim-ortaklik (Partnership & Business Transfer)
    console.log('\n--- 3. Testing /girisim-ortaklik Page ---');
    await page.goto(`${BASE_URL}/girisim-ortaklik`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const selectorButtons = await page.$$eval('button, a', (els) =>
      els.map((e) => e.textContent?.trim()).filter(Boolean),
    );
    const hasOrtaklik = selectorButtons.some((t) => t.includes('Ortak'));
    const hasDevir = selectorButtons.some((t) => t.includes('Devir'));
    record('/girisim-ortaklik has Ortaklık and İşletme Devri navigation', hasOrtaklik && hasDevir);

    // 4. Visit /franchise/buy (Franchise Opportunities)
    console.log('\n--- 4. Testing /franchise/buy Page ---');
    await page.goto(`${BASE_URL}/franchise/buy`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Franchise page should not show contact request CTAs on cards
    const franchiseCards = await page.$$eval('article, [class*="card"]', (els) =>
      els.map((e) => e.textContent?.trim()).filter(Boolean),
    );
    const hasFranchiseContactBadges = franchiseCards.some((t) => t.includes('İletişim Talebi 🔒'));
    record('Franchise cards DO NOT have contact request badges', !hasFranchiseContactBadges);

    // 5. Visit /dijital-ai (Digital & AI Solutions)
    console.log('\n--- 5. Testing /dijital-ai Page ---');
    await page.goto(`${BASE_URL}/dijital-ai`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const digitalCards = await page.$$eval('article, [class*="card"]', (els) =>
      els.map((e) => e.textContent?.trim()).filter(Boolean),
    );
    const hasDigitalContactBadges = digitalCards.some((t) => t.includes('İletişim Talebi 🔒'));
    record('Digital & AI cards DO NOT have contact request badges', !hasDigitalContactBadges);

    // 6. Visit /market (Marketplace Opportunities)
    console.log('\n--- 6. Testing /market Page ---');
    await page.goto(`${BASE_URL}/market`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const marketCards = await page.$$eval('article, [class*="card"]', (els) =>
      els.map((e) => e.textContent?.trim()).filter(Boolean),
    );
    const hasMarketContactBadges = marketCards.some((t) => t.includes('İletişim Talebi 🔒'));
    record('Market cards DO NOT have contact request badges', !hasMarketContactBadges);

    // 7. Visit /dashboard/iletisim-talepleri
    console.log('\n--- 7. Testing /dashboard/iletisim-talepleri Page ---');
    await page.goto(`${BASE_URL}/dashboard/iletisim-talepleri`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const inboxContent = await page.content();
    record('/dashboard/iletisim-talepleri page loads correctly', inboxContent.includes('İletişim Talepleri') || inboxContent.includes('Giriş'));

  } catch (err) {
    console.error('Test execution error:', err);
    record('Browser test suite completed without runtime exceptions', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=========================================');
  console.log('🏁 Verification Summary');
  console.log('=========================================');
  const allPassed = results.every((r) => r.passed);
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.passed ? 'PASS' : 'FAIL'}] ${r.testName}`);
  });
  console.log(`\nOverall Result: ${allPassed ? 'ALL PASSED ✅' : 'SOME FAILED ❌'}`);

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
