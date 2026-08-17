'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CareerProfileForm } from '@/features/career-profile/components/career-profile-form';
import {
  CareerPersonaSelector,
  type CareerPersonaKind,
} from '@/features/career-profile/components/career-persona-selector';
import type { CareerProfilePageData, CareerProfileRecord } from '@/features/career-profile/types';
import { emptyCareerProfileValues } from '@/features/career-profile/completion';
import { RefreshCw, Sparkles, Briefcase, Users, Handshake } from 'lucide-react';

function createDraftRecord(kind: CareerPersonaKind): CareerProfileRecord {
  const listingKind = kind === 'hire' ? 'hire' : 'seek';
  const title =
    kind === 'hire'
      ? 'İşe Alım Profilim'
      : kind === 'partner'
        ? 'Ortaklık Profilim'
        : 'İş Arayan Kariyer Profilim';

  return {
    kind: listingKind,
    listingId: `draft-${kind}`,
    title,
    status: 'draft',
    editHref: '/ilan/olustur',
    values: emptyCareerProfileValues(),
    completion: {
      kind: listingKind,
      listingId: `draft-${kind}`,
      percent: 0,
      complete: false,
      fields: [],
      missingLabels: [],
    },
  };
}

export function CareerProfilePage({
  data,
  displayName,
}: {
  data: CareerProfilePageData;
  displayName?: string | null;
}) {
  // Determine initial active persona from existing records or null
  const initialPersona: CareerPersonaKind | null = data.seek
    ? 'seek'
    : data.hire
      ? 'hire'
      : null;

  const [activePersona, setActivePersona] = useState<CareerPersonaKind | null>(initialPersona);
  const [showPersonaSelector, setShowPersonaSelector] = useState(!initialPersona);

  // Active record for the chosen persona
  const currentRecord =
    activePersona === 'hire'
      ? data.hire || createDraftRecord('hire')
      : activePersona === 'partner'
        ? data.partner || createDraftRecord('partner')
        : activePersona === 'seek'
          ? data.seek || createDraftRecord('seek')
          : null;

  const handleSelectPersona = (persona: CareerPersonaKind) => {
    setActivePersona(persona);
    setShowPersonaSelector(false);
  };

  if (showPersonaSelector || !activePersona || !currentRecord) {
    return (
      <div className="py-2">
        <CareerPersonaSelector selected={activePersona} onSelect={handleSelectPersona} />
      </div>
    );
  }

  const personaLabels: Record<CareerPersonaKind, { title: string; badge: string; icon: typeof Briefcase; color: string }> = {
    seek: {
      title: 'İş Arayan & Kariyer Profilim',
      badge: '💼 İş Bulmak İstiyorum',
      icon: Briefcase,
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    },
    hire: {
      title: 'İşveren & İşe Alım Profilim',
      badge: '👥 İşe Almak İstiyorum',
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    },
    partner: {
      title: 'Kurucu Ortak & Girişimcilik Profilim',
      badge: '🤝 Ortaklık Yapmak İstiyorum',
      icon: Handshake,
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    },
  };

  const currentMeta = personaLabels[activePersona];
  const MetaIcon = currentMeta.icon;

  return (
    <div className="min-w-0 space-y-6">
      {/* Top Persona Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <MetaIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-bold text-foreground">
                {currentMeta.title}
              </h2>
              <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${currentMeta.color}`}>
                {currentMeta.badge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bu profil bilgileri, ilan açtığınızda otomatik olarak ilan kartınıza aktarılacaktır.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPersonaSelector(true)}
          className="rounded-xl text-xs gap-1.5 shrink-0 self-start sm:self-auto hover:border-amber-400"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Profil Amacını Değiştir</span>
        </Button>
      </div>

      {/* Career Profile Form */}
      <CareerProfileForm
        record={currentRecord}
        persona={activePersona}
        displayName={displayName}
      />
    </div>
  );
}
