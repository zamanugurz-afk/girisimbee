'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFavoritesContext } from '@/features/favorites/providers/favorites-provider';
import {
  pushFavoriteAddedFeedback,
  pushFavoriteRemovedFeedback,
} from '@/features/favorites/lib/favorite-ux-feedback';
import type { ListingId } from '@/lib/domain/ids';
import { loginUrl } from '@/features/authentication/constants/routes';

interface FavoriteButtonProps {
  listingId?: ListingId;
  className?: string;
  /** Optional listing title used in favorite UX feedback. */
  title?: string;
}

export function FavoriteButton({ listingId, className, title }: FavoriteButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isFavorited, toggleFavorite } = useFavoritesContext();

  if (!listingId) return null;

  const favorited = isFavorited(listingId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(
        loginUrl(
          typeof window !== 'undefined' ? window.location.pathname : '/dashboard/favorilerim',
        ),
      );
      return;
    }

    try {
      const nowFavorited = await toggleFavorite(listingId);
      if (nowFavorited) {
        pushFavoriteAddedFeedback({ listingId, title });
      } else {
        pushFavoriteRemovedFeedback();
      }
    } catch {
      // Provider/service already surfaces failures; keep button silent on throw
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-full border border-border/80 bg-white/90 text-muted-foreground transition-colors hover:text-[#EF4444] dark:border-white/10 dark:bg-background/80',
        favorited && 'text-[#EF4444] border-[#FECACA] bg-[#FEF2F2]',
        className,
      )}
    >
      <Heart className={cn('h-3.5 w-3.5', favorited && 'fill-current')} />
    </button>
  );
}
