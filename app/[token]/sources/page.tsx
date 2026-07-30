'use client';

import { Zap, ExternalLink, RefreshCw, Activity, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { SectionCard } from '@/components/data-display/section-card';
import { StatCard } from '@/components/data-display/stat-card';
import { ErrorState } from '@/components/feedback/error-state';
import { StatCardSkeleton } from '@/components/feedback/skeletons';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/feedback/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSyncRunsQuery } from '@/lib/queries';
import { useTriggerSync } from '@/hooks/use-sync-data';
import { useSettingsStore } from '@/lib/stores/data-stores';
import { PROVIDERS } from '@/config/site';
import { cn, timeAgo } from '@/lib/utils';
import { OWNER_ROUTE } from '@/config/site';
import { toast } from 'sonner';
import type { SyncStatus } from '@/types';

const STATUS_META: Record<SyncStatus, { label: string; icon: typeof Activity; tone: string }> = {
  success: { label: 'Sağlıklı', icon: CheckCircle2, tone: 'text-success bg-success-soft' },
  running: { label: 'Çalışıyor', icon: Loader2, tone: 'text-primary bg-primary-soft' },
  error: { label: 'Hata', icon: AlertCircle, tone: 'text-danger bg-danger-soft' },
  paused: { label: 'Duraklatıldı', icon: Activity, tone: 'text-muted-foreground bg-secondary' },
  idle: { label: 'Beklemede', icon: Activity, tone: 'text-muted-foreground bg-secondary' },
};

export default function SourcesPage() {
  const { data, isLoading, isError, refetch } = useSyncRunsQuery();
  const triggerSync = useTriggerSync();
  const syncInterval = useSettingsStore((s) => s.syncInterval);

  const isSyncing = triggerSync.isPending;

  const handleSyncAll = () => {
    triggerSync.mutate(
      { intervalMinutes: syncInterval },
      {
        onSuccess: (result) => {
          refetch();
          const label =
            result.status === 'success'
              ? 'Senkron tamamlandı'
              : result.status === 'partial'
                ? 'Senkron kısmen tamamlandı'
                : 'Senkron hata ile bitti';
          toast.success(label, {
            description: `${result.total_imported} yeni, ${result.total_updated} güncellenen ilan`,
          });
        },
        onError: (error) => {
          toast.error('Senkron başarısız', {
            description: error instanceof Error ? error.message : 'Bilinmeyen hata',
          });
        },
      },
    );
  };

  const handleSyncProvider = (providerName: string, providerSlug: string) => {
    triggerSync.mutate(
      { intervalMinutes: syncInterval, providerSlug },
      {
        onSuccess: (result) => {
          refetch();
          toast.success(`${providerName} senkronize edildi`, {
            description: `${result.total_imported} yeni, ${result.total_updated} güncellenen ilan`,
          });
        },
        onError: (error) => {
          toast.error(`${providerName} senkronu başarısız`, {
            description: error instanceof Error ? error.message : 'Bilinmeyen hata',
          });
        },
      },
    );
  };

  const totalFound = data?.reduce((a, r) => a + r.foundCount, 0) ?? 0;
  const totalNew = data?.reduce((a, r) => a + r.newCount, 0) ?? 0;
  const errors = data?.filter((r) => r.status === 'error').length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Zap}
        title="Kaynaklar"
        description="İlan sağlayıcıları ve senkron durumu. Her sağlayıcı izole — mevcut koda dokunmadan yeni kaynaklar eklenebilir."
        crumbs={[{ label: 'Panel', href: OWNER_ROUTE }, { label: 'Kaynaklar' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={isSyncing}
            onClick={handleSyncAll}
          >
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Senkronize ediliyor…' : 'Tümünü senkronize et'}
          </Button>
        }
      />

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StaggerItem>
            <StatCard label="Bulunan ilan" value={totalFound} hint="Son senkron döngüsü" icon={Activity} tone="primary" />
          </StaggerItem>
          <StaggerItem>
            <StatCard label="Yeni ilan" value={totalNew} hint="Bu döngüde eklendi" icon={Zap} tone="success" />
          </StaggerItem>
          <StaggerItem>
            <StatCard label="Güncellenen" value={data?.reduce((a, r) => a + r.updatedCount, 0) ?? 0} hint="Fiyat/açıklama değişti" icon={RefreshCw} tone="primary" />
          </StaggerItem>
          <StaggerItem>
            <StatCard label="Hatalı kaynak" value={errors} hint={errors === 0 ? 'Tümü sağlıklı' : 'İlgilenilmesi gerek'} icon={AlertCircle} tone={errors > 0 ? 'danger' : 'success'} />
          </StaggerItem>
        </StaggerGroup>
      )}

      <StaggerGroup className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PROVIDERS.map((p, i) => {
          const run = data?.find((r) => r.providerId === p.id);
          const isFullSync = isSyncing && !triggerSync.variables?.providerSlug;
          const providerSyncing =
            isSyncing && (triggerSync.variables?.providerSlug === p.id || isFullSync);
          const providerRunning = run?.status === 'running' || providerSyncing;
          const meta = providerRunning
            ? STATUS_META.running
            : run
              ? STATUS_META[run.status]
              : STATUS_META.idle;
          const Icon = meta.icon;
          return (
            <StaggerItem key={p.id}>
              <SectionCard>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold"
                      style={{ backgroundColor: `${p.color}22`, color: p.color }}
                    >
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <a
                        href={`https://${p.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {p.domain}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                  <span className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', meta.tone)}>
                    <Icon className={cn('h-3 w-3', providerRunning && 'animate-spin')} />
                    {meta.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/40 py-2">
                    <p className="font-display text-lg font-semibold">{run?.foundCount ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Bulunan</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 py-2">
                    <p className="font-display text-lg font-semibold text-success">{run?.newCount ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Yeni</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 py-2">
                    <p className="font-display text-lg font-semibold text-primary">{run?.updatedCount ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">Güncellenen</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 py-2">
                    <p className="font-display text-lg font-semibold text-danger">{run?.errorCount ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">Hata</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 py-2">
                    <p className="font-display text-lg font-semibold">{run?.avgResponseMs ? `${run.avgResponseMs}ms` : '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Yanıt Süresi</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 py-2">
                    <p className="font-display text-lg font-semibold">{run?.durationMs ? (run.durationMs < 1000 ? `${run.durationMs}ms` : `${(run.durationMs / 1000).toFixed(1)}s`) : '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Süre</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    {providerRunning
                      ? 'Şu an senkronize…'
                      : run?.finishedAt
                        ? `Senkronize edildi ${timeAgo(run.finishedAt)}`
                        : '—'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={isSyncing}
                    onClick={() => handleSyncProvider(p.name, p.id)}
                  >
                    <RefreshCw className={cn('mr-1 h-3 w-3', providerSyncing && 'animate-spin')} />
                    Senkronize et
                  </Button>
                </div>
              </SectionCard>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <FadeIn delay={0.15}>
        <SectionCard title="Sağlayıcı mimarisi" description="Yeni kaynaklar nasıl eklenir" icon={Zap}>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Her sağlayıcı ortak bir arayüz uygular: <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">search()</code>,{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">parse()</code> ve{' '}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">normalize()</code>.
            </p>
            <p>
              Yeni bir kaynak eklemek, bir sağlayıcı modülü eklemek demektir — mevcut kodun değişmesi gerekmez. Her sağlayıcı izole çalışır, böylece birindeki hata diğerlerini engellemez.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {PROVIDERS.map((p) => (
                <Badge key={p.id} variant="outline" className="gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </Badge>
              ))}
              <Badge variant="secondary" className="border-dashed">+ fazlası için hazır</Badge>
            </div>
          </div>
        </SectionCard>
      </FadeIn>
    </div>
  );
}
