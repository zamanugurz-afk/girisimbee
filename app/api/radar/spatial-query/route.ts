import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { RadarCategoryKey, RadarSpatialResponse } from '@/types/radar.types';
import { RADAR_CATEGORIES } from '@/features/radar/config/radar.config';
import {
  fetchMasterAreaPoiCensus,
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
    const catKeys = category
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean) as RadarCategoryKey[];

    const isAll = catKeys.length === 0 || catKeys.includes('all');
    const primaryKey = isAll ? ('all' as RadarCategoryKey) : catKeys[0];
    const categoryMeta = isAll
      ? { key: 'all' as RadarCategoryKey, label: 'Tüm Sektörler & İşletmeler', emoji: '🌐', accent: 'amber', idealDensityPerKm2: 45 }
      : (RADAR_CATEGORIES[primaryKey] ?? RADAR_CATEGORIES.cafe);

    // 1. Fetch complete area census (POIs + full sector distribution) and 2. listings in parallel
    const [censusResult, listingsInRadius] = await Promise.all([
      fetchMasterAreaPoiCensus(lat, lng, radius, locationName || 'Bölge', isAll ? 'all' : catKeys),
      findListingsInRadius(lat, lng, radius, primaryKey),
    ]);

    const { allPois, sectorCensus } = censusResult;

    // Filter competitor POIs for map display based on selected category / categories
    const competitors = isAll
      ? allPois
      : allPois.filter((p) => {
          if (!p.category) return false;
          return (
            catKeys.includes(p.category as RadarCategoryKey) ||
            (catKeys.includes('dry_cleaning') && p.category === 'terzi') ||
            (catKeys.includes('restaurant') && p.category === 'donerci')
          );
        });

    // 2. Compute Metrics and AI Intelligence Report using consistent sector census
    const metrics = computeRadarMetrics(competitors.length, radius, primaryKey, lat, lng, locationName);
    const intelligence = generateIntelligenceReport(primaryKey, metrics, locationName, lat, lng, radius, sectorCensus);

    const responseData: RadarSpatialResponse = {
      query: {
        lat,
        lng,
        radiusMeters: radius,
        category: category as RadarCategoryKey,
        categoryLabel: isAll
          ? 'Tüm Sektörler & İşletmeler'
          : catKeys.map((k) => RADAR_CATEGORIES[k]?.label || k).join(' + '),
        locationName,
      },
      metrics,
      listingsInRadius,
      competitors,
      intelligence,
      availableSectors: sectorCensus,
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

    const [censusResult, listingsInRadius] = await Promise.all([
      fetchMasterAreaPoiCensus(lat, lng, radius, locationName || 'Bölge'),
      findListingsInRadius(lat, lng, radius, categoryKey),
    ]);

    const { allPois, sectorCensus } = censusResult;

    const competitors = isAll
      ? allPois
      : allPois.filter(
          (p) =>
            p.category === categoryKey ||
            (categoryKey === 'dry_cleaning' && (p.category === 'terzi' || p.category === 'dry_cleaning')) ||
            (categoryKey === 'restaurant' && p.category === 'donerci'),
        );

    const metrics = computeRadarMetrics(competitors.length, radius, categoryKey, lat, lng, locationName);
    const intelligence = generateIntelligenceReport(categoryKey, metrics, locationName, lat, lng, radius, sectorCensus);

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
      availableSectors: sectorCensus,
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
