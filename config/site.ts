import type {
  Category,
  DealScore,
  Provider,
  ProductModel,
  RiskLevel,
  ConditionGrade,
} from '@/types';

export const SITE = {
  name: 'İkinciBazar',
  domain: 'ikincibazar.com',
  tagline: 'İkinci el piyasaları için yapay zeka alış asistanı',
  version: '1.0.0',
  mode: 'private',
  city: 'İstanbul',
} as const;

export const OWNER_TOKEN = process.env.NEXT_PUBLIC_OWNER_TOKEN ?? 'demo-token';
export const OWNER_ROUTE = `/${OWNER_TOKEN}`;

export const PROVIDERS: Provider[] = [
  {
    id: 'letgo',
    name: 'Letgo',
    domain: 'letgo.com',
    color: '#FF5A5F',
    enabled: true,
  },
  {
    id: 'dolap',
    name: 'Dolap',
    domain: 'dolap.com',
    color: '#7B61FF',
    enabled: true,
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat-gaming',
    slug: 'gaming-consoles',
    name: 'Oyun Konsolları',
    description: 'PlayStation 5 ve Xbox Series',
    icon: 'Gamepad2',
  },
  {
    id: 'cat-controllers',
    slug: 'controllers',
    name: 'Kumandalar',
    description: 'DualSense ve Xbox controller',
    icon: 'Gamepad',
  },
];

export const PRODUCT_MODELS: ProductModel[] = [
  { id: 'pm-ps5', categoryId: 'cat-gaming', slug: 'playstation-5', name: 'PlayStation 5', brand: 'Sony', releaseYear: 2020, msrpTry: 24999, refPriceTry: 23500 },
  { id: 'pm-ps5-slim', categoryId: 'cat-gaming', slug: 'playstation-5-slim', name: 'PlayStation 5 Slim', brand: 'Sony', releaseYear: 2023, msrpTry: 21999, refPriceTry: 20800 },
  { id: 'pm-ps5-pro', categoryId: 'cat-gaming', slug: 'playstation-5-pro', name: 'PlayStation 5 Pro', brand: 'Sony', releaseYear: 2024, msrpTry: 32999, refPriceTry: 31500 },
  { id: 'pm-xbox-sx', categoryId: 'cat-gaming', slug: 'xbox-series-x', name: 'Xbox Series X', brand: 'Microsoft', releaseYear: 2020, msrpTry: 22999, refPriceTry: 21700 },
  { id: 'pm-xbox-ss', categoryId: 'cat-gaming', slug: 'xbox-series-s', name: 'Xbox Series S', brand: 'Microsoft', releaseYear: 2020, msrpTry: 12999, refPriceTry: 11900 },
  { id: 'pm-dualsense', categoryId: 'cat-controllers', slug: 'dualsense', name: 'Sony DualSense', brand: 'Sony', releaseYear: 2020, msrpTry: 2499, refPriceTry: 2200 },
  { id: 'pm-dualsense-edge', categoryId: 'cat-controllers', slug: 'dualsense-edge', name: 'Sony DualSense Edge', brand: 'Sony', releaseYear: 2023, msrpTry: 8999, refPriceTry: 8200 },
  { id: 'pm-xbox-controller', categoryId: 'cat-controllers', slug: 'xbox-wireless-controller', name: 'Xbox Wireless Controller (Series)', brand: 'Microsoft', releaseYear: 2020, msrpTry: 2499, refPriceTry: 2100 },
  { id: 'pm-xbox-elite-2', categoryId: 'cat-controllers', slug: 'xbox-elite-series-2', name: 'Xbox Elite Wireless Controller Series 2', brand: 'Microsoft', releaseYear: 2019, msrpTry: 6499, refPriceTry: 5800 },
];

export const PROVIDER_MAP = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, p]),
) as Record<Provider['id'], Provider>;

export const PRODUCT_MAP = Object.fromEntries(
  PRODUCT_MODELS.map((p) => [p.id, p]),
) as Record<string, ProductModel>;

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<string, Category>;

export const DEAL_SCORE_META: Record<
  DealScore,
  { label: string; tone: 'success' | 'primary' | 'warning' | 'danger' | 'muted'; description: string }
> = {
  excellent: { label: 'Mükemmel fırsat', tone: 'success', description: 'Piyasa fiyatının çok altında' },
  good: { label: 'İyi fırsat', tone: 'primary', description: 'Piyasanın biraz altında' },
  fair: { label: 'Adil fiyat', tone: 'muted', description: 'Piyasa ortalamasına yakın' },
  overpriced: { label: 'Pahalı', tone: 'warning', description: 'Piyasa fiyatının üstünde' },
  risky: { label: 'Riskli', tone: 'danger', description: 'Olası sahte veya dolandırıcılık' },
};

export const RISK_LEVEL_META: Record<
  RiskLevel,
  { label: string; tone: 'success' | 'warning' | 'danger' }
> = {
  low: { label: 'Düşük risk', tone: 'success' },
  medium: { label: 'Orta risk', tone: 'warning' },
  high: { label: 'Yüksek risk', tone: 'danger' },
};

export const CONDITION_META: Record<ConditionGrade, { label: string; tone: 'success' | 'primary' | 'muted' | 'warning' | 'danger' }> = {
  new: { label: 'Sıfır', tone: 'success' },
  'like-new': { label: 'Az kullanılmış', tone: 'primary' },
  good: { label: 'İyi', tone: 'muted' },
  fair: { label: 'Orta', tone: 'warning' },
  poor: { label: 'Kötü', tone: 'danger' },
};
