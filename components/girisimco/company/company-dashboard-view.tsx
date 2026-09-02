'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Briefcase,
  Users,
  Heart,
  Settings,
  Plus,
  ExternalLink,
  Loader2,
  MapPin,
  Globe,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getCompanyService } from '@/lib/persistence/container';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';
import type { UserId } from '@/lib/domain/ids';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { listingsToContentItems } from '@/features/listings/mappers/listing-card.mapper';
import { ContentCard as ListingCard } from '@/components/girisimco/content-card';
import { CompanySettingsForm } from '@/features/companies/components/company-settings-form';
import { cn } from '@/lib/utils';

interface CompanyDashboardViewProps {
  slug: string;
}

export function CompanyDashboardView({ slug }: CompanyDashboardViewProps) {
  const { user } = useAuth();
  const [data, setData] = useState<PublicCompanyView | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'listings' | 'profile' | 'team' | 'followers' | 'settings'>('listings');

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
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Bu şirket paneline erişim yetkiniz bulunmamaktadır.
      </div>
    );
  }

  const listingItems = listingsToContentItems(data.listings);
  const company = data.company;

  return (
    <div className="space-y-8">
      {/* 1. ŞİRKET ÜST BİLGİ KARTI */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xs backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
              {company.logoUrl ? (
                <Image
                  src={company.logoUrl}
                  alt={company.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Building2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  {company.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  Doğrulanmış İşletme
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                <span>@{company.slug}</span>
                {company.industry && (
                  <>
                    <span>•</span>
                    <span>{company.industry}</span>
                  </>
                )}
                {company.city && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {company.city}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Button asChild size="sm" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <Link href={`/ilan/olustur?category=ise-al`}>
                <Plus className="w-4 h-4 mr-1.5" />
                Yeni İlan Yayınla
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl font-medium">
              <Link href={`/company/${slug}`} target="_blank">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Şirket Profilini Gör
              </Link>
            </Button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <StatCard icon={Briefcase} label="Yayındaki İlanlar" value={formatNumber(data.listings.length)} />
          <StatCard icon={Heart} label="Takipçi Sayısı" value={formatNumber(data.followersCount)} />
          <StatCard icon={Users} label="Ekip Üyeleri" value={formatNumber(data.members.length)} />
          <StatCard icon={Building2} label="Şirket Durumu" value={company.status === 'active' ? 'Aktif' : 'Taslak'} />
        </div>
      </div>

      {/* 2. SEKMELER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-zinc-800">
        <TabButton
          active={tab === 'listings'}
          onClick={() => setTab('listings')}
          icon={Briefcase}
          label={`İlanlar (${data.listings.length})`}
        />
        <TabButton
          active={tab === 'team'}
          onClick={() => setTab('team')}
          icon={Users}
          label={`Ekip (${data.members.length})`}
        />
        <TabButton
          active={tab === 'followers'}
          onClick={() => setTab('followers')}
          icon={Heart}
          label={`Takipçiler (${data.followersCount})`}
        />
        <TabButton
          active={tab === 'settings'}
          onClick={() => setTab('settings')}
          icon={Settings}
          label="Şirket Ayarları"
        />
      </div>

      {/* 3. SEKME İÇERİKLERİ */}
      {tab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Şirketin Yayındaki İlanları</h3>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
              <Link href={`/ilan/olustur?category=ise-al`}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                İlan Ekle
              </Link>
            </Button>
          </div>

          {listingItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 p-8 text-center">
              <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">Henüz bu şirket adına açılmış bir ilan bulunmuyor.</p>
              <p className="text-xs text-muted-foreground mt-1">Hemen açık bir pozisyon veya iş ilanı yayınlayarak başvuruları toplamaya başlayın.</p>
              <Button asChild size="sm" className="mt-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href={`/ilan/olustur?category=ise-al`}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  İlk İlanı Yayınla
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listingItems.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'team' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Ekip Üyeleri</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.members.map(({ member, profile }) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {profile?.displayName?.slice(0, 2).toUpperCase() || 'ÜY'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{profile?.displayName ?? 'Kullanıcı'}</p>
                    <p className="text-xs text-muted-foreground">{member.role === 'owner' ? 'Şirket Sahibi' : 'Yönetici / Ekip Üyesi'}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {member.role === 'owner' ? 'Sahip' : 'Üye'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'followers' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Takipçiler</h3>
          <p className="text-sm text-muted-foreground">Bu şirketi toplam {formatNumber(data.followersCount)} kişi takip ediyor.</p>
        </div>
      )}

      {tab === 'settings' && data.isOwner && (
        <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-bold text-foreground mb-6 pb-3 border-b border-slate-100 dark:border-zinc-800">
            Şirket Profilini ve Bilgilerini Düzenle
          </h3>
          <CompanySettingsForm slug={slug} />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30 p-3.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1.5 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
        active
          ? 'bg-emerald-600 text-white shadow-xs'
          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
