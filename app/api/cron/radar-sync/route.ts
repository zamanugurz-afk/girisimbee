import { NextRequest, NextResponse } from 'next/server';
import { runNightlyRadarBatchSync, getCurrentDailyCycleId } from '@/features/radar/services/radar-snapshot.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300; // Allow sufficient time for batch sync

/**
 * 04:00 TSİ (01:00 UTC) Daily Radar Synchronization Endpoint.
 * Triggered automatically by Vercel Cron or manually by authorized admin.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const { searchParams } = new URL(request.url);
    const keyParam = searchParams.get('key');

    const isAuthorized =
      Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      Boolean(cronSecret && keyParam === cronSecret) ||
      process.env.NODE_ENV === 'development';

    if (!isAuthorized) {
      return NextResponse.json(
        { ok: false, error: 'Yetkisiz erişim. Geçerli CRON_SECRET gereklidir.' },
        { status: 401 },
      );
    }

    const limitParam = searchParams.get('limit');
    const districtLimit = limitParam ? parseInt(limitParam, 10) : undefined;

    const result = await runNightlyRadarBatchSync({ districtLimit });

    return NextResponse.json({
      ok: true,
      message: 'Lokasyon Radarı günlük 04:00 TSİ senkronizasyonu başarıyla tamamlandı.',
      data: result,
    });
  } catch (error: any) {
    console.error('[cron/radar-sync] Batch sync error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Günlük radar senkronizasyonu sırasında hata oluştu.',
        details: error?.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
