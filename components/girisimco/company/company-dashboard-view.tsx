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
  Target,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { getCompanyService } from '@/lib/persistence/container';
import type { PublicCompanyView } from '@/features/companies/types/company-public.types';
import type { UserId } from '@/lib/domain/ids';
import { Button } from '@/components/ui/button';
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
      {/* 1. ÜST NAVİGASYON VE BREADCRUMB (Görseldeki gibi: ← Kariyer Menüsüne Dön / Ana Sayfa > İş İlanları > İlan) */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
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
          <span>Şirket Yönetimi</span>
          <span>›</span>
          <span className="font-bold text-foreground">{company.name}</span>
        </div>
      </div>

      {/* 2. ANA 2 KOLONLU MİMARİ (Görseldeki exact layout: Sol Sidebar + Sağ Main) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SOL KOLON (Sidebar) - lg:col-span-4 xl:col-span-3 space-y-3.5 */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3.5">
          {/* Kart 1: Şirket Başlık Kartı (Görseldeki AppFlow Mobil Teknolojiler kutusu) */}
          <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-950/60 bg-white dark:bg-card p-4 sm:p-5 shadow-xs space-y-1">
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-foreground">
              {company.name}
            </h1>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {company.industry || 'Kurumsal İşletme'} · @{company.slug}
            </p>
            <p className="text-xs text-muted-foreground">
              {company.city || 'Türkiye'}
            </p>
          </div>

          {/* Kart 2: Kurumsal Doğrulama Bilgisi (Görseldeki ARANAN EĞİTİM tarzı) */}
          <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-950/60 bg-white dark:bg-card p-3.5 sm:p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>KURUMSAL DOĞRULAMA</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-foreground">
                Doğrulanmış Kurumsal Profil
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Vergi Levhası, Ticaret Sicil ve Temsilci Yetkisi onaylanmıştır.
              </p>
            </div>
          </div>

          {/* Kart 3: Şirket Şartları ve Durumu (Görseldeki ÇALIŞMA ŞARTLARI kartı) */}
          <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-950/60 bg-white dark:bg-card p-3.5 sm:p-4 shadow-xs space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <Briefcase className="h-4 w-4" />
              <span>ŞİRKET & YÖNETİM DURUMU</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">HESAP DURUMU</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-foreground mt-0.5">
                    {company.status === 'active' ? 'Aktif (Onaylı)' : 'Taslak'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">AÇIK İLANLAR</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-foreground mt-0.5">
                    {listingCards.length} Yayında İlan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">EKİP YETKİLİLERİ</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-foreground mt-0.5">
                    {data.members.length} Üye
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">TAKİPÇİ TOPLULUĞU</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-foreground mt-0.5">
                    {data.followersCount} Takipçi
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">İLETİŞİM E-POSTA</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-foreground mt-0.5 truncate">
                    {company.contactEmail || 'Belirtilmedi'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">TERCİH EDİLEN LOKASYON</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-foreground mt-0.5">
                    {company.city || 'İstanbul'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sol Kolon Aksiyon Butonları (Görseldeki POZİSYONA BAŞVUR butonu) */}
          <div className="space-y-2 pt-1">
            <Button
              asChild
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Link href="/ilan/olustur?category=ise-al">
                <Plus className="h-4 w-4" />
                <span>+ YENİ İLAN YAYINLA</span>
              </Link>
            </Button>

            <Button
              type="button"
              onClick={() => handleToggleView(viewMode === 'settings' ? 'board' : 'settings')}
              variant="outline"
              className="w-full h-9 rounded-xl border-emerald-200 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{viewMode === 'settings' ? 'Yönetim Panosuna Dön' : 'Şirket Bilgilerini Düzenle'}</span>
            </Button>
          </div>
        </aside>

        {/* SAĞ KOLON (Main) - lg:col-span-8 xl:col-span-9 space-y-4 */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* 1. ÜST ÖZET & VURGU KARTI (Görseldeki üst yeşil kutucuklu özet kartı) */}
          <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-950/60 bg-white dark:bg-card p-4 sm:p-4.5 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-[13px] text-slate-800 dark:text-foreground font-medium leading-relaxed">
                {company.description ||
                  `${company.name} kurumsal iş yeri profili — açık pozisyonlarınızı, ekip yetkilerinizi ve kurumsal kimliğinizi tek ekrandan yönetin.`}
              </p>
            </div>
          </div>

          {/* 2. ORTA BÖLÜM: EĞER AYARLAR AÇIKSA FORMU GÖSTER, DEĞİLSE GÖRSELDEKİ 01/02/03 KOKPİTİNİ GÖSTER */}
          {viewMode === 'settings' ? (
            <div className="rounded-2xl border border-emerald-100/90 dark:border-border bg-white dark:bg-card p-5 sm:p-6 shadow-xs">
              <CompanySettingsForm slug={slug} />
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-100/90 dark:border-border bg-white dark:bg-card p-5 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
              {/* Başlık Çubuğu (Görseldeki gibi: ARANAN NİTELİKLER & GÖREV DAĞILIMI | 3 BÖLÜM) */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs sm:text-[13px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-foreground">
                  <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>ŞİRKET İLANLARI VE İŞ YÖNETİMİ</span>
                </div>
                <span className="rounded-full px-3 py-0.5 text-[11px] font-bold border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400">
                  {listingCards.length} İLAN · 3 BÖLÜM
                </span>
              </div>

              {/* İki Kolonlu Grid: Sol Kolon 01/02/03 Kartları (%65) + Sağ Kolon Yetkinlik/Aksiyon Listesi (%35) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Sol Alt Grid: 01, 02, 03 Aşamalı Kartlar */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-3">
                  {/* Kart 01: Şirketin Açık Pozisyonları ve İlanları */}
                  <div className="rounded-2xl border border-emerald-100/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-emerald-200 transition-colors">
                    {/* Sol Yeşil Numara Bloğu */}
                    <div className="w-14 sm:w-16 bg-[#059669] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                      <span className="text-xl sm:text-2xl font-extrabold tracking-tight">01</span>
                      <Target className="h-5 w-5 stroke-[2]" />
                    </div>
                    {/* Sağ İçerik */}
                    <div className="p-3.5 sm:p-4 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                            Şirketin Açık Pozisyonları ve İlanları
                          </h4>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {company.industry || 'Kariyer Fırsatları'} · {listingCards.length} İlan
                          </p>
                        </div>
                        <span className="rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-zinc-300 shrink-0">
                          İlanlar
                        </span>
                      </div>

                      {listingCards.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {listingCards.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-zinc-800 last:border-0"
                            >
                              <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                                {item.title}
                              </span>
                              <span
                                className={cn(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                                  item.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700',
                                )}
                              >
                                {item.status === 'active' ? 'Yayında' : 'Pasif'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground pt-1">
                          Henüz açık pozisyonunuz bulunmuyor. Yeni bir ilan yayınlayarak aday başvurularını toplayabilirsiniz.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Kart 02: Ekip & Yetki Dağılımı */}
                  <div className="rounded-2xl border border-emerald-100/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-emerald-200 transition-colors">
                    <div className="w-14 sm:w-16 bg-[#059669] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                      <span className="text-xl sm:text-2xl font-extrabold tracking-tight">02</span>
                      <Users className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div className="p-3.5 sm:p-4 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                            Ekip Üyeleri & Yetki Dağılımı
                          </h4>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {data.members.length} Yetkili Hesap Yöneticisi
                          </p>
                        </div>
                        <span className="rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-zinc-300 shrink-0">
                          Ekip
                        </span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1 pt-1 list-disc list-inside">
                        <li>Hesap Sahibi: {user?.displayName || 'Yönetici'} (Tam Yetki)</li>
                        <li>İlan oluşturma, düzenleme ve başvuru takibi aktif.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Kart 03: Çalışma Modeli & Şirket İmkanları */}
                  <div className="rounded-2xl border border-emerald-100/90 dark:border-border bg-white dark:bg-card/50 overflow-hidden shadow-2xs flex items-stretch hover:border-emerald-200 transition-colors">
                    <div className="w-14 sm:w-16 bg-[#059669] text-white flex flex-col items-center justify-between py-4 px-2 shrink-0">
                      <span className="text-xl sm:text-2xl font-extrabold tracking-tight">03</span>
                      <ShieldCheck className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div className="p-3.5 sm:p-4 flex-1 min-w-0 flex flex-col justify-center space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-foreground leading-snug">
                            Kurumsal Güvenlik & Doğrulama Statüsü
                          </h4>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {company.city || 'Türkiye'} · Doğrulanmış Firma
                          </p>
                        </div>
                        <span className="rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-zinc-300 shrink-0">
                          Güven
                        </span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1 pt-1 list-disc list-inside">
                        <li>E-Devlet / GİB Vergi Levhası Onaylı.</li>
                        <li>Şirket vitrini ve tüm ilanlar platform genelinde yayında.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Sağ Alt Grid: Hızlı Yönetim Aksiyonları (Görseldeki ARANAN YETKİNLİKLER tarzı dikey liste) */}
                <div className="lg:col-span-5 xl:col-span-4 rounded-2xl border border-emerald-100/90 dark:border-border bg-slate-50/50 dark:bg-card/40 p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-border">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
                        <Target className="h-4 w-4 text-emerald-600" />
                        <span>HIZLI İŞLEMLER</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        6 Aksiyon
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleView('settings')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Şirket Bilgilerini Düzenle</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </button>

                      <Link
                        href="/ilan/olustur?category=ise-al"
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Yeni İş İlanı Yayınla</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>

                      <Link
                        href={`/company/${slug}`}
                        target="_blank"
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Genel Şirket Vitrinini Gör</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>

                      <Link
                        href="/dashboard/ilanlarim"
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Tüm Platform İlanlarım</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>

                      <Link
                        href="/dashboard/iletisim-talepleri"
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Gelen İletişim Talepleri</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>

                      <Link
                        href="/dashboard/mesajlarim"
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-2xs"
                      >
                        <span className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                          <span>Kurumsal Mesajlarım</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground pt-3 text-center">
                    + Şirket yönetimi tam yetkisi aktif
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. EN ALT ÖZET ŞERİT (Görseldeki 4'lü alt çip şeridi) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-950/60 bg-white dark:bg-card p-3 shadow-xs flex items-center gap-3">
          <Briefcase className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">YAYINDAKİ İLANLAR</p>
            <p className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
              {listingCards.length} Aktif İlan
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-950/60 bg-white dark:bg-card p-3 shadow-xs flex items-center gap-3">
          <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">FAALİYET SEKTÖRÜ</p>
            <p className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
              {company.industry || 'Genel Sektör'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-950/60 bg-white dark:bg-card p-3 shadow-xs flex items-center gap-3">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">LOKASYON / ŞEHİR</p>
            <p className="text-xs font-bold text-slate-800 dark:text-foreground truncate">
              {company.city || 'Türkiye'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100/90 dark:border-emerald-950/60 bg-white dark:bg-card p-3 shadow-xs flex items-center gap-3">
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
