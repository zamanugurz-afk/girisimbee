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
  'Diğer',
] as const;

/** Predefined salary ranges for job seeker listings. */
export const SALARY_RANGES = [
  '25.000 TL\'ye kadar',
  '25.000 - 50.000 TL',
  '50.000 - 75.000 TL',
  '75.000 - 100.000 TL',
  '100.000 - 150.000 TL',
  '150.000 TL ve üzeri',
] as const;

/** Hiring salary range options — single-select. */
export const HIRING_SALARY_RANGES = [
  '25.000–35.000 TL',
  '35.000–50.000 TL',
  '50.000–75.000 TL',
  '75.000–100.000 TL',
  '100.000+ TL',
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
  'Bakım teknisyeni',
  'Bankacı / banka personeli',
  'Barista',
  'Berber / kuaför',
  'Bilgisayar teknik servis',
  'Boyacı',
  'Büro personeli',
  'Çağrı merkezi satış temsilcisi',
  'Çağrı merkezi temsilcisi',
  'Çaycı / ofis destek',
  'Çelik işçisi',
  'Çiftçi / tarım işçisi',
  'Depo görevlisi',
  'Diş teknisyeni',
  'Eczane teknisyeni',
  'Eğitmen / öğretmen',
  'Elektrik teknisyeni',
  'Elektrikçi',
  'Fabrika işçisi',
  'Finans uzmanı',
  'Forklift operatörü',
  'Garson',
  'Gayrimenkul danışmanı',
  'Grafik tasarımcı',
  'Güvenlik görevlisi',
  'Hasta bakıcı',
  'Hemşire',
  'Host / hostes',
  'İç mimar',
  'İnsan kaynakları uzmanı',
  'İnşaat işçisi',
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
  'Muhasebeci',
  'Mühendis (elektrik)',
  'Mühendis (inşaat)',
  'Mühendis (makine)',
  'Mühendis (yazılım)',
  'Müşteri temsilcisi',
  'Ofis yöneticisi',
  'Operasyon uzmanı',
  'Oto yıkama personeli',
  'Otomotiv teknisyeni',
  'Otel resepsiyonisti',
  'Pazarlama uzmanı',
  'Personel servis şoförü',
  'Proje yöneticisi',
  'Resepsiyonist',
  'Saha satış uzmanı',
  'Satış danışmanı',
  'Sekreter',
  'Servis elemanı',
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
  'Üretim işçisi',
  'Ürün yöneticisi',
  'Veri analisti',
  'Veteriner teknisyeni',
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

/** Experience levels — Turkish labels (single selection). */
export const EXPERIENCE_LEVELS = [
  'Başlangıç',
  'Orta',
  'Kıdemli',
  'Lider',
  'Direktör',
] as const;

export const CURRENCY_OPTIONS = ['TRY', 'USD', 'EUR'] as const;

/** Language tag options for hiring listings. */
export const LANGUAGE_OPTIONS = [
  'Türkçe',
  'İngilizce',
  'Almanca',
  'Fransızca',
  'Arapça',
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

/** Major cities for franchise availability multi-select. */
export const FRANCHISE_CITY_OPTIONS = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
  'Kocaeli',
  'Mersin',
  'Eskişehir',
  'Samsun',
  'Trabzon',
  'Diyarbakır',
  'Tüm Türkiye',
] as const;
