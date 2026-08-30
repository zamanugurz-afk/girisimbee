import type {
  CompetitorPoi,
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

export function computeRadarMetrics(
  competitorCount: number,
  radiusMeters: number,
  categoryKey: RadarCategoryKey,
): RadarAnalysisMetrics {
  const categoryMeta = RADAR_CATEGORIES[categoryKey] ?? RADAR_CATEGORIES.cafe;
  const radiusKm = radiusMeters / 1000;
  const areaKm2 = Math.max(0.01, parseFloat((Math.PI * Math.pow(radiusKm, 2)).toFixed(3)));
  const densityPerKm2 = Math.round(competitorCount / areaKm2);

  // Saturation comparison
  const idealDensity = categoryMeta.idealDensityPerKm2;
  const saturationRatio = densityPerKm2 / idealDensity;
  const saturationScore = Math.min(100, Math.max(5, Math.round(saturationRatio * 55)));

  let saturationLevel: SaturationLevel = 'moderate';
  let saturationLabel = 'Dengeli Pazar — İstikrarlı Talep';
  let opportunityScore = 7.5;
  let opportunityLabel = 'Yatırıma Uygun';

  if (saturationScore < 35) {
    saturationLevel = 'low';
    saturationLabel = 'Düşük Yoğunluk — Yüksek Büyüme Fırsatı';
    opportunityScore = Math.min(9.8, parseFloat((8.8 + Math.random() * 0.8).toFixed(1)));
    opportunityLabel = 'Çok Yüksek Fırsat';
  } else if (saturationScore <= 70) {
    saturationLevel = 'moderate';
    saturationLabel = 'Dengeli Rekabet — Doğru Konseptle Büyüme';
    opportunityScore = Math.min(8.9, Math.max(6.5, parseFloat((7.4 + (70 - saturationScore) * 0.03).toFixed(1))));
    opportunityLabel = 'Yatırıma Uygun';
  } else if (saturationScore <= 90) {
    saturationLevel = 'high';
    saturationLabel = 'Yüksek Rekabet — Güçlü Farklılaşma Şart';
    opportunityScore = Math.max(4.5, parseFloat((5.8 - (saturationScore - 70) * 0.04).toFixed(1)));
    opportunityLabel = 'Dikkatli Planlama Gerekli';
  } else {
    saturationLevel = 'oversaturated';
    saturationLabel = 'Aşırı Doygun — Niş Konsept Dışında Riskli';
    opportunityScore = Math.max(2.5, parseFloat((3.8 - (saturationScore - 90) * 0.05).toFixed(1)));
    opportunityLabel = 'Yüksek Rekabet Riski';
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

export function generateIntelligenceReport(
  categoryKey: RadarCategoryKey,
  metrics: RadarAnalysisMetrics,
  locationName?: string,
): RadarIntelligenceReport {
  const meta = RADAR_CATEGORIES[categoryKey] ?? RADAR_CATEGORIES.cafe;
  const loc = locationName ? `${locationName} bölgesinde` : 'Seçilen çember alanında';

  if (metrics.saturationLevel === 'low') {
    return {
      summaryAdvice: `${loc} ${meta.label.toLowerCase()} alanında belirgin bir arz açığı tespit edildi. ${metrics.competitorCount} adet mevcut işletme ile bölge potansiyelinin oldukça gerisinde. Yeni nesil ve güçlü müşteri deneyimi sunan bir konseptle hızlı pazar payı kazanılabilir.`,
      pros: [
        'Bölgedeki yerel talep karşısında rakip sayısı çok düşük',
        'İlk giren işletme olma (first-mover) marka avantajı',
        'Bölge sakinlerinin alternatif arayışı yüksek',
      ],
      cons: [
        'Konsept tanıtımı için başlangıçta güçlü yerel lansman gerekebilir',
        'Tedarik zinciri ve lojistik maliyetleri optimize edilmeli',
      ],
      targetDemographic: 'Çevre sitelerde yaşayan genç profesyoneller, aileler ve dijital çalışanlar.',
      differentiationIdea: 'Sadakat programı, mobil ön sipariş ve organik/premium ürün çeşitliliği ile bölgenin çekim merkezi olmak.',
      recommendedPricePoint: 'Orta-Üst Segment (Kalite ve deneyim odaklı fiyatlandırma)',
    };
  }

  if (metrics.saturationLevel === 'moderate') {
    return {
      summaryAdvice: `${loc} pazar dengeli bir yapı sergiliyor. ${metrics.competitorCount} adet işletme var ancak henüz tekelleşen veya müşteri sadakatini tamamen domine eden bir yapı bulunmuyor. Hizmet kalitesi ve dijital görünürlükle öne çıkmak mümkün.`,
      pros: [
        'Kanıtlanmış ve hazır bir müşteri kitlesi mevcut',
        'Yaya ve araç sirkülasyonu ticareti destekliyor',
        'Ortalama sepet tutarı işletme kârlılığını karşılıyor',
      ],
      cons: [
        'Mevcut işletmelerin sabit müşteri alışkanlıkları aşılmalı',
        'Kira ve lokasyon maliyetleri dikkatle analiz edilmeli',
      ],
      targetDemographic: 'Genç nüfus, üniversite öğrencileri, plaza çalışanları ve mahalle müdavimleri.',
      differentiationIdea: 'Paket servis hızı, özel abonelik modelleri ve tematik mekân tasarımı.',
      recommendedPricePoint: 'Dinamik Fiyatlandırma (Hafta içi avantajlı menüler / hafta sonu premium deneyim)',
    };
  }

  if (metrics.saturationLevel === 'high') {
    return {
      summaryAdvice: `${loc} ${meta.label.toLowerCase()} yoğunluğu yüksek (${metrics.competitorCount} işletme). Standart ve jenerik bir operasyon yerine kesinlikle özelleşmiş bir alt-niş (örneğin glutensiz/vegan, 3. nesil mikro kavurma veya 7/24 ekspres servis) tercih edilmelidir.`,
      pros: [
        'Bölge zaten hedef kitle için bir cazibe merkezi',
        'Müşteri arayışı sürekli ve yüksek hacimli',
      ],
      cons: [
        'Fiyat rekabeti ve kâr marjı baskısı yüksek',
        'Nitelikli personel tutundurma maliyeti artabilir',
      ],
      targetDemographic: 'Seçici, trendleri takip eden ve deneyim odaklı Z kuşağı / Y kuşağı tüketiciler.',
      differentiationIdea: 'Mikro-uzmanlaşma: Tek bir üründe ustalaşarak şehrin en iyisi algısını oluşturmak.',
      recommendedPricePoint: 'Niş Premium veya Yüksek Hacimli Ekspres Fiyatlandırma',
    };
  }

  return {
    summaryAdvice: `${loc} pazar doygunluk seviyesine ulaşmış durumda (${metrics.competitorCount} rakip). Sıfırdan dükkan açmak yerine sitedeki **aktif devren işletme** veya **mevcut ortaklık** ilanlarını değerlendirmek maliyet ve zaman açısından çok daha avantajlıdır.`,
    pros: [
      'Girişimbee üzerinde hazır devir ve ortaklık fırsatları mevcut',
      'Müşteri trafiği oturmuş lokasyonlar devralınabilir',
    ],
    cons: [
      'Sıfırdan açılışlarda yüksek yatırım amortisman süresi',
      'Aşırı fiyat kırma savaşları',
    ],
    targetDemographic: 'Geniş kitle, hızlı tüketim arayan transit yayalar.',
    differentiationIdea: 'Mevcut bir işletmeyi devralıp marka kimliğini ve menüyü yenileyerek hızlı ciro artışı yakalamak.',
    recommendedPricePoint: 'Rekabetçi Fiyat / Yüksek Paket Satış',
  };
}

export interface DemographicProfile {
  population: string;
  populationRaw: number;
  densityPerKm2: number;
  sesGroup: string;
  ageProfile: string;
  footTraffic: string;
  areaKm2: string;
}

export function resolveDemographicProfile(
  lat: number,
  lng: number,
  radiusMeters: number,
  locationName?: string,
): DemographicProfile {
  const radiusKm = radiusMeters / 1000;
  const areaKm2 = Math.PI * Math.pow(radiusKm, 2);

  let density = 14500;
  let ses = 'B / C1 Grubu';
  let age = 'Çalışan Kitle & Aile (%58)';
  let traffic = '8.4 / 10 (Hareketli)';

  const loc = (locationName || '').toLowerCase();

  // 1. Kadıköy / Moda cluster (Lat: 40.96-41.00, Lng: 29.01-29.08)
  if (loc.includes('moda') || loc.includes('kadıköy') || (lat >= 40.96 && lat <= 41.00 && lng >= 29.01 && lng <= 29.08)) {
    density = 24800;
    ses = 'A+ / A Grubu';
    age = 'Genç Profesyonel & Üniversite (%64)';
    traffic = '9.4 / 10 (Çok Yoğun)';
  }
  // 2. Beşiktaş / Şişli / Nişantaşı / Beyoğlu (Lat: 41.02-41.07, Lng: 28.96-29.03)
  else if (loc.includes('beşiktaş') || loc.includes('nişantaşı') || loc.includes('şişli') || (lat >= 41.02 && lat <= 41.07 && lng >= 28.96 && lng <= 29.03)) {
    density = 26500;
    ses = 'A+ / A Grubu';
    age = 'Genç Kitle & Beyaz Yaka (%68)';
    traffic = '9.6 / 10 (Çok Yoğun)';
  }
  // 3. Kartal / Maltepe / Cevizli cluster (Lat: 40.90-40.94, Lng: 29.13-29.20)
  else if (loc.includes('cevizli') || loc.includes('kartal') || loc.includes('maltepe') || (lat >= 40.90 && lat <= 40.94 && lng >= 29.13 && lng <= 29.20)) {
    density = 19400;
    ses = 'B / C1 Grubu';
    age = 'Çalışan Aile & Genç Nüfus (%62)';
    traffic = '8.7 / 10 (Yoğun Ticaret)';
  }
  // 4. Çankaya / Tunalı (Lat: 39.88-39.93, Lng: 32.83-32.88)
  else if (loc.includes('çankaya') || loc.includes('tunalı') || (lat >= 39.88 && lat <= 39.93 && lng >= 32.83 && lng <= 32.88)) {
    density = 17800;
    ses = 'A / B Grubu';
    age = 'Bürokrat, Üniversite & Genç (%61)';
    traffic = '9.0 / 10 (Yoğun)';
  }
  // 5. Karşıyaka / Alsancak / Konak (Lat: 38.42-38.48, Lng: 27.09-27.16)
  else if (loc.includes('karşıyaka') || loc.includes('alsancak') || (lat >= 38.42 && lat <= 38.48 && lng >= 27.09 && lng <= 27.16)) {
    density = 21200;
    ses = 'A / B Grubu';
    age = 'Sosyal Gençlik & Şehirli (%63)';
    traffic = '9.2 / 10 (Çok Yoğun)';
  }
  // 6. Nilüfer / Özlüce (Lat: 40.20-40.24, Lng: 28.90-28.96)
  else if (loc.includes('özlüce') || loc.includes('nilüfer') || (lat >= 40.20 && lat <= 40.24 && lng >= 28.90 && lng <= 28.96)) {
    density = 16200;
    ses = 'A / B Grubu';
    age = 'Modern Aile & Gastronomi Kitlesi (%57)';
    traffic = '8.6 / 10 (Gelişen Cazibe)';
  }
  // 7. Muratpaşa / Lara (Lat: 36.84-36.88, Lng: 30.73-30.79)
  else if (loc.includes('lara') || loc.includes('muratpaşa') || (lat >= 36.84 && lat <= 36.88 && lng >= 30.73 && lng <= 30.79)) {
    density = 14200;
    ses = 'A / B Grubu (Turizm & Yerleşik)';
    age = 'Turist & Yerleşik Yabancı / Aile (%54)';
    traffic = '8.8 / 10 (Yüksek Sirkülasyon)';
  }
  // 8. General Istanbul metropolitan
  else if (lat >= 40.80 && lat <= 41.30 && lng >= 28.40 && lng <= 29.60) {
    density = 18500;
    ses = 'B / C1 Grubu';
    age = 'Çalışan Kitle & Genç Nüfus (%60)';
    traffic = '8.5 / 10 (Hareketli)';
  }

  const popRaw = Math.round(areaKm2 * density);

  return {
    population: popRaw > 0 ? popRaw.toLocaleString('tr-TR') : '11.800',
    populationRaw: popRaw,
    densityPerKm2: density,
    sesGroup: ses,
    ageProfile: age,
    footTraffic: traffic,
    areaKm2: areaKm2.toFixed(2),
  };
}
