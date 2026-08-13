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

/** Investor interest sectors — multi-select for "Yatırım Yapacağım". */
export const INVESTOR_SECTOR_OPTIONS = [
  'Fintech',
  'SaaS / Yazılım',
  'E-ticaret',
  'Yapay zeka',
  'Sağlık teknolojisi',
  'Eğitim teknolojisi',
  'Mobil uygulama',
  'Marketplace',
  'Lojistik',
  'Temiz enerji',
  'Siber güvenlik',
  'Gıda teknolojisi',
  'Perakende',
  'Oyun',
  'Medya & içerik',
  'İnsan kaynakları teknolojisi',
  'Proptech',
  'İklim teknolojisi',
  'Tarım teknolojisi',
  'Diğer',
] as const;

/** Career / hiring sectors — broader job market (not only startups). */
export const JOB_SECTOR_OPTIONS = [
  'Bilişim / Yazılım',
  'Yapay zeka / Veri',
  'E-ticaret / Pazaryeri',
  'Finans / Bankacılık',
  'Sigorta',
  'Üretim / Sanayi',
  'İnşaat / Gayrimenkul',
  'Lojistik / Depolama',
  'Perakende / Mağaza',
  'Gıda / Restoran',
  'Turizm / Otelcilik',
  'Sağlık',
  'Eğitim',
  'Pazarlama / Reklam',
  'İnsan kaynakları',
  'Müşteri hizmetleri',
  'Satış',
  'Hukuk',
  'Kamu / Belediye',
  'Enerji',
  'Otomotiv',
  'Tarım',
  'Medya / İçerik',
  'Danışmanlık',
  'Diğer',
] as const;

/** Predefined salary ranges for job seeker listings. */
export const SALARY_RANGES = [
  '25.000 TL\'ye kadar',
  '25.000 - 50.000 TL',
  '50.000 - 75.000 TL',
  '75.000 - 100.000 TL',
  '100.000 - 150.000 TL',
  '150.000 - 200.000 TL',
  '200.000 TL ve üzeri',
] as const;

/** Hiring salary range options — single-select. */
export const HIRING_SALARY_RANGES = [
  '25.000–35.000 TL',
  '35.000–50.000 TL',
  '50.000–75.000 TL',
  '75.000–100.000 TL',
  '100.000–150.000 TL',
  '150.000–200.000 TL',
  '200.000+ TL',
] as const;

/** Investment usage areas — multi-select for seeking investment. */
export const USE_OF_FUNDS_OPTIONS = [
  'Ürün geliştirme',
  'Yazılım geliştirme',
  'Yapay zeka',
  'Pazarlama',
  'İnsan kaynakları',
  'Operasyon',
  'Donanım',
  'Ar-Ge',
  'Uluslararası genişleme',
  'Patent',
  'Üretim',
  'Diğer',
] as const;

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

/** Co-founder expertise options — multi-select. */
export const PARTNER_EXPERTISE_OPTIONS = [
  'CTO / Teknik liderlik',
  'COO / Operasyon',
  'CFO / Finans',
  'CMO / Pazarlama',
  'Yazılım geliştirme',
  'Mobil geliştirme',
  'Yapay zeka / ML',
  'Ürün yönetimi',
  'İş geliştirme',
  'Satış',
  'Büyüme pazarlaması',
  'Tasarım / UX',
  'Hukuk / Uyum',
  'İnsan kaynakları',
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

export const STARTUP_STAGES_WITH_ALL = [
  ...STARTUP_STAGES,
  'Tüm aşamalar',
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
  'Yönetici',
  'Direktör',
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

/** Workplace preference. */
export const CAREER_WORKPLACE_OPTIONS = [
  'Uzaktan',
  'Hibrit',
  'Ofis',
] as const;

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
