'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Heart,
  PlusCircle,
  Briefcase,
  Settings,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GirisimbeeLogo } from '@/components/girisimco/logo';

interface CompanySidebarProps {
  slug: string;
}

export function CompanySidebar({ slug }: CompanySidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'listings';

  const isOverview = pathname === `/company/${slug}/dashboard` && !searchParams.get('tab');
  const isSettings = pathname === `/company/${slug}/settings`;

  const SECTIONS = [
    {
      title: 'ŞİRKET YÖNETİMİ',
      items: [
        {
          id: 'overview',
          label: 'Genel Bakış & İlanlar',
          href: `/company/${slug}/dashboard`,
          icon: LayoutDashboard,
          active: pathname === `/company/${slug}/dashboard` && activeTab === 'listings',
        },
        {
          id: 'preview',
          label: 'Şirket Vitrini (Önizle)',
          href: `/company/${slug}`,
          icon: Building2,
          external: true,
          active: pathname === `/company/${slug}`,
        },
        {
          id: 'team',
          label: 'Ekip & Yetkiler',
          href: `/company/${slug}/dashboard?tab=team`,
          icon: Users,
          active: activeTab === 'team',
        },
        {
          id: 'followers',
          label: 'Takipçiler & İlgi',
          href: `/company/${slug}/dashboard?tab=followers`,
          icon: Heart,
          active: activeTab === 'followers',
        },
      ],
    },
    {
      title: 'İLAN & İŞLEMLER',
      items: [
        {
          id: 'post-job',
          label: 'Yeni İlan Yayınla',
          href: `/ilan/olustur?category=ise-al`,
          icon: PlusCircle,
          badge: 'Yeni',
          active: false,
        },
        {
          id: 'listings',
          label: 'İlan Havuzu',
          href: `/company/${slug}/dashboard?tab=listings`,
          icon: Briefcase,
          active: activeTab === 'listings',
        },
      ],
    },
    {
      title: 'KURUMSAL AYARLAR',
      items: [
        {
          id: 'settings',
          label: 'Şirket Bilgilerini Düzenle',
          href: `/company/${slug}/dashboard?tab=settings`,
          icon: Settings,
          active: activeTab === 'settings',
        },
        {
          id: 'verification',
          label: 'Doğrulama & Belgeler',
          href: `/company/${slug}/dashboard?tab=verification`,
          icon: ShieldCheck,
          active: activeTab === 'verification',
        },
      ],
    },
  ];

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
      {/* Top Branding Card */}
      <div className="border-b border-slate-100 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <GirisimbeeLogo className="font-display text-lg font-bold tracking-tight" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20">
            <Building2 className="h-3 w-3" />
            Şirket Paneli
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Kullanıcı Paneline Dön
          </Link>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3" aria-label="Şirket paneli menüsü">
        {SECTIONS.map((section, idx) => (
          <div key={section.title || idx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase">
              {section.title}
            </h2>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.active;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    className={cn(
                      'group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
                      active
                        ? 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-300 font-bold border-l-3 border-emerald-500 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-white',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105',
                          active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500',
                        )}
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.badge}
                      </span>
                    ) : item.external ? (
                      <ExternalLink className="h-3 w-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info Box */}
      <div className="border-t border-slate-100 dark:border-zinc-800 p-3.5 bg-slate-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span className="truncate">Yetkili Yönetici</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Şirket ID: @{slug}</span>
          <Link href="/" className="hover:underline text-slate-500 dark:text-zinc-400">
            Platforma dön →
          </Link>
        </div>
      </div>
    </aside>
  );
}
