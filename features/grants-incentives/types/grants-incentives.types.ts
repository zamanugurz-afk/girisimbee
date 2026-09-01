export type GrantProvider =
  | 'KOSGEB'
  | 'Gelir İdaresi (GİB)'
  | 'İŞKUR'
  | 'Ticaret Bakanlığı'
  | 'TÜBİTAK';

export type SupportType =
  | 'Hibe (Geri Ödemesiz)'
  | 'Faizsiz Kredi'
  | 'Vergi / Prim Muafiyeti'
  | 'Kira / Donanım Desteği';

export interface GrantSupportItem {
  id: string;
  provider: GrantProvider;
  programName: string;
  supportType: SupportType;
  maxAmount: number;
  coverageRatio: string; // e.g. "%75 - %90" or "%100"
  conditions: string[];
  applicationUrl: string;
  summary: string;
  officialReference: string;
  sampleBusinessPlan?: {
    title: string;
    targetMarket: string;
    equipmentNeeds: string;
    projectMilestones: string[];
    justificationText: string;
  };
}

export interface RegionalIncentiveZone {
  zone: 1 | 2 | 3 | 4 | 5 | 6;
  zoneName: string;
  sgkEmployerShareSupportYears: number;
  taxReductionRate: string;
  interestSupportPoints: number; // e.g. 5 puan TL faiz desteği
  description: string;
}

export interface SectorIncentiveProfile {
  sectorId: string;
  sectorName: string;
  emoji: string;
  categoryGroup: 'Finans & Hizmet' | 'Yeme - İçme' | 'Kişisel Bakım & Sağlık' | 'Perakende & Zanaat';
  naceCode: string;
  naceDescription: string;
  isKosgebEligible: boolean;
  kosgebCategory: 'Geleneksel Girişimci' | 'İleri Girişimci (Teknoloji/İmalat)';
  availableGrants: GrantSupportItem[];
  taxExemptions: {
    youngEntrepreneurTaxDiscount: boolean; // 18-29 yaş 3 yıl gelir vergisi muafiyeti
    bagkurPremiumSupportDays: number; // 1 yıl (365 gün) prim desteği
    annualEstimatedTaxSaving: number; // Yıllık ortalama vergi tasarrufu
    annualBagkurSaving: number; // Yıllık Bağ-Kur tasarrufu (~84.000 TL)
  };
}

export interface EntrepreneurFilters {
  isYoungEntrepreneur: boolean; // 18-29 Yaş Aralığı
  isFemaleEntrepreneur: boolean; // Kadın Girişimci (+20.000 TL Ek Hibe)
  isPreEstablishment: boolean; // Şirket Henüz Kurulmadı
}
