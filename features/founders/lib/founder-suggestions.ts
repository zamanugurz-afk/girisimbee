import {
  ALL_PARTNERSHIP_TYPES,
  PARTNERSHIP_TYPE_CATEGORIES,
} from '@/features/listings/config/listing-field-options';
import { normalizeTurkishSearch } from '@/features/shared/services/set-matching.service';

export interface FounderSuggestionContext {
  sector?: string | null;
  stage?: string | null;
  targetPartnerType?: string | null;
  title?: string | null;
  shortDescription?: string | null;
}

export interface FounderSuggestionsResult {
  partnershipTypes: string[];
  professionalSkills: string[];
  technicalSkills: string[];
  tools: string[];
}

/** Sektör bazlı akıllı kütüphane haritası */
const SECTOR_FOUNDER_PROFILES: Record<
  string,
  {
    partnershipTypes: string[];
    professionalSkills: string[];
    technicalSkills: string[];
    tools: string[];
  }
> = {
  // 1. Yazılım / SaaS / Teknoloji / Yapay Zeka
  tech: {
    partnershipTypes: [
      'Teknik Ortak (CTO)',
      'Yazılım ve Sistem Geliştirme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Ürün Yönetimi Ortağı (CPO)',
      'Kurucu Ortak (Co-Founder)',
      'Melek Yatırımcı (Angel Investor)',
      'Yapay Zeka ve Makine Öğrenimi Ortağı (AI/ML)',
      'DevOps ve Bulut Altyapı Ortağı',
      'Siber Güvenlik ve Ağ Güvenliği Ortağı',
      'Tasarım ve UI / UX Ortağı',
      'Satış ve B2B İş Geliştirme Ortağı',
      'Finans ve Muhasebe Ortağı (CFO)',
    ],
    professionalSkills: [
      'Ürün Yönetimi (CPO)',
      'Büyüme Pazarlaması (Growth)',
      'B2B Satış ve İş Geliştirme',
      'UI / UX Tasarımı ve Kullanıcı Deneyimi',
      'Yatırımcı İlişkileri ve Sunum (Pitching)',
      'Müşteri Başarısı (Customer Success)',
      'Dijital Pazarlama ve SEO / SEM',
      'Agile / Scrum Proje Yönetimi',
      'Hukuk, KVKK ve Sözleşme Yönetimi',
      'Finansal Modelleme ve Birim Ekonomi (Unit Economics)',
    ],
    technicalSkills: [
      'Full-Stack Web Geliştirme',
      'Mobil Uygulama Geliştirme (iOS / Android)',
      'Yapay Zeka ve Makine Öğrenimi (AI / ML / LLM)',
      'Bulut Mimarisi ve DevOps (AWS / GCP / Docker)',
      'Sistem ve Veritabanı Mimarisi (PostgreSQL / Redis)',
      'Mikroservis ve REST / GraphQL API Tasarımı',
      'Siber Güvenlik ve Veri Gizliliği',
      'Veri Analitiği ve Büyük Veri',
      'Ödeme Sistemleri Entegrasyonu (Stripe / İyzico)',
      'CI / CD Süreçleri ve Otomasyon',
    ],
    tools: [
      'Next.js / React',
      'Node.js / TypeScript',
      'Python / FastAPI',
      'PostgreSQL',
      'Amazon Web Services (AWS)',
      'Google Cloud Platform (GCP)',
      'Docker / Kubernetes',
      'Figma',
      'Jira / Linear',
      'Git / GitHub',
      'Stripe / İyzico',
      'Supabase / Firebase',
    ],
  },

  // 2. E-Ticaret / Perakende / Pazar Yeri
  ecommerce: {
    partnershipTypes: [
      'E-Ticaret ve Pazar Yeri Operasyon Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Tedarik Zinciri ve Lojistik Yönetim Ortağı',
      'Dijital Pazarlama ve SEO / SEM Ortağı',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
      'Depo ve Lojistik Alanı Sağlayıcı Ortak',
      'Satın Alma ve Tedarik Operasyon Ortağı',
      'İhracat ve Uluslararası Pazarlar Ortağı',
      'Fotoğraf, Video ve Prodüksiyon Ortağı',
      'İşletme Ortağı',
    ],
    professionalSkills: [
      'E-Ticaret Operasyon Yönetimi',
      'Performans Pazarlaması (Meta Ads / Google Ads)',
      'Tedarikçi ve Satın Alma Yönetimi',
      'Pazar Yeri Yönetimi (Trendyol / Hepsiburada / Amazon)',
      'Dönüşüm Oranı Optimizasyonu (CRO)',
      'Müşteri Hizmetleri ve İade Yönetimi',
      'Stok ve Envanter Planlama',
      'E-İhracat ve Mikro İhracat',
      'Marka Konumlandırma ve Kreatif Strateji',
      'Karlılık ve Marj Analizi',
    ],
    technicalSkills: [
      'E-Ticaret Altyapı Yönetimi (Shopify / WooCommerce)',
      'Pazar Yeri ve ERP Entegrasyonları',
      'Google Analytics 4 ve Tag Manager',
      'E-Posta Pazarlama Otomasyonu (Klaviyo / Mailchimp)',
      'SEO ve Ürün Sayfası Optimizasyonu',
      'Katalog ve Feed Yönetimi',
      'Ödeme ve Kargo API Entegrasyonları',
      'Veri Analitiği ve Satış Raporlama',
    ],
    tools: [
      'Shopify',
      'WooCommerce / WordPress',
      'Meta Business Suite / Ads Manager',
      'Google Ads & GA4',
      'Trendyol / Amazon Satıcı Paneli',
      'Klaviyo',
      'Canva / Photoshop',
      'Excel / Google Sheets',
      'Logo / Nebim / Ticimax',
    ],
  },

  // 3. Restoran / Cafe / Gıda / Dark Kitchen
  food: {
    partnershipTypes: [
      'Restoran ve Cafe İşletme Ortağı',
      'Dükkan ve Mağaza Alanı Sağlayıcı Ortak',
      'Mutfak, Restoran ve Dark Kitchen Alanı Ortağı',
      'İşletme Ortağı',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
      'Franchise ve Şube İşletme Ortağı',
      'Satın Alma ve Tedarik Operasyon Ortağı',
      'Ruhsat, Lisans ve İzin Sahibi Ortak',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Yatırımcı Ortak (Mali Destek)',
    ],
    professionalSkills: [
      'Restoran ve Mutfak Operasyon Yönetimi',
      'Gıda Hijyen, Kalite ve HACCP Standartları',
      'Maliyet Muhasebesi (Food Cost / Cost Control)',
      'Menü Mühendisliği ve Reçete Standardizasyonu',
      'Şube ve Servis Ekibi Yönetimi',
      'Tedarikçi Pazarlığı ve Hammadde Yönetimi',
      'Online Paket Servis Yönetimi (Yemeksepeti / Getir / Trendyol)',
      'Franchise Sistemi Kurulumu',
      'Müşteri Memnuniyeti ve Şikayet Yönetimi',
      'Ruhsat ve Belediye Mevzuatı Takibi',
    ],
    technicalSkills: [
      'Restoran POS ve Sipariş Otomasyonu',
      'Paket Servis Entegrasyonları',
      'Stok ve Reçete Maliyet Takip Yazılımları',
      'Sosyal Medya ve Yerel Dijital Reklamcılık',
      'Google Haritalar ve Yorum Optimizasyonu',
      'Gıda Güvenliği Denetim Protokolleri',
      'Soğuk Zincir ve Depolama Standartları',
    ],
    tools: [
      'Restoran POS Sistemleri (Adisyo / SambaPOS / Simpra)',
      'Yemeksepeti / GetirYemek / Trendyol Yemek Panelleri',
      'Instagram / Meta Ads',
      'Google İşletme Profili',
      'Excel / Reçete Maliyet Tabloları',
      'Stok ve Sayım Programları',
    ],
  },

  // 4. Üretim / Sanayi / Fabrika / Atölye
  manufacturing: {
    partnershipTypes: [
      'Fabrika ve Üretim Tesisi Sağlayıcı Ortak',
      'Endüstriyel Makine ve Ekipman Sağlayıcı Ortak',
      'Üretim ve Tesis Operasyon Ortağı',
      'Tedarik Zinciri ve Lojistik Yönetim Ortağı',
      'Atölye ve İmalathane Alanı Sağlayıcı Ortak',
      'İhracat ve Uluslararası Pazarlar Ortağı',
      'Kalite ve Süreç Yönetimi Ortağı',
      'Arsa, Arazi ve Gayrimenkul Sağlayıcı Ortak',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
      'Stratejik Yatırımcı (Sektörel Güç)',
    ],
    professionalSkills: [
      'Üretim Planlama ve Kapasite Yönetimi',
      'Kalite Güvence ve ISO Standartları',
      'Yalın Üretim (Lean) ve 5S Metodolojisi',
      'Hammadde Satın Alma ve Tedarik Zinciri',
      'İhracat Operasyonları ve Gümrük Mevzuatı',
      'Tesis ve Fabrika Yönetimi',
      'İş Sağlığı ve Güvenliği (İSG)',
      'B2B Endüstriyel Satış ve İhale Süreçleri',
      'Maliyet Analizi ve Fire Azaltma',
      'Ar-Ge ve Ürün Geliştirme Süreçleri',
    ],
    technicalSkills: [
      'CAD / CAM ve 3D Modelleme (SolidWorks / AutoCAD)',
      'CNC ve Otomasyon Programlama',
      'PLC ve SCADA Sistemleri',
      'ERP ve Üretim Takip Yazılımları (SAP / Logo / IFS)',
      'Teknik Çizim ve Tolerans Analizi',
      'Kalıp ve Takım Tasarımı',
      'Endüstriyel Bakım ve Onarım Planlama',
      'CE ve Sanayi Tip Onay Belgelendirme',
    ],
    tools: [
      'SolidWorks / AutoCAD',
      'SAP / Logo ERP',
      'MS Excel (İleri Seviye Üretim Planlama)',
      'Siemens / Schneider Otomasyon',
      'CNC Kontrol Üniteleri',
      'Teknik Dokümantasyon Yazılımları',
    ],
  },

  // 5. Hizmet / Danışmanlık / Medya / Eğitim / Finans
  service: {
    partnershipTypes: [
      'İşletme Ortağı',
      'Yönetim Ortağı',
      'Satış ve B2B İş Geliştirme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Finans ve Muhasebe Ortağı (CFO)',
      'Hukuk, KVKK ve Regülasyon Ortağı',
      'Ofis ve Çalışma Alanı Sağlayıcı Ortak',
      'Melek Yatırımcı (Angel Investor)',
      'İletişim, Medya ve PR Ortağı',
      'İnsan Kaynakları ve Yetenek Yönetimi Ortağı',
    ],
    professionalSkills: [
      'B2B Kurumsal Satış ve Müşteri Kazanımı',
      'Stratejik Danışmanlık ve İş Geliştirme',
      'Proje ve Hizmet Teslimat Yönetimi',
      'Müşteri İlişkileri (Account Management)',
      'İçerik Stratejisi ve Kurumsal İletişim',
      'Eğitim ve Müfredat Geliştirme',
      'Finansal Raporlama ve Bütçeleme',
      'Sözleşme ve Hukuki Danışmanlık',
      'Ekip Kurma ve Yetenek Yönetimi',
    ],
    technicalSkills: [
      'CRM ve Satış Hattı Yönetimi (HubSpot / Salesforce)',
      'Dijital Pazarlama ve Lead Generation',
      'Veri Analitiği ve Dashboard Oluşturma (PowerBI / Looker)',
      'Sunum ve Teklif Hazırlama',
      'LMS (Öğrenme Yönetim Sistemleri)',
      'Video Prodüksiyon ve Canlı Yayın Altyapısı',
    ],
    tools: [
      'HubSpot / Salesforce',
      'Notion / ClickUp / Asana',
      'Zoom / Google Meet / Teams',
      'PowerBI / Google Looker Studio',
      'Canva / Keynote / PowerPoint',
      'Slack / Discord',
    ],
  },
};

/** Sektör metninden profil ailesini tespit eder */
function detectSectorFamily(sectorText: string): 'tech' | 'ecommerce' | 'food' | 'manufacturing' | 'service' {
  const s = normalizeTurkishSearch(sectorText || '');
  if (
    s.includes('yazilim') ||
    s.includes('saas') ||
    s.includes('teknoloji') ||
    s.includes('yapay zeka') ||
    s.includes('ai') ||
    s.includes('bilgisayar') ||
    s.includes('mobil') ||
    s.includes('siber') ||
    s.includes('oyun') ||
    s.includes('fintech') ||
    s.includes('biyoteknoloji')
  ) {
    return 'tech';
  }
  if (
    s.includes('e-ticaret') ||
    s.includes('eticaret') ||
    s.includes('perakende') ||
    s.includes('pazar yeri') ||
    s.includes('magaza') ||
    s.includes('ihracat') ||
    s.includes('tekstil') ||
    s.includes('moda')
  ) {
    return 'ecommerce';
  }
  if (
    s.includes('gida') ||
    s.includes('restoran') ||
    s.includes('cafe') ||
    s.includes('kahve') ||
    s.includes('yemek') ||
    s.includes('mutfak') ||
    s.includes('fast food') ||
    s.includes('firin') ||
    s.includes('pastane')
  ) {
    return 'food';
  }
  if (
    s.includes('uretim') ||
    s.includes('sanayi') ||
    s.includes('fabrika') ||
    s.includes('imalat') ||
    s.includes('makine') ||
    s.includes('otomotiv') ||
    s.includes('tarim') ||
    s.includes('enerji') ||
    s.includes('insaat') ||
    s.includes('lojistik')
  ) {
    return 'manufacturing';
  }
  return 'service';
}

/** 1. Adım bilgilerini analiz edip 2. Adım için dinamik öneriler üretir */
export function resolveFounderSuggestions(context: FounderSuggestionContext): FounderSuggestionsResult {
  const combinedContextText = [
    context.sector,
    context.stage,
    context.targetPartnerType,
    context.title,
    context.shortDescription,
  ]
    .filter(Boolean)
    .join(' ');

  const family = detectSectorFamily(combinedContextText);
  const profile = SECTOR_FOUNDER_PROFILES[family] || SECTOR_FOUNDER_PROFILES.tech;

  // Aşamaya göre dinamik eklemeler
  const stageNormalized = normalizeTurkishSearch(context.stage || '');
  const stageExtraPartners: string[] = [];

  if (stageNormalized.includes('fikir') || stageNormalized.includes('mvp')) {
    stageExtraPartners.push('Kurucu Ortak (Co-Founder)', 'Teknik Ortak (CTO)', 'Melek Yatırımcı (Angel Investor)');
  } else if (stageNormalized.includes('faal') || stageNormalized.includes('buyume') || stageNormalized.includes('gelir')) {
    stageExtraPartners.push('Stratejik Yatırımcı (Sektörel Güç)', 'Sermaye Ortağı (Sessiz / Finansal Ortak)', 'Satış ve B2B İş Geliştirme Ortağı');
  }

  // Ortaklık türleri listesi (Önerilenler en başta, ardından tüm katalog)
  const prioritizedPartnershipTypes = Array.from(
    new Set([
      ...stageExtraPartners,
      ...profile.partnershipTypes,
      ...ALL_PARTNERSHIP_TYPES,
    ])
  );

  return {
    partnershipTypes: prioritizedPartnershipTypes,
    professionalSkills: profile.professionalSkills,
    technicalSkills: profile.technicalSkills,
    tools: profile.tools,
  };
}
