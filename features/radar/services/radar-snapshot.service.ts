import fs from 'fs';
import path from 'path';
import type { AreaPoiCensusResult } from './overpass-poi.service';
import { fetchMasterAreaPoiCensus } from './overpass-poi.service';
import { TURKEY_POPULAR_DISTRICTS } from '@/features/radar/config/radar.config';
import type { RadarCategoryKey } from '@/types/radar.types';

const SNAPSHOT_DIR = path.join(process.cwd(), 'data', 'radar');
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'radar-daily-snapshot.json');

export interface DailySnapshotPayload {
  cycleId: string;       // e.g. "2026-09-04"
  syncedAt: string;      // ISO string
  nextSyncAt: string;    // Next 04:00 TSİ ISO string
  areas: Record<string, AreaPoiCensusResult>;
}

// In-memory hot tier
let memorySnapshot: DailySnapshotPayload | null = null;

/**
 * Calculates current Turkish Daily Cycle ID (TSİ = UTC+3).
 * A new cycle starts at 04:00 TSİ (01:00 UTC) each morning.
 */
export function getCurrentDailyCycleId(): string {
  const now = new Date();
  // Add 3 hours for Turkey Time (UTC+3)
  const turkeyTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  
  // If Turkey hour is before 04:00, it belongs to the previous day's cycle
  if (turkeyTime.getUTCHours() < 4) {
    turkeyTime.setUTCDate(turkeyTime.getUTCDate() - 1);
  }
  
  return turkeyTime.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * Computes the exact timestamp of the upcoming 04:00 TSİ sync.
 */
export function getNextSyncAt(): string {
  const now = new Date();
  const turkeyTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const next4AmTurkey = new Date(turkeyTime);
  if (turkeyTime.getUTCHours() >= 4) {
    next4AmTurkey.setUTCDate(next4AmTurkey.getUTCDate() + 1);
  }
  next4AmTurkey.setUTCHours(4, 0, 0, 0);

  // Convert back to UTC
  const nextSyncUtc = new Date(next4AmTurkey.getTime() - 3 * 60 * 60 * 1000);
  return nextSyncUtc.toISOString();
}

/**
 * Normalizes coordinate key for area snapshot indexing.
 */
function makeAreaKey(lat: number, lng: number, radiusMeters: number): string {
  const rLat = Math.round(lat * 1000) / 1000;
  const rLng = Math.round(lng * 1000) / 1000;
  return `${rLat}_${rLng}_${radiusMeters}`;
}

/**
 * Loads the daily snapshot from disk if valid for the current cycle.
 */
function loadDiskSnapshot(): DailySnapshotPayload | null {
  try {
    if (!fs.existsSync(SNAPSHOT_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
    const parsed: DailySnapshotPayload = JSON.parse(raw);
    const currentCycle = getCurrentDailyCycleId();

    if (parsed.cycleId === currentCycle) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('[radar-snapshot] Error reading snapshot file:', err);
    return null;
  }
}

/**
 * Saves the current daily snapshot payload to disk.
 */
function saveDiskSnapshot(payload: DailySnapshotPayload): void {
  try {
    if (!fs.existsSync(SNAPSHOT_DIR)) {
      fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
    }
    // Clean out any 0 POI entries before saving to disk
    const cleanAreas: Record<string, AreaPoiCensusResult> = {};
    for (const [k, v] of Object.entries(payload.areas || {})) {
      if (v && v.allPois && v.allPois.length > 0) {
        cleanAreas[k] = v;
      }
    }
    const cleanPayload: DailySnapshotPayload = { ...payload, areas: cleanAreas };
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(cleanPayload, null, 2), 'utf-8');
  } catch (err) {
    console.error('[radar-snapshot] Error writing snapshot file:', err);
  }
}

/**
 * Ensures memory snapshot is initialized and current.
 */
function getActiveSnapshot(): DailySnapshotPayload {
  const currentCycle = getCurrentDailyCycleId();

  if (memorySnapshot && memorySnapshot.cycleId === currentCycle) {
    return memorySnapshot;
  }

  const diskData = loadDiskSnapshot();
  if (diskData && diskData.cycleId === currentCycle) {
    // Filter out any corrupted 0-POI entries
    const validAreas: Record<string, AreaPoiCensusResult> = {};
    for (const [k, v] of Object.entries(diskData.areas || {})) {
      if (v && v.allPois && v.allPois.length > 0) {
        validAreas[k] = v;
      }
    }
    diskData.areas = validAreas;
    memorySnapshot = diskData;
    return memorySnapshot;
  }

  // Initialize fresh snapshot container for today's cycle
  const validDiskAreas: Record<string, AreaPoiCensusResult> = {};
  for (const [k, v] of Object.entries(diskData?.areas || {})) {
    if (v && v.allPois && v.allPois.length > 0) {
      validDiskAreas[k] = v;
    }
  }

  memorySnapshot = {
    cycleId: currentCycle,
    syncedAt: new Date().toISOString(),
    nextSyncAt: getNextSyncAt(),
    areas: validDiskAreas,
  };

  return memorySnapshot;
}

export interface DailyAreaResult extends AreaPoiCensusResult {
  cycleId: string;
  syncedAt: string;
  isDailySnapshot: boolean;
}

/**
 * Returns census data from the daily 04:00 snapshot.
 * If area is not yet in snapshot or has 0 POIs, computes it once and persists it for the day.
 */
export async function getOrGenerateDailyAreaCensus(
  lat: number,
  lng: number,
  radiusMeters: number,
  locationName: string = 'Bölge',
  targetCategory: RadarCategoryKey | RadarCategoryKey[] | string = 'all',
): Promise<DailyAreaResult> {
  const snapshot = getActiveSnapshot();
  const areaKey = makeAreaKey(lat, lng, radiusMeters);

  let masterCensus = snapshot.areas[areaKey];

  // If area is missing or previously corrupted with 0 POIs, fetch fresh
  if (!masterCensus || !masterCensus.allPois || masterCensus.allPois.length === 0) {
    // Generate clean master census once for this area and lock it into today's snapshot
    masterCensus = await fetchMasterAreaPoiCensus(lat, lng, radiusMeters, locationName, 'all');
    if (masterCensus && masterCensus.allPois && masterCensus.allPois.length > 0) {
      snapshot.areas[areaKey] = masterCensus;
      saveDiskSnapshot(snapshot);
    }
  }

  // Filter for specific category if requested
  const targetCategoryArray: RadarCategoryKey[] = Array.isArray(targetCategory)
    ? targetCategory
    : typeof targetCategory === 'string' && targetCategory !== 'all'
    ? (targetCategory.split(',').filter(Boolean) as RadarCategoryKey[])
    : [];

  if (targetCategoryArray.length > 0 && targetCategoryArray[0] !== 'all') {
    const filteredPois = masterCensus.allPois.filter((p) => {
      if (!p.category) return false;
      return (
        targetCategoryArray.includes(p.category as RadarCategoryKey) ||
        (targetCategoryArray.includes('dry_cleaning') && p.category === 'terzi') ||
        (targetCategoryArray.includes('restaurant') && p.category === 'donerci')
      );
    });

    return {
      allPois: filteredPois,
      sectorCensus: masterCensus.sectorCensus,
      cycleId: snapshot.cycleId,
      syncedAt: snapshot.syncedAt,
      isDailySnapshot: true,
    };
  }

  return {
    allPois: masterCensus.allPois,
    sectorCensus: masterCensus.sectorCensus,
    cycleId: snapshot.cycleId,
    syncedAt: snapshot.syncedAt,
    isDailySnapshot: true,
  };
}

/**
 * Nightly batch sync executed at 04:00 TSİ (01:00 UTC) via cron.
 * Scans key Turkish hubs in optimized chunks and builds the locked daily snapshot.
 */
export async function runNightlyRadarBatchSync(options: {
  districtLimit?: number;
} = {}): Promise<{
  cycleId: string;
  syncedDistricts: number;
  totalPois: number;
  syncedAt: string;
}> {
  const currentCycle = getCurrentDailyCycleId();
  const limit = options.districtLimit ?? 20;
  console.log(`[radar-snapshot] Starting nightly 04:00 TSİ batch sync for cycle: ${currentCycle} (limit: ${limit})`);

  const existingDisk = loadDiskSnapshot();
  const mergedAreas: Record<string, AreaPoiCensusResult> = {
    ...(existingDisk?.areas || {}),
  };

  let totalPois = 0;
  let syncedCount = 0;

  // Process key districts with standard 500m & 1000m radii
  const targetDistricts = TURKEY_POPULAR_DISTRICTS.slice(0, limit);

  // Flatten tasks: [district, radius]
  const tasks: Array<{ loc: (typeof targetDistricts)[0]; radius: number }> = [];
  for (const loc of targetDistricts) {
    for (const radius of [500, 1000]) {
      tasks.push({ loc, radius });
    }
  }

  // Process in polite chunks of 2 concurrent operations with gentle pacing
  const CHUNK_SIZE = 2;
  for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
    const chunk = tasks.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async ({ loc, radius }) => {
        const areaKey = makeAreaKey(loc.lat, loc.lng, radius);
        try {
          const census = await fetchMasterAreaPoiCensus(loc.lat, loc.lng, radius, loc.name, 'all');
          if (census && census.allPois && census.allPois.length > 0) {
            mergedAreas[areaKey] = census;
            totalPois += census.allPois.length;
            syncedCount++;
          }
        } catch (err) {
          console.warn(`[radar-snapshot] Warning syncing ${loc.name} (${radius}m):`, err);
        }
      }),
    );

    // Save incrementally
    const intermediatePayload: DailySnapshotPayload = {
      cycleId: currentCycle,
      syncedAt: new Date().toISOString(),
      nextSyncAt: getNextSyncAt(),
      areas: mergedAreas,
    };
    memorySnapshot = intermediatePayload;
    saveDiskSnapshot(intermediatePayload);

    // Polite 400ms pause to avoid Overpass rate-limiting
    if (i + CHUNK_SIZE < tasks.length) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  const finalPayload: DailySnapshotPayload = {
    cycleId: currentCycle,
    syncedAt: new Date().toISOString(),
    nextSyncAt: getNextSyncAt(),
    areas: mergedAreas,
  };

  memorySnapshot = finalPayload;
  saveDiskSnapshot(finalPayload);

  console.log(
    `[radar-snapshot] Nightly batch completed: ${syncedCount} areas, ${totalPois} POIs saved for cycle ${currentCycle}.`,
  );

  return {
    cycleId: currentCycle,
    syncedDistricts: syncedCount,
    totalPois,
    syncedAt: finalPayload.syncedAt,
  };
}
