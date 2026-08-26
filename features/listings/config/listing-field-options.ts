import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';

/** Predefined investment amount ranges — stored as display strings in customFields. */
export const INVESTMENT_AMOUNT_RANGES = [
  '500.000 TL\'ye kadar',
  '500.000 - 1.000.000 TL',
  '1.000.000 - 2.500.000 TL',
  '2.500.000 - 5.000.000 TL',
  '5.000.000 - 10.000.000 TL',
  '10.000.000 TL ve üzeri',
] as const;

/** Seeking-investment only — keeps investor ranges unchanged. */
export const CUSTOM_INVESTMENT_AMOUNT_OPTION = 'Özel tutar';
export const SEEKING_INVESTMENT_AMOUNT_RANGES = [
  ...INVESTMENT_AMOUNT_RANGES,
  CUSTOM_INVESTMENT_AMOUNT_OPTION,
] as const;

/** Investor interest sectors — multi-select for "Yatırım Yapacağım". */
export const INVESTOR_SECTOR_OPTIONS = [
  'Bilişim / Yazılım',
  'SaaS / Yazılım',
  'Yapay zeka',
  'E-ticaret / Pazaryeri',
  'Fintech',
  'Sağlık teknolojisi',
  'Üretim ve Sanayi',
  'Gıda teknolojisi',
  'Perakende',
  'Lojistik',
  'Mobil uygulama',
  'Eğitim teknolojisi',
  'Oyun',
  'Siber güvenlik',
  'Temiz enerji',
  'Proptech',
  'İklim teknolojisi',
  'Tarım teknolojisi',
  'İnsan kaynakları teknolojisi',
  'Medya & içerik',
  'Diğer / Kendim gireceğim',
] as const;

/** Career / hiring sectors — TR job market (ISKUR / Kariyer.net coverage). */
export const JOB_SECTOR_OPTIONS = [
  'Bilişim / Yazılım',
  'Yapay zeka / Veri',
  'E-ticaret / Pazaryeri',
  'Finans / Bankacılık',
  'Muhasebe / Mali müşavirlik',
  'Sigorta',
  'Çağrı merkezi',
  'Müşteri hizmetleri',
  'Satış',
  'Pazarlama / Reklam',
  'Halkla ilişkiler',
  'İnsan kaynakları',
  'İdari işler / Ofis',
  'Holding / Yönetim',
  'Danışmanlık',
  'Ar-Ge',
  'Üretim / Sanayi',
  'Tekstil / Hazır giyim',
  'Otomotiv',
  'Oto servis / Yetkili servis',
  'Elektrik-elektronik',
  'Demir-çelik / Metal',
  'Kimya / Plastik',
  'Kağıt / Ambalaj',
  'Mobilya',
  'İnşaat / Gayrimenkul',
  'İklimlendirme / Tesisat',
  'Lojistik / Depolama',
  'Kargo / Kurye',
  'Ulaşım / Şoförlük',
  'Denizcilik / Liman',
  'Gümrük',
  'İthalat / İhracat',
  'Perakende / Mağaza',
  'Gıda / Restoran',
  'Turizm / Otelcilik',
  'Havacılık',
  'Sağlık',
  'Eczane / İlaç',
  'Veteriner / Pet',
  'Eğitim',
  'Kreş / Çocuk bakımı',
  'Hukuk',
  'Kamu / Belediye',
  'Enerji',
  'Telekomünikasyon',
  'Tarım',
  'Çevre / Geri dönüşüm',
  'Medya / İçerik',
  'Fotoğraf / Prodüksiyon',
  'Güvenlik',
  'Temizlik / Tesis yönetimi',
  'Güzellik / Kişisel bakım',
  'Spor / Fitness',
  'Sosyal hizmet / STK',
  'Mühendislik / Teknik',
  'Organizasyon / Etkinlik',
  'Oyun / E-spor',
  'Savunma sanayi',
  'Madencilik',
  'Diğer',
] as const;

/** Predefined salary ranges for job seeker listings. */
export const SALARY_RANGES = [
  'Belirtmek istemiyorum',
  '25.000 TL\'ye kadar',
  '25.000 - 50.000 TL',
  '50.000 - 75.000 TL',
  '75.000 - 100.000 TL',
  '100.000 - 150.000 TL',
  '150.000 - 200.000 TL',
  '200.000 TL ve üzeri',
] as const;

/** Same bands as job-seeker salaryExpectation so the two cards can match later. */
export const HIRING_SALARY_RANGES = SALARY_RANGES;

/** Investment usage areas — multi-select for seeking investment. */
export const USE_OF_FUNDS_OPTIONS = [
  'Ürün geliştirme',
  'Yazılım geliştirme',
  'Yapay zeka',
  'Pazarlama',
  'Satış',
  'İnsan kaynakları',
  'Operasyon',
  'Çalışma sermayesi',
  'Yeni pazar',
  'Donanım',
  'Ar-Ge',
  'Uluslararası genişleme',
  'Patent',
  'Üretim',
  'Diğer',
] as const;

/** Product maturity — complements STARTUP_STAGES, does not replace it. */
export const PRODUCT_STATUS_OPTIONS = [
  'Fikir',
  'MVP',
  'Beta',
  'Canlı ürün',
  'Ticari olarak aktif',
  'Ölçekleniyor',
] as const;

export const REVENUE_STATUS_OPTIONS = [
  'Gelir yok',
  'İlk gelir',
  'Düzenli gelir',
  'Büyüyen gelir',
] as const;

export const TRACTION_STATUS_OPTIONS = [
  'Müşteri yok',
  'Pilot',
  'İlk müşteriler',
  'Aktif müşteri tabanı',
  'Ölçeklenen müşteri tabanı',
] as const;

export const BUSINESS_MODEL_OPTIONS = [
  'SaaS',
  'Abonelik',
  'Komisyon',
  'Marketplace',
  'Lisans',
  'Freemium',
  'Reklam',
  'E-ticaret',
  'Hizmet',
  'Diğer',
] as const;

export const TARGET_CUSTOMER_OPTIONS = [
  'B2B',
  'B2C',
  'B2B2C',
  'Enterprise',
  'KOBİ',
  'Tüketici',
  'Pazaryeri katılımcısı',
] as const;

export const FOUNDER_COUNT_OPTIONS = ['1', '2', '3', '4+'] as const;

export const TEAM_SIZE_OPTIONS = ['1-2', '3-5', '6-10', '11-20', '21+'] as const;

/** Job seeker / hiring position options — broad TR market coverage, A–Z (tr). */
export const JOB_POSITION_OPTIONS = [
  'Aşçı',
  'Aşçı yardımcısı',
  'Avukat',
  'Backend geliştirici',
  'Bakım teknisyeni',
  'Bankacı / banka personeli',
  'Barista',
  'Berber / kuaför',
  'Bilgisayar teknik servis',
  'Boyacı',
  'Business analyst',
  'Büro personeli',
  'Çağrı merkezi satış temsilcisi',
  'Çağrı merkezi temsilcisi',
  'Çaycı / ofis destek',
  'Çelik işçisi',
  'Çiftçi / tarım işçisi',
  'Data engineer',
  'Depo görevlisi',
  'DevOps / Cloud mühendisi',
  'Dijital pazarlama uzmanı',
  'Diş teknisyeni',
  'Eczane teknisyeni',
  'Eğitmen / öğretmen',
  'Elektrik teknisyeni',
  'Elektrikçi',
  'Fabrika işçisi',
  'Finans uzmanı',
  'Forklift operatörü',
  'Frontend geliştirici',
  'Full-stack geliştirici',
  'Garson',
  'Gayrimenkul danışmanı',
  'Grafik tasarımcı',
  'Güvenlik görevlisi',
  'Hasta bakıcı',
  'Hesap yöneticisi',
  'Hemşire',
  'Host / hostes',
  'İç mimar',
  'İnsan kaynakları uzmanı',
  'İnşaat işçisi',
  'İş analisti',
  'İş makinesi operatörü',
  'Kasiyer',
  'Kaynakçı',
  'Kurye / motokurye',
  'Lojistik uzmanı',
  'Makine operatörü',
  'Marangoz',
  'Market personeli',
  'Mimar',
  'Mobilya ustası',
  'Mobil uygulama geliştirici',
  'Muhasebeci',
  'Mühendis (elektrik)',
  'Mühendis (endüstri)',
  'Mühendis (inşaat)',
  'Mühendis (makine)',
  'Mühendis (yazılım)',
  'Müşteri başarı uzmanı',
  'Müşteri temsilcisi',
  'Ofis yöneticisi',
  'Operasyon uzmanı',
  'Oto yıkama personeli',
  'Otomotiv teknisyeni',
  'Otel resepsiyonisti',
  'Pazarlama uzmanı',
  'Personel servis şoförü',
  'Product designer / UX',
  'Proje yöneticisi',
  'QA / Test uzmanı',
  'Resepsiyonist',
  'Saha satış uzmanı',
  'Satış danışmanı',
  'Satış temsilcisi',
  'Sekreter',
  'Servis elemanı',
  'Sosyal medya uzmanı',
  'Şef / mutfak şefi',
  'Şoför (hafif ticari)',
  'Şoför (kamyon / TIR)',
  'Şoför (otobüs / minibüs)',
  'Tamirci / teknik servis',
  'Teknik servis uzmanı',
  'Teknisyen',
  'Temizlik görevlisi',
  'Tesisatçı',
  'Torna / freze operatörü',
  'UI/UX tasarımcı',
  'Üretim işçisi',
  'Ürün yöneticisi',
  'Veri analisti',
  'Veteriner teknisyeni',
  'Yapay zeka / ML mühendisi',
  'Yazılım geliştirici',
  'Diğer',
] as const;

/** 4 Category Partnership Types with Expanded Options (Popular-first + A-Z sorted) */
export const PARTNERSHIP_TYPE_CATEGORIES = [
  {
    id: 'management',
    title: 'İşletme ve Yönetim Ortağı',
    description: 'İşin günlük yönetimine, satışa, operasyona katılacak ortak',
    popularOptions: [
      'İşletme Ortağı',
      'Yönetim Ortağı',
      'Kurucu Ortak (Co-Founder)',
      'Operasyon Ortağı (COO)',
      'Genel Ortak (General Partner)',
      'Satış ve İşletme Ortağı',
    ],
    options: [
      // En Popülerler
      'İşletme Ortağı',
      'Yönetim Ortağı',
      'Kurucu Ortak (Co-Founder)',
      'Operasyon Ortağı (COO)',
      'Genel Ortak (General Partner)',
      'Satış ve İşletme Ortağı',
      // A-Z Kalan Seçenekler
      'Acentelik ve Temsilcilik Ortağı',
      'Bayi ve Kanal Yönetimi Ortağı',
      'E-Ticaret ve Pazar Yeri Operasyon Ortağı',
      'Franchise ve Şube İşletme Ortağı',
      'Hizmet Sektörü İşletme Ortağı',
      'İcra Kurulu ve Yönetici Ortak',
      'İthalat ve İhracat Yönetim Ortağı',
      'Kalite ve Süreç Yönetimi Ortağı',
      'Müşteri İlişkileri ve Destek Operasyon Ortağı',
      'Perakende ve Mağaza İşletme Ortağı',
      'Restoran ve Cafe İşletme Ortağı',
      'Satın Alma ve Tedarik Operasyon Ortağı',
      'Saha ve Satış Operasyon Ortağı',
      'Strateji ve İş Geliştirme Ortağı',
      'Süreç ve Organizasyon Ortağı',
      'Şirket Ortağı (Pay Sahibi)',
      'Şube ve Bölge Müdürü Ortak',
      'Tedarik Zinciri ve Lojistik Yönetim Ortağı',
      'Üretim ve Tesis Operasyon Ortağı',
    ],
  },
  {
    id: 'technical',
    title: 'Uzmanlık ve Yetkinlik Ortağı',
    description: 'Yazılım, pazarlama, hukuk, finans, mühendislik vb. uzmanlığını ortaya koyacak ortak',
    popularOptions: [
      'Teknik Ortak (CTO)',
      'Yazılım ve Sistem Geliştirme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Finans ve Muhasebe Ortağı (CFO)',
      'Satış ve B2B İş Geliştirme Ortağı',
      'Ürün Yönetimi Ortağı (CPO)',
    ],
    options: [
      // En Popülerler
      'Teknik Ortak (CTO)',
      'Yazılım ve Sistem Geliştirme Ortağı',
      'Pazarlama ve Büyüme Ortağı (Growth / CMO)',
      'Finans ve Muhasebe Ortağı (CFO)',
      'Satış ve B2B İş Geliştirme Ortağı',
      'Ürün Yönetimi Ortağı (CPO)',
      // A-Z Kalan Seçenekler
      'Ar-Ge ve İnovasyon Ortağı',
      'Biyoteknoloji ve Sağlık Teknolojisi Ortağı',
      'Blokzincir ve Web3 Geliştirme Ortağı',
      'Büyük Veri ve Veri Analitiği Ortağı',
      'DevOps ve Bulut Altyapı Ortağı',
      'Dijital Pazarlama ve SEO / SEM Ortağı',
      'Donanım, Elektronik ve IoT Ortağı',
      'Endüstriyel Tasarım ve Ürün Geliştirme Ortağı',
      'Finansal Modelleme ve Fizibilite Ortağı',
      'Fotoğraf, Video ve Prodüksiyon Ortağı',
      'Hukuk, KVKK ve Regülasyon Ortağı',
      'İhracat ve Uluslararası Pazarlar Ortağı',
      'İletişim, Medya ve PR Ortağı',
      'İnsan Kaynakları ve Yetenek Yönetimi Ortağı',
      'Makine ve Mekatronik Mühendisliği Ortağı',
      'Mobil Uygulama Geliştirme Ortağı (iOS / Android)',
      'Oyun ve Simülasyon Geliştirme Ortağı',
      'Performans Pazarlaması ve Reklam Ortağı',
      'Siber Güvenlik ve Ağ Güvenliği Ortağı',
      'Sigorta ve Reasürans Danışmanı Ortak',
      'Tasarım ve UI / UX Ortağı',
      'Yapay Zeka ve Makine Öğrenimi Ortağı (AI/ML)',
    ],
  },
  {
    id: 'investment',
    title: 'Yatırımcı ve Finans Ortağı',
    description: 'Sermaye sağlayacak veya finansal kaynak yaratacak ortak',
    popularOptions: [
      'Melek Yatırımcı (Angel Investor)',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
      'Stratejik Yatırımcı (Sektörel Güç)',
      'Yatırımcı Ortak (Mali Destek)',
      'Erken Aşama Yatırımcısı (Pre-Seed / Seed)',
      'Fon ve Kurumsal Yatırımcı',
    ],
    options: [
      // En Popülerler
      'Melek Yatırımcı (Angel Investor)',
      'Sermaye Ortağı (Sessiz / Finansal Ortak)',
      'Stratejik Yatırımcı (Sektörel Güç)',
      'Yatırımcı Ortak (Mali Destek)',
      'Erken Aşama Yatırımcısı (Pre-Seed / Seed)',
      'Fon ve Kurumsal Yatırımcı',
      // A-Z Kalan Seçenekler
      'Borç ve Finansal Enstrüman Sağlayıcı Ortak',
      'Büyüme ve Ölçeklenme Yatırımcısı (Seri A / B)',
      'Çıkış (Exit) ve Birleşme/Devralma (M&A) Ortağı',
      'Gayrimenkul ve Proje Finansmanı Ortağı',
      'Girişim Sermayesi (VC) Temsilcisi Ortak',
      'Hibe, Teşvik ve Fonlama Danışmanı Ortak (TÜBİTAK/KOSGEB)',
      'Kitle Fonlaması / Mikro Yatırımcı Ortağı',
      'Kredi ve Banka Finansmanı Sağlayıcı Ortak',
      'Likidite ve Nakit Akışı Destek Ortağı',
      'Özel Sermaye (Private Equity) Ortağı',
      'Sendikasyon ve Ortak Yatırım Grubu Ortağı',
      'Varlık ve Portföy Yönetimi Ortağı',
    ],
  },
  {
    id: 'physical',
    title: 'İş Yeri ve Varlık Ortağı',
    description: 'Dükkan, ofis, makine, ekipman, araç vb. varlık sağlayacak ortak',
    popularOptions: [
      'Dükkan ve Mağaza Alanı Sağlayıcı Ortak',
      'Fabrika ve Üretim Tesisi Sağlayıcı Ortak',
      'Arsa, Arazi ve Gayrimenkul Sağlayıcı Ortak',
      'Ofis ve Çalışma Alanı Sağlayıcı Ortak',
      'Depo ve Lojistik Alanı Sağlayıcı Ortak',
      'Araç ve Ticari Filo Sağlayıcı Ortak',
    ],
    options: [
      // En Popülerler
      'Dükkan ve Mağaza Alanı Sağlayıcı Ortak',
      'Fabrika ve Üretim Tesisi Sağlayıcı Ortak',
      'Arsa, Arazi ve Gayrimenkul Sağlayıcı Ortak',
      'Ofis ve Çalışma Alanı Sağlayıcı Ortak',
      'Depo ve Lojistik Alanı Sağlayıcı Ortak',
      'Araç ve Ticari Filo Sağlayıcı Ortak',
      // A-Z Kalan Seçenekler
      'Ağır Vasıta ve Lojistik Araç Filosu Ortağı',
      'Atölye ve İmalathane Alanı Sağlayıcı Ortak',
      'Endüstriyel Makine ve Ekipman Sağlayıcı Ortak',
      'Enerji Santrali ve Yenilenebilir Enerji Alanı Ortağı (GES/RES)',
      'Franchise ve Bayilik Hakkı Sağlayıcı Ortak',
      'İnşaat Makinesi ve İş Makinesi Ekipman Ortağı',
      'Laboratuvar ve Ar-Ge Test Alanı Sağlayıcı Ortak',
      'Mevcut Faal ve Hazır İşletmeye Ortak',
      'Mutfak, Restoran ve Dark Kitchen Alanı Ortağı',
      'Otel, Pansiyon ve Turizm Tesisi Alanı Ortağı',
      'Ruhsat, Lisans ve İzin Sahibi Ortak',
      'Sağlık, Klinik ve Muayenehane Alanı Ortağı',
      'Sera, Tarım ve Hayvancılık Arazisi Sağlayıcı Ortak',
      'Soğuk Hava Deposu ve Özel Depolama Alanı Ortağı',
      'Spor Salonu ve Fitness Tesisi Alanı Ortağı',
      'Teknolojik Sunucu ve Veri Merkezi Altyapı Ortağı',
    ],
  },
] as const;

export const ALL_PARTNERSHIP_TYPES = PARTNERSHIP_TYPE_CATEGORIES.flatMap((c) => c.options);

/** Canonical 18 partner expertise options — Turkish labels without '&'. */
export const CANONICAL_PARTNER_EXPERTISE_OPTIONS = [
  'CTO / Teknik Liderlik',
  'COO / Operasyon',
  'CFO / Finans',
  'CMO / Pazarlama',
  'Yazılım Geliştirme',
  'Mobil Geliştirme',
  'Yapay Zeka / ML',
  'Büyük Veri ve Veri Analitiği',
  'DevOps ve Bulut Mimarisi',
  'Siber Güvenlik',
  'Ürün Yönetimi (CPO)',
  'Tasarım / UI/UX',
  'İş Geliştirme ve B2B Satış',
  'Satış ve Müşteri Başarısı',
  'Büyüme Pazarlaması (Growth)',
  'Dijital Pazarlama ve SEO',
  'Hukuk / Regülasyon ve Uyum',
  'İnsan Kaynakları ve Yetenek',
] as const;

/** Co-founder expertise options — multi-select. */
export const PARTNER_EXPERTISE_OPTIONS = [
  ...CANONICAL_PARTNER_EXPERTISE_OPTIONS,
  'Diğer',
] as const;

/** Startup / venture stage options — Turkish labels. */
export const STARTUP_STAGES = [
  'Fikir aşaması',
  'MVP aşaması',
  'İlk müşteriler',
  'Gelir elde ediliyor',
  'Büyüme aşaması',
  'Ölçeklenme aşaması',
] as const;

export const ALL_STARTUP_STAGES_OPTION = 'Tüm aşamalar';

export const STARTUP_STAGES_WITH_ALL = [
  ...STARTUP_STAGES,
  ALL_STARTUP_STAGES_OPTION,
] as const;

export const INVESTOR_TYPE_OPTIONS = [
  'Melek yatırımcı',
  'VC',
  'Kurumsal yatırımcı',
  'Fon',
  'Şirket',
  'Diğer',
] as const;

export const EQUITY_PREFERENCE_OPTIONS = [
  'Esnek',
  'Azınlık payı',
  'Kontrol payı',
  'Belirli aralık',
] as const;

export const VALUATION_APPROACH_OPTIONS = [
  'Esnek',
  'Gelir bazlı',
  'Traction bazlı',
  'Görüşmeye açık',
] as const;

export const INVESTOR_MUST_HAVE_OPTIONS = [
  'Gelir şart',
  'Aktif müşteri şart',
  'Canlı ürün veya sonrası',
  'Türkiye odaklı',
] as const;

export const INVESTOR_DEAL_BREAKER_OPTIONS = [
  'Fikir aşaması istemiyorum',
  'Gelir yok istemiyorum',
  'Müşteri yok istemiyorum',
  'Yurt dışı istemiyorum',
] as const;

export const INVESTOR_GEOGRAPHY_OPTIONS = [
  'Türkiye geneli',
  'Yurt dışı',
  ...TURKISH_CITIES,
] as const;

/**
 * Experience levels — internal stored values (single selection).
 * UI labels for Junior/Mid/Senior/Direktör are Turkish via getExperienceLevelLabel().
 */
export const EXPERIENCE_LEVELS = [
  'Stajyer',
  'Yeni Mezun',
  'Giriş Seviyesi',
  'Junior',
  'Mid',
  'Senior',
  'Uzman',
  'Takım Lideri',
  'Orta Düzey Yönetici',
  'Yönetici',
  'Direktör',
] as const;

/** Private cover-image preference for İş Arıyorum — not shown on the public card. */
export const CAREER_PROFILE_GENDER_OPTIONS = [
  'Erkek',
  'Kadın',
  'Belirtmek istemiyorum',
] as const;

/** Work preference for job-seeker + hiring listings (shared). */
export const CAREER_WORK_TYPE_OPTIONS = [
  'Tam zamanlı',
  'Yarı zamanlı',
  'Proje bazlı',
  'Staj',
  'Sözleşmeli',
] as const;

/** Alias — keep hire/seek work-type lists identical. */
export const HIRING_WORK_TYPE_OPTIONS = CAREER_WORK_TYPE_OPTIONS;

/** Workplace preference — same canonical values on İş Arıyorum and İşe Alıyorum. */
export const CAREER_WORKPLACE_OPTIONS = [
  'Ofis',
  'Uzaktan',
  'Hibrit',
  'Saha',
  'Fabrika / Tesis',
  'Vardiyalı',
  'Mağaza / Şube',
] as const;

/** Rank the shared workplace list for the current sector + role. Does not drop options. */
export function rankWorkplaceOptions(
  sector?: string | null,
  role?: string | null,
): string[] {
  const hay = `${sector ?? ''} ${role ?? ''}`.toLocaleLowerCase('tr-TR');
  const all = [...CAREER_WORKPLACE_OPTIONS];
  let preferred: string[] = ['Ofis', 'Hibrit', 'Uzaktan'];

  if (/fabrika|üretim|sanayi|operatör|vardiya|işçi/.test(hay)) {
    preferred = ['Fabrika / Tesis', 'Vardiyalı', 'Saha'];
  } else if (/şoför|kurye|sürücü|teslimat/.test(hay)) {
    preferred = ['Saha', 'Vardiyalı', 'Ofis'];
  } else if (/inşaat|şantiye|montaj|teknisyen|saha satış|servis danışman/.test(hay)) {
    preferred = ['Saha', 'Fabrika / Tesis', 'Hibrit'];
  } else if (/mağaza|perakende|kasiyer|şube|market/.test(hay)) {
    preferred = ['Mağaza / Şube', 'Vardiyalı', 'Saha'];
  } else if (/otel|resepsiyon|turizm|garson|aşçı|barista|host|hostes|kat görev/.test(hay)) {
    preferred = ['Mağaza / Şube', 'Vardiyalı', 'Saha'];
  } else if (/hemşire|sağlık|hastane|klinik|eczane/.test(hay)) {
    preferred = ['Vardiyalı', 'Saha', 'Mağaza / Şube'];
  } else if (/yazılım|bilişim|veri|tasarım|çağrı|muhasebe|finans|hukuk|ik |insan kaynak/.test(hay)) {
    preferred = ['Uzaktan', 'Hibrit', 'Ofis'];
  } else if (/satış|pazarlama|gayrimenkul/.test(hay)) {
    preferred = ['Saha', 'Hibrit', 'Ofis'];
  }

  return [...preferred, ...all.filter((item) => !preferred.includes(item))];
}

/** Education levels for career profiles. */
export const CAREER_EDUCATION_LEVELS = [
  'İlköğretim',
  'Lise',
  'Ön lisans',
  'Lisans',
  'Yüksek lisans',
  'Doktora',
  'Meslek yüksekokulu',
  'Diğer',
] as const;

/** Language proficiency levels (UI Turkish). */
export const CAREER_LANGUAGE_LEVELS = [
  'Başlangıç',
  'Temel',
  'Orta',
  'İyi',
  'İleri',
  'Ana Dil',
] as const;

/** Availability to start. */
export const CAREER_AVAILABILITY_OPTIONS = [
  'Hemen',
  '2 hafta içinde',
  '1 ay içinde',
  '2+ ay',
  'Esnek',
] as const;

export const CURRENCY_OPTIONS = ['TRY', 'USD', 'EUR'] as const;

/** Language tag options for hiring listings. */
export const LANGUAGE_OPTIONS = [
  'Türkçe',
  'İngilizce',
  'Almanca',
  'Fransızca',
  'Arapça',
  'Rusça',
  'İspanyolca',
  'Çince',
] as const;

/** Franchise sector / brand category options. */
export const FRANCHISE_SECTOR_OPTIONS = [
  'Gıda & İçecek',
  'Perakende',
  'Hizmet',
  'Eğitim',
  'Sağlık & Güzellik',
  'Otomotiv',
  'Teknoloji',
  'Diğer',
] as const;

/** Franchise investor experience requirement levels. */
export const FRANCHISE_EXPERIENCE_OPTIONS = [
  'Deneyim gerekmez',
  '1-3 yıl işletme deneyimi',
  '3-5 yıl işletme deneyimi',
  '5-10 yıl işletme deneyimi',
  '10+ yıl işletme deneyimi',
] as const;

/** Franchise education requirement levels. */
export const FRANCHISE_EDUCATION_OPTIONS = [
  'Eğitim şartı yok',
  'Lise mezunu',
  'Ön lisans / Lisans',
  'Sektörel sertifika',
  'Mesleki yeterlilik belgesi',
] as const;

/** Estimated return period options. */
export const FRANCHISE_RETURN_PERIOD_OPTIONS = [
  '6-12 ay',
  '12-18 ay',
  '18-24 ay',
  '24-36 ay',
  '36+ ay',
] as const;

/** Average franchise setup / opening duration. */
export const FRANCHISE_SETUP_DURATION_OPTIONS = [
  '1-2 hafta',
  '2-4 hafta',
  '1-2 ay',
  '2-3 ay',
  '3-6 ay',
  '6+ ay',
] as const;

/** Store size options. */
export const FRANCHISE_STORE_SIZE_OPTIONS = [
  '50 m² altı',
  '50-100 m²',
  '100-200 m²',
  '200-500 m²',
  '500 m² üzeri',
] as const;

/** Business category options for franchise model. */
export const FRANCHISE_BUSINESS_CATEGORY_OPTIONS = [
  'Fast food / Quick service',
  'Cafe & Restoran',
  'Perakende mağaza',
  'Hizmet noktası',
  'E-ticaret + fiziksel mağaza',
  'Diğer',
] as const;

/** All provinces + nationwide for franchise availability multi-select. */
export const FRANCHISE_CITY_OPTIONS = [
  ...TURKISH_CITIES,
  'Tüm Türkiye',
] as const;

/** Genel ilan — tür seçenekleri */
export const GENERAL_LISTING_TYPE_OPTIONS = [
  'Ürün',
  'Hizmet',
  'Duyuru',
  'Fırsat / kampanya',
  'Etkinlik',
  'Diğer',
] as const;

/** Genel ilan — durum / koşul */
export const GENERAL_LISTING_CONDITION_OPTIONS = [
  'Yeni',
  'Az kullanılmış',
  'İkinci el',
  'Hizmet (fiziksel ürün yok)',
] as const;

/** Genel ilan — fiyat modeli */
export const GENERAL_LISTING_PRICE_OPTIONS = [
  'Ücretsiz',
  '1.000 TL\'ye kadar',
  '1.000 - 5.000 TL',
  '5.000 - 25.000 TL',
  '25.000 - 100.000 TL',
  '100.000 TL ve üzeri',
  'Teklif alınır',
] as const;

/** Dijital / AI çözüm türleri */
export const DIGITAL_AI_SOLUTION_TYPE_OPTIONS = [
  'Yapay zeka asistanı / ajan',
  'Chatbot & müşteri desteği',
  'SaaS ürünü',
  'Otomasyon & RPA',
  'Veri analitiği & BI',
  'Bilgisayarlı görü',
  'NLP / metin işleme',
  'Özel yazılım geliştirme',
  'AI danışmanlık',
  'Entegrasyon & API',
  'Diğer',
] as const;

/** Dijital / AI teslim modeli */
export const DIGITAL_AI_DELIVERY_OPTIONS = [
  'Abonelik (SaaS)',
  'Proje bazlı',
  'Kurulum + bakım',
  'White-label',
  'API kullanımı',
  'Danışmanlık paketi',
] as const;

/** Dijital / AI hedef kitle */
export const DIGITAL_AI_AUDIENCE_OPTIONS = [
  'Startup',
  'KOBİ',
  'Kurumsal',
  'Ajans / yazılım evi',
  'Bireysel girişimci',
] as const;

/** Dijital / AI yetenek modülleri — titles from digital-ai-capabilities catalog */
export { DIGITAL_AI_CAPABILITY_TITLES as DIGITAL_AI_CAPABILITY_OPTIONS } from '@/features/listings/config/digital-ai-capabilities';

/** Dijital / AI desteklenen diller */
export const DIGITAL_AI_LANGUAGE_OPTIONS = [
  'Türkçe',
  'İngilizce',
  'Almanca',
  'Fransızca',
  'Arapça',
  'Rusça',
  'İspanyolça',
] as const;

/** İşletme Devri — İşletme / Firma Türleri */
export const BUSINESS_TRANSFER_TYPE_OPTIONS = [
  'Kafe / Restoran / Yeme-İçme',
  'Market / Bakkal / Şarküteri',
  'Mağaza / Butik / Perakende',
  'E-Ticaret / Dijital İşletme',
  'Güzellik Merkezi / Kuaför / Spa',
  'Oto Servis / Yıkama / Ekspertiz',
  'Üretim / Atölye / İmalathane',
  'Eğitim / Kurs / Kreş',
  'Sağlık / Klinik / Eczane',
  'Otel / Pansiyon / Konaklama',
  'Lojistik / Depolama / Kargo',
  'Hizmet / Danışmanlık / Ofis',
  'Tarım / Hayvancılık',
  'Spor / Fitness Salonu',
  'İnşaat / Gayrimenkul',
  'Diğer',
] as const;

/** İşletme Devri — Faaliyet Durumu */
export const BUSINESS_TRANSFER_STATUS_OPTIONS = [
  'Aktif Faaliyette (Cirolu & Müşterili)',
  'Faaliyeti Geçici Durduruldu',
  'Sezonluk Faaliyet Gösteren',
  'Yeni Açılmış / Hazır Kurulu Tesis',
] as const;

/** İşletme Devri — Devir Kapsamı */
export const BUSINESS_TRANSFER_SCOPE_OPTIONS = [
  'Demirbaşlar & Ekipmanlar',
  'İşletme Ruhsatı & İzinler',
  'Marka & Tabela Hakkı',
  'Mevcut Ürün Stoku',
  'Web Sitesi & Sosyal Medya Hesapları',
  'Müşteri & Tedarikçi Portföyü',
  'POS & Ödeme Altyapısı',
] as const;

/** İşletme Devri — Devir Nedeni */
export const BUSINESS_TRANSFER_REASON_OPTIONS = [
  'Sektör Değişikliği',
  'Emeklilik',
  'Şehir / Yurt Dışı Değişikliği',
  'Zaman Yetersizliği',
  'Ortaklık Ayrılığı',
  'Yeni Projeye Odaklanma',
  'Sağlık Nedenleri',
  'Diğer',
] as const;

/** İşletme Devri — İşletme Tercihi */
export const BUSINESS_TRANSFER_OPERATIONAL_OPTIONS = [
  'Kendisi İşletecek',
  'Yönetici / Personel Çalıştıracak',
  'Fark Etmez / Esnek',
] as const;

/** İşletme Devri — Bütçe / Devir Bedeli Aralıkları */
export const BUSINESS_TRANSFER_PRICE_RANGES = [
  '250.000 TL\'ye kadar',
  '250.000 - 500.000 TL',
  '500.000 - 1.000.000 TL',
  '1.000.000 - 2.500.000 TL',
  '2.500.000 - 5.000.000 TL',
  '5.000.000 TL ve üzeri',
] as const;

