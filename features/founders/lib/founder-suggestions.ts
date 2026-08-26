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

interface DomainKnowledge {
  partnershipTypes: string[];
  professionalSkills: string[];
  technicalSkills: string[];
  tools: string[];
}

// 1. Sektörel Bilgi Bankası
const SECTOR_KNOWLEDGE: Record<string, DomainKnowledge> = {
  // İklim Teknolojisi / Temiz Enerji / Çevre / Sürdürülebilirlik
  climate: {
    partnershipTypes: [
      'Acentelik ve Temsilcilik Ortağı',
      'Satış ve B2B İş Geliştirme Ortağı',
      'İhracat ve Uluslararası Pazarlar Ortağı',
      'Strateji ve İş Geliştirme Ortağı',
      'Stratejik Yatırımcı (Sektörel Güç)',
      'Güneş / Rüzgar Enerjisi Santral Alanı Sağlayıcı Ortak',
      'Teknik Ortak (CTO)',
      'Hibe, Teşvik ve Fonlama Danışmanı Ortak (TÜBİTAK/KOSGEB)',
    ],
    professionalSkills: [
      'ESG, Karbon Ayak İzi ve Sürdürülebilirlik Yönetimi',
      'Acentelik, Bayilik ve Distribütör Ağı Yönetimi',
      'B2B ve B2G (Kamu / Belediye) Kurumsal Satış',
      'İklim ve Çevre Regülasyonları / Karbon Piyasaları',
      'Pilot Proje (PoC) ve İlk Referans Müşteri Yönetimi',
      'İhale Süreçleri ve Sözleşme Yönetimi',
    ],
    technicalSkills: [
      'Karbon Ayak İzi Hesaplama ve Sera Gazı Doğrulama (GHG Protocol)',
      'Yenilenebilir Enerji ve Enerji Verimliliği Sistemleri',
      'Çevresel IoT Sensörleri ve Telemetri Veri İzleme',
      'Yeşil Bina ve LEED / BREEAM / ISO 14064 Standartları',
      'Yaşam Döngüsü Analizi (LCA) ve Çevresel Etki Değerlendirmesi',
      'Temiz Enerji Şebeke ve Depolama Entegrasyonu',
    ],
    tools: [
      'Karbon Muhasebesi ve ESG Raporlama Yazılımları',
      'SCADA ve Enerji İzleme / IoT Dashboardları',
      'GIS ve Coğrafi Bilgi Sistemleri (ArcGIS / QGIS)',
      'HubSpot / Salesforce (B2B Satış ve Acente CRM)',
      'AutoCAD / PVsyst (Enerji ve Tesis Projelendirme)',
      'MS Excel (İleri Düzey Enerji ve Karbon Modelleme)',
    ],
  },

  // Sağlık / Sağlık Teknolojisi / Medikal / Biyoteknoloji
  health: {
    partnershipTypes: [
      'Yönetim Ortağı',
      'İşletme Ortağı',
      'Acentelik ve Temsilcilik Ortağı',
      'Biyoteknoloji ve Sağlık Teknolojisi Ortağı',
      'Teknik Ortak (CTO)',
      'Hukuk, KVKK ve Regülasyon Ortağı',
      'Melek Yatırımcı (Angel Investor)',
      'Stratejik Yatırımcı (Sektörel Güç)',
    ],
    professionalSkills: [
      'Sağlık Sektörü ve Klinik Süreç Yönetimi',
      'Medikal Regülasyon ve CE / FDA / Sağlık Bakanlığı Onayları',
      'B2B Hastane ve Klinik Satış / Temsilcilik',
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

  // Tarım Teknolojisi / Hayvancılık / AgriTech
  agritech: {
    partnershipTypes: [
      'Acentelik ve Temsilcilik Ortağı',
      'Tarım Arazisi ve Sera Alanı Sağlayıcı Ortak',
      'Satış ve B2B İş Geliştirme Ortağı',
      'Endüstriyel Makine ve Ekipman Sağlayıcı Ortak',
      'İşletme Ortağı',
      'Teknik Ortak (CTO)',
      'Stratejik Yatırımcı (Sektörel Güç)',
    ],
    professionalSkills: [
      'Tarımsal Operasyon ve Sera Yönetimi',
      'Bölge Bayi, Acente ve Kooperatif Dağıtım Ağı Yönetimi',
      'Hassas Tarım ve Verim Optimizasyonu',
      'Tarımsal Hibe, Destek ve Kredi Süreçleri',
      'Tedarik Zinciri ve Soğuk Hava Depo Yönetimi',
    ],
    technicalSkills: [
      'Tarımsal IoT Sensörleri ve Otomasyon Sistemleri',
      'Drone ve Uydu Görüntüleme ile Tarla Analizi',
      'Sulama ve Gübreleme Otomasyonu (SCADA / PLC)',
      'Mobil Çiftçi Uygulamaları ve Veri Platformları',
      'Yapay Zeka Destekli Bitki Hastalık Tespiti',
    ],
    tools: [
      'Tarımsal IoT Dashboard ve Sensör Yazılımları',
      'GIS / QGIS Tarım Haritalama',
      'Siemens / Schneider Tarımsal Otomasyon',
      'HubSpot / Saha Satış CRM',
      'Excel (Maliyet ve Verim Tabloları)',
    ],
  },

  // Fintech / Finans / Ödeme Sistemleri
  fintech: {
    partnershipTypes: [
      'Finans ve Muhasebe Ortağı (CFO)',
      'Hukuk, KVKK ve Regülasyon Ortağı',
      'Teknik Ortak (CTO)',
      'Yatırımcı Ortak (Mali Destek)',
      'Stratejik Yatırımcı (Sektörel Güç)',
      'Acentelik ve Temsilcilik Ortağı',
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
      'Blockchain ve Akıllı Sözleşme Geliştirme',
    ],
    tools: [
      'Stripe / İyzico / PayTR API',
      'PostgreSQL / Redis',
      'AWS KMS / Vault',
      'Python (Finansal Analiz)',
      'Figma',
    ],
  },

  // E-Ticaret / Perakende / Pazar Yeri / Moda
  ecommerce: {
    partnershipTypes: [
      'E-Ticaret ve Pazar Yeri Operasyon Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Tedarik Zinciri ve Lojistik Yönetim Ortağı',
      'Dijital Pazarlama ve SEO / SEM Ortağı',
      'Depo ve Lojistik Alanı Sağlayıcı Ortak',
      'Acentelik ve Temsilcilik Ortağı',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
    ],
    professionalSkills: [
      'E-Ticaret Operasyon ve Sipariş Yönetimi',
      'Performans Pazarlaması (Meta Ads / Google Ads)',
      'Pazar Yeri Yönetimi (Trendyol / Amazon / Hepsiburada)',
      'Dönüşüm Oranı Optimizasyonu (CRO)',
      'Tedarikçi Pazarlığı ve Envanter Planlama',
      'E-İhracat ve Mikro İhracat Süreçleri',
    ],
    technicalSkills: [
      'Shopify / WooCommerce Altyapı Yönetimi',
      'Pazar Yeri ve ERP API Entegrasyonları',
      'Google Analytics 4 ve Dönüşüm Takibi',
      'Klaviyo / E-Posta Pazarlama Otomasyonu',
      'SEO ve Ürün Sayfası Optimizasyonu',
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

  // Restoran / Cafe / Gıda / Mutfak / Dark Kitchen
  food: {
    partnershipTypes: [
      'Restoran ve Cafe İşletme Ortağı',
      'Dükkan ve Mağaza Alanı Sağlayıcı Ortak',
      'Mutfak, Restoran ve Dark Kitchen Alanı Ortağı',
      'İşletme Ortağı',
      'Franchise ve Şube İşletme Ortağı',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
    ],
    professionalSkills: [
      'Restoran ve Mutfak Operasyon Yönetimi',
      'Gıda Hijyen, HACCP ve Kalite Standartları',
      'Maliyet Muhasebesi (Food Cost / Cost Control)',
      'Menü Mühendisliği ve Reçete Standardizasyonu',
      'Şube ve Servis Ekibi Yönetimi',
    ],
    technicalSkills: [
      'Restoran POS ve Sipariş Otomasyonu',
      'Paket Servis Entegrasyonları (Getir / Yemeksepeti / Trendyol)',
      'Stok ve Reçete Maliyet Takibi',
      'Yerel Dijital Pazarlama ve Google Harita SEO',
    ],
    tools: [
      'Restoran POS Sistemleri (Adisyo / Simpra / SambaPOS)',
      'Yemeksepeti / GetirYemek Panelleri',
      'Meta / Instagram Reklamları',
      'Google İşletme Profili',
      'Excel / Reçete Maliyet Tabloları',
    ],
  },

  // Üretim / Sanayi / Fabrika / Makine / Otomotiv
  manufacturing: {
    partnershipTypes: [
      'Fabrika ve Üretim Tesisi Sağlayıcı Ortak',
      'Endüstriyel Makine ve Ekipman Sağlayıcı Ortak',
      'Üretim ve Tesis Operasyon Ortağı',
      'Acentelik ve Temsilcilik Ortağı',
      'Tedarik Zinciri ve Lojistik Yönetim Ortağı',
      'İhracat ve Uluslararası Pazarlar Ortağı',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
    ],
    professionalSkills: [
      'Üretim Planlama ve Kapasite Yönetimi',
      'Kalite Güvence ve ISO 9001 Standartları',
      'Yalın Üretim (Lean) ve 5S Metodolojisi',
      'Hammadde Satın Alma ve Tedarik Zinciri',
      'İhracat ve Gümrük Operasyonları',
    ],
    technicalSkills: [
      'CAD / CAM ve 3D Modelleme (SolidWorks / AutoCAD)',
      'CNC ve Endüstriyel Otomasyon Programlama',
      'ERP ve Üretim Takip Sistemleri (SAP / Logo)',
      'Teknik Çizim ve Tolerans Analizi',
    ],
    tools: [
      'SolidWorks / AutoCAD',
      'SAP / Logo ERP',
      'MS Excel (İleri Düzey Planlama)',
      'Siemens PLC / CNC Kontrol Sistemleri',
    ],
  },

  // PropTech / Gayrimenkul / İnşaat
  proptech: {
    partnershipTypes: [
      'Arsa, Arazi ve Gayrimenkul Sağlayıcı Ortak',
      'Acentelik ve Temsilcilik Ortağı',
      'İşletme Ortağı',
      'Teknik Ortak (CTO)',
      'İnşaat Makinesi ve İş Makinesi Ekipman Ortağı',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
    ],
    professionalSkills: [
      'Gayrimenkul Portföy ve Acente Ağı Yönetimi',
      'İmar, Ruhsat ve Mülkiyet Mevzuatı',
      'Proje ve Şantiye Yönetimi',
      'Gayrimenkul Değerleme ve Pazar Analizi',
      'B2B Kurumsal Satış ve Kiralama',
    ],
    technicalSkills: [
      'BIM ve 3D Mimari Modelleme (Revit / AutoCAD)',
      'CBS (GIS) ve Lokasyon Analizi',
      'Sanal Tur ve 3D Render Altyapısı',
      'Proptech Platform ve Mobil Uygulama Entegrasyonu',
    ],
    tools: [
      'AutoCAD / Revit / 3ds Max',
      'GIS / ArcGIS Haritalama',
      'HubSpot / Emlak CRM',
      'Excel (Fizibilite ve Hakediş)',
    ],
  },

  // Eğitim / EdTech / Akademi
  edtech: {
    partnershipTypes: [
      'İşletme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Acentelik ve Temsilcilik Ortağı',
      'Teknik Ortak (CTO)',
      'Ofis ve Çalışma Alanı Sağlayıcı Ortak',
    ],
    professionalSkills: [
      'Eğitim Müfredatı ve İçerik Geliştirme',
      'Öğrenci Kazanımı ve Dijital Pazarlama',
      'Kurumsal Eğitim Satışları (B2B)',
      'Eğitmen Kadrosu ve Operasyon Yönetimi',
    ],
    technicalSkills: [
      'LMS (Öğrenme Yönetim Sistemi) Entegrasyonu',
      'Canlı Yayın ve Video Prodüksiyon Altyapısı',
      'Öğrenci Analitiği ve İlerleme Takibi',
    ],
    tools: [
      'Zoom / Teams API',
      'Moodle / Teachable / Canvas',
      'YouTube / Vimeo Pro',
      'Meta Ads & Google Ads',
    ],
  },

  // Yazılım / SaaS / Yapay Zeka / Derin Teknoloji
  tech: {
    partnershipTypes: [
      'Teknik Ortak (CTO)',
      'Yazılım ve Sistem Geliştirme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Ürün Yönetimi Ortağı (CPO)',
      'Kurucu Ortak (Co-Founder)',
      'Yapay Zeka ve Makine Öğrenimi Ortağı (AI/ML)',
      'Melek Yatırımcı (Angel Investor)',
    ],
    professionalSkills: [
      'Ürün Yönetimi (CPO)',
      'Büyüme Pazarlaması (Growth)',
      'B2B Satış ve Kurumsal Müşteri Kazanımı',
      'UI / UX Tasarımı ve Kullanıcı Deneyimi',
      'Yatırımcı Sunumu ve Fonlama (Pitching)',
    ],
    technicalSkills: [
      'Full-Stack Web Geliştirme (Next.js / Node.js)',
      'Mobil Uygulama Geliştirme (React Native / Flutter)',
      'Yapay Zeka, LLM ve Model Eğitimi',
      'DevOps, CI/CD ve Bulut Mimarisi (AWS / Docker)',
      'Sistem Mimarisi ve Mikroservisler',
    ],
    tools: [
      'Next.js / React',
      'Node.js / Python',
      'PostgreSQL / Supabase',
      'Amazon Web Services (AWS)',
      'Docker / Kubernetes',
      'Figma',
    ],
  },

  // Hizmet / Danışmanlık / Genel
  service: {
    partnershipTypes: [
      'İşletme Ortağı',
      'Yönetim Ortağı',
      'Satış ve B2B İş Geliştirme Ortağı',
      'Acentelik ve Temsilcilik Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Finans ve Muhasebe Ortağı (CFO)',
    ],
    professionalSkills: [
      'B2B Kurumsal Satış ve Müşteri Kazanımı',
      'Stratejik Danışmanlık ve Hizmet Teslimat Yönetimi',
      'İçerik ve Kurumsal İletişim Stratejisi',
      'Ekip Kurma ve Yetenek Yönetimi',
    ],
    technicalSkills: [
      'CRM ve Satış Hattı Yönetimi (HubSpot / Salesforce)',
      'Dijital Pazarlama ve Lead Generation',
      'Veri Analitiği ve Raporlama (PowerBI / Looker)',
    ],
    tools: [
      'HubSpot / Salesforce',
      'Notion / ClickUp',
      'PowerBI / Looker Studio',
      'Canva / PowerPoint',
    ],
  },
};

// 2. Ortak Tipi Bazlı Ek Yetkinlik ve Araç Haritası
const PARTNER_TYPE_MODIFIERS: Record<string, {
  partnershipTypes?: string[];
  professionalSkills?: string[];
  technicalSkills?: string[];
  tools?: string[];
}> = {
  agency: {
    partnershipTypes: [
      'Acentelik ve Temsilcilik Ortağı',
      'Satış ve B2B İş Geliştirme Ortağı',
      'İhracat ve Uluslararası Pazarlar Ortağı',
      'Franchise ve Şube İşletme Ortağı',
    ],
    professionalSkills: [
      'Acentelik, Bayilik ve Distribütör Ağı Yönetimi',
      'B2B ve B2G Kurumsal Satış / Müşteri Kazanımı',
      'Bölgesel Pazar Geliştirme ve Saha Yönetimi',
      'İhale Süreçleri ve Bayi Sözleşme Yönetimi',
    ],
    technicalSkills: [
      'CRM ve Kanal Satış Yönetim Sistemleri',
      'Pazar ve Rakip Analizi / Saha Raporlama',
    ],
    tools: [
      'HubSpot / Salesforce / Zoho CRM',
      'Excel (Bayi / Acente Kota ve Prim Tabloları)',
    ],
  },
  sales: {
    partnershipTypes: [
      'Satış ve B2B İş Geliştirme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Acentelik ve Temsilcilik Ortağı',
      'İhracat ve Uluslararası Pazarlar Ortağı',
    ],
    professionalSkills: [
      'B2B Kurumsal Satış ve Büyük Müşteri Yönetimi (Key Account)',
      'Satış Hunisi (Pipeline) ve Lead Dönüşüm Optimizasyonu',
      'Soğuk Satış (Outbound) ve İş Geliştirme',
    ],
    technicalSkills: [
      'CRM ve Satış Hattı Otomasyonu',
      'E-Posta Satış Dizileri (Cold Outreach)',
    ],
    tools: [
      'HubSpot / Salesforce',
      'LinkedIn Sales Navigator / Apollo.io',
    ],
  },
  cto: {
    partnershipTypes: [
      'Teknik Ortak (CTO)',
      'Yazılım ve Sistem Geliştirme Ortağı',
      'Yapay Zeka ve Makine Öğrenimi Ortağı (AI/ML)',
    ],
    professionalSkills: [
      'Yazılım Ekip Liderliği ve Mimari Kararlar',
      'Teknik Yol Haritası (Roadmap) ve Sprint Planlama',
    ],
    technicalSkills: [
      'Sistem Mimarisi ve Ölçeklenebilir Veritabanı Tasarımı',
      'DevOps, CI/CD ve Bulut Altyapı (AWS / GCP / Docker)',
    ],
    tools: [
      'Git / GitHub / GitLab',
      'Docker / Kubernetes',
    ],
  },
  management: {
    partnershipTypes: [
      'Yönetim Ortağı',
      'İşletme Ortağı',
      'Operasyon Ortağı (COO)',
      'Kurucu Ortak (Co-Founder)',
    ],
    professionalSkills: [
      'Şirket Yönetimi ve Operasyonel Mükemmellik',
      'Stratejik Planlama ve Bütçe Yönetimi',
    ],
    technicalSkills: [
      'ERP ve Kurumsal Süreç Yönetim Sistemleri',
      'KPI ve Performans Dashboard Analitiği',
    ],
    tools: [
      'Notion / ClickUp',
      'PowerBI / Looker Studio',
    ],
  },
  investor: {
    partnershipTypes: [
      'Melek Yatırımcı (Angel Investor)',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
      'Stratejik Yatırımcı (Sektörel Güç)',
    ],
    professionalSkills: [
      'Yatırımcı İlişkileri ve Sermaye Artırımı (Fundraising)',
      'Finansal Modelleme ve Şirket Değerleme (Valuation)',
    ],
    technicalSkills: [
      'Finansal Tablolar ve Nakit Akışı Modellemesi',
    ],
    tools: [
      'Excel / Google Sheets (İleri Finansal Modeller)',
      'Pitch Deck / Keynote',
    ],
  },
};

// 3. Aşama Bazlı Ek Yetkinlikler
const STAGE_MODIFIERS: Record<string, {
  professionalSkills?: string[];
  technicalSkills?: string[];
}> = {
  first_customers: {
    professionalSkills: [
      'Pilot Proje (PoC) ve İlk Referans Müşteri Yönetimi',
      'Pazar Doğrulama ve Müşteri Geri Bildirim Döngüsü',
    ],
    technicalSkills: [
      'Hızlı Prototipleme ve Müşteri Entegrasyonları',
    ],
  },
  idea: {
    professionalSkills: [
      'İş Fikri Doğrulama ve Problem-Çözüm Uyumu (Problem-Solution Fit)',
    ],
    technicalSkills: [
      'MVP Mimarisi ve Tel Çerçeve (Wireframe) Tasarımı',
    ],
  },
  mvp: {
    professionalSkills: [
      'MVP Lansmanı ve Beta Kullanıcı Yönetimi',
    ],
    technicalSkills: [
      'Beta Ürün Geliştirme ve Hata Takip Sistemleri',
    ],
  },
  growth: {
    professionalSkills: [
      'Satış ve Operasyon Ölçekleme (Scale-Up)',
    ],
    technicalSkills: [
      'Yüksek Trafik ve Altyapı Optimizasyonu',
    ],
  },
};

function detectSectorKey(text: string): keyof typeof SECTOR_KNOWLEDGE {
  const s = normalizeTurkishSearch(text || '');

  if (s.includes('iklim') || s.includes('temiz enerji') || s.includes('cevre') || s.includes('surdurulebilirlik') || s.includes('karbon') || s.includes('geri donusum') || s.includes('solar') || s.includes('ruzgar')) {
    return 'climate';
  }
  if (s.includes('saglik') || s.includes('medikal') || s.includes('biyoteknoloji') || s.includes('klinik') || s.includes('hastane') || s.includes('ilac') || s.includes('doktor')) {
    return 'health';
  }
  if (s.includes('tarim') || s.includes('hayvancilik') || s.includes('sera') || s.includes('agritech')) {
    return 'agritech';
  }
  if (s.includes('fintech') || s.includes('finans') || s.includes('odeme') || s.includes('kripto') || s.includes('banka') || s.includes('sigorta')) {
    return 'fintech';
  }
  if (s.includes('e-ticaret') || s.includes('eticaret') || s.includes('perakende') || s.includes('pazar yeri') || s.includes('magaza') || s.includes('moda') || s.includes('d2c')) {
    return 'ecommerce';
  }
  if (s.includes('gida') || s.includes('restoran') || s.includes('cafe') || s.includes('kahve') || s.includes('yemek') || s.includes('mutfak') || s.includes('fast food')) {
    return 'food';
  }
  if (s.includes('proptech') || s.includes('gayrimenkul') || s.includes('insaat') || s.includes('arsa') || s.includes('konut')) {
    return 'proptech';
  }
  if (s.includes('egitim') || s.includes('edtech') || s.includes('akademi') || s.includes('kurs') || s.includes('ogrenci')) {
    return 'edtech';
  }
  if (s.includes('uretim') || s.includes('sanayi') || s.includes('fabrika') || s.includes('imalat') || s.includes('makine') || s.includes('otomotiv')) {
    return 'manufacturing';
  }
  if (s.includes('yazilim') || s.includes('saas') || s.includes('teknoloji') || s.includes('yapay zeka') || s.includes('ai') || s.includes('bilgisayar') || s.includes('mobil') || s.includes('siber') || s.includes('bilisim')) {
    return 'tech';
  }
  return 'service';
}

function detectPartnerTypeKey(text: string): string {
  const s = normalizeTurkishSearch(text || '');
  if (s.includes('acente') || s.includes('temsilci') || s.includes('distributor') || s.includes('bayi')) {
    return 'agency';
  }
  if (s.includes('satis') || s.includes('ihracat') || s.includes('pazarlama') || s.includes('growth')) {
    return 'sales';
  }
  if (s.includes('teknik') || s.includes('cto') || s.includes('yazilim') || s.includes('gelistirici')) {
    return 'cto';
  }
  if (s.includes('yatirim') || s.includes('melek') || s.includes('sermaye') || s.includes('finans')) {
    return 'investor';
  }
  if (s.includes('yonetim') || s.includes('isletme') || s.includes('coo') || s.includes('operasyon') || s.includes('kurucu')) {
    return 'management';
  }
  return 'general';
}

function detectStageKey(text: string): string {
  const s = normalizeTurkishSearch(text || '');
  if (s.includes('musteri') || s.includes('poc') || s.includes('pilot')) {
    return 'first_customers';
  }
  if (s.includes('fikir') || s.includes('konsept')) {
    return 'idea';
  }
  if (s.includes('mvp') || s.includes('beta')) {
    return 'mvp';
  }
  if (s.includes('gelir') || s.includes('buyume') || s.includes('olcek')) {
    return 'growth';
  }
  return 'general';
}

/** 1. Sayfa seçimlerine (Sektör + Aşama + Aranan Ortak Tipi) göre 2. Sayfayı çok boyutlu eşleştirir */
export function resolveFounderSuggestions(context: FounderSuggestionContext): FounderSuggestionsResult {
  const sectorKey = detectSectorKey([context.sector, context.title, context.shortDescription].filter(Boolean).join(' '));
  const partnerKey = detectPartnerTypeKey(context.targetPartnerType || '');
  const stageKey = detectStageKey(context.stage || '');

  const baseSector = SECTOR_KNOWLEDGE[sectorKey] || SECTOR_KNOWLEDGE.climate;
  const partnerMod = PARTNER_TYPE_MODIFIERS[partnerKey];
  const stageMod = STAGE_MODIFIERS[stageKey];

  // 1. Ortaklık Türleri: Aranan ortak tipi öncelikli + Sektörel ortaklık türleri
  const combinedPartnershipTypes = Array.from(
    new Set([
      ...(partnerMod?.partnershipTypes ?? []),
      ...baseSector.partnershipTypes,
    ])
  ).slice(0, 8);
  combinedPartnershipTypes.push(MANUAL_OPTION);

  // 2. Mesleki Yetkinlikler: Sektör çekirdeği + Ortak tipi modülatörü + Aşama modülatörü
  const combinedProfSkills = Array.from(
    new Set([
      ...baseSector.professionalSkills.slice(0, 3),
      ...(partnerMod?.professionalSkills ?? []),
      ...(stageMod?.professionalSkills ?? []),
      ...baseSector.professionalSkills,
    ])
  ).slice(0, 8);
  combinedProfSkills.push(MANUAL_OPTION);

  // 3. Teknik Uzmanlıklar: Sektörel teknik uzmanlıklar + Ortak tipi modülatörü + Aşama
  const combinedTechSkills = Array.from(
    new Set([
      ...baseSector.technicalSkills.slice(0, 4),
      ...(partnerMod?.technicalSkills ?? []),
      ...(stageMod?.technicalSkills ?? []),
      ...baseSector.technicalSkills,
    ])
  ).slice(0, 8);
  combinedTechSkills.push(MANUAL_OPTION);

  // 4. Araçlar ve Programlar: Sektörel araçlar + Ortak tipi araçları
  const combinedTools = Array.from(
    new Set([
      ...baseSector.tools.slice(0, 4),
      ...(partnerMod?.tools ?? []),
      ...baseSector.tools,
    ])
  ).slice(0, 8);
  combinedTools.push(MANUAL_OPTION);

  return {
    partnershipTypes: combinedPartnershipTypes,
    professionalSkills: combinedProfSkills,
    technicalSkills: combinedTechSkills,
    tools: combinedTools,
  };
}
