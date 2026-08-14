/**
 * Shared tools/programs catalog for İş Arıyorum and İşe Alıyorum.
 * Options are Turkish + global workplace software; "Diğer" opens manual entry.
 */
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
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

const CORE_TOOLS = [
  ...POPULAR_TOOLS,
  'Trello',
  'Asana',
  'Jira',
  'Confluence',
  'ClickUp',
  'Monday.com',
  'Google Meet',
  'Webex',
  'Telegram',
  'Miro',
  'Power BI',
  'SAP',
  'CRM',
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
  satis: [
    'Salesforce',
    'HubSpot',
    'Zoho CRM',
    'Bitrix24',
    'Pipedrive',
    'Excel',
    'Power BI',
  ],
  cagri: [
    'Genesys',
    'Avaya',
    '3CX',
    'AloTech',
    'Zendesk',
    'Freshdesk',
    'Intercom',
    'LiveChat',
    'Five9',
    'CRM',
    'Excel',
  ],
  finans: [
    'Logo Tiger',
    'Logo GO',
    'Mikro',
    'Luca',
    'ETA',
    'Dia',
    'Netsis',
    'SAP',
    'SAP FI',
    'Paraşüt',
    'BizimHesap',
    'e-Fatura',
    'e-Defter',
    'Findeks',
    'Excel',
    'Power BI',
  ],
  saglik: ['HIS', 'E-Nabız', 'Medula', 'PACS', 'Excel', 'Outlook'],
  egitim: ['EBA', 'MEBBİS', 'Google Classroom', 'Moodle', 'Zoom', 'Canva', 'PowerPoint'],
  pazarlama: [
    'Google Ads',
    'Meta Ads',
    'TikTok Ads',
    'Google Analytics',
    'Search Console',
    'Tag Manager',
    'Mailchimp',
    'HubSpot',
    'Hootsuite',
    'Buffer',
    'SEMrush',
    'Ahrefs',
    'Hotjar',
    'Canva',
    'Figma',
    'Photoshop',
  ],
  ik: [
    'Kolay İK',
    'Logo Bordro',
    'Workday',
    'SuccessFactors',
    'BambooHR',
    'LinkedIn Recruiter',
    'Excel',
    'Outlook',
    'Teams',
  ],
  perakende: [
    'Nebim',
    'Trendyol Satıcı Paneli',
    'Hepsiburada',
    'Amazon Seller',
    'Shopify',
    'Excel',
    'CRM',
    'Kasa / POS',
  ],
  turizm: [
    'Opera PMS',
    'Elektraweb',
    'HotelRunner',
    'Booking.com',
    'Amadeus',
    'Galileo',
    'Sabre',
    'Excel',
  ],
  lojistik: ['WMS', 'SAP', 'SAP MM', 'Excel', 'Outlook', 'TMS'],
  uretim: ['SAP', 'SAP PP', 'AutoCAD', 'SolidWorks', 'Excel', 'MS Project', 'Minitab'],
  insaat: [
    'AutoCAD',
    'Revit',
    'SketchUp',
    'ArchiCAD',
    'Navisworks',
    'MS Project',
    'Primavera',
    'Excel',
  ],
  tasarim: [
    'Figma',
    'Adobe XD',
    'Photoshop',
    'Illustrator',
    'InDesign',
    'After Effects',
    'Premiere Pro',
    'Blender',
    'Canva',
  ],
  hukuk: ['UYAP', 'Lexpera', 'Word', 'Excel', 'Outlook'],
  muhasebe: [
    'Logo Tiger',
    'Mikro',
    'Luca',
    'ETA',
    'Dia',
    'Netsis',
    'Paraşüt',
    'e-Fatura',
    'e-Defter',
    'Excel',
  ],
  otomotiv: ['DMS', 'AutoCAD', 'Excel', 'WhatsApp Business', 'CRM'],
  enerji: ['SAP', 'AutoCAD', 'MS Project', 'Excel'],
  tarim: ['Excel', 'WhatsApp Business', 'SAP'],
};

function themeKeysForTools(sector: string, role: string): string[] {
  const hay = `${sector} ${role}`.toLocaleLowerCase('tr-TR');
  const keys: string[] = [];
  if (/yazılım|bilişim|geliştirici|devops|frontend|backend|full-stack|veri|yapay zeka|oyun/.test(hay)) {
    keys.push('yazilim');
  }
  if (/çağrı|müşteri temsil|destek uzman|şikayet/.test(hay)) keys.push('cagri');
  if (/satış|müşteri|crm|ticaret/.test(hay)) keys.push('satis');
  if (/finans|banka|mali|sigorta|kredi/.test(hay)) keys.push('finans');
  if (/muhasebe|bordro|e-fatura/.test(hay)) keys.push('muhasebe');
  if (/sağlık|hemşire|doktor|eczane|hastane|klinik/.test(hay)) keys.push('saglik');
  if (/eğitim|öğretmen|okul|akademi|kreş/.test(hay)) keys.push('egitim');
  if (/pazarlama|reklam|sosyal medya|seo|marka|halkla ilişkiler/.test(hay)) keys.push('pazarlama');
  if (/insan kaynak|işe alım|ik |bordro/.test(hay)) keys.push('ik');
  if (/perakende|mağaza|kasiyer|e-ticaret/.test(hay)) keys.push('perakende');
  if (/turizm|otel|resepsiyon|host|havacılık/.test(hay)) keys.push('turizm');
  if (/lojistik|depo|kargo|kurye|sevkiyat|gümrük|denizcilik/.test(hay)) keys.push('lojistik');
  if (/üretim|sanayi|fabrika|tekstil|otomotiv|metal|ambalaj|mobilya/.test(hay)) keys.push('uretim');
  if (/inşaat|mimar|şantiye|gayrimenkul/.test(hay)) keys.push('insaat');
  if (/tasarım|grafik|ui|ux|video|fotoğraf|prodüksiyon/.test(hay)) keys.push('tasarim');
  if (/hukuk|avukat|uyap/.test(hay)) keys.push('hukuk');
  if (/oto servis|yetkili servis|otomotiv teknisyen/.test(hay)) keys.push('otomotiv');
  if (/enerji|maden|çevre/.test(hay)) keys.push('enerji');
  if (/tarım|veteriner/.test(hay)) keys.push('tarim');
  return Array.from(new Set(keys));
}

export function suggestTools(input: {
  sector?: string | null;
  role?: string | null;
}): string[] {
  const themed: string[] = [...CORE_TOOLS];
  for (const theme of themeKeysForTools(input.sector ?? '', input.role ?? '')) {
    themed.push(...(TOOLS_BY_THEME[theme] ?? []));
  }
  const unique = Array.from(new Set(themed.filter(Boolean)));
  return [
    ...sortPopularThenAz(unique, POPULAR_TOOLS),
    MANUAL_OPTION,
  ];
}
