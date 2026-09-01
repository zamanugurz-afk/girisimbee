/**
 * GİRİŞİMBEE AYLIK RESMİ MEVZUAT, HARÇ VE TEŞVİK KONFİGÜRASYON MOTORU
 * Her ay resmi mevzuat, harçlar ve yeniden değerleme oranları değiştikçe
 * tüm 4 kokpit modülü bu merkezi kaynaktan beslenir.
 */

export interface RegulatoryMarketVersion {
  versionCode: string;
  monthName: string;
  year: number;
  lastVerifiedDate: string;
  regulatoryCycle: string;
  minimumWageGross2026: number;
  minimumWageNet2026: number;
  statutoryCapitalLtd2026: number;
  statutoryCapitalAs2026: number;
  youngEntrepreneurTaxExemption2026: number; // 193 Sayılı GVK Md. 20 (Yıllık 330.000 TL)
  bagkurMonthlyRate2026: number; // Aylık 4/b Bağkur primi (~84.000 TL/yıl)
  iskurEmploymentSupportMonthly2026: number; // Aylık SGK işveren desteği (~9.000 TL/ay = 54.000 TL/6 ay)
  kosgebGeneralGrantCap2026: number; // Geleneksel taban hibe (65.000 + 20.000)
  kosgebAdvancedGrantCap2026: number; // İleri girişimci azami hibe (375.000 + 65.000)
  inflationAdjustmentMultiplier: number;
  officialSources: string[];
}

export const CURRENT_REGULATORY_VERSION: RegulatoryMarketVersion = {
  versionCode: '2026.09',
  monthName: 'Eylül',
  year: 2026,
  lastVerifiedDate: '1 Eylül 2026',
  regulatoryCycle: '2026 / 3. Çeyrek (Q3) Mevzuat & Harç Verisi',
  minimumWageGross2026: 33000,
  minimumWageNet2026: 28000,
  statutoryCapitalLtd2026: 50000, // TTK 50.000 TL
  statutoryCapitalAs2026: 250000, // TTK 250.000 TL
  youngEntrepreneurTaxExemption2026: 330000, // 330.000 TL / yıl (3 Yıl Toplam 990.000 TL matrah muafiyeti)
  bagkurMonthlyRate2026: 7000, // Yıllık 84.000 TL
  iskurEmploymentSupportMonthly2026: 9000, // 6 Ayda 54.000 TL
  kosgebGeneralGrantCap2026: 85000, // 65.000 TL + 20.000 TL Genç/Kadın
  kosgebAdvancedGrantCap2026: 440000, // 375.000 TL + 65.000 TL Kuruluş
  inflationAdjustmentMultiplier: 1.0,
  officialSources: [
    'T.C. Resmî Gazete 2026 Sayıları',
    'T.C. Ticaret Bakanlığı MERSİS & Tescil Harçları',
    'T.C. Hazine ve Maliye Bakanlığı Gelir İdaresi (GİB) 193 Sayılı GVK Md. 20',
    'T.C. Küçük ve Orta Ölçekli İşletmeleri Geliştirme İdaresi Başkanlığı (KOSGEB)',
    'T.C. Sosyal Güvenlik Kurumu (SGK) 5510 Sayılı Kanun Prim Tebliği',
    'Türkiye Odalar ve Borsalar Birliği (TOBB) ve İlgili Meslek Birlikleri',
  ],
};

export function getRegulatoryBadgeText(): string {
  return `📅 ${CURRENT_REGULATORY_VERSION.lastVerifiedDate} Güncel • ${CURRENT_REGULATORY_VERSION.regulatoryCycle}`;
}
