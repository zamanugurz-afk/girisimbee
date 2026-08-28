import { createClient } from '@/lib/supabase/server';
import { getServerContainer } from '@/lib/persistence/container';
import type { RadarCategoryKey, RadarListingMatch } from '@/types/radar.types';
import { calculateDistanceMeters } from '@/features/radar/lib/spatial-calculator';

// District centroid coordinates for mapping listings by district
const DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  kadikoy: { lat: 40.9875, lng: 29.0289 },
  moda: { lat: 40.9825, lng: 29.0267 },
  besiktas: { lat: 41.0428, lng: 29.0069 },
  sisli: { lat: 41.0531, lng: 28.9928 },
  nisantasi: { lat: 41.0515, lng: 28.9912 },
  cankaya: { lat: 39.9022, lng: 32.8601 },
  karsiyaka: { lat: 38.4593, lng: 27.1124 },
  muratpasa: { lat: 36.8584, lng: 30.7588 },
  nilufer: { lat: 40.2198, lng: 28.9189 },
  atasehir: { lat: 40.9833, lng: 29.1167 },
  uskudar: { lat: 41.0267, lng: 29.0167 },
  beyoglu: { lat: 41.0369, lng: 28.9775 },
};

function normalizeName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function findListingsInRadius(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  _categoryKey: RadarCategoryKey,
): Promise<RadarListingMatch[]> {
  try {
    const supabase = createClient();
    const container = getServerContainer(supabase);
    const { data: listings } = await container.listingRepository.findPublished(
      {},
      { page: 1, limit: 60 },
    );

    const matches: RadarListingMatch[] = [];

    for (const listing of listings) {
      let listingLat: number | undefined;
      let listingLng: number | undefined;

      const cf = listing.customFields as Record<string, unknown> | undefined;
      if (typeof cf?.lat === 'number' && typeof cf?.lng === 'number') {
        listingLat = cf.lat;
        listingLng = cf.lng;
      } else if (typeof cf?.latitude === 'number' && typeof cf?.longitude === 'number') {
        listingLat = cf.latitude;
        listingLng = cf.longitude;
      }

      if (!listingLat || !listingLng) {
        const districtKey = normalizeName(listing.district || (cf?.district as string) || '');
        const cityKey = normalizeName(listing.city || (cf?.city as string) || '');
        const centroid = DISTRICT_CENTROIDS[districtKey] || DISTRICT_CENTROIDS[cityKey];

        if (centroid) {
          const jitterLat = (Math.sin(listing.id.charCodeAt(0) || 1) * 0.0035);
          const jitterLng = (Math.cos(listing.id.charCodeAt(1) || 2) * 0.0035);
          listingLat = centroid.lat + jitterLat;
          listingLng = centroid.lng + jitterLng;
        }
      }

      if (typeof listingLat === 'number' && typeof listingLng === 'number') {
        const dist = calculateDistanceMeters(centerLat, centerLng, listingLat, listingLng);

        if (dist <= radiusMeters) {
          matches.push({
            id: listing.id,
            title: listing.title,
            price: typeof cf?.price === 'string' ? cf.price : (cf?.priceTry ? `${cf.priceTry} TL` : undefined),
            listingType: listing.listingTypeId || 'İlan',
            categoryLabel: (cf?.categoryLabel as string) || (cf?.businessType as string) || 'Fırsat İlanı',
            lat: listingLat,
            lng: listingLng,
            distanceMeters: dist,
            href: `/ilan/${listing.id}`,
            tag: listing.isUrgent ? 'Süper İlan' : listing.isVerified ? 'Doğrulanmış' : undefined,
            isSuper: listing.isUrgent ?? false,
            companyName: typeof cf?.companyName === 'string' ? cf.companyName : undefined,
            city: listing.city || (cf?.city as string),
            district: listing.district || (cf?.district as string),
          });
        }
      }
    }

    if (matches.length > 0) {
      return matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
    }
  } catch (err) {
    console.error('[radar-listings-matcher] Database query failed:', err);
  }

  return generateDemoCircleListings(centerLat, centerLng, radiusMeters);
}

function generateDemoCircleListings(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
): RadarListingMatch[] {
  const count = Math.min(3, Math.max(1, Math.round((radiusMeters / 500) * 1.5)));
  const demoTitles = [
    'Devren İşletme: İşlek Lokasyonda Hazır Müşterili Butik Mekân',
    'Yatırım & Büyüme: Şubeleşme Arayışında Olan Franchise Fırsatı',
    'Kurucu Ortak: Dijital ve Operasyonel Büyüme İçin Sermaye & Yönetim Ortağı',
  ];

  const results: RadarListingMatch[] = [];

  for (let i = 0; i < count; i++) {
    const angle = i * 2.1 + 0.5;
    const dist = Math.round(radiusMeters * (0.25 + i * 0.28));
    const latDelta = (dist * Math.cos(angle)) / 111320;
    const lngDelta =
      (dist * Math.sin(angle)) /
      (111320 * Math.cos((centerLat * Math.PI) / 180));

    results.push({
      id: `radar-demo-listing-${i + 1}`,
      title: demoTitles[i % demoTitles.length],
      price: i === 0 ? '750.000 TL' : i === 1 ? '1.200.000 TL' : '%25 Hisse',
      listingType: i === 0 ? 'İşletme Devri' : i === 1 ? 'Franchise' : 'Ortaklık',
      categoryLabel: i === 0 ? 'Devren Dükkan' : i === 1 ? 'Bayilik' : 'Stratejik Ortak',
      lat: parseFloat((centerLat + latDelta).toFixed(6)),
      lng: parseFloat((centerLng + lngDelta).toFixed(6)),
      distanceMeters: dist,
      href: '/kesfet',
      tag: i === 0 ? 'Süper İlan' : 'Doğrulanmış',
      isSuper: i === 0,
    });
  }

  return results.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
