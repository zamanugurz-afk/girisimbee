'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import type { ConversationId } from '@/lib/domain/ids';
import { useConversationMessages } from '@/features/messaging/hooks/use-conversation-messages';
import {
  markConversationAsSent,
  pushMessageSentFeedback,
} from '@/features/messaging/lib/messaging-ux-feedback';
import {
  MessageBubble,
  TypingIndicatorPlaceholder,
} from '@/components/girisimco/messaging/message-bubble';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { initials } from '@/lib/utils';

export function DashboardMessageThread({
  conversationId,
  onBack,
  onSent,
}: {
  conversationId: ConversationId;
  onBack?: () => void;
  onSent?: () => void;
}) {
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

  const [body, setBody] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  useEffect(() => {
    if (messages.length > prevCount.current) {
      bottomRef.current?.scrollIntoView({
        behavior: prevCount.current === 0 ? 'auto' : 'smooth',
      });
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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || isSending || !meta) return;
    const result = await sendMessage(body.trim(), []);
    if (result) {
      setBody('');
      markConversationAsSent(conversationId);
      pushMessageSentFeedback();
      onSent?.();
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/80 dark:border-white/10">
        <div className="animate-pulse border-b border-border/80 px-4 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-muted" />
            <div className="space-y-2">
              <div className="h-3.5 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3 p-4">
          <div className="ml-auto h-12 w-2/3 animate-pulse rounded-2xl bg-muted" />
          <div className="h-12 w-1/2 animate-pulse rounded-2xl bg-muted" />
          <div className="ml-auto h-10 w-1/3 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm dark:border-white/10 dark:bg-card/90">
      <div className="flex items-center gap-3 border-b border-border/80 px-3 py-3 dark:border-white/10 sm:px-4">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-xl lg:hidden"
            onClick={onBack}
            aria-label="Listeye dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}
        {meta ? (
          <>
            <Avatar className="h-10 w-10 rounded-2xl">
              {meta.otherParticipant.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meta.otherParticipant.avatarUrl}
                  alt=""
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <AvatarFallback className="rounded-2xl text-xs">
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
              {meta.kind === 'support' || !meta.listingSlug ? (
                <p className="truncate text-xs text-muted-foreground">
                  {meta.listingTitle}
                  {meta.companyName ? ` · ${meta.companyName}` : ''}
                </p>
              ) : (
                <Link
                  href={`/ilan/${meta.listingSlug}`}
                  className="truncate text-xs text-muted-foreground hover:text-foreground"
                >
                  {meta.listingTitle}
                  {meta.companyName ? ` · ${meta.companyName}` : ''}
                </Link>
              )}
            </div>
          </>
        ) : null}
      </div>

      {meta?.kind === 'support' ? (
        <p className="border-b border-border/60 bg-muted/20 px-4 py-2 text-xs text-muted-foreground dark:border-white/10">
          Bu görüşme, destek talebinize yanıt olarak Girisimbee destek ekibi tarafından açıldı.
        </p>
      ) : meta?.listingTitle ? (
        <p className="border-b border-border/60 bg-muted/20 px-4 py-2 text-xs text-muted-foreground dark:border-white/10">
          Bu görüşme, ilan üzerinden gönderilen iletişim talebi sonucunda oluşturuldu.
        </p>
      ) : null}

      {error ? (
        <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {isLoadingMore ? (
          <p className="mb-3 text-center text-xs text-muted-foreground">
            Eski mesajlar yükleniyor…
          </p>
        ) : null}
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === userId}
            />
          ))}
        </div>
        <TypingIndicatorPlaceholder userId={meta?.otherParticipant.userId} />
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => void handleSend(e)}
        className="border-t border-border/80 p-3 dark:border-white/10 sm:p-4"
      >
        <div className="flex items-end gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Mesajınızı yazın…"
            disabled={isSending || !meta}
            rows={1}
            className="min-h-[44px] max-h-32 resize-none rounded-xl border-border/80"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!body.trim() || isSending || !meta}
            className="h-10 w-10 shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
