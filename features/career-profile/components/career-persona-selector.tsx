'use client';

import { Briefcase, Users, Handshake, CheckCircle2, ArrowRight } from 'lucide-react';
import type { CareerListingKind } from '@/features/matching-engine/types';

export type CareerPersonaKind = 'seek' | 'hire' | 'partner';

interface PersonaOption {
  kind: CareerPersonaKind;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  benefits: string[];
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    kind: 'seek',
    icon: Briefcase,
    title: 'İş Bulmak İstiyorum',
    badge: 'İş Arayan & Profesyonel',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    description: 'Kendime uygun iş, proje ve kariyer fırsatları arıyorum.',
    benefits: [
      'Girişimler ve şirketlerle anında eşleşin',
      'Yapay zeka uyumluluk skoru ile öne çıkın',
      'İşverenlerden doğrudan iş teklifleri alın',
    ],
  },
  {
    kind: 'hire',
    icon: Users,
    title: 'İşe Almak İstiyorum',
    badge: 'İşveren & Ekip Lideri',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    description: 'Ekibime ve şirketime uygun yetenekli çalışanlar arıyorum.',
    benefits: [
      'Firma isminizi açıkça sergileyerek güven verin',
      'Pozisyona en uygun adaylarla %90+ eşleşin',
      'Adaylarla doğrudan hızlı mesajlaşma başlatın',
    ],
  },
  {
    kind: 'partner',
    icon: Handshake,
    title: 'Ortaklık Yapmak İstiyorum',
    badge: 'Kurucu Ortak & Girişimci',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    description: 'İşime/girişimime ortak arıyor veya bir girişime ortak olmak istiyorum.',
    benefits: [
      'Tamamlayıcı yetkinlikteki kurucu ortakları bulun',
      'Sermaye ve operasyonel ortaklık fırsatları',
      'Gizlilik korumalı tanışma ve iletişim talepleri',
    ],
  },
];

export function CareerPersonaSelector({
  selected,
  onSelect,
}: {
  selected?: CareerPersonaKind | null;
  onSelect: (kind: CareerPersonaKind) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Kariyer Profilinizi Oluşturun
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Girişimbee'de hangi amaçla yer alıyorsunuz? Amacınıza en uygun tekil kariyer profilinizi seçin ve kişiselleştirilmiş eşleşmeleri başlatın.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 max-w-5xl mx-auto pt-2">
        {PERSONA_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.kind;
          return (
            <button
              key={opt.kind}
              type="button"
              onClick={() => onSelect(opt.kind)}
              className={`group relative flex flex-col justify-between text-left rounded-3xl border p-6 transition-all duration-300 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/[0.04] shadow-lg ring-2 ring-amber-500/20 dark:border-amber-400 dark:bg-amber-500/10'
                  : 'border-slate-200/90 bg-white hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold ${opt.badgeColor}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{opt.badge}</span>
                  </span>
                  {isSelected && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {opt.title}
                </h3>

                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {opt.description}
                </p>

                <div className="mt-5 space-y-2 border-t border-border/50 pt-4">
                  {opt.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                <span>{isSelected ? 'Seçildi — Formu Doldur' : 'Bu Profili Seç'}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
