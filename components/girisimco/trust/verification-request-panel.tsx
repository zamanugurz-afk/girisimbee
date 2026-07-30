'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import {
  getCompanyService,
  getVerificationService,
} from '@/lib/persistence/container';
import type { Verification, VerificationType } from '@/features/authentication/types/verification.types';
import type { Company } from '@/features/companies/types/company.types';
import type { UserId, CompanyId } from '@/lib/domain/ids';
import { VerifiedBadgeGroup } from '@/components/girisimco/trust/verified-badge';
import { getVerificationStatusLabel } from '@/features/authentication/utils/verification-status-labels';
import {
  uploadVerificationMedia,
  getVerificationDocumentUrl,
} from '@/features/authentication/lib/upload-verification-media';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

const TRUST_TYPES: { type: VerificationType; label: string }[] = [
  { type: 'identity', label: 'Kullanıcı Doğrulaması' },
  { type: 'company', label: 'Şirket Doğrulaması' },
  { type: 'investor_accreditation', label: 'Yatırımcı Doğrulaması' },
];

interface VerificationRequestPanelProps {
  userVerified: boolean;
  investorVerified: boolean;
}

export function VerificationRequestPanel({
  userVerified,
  investorVerified,
}: VerificationRequestPanelProps) {
  const { user } = useAuth();
  const service = useMemo(() => getVerificationService(), []);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestType, setRequestType] = useState<VerificationType>('identity');
  const [companyId, setCompanyId] = useState<string>('');
  const [busy, setBusy] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [items, owned] = await Promise.all([
        service.listByUser(user.id as UserId),
        getCompanyService().listByOwner(user.id as UserId),
      ]);
      setVerifications(items.filter((v) => TRUST_TYPES.some((t) => t.type === v.type)));
      setCompanies(owned);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Doğrulamalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [service, user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRequest() {
    if (!user) return;
    if (requestType === 'company' && !companyId) {
      toast.error('Şirket seçin');
      return;
    }
    setBusy('request');
    try {
      const created = await service.requestVerification(
        user.id as UserId,
        requestType,
        requestType === 'company' ? (companyId as CompanyId) : null,
      );
      toast.success('Doğrulama talebi oluşturuldu');
      setVerifications((prev) => [created, ...prev]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Talep oluşturulamadı');
    } finally {
      setBusy(null);
    }
  }

  async function handleUpload(verificationId: string, files: FileList | null) {
    if (!user || !files?.length) return;
    setBusy(verificationId);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const path = await uploadVerificationMedia(user.id, verificationId, file);
        urls.push(path);
      }
      const existing = verifications.find((v) => v.id === verificationId);
      await service.submitDocuments(verificationId, [...(existing?.documentUrls ?? []), ...urls]);
      toast.success('Belgeler yüklendi');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Belge yüklenemedi');
    } finally {
      setBusy(null);
      setUploadTargetId(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function openDocument(path: string) {
    try {
      const url = await getVerificationDocumentUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Belge açılamadı');
    }
  }

  const pendingByType = (type: VerificationType) =>
    verifications.find(
      (v) => v.type === type && (v.status === 'pending' || v.status === 'in_review'),
    );

  const canRequestType = (type: VerificationType) => {
    if (type === 'identity' && userVerified) return false;
    if (type === 'investor_accreditation' && investorVerified) return false;
    if (pendingByType(type)) return false;
    return true;
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Doğrulama
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kimlik, şirket veya yatırımcı doğrulaması için belge yükleyin.
          </p>
        </div>
        <VerifiedBadgeGroup user={userVerified} investor={investorVerified} />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor…</p>
      ) : (
        <>
          <div className="rounded-xl border border-border/80 p-4 dark:border-white/10">
            <h3 className="text-sm font-semibold text-foreground">Yeni Talep</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Doğrulama türü</Label>
                <Select value={requestType} onValueChange={(v) => setRequestType(v as VerificationType)}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRUST_TYPES.map((t) => (
                      <SelectItem key={t.type} value={t.type} disabled={!canRequestType(t.type)}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {requestType === 'company' && (
                <div className="space-y-2">
                  <Label>Şirket</Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Şirket seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <Button
              type="button"
              className="mt-4 rounded-lg"
              disabled={busy === 'request' || !canRequestType(requestType)}
              onClick={() => void handleRequest()}
            >
              {busy === 'request' ? 'Oluşturuluyor…' : 'Talep Oluştur'}
            </Button>
          </div>

          {verifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 px-6 py-8 text-center dark:border-white/10">
              <p className="text-sm text-muted-foreground">Henüz doğrulama talebiniz yok.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {verifications.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl border border-border/80 p-4 dark:border-white/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {TRUST_TYPES.find((t) => t.type === v.type)?.label ?? v.type}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(v.createdAt)}</p>
                    </div>
                    <Badge variant="outline">{getVerificationStatusLabel(v.status)}</Badge>
                  </div>

                  {v.rejectionReason && (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
                      Red sebebi: {v.rejectionReason}
                    </p>
                  )}

                  {v.documentUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {v.documentUrls.map((path) => (
                        <Button
                          key={path}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs"
                          onClick={() => void openDocument(path)}
                        >
                          Belgeyi Gör
                        </Button>
                      ))}
                    </div>
                  )}

                  {(v.status === 'pending' || v.status === 'rejected') && (
                    <div className="mt-3">
                      <input
                        ref={uploadTargetId === v.id ? fileRef : undefined}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => void handleUpload(v.id, e.target.files)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        disabled={busy === v.id}
                        onClick={() => {
                          setUploadTargetId(v.id);
                          setTimeout(() => fileRef.current?.click(), 0);
                        }}
                      >
                        {busy === v.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Belge Yükle
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
