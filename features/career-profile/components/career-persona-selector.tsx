'use client';

import { Briefcase, Users, Handshake, CheckCircle2, ArrowRight, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type CareerPersonaKind = 'seek' | 'hire' | 'partner';

interface PersonaOption {
  kind: CareerPersonaKind;
  title: string;
  description: string;
  color: string;
  Icon: LucideIcon;
  ctaLabel: string;
  benefits: readonly { title: string; text: string }[];
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    kind: 'seek',
    title: 'İş Bulmak İstiyorum',
    description: 'Kendime uygun iş, proje ve kariyer fırsatları arıyorum.',
    color: '#10B981', // Emerald green
    Icon: Briefcase,
    ctaLabel: 'İş Bulmak İstiyorum',
    benefits: [
      {
        title: 'İş ve Proje Eşleşmesi',
        text: 'Girişimler ve şirketlerle anında eşleşin; uygun fırsatlara ulaşın.',
      },
      {
        title: 'Yapay Zeka Uyumluluk Skoru',
        text: 'Yetkinlik ve deneyimlerinizle işveren aramalarında öne çıkın.',
      },
      {
        title: 'Doğrudan İş Teklifleri',
        text: 'İletişim bilgileriniz korunarak doğrudan teklif ve mesajlar alın.',
      },
    ],
  },
  {
    kind: 'hire',
    title: 'İşe Almak İstiyorum',
    description: 'Ekibime ve şirketime uygun yetenekli çalışanlar arıyorum.',
    color: '#0EA5E9', // Sky blue
    Icon: Users,
    ctaLabel: 'İşe Almak İstiyorum',
    benefits: [
      {
        title: 'Nitelikli Yetenek Havuzu',
        text: 'Pozisyona ve kriterlerinize en uygun adaylarla %90+ eşleşin.',
      },
      {
        title: 'Güvenilir Şirket Profili',
        text: 'Firma isminizi sergileyerek adaylara kurumsal güven verin.',
      },
      {
        title: 'Hızlı İletişim ve Teklif',
        text: 'Aday profillerini inceleyin ve doğrudan mesajlaşma başlatın.',
      },
    ],
  },
  {
    kind: 'partner',
    title: 'Ortaklık Yapmak İstiyorum',
    description: 'İşime/girişimime ortak arıyor veya bir girişime ortak olmak istiyorum.',
    color: '#F59E0B', // Amber orange
    Icon: Handshake,
    ctaLabel: 'Ortaklık Yapmak İstiyorum',
    benefits: [
      {
        title: 'Kurucu Ortak Eşleşmesi',
        text: 'Tamamlayıcı yetkinlikteki kurucu ortakları kolayca bulun.',
      },
      {
        title: 'Sermaye ve Efor Ortaklığı',
        text: 'Sermaye veya operasyonel modellerle ortaklıklar kurun.',
      },
      {
        title: 'Gizlilik Korumalı İletişim',
        text: 'Detaylarınız korunarak onaylı tanışma talepleriyle ilerleyin.',
      },
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
    <section className="mb-10">
      <header className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="rounded-full px-3.5 py-1 text-xs font-semibold">
          Kariyer Profili
        </Badge>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]">
          Kariyer Profilinizi Oluşturun
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] dark:text-muted-foreground sm:text-[15px]">
          Girişimbee'de hangi amaçla yer alıyorsunuz? Amacınıza en uygun tekil kariyer profilinizi seçin
          ve kişiselleştirilmiş eşleşmeleri başlatın.
        </p>
      </header>

      <div className="mt-10 lg:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch max-w-6xl mx-auto">
          {PERSONA_OPTIONS.map((opt) => {
            const Icon = opt.Icon;
            const isSelected = selected === opt.kind;

            return (
              <div
                key={opt.kind}
                className={cn(
                  'group relative flex flex-col justify-between h-full w-full rounded-3xl border bg-gradient-to-b from-card to-card/70 p-6 sm:p-7 shadow-xs overflow-hidden text-left transition-all duration-300',
                  'hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_20px_35px_rgba(0,0,0,0.5)]',
                  isSelected
                    ? 'ring-2 ring-amber-500/40 shadow-lg'
                    : 'border-border/70 dark:border-border dark:bg-card',
                )}
                style={{ borderColor: `${opt.color}40` }}
              >
                {/* Background ambient subtle blur accent */}
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-[80px] opacity-[0.04] transition-opacity duration-500 group-hover:opacity-[0.08]"
                  style={{ backgroundColor: opt.color }}
                />

                <div>
                  {/* Top Large Rounded Icon Box */}
                  <div
                    className="flex items-center justify-center rounded-2xl h-24 sm:h-28 w-full transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ backgroundColor: `${opt.color}0D` }}
                    aria-hidden
                  >
                    <span
                      className="flex items-center justify-center rounded-2xl text-white shadow-sm h-14 w-14"
                      style={{ backgroundColor: opt.color }}
                    >
                      <Icon className="h-7 w-7" strokeWidth={2} />
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="mt-5 font-display text-xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-[22px]">
                    {opt.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-muted-foreground">
                    {opt.description}
                  </p>

                  {/* Benefits List */}
                  <ul className="mt-6 space-y-3.5 sm:space-y-4">
                    {opt.benefits.map((benefit) => (
                      <li key={benefit.title} className="flex gap-3 text-left">
                        <CheckCircle2
                          className="mt-0.5 shrink-0 h-5 w-5"
                          style={{ color: opt.color }}
                          aria-hidden
                        />
                        <div>
                          <p className="font-semibold leading-snug text-[#0B1220] dark:text-foreground text-sm">
                            {benefit.title}
                          </p>
                          <p className="leading-relaxed text-[#64748B] dark:text-muted-foreground mt-0.5 text-[13px]">
                            {benefit.text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Full-Width CTA Button */}
                <div className="mt-8 pt-2">
                  <span
                    className="inline-flex w-full items-center justify-center rounded-2xl py-3.5 px-4 font-semibold text-white shadow-sm transition-all hover:scale-100 group-hover:brightness-105"
                    style={{ backgroundColor: opt.color }}
                  >
                    {opt.ctaLabel}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>

                {/* Clickable Overlay Button */}
                <button
                  type="button"
                  onClick={() => onSelect(opt.kind)}
                  className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                  aria-label={opt.title}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
