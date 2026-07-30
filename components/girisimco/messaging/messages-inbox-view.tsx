'use client';

import { useConversations } from '@/features/messaging/hooks/use-conversations';
import { MarketplaceEmptyState } from '@/components/girisimco/marketplace/marketplace-empty-state';
import { ConversationListItemRow } from '@/components/girisimco/messaging/conversation-list-item';
import { Button } from '@/components/ui/button';

export function MessagesInboxView() {
  const { items, isLoading, isLoadingMore, hasMore, error, loadMore } = useConversations();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-xl bg-muted/80" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <MarketplaceEmptyState
        variant="messages"
        title="Henüz konuşmanız yok."
        description="Bir ilan üzerinden iletişime geçtiğinizde konuşmalar burada görünecek."
        cta={{ label: 'İlanları Keşfet', href: '/kesfet' }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ConversationListItemRow key={item.conversation.id} item={item} />
      ))}
      {hasMore && (
        <div className="pt-2 text-center">
          <Button variant="outline" size="sm" disabled={isLoadingMore} onClick={loadMore}>
            {isLoadingMore ? 'Yükleniyor…' : 'Daha fazla'}
          </Button>
        </div>
      )}
    </div>
  );
}
