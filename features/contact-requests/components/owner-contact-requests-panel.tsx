'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
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

export interface OwnerContactRequestsPanelProps {
  listingId?: string;
  className?: string;
}

export function OwnerContactRequestsPanel({
  listingId,
  className,
}: OwnerContactRequestsPanelProps) {
  const [requests, setRequests] = useState<ContactRequestPublicView[]>([]);
  const [loading, setLoading] = useState(true);
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
      let rows = json.data?.requests ?? [];
      if (listingId) {
        rows = rows.filter((r) => r.listingId === listingId);
      }
      setRequests(rows.filter((r) => r.effectiveStatus === 'pending'));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function reject(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/contact-requests/${id}/reject`, { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Reddedilemedi');
      toast.message('Talep reddedildi');
      await load();
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
      toast.success('Talep kabul edildi. Mesajlaşma açıldı; telefon yalnızca bu kullanıcıya gösterilir.');
      setAcceptTarget(null);
      setAcceptTerms(false);
      await load();
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
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm dark:border-white/10',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Gelen iletişim talepleri</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Kabul sonrası mesajlaşma açılır; telefon ve ad-soyad yalnızca o kullanıcıya gösterilir.
          </p>
        </div>
        <Link
          href={DASHBOARD_ROUTES.iletisimTalepleri}
          className="shrink-0 text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Tümünü gör
        </Link>
      </div>

      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…
        </p>
      ) : requests.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Bekleyen talep yok.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {requests.map((req) => (
            <li
              key={req.id}
              className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 dark:border-white/10"
            >
              <p className="text-sm font-medium text-foreground">
                {req.requesterDisplayName ?? 'Kullanıcı'}
              </p>
              {req.message ? (
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{req.message}</p>
              ) : null}
              <div className="mt-2.5 flex flex-wrap gap-2">
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
              Kabul sonrası mesajlaşma açılır ve telefon numaranız yalnızca bu talep sahibine
              gösterilir. Devam etmek için koşulları onaylayın.
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setAcceptTarget(null)}
              disabled={busyId === acceptTarget?.id}
            >
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
