'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CareerProfilePreview,
  type CareerCardInput,
} from '@/features/candidates/components/CareerProfilePreview';
import { initials, cn } from '@/lib/utils';

export interface ApplicationThreadData {
  id: string;
  listingId: string;
  status: string;
  coverMessage: string | null;
  profileSnapshot: CareerCardInput | null;
  submittedAt: string;
  isManager: boolean;
  isListingOwner?: boolean;
  isApplicant: boolean;
  canViewFullApplicantProfile?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  submitted: {
    label: 'Yeni Başvuru',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  pending: {
    label: 'Yeni Başvuru',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  reviewing: {
    label: 'İnceleniyor',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  contacted: {
    label: 'Mülakat / İletişim',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  accepted: {
    label: 'Olumlu / Kabul Edildi',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  rejected: {
    label: 'Olumsuz / Reddedildi',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
  withdrawn: {
    label: 'Geri Çekildi',
    bg: 'bg-slate-50 dark:bg-slate-900/50',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
};

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

  // Job application state
  const [appData, setAppData] = useState<ApplicationThreadData | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Fetch application details linked to this conversation
  useEffect(() => {
    let mounted = true;
    setIsLoadingApp(true);

    fetch(`/api/conversations/${conversationId}/application`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const payload = json?.data || json;
        if (mounted && payload?.hasApplication && payload.application) {
          setAppData(payload.application);
        } else if (mounted) {
          setAppData(null);
        }
      })
      .catch(() => {
        if (mounted) setAppData(null);
      })
      .finally(() => {
        if (mounted) setIsLoadingApp(false);
      });

    return () => {
      mounted = false;
    };
  }, [conversationId]);

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

  async function handleStatusChange(newStatus: string) {
    if (!appData?.id || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/employers/applications/${appData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Durum güncellenemedi.');
      }

      setAppData((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success('Başvuru durumu güncellendi.');
    } catch (err: any) {
      toast.error(err.message || 'Durum güncellenirken hata oluştu.');
    } finally {
      setIsUpdatingStatus(false);
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

  const currentStatusConf = STATUS_LABELS[appData?.status || 'submitted'] || STATUS_LABELS.submitted;

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm dark:border-white/10 dark:bg-card/90">
      {/* Top Participant Header */}
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

      {/* Application Banner / Card */}
      {appData ? (
        <div className="m-3 sm:m-4 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 p-4 dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-teal-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                  <Briefcase className="h-3 w-3" />
                  İş Başvurusu
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(appData.submittedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {meta?.listingTitle || 'İş Pozisyonu'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Aday: <strong>{appData.profileSnapshot?.displayName || meta?.otherParticipant.displayName}</strong>
                {appData.profileSnapshot?.primarySector ? ` · ${appData.profileSnapshot.primarySector}` : ''}
                {appData.profileSnapshot?.preferredCity || appData.profileSnapshot?.residenceCity ? ` · ${appData.profileSnapshot.preferredCity || appData.profileSnapshot.residenceCity}` : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status control */}
              {appData.isManager ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Durum:</span>
                  <Select
                    value={appData.status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="h-8 w-36 text-xs bg-white dark:bg-card rounded-lg border-emerald-200 dark:border-emerald-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Yeni Başvuru</SelectItem>
                      <SelectItem value="reviewing">İnceleniyor</SelectItem>
                      <SelectItem value="contacted">Mülakat</SelectItem>
                      <SelectItem value="accepted">Olumlu</SelectItem>
                      <SelectItem value="rejected">Olumsuz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border',
                    currentStatusConf.bg,
                    currentStatusConf.text,
                    currentStatusConf.border,
                  )}
                >
                  {currentStatusConf.label}
                </span>
              )}

              {/* View Snapshot Profile button */}
              {appData.profileSnapshot ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setProfileModalOpen(true)}
                  className="h-8 text-xs font-semibold bg-white dark:bg-card border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 gap-1.5 rounded-lg"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Kariyer Profilini Gör</span>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : meta?.kind === 'support' ? (
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

      {/* Career Profile Immutable Snapshot Modal */}
      {appData?.profileSnapshot ? (
        <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl bg-card border-border">
            <DialogHeader className="pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  {appData.isApplicant
                    ? 'Başvuru Anındaki Kariyer Profiliniz'
                    : 'Başvuru Anındaki Kariyer Profili'}
                </div>
                <DialogTitle className="text-lg font-bold mt-1">
                  {appData.profileSnapshot.displayName || (appData.isApplicant ? 'Kariyer Profiliniz' : 'Aday Kariyer Profili')}
                </DialogTitle>
              </div>
              {appData.isApplicant ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold gap-1.5 border-emerald-300 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl shrink-0"
                >
                  <Link href="/dashboard/kariyer-profilim">
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Güncel Profilimi Gör / Düzenle</span>
                  </Link>
                </Button>
              ) : null}
            </DialogHeader>

            <div className="py-3">
              <CareerProfilePreview
                data={appData.profileSnapshot}
                readOnlySnapshot={true}
                isOwnApplication={appData.isApplicant}
                canViewFullApplicantProfile={appData.canViewFullApplicantProfile}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
