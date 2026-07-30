'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getCompanyService } from '@/lib/persistence/container';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';
import type { UserId } from '@/lib/domain/ids';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import { ContentCard as ListingCard } from '@/components/girisimco/content-card';

interface CompanyDashboardViewProps {
  slug: string;
}

export function CompanyDashboardView({ slug }: CompanyDashboardViewProps) {
  const { user } = useAuth();
  const [data, setData] = useState<PublicCompanyView | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | 'listings' | 'team' | 'followers' | 'settings'>('profile');

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const view = await getCompanyService().getPublicView(slug, user!.id as UserId);
        setData(view);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [slug, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || (!data.isOwner && !data.isMember)) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Bu şirket paneline erişim yetkiniz yok.
      </div>
    );
  }

  const listingItems = listingsToContentItems(data.listings);
  const tabs = [
    { id: 'profile' as const, label: 'Profil' },
    { id: 'listings' as const, label: 'İlanlar' },
    { id: 'team' as const, label: 'Ekip' },
    { id: 'followers' as const, label: 'Takipçiler' },
    { id: 'settings' as const, label: 'Ayarlar' },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            variant={tab === t.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-lg"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
        <Button asChild variant="ghost" size="sm" className="ml-auto rounded-lg">
          <Link href={`/company/${slug}`}>Herkese Açık Sayfa</Link>
        </Button>
      </div>

      {tab === 'profile' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="İlan" value={formatNumber(data.listings.length)} />
          <StatCard label="Takipçi" value={formatNumber(data.followersCount)} />
          <StatCard label="Ekip" value={formatNumber(data.members.length)} />
        </div>
      )}

      {tab === 'listings' && (
        listingItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz yayınlanmış ilan yok.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listingItems.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        )
      )}

      {tab === 'team' && (
        <div className="space-y-3">
          {data.members.map(({ member, profile }) => (
            <div key={member.id} className="rounded-xl border border-border/80 p-4 dark:border-white/10">
              <p className="font-medium text-foreground">{profile?.displayName ?? 'Kullanıcı'}</p>
              <p className="text-xs text-muted-foreground">{member.role === 'owner' ? 'Sahip' : 'Üye'}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'followers' && (
        <p className="text-sm text-muted-foreground">{formatNumber(data.followersCount)} takipçi</p>
      )}

      {tab === 'settings' && data.isOwner && (
        <Button asChild className="rounded-lg">
          <Link href={`/company/${slug}/settings`}>Şirket Ayarlarını Düzenle</Link>
        </Button>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/80 p-4 dark:border-white/10">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
