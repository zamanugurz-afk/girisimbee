/**
 * Profile client-side route transitions with Playwright.
 * Run: NAV_PROFILE=1 npm run build && NAV_PROFILE=1 npx next start -p 3003
 *      npx tsx scripts/profile-navigation.ts
 */
import { chromium, type Page, type Request, type Response } from 'playwright';

const BASE = process.env.NAV_BASE ?? 'http://localhost:3003';

interface NetworkEntry {
  url: string;
  method: string;
  durationMs: number;
  kind: 'rsc' | 'document' | 'supabase' | 'static' | 'other';
  cacheStatus: string | null;
  serverTiming: string | null;
}

interface NavReport {
  transition: string;
  totalMs: number;
  middlewareMs: number;
  serverRenderMs: number;
  dbQueryMs: number;
  reactRenderMs: number;
  networkRequests: number;
  requests: NetworkEntry[];
  cacheHits: number;
  cacheMisses: number;
  slowestOperations: { name: string; ms: number }[];
}

function classifyRequest(req: Request): NetworkEntry['kind'] {
  const url = req.url();
  if (url.includes('supabase.co/rest/') || url.includes('/rest/v1/')) return 'supabase';
  if (url.includes('/_next/static/') || url.includes('/_next/image')) return 'static';
  const h = req.headers();
  if (h['rsc'] === '1' || h['next-router-prefetch'] === '1') return 'rsc';
  if (req.resourceType() === 'document') return 'document';
  return 'other';
}

async function measureTransition(
  page: Page,
  name: string,
  click: () => Promise<void>,
  readySelector: string,
): Promise<NavReport> {
  const requests: NetworkEntry[] = [];
  const pending = new Map<Request, number>();
  let navStart = 0;

  const onRequest = (req: Request) => {
    pending.set(req, performance.now());
  };

  const onResponse = async (resp: Response) => {
    const req = resp.request();
    const start = pending.get(req);
    if (start === undefined) return;
    pending.delete(req);

    if (navStart > 0 && start < navStart) return;

    requests.push({
      url: req.url(),
      method: req.method(),
      durationMs: performance.now() - start,
      kind: classifyRequest(req),
      cacheStatus: resp.headers()['x-nextjs-cache'] ?? null,
      serverTiming: resp.headers()['server-timing'] ?? null,
    });
  };

  page.on('request', onRequest);
  page.on('response', onResponse);

  navStart = performance.now();
  await click();
  await page.waitForSelector(readySelector, { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded').catch(() => {});

  const totalMs = performance.now() - navStart;

  page.off('request', onRequest);
  page.off('response', onResponse);

  let serverProfile: {
    middlewareMs?: number;
    serverRenderMs?: number;
    dbQueryMs?: number;
    cacheHits?: number;
    cacheMisses?: number;
    loaderSpans?: { name: string; durationMs: number }[];
  } | null = null;

  try {
    const raw = await page.locator('#nav-profile').textContent({ timeout: 2000 });
    if (raw) serverProfile = JSON.parse(raw);
  } catch {
    serverProfile = null;
  }

  const middlewareMs = serverProfile?.middlewareMs ?? parseMiddlewareTiming(requests);
  const serverRenderMs = serverProfile?.serverRenderMs ?? sumRscTtfb(requests);
  const serverDbMs = serverProfile?.dbQueryMs ?? 0;
  const clientDbMs = sumByKind(requests, 'supabase');
  const dbQueryMs = serverDbMs + clientDbMs;

  const cacheHits =
    requests.filter((r) => r.cacheStatus === 'HIT').length + (serverProfile?.cacheHits ?? 0);
  const cacheMisses =
    requests.filter((r) => r.cacheStatus === 'MISS' || r.cacheStatus === 'STALE').length
    + (serverProfile?.cacheMisses ?? 0);

  const reactRenderMs = Math.max(0, totalMs - middlewareMs - serverRenderMs - clientDbMs);

  return {
    transition: name,
    totalMs,
    middlewareMs,
    serverRenderMs,
    dbQueryMs,
    reactRenderMs,
    networkRequests: requests.length,
    requests: requests.sort((a, b) => b.durationMs - a.durationMs).slice(0, 12),
    cacheHits,
    cacheMisses,
    slowestOperations: buildSlowest(requests, serverProfile?.loaderSpans ?? [], middlewareMs),
  };
}

function parseMiddlewareTiming(requests: NetworkEntry[]): number {
  for (const r of requests) {
    if (!r.serverTiming) continue;
    const match = r.serverTiming.match(/middleware;dur=([\d.]+)/);
    if (match) return parseFloat(match[1]);
  }
  return 0;
}

function sumRscTtfb(requests: NetworkEntry[]): number {
  return requests
    .filter((r) => r.kind === 'rsc' || r.kind === 'document')
    .reduce((sum, r) => sum + r.durationMs, 0);
}

function sumByKind(requests: NetworkEntry[], kind: NetworkEntry['kind']): number {
  return requests.filter((r) => r.kind === kind).reduce((sum, r) => sum + r.durationMs, 0);
}

function buildSlowest(
  requests: NetworkEntry[],
  loaderSpans: { name: string; durationMs: number }[],
  middlewareMs: number,
): { name: string; ms: number }[] {
  const ops: { name: string; ms: number }[] = [
    { name: 'middleware', ms: middlewareMs },
    ...loaderSpans.map((s) => ({ name: s.name, ms: s.durationMs })),
    ...requests.slice(0, 8).map((r) => ({
      name: `${r.kind}:${shortUrl(r.url)}`,
      ms: r.durationMs,
    })),
  ];
  return ops.sort((a, b) => b.ms - a.ms).slice(0, 5);
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.length > 48 ? `${u.pathname.slice(0, 45)}…` : u.pathname;
  } catch {
    return url.slice(0, 48);
  }
}

function printReport(report: NavReport) {
  const status = report.totalMs > 300 ? 'SLOW' : 'OK';
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${report.transition}  [${status}]`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total navigation time : ${report.totalMs.toFixed(0)} ms`);
  console.log(`Middleware time       : ${report.middlewareMs.toFixed(0)} ms`);
  console.log(`Server render time    : ${report.serverRenderMs.toFixed(0)} ms`);
  console.log(`Database query time   : ${report.dbQueryMs.toFixed(0)} ms`);
  console.log(`React render time     : ${report.reactRenderMs.toFixed(0)} ms`);
  console.log(`Network requests      : ${report.networkRequests}`);
  console.log(`Cache hits / misses   : ${report.cacheHits} / ${report.cacheMisses}`);
  console.log('Slowest operations:');
  for (const op of report.slowestOperations) {
    console.log(`  - ${op.name}: ${op.ms.toFixed(0)} ms`);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log(`Profiling navigations at ${BASE}\n`);

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1, h2', { timeout: 10000 });

  const reports: NavReport[] = [];

  await page.goto(`${BASE}/kesfet`, { waitUntil: 'domcontentloaded' });
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1, h2');

  reports.push(
    await measureTransition(
      page,
      'Home -> Keşfet',
      () => page.click('header nav a[href="/kesfet"]'),
      'h1',
    ),
  );

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1, h2');

  reports.push(
    await measureTransition(
      page,
      'Home -> İlanlar',
      () => page.click('header nav a[href="/kesfet"]:has-text("İlanlar")'),
      'h1',
    ),
  );

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });

  reports.push(
    await measureTransition(
      page,
      'Home -> Giriş',
      () => page.click('a[href="/giris"]'),
      'h1',
    ),
  );

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });

  reports.push(
    await measureTransition(
      page,
      'Home -> İlan Ver',
      () => page.click('header a[href="/ilan/olustur"]'),
      'h1',
    ),
  );

  await page.goto(`${BASE}/kesfet`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1');
  await page.waitForSelector('article', { timeout: 15000 }).catch(() => {});

  const listingLink = page.locator('a[href^="/ilan/"]').first();
  if (await listingLink.count()) {
    const href = await listingLink.getAttribute('href');
    const clickReport = await measureTransition(
      page,
      'Keşfet -> İlan Detayı',
      () => listingLink.click(),
      'h1',
    );

    if (clickReport.networkRequests === 0 && href) {
      await page.goto(`${BASE}/kesfet`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('h1');
      const coldReport = await measureTransition(
        page,
        'Keşfet -> İlan Detayı (cold)',
        async () => {
          await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded' });
        },
        'h1',
      );
      reports.push({
        ...coldReport,
        transition: 'Keşfet -> İlan Detayı',
      });
    } else {
      reports.push(clickReport);
    }
  } else {
    console.log('\nSkipping Keşfet -> İlan Detayı (no listing cards found)');
  }

  for (const report of reports) {
    printReport(report);
  }

  const slow = reports.filter((r) => r.totalMs > 300);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${reports.length} transitions, ${slow.length} exceeded 300ms`);
  if (slow.length) {
    console.log('Exceeded 300ms:');
    for (const r of slow) console.log(`  - ${r.transition}: ${r.totalMs.toFixed(0)} ms`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
