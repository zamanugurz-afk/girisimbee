import type {
  BusinessTransferDimensionResult,
  BusinessTransferMatchBand,
  BusinessTransferMatchDimensionKey,
  BusinessTransferOpportunityProfile,
  BusinessTransferSeekerProfile,
} from '@/features/business-transfer-matching/types';
import { normalizeString } from '@/features/business-transfer-matching/normalize';

export const BUSINESS_TRANSFER_MATCH_WEIGHTS: Record<BusinessTransferMatchDimensionKey, number> = {
  sector: 30,
  budget: 25,
  location: 20,
  businessType: 15,
  operations: 10,
};

export const BUSINESS_TRANSFER_DIMENSION_LABELS: Record<BusinessTransferMatchDimensionKey, string> = {
  sector: 'Sektör Uyumu',
  budget: 'Bütçe & Devir Bedeli Uyumu',
  location: 'Lokasyon Uyumu',
  businessType: 'İşletme Türü Uyumu',
  operations: 'Faaliyet & Yönetim Modeli',
};

export function scoreSector(
  seeker: BusinessTransferSeekerProfile,
  opp: BusinessTransferOpportunityProfile,
): number | null {
  const oSec = normalizeString(opp.sector);
  if (!oSec) return null;

  const sSectors = seeker.preferredSectors.map(normalizeString).filter(Boolean);
  if (sSectors.length === 0) return null;

  if (sSectors.some((s) => s === oSec || s.includes(oSec) || oSec.includes(s))) {
    return 1.0;
  }
  return 0.0;
}

export function scoreBudget(
  seeker: BusinessTransferSeekerProfile,
  opp: BusinessTransferOpportunityProfile,
): number | null {
  const price = opp.transferPrice;
  const budget = seeker.budgetMax;

  if (price == null || budget == null) return null;
  if (price <= 0 || budget <= 0) return null;

  // Exact / under budget
  if (price <= budget) {
    return 1.0;
  }

  // Up to 20% over budget is still negotiable
  if (price <= budget * 1.2) {
    return 0.75;
  }

  // Up to 35% over budget
  if (price <= budget * 1.35) {
    return 0.4;
  }

  return 0.1;
}

export function scoreLocation(
  seeker: BusinessTransferSeekerProfile,
  opp: BusinessTransferOpportunityProfile,
): number | null {
  const sCity = normalizeString(seeker.city);
  const oCity = normalizeString(opp.city);

  if (!sCity || !oCity) return null;

  // Exact city match
  if (sCity === oCity || sCity.includes(oCity) || oCity.includes(sCity)) {
    const sDist = normalizeString(seeker.district);
    const oDist = normalizeString(opp.district);
    if (sDist && oDist && (sDist === oDist || sDist.includes(oDist) || oDist.includes(sDist))) {
      return 1.0; // Exact city + district match
    }
    return 0.9; // Exact city match
  }

  return 0.0;
}

export function scoreBusinessType(
  seeker: BusinessTransferSeekerProfile,
  opp: BusinessTransferOpportunityProfile,
): number | null {
  const oType = normalizeString(opp.businessType);
  if (!oType) return null;

  const sTypes = seeker.preferredBusinessTypes.map(normalizeString).filter(Boolean);
  if (sTypes.length === 0) return null;

  if (sTypes.some((t) => t === oType || t.includes(oType) || oType.includes(t))) {
    return 1.0;
  }
  return 0.1;
}

export function scoreOperations(
  seeker: BusinessTransferSeekerProfile,
  opp: BusinessTransferOpportunityProfile,
): number | null {
  const sPref = normalizeString(seeker.operationalPreference);
  const sStatus = normalizeString(seeker.preferredStatus);
  const oStatus = normalizeString(opp.operationalStatus);

  if (!sPref && !sStatus && !oStatus) return null;

  let score = 0.8;
  if (sStatus && oStatus) {
    if (sStatus === oStatus || sStatus.includes(oStatus) || oStatus.includes(sStatus)) {
      score += 0.2;
    }
  }

  return Math.min(1.0, score);
}

export function getBusinessTransferBand(score: number): {
  band: BusinessTransferMatchBand;
  bandLabel: string;
  recommendable: boolean;
} {
  if (score >= 80) {
    return { band: 'very_strong', bandLabel: 'Çok Güçlü Eşleşme', recommendable: true };
  }
  if (score >= 65) {
    return { band: 'strong', bandLabel: 'Güçlü Eşleşme', recommendable: true };
  }
  if (score >= 50) {
    return { band: 'suitable', bandLabel: 'Uygun Fırsat', recommendable: true };
  }
  return { band: 'below_threshold', bandLabel: 'Düşük Uyum', recommendable: false };
}
