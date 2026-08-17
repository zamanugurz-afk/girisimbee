'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import type { ContactRequestPublicView } from '@/features/contact-requests/types/contact-request.types';
import { cn } from '@/lib/utils';

function statusLabel(status: ContactRequestPublicView['effectiveStatus']): string {
  switch (status) {
    case 'pending':
      return 'Bekliyor';
    case 'accepted':
      return 'Kabul edildi';
    case 'rejected':
      return 'Reddedildi';
    case 'expired':
      return 'Süresi doldu';
    case 'cancelled':
      return 'İptal';
    default:
      return status;
  }
}

export function OwnerContactRequestsInbox({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('talep');
  const [requests, setRequests] = useState<ContactRequestPublicView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [acceptTarget, setAcceptTarget] = useState<ContactRequestPublicView | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact-requests');
      if (!res.ok) {
        setRequests([]);
        return;
      }
      const json = (await res.json()) as { data?: { requests?: ContactRequestPublicView[] } };
      setRequests(json.data?.requests ?? []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const pending = requests.filter((r) => r.effectiveStatus === 'pending').length;
    const accepted = requests.filter((r) => r.effectiveStatus === 'accepted').length;
    const rejected = requests.filter((r) => r.effectiveStatus === 'rejected').length;
    return { pending, accepted, rejected, all: requests.length };
  }, [requests]);

  const visible = useMemo(() => {
    const rows =
      filter === 'all'
        ? requests
        : requests.filter((r) => r.effectiveStatus === filter);
    if (!highlightId) return rows;
    return [...rows].sort((a, b) => Number(b.id === highlightId) - Number(a.id === highlightId));
  }, [requests, filter, highlightId]);

  async function reject(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/contact-requests/${id}/reject`, { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Reddedilemedi');
      toast.message('İletişim talebi reddedildi.');
      await load();
      window.dispatchEvent(new Event('girisimbee:contact-requests-changed'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reddedilemedi');
    } finally {
      setBusyId(null);
    }
  }

  async function accept() {
    if (!acceptTarget || !acceptTerms) {
      toast.error('İletişim ve Mesajlaşma Kullanım Koşullarını kabul etmelisiniz.');
      return;
    }
    setBusyId(acceptTarget.id);
    try {
      const res = await fetch(`/api/contact-requests/${acceptTarget.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptTerms: true }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        data?: { request?: ContactRequestPublicView };
      };
      if (!res.ok) throw new Error(json.error ?? 'Kabul edilemedi');
      const conversationId = json.data?.request?.conversationId;
      toast.success('İletişim talebi kabul edildi.');
      setAcceptTarget(null);
      setAcceptTerms(false);
      await load();
      window.dispatchEvent(new Event('girisimbee:contact-requests-changed'));
      if (conversationId) {
        window.location.href = `${DASHBOARD_ROUTES.mesajlarim}?c=${conversationId}`;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kabul edilemedi');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all' as const, label: `Tümü (${counts.all})` },
            { id: 'pending' as const, label: `Bekleyen (${counts.pending})` },
            { id: 'accepted' as const, label: `Kabul (${counts.accepted})` },
            { id: 'rejected' as const, label: `Red (${counts.rejected})` },
          ] as const
        ).map((tab) => (
          <Button
            key={tab.id}
            type="button"
            size="sm"
            variant={filter === tab.id ? 'default' : 'outline'}
            className="rounded-xl"
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
        <Button asChild size="sm" variant="ghost" className="rounded-xl ml-auto">
          <Link href={DASHBOARD_ROUTES.mesajlarim}>
            <MessageSquare className="mr-1.5 h-4 w-4" />
            Mesajlarım
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
        </p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center dark:border-white/10">
          <p className="text-sm font-medium text-foreground">
            {filter === 'all'
              ? 'Henüz iletişim talebi yok.'
              : filter === 'pending'
                ? 'Bekleyen iletişim talebi yok.'
                : filter === 'accepted'
                  ? 'Kabul edilmiş talep yok.'
                  : 'Reddedilmiş talep yok.'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gelen talepler hesap menüsündeki İletişim Talepleri sayfasında listelenir. Kabul sonrası
            sohbet Mesajlarım’da açılır.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((req) => (
            <li
              key={req.id}
              id={`talep-${req.id}`}
              className={cn(
                'rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm dark:border-white/10',
                highlightId === req.id && 'ring-2 ring-primary/40',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {req.requesterDisplayName ?? 'Kullanıcı'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {req.listingTitle ?? 'İlan'} · {statusLabel(req.effectiveStatus)}
                  </p>
                </div>
                <Link
                  href={`/ilan/${req.listingId}`}
                  className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  İlana git
                </Link>
              </div>
              {req.message ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{req.message}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {req.effectiveStatus === 'pending' ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-xl"
                      disabled={busyId === req.id}
                      onClick={() => {
                        setAcceptTerms(false);
                        setAcceptTarget(req);
                      }}
                    >
                      Kabul et
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      disabled={busyId === req.id}
                      onClick={() => void reject(req.id)}
                    >
                      Reddet
                    </Button>
                  </>
                ) : null}
                {req.effectiveStatus === 'accepted' && req.conversationId ? (
                  <Button asChild size="sm" className="rounded-xl">
                    <Link href={`${DASHBOARD_ROUTES.mesajlarim}?c=${req.conversationId}`}>
                      Mesajlara git
                    </Link>
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(acceptTarget)}
        onOpenChange={(next) => {
          if (!next) {
            setAcceptTarget(null);
            setAcceptTerms(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Talebi kabul et</DialogTitle>
            <DialogDescription>
              Kabul sonrası mesajlaşma açılır; telefon ve ad-soyad bilginiz yalnızca bu talep
              sahibine gösterilir.
            </DialogDescription>
          </DialogHeader>
          <label className="flex items-start gap-2.5 text-sm leading-snug">
            <Checkbox
              checked={acceptTerms}
              onCheckedChange={(v) => setAcceptTerms(v === true)}
              className="mt-0.5"
            />
            <span>
              <Link
                href={LEGAL_ROUTES.contactCommunication}
                target="_blank"
                className="font-medium text-foreground underline underline-offset-2"
              >
                İletişim ve Mesajlaşma Kullanım Koşulları
              </Link>
              ’nı okudum ve kabul ediyorum.
            </span>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAcceptTarget(null)}>
              Vazgeç
            </Button>
            <Button
              type="button"
              onClick={() => void accept()}
              disabled={!acceptTerms || busyId === acceptTarget?.id}
            >
              {busyId === acceptTarget?.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Kabul et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
