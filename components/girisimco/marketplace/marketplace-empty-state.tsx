import {
  Building2,
  Heart,
  LayoutList,
  MessageSquare,
  Newspaper,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { GcEmptyState } from '@/components/girisimco/ui/gc-empty-state';
import { cn } from '@/lib/utils';

export type MarketplaceEmptyVariant =
  | 'listings'
  | 'investors'
  | 'companies'
  | 'favorites'
  | 'messages'
  | 'stories'
  | 'blog'
  | 'activity';

const PRESETS: Record<
  MarketplaceEmptyVariant,
  {
    icon: LucideIcon;
    title: string;
    description: string;
    cta?: { label: string; href: string };
  }
> = {
  listings: {
    icon: LayoutList,
    title: 'Henüz ilan bulunmuyor.',
    description: 'Yayınlanan ilanlar burada listelenecek.',
    cta: { label: 'İlk İlanı Oluştur', href: '/ilan/olustur' },
  },
  investors: {
    icon: TrendingUp,
    title: 'Henüz yatırımcı profili yok.',
    description: 'Yatırımcılar katıldıkça burada görünecek.',
  },
  companies: {
    icon: Building2,
    title: 'Henüz şirket profili yok.',
    description: 'Kayıtlı şirketler burada listelenecek.',
  },
  favorites: {
    icon: Heart,
    title: 'Henüz favori ilanınız yok.',
    description: 'Beğendiğiniz ilanları kaydedin, buradan takip edin.',
    cta: { label: 'İlanları Keşfet', href: '/kesfet' },
  },
  messages: {
    icon: MessageSquare,
    title: 'Henüz mesajınız yok.',
    description: 'İlan sahipleriyle iletişime geçtiğinizde mesajlar burada görünecek.',
    cta: { label: 'İlanları Keşfet', href: '/kesfet' },
  },
  stories: {
    icon: Sparkles,
    title: 'Henüz başarı hikayesi yok.',
    description: 'Platformdaki eşleşmeler burada paylaşılacak.',
  },
  blog: {
    icon: Newspaper,
    title: 'Henüz blog yazısı yok.',
    description: 'Yakında rehber ve içerikler burada yayınlanacak.',
  },
  activity: {
    icon: LayoutList,
    title: 'Henüz aktivite yok.',
    description: 'İlan etkileşimleri burada görünecek.',
  },
};

interface MarketplaceEmptyStateProps {
  variant: MarketplaceEmptyVariant;
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
  className?: string;
  compact?: boolean;
}

export function MarketplaceEmptyState({
  variant,
  title,
  description,
  cta,
  className,
  compact,
}: MarketplaceEmptyStateProps) {
  const preset = PRESETS[variant];

  return (
    <GcEmptyState
      icon={preset.icon}
      title={title ?? preset.title}
      description={description ?? preset.description}
      cta={cta ?? preset.cta}
      compact={compact}
      className={cn(className)}
    />
  );
}
