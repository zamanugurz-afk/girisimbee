import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { chromium, type Browser, type BrowserContext } from 'playwright';

const LETGO_EXTRACTOR_SOURCE = fs.readFileSync(
  path.join(process.cwd(), 'services/providers/letgo-browser-extract.js'),
  'utf8',
);

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      channel: process.platform === 'win32' ? 'msedge' : undefined,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    });
  }
  return browserPromise;
}

async function createStealthContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    userAgent: DEFAULT_USER_AGENT,
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    viewport: { width: 1366, height: 900 },
    extraHTTPHeaders: {
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  return context;
}

async function dismissMarketplaceOverlays(page: import('playwright').Page): Promise<void> {
  const consentSelectors = [
    'button:has-text("Kabul Et")',
    'button:has-text("Accept")',
    '#onetrust-accept-btn-handler',
  ];

  for (const selector of consentSelectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1500 }).catch(() => false)) {
      await button.click({ timeout: 3000 }).catch(() => undefined);
      break;
    }
  }
}

export interface BrowserFetchOptions {
  waitForSelector?: string;
  waitForUrlPattern?: RegExp;
  waitForText?: string;
  scrollBeforeExtract?: boolean;
  timeoutMs?: number;
  referer?: string;
  limit?: number;
}

interface BrowserListingPayload {
  externalId: string;
  title: string;
  price: number;
  url: string;
  imageUrls: string[];
  city?: string;
  district?: string;
  listingDate?: string;
  sellerName?: string;
}

/** Fetch rendered HTML from a marketplace page using headless Chromium. */
export async function fetchMarketplaceHtmlBrowser(
  url: string,
  options: BrowserFetchOptions = {},
): Promise<string> {
  const browser = await getBrowser();
  const context = await createStealthContext(browser);
  const page = await context.newPage();
  const timeout = options.timeoutMs ?? 45000;

  try {
    if (options.referer) {
      await page.setExtraHTTPHeaders({ Referer: options.referer });
    }

    await page.goto(url, { waitUntil: 'networkidle', timeout });

    await dismissMarketplaceOverlays(page);

    if (options.waitForSelector) {
      await page
        .waitForSelector(options.waitForSelector, { timeout: Math.min(timeout, 30000) })
        .catch(() => undefined);
    }

    if (options.scrollBeforeExtract) {
      await page.evaluate(() => {
        window.scrollTo(0, Math.max(document.body.scrollHeight / 2, 900));
      });
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1500);
    }

    if (options.waitForText?.trim()) {
      const needle = options.waitForText.trim().toLowerCase();
      await page
        .waitForFunction(
          (text) => document.body.innerText.toLowerCase().includes(text),
          needle,
          { timeout: Math.min(timeout, 25000) },
        )
        .catch(() => undefined);
    }

    if (options.waitForUrlPattern) {
      await page
        .waitForFunction(
          (pattern) => {
            const re = new RegExp(pattern);
            return re.test(document.documentElement.innerHTML);
          },
          options.waitForUrlPattern.source,
          { timeout: Math.min(timeout, 30000) },
        )
        .catch(() => undefined);
    }

    await page.waitForTimeout(2000);
    return await page.content();
  } finally {
    await context.close();
  }
}

export async function closeBrowserFetchPool(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
  }
}

/** Extract Letgo-style listing cards directly from the rendered DOM. */
export async function fetchMarketplaceListingsBrowser(
  url: string,
  options: BrowserFetchOptions = {},
): Promise<BrowserListingPayload[]> {
  const browser = await getBrowser();
  const context = await createStealthContext(browser);
  const page = await context.newPage();
  const timeout = options.timeoutMs ?? 45000;
  const limit = options.limit ?? 20;

  try {
    if (options.referer) {
      await page.setExtraHTTPHeaders({ Referer: options.referer });
    }

    await page.goto(url, { waitUntil: 'networkidle', timeout });

    await dismissMarketplaceOverlays(page);

    if (options.waitForSelector) {
      await page
        .waitForSelector(options.waitForSelector, { timeout: Math.min(timeout, 30000) })
        .catch(() => undefined);
    }

    if (options.scrollBeforeExtract) {
      await page.evaluate(() => {
        window.scrollTo(0, Math.max(document.body.scrollHeight / 2, 900));
      });
      await page.waitForTimeout(1500);
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1500);
    }

    if (options.waitForText?.trim()) {
      const needle = options.waitForText.trim().toLowerCase();
      await page
        .waitForFunction(
          (text) => document.body.innerText.toLowerCase().includes(text),
          needle,
          { timeout: Math.min(timeout, 25000) },
        )
        .catch(() => undefined);
    }

    await page.waitForTimeout(2000);

    return page.evaluate(
      `(() => { ${LETGO_EXTRACTOR_SOURCE}; return extractLetgoListings(${limit}); })()`,
    );
  } finally {
    await context.close();
  }
}
