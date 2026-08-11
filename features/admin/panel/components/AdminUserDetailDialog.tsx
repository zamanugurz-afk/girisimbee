'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_STATUS_LABELS,
} from '@/features/admin/panel/constants/admin-users.constants';
import { ADMIN_ROUTES } from '@/features/admin/panel/constants/admin-nav.constants';
import { formatAdminDateTime } from '@/features/admin/panel/lib/format-admin-datetime';
import type { AdminMockUser } from '@/features/admin/panel/types/admin-panel.types';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 py-2.5 text-sm last:border-0 dark:border-white/10">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all font-medium text-foreground">{value}</dd>
    </div>
  );
}

type LegalConsentSummary = {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  kvkkAccepted: boolean;
  cookiesAccepted: boolean;
  marketingAccepted: boolean;
  smsAccepted: boolean;
  emailAccepted: boolean;
  termsVersion: string | null;
  privacyVersion: string | null;
  kvkkAckVersion: string | null;
  cookiesVersion: string | null;
  createdAt: string;
};

function yesNo(v: boolean) {
  return v ? 'Evet' : 'Hayır';
}

export function AdminUserDetailDialog({
  user,
  open,
  onOpenChange,
  onEdit,
}: {
  user: AdminMockUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: AdminMockUser) => void;
}) {
  const [consent, setConsent] = useState<LegalConsentSummary | null>(null);
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user?.id) {
      setConsent(null);
      setConsentError(null);
      return;
    }
    let cancelled = false;
    setConsentLoading(true);
    setConsentError(null);
    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${user.id}`);
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
          data?: { consent?: LegalConsentSummary | null };
        };
        if (!res.ok) throw new Error(json.error ?? 'İzinler yüklenemedi');
        if (!cancelled) setConsent(json.data?.consent ?? null);
      } catch (e) {
        if (!cancelled) {
          setConsent(null);
          setConsentError(e instanceof Error ? e.message : 'İzinler yüklenemedi');
        }
      } finally {
        if (!cancelled) setConsentLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kullanıcı detayı</DialogTitle>
          <DialogDescription>Profil özeti ve yasal izin durumu</DialogDescription>
        </DialogHeader>
        {user ? (
          <>
            <dl>
              <DetailRow label="id" value={user.id} />
              <DetailRow label="full_name" value={user.full_name} />
              <DetailRow label="username" value={user.username} />
              <DetailRow label="email" value={user.email} />
              <DetailRow label="role" value={ADMIN_USER_ROLE_LABELS[user.role]} />
              <DetailRow label="status" value={ADMIN_USER_STATUS_LABELS[user.status]} />
              <DetailRow label="created_at" value={formatAdminDateTime(user.created_at)} />
              <DetailRow
                label="last_login_at"
                value={formatAdminDateTime(user.last_login_at)}
              />
            </dl>

            <div className="mt-4 rounded-xl border border-border/80 p-3 dark:border-white/10">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Yasal izinler</h3>
                <Link
                  href={`${ADMIN_ROUTES.kvkkConsents}?userId=${user.id}`}
                  className="text-xs text-primary underline"
                >
                  KVKK kayıtları
                </Link>
              </div>
              {consentLoading ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Yükleniyor…
                </p>
              ) : consentError ? (
                <p className="text-xs text-destructive">{consentError}</p>
              ) : !consent ? (
                <p className="text-xs text-muted-foreground">Henüz izin kaydı yok.</p>
              ) : (
                <dl>
                  <DetailRow label="Sözleşme" value={yesNo(consent.termsAccepted)} />
                  <DetailRow label="Gizlilik" value={yesNo(consent.privacyAccepted)} />
                  <DetailRow label="KVKK ack" value={yesNo(consent.kvkkAccepted)} />
                  <DetailRow label="Çerez" value={yesNo(consent.cookiesAccepted)} />
                  <DetailRow label="Pazarlama" value={yesNo(consent.marketingAccepted)} />
                  <DetailRow
                    label="Kayıt"
                    value={formatAdminDateTime(consent.createdAt)}
                  />
                  <DetailRow
                    label="Sürümler"
                    value={[
                      consent.termsVersion && `terms:${consent.termsVersion}`,
                      consent.privacyVersion && `privacy:${consent.privacyVersion}`,
                      consent.kvkkAckVersion && `kvkk:${consent.kvkkAckVersion}`,
                    ]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  />
                </dl>
              )}
            </div>
          </>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
          {user ? (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(user);
              }}
            >
              Düzenle
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
