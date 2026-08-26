'use client';

import Link from 'next/link';
import { ArrowLeft, Building2, Handshake } from 'lucide-react';
import { CareerFlowChoiceCards } from '@/components/girisimco/home/career-flow-choice-cards';
import {
  VENTURE_PARTNERSHIP_HUB,
  VENTURE_PARTNERSHIP_OPTIONS,
} from '@/components/girisimco/home/home-marketplace.data';
import { Badge } from '@/components/ui/badge';

const VENTURE_VISUALS = {
  'ortak-ariyorum': {
    color: VENTURE_PARTNERSHIP_OPTIONS[0].color,
    Icon: Handshake,
  },
  'isletme-devri': {
    color: VENTURE_PARTNERSHIP_OPTIONS[1].color,
    Icon: Building2,
  },
} as const;

export function VenturePartnershipLanding() {
  return (
    <div className="gc-header-offset bg-[#FAFBFC] dark:bg-background">
      <div className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-16">
        <header className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[13px] font-semibold">
            {VENTURE_PARTNERSHIP_HUB.badge}
          </Badge>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl lg:text-[2rem]">
            {VENTURE_PARTNERSHIP_HUB.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
            {VENTURE_PARTNERSHIP_HUB.description}
          </p>
          <div className="mt-3 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] transition-colors hover:text-[#0B1220] dark:hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Kategorilere dön
            </Link>
          </div>
        </header>

        <div className="mt-10 lg:mt-12">
          <CareerFlowChoiceCards
            options={VENTURE_PARTNERSHIP_OPTIONS}
            visuals={VENTURE_VISUALS}
            columns={2}
          />
        </div>
      </div>
    </div>
  );
}
