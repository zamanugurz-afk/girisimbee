import {
  Gamepad2,
  Watch,
  LayoutDashboard,
  Search,
  ShoppingBag,
  Tag,
  BarChart3,
  Bell,
  Settings,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Zap,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import { OWNER_ROUTE } from '@/config/site';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const BASE = OWNER_ROUTE;

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: 'Genel Bakış',
    items: [
      { label: 'Panel', href: `${BASE}`, icon: LayoutDashboard, description: 'Piyasa nabzı ve fırsat akışı' },
      { label: 'Fırsat Akışı', href: `${BASE}/deals`, icon: Sparkles, description: 'Şu anki en iyi fırsatlar', badge: 'AI' },
    ],
  },
  {
    id: 'discover',
    label: 'Keşfet',
    items: [
      { label: 'Tüm İlanlar', href: `${BASE}/listings`, icon: Search, description: 'Her ilanı tara ve filtrele' },
      { label: 'Ürünler', href: `${BASE}/products`, icon: Tag, description: 'Takip edilen ürün modelleri' },
      { label: 'Kategoriler', href: `${BASE}/categories`, icon: ShoppingBag, description: 'Oyun konsolları, saatler ve daha fazlası' },
      { label: 'Favoriler', href: `${BASE}/favorites`, icon: Heart, description: 'Kaydettiğiniz ilanlar' },
    ],
  },
  {
    id: 'insights',
    label: 'Analiz',
    items: [
      { label: 'Analitik', href: `${BASE}/analytics`, icon: BarChart3, description: 'Fiyat eğilimleri ve piyasa istatistikleri' },
      { label: 'Alarmlar', href: `${BASE}/alerts`, icon: Bell, description: 'Fiyat düşüşü ve fırsat bildirimleri' },
    ],
  },
  {
    id: 'system',
    label: 'Sistem',
    items: [
      { label: 'Kaynaklar', href: `${BASE}/sources`, icon: Zap, description: 'Sağlayıcılar ve senkron durumu' },
      { label: 'Ayarlar', href: `${BASE}/settings`, icon: Settings, description: 'Uygulama tercihleri' },
    ],
  },
];

export const ICON_MAP: Record<string, LucideIcon> = {
  Gamepad2,
  Watch,
};

export const QUICK_ACTIONS = [
  { label: 'Fırsat akışını gör', href: `${BASE}/deals`, icon: Sparkles },
  { label: 'İlanlara göz at', href: `${BASE}/listings`, icon: Search },
  { label: 'Analitiği kontrol et', href: `${BASE}/analytics`, icon: BarChart3 },
  { label: 'Fiyat düşüşleri', href: `${BASE}/alerts`, icon: TrendingDown },
  { label: 'Güven ve risk', href: `${BASE}/settings`, icon: ShieldCheck },
];
