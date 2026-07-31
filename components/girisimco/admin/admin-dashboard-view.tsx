'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/features/admin/lib/admin-api-client';
import type { AdminDashboardStats } from '@/features/admin/services/admin.service.interface';
import { formatNumber } from '@/lib/utils';

export function AdminDashboardView() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        setStats(await adminApi.getDashboard());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'İstatistikler yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/80" />
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

  if (!stats) return null;

  const cards = [
    { label: 'Toplam Kullanıcı', value: stats.totalUsers },
    { label: 'Toplam Şirket', value: stats.totalCompanies },
    { label: 'Toplam İlan', value: stats.totalListings },
    { label: 'Toplam Mesaj', value: stats.totalMessages },
    { label: 'Yayında İlan', value: stats.publishedListings },
    { label: 'Taslak İlan', value: stats.draftListings },
    { label: 'Bugün Aktif', value: stats.activeToday },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border/80 p-5 dark:border-white/10">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-foreground">
              {formatNumber(card.value)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/admin/users" title="Kullanıcı Yönetimi" description="Ara, askıya al, sil" />
        <QuickLink href="/admin/companies" title="Şirket Yönetimi" description="Doğrula, askıya al" />
        <QuickLink href="/admin/listings" title="İlan Yönetimi" description="Yayınla, arşivle" />
        <QuickLink href="/admin/reports" title="Raporlar" description="Bildirilen içerikler" />
        <QuickLink href="/admin/verifications" title="Doğrulama" description="Onay bekleyenler" />
        <QuickLink href="/admin/search" title="Global Arama" description="Kullanıcı, şirket, ilan" />
      </div>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border/80 p-5 transition-colors hover:border-primary/25 hover:bg-muted/40 dark:border-white/10 dark:hover:bg-white/[0.03]"
    >
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
