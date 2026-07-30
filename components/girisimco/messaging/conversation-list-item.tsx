import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import type { ConversationListItem } from '@/features/messaging/types/messaging-view.types';
import { timeAgo, initials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ConversationListItemRowProps {
  item: ConversationListItem;
  active?: boolean;
}

export function ConversationListItemRow({ item, active }: ConversationListItemRowProps) {
  const { conversation, otherParticipant, companyName, unreadCount } = item;
  const preview = conversation.lastMessagePreview ?? 'Henüz mesaj yok';
  const activity = conversation.lastMessageAt ?? conversation.createdAt;

  return (
    <Link
      href={`/mesajlar/${conversation.id}`}
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
        active
          ? 'border-primary/10 bg-muted/40 dark:border-white/20 dark:bg-white/[0.04]'
          : 'border-border/80 bg-white hover:bg-muted/40 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.03]',
      )}
    >
      <Avatar className="h-11 w-11 shrink-0">
        {otherParticipant.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={otherParticipant.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <AvatarFallback className="text-xs font-semibold">
            {initials(otherParticipant.displayName)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {otherParticipant.displayName}
            </p>
            <VerifiedBadgeGroup
              user={otherParticipant.userVerified}
              company={otherParticipant.companyVerified}
              investor={otherParticipant.investorVerified}
            />
            {companyName && (
              <p className="truncate text-xs text-muted-foreground">{companyName}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-[11px] text-muted-foreground">{timeAgo(activity)}</span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white dark:bg-white dark:text-primary-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{preview}</p>
      </div>
    </Link>
  );
}
