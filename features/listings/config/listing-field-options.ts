/** Predefined investment amount ranges — stored as display strings in customFields. */
export const INVESTMENT_AMOUNT_RANGES = [
  '500.000 TL\'ye kadar',
  '500.000 - 1.000.000 TL',
  '1.000.000 - 2.500.000 TL',
  '2.500.000 - 5.000.000 TL',
  '5.000.000 - 10.000.000 TL',
  '10.000.000 TL ve üzeri',
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

/** Job seeker / hiring position options. */
export const JOB_POSITION_OPTIONS = [
  'Satış danışmanı',
  'Saha satış uzmanı',
  'Çağrı merkezi temsilcisi',
  'Çağrı merkezi satış temsilcisi',
  'Operasyon uzmanı',
  'Yazılım geliştirici',
  'Pazarlama uzmanı',
  'Finans uzmanı',
  'İnsan kaynakları uzmanı',
  'Ürün yöneticisi',
  'Proje yöneticisi',
  'Veri analisti',
  'Grafik tasarımcı',
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
