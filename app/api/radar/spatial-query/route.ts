import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { RadarCategoryKey, RadarSpatialResponse } from '@/types/radar.types';
import { RADAR_CATEGORIES } from '@/features/radar/config/radar.config';
import {
  fetchCompetitorPois,
  fetchAreaSectorCounts,
} from '@/features/radar/services/overpass-poi.service';
import { findListingsInRadius } from '@/features/radar/services/radar-listings-matcher.service';
import {
  computeRadarMetrics,
  generateIntelligenceReport,
} from '@/features/radar/lib/spatial-calculator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(50).max(10000).default(500),
  category: z.string().default('cafe'),
  locationName: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radius: searchParams.get('radius'),
      category: searchParams.get('category'),
      locationName: searchParams.get('locationName') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Geçersiz parametreler.',
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { lat, lng, radius, category, locationName } = parsed.data;
    const categoryKey = category as RadarCategoryKey;
    const isAll = categoryKey === 'all';
    const categoryMeta = isAll
      ? { key: 'all' as RadarCategoryKey, label: 'Tüm Sektörler & İşletmeler', emoji: '🌐', accent: 'amber', idealDensityPerKm2: 45 }
      : (RADAR_CATEGORIES[categoryKey] ?? RADAR_CATEGORIES.cafe);

    // 1. Fetch competitors (POIs: Google Places with OSM fallback) and 2. listings in parallel
    const [competitors, listingsInRadius] = await Promise.all([
      fetchCompetitorPois(lat, lng, radius, categoryKey),
      findListingsInRadius(lat, lng, radius, categoryKey),
    ]);

    // 2. Compute Metrics and AI Intelligence Report
    const metrics = computeRadarMetrics(competitors.length, radius, categoryKey, lat, lng, locationName);
    const intelligence = generateIntelligenceReport(categoryKey, metrics, locationName, lat, lng, radius);

    // Compute accurate sector distribution directly from POIs
    const sectorDistribution: Record<string, number> = {};
    for (const poi of competitors) {
      if (poi.category && poi.category !== 'all') {
        sectorDistribution[poi.category] = (sectorDistribution[poi.category] || 0) + 1;
      }
    }

    const responseData: RadarSpatialResponse = {
      query: {
        lat,
        lng,
        radiusMeters: radius,
        category: categoryKey,
        categoryLabel: categoryMeta.label,
        locationName,
      },
      metrics,
      listingsInRadius,
      competitors,
      intelligence,
      availableSectors: sectorDistribution,
    };

    return NextResponse.json({
      ok: true,
      data: responseData,
    });
  } catch (error) {
    console.error('[spatial-query] Unexpected error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Mekânsal sorgu sırasında beklenmeyen bir hata oluştu.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = querySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Geçersiz gövde parametreleri.',
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { lat, lng, radius, category, locationName } = parsed.data;
    const categoryKey = category as RadarCategoryKey;
    const categoryMeta = RADAR_CATEGORIES[categoryKey] ?? RADAR_CATEGORIES.cafe;

    const [competitors, listingsInRadius] = await Promise.all([
      fetchCompetitorPois(lat, lng, radius, categoryKey),
      findListingsInRadius(lat, lng, radius, categoryKey),
    ]);

    const metrics = computeRadarMetrics(competitors.length, radius, categoryKey, lat, lng, locationName);
    const intelligence = generateIntelligenceReport(categoryKey, metrics, locationName, lat, lng, radius);

    const responseData: RadarSpatialResponse = {
      query: {
        lat,
        lng,
        radiusMeters: radius,
        category: categoryKey,
        categoryLabel: categoryMeta.label,
        locationName,
      },
      metrics,
      listingsInRadius,
      competitors,
      intelligence,
    };

    return NextResponse.json({
      ok: true,
      data: responseData,
    });
  } catch (error) {
    console.error('[spatial-query] POST error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Mekânsal analiz gerçekleştirilemedi.',
      },
      { status: 500 },
    );
  }
}
