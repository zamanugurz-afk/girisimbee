'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ConversationId } from '@/lib/domain/ids';
import { useConversationMessages } from '@/features/messaging/hooks/use-conversation-messages';
import { MessageBubble, TypingIndicatorPlaceholder } from '@/components/girisimco/messaging/message-bubble';
import { MessageComposer } from '@/components/girisimco/messaging/message-composer';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';

interface ConversationThreadViewProps {
  conversationId: ConversationId;
}

export function ConversationThreadView({ conversationId }: ConversationThreadViewProps) {
  const {
    messages,
    meta,
    isLoading,
    isLoadingMore,
    isSending,
    hasMore,
    error,
    loadOlder,
    sendMessage,
    userId,
  } = useConversationMessages(conversationId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  useEffect(() => {
    if (messages.length > prevCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: prevCount.current === 0 ? 'auto' : 'smooth' });
    }
    prevCount.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (el!.scrollTop < 80 && hasMore && !isLoadingMore) loadOlder();
    }
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [hasMore, isLoadingMore, loadOlder]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center gap-3 border-b border-border/80 px-4 py-3 dark:border-white/10">
        <Button asChild variant="ghost" size="icon" className="shrink-0 rounded-lg">
          <Link href="/mesajlar" aria-label="Geri">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        {meta && (
          <>
            <Avatar className="h-9 w-9">
              {meta.otherParticipant.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.otherParticipant.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="text-xs">
                  {initials(meta.otherParticipant.displayName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-foreground">
                  {meta.otherParticipant.displayName}
                </p>
                <VerifiedBadgeGroup
                  user={meta.otherParticipant.userVerified}
                  company={meta.otherParticipant.companyVerified}
                  investor={meta.otherParticipant.investorVerified}
                />
              </div>
              <Link
                href={`/ilan/${meta.listingSlug}`}
                className="truncate text-xs text-muted-foreground hover:text-foreground dark:hover:text-white"
              >
                {meta.listingTitle}
                {meta.companyName ? ` · ${meta.companyName}` : ''}
              </Link>
            </div>
          </>
        )}
      </div>

      {meta?.listingTitle ? (
        <p className="border-b border-border/60 bg-muted/30 px-4 py-2 text-xs text-muted-foreground dark:border-white/10">
          Bu görüşme, ilan üzerinden gönderilen iletişim talebi sonucunda oluşturuldu.
        </p>
      ) : null}

      {error && (
        <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isLoadingMore && (
          <p className="mb-3 text-center text-xs text-muted-foreground">Eski mesajlar yükleniyor…</p>
        )}
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isOwn={message.senderId === userId} />
          ))}
        </div>
        <TypingIndicatorPlaceholder userId={meta?.otherParticipant.userId} />
        <div ref={bottomRef} />
      </div>

      <MessageComposer onSend={sendMessage} disabled={isSending || !meta} />
    </div>
  );
}
