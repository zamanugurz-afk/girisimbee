import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
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

interface SectorProfile {
  partnershipTypes: string[];
  professionalSkills: string[];
  technicalSkills: string[];
  tools: string[];
}

const SECTOR_PROFILES: Record<string, SectorProfile> = {
  // 1. Sağlık / Sağlık Teknolojisi / Medikal / Biyoteknoloji
  health: {
    partnershipTypes: [
      'Yönetim Ortağı',
      'İşletme Ortağı',
      'Teknik Ortak (CTO)',
      'Biyoteknoloji ve Sağlık Teknolojisi Ortağı',
      'Yazılım ve Sistem Geliştirme Ortağı',
      'Hukuk, KVKK ve Regülasyon Ortağı',
      'Melek Yatırımcı (Angel Investor)',
      'Stratejik Yatırımcı (Sektörel Güç)',
    ],
    professionalSkills: [
      'Sağlık Sektörü ve Klinik Süreç Yönetimi',
      'Medikal Regülasyon ve CE / FDA / Sağlık Bakanlığı Onayları',
      'B2B Hastane ve Klinik Satış / İş Geliştirme',
      'KVKK ve Sağlık Verisi Gizliliği Yönetimi',
      'Yatırımcı İlişkileri ve Sağlık Fonları',
      'Ürün Yönetimi (HealthTech CPO)',
    ],
    technicalSkills: [
      'Sağlık Bilişimi ve HL7 / FHIR Entegrasyonu',
      'Biyomedikal Veri Analizi ve AI Tanı Modelleri',
      'Medikal Cihaz ve Gömülü Sistem Yazılımı',
      'Bulut Mimarisi ve HIPAA / KVKK Uyumlu Altyapı',
      'Teletıp ve Mobil Sağlık Uygulama Geliştirme',
      'Görüntü İşleme ve Radyoloji AI',
    ],
    tools: [
      'Python / PyTorch (Medikal AI)',
      'PostgreSQL / HL7 FHIR',
      'AWS HealthLake / GCP Healthcare',
      'Docker / Kubernetes',
      'Figma (Medikal UI/UX)',
      'Jira / Confluence',
    ],
  },

  // 2. Yazılım / SaaS / Yapay Zeka / Derin Teknoloji
  tech: {
    partnershipTypes: [
      'Teknik Ortak (CTO)',
      'Yazılım ve Sistem Geliştirme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Ürün Yönetimi Ortağı (CPO)',
      'Kurucu Ortak (Co-Founder)',
      'Yapay Zeka ve Makine Öğrenimi Ortağı (AI/ML)',
      'Melek Yatırımcı (Angel Investor)',
      'DevOps ve Bulut Altyapı Ortağı',
    ],
    professionalSkills: [
      'Ürün Yönetimi (CPO)',
      'Büyüme Pazarlaması (Growth)',
      'B2B Satış ve Kurumsal Müşteri Kazanımı',
      'UI / UX Tasarımı ve Kullanıcı Deneyimi',
      'Yatırımcı Sunumu ve Fonlama (Pitching)',
      'Birim Ekonomi ve MRR / ARR Optimizasyonu',
    ],
    technicalSkills: [
      'Full-Stack Web Geliştirme (Next.js / Node.js)',
      'Mobil Uygulama Geliştirme (React Native / Flutter)',
      'Yapay Zeka, LLM ve Model Eğitimi',
      'DevOps, CI/CD ve Bulut Mimarisi (AWS / Docker)',
      'Sistem Mimarisi ve Mikroservisler',
      'Siber Güvenlik ve Veri Gizliliği',
    ],
    tools: [
      'Next.js / React',
      'Node.js / Python',
      'PostgreSQL / Supabase',
      'Amazon Web Services (AWS)',
      'Docker / Kubernetes',
      'Figma',
      'Stripe / İyzico',
    ],
  },

  // 3. E-Ticaret / Perakende / Pazar Yeri / Moda
  ecommerce: {
    partnershipTypes: [
      'E-Ticaret ve Pazar Yeri Operasyon Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Tedarik Zinciri ve Lojistik Yönetim Ortağı',
      'Dijital Pazarlama ve SEO / SEM Ortağı',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
      'Depo ve Lojistik Alanı Sağlayıcı Ortak',
      'Satın Alma ve Tedarik Operasyon Ortağı',
      'İşletme Ortağı',
    ],
    professionalSkills: [
      'E-Ticaret Operasyon ve Sipariş Yönetimi',
      'Performans Pazarlaması (Meta Ads / Google Ads)',
      'Pazar Yeri Yönetimi (Trendyol / Amazon / Hepsiburada)',
      'Dönüşüm Oranı Optimizasyonu (CRO)',
      'Tedarikçi Pazarlığı ve Envanter Planlama',
      'Müşteri Deneyimi ve İade Süreçleri',
    ],
    technicalSkills: [
      'Shopify / WooCommerce Altyapı Yönetimi',
      'Pazar Yeri ve ERP API Entegrasyonları',
      'Google Analytics 4 ve Dönüşüm Takibi',
      'Klaviyo / E-Posta Pazarlama Otomasyonu',
      'SEO ve Ürün Sayfası Optimizasyonu',
      'Katalog ve Feed Entegrasyonları',
    ],
    tools: [
      'Shopify',
      'Meta Ads Manager',
      'Google Ads & GA4',
      'Trendyol / Amazon Satıcı Paneli',
      'Klaviyo',
      'Logo / Nebim ERP',
    ],
  },

  // 4. Restoran / Cafe / Gıda / Mutfak / Dark Kitchen
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
    ],
    professionalSkills: [
      'Restoran ve Mutfak Operasyon Yönetimi',
      'Gıda Hijyen, HACCP ve Kalite Standartları',
      'Maliyet Muhasebesi (Food Cost / Cost Control)',
      'Menü Mühendisliği ve Reçete Standardizasyonu',
      'Şube ve Servis Ekibi Yönetimi',
      'Tedarikçi Pazarlığı ve Hammadde Yönetimi',
    ],
    technicalSkills: [
      'Restoran POS ve Sipariş Otomasyonu',
      'Paket Servis Entegrasyonları (Getir / Yemeksepeti / Trendyol)',
      'Stok ve Reçete Maliyet Takibi',
      'Yerel Dijital Pazarlama ve Google Harita SEO',
      'Gıda Güvenliği ve Soğuk Zincir Yönetimi',
    ],
    tools: [
      'Restoran POS Sistemleri (Adisyo / Simpra / SambaPOS)',
      'Yemeksepeti / GetirYemek Panelleri',
      'Meta / Instagram Reklamları',
      'Google İşletme Profili',
      'Excel / Reçete Maliyet Tabloları',
    ],
  },

  // 5. Üretim / Sanayi / Fabrika / Makine / Otomotiv
  manufacturing: {
    partnershipTypes: [
      'Fabrika ve Üretim Tesisi Sağlayıcı Ortak',
      'Endüstriyel Makine ve Ekipman Sağlayıcı Ortak',
      'Üretim ve Tesis Operasyon Ortağı',
      'Tedarik Zinciri ve Lojistik Yönetim Ortağı',
      'İhracat ve Uluslararası Pazarlar Ortağı',
      'Kalite ve Süreç Yönetimi Ortağı',
      'Atölye ve İmalathane Alanı Sağlayıcı Ortak',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
    ],
    professionalSkills: [
      'Üretim Planlama ve Kapasite Yönetimi',
      'Kalite Güvence ve ISO 9001 Standartları',
      'Yalın Üretim (Lean) ve 5S Metodolojisi',
      'Hammadde Satın Alma ve Tedarik Zinciri',
      'İhracat ve Gümrük Operasyonları',
      'İş Sağlığı ve Güvenliği (İSG)',
    ],
    technicalSkills: [
      'CAD / CAM ve 3D Modelleme (SolidWorks / AutoCAD)',
      'CNC ve Endüstriyel Otomasyon Programlama',
      'ERP ve Üretim Takip Sistemleri (SAP / Logo)',
      'Teknik Çizim ve Tolerans Analizi',
      'Bakım ve Onarım Planlama',
    ],
    tools: [
      'SolidWorks / AutoCAD',
      'SAP / Logo ERP',
      'MS Excel (İleri Düzey Planlama)',
      'Siemens PLC / CNC Kontrol Sistemleri',
    ],
  },

  // 6. Fintech / Finans / Bankacılık / Ödeme Sistemleri
  fintech: {
    partnershipTypes: [
      'Finans ve Muhasebe Ortağı (CFO)',
      'Hukuk, KVKK ve Regülasyon Ortağı',
      'Teknik Ortak (CTO)',
      'Yatırımcı Ortak (Mali Destek)',
      'Stratejik Yatırımcı (Sektörel Güç)',
      'Yazılım ve Sistem Geliştirme Ortağı',
    ],
    professionalSkills: [
      'BDDK / TCMB / SPK Regülasyon ve Uyum Yönetimi',
      'Finansal Modelleme ve Risk Yönetimi',
      'Bankacılık ve Ödeme Kuruluşu Entegrasyonları',
      'B2B Finansal Satış ve Kurumsal İş Birlikleri',
      'Yatırımcı İlişkileri ve Sermaye Artırımı',
    ],
    technicalSkills: [
      'Finansal Güvenlik, PCI-DSS ve Şifreleme',
      'Ödeme Ağ Geçidi ve POS Entegrasyonları',
      'Büyük Veri ve Dolandırıcılık (Fraud) Tespiti',
      'Yüksek Frekanslı ve Güvenli Veritabanı Mimarisi',
    ],
    tools: [
      'Stripe / İyzico / PayTR API',
      'PostgreSQL / Redis',
      'AWS KMS / Vault',
      'Python (Finansal Analiz)',
      'Figma',
    ],
  },

  // 7. Oyun / Gaming / Espor / Simülasyon
  gaming: {
    partnershipTypes: [
      'Oyun ve Simülasyon Geliştirme Ortağı',
      'Teknik Ortak (CTO)',
      'Tasarım ve UI / UX Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Melek Yatırımcı (Angel Investor)',
      'Yazılım ve Sistem Geliştirme Ortağı',
    ],
    professionalSkills: [
      'Oyun Tasarımı (Game Design) ve Mekanik Kurgusu',
      'Monetizasyon (In-App Purchase / Ads) Stratejisi',
      'Kullanıcı Kazanımı (UA) ve ASO',
      'Yayıncı ve Influencer İlişkileri',
    ],
    technicalSkills: [
      'Unity / Unreal Engine ile 2D / 3D Oyun Geliştirme',
      '3D Modelleme, Rigging ve Animasyon (Blender / Maya)',
      'Oyun Sunucu ve Çok Oyunculu (Multiplayer) Altyapı',
      'Oyun Analitiği ve SDK Entegrasyonları',
    ],
    tools: [
      'Unity / Unreal Engine',
      'Blender / Maya',
      'Photoshop / Spine 2D',
      'AppsFlyer / GameAnalytics',
      'Git / GitHub',
    ],
  },

  // 8. Hizmet / Danışmanlık / Medya / İK / Genel
  service: {
    partnershipTypes: [
      'İşletme Ortağı',
      'Yönetim Ortağı',
      'Satış ve B2B İş Geliştirme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Finans ve Muhasebe Ortağı (CFO)',
      'Hukuk, KVKK ve Regülasyon Ortağı',
      'Ofis ve Çalışma Alanı Sağlayıcı Ortak',
    ],
    professionalSkills: [
      'B2B Kurumsal Satış ve Müşteri Kazanımı',
      'Stratejik Danışmanlık ve Hizmet Teslimat Yönetimi',
      'İçerik ve Kurumsal İletişim Stratejisi',
      'Ekip Kurma ve Yetenek Yönetimi',
      'Müşteri İlişkileri (Account Management)',
    ],
    technicalSkills: [
      'CRM ve Satış Hattı Yönetimi (HubSpot / Salesforce)',
      'Dijital Pazarlama ve Lead Generation',
      'Veri Analitiği ve Raporlama (PowerBI / Looker)',
      'Teklif ve Sunum Hazırlama',
    ],
    tools: [
      'HubSpot / Salesforce',
      'Notion / ClickUp',
      'PowerBI / Looker Studio',
      'Canva / PowerPoint',
      'Zoom / Google Meet',
    ],
  },
};

/** Sektör ve bağlam metninden en doğru profili tespit eder */
function detectProfileKey(text: string): keyof typeof SECTOR_PROFILES {
  const s = normalizeTurkishSearch(text || '');

  // 1. Sağlık / Medikal / Biyoteknoloji
  if (
    s.includes('saglik') ||
    s.includes('medikal') ||
    s.includes('biyoteknoloji') ||
    s.includes('klinik') ||
    s.includes('hastane') ||
    s.includes('ilac') ||
    s.includes('doktor') ||
    s.includes('hekim') ||
    s.includes('dis') ||
    s.includes('veteriner')
  ) {
    return 'health';
  }

  // 2. Fintech / Finans / Ödeme
  if (
    s.includes('fintech') ||
    s.includes('finans') ||
    s.includes('odeme') ||
    s.includes('kripto') ||
    s.includes('banka') ||
    s.includes('sigorta')
  ) {
    return 'fintech';
  }

  // 3. Oyun / Gaming
  if (
    s.includes('oyun') ||
    s.includes('gaming') ||
    s.includes('espor') ||
    s.includes('simulasyon')
  ) {
    return 'gaming';
  }

  // 4. Yazılım / SaaS / Yapay Zeka
  if (
    s.includes('yazilim') ||
    s.includes('saas') ||
    s.includes('teknoloji') ||
    s.includes('yapay zeka') ||
    s.includes('ai') ||
    s.includes('bilgisayar') ||
    s.includes('mobil') ||
    s.includes('siber') ||
    s.includes('bilisim')
  ) {
    return 'tech';
  }

  // 5. E-Ticaret / Perakende / Pazar Yeri
  if (
    s.includes('e-ticaret') ||
    s.includes('eticaret') ||
    s.includes('perakende') ||
    s.includes('pazar yeri') ||
    s.includes('magaza') ||
    s.includes('ihracat') ||
    s.includes('tekstil') ||
    s.includes('moda') ||
    s.includes('d2c')
  ) {
    return 'ecommerce';
  }

  // 6. Gıda / Restoran / Cafe / Mutfak
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

  // 7. Üretim / Sanayi / Fabrika / Makine
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

/** 1. Sayfa seçimlerine göre 2. Sayfayı en yüksek hassasiyetle akıllı eşleştirir */
export function resolveFounderSuggestions(context: FounderSuggestionContext): FounderSuggestionsResult {
  const combinedText = [
    context.sector,
    context.title,
    context.shortDescription,
    context.targetPartnerType,
    context.stage,
  ]
    .filter(Boolean)
    .join(' ');

  const profileKey = detectProfileKey(combinedText);
  const profile = SECTOR_PROFILES[profileKey] || SECTOR_PROFILES.health;

  // Aranan ortak tipi bazlı önceliklendirme
  const partnerTypeNorm = normalizeTurkishSearch(context.targetPartnerType || '');
  const prioritizedPartnershipTypes: string[] = [];

  if (partnerTypeNorm.includes('yonetim')) {
    prioritizedPartnershipTypes.push('Yönetim Ortağı', 'İşletme Ortağı', 'Operasyon Ortağı (COO)');
  } else if (partnerTypeNorm.includes('teknik') || partnerTypeNorm.includes('cto') || partnerTypeNorm.includes('yazilim')) {
    prioritizedPartnershipTypes.push('Teknik Ortak (CTO)', 'Yazılım ve Sistem Geliştirme Ortağı');
  } else if (partnerTypeNorm.includes('yatirim')) {
    prioritizedPartnershipTypes.push('Yatırımcı Ortak (Mali Destek)', 'Melek Yatırımcı (Angel Investor)', 'Sermaye Ortağı (Sessiz / Finansal Ortak)');
  } else if (partnerTypeNorm.includes('pazarlama') || partnerTypeNorm.includes('satis')) {
    prioritizedPartnershipTypes.push('Pazarlama ve Büyüme Ortağı (Growth / CMO)', 'Satış ve B2B İş Geliştirme Ortağı');
  } else if (partnerTypeNorm.includes('kurucu')) {
    prioritizedPartnershipTypes.push('Kurucu Ortak (Co-Founder)', 'Genel Ortak (General Partner)');
  }

  // Sadece en yakın 6-8 seçeneği birleştir ve sonuna MANUAL_OPTION ekle
  const topPartnershipTypes = Array.from(
    new Set([
      ...prioritizedPartnershipTypes,
      ...profile.partnershipTypes,
    ])
  ).slice(0, 8);
  topPartnershipTypes.push(MANUAL_OPTION);

  const topProfSkills = [...profile.professionalSkills.slice(0, 6), MANUAL_OPTION];
  const topTechSkills = [...profile.technicalSkills.slice(0, 6), MANUAL_OPTION];
  const topTools = [...profile.tools.slice(0, 6), MANUAL_OPTION];

  return {
    partnershipTypes: topPartnershipTypes,
    professionalSkills: topProfSkills,
    technicalSkills: topTechSkills,
    tools: topTools,
  };
}
