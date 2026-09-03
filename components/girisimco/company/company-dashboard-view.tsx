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
  const urlTab = searchParams.get('tab') as 'all' | 'listings' | 'team' | 'followers' | 'settings' | 'verification' | null;

  const [data, setData] = useState<PublicCompanyView | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'listings' | 'team' | 'followers' | 'settings' | 'verification'>('all');
  const [listingCards, setListingCards] = useState<AccountListingCardData[]>([]);
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'unpublished'>('all');

  const scrollToSection = (sectionId: string) => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleTabChange = (newTab: 'all' | 'listings' | 'team' | 'followers' | 'settings' | 'verification') => {
    setTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newTab === 'all') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', newTab);
      }
      window.history.replaceState({}, '', url.toString());

      const map: Record<string, string> = {
        listings: 'section-listings',
        settings: 'section-settings',
        team: 'section-team',
        verification: 'section-verification',
        followers: 'section-followers',
      };
      if (newTab !== 'all' && map[newTab]) {
        scrollToSection(map[newTab]);
      }
    }
  };

  useEffect(() => {
    if (urlTab && ['listings', 'team', 'followers', 'settings', 'verification'].includes(urlTab)) {
      setTab(urlTab);
      const map: Record<string, string> = {
        listings: 'section-listings',
        settings: 'section-settings',
        team: 'section-team',
        verification: 'section-verification',
        followers: 'section-followers',
      };
      setTimeout(() => {
        if (map[urlTab]) scrollToSection(map[urlTab]);
      }, 150);
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

  return (
    <div className="space-y-6">
      {/* 1. ÜST BAŞLIK & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1.5">
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>← Kullanıcı Paneli</span>
            </Link>
            <span>/</span>
            <span>Şirket Paneli</span>
            <span>/</span>
            <span className="text-foreground">@{company.slug}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {company.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kurumsal hesap bilgilerinizi, açık ilanlarınızı ve ekip üyelerinizi buradan yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* 2. ŞİRKET ÜST BİLGİ HERO KARTI */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-5 sm:p-6 shadow-xs backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
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
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {company.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Doğrulanmış İşletme
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
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
        </div>

        {/* 4 Ana Metrik Kartı — Girisimbee Kart Standartlarında */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-zinc-800">
          <StatCard
            icon={Briefcase}
            label="Yayındaki İlanlar"
            value={formatNumber(listingCards.length)}
            accentColor="emerald"
          />
          <StatCard
            icon={Heart}
            label="Takipçi Sayısı"
            value={formatNumber(data.followersCount)}
            accentColor="rose"
          />
          <StatCard
            icon={Users}
            label="Ekip Üyeleri"
            value={formatNumber(data.members.length)}
            accentColor="amber"
          />
          <StatCard
            icon={ShieldCheck}
            label="Şirket Durumu"
            value={company.status === 'active' ? 'Aktif' : 'Taslak'}
            accentColor="sky"
          />
        </div>
      </div>

      {/* 3. İKİ KOLONLU ANA MİMARİ — TEK SAYFA DÜZENİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SOL GENİŞ ALAN: SEKMELER VE ANA İÇERİK (7/12 KOLON) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Tek Sayfa Sekme / Bölüm Atlama Butonları */}
          <div className="sticky top-4 z-20 flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-xs">
            <TabButton
              active={tab === 'all'}
              onClick={() => handleTabChange('all')}
              icon={LayoutDashboard}
              label="Tüm Sayfa (Tek Ekran)"
            />
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

          {/* 1. İLANLAR BÖLÜMÜ — Bizim İlan Kart Yapımız ile */}
          {(tab === 'all' || tab === 'listings') && (
            <div id="section-listings" className="scroll-mt-20 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-xs backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>Şirketin Açık İlanları & İlan Havuzu</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Şirket adına açılan iş ve kariyer pozisyonlarını yönetin</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Durum Filtre Butonları */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-xs">
                    <button
                      type="button"
                      onClick={() => setListingFilter('all')}
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
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
                        'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
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
                        'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
                        listingFilter === 'unpublished'
                          ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Pasif ({listingCards.filter((l) => l.status !== 'active').length})
                    </button>
                  </div>

                  <Button asChild size="sm" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                    <Link href="/ilan/olustur?category=ise-al">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      İlan Ekle
                    </Link>
                  </Button>
                </div>
              </div>

              {listingCards.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 p-8 text-center bg-white dark:bg-zinc-900/40">
                  <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">Henüz bu şirket adına açılmış bir ilan bulunmuyor.</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Hemen açık bir pozisyon veya iş ilanı yayınlayarak aday başvurularını toplamaya başlayın.
                  </p>
                  <Button asChild size="sm" className="mt-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                    <Link href="/ilan/olustur?category=ise-al">
                      <Plus className="w-4 h-4 mr-1.5" />
                      İlk İlanı Yayınla
                    </Link>
                  </Button>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-8 text-center text-xs text-muted-foreground bg-white dark:bg-zinc-900/40">
                  Seçilen filtreyle eşleşen şirket ilanı bulunamadı.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 items-stretch">
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

          {/* 2. ŞİRKET BİLGİLERİNİ DÜZENLE BÖLÜMÜ */}
          {(tab === 'all' || tab === 'settings') && data.isOwner && (
            <div id="section-settings" className="scroll-mt-20 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-6">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  <span>Şirket Bilgilerini Düzenle</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Logonuzu, kapak görselinizi, kurumsal detaylarınızı ve iletişim kanallarınızı güncelleyin.
                </p>
              </div>
              <CompanySettingsForm slug={slug} />
            </div>
          )}

          {/* 3. EKİP ÜYELERİ & YETKİLER BÖLÜMÜ */}
          {(tab === 'all' || tab === 'team') && (
            <div id="section-team" className="scroll-mt-20 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-xs backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Ekip Üyeleri & Yetkiler</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Şirket panelini yönetme yetkisine sahip kullanıcılar</p>
                </div>
                <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold gap-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Üye Davet Et</span>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {data.members.map(({ member, profile }) => (
                  <div key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                        {profile?.displayName?.slice(0, 2).toUpperCase() || 'ÜY'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{profile?.displayName ?? 'Kullanıcı'}</p>
                        <p className="text-xs text-muted-foreground">{member.role === 'owner' ? 'Şirket Sahibi' : 'Yönetici / Ekip Üyesi'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                      {member.role === 'owner' ? 'Sahip' : 'Üye'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. DOĞRULAMA & BELGELER BÖLÜMÜ */}
          {(tab === 'all' || tab === 'verification') && (
            <div id="section-verification" className="scroll-mt-20 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xs backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Kurumsal Doğrulama & Belgeler</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Girişimbee üzerinde işletmenizi doğrulayın, yeşil kurumsal güven rozeti kazanın.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  Doğrulanmış İşletme
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">1. Vergi Levhası Doğrulaması</span>
                    <span className="text-[11px] font-semibold text-emerald-600">✓ Onaylandı</span>
                  </div>
                  <p className="text-xs text-muted-foreground">E-Devlet / GİB üzerinden şirket vergi kimlik numarası doğrulanmıştır.</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">2. Ticaret Sicil / MERSİS Kaydı</span>
                    <span className="text-[11px] font-semibold text-emerald-600">✓ Onaylandı</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Şirket ana sözleşmesi ve Ticaret Sicil Gazetesi ilanı eşleşmiştir.</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">3. Yetkili Temsilci & İmza</span>
                    <span className="text-[11px] font-semibold text-emerald-600">✓ Aktif</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Hesap sahibi şirketi temsile yetkili yönetici olarak doğrulanmıştır.</p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">4. Kurumsal Alan Adı & E-posta</span>
                    <span className="text-[11px] font-semibold text-emerald-600">✓ Doğrulandı</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Şirketin resmi alan adı uzantılı kurumsal e-posta adresi onaylandı.</p>
                </div>
              </div>
            </div>
          )}

          {/* 5. TAKİPÇİLER & İLGİ BÖLÜMÜ */}
          {(tab === 'all' || tab === 'followers') && (
            <div id="section-followers" className="scroll-mt-20 rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-xs backdrop-blur-md space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Takipçiler & Kurumsal İlgi</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Şirket ilanlarını ve kurumsal güncellemelerini takip eden kullanıcılar</p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 p-8 text-center">
                <Heart className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <p className="text-xl font-bold text-foreground">{formatNumber(data.followersCount)} Takipçi</p>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
                  Kullanıcılar şirketinizin açık pozisyonlarını ve yeni ilanlarını anlık olarak takip edebilir.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SAĞ YAN KOLON: KURUMSAL KİMLİK & KISAYOLLAR (5/12 KOLON) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 sticky top-24">
          
          {/* 1. Kurumsal Kimlik & İletişim Kartı */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-xs backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                Kurumsal Kimlik
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Onaylı
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-zinc-800/60">
                <span className="text-muted-foreground">Şirket Ünvanı</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">{company.name}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-zinc-800/60">
                <span className="text-muted-foreground">Kullanıcı Adı</span>
                <span className="font-mono font-semibold text-foreground">@{company.slug}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-zinc-800/60">
                <span className="text-muted-foreground">Sektör</span>
                <span className="font-semibold text-foreground">{company.industry || 'Belirtilmedi'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-zinc-800/60">
                <span className="text-muted-foreground">Konum / Şehir</span>
                <span className="font-semibold text-foreground">{company.city || 'Belirtilmedi'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-zinc-800/60">
                <span className="text-muted-foreground">İletişim E-posta</span>
                <span className="font-semibold text-foreground truncate max-w-[160px]">{company.contactEmail || 'Belirtilmedi'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-zinc-800/60">
                <span className="text-muted-foreground">Web Sitesi</span>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 hover:underline flex items-center gap-1">
                    <span>{company.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">Yok</span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Hızlı Kısayollar Kartı */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 shadow-xs backdrop-blur-md space-y-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 pb-3 border-b border-slate-100 dark:border-zinc-800">
              Hızlı Eylemler
            </h3>

            <div className="space-y-2">
              <Link
                href={`/ilan/olustur?category=ise-al`}
                className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 font-semibold text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Şirket Adına İlan Yayınla</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                href={`/company/${slug}`}
                target="_blank"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-slate-900 dark:text-zinc-200 font-semibold text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <span>Genel Şirket Vitrinini Gör</span>
                </div>
                <span>↗</span>
              </Link>

              <button
                type="button"
                onClick={() => handleTabChange('settings')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-slate-900 dark:text-zinc-200 font-semibold text-xs transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Şirket Bilgilerini Düzenle</span>
                </div>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* 3. Kurumsal Güvenlik & Doğrulama Rozeti */}
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Kurumsal Doğrulama Güvencesi
                </h4>
                <p className="text-[11.5px] text-emerald-800/80 dark:text-emerald-300/70 mt-1 leading-relaxed">
                  Şirketiniz Girişimbee doğrulanmış işletmeler listesinde yer alır. İlanlarınız adaylar ve yatırımcılar tarafından öncelikli listelenir.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accentColor = 'emerald',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accentColor?: 'emerald' | 'rose' | 'amber' | 'sky';
}) {
  const colorMap = {
    emerald: {
      border: 'border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-400',
      bg: 'bg-emerald-50/20 dark:bg-emerald-950/20',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    rose: {
      border: 'border-rose-200/80 dark:border-rose-900/40 hover:border-rose-400',
      bg: 'bg-rose-50/20 dark:bg-rose-950/20',
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    amber: {
      border: 'border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400',
      bg: 'bg-amber-50/20 dark:bg-amber-950/20',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    sky: {
      border: 'border-sky-200/80 dark:border-sky-900/40 hover:border-sky-400',
      bg: 'bg-sky-50/20 dark:bg-sky-950/20',
      iconBg: 'bg-sky-500/10 dark:bg-sky-500/20',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
  };
  const theme = colorMap[accentColor];

  return (
    <div
      className={cn(
        'group flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md bg-white dark:bg-zinc-900/80',
        theme.border,
        theme.bg,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
          {label}
        </span>
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110',
            theme.iconBg,
            theme.iconColor,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 font-display text-xl sm:text-2xl font-bold tabular-nums text-slate-950 dark:text-white">
        {value}
      </p>
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
