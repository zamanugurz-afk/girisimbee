import { normalizeListingDescription } from '@/features/listings/lib/listing-content-quality';

export type ServiceSummaryDraft = {
  shortDescription: string;
  longDescription: string;
};

export interface ServiceSummaryContext {
  serviceCategory?: string;
  craftsmanTitle?: string;
  experienceYears?: string;
  pricingType?: string;
  workingHours?: string;
  emergency247?: boolean;
  servicesList?: string[] | string;
  serviceDistricts?: string[] | string;
  city?: string | null;
  district?: string | null;
}

export function buildServiceSummaryDraft(ctx: ServiceSummaryContext): ServiceSummaryDraft {
  const parseList = (val?: string[] | string): string[] => {
    if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const category = ctx.serviceCategory?.trim() || 'Hizmet ve Ustalık';
  const title = ctx.craftsmanTitle?.trim() || `${category} Hizmetleri`;
  const exp = ctx.experienceYears?.trim() || '';
  const pricing = ctx.pricingType?.trim() || '';
  const hours = ctx.workingHours?.trim() || '';
  const emergency = Boolean(ctx.emergency247);
  const city = ctx.city?.trim() || '';
  const district = ctx.district?.trim() || '';
  const services = parseList(ctx.servicesList);
  const districts = parseList(ctx.serviceDistricts);

  // 1. Kısa Açıklama (Arka planda DB ve kartlar için otomatik sentezlenir)
  const locPart = districts.length > 0
    ? districts.slice(0, 3).join(', ')
    : (district ? `${district}, ${city}` : (city || 'tüm bölge'));
  const servPart = services.length > 0 ? services.slice(0, 3).join(', ') : category;
  const expPart = exp ? `${exp} deneyimle ` : '';

  const shortDescription = `${expPart}${locPart} genelinde ${servPart} alanında profesyonel ve güvenilir hizmet.`;

  // 2. Detaylı Açıklama (Akıllı Taslak / Profesyonel Müşteri Metni)
  const paragraphs: string[] = [];

  // Paragraf 1: Kimlik & Deneyim
  let p1 = `${title} olarak ${city ? `${city} ve çevresinde ` : ''}${category.toLowerCase()} alanında `;
  if (exp) {
    p1 += `${exp} mesleki tecrübemiz ve uzman kadromuzla güvenilir, kaliteli ve dürüst hizmet sunuyoruz. `;
  } else {
    p1 += `uzman kadromuzla güvenilir, kaliteli ve dürüst hizmet sunuyoruz. `;
  }
  p1 += `İşimizi her zaman söz verdiğimiz saatte, temiz işçilik ve müşteri memnuniyeti ilkesiyle teslim ediyoruz.`;
  paragraphs.push(p1);

  // Paragraf 2: Verilen Hizmet Kalemleri
  if (services.length > 0) {
    const p2 = `Faaliyet gösterdiğimiz başlıca hizmet kalemleri:\n` +
      services.map((s) => `• ${s}`).join('\n');
    paragraphs.push(p2);
  }

  // Paragraf 3: Hizmet Verilen İlçeler
  if (districts.length > 0) {
    paragraphs.push(
      `Hizmet verdiğimiz ilçeler ve servis ağımız: ${districts.join(', ')}. ` +
      `Gezici servisimizle adresinize en kısa sürede ulaşıyor, yerinde tespit ve uygulama sağlıyoruz.`
    );
  }

  // Paragraf 4: Çalışma Saatleri & Fiyatlandırma
  const conditions: string[] = [];
  if (hours) {
    conditions.push(`Çalışma saatlerimiz: ${hours}.`);
  }
  if (emergency) {
    conditions.push(`Acil arıza ve çağrılar için 7/24 kesintisiz nöbetçi servisimiz mevcuttur.`);
  }
  if (pricing) {
    conditions.push(`Fiyatlandırma modelimiz: ${pricing}.`);
  }

  if (conditions.length > 0) {
    paragraphs.push(conditions.join(' '));
  }

  const longDescription = normalizeListingDescription(paragraphs.join('\n\n'));

  return {
    shortDescription,
    longDescription,
  };
}
