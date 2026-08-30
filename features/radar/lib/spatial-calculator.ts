import type {
  CompetitorPoi,
  MarketGapConcept,
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
      {
        title: 'Mevcut Bir İşletmeyi Devralıp Markayı Yenileme',
        tag: 'Düşük Risk',
        description: 'Oturmuş yaya trafiğini koruyarak modern bir kurumsal kimlik ve menü/hizmet güncellemesiyle ciro artırma.',
        targetAudience: 'Yatırımcılar & Girişimciler',
        suitabilityScore: 89,
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
      {
        title: 'Hazır Ruhsatlı Devren İşletme ile Hızlı Başlangıç',
        tag: 'Zaman Tasarrufu',
        description: 'Sıfırdan tadilat ve ruhsat süreçlerine girmeden mevcut müşteri portföyünü devralıp verimlilik sağlama.',
        targetAudience: 'Girişimciler & Esnaflar',
        suitabilityScore: 88,
      },
    ],
  },
};

export function generateIntelligenceReport(
  categoryKey: RadarCategoryKey,
  metrics: RadarAnalysisMetrics,
  locationName?: string,
  lat?: number,
  lng?: number,
  radiusMeters: number = 500,
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

  // 3. EKSİK KONSEPTLER (FIRSAT AVCISI)
  const sectorPool = SECTOR_CONCEPTS[categoryKey] ?? SECTOR_CONCEPTS.default;
  const missingConcepts: MarketGapConcept[] = isUpperSes ? sectorPool.upperSes : sectorPool.standardSes;

  // 4. GİRİŞİM STRATEJİSİ & SEPET BEKLENTİSİ
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
  // İSTANBUL ANADOLU YAKASI
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

  // İSTANBUL AVRUPA YAKASI
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

  // ANKARA
  { name: 'çankaya', district: 'Çankaya', city: 'Ankara', densityPerKm2: 9500, baseMahallePop: 28400, ilcePop: 940000, ses: 'A / B Grubu', age: 'Bürokrat, Üniversite & Genç (%65)', traffic: '9.0 / 10 (Yoğun)', daytimeMultiplier: 1.65 },
  { name: 'tunalı', district: 'Çankaya', city: 'Ankara', densityPerKm2: 11800, baseMahallePop: 23500, ilcePop: 940000, ses: 'A+ / A Grubu', age: 'Genç Profesyonel & Üniversite (%69)', traffic: '9.3 / 10 (Çok Yoğun)', daytimeMultiplier: 2.10 },
  { name: 'yenimahalle', district: 'Yenimahalle', city: 'Ankara', densityPerKm2: 8400, baseMahallePop: 31000, ilcePop: 700000, ses: 'B / C1 Grubu', age: 'Memur, Aile & Çalışan (%60)', traffic: '8.6 / 10 (Hareketli)', daytimeMultiplier: 1.30 },
  { name: 'keçiören', district: 'Keçiören', city: 'Ankara', densityPerKm2: 12500, baseMahallePop: 37500, ilcePop: 940000, ses: 'B / C1 Grubu', age: 'Geniş Aile & Esnaf (%58)', traffic: '8.8 / 10 (Yoğun Nüfus)', daytimeMultiplier: 1.15 },
  { name: 'etimesgut', district: 'Etimesgut', city: 'Ankara', densityPerKm2: 7600, baseMahallePop: 33000, ilcePop: 620000, ses: 'B / C1 Grubu', age: 'Genç Aile & Kamu Çalışanı (%62)', traffic: '8.4 / 10 (Büyüyen)', daytimeMultiplier: 1.20 },

  // İZMİR
  { name: 'alsancak', district: 'Konak', city: 'İzmir', densityPerKm2: 14500, baseMahallePop: 26200, ilcePop: 330000, ses: 'A / B Grubu', age: 'Sosyal Gençlik & Ofis (%71)', traffic: '9.5 / 10 (Zirve Sirkülasyon)', daytimeMultiplier: 2.60 },
  { name: 'karşıyaka', district: 'Karşıyaka', city: 'İzmir', densityPerKm2: 13800, baseMahallePop: 34500, ilcePop: 350000, ses: 'A / B Grubu', age: 'Şehirli Genç & Aile (%66)', traffic: '9.2 / 10 (Çok Yoğun)', daytimeMultiplier: 1.50 },
  { name: 'bornova', district: 'Bornova', city: 'İzmir', densityPerKm2: 10800, baseMahallePop: 32000, ilcePop: 450000, ses: 'A / B Grubu', age: 'Öğrenci, Akademisyen & Aile (%68)', traffic: '9.1 / 10 (Üniversite Trafiği)', daytimeMultiplier: 1.80 },
  { name: 'konak', district: 'Konak', city: 'İzmir', densityPerKm2: 13200, baseMahallePop: 28000, ilcePop: 330000, ses: 'B / C1 Grubu', age: 'Ticaret & Şehir Merkezi (%64)', traffic: '9.4 / 10 (Yoğun Merkez)', daytimeMultiplier: 2.20 },
  { name: 'buca', district: 'Buca', city: 'İzmir', densityPerKm2: 14200, baseMahallePop: 38000, ilcePop: 520000, ses: 'B / C1 Grubu', age: 'Üniversite & Genç Nüfus (%67)', traffic: '8.9 / 10 (Yüksek Dinamizm)', daytimeMultiplier: 1.45 },

  // DİĞER BÜYÜKŞEHİRLER
  { name: 'özlüce', district: 'Nilüfer', city: 'Bursa', densityPerKm2: 8200, baseMahallePop: 32000, ilcePop: 540000, ses: 'A / B Grubu', age: 'Modern Aile & Gastronomi (%62)', traffic: '8.7 / 10 (Gelişen Cazibe)', daytimeMultiplier: 1.40 },
  { name: 'nilüfer', district: 'Nilüfer', city: 'Bursa', densityPerKm2: 7800, baseMahallePop: 31000, ilcePop: 540000, ses: 'A / B Grubu', age: 'Beyaz Yaka & Modern Aile (%63)', traffic: '8.8 / 10 (Prestij)', daytimeMultiplier: 1.35 },
  { name: 'osmangazi', district: 'Osmangazi', city: 'Bursa', densityPerKm2: 13500, baseMahallePop: 36000, ilcePop: 890000, ses: 'B / C1 Grubu', age: 'Tarihi Merkez & Ticaret (%60)', traffic: '9.2 / 10 (Yoğun Merkez)', daytimeMultiplier: 1.80 },
  { name: 'lara', district: 'Muratpaşa', city: 'Antalya', densityPerKm2: 8600, baseMahallePop: 33800, ilcePop: 520000, ses: 'A / B Grubu', age: 'Turist, Yabancı & Aile (%58)', traffic: '8.9 / 10 (Yüksek Sirkülasyon)', daytimeMultiplier: 1.80 },
  { name: 'muratpaşa', district: 'Muratpaşa', city: 'Antalya', densityPerKm2: 9200, baseMahallePop: 31500, ilcePop: 520000, ses: 'A / B Grubu', age: 'Hizmet Sektörü, Turizm & Aile (%60)', traffic: '9.0 / 10 (Yoğun)', daytimeMultiplier: 1.70 },
  { name: 'konyaaltı', district: 'Konyaaltı', city: 'Antalya', densityPerKm2: 6500, baseMahallePop: 28000, ilcePop: 210000, ses: 'A / B Grubu', age: 'Yabancı, Sahil & Genç (%62)', traffic: '8.7 / 10 (Turizm & Sahil)', daytimeMultiplier: 1.75 },
  { name: 'izmit', district: 'İzmit', city: 'Kocaeli', densityPerKm2: 9500, baseMahallePop: 27500, ilcePop: 375000, ses: 'B / C1 Grubu', age: 'Sanayi, Üniversite & Aile (%61)', traffic: '8.8 / 10 (Bölgesel Merkez)', daytimeMultiplier: 1.50 },
  { name: 'gebze', district: 'Gebze', city: 'Kocaeli', densityPerKm2: 11000, baseMahallePop: 34000, ilcePop: 410000, ses: 'B / C1 Grubu', age: 'Sanayi, Teknoloji & İş Gücü (%63)', traffic: '8.9 / 10 (Sanayi & Ticaret)', daytimeMultiplier: 1.45 },
  { name: 'seyhan', district: 'Seyhan', city: 'Adana', densityPerKm2: 13000, baseMahallePop: 35000, ilcePop: 800000, ses: 'B / C1 Grubu', age: 'Geleneksel Ticaret & Aile (%59)', traffic: '9.0 / 10 (Yoğun Ticaret)', daytimeMultiplier: 1.60 },
  { name: 'çukurova', district: 'Çukurova', city: 'Adana', densityPerKm2: 8800, baseMahallePop: 32000, ilcePop: 390000, ses: 'A / B Grubu', age: 'Modern Şehirli & Aile (%62)', traffic: '8.6 / 10 (Prestij)', daytimeMultiplier: 1.30 },
  { name: 'şahinbey', district: 'Şahinbey', city: 'Gaziantep', densityPerKm2: 14500, baseMahallePop: 42000, ilcePop: 940000, ses: 'B / C1 Grubu', age: 'Ticaret & Geniş Aile (%60)', traffic: '9.2 / 10 (Yüksek Hacim)', daytimeMultiplier: 1.50 },
  { name: 'selçuklu', district: 'Selçuklu', city: 'Konya', densityPerKm2: 8200, baseMahallePop: 36000, ilcePop: 690000, ses: 'B / C1 Grubu', age: 'Üniversite, Sanayi & Aile (%61)', traffic: '8.7 / 10 (Büyüyen)', daytimeMultiplier: 1.35 },
  { name: 'tepebaşı', district: 'Tepebaşı', city: 'Eskişehir', densityPerKm2: 9800, baseMahallePop: 31000, ilcePop: 390000, ses: 'A / B Grubu', age: 'Öğrenci, Genç & Kültür (%69)', traffic: '9.1 / 10 (Öğrenci & Dinamik)', daytimeMultiplier: 1.85 },
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
    if (lat >= 40.96 && lat <= 41.01 && lng >= 29.01 && lng <= 29.08) {
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
