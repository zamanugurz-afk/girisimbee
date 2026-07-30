import { NextResponse } from 'next/server';
import { syncService } from '@/services/sync-service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const keywords: string[] = body.keywords ?? [];
    const intervalMinutes: number = body.intervalMinutes ?? 10;
    const providerSlug: string | undefined = body.providerSlug;

    const result = await syncService.runSync(keywords, intervalMinutes, providerSlug);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
