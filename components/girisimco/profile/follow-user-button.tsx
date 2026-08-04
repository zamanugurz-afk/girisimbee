'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { loginUrl } from '@/features/authentication/constants/routes';
import { getProfileService } from '@/lib/persistence/container';
import type { UserId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

interface FollowUserButtonProps {
  targetUserId: string;
  initialFollowing?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'outline' | 'default' | 'secondary' | 'ghost';
  onFollowChange?: (following: boolean) => void;
}

/**
 * Persist follow/unfollow for a marketplace user via marketplace_follows.
 */
export function FollowUserButton({
  targetUserId,
  initialFollowing = false,
  className,
  size = 'default',
  variant = 'outline',
  onFollowChange,
}: FollowUserButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setFollowing(initialFollowing);
  }, [initialFollowing]);

  useEffect(() => {
    if (!user?.id || user.id === targetUserId) return;
    let cancelled = false;
    (async () => {
      try {
        const isFollowing = await getProfileService().isFollowing(
          user.id as UserId,
          targetUserId as UserId,
        );
        if (!cancelled) setFollowing(isFollowing);
      } catch {
        // Keep initialFollowing on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, targetUserId]);

  if (user?.id && user.id === targetUserId) {
    return null;
  }

  function handleClick() {
    if (!user) {
      router.push(
        loginUrl(
          typeof window !== 'undefined' ? window.location.pathname : '/dashboard/takipcilerim',
        ),
      );
      return;
    }

    startTransition(async () => {
      const service = getProfileService();
      const next = !following;
      try {
        if (next) {
          await service.follow(user.id as UserId, targetUserId as UserId);
          toast.success('Takip edildi');
        } else {
          await service.unfollow(user.id as UserId, targetUserId as UserId);
          toast.success('Takip bırakıldı');
        }
        setFollowing(next);
        onFollowChange?.(next);
        router.refresh();
      } catch {
        toast.error('Takip işlemi başarısız');
      }
    });
  }

  return (
    <Button
      type="button"
      variant={following ? 'secondary' : variant}
      size={size}
      disabled={pending}
      className={cn('rounded-2xl', className)}
      onClick={handleClick}
      aria-pressed={following}
    >
      {following ? (
        <UserCheck className="mr-2 h-4 w-4" aria-hidden />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" aria-hidden />
      )}
      {following ? 'Takip ediliyor' : 'Takip et'}
    </Button>
  );
}
