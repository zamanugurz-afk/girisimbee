/**
 * Girisimbee listing detail mock data (UI view model).
 * Source of truth for demo listing pages at /ilan/[id].
 */
import type { ListingDetail } from '@/features/listings/types/listing.types';

const AI_CRM: ListingDetail = {
  id: 'ai-crm-platform',
  category: { id: 'invest', label: 'Yatırım Arıyorum', accent: '#22C55E' },
  title: 'AI CRM Platformu',
  shortDescription:
    'Yapay zeka destekli CRM ile satış ekiplerinin verimliliğini 3 katına çıkarın.',
  longDescription: `PayFlow AI, B2B satış ekipleri için tasarlanmış yapay zeka destekli bir CRM platformudur. Geleneksel CRM sistemlerinin aksine, PayFlow otomatik lead skorlama, tahmine dayalı pipeline yönetimi ve kişiselleştirilmiş outreach önerileri sunar.

Platform şu anda 120+ aktif kullanıcıya sahip ve aylık %18 organik büyüme gösteriyor. MRR 340.000 TL seviyesinde ve net revenue retention %112.

Yatırım, ürün geliştirme ekibini genişletmek, enterprise satış kanalını kurmak ve Avrupa pazarına açılmak için kullanılacak. Mevcut ekip 8 kişiden oluşuyor — 4 mühendis, 2 satış, 1 tasarım, 1 operasyon.`,
  location: 'İstanbul, Türkiye',
  publishedAt: '28 Temmuz 2026',
  views: 1248,
  interestedCount: 34,
  verified: true,
  emoji: '💰',
  listingIconKey: 'investment',
  tags: ['SaaS', 'B2B', 'Yapay Zeka', 'CRM', 'Series A'],
  investment: {
    requested: '5.000.000 TL',
    equity: '%12–15',
    stage: 'Series A',
    industry: 'Yazılım / SaaS',
    companyAge: '2 yıl',
    website: 'payflow.ai',
  },
  company: {
    name: 'PayFlow AI',
    emoji: '🏢',
    city: 'İstanbul',
    website: 'payflow.ai',
    employees: '8–15',
    founded: '2024',
    summary:
      'B2B satış ekipleri için yapay zeka destekli CRM. 120+ aktif kullanıcı, 340K TL MRR.',
  },
  attachments: [
    { id: 'a1', name: 'Pitch Deck', type: 'pdf', meta: 'PDF · 2.4 MB' },
    { id: 'a2', name: 'Business Plan', type: 'pdf', meta: 'PDF · 1.8 MB' },
    { id: 'a3', name: 'Demo Video', type: 'video', meta: '3:42' },
    { id: 'a4', name: 'Finansal Projeksiyon', type: 'pdf', meta: 'PDF · 890 KB' },
  ],
  gallery: [
    { id: 'g1', label: 'Dashboard', emoji: '📊' },
    { id: 'g2', label: 'Pipeline', emoji: '📈' },
    { id: 'g3', label: 'AI Insights', emoji: '🤖' },
    { id: 'g4', label: 'Mobile App', emoji: '📱' },
  ],
  timeline: [
    { id: 't1', date: 'Mart 2024', title: 'Şirket kuruldu', description: 'İstanbul\'da 2 kurucu ile başladı.' },
    { id: 't2', date: 'Haziran 2024', title: 'MVP lansmanı', description: 'İlk 10 beta müşteri onboard edildi.' },
    { id: 't3', date: 'Aralık 2024', title: 'Pre-seed turu', description: '1.2M TL pre-seed yatırım alındı.' },
    { id: 't4', date: 'Mayıs 2026', title: '120+ aktif kullanıcı', description: 'MRR 340K TL\'ye ulaştı.' },
    { id: 't5', date: 'Temmuz 2026', title: 'Series A turu açıldı', description: '5M TL yatırım aranıyor.' },
  ],
  owner: {
    name: 'Kerem Yılmaz',
    role: 'Kurucu & CEO',
    initials: 'KY',
    verified: true,
    memberSince: 'Mart 2024',
  },
  publisher: {
    type: 'user',
    name: 'Kerem Yılmaz',
    avatarUrl: null,
    initials: 'KY',
    verified: true,
    trust: { user: true, company: false, investor: false },
    href: '#',
    subtitle: 'Kurucu & CEO',
  },
  activity: [
    { id: 'act1', text: 'Elif K. ilgilendi', time: '12 dk önce' },
    { id: 'act2', text: 'Pitch deck indirildi', time: '1 sa önce' },
    { id: 'act3', text: 'Marcus C. ilgilendi', time: '3 sa önce' },
    { id: 'act4', text: 'İlan görüntülendi · +48', time: 'Bugün' },
  ],
  similar: [
    { id: 'logichain', emoji: '💰', listingIconKey: 'investment', title: 'LogiChain', location: 'Ankara', detail: '2.5M TL · Seed', tag: 'Logistics' },
    { id: 'eduverse', emoji: '💰', listingIconKey: 'investment', title: 'EduVerse', location: 'İzmir', detail: '800K TL · Pre-seed', tag: 'EdTech' },
    { id: 'secureid', emoji: '💰', listingIconKey: 'investment', title: 'SecureID', location: 'İstanbul', detail: '3M TL · Seed', tag: 'CyberSec' },
    { id: 'farmsense', emoji: '💰', listingIconKey: 'investment', title: 'FarmSense', location: 'Konya', detail: '1.2M TL · Pre-seed', tag: 'AgTech' },
  ],
};

const LISTINGS: Record<string, ListingDetail> = {
  'ai-crm-platform': AI_CRM,
  'inv-1': AI_CRM,
  'inv-2': {
    ...AI_CRM,
    id: 'logichain',
    title: 'LogiChain',
    emoji: '📦',
    shortDescription: 'Tedarik zinciri optimizasyonu için AI platformu.',
    investment: { ...AI_CRM.investment, requested: '2.500.000 TL', stage: 'Seed' },
    company: { ...AI_CRM.company, name: 'LogiChain', emoji: '📦', city: 'Ankara' },
    similar: AI_CRM.similar.filter((s) => s.id !== 'logichain'),
  },
  'inv-3': {
    ...AI_CRM,
    id: 'eduverse',
    title: 'EduVerse',
    emoji: '📚',
    shortDescription: 'Kişiselleştirilmiş online eğitim platformu.',
    investment: { ...AI_CRM.investment, requested: '800.000 TL', stage: 'Pre-seed' },
    company: { ...AI_CRM.company, name: 'EduVerse', emoji: '📚', city: 'İzmir' },
    similar: AI_CRM.similar.filter((s) => s.id !== 'eduverse'),
  },
  'inv-4': {
    ...AI_CRM,
    id: 'secureid',
    title: 'SecureID',
    emoji: '🔐',
    shortDescription: 'Kurumsal kimlik doğrulama altyapısı.',
    investment: { ...AI_CRM.investment, requested: '3.000.000 TL', stage: 'Seed' },
    company: { ...AI_CRM.company, name: 'SecureID', emoji: '🔐' },
    similar: AI_CRM.similar.filter((s) => s.id !== 'secureid'),
  },
  logichain: {
    ...AI_CRM,
    id: 'logichain',
    title: 'LogiChain',
    emoji: '📦',
    shortDescription: 'Tedarik zinciri optimizasyonu için AI platformu.',
    investment: { ...AI_CRM.investment, requested: '2.500.000 TL', stage: 'Seed' },
    company: { ...AI_CRM.company, name: 'LogiChain', emoji: '📦', city: 'Ankara' },
    similar: AI_CRM.similar.filter((s) => s.id !== 'logichain'),
  },
  eduverse: {
    ...AI_CRM,
    id: 'eduverse',
    title: 'EduVerse',
    emoji: '📚',
    shortDescription: 'Kişiselleştirilmiş online eğitim platformu.',
    investment: { ...AI_CRM.investment, requested: '800.000 TL', stage: 'Pre-seed' },
    company: { ...AI_CRM.company, name: 'EduVerse', emoji: '📚', city: 'İzmir' },
    similar: AI_CRM.similar.filter((s) => s.id !== 'eduverse'),
  },
  secureid: {
    ...AI_CRM,
    id: 'secureid',
    title: 'SecureID',
    emoji: '🔐',
    shortDescription: 'Kurumsal kimlik doğrulama altyapısı.',
    investment: { ...AI_CRM.investment, requested: '3.000.000 TL', stage: 'Seed' },
    company: { ...AI_CRM.company, name: 'SecureID', emoji: '🔐' },
    similar: AI_CRM.similar.filter((s) => s.id !== 'secureid'),
  },
  farmsense: {
    ...AI_CRM,
    id: 'farmsense',
    title: 'FarmSense',
    emoji: '🌾',
    shortDescription: 'Akıllı tarım sensörleri ve analitik platformu.',
    investment: { ...AI_CRM.investment, requested: '1.200.000 TL', stage: 'Pre-seed' },
    company: { ...AI_CRM.company, name: 'FarmSense', emoji: '🌾', city: 'Konya' },
    similar: AI_CRM.similar.filter((s) => s.id !== 'farmsense'),
  },
};

export function hasListing(id: string): boolean {
  return id in LISTINGS || id.startsWith('demo-');
}

export function getListingById(id: string): ListingDetail | undefined {
  return LISTINGS[id];
}

export function getAllListingIds(): string[] {
  return Object.keys(LISTINGS);
}

export function listingHref(id: string): string {
  return `/ilan/${id}`;
}

export const LISTING_DETAIL_MOCKS = LISTINGS;
