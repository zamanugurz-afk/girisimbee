import type {
  FranchiseDimensionResult,
  FranchiseMatchBand,
  FranchiseMatchDimensionKey,
  FranchiseOpportunityProfile,
  FranchiseSeekerProfile,
} from '@/features/franchise-matching/types';
import { normalizeString } from '@/features/franchise-matching/normalize';

export const FRANCHISE_MATCH_WEIGHTS: Record<FranchiseMatchDimensionKey, number> = {
  sector: 30,
  budget: 25,
  location: 20,
  businessModel: 15,
  experience: 5,
  storeType: 5,
};

export const FRANCHISE_DIMENSION_LABELS: Record<FranchiseMatchDimensionKey, string> = {
  sector: 'Sektör Uyumu',
  budget: 'Yatırım Bütçesi',
  location: 'Lokasyon Uyumu',
  businessModel: 'Franchise / İş Modeli',
  experience: 'İşletme Deneyimi',
  storeType: 'Mağaza / Lokasyon Tipi',
};

export function scoreSector(
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): number | null {
  const sSec = normalizeString(seeker.sector);
  const oSec = normalizeString(opp.sector);

  if (!sSec || !oSec) return null;

  if (sSec === oSec || sSec.includes(oSec) || oSec.includes(sSec)) {
    return 1.0;
  }
  return 0.0;
}

export function scoreBudget(
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): number | null {
  const investment = opp.totalInvestment || opp.minCapitalRequirement;
  if (!investment) return null;

  const min = seeker.minimumInvestment;
  const max = seeker.maximumInvestment;

  if (min == null && max == null) return null;

  const effectiveMin = min != null ? min : 0;
  const effectiveMax = max != null ? max : effectiveMin * 2;

  // Exact within range
  if (investment >= effectiveMin && investment <= effectiveMax) {
    return 1.0;
  }

  // 25% tolerance boundary
  const tolMin = effectiveMin * 0.75;
  const tolMax = effectiveMax * 1.25;
  if (investment >= tolMin && investment <= tolMax) {
    return 0.65;
  }

  return 0.30;
}

export function scoreLocation(
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): number | null {
  const sCity = normalizeString(seeker.city);
  const available = opp.availableCities.map(normalizeString);

  if (!sCity || available.length === 0) return null;

  // 1. All Turkey / Nationwide
  if (available.some((c) => c.includes('tum turkiye') || c.includes('tumturkiye') || c.includes('turkiye'))) {
    return 1.0;
  }

  // 2. Exact city in availableCities
  if (available.some((c) => c === sCity || c.includes(sCity) || sCity.includes(c))) {
    return 1.0;
  }

  // 3. Istanbul Anatolia <-> Europe cross-side
  const isAnatolia = (c: string) => c.includes('anadolu') || c.includes('kadikoy') || c.includes('uskudar') || c.includes('atasehir') || c.includes('umraniye') || c.includes('kartal') || c.includes('pendik');
  const isEurope = (c: string) => c.includes('avrupa') || c.includes('besiktas') || c.includes('sisli') || c.includes('levent') || c.includes('bakirkoy') || c.includes('beyoglu') || c.includes('fatih');

  const sIsIstanbul = sCity.includes('istanbul') || isAnatolia(sCity) || isEurope(sCity);
  const oppHasIstanbul = available.some((c) => c.includes('istanbul') || isAnatolia(c) || isEurope(c));

  if (sIsIstanbul && oppHasIstanbul) {
    const sSide = isAnatolia(sCity) ? 'anadolu' : isEurope(sCity) ? 'avrupa' : 'both';
    const oppSide = available.some(isAnatolia) ? 'anadolu' : available.some(isEurope) ? 'avrupa' : 'both';

    if (sSide !== 'both' && oppSide !== 'both' && sSide !== oppSide) {
      return 0.85;
    }
    return 1.0;
  }

  // 4. Different city (Never 0, always 0.50 - Hard filter strictly prohibited)
  return 0.50;
}

export function scoreBusinessModel(
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): number | null {
  const sCat = normalizeString(seeker.businessCategory);
  const oCat = normalizeString(opp.businessCategory);

  if (!sCat || !oCat) return null;

  if (sCat === oCat || sCat.includes(oCat) || oCat.includes(sCat)) {
    return 1.0;
  }

  // Related models (e.g. cafe <-> fast food, or retail)
  if (
    (sCat.includes('cafe') || sCat.includes('restoran') || sCat.includes('food')) &&
    (oCat.includes('cafe') || oCat.includes('restoran') || oCat.includes('food') || oCat.includes('fast food'))
  ) {
    return 0.65;
  }

  return 0.30;
}

export function scoreExperience(
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): number | null {
  const sExp = normalizeString(seeker.experience);
  const oExp = normalizeString(opp.experienceRequirement);

  if (!sExp && !oExp) return null;
  if (!oExp || oExp.includes('gerekmez') || oExp.includes('yok')) return 1.0;
  if (!sExp) return null;

  if (sExp === oExp || sExp.includes(oExp) || oExp.includes(sExp)) {
    return 1.0;
  }

  const expLevel = (str: string): number => {
    if (str.includes('10+')) return 4;
    if (str.includes('5-10')) return 3;
    if (str.includes('3-5')) return 2;
    if (str.includes('1-3')) return 1;
    return 0;
  };

  const sLvl = expLevel(sExp);
  const oLvl = expLevel(oExp);

  if (sLvl >= oLvl) return 1.0;
  if (sLvl + 1 >= oLvl) return 0.65;
  return 0.30;
}

export function scoreStoreType(
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): number | null {
  const wantsMall = seeker.mallPreference;
  const wantsStreet = seeker.streetStorePreference;

  if (wantsMall === null && wantsStreet === null) return null;

  const hasMall = opp.mallAvailable;
  const hasStreet = opp.streetStoreAvailable;

  if (hasMall === null && hasStreet === null) return null;

  if (wantsMall && hasMall) return 1.0;
  if (wantsStreet && hasStreet) return 1.0;
  if ((wantsMall && !hasMall) || (wantsStreet && !hasStreet)) return 0.30;

  return 0.65;
}

export function scoreFranchiseDimensions(
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): FranchiseDimensionResult[] {
  const raw: Array<{
    key: FranchiseMatchDimensionKey;
    score: number | null;
  }> = [
    { key: 'sector', score: scoreSector(seeker, opp) },
    { key: 'budget', score: scoreBudget(seeker, opp) },
    { key: 'location', score: scoreLocation(seeker, opp) },
    { key: 'businessModel', score: scoreBusinessModel(seeker, opp) },
    { key: 'experience', score: scoreExperience(seeker, opp) },
    { key: 'storeType', score: scoreStoreType(seeker, opp) },
  ];

  return raw.map((r) => ({
    key: r.key,
    label: FRANCHISE_DIMENSION_LABELS[r.key],
    weight: FRANCHISE_MATCH_WEIGHTS[r.key],
    comparable: r.score !== null,
    score: r.score,
  }));
}

export function normalizeMatchScore(dimensions: FranchiseDimensionResult[]): number {
  let weightedSum = 0;
  let usedWeight = 0;

  for (const dim of dimensions) {
    if (dim.score !== null) {
      weightedSum += dim.score * dim.weight;
      usedWeight += dim.weight;
    }
  }

  if (usedWeight === 0) return 0;
  return Math.round((weightedSum / usedWeight) * 100);
}

export function resolveScoreBand(score: number): {
  band: FranchiseMatchBand;
  bandLabel: string;
  recommendable: boolean;
} {
  if (score >= 80) {
    return { band: 'very_strong', bandLabel: 'Çok Güçlü Franchise Eşleşmesi', recommendable: true };
  }
  if (score >= 65) {
    return { band: 'strong', bandLabel: 'Güçlü Franchise Eşleşmesi', recommendable: true };
  }
  if (score >= 50) {
    return { band: 'suitable', bandLabel: 'Uygun Franchise Fırsatı', recommendable: true };
  }
  return { band: 'below_threshold', bandLabel: 'Uyumsuz', recommendable: false };
}
