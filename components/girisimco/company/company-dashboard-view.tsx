'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  Briefcase,
  Users,
  Heart,
  Settings,
  Plus,
  ExternalLink,
  Loader2,
  LayoutDashboard,
  MapPin,
  Globe,
  Mail,
  ShieldCheck,
  Phone,
  FileText,
  Sparkles,
  TrendingUp,
  UserPlus,
  Eye,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getCompanyService } from '@/lib/persistence/container';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';
import type { UserId } from '@/lib/domain/ids';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/utils';
import { AccountListingCard } from '@/features/account/components/AccountListingCard';
import { mapListingToAccountCard } from '@/features/account/lib/map-listing-to-account-card';
import type {
  AccountListingCardData,
  AccountListingStatus,
} from '@/features/account/types/account-listings.types';
import { CompanySettingsForm } from '@/features/companies/components/company-settings-form';
import { cn } from '@/lib/utils';

interface CompanyDashboardViewProps {
  slug: string;
}

export function CompanyDashboardView({ slug }: CompanyDashboardViewProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab') as 'listings' | 'team' | 'followers' | 'settings' | 'verification' | null;

  const [data, setData] = useState<PublicCompanyView | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'listings' | 'team' | 'followers' | 'settings' | 'verification'>(urlTab || 'listings');
  const [listingCards, setListingCards] = useState<AccountListingCardData[]>([]);
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'unpublished'>('all');

  const handleTabChange = (newTab: 'listings' | 'team' | 'followers' | 'settings' | 'verification') => {
    setTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    if (urlTab && ['listings', 'team', 'followers', 'settings', 'verification'].includes(urlTab)) {
      setTab(urlTab);
    }
  }, [urlTab]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const view = await getCompanyService().getPublicView(slug, user!.id as UserId);
        setData(view);
        if (view?.listings) {
          setListingCards(view.listings.map((l) => mapListingToAccountCard(l)));
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [slug, user]);

  const handleStatusChange = (id: string, newStatus: AccountListingStatus) => {
    setListingCards((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
    );
  };

  const handleDelete = (id: string) => {
    setListingCards((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePromote = (id: string) => {
    setListingCards((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isUrgentShowcase: true } : item)),
    );
  };

  const filteredListings = useMemo(() => {
    if (listingFilter === 'active') return listingCards.filter((l) => l.status === 'active');
    if (listingFilter === 'unpublished') return listingCards.filter((l) => l.status !== 'active');
    return listingCards;
  }, [listingCards, listingFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!data || (!data.isOwner && !data.isMember)) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
        Bu şirket paneline erişim yetkiniz bulunmamaktadır.
      </div>
    );
  }

  const company = data.company;

    <div className="space-y-3">
      {/* 1. TEK EKRAN KOMPAKT KOKPİT ÜST BARI (~52px) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-2.5 sm:p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Sol: Logo + Şirket Adı + Künye */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-center">
            {company.logoUrl ? (
              <Image src={company.logoUrl} alt={company.name} fill className="object-cover" unoptimized />
            ) : (
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-display text-base font-bold text-foreground truncate">
                {company.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Doğrulanmış
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
              <span className="font-mono">@{company.slug}</span>
              {company.industry && <span>• {company.industry}</span>}
              {company.city && <span>• {company.city}</span>}
            </div>
          </div>
        </div>

        {/* Orta: Kompakt 4 Metrik Rozeti */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 text-xs font-semibold shrink-0">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>{listingCards.length} İlan</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-900 dark:text-rose-200 text-xs font-semibold shrink-0">
            <Heart className="w-3.5 h-3.5 text-rose-600" />
            <span>{data.followersCount} Takipçi</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs font-semibold shrink-0">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>{data.members.length} Ekip</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-900 dark:text-sky-200 text-xs font-semibold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>{company.status === 'active' ? 'Aktif' : 'Taslak'}</span>
          </div>
        </div>

        {/* Sağ: Aksiyon Butonları */}
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" className="h-8 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
            <Link href="/ilan/olustur?category=ise-al">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Yeni İlan
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 rounded-xl text-xs font-semibold">
            <Link href={`/company/${slug}`} target="_blank">
              <ExternalLink className="w-3 h-3 mr-1" />
              Vitrin
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">
              ← Panel
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. KOMPAKT TEK EKRAN SEKME ÇUBUĞU (~38px) */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-slate-100/90 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80">
        <TabButton
          active={tab === 'listings'}
          onClick={() => handleTabChange('listings')}
          icon={Briefcase}
          label={`İlanlar (${listingCards.length})`}
        />
        <TabButton
          active={tab === 'settings'}
          onClick={() => handleTabChange('settings')}
          icon={Settings}
          label="Şirket Bilgilerini Düzenle"
        />
        <TabButton
          active={tab === 'team'}
          onClick={() => handleTabChange('team')}
          icon={Users}
          label={`Ekip (${data.members.length})`}
        />
        <TabButton
          active={tab === 'verification'}
          onClick={() => handleTabChange('verification')}
          icon={ShieldCheck}
          label="Doğrulama & Belgeler"
        />
        <TabButton
          active={tab === 'followers'}
          onClick={() => handleTabChange('followers')}
          icon={Heart}
          label={`Takipçiler (${data.followersCount})`}
        />
      </div>

      {/* 3. TEK EKRAN KOKPİT ANA İÇERİK ALANI */}
      <div>
        {/* Sekme: İlanlar — Bizim İlan Kart Yapımız ile */}
        {tab === 'listings' && (
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-4 shadow-xs backdrop-blur-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Şirketin Açık İlanları & İlan Havuzu</span>
                </h2>
                <p className="text-xs text-muted-foreground">Şirket adına açılan pozisyonları ve iş ilanlarını tek ekrandan yönetin.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setListingFilter('all')}
                    className={cn(
                      'px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer',
                      listingFilter === 'all'
                        ? 'bg-white dark:bg-zinc-700 text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Tümü ({listingCards.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingFilter('active')}
                    className={cn(
                      'px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer',
                      listingFilter === 'active'
                        ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Yayında ({listingCards.filter((l) => l.status === 'active').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingFilter('unpublished')}
                    className={cn(
                      'px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer',
                      listingFilter === 'unpublished'
                        ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Pasif ({listingCards.filter((l) => l.status !== 'active').length})
                  </button>
                </div>
                <Button asChild size="sm" className="h-7 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                  <Link href="/ilan/olustur?category=ise-al">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    İlan Ekle
                  </Link>
                </Button>
              </div>
            </div>

            {listingCards.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 p-8 text-center bg-slate-50/50 dark:bg-zinc-900/40">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-foreground">Henüz bu şirket adına açılmış bir ilan bulunmuyor.</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Hemen açık bir pozisyon veya iş ilanı yayınlayarak aday başvurularını toplamaya başlayın.
                </p>
                <Button asChild size="sm" className="mt-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs">
                  <Link href="/ilan/olustur?category=ise-al">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    İlk İlanı Yayınla
                  </Link>
                </Button>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 p-6 text-center text-xs text-muted-foreground">
                Seçilen filtreyle eşleşen şirket ilanı bulunamadı.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                {filteredListings.map((listing) => (
                  <AccountListingCard
                    key={listing.id}
                    listing={listing}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onPromote={handlePromote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sekme: Şirket Ayarları (2 Kolonlu Kompakt Form, Tek Ekrana Sığar) */}
        {tab === 'settings' && data.isOwner && (
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-4 sm:p-5 shadow-xs backdrop-blur-md">
            <CompanySettingsForm slug={slug} />
          </div>
        )}

        {/* Sekme: Ekip */}
        {tab === 'team' && (
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-4 sm:p-5 shadow-xs backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Ekip Üyeleri & Yetkiler</span>
                </h3>
                <p className="text-xs text-muted-foreground">Şirket panelini yönetme yetkisine sahip kullanıcılar.</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-semibold gap-1">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Üye Davet Et</span>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.members.map(({ member, profile }) => (
                <div key={member.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {profile?.displayName?.slice(0, 2).toUpperCase() || 'ÜY'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground">{profile?.displayName ?? 'Kullanıcı'}</p>
                      <p className="text-[10px] text-muted-foreground">{member.role === 'owner' ? 'Şirket Sahibi' : 'Yönetici / Ekip Üyesi'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                    {member.role === 'owner' ? 'Sahip' : 'Üye'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sekme: Doğrulama & Belgeler */}
        {tab === 'verification' && (
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-4 sm:p-5 shadow-xs backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Kurumsal Doğrulama & Belgeler</span>
                </h3>
                <p className="text-xs text-muted-foreground">İşletmenizi doğrulayın, yeşil kurumsal güven rozeti kazanın.</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Doğrulanmış İşletme
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">1. Vergi Levhası</span>
                  <span className="text-[10px] font-semibold text-emerald-600">✓ Onaylı</span>
                </div>
                <p className="text-[11px] text-muted-foreground">E-Devlet / GİB üzerinden vergi kimlik numarası eşleştirildi.</p>
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">2. Ticaret Sicil</span>
                  <span className="text-[10px] font-semibold text-emerald-600">✓ Onaylı</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Ana sözleşme ve Sicil Gazetesi kaydı onaylandı.</p>
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">3. Yetkili Temsilci</span>
                  <span className="text-[10px] font-semibold text-emerald-600">✓ Aktif</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Hesap sahibi şirketi temsile yetkili yönetici olarak doğrulandı.</p>
              </div>

              <div className="rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">4. Kurumsal Alan Adı</span>
                  <span className="text-[10px] font-semibold text-emerald-600">✓ Onaylı</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Resmi şirket alan adı uzantılı kurumsal e-posta onaylandı.</p>
              </div>
            </div>
          </div>
        )}

        {/* Sekme: Takipçiler */}
        {tab === 'followers' && (
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-5 shadow-xs backdrop-blur-md text-center space-y-2">
            <Heart className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-lg font-bold text-foreground">{formatNumber(data.followersCount)} Takipçi</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Kullanıcılar şirketinizin açık pozisyonlarını ve yeni ilan güncellemelerini anlık olarak takip edebilir.
            </p>
        )}
      </div>
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
          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 hover:text-slate-900 dark:hover:text-white',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
