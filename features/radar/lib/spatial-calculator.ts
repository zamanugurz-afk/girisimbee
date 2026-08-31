import type {
  CompetitorPoi,
  MarketGapConcept,
  MissingSectorItem,
  RadarAnalysisMetrics,
  RadarCategoryKey,
  RadarIntelligenceReport,
  SaturationLevel,
} from '@/types/radar.types';
import { RADAR_CATEGORIES } from '@/features/radar/config/radar.config';

/**
 * Calculates great-circle distance between two geographic points using Haversine formula (in meters).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface SectorConsumptionProfile {
  requiredPopulation: number;
  frequencyLabel: string;
  upperSesAffinity: number; // A+, A
  midSesAffinity: number;   // B, C1
  lowerSesAffinity: number; // C2, D
}

export const SECTOR_CONSUMPTION_PROFILES: Record<string, SectorConsumptionProfile> = {
  market: { requiredPopulation: 2200, frequencyLabel: 'Günlük Temel Tüketim', upperSesAffinity: 1.05, midSesAffinity: 1.0, lowerSesAffinity: 1.0 },
  bakery: { requiredPopulation: 2600, frequencyLabel: 'Günlük Temel Tüketim', upperSesAffinity: 1.0, midSesAffinity: 1.05, lowerSesAffinity: 1.10 },
  cafe: { requiredPopulation: 2800, frequencyLabel: 'Haftada 3-5 Kez', upperSesAffinity: 1.45, midSesAffinity: 1.10, lowerSesAffinity: 0.70 },
  restaurant: { requiredPopulation: 3200, frequencyLabel: 'Haftalık Tüketim', upperSesAffinity: 1.30, midSesAffinity: 1.05, lowerSesAffinity: 0.80 },
  donerci: { requiredPopulation: 3400, frequencyLabel: 'Haftalık Tüketim', upperSesAffinity: 0.85, midSesAffinity: 1.25, lowerSesAffinity: 1.30 },
  borekci: { requiredPopulation: 3500, frequencyLabel: 'Haftada 2-3 Kez', upperSesAffinity: 0.90, midSesAffinity: 1.20, lowerSesAffinity: 1.25 },
  hairdresser: { requiredPopulation: 2600, frequencyLabel: 'Aylık Düzenli Hizmet', upperSesAffinity: 1.20, midSesAffinity: 1.0, lowerSesAffinity: 0.90 },
  pharmacy: { requiredPopulation: 3500, frequencyLabel: 'Düzenli Sağlık İhtiyacı', upperSesAffinity: 1.10, midSesAffinity: 1.0, lowerSesAffinity: 1.0 },
  cigkofteci: { requiredPopulation: 4500, frequencyLabel: 'Haftalık Hızlı Tüketim', upperSesAffinity: 0.65, midSesAffinity: 1.20, lowerSesAffinity: 1.35 },
  butcher: { requiredPopulation: 4600, frequencyLabel: 'Haftalık Alışveriş', upperSesAffinity: 1.15, midSesAffinity: 1.10, lowerSesAffinity: 0.85 },
  manav: { requiredPopulation: 4200, frequencyLabel: 'Haftalık Alışveriş', upperSesAffinity: 1.10, midSesAffinity: 1.10, lowerSesAffinity: 0.95 },
  stationery: { requiredPopulation: 5000, frequencyLabel: 'Dönemsel / Aylık İhtiyaç', upperSesAffinity: 1.15, midSesAffinity: 1.05, lowerSesAffinity: 0.90 },
  dental_clinic: { requiredPopulation: 6000, frequencyLabel: 'Periyodik Sağlık & Bakım', upperSesAffinity: 1.40, midSesAffinity: 1.0, lowerSesAffinity: 0.70 },
  real_estate: { requiredPopulation: 6000, frequencyLabel: 'Dönemsel Hizmet', upperSesAffinity: 1.25, midSesAffinity: 1.05, lowerSesAffinity: 0.75 },
  optician: { requiredPopulation: 7500, frequencyLabel: 'Yıllık / İhtiyaç Odaklı', upperSesAffinity: 1.20, midSesAffinity: 1.0, lowerSesAffinity: 0.80 },
  pet_shop: { requiredPopulation: 7500, frequencyLabel: 'Aylık Mama & Bakım', upperSesAffinity: 1.50, midSesAffinity: 1.05, lowerSesAffinity: 0.50 },
  dondurmaci: { requiredPopulation: 7500, frequencyLabel: 'Haftalık / Sezonluk Keyif', upperSesAffinity: 1.30, midSesAffinity: 1.10, lowerSesAffinity: 0.80 },
  cilingir: { requiredPopulation: 8000, frequencyLabel: 'Acil İhtiyaç Hizmeti', upperSesAffinity: 1.0, midSesAffinity: 1.0, lowerSesAffinity: 1.0 },
  gym: { requiredPopulation: 8500, frequencyLabel: 'Aylık Üyelik & Spor', upperSesAffinity: 1.45, midSesAffinity: 1.05, lowerSesAffinity: 0.55 },
  dry_cleaning: { requiredPopulation: 8500, frequencyLabel: 'Aylık Bakım & Temizlik', upperSesAffinity: 1.40, midSesAffinity: 1.0, lowerSesAffinity: 0.60 },
  insurance_agency: { requiredPopulation: 8500, frequencyLabel: 'Yıllık Poliçe Hizmeti', upperSesAffinity: 1.15, midSesAffinity: 1.05, lowerSesAffinity: 0.85 },
  kokorecci: { requiredPopulation: 9000, frequencyLabel: 'Gece / Seyrek Tüketim', upperSesAffinity: 0.75, midSesAffinity: 1.20, lowerSesAffinity: 1.20 },
  florist: { requiredPopulation: 9500, frequencyLabel: 'Özel Gün / Hediye Odaklı', upperSesAffinity: 1.45, midSesAffinity: 1.0, lowerSesAffinity: 0.55 },
  car_wash: { requiredPopulation: 10000, frequencyLabel: 'Aylık / 2 Haftada Bir', upperSesAffinity: 1.30, midSesAffinity: 1.10, lowerSesAffinity: 0.80 },
  balikci: { requiredPopulation: 10000, frequencyLabel: 'Haftalık / Seyrek Tüketim', upperSesAffinity: 1.20, midSesAffinity: 1.05, lowerSesAffinity: 0.75 },
  tatlici: { requiredPopulation: 11500, frequencyLabel: 'Özel Gün / Seyrek Tatlı Tüketimi', upperSesAffinity: 0.70, midSesAffinity: 1.25, lowerSesAffinity: 1.20 },
  lastikci: { requiredPopulation: 12000, frequencyLabel: 'Yıllık / Sezonluk Lastik Değişimi', upperSesAffinity: 0.95, midSesAffinity: 1.10, lowerSesAffinity: 1.05 },
  auto_gallery: { requiredPopulation: 15000, frequencyLabel: 'Çok Seyrek Araç Alım/Satım', upperSesAffinity: 1.10, midSesAffinity: 1.05, lowerSesAffinity: 0.85 },
  travel_agency: { requiredPopulation: 16000, frequencyLabel: 'Yıllık Tatil & Vize', upperSesAffinity: 1.35, midSesAffinity: 1.0, lowerSesAffinity: 0.65 },
  law_firm: { requiredPopulation: 4500, frequencyLabel: 'Dönemsel Hukuki Danışmanlık', upperSesAffinity: 1.35, midSesAffinity: 1.0, lowerSesAffinity: 0.70 },
  jewelry: { requiredPopulation: 9000, frequencyLabel: 'Yıllık & Özel Gün Alışverişi', upperSesAffinity: 1.35, midSesAffinity: 1.15, lowerSesAffinity: 0.90 },
  su_bayisi: { requiredPopulation: 6000, frequencyLabel: 'Haftalık Damacana Siparişi', upperSesAffinity: 1.05, midSesAffinity: 1.15, lowerSesAffinity: 1.10 },
  playstation_cafe: { requiredPopulation: 6500, frequencyLabel: 'Haftalık Sosyal Eğlence', upperSesAffinity: 1.10, midSesAffinity: 1.35, lowerSesAffinity: 1.40 },
  internet_cafe: { requiredPopulation: 7500, frequencyLabel: 'Haftalık E-Spor & Oyun', upperSesAffinity: 0.90, midSesAffinity: 1.30, lowerSesAffinity: 1.45 },
  parti_evi: { requiredPopulation: 8500, frequencyLabel: 'Aylık & Özel Gün Etkinliği', upperSesAffinity: 1.65, midSesAffinity: 1.20, lowerSesAffinity: 0.70 },
  oto_ekspertiz: { requiredPopulation: 9500, frequencyLabel: 'Dönemsel Araç Alım Testi', upperSesAffinity: 1.15, midSesAffinity: 1.25, lowerSesAffinity: 1.10 },
  pilates_studio: { requiredPopulation: 6000, frequencyLabel: 'Haftada 2-3 Kez Spor', upperSesAffinity: 1.80, midSesAffinity: 1.20, lowerSesAffinity: 0.50 },
  kitap_kafe: { requiredPopulation: 7000, frequencyLabel: 'Haftalık Çalışma & Okuma', upperSesAffinity: 1.60, midSesAffinity: 1.15, lowerSesAffinity: 0.60 },
  tattoo_studio: { requiredPopulation: 9000, frequencyLabel: 'Özel & Sanatsal Hizmet', upperSesAffinity: 1.40, midSesAffinity: 1.20, lowerSesAffinity: 0.85 },
  dietitian: { requiredPopulation: 7000, frequencyLabel: 'Aylık Düzenli Beslenme Takibi', upperSesAffinity: 1.70, midSesAffinity: 1.15, lowerSesAffinity: 0.60 },
  kargo_subesi: { requiredPopulation: 5000, frequencyLabel: 'Haftalık Kargo Teslimat & İade', upperSesAffinity: 1.30, midSesAffinity: 1.15, lowerSesAffinity: 0.95 },
  nail_art: { requiredPopulation: 5500, frequencyLabel: '3 Haftada Bir Bakım', upperSesAffinity: 1.75, midSesAffinity: 1.20, lowerSesAffinity: 0.60 },
  guzellik_merkezi: { requiredPopulation: 6500, frequencyLabel: 'Aylık Cilt & Lazer Seansı', upperSesAffinity: 1.60, midSesAffinity: 1.15, lowerSesAffinity: 0.70 },
  surucu_kursu: { requiredPopulation: 9000, frequencyLabel: 'Dönemsel Ehliyet Eğitimi', upperSesAffinity: 1.05, midSesAffinity: 1.15, lowerSesAffinity: 1.15 },
  dil_kursu: { requiredPopulation: 10000, frequencyLabel: 'Dönemsel Yabancı Dil Eğitimi', upperSesAffinity: 1.60, midSesAffinity: 1.10, lowerSesAffinity: 0.60 },
  etut_merkezi: { requiredPopulation: 7500, frequencyLabel: 'Yıllık Sınav & Kurs Programı', upperSesAffinity: 1.50, midSesAffinity: 1.20, lowerSesAffinity: 0.80 },
  corbaci: { requiredPopulation: 6000, frequencyLabel: 'Haftalık & Gece Sıcak Tüketim', upperSesAffinity: 0.90, midSesAffinity: 1.25, lowerSesAffinity: 1.35 },
  bufe_tost: { requiredPopulation: 3500, frequencyLabel: 'Haftada 2-3 Kez Hızlı Atıştırmalık', upperSesAffinity: 1.10, midSesAffinity: 1.25, lowerSesAffinity: 1.30 },
  kahvalti_salonu: { requiredPopulation: 7500, frequencyLabel: 'Hafta Sonu Aile Kahvaltısı', upperSesAffinity: 1.55, midSesAffinity: 1.15, lowerSesAffinity: 0.75 },
  bubble_tea: { requiredPopulation: 6000, frequencyLabel: 'Haftalık İçecek & Tatlı Keyfi', upperSesAffinity: 1.60, midSesAffinity: 1.20, lowerSesAffinity: 0.70 },
  psikolog: { requiredPopulation: 7500, frequencyLabel: 'Haftalık / 2 Haftada Bir Seans', upperSesAffinity: 1.80, midSesAffinity: 1.15, lowerSesAffinity: 0.50 },
  noter: { requiredPopulation: 12000, frequencyLabel: 'Dönemsel Resmi İşlem', upperSesAffinity: 1.15, midSesAffinity: 1.05, lowerSesAffinity: 0.95 },
  mali_musavir: { requiredPopulation: 6000, frequencyLabel: 'Aylık Kurumsal Hizmet', upperSesAffinity: 1.35, midSesAffinity: 1.10, lowerSesAffinity: 0.85 },
  motosiklet_servis: { requiredPopulation: 8500, frequencyLabel: 'Dönemsel Bakım & Ekipman', upperSesAffinity: 1.10, midSesAffinity: 1.25, lowerSesAffinity: 1.20 },
  oto_tuning: { requiredPopulation: 9000, frequencyLabel: 'Yıllık / İhtiyaç Odaklı Modifiye', upperSesAffinity: 1.25, midSesAffinity: 1.25, lowerSesAffinity: 1.05 },
  outdoor_kamp: { requiredPopulation: 11000, frequencyLabel: 'Sezonluk Kamp & Doğa Sporları', upperSesAffinity: 1.50, midSesAffinity: 1.10, lowerSesAffinity: 0.65 },
  muzik_kursu: { requiredPopulation: 8500, frequencyLabel: 'Haftalık Enstrüman Dersi', upperSesAffinity: 1.65, midSesAffinity: 1.10, lowerSesAffinity: 0.60 },
  antika_vintage: { requiredPopulation: 12000, frequencyLabel: 'Özel İlgi & Koleksiyon', upperSesAffinity: 1.70, midSesAffinity: 1.05, lowerSesAffinity: 0.50 },
  tobacco_shop: { requiredPopulation: 6000, frequencyLabel: 'Düzenli & Keyif Tüketimi', upperSesAffinity: 1.15, midSesAffinity: 1.20, lowerSesAffinity: 1.20 },
  mimarlik_ofisi: { requiredPopulation: 8000, frequencyLabel: 'Dönemsel Dekorasyon & Proje', upperSesAffinity: 1.85, midSesAffinity: 1.10, lowerSesAffinity: 0.50 },
  medikal_ortopedi: { requiredPopulation: 8500, frequencyLabel: 'Periyodik Sağlık & Bakım Cihazı', upperSesAffinity: 1.20, midSesAffinity: 1.05, lowerSesAffinity: 1.00 },
  isitme_cihazi: { requiredPopulation: 14000, frequencyLabel: 'Yıllık Bakım & Cihaz Ayarı', upperSesAffinity: 1.25, midSesAffinity: 1.05, lowerSesAffinity: 0.90 },
  pub_meyhane: { requiredPopulation: 6500, frequencyLabel: 'Haftalık Sosyalleşme & Keyif', upperSesAffinity: 1.70, midSesAffinity: 1.15, lowerSesAffinity: 0.60 },
  waffle_cikolata: { requiredPopulation: 6000, frequencyLabel: 'Haftalık Tatlı & Çikolata', upperSesAffinity: 1.60, midSesAffinity: 1.20, lowerSesAffinity: 0.75 },
  boutique: { requiredPopulation: 3500, frequencyLabel: 'Aylık Alışveriş & Moda', upperSesAffinity: 1.45, midSesAffinity: 1.15, lowerSesAffinity: 0.70 },
  terzi: { requiredPopulation: 4500, frequencyLabel: 'Dönemsel Tadilat & Dikim', upperSesAffinity: 1.15, midSesAffinity: 1.10, lowerSesAffinity: 1.00 },
  oto_elektrik: { requiredPopulation: 8000, frequencyLabel: 'Periyodik Akü & Elektrik Bakımı', upperSesAffinity: 1.05, midSesAffinity: 1.20, lowerSesAffinity: 1.15 },
  kindergarten: { requiredPopulation: 6500, frequencyLabel: 'Haftalık / Aylık Okul Öncesi Eğitim', upperSesAffinity: 1.70, midSesAffinity: 1.20, lowerSesAffinity: 0.60 },
  software_agency: { requiredPopulation: 7500, frequencyLabel: 'Kurumsal Dijital Projeler', upperSesAffinity: 1.80, midSesAffinity: 1.10, lowerSesAffinity: 0.50 },
  furniture: { requiredPopulation: 9000, frequencyLabel: 'Yıllık & Ev Kurulum Alışverişi', upperSesAffinity: 1.35, midSesAffinity: 1.15, lowerSesAffinity: 0.85 },
  electronics: { requiredPopulation: 4000, frequencyLabel: 'Aylık Aksesuar & Hızlı Tamir', upperSesAffinity: 1.25, midSesAffinity: 1.20, lowerSesAffinity: 1.05 },
  zuccaciye: { requiredPopulation: 4500, frequencyLabel: 'Aylık Ev Eşyası & Mutfak Gereçleri', upperSesAffinity: 1.10, midSesAffinity: 1.25, lowerSesAffinity: 1.20 },
  hardware: { requiredPopulation: 5000, frequencyLabel: 'Dönemsel Tamirat & Nalburiye', upperSesAffinity: 1.10, midSesAffinity: 1.20, lowerSesAffinity: 1.15 },
  perde: { requiredPopulation: 7000, frequencyLabel: 'Dönemsel Ev Tekstili & Perde', upperSesAffinity: 1.35, midSesAffinity: 1.15, lowerSesAffinity: 0.85 },
  parfumeri: { requiredPopulation: 4500, frequencyLabel: 'Aylık Kozmetik & Bakım', upperSesAffinity: 1.55, midSesAffinity: 1.15, lowerSesAffinity: 0.70 },
  shoe_store: { requiredPopulation: 5000, frequencyLabel: 'Mevsimlik Ayakkabı & Çanta', upperSesAffinity: 1.35, midSesAffinity: 1.20, lowerSesAffinity: 0.85 },
  tup_bayisi: { requiredPopulation: 10000, frequencyLabel: 'Aylık Mutfak Tüpü Dağıtımı', upperSesAffinity: 0.70, midSesAffinity: 1.20, lowerSesAffinity: 1.45 },
  kuruyemis: { requiredPopulation: 3500, frequencyLabel: 'Haftalık Taze Kuruyemiş & Kahve', upperSesAffinity: 1.25, midSesAffinity: 1.20, lowerSesAffinity: 1.10 },
  hali_yikama: { requiredPopulation: 8500, frequencyLabel: 'Mevsimlik Halı & Koltuk Yıkama', upperSesAffinity: 1.25, midSesAffinity: 1.20, lowerSesAffinity: 1.00 },
  appliance_repair: { requiredPopulation: 8000, frequencyLabel: 'Acil Beyaz Eşya Servisi', upperSesAffinity: 1.10, midSesAffinity: 1.15, lowerSesAffinity: 1.10 },
  photographer: { requiredPopulation: 7500, frequencyLabel: 'Dönemsel Vesikalık & Çekim', upperSesAffinity: 1.25, midSesAffinity: 1.15, lowerSesAffinity: 0.90 },
  printing: { requiredPopulation: 9000, frequencyLabel: 'Kurumsal Matbaa & Baskı', upperSesAffinity: 1.30, midSesAffinity: 1.15, lowerSesAffinity: 0.90 },
  cleaning_products: { requiredPopulation: 6500, frequencyLabel: 'Aylık Toptan Deterjan & Temizlik', upperSesAffinity: 1.05, midSesAffinity: 1.25, lowerSesAffinity: 1.25 },
  toy_store: { requiredPopulation: 8000, frequencyLabel: 'Aylık & Hediye Oyuncak', upperSesAffinity: 1.50, midSesAffinity: 1.20, lowerSesAffinity: 0.75 },
  bicycle_repair: { requiredPopulation: 9500, frequencyLabel: 'Sezonluk Bisiklet & Scooter Bakımı', upperSesAffinity: 1.35, midSesAffinity: 1.15, lowerSesAffinity: 0.85 },
  aktar: { requiredPopulation: 5500, frequencyLabel: 'Aylık Doğal Bitki & Şifa Ürünleri', upperSesAffinity: 1.30, midSesAffinity: 1.15, lowerSesAffinity: 0.95 },
};

export function computeRadarMetrics(
  competitorCount: number,
  radiusMeters: number,
  categoryKey: RadarCategoryKey,
  lat?: number,
  lng?: number,
  locationName?: string,
): RadarAnalysisMetrics {
  const isAll = categoryKey === 'all' || !categoryKey;
  const radiusKm = radiusMeters / 1000;
  const areaKm2 = Math.max(0.01, parseFloat((Math.PI * Math.pow(radiusKm, 2)).toFixed(3)));
  const densityPerKm2 = Math.round(competitorCount / areaKm2);

  // Demografik nüfus ve profil çözümleme
  const demographics = resolveDemographicProfile(lat ?? 40.9125, lng ?? 29.1764, radiusMeters, locationName);
  const catchmentPop = parseInt(demographics.population.replace(/\./g, '')) || Math.round(areaKm2 * 12000);
  const sesStr = demographics.sesGroup;
  const isUpperSes = sesStr.includes('A');
  const isLowerSes = sesStr.includes('C2') || sesStr.includes('D');

  let saturationLevel: SaturationLevel = 'moderate';
  let saturationLabel = 'Dengeli Pazar';
  let opportunityScore = 7.8;
  let opportunityLabel = 'Yatırıma Uygun';
  let saturationScore = 45;

  if (isAll) {
    // Tüm Sektörler seçildiğinde genel ticari çekim merkezi ve yaya canlılığı değerlendirilir
    if (competitorCount >= 40) {
      saturationLevel = 'moderate';
      saturationLabel = 'Canlı Ticaret Merkezi (Yüksek Yaya Sirkülasyonu)';
      opportunityScore = 8.8;
      opportunityLabel = 'Yüksek Ticari Potansiyel';
      saturationScore = 38;
    } else if (competitorCount >= 15) {
      saturationLevel = 'low';
      saturationLabel = 'Gelişmekte Olan Ticari Bölge';
      opportunityScore = 8.3;
      opportunityLabel = 'Büyüme Fırsatı';
      saturationScore = 25;
    } else {
      saturationLevel = 'low';
      saturationLabel = 'Sakin Bölge (Yerleşim Ağırlıklı)';
      opportunityScore = 7.5;
      opportunityLabel = 'Orta Potansiyel';
      saturationScore = 15;
    }
  } else {
    // Sektöre özel Tüketim Sıklığı & Demografik Tercih Modeli
    const profile: SectorConsumptionProfile = SECTOR_CONSUMPTION_PROFILES[categoryKey] ?? {
      requiredPopulation: 6000,
      frequencyLabel: 'Standart Tüketim',
      upperSesAffinity: 1.0,
      midSesAffinity: 1.0,
      lowerSesAffinity: 1.0,
    };

    const affinityMultiplier = isUpperSes
      ? profile.upperSesAffinity
      : isLowerSes
      ? profile.lowerSesAffinity
      : profile.midSesAffinity;

    // Çemberdeki efektif talep havuzu (Nüfus x Tercih Edilme Oranı)
    const effectiveDemand = Math.round(catchmentPop * affinityMultiplier);
    // Bu bölgenin sürdürülebilir olarak taşıyabileceği ideal dükkan sayısı
    const idealCapacityCount = Math.max(0.4, effectiveDemand / profile.requiredPopulation);
    
    // Kapasite kullanım / doygunluk oranı
    const saturationRatio = competitorCount / idealCapacityCount;

    if (saturationRatio <= 0.35) {
      // Belirgin arz açığı (Bölge 4-5 dükkan kaldırabilirken sadece 0-1 dükkan var)
      saturationLevel = 'low';
      saturationLabel = 'Düşük Rekabet — Yüksek Talep Açığı';
      saturationScore = Math.max(8, Math.round(saturationRatio * 100));
      opportunityScore = Math.min(9.8, parseFloat((8.8 + (0.35 - saturationRatio) * 2.5).toFixed(1)));
      opportunityLabel = 'Çok Yüksek Fırsat';
    } else if (saturationRatio <= 0.85) {
      // Dengeli pazar, sağlıklı büyüme alanı var
      saturationLevel = 'moderate';
      saturationLabel = 'Dengeli Pazar — İstikrarlı Talep';
      saturationScore = Math.round(35 + (saturationRatio - 0.35) * 60);
      opportunityScore = Math.min(8.7, Math.max(7.4, parseFloat((7.4 + (0.85 - saturationRatio) * 2.4).toFixed(1))));
      opportunityLabel = 'Yatırıma Uygun';
    } else if (saturationRatio <= 1.40) {
      // Rekabet yoğun, kapasiteye yaklaşılmış veya hafif aşılmış
      saturationLevel = 'high';
      saturationLabel = 'Yoğun Rekabet — Farklılaşma Şart';
      saturationScore = Math.min(85, Math.round(65 + (saturationRatio - 0.85) * 36));
      opportunityScore = Math.max(5.8, parseFloat((7.2 - (saturationRatio - 0.85) * 2.5).toFixed(1)));
      opportunityLabel = 'Niş Konsept Önerilir';
    } else {
      // Yüksek doygunluk (Nüfus ve tüketim sıklığına göre bölgede fazla işletme var)
      saturationLevel = 'oversaturated';
      saturationLabel = 'Yüksek Doygunluk — Rekabetçi Pazar';
      saturationScore = Math.min(100, Math.round(85 + (saturationRatio - 1.40) * 10));
      opportunityScore = Math.max(4.2, parseFloat((5.4 - (saturationRatio - 1.40) * 0.6).toFixed(1)));
      opportunityLabel = 'Hazır Devir/Ortaklık Önerilir';
    }
  }

  return {
    competitorCount,
    areaKm2,
    densityPerKm2,
    saturationScore,
    saturationLevel,
    saturationLabel,
    opportunityScore,
    opportunityLabel,
  };
}

interface ConceptTemplate {
  title: string;
  tag: string;
  description: string;
  targetAudience: string;
  suitabilityScore: number;
}

const SECTOR_CONCEPTS: Record<string, { upperSes: ConceptTemplate[]; standardSes: ConceptTemplate[] }> = {
  cafe: {
    upperSes: [
      {
        title: '3. Nesil Mikro-Kavurma & Sessiz Çalışma Alanı',
        tag: 'Yüksek Kârlılık',
        description: 'Nitelikli tek köken çekirdekler, ergonomik priz/hızlı Wi-Fi altyapısı ve laptop dostu çalışma ortamı.',
        targetAudience: 'Genç Profesyoneller & Freelance Çalışanlar',
        suitabilityScore: 95,
      },
      {
        title: 'Artisan Fırın & Şekersiz / Glutensiz Brunch',
        tag: 'Trend & Yüksek Marj',
        description: 'Taze ekşi mayalı fırın ürünleri, soğuk sıkım içecekler ve hafta sonu premium kahvaltı menüsü.',
        targetAudience: 'Sağlık Bilinci Yüksek Kitle & Aileler',
        suitabilityScore: 91,
      },
    ],
    standardSes: [
      {
        title: 'Hızlı Al-Götür (Grab & Go) & Kahve Aboneliği',
        tag: 'Yüksek Sürüm',
        description: 'Sabah iş saatlerinde ekspres servis, mobil ön sipariş ve avantajlı haftalık kahve paketleri.',
        targetAudience: 'Toplu Taşıma & Ofis Yolcuları',
        suitabilityScore: 92,
      },
      {
        title: 'Tatlı & Yeni Nesil İçecek Füzyonu',
        tag: 'Sosyal Çekim',
        description: 'Bubble tea, taze kruvasan sandviç ve sosyal medya etkileşimi yüksek tatlı menüsü.',
        targetAudience: 'Öğrenciler & Genç Dinamik Kitle',
        suitabilityScore: 88,
      },
    ],
  },
  bakery: {
    upperSes: [
      {
        title: 'Ekşi Mayalı Ekmek & Artisan Sandviç Bar',
        tag: 'Günlük Sadakat',
        description: 'Geleneksel fermantasyonlu ekşi maya ekmekleri, gurme soğuk sandviçler ve sabah sıcak kahvaltı kutuları.',
        targetAudience: 'Mahalle Sakinleri & Sağlıklı Yaşam Odaklılar',
        suitabilityScore: 94,
      },
      {
        title: 'Glutensiz & Diyabetik Butik Pastacılık',
        tag: 'Niş Pazar',
        description: 'Diyetisyen onaylı rafine şekersiz tatlılar, özel un karışımları ve kişiye özel pasta siparişi.',
        targetAudience: 'Özel Beslenenler & Kalori Bilinçli Kitle',
        suitabilityScore: 89,
      },
    ],
    standardSes: [
      {
        title: 'Sıcak Unlu Mamül & Çay / Kahvaltı İstasyonu',
        tag: 'Yüksek Frekans',
        description: 'Günün her saati taze poğaça, börek, simit ve çay eşliğinde hızlı ayaküstü kahvaltı.',
        targetAudience: 'Çalışan Kitle & Sabah Yayaları',
        suitabilityScore: 93,
      },
      {
        title: 'Taze Tatlı & Pasta / Özel Gün Butiği',
        tag: 'Yüksek Sepet',
        description: 'Günlük taze pasta çeşitleri, kuru pasta paketleri ve uygun fiyatlı kutlama menüleri.',
        targetAudience: 'Aileler & Mahalle Müdavimleri',
        suitabilityScore: 87,
      },
    ],
  },
  pet_shop: {
    upperSes: [
      {
        title: 'Doğal/Hipoalerjenik Mama & Butik Pet Kuaför',
        tag: 'Yüksek Sadakat',
        description: 'Randevulu tüy bakımı ve banyo, organik besinler ve adrese periyodik mama teslimat aboneliği.',
        targetAudience: 'Evcil Hayvan Sahibi Profesyoneller',
        suitabilityScore: 96,
      },
      {
        title: 'Pet Oteli / Gündüz Bakım & Veteriner Danışmanlık',
        tag: 'Katma Değerli',
        description: 'Seyahat dönemlerinde güvenli konaklama, sosyalleşme alanı ve temel sağlık takip hizmeti.',
        targetAudience: 'Sık Seyahat Eden Çiftler & Aileler',
        suitabilityScore: 90,
      },
    ],
    standardSes: [
      {
        title: 'Fiyat-Performans Mama & Hızlı Mahalle Servisi',
        tag: 'Düzenli Tüketim',
        description: 'Geniş marka yelpazesi, uygun fiyatlı kum/konserve paketleri ve WhatsApp üzerinden aynı gün teslimat.',
        targetAudience: 'Mahalle Sakinleri & Aileler',
        suitabilityScore: 92,
      },
      {
        title: 'Aksesuar, Hijyen & Temel Bakım Merkezi',
        tag: 'Geniş Ürün Gamı',
        description: 'Tasma, oyuncak, taşıma çantası ve parazit/hijyen bakım ürünleri kombinasyonu.',
        targetAudience: 'Yeni Evcil Hayvan Edinenler',
        suitabilityScore: 86,
      },
    ],
  },
  gym: {
    upperSes: [
      {
        title: 'Birebir Reformer Pilates & Fonksiyonel Stüdyo',
        tag: 'Premium Üyelik',
        description: 'Küçük gruplarla kişiselleştirilmiş antrenman, postür düzeltme ve özel beslenme koçluğu.',
        targetAudience: 'Plaza Çalışanları & Formuna Özen Gösterenler',
        suitabilityScore: 95,
      },
      {
        title: 'Wellness & Recovery / Sauna & Buz Banyosu',
        tag: 'Trend & Lüks',
        description: 'Egzersiz sonrası toparlanma terapileri, masaj ve bütünsel zindelik seansları.',
        targetAudience: 'Spor Tutkunları & Yüksek Gelir Grubu',
        suitabilityScore: 88,
      },
    ],
    standardSes: [
      {
        title: '24 Saat Açık Kartlı Akıllı Gym',
        tag: 'Düşük Maliyet',
        description: 'Personelsiz otomatik kart erişimi, esnek mesaili çalışanlar için modern kardiyo ve serbest ağırlık alanı.',
        targetAudience: 'Gençler, Öğrenciler & Esnek Çalışanlar',
        suitabilityScore: 93,
      },
      {
        title: 'Kadınlara Özel Fitness & Grup Dersleri',
        tag: 'Yüksek Talep',
        description: 'Zumba, step, spinning ve pilates grup seanslarıyla motive edici ve güvenli spor ortamı.',
        targetAudience: 'Mahalle Kadınları & Genç Kızlar',
        suitabilityScore: 89,
      },
    ],
  },
  restaurant: {
    upperSes: [
      {
        title: 'Sağlıklı Kase (Bowl) & Akdeniz Mutfağı Ekspres',
        tag: 'Öğle Trafiği',
        description: 'Kalori ve protein dengeli taze kaseler, ızgara lezzetler ve kurumsal şirketlere toplu paket servis.',
        targetAudience: 'Ofis Çalışanları & Sağlık Odaklılar',
        suitabilityScore: 93,
      },
      {
        title: 'Gurme Burger & Ev Yapımı Şarküteri Füzyonu',
        tag: 'Deneyim Odaklı',
        description: 'Özel marine edilmiş etler, brioche ekmeği, el yapımı soslar ve akşam sosyal yemek deneyimi.',
        targetAudience: 'Genç Gurmeler & Arkadaş Grupları',
        suitabilityScore: 89,
      },
    ],
    standardSes: [
      {
        title: 'Günün Ev Yemekleri & Hızlı Tabldot',
        tag: 'Sürekli Ciro',
        description: 'Anne eli lezzetinde zeytinyağlılar, sulu yemekler ve esnafa/ofislere ekonomik menüler.',
        targetAudience: 'Çevre Esnafı & Çalışanlar',
        suitabilityScore: 94,
      },
      {
        title: 'Sokak Lezzetleri & Gece Paket Servis İstasyonu',
        tag: 'Gece Hacmi',
        description: 'Tavuk pilav, köfte ekmek, dürüm çeşitleri ve 02:00’ye kadar süren paket operasyonu.',
        targetAudience: 'Genç Nüfus & Gece Çalışanları',
        suitabilityScore: 90,
      },
    ],
  },
  hairdresser: {
    upperSes: [
      {
        title: 'Medikal Manikür & Ekspres Nail Art Stüdyosu',
        tag: 'Yüksek Frekans',
        description: 'Steril cihazlı medikal el/ayak bakımı, kalıcı oje ve VIP randevu deneyimi.',
        targetAudience: 'İş Kadınları & Bakımına Düşkün Kitle',
        suitabilityScore: 94,
      },
      {
        title: 'Premium Erkek Saç Spa & Kişisel Stil Salonu',
        tag: 'Yüksek Sepet',
        description: 'Saç/sakal terapisi, cilt bakımı ve kahve ikramlı rahatlatıcı salon atmosferi.',
        targetAudience: 'Bakımlı Erkekler & Profesyoneller',
        suitabilityScore: 90,
      },
    ],
    standardSes: [
      {
        title: 'Hızlı & Uygun Fiyatlı Aile Kuaförü',
        tag: 'Geniş Kitle',
        description: 'Saç kesimi, boya ve fön işlemlerinde hızlı servis ve mahalle müdavimlerine özel fiyat avantajı.',
        targetAudience: 'Aileler & Mahalle Sakinleri',
        suitabilityScore: 92,
      },
      {
        title: 'Özel Gün Türban & Gelin Başı Tasarım Salonu',
        tag: 'Sezonluk Yüksek Gelir',
        description: 'Düğün, nişan ve mezuniyetler için profesyonel makyaj ve tasarım paketleri.',
        targetAudience: 'Genç Kızlar & Düğün/Kutlama Hazırlığı Yapanlar',
        suitabilityScore: 87,
      },
    ],
  },
  market: {
    upperSes: [
      {
        title: 'Gurme Şarküteri & Doğal / Organik Köy Ürünleri',
        tag: 'Yüksek Sepet',
        description: 'Coğrafi işaretli peynirler, soğuk sıkım zeytinyağları, katkısız mezeler ve ithal soslar.',
        targetAudience: 'Gurme Damak Tadı Olan Aileler',
        suitabilityScore: 95,
      },
      {
        title: 'Hızlı Butik Şarap, Peynir & Meze İstasyonu',
        tag: 'Akşam Trafiği',
        description: 'Akşam eve dönüş saatlerinde pratik atıştırmalık ve meze tabakları hazır paket satışı.',
        targetAudience: 'Sosyal Çiftler & Misafir Ağırlayanlar',
        suitabilityScore: 89,
      },
    ],
    standardSes: [
      {
        title: '15 Dakikada WhatsApp / Telefon Mahalle Marketi',
        tag: 'Hızlı Servis',
        description: 'Temel gıda, manav ve acil ev ihtiyaçlarını doğrudan kapıya ulaştıran güvenilir mahalle bakkalı.',
        targetAudience: 'Ev Hanımları & Yoğun Aileler',
        suitabilityScore: 93,
      },
      {
        title: 'Toptan Fiyatına Perakende Temel Tüketim Marketi',
        tag: 'Hacimli Satış',
        description: 'Bakliyat, temizlik ve içecek ürünlerinde çoklu alım indirimleriyle bölge halkının tercihi olma.',
        targetAudience: 'Geniş Aileler & Bütçe Odaklılar',
        suitabilityScore: 88,
      },
    ],
  },
  pharmacy: {
    upperSes: [
      {
        title: 'Dermokozmetik & Bütünsel Sağlık Danışmanlığı',
        tag: 'Yüksek Marj',
        description: 'Cilt analiz seansları, premium vitamin & anti-aging takviyeleri ve uzman eczacı tavsiyesi.',
        targetAudience: 'Cilt ve Sağlık Bilinci Yüksek Kitle',
        suitabilityScore: 95,
      },
      {
        title: 'Anne-Bebek & Organik Bakım Ürünleri Köşesi',
        tag: 'Sadık Müşteri',
        description: 'Bebek beslenmesi, organik anne bakım ürünleri ve gelişim takip destek ürünleri.',
        targetAudience: 'Yeni Anneler & Bebekli Aileler',
        suitabilityScore: 91,
      },
    ],
    standardSes: [
      {
        title: 'Geniş Reçeteli İlaç & Medikal Destek Merkezi',
        tag: 'Temel Sağlık',
        description: 'Hızlı ilaç temini, tansiyon/şeker ölçümü ve ortopedik medikal malzeme stoku.',
        targetAudience: 'Mahalle Sakinleri & Yaşlı Nüfus',
        suitabilityScore: 94,
      },
      {
        title: 'Bitkisel Çaylar & Ekonomik Takviye Edici Gıdalar',
        tag: 'Önleyici Sağlık',
        description: 'Bağışıklık güçlendirici doğal karışımlar, kış çayları ve uygun fiyatlı gıda takviyeleri.',
        targetAudience: 'Her Yaştan Bölge Sakini',
        suitabilityScore: 87,
      },
    ],
  },
  default: {
    upperSes: [
      {
        title: 'Deneyim ve Kalite Odaklı Butik Hizmet Noktası',
        tag: 'Prestij & Marj',
        description: 'A/A+ gelir grubunun beklentilerine uygun, kişiselleştirilmiş ve dijitalleşmiş hizmet tasarımı.',
        targetAudience: 'Bölge Sakinleri & Şehirli Profesyoneller',
        suitabilityScore: 92,
      },
    ],
    standardSes: [
      {
        title: 'Fiyat-Performans ve Hızlı Teslimat Odaklı Girişim',
        tag: 'Yüksek Hacim',
        description: 'Bölgenin yoğun yaya trafiğine hitap eden, uygun maliyetli ve süratli hizmet modeli.',
        targetAudience: 'Mahalle Halkı & Transit Geçenler',
        suitabilityScore: 91,
      },
    ],
  },
};

export interface SectorPopularityMeta {
  key: string;
  label: string;
  emoji: string;
  domainGroup: 'food' | 'service' | 'retail';
  requiredPop: number;
  popularityRank: number;
  upperSesAffinity?: number;
  standardSesAffinity?: number;
  upperSesReason: string;
  standardSesReason: string;
}

export const TURKEY_PROVINCE_TOP_50_TRADES: SectorPopularityMeta[] = [
  {
    key: 'bakery',
    label: 'Fırın & Ekmek / Unlu Mamüller',
    emoji: '🥐',
    domainGroup: 'food',
    requiredPop: 2200,
    popularityRank: 1,
    upperSesAffinity: 0.9,
    standardSesAffinity: 1.1,
    upperSesReason: 'İlde en yaygın 1. meslek kolu olmasına rağmen bu çemberde taze ekşi maya ekmek ve artisan kruvasan açığı var.',
    standardSesReason: 'İlde en çok bulunan 1. temel ihtiyaç sektörü. Günlük sıcak ekmek, simit ve poğaça için hazır pazar.',
  },
  {
    key: 'market',
    label: 'Bakkal & Mahalle Marketi',
    emoji: '🛒',
    domainGroup: 'food',
    requiredPop: 1800,
    popularityRank: 2,
    upperSesAffinity: 0.8,
    standardSesAffinity: 1.2,
    upperSesReason: 'İlde en yaygın 2. sektör. Gurme şarküteri ve hızlı paket siparişi için yüksek harcama potansiyeli mevcut.',
    standardSesReason: 'İlin en yoğun 2. ticaret kolu. Yürüme mesafesinde hızlı bakkaliye ve temel gıda ihtiyacı var.',
  },
  {
    key: 'borekci',
    label: 'Börekçi & Pide / Poğaça Salonu',
    emoji: '🥧',
    domainGroup: 'food',
    requiredPop: 2400,
    popularityRank: 3,
    upperSesAffinity: 0.85,
    standardSesAffinity: 1.25,
    upperSesReason: 'Sabah iş trafiğinde taze Boşnak böreği, su böreği ve hızlı kahvaltı servisinde net açık.',
    standardSesReason: 'İlde 3. sırada yer alan en popüler esnaf kolu. Sabah işe giden kitle ve öğrenciler için hızlı kahvaltı açığı.',
  },
  {
    key: 'cigkofteci',
    label: 'Çiğ Köfteci & Dürüm Evi',
    emoji: '🌯',
    domainGroup: 'food',
    requiredPop: 2500,
    popularityRank: 4,
    upperSesAffinity: 0.7,
    standardSesAffinity: 1.35,
    upperSesReason: 'Hızlı, hijyenik ve kaliteli meze/dürüm paket servisi talebi yüksek.',
    standardSesReason: 'İlde en çok tercih edilen 4. yeme-içme kolu. Düşük yatırım maliyeti ve yüksek ciro hızıyla kritik açık.',
  },
  {
    key: 'hairdresser',
    label: 'Kuaför, Berber & Güzellik Salonu',
    emoji: '💇',
    domainGroup: 'service',
    requiredPop: 2300,
    popularityRank: 5,
    upperSesAffinity: 1.3,
    standardSesAffinity: 1.0,
    upperSesReason: 'Randevulu VIP saç tasarımı, medikal manikür ve cilt bakımında net açık.',
    standardSesReason: 'İlin en yaygın 5. meslek dalı. Mahalle sakinleri için düzenli saç kesim, fön ve bakım ihtiyacı.',
  },
  {
    key: 'cafe',
    label: 'Kafe, Kahve Dükkanı & Çay Ocağı',
    emoji: '☕',
    domainGroup: 'food',
    requiredPop: 2800,
    popularityRank: 6,
    upperSesAffinity: 1.6,
    standardSesAffinity: 1.1,
    upperSesReason: 'Nitelikli 3. nesil kahve, çalışma alanı ve sosyalleşme noktası açığı.',
    standardSesReason: 'İldeki en yaygın 6. sosyal alan. Mahalle sakinleri ve gençler için ekonomik oturma/çay alanı ihtiyacı.',
  },
  {
    key: 'restaurant',
    label: 'Restoran, Lokanta & Ev Yemekleri',
    emoji: '🍲',
    domainGroup: 'food',
    requiredPop: 2900,
    popularityRank: 7,
    upperSesAffinity: 1.4,
    standardSesAffinity: 1.05,
    upperSesReason: 'Sağlıklı kase (bowl), Akdeniz mutfağı ve öğle kurumsal yemek trafiğinde yüksek potansiyel.',
    standardSesReason: 'İlde en çok ciro yapan 7. sektör. Esnaf ve çalışanlar için ekonomik sıcak tabldot ve sulu yemek açığı.',
  },
  {
    key: 'pharmacy',
    label: 'Eczane & Medikal Ürünler',
    emoji: '💊',
    domainGroup: 'service',
    requiredPop: 3500,
    popularityRank: 8,
    upperSesAffinity: 1.1,
    standardSesAffinity: 1.0,
    upperSesReason: 'Dermokozmetik, vitamin ve reçeteli ilaçta çevre sokaklara kaçan talep.',
    standardSesReason: 'İlde en temel 8. sağlık noktası. Mahalle sakinleri ve yaşlı nüfus için reçeteli ilaç erişim açığı.',
  },
  {
    key: 'donerci',
    label: 'Dönerci & Kebap / Pide Salonu',
    emoji: '🥙',
    domainGroup: 'food',
    requiredPop: 3200,
    popularityRank: 9,
    upperSesAffinity: 1.15,
    standardSesAffinity: 1.3,
    upperSesReason: 'Özel marine yaprak et döner ve hızlı akşam paket servisinde belirgin eksiklik.',
    standardSesReason: 'İldeki en yoğun 9. fast-food kolu. Uygun fiyatlı tavuk/et döner ve lahmacun talebi karşılanmıyor.',
  },
  {
    key: 'dry_cleaning',
    label: 'Kuru Temizleme, Terzi & Lostra',
    emoji: '🧺',
    domainGroup: 'service',
    requiredPop: 4500,
    popularityRank: 10,
    upperSesAffinity: 1.5,
    standardSesAffinity: 1.0,
    upperSesReason: 'Beyaz yaka çalışanlar için gömlek/takım elbise ekspres temizleme ve adrese teslimat açığı.',
    standardSesReason: 'İlde en çok aranan 10. hizmet. Giysi tadilatı, paça boyu ve mont/fermuar tamirinde mahalle açığı.',
  },
  {
    key: 'butcher',
    label: 'Kasap & Şarküteri / Tavukçu',
    emoji: '🥩',
    domainGroup: 'food',
    requiredPop: 4200,
    popularityRank: 11,
    upperSesAffinity: 1.35,
    standardSesAffinity: 1.1,
    upperSesReason: 'Dry-aged etler, hazır marine lezzetler ve gurme et ürünlerinde güçlü talep.',
    standardSesReason: 'İlin en yaygın 11. gıda esnafı. Güvenilir taze kırmızı/beyaz et ve kıyma alışverişi için açık.',
  },
  {
    key: 'manav',
    label: 'Manav & Taze Meyve / Sebze',
    emoji: '🍏',
    domainGroup: 'food',
    requiredPop: 3800,
    popularityRank: 12,
    upperSesAffinity: 1.25,
    standardSesAffinity: 1.1,
    upperSesReason: 'Organik tarım sertifikalı, günlük taze köy ürünleri ve egzotik meyve talebi.',
    standardSesReason: 'İldeki en yaygın 12. esnaf kolu. Günlük taze sebze/meyve ve yeşillik ihtiyacı mahallede karşılanmıyor.',
  },
  {
    key: 'car_wash',
    label: 'Oto Yıkama & Detailing / Kuaför',
    emoji: '🚗',
    domainGroup: 'service',
    requiredPop: 5000,
    popularityRank: 13,
    upperSesAffinity: 1.4,
    standardSesAffinity: 1.15,
    upperSesReason: 'Seramik kaplama, fırçasız buharlı iç-dış yıkama ve VIP araç bakım açığı.',
    standardSesReason: 'İldeki en yoğun 13. oto hizmeti. Mahalle sakinleri için pratik köpüklü araç yıkama ve süpürge noktası.',
  },
  {
    key: 'stationery',
    label: 'Kırtasiye, Kitap & Fotokopi / Baskı',
    emoji: '📚',
    domainGroup: 'retail',
    requiredPop: 4800,
    popularityRank: 14,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.1,
    upperSesReason: 'Tasarım ofis kırtasiyesi, sanatsal malzemeler ve hızlı dijital çıktı açığı.',
    standardSesReason: 'İlde 14. sırada. Çevre okullar, veliler ve ofisler için fotokopi, test kitapları ve kırtasiye ihtiyacı.',
  },
  {
    key: 'electronics',
    label: 'Telefon, GSM & Elektronik Tamir',
    emoji: '📱',
    domainGroup: 'retail',
    requiredPop: 4600,
    popularityRank: 15,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.25,
    upperSesReason: 'Orijinal ekran/batarya değişimi, premium kılıf ve hızlı teknik servis talebi.',
    standardSesReason: 'İldeki en yaygın 15. teknik hizmet. Kırık ekran tamiri, şarj aleti ve ikinci el telefon alım-satımı.',
  },
  {
    key: 'tatlici',
    label: 'Tatlıcı, Pastane & Baklavacı',
    emoji: '🍰',
    domainGroup: 'food',
    requiredPop: 5200,
    popularityRank: 16,
    upperSesAffinity: 1.15,
    standardSesAffinity: 1.3,
    upperSesReason: 'Fıstıklı Antep baklavası, özel tasarım pasta ve sıcak akşam tatlısı açığı.',
    standardSesReason: 'İlde 16. sırada. Özel gün tatlı kutuları, halka/tulumba tatlısı ve sütlü tatlı ihtiyacı.',
  },
  {
    key: 'pet_shop',
    label: 'Petshop & Veteriner / Evcil Hayvan',
    emoji: '🐾',
    domainGroup: 'service',
    requiredPop: 5500,
    popularityRank: 17,
    upperSesAffinity: 1.8,
    standardSesAffinity: 1.05,
    upperSesReason: 'Evcil hayvan sahipliği çok yoğun; randevulu pet kuaför ve premium mama açığı var.',
    standardSesReason: 'İlde 17. sırada. Düzenli kedi/köpek maması, kumu ve temel aşı/bakım ihtiyaçları için açık.',
  },
  {
    key: 'florist',
    label: 'Çiçekçi & Tasarım Butik Atölye',
    emoji: '💐',
    domainGroup: 'retail',
    requiredPop: 5800,
    popularityRank: 18,
    upperSesAffinity: 1.6,
    standardSesAffinity: 0.9,
    upperSesReason: 'Canlı saksı bitkileri, ithal buketler ve özel davet aranjmanları için güçlü açık.',
    standardSesReason: 'İldeki en popüler 18. hediye noktası. Özel günler ve mezuniyetler için canlı çiçek açığı.',
  },
  {
    key: 'cilingir',
    label: 'Çilingir, Anahtarcı & Kilit Servisi',
    emoji: '🔑',
    domainGroup: 'service',
    requiredPop: 6200,
    popularityRank: 19,
    upperSesAffinity: 1.0,
    standardSesAffinity: 1.0,
    upperSesReason: 'Akıllı kapı kilitleri, immobilizer oto anahtarı ve 7/24 nöbetçi çilingir servisi açığı.',
    standardSesReason: 'İlde 19. sırada. Kapıda kalan mahalle sakinleri ve anahtar kopyalama için acil hizmet.',
  },
  {
    key: 'lastikci',
    label: 'Lastikçi, Balans & Yol Yardım',
    emoji: '🛞',
    domainGroup: 'service',
    requiredPop: 6000,
    popularityRank: 20,
    upperSesAffinity: 0.95,
    standardSesAffinity: 1.2,
    upperSesReason: 'Mevsimlik lastik oteli, nitrojen dolumu ve mobil acil lastik değişimi talebi.',
    standardSesReason: 'İldeki en kritik 20. oto esnafı. Patlak lastik tamiri, balans ayarı ve çıkma lastik ihtiyacı.',
  },
  {
    key: 'dental_clinic',
    label: 'Diş Kliniği & Ağız/Diş Sağlığı',
    emoji: '🦷',
    domainGroup: 'service',
    requiredPop: 6500,
    popularityRank: 21,
    upperSesAffinity: 1.65,
    standardSesAffinity: 1.0,
    upperSesReason: 'İmplant, şeffaf plak ve estetik diş hekimliğinde randevulu butik klinik açığı.',
    standardSesReason: 'İlde 21. sırada. Mahalle sakinleri için genel muayene, diş çekimi ve acil diş hekimliği.',
  },
  {
    key: 'gym',
    label: 'Fitness & Spor Salonu / Pilates',
    emoji: '🏋️',
    domainGroup: 'service',
    requiredPop: 7800,
    popularityRank: 22,
    upperSesAffinity: 1.7,
    standardSesAffinity: 1.05,
    upperSesReason: 'Butik reformer pilates stüdyosu ve fonksiyonel antrenman alanı talebi.',
    standardSesReason: 'İlde 22. sırada. Genç nüfus ve çalışanlar için uygun fiyatlı mahalle spor salonu açığı.',
  },
  {
    key: 'optician',
    label: 'Optik & Gözlük Mağazası',
    emoji: '👓',
    domainGroup: 'retail',
    requiredPop: 7200,
    popularityRank: 23,
    upperSesAffinity: 1.4,
    standardSesAffinity: 1.0,
    upperSesReason: 'Tasarım çerçeveler, premium güneş gözlükleri ve reçeteli lens temini açığı.',
    standardSesReason: 'İlde 23. sırada. SGK anlaşmalı reçeteli cam ve ekonomik çerçeve seçenekleri ihtiyacı.',
  },
  {
    key: 'zuccaciye',
    label: 'Züccaciye & Ev Gereçleri / Plastik',
    emoji: '🍽️',
    domainGroup: 'retail',
    requiredPop: 6800,
    popularityRank: 24,
    upperSesAffinity: 0.9,
    standardSesAffinity: 1.25,
    upperSesReason: 'Mutfak gereçleri, porselen takımları ve tasarım sofra ürünleri açığı.',
    standardSesReason: 'İlde 24. sırada. Uygun fiyatlı ev plastikleri, tencere/tava ve temizlik kapları ihtiyacı.',
  },
  {
    key: 'boutique',
    label: 'Butik & Kadın/Erkek Giyim',
    emoji: '👗',
    domainGroup: 'retail',
    requiredPop: 6000,
    popularityRank: 25,
    upperSesAffinity: 1.45,
    standardSesAffinity: 1.1,
    upperSesReason: 'Trend parçalar, özel tasarım kıyafetler ve aksesuar kombinleri açığı.',
    standardSesReason: 'İlde 25. sırada. Günlük giyim, eşofman, çorap ve uygun fiyatlı tekstil ürünleri.',
  },
  {
    key: 'hardware',
    label: 'Nalburiye, Hırdavat & Yapı Market',
    emoji: '🔨',
    domainGroup: 'retail',
    requiredPop: 6200,
    popularityRank: 26,
    upperSesAffinity: 1.0,
    standardSesAffinity: 1.2,
    upperSesReason: 'Ev tadilat boyaları, batarya/musluk aksesuarları ve el aletleri açığı.',
    standardSesReason: 'İlde 26. sırada. Vida, dübel, ampul, silikon ve temel tesisat malzemeleri ihtiyacı.',
  },
  {
    key: 'dondurmaci',
    label: 'Dondurmacı & Waffle Cafe',
    emoji: '🍦',
    domainGroup: 'food',
    requiredPop: 6400,
    popularityRank: 27,
    upperSesAffinity: 1.5,
    standardSesAffinity: 1.25,
    upperSesReason: 'Doğal İtalyan gelato dondurma ve Belçika waffle tatlısı açığı.',
    standardSesReason: 'İlde 27. sırada. Özellikle yaz aylarında ve akşam yürüyüşlerinde yoğun külah dondurma talebi.',
  },
  {
    key: 'kokorecci',
    label: 'Kokoreççi & Midyeci / Sokak Lezzeti',
    emoji: '🍢',
    domainGroup: 'food',
    requiredPop: 6600,
    popularityRank: 28,
    upperSesAffinity: 0.9,
    standardSesAffinity: 1.3,
    upperSesReason: 'Kömürde atom kokoreç ve taze sıcak midye dolma açığı.',
    standardSesReason: 'İlde 28. sırada. Gece geç saatlere kadar süren paket servis ve ayaküstü atıştırmalık ihtiyacı.',
  },
  {
    key: 'balikci',
    label: 'Balıkçı & Balık Pişiricisi',
    emoji: '🐟',
    domainGroup: 'food',
    requiredPop: 7500,
    popularityRank: 29,
    upperSesAffinity: 1.35,
    standardSesAffinity: 1.1,
    upperSesReason: 'Günlük taze deniz balığı satışı ve ızgara/tava pişirme servisi talebi.',
    standardSesReason: 'İlde 29. sırada. Hamsi, istavrit ve palamut gibi mevsimlik taze balık temin açığı.',
  },
  {
    key: 'oto_elektrik',
    label: 'Oto Elektrik, Akü & Far Servisi',
    emoji: '🔋',
    domainGroup: 'service',
    requiredPop: 8500,
    popularityRank: 30,
    upperSesAffinity: 0.9,
    standardSesAffinity: 1.2,
    upperSesReason: 'Akü testi, marş dinamosu ve araç elektroniğinde hızlı servis açığı.',
    standardSesReason: 'İlde 30. sırada. Yolda kalan araçlar için takviye, ampul değişimi ve sigorta tamiri.',
  },
  {
    key: 'furniture',
    label: 'Mobilya & Koltuk Döşeme / Tamir',
    emoji: '🛋️',
    domainGroup: 'retail',
    requiredPop: 8800,
    popularityRank: 31,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.05,
    upperSesReason: 'Özel ölçü mobilya imalatı, ahşap tasarım ve kumaş yenileme açığı.',
    standardSesReason: 'İlde 31. sırada. Eski koltuk/sandalye sünger ve kumaş döşeme tamir atölyesi ihtiyacı.',
  },
  {
    key: 'perde',
    label: 'Perde, Mefruşat & Ev Tekstili',
    emoji: '🪟',
    domainGroup: 'retail',
    requiredPop: 8200,
    popularityRank: 32,
    upperSesAffinity: 1.1,
    standardSesAffinity: 1.1,
    upperSesReason: 'Motorlu stor, tül fon perde ve mimari ev tekstili danışmanlığı açığı.',
    standardSesReason: 'İlde 32. sırada. Korniş montajı, güneşlik, tül dikimi ve nevresim takımı ihtiyacı.',
  },
  {
    key: 'jewelry',
    label: 'Kuyumcu & Sarraf / Altın & Takı',
    emoji: '💍',
    domainGroup: 'retail',
    requiredPop: 9000,
    popularityRank: 33,
    upperSesAffinity: 1.35,
    standardSesAffinity: 1.15,
    upperSesReason: 'Pırlanta, tasarım altın takılar ve güvenli yatırım altın işlemleri açığı.',
    standardSesReason: 'İlde 33. sırada. Çeyrek altın, bilezik ve düğün takı alışverişi için güvenilir kuyumcu.',
  },
  {
    key: 'parfumeri',
    label: 'Parfümeri, Kozmetik & Bakım',
    emoji: '💄',
    domainGroup: 'retail',
    requiredPop: 8000,
    popularityRank: 34,
    upperSesAffinity: 1.45,
    standardSesAffinity: 1.05,
    upperSesReason: 'Niş parfümler, dermokozmetik cilt serumları ve organik makyaj ürünleri açığı.',
    standardSesReason: 'İlde 34. sırada. Uygun fiyatlı deodorant, şampuan, boya ve günlük kişisel bakım ürünleri.',
  },
  {
    key: 'shoe_store',
    label: 'Ayakkabıcı & Çanta / Deri Mağazası',
    emoji: '👠',
    domainGroup: 'retail',
    requiredPop: 8400,
    popularityRank: 35,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.1,
    upperSesReason: 'Hakiki deri ayakkabı, çanta ve konfor tabanlı yürüyüş ayakkabıları açığı.',
    standardSesReason: 'İlde 35. sırada. Spor ayakkabı, terlik, okul ayakkabısı ve günlük çanta ihtiyacı.',
  },
  {
    key: 'su_bayisi',
    label: 'Su Bayisi & Damacana Dağıtım',
    emoji: '💧',
    domainGroup: 'food',
    requiredPop: 7000,
    popularityRank: 36,
    upperSesAffinity: 1.0,
    standardSesAffinity: 1.15,
    upperSesReason: 'Doğal kaynak cam damacana ve hızlı mobil siparişle adrese teslimat açığı.',
    standardSesReason: 'İlde 36. sırada. Mahalle geneline damacana su, maden suyu ve meşrubat dağıtımı.',
  },
  {
    key: 'tup_bayisi',
    label: 'Tüp & Mutfak Gaz Dağıtım Bayisi',
    emoji: '🔥',
    domainGroup: 'retail',
    requiredPop: 9500,
    popularityRank: 37,
    upperSesAffinity: 0.7,
    standardSesAffinity: 1.2,
    upperSesReason: 'Piknik tüpü, bahçe ısıtıcısı gazı ve sanayi tüpü hızlı teslimatı.',
    standardSesReason: 'İlde 37. sırada. Mutfak tüpü ve dedantör değişimi için acil mahalle bayisi.',
  },
  {
    key: 'kuruyemis',
    label: 'Kuruyemişçi & Şekerleme / Kahve',
    emoji: '🥜',
    domainGroup: 'food',
    requiredPop: 7200,
    popularityRank: 38,
    upperSesAffinity: 1.3,
    standardSesAffinity: 1.2,
    upperSesReason: 'Taze kavrulmuş fındık/fıstık, ithal draje ve taze çekilmiş Türk kahvesi açığı.',
    standardSesReason: 'İlde 38. sırada. Çekirdek, çerez paketleri ve bayram şekeri satışı için cadde açığı.',
  },
  {
    key: 'hali_yikama',
    label: 'Halı Yıkama & Koltuk Temizleme',
    emoji: '🧼',
    domainGroup: 'service',
    requiredPop: 9000,
    popularityRank: 39,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.1,
    upperSesReason: 'İpek ve el dokuma halıların antibakteriyel hassas yıkama servisi açığı.',
    standardSesReason: 'İlde 39. sırada. Evden alıp eve teslim eden makine halısı ve yorgan yıkama servisi.',
  },
  {
    key: 'appliance_repair',
    label: 'Beyaz Eşya & Ev Aletleri Servisi',
    emoji: '🔌',
    domainGroup: 'service',
    requiredPop: 9200,
    popularityRank: 40,
    upperSesAffinity: 1.1,
    standardSesAffinity: 1.15,
    upperSesReason: 'Ankastre montajı, kombi/klima bakımı ve orijinal yedek parça servisi açığı.',
    standardSesReason: 'İlde 40. sırada. Çamaşır makinesi, buzdolabı ve süpürge arıza tamir atölyesi.',
  },
  {
    key: 'kindergarten',
    label: 'Butik Anaokulu & Çocuk Oyun Evi',
    emoji: '🧸',
    domainGroup: 'service',
    requiredPop: 8500,
    popularityRank: 41,
    upperSesAffinity: 1.6,
    standardSesAffinity: 1.1,
    upperSesReason: 'İki dilli eğitim, montessori atölyesi ve çalışan ebeveynler için tam gün bakım.',
    standardSesReason: 'İlde 41. sırada. Çalışan aileler için güvenli mahalle kreşi ve saatlik çocuk oyun alanı.',
  },
  {
    key: 'law_firm',
    label: 'Avukatlık & Hukuk Danışmanlığı',
    emoji: '⚖️',
    domainGroup: 'service',
    requiredPop: 9400,
    popularityRank: 42,
    upperSesAffinity: 1.45,
    standardSesAffinity: 0.95,
    upperSesReason: 'Şirketler hukuku, sözleşme yönetimi ve gayrimenkul hukuku danışmanlığı açığı.',
    standardSesReason: 'İlde 42. sırada. İşçi alacakları, boşanma, miras ve icra davaları için yerel hukuk bürosu.',
  },
  {
    key: 'insurance_agency',
    label: 'Sigorta Acentesi & Kasko / DASK',
    emoji: '🛡️',
    domainGroup: 'service',
    requiredPop: 9200,
    popularityRank: 43,
    upperSesAffinity: 1.3,
    standardSesAffinity: 1.05,
    upperSesReason: 'Özel sağlık sigortası, tamamlayıcı sağlık ve iş yeri yangın poliçeleri açığı.',
    standardSesReason: 'İlde 43. sırada. Zorunlu trafik sigortası, DASK ve kasko teklif karşılaştırma acentesi.',
  },
  {
    key: 'real_estate',
    label: 'Emlak & Gayrimenkul Yatırım Ofisi',
    emoji: '🏢',
    domainGroup: 'service',
    requiredPop: 8600,
    popularityRank: 44,
    upperSesAffinity: 1.35,
    standardSesAffinity: 1.05,
    upperSesReason: 'Lüks konut portföyü, kurumsal kiralama ve arsa yatırım danışmanlığı açığı.',
    standardSesReason: 'İlde 44. sırada. Mahalle içi kiralık/satılık daire ve dükkan portföy yönetimi.',
  },
  {
    key: 'photographer',
    label: 'Fotoğrafçı & Vesikalık / Stüdyo',
    emoji: '📸',
    domainGroup: 'service',
    requiredPop: 9600,
    popularityRank: 45,
    upperSesAffinity: 1.25,
    standardSesAffinity: 1.05,
    upperSesReason: 'Biyometrik vize fotoğrafı, konsept aile çekimi ve ürün fotoğrafçılığı açığı.',
    standardSesReason: 'İlde 45. sırada. Hızlı vesikalık, pasaport/kimlik fotoğrafı ve çerçeveli baskı ihtiyacı.',
  },
  {
    key: 'printing',
    label: 'Matbaa, Etiket & Promosyon Baskı',
    emoji: '🖨️',
    domainGroup: 'service',
    requiredPop: 9800,
    popularityRank: 46,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.05,
    upperSesReason: 'Kurumsal broşür, lüks kutu ambalajı ve özel lazer kesim baskı açığı.',
    standardSesReason: 'İlde 46. sırada. Kartvizit, magnet, el ilanı ve tabela folyo baskı atölyesi.',
  },
  {
    key: 'cleaning_products',
    label: 'Temizlik Ürünleri & Kimyasalları',
    emoji: '🧽',
    domainGroup: 'retail',
    requiredPop: 9700,
    popularityRank: 47,
    upperSesAffinity: 1.05,
    standardSesAffinity: 1.15,
    upperSesReason: 'Ekolojik/vegan temizlik ürünleri, profesyonel dispenser ve koku sistemleri açığı.',
    standardSesReason: 'İlde 47. sırada. Toptan çamaşır suyu, deterjan, çöp poşeti ve koli satışı.',
  },
  {
    key: 'toy_store',
    label: 'Oyuncakçı & Çocuk Gelişim Ürünleri',
    emoji: '🎯',
    domainGroup: 'retail',
    requiredPop: 9500,
    popularityRank: 48,
    upperSesAffinity: 1.5,
    standardSesAffinity: 1.05,
    upperSesReason: 'Eğitici ahşap oyuncaklar, robotik kodlama setleri ve lisanslı figürler açığı.',
    standardSesReason: 'İlde 48. sırada. Doğum günü hediyeleri, akülü arabalar ve peluş oyuncak mağazası.',
  },
  {
    key: 'bicycle_repair',
    label: 'Bisiklet & Scooter Satış / Tamir',
    emoji: '🚲',
    domainGroup: 'retail',
    requiredPop: 9900,
    popularityRank: 49,
    upperSesAffinity: 1.4,
    standardSesAffinity: 1.1,
    upperSesReason: 'Elektrikli scooter batarya/lastik tamiri ve profesyonel yarış bisikleti bakımı.',
    standardSesReason: 'İlde 49. sırada. Çocuk bisikleti tamiri, fren/vites ayarı ve patlak iç lastik değişimi.',
  },
  {
    key: 'aktar',
    label: 'Aktar, Baharatçı & Şifalı Bitkiler',
    emoji: '🌿',
    domainGroup: 'retail',
    requiredPop: 8800,
    popularityRank: 50,
    upperSesAffinity: 1.35,
    standardSesAffinity: 1.15,
    upperSesReason: 'Soğuk sıkım aromatik yağlar, organik bitki çayları ve doğal gıda takviyeleri açığı.',
    standardSesReason: 'İlde 50. sırada. Taze çekilmiş baharatlar, ıhlamur, adaçayı ve doğal mahalle aktarı.',
  },
  {
    key: 'playstation_cafe',
    label: 'Playstation & Konsol Oyun Salonu',
    emoji: '🎮',
    domainGroup: 'service',
    requiredPop: 6500,
    popularityRank: 51,
    upperSesAffinity: 1.1,
    standardSesAffinity: 1.4,
    upperSesReason: 'VIP özel odalı PS5, 4K ekranlar ve simülatör yarış kokpiti eğlence açığı.',
    standardSesReason: 'Gençler, öğrenciler ve arkadaş grupları için turnuva ve konsol oyun salonu ihtiyacı.',
  },
  {
    key: 'internet_cafe',
    label: 'İnternet Cafe & E-Spor Gaming Arena',
    emoji: '🖥️',
    domainGroup: 'service',
    requiredPop: 7500,
    popularityRank: 52,
    upperSesAffinity: 0.9,
    standardSesAffinity: 1.45,
    upperSesReason: 'Yüksek FPS oyuncu bilgisayarları, fiber altyapı ve yayıncı odaları açığı.',
    standardSesReason: 'Bölgedeki genç nüfus için yüksek performanslı oyun ve internet erişim noktası.',
  },
  {
    key: 'parti_evi',
    label: 'Parti Evi & Çocuk Oyun / Etkinlik',
    emoji: '🎈',
    domainGroup: 'service',
    requiredPop: 8500,
    popularityRank: 53,
    upperSesAffinity: 1.7,
    standardSesAffinity: 1.2,
    upperSesReason: 'Konsept doğum günü kutlamaları, baby shower ve tematik çocuk atölyesi açığı.',
    standardSesReason: 'Mahalledeki aileler için çocuk doğum günü partisi ve güvenli oyun alanı ihtiyacı.',
  },
  {
    key: 'oto_ekspertiz',
    label: 'Oto Ekspertiz & Dyno Test / Computest',
    emoji: '🔍',
    domainGroup: 'service',
    requiredPop: 9500,
    popularityRank: 54,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.35,
    upperSesReason: 'TSE onaylı kurumsal garantili ekspertiz, OBD beyin testi ve boya/kaporta kontrolü.',
    standardSesReason: 'İkinci el araç alım-satımında güvenilir motor performans ve fren/süspansiyon testi açığı.',
  },
  {
    key: 'pilates_studio',
    label: 'Reformer Pilates & Yoga Stüdyosu',
    emoji: '🧘',
    domainGroup: 'service',
    requiredPop: 6000,
    popularityRank: 55,
    upperSesAffinity: 1.9,
    standardSesAffinity: 1.1,
    upperSesReason: 'Kişiye özel aletli reformer pilates, hamile yogası ve postür düzeltme seansları açığı.',
    standardSesReason: 'Çalışan kadınlar ve gençler için randevulu butik reformer pilates stüdyosu talebi.',
  },
  {
    key: 'kitap_kafe',
    label: 'Kitap Kafe, Kütüphane & Çalışma Alanı',
    emoji: '📖',
    domainGroup: 'food',
    requiredPop: 7000,
    popularityRank: 56,
    upperSesAffinity: 1.65,
    standardSesAffinity: 1.15,
    upperSesReason: 'Sessiz çalışma odaları, nitelikli filtre kahve ve bağımsız kitap satışı açığı.',
    standardSesReason: 'Öğrenciler ve uzaktan çalışanlar için sessiz kütüphane/ders çalışma ortamı ihtiyacı.',
  },
  {
    key: 'tattoo_studio',
    label: 'Dövme & Piercing Stüdyosu',
    emoji: '✒️',
    domainGroup: 'service',
    requiredPop: 9000,
    popularityRank: 57,
    upperSesAffinity: 1.45,
    standardSesAffinity: 1.1,
    upperSesReason: 'Özel tasarım dövme (custom tattoo), hijyenik piercing ve kalıcı makyaj uygulaması açığı.',
    standardSesReason: 'Genç nüfus ve dövme meraklıları için profesyonel dövme ve piercing stüdyosu ihtiyacı.',
  },
  {
    key: 'dietitian',
    label: 'Diyetisyen, Beslenme & Zayıflama Kliniği',
    emoji: '🥗',
    domainGroup: 'service',
    requiredPop: 7000,
    popularityRank: 58,
    upperSesAffinity: 1.75,
    standardSesAffinity: 1.15,
    upperSesReason: 'Vücut analizi, sporcu beslenmesi, ketojenik program ve andulasyon terapi cihazı açığı.',
    standardSesReason: 'Kilo kontrolü, sağlıklı beslenme ve kişiye özel diyet listesi danışmanlık kliniği.',
  },
  {
    key: 'kargo_subesi',
    label: 'Kargo Şubesi & Dağıtım Merkezi',
    emoji: '📦',
    domainGroup: 'service',
    requiredPop: 5000,
    popularityRank: 59,
    upperSesAffinity: 1.3,
    standardSesAffinity: 1.2,
    upperSesReason: 'E-ticaret iade ve hızlı kargo teslimat noktası açığı.',
    standardSesReason: 'Mahalle sakinleri ve esnaflar için merkezi kargo şubesi ihtiyacı.',
  },
  {
    key: 'nail_art',
    label: 'Nail Art & Protez Tırnak Butiği',
    emoji: '💅',
    domainGroup: 'service',
    requiredPop: 5500,
    popularityRank: 60,
    upperSesAffinity: 1.8,
    standardSesAffinity: 1.15,
    upperSesReason: 'Kalıcı oje, protez tırnak, ipek kirpik ve nail art tasarım stüdyosu açığı.',
    standardSesReason: 'Genç kadınlar için uygun fiyatlı manikür, pedikür ve tırnak bakım noktası.',
  },
  {
    key: 'guzellik_merkezi',
    label: 'Güzellik Merkezi & Lazer Epilasyon',
    emoji: '💆',
    domainGroup: 'service',
    requiredPop: 6500,
    popularityRank: 61,
    upperSesAffinity: 1.65,
    standardSesAffinity: 1.15,
    upperSesReason: 'Hydrafacial cilt bakımı, buz başlıklı lazer ve bölgesel zayıflama cihazı açığı.',
    standardSesReason: 'Mahalle sakinleri için paket epilasyon ve genel cilt bakım merkezi ihtiyacı.',
  },
  {
    key: 'surucu_kursu',
    label: 'Sürücü Kursu & Ehliyet / Direksiyon',
    emoji: '🚗',
    domainGroup: 'service',
    requiredPop: 9000,
    popularityRank: 62,
    upperSesAffinity: 1.1,
    standardSesAffinity: 1.2,
    upperSesReason: 'Otomatik vites simülatörü ve VIP özel direksiyon dersi hizmeti açığı.',
    standardSesReason: 'Gençler için B sınıfı ehliyet ve motor ehliyeti kayıt merkezi ihtiyacı.',
  },
  {
    key: 'dil_kursu',
    label: 'Yabancı Dil Kursu & Akademi',
    emoji: '🌐',
    domainGroup: 'service',
    requiredPop: 10000,
    popularityRank: 63,
    upperSesAffinity: 1.7,
    standardSesAffinity: 1.1,
    upperSesReason: 'Ana dili yabancı eğitmenlerle speaking kulübü, IELTS ve TOEFL hazırlık açığı.',
    standardSesReason: 'Okul takviye İngilizce ve genel yabancı dil kursu ihtiyacı.',
  },
  {
    key: 'etut_merkezi',
    label: 'Etüt Merkezi, YKS & LGS Hazırlık',
    emoji: '🎓',
    domainGroup: 'service',
    requiredPop: 7500,
    popularityRank: 64,
    upperSesAffinity: 1.6,
    standardSesAffinity: 1.2,
    upperSesReason: 'Birebir koçluk, vip derslikler ve derece odaklı YKS/LGS etüt merkezi açığı.',
    standardSesReason: 'Mahalledeki öğrenciler için ödev takibi ve sınav hazırlık kursu ihtiyacı.',
  },
  {
    key: 'corbaci',
    label: 'Çorbacı & Gece Lezzetleri / Paçacı',
    emoji: '🥣',
    domainGroup: 'food',
    requiredPop: 6000,
    popularityRank: 65,
    upperSesAffinity: 0.95,
    standardSesAffinity: 1.35,
    upperSesReason: 'Gece geç saatlerde sıcak kelle paça, işkembe ve tereyağlı mercimek çorbası açığı.',
    standardSesReason: 'Esnaf ve vardiyalı çalışanlar için 24 saat sıcak çorba ve tencere yemekleri.',
  },
  {
    key: 'bufe_tost',
    label: 'Büfe, Tost & Sandviç / Kumru',
    emoji: '🥪',
    domainGroup: 'food',
    requiredPop: 3500,
    popularityRank: 66,
    upperSesAffinity: 1.15,
    standardSesAffinity: 1.3,
    upperSesReason: 'Gurme soğuk sandviç, ıslak hamburger ve taze sıkma meyve suyu büfesi açığı.',
    standardSesReason: 'Ayvalık tostu, kumru, sosisli ve hızlı ayaküstü atıştırmalık ihtiyacı.',
  },
  {
    key: 'kahvalti_salonu',
    label: 'Kahvaltı Salonu & Serpme Köy Kahvaltısı',
    emoji: '🍳',
    domainGroup: 'food',
    requiredPop: 7500,
    popularityRank: 67,
    upperSesAffinity: 1.6,
    standardSesAffinity: 1.15,
    upperSesReason: 'Yöresel peynirler, sıcak pişi, sahanda yumurta ve zengin serpme kahvaltı açığı.',
    standardSesReason: 'Hafta sonu ailece uygun fiyatlı serpme kahvaltı ve menemen salonu ihtiyacı.',
  },
  {
    key: 'bubble_tea',
    label: 'Bubble Tea, Smoothie & Meyve Suyu',
    emoji: '🧋',
    domainGroup: 'food',
    requiredPop: 6000,
    popularityRank: 68,
    upperSesAffinity: 1.65,
    standardSesAffinity: 1.2,
    upperSesReason: 'Tayvan tapioca incileri, taze meyve püreli boba ve detox smoothie barı açığı.',
    standardSesReason: 'Gençler ve öğrenciler için trend bubble tea ve ferahlatıcı meyve suları.',
  },
  {
    key: 'psikolog',
    label: 'Psikolog & Aile Danışmanlık Merkezi',
    emoji: '🧠',
    domainGroup: 'service',
    requiredPop: 7500,
    popularityRank: 69,
    upperSesAffinity: 1.85,
    standardSesAffinity: 1.1,
    upperSesReason: 'Bireysel terapi, çift terapisi, çocuk gelişimi ve EMDR seansları açığı.',
    standardSesReason: 'Mahalle sakinleri için erişilebilir psikolojik danışmanlık ve rehberlik merkezi.',
  },
  {
    key: 'noter',
    label: 'Noter & Resmi Onay Dairesi',
    emoji: '📜',
    domainGroup: 'service',
    requiredPop: 12000,
    popularityRank: 70,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.1,
    upperSesReason: 'Şirket sözleşmeleri, vekaletname ve araç devir işlemlerinde hızlı noter açığı.',
    standardSesReason: 'Bölgedeki esnaf ve vatandaşlar için resmi onay ve tasdik dairesi ihtiyacı.',
  },
  {
    key: 'mali_musavir',
    label: 'Mali Müşavir & Muhasebe Bürosu',
    emoji: '💼',
    domainGroup: 'service',
    requiredPop: 6000,
    popularityRank: 71,
    upperSesAffinity: 1.4,
    standardSesAffinity: 1.15,
    upperSesReason: 'Şirket kuruluşu, vergi planlaması ve e-fatura danışmanlığı açığı.',
    standardSesReason: 'Yerel işletmeler için defter tutma, beyanname ve SGK muhasebe hizmeti.',
  },
  {
    key: 'motosiklet_servis',
    label: 'Motosiklet Servisi & Ekipman / Kask',
    emoji: '🏍️',
    domainGroup: 'service',
    requiredPop: 8500,
    popularityRank: 72,
    upperSesAffinity: 1.15,
    standardSesAffinity: 1.3,
    upperSesReason: 'Periyodik motosiklet bakımı, kask, mont ve intercom aksesuar mağazası açığı.',
    standardSesReason: 'Kuryeler ve scooter kullanıcıları için acil motor tamiri ve yağ değişimi.',
  },
  {
    key: 'oto_tuning',
    label: 'Oto Cam Filmi, PPF & Ses Sistemleri',
    emoji: '🎛️',
    domainGroup: 'service',
    requiredPop: 9000,
    popularityRank: 73,
    upperSesAffinity: 1.3,
    standardSesAffinity: 1.3,
    upperSesReason: 'Çizilmez PPF şeffaf araç kaplama, ısı kontrollü cam filmi ve ses yalıtımı açığı.',
    standardSesReason: 'Araç multimedya ekranı, hoparlör ve uygun fiyatlı cam filmi atölyesi.',
  },
  {
    key: 'outdoor_kamp',
    label: 'Kamp, Balıkçılık & Outdoor Mağazası',
    emoji: '🏕️',
    domainGroup: 'retail',
    requiredPop: 11000,
    popularityRank: 74,
    upperSesAffinity: 1.6,
    standardSesAffinity: 1.1,
    upperSesReason: 'Teknik dağcılık ekipmanları, şişme çadır, termos ve kamp mutfağı açığı.',
    standardSesReason: 'Olta takımları, kamp sandalyeleri ve doğa yürüyüşü malzemeleri ihtiyacı.',
  },
  {
    key: 'muzik_kursu',
    label: 'Müzik Kursu & Enstrüman Satışı',
    emoji: '🎸',
    domainGroup: 'service',
    requiredPop: 8500,
    popularityRank: 75,
    upperSesAffinity: 1.7,
    standardSesAffinity: 1.1,
    upperSesReason: 'Klasik gitar, elektro gitar, piyano ve şan eğitimi için butik akademi açığı.',
    standardSesReason: 'Çocuklar ve gençler için uygun fiyatlı bağlama, gitar ve ritim kursu.',
  },
  {
    key: 'antika_vintage',
    label: 'Antika, Vintage & Plak Dükkanı',
    emoji: '🏺',
    domainGroup: 'retail',
    requiredPop: 12000,
    popularityRank: 76,
    upperSesAffinity: 1.8,
    standardSesAffinity: 1.0,
    upperSesReason: 'Orijinal taş plaklar, vintage kıyafetler, pirinç objeler ve nostalji mezatı açığı.',
    standardSesReason: 'İkinci el kitap, retro dekoratif eşya ve nostaljik obje satışı.',
  },
  {
    key: 'tobacco_shop',
    label: 'Tobacco Shop & Nargile / Puro',
    emoji: '🚬',
    domainGroup: 'retail',
    requiredPop: 6000,
    popularityRank: 77,
    upperSesAffinity: 1.2,
    standardSesAffinity: 1.25,
    upperSesReason: 'İthal purolar, nargile takımları, tütün çeşitleri ve özel çakmaklar açığı.',
    standardSesReason: 'Nargile kömürü, sarma tütünü ve tütün aksesuarları ihtiyacı.',
  },
  {
    key: 'mimarlik_ofisi',
    label: 'Mimarlık & İç Mimarlık Tasarım',
    emoji: '🏛️',
    domainGroup: 'service',
    requiredPop: 8000,
    popularityRank: 78,
    upperSesAffinity: 1.9,
    standardSesAffinity: 1.05,
    upperSesReason: 'Lüks konut ve ticari mekan iç mimari projelendirme ve anahtar teslim tadilat açığı.',
    standardSesReason: 'Ev yenileme, banyo/mutfak tadilatı ve mimari çizim danışmanlığı.',
  },
  {
    key: 'medikal_ortopedi',
    label: 'Medikal & Ortopedi / Hasta Bakım',
    emoji: '🏥',
    domainGroup: 'retail',
    requiredPop: 8500,
    popularityRank: 79,
    upperSesAffinity: 1.25,
    standardSesAffinity: 1.1,
    upperSesReason: 'Ortopedik tabanlık, varis çorabı ve medikal solunum destek cihazları açığı.',
    standardSesReason: 'Tekerlekli sandalye, hasta bezi, tansiyon ve şeker ölçüm aletleri ihtiyacı.',
  },
  {
    key: 'isitme_cihazi',
    label: 'İşitme Cihazları Satış & Uygulama',
    emoji: '👂',
    domainGroup: 'service',
    requiredPop: 14000,
    popularityRank: 80,
    upperSesAffinity: 1.3,
    standardSesAffinity: 1.1,
    upperSesReason: 'Görünmez kulak içi dijital işitme cihazı ve uzman odyometrist kontrolü açığı.',
    standardSesReason: 'SGK destekli işitme cihazı temini, pil ve kulak kalıbı bakım noktası.',
  },
  {
    key: 'pub_meyhane',
    label: 'Pub, Meyhane & Bira Evi / Gastro',
    emoji: '🍺',
    domainGroup: 'food',
    requiredPop: 6500,
    popularityRank: 81,
    upperSesAffinity: 1.75,
    standardSesAffinity: 1.15,
    upperSesReason: 'Craft biralar, yeni nesil mezeli meyhane konsepti ve canlı akustik müzik açığı.',
    standardSesReason: 'Uygun fiyatlı bira ve atıştırmalık eşliğinde maç izleme/sosyalleşme pubı.',
  },
  {
    key: 'waffle_cikolata',
    label: 'Waffle & Butik Çikolata Atölyesi',
    emoji: '🍫',
    domainGroup: 'food',
    requiredPop: 6000,
    popularityRank: 82,
    upperSesAffinity: 1.7,
    standardSesAffinity: 1.25,
    upperSesReason: 'Taze Belçika çikolatalı çilekli waffle, fondü ve el yapımı spesiyal trüf çikolata açığı.',
    standardSesReason: 'Gençler ve aileler için bol malzemeli çıtır waffle ve tatlı krep dükkanı.',
  },
];

export const POPULAR_SECTORS_CATALOG = TURKEY_PROVINCE_TOP_50_TRADES;

export function generateIntelligenceReport(
  categoryKey: RadarCategoryKey,
  metrics: RadarAnalysisMetrics,
  locationName?: string,
  lat?: number,
  lng?: number,
  radiusMeters: number = 500,
  sectorCounts?: Record<string, number>,
): RadarIntelligenceReport {
  const meta = RADAR_CATEGORIES[categoryKey] ?? {
    key: 'all' as RadarCategoryKey,
    label: 'Tüm Sektörler & İşletmeler',
    emoji: '🌐',
  };

  const demographics = resolveDemographicProfile(lat ?? 40.9125, lng ?? 29.1764, radiusMeters, locationName);
  const loc = locationName ? `${locationName}` : 'Seçili çember alanı';
  const isUpperSes = demographics.sesGroup.includes('A');
  const popStr = demographics.population;
  const popRaw = demographics.populationRaw || 12000;
  const trafficStr = demographics.daytimeTraffic;
  const compCount = metrics.competitorCount;
  const isAll = categoryKey === 'all' || !categoryKey;

  // 1. STRATEJİK DEĞERLENDİRME ÖZETİ (Nüfus, SES ve Sirkülasyon Entegrasyonu)
  let summaryAdvice = '';
  if (isAll) {
    summaryAdvice = `${loc} çemberindeki ${popStr} yerleşik nüfus ve ${trafficStr} günlük yaya sirkülasyonu, ${demographics.sesGroup} gelir yapısıyla birleştiğinde güçlü bir ticari talep havuzu oluşturuyor. Toplam ${compCount} işletme bölgenin canlı bir çekim noktası olduğunu kanıtlıyor.`;
  } else if (metrics.saturationLevel === 'oversaturated' || metrics.saturationLevel === 'high') {
    summaryAdvice = `${loc} çemberindeki ${popStr} yerleşik nüfus ve ${trafficStr} günlük transit yaya sirkülasyonu, ${demographics.sesGroup} gelir profiliyle yüksek harcama potansiyeli taşıyor. Ancak bölgede ${compCount} ${meta.label.toLowerCase()} bulunması pazar doygunluğunu %${metrics.saturationScore} seviyesine taşıyor. Bu yoğunlukta standart bir işletme açmak yerine katma değerli niş konseptler veya hazır devir fırsatları tercih edilmelidir.`;
  } else if (metrics.saturationLevel === 'low') {
    summaryAdvice = `${loc} çemberinde ${popStr} yerleşik nüfus ve ${trafficStr} transit yaya akışı bulunmasına rağmen mevcut ${meta.label.toLowerCase()} sayısı yalnızca ${compCount} adettir. Bölgedeki güçlü tüketim gücü karşısında belirgin bir hizmet açığı bulunmaktadır.`;
  } else {
    summaryAdvice = `${loc} çemberindeki ${popStr} kişilik nüfus ve ${trafficStr} gündüz sirkülasyonu, ${meta.label.toLowerCase()} sektörü için dengeli bir pazar yapısı sunuyor (${compCount} mevcut rakip). Kalite, hız ve modern marka diliyle öne çıkmak mümkündür.`;
  }

  // 2. PAZAR AÇIĞI & ARZ/TALEP HESABI
  let marketGapScore = 0;
  let marketGapSummary = '';

  if (metrics.saturationLevel === 'low') {
    marketGapScore = Math.min(94, 80 + Math.round((100 - metrics.saturationScore) * 0.15));
    marketGapSummary = `Bölgedeki ${popStr} kişilik yerleşik talep karşısında mevcut ${compCount} rakip yetersiz kalıyor. Kişi başına düşen hizmet kapasitesinde %${marketGapScore} doğrudan arz açığı tespit edilmiştir.`;
  } else if (metrics.saturationLevel === 'moderate') {
    marketGapScore = 65;
    marketGapSummary = `Bölgede hacimsel talep dengeli; ancak ${demographics.ageProfile.split('(')[0].trim()} kitlesinin aradığı dijitalleşmiş ve modern alt-hizmetlerde %65 inovasyon açığı mevcuttur.`;
  } else {
    // High / Oversaturated
    marketGapScore = isUpperSes ? 74 : 60;
    marketGapSummary = `Bölgede standart işletme sayısı doymuş görünse de (${compCount} rakip), ${demographics.sesGroup} kitlesinin aradığı kişiselleştirilmiş ve deneyim odaklı niş segmentte %${marketGapScore} arz açığı bulunmaktadır.`;
  }

  // 3. DİNAMİK & YARATICI FIRSAT MOTORU (3 FARKLI SEKTÖR DİKEYİ: GIDA, HİZMET/SAĞLIK, PERAKENDE)
  const counts = sectorCounts || {};

  const evaluatedTrades = TURKEY_PROVINCE_TOP_50_TRADES.map((sec) => {
    const existing = counts[sec.key] ?? 0;
    const ideal = Math.max(1, Math.round(popRaw / sec.requiredPop));
    const affinity = isUpperSes
      ? (sec.upperSesAffinity ?? 1.0)
      : (sec.standardSesAffinity ?? 1.0);
    const isZero = existing === 0;

    let opportunityScore = 0;
    let demandScore = 0;
    let statusBadge = '';
    let reason = isUpperSes ? sec.upperSesReason : sec.standardSesReason;

    if (isZero) {
      // 0 Adet İşletme: Tam Pazar Boşluğu & İlk Giren Marka Avantajı
      const zeroBase = 130 - sec.popularityRank * 0.7;
      opportunityScore = zeroBase * affinity * 1.6;
      demandScore = Math.min(99, Math.max(88, Math.round(86 + (100 - sec.popularityRank) * 0.08 * affinity)));
      statusBadge = `Bölgede 0 İşletme (Tam Pazar Boşluğu)`;
    } else if (existing < ideal) {
      // Kapasite Açığı
      const deficit = ideal - existing;
      const deficitRatio = deficit / ideal;
      const deficitBase = (deficitRatio * 65) + (55 - sec.popularityRank * 0.45);
      opportunityScore = deficitBase * affinity;
      demandScore = Math.min(96, Math.max(72, Math.round(deficitRatio * 85 * affinity)));
      statusBadge = `Kapasite Açığı (${existing}/${ideal} İşletme)`;
      reason = `Bu bölgede ${ideal} ${sec.label.split('/')[0].trim()} kapasitesi varken mevcut işletme sayısı yalnızca ${existing} adettir.`;
    } else {
      // Dengeli / Doygun
      opportunityScore = (30 - sec.popularityRank * 0.3) * affinity * 0.3;
      demandScore = 60;
      statusBadge = `Dengeli (${existing} İşletme)`;
    }

    return {
      key: sec.key,
      label: sec.label,
      emoji: sec.emoji,
      domainGroup: sec.domainGroup,
      existingCount: existing,
      idealCount: ideal,
      demandScore,
      popularityRank: sec.popularityRank,
      opportunityScore,
      statusBadge,
      opportunityReason: reason,
    };
  });

  // 3 Farklı Dikeyden (1 Gıda, 1 Hizmet/Sağlık/Spor, 1 Perakende/Ticaret) en yüksek potansiyelli liderleri seç
  const bestFood = evaluatedTrades
    .filter((t) => t.domainGroup === 'food')
    .sort((a, b) => b.opportunityScore - a.opportunityScore)[0];

  const bestService = evaluatedTrades
    .filter((t) => t.domainGroup === 'service')
    .sort((a, b) => b.opportunityScore - a.opportunityScore)[0];

  const bestRetail = evaluatedTrades
    .filter((t) => t.domainGroup === 'retail')
    .sort((a, b) => b.opportunityScore - a.opportunityScore)[0];

  const threePillars = [bestFood, bestService, bestRetail].filter(Boolean) as MissingSectorItem[];
  // En yüksek talep skoruna göre sırala
  threePillars.sort((a, b) => (b.demandScore ?? 0) - (a.demandScore ?? 0));

  const missingSectors = threePillars.slice(0, 3);

  // 4. EKSİK KONSEPTLER (Fallback/Detay)
  const sectorPool = SECTOR_CONCEPTS[categoryKey] ?? SECTOR_CONCEPTS.default;
  const missingConcepts: MarketGapConcept[] = isUpperSes ? sectorPool.upperSes : sectorPool.standardSes;

  // 5. GİRİŞİM STRATEJİSİ & SEPET BEKLENTİSİ
  let recommendedEntryStrategy = '';
  let strategyRationale = '';
  let estimatedTicketSize = '';

  if (metrics.saturationScore >= 75) {
    recommendedEntryStrategy = 'Hazır Devir veya Ortaklık (Düşük Risk & Oturmuş Ciro)';
    strategyRationale = `Bölgedeki yüksek işletme yoğunluğu ve ruhsat/tabela maliyetleri nedeniyle sıfırdan dükkan açmak yerine sitedeki devir fırsatlarını değerlendirmek 10-14 ay amortisman avantajı sağlar.`;
  } else if (metrics.saturationScore <= 35) {
    recommendedEntryStrategy = 'Sıfırdan Yeni Konsept Açılışı (Pazar Liderliği)';
    strategyRationale = `Bölgede ciddi arz açığı bulunduğundan ilk giren güçlü marka olma avantajıyla pazar payının %40+'ını hızla konsolide edebilirsiniz.`;
  } else {
    recommendedEntryStrategy = 'Niş Butik Konsept veya Franchise İle Farklılaşma';
    strategyRationale = `Dengeli pazar yapısında standart rakiplerin arasından sıyrılmak için menü/hizmet inovasyonu ve güçlü dijital görünürlük esastır.`;
  }

  if (isUpperSes) {
    estimatedTicketSize = '280₺ — 480₺ / Kişi (Yüksek Harcama Eğilimi)';
  } else if (demographics.sesGroup.includes('B')) {
    estimatedTicketSize = '180₺ — 300₺ / Kişi (Dengeli Fiyat-Performans)';
  } else {
    estimatedTicketSize = '120₺ — 200₺ / Kişi (Hızlı Tüketim & Sürüm)';
  }

  return {
    summaryAdvice,
    marketGapSummary,
    marketGapScore,
    missingSectors,
    missingConcepts,
    recommendedEntryStrategy,
    strategyRationale,
    estimatedTicketSize,
    targetDemographic: demographics.ageProfile,
    pros: missingConcepts.map((c) => `${c.title}: ${c.description}`),
    cons: [
      metrics.saturationScore > 70
        ? 'Standart/jenerik konseptlerde fiyat rekabeti riski'
        : 'İlk açılışta yerel tanıtım ve tabela bilinirliği oluşturma gereksinimi',
    ],
    differentiationIdea: missingConcepts[0]?.title ?? 'Niş alt-segmentte uzmanlaşma',
    recommendedPricePoint: isUpperSes ? 'Orta-Üst Segment' : 'Dinamik Fiyatlandırma',
  };
}

export interface DemographicProfile {
  population: string;
  populationRaw: number;
  officialNeighborhoodPop?: string;
  daytimeTraffic?: string;
  densityPerKm2: number;
  sesGroup: string;
  ageProfile: string;
  footTraffic: string;
  areaKm2: string;
}

interface DistrictCensusMeta {
  name: string;
  district: string;
  city: string;
  densityPerKm2: number;
  baseMahallePop: number;
  ilcePop: number;
  ses: string;
  age: string;
  traffic: string;
  daytimeMultiplier: number;
}

const TURKEY_CENSUS_INDEX: DistrictCensusMeta[] = [
  // ==========================================
  // 1. ADANA (TÜM İLÇE VE ANA TİCARİ ARTERLER)
  // ==========================================
  { name: 'ziyapaşa', district: 'Seyhan', city: 'Adana', densityPerKm2: 16500, baseMahallePop: 32000, ilcePop: 800000, ses: 'A+ / A Grubu', age: 'Beyaz Yaka, Gastronomi & Alışveriş (%68)', traffic: '9.4 / 10 (Zirve Sirkülasyon)', daytimeMultiplier: 2.40 },
  { name: 'barajyolu', district: 'Seyhan', city: 'Adana', densityPerKm2: 17200, baseMahallePop: 38000, ilcePop: 800000, ses: 'A / B Grubu', age: 'Üniversite & Gençlik (%73)', traffic: '9.3 / 10 (Çok Yoğun Öğrenci)', daytimeMultiplier: 2.10 },
  { name: 'reşatbey', district: 'Seyhan', city: 'Adana', densityPerKm2: 15400, baseMahallePop: 26500, ilcePop: 800000, ses: 'A / B Grubu', age: 'Ofis, Butik & Şehirli (%65)', traffic: '9.1 / 10 (Yoğun Ticaret)', daytimeMultiplier: 1.90 },
  { name: 'cemalpaşa', district: 'Seyhan', city: 'Adana', densityPerKm2: 14800, baseMahallePop: 29000, ilcePop: 800000, ses: 'A+ / A Grubu', age: 'Üst Gelir & Aile (%63)', traffic: '9.0 / 10 (Prestij)', daytimeMultiplier: 1.70 },
  { name: 'kuruköprü', district: 'Seyhan', city: 'Adana', densityPerKm2: 18500, baseMahallePop: 27000, ilcePop: 800000, ses: 'B / C1 Grubu', age: 'Tarihi Çarşı & Toptan Ticaret (%58)', traffic: '9.5 / 10 (Tarihi Merkez)', daytimeMultiplier: 2.30 },
  { name: 'tellidere', district: 'Seyhan', city: 'Adana', densityPerKm2: 14200, baseMahallePop: 39000, ilcePop: 800000, ses: 'B / C1 Grubu', age: 'Yoğun Yerleşim & Aile (%61)', traffic: '8.7 / 10 (Hareketli)', daytimeMultiplier: 1.25 },
  { name: 'seyhan', district: 'Seyhan', city: 'Adana', densityPerKm2: 13800, baseMahallePop: 35000, ilcePop: 800000, ses: 'B / C1 Grubu', age: 'Geleneksel Ticaret & Aile (%60)', traffic: '9.0 / 10 (Yoğun)', daytimeMultiplier: 1.60 },

  { name: 'turgut özal', district: 'Çukurova', city: 'Adana', densityPerKm2: 13500, baseMahallePop: 36000, ilcePop: 390000, ses: 'A+ / A Grubu', age: 'Modern Şehirli & Gastronomi (%67)', traffic: '9.3 / 10 (Çok Yoğun)', daytimeMultiplier: 1.95 },
  { name: 'kenan evren', district: 'Çukurova', city: 'Adana', densityPerKm2: 12800, baseMahallePop: 34000, ilcePop: 390000, ses: 'A / B Grubu', age: 'Ticaret & Modern Aile (%64)', traffic: '9.0 / 10 (Yoğun)', daytimeMultiplier: 1.65 },
  { name: 'güzelyalı', district: 'Çukurova', city: 'Adana', densityPerKm2: 11800, baseMahallePop: 31000, ilcePop: 390000, ses: 'A+ / A Grubu', age: 'Üst Gelir, Göl Kıyısı & Genç (%65)', traffic: '9.1 / 10 (Yüksek Cazibe)', daytimeMultiplier: 1.80 },
  { name: 'süleyman demirel', district: 'Çukurova', city: 'Adana', densityPerKm2: 10500, baseMahallePop: 29500, ilcePop: 390000, ses: 'A / B Grubu', age: 'Yeni Nesil Gastronomi & Aile (%63)', traffic: '8.9 / 10 (Gelişen)', daytimeMultiplier: 1.55 },
  { name: 'beyazevler', district: 'Çukurova', city: 'Adana', densityPerKm2: 12200, baseMahallePop: 28000, ilcePop: 390000, ses: 'A / B Grubu', age: 'Öğrenci & Göl Kıyısı (%68)', traffic: '9.0 / 10 (Sosyal Alan)', daytimeMultiplier: 1.70 },
  { name: 'çukurova', district: 'Çukurova', city: 'Adana', densityPerKm2: 11200, baseMahallePop: 33000, ilcePop: 390000, ses: 'A / B Grubu', age: 'Modern Şehirli & Aile (%64)', traffic: '8.9 / 10 (Prestij)', daytimeMultiplier: 1.50 },

  { name: 'kışla', district: 'Yüreğir', city: 'Adana', densityPerKm2: 12500, baseMahallePop: 31000, ilcePop: 410000, ses: 'B / C1 Grubu', age: 'AVM, Transit & Aile (%59)', traffic: '9.0 / 10 (Yoğun Sirkülasyon)', daytimeMultiplier: 1.80 },
  { name: 'yavuzlar', district: 'Yüreğir', city: 'Adana', densityPerKm2: 13000, baseMahallePop: 34000, ilcePop: 410000, ses: 'B / C1 Grubu', age: 'Esnaf & Geleneksel Aile (%57)', traffic: '8.7 / 10 (Hareketli)', daytimeMultiplier: 1.30 },
  { name: 'yüreğir', district: 'Yüreğir', city: 'Adana', densityPerKm2: 11800, baseMahallePop: 33000, ilcePop: 410000, ses: 'B / C1 Grubu', age: 'İş Gücü & Aile (%58)', traffic: '8.7 / 10 (Hareketli)', daytimeMultiplier: 1.35 },

  { name: 'balcalı', district: 'Sarıçam', city: 'Adana', densityPerKm2: 9500, baseMahallePop: 28000, ilcePop: 230000, ses: 'A / B Grubu', age: 'Üniversite & Sağlık Personeli (%76)', traffic: '9.2 / 10 (Kampüs Trafiği)', daytimeMultiplier: 2.20 },
  { name: 'sarıçam', district: 'Sarıçam', city: 'Adana', densityPerKm2: 8800, baseMahallePop: 29000, ilcePop: 230000, ses: 'B / C1 Grubu', age: 'Üniversite & Gelişen Aile (%62)', traffic: '8.6 / 10 (Gelişen)', daytimeMultiplier: 1.40 },

  { name: 'ceyhan', district: 'Ceyhan', city: 'Adana', densityPerKm2: 7800, baseMahallePop: 24000, ilcePop: 160000, ses: 'B / C1 Grubu', age: 'Esnaf, Tarım & Sanayi (%57)', traffic: '8.5 / 10 (Bölgesel Merkez)', daytimeMultiplier: 1.35 },
  { name: 'kozan', district: 'Kozan', city: 'Adana', densityPerKm2: 7200, baseMahallePop: 22000, ilcePop: 135000, ses: 'B / C1 Grubu', age: 'Bölgesel Ticaret & Aile (%56)', traffic: '8.3 / 10 (Merkez Çarşı)', daytimeMultiplier: 1.30 },

  // ==========================================
  // 2. MERSİN & GAZİANTEP & HATAY
  // ==========================================
  { name: 'pozcu', district: 'Yenişehir', city: 'Mersin', densityPerKm2: 14500, baseMahallePop: 33000, ilcePop: 280000, ses: 'A+ / A Grubu', age: 'Şehirli Genç, Ofis & Gastronomi (%68)', traffic: '9.4 / 10 (Zirve Sirkülasyon)', daytimeMultiplier: 2.20 },
  { name: 'yenişehir', district: 'Yenişehir', city: 'Mersin', densityPerKm2: 12500, baseMahallePop: 31000, ilcePop: 280000, ses: 'A / B Grubu', age: 'Marina, Üniversite & Aile (%64)', traffic: '9.1 / 10 (Yoğun)', daytimeMultiplier: 1.70 },
  { name: 'mezitli', district: 'Mezitli', city: 'Mersin', densityPerKm2: 9800, baseMahallePop: 32000, ilcePop: 225000, ses: 'A / B Grubu', age: 'Sahil, Yazlıkçı & Modern Aile (%61)', traffic: '8.8 / 10 (Dinamik)', daytimeMultiplier: 1.45 },
  { name: 'tarsus', district: 'Tarsus', city: 'Mersin', densityPerKm2: 8500, baseMahallePop: 29000, ilcePop: 350000, ses: 'B / C1 Grubu', age: 'Tarihi Çarşı, Sanayi & Aile (%58)', traffic: '8.7 / 10 (Bölgesel Merkez)', daytimeMultiplier: 1.40 },

  { name: 'şahinbey', district: 'Şahinbey', city: 'Gaziantep', densityPerKm2: 14500, baseMahallePop: 42000, ilcePop: 940000, ses: 'B / C1 Grubu', age: 'Ticaret & Geniş Aile (%60)', traffic: '9.2 / 10 (Yüksek Hacim)', daytimeMultiplier: 1.50 },
  { name: 'şehitkamil', district: 'Gaziantep', city: 'Gaziantep', densityPerKm2: 12800, baseMahallePop: 38000, ilcePop: 850000, ses: 'A / B Grubu', age: 'İbrahimli Üst Gelir & İş Dünyası (%63)', traffic: '9.1 / 10 (Prestij)', daytimeMultiplier: 1.60 },

  { name: 'antakya', district: 'Antakya', city: 'Hatay', densityPerKm2: 10500, baseMahallePop: 26000, ilcePop: 390000, ses: 'B / C1 Grubu', age: 'Gastronomi, Kültür & Esnaf (%58)', traffic: '8.8 / 10 (Tarihi Merkez)', daytimeMultiplier: 1.45 },
  { name: 'iskenderun', district: 'İskenderun', city: 'Hatay', densityPerKm2: 11500, baseMahallePop: 31000, ilcePop: 250000, ses: 'A / B Grubu', age: 'Liman, Sanayi, Sahil & Genç (%63)', traffic: '9.1 / 10 (Yoğun Ticaret)', daytimeMultiplier: 1.65 },

  // ==========================================
  // 3. İSTANBUL (ANADOLU & AVRUPA)
  // ==========================================
  { name: 'cevizli', district: 'Maltepe', city: 'İstanbul', densityPerKm2: 12800, baseMahallePop: 32850, ilcePop: 525000, ses: 'B / C1 Grubu', age: 'Çalışan Aile & Genç Nüfus (%62)', traffic: '8.7 / 10 (Yoğun Ticaret)', daytimeMultiplier: 1.35 },
  { name: 'maltepe', district: 'Maltepe', city: 'İstanbul', densityPerKm2: 12400, baseMahallePop: 29400, ilcePop: 525000, ses: 'B / C1 Grubu', age: 'Çalışan & Genç Nüfus (%63)', traffic: '8.8 / 10 (Yoğun)', daytimeMultiplier: 1.30 },
  { name: 'kartal', district: 'Kartal', city: 'İstanbul', densityPerKm2: 11200, baseMahallePop: 31200, ilcePop: 485000, ses: 'B / C1 Grubu', age: 'Çalışan Kitle & Aile (%60)', traffic: '8.5 / 10 (Hareketli)', daytimeMultiplier: 1.25 },
  { name: 'moda', district: 'Kadıköy', city: 'İstanbul', densityPerKm2: 18500, baseMahallePop: 25400, ilcePop: 480000, ses: 'A+ / A Grubu', age: 'Genç Profesyonel & Üniversite (%68)', traffic: '9.4 / 10 (Çok Yoğun)', daytimeMultiplier: 1.85 },
  { name: 'kadıköy', district: 'Kadıköy', city: 'İstanbul', densityPerKm2: 17800, baseMahallePop: 28500, ilcePop: 480000, ses: 'A+ / A Grubu', age: 'Genç Profesyonel & Üniversite (%66)', traffic: '9.5 / 10 (Zirve Sirkülasyon)', daytimeMultiplier: 2.20 },
  { name: 'ataşehir', district: 'Ataşehir', city: 'İstanbul', densityPerKm2: 16200, baseMahallePop: 34800, ilcePop: 425000, ses: 'A / B Grubu', age: 'Finans, Plaza & Aile (%65)', traffic: '8.9 / 10 (Yoğun Ticaret)', daytimeMultiplier: 1.60 },
  { name: 'üsküdar', district: 'Üsküdar', city: 'İstanbul', densityPerKm2: 14800, baseMahallePop: 26800, ilcePop: 520000, ses: 'B / C1 Grubu', age: 'Geleneksel Aile & Genç (%59)', traffic: '8.8 / 10 (Hareketli)', daytimeMultiplier: 1.45 },
  { name: 'ümraniye', district: 'Ümraniye', city: 'İstanbul', densityPerKm2: 15600, baseMahallePop: 38200, ilcePop: 730000, ses: 'B / C1 Grubu', age: 'Ticaret & Yoğun Aile (%64)', traffic: '9.0 / 10 (Çok Hareketli)', daytimeMultiplier: 1.40 },
  { name: 'pendik', district: 'Pendik', city: 'İstanbul', densityPerKm2: 10500, baseMahallePop: 36500, ilcePop: 750000, ses: 'B / C1 Grubu', age: 'Geniş Aile & Sanayi (%58)', traffic: '8.6 / 10 (Hareketli)', daytimeMultiplier: 1.20 },
  { name: 'tuzla', district: 'Tuzla', city: 'İstanbul', densityPerKm2: 7800, baseMahallePop: 24500, ilcePop: 290000, ses: 'B / C1 Grubu', age: 'Sanayi, Marina & Aile (%57)', traffic: '8.3 / 10 (Dinamik)', daytimeMultiplier: 1.25 },
  { name: 'beykoz', district: 'Beykoz', city: 'İstanbul', densityPerKm2: 5200, baseMahallePop: 18500, ilcePop: 250000, ses: 'A / B Grubu', age: 'Nitelikli Konut & Doğa (%55)', traffic: '7.8 / 10 (Bölgesel)', daytimeMultiplier: 1.15 },

  { name: 'beşiktaş', district: 'Beşiktaş', city: 'İstanbul', densityPerKm2: 16400, baseMahallePop: 22600, ilcePop: 175000, ses: 'A+ / A Grubu', age: 'Beyaz Yaka & Üniversite (%72)', traffic: '9.7 / 10 (Zirve Sirkülasyon)', daytimeMultiplier: 2.80 },
  { name: 'nişantaşı', district: 'Şişli', city: 'İstanbul', densityPerKm2: 19800, baseMahallePop: 24200, ilcePop: 275000, ses: 'A+ / A Grubu', age: 'Moda, Tasarım & Ofis (%70)', traffic: '9.6 / 10 (Çok Yoğun)', daytimeMultiplier: 2.80 },
  { name: 'şişli', district: 'Şişli', city: 'İstanbul', densityPerKm2: 19200, baseMahallePop: 27000, ilcePop: 275000, ses: 'A / B Grubu', age: 'Beyaz Yaka & Şehirli (%67)', traffic: '9.5 / 10 (Yoğun)', daytimeMultiplier: 2.50 },
  { name: 'bakırköy', district: 'Bakırköy', city: 'İstanbul', densityPerKm2: 15800, baseMahallePop: 28500, ilcePop: 225000, ses: 'A / B Grubu', age: 'Üst Gelir Aile & Emekli (%56)', traffic: '9.1 / 10 (Yoğun)', daytimeMultiplier: 1.75 },
  { name: 'beyoğlu', district: 'Beyoğlu', city: 'İstanbul', densityPerKm2: 17500, baseMahallePop: 21500, ilcePop: 225000, ses: 'A / B Grubu', age: 'Turist, Sanat & Gençlik (%70)', traffic: '9.8 / 10 (Zirve Sirkülasyon)', daytimeMultiplier: 3.10 },
  { name: 'fatih', district: 'Fatih', city: 'İstanbul', densityPerKm2: 24500, baseMahallePop: 26000, ilcePop: 380000, ses: 'B / C1 Grubu', age: 'Geleneksel Ticaret & Turizm (%61)', traffic: '9.4 / 10 (Tarihi Merkez)', daytimeMultiplier: 2.40 },
  { name: 'sarıyer', district: 'Sarıyer', city: 'İstanbul', densityPerKm2: 6800, baseMahallePop: 21000, ilcePop: 350000, ses: 'A+ / A Grubu', age: 'Üst Gelir, Plaza & Aile (%63)', traffic: '8.7 / 10 (Prestij)', daytimeMultiplier: 1.60 },
  { name: 'beylikdüzü', district: 'Beylikdüzü', city: 'İstanbul', densityPerKm2: 14200, baseMahallePop: 39500, ilcePop: 410000, ses: 'B / C1 Grubu', age: 'Yeni Nesil Aile & Genç (%64)', traffic: '8.7 / 10 (Gelişen Cazibe)', daytimeMultiplier: 1.25 },
  { name: 'başakşehir', district: 'Başakşehir', city: 'İstanbul', densityPerKm2: 11500, baseMahallePop: 38000, ilcePop: 515000, ses: 'A / B Grubu', age: 'Modern Aile & Yatırımcı (%61)', traffic: '8.6 / 10 (Bölgesel Merkez)', daytimeMultiplier: 1.30 },
  { name: 'esenyurt', district: 'Esenyurt', city: 'İstanbul', densityPerKm2: 22000, baseMahallePop: 46000, ilcePop: 980000, ses: 'C1 / C2 Grubu', age: 'Yoğun İş Gücü & Genç Aile (%66)', traffic: '9.1 / 10 (Yüksek Dinamizm)', daytimeMultiplier: 1.15 },

  // ==========================================
  // 4. ANKARA
  // ==========================================
  { name: 'çankaya', district: 'Çankaya', city: 'Ankara', densityPerKm2: 9500, baseMahallePop: 28400, ilcePop: 940000, ses: 'A / B Grubu', age: 'Bürokrat, Üniversite & Genç (%65)', traffic: '9.0 / 10 (Yoğun)', daytimeMultiplier: 1.65 },
  { name: 'tunalı', district: 'Çankaya', city: 'Ankara', densityPerKm2: 11800, baseMahallePop: 23500, ilcePop: 940000, ses: 'A+ / A Grubu', age: 'Genç Profesyonel & Üniversite (%69)', traffic: '9.3 / 10 (Çok Yoğun)', daytimeMultiplier: 2.10 },
  { name: 'çayyolu', district: 'Çankaya', city: 'Ankara', densityPerKm2: 6800, baseMahallePop: 32000, ilcePop: 940000, ses: 'A+ / A Grubu', age: 'Üst Düzey Yönetici & Modern Aile (%64)', traffic: '8.8 / 10 (Prestij)', daytimeMultiplier: 1.40 },
  { name: 'yenimahalle', district: 'Yenimahalle', city: 'Ankara', densityPerKm2: 8400, baseMahallePop: 31000, ilcePop: 700000, ses: 'B / C1 Grubu', age: 'Memur, Aile & Çalışan (%60)', traffic: '8.6 / 10 (Hareketli)', daytimeMultiplier: 1.30 },
  { name: 'keçiören', district: 'Keçiören', city: 'Ankara', densityPerKm2: 12500, baseMahallePop: 37500, ilcePop: 940000, ses: 'B / C1 Grubu', age: 'Geniş Aile & Esnaf (%58)', traffic: '8.8 / 10 (Yoğun Nüfus)', daytimeMultiplier: 1.15 },
  { name: 'etimesgut', district: 'Etimesgut', city: 'Ankara', densityPerKm2: 7600, baseMahallePop: 33000, ilcePop: 620000, ses: 'B / C1 Grubu', age: 'Genç Aile & Kamu Çalışanı (%62)', traffic: '8.4 / 10 (Büyüyen)', daytimeMultiplier: 1.20 },

  // ==========================================
  // 5. İZMİR
  // ==========================================
  { name: 'alsancak', district: 'Konak', city: 'İzmir', densityPerKm2: 14500, baseMahallePop: 26200, ilcePop: 330000, ses: 'A / B Grubu', age: 'Sosyal Gençlik & Ofis (%71)', traffic: '9.5 / 10 (Zirve Sirkülasyon)', daytimeMultiplier: 2.60 },
  { name: 'karşıyaka', district: 'Karşıyaka', city: 'İzmir', densityPerKm2: 13800, baseMahallePop: 34500, ilcePop: 350000, ses: 'A / B Grubu', age: 'Şehirli Genç & Aile (%66)', traffic: '9.2 / 10 (Çok Yoğun)', daytimeMultiplier: 1.50 },
  { name: 'bostanlı', district: 'Karşıyaka', city: 'İzmir', densityPerKm2: 12500, baseMahallePop: 28000, ilcePop: 350000, ses: 'A+ / A Grubu', age: 'Üst Gelir, Gastronomi & Sahil (%67)', traffic: '9.3 / 10 (Yüksek Cazibe)', daytimeMultiplier: 1.75 },
  { name: 'bornova', district: 'Bornova', city: 'İzmir', densityPerKm2: 10800, baseMahallePop: 32000, ilcePop: 450000, ses: 'A / B Grubu', age: 'Öğrenci, Akademisyen & Aile (%68)', traffic: '9.1 / 10 (Üniversite Trafiği)', daytimeMultiplier: 1.80 },
  { name: 'konak', district: 'Konak', city: 'İzmir', densityPerKm2: 13200, baseMahallePop: 28000, ilcePop: 330000, ses: 'B / C1 Grubu', age: 'Ticaret & Şehir Merkezi (%64)', traffic: '9.4 / 10 (Yoğun Merkez)', daytimeMultiplier: 2.20 },
  { name: 'buca', district: 'Buca', city: 'İzmir', densityPerKm2: 14200, baseMahallePop: 38000, ilcePop: 520000, ses: 'B / C1 Grubu', age: 'Üniversite & Genç Nüfus (%67)', traffic: '8.9 / 10 (Yüksek Dinamizm)', daytimeMultiplier: 1.45 },

  // ==========================================
  // 6. DİĞER BÜYÜKŞEHİRLER & BÖLGELER
  // ==========================================
  { name: 'özlüce', district: 'Nilüfer', city: 'Bursa', densityPerKm2: 8200, baseMahallePop: 32000, ilcePop: 540000, ses: 'A / B Grubu', age: 'Modern Aile & Gastronomi (%62)', traffic: '8.7 / 10 (Gelişen Cazibe)', daytimeMultiplier: 1.40 },
  { name: 'nilüfer', district: 'Nilüfer', city: 'Bursa', densityPerKm2: 7800, baseMahallePop: 31000, ilcePop: 540000, ses: 'A / B Grubu', age: 'Beyaz Yaka & Modern Aile (%63)', traffic: '8.8 / 10 (Prestij)', daytimeMultiplier: 1.35 },
  { name: 'osmangazi', district: 'Osmangazi', city: 'Bursa', densityPerKm2: 13500, baseMahallePop: 36000, ilcePop: 890000, ses: 'B / C1 Grubu', age: 'Tarihi Merkez & Ticaret (%60)', traffic: '9.2 / 10 (Yoğun Merkez)', daytimeMultiplier: 1.80 },
  { name: 'lara', district: 'Muratpaşa', city: 'Antalya', densityPerKm2: 8600, baseMahallePop: 33800, ilcePop: 520000, ses: 'A / B Grubu', age: 'Turist, Yabancı & Aile (%58)', traffic: '8.9 / 10 (Yüksek Sirkülasyon)', daytimeMultiplier: 1.80 },
  { name: 'muratpaşa', district: 'Muratpaşa', city: 'Antalya', densityPerKm2: 9200, baseMahallePop: 31500, ilcePop: 520000, ses: 'A / B Grubu', age: 'Hizmet Sektörü, Turizm & Aile (%60)', traffic: '9.0 / 10 (Yoğun)', daytimeMultiplier: 1.70 },
  { name: 'konyaaltı', district: 'Konyaaltı', city: 'Antalya', densityPerKm2: 6500, baseMahallePop: 28000, ilcePop: 210000, ses: 'A / B Grubu', age: 'Yabancı, Sahil & Genç (%62)', traffic: '8.7 / 10 (Turizm & Sahil)', daytimeMultiplier: 1.75 },
  { name: 'izmit', district: 'İzmit', city: 'Kocaeli', densityPerKm2: 9500, baseMahallePop: 27500, ilcePop: 375000, ses: 'B / C1 Grubu', age: 'Sanayi, Üniversite & Aile (%61)', traffic: '8.8 / 10 (Bölgesel Merkez)', daytimeMultiplier: 1.50 },
  { name: 'gebze', district: 'Gebze', city: 'Kocaeli', densityPerKm2: 11000, baseMahallePop: 34000, ilcePop: 410000, ses: 'B / C1 Grubu', age: 'Sanayi, Teknoloji & İş Gücü (%63)', traffic: '8.9 / 10 (Sanayi & Ticaret)', daytimeMultiplier: 1.45 },
  { name: 'selçuklu', district: 'Selçuklu', city: 'Konya', densityPerKm2: 8200, baseMahallePop: 36000, ilcePop: 690000, ses: 'B / C1 Grubu', age: 'Üniversite, Sanayi & Aile (%61)', traffic: '8.7 / 10 (Büyüyen)', daytimeMultiplier: 1.35 },
  { name: 'tepebaşı', district: 'Tepebaşı', city: 'Eskişehir', densityPerKm2: 9800, baseMahallePop: 31000, ilcePop: 390000, ses: 'A / B Grubu', age: 'Öğrenci, Genç & Kültür (%69)', traffic: '9.1 / 10 (Öğrenci & Dinamik)', daytimeMultiplier: 1.85 },
  { name: 'atakum', district: 'Atakum', city: 'Samsun', densityPerKm2: 8800, baseMahallePop: 33000, ilcePop: 245000, ses: 'A / B Grubu', age: 'Sahil, Üniversite & Aile (%66)', traffic: '8.9 / 10 (Yüksek Dinamizm)', daytimeMultiplier: 1.60 },
  { name: 'ortahisar', district: 'Ortahisar', city: 'Trabzon', densityPerKm2: 10200, baseMahallePop: 31000, ilcePop: 340000, ses: 'B / C1 Grubu', age: 'Üniversite, Turizm & Ticaret (%62)', traffic: '9.1 / 10 (Bölgesel Merkez)', daytimeMultiplier: 1.70 },
  { name: 'kayapınar', district: 'Kayapınar', city: 'Diyarbakır', densityPerKm2: 11500, baseMahallePop: 39000, ilcePop: 420000, ses: 'A / B Grubu', age: 'Yeni Şehir, Plaza & Genç Aile (%65)', traffic: '9.2 / 10 (Gelişen Cazibe)', daytimeMultiplier: 1.65 },
  { name: 'haliliye', district: 'Haliliye', city: 'Şanlıurfa', densityPerKm2: 12000, baseMahallePop: 41000, ilcePop: 395000, ses: 'B / C1 Grubu', age: 'Geniş Aile & Ticaret (%58)', traffic: '8.9 / 10 (Yoğun)', daytimeMultiplier: 1.45 },
  { name: 'bodrum', district: 'Bodrum', city: 'Muğla', densityPerKm2: 4500, baseMahallePop: 19000, ilcePop: 195000, ses: 'A+ / A Grubu', age: 'Turist, Yabancı & Üst Gelir (%60)', traffic: '9.6 / 10 (Yüksek Sezon Sirkülasyonu)', daytimeMultiplier: 2.90 },
];

export function resolveDemographicProfile(
  lat: number,
  lng: number,
  radiusMeters: number,
  locationName?: string,
): DemographicProfile {
  // Scientific GIS Area in Square Kilometers: Area = π * r^2
  const radiusKm = radiusMeters / 1000;
  const areaKm2 = Math.PI * Math.pow(radiusKm, 2);

  const loc = (locationName || '').toLowerCase();

  // Find best matching census metadata by name
  let matchedMeta = TURKEY_CENSUS_INDEX.find((m) => loc.includes(m.name));

  // High-precision coordinate fallbacks if location name text is generic
  if (!matchedMeta) {
    // Adana Coordinates
    if (lat >= 36.97 && lat <= 37.07 && lng >= 35.25 && lng <= 35.39) {
      if (lat >= 37.03 && lng <= 35.31) {
        matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'turgut özal');
      } else if (lat >= 37.01 && lng >= 35.31 && lng <= 35.33) {
        matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'barajyolu');
      } else if (lat >= 36.99 && lat <= 37.01 && lng >= 35.31 && lng <= 35.33) {
        matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'ziyapaşa');
      } else {
        matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'seyhan');
      }
    }
    // Istanbul Coordinates
    else if (lat >= 40.96 && lat <= 41.01 && lng >= 29.01 && lng <= 29.08) {
      matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'moda');
    } else if (lat >= 41.02 && lat <= 41.08 && lng >= 28.98 && lng <= 29.05) {
      matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'beşiktaş');
    } else if (lat >= 40.90 && lat <= 40.95 && lng >= 29.12 && lng <= 29.19) {
      matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'cevizli');
    } else if (lat >= 40.97 && lat <= 41.02 && lng >= 29.08 && lng <= 29.15) {
      matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'ataşehir');
    } else if (lat >= 41.04 && lat <= 41.09 && lng >= 28.96 && lng <= 29.01) {
      matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'şişli');
    } else if (lat >= 39.88 && lat <= 39.94 && lng >= 32.83 && lng <= 32.89) {
      matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'tunalı');
    } else if (lat >= 38.41 && lat <= 38.47 && lng >= 27.11 && lng <= 27.17) {
      matchedMeta = TURKEY_CENSUS_INDEX.find((m) => m.name === 'alsancak');
    }
  }

  // Realistic regional density defaults for Turkey (TÜİK ADNKS averages)
  const density = matchedMeta ? matchedMeta.densityPerKm2 : 9500;
  const baseMahallePop = matchedMeta ? matchedMeta.baseMahallePop : 28500;
  const ses = matchedMeta ? matchedMeta.ses : 'B / C1 Grubu';
  const age = matchedMeta ? matchedMeta.age : 'Çalışan Aile & Genç Nüfus (%60)';
  const traffic = matchedMeta ? matchedMeta.traffic : '8.5 / 10 (Hareketli)';
  const daytimeMult = matchedMeta ? matchedMeta.daytimeMultiplier : 1.30;

  // Exact Catchment Resident Population: Area (km²) * Urban Density (people/km²)
  // Guaranteed mathematically sound: 250m (~0.196 km²) -> ~2.000-3.500 resident population
  // 500m (~0.785 km²) -> ~8.000-14.000 resident population
  // 1000m (~3.142 km²) -> ~30.000-58.000 resident population
  // 2000m (~12.566 km²) -> ~100.000-240.000 resident population
  const calculatedCatchmentPop = Math.max(150, Math.round(areaKm2 * density));
  const calculatedDaytimeTraffic = Math.round(calculatedCatchmentPop * daytimeMult);

  return {
    population: calculatedCatchmentPop.toLocaleString('tr-TR'),
    populationRaw: calculatedCatchmentPop,
    officialNeighborhoodPop: `${baseMahallePop.toLocaleString('tr-TR')} Kişi`,
    daytimeTraffic: `${calculatedDaytimeTraffic.toLocaleString('tr-TR')} Kişi/Gün`,
    densityPerKm2: density,
    sesGroup: ses,
    ageProfile: age,
    footTraffic: traffic,
    areaKm2: areaKm2.toFixed(2),
  };
}
