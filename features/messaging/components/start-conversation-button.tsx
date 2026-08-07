'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { useStartConversation } from '@/features/messaging/hooks/use-conversation-messages';
import { pushConversationStartedFeedback } from '@/features/messaging/lib/messaging-ux-feedback';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { cn } from '@/lib/utils';

interface StartConversationButtonProps {
  listingId: string;
  ownerUserId: string;
  label?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
  fullWidth?: boolean;
  listingTitle?: string;
}

export function StartConversationButton({
  listingId,
  ownerUserId,
  label = 'İletişime Geç',
  className,
  size = 'lg',
  variant = 'default',
  fullWidth,
  listingTitle,
}: StartConversationButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { start, isStarting, isAuthenticated } = useStartConversation();

  if (user?.id === ownerUserId) return null;

  async function handleClick() {
    if (!isAuthenticated) {
      router.push(AUTH_ROUTES.login);
      return;
    }
    try {
      const conversationId = await start(listingId, ownerUserId);
      if (conversationId) {
        pushConversationStartedFeedback({
          conversationId,
          listingTitle,
        });
        router.push(`${DASHBOARD_ROUTES.mesajlarim}?c=${conversationId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Konuşma başlatılamadı');
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={isStarting}
      onClick={handleClick}
      className={cn(
        variant === 'default' &&
          'bg-primary text-white hover:bg-primary/90 dark:bg-white dark:text-primary-foreground',
        fullWidth && 'w-full',
        size === 'lg' && 'h-12 rounded-xl text-sm font-medium',
        className,
      )}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {isStarting ? 'Açılıyor…' : label}
    </Button>
  );
}
