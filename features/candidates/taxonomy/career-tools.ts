/**
 * Shared tools/programs catalog for İş Arıyorum and İşe Alıyorum.
 * Options are Turkish + global workplace software; "Diğer" opens manual entry.
 */
import { getPositionBundle, MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  adjacentFamilyBundles,
  buildOccupationalContext,
  familyCoreTools,
  officeToolSeeds,
  rankOccupationalOptions,
  type OccupationalProfileInput,
} from '@/features/candidates/taxonomy/occupational-context';
import { sortPopularThenAz } from '@/features/listings/lib/picker-sort';

const POPULAR_TOOLS = [
  'Excel',
  'Word',
  'PowerPoint',
  'Outlook',
  'Google Workspace',
  'Microsoft Teams',
  'Slack',
  'Zoom',
  'WhatsApp Business',
  'Notion',
  'Canva',
] as const;

const TOOLS_BY_THEME: Record<string, readonly string[]> = {
  yazilim: [
    'VS Code',
    'IntelliJ IDEA',
    'Git',
    'GitHub',
    'GitLab',
    'Bitbucket',
    'Postman',
    'Swagger',
    'Docker',
    'Kubernetes',
    'Jenkins',
    'Figma',
    'Jira',
    'Confluence',
    'Linear',
    'AWS',
    'Azure',
    'Google Cloud',
    'Terraform',
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'Redis',
    'Elasticsearch',
    'Android Studio',
    'Xcode',
  ],
  yapayzeka_veri: [
    'Python (Pandas / PyTorch)',
    'Jupyter Notebook',
    'SQL',
    'Power BI',
    'Tableau',
    'Snowflake',
    'Databricks',
    'Apache Spark',
    'Hugging Face',
    'LangChain',
    'Dbt',
    'Apache Airflow',
    'MLflow',
    'Elasticsearch',
    'Excel',
  ],
  finans: [
    'Bloomberg Terminal',
    'Matriks Finansal Terminal',
    'Foreks Trader',
    'Reuters / Refinitiv Eikon',
    'SAP FI / CO',
    'Logo Tiger / J-Platform',
    'Oracle Financials',
    'Power BI',
    'İleri Excel (VBA / Makro)',
    'SQL',
    'Finacle',
    'Temenos T24',
    'KKB / Findeks',
    'SWIFT',
    'Murex',
    'SPSS / R',
    'Paraşüt',
  ],
  muhasebe: [
    'Logo Tiger / GO 3',
    'Luca MMP',
    'Mikro Yazılım',
    'Zirve Yazılım',
    'ETA SQL',
    'Netsis ERP',
    'SAP ERP',
    'GİB E-Fatura / E-Defter',
    'İleri Excel (VBA / Makro)',
    'Dia ERP',
    'Paraşüt',
    'BizimHesap',
    'Datasoft',
    'Power BI',
  ],
  pazarlama: [
    'Google Ads',
    'Meta Ads Manager',
    'Google Analytics 4 (GA4)',
    'Google Search Console',
    'Google Tag Manager',
    'SEMrush',
    'Ahrefs',
    'HubSpot',
    'Mailchimp / Klaviyo',
    'Hotjar / Clarity',
    'Canva',
    'Buffer / Hootsuite',
    'TikTok Ads',
    'Adjust / AppsFlyer',
    'Figma',
    'Photoshop',
  ],
  tasarim: [
    'Figma',
    'Adobe Photoshop',
    'Adobe Illustrator',
    'Adobe Premiere Pro',
    'Adobe After Effects',
    'Adobe InDesign',
    'Adobe XD',
    'Blender',
    'DaVinci Resolve',
    'Canva',
    'Midjourney',
    'Cinema 4D',
    'Final Cut Pro',
    'Miro',
  ],
  ik: [
    'Kariyer.net İşveren',
    'LinkedIn Recruiter',
    'SAP SuccessFactors',
    'Kolay İK',
    'Logo J-HR / Bordro',
    'Workday',
    'BambooHR',
    'Peoplise',
    'Indeed İşveren',
    'TalentGuard',
    'Microsoft Teams',
    'Excel',
  ],
  satis: [
    'Salesforce CRM',
    'HubSpot CRM',
    'Zoho CRM',
    'Microsoft Dynamics 365',
    'Pipedrive',
    'Bitrix24',
    'WhatsApp Business API',
    'Power BI',
    'Excel (Satış Analitiği)',
    'LinkedIn Sales Navigator',
    'Logo CRM',
  ],
  cagri: [
    'Genesys Cloud',
    'AloTech',
    'Zendesk',
    'Freshdesk',
    'Avaya',
    '3CX',
    'Intercom',
    'LiveChat',
    'Salesforce Service Cloud',
    'Five9',
    'Excel',
  ],
  perakende: [
    'Nebim V3',
    'Trendyol Satıcı Paneli',
    'Hepsiburada Satıcı Paneli',
    'Amazon Seller Central',
    'Shopify',
    'Ticimax / İkas / IdeaSoft',
    'Logo POS',
    'Kasa / POS Sistemleri',
    'Barkod & Stok Takip',
    'Excel',
  ],
  lojistik: [
    'WMS (Depo Yönetim Sistemi)',
    'SAP MM / SD / WM',
    'Logo WMS',
    'Oracle SCM',
    'Soft İş Çözümleri',
    'U-ETDS Portalı',
    'Traklink / Filo Takip Sistemleri',
    'Descartes TMS',
    'E-İrsaliye',
    'MS Excel',
  ],
  uretim: [
    'AutoCAD',
    'SolidWorks',
    'CATIA',
    'Siemens NX',
    'ANSYS',
    'SAP PP / MM / QM',
    'Siemens TIA Portal (PLC)',
    'SCADA Sistemleri',
    'Mastercam',
    'Matlab & Simulink',
    'MES (Üretim Yürütme)',
    'Minitab',
    'MS Project / Primavera',
    'Excel',
  ],
  insaat: [
    'AutoCAD',
    'Autodesk Revit',
    'SketchUp',
    '3ds Max',
    'Lumion',
    'Graphisoft Archicad',
    'Primavera P6',
    'Microsoft Project',
    'Sta4CAD / SAP2000',
    'Rhino 3D',
    'V-Ray',
    'Navisworks',
    'Excel (Hakediş & Metraj)',
  ],
  saglik: [
    'HBYS (Hastane Bilgi Yönetim Sistemi)',
    'SGK Medula Portalı',
    'E-Nabız / E-Reçete',
    'Teletıp & PACS (Radyoloji)',
    'İlaç Takip Sistemi (İTS)',
    'Fonet / Probel / Sisoft',
    'SPSS İstatistik',
    'Excel',
    'Outlook',
  ],
  hukuk: [
    'UYAP Avukat Portalı',
    'Kazancı Hukuk Otomasyonu',
    'Lexpera Hukuk Bilgi Sistemi',
    'Corpus Mevzuat & İçtihat',
    'Synergy Hukuk Otomasyonu',
    'MS Word & Office',
    'E-İmza Uygulamaları',
    'Excel',
  ],
  turizm: [
    'Opera PMS',
    'ElektraWeb',
    'Sedna Otel Otomasyonu',
    'Fidelio',
    'HotelRunner',
    'Simpra POS',
    'SambaPOS',
    'Protel / Micros POS',
    'Amadeus / Sabre GDS',
    'Yemeksepeti / Trendyol Partner Panelleri',
    'Excel',
  ],
  egitim: [
    'Google Classroom',
    'Moodle',
    'Zoom & MS Teams',
    'MEBBİS & e-Okul',
    'EBA',
    'Canva for Education',
    'Kahoot & Mentimeter',
    'Akıllı Tahta Yazılımları',
    'Turnitin / İthenticate',
    'PowerPoint',
  ],
  yonetim: [
    'Power BI / Tableau',
    'Excel (Finansal & Stratejik Modelleme)',
    'SAP / ERP',
    'PowerPoint',
    'Jira / Asana / ClickUp',
    'Miro / Lucidchart',
    'Notion',
    'Slack / Teams',
  ],
  otomotiv: [
    'Otomotiv Arıza Tespit Cihazları / OBD',
    'DMS (Yetkili Servis Otomasyonu)',
    'Elektronik Parça Kataloğu',
    'AutoCAD',
    'Excel',
    'CRM',
  ],
  enerji: [
    'SCADA Sistemleri',
    'DCS Kontrol Yazılımları',
    'SAP PM / İş Emri Takip',
    'AutoCAD',
    'MS Project',
    'Excel',
  ],
  tarim: [
    'Sera & Sulama Otomasyon Sistemleri',
    'Çiftlik & Stok Kayıt Yazılımları',
    'SAP',
    'Excel',
    'WhatsApp Business',
  ],
};

function themeKeysForTools(sector: string, role: string): string[] {
  const hay = `${sector} ${role}`.toLocaleLowerCase('tr-TR');
  const keys: string[] = [];
  if (/yazılım|bilişim|geliştirici|devops|frontend|backend|full-stack|program|kod/.test(hay)) {
    keys.push('yazilim');
  }
  if (/veri|yapay zeka|ai|data|makine öğrenmesi|deep learning|bi|iş zekası/.test(hay)) {
    keys.push('yapayzeka_veri');
  }
  if (/çağrı|müşteri temsil|destek uzman|şikayet|helpdesk|servis masası/.test(hay)) keys.push('cagri');
  if (/satış|crm|ticaret|key account|ihracat|pazaryeri/.test(hay)) keys.push('satis');
  if (/finans|banka|mali|sigorta|kredi|hazine|portföy|yatırım|borsa|fon/.test(hay)) keys.push('finans');
  if (/muhasebe|mali müşavir|bordro|e-fatura|denetim|vergi/.test(hay)) keys.push('muhasebe');
  if (/sağlık|hemşire|doktor|hekim|eczane|hastane|klinik|tıbbi|radyoloji|laboratuvar|fizyoterapi/.test(hay)) keys.push('saglik');
  if (/eğitim|öğretmen|okul|akademi|kreş|öğretim|eğitmen/.test(hay)) keys.push('egitim');
  if (/pazarlama|reklam|sosyal medya|seo|sem|marka|halkla ilişkiler|içerik/.test(hay)) keys.push('pazarlama');
  if (/insan kaynak|işe alım|\\bik\\b|bordro|yetenek|özlük/.test(hay)) keys.push('ik');
  if (/perakende|mağaza|kasiyer|e-ticaret|satıcı|reyon/.test(hay)) keys.push('perakende');
  if (/turizm|otel|resepsiyon|host|havacılık|seyahat|acente|restoran|garson|aşçı|mutfak|barista/.test(hay)) keys.push('turizm');
  if (/lojistik|depo|kargo|kurye|sevkiyat|gümrük|denizcilik|tedarik zinciri|nakliye/.test(hay)) keys.push('lojistik');
  if (/üretim|sanayi|fabrika|tekstil|metal|ambalaj|mobilya|mühendis|makine|endüstri|otomasyon/.test(hay)) keys.push('uretim');
  if (/inşaat|mimar|şantiye|gayrimenkul|statik|hakediş|yapı/.test(hay)) keys.push('insaat');
  if (/tasarım|grafik|ui|ux|video|fotoğraf|prodüksiyon|kurgu|animasyon|3d/.test(hay)) keys.push('tasarim');
  if (/hukuk|avukat|uyap|dava|arabulucu|icra|mevzuat/.test(hay)) keys.push('hukuk');
  if (/oto servis|yetkili servis|otomotiv|hasar|tamir/.test(hay)) keys.push('otomotiv');
  if (/enerji|maden|çevre|elektrik|santral/.test(hay)) keys.push('enerji');
  if (/tarım|veteriner|ziraat|hayvancılık|sera/.test(hay)) keys.push('tarim');
  if (/holding|yönetim|müdür|direktör|ceo|danışman|strateji|koordinatör/.test(hay)) keys.push('yonetim');
  return Array.from(new Set(keys));
}

export function suggestTools(input: OccupationalProfileInput): string[] {
  const context = buildOccupationalContext(input);
  const bundle = getPositionBundle(context.role);
  const pool: Array<{ value: string; source: 'bundle' | 'adjacent' | 'theme' | 'office' | 'existing' }> = [];

  // 1. Position bundle tools
  for (const value of bundle?.technicalSkills ?? []) {
    pool.push({ value, source: 'bundle' });
  }

  // 2. Family Core Tools
  for (const value of familyCoreTools(context.family)) {
    pool.push({ value, source: 'bundle' });
  }

  // 3. Adjacent Family Tools
  if (context.adjacentStrength > 0) {
    for (const adjacent of adjacentFamilyBundles(context)) {
      for (const value of adjacent?.technicalSkills ?? []) {
        pool.push({ value, source: 'adjacent' });
      }
    }
  }

  // 4. Sector & Theme Tools (ALWAYS added for the sector & role context)
  const themes = themeKeysForTools(context.sector, context.role);
  for (const theme of themes) {
    for (const value of (TOOLS_BY_THEME[theme] ?? [])) {
      pool.push({ value, source: 'theme' });
    }
  }

  // 5. Office Workplace Tools
  for (const value of officeToolSeeds(context)) {
    pool.push({ value, source: 'office' });
  }

  // 6. User's existing tools
  for (const value of context.existingTools) {
    pool.push({ value, source: 'existing' });
  }

  const ranked = rankOccupationalOptions(pool, context, 'tools');
  const unique = ranked.length > 0 ? ranked : (themes.length > 0 ? (TOOLS_BY_THEME[themes[0]] ?? []) : officeToolSeeds(context));
  return [
    ...sortPopularThenAz(unique, POPULAR_TOOLS),
    MANUAL_OPTION,
  ];
}
