import { NextResponse } from 'next/server';

/** Never statically analyze / invoke the sync+Playwright stack at build time. */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const keywords: string[] = body.keywords ?? [];
    const intervalMinutes: number = body.intervalMinutes ?? 10;
    const providerSlug: string | undefined = body.providerSlug;

    // Lazy-load so `next build` page-data collection does not import Playwright.
    const { syncService } = await import('@/services/sync-service');
    const result = await syncService.runSync(keywords, intervalMinutes, providerSlug);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
