'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Wrench,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Building2,
  Share2,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ListingDetail, ServiceCardData } from '@/features/listings/types/listing.types';
import { toast } from 'sonner';

interface ServiceListingDetailViewProps {
  listing: ListingDetail;
}

export function ServiceListingDetailView({ listing }: ServiceListingDetailViewProps) {
  const [isPulsing, setIsPulsing] = useState(true);
  const card: ServiceCardData = listing.serviceCard ?? {};

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const phone = card.contactPhone || listing.contactPhone || '0555 000 00 00';
  const whatsapp = card.contactWhatsapp || listing.contactWhatsapp || phone;
  const cleanPhone = phone.replace(/\s+/g, '');
  const cleanWhatsapp = whatsapp.replace(/\s+/g, '').replace(/^0/, '90');

  const services = card.servicesList && card.servicesList.length > 0
    ? card.servicesList
    : [
        'Kaçak Su Tespiti ve Termal Kamera ile İnceleme',
        'Sıhhi Tesisat Boru Değişimi ve Montajı',
        'Klozet, Batarya ve Musluk Tamiri',
        'Petek ve Radyatör Kimyasal Temizliği',
        'Gider Tıkanıklığı Açma (Robotlu Sistem)',
      ];

  const districts = card.serviceDistricts && card.serviceDistricts.length > 0
    ? card.serviceDistricts
    : ['Kadıköy', 'Üsküdar', 'Ataşehir', 'Ümraniye', 'Maltepe', 'Kartal'];

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      void navigator.clipboard.writeText(window.location.href);
      toast.success('İlan bağlantısı kopyalandı.');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 2 SÜTUNLU RESPONSIVE IZGARA (SOL: ESNAF KARTI, SAĞ: 01/02/03 AŞAMALI İÇERİK) */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)] gap-5">
        
        {/* ========================================================================= */}
        {/* SOL SÜTUN / ESNAF BİLGİ KARTI VE HIZLI İLETİŞİM                          */}
        {/* ========================================================================= */}
        <aside className="space-y-4">
          
          {/* 1. Usta ve İşletme Profil Kartı */}
          <div className="rounded-2xl border border-indigo-100 bg-white p-4 sm:p-5 shadow-sm dark:border-indigo-950/60 dark:bg-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-base font-bold text-slate-900 dark:text-foreground">
                    {card.craftsmanTitle || listing.title}
                  </h3>
                  <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="truncate text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {card.serviceCategory || 'Elektrik ve Tesisat'}
                </p>
              </div>
            </div>

            <hr className="my-3.5 border-slate-100 dark:border-border/80" />

            {/* Rozetler: Doğrulanmış Usta ve 7/24 Acil */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Doğrulanmış Esnaf ve Usta</span>
              </div>

              {card.emergency247 !== false && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                  <Zap className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>7/24 Acil Çağrı ve Gece Servisi</span>
                </div>
              )}
            </div>

            {/* Bilgi Listesi */}
            <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Şehir / Merkez:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {listing.location || 'İstanbul (Anadolu)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Deneyim:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {card.experienceYears || '15 Yıl'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Garanti:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {card.warrantyDuration || '1 Yıl İşçilik Garantili'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Fiyat Modeli:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {card.pricingType || 'Ücretsiz Keşif'}
                </span>
              </div>
            </div>

            {/* 15sn Pulse Efektli İletişim Butonları */}
            <div className="mt-5 space-y-2.5 pt-2">
              <a
                href={`tel:${cleanPhone}`}
                className={cn(
                  'w-full h-11 rounded-xl px-4 text-xs sm:text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
                  isPulsing && 'animate-pulse-gentle ring-2 ring-offset-1 ring-indigo-500/50 shadow-md',
                )}
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span>USTAYI ARA: {phone}</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                  `Merhaba, Girişimbee üzerindeki ${listing.title} ilanınız için yazıyorum. Fiyat ve bilgi alabilir miyim?`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-xl px-4 text-xs font-bold tracking-wide flex items-center justify-center gap-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60 transition-colors"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>WHATSAPP İLE YAZ</span>
              </a>
            </div>
          </div>

          {/* Çalışma Saatleri ve Adres Kutusu */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Çalışma Saatleri</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {card.workingHours || '7/24 Acil Servis ve Gece Açık (Haftanın 7 Günü)'}
            </p>
            {card.workshopAddress && (
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Atölye / Dükkan:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {card.workshopAddress}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* SAĞ SÜTUN / 01, 02, 03 AŞAMALI HİZMET VE UZMANLIK DETAYLARI               */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          
          {/* İlan Başlığı ve Üst Bilgi Kartı */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white border-none px-3 py-1 text-xs font-bold">
                {card.serviceCategory || 'Esnaf ve Hizmetler'}
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Paylaş</span>
                </Button>
              </div>
            </div>

            <h1 className="mt-3 font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground">
              {listing.title}
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {listing.shortDescription || listing.longDescription}
            </p>
          </div>

          {/* 01 / Hizmet Kapsamı ve Uzmanlık Alanları */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-card space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-extrabold text-white shadow-sm">
                01
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  Hizmet Kapsamı ve Uzmanlık Alanları
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ustanın bizzat yaptığı garantili iş kalemleri
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs font-semibold text-slate-800 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-slate-200"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 02 / Yapılan İşler ve Referans Fotoğrafları */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-card space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-extrabold text-white shadow-sm">
                02
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  Yapılan İşler ve İşçilik Referansları
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Uygulama öncesi ve sonrası tamamlanan projeler
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {listing.gallery && listing.gallery.length > 0 ? (
                listing.gallery.map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.label || `İş Referansı ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Wrench className="h-6 w-6 opacity-40" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-center text-xs text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-300">
                  Fotoğraf ve referanslar talep üzerine WhatsApp ile doğrudan iletilmektedir.
                </div>
              )}
            </div>
          </div>

          {/* 03 / Hizmet Bölgeleri ve Ulaşım Süresi */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-zinc-800 dark:bg-card space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-extrabold text-white shadow-sm">
                03
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground">
                  Hizmet Verilen Bölgeler ve İlçeler
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ustanın mobil servis aracıyla aynı gün hizmet verdiği ilçeler
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {districts.map((district, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300 shadow-2xs"
                >
                  <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{district}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Sütunlu Alt Özet Şeridi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-card text-center">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Deneyim</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground mt-0.5">
                {card.experienceYears || '15+ Yıl'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-card text-center">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Servis Türü</p>
              <p className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                Mobil ve Yerinde
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-card text-center">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Acil Servis</p>
              <p className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                7/24 Aktif
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-card text-center">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Keşif</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                Ücretsiz Keşif
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
