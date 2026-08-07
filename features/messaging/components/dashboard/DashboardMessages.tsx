'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardMessageCard } from '@/features/messaging/components/dashboard/DashboardMessageCard';
import { DashboardMessagesEmpty } from '@/features/messaging/components/dashboard/DashboardMessagesEmpty';
import { DashboardMessageThread } from '@/features/messaging/components/dashboard/DashboardMessageThread';
import { useDashboardConversations } from '@/features/messaging/hooks/use-dashboard-conversations';
import {
  DASHBOARD_MESSAGES_TABS,
  type DashboardMessagesTab,
} from '@/features/messaging/types/dashboard-messages.types';
import type { ConversationId } from '@/lib/domain/ids';
import { cn } from '@/lib/utils';

const TAB_EMPTY: Record<
  DashboardMessagesTab,
  { title: string; description: string }
> = {
  inbox: {
    title: 'Henüz bir mesajınız bulunmuyor.',
    description:
      'İlgilendiğiniz ilanlar hakkında ilan sahipleriyle iletişime geçebilirsiniz.',
  },
  sent: {
    title: 'Okunan konuşma yok.',
    description:
      'Okuduğunuz veya yanıt verdiğiniz konuşmalar burada listelenir.',
  },
  archive: {
    title: 'Henüz bir mesajınız bulunmuyor.',
    description:
      'Arşivlediğiniz konuşmalar burada listelenir. İlgilendiğiniz ilanlar hakkında iletişime geçebilirsiniz.',
  },
};

export function DashboardMessages() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('c');

  const [tab, setTab] = useState<DashboardMessagesTab>('inbox');
  const {
    isLoading,
    error,
    busyId,
    refresh,
    itemsForTab,
    counts,
    archiveConversation,
    deleteConversation,
    blockUser,
    reportUser,
    markLocalSent,
  } = useDashboardConversations();

  const items = useMemo(() => itemsForTab(tab), [itemsForTab, tab]);

  useEffect(() => {
    if (!selectedId) return;
    const inInbox = itemsForTab('inbox').some((item) => item.id === selectedId);
    const inSent = itemsForTab('sent').some((item) => item.id === selectedId);
    const inArchive = itemsForTab('archive').some((item) => item.id === selectedId);
    if (inArchive) setTab('archive');
    else if (inSent && !inInbox) setTab('sent');
  }, [selectedId, itemsForTab]);

  function selectConversation(id: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('c', id);
    else params.delete('c');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  async function handleDelete(id: string) {
    await deleteConversation(id);
    if (selectedId === id) selectConversation(null);
  }

  async function handleArchive(id: string) {
    await archiveConversation(id);
    if (selectedId === id) selectConversation(null);
  }

  async function handleBlock(id: string) {
    await blockUser(id);
    if (selectedId === id) selectConversation(null);
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Mesajlar yüklenemedi
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-5 rounded-2xl"
          onClick={() => void refresh()}
        >
          Yeniden dene
        </Button>
      </div>
    );
  }

  const empty = TAB_EMPTY[tab];
  const showThread = Boolean(selectedId);

  return (
    <div className="space-y-5">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as DashboardMessagesTab);
          selectConversation(null);
        }}
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/40 p-1.5 dark:bg-white/[0.04]">
          {DASHBOARD_MESSAGES_TABS.map((item) => {
            const Icon = item.icon;
            const count = counts[item.id];
            return (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="gap-2 rounded-xl px-3 py-2.5 text-sm data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                    count > 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {DASHBOARD_MESSAGES_TABS.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-5">
            {isLoading ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[132px] animate-pulse rounded-2xl bg-muted/70"
                    />
                  ))}
                </div>
                <div className="hidden h-[520px] animate-pulse rounded-2xl bg-muted/50 lg:block" />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
                <div
                  className={cn(
                    'space-y-3',
                    showThread ? 'hidden lg:block' : 'block',
                  )}
                >
                  {items.length === 0 ? (
                    <DashboardMessagesEmpty
                      title={empty.title}
                      description={empty.description}
                    />
                  ) : (
                    items.map((message) => (
                      <DashboardMessageCard
                        key={message.id}
                        item={message}
                        active={selectedId === message.id}
                        busy={busyId === message.id}
                        onOpen={() => selectConversation(message.id)}
                        onArchive={() => void handleArchive(message.id)}
                        onDelete={() => void handleDelete(message.id)}
                        onBlock={() => void handleBlock(message.id)}
                        onReport={() => void reportUser(message.otherUserId)}
                      />
                    ))
                  )}
                </div>

                <div
                  className={cn(
                    'min-h-[420px] lg:min-h-[560px]',
                    showThread ? 'block' : 'hidden lg:block',
                  )}
                >
                  {selectedId ? (
                    <DashboardMessageThread
                      conversationId={selectedId as ConversationId}
                      onBack={() => selectConversation(null)}
                      onSent={() => markLocalSent(selectedId)}
                    />
                  ) : (
                    <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 text-center dark:border-white/10 lg:min-h-[560px]">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <MessageSquare className="h-6 w-6" aria-hidden />
                      </div>
                      <p className="mt-4 font-display text-base font-semibold text-foreground">
                        Bir konuşma seçin
                      </p>
                      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                        Sol listeden bir mesaj açarak sohbet geçmişini
                        görüntüleyebilir ve yanıt yazabilirsiniz.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
