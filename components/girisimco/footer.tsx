'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, ArrowUpRight } from 'lucide-react';
import { SiteLogo, BRAND_TAGLINE } from '@/features/shared';
import { CONTACT_EMAILS } from '@/features/shared/constants/contact';
import { BrandWordmark } from '@/components/girisimco/brand-wordmark';
import { cn } from '@/lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navigationSections = [
    {
      title: 'KEŞFET',
      links: [
        { label: 'Kariyer ve İş Fırsatları', href: '/is' },
        { label: 'Ortaklık ve Devir', href: '/girisim-ortaklik' },
        { label: 'Franchise ve Bayilik', href: '/franchise/buy' },
        { label: 'Ustalar ve Hizmetler', href: '/kategori/hizmetler' },
        { label: 'Girişimbee Market', href: '/market' },
        { label: 'Dijital ve AI Çözümler', href: '/dijital-ai' },
      ],
    },
    {
      title: 'PLATFORM',
      links: [
        { label: 'İlan Ver', href: '/ilan/olustur' },
        { label: 'İlanlarım', href: '/hesabim/ilanlarim' },
        { label: 'Favorilerim', href: '/hesabim/favorilerim' },
        { label: 'Giriş Yap', href: '/giris' },
        { label: 'Kayıt Ol', href: '/kayit' },
      ],
    },
    {
      title: 'YASAL VE GÜVENLİK',
      links: [
        { label: 'Kullanıcı Sözleşmesi', href: '/yasal/kullanici-sozlesmesi' },
        { label: 'Gizlilik Politikası', href: '/yasal/gizlilik' },
        { label: 'KVKK Aydınlatma Metni', href: '/yasal/kvkk-aydinlatma' },
        { label: 'Açık Rıza Metni', href: '/yasal/acik-riza' },
        { label: 'Çerez Tercihleri', href: '/yasal/cerez-tercihleri' },
      ],
    },
  ];

  return (
    <footer className="relative z-10 border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl pt-12 pb-8 sm:pt-16 sm:pb-10">
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-8">
        
        {/* Üst Ana Izgara */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          
          {/* Sol Kolon: Marka ve İletişim */}
          <div className="lg:col-span-5 flex flex-col justify-between pr-0 lg:pr-8">
            <div>
              <SiteLogo />
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed max-w-sm">
                {BRAND_TAGLINE}
              </p>

              <div className="mt-6 space-y-2.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Destek ve İletişim
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={`mailto:${CONTACT_EMAILS.support}`}
                    className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{CONTACT_EMAILS.support}</span>
                  </a>
                  <a
                    href={`mailto:${CONTACT_EMAILS.ads}`}
                    className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>{CONTACT_EMAILS.ads}</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/60 flex items-center gap-4 text-xs font-medium text-zinc-500">
              <Link href="/destek" className="hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors">
                <span>Destek Merkezi</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-400" />
              </Link>
              <span>·</span>
              <Link href="/reklam" className="hover:text-zinc-900 dark:hover:text-zinc-100 inline-flex items-center gap-1 transition-colors">
                <span>Reklam ve İş Birliği</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Sağ Kolonlar: Keşfet, Platform, Yasal ve Güvenlik */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60 dark:divide-zinc-800/60">
            {navigationSections.map((section, idx) => (
              <div
                key={section.title}
                className={cn(
                  'flex flex-col gap-3.5 py-4 sm:py-0',
                  idx === 0 ? 'sm:pr-6 sm:pl-0' : idx === 1 ? 'sm:px-6' : 'sm:pl-6 sm:pr-0'
                )}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Alt Bilgi Çubuğu (Bottom Bar) */}
        <div className="mt-12 pt-6 border-t border-slate-200/70 dark:border-zinc-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
            &copy; {currentYear} <BrandWordmark />. Tüm hakları saklıdır. KVKK Korumalı Platform.
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Güvenli ve Doğrulanmış Ağ</span>
            </span>
            <span>·</span>
            <span className="text-zinc-400 dark:text-zinc-500">TR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
