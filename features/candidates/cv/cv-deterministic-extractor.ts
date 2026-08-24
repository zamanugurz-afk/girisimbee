import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { getDistrictsForCity } from '@/features/shared/constants/turkish-districts';
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
import {
  scanUniversalCertificates,
  extractUniversalDemographics,
  isCorporateEntity,
} from './cv-universal-normalizer';
import { generateCandidateTokens } from './cv-candidate-generator';
import { normalizeCvText } from './cv-turkish-encoding';
import { isForbiddenNameCandidate } from './cv-name-extractor';
import {
  resolveExperienceRelationships,
  resolveEducationRelationships,
} from './cv-relationship-engine';

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
  eyup: { city: 'İstanbul', district: 'Eyüp' },
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
  golbasi: { city: 'Ankara', district: 'Gölbaşı' },
  bornova: { city: 'İzmir', district: 'Bornova' },
  karsiyaka: { city: 'İzmir', district: 'Karşıyaka' },
  konak: { city: 'İzmir', district: 'Konak' },
  buca: { city: 'İzmir', district: 'Buca' },
  karabaglar: { city: 'İzmir', district: 'Karabağlar' },
  bayrakli: { city: 'İzmir', district: 'Bayraklı' },
  cigli: { city: 'İzmir', district: 'Çiğli' },
  gaziemir: { city: 'İzmir', district: 'Gaziemir' },
  balcova: { city: 'İzmir', district: 'Balçova' },
  narlidere: { city: 'İzmir', district: 'Narlıdere' },
  menemen: { city: 'İzmir', district: 'Menemen' },
  torbali: { city: 'İzmir', district: 'Torbalı' },
  kemalpasa: { city: 'İzmir', district: 'Kemalpaşa' },
  urla: { city: 'İzmir', district: 'Urla' },
  cesme: { city: 'İzmir', district: 'Çeşme' },
  seferihisar: { city: 'İzmir', district: 'Seferihisar' },
  odemis: { city: 'İzmir', district: 'Ödemiş' },
  tire: { city: 'İzmir', district: 'Tire' },
  bergama: { city: 'İzmir', district: 'Bergama' },
  aliaga: { city: 'İzmir', district: 'Aliağa' },
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
  dulkadiroglu: { city: 'Kahramanmaraş', district: 'Dulkadiroğlu' },
  onikisubat: { city: 'Kahramanmaraş', district: 'Onikişubat' },
  urgup: { city: 'Nevşehir', district: 'Ürgüp' },
  yunusemre: { city: 'Manisa', district: 'Yunusemre' },
  sehzadeler: { city: 'Manisa', district: 'Şehzadeler' },
  ilkadim: { city: 'Samsun', district: 'İlkadım' },
  bodrum: { city: 'Muğla', district: 'Bodrum' },
  fethiye: { city: 'Muğla', district: 'Fethiye' },
  marmaris: { city: 'Muğla', district: 'Marmaris' },
  tarsus: { city: 'Mersin', district: 'Tarsus' },
  bandirma: { city: 'Balıkesir', district: 'Bandırma' },
  edremit: { city: 'Balıkesir', district: 'Edremit' },
  ayvalik: { city: 'Balıkesir', district: 'Ayvalık' },
  corlu: { city: 'Tekirdağ', district: 'Çorlu' },
  cerkezkoy: { city: 'Tekirdağ', district: 'Çerkezköy' },
  inegol: { city: 'Bursa', district: 'İnegöl' },
  alanya: { city: 'Antalya', district: 'Alanya' },
  manavgat: { city: 'Antalya', district: 'Manavgat' },
  kusadasi: { city: 'Aydın', district: 'Kuşadası' },
  didim: { city: 'Aydın', district: 'Didim' },
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
  zendesk: 'Zendesk',
  freshdesk: 'Freshdesk',
  genesys: 'Genesys',
  mi4biz: 'Mi4Biz',
  alotech: 'AloTech',
  monitera: 'Monitera',
  'oracle rightnow': 'Oracle RightNow',
  rightnow: 'Oracle RightNow',
  boomsonar: 'BoomSonar',
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
  flutter: 'Flutter',
  swift: 'Swift',
  kotlin: 'Kotlin',
  selenium: 'Selenium',
  cypress: 'Cypress',
  autocad: 'AutoCAD',
  revit: 'Revit',
  siem: 'SIEM',
  splunk: 'Splunk',
  wireshark: 'Wireshark',
  terraform: 'Terraform',
  ansible: 'Ansible',
  helm: 'Helm',
  grafana: 'Grafana',
  prometheus: 'Prometheus',
  linux: 'Linux',
  firewall: 'Firewall',
  pdks: 'PDKS',
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
  finansal: 'Finans / Bankacılık',
  kredi: 'Finans / Bankacılık',
  yatirim: 'Finans / Bankacılık',
  investment: 'Finans / Bankacılık',
  'sermaye piyasasi': 'Finans / Bankacılık',
  borsa: 'Finans / Bankacılık',
  akbank: 'Finans / Bankacılık',
  garanti: 'Finans / Bankacılık',
  yapikredi: 'Finans / Bankacılık',
  isbank: 'Finans / Bankacılık',
  vakifbank: 'Finans / Bankacılık',
  halkbank: 'Finans / Bankacılık',
  denizbank: 'Finans / Bankacılık',
  qnb: 'Finans / Bankacılık',

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
  'bilgi teknolojileri': 'Bilişim / Yazılım',
  'information technology': 'Bilişim / Yazılım',

  'insan kaynaklari': 'İnsan Kaynakları',
  'human resources': 'İnsan Kaynakları',
  recruitment: 'İnsan Kaynakları',

  hukuk: 'Hukuk',
  legal: 'Hukuk',
  avukatlik: 'Hukuk',

  pazarlama: 'Pazarlama / Reklam',
  marketing: 'Pazarlama / Reklam',
  reklam: 'Pazarlama / Reklam',

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
  hastanesi: 'Sağlık / Medikal',
  tip: 'Sağlık / Medikal',
  kardiyoloji: 'Sağlık / Medikal',
  doktor: 'Sağlık / Medikal',
  hekim: 'Sağlık / Medikal',
  klinik: 'Sağlık / Medikal',
  eczane: 'Sağlık / Medikal',

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
  'uretim planlama': 'Üretim / İmalat',
  'endustri muhendisligi': 'Üretim / İmalat',
  'endustri muhendisi': 'Üretim / İmalat',
  'yalin uretim': 'Üretim / İmalat',
  'surec analizi': 'Üretim / İmalat',
  kaizen: 'Üretim / İmalat',
  optimizasyon: 'Üretim / İmalat',

  turizm: 'Turizm / Otelcilik',
  otelcilik: 'Turizm / Otelcilik',
  tourism: 'Turizm / Otelcilik',
  hospitality: 'Turizm / Otelcilik',

  'egitim sektoru': 'Eğitim',
  'egitim kurumlari': 'Eğitim',
  'ozel okul': 'Eğitim',
  'anaokulu': 'Eğitim',
  'kolej': 'Eğitim',
  edtech: 'Eğitim',

  gayrimenkul: 'İnşaat / Gayrimenkul',
  'real estate': 'İnşaat / Gayrimenkul',
  insaat: 'İnşaat / Gayrimenkul',
  construction: 'İnşaat / Gayrimenkul',
  statik: 'İnşaat / Gayrimenkul',
  geoteknik: 'İnşaat / Gayrimenkul',
  santiye: 'İnşaat / Gayrimenkul',
  mimarlik: 'İnşaat / Gayrimenkul',
  architecture: 'İnşaat / Gayrimenkul',
  peyzaj: 'İnşaat / Gayrimenkul',

  danismanlik: 'Danışmanlık',
  consulting: 'Danışmanlık',

  telekom: 'Telekomünikasyon',
  telekomunikasyon: 'Telekomünikasyon',
  advertising: 'Pazarlama / Reklam',

  enerji: 'Enerji',
  energy: 'Enerji',
  havacilik: 'Havacılık',
  aviation: 'Havacılık',
  denizcilik: 'Denizcilik / Liman',
  maritime: 'Denizcilik / Liman',
  madencilik: 'Madencilik',
  mining: 'Madencilik',
  gida: 'Gıda / Restoran',
  food: 'Gıda / Restoran',
  restoran: 'Gıda / Restoran',
  gastronomi: 'Gıda / Restoran',
  psikoloji: 'Sağlık',
  psikiyatri: 'Sağlık',
  fizyoterapi: 'Sağlık',
  veteriner: 'Veteriner / Pet',
  pet: 'Veteriner / Pet',
  'kurumsal iletisim': 'Pazarlama / Reklam',
  'halkla iliskiler': 'Halkla ilişkiler',
  tesisat: 'İklimlendirme / Tesisat',
  iklimlendirme: 'İklimlendirme / Tesisat',
  'idari isler': 'İdari işler / Ofis',
  gumruk: 'Gümrük',
  customs: 'Gümrük',
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
  // Cyber Security & IT
  ceh: 'CEH',
  oscp: 'OSCP',
  'iso 27001': 'ISO 27001',
  'comptia security+': 'CompTIA Security+',
  cisa: 'CISA',
  cism: 'CISM',
  cissp: 'CISSP',
  ccnp: 'Cisco CCNP',
  ccna: 'Cisco CCNA',

  // Project & Management & Quality
  pmp: 'PMP (Project Management Professional)',
  scrum: 'Scrum Master',
  'scrum master': 'Scrum Master',
  psm: 'PSM (Professional Scrum Master)',
  'psm i': 'PSM (Professional Scrum Master)',
  itil: 'ITIL Foundation',
  'six sigma': 'Six Sigma',
  'yalin uretim': 'Yalın Üretim',
  'iso 9001': 'ISO 9001 Kalite Yönetimi',

  // Cloud & Tech
  aws: 'AWS Certified',
  'aws certified': 'AWS Certified',
  azure: 'Microsoft Certified: Azure',
  'google cloud': 'Google Cloud Certified',

  // Quality, Food & Automotive
  haccp: 'HACCP Gıda Güvenliği',
  'iso 22000': 'ISO 22000',
  'hijyen belgesi': 'Hijyen Belgesi',
  'iatf 16949': 'IATF 16949',
  'yg isletme': 'YG İşletme Sorumluluğu',
  cka: 'CKA',
  isg: 'İSG Belgesi',

  // Finance, Insurance & Legal
  segem: 'SEGEM',
  spl: 'SPL',
  'bireysel emeklilik': 'Bireysel Emeklilik Aracılığı (BES)',
  'bes lisansi': 'Bireysel Emeklilik Aracılığı (BES)',
  cfa: 'CFA',
  smmm: 'SMMM',
  'spk duzey 3': 'SPK Düzey 3',
  'spk duzey 2': 'SPK Düzey 2',
  'spk duzey 1': 'SPK Düzey 1',
  'spk turev': 'SPK Türev Araçlar',
  'spk gayrimenkul degerleme': 'SPK Gayrimenkul Değerleme Lisansı',

  // Transport & Logistics
  'src 1': 'SRC 1',
  'src 2': 'SRC 2',
  'src 3': 'SRC 3',
  'src 4': 'SRC 4',
  'src 5': 'SRC 5',
  src: 'SRC Belgesi',
  psikoteknik: 'Psikoteknik',
  'udy 1': 'ÜDY 1',
  'udy 2': 'ÜDY 2',
  'udy 3': 'ÜDY 3',
  'udy 4': 'ÜDY 4',
  'ody 1': 'ODY 1',
  'ody 2': 'ODY 2',
  'ody 3': 'ODY 3',
  'ody 4': 'ODY 4',
  adr: 'ADR',

  // Education & Language
  'pedagojik formasyon': 'Pedagojik Formasyon',
  toefl: 'TOEFL',
  ielts: 'IELTS',
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
    .replace(/(?:^|\s)A[ \t]+ustos(?=\s|$|[,;.\-\/])/gi, ' Ağustos ')
    .replace(/(?:^|\s)Ağ[ \t]+ustos(?=\s|$|[,;.\-\/])/gi, ' Ağustos ')
    .replace(/(?:^|\s)Eyl[ \t]+[uü]l(?=\s|$|[,;.\-\/])/gi, ' Eylül ')
    .replace(/(?:^|\s)May[ \t]+[ıi]s(?=\s|$|[,;.\-\/])/gi, ' Mayıs ')
    .replace(/(?:^|\s)Kas[ \t]+[ıi]m(?=\s|$|[,;.\-\/])/gi, ' Kasım ')
    .replace(/(?:^|\s)Aral[ \t]+[ıi]k(?=\s|$|[,;.\-\/])/gi, ' Aralık ')
    .replace(/(?:^|\s)Haz[ \t]+iran(?=\s|$|[,;.\-\/])/gi, ' Haziran ')
    .replace(/(?:^|\s)Tem[ \t]+muz(?=\s|$|[,;.\-\/])/gi, ' Temmuz ')
    .replace(/(?:^|\s)Sub[ \t]+at(?=\s|$|[,;.\-\/])/gi, ' Şubat ')
    .replace(/(?:^|\s)Nis[ \t]+an(?=\s|$|[,;.\-\/])/gi, ' Nisan ')
    .replace(/(?:^|\s)Oca[ \t]+k(?=\s|$|[,;.\-\/])/gi, ' Ocak ')
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
    .replace(/[()[\]{}:;,]+/g, ' ')
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
  if (/^[*•·\->]\s*/.test(clean) || /^[0-9]+[.)]\s*/.test(clean)) return false;
  const norm = normalizeTrForMatch(clean);
  // Block company / institution suffixes (as standalone words or phrases)
  if (
    isCorporateEntity(clean) ||
    /\ba\s*s\b/i.test(norm) ||
    (/\b(?:muhendislik|muhendisligi|danismanlik|danismanligi|avukatlik|avukatligi|musavirlik|musavirligi|ortaklik|ortakligi|aracilik|araciligi|acentelik|acenteligi|sigortacilik|holding)\b/i.test(norm) && !/(?:uzmani|uzman|muduru|mudur|yoneticisi|yonetici|danismani|danisman|temsilcisi|temsilci|gorevlisi|gorevli|lideri|lider)\b/i.test(norm)) ||
    /\b(?:sanayi|ticaret|hizmetleri)\s*(?:a\.?ş\.?|a\.?s\.?|ltd|şti|sti|holding|ve\s+tic)\b/i.test(clean)
  ) {
    return false;
  }

  // Block responsibility & demographic patterns
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
    norm.includes('calismaktayim') ||
    norm.includes('surucu') ||
    norm.includes('ehliyet') ||
    norm.includes('cinsiyet') ||
    norm.includes('vatandaslik') ||
    norm.includes('medeni durum') ||
    norm.includes('askerlik') ||
    norm.includes('ozel bilgi') ||
    norm.includes('kisisel bilgi')
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
    norm.includes('resepsiyon') ||
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
    (/\b(?:mimar|mimari|architect)\b/i.test(norm) && !norm.includes('mimarisi') && !norm.includes('mimarlik')) ||
    norm.includes('tasarimci') ||
    norm.includes('musavir') ||
    norm.includes('yazar') ||
    norm.includes('editor') ||
    norm.includes('muhasebeci') ||
    norm.includes('stajyer') ||
    norm.includes('partner') ||
    norm.includes('ortak') ||
    norm.includes('ortag') ||
    norm.includes('mumessil') ||
    norm.includes('satis') ||
    norm.includes('akademisyen') ||
    norm.includes('okutman') ||
    norm.includes('docent') ||
    norm.includes('profesor') ||
    norm.includes('asci') ||
    norm.includes('chef') ||
    norm.includes('garson') ||
    norm.includes('barista') ||
    norm.includes('depocu') ||
    norm.includes('kurye') ||
    norm.includes('guvenlik') ||
    norm.includes('amir') ||
    norm.includes('kabin') ||
    norm.includes('hostes') ||
    norm.includes('pilot') ||
    norm.includes('steward') ||
    norm.includes('kontrol') ||
    norm.includes('manager') ||
    norm.includes('director') ||
    norm.includes('lead') ||
    norm.includes('specialist') ||
    norm.includes('developer') ||
    norm.includes('engineer') ||
    norm.includes('consultant') ||
    norm.includes('analyst') ||
    norm.includes('executive') ||
    norm.includes('officer') ||
    norm.includes('assistant') ||
    norm.includes('recruiter') ||
    norm.includes('zabit') ||
    norm.includes('kaptan') ||
    norm.includes('teknisyen') ||
    norm.includes('psikolog') ||
    norm.includes('fizyoterapist') ||
    norm.includes('auditor') ||
    norm.includes('buyer') ||
    norm.includes('intern') ||
    norm.includes('agent') ||
    norm.includes('clerk') ||
    norm.includes('associate') ||
    norm.includes('worker') ||
    norm.includes('helper') ||
    norm.includes('staff') ||
    norm.includes('stratejist') ||
    norm.includes('strategist') ||
    norm.includes('coach') ||
    norm.includes('owner') ||
    norm.includes('planner') ||
    norm.includes('scrum') ||
    norm.includes('ingenieur') ||
    norm.includes('ingeniero') ||
    norm.includes('desarrollador') ||
    norm.includes('developpeur') ||
    norm.includes('entwickler') ||
    norm.includes('berater') ||
    norm.includes('gerente') ||
    norm.includes('bilimci') ||
    norm.includes('scientist')
  );
}

// ============================================================================
// 1. LOCATION DETERMINISTIC PARSER
// ============================================================================

const TURKISH_CITY_ALIASES: Record<string, string> = {
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
  urfa: 'Şanlıurfa',
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
  kahramanmaras: 'Kahramanmaraş',
  maras: 'Kahramanmaraş',
  mugla: 'Muğla',
  nevsehir: 'Nevşehir',
  manisa: 'Manisa',
  aydin: 'Aydın',
  balikesir: 'Balıkesir',
  canakkale: 'Çanakkale',
  edirne: 'Edirne',
  kirklareli: 'Kırklareli',
  afyon: 'Afyonkarahisar',
  afyonkarahisar: 'Afyonkarahisar',
  kutahya: 'Kütahya',
  usak: 'Uşak',
  isparta: 'Isparta',
  burdur: 'Burdur',
  aksaray: 'Aksaray',
  nigde: 'Niğde',
  kirsehir: 'Kırşehir',
  yozgat: 'Yozgat',
  sivas: 'Sivas',
  tokat: 'Tokat',
  amasya: 'Amasya',
  corum: 'Çorum',
  sinop: 'Sinop',
  kastamonu: 'Kastamonu',
  zonguldak: 'Zonguldak',
  karabuk: 'Karabük',
  bartin: 'Bartın',
  duzce: 'Düzce',
  bolu: 'Bolu',
  yalova: 'Yalova',
  bilecik: 'Bilecik',
  ordu: 'Ordu',
  giresun: 'Giresun',
  rize: 'Rize',
  artvin: 'Artvin',
  gumushane: 'Gümüşhane',
  bayburt: 'Bayburt',
  kars: 'Kars',
  ardahan: 'Ardahan',
  igdir: 'Iğdır',
  agri: 'Ağrı',
  mus: 'Muş',
  bingol: 'Bingöl',
  bitlis: 'Bitlis',
  siirt: 'Siirt',
  sirnak: 'Şırnak',
  hakkari: 'Hakkari',
  mardin: 'Mardin',
  adiyaman: 'Adıyaman',
  kilis: 'Kilis',
  osmaniye: 'Osmaniye',
  hatay: 'Hatay',
  antakya: 'Hatay',
  iskenderun: 'Hatay',
  karaman: 'Karaman',
  cankiri: 'Çankırı',
  kirikkale: 'Kırıkkale',
};

// Ensure all 81 canonical Turkish cities are present
for (const c of TURKISH_CITIES) {
  const normC = normalizeTrForMatch(c);
  if (!TURKISH_CITY_ALIASES[normC]) {
    TURKISH_CITY_ALIASES[normC] = c;
  }
}

export function extractDeterministicLocations(text: string): {
  city: string;
  district?: string;
  detectedCities: string[];
} {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const detectedCities: string[] = [];
  let bestCandidateCity = '';

  const HOMONYM_DISTRICT_KEYS = new Set([
    'fatih', 'kartal', 'eyup', 'kemal', 'selcuk', 'ali', 'hasan', 'huseyin',
    'yildirim', 'kaya', 'dogan', 'demir', 'celik', 'arslan', 'sahin', 'koc',
    'aydin', 'guler', 'tekin', 'cakir', 'aksoy', 'ozdemir', 'yilmaz', 'gunes',
    'yildiz', 'tas', 'kurt', 'cukurova', 'murat', 'battal', 'deniz', 'mert',
    'ece', 'efe', 'alp', 'can', 'baran', 'kaan', 'serkan', 'burak', 'emre',
  ]);

  // Phase 1: Look for explicit contact / personal info sections or lines with location cues
  // (e.g. "İkamet: Maltepe, İstanbul", "İstanbul/Eyüp", "Peker Mah. Karabağlar / İZMİR", "Lokasyon: İzmir / Bornova")
  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const lineNorm = ` ${normalizeTrForMatch(rawLine)} `;
    const cleanNorm = normalizeTrForMatch(rawLine);

    // Skip company/university experience lines in Phase 1
    const isEntityLine = /holding|şirketi|sirketi|limited|anonim|a\.ş|a\.s|ltd|bankası|bankasi|üniversitesi|universitesi|fakültesi|fakultesi|enstitüsü|enstitusu/i.test(rawLine);

    if (!isEntityLine) {
      // 1. Check if line has a structured location pattern
      if (rawLine.includes('/') || rawLine.includes(',') || rawLine.includes('-') || rawLine.includes('|') || /[\b:](?:ikamet|adres|lokasyon|sehir|ilce|il)\b/i.test(rawLine)) {
        // Find explicit city in this line
        let lineCity = '';
        for (const [cKey, cName] of Object.entries(TURKISH_CITY_ALIASES)) {
          const cityRegex = new RegExp(`(?:^|[^a-z0-9])${cKey}(?:$|[^a-z0-9])`, 'i');
          if (cityRegex.test(lineNorm)) {
            lineCity = cName;
            break;
          }
        }

        if (lineCity) {
          const cityDistricts = getDistrictsForCity(lineCity);
          let matchedDistrict: string | undefined;

          // Check if any district of this city appears on this line
          for (const d of cityDistricts) {
            if (d === 'Diğer' || d === 'Merkez') continue;
            const dNorm = normalizeTrForMatch(d);
            const distRegex = new RegExp(`(?:^|[^a-z0-9])${dNorm}(?:$|[^a-z0-9])`, 'i');
            if (distRegex.test(lineNorm)) {
              matchedDistrict = d;
              break;
            }
          }

          if (!matchedDistrict) {
            for (const [distKey, data] of Object.entries(COMMON_TURKISH_DISTRICTS)) {
              if (data.city === lineCity) {
                const distRegex = new RegExp(`(?:^|[^a-z0-9])${distKey}(?:$|[^a-z0-9])`, 'i');
                if (distRegex.test(lineNorm)) {
                  matchedDistrict = data.district;
                  break;
                }
              }
            }
          }

          if (!matchedDistrict && lineNorm.includes(' merkez ')) {
            matchedDistrict = 'Merkez';
          }

          if (matchedDistrict) {
            return {
              city: lineCity,
              district: matchedDistrict,
              detectedCities: [lineCity],
            };
          }

          if (!bestCandidateCity) {
            bestCandidateCity = lineCity;
          }
        }
      }
    }
  }

  if (bestCandidateCity) {
    return {
      city: bestCandidateCity,
      detectedCities: [bestCandidateCity],
    };
  }

  // Phase 2: Standard top 20 lines pass
  for (let i = 0; i < Math.min(rawLines.length, 20); i++) {
    const rawLine = rawLines[i];
    const lineNorm = ` ${normalizeTrForMatch(rawLine)} `;
    const cleanNorm = normalizeTrForMatch(rawLine);
    const hasLocationCue = /[\/,\-\|]|\b(sehir|il|ilce|adres|lokasyon|ikamet|cad|sok|mah)\b/i.test(rawLine);

    if (i > 0 && TURKISH_CITY_ALIASES[cleanNorm]) {
      const cName = TURKISH_CITY_ALIASES[cleanNorm];
      return {
        city: cName,
        detectedCities: [cName],
      };
    }

    for (const [distKey, data] of Object.entries(COMMON_TURKISH_DISTRICTS)) {
      if (HOMONYM_DISTRICT_KEYS.has(distKey)) {
        const cityNorm = normalizeTrForMatch(data.city);
        if (!hasLocationCue && !lineNorm.includes(cityNorm)) {
          continue;
        }
      }

      const distRegex = new RegExp(`(?:^|[^a-z0-9])${distKey}(?:$|[^a-z0-9])`, 'i');
      if (distRegex.test(lineNorm)) {
        return {
          city: data.city,
          district: data.district,
          detectedCities: [data.city],
        };
      }
    }
  }

  // Phase 3: Global document frequency matching
  const normText = ` ${normalizeTrForMatch(text)} `;
  let detectedCity = '';
  let detectedDistrict = '';

  for (const [distKey, data] of Object.entries(COMMON_TURKISH_DISTRICTS)) {
    if (HOMONYM_DISTRICT_KEYS.has(distKey)) {
      const cityNorm = normalizeTrForMatch(data.city);
      if (!normText.includes(cityNorm)) continue;
    }
    const regex = new RegExp(`(?:^|[^a-z0-9])${distKey}(?:$|[^a-z0-9])`, 'i');
    if (regex.test(normText)) {
      detectedCity = data.city;
      detectedDistrict = data.district;
      detectedCities.push(data.city);
      break;
    }
  }

  const cityAliases = TURKISH_CITY_ALIASES;
  for (const [cKey, cName] of Object.entries(cityAliases)) {
    const regex = new RegExp(`(?:^|\\s)${cKey}(?:\\s|$)`, 'i');
    if (regex.test(normText)) {
      if (!detectedCity) detectedCity = cName;
      if (!detectedCities.includes(cName)) detectedCities.push(cName);
    }
  }

  return {
    city: detectedCity || bestCandidateCity || '',
    district: detectedDistrict || undefined,
    detectedCities: detectedCities.length > 0 ? [...new Set(detectedCities)] : (bestCandidateCity ? [bestCandidateCity] : []),
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
    .replace(/\b(?:a\s*ğ\s*u\s*s\s*t\s*o\s*s|a\s*g\s*u\s*s\s*t\s*o\s*s|ağu|agu)\b/g, 'ağustos')
    .replace(/\b(?:e\s*y\s*l\s*ü\s*l|e\s*y\s*l\s*u\s*l|eyl)\b/g, 'eylül')
    .replace(/\b(?:k\s*a\s*s\s*ı\s*m|k\s*a\s*s\s*i\s*m|kas)\b/g, 'kasım')
    .replace(/\b(?:a\s*r\s*a\s*l\s*ı\s*k|a\s*r\s*a\s*l\s*i\s*k|ara)\b/g, 'aralık')
    .replace(/\b(?:ş\s*u\s*b\s*a\s*t|s\s*u\s*b\s*a\s*t|şub|sub)\b/g, 'şubat')
    .replace(/\b(?:h\s*a\s*z\s*i\s*r\s*a\s*n|haz)\b/g, 'haziran')
    .replace(/\b(?:t\s*e\s*m\s*m\s*u\s*z|tem)\b/g, 'temmuz')
    .replace(/\b(?:m\s*a\s*y\s*ı\s*s|m\s*a\s*y\s*i\s*s|may)\b/g, 'mayıs')
    .replace(/\b(?:n\s*i\s*s\s*a\s*n|nis)\b/g, 'nisan')
    .replace(/\b(?:o\s*c\s*a\s*k|oca)\b/g, 'ocak')
    .replace(/\b(?:m\s*a\s*r\s*t|mar)\b/g, 'mart')
    .replace(/\b(?:e\s*k\s*i\s*m|eki)\b/g, 'ekim');

  const months = 'ocak|subat|şubat|mart|nisan|mayis|mayıs|haziran|temmuz|agustos|ağustos|eylul|eylül|ekim|kasim|kasım|aralik|aralık|oca|sub|şub|mar|nis|may|haz|tem|agu|ağu|eyl|eki|kas|ara|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
  const activePattern = 'günümüz|gunumuz|güncel|guncel|devam(?:\\s*ediyor)?|present|current|halen|hala(?:\\s*çalışıyorum|\\s*calisiyorum)?|çalışıyorum|calisiyorum|sürüyor|suruyor|now';

  const singleDatePattern = `(?:(?:\\d{1,2}[.\\s/]+){1,2}|(?:${months})[.\\s/]+)?(19\\d{2}|20\\d{2})`;
  const endPattern = `(?:(?:(?:\\d{1,2}[.\\s/]+){1,2}|(?:${months})[.\\s/]+)?(19\\d{2}|20\\d{2})|(${activePattern}))`;
  const rangeRegex = new RegExp(`(${singleDatePattern})\\s*(?:-|to|ila|ile|/)\\s*(${endPattern})`, 'i');
  const match = norm.match(rangeRegex);

  if (match) {
    const startYearMatch = match[1].match(/\b(19\d{2}|20\d{2})\b/);
    const startYear = startYearMatch ? parseInt(startYearMatch[1], 10) : null;
    const endStr = match[3] || match[2] || '';
    const isCurrent = new RegExp(activePattern, 'i').test(endStr);
    const endYearMatch = endStr.match(/\b(19\d{2}|20\d{2})\b/);
    const endYear = isCurrent ? new Date().getFullYear() : (endYearMatch ? parseInt(endYearMatch[1], 10) : null);

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
  if (singleActive && !/^[*•·\->]\s*/.test(line)) {
    const yr = new Date().getFullYear();
    return {
      startYear: yr,
      endYear: yr,
      isCurrent: true,
      raw: singleActive[0],
    };
  }

  // Check for 4-digit year (e.g. "SİGORTAMBİR A.Ş 2025" or "2023" or "(2021)")
  // Ignore single years in responsibility bullets or descriptive sentences
  const isBulletOrSentence = /^[*•·\->]\s*/.test(line) || /\b(?:y[ıi]l[ıi](?:nda|ndan)?|hedefleri|odulu|projesi|ciro|buce|tl|usd|eur|\%)\b/i.test(norm);
  if (!isBulletOrSentence) {
    const singleYear = norm.match(/(?:^|\s|\()((?:19[7-9]\d|20[0-4]\d))(?:\s|\)|$)/);
    if (singleYear) {
      const yr = parseInt(singleYear[1], 10);
      return {
        startYear: yr,
        endYear: yr,
        isCurrent: false,
        raw: singleYear[1],
      };
    }
  }

  return null;
}

// ============================================================================
// 3. EDUCATION DETERMINISTIC PARSER (100% Deterministic)
// ============================================================================

export function cleanHeaderLine(line: string): string {
  if (!line) return '';
  return line
    .replace(/^[#\s\-=~_*●•▪▫►✔✓★\[\]\(\)\d\.\:\/\|\\]+/, '')
    .replace(/[#\s\-=~_*●•▪▫►✔✓★\[\]\(\)\.\:\/\|\\]+$/, '')
    .trim();
}

export const EXP_HEADER_NORMS = new Set([
  'isdeneyimi', 'isdeneyimleri', 'isdeneyim', 'deneyimler', 'deneyim', 'istecrubesi',
  'istecrubeleri', 'tecrubeler', 'tecrube', 'meslekideneyim', 'meslekideneyimler',
  'meslekigecmis', 'meslekitecrube', 'kariyergecmisi', 'calismahayati', 'istihdamgecmisi',
  'isgecmisi', 'isvemeslekigecmis', 'stajvedeneyim', 'stajvedeneyimler', 'stajdeneyimi',
  'stajdeneyimleri', 'stajlar', 'staj', 'kariyer', 'profesyoneldeneyim',
  'profesyonelisdeneyimi', 'profesyonelisdeneyimleri', 'profesyonelisgecmisi', 'profesyonelgecmis',
  'workexperience', 'workexperiences', 'experience', 'experiences', 'employmenthistory',
  'careerhistory', 'workhistory', 'workbackground', 'professionalexperience',
  'positionsheld', 'practicalexperience', 'internships', 'internship', 'currentexperience',
  'previousexperience', 'employment', 'work',
  'berufserfahrung', 'beruflicherwerdegang', 'arbeitserfahrung', 'praxiserfahrung',
  'experienceprofessionnelle', 'experiencesprofessionnelles', 'parcoursprofessionnel',
  'esperienzalavorativa', 'esperienzelavorative', 'esperienzeprofessionali', 'esperienzaprofessionale',
  'experiencialaboral', 'experienciaprofesional', 'trayectoriaprofesional',
  'sirketpozisyontarih', 'sirketunvantarih', 'kurumpozisyontarih', 'companyroledate', 'companypositiondate'
]);

export const EDU_HEADER_NORMS = new Set([
  'egitim', 'egitimbilgileri', 'egitimgecmisi', 'egitimdurumu', 'ogrenim',
  'ogrenimbilgileri', 'ogrenimdurumu', 'akademikegitim', 'akademikgecmis',
  'akademikbilgiler', 'egitimveakademikbilgiler', 'egitimveogrenim', 'egitimveogretim',
  'egitimvenitelikler', 'egitimvenitelik', 'egitimvesertifikalar',
  'education', 'educationalbackground', 'academicbackground', 'academichistory',
  'academic', 'qualifications', 'academicqualifications', 'degrees', 'studies',
  'academicprofile', 'educationtraining', 'educationandtraining',
  'ausbildung', 'bildungsweg', 'studium', 'schulbildung', 'berufsausbildung',
  'formation', 'formations', 'etudes', 'diplomes', 'formationacademique',
  'istruzione', 'istruzioneeformazione', 'formazione', 'titolidistudio',
  'educacion', 'formacion', 'formacionacademica', 'estudios'
]);

export const OTHER_HEADER_NORMS = new Set([
  ...EXP_HEADER_NORMS,
  ...EDU_HEADER_NORMS,
  'yetkinlikler', 'yetkinlik', 'yetenekler', 'yetenek', 'beceriler', 'beceri',
  'uzmanlikalanlari', 'uzmanlik', 'teknikbeceriler', 'teknikyetkinlikler',
  'meslekiyetkinlikler', 'kisiselyetkinlikler', 'bilgisayarbecerileri', 'araclar',
  'teknolojiler', 'araclarveteknolojiler', 'yazilimbecerileri', 'programlamadilleri',
  'skills', 'keyskills', 'corecompetencies', 'competencies', 'technicalskills',
  'technicalproficiencies', 'areasofexpertise', 'toolstechnologies', 'tools',
  'technologies', 'abilities', 'proficiencies', 'expertise', 'softskills',
  'hardskills', 'professionalqualifications',
  'kompetenzen', 'kenntnisse', 'sprachkenntnisse', 'fahigkeiten', 'competences',
  'competencescles', 'competenze', 'competenzechiave', 'habilidades', 'competencias',
  'sertifikalar', 'sertifika', 'kurslar', 'kurs', 'kurslarvesertifikalar', 'lisanslarvesertifikalar',
  'egitimlervesertifikalar', 'sertifikalarvelisanslar', 'kurslarveegitimler',
  'belgeler', 'sertifikavebelgeler', 'certificates', 'certifications', 'licenses',
  'coursescertificates', 'accreditations', 'certificationslicenses', 'courses',
  'diller', 'dil', 'yabancidiller', 'dilbecerileri', 'yabancidil', 'languages',
  'foreignlanguages', 'languageproficiencies', 'language', 'languageskills',
  'projeler', 'proje', 'kisiselprojeler', 'projedeyimi', 'projelerveyayinlar',
  'yayinlar', 'yayin', 'publications', 'publication', 'articles', 'makaleler',
  'projects', 'selectedprojects', 'keyprojects', 'portfolio', 'personalprojects',
  'ozet', 'profesyonelozet', 'hakkimda', 'kariyerhedefi', 'kisiselprofil',
  'profil', 'ozgecmis', 'kariyeramaci', 'kisaotobiyografi', 'summary',
  'professionalsummary', 'executivesummary', 'profile', 'aboutme', 'careerobjective',
  'objective', 'personalprofile', 'personalstatement', 'overview',
  'iletisim', 'iletisimbilgileri', 'iletisimbilgisi', 'kisiselbilgiler',
  'contact', 'contactinfo', 'contactinformation', 'personaldetails', 'personalinfo',
  'referanslar', 'referans', 'references', 'reference', 'referenzen', 'referenze', 'referencias',
  'hobiler', 'hobi', 'ilgialanlari', 'interests', 'hobbies'
]);

function isEduSectionHeader(line: string): boolean {
  if (!line || line.length > 60 || line.includes('.')) return false;
  const clean = cleanHeaderLine(line);
  if (!clean || clean.length > 50) return false;
  const norm = normalizeTrForMatch(clean).replace(/[^a-z0-9]/g, '');
  if (EDU_HEADER_NORMS.has(norm)) return true;
  if (line.includes('|')) {
    const parts = line.split('|').map((p) => normalizeTrForMatch(cleanHeaderLine(p)).replace(/[^a-z0-9]/g, ''));
    if (parts.some((p) => EDU_HEADER_NORMS.has(p))) return true;
  }
  return false;
}

function isOtherSectionHeader(line: string): boolean {
  if (!line || line.length > 60 || line.includes('.')) return false;
  const clean = cleanHeaderLine(line);
  if (!clean || clean.length > 50) return false;
  const norm = normalizeTrForMatch(clean).replace(/[^a-z0-9]/g, '');
  if (OTHER_HEADER_NORMS.has(norm)) return true;
  if (line.includes('|')) {
    const parts = line.split('|').map((p) => normalizeTrForMatch(cleanHeaderLine(p)).replace(/[^a-z0-9]/g, ''));
    if (parts.some((p) => OTHER_HEADER_NORMS.has(p))) return true;
  }
  return false;
}

export function isNoiseOrFooterLine(line: string): boolean {
  if (!line) return false;
  const clean = cleanHeaderLine(line);
  const norm = normalizeTrForMatch(clean);
  return (
    /^(?:page|sayfa)\s*\d+(?:\s*(?:of|\/)\s*\d+)?$/i.test(norm) ||
    /^(?:page|sayfa)\s*\d+$/i.test(norm) ||
    /^(?:curriculum\s*vitae|cv|ozgecmis)$/i.test(norm) ||
    /generated\s*by\s*(?:linkedin|kariyer|indeed|novoresume|canva|europass)/i.test(norm) ||
    /^(?:confidential|gizli|kisisel\s*belge)$/i.test(norm) ||
    /^(?:copyright|all\s*rights\s*reserved|tum\s*haklari\s*saklidir)/i.test(norm) ||
    /^https?:\/\/\S+$/i.test(norm)
  );
}

export function extractDeterministicEducation(text: string): RawExtractedEducation[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => Boolean(l) && !isNoiseOrFooterLine(l));
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

    const dateRange = parseDateRangeText(line);
    const yearMatches = line.match(/\b(19\d{2}|20\d{2})\b/g);
    const gradYear = dateRange?.endYear ?? dateRange?.startYear ?? (yearMatches?.length ? parseInt(yearMatches[yearMatches.length - 1], 10) : undefined);

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

    if (!field && school && (line.includes(',') || line.includes('-') || line.includes('–') || line.includes('—') || line.includes('|') || line.includes('/'))) {
      const parts = line.split(/[,–—|\-\/]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const nonSchoolPart = parts.find((p) => !normalizeTrForMatch(p).includes(normalizeTrForMatch(school || '')) && !parseDateRangeText(p) && !/lisans|doktora|lise/i.test(p));
        if (nonSchoolPart && nonSchoolPart.length >= 3 && !parseDateRangeText(nonSchoolPart)) {
          field = nonSchoolPart.replace(/\([^)]*\)/g, '').trim();
        }
      }
    }

    if (school || level || field || gradYear) {
      const isSubUnitOfCurrentSchool =
        currentEdu &&
        currentEdu.school &&
        /üniversite|universite|university/i.test(currentEdu.school) &&
        school &&
        /fakülte|fakulte|enstitü|enstitu|yüksekokul|yuksekokul/i.test(school);

      if (isSubUnitOfCurrentSchool && currentEdu) {
        currentEdu.field = school;
        if (gradYear && !currentEdu.graduationYear) currentEdu.graduationYear = gradYear;
        if (level && !currentEdu.level) currentEdu.level = level;
        continue;
      }

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

  // Merge and group by school + level to prevent line fragmentation while preserving multi-degree records
  const schoolGroups: Record<string, RawExtractedEducation> = {};
  for (const e of eduRecords) {
    const key = `${e.school ? normalizeTrForMatch(e.school) : 'school'}_${e.level ? normalizeTrForMatch(e.level) : (e.field ? normalizeTrForMatch(e.field) : 'level')}`;
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

  if (uniqueEdu.length === 0) {
    const tokens = generateCandidateTokens(text);
    const unstructuredEdu = resolveEducationRelationships(tokens);
    if (unstructuredEdu.length > 0) {
      return unstructuredEdu.map((ued) => ({
        school: ued.school,
        level: ued.level,
        field: ued.field,
        graduationYear: ued.graduationYear,
      }));
    }
  }

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
    'oca', 'sub', 'mar', 'nis', 'may', 'haz', 'tem', 'agu', 'eyl', 'eki', 'kas', 'ara',
    'jan', 'feb', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    'yil', 'ay', 'gunumuz', 'devam', 'present', 'current', 'halen', 'to', 'ila', 'ile',
    'year', 'years', 'month', 'months', 'duration', 'sure', 'date', 'dates', 'tarih', 'tarihler', 'period', 'donem', 'donemi'
  ];
  return words.every((w) => monthsAndTerms.includes(w) || /^\d+$/.test(w) || /^[-–—/():]+$/.test(w));
}

function isExperienceSectionHeader(line: string): boolean {
  if (!line || line.length > 60 || line.includes('.')) return false;
  const clean = cleanHeaderLine(line);
  if (!clean || clean.length > 50) return false;
  const norm = normalizeTrForMatch(clean).replace(/[^a-z0-9]/g, '');
  if (EXP_HEADER_NORMS.has(norm)) return true;
  if (line.includes('|')) {
    const parts = line.split('|').map((p) => normalizeTrForMatch(cleanHeaderLine(p)).replace(/[^a-z0-9]/g, ''));
    if (parts.some((p) => EXP_HEADER_NORMS.has(p))) return true;
  }
  return false;
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
    norm.includes('doktora') ||
    norm.includes('phd') ||
    norm.includes('lisans') ||
    norm.startsWith('egitim') ||
    norm.startsWith('ogrenim') ||
    norm.startsWith('education')
  );
}

export function extractDeterministicExperiences(text: string): RawExtractedExperience[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => Boolean(l) && !isNoiseOrFooterLine(l));
  const experiences: RawExtractedExperience[] = [];

  let inExpSection = false;
  const expLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isExperienceSectionHeader(line)) {
      inExpSection = true;
      continue;
    }

    if (inExpSection) {
      if ((isOtherSectionHeader(line) || isEduSectionHeader(line)) && !isExperienceSectionHeader(line)) {
        break;
      }
      expLines.push(line);
    }
  }

  const hasExplicitNonExpHeaders = lines.some((l) => isEduSectionHeader(l) || (isOtherSectionHeader(l) && !isExperienceSectionHeader(l)));
  if (expLines.length === 0 && hasExplicitNonExpHeaders) {
    return [];
  }

  const targetLines = expLines.length > 0 ? expLines : lines;
  let currentExp: Partial<RawExtractedExperience> | null = null;
  let collectedResponsibilities: string[] = [];

  const flushExp = () => {
    if (currentExp && (currentExp.company || currentExp.role)) {
      const normCompany = normalizeTrForMatch(currentExp.company || '');
      const normRole = normalizeTrForMatch(currentExp.role || '');

      const isHospitalOrClinic =
        /\b(?:hastanesi|hastane|poliklinigi|poliklinik|tip\s*merkezi|saglik\s*merkezi|klinigi|klinik)\b/i.test(normCompany);

      const isTechParkOrBusiness =
        /\b(?:teknokent|teknopark|ar-ge|arge|merkezi|holding|sirketi|ltd|danismanlik|lojistik)\b/i.test(normCompany);

      const hasAcademicOrMedicalRole =
        /\b(?:arastirma\s*gorevli(?:si)?|ogretim\s*gorevli(?:si)?|ogretim\s*uye(?:si)?|prof|docent|akademisyen|ogretmen(?:i)?|egitmen(?:i)?|zumre\s*baskan(?:i)?|okul\s*mudur(?:u)?|dekan|rektor|okutman|rehberlik|pedagog|doktor(?:u)?|hemsire(?:si)?|hekim(?:i)?|cerrah|tibbi|saglik|hasta\s*bakici|fizyoterapist|psikolog|diyetisyen)\b/i.test(normRole);

      // Academic and status firewall: Education, universities, and status words must NEVER become experiences unless it's a teaching/medical employment, techpark/business, or a hospital!
      const isAcademicCompany =
        !isHospitalOrClinic &&
        !isTechParkOrBusiness &&
        !hasAcademicOrMedicalRole &&
        (isEduLine(currentExp.company || '') ||
        /\b(?:universite|universitesi|fakulte|fakultesi|lisesi|koleji|enstitu|myo|acikogretim|imam hatip)\b/i.test(normCompany) ||
        /\b(?:terk|mezun|devam|ogrenci|hazirlik|not ortalamasi)\b/i.test(normCompany));

      const isAcademicRole =
        /\b(?:terk|mezun|devam|ogrenci|hazirlik|not ortalamasi)\b/i.test(normRole) ||
        /\b(?:felsefe|eski yunan dili|dili ve edebiyati|turk dili ve edebiyati|ilahiyat|arkeoloji|sanat tarihi)\b/i.test(normRole);

      if (isAcademicCompany || isAcademicRole || (!currentExp.company && !currentExp.role)) {
        collectedResponsibilities.length = 0;
        currentExp = null;
        return;
      }

      currentExp.company = currentExp.company ? suggestTitleCaseTr(currentExp.company) : '';
      currentExp.role = currentExp.role ? suggestTitleCaseTr(currentExp.role) : '';
      currentExp.responsibilities = collectedResponsibilities.join('. ').replace(/\.\s*\./g, '.');
      experiences.push(currentExp as RawExtractedExperience);
      collectedResponsibilities.length = 0;
      currentExp = null;
    }
  };

  const getCleanPrevNonHeaderLines = (currentIndex: number): string[] => {
    const result: string[] = [];
    for (let j = currentIndex - 1; j >= 0 && result.length < 2; j--) {
      const l = targetLines[j];
      const normL = normalizeTrForMatch(l);
      const isEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(l);
      const isPhone = /(?:\+?90|0?5\d{2})\s*\d{3}/.test(l);
      const isUrl = /^https?:\/\//i.test(l);
      const words = l.split(/[\s\/,|–—]+/).map((w) => normalizeTrForMatch(w)).filter(Boolean);
      const hasCityOrDistrict = words.some((w) => Boolean(TURKISH_CITY_ALIASES[w]) || Boolean(COMMON_TURKISH_DISTRICTS[w]));
      const isLocationOrContact =
        (hasCityOrDistrict && (l.includes('/') || l.includes(',') || l.includes('|') || isEmail || isPhone)) ||
        isEmail ||
        isPhone ||
        isUrl ||
        Boolean(TURKISH_CITY_ALIASES[normL]) ||
        Boolean(COMMON_TURKISH_DISTRICTS[normL]);
      const isCandidateName =
        targetLines === lines &&
        expLines.length === 0 &&
        j === 0 &&
        l.split(/\s+/).length <= 4 &&
        !isRoleTitle(l) &&
        !isEmail &&
        !/^(?:sirket|kurum|company|firma|rol|pozisyon|unvan|role|is deneyim|deneyim)[\s:]*/i.test(l);

      if (
        !isExperienceSectionHeader(l) &&
        !isEduSectionHeader(l) &&
        !isOtherSectionHeader(l) &&
        !isEduLine(l) &&
        !isLocationOrContact &&
        !isCandidateName &&
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
      continue;
    }
    const hasDate = Boolean(parseDateRangeText(line));
    const isExplicitDegree = /\b(?:lisans|doktora|phd|master|bachelor|lise|onlisans|myo|mezun(?:u|iyet|lar[ıi])?|not ortalamas[ıi]|gpa)\b/i.test(normalizeTrForMatch(line));
    const hasAcademicEmploymentRole = /\b(?:arastirma\s*gorevlisi|ogretim\s*gorevlisi|ogretim\s*uyesi|prof\.?\s*dr|doc\.?\s*dr|rektor|dekan|okul\s*muduru)\b/i.test(normalizeTrForMatch(line));
    const isEducational = isEduLine(line) || isExplicitDegree;

    if (isEduSectionHeader(line) || isOtherSectionHeader(line) || (targetLines !== expLines && isEducational && !hasAcademicEmploymentRole)) {
      if (currentExp && (currentExp.company || currentExp.role)) {
        flushExp();
      }
      currentExp = null;
      continue;
    }

    const norm = normalizeTrForMatch(line);
    const dateInfo = parseDateRangeText(line);

    if (dateInfo) {
      const prevs = getCleanPrevNonHeaderLines(i);
      const prev1 = prevs[0] || null;
      const prev2 = prevs[1] || null;

      if (prev1) {
        collectedResponsibilities = collectedResponsibilities.filter((r) => r.trim() !== prev1.trim());
      }
      if (prev2) {
        collectedResponsibilities = collectedResponsibilities.filter((r) => r.trim() !== prev2.trim());
      }

      if (currentExp && (currentExp.company || currentExp.role)) {
        if (currentExp.startYear || currentExp.endYear) {
          flushExp();
          currentExp = {
            startYear: dateInfo.startYear,
            endYear: dateInfo.endYear,
            isCurrent: dateInfo.isCurrent,
            duration: dateInfo.duration,
          };
        } else {
          currentExp.startYear = dateInfo.startYear;
          currentExp.endYear = dateInfo.endYear;
          currentExp.isCurrent = dateInfo.isCurrent;
          currentExp.duration = dateInfo.duration;
        }
      } else {
        currentExp = {
          startYear: dateInfo.startYear,
          endYear: dateInfo.endYear,
          isCurrent: dateInfo.isCurrent,
          duration: dateInfo.duration,
        };
      }
      const isPureDate = isPureDateLine(line);
      let rawRemainder = isPureDate ? '' : line;
      if (!isPureDate && dateInfo.raw) {
        const escaped = dateInfo.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        rawRemainder = rawRemainder
          .replace(new RegExp(`\\b${escaped}\\b|${escaped}`, 'gi'), '')
          .replace(/\([^)]*\)/g, '')
          .replace(/^(?:d[oö]nem|tarih(?:ler)?|date(?:s)?|period|years?|y[ıi]llar|s[uü]re|sekt[oö]r)[\s:]*/i, '')
          .replace(/^[–—\-:\s]+/, '')
          .trim();
      }

      if (!isPureDate && rawRemainder.length >= 2 && !/^(?:d[oö]nem|tarih(?:ler)?|date(?:s)?|period|years?|y[ıi]llar|s[uü]re|s)$/i.test(rawRemainder)) {
        const parts = rawRemainder.split(/\s+[-–—]\s*|\s*[-–—]\s+|[|@]|(?:\s+\/\s+)/).map((p) => p.replace(/^(?:deneyim|pozisyon|unvan|sirket|kurum|role|company|sektor)[\s:]*/i, '').trim()).filter(Boolean);
        if (parts.length >= 2) {
          const normP0 = normalizeTrForMatch(parts[0]);
          const normP1 = normalizeTrForMatch(parts[1]);
          const p0IsCity = Boolean(TURKISH_CITY_ALIASES[normP0] || COMMON_TURKISH_DISTRICTS[normP0]);
          const p1IsCity = Boolean(TURKISH_CITY_ALIASES[normP1] || COMMON_TURKISH_DISTRICTS[normP1]);

          if (isRoleTitle(parts[1])) {
            if (!currentExp.role) currentExp.role = parts[1];
            if (!currentExp.company && !p0IsCity) currentExp.company = parts[0];
          } else if (isRoleTitle(parts[0])) {
            if (!currentExp.role) currentExp.role = parts[0];
            if (!currentExp.company && !p1IsCity) currentExp.company = parts[1];
          } else {
            if (!currentExp.company) currentExp.company = p0IsCity ? (p1IsCity ? '' : parts[1]) : parts[0];
            if (prev1 && isRoleTitle(prev1)) {
              if (!currentExp.role) currentExp.role = prev1;
            } else if (prev2 && isRoleTitle(prev2)) {
              if (!currentExp.role) currentExp.role = prev2;
            } else if (!p1IsCity && !currentExp.role) {
              currentExp.role = parts[1];
            }
          }
        } else {
          if (isRoleTitle(rawRemainder)) {
            if (!currentExp.role) currentExp.role = rawRemainder;
            if (!currentExp.company && prev1 && !isRoleTitle(prev1) && !parseDateRangeText(prev1) && prev1.length >= 2 && prev1.length <= 80) {
              currentExp.company = prev1.replace(/^(?:sirket|kurum|company|isyeri)(?:[\s:]+|$)/i, '').trim();
            }
          } else if (!currentExp.company && !/^(?:sekt[oö]r|d[oö]nem|s[uü]re)[\s:]/i.test(rawRemainder)) {
            const words = rawRemainder.split(/\s+/);
            let splitFound = false;
            if (words.length >= 3 && words.length <= 8) {
              for (let w = 1; w < words.length; w++) {
                const prefix = words.slice(0, w).join(' ');
                const suffix = words.slice(w).join(' ');
                if (isRoleTitle(suffix) && !isRoleTitle(prefix) && prefix.length >= 3) {
                  currentExp.company = prefix;
                  currentExp.role = suffix;
                  splitFound = true;
                  break;
                }
              }
            }

            if (!splitFound && !currentExp.company) {
              currentExp.company = (parts[0] || rawRemainder).replace(/^(?:sirket|kurum|company|isyeri)(?:[\s:]+|$)/i, '').trim();
              if (prev1 && isRoleTitle(prev1) && !currentExp.role) {
                currentExp.role = prev1;
              } else if (prev2 && isRoleTitle(prev2) && !currentExp.role) {
                currentExp.role = prev2;
              }
            }
          }
        }
      } else {
        const cleanPrev1 = prev1 ? prev1.replace(/^(?:rol|pozisyon|unvan|unvani|gorev|gorevi|gorevleri|sirket|kurum|company|role|position)(?:[\s:]+|$)/i, '').trim() : null;
        const cleanPrev2 = prev2 ? prev2.replace(/^(?:rol|pozisyon|unvan|unvani|gorev|gorevi|gorevleri|sirket|kurum|company|role|position)(?:[\s:]+|$)/i, '').trim() : null;

        if (cleanPrev2 && isRoleTitle(cleanPrev2) && cleanPrev1 && !isRoleTitle(cleanPrev1)) {
          currentExp.role = cleanPrev2;
          currentExp.company = cleanPrev1;
        } else if (cleanPrev1 && (cleanPrev1.includes(',') || /\s+[-–—]|[-–—]\s+/.test(cleanPrev1) || cleanPrev1.includes('|') || cleanPrev1.includes('@') || cleanPrev1.includes(' / '))) {
          const parts = cleanPrev1.split(/\s+[-–—]\s*|\s*[-–—]\s+|[|@]|(?:\s+\/\s+)|,/).map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            if (isRoleTitle(parts[0]) && !isRoleTitle(parts[1])) {
              currentExp.role = parts[0];
              currentExp.company = parts[1];
            } else if (isRoleTitle(parts[1]) && !isRoleTitle(parts[0])) {
              currentExp.company = parts[0];
              currentExp.role = parts[1];
            } else if (cleanPrev2 && isRoleTitle(cleanPrev2)) {
              currentExp.role = cleanPrev2;
              currentExp.company = cleanPrev1;
            } else {
              currentExp.company = parts[0];
              currentExp.role = parts[1];
            }
          } else if (isRoleTitle(cleanPrev1)) {
            currentExp.role = cleanPrev1;
            if (cleanPrev2 && !isRoleTitle(cleanPrev2)) {
              currentExp.company = cleanPrev2;
            }
          } else {
            currentExp.company = cleanPrev1;
            if (cleanPrev2 && isRoleTitle(cleanPrev2)) {
              currentExp.role = cleanPrev2;
            }
          }
        } else if (cleanPrev1 && isRoleTitle(cleanPrev1)) {
          currentExp.role = cleanPrev1;
          if (cleanPrev2 && !isRoleTitle(cleanPrev2)) {
            currentExp.company = cleanPrev2;
          }
        } else if (cleanPrev1 && !isRoleTitle(cleanPrev1)) {
          currentExp.company = cleanPrev1;
          if (cleanPrev2 && isRoleTitle(cleanPrev2)) {
            currentExp.role = cleanPrev2;
          }
        }

        // Forward lookup for Format C / Format G (Date -> Role -> Company or Date -> Company -> Role)
        if (!currentExp.role || !currentExp.company) {
          const next1 = i + 1 < targetLines.length ? targetLines[i + 1] : null;
          const next2 = i + 2 < targetLines.length ? targetLines[i + 2] : null;
          if (next1 && isRoleTitle(next1)) {
            if (!currentExp.role) currentExp.role = next1;
            if (!currentExp.company && next2 && !parseDateRangeText(next2) && !isEduLine(next2) && !next2.includes('@')) {
              currentExp.company = next2;
            }
          } else if (next1 && !isRoleTitle(next1) && !parseDateRangeText(next1) && !isEduLine(next1) && !next1.includes('@')) {
            if (!currentExp.company) currentExp.company = next1;
            if (!currentExp.role && next2 && isRoleTitle(next2)) {
              currentExp.role = next2;
            }
          }
        }
      }
      continue;
    }

    if (currentExp) {
      const isPureEmploymentType = line.length <= 35 && !isRoleTitle(line) && (
        norm === 'tam zamanli' ||
        norm === 'yari zamanli' ||
        norm === 'surekli' ||
        norm === 'donemsel' ||
        norm === 'part time' ||
        norm === 'full time' ||
        norm === 'freelance' ||
        norm === 'sozlesmeli' ||
        norm === 'stajyer'
      );
      if (isPureEmploymentType) {
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

      if (
        !currentExp.company &&
        !isRoleTitle(line) &&
        !line.startsWith('-') &&
        !line.startsWith('•') &&
        !line.startsWith('*') &&
        !line.startsWith('·') &&
        line.length >= 2 &&
        line.length <= 70
      ) {
        currentExp.company = line;
        continue;
      }

      if (
        isRoleTitle(line) &&
        !line.startsWith('-') &&
        !line.startsWith('•') &&
        !line.startsWith('*') &&
        !line.startsWith('·')
      ) {
        // Belongs to next experience entry
        continue;
      }

      if (
        (i > 0 && isRoleTitle(lines[i - 1])) ||
        (i + 1 < lines.length && parseDateRangeText(lines[i + 1])) ||
        (i + 2 < lines.length && parseDateRangeText(lines[i + 2]) && isRoleTitle(lines[i + 1]))
      ) {
        if (!line.startsWith('-') && !line.startsWith('•') && !line.startsWith('*') && !line.startsWith('·')) {
          continue;
        }
      }

      if (line.length >= 3 && !line.startsWith('---')) {
        collectedResponsibilities.push(line);
      }
    }
  }

  flushExp();

  if (experiences.length === 0) {
    for (const l of targetLines) {
      if (isEduSectionHeader(l) || isOtherSectionHeader(l) || isEduLine(l)) continue;
      if (l.includes(' - ') || l.includes(' | ')) {
        const parts = l.split(/\s+-\s+|\s+\|\s+/).map((p) => p.trim()).filter(Boolean);
        if (parts.length === 2) {
          if (isRoleTitle(parts[0]) && !isRoleTitle(parts[1]) && !isEduLine(parts[1]) && parts[1].length >= 2 && !parts[1].includes('@')) {
            experiences.push({
              company: suggestTitleCaseTr(parts[1]),
              role: suggestTitleCaseTr(parts[0]),
            });
          } else if (isRoleTitle(parts[1]) && !isRoleTitle(parts[0]) && !isEduLine(parts[0]) && parts[0].length >= 2 && !parts[0].includes('@')) {
            experiences.push({
              company: suggestTitleCaseTr(parts[0]),
              role: suggestTitleCaseTr(parts[1]),
            });
          }
        }
      }
    }
  }

  if (experiences.length === 0) {
    const tokens = generateCandidateTokens(text);
    const unstructuredExp = resolveExperienceRelationships(tokens);
    if (unstructuredExp.length > 0) {
      return unstructuredExp
        .map((ue) => ({
          company: ue.company,
          role: ue.role,
          startYear: ue.startYear,
          endYear: ue.endYear,
          isCurrent: ue.isCurrent,
          responsibilities: ue.responsibilities.join('. '),
          durationYears:
            ue.startYear && ue.endYear ? Math.max(1, ue.endYear - ue.startYear) : undefined,
        }))
        .filter((e) => Boolean(e.company || e.role));
    }
  }

  return experiences.filter((e) => Boolean(e.company || e.role));
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
  // Sanitize null bytes and control characters
  const cleanInputText = (text || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
  const normText = ` ${normalizeTrForMatch(cleanInputText)} `;
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

  // 3. Scan Sectors — STRICT SECTOR ISOLATION (Excludes Education, References, Languages, Skills)
  // Gather only employment, headline and summary lines for sector evidence
  const allDocLines = cleanInputText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const employmentAndHeadlineLines: string[] = [];
  let isExcludedSection = false;

  for (const line of allDocLines) {
    const normL = normalizeTrForMatch(line);
    if (
      isEduSectionHeader(line) ||
      normL.startsWith('egitim') ||
      normL.startsWith('ogrenim') ||
      normL.startsWith('education') ||
      normL.startsWith('academic') ||
      normL.startsWith('referans') ||
      normL.startsWith('reference') ||
      normL.startsWith('diller') ||
      normL.startsWith('languages') ||
      normL.startsWith('sertifika') ||
      normL.startsWith('hobiler')
    ) {
      isExcludedSection = true;
      continue;
    }
    if (isExperienceSectionHeader(line) || normL.startsWith('ozet') || normL.startsWith('summary') || normL.startsWith('hakkimda')) {
      isExcludedSection = false;
      continue;
    }
    if (!isExcludedSection) {
      employmentAndHeadlineLines.push(line);
    }
  }

  const employmentNormText = ` ${normalizeTrForMatch(employmentAndHeadlineLines.join('\n'))} `;
  const sectorScores: Record<string, number> = {};
  for (const [sectorKey, canonicalSector] of Object.entries(KNOWN_SECTOR_KEYWORDS)) {
    const normSector = normalizeTrForMatch(sectorKey);
    const regex = new RegExp(`(?:^|\\s)${normSector}(?:\\s|$)`, 'gi');
    const matches = employmentNormText.match(regex);
    if (matches && matches.length > 0) {
      sectorScores[canonicalSector] = (sectorScores[canonicalSector] || 0) + matches.length * 2;
    }
  }

  // Corroborate sector with detected tools
  const callCenterTools = ['Genesys', 'Mi4Biz', 'AloTech', 'Monitera', 'Oracle RightNow', 'BoomSonar', 'Zendesk', 'Freshdesk'];
  if (tools.some((t) => callCenterTools.includes(t))) {
    sectorScores['Çağrı merkezi'] = (sectorScores['Çağrı merkezi'] || 0) + 5;
  }
  const techTools = ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'MongoDB', 'Git'];
  if (tools.some((t) => techTools.includes(t))) {
    sectorScores['Bilişim / Yazılım'] = (sectorScores['Bilişim / Yazılım'] || 0) + 5;
  }

  const sortedSectors = Object.entries(sectorScores)
    .sort((a, b) => b[1] - a[1])
    .map(([sec]) => sec);

  sectors.push(...sortedSectors);

  // 3.5. Extract Headline Roles from Top 12 Lines
  const textLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const topLines = textLines.slice(0, 12);
  for (let i = 0; i < topLines.length; i++) {
    const l = topLines[i];
    if (isExperienceSectionHeader(l) || isEduSectionHeader(l) || isOtherSectionHeader(l)) break;

    // Check single line role title
    if (isRoleTitle(l) && !isPureDateLine(l)) {
      const clean = formatTurkishTitle(l);
      if (!roles.includes(clean)) roles.push(clean);
    } else if (i < topLines.length - 1) {
      // Check multi-line header role (e.g. "Ekonomi & Finans \n Uzmanı")
      const combined = `${l} ${topLines[i + 1]}`.trim();
      if (isRoleTitle(combined) && !isRoleTitle(l) && !isPureDateLine(combined)) {
        const clean = formatTurkishTitle(combined);
        if (!roles.includes(clean)) roles.push(clean);
      }
    }
  }

  // 4. Extract Roles Mentioned
  let inNonRoleSection = false;
  for (const line of textLines) {
    const norm = normalizeTrForMatch(line);
    if (
      norm.startsWith('yetkinlik') ||
      norm.startsWith('yetenek') ||
      norm.startsWith('beceri') ||
      norm.startsWith('skills') ||
      norm.startsWith('sertifika') ||
      norm.startsWith('program') ||
      norm.startsWith('diller') ||
      norm.startsWith('egitim') ||
      norm.startsWith('referans') ||
      norm.startsWith('ozel bilgi') ||
      norm.startsWith('kisisel bilgi') ||
      norm.startsWith('surucu') ||
      norm.startsWith('cinsiyet') ||
      norm.startsWith('vatandaslik')
    ) {
      inNonRoleSection = true;
      continue;
    }
    if (isExperienceSectionHeader(line)) {
      inNonRoleSection = false;
      continue;
    }
    if (inNonRoleSection) continue;
    if (line.endsWith('.') || line.endsWith(';') || line.endsWith(':')) continue;

    const roleRegex = /(?:^|[|•·,\n])\s*([A-ZÇĞİÖŞÜa-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜa-zçğıöşü]+){0,3}\s+(?:Müdürü|Direktörü|Yöneticisi|Uzmanı|Lideri|Temsilcisi|Mühendisi|Analisti|Danışmanı|Geliştiricisi|Elemanı|Personeli|Görevlisi|Sorumlusu|Asistanı|Operatörü|Kasiyeri|Müdür|Direktör|Yönetici|Uzman|Lider|Temsilci|Mühendis|Analist|Danışman|Geliştirici|Eleman|Personel|Görevli|Sorumlu|Asistan|Operatör|Kasiyer|Manager|Director|Lead|Specialist|Developer|Engineer|Consultant|Analyst|Executive))\b/gi;
    let m: RegExpExecArray | null;
    while ((m = roleRegex.exec(line)) !== null) {
      const candidate = m[1].trim();
      if (isRoleTitle(candidate)) {
        const cleanRole = formatTurkishTitle(candidate);
        if (cleanRole.length >= 4 && !roles.includes(cleanRole)) {
          roles.push(cleanRole);
        }
      }
    }
  }

  // 5. Section-based Skills Parsing (Block & Inline headers)
  let inSkillsSection = false;
  const sectionProfessionalSkills: string[] = [];
  const sectionTechnicalSkills: string[] = [];
  const sectionTools: string[] = [];

  // Pre-process text lines to merge soft-wrapped proficiency suffixes (e.g. "Çağrı Merkezi Yönetimi -\nUzman")
  const mergedLines: string[] = [];
  for (let idx = 0; idx < textLines.length; idx++) {
    const cur = textLines[idx].trim();
    if (idx < textLines.length - 1 && /[-–—:]\s*$/.test(cur)) {
      const nxt = textLines[idx + 1].trim();
      if (/^(?:Uzman|İleri|İleri Düzey|Orta|Orta Düzey|Başlangıç|Temel|Expert|Advanced|Intermediate|Beginner|Proficient)$/i.test(nxt)) {
        mergedLines.push(`${cur} ${nxt}`);
        idx++;
        continue;
      }
    }
    mergedLines.push(cur);
  }

  for (const line of mergedLines) {
    const norm = normalizeTrForMatch(line);
    const isHeaderLine =
      norm === 'beceriler' ||
      norm === 'yetenekler' ||
      norm === 'yetkinlikler' ||
      norm === 'skills' ||
      norm === 'technical skills' ||
      norm === 'mesleki yetkinlikler' ||
      norm.startsWith('yetenek') ||
      norm.startsWith('beceri') ||
      norm.startsWith('yetkinlik') ||
      norm.startsWith('skill') ||
      norm.startsWith('araclar') ||
      norm.startsWith('tools') ||
      norm.startsWith('uzmanlik alan');

    if (isHeaderLine) {
      inSkillsSection = true;
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const inlineContent = line.slice(colonIdx + 1);
        const items = inlineContent.split(/[,;\n•·*|]/).map((s) => s.trim()).filter(Boolean);
        for (const rawItem of items) {
          const item = rawItem.replace(/\s*[-–—:]\s*(?:Uzman|İleri|İleri Düzey|Orta|Orta Düzey|Başlangıç|Temel|Expert|Advanced|Intermediate|Beginner|Proficient)\s*$/i, '').trim();
          if (item.length >= 2 && item.length <= 60 && !item.toLowerCase().includes('yetenek') && !/^(?:uzman|ileri|orta|temel)$/i.test(item)) {
            const titleCased = suggestTitleCaseTr(item);
            const lower = normalizeTrForMatch(item);
            if (KNOWN_TOOLS_DICTIONARY[lower]) {
              sectionTools.push(KNOWN_TOOLS_DICTIONARY[lower]);
            } else if (
              lower.includes('sap') ||
              lower.includes('excel') ||
              lower.includes('office') ||
              lower.includes('word') ||
              lower.includes('sql') ||
              lower.includes('jira') ||
              lower.includes('figma') ||
              lower.includes('crm') ||
              lower.includes('erp')
            ) {
              sectionTools.push(titleCased);
            } else if (
              lower.includes('bilgisayar') ||
              lower.includes('yazilim') ||
              lower.includes('kod') ||
              lower.includes('program') ||
              lower.includes('hplc') ||
              lower.includes('etabs') ||
              lower.includes('autocad')
            ) {
              sectionTechnicalSkills.push(titleCased);
            } else {
              sectionProfessionalSkills.push(titleCased);
            }
          }
        }
      }
      continue;
    }

    if (inSkillsSection) {
      if (
        line.length > 70 ||
        /\b(?:yillik|kariyerimde|uzmanlastim|sahibiyim|yonettim|calistim|sorumluyum|tamamladim|profesyonel kariyerimde)\b/i.test(norm) ||
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(line) ||
        /(?:\+?90|0?5\d{2})\s*\d{3}/.test(line) ||
        isCorporateEntity(line) ||
        norm.startsWith('hobi') ||
        norm.startsWith('ilgi') ||
        norm.startsWith('diller') ||
        norm.startsWith('egitim') ||
        norm.startsWith('is deneyim') ||
        norm.startsWith('deneyim') ||
        norm.startsWith('referans') ||
        norm.startsWith('sertifika') ||
        norm.startsWith('ozel') ||
        norm.startsWith('kisisel')
      ) {
        inSkillsSection = false;
        continue;
      }

      const items = line.split(/[,;\n•·*|]/).map((s) => s.trim()).filter(Boolean);
      for (const rawItem of items) {
        const item = rawItem.replace(/\s*[-–—:]\s*(?:Uzman|İleri|İleri Düzey|Orta|Orta Düzey|Başlangıç|Temel|Expert|Advanced|Intermediate|Beginner|Proficient)\s*$/i, '').trim();
        if (
          item.length >= 2 &&
          item.length <= 60 &&
          !item.toLowerCase().includes('yetenek') &&
          !item.toLowerCase().includes('beceri') &&
          !/^(?:uzman|ileri|orta|temel|baslangic|expert|advanced|intermediate|proficient)$/i.test(item) &&
          !/[-–—:]$/.test(item)
        ) {
          const titleCased = suggestTitleCaseTr(item);
          const lower = normalizeTrForMatch(item);
          if (KNOWN_TOOLS_DICTIONARY[lower]) {
            sectionTools.push(KNOWN_TOOLS_DICTIONARY[lower]);
          } else if (
            lower.includes('bilgisayar') ||
            lower.includes('office') ||
            lower.includes('yazilim') ||
            lower.includes('kod') ||
            lower.includes('program') ||
            lower.includes('excel') ||
            lower.includes('word') ||
            lower.includes('sap') ||
            lower.includes('sql')
          ) {
            sectionTechnicalSkills.push(titleCased);
          } else {
            sectionProfessionalSkills.push(titleCased);
          }
        }
      }
    }
  }

  const finalProfessionalSkills =
    sectionProfessionalSkills.length > 0
      ? [...new Set(sectionProfessionalSkills)]
      : [...new Set(professionalSkills)];

  const finalTechnicalSkills =
    sectionTechnicalSkills.length > 0
      ? [...new Set(sectionTechnicalSkills)]
      : [...new Set(technicalSkills)];

  const finalTools = [...new Set([...sectionTools, ...tools])];

  return {
    professionalSkills: finalProfessionalSkills,
    technicalSkills: finalTechnicalSkills,
    tools: finalTools,
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
  const normText = ` ${normalizeTrForMatch(text).replace(/[,;:.\-()\/\\|]/g, ' ')} `;
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
    if (certNorm.length <= 3) {
      if (new RegExp(`\\b${certNorm}\\b`, 'i').test(normText)) {
        certificates.push(cert);
      }
    } else if (normText.includes(certNorm)) {
      certificates.push(cert);
    }
  }

  const universalCerts = scanUniversalCertificates(text);
  certificates.push(...universalCerts);

  const certSectionMatch = text.match(/(?:[sS]ert[iİıI]f[iİıI]kalar|[sS]ert[iİıI]f[iİıI]ka|[bB]elgeler|certificates|certifications)[\s:]*\n+([\s\S]{1,400})/iu);
  if (certSectionMatch && certSectionMatch[1]) {
    const lines = certSectionMatch[1].split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    for (const line of lines) {
      if (/^(?:diller|egitim|yetkinlik|referanslar|hobiler|projeler)/i.test(line)) break;
      const rawItems = line.split(/[,;•·*|]/).map((s) => s.trim()).filter(Boolean);
      for (const item of rawItems) {
        if (item.length >= 3 && item.length <= 100) {
          certificates.push(suggestTitleCaseTr(item));
        }
      }
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
// 7.5. DETERMINISTIC DEMOGRAPHICS PARSER (Gender & Birth Date)
// ============================================================================

const TURKISH_MALE_FIRST_NAMES = new Set([
  'ahmet', 'mehmet', 'mustafa', 'ali', 'burak', 'batil', 'ugur', 'can', 'emre', 'murat', 'hakan',
  'omer', 'osman', 'ibrahim', 'huseyin', 'hasan', 'serkan', 'kaan', 'alp', 'efe', 'mert',
  'doruk', 'dorukhan', 'selim', 'kerem', 'baris', 'tolga', 'onur', 'volkan', 'fatih', 'kemal',
  'yigit', 'cem', 'sinan', 'eren', 'oguz', 'berk', 'bora', 'gokhan', 'alper', 'koray', 'arda',
  'yasin', 'tayfun', 'tarik', 'samet', 'furkan', 'eray', 'enes', 'anil', 'umut', 'oguzhan'
]);

const TURKISH_FEMALE_FIRST_NAMES = new Set([
  'ayse', 'fatma', 'emine', 'hatice', 'zeynep', 'elif', 'meryem', 'bursa', 'busra', 'gizem',
  'merve', 'gamze', 'rukiye', 'ravza', 'selin', 'ece', 'bahar', 'ebru', 'esra', 'kubra', 'seyma',
  'irem', 'damla', 'duygu', 'pinar', 'tugba', 'ozge', 'burcu', 'ezgi', 'asli', 'eda', 'ceren',
  'yasemin', 'sema', 'dilek', 'songul', 'hulya', 'melis', 'melisa', 'hilal', 'beyza', 'nur',
  'cansu', 'ilayda', 'hande', 'asuman', 'sevil', 'sinem', 'mine', 'neslihan'
]);

export function extractDeterministicDemographics(text: string): {
  gender?: string;
  birthDate?: string;
  birthYear?: number;
} {
  const normText = normalizeTrForMatch(text);
  let gender: string | undefined;
  let birthDate: string | undefined;
  let birthYear: number | undefined;

  // 1. Gender Detection (Explicit)
  if (
    /(?:^|\s)cinsiyet\b[\s:]*(kadin|bayan)\b/i.test(normText) ||
    /(?:^|\n)\s*cinsiyet\s*\n\s*(kadin|bayan)/i.test(normText) ||
    /(?:^|\s)cinsiyeti\b[\s:]*(kadin|bayan)\b/i.test(normText) ||
    (/ozel\s*bilgiler/i.test(normText) && /\bkadin\b/i.test(normText) && !/\berkek\b/i.test(normText))
  ) {
    gender = 'Kadın';
  } else if (
    /(?:^|\s)cinsiyet\b[\s:]*(erkek|bay)\b/i.test(normText) ||
    /(?:^|\n)\s*cinsiyet\s*\n\s*(erkek|bay)/i.test(normText) ||
    /(?:^|\s)cinsiyeti\b[\s:]*(erkek|bay)\b/i.test(normText) ||
    (/ozel\s*bilgiler/i.test(normText) && /\berkek\b/i.test(normText) && !/\bkadin\b/i.test(normText))
  ) {
    gender = 'Erkek';
  }

  // 2. Birth Date / Year Detection
  // Pattern A: "1993 (32 Yaş)" or "1993 (32 yas)"
  const ageMatch = text.match(/\b(19\d{2}|200\d)\s*\(\s*\d{1,2}\s*(?:yaş|yas|yaşında|yasinda)?\s*\)/i);
  if (ageMatch) {
    birthYear = parseInt(ageMatch[1], 10);
    birthDate = `${birthYear}-01-01`;
  }

  // Pattern B: "Doğum Tarihi: 15.05.1993" or "13-06-1996" or "1993"
  if (!birthDate) {
    const dobMatch = text.match(/(?:doğum\s*tarihi|dogum\s*tarihi|d\.tarihi|birth\s*date|dob)[\s:]*([0-3]?\d[./\-][0-1]?\d[./\-](?:19\d{2}|20\d{2})|(?:19\d{2}|20\d{2}))/i);
    if (dobMatch) {
      const rawDate = dobMatch[1];
      if (/^\d{4}$/.test(rawDate)) {
        birthYear = parseInt(rawDate, 10);
        birthDate = `${birthYear}-01-01`;
      } else {
        const parts = rawDate.split(/[./\-]/);
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          birthYear = parseInt(year, 10);
          birthDate = `${year}-${month}-${day}`;
        }
      }
    }
  }

  return { gender, birthDate, birthYear };
}

// ============================================================================
// 8. UNIFIED HIGH-ACCURACY DETERMINISTIC EXTRACTOR (CV EXTRACTION 2.0)
// ============================================================================

/**
 * Unrolls ASCII / Pipe-delimited tables into clean sequential columns
 * preserving column semantic integrity and reading order.
 */
export function unrollAsciiTableColumns(rawText: string): string {
  if (!rawText || !rawText.includes('|')) return rawText;

  const lines = rawText.split(/\r?\n/);
  const processedLines: string[] = [];
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length === 0) return;

    // Parse table rows
    const rows = tableBuffer
      .map((line) => {
        let trimmed = line.trim();
        if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
        if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
        return trimmed.split('|').map((c) => c.trim());
      })
      .filter((cols) => cols.some((c) => c.length > 0 && !/^[-=]+$/.test(c)));

    if (rows.length >= 2) {
      const entityHeaderIdx = rows.findIndex((row) => {
        const rowNorm = row.map((c) => normalizeTrForMatch(c));
        return (
          rowNorm.some((c) => c === 'sirket' || c === 'kurum' || c === 'firma' || c === 'company') &&
          rowNorm.some((c) => c === 'pozisyon' || c === 'rol' || c === 'unvan' || c === 'gorev' || c === 'role')
        );
      });

      if (entityHeaderIdx !== -1) {
        for (let r = 0; r < entityHeaderIdx; r++) {
          for (const cell of rows[r]) {
            if (cell) processedLines.push(cell);
          }
        }
        processedLines.push('DENEYİM');
        for (let r = entityHeaderIdx + 1; r < rows.length; r++) {
          const cells = rows[r].filter(Boolean);
          if (cells.length > 0) {
            processedLines.push(cells.join(' - '));
          }
        }
        processedLines.push('');
        tableBuffer = [];
        return;
      }

      const maxCols = Math.max(...rows.map((r) => r.length));
      if (maxCols >= 2) {
        for (let colIdx = 0; colIdx < maxCols; colIdx++) {
          const colCells = rows.map((r) => r[colIdx] || '').filter(Boolean);
          if (colCells.length > 0) {
            processedLines.push(...colCells);
            processedLines.push('');
          }
        }
        tableBuffer = [];
        return;
      }
    }

    processedLines.push(...tableBuffer);
    tableBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const isDivider = /^[-=+|]{3,}$/.test(trimmed);
    const isTableRow =
      trimmed.includes('|') && !trimmed.startsWith('http') && trimmed.split('|').length >= 2;

    if (isTableRow || (isDivider && tableBuffer.length > 0)) {
      tableBuffer.push(line);
    } else {
      flushTable();
      processedLines.push(line);
    }
  }

  flushTable();
  return processedLines.join('\n');
}

export function extractDeterministicCv(text: string, fileName?: string | null): AiCvExtractionPayload {
  const normalized = normalizeCvText(text || '');
  const unrolled = unrollAsciiTableColumns(normalized);
  const sanitizedText = unrolled
    .split(/\r?\n/)
    .map((l) => (l.length > 1000 ? l.slice(0, 1000) : l))
    .join('\n');
  const loc = extractDeterministicLocations(sanitizedText);
  const edu = extractDeterministicEducation(sanitizedText);
  const exp = extractDeterministicExperiences(sanitizedText);
  const skillsAndTools = extractDeterministicSkillsAndTools(sanitizedText);
  const langAndCerts = extractDeterministicLanguagesAndCerts(sanitizedText);
  const universalDemo = extractUniversalDemographics(sanitizedText, fileName);

  let totalYears = 0;
  for (const e of exp) {
    if (e.startYear && e.endYear) totalYears += Math.max(1, e.endYear - e.startYear);
  }
  const yearInText = text.match(/(\d{1,2})\s*yıllık/i);
  if (yearInText) totalYears = Math.max(totalYears, parseInt(yearInText[1], 10));

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
    fullName: universalDemo.fullName,
    gender: universalDemo.gender,
    birthDate: universalDemo.birthDate,
    email: universalDemo.email,
    phone: universalDemo.phone,
    linkedin: universalDemo.linkedin,
    website: universalDemo.website,
    nationality: universalDemo.nationality,
    address: universalDemo.address,
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
