import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import {
  CAREER_LANGUAGE_OPTIONS,
  CERTIFICATE_OPTIONS,
  EDUCATION_FIELD_OPTIONS,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { CAREER_EDUCATION_LEVELS } from '@/features/listings/config/listing-field-options';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';
import type {
  DeterministicCvSignals,
  RawExtractedExperience,
  RawExtractedEducation,
  AiCvExtractionPayload,
} from '@/features/candidates/cv/cv.types';

// ============================================================================
// CONSTANTS & REGEXES
// ============================================================================

export const COMMON_TURKISH_DISTRICTS: Record<string, { city: string; district: string }> = {
  maltepe: { city: 'İstanbul', district: 'Maltepe' },
  kadikoy: { city: 'İstanbul', district: 'Kadıköy' },
  besiktas: { city: 'İstanbul', district: 'Beşiktaş' },
  uskudar: { city: 'İstanbul', district: 'Üsküdar' },
  sisli: { city: 'İstanbul', district: 'Şişli' },
  bakirkoy: { city: 'İstanbul', district: 'Bakırköy' },
  atasehir: { city: 'İstanbul', district: 'Ataşehir' },
  umraniye: { city: 'İstanbul', district: 'Ümraniye' },
  pendik: { city: 'İstanbul', district: 'Pendik' },
  kartal: { city: 'İstanbul', district: 'Kartal' },
  cekmekoy: { city: 'İstanbul', district: 'Çekmeköy' },
  sancaktepe: { city: 'İstanbul', district: 'Sancaktepe' },
  sultanbeyli: { city: 'İstanbul', district: 'Sultanbeyli' },
  tuzla: { city: 'İstanbul', district: 'Tuzla' },
  beykoz: { city: 'İstanbul', district: 'Beykoz' },
  sile: { city: 'İstanbul', district: 'Şile' },
  adalar: { city: 'İstanbul', district: 'Adalar' },
  sariyer: { city: 'İstanbul', district: 'Sarıyer' },
  beylikduzu: { city: 'İstanbul', district: 'Beylikdüzü' },
  basaksehir: { city: 'İstanbul', district: 'Başakşehir' },
  esenyurt: { city: 'İstanbul', district: 'Esenyurt' },
  kucukcekmece: { city: 'İstanbul', district: 'Küçükçekmece' },
  buyukcekmece: { city: 'İstanbul', district: 'Büyükçekmece' },
  avcilar: { city: 'İstanbul', district: 'Avcılar' },
  bagcilar: { city: 'İstanbul', district: 'Bağcılar' },
  bahcelievler: { city: 'İstanbul', district: 'Bahçelievler' },
  gungoren: { city: 'İstanbul', district: 'Güngören' },
  zeytinburnu: { city: 'İstanbul', district: 'Zeytinburnu' },
  fatih: { city: 'İstanbul', district: 'Fatih' },
  beyoglu: { city: 'İstanbul', district: 'Beyoğlu' },
  eyupsultan: { city: 'İstanbul', district: 'Eyüpsultan' },
  gaziosmanpasa: { city: 'İstanbul', district: 'Gaziosmanpaşa' },
  kagithane: { city: 'İstanbul', district: 'Kağıthane' },
  sultangazi: { city: 'İstanbul', district: 'Sultangazi' },
  bayrampasa: { city: 'İstanbul', district: 'Bayrampaşa' },
  esenler: { city: 'İstanbul', district: 'Esenler' },
  arnavutkoy: { city: 'İstanbul', district: 'Arnavutköy' },
  silivri: { city: 'İstanbul', district: 'Silivri' },
  catalca: { city: 'İstanbul', district: 'Çatalca' },
  cankaya: { city: 'Ankara', district: 'Çankaya' },
  yenimahalle: { city: 'Ankara', district: 'Yenimahalle' },
  kecioren: { city: 'Ankara', district: 'Keçiören' },
  mamak: { city: 'Ankara', district: 'Mamak' },
  etimesgut: { city: 'Ankara', district: 'Etimesgut' },
  bornova: { city: 'İzmir', district: 'Bornova' },
  karsiyaka: { city: 'İzmir', district: 'Karşıyaka' },
  konak: { city: 'İzmir', district: 'Konak' },
  buca: { city: 'İzmir', district: 'Buca' },
  nilufer: { city: 'Bursa', district: 'Nilüfer' },
  osmangazi: { city: 'Bursa', district: 'Osmangazi' },
  yildirim: { city: 'Bursa', district: 'Yıldırım' },
  muratpasa: { city: 'Antalya', district: 'Muratpaşa' },
  kepez: { city: 'Antalya', district: 'Kepez' },
  konyaalti: { city: 'Antalya', district: 'Konyaaltı' },
  seyhan: { city: 'Adana', district: 'Seyhan' },
  cukurova: { city: 'Adana', district: 'Çukurova' },
  yuregir: { city: 'Adana', district: 'Yüreğir' },
  selcuklu: { city: 'Konya', district: 'Selçuklu' },
  meram: { city: 'Konya', district: 'Meram' },
  karatay: { city: 'Konya', district: 'Karatay' },
  melikgazi: { city: 'Kayseri', district: 'Melikgazi' },
  kocasinan: { city: 'Kayseri', district: 'Kocasinan' },
  tepebasi: { city: 'Eskişehir', district: 'Tepebaşı' },
  odunpazari: { city: 'Eskişehir', district: 'Odunpazarı' },
  gebze: { city: 'Kocaeli', district: 'Gebze' },
  izmit: { city: 'Kocaeli', district: 'İzmit' },
  adapazari: { city: 'Sakarya', district: 'Adapazarı' },
  serdivan: { city: 'Sakarya', district: 'Serdivan' },
  pamukkale: { city: 'Denizli', district: 'Pamukkale' },
  merkezefendi: { city: 'Denizli', district: 'Merkezefendi' },
  ortahisar: { city: 'Trabzon', district: 'Ortahisar' },
  battalgazi: { city: 'Malatya', district: 'Battalgazi' },
  yesilyurt: { city: 'Malatya', district: 'Yeşilyurt' },
  haliliye: { city: 'Şanlıurfa', district: 'Haliliye' },
  eyyubiye: { city: 'Şanlıurfa', district: 'Eyyübiye' },
  karakopru: { city: 'Şanlıurfa', district: 'Karaköprü' },
  sahinbey: { city: 'Gaziantep', district: 'Şahinbey' },
  sehitkamil: { city: 'Gaziantep', district: 'Şehitkamil' },
  baglar: { city: 'Diyarbakır', district: 'Bağlar' },
  kayapinar: { city: 'Diyarbakır', district: 'Kayapınar' },
  yenisehir: { city: 'Diyarbakır', district: 'Yenişehir' },
};

const KNOWN_UNIVERSITIES = [
  'Marmara Üniversitesi',
  'Anadolu Üniversitesi',
  'İstanbul Üniversitesi',
  'Boğaziçi Üniversitesi',
  'Orta Doğu Teknik Üniversitesi',
  'ODTÜ',
  'İstanbul Teknik Üniversitesi',
  'İTÜ',
  'Yıldız Teknik Üniversitesi',
  'YTÜ',
  'Koç Üniversitesi',
  'Sabancı Üniversitesi',
  'Bilkent Üniversitesi',
  'Hacettepe Üniversitesi',
  'Ankara Üniversitesi',
  'Gazi Üniversitesi',
  'Ege Üniversitesi',
  'Dokuz Eylül Üniversitesi',
  'Çukurova Üniversitesi',
  'Akdeniz Üniversitesi',
  'Bahçeşehir Üniversitesi',
  'Yeditepe Üniversitesi',
  'Özyeğin Üniversitesi',
  'TOBB ETÜ',
  'Kadir Has Üniversitesi',
  'Bilgi Üniversitesi',
  'Beykent Üniversitesi',
  'Kocaeli Üniversitesi',
  'Sakarya Üniversitesi',
  'Uludağ Üniversitesi',
  'Eskişehir Osmangazi Üniversitesi',
  'Karadeniz Teknik Üniversitesi',
  'KTÜ',
];

const UNIVERSITY_NAME_MAP: Record<string, string> = {
  'marmara universitesi': 'Marmara Üniversitesi',
  'marmara uni': 'Marmara Üniversitesi',
  marmara: 'Marmara Üniversitesi',
  'anadolu universitesi': 'Anadolu Üniversitesi',
  'anadolu uversitesi': 'Anadolu Üniversitesi',
  'anadolu uni': 'Anadolu Üniversitesi',
  anadolu: 'Anadolu Üniversitesi',
  'istanbul universitesi': 'İstanbul Üniversitesi',
  'istanbul uni': 'İstanbul Üniversitesi',
  'bogazici universitesi': 'Boğaziçi Üniversitesi',
  'bogazici uni': 'Boğaziçi Üniversitesi',
  bogazici: 'Boğaziçi Üniversitesi',
  'orta dogu teknik': 'Orta Doğu Teknik Üniversitesi (ODTÜ)',
  odtu: 'Orta Doğu Teknik Üniversitesi (ODTÜ)',
  metu: 'Orta Doğu Teknik Üniversitesi (ODTÜ)',
  'istanbul teknik': 'İstanbul Teknik Üniversitesi (İTÜ)',
  itu: 'İstanbul Teknik Üniversitesi (İTÜ)',
  'yildiz teknik': 'Yıldız Teknik Üniversitesi (YTÜ)',
  ytu: 'Yıldız Teknik Üniversitesi (YTÜ)',
  'koc universitesi': 'Koç Üniversitesi',
  'koc uni': 'Koç Üniversitesi',
  'sabanci universitesi': 'Sabancı Üniversitesi',
  'sabanci uni': 'Sabancı Üniversitesi',
  'bilkent universitesi': 'Bilkent Üniversitesi',
  'bilkent uni': 'Bilkent Üniversitesi',
  bilkent: 'Bilkent Üniversitesi',
  'hacettepe universitesi': 'Hacettepe Üniversitesi',
  'hacettepe uni': 'Hacettepe Üniversitesi',
  hacettepe: 'Hacettepe Üniversitesi',
  'ankara universitesi': 'Ankara Üniversitesi',
  'ankara uni': 'Ankara Üniversitesi',
  'gazi universitesi': 'Gazi Üniversitesi',
  'gazi uni': 'Gazi Üniversitesi',
  'ege universitesi': 'Ege Üniversitesi',
  'ege uni': 'Ege Üniversitesi',
  'dokuz eylul': 'Dokuz Eylül Üniversitesi',
  'uludag universitesi': 'Uludağ Üniversitesi',
  'uludag uni': 'Uludağ Üniversitesi',
  'cukurova universitesi': 'Çukurova Üniversitesi',
  'cukurova uni': 'Çukurova Üniversitesi',
  'akdeniz universitesi': 'Akdeniz Üniversitesi',
  'akdeniz uni': 'Akdeniz Üniversitesi',
  'bahcesehir universitesi': 'Bahçeşehir Üniversitesi',
  'bahcesehir uni': 'Bahçeşehir Üniversitesi',
  'yeditepe universitesi': 'Yeditepe Üniversitesi',
  'yeditepe uni': 'Yeditepe Üniversitesi',
  'ozyegin universitesi': 'Özyeğin Üniversitesi',
  'ozyegin uni': 'Özyeğin Üniversitesi',
  'kocaeli universitesi': 'Kocaeli Üniversitesi',
  'kocaeli uni': 'Kocaeli Üniversitesi',
  'sakarya universitesi': 'Sakarya Üniversitesi',
  'sakarya uni': 'Sakarya Üniversitesi',
  'bilgi universitesi': 'İstanbul Bilgi Üniversitesi',
  'bilgi uni': 'İstanbul Bilgi Üniversitesi',
  'istanbul bilgi': 'İstanbul Bilgi Üniversitesi',
  'karadeniz teknik': 'Karadeniz Teknik Üniversitesi (KTÜ)',
  ktu: 'Karadeniz Teknik Üniversitesi (KTÜ)',
};

export const KNOWN_TOOLS_DICTIONARY: Record<string, string> = {
  // Office & Productivity
  excel: 'MS Excel',
  'ms excel': 'MS Excel',
  'microsoft excel': 'MS Excel',
  word: 'MS Word',
  'ms word': 'MS Word',
  'microsoft word': 'MS Word',
  powerpoint: 'MS PowerPoint',
  'ms powerpoint': 'MS PowerPoint',
  ppt: 'MS PowerPoint',
  'microsoft 365': 'Microsoft 365',
  'office 365': 'Microsoft 365',
  'ms office': 'Microsoft 365',
  'google workspace': 'Google Workspace',
  'google docs': 'Google Workspace',
  'google sheets': 'Google Workspace',

  // BI, Data & Analytics
  'power bi': 'Power BI',
  powerbi: 'Power BI',
  tableau: 'Tableau',
  'google analytics': 'Google Analytics',
  ga4: 'Google Analytics',
  semrush: 'SEMrush',
  ahrefs: 'Ahrefs',

  // CRM, ERP & Operations
  crm: 'CRM',
  'crm sistemleri': 'CRM Sistemleri',
  erp: 'ERP',
  salesforce: 'Salesforce',
  hubspot: 'HubSpot',
  sap: 'SAP ERP',
  'sap erp': 'SAP ERP',
  'sap - erp': 'SAP ERP',
  spss: 'SPSS',
  'spss analiz': 'SPSS Analiz',
  'ms windows': 'MS Windows',
  windows: 'MS Windows',
  oracle: 'Oracle',
  logo: 'Logo',
  'logo tiger': 'Logo',
  'logo go': 'Logo',
  netsis: 'Netsis',
  mikro: 'Mikro',

  // Project Management & Collaboration
  jira: 'Jira',
  confluence: 'Confluence',
  trello: 'Trello',
  asana: 'Asana',
  notion: 'Notion',
  slack: 'Slack',
  postman: 'Postman',
  figma: 'Figma',
  canva: 'Canva',
  photoshop: 'Adobe Photoshop',
  illustrator: 'Adobe Illustrator',

  // Tech, Cloud & Engineering
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'Google Cloud',
  'google cloud': 'Google Cloud',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  redis: 'Redis',
  sql: 'SQL',
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  react: 'React',
  'react.js': 'React',
  reactjs: 'React',
  'node.js': 'Node.js',
  node: 'Node.js',
  nodejs: 'Node.js',
  'next.js': 'Next.js',
  nextjs: 'Next.js',
  angular: 'Angular',
  vue: 'Vue.js',
  'vue.js': 'Vue.js',
  'cisco ccna': 'Cisco CCNA',
  ccna: 'Cisco CCNA',

  // Ads Platforms
  'google ads': 'Google Ads',
  'meta ads': 'Meta Ads',
  'facebook ads': 'Meta Ads',
};

export const KNOWN_SECTOR_KEYWORDS: Record<string, string> = {
  banka: 'Finans / Bankacılık',
  bankacilik: 'Finans / Bankacılık',
  banking: 'Finans / Bankacılık',
  finans: 'Finans / Bankacılık',
  finance: 'Finans / Bankacılık',
  fintech: 'Finans / Bankacılık',
  yatirim: 'Finans / Bankacılık',
  investment: 'Finans / Bankacılık',
  'sermaye piyasasi': 'Finans / Bankacılık',
  borsa: 'Finans / Bankacılık',

  sigorta: 'Sigortacılık',
  sigortacilik: 'Sigortacılık',
  insurance: 'Sigortacılık',

  'cagri merkezi': 'Müşteri Hizmetleri / Çağrı Merkezi',
  'call center': 'Müşteri Hizmetleri / Çağrı Merkezi',
  'musteri hizmetleri': 'Müşteri Hizmetleri / Çağrı Merkezi',
  'customer support': 'Müşteri Hizmetleri / Çağrı Merkezi',
  'customer service': 'Müşteri Hizmetleri / Çağrı Merkezi',
  telemarketing: 'Müşteri Hizmetleri / Çağrı Merkezi',

  yazilim: 'Bilişim / Yazılım',
  bilisim: 'Bilişim / Yazılım',
  software: 'Bilişim / Yazılım',
  teknoloji: 'Bilişim / Yazılım',
  it: 'Bilişim / Yazılım',
  'information technology': 'Bilişim / Yazılım',

  perakende: 'Perakende / Mağazacılık',
  magazacilik: 'Perakende / Mağazacılık',
  retail: 'Perakende / Mağazacılık',

  'e-ticaret': 'E-Ticaret',
  eticaret: 'E-Ticaret',
  'e-commerce': 'E-Ticaret',
  ecommerce: 'E-Ticaret',

  saglik: 'Sağlık / Medikal',
  medikal: 'Sağlık / Medikal',
  healthcare: 'Sağlık / Medikal',
  health: 'Sağlık / Medikal',
  hastane: 'Sağlık / Medikal',

  otomotiv: 'Otomotiv',
  automotive: 'Otomotiv',

  lojistik: 'Lojistik / Taşımacılık',
  tasimacilik: 'Lojistik / Taşımacılık',
  logistics: 'Lojistik / Taşımacılık',
  transportation: 'Lojistik / Taşımacılık',
  'supply chain': 'Lojistik / Taşımacılık',

  uretim: 'Üretim / İmalat',
  imalat: 'Üretim / İmalat',
  sanayi: 'Üretim / İmalat',
  manufacturing: 'Üretim / İmalat',

  turizm: 'Turizm / Otelcilik',
  otelcilik: 'Turizm / Otelcilik',
  tourism: 'Turizm / Otelcilik',
  hospitality: 'Turizm / Otelcilik',

  egitim: 'Eğitim',
  education: 'Eğitim',
  edtech: 'Eğitim',

  gayrimenkul: 'Gayrimenkul',
  'real estate': 'Gayrimenkul',

  danismanlik: 'Danışmanlık',
  consulting: 'Danışmanlık',

  telekom: 'Telekomünikasyon',
  telekomunikasyon: 'Telekomünikasyon',
  telecommunications: 'Telekomünikasyon',

  pazarlama: 'Pazarlama / Reklam',
  reklam: 'Pazarlama / Reklam',
  marketing: 'Pazarlama / Reklam',
  advertising: 'Pazarlama / Reklam',

  enerji: 'Enerji',
  energy: 'Enerji',
};

// Direct Skill Alias Mapping (English + Turkish to Canonical Skill)
export const KNOWN_SKILL_ALIASES: Record<string, string> = {
  // Sales & Business Dev
  'satış yönetimi': 'Satış Yönetimi',
  'sales management': 'Satış Yönetimi',
  'saha satış yönetimi': 'Saha Satış Yönetimi',
  'field sales management': 'Saha Satış Yönetimi',
  'yeni müşteri kazanımı': 'Yeni Müşteri Kazanımı',
  'new customer acquisition': 'Yeni Müşteri Kazanımı',
  'lead generation': 'Lead Generation',
  'kurumsal satış': 'Kurumsal Satış',
  'b2b sales': 'Kurumsal Satış',
  'b2c sales': 'B2C Satış',
  'iş geliştirme': 'İş Geliştirme',
  'business development': 'İş Geliştirme',
  'kanal geliştirme': 'Kanal Geliştirme',
  'kanal yönetimi': 'Kanal Yönetimi',
  'channel management': 'Kanal Yönetimi',
  'alternatif satış kanalları yönetimi': 'Alternatif Satış Kanalları Yönetimi',
  'alternatif satış kanalları': 'Alternatif Satış Kanalları Yönetimi',
  'alternative sales channels': 'Alternatif Satış Kanalları Yönetimi',
  'çapraz satış': 'Çapraz Satış',
  'cross selling': 'Çapraz Satış',
  'pazarlık ve müzakere': 'Pazarlık ve Müzakere',
  'negotiation': 'Pazarlık ve Müzakere',

  // Operations & Management
  'operasyon yönetimi': 'Operasyon Yönetimi',
  'operations management': 'Operasyon Yönetimi',
  'çağrı merkezi': 'Çağrı Merkezi Yönetimi',
  'çağrı merkezi yönetimi': 'Çağrı Merkezi Yönetimi',
  'çağrı merkezi operasyonları': 'Çağrı Merkezi Yönetimi',
  'call center': 'Çağrı Merkezi Yönetimi',
  'call center management': 'Çağrı Merkezi Yönetimi',
  'ekip yönetimi': 'Ekip Yönetimi',
  'team management': 'Ekip Yönetimi',
  'ekip ve performans yönetimi': 'Ekip ve Performans Yönetimi',
  'performans yönetimi': 'Performans Yönetimi',
  'performance management': 'Performans Yönetimi',
  'bütçe yönetimi': 'Bütçe Yönetimi',
  'budget management': 'Bütçe Yönetimi',
  'proje yönetimi': 'Proje Yönetimi',
  'project management': 'Proje Yönetimi',
  'stratejik planlama': 'Stratejik Planlama',
  'strategic planning': 'Stratejik Planlama',
  'kalite yönetimi': 'Kalite Yönetimi',
  'quality management': 'Kalite Yönetimi',
  'süreç iyileştirme': 'Süreç İyileştirme',
  'process improvement': 'Süreç İyileştirme',
  'outsource operasyon yönetimi': 'Outsource Operasyon Yönetimi',
  'outsource kanal yönetimi': 'Outsource Kanal Yönetimi',
  'portföy yönetimi': 'Portföy Yönetimi',
  'portfolio management': 'Portföy Yönetimi',
  'risk yönetimi': 'Risk Yönetimi',
  'risk management': 'Risk Yönetimi',
  'kriz yönetimi': 'Kriz Yönetimi',
  'zaman yönetimi': 'Zaman Yönetimi',
  'time management': 'Zaman Yönetimi',
  'problem çözme': 'Problem Çözme',
  'problem solving': 'Problem Çözme',

  // Customer Relations
  'müşteri ilişkileri yönetimi': 'Müşteri İlişkileri Yönetimi',
  'customer relationship management': 'Müşteri İlişkileri Yönetimi',
  'müşteri ilişkileri': 'Müşteri İlişkileri Yönetimi',
  'customer relations': 'Müşteri İlişkileri Yönetimi',
  'müşteri deneyimi': 'Müşteri Deneyimi',
  'customer experience': 'Müşteri Deneyimi',
  'müşteri hizmetleri': 'Müşteri Hizmetleri',
  'customer service': 'Müşteri Hizmetleri',
  'kurumsal müşteri yönetimi': 'Kurumsal Müşteri Yönetimi',

  // Finance & Analysis
  'finansal analiz': 'Finansal Analiz',
  'financial analysis': 'Finansal Analiz',
  'finansal yönetim': 'Finansal Yönetim',
  'finansal denetim': 'Finansal Denetim',
  'financial audit': 'Finansal Denetim',
  'denetim': 'Finansal Denetim',
  'veri analizi': 'Veri Analizi',
  'data analysis': 'Veri Analizi',
  'raporlama': 'Raporlama',
  'reporting': 'Raporlama',

  // Tech & Digital Marketing
  'yazılım geliştirme': 'Yazılım Geliştirme',
  'software development': 'Yazılım Geliştirme',
  'dijital pazarlama': 'Dijital Pazarlama',
  'digital marketing': 'Dijital Pazarlama',
  'performans pazarlaması': 'Performans Pazarlaması',
  'performance marketing': 'Performans Pazarlaması',
  'dijital lead yönetimi': 'Dijital Lead Yönetimi',
  'dijital satış yönetimi': 'Dijital Satış Yönetimi',
  'inbound operasyon yönetimi': 'Inbound Operasyon Yönetimi',
  'outbound operasyon yönetimi': 'Outbound Operasyon Yönetimi',
  'telemarketing': 'Telemarketing',
  'seo / sem': 'SEO / SEM',
  'seo': 'SEO / SEM',
  'sem': 'SEO / SEM',
  'sosyal medya yönetimi': 'Sosyal Medya Yönetimi',
  'social media management': 'Sosyal Medya Yönetimi',
  'veritabanı yönetimi': 'Veritabanı Yönetimi',
  'api entegrasyonu': 'API Entegrasyonu',
  'sistem mimarisi': 'Sistem Mimarisi',
  'otomasyon': 'Otomasyon',
  'test otomasyonu': 'Test Otomasyonu',
  'agile': 'Agile / Scrum',
  'scrum': 'Agile / Scrum',
};

export const KNOWN_CERTIFICATES_MAP: Record<string, string> = {
  segem: 'SEGEM',
  spl: 'SPL',
  bes: 'Bireysel Emeklilik Aracılığı (BES)',
  pmp: 'PMP (Project Management Professional)',
  scrum: 'Scrum Master',
  'scrum master': 'Scrum Master',
  psm: 'PSM (Professional Scrum Master)',
  'psm i': 'PSM (Professional Scrum Master)',
  aws: 'AWS Certified',
  'aws certified': 'AWS Certified',
  azure: 'Microsoft Certified: Azure',
  'google cloud': 'Google Cloud Certified',
  itil: 'ITIL Foundation',
  cfa: 'CFA',
  smmm: 'SMMM',
  ccna: 'Cisco CCNA',
  'iso 9001': 'ISO 9001 Kalite Yönetimi',
  'six sigma': 'Six Sigma',
  'yalin uretim': 'Yalın Üretim',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function normalizeTrForMatch(str: string): string {
  if (!str) return '';
  let collapsed = str
    .replace(/([a-zA-ZçğıöşüÇĞİÖŞÜ]+)[ \t]+([çğıöşüÇĞİÖŞÜ])(?![a-zA-ZçğıöşüÇĞİÖŞÜ])/gi, '$1$2')
    .replace(/(?<![a-zA-ZçğıöşüÇĞİÖŞÜ])([çğıöşüÇĞİÖŞÜ])[ \t]+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)/gi, '$1$2')
    .replace(/(?:^|\s)Çağ[ \t]+rı(?=\s|$|[,;.\-\/])/gi, (m) => m.replace(/Çağ[ \t]+rı/i, 'Çağrı'))
    .replace(/(?:^|\s)Müş[ \t]+teri(?=\s|$|[,;.\-\/])/gi, (m) => m.replace(/Müş[ \t]+teri/i, 'Müşteri'))
    .replace(/(?:^|\s)Ağ[ \t]+ustos(?=\s|$|[,;.\-\/])/gi, (m) => m.replace(/Ağ[ \t]+ustos/i, 'Ağustos'))
    .replace(/(?:^|\s)Kiş[ \t]+isel(?=\s|$|[,;.\-\/])/gi, (m) => m.replace(/Kiş[ \t]+isel/i, 'Kişisel'))
    .replace(/(?:^|\s)Geliş[ \t]+tirme(?=\s|$|[,;.\-\/])/gi, (m) => m.replace(/Geliş[ \t]+tirme/i, 'Geliştirme'))
    .replace(/(?:^|\s)İliş[ \t]+kileri(?=\s|$|[,;.\-\/])/gi, (m) => m.replace(/İliş[ \t]+kileri/i, 'İlişkileri'))
    .replace(/Üni[ \t]*versi[ \t]*tesi/gi, 'Üniversitesi')
    .replace(/F[ \t]+İ[ \t]+B[ \t]*A[ \t]*B[ \t]*A[ \t]*N[ \t]*K[ \t]*A/gi, 'Fibabanka')
    .replace(/G[ \t]+E[ \t]+D[ \t]+İ[ \t]+K/gi, 'Gedik');

  return collapsed
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^a-z0-9\s/–—-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatTurkishTitle(str: string): string {
  if (!str) return '';
  const words = str.trim().split(/\s+/);
  return words
    .map((w) => {
      if (/^(ve|veya|ile|for|and|in|at|on)$/i.test(w)) return w.toLowerCase();
      if (/^[A-ZÇĞİÖŞÜ]{2,4}$/.test(w)) return w; // Acronyms like IGS, CRM, ERP, ITÜ
      return w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR');
    })
    .join(' ');
}

export function isRoleTitle(line: string): boolean {
  if (!line) return false;
  const clean = line.trim();
  if (clean.length > 70) return false;
  if (clean.endsWith('.') || clean.endsWith(';') || clean.endsWith(':')) return false;

  const norm = normalizeTrForMatch(clean);
  // Block company / institution suffixes
  if (
    norm.includes('hizmetleri') ||
    norm.includes('insaat') ||
    norm.includes('belediyesi') ||
    norm.includes('universitesi') ||
    norm.includes('enstitusu') ||
    norm.includes('holding') ||
    norm.includes('a s') ||
    norm.includes('ltd') ||
    norm.includes('sti') ||
    norm.includes('sirketi') ||
    norm.includes('kurumu') ||
    norm.includes('bakanligi') ||
    norm.includes('mudurlugu')
  ) {
    return false;
  }

  // Block responsibility sentence patterns
  if (
    norm.includes('surecleri') ||
    norm.includes('sureclerinin') ||
    norm.includes('yurutulmesi') ||
    norm.includes('saglanmasi') ||
    norm.includes('yapilmasi') ||
    norm.includes('sunulmasi') ||
    norm.includes('takibi') ||
    norm.includes('yonetimi ve') ||
    norm.includes('alaninda') ||
    norm.includes('sahibim') ||
    norm.includes('calismaktayim')
  ) {
    return false;
  }

  return (
    norm.includes('mudur') ||
    norm.includes('direktor') ||
    norm.includes('yonetici') ||
    norm.includes('uzman') ||
    norm.includes('lider') ||
    norm.includes('temsilci') ||
    norm.includes('muhendis') ||
    norm.includes('analist') ||
    norm.includes('danisman') ||
    norm.includes('gelistirici') ||
    norm.includes('eleman') ||
    norm.includes('personel') ||
    norm.includes('gorevli') ||
    norm.includes('sorumlu') ||
    norm.includes('asistan') ||
    norm.includes('yetkili') ||
    norm.includes('operator') ||
    norm.includes('teknisyen') ||
    norm.includes('tekniker') ||
    norm.includes('kasiyer') ||
    norm.includes('sofor') ||
    norm.includes('surucu') ||
    norm.includes('usta') ||
    norm.includes('cirak') ||
    norm.includes('kalfa') ||
    norm.includes('isci') ||
    norm.includes('memur') ||
    norm.includes('calisan') ||
    norm.includes('baskan') ||
    norm.includes('sef') ||
    norm.includes('koordinator') ||
    norm.includes('doktor') ||
    norm.includes('hekim') ||
    norm.includes('hemsire') ||
    norm.includes('eczaci') ||
    norm.includes('avukat') ||
    norm.includes('ogretmen') ||
    norm.includes('egitmen') ||
    norm.includes('mimar') ||
    norm.includes('tasarimci') ||
    norm.includes('yazar') ||
    norm.includes('editor') ||
    norm.includes('muhasebeci') ||
    norm.includes('manager') ||
    norm.includes('director') ||
    norm.includes('lead') ||
    norm.includes('specialist') ||
    norm.includes('developer') ||
    norm.includes('engineer') ||
    norm.includes('consultant') ||
    norm.includes('analyst') ||
    norm.includes('executive') ||
    norm.includes('intern') ||
    norm.includes('stajyer') ||
    norm.includes('agent') ||
    norm.includes('officer') ||
    norm.includes('clerk') ||
    norm.includes('associate') ||
    norm.includes('worker') ||
    norm.includes('helper') ||
    norm.includes('staff')
  );
}

// ============================================================================
// 1. LOCATION DETERMINISTIC PARSER
// ============================================================================

export function extractDeterministicLocations(text: string): {
  city: string;
  district?: string;
  detectedCities: string[];
} {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const detectedCities: string[] = [];

  // Check top 20 lines (header / contact section) first for district
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const lineNorm = ` ${normalizeTrForMatch(lines[i])} `;
    for (const [distKey, data] of Object.entries(COMMON_TURKISH_DISTRICTS)) {
      const distRegex = new RegExp(`(?:^|\\s)${distKey}(?:\\s|$)`, 'i');
      if (distRegex.test(lineNorm)) {
        return {
          city: data.city,
          district: data.district,
          detectedCities: [data.city],
        };
      }
    }
  }

  const normText = ` ${normalizeTrForMatch(text)} `;
  let detectedCity = '';
  let detectedDistrict = '';

  // Check District Dictionary
  for (const [distKey, data] of Object.entries(COMMON_TURKISH_DISTRICTS)) {
    const regex = new RegExp(`(?:^|\\s)${distKey}(?:\\s|$)`, 'i');
    if (regex.test(normText)) {
      detectedCity = data.city;
      detectedDistrict = data.district;
      detectedCities.push(data.city);
      break;
    }
  }

  // Check 81 Turkish Cities + English City Names
  const cityAliases: Record<string, string> = {
    istanbul: 'İstanbul',
    ankara: 'Ankara',
    izmir: 'İzmir',
    bursa: 'Bursa',
    antalya: 'Antalya',
    adana: 'Adana',
    konya: 'Konya',
    gaziantep: 'Gaziantep',
    kayseri: 'Kayseri',
    mersin: 'Mersin',
    eskisehir: 'Eskişehir',
    diyarbakir: 'Diyarbakır',
    samsun: 'Samsun',
    denizli: 'Denizli',
    sanliurfa: 'Şanlıurfa',
    adapazari: 'Sakarya',
    sakarya: 'Sakarya',
    kocaeli: 'Kocaeli',
    izmit: 'Kocaeli',
    trabzon: 'Trabzon',
    malatya: 'Malatya',
    erzurum: 'Erzurum',
    van: 'Van',
    batman: 'Batman',
    elazig: 'Elazığ',
    tekirdag: 'Tekirdağ',
  };

  for (const [cKey, cName] of Object.entries(cityAliases)) {
    const regex = new RegExp(`(?:^|\\s)${cKey}(?:\\s|$)`, 'i');
    if (regex.test(normText)) {
      if (!detectedCity) detectedCity = cName;
      detectedCities.push(cName);
    }
  }

  return {
    city: detectedCity || detectedCities[0] || '',
    district: detectedDistrict,
    detectedCities: [...new Set(detectedCities)],
  };
}

// ============================================================================
// 2. DATE & PERIOD DETERMINISTIC PARSER
// ============================================================================

export interface ParsedDateRange {
  startYear: number | null;
  endYear: number | null;
  startMonth?: number;
  endMonth?: number;
  duration?: string;
  isCurrent: boolean;
  raw: string;
}

export function parseDateRangeText(line: string): ParsedDateRange | null {
  let norm = line.toLowerCase().replace(/[–—]/g, '-').trim();
  norm = norm
    .replace(/a\s*g\s*u\s*s\s*t\s*o\s*s|a\s*ğ\s*u\s*s\s*t\s*o\s*s/g, 'ağustos')
    .replace(/e\s*y\s*l\s*ü\s*l|e\s*y\s*l\s*u\s*l/g, 'eylül')
    .replace(/k\s*a\s*s\s*ı\s*m|k\s*a\s*s\s*i\s*m/g, 'kasım')
    .replace(/a\s*r\s*a\s*l\s*ı\s*k|a\s*r\s*a\s*l\s*i\s*k/g, 'aralık')
    .replace(/ş\s*u\s*b\s*a\s*t|s\s*u\s*b\s*a\s*t/g, 'şubat')
    .replace(/h\s*a\s*z\s*i\s*r\s*a\s*n/g, 'haziran')
    .replace(/t\s*e\s*m\s*m\s*u\s*z/g, 'temmuz')
    .replace(/m\s*a\s*y\s*ı\s*s|m\s*a\s*y\s*i\s*s/g, 'mayıs')
    .replace(/n\s*i\s*s\s*a\s*n/g, 'nisan')
    .replace(/o\s*c\s*a\s*k/g, 'ocak')
    .replace(/m\s*a\s*r\s*t/g, 'mart')
    .replace(/e\s*k\s*i\s*m/g, 'ekim');

  const months = 'ocak|subat|şubat|mart|nisan|mayis|mayıs|haziran|temmuz|agustos|ağustos|eylul|eylül|ekim|kasim|kasım|aralik|aralık|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
  const activePattern = 'günümüz|gunumuz|güncel|guncel|devam(?:\\s*ediyor)?|present|current|halen|hala(?:\\s*çalışıyorum|\\s*calisiyorum)?|çalışıyorum|calisiyorum|sürüyor|suruyor|now';

  const rangeRegex = new RegExp(
    `(?:(?:${months}|\\d{1,2})[.\\s/]+)?(19\\d{2}|20\\d{2})\\s*(?:-|to|ila|ile|/)\\s*(?:(?:${months}|\\d{1,2})[.\\s/]+)?(19\\d{2}|20\\d{2}|${activePattern})`,
    'i'
  );
  const match = norm.match(rangeRegex);

  if (match) {
    const startYear = parseInt(match[1], 10);
    const endStr = match[2].toLowerCase();
    const isCurrent = new RegExp(activePattern, 'i').test(endStr);
    const endYear = isCurrent ? new Date().getFullYear() : parseInt(endStr, 10);

    const durationMatch = line.match(/\(([^)]*(?:yıl|ay|sene|year|month)[^)]*)\)/i);
    const duration = durationMatch ? durationMatch[1].trim() : undefined;

    return {
      startYear: Number.isFinite(startYear) ? startYear : null,
      endYear: Number.isFinite(endYear) ? endYear : null,
      isCurrent,
      duration,
      raw: match[0],
    };
  }

  const singleYearCurrent = norm.match(new RegExp(`\\b(19\\d{2}|20\\d{2})\\s*-\\s*(${activePattern})\\b`, 'i'));
  if (singleYearCurrent) {
    return {
      startYear: parseInt(singleYearCurrent[1], 10),
      endYear: new Date().getFullYear(),
      isCurrent: true,
      raw: singleYearCurrent[0],
    };
  }

  // Check for standalone active keyword on line (e.g. "IGS ASİSTANS HİZMETLERİ Güncel" or "Güncel")
  const singleActive = norm.match(new RegExp(`\\b(${activePattern})\\b`, 'i'));
  if (singleActive) {
    const yr = new Date().getFullYear();
    return {
      startYear: yr,
      endYear: yr,
      isCurrent: true,
      raw: singleActive[0],
    };
  }

  // Check for 4-digit year (e.g. "SİGORTAMBİR A.Ş 2025" or "2023" or "(2021)")
  const singleYear = norm.match(/(?:^|\s|\()((?:19[7-9]\d|20[0-3]\d))(?:\s|\)|$)/);
  if (singleYear) {
    const yr = parseInt(singleYear[1], 10);
    return {
      startYear: yr,
      endYear: yr,
      isCurrent: false,
      raw: singleYear[1],
    };
  }

  return null;
}

// ============================================================================
// 3. EDUCATION DETERMINISTIC PARSER (100% Deterministic)
// ============================================================================

function isEduSectionHeader(line: string): boolean {
  if (!line || line.length > 45) return false;
  const norm = normalizeTrForMatch(line).replace(/[^a-z]/g, '');
  return (
    norm.startsWith('egitim') ||
    norm.startsWith('education') ||
    norm.startsWith('academic') ||
    norm.startsWith('ogrenim')
  );
}

function isOtherSectionHeader(line: string): boolean {
  if (!line || line.length > 50) return false;
  const norm = normalizeTrForMatch(line);
  return (
    norm.startsWith('is deneyim') ||
    norm.startsWith('deneyim') ||
    norm.startsWith('work experience') ||
    norm.startsWith('experience') ||
    norm.startsWith('staj') ||
    norm.startsWith('yetkinlik') ||
    norm.startsWith('yetenek') ||
    norm.startsWith('skills') ||
    norm.startsWith('beceri') ||
    norm.startsWith('sertifika') ||
    norm.startsWith('diller') ||
    norm.startsWith('languages') ||
    norm.startsWith('projeler') ||
    norm.startsWith('referans') ||
    norm.startsWith('iletisim') ||
    norm.startsWith('contact') ||
    norm.startsWith('hakkimda') ||
    norm.startsWith('ozet') ||
    norm.startsWith('summary')
  );
}

export function extractDeterministicEducation(text: string): RawExtractedEducation[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const eduRecords: RawExtractedEducation[] = [];

  let inEduSection = false;
  const eduLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isEduSectionHeader(line)) {
      inEduSection = true;
      continue;
    }

    if (inEduSection) {
      if (isOtherSectionHeader(line)) {
        break;
      }
      eduLines.push(line);
    }
  }

  const targetLines = eduLines.length > 0 ? eduLines : lines;
  let currentEdu: RawExtractedEducation | null = null;

  for (let i = 0; i < targetLines.length; i++) {
    const line = targetLines[i];
    const norm = normalizeTrForMatch(line);

    let level: string | undefined;
    if (norm.includes('doktora') || norm.includes('phd') || norm.includes('doctorate')) {
      level = 'Doktora';
    } else if (
      norm.includes('yuksek lisans') ||
      norm.includes('master') ||
      norm.includes('mba') ||
      norm.includes('msc') ||
      norm.includes('tezli') ||
      norm.includes('tezsiz')
    ) {
      level = 'Yüksek Lisans';
    } else if (
      norm.includes('lisans') ||
      norm.includes('bachelor') ||
      norm.includes('undergraduate') ||
      norm.includes('bs') ||
      norm.includes('ba')
    ) {
      level = 'Lisans';
    } else if (
      norm.includes('on lisans') ||
      norm.includes('onlisans') ||
      norm.includes('associate') ||
      norm.includes('meslek yuksek okulu') ||
      norm.includes('myo')
    ) {
      level = 'Ön Lisans';
    } else if (norm.includes('lise') || norm.includes('high school')) {
      level = 'Lise';
    }

    let school: string | undefined;
    for (const [uKey, uFull] of Object.entries(UNIVERSITY_NAME_MAP)) {
      if (norm.includes(uKey)) {
        school = uFull;
        break;
      }
    }

    if (!school) {
      const uniMatch = line.match(/([A-ZÇĞİÖŞÜa-zçğıöşü\s]+(?:Üniversitesi|Universitesi|University|Enstitüsü|Fakültesi|MYO|Lisesi|Lise))/i);
      if (uniMatch) school = uniMatch[1].trim();
    }

    const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/);
    const gradYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

    let field: string | undefined;
    for (const opt of EDUCATION_FIELD_OPTIONS) {
      if (opt === 'Diğer / Kendim gireceğim') continue;
      const optNorm = normalizeTrForMatch(opt);
      if (norm.includes(optNorm)) {
        field = opt;
        break;
      }
    }

    if (!field && inEduSection && !school && !level && !gradYear && line.length >= 3 && line.length <= 60 && !parseDateRangeText(line)) {
      field = suggestTitleCaseTr(line);
    }

    if (!field && school && (line.includes(',') || line.includes('-') || line.includes('|') || line.includes('/'))) {
      const parts = line.split(/[,–—|/]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const nonSchoolPart = parts.find((p) => !normalizeTrForMatch(p).includes(normalizeTrForMatch(school || '')));
        if (nonSchoolPart && nonSchoolPart.length >= 3 && !parseDateRangeText(nonSchoolPart)) {
          field = nonSchoolPart;
        }
      }
    }

    if (school || level || field || gradYear) {
      if (
        currentEdu &&
        ((school && currentEdu.school && school !== currentEdu.school) ||
          (level && currentEdu.level && level !== currentEdu.level))
      ) {
        eduRecords.push(currentEdu);
        currentEdu = null;
      }

      if (!currentEdu) {
        currentEdu = {
          school,
          level,
          field,
          graduationYear: gradYear,
        };
      } else {
        if (school && !currentEdu.school) currentEdu.school = school;
        if (level && !currentEdu.level) currentEdu.level = level;
        if (field && !currentEdu.field) currentEdu.field = field;
        if (gradYear && !currentEdu.graduationYear) currentEdu.graduationYear = gradYear;
      }
    }
  }

  if (currentEdu && (currentEdu.school || currentEdu.level || currentEdu.field)) {
    eduRecords.push(currentEdu);
  }

  // Merge and group by school/field to prevent line fragmentation
  const schoolGroups: Record<string, RawExtractedEducation> = {};
  for (const e of eduRecords) {
    const key = e.school ? normalizeTrForMatch(e.school) : e.field ? normalizeTrForMatch(e.field) : 'edu';
    if (!schoolGroups[key]) {
      schoolGroups[key] = { ...e };
    } else {
      if (e.school && !schoolGroups[key].school) schoolGroups[key].school = e.school;
      if (e.level && !schoolGroups[key].level) schoolGroups[key].level = e.level;
      if (e.field && !schoolGroups[key].field) schoolGroups[key].field = e.field;
      if (e.graduationYear && !schoolGroups[key].graduationYear) schoolGroups[key].graduationYear = e.graduationYear;
    }
  }

  const uniqueEdu = Object.values(schoolGroups).filter((e) => {
    if (e.school) return true;
    if (e.level && e.field) {
      const normField = normalizeTrForMatch(e.field);
      return !normField.includes('bilgi') && !normField.includes('hakkimda') && !normField.includes('ozet') && !normField.includes('deneyim') && !normField.includes('yetkinlik');
    }
    return false;
  });

  return uniqueEdu;
}

// ============================================================================
// 4. EXPERIENCES DETERMINISTIC PARSER (100% Deterministic)
// ============================================================================

function isPureDateLine(line: string): boolean {
  if (!line) return false;
  const norm = normalizeTrForMatch(line);
  if (!norm) return false;
  const words = norm.split(/\s+/).filter(Boolean);
  const monthsAndTerms = [
    'ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran',
    'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik',
    'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    'yil', 'ay', 'gunumuz', 'devam', 'present', 'current', 'halen', 'to', 'ila', 'ile',
    'year', 'years', 'month', 'months', 'duration', 'sure'
  ];
  return words.every((w) => monthsAndTerms.includes(w) || /^\d+$/.test(w) || /^[-–—/()]+$/.test(w));
}

function isExperienceSectionHeader(line: string): boolean {
  if (!line || line.length > 50) return false;
  const norm = normalizeTrForMatch(line);
  return (
    norm === 'is deneyimi' ||
    norm === 'is deneyimleri' ||
    norm === 'deneyim' ||
    norm === 'deneyimler' ||
    norm === 'staj' ||
    norm === 'stajlar' ||
    norm === 'staj ve deneyim' ||
    norm === 'staj ve deneyimler' ||
    norm === 'staj deneyimi' ||
    norm === 'staj deneyimleri' ||
    norm === 'work experience' ||
    norm === 'experience' ||
    norm === 'employment history' ||
    norm === 'career history' ||
    norm === 'kariyer' ||
    norm === 'profesyonel deneyim' ||
    norm === 'professional experience' ||
    norm === 'is gecmisi' ||
    norm.startsWith('is deneyim') ||
    norm.startsWith('is gecmis') ||
    norm.startsWith('staj ve') ||
    norm.startsWith('staj deneyim')
  );
}

function isEduLine(line: string): boolean {
  if (!line) return false;
  const norm = normalizeTrForMatch(line);
  return (
    norm.includes('universite') ||
    norm.includes('university') ||
    norm.includes('fakulte') ||
    norm.includes('faculty') ||
    norm.includes('enstitu') ||
    norm.includes('institute') ||
    norm.includes('lisesi') ||
    norm.includes('myo') ||
    norm.includes('yuksek lisans') ||
    norm.includes('on lisans') ||
    norm.includes('lisans:') ||
    norm.startsWith('lisans') ||
    norm.startsWith('egitim') ||
    norm.startsWith('ogrenim') ||
    norm.startsWith('education')
  );
}

export function extractDeterministicExperiences(text: string): RawExtractedExperience[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const experiences: RawExtractedExperience[] = [];

  let inExpSection = false;
  const expLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const norm = normalizeTrForMatch(line);

    if (isExperienceSectionHeader(line)) {
      inExpSection = true;
      continue;
    }

    if (inExpSection) {
      if (
        norm.startsWith('egitim') ||
        norm.startsWith('education') ||
        norm.startsWith('academic') ||
        norm.startsWith('yetkinlik') ||
        norm.startsWith('yetenek') ||
        norm.startsWith('skills') ||
        norm.startsWith('beceri') ||
        norm.startsWith('sertifika') ||
        norm.startsWith('diller') ||
        norm.startsWith('languages') ||
        norm.startsWith('projeler') ||
        norm.startsWith('referans') ||
        norm.startsWith('hobi') ||
        norm.startsWith('ozel bilgi') ||
        norm.startsWith('kisisel')
      ) {
        break;
      }
      expLines.push(line);
    }
  }

  const targetLines = expLines.length > 0 ? expLines : lines;
  let currentExp: Partial<RawExtractedExperience> | null = null;
  const collectedResponsibilities: string[] = [];

  const flushExp = () => {
    if (currentExp && (currentExp.company || currentExp.role || currentExp.startYear)) {
      currentExp.responsibilities = collectedResponsibilities.join('. ').replace(/\.\s*\./g, '.');
      if (currentExp.role) currentExp.role = suggestTitleCaseTr(currentExp.role);
      if (currentExp.company) currentExp.company = suggestTitleCaseTr(currentExp.company);
      experiences.push(currentExp as RawExtractedExperience);
      collectedResponsibilities.length = 0;
      currentExp = null;
    }
  };

  const getCleanPrevNonHeaderLines = (currentIndex: number): string[] => {
    const result: string[] = [];
    for (let j = currentIndex - 1; j >= 0 && result.length < 2; j--) {
      const l = targetLines[j];
      if (
        !isExperienceSectionHeader(l) &&
        !isEduSectionHeader(l) &&
        !isOtherSectionHeader(l) &&
        !isEduLine(l) &&
        l.length >= 2 &&
        l.length <= 90
      ) {
        result.push(l);
      }
    }
    return result;
  };

  for (let i = 0; i < targetLines.length; i++) {
    const line = targetLines[i];
    if (isExperienceSectionHeader(line)) {
      // Don't treat section headers as company/role/responsibility
      continue;
    }
    if (isEduLine(line) || isEduSectionHeader(line) || isOtherSectionHeader(line)) {
      if (currentExp && (currentExp.company || currentExp.role)) {
        flushExp();
      }
      continue;
    }

    const norm = normalizeTrForMatch(line);
    const dateInfo = parseDateRangeText(line);

    if (dateInfo) {
      if (currentExp && (currentExp.company || currentExp.role)) {
        flushExp();
      }

      currentExp = {
        startYear: dateInfo.startYear,
        endYear: dateInfo.endYear,
        isCurrent: dateInfo.isCurrent,
        duration: dateInfo.duration,
      };

      const prevs = getCleanPrevNonHeaderLines(i);
      const prev1 = prevs[0] || null;
      const prev2 = prevs[1] || null;
      const isPureDate = isPureDateLine(line);
      let rawRemainder = isPureDate ? '' : line;
      if (!isPureDate && dateInfo.raw) {
        const escaped = dateInfo.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        rawRemainder = rawRemainder
          .replace(new RegExp(`\\b${escaped}\\b|${escaped}`, 'gi'), '')
          .replace(/\([^)]*\)/g, '')
          .trim();
      }

      if (!isPureDate && rawRemainder.length >= 2) {
        const parts = rawRemainder.split(/[|–—]/).map((p) => p.replace(/^deneyim:\s*/i, '').trim()).filter(Boolean);
        if (parts.length >= 2) {
          if (isRoleTitle(parts[0])) {
            currentExp.role = parts[0];
            currentExp.company = parts[1];
          } else {
            currentExp.company = parts[0];
            currentExp.role = parts[1];
          }
        } else {
          if (isRoleTitle(rawRemainder)) {
            currentExp.role = rawRemainder;
            if (prev1 && !isRoleTitle(prev1) && !parseDateRangeText(prev1) && prev1.length >= 2 && prev1.length <= 80) {
              currentExp.company = prev1;
            }
          } else {
            currentExp.company = parts[0] || rawRemainder;
          }
        }
      } else {
        if (prev1 && (prev1.includes(',') || prev1.includes('-') || prev1.includes('|'))) {
          const parts = prev1.split(/[,–—|-]/).map((p) => p.trim());
          if (parts.length >= 2) {
            if (isRoleTitle(parts[0])) {
              currentExp.role = parts[0];
              currentExp.company = parts[1];
            } else {
              currentExp.company = parts[0];
              currentExp.role = parts[1];
            }
          } else {
            currentExp.company = prev1;
          }
        } else if (prev1 && isRoleTitle(prev1)) {
          currentExp.role = prev1;
          if (prev2 && !isRoleTitle(prev2) && !parseDateRangeText(prev2)) {
            currentExp.company = prev2;
          }
        } else if (prev1 && !isRoleTitle(prev1)) {
          if (prev2 && isRoleTitle(prev2)) {
            currentExp.role = prev2;
            currentExp.company = prev1;
          } else {
            currentExp.company = prev1;
          }
        }
      }
      continue;
    }

    if (currentExp) {
      if (
        norm.includes('tam zamanli') ||
        norm.includes('yari zamanli') ||
        norm.includes('surekli') ||
        norm.includes('donemsel') ||
        norm.includes('part time') ||
        norm.includes('full time') ||
        norm.includes('freelance') ||
        norm.includes('sozlesmeli')
      ) {
        currentExp.employmentType = line;
        continue;
      }

      if (norm.includes('sektoru') || norm.includes('departmani') || norm.includes('bolumu') || norm.includes('sector') || norm.includes('department')) {
        const parts = line.split(/[,/|–—]/).map((p) => p.trim());
        for (const p of parts) {
          const pNorm = normalizeTrForMatch(p);
          if (pNorm.includes('sektor')) {
            currentExp.sector = p.replace(/sekt[oö]r[uü]?/i, '').trim();
          } else if (pNorm.includes('departman') || pNorm.includes('bolum')) {
            currentExp.department = p.replace(/departman[ıi]?|b[oö]l[uü]m[uü]?/i, '').trim();
          }
        }
        continue;
      }

      if (!currentExp.role && isRoleTitle(line)) {
        currentExp.role = line;
        continue;
      }

      if (!currentExp.company && /[A-ZÇĞİÖŞÜ]{2,}|A\.Ş\.|Ltd\.|Holding|Grup|Group|Bank|Sigorta|Banka|Company|Tech/i.test(line)) {
        currentExp.company = line;
        continue;
      }

      if (line.length >= 3 && !line.startsWith('---')) {
        collectedResponsibilities.push(line);
      }
    }
  }

  flushExp();
  return experiences;
}

// ============================================================================
// 5. SKILLS, TOOLS & SECTORS DETERMINISTIC PARSER
// ============================================================================

export function extractDeterministicSkillsAndTools(text: string): {
  professionalSkills: string[];
  technicalSkills: string[];
  tools: string[];
  sectors: string[];
  roles: string[];
} {
  const normText = ` ${normalizeTrForMatch(text)} `;
  const professionalSkills: string[] = [];
  const technicalSkills: string[] = [];
  const tools: string[] = [];
  const sectors: string[] = [];
  const roles: string[] = [];

  // 1. Scan Skills via Direct Alias Dictionary
  for (const [skillAlias, canonicalSkill] of Object.entries(KNOWN_SKILL_ALIASES)) {
    const normAlias = normalizeTrForMatch(skillAlias);
    if (normText.includes(` ${normAlias} `) || normText.includes(normAlias)) {
      if (
        normAlias.includes('satis') ||
        normAlias.includes('operasyon') ||
        normAlias.includes('yonetim') ||
        normAlias.includes('musteri') ||
        normAlias.includes('ekip') ||
        normAlias.includes('performans') ||
        normAlias.includes('planlama') ||
        normAlias.includes('butce') ||
        normAlias.includes('proje') ||
        normAlias.includes('strateji') ||
        normAlias.includes('management') ||
        normAlias.includes('relations') ||
        normAlias.includes('business') ||
        normAlias.includes('planning') ||
        normAlias.includes('budget') ||
        normAlias.includes('development')
      ) {
        professionalSkills.push(canonicalSkill);
      } else {
        technicalSkills.push(canonicalSkill);
      }
    }
  }

  // 2. Scan Tools
  for (const [toolKey, canonicalTool] of Object.entries(KNOWN_TOOLS_DICTIONARY)) {
    const normTool = normalizeTrForMatch(toolKey);
    const regex = new RegExp(`(?:^|\\s)${normTool}(?:\\s|$)`, 'i');
    if (regex.test(normText)) {
      tools.push(canonicalTool);
    }
  }

  // 3. Scan Sectors
  for (const [sectorKey, canonicalSector] of Object.entries(KNOWN_SECTOR_KEYWORDS)) {
    const normSector = normalizeTrForMatch(sectorKey);
    const regex = new RegExp(`(?:^|\\s)${normSector}(?:\\s|$)`, 'i');
    if (regex.test(normText)) {
      sectors.push(canonicalSector);
    }
  }

  // 4. Extract Roles Mentioned
  const textLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of textLines) {
    const roleRegex = /([A-ZÇĞİÖŞÜa-zçğıöşü]+(?:[ \t]+[A-ZÇĞİÖŞÜa-zçğıöşü]+)*(?:[ \t]+(?:Müdürü|Direktörü|Yöneticisi|Uzmanı|Lideri|Temsilcisi|Mühendisi|Analisti|Danışmanı|Geliştiricisi|Elemanı|Personeli|Görevlisi|Sorumlusu|Asistanı|Operatörü|Kasiyeri|Müdür|Direktör|Yönetici|Uzman|Lider|Temsilci|Mühendis|Analist|Danışman|Geliştirici|Eleman|Personel|Görevli|Sorumlu|Asistan|Operatör|Kasiyer|Manager|Director|Lead|Specialist|Developer|Engineer|Consultant|Analyst|Executive)))/gi;
    const matches = line.match(roleRegex) || [];
    for (const match of matches) {
      const cleanRole = formatTurkishTitle(match.trim());
      if (cleanRole.length >= 4 && !roles.includes(cleanRole)) {
        roles.push(cleanRole);
      }
    }
  }

  // 5. Section-based Skills Parsing
  let inSkillsSection = false;
  for (const line of textLines) {
    const norm = normalizeTrForMatch(line);
    if (norm === 'yetenekler' || norm === 'beceriler' || norm === 'yetkinlikler' || norm === 'skills' || norm === 'technical skills' || norm === 'mesleki yetkinlikler') {
      inSkillsSection = true;
      continue;
    }
    if (inSkillsSection) {
      if (
        norm.startsWith('hobi') ||
        norm.startsWith('ilgi') ||
        norm.startsWith('diller') ||
        norm.startsWith('egitim') ||
        norm.startsWith('is deneyim') ||
        norm.startsWith('referans') ||
        norm.startsWith('sertifika') ||
        norm.startsWith('ozel')
      ) {
        break;
      }
      const items = line.split(/[,;\n•·*|]/).map((s) => s.trim()).filter(Boolean);
      for (const item of items) {
        if (item.length >= 3 && item.length <= 60 && !item.toLowerCase().includes('yetenek')) {
          const titleCased = suggestTitleCaseTr(item);
          const lower = normalizeTrForMatch(item);
          if (KNOWN_TOOLS_DICTIONARY[lower]) {
            tools.push(KNOWN_TOOLS_DICTIONARY[lower]);
          } else if (
            lower.includes('bilgisayar') ||
            lower.includes('office') ||
            lower.includes('yazilim') ||
            lower.includes('kod') ||
            lower.includes('program') ||
            lower.includes('excel') ||
            lower.includes('word')
          ) {
            technicalSkills.push(titleCased);
          } else {
            professionalSkills.push(titleCased);
          }
        }
      }
    }
  }

  return {
    professionalSkills: [...new Set(professionalSkills)],
    technicalSkills: [...new Set(technicalSkills)],
    tools: [...new Set(tools)],
    sectors: [...new Set(sectors)],
    roles: [...new Set(roles)],
  };
}

// ============================================================================
// 6. LANGUAGES & CERTIFICATES DETERMINISTIC PARSER
// ============================================================================

export function extractDeterministicLanguagesAndCerts(text: string): {
  languages: string[];
  certificates: string[];
} {
  const normText = ` ${normalizeTrForMatch(text)} `;
  const languages: string[] = [];
  const certificates: string[] = [];

  const langMap: Record<string, string> = {
    turkce: 'Türkçe',
    turkish: 'Türkçe',
    ingilizce: 'İngilizce',
    english: 'İngilizce',
    almanca: 'Almanca',
    german: 'Almanca',
    deutsch: 'Almanca',
    fransizca: 'Fransızca',
    french: 'Fransızca',
    ispanyolca: 'İspanyolca',
    spanish: 'İspanyolca',
    italyanca: 'İtalyanca',
    italian: 'İtalyanca',
    arapca: 'Arapça',
    arabic: 'Arapça',
    rusca: 'Rusça',
    russian: 'Rusça',
  };

  for (const [lKey, canonicalLang] of Object.entries(langMap)) {
    const normKey = normalizeTrForMatch(lKey);
    const regex = new RegExp(`(?:^|\\s)${normKey}(?:\\s|$)`, 'i');
    if (regex.test(normText)) {
      languages.push(canonicalLang);
    }
  }

  for (const [cKey, canonicalCert] of Object.entries(KNOWN_CERTIFICATES_MAP)) {
    const normKey = normalizeTrForMatch(cKey);
    const regex = new RegExp(`(?:^|\\s)${normKey}(?:\\s|$)`, 'i');
    if (regex.test(normText)) {
      certificates.push(canonicalCert);
    }
  }

  for (const cert of CERTIFICATE_OPTIONS) {
    if (cert === 'Diğer / Kendim gireceğim') continue;
    const certNorm = normalizeTrForMatch(cert);
    if (normText.includes(certNorm)) {
      certificates.push(cert);
    }
  }

  return {
    languages: languages.length > 0 ? [...new Set(languages)] : ['Türkçe'],
    certificates: [...new Set(certificates)],
  };
}

// ============================================================================
// 7. DETERMINISTIC CAREER SUMMARY GENERATOR
// ============================================================================

export function generateDeterministicSummary(input: {
  text: string;
  totalYears: number;
  primaryRole?: string;
  sectors?: string[];
  topSkills?: string[];
  location?: string;
}): string {
  const summaryBlockRegex = /(?:özgeçmiş\s*özeti|kariyer\s*özeti|özet|hakkımda|profil|summary|about\s*me)[:\s\n]+([^\n]{30,500})/i;
  const match = input.text.match(summaryBlockRegex);
  if (match && match[1].trim().length >= 25) {
    return match[1].trim();
  }

  const locText = input.location ? `${input.location} lokasyonunda ` : '';
  const yearsText = input.totalYears > 0 ? `${input.totalYears} yıllık profesyonel deneyime sahip` : 'Geniş profesyonel deneyime sahip';
  const sectorText = input.sectors && input.sectors.length > 0 ? `${input.sectors.slice(0, 2).join(' ve ')} sektörlerinde` : '';
  const roleText = input.primaryRole ? `${input.primaryRole} alanında uzmanlaşmış` : 'yönetim ve operasyon alanlarında uzmanlaşmış';
  const skillsText = input.topSkills && input.topSkills.length > 0 ? `${input.topSkills.slice(0, 4).join(', ')} konularında deneyim sahibidir.` : 'alanında yetkin deneyim sahibidir.';

  return `${locText}${yearsText}, ${sectorText} ${roleText} bir profesyoneldir. ${skillsText}`.replace(/\s+/g, ' ').trim();
}

// ============================================================================
// 8. UNIFIED HIGH-ACCURACY DETERMINISTIC EXTRACTOR (CV EXTRACTION 2.0)
// ============================================================================

export function extractDeterministicCv(text: string): AiCvExtractionPayload {
  const loc = extractDeterministicLocations(text);
  const edu = extractDeterministicEducation(text);
  const exp = extractDeterministicExperiences(text);
  const skillsAndTools = extractDeterministicSkillsAndTools(text);
  const langAndCerts = extractDeterministicLanguagesAndCerts(text);

  let totalYears = 0;
  for (const e of exp) {
    if (e.startYear && e.endYear) totalYears += Math.max(1, e.endYear - e.startYear);
  }
  const yearInText = text.match(/(\d{1,2})\s*yıllık/i);
  if (yearInText) totalYears = Math.max(totalYears, parseInt(yearInText[1], 10));

  if (exp.length === 0 && (skillsAndTools.roles.length > 0 || skillsAndTools.sectors.length > 0)) {
    exp.push({
      role: skillsAndTools.roles[0] || 'Uzman',
      company: undefined,
      sector: skillsAndTools.sectors[0] || 'Finans / Bankacılık',
      duration: undefined,
      isCurrent: false,
      responsibilities: '',
    });
  }

  const summary = generateDeterministicSummary({
    text,
    totalYears,
    primaryRole: skillsAndTools.roles[0] || exp[0]?.role,
    sectors: skillsAndTools.sectors,
    topSkills: [...skillsAndTools.professionalSkills, ...skillsAndTools.technicalSkills],
    location: loc.city,
  });

  return {
    experiences: exp,
    roles: skillsAndTools.roles,
    sectors: skillsAndTools.sectors,
    skills: [...new Set([...skillsAndTools.professionalSkills, ...skillsAndTools.technicalSkills])],
    tools: skillsAndTools.tools,
    education: edu,
    languages: langAndCerts.languages,
    certificates: langAndCerts.certificates,
    locations: [loc.city, loc.district].filter(Boolean) as string[],
    summary,
    ambiguousItems: [],
  };
}

export function extractDeterministicCvSignals(text: string): DeterministicCvSignals {
  const loc = extractDeterministicLocations(text);
  const langAndCerts = extractDeterministicLanguagesAndCerts(text);
  const edu = extractDeterministicEducation(text);
  const degrees = edu.map((e) => e.level).filter(Boolean) as string[];

  return {
    detectedCities: loc.detectedCities,
    dateRanges: [],
    languages: langAndCerts.languages,
    certificates: langAndCerts.certificates,
    educationDegrees: degrees.length > 0 ? degrees : ['Lisans'],
  };
}
