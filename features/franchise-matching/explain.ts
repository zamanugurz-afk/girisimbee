import type {
  FranchiseDimensionResult,
  FranchiseMatchExplanation,
  FranchiseOpportunityProfile,
  FranchiseSeekerProfile,
} from '@/features/franchise-matching/types';

export function generateFranchiseMatchReasons(
  dimensions: FranchiseDimensionResult[],
  seeker: FranchiseSeekerProfile,
  opp: FranchiseOpportunityProfile,
): FranchiseMatchExplanation[] {
  const reasons: FranchiseMatchExplanation[] = [];
  const addedTexts = new Set<string>();

  const addReason = (kind: 'match' | 'gap', text: string) => {
    if (!addedTexts.has(text)) {
      addedTexts.add(text);
      reasons.push({ kind, text });
    }
  };

  for (const dim of dimensions) {
    if (dim.score === null) continue;

    switch (dim.key) {
      case 'sector':
        if (dim.score === 1.0) {
          const sec = opp.sector || seeker.sector;
          addReason('match', sec ? `${sec} sektör tercihinizle tam uyumlu` : 'Sektör tercihinizle tam uyumlu');
        }
        break;

      case 'budget':
        if (dim.score === 1.0) {
          addReason('match', 'Yatırım bütçenize tam uygun');
        } else if (dim.score === 0.65) {
          addReason('match', 'Yatırım bütçenize yakın aralıkta');
        }
        break;

      case 'location':
        if (dim.score === 1.0) {
          if (opp.availableCities.some((c) => c.toLowerCase().includes('tüm türkiye'))) {
            addReason('match', 'Tüm Türkiye genelinde bayilik veriyor');
          } else {
            addReason('match', 'Hedeflediğiniz şehirde büyüme fırsatı sunuyor');
          }
        } else if (dim.score === 0.85) {
          addReason('gap', 'İstanbul Anadolu ↔ İstanbul Avrupa — küçük lokasyon farkı');
        } else if (dim.score === 0.50) {
          addReason('gap', 'Farklı şehir lokasyon tercihi');
        }
        break;

      case 'businessModel':
        if (dim.score === 1.0) {
          const model = opp.businessCategory;
          addReason('match', model ? `${model} işletme modeliyle örtüşüyor` : 'Franchise işletme modeliyle örtüşüyor');
        } else if (dim.score === 0.65) {
          addReason('match', 'Benzer ve uyumlu işletme modeli');
        }
        break;

      case 'experience':
        if (dim.score === 1.0) {
          addReason('match', 'İşletme deneyiminiz marka beklentisini karşılıyor');
        }
        break;

      case 'storeType':
        if (dim.score === 1.0) {
          addReason('match', 'Mağaza ve lokasyon tipi tercihinize uygun');
        }
        break;
    }
  }

  // Fallbacks to guarantee at least 3 reasons
  if (reasons.length < 3) {
    if (opp.branchCount && opp.branchCount > 1) {
      addReason('match', `${opp.branchCount}+ aktif şubeli yerleşik marka gücü`);
    }
  }
  if (reasons.length < 3) {
    addReason('match', 'Eğitim ve operasyon desteği sağlanıyor');
  }

  return reasons.slice(0, 5);
}
