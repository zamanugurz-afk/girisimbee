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
  MapPin,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Check,
  Globe,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getCompanyService } from '@/lib/persistence/container';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';
import type { UserId } from '@/lib/domain/ids';
import { Button } from '@/components/ui/button';
import { AccountListingCard } from '@/features/account/components/AccountListingCard';
import { mapListingToAccountCard } from '@/features/account/lib/map-listing-to-account-card';
import type {
  AccountListingCardData,
  AccountListingStatus,
} from '@/features/account/types/account-listings.types';
import { CompanySettingsForm } from '@/features/companies/components/company-settings-form';
import { cn, formatNumber } from '@/lib/utils';

interface CompanyDashboardViewProps {
  slug: string;
}

export function CompanyDashboardView({ slug }: CompanyDashboardViewProps) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialSettings = searchParams.get('tab') === 'settings';

  const [data, setData] = useState<PublicCompanyView | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'settings'>(initialSettings ? 'settings' : 'board');
  const [listingCards, setListingCards] = useState<AccountListingCardData[]>([]);
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'unpublished'>('all');

  const handleToggleView = (mode: 'board' | 'settings') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mode === 'settings') {
        url.searchParams.set('tab', 'settings');
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

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
    <div className="space-y-4">
      {/* 1. ÜST NAVİGASYON & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground pb-1 mb-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kullanıcı Paneline Dön</span>
        </Link>
        <div className="flex items-center gap-1.5 font-medium">
          <span>Ana Sayfa</span>
          <span>›</span>
          <span>Şirket Yönetim Paneli</span>
          <span>›</span>
          <span className="font-bold text-foreground">{company.name}</span>
        </div>
      </div>

      {/* 2. ANA 2 KOLONLU KURUMSAL KOKPİT DÜZENİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SOL KOLON: ŞİRKET KİMLİK KARTI & DOĞRULAMA (lg:col-span-4 space-y-4) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Kart 1: Kurumsal Profil Kartı */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden">
            {/* Kapak Görseli / Üst Zemin */}
            <div className="relative h-20 w-full bg-gradient-to-r from-emerald-600/20 via-emerald-500/15 to-teal-500/20 border-b border-slate-100 dark:border-zinc-800 overflow-hidden">
              {company.coverImageUrl && (
                <Image
                  src={company.coverImageUrl}
                  alt={company.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>

            <div className="px-4 pb-4.5 pt-0 relative">
              {/* Logo (Kapak üstüne binen zarif avatar) */}
              <div className="relative -mt-8 mb-3 h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden flex items-center justify-center">
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={company.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <Building2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-display text-lg font-bold text-slate-900 dark:text-foreground">
                    {company.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <CheckCircle2 className="w-3 h-3" />
                    Doğrulandı
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {company.industry || 'Kurumsal İşletme'} · @{company.slug}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{company.city || 'Türkiye'}</span>
                </p>
              </div>

              {company.description && (
                <p className="mt-3 text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-zinc-800/40 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
                  {company.description}
                </p>
              )}

              {/* İletişim / Künye Satırları */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> E-posta:
                  </span>
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {company.contactEmail || user?.email}
                  </span>
                </div>

                {company.website && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" /> Web:
                    </span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-emerald-600 hover:underline flex items-center gap-1 truncate max-w-[150px]"
                    >
                      <span>{company.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Sol Kolon Aksiyon Butonları */}
              <div className="mt-4 space-y-2">
                <Button
                  asChild
                  className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Link href="/ilan/olustur?category=ise-al">
                    <Plus className="h-4 w-4" />
                    <span>Yeni İlan Yayınla</span>
                  </Link>
                </Button>

                <Button
                  type="button"
                  onClick={() => handleToggleView(viewMode === 'settings' ? 'board' : 'settings')}
                  variant="outline"
                  className="w-full h-9 rounded-xl border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>{viewMode === 'settings' ? 'Yönetim Panosuna Dön' : 'Şirket Bilgilerini Düzenle'}</span>
                </Button>

                <Link
                  href={`/company/${slug}`}
                  target="_blank"
                  className="w-full flex items-center justify-center gap-1 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  <span>Genel Şirket Vitrinini Gör</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Kart 2: Kurumsal Güvenlik & Doğrulama Rozetleri */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Kurumsal Güvenlik</span>
              </span>
              <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                Tam Doğrulandı
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                <p className="text-muted-foreground font-medium">Vergi Levhası</p>
                <p className="font-bold text-emerald-600 mt-0.5">✓ Onaylı</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                <p className="text-muted-foreground font-medium">Ticaret Sicil</p>
                <p className="font-bold text-emerald-600 mt-0.5">✓ Onaylı</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                <p className="text-muted-foreground font-medium">Yetkili Temsilci</p>
                <p className="font-bold text-emerald-600 mt-0.5">✓ Aktif</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                <p className="text-muted-foreground font-medium">Kurumsal Domain</p>
                <p className="font-bold text-emerald-600 mt-0.5">✓ Doğrulandı</p>
              </div>
            </div>
          </div>
        </aside>

        {/* SAĞ KOLON: METRİKLER, İLANLAR VE YÖNETİM MODÜLLERİ (lg:col-span-8 space-y-4) */}
        <main className="lg:col-span-8 space-y-4">
          {/* 1. ÜST 4'LÜ KPI METRİK KARTLARI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3.5 shadow-xs flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold text-muted-foreground">Açık İlanlar</p>
                <p className="text-base font-bold text-foreground truncate">{listingCards.length} İlan</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3.5 shadow-xs flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold text-muted-foreground">Takipçiler</p>
                <p className="text-base font-bold text-foreground truncate">{formatNumber(data.followersCount)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3.5 shadow-xs flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold text-muted-foreground">Ekip Üyeleri</p>
                <p className="text-base font-bold text-foreground truncate">{data.members.length} Yetkili</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-3.5 shadow-xs flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold text-muted-foreground">Hesap Durumu</p>
                <p className="text-base font-bold text-foreground truncate">{company.status === 'active' ? 'Aktif' : 'Taslak'}</p>
              </div>
            </div>
          </div>

          {/* 2. MODÜL: EĞER AYARLAR AÇIKSA FORMU GÖSTER, DEĞİLSE KURUMSAL KOKPİTİ GÖSTER */}
          {viewMode === 'settings' ? (
            <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span>Şirket Bilgilerini Düzenle</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Kurumsal detaylarınızı, unvanı, iletişim ve sosyal kanallarınızı güncelleyin.</p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleToggleView('board')}
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  ← Panoya Dön
                </Button>
              </div>
              <CompanySettingsForm slug={slug} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* MODÜL 1: AÇIK İLANLAR & POZİSYON HAVUZU */}
              <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-sm sm:text-[15px] font-bold text-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>Şirketin Açık İlanları & Pozisyon Havuzu</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Şirket adına açılan iş pozisyonlarını ve ilanları tek ekrandan yönetin.</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Filtreler */}
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

                    <Button asChild size="sm" className="h-7.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
                      <Link href="/ilan/olustur?category=ise-al">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        İlan Ekle
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* İlan Kartları Listesi */}
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
                  <div className="grid gap-3 sm:grid-cols-2 items-stretch">
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

              {/* MODÜL 2: EKİP & HIZLI KISAYOLLAR YAN YANA İKİ KART */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ekip Üyeleri Kartı */}
                <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Ekip & Yetkiler</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {data.members.length} Yetkili
                    </span>
                  </div>

                  <div className="space-y-2">
                    {data.members.map(({ member, profile }) => (
                      <div key={member.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-800/40 p-2.5 border border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {profile?.displayName?.slice(0, 2).toUpperCase() || 'ÜY'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-foreground truncate">{profile?.displayName ?? 'Kullanıcı'}</p>
                            <p className="text-[10px] text-muted-foreground">{member.role === 'owner' ? 'Şirket Sahibi' : 'Yönetici'}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shrink-0">
                          {member.role === 'owner' ? 'Sahip' : 'Üye'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hızlı İşlemler Kartı */}
                <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Hızlı İşlemler</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      Kısayollar
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <Link
                      href="/dashboard/ilanlarim"
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tüm Platform İlanlarım</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      href="/dashboard/iletisim-talepleri"
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Gelen İletişim Talepleri</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    <Link
                      href="/dashboard/mesajlarim"
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kurumsal Mesajlarım</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. EN ALT ORTALANMIŞ KÜNYE ŞERİDİ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-3 shadow-xs flex items-center gap-3">
          <Briefcase className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">YAYINDAKİ İLANLAR</p>
            <p className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
              {listingCards.length} Aktif İlan
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-3 shadow-xs flex items-center gap-3">
          <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">FAALİYET SEKTÖRÜ</p>
            <p className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
              {company.industry || 'Genel Sektör'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-3 shadow-xs flex items-center gap-3">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">LOKASYON / ŞEHİR</p>
            <p className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
              {company.city || 'Türkiye'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-3 shadow-xs flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">HESAP STATÜSÜ</p>
            <p className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
              Doğrulanmış İşletme
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
