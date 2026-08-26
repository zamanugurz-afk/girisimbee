'use client';

import React from 'react';
import {
  Briefcase,
  Code2,
  Percent,
  Sparkles,
  Users,
  Wrench,
  Clock,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PartnershipCardData } from '@/features/listings/types/listing.types';
import { cn } from '@/lib/utils';

interface PartnershipProfilePreviewProps {
  partnership: PartnershipCardData;
  className?: string;
}

export function PartnershipProfilePreview({
  partnership,
  className,
}: PartnershipProfilePreviewProps) {
  const {
    sector,
    stage,
    partnershipTypes = [],
    partnershipTypesOther,
    professionalSkills = [],
    professionalSkillsOther,
    technicalSkills = [],
    technicalSkillsOther,
    tools = [],
    toolsOther,
    commitment,
    equityOffered,
  } = partnership;

  const allPartnershipTypes = [
    ...partnershipTypes,
    ...(partnershipTypesOther ? [partnershipTypesOther] : []),
  ];

  const allProfessionalSkills = [
    ...professionalSkills,
    ...(professionalSkillsOther ? [professionalSkillsOther] : []),
  ];

  const allTechnicalSkills = [
    ...technicalSkills,
    ...(technicalSkillsOther ? [technicalSkillsOther] : []),
  ];

  const allTools = [
    ...tools,
    ...(toolsOther ? [toolsOther] : []),
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. Özet Vurgu Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {sector ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Building2 className="h-3.5 w-3.5 text-amber-600" />
              <span>Sektör</span>
            </div>
            <div className="text-sm font-semibold text-foreground truncate">{sector}</div>
          </div>
        ) : null}

        {stage ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Girişim Aşaması</span>
            </div>
            <div className="text-sm font-semibold text-foreground truncate">{stage}</div>
          </div>
        ) : null}

        {commitment ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Çalışma Modeli</span>
            </div>
            <div className="text-sm font-semibold text-foreground truncate">{commitment}</div>
          </div>
        ) : null}

        {equityOffered !== undefined && equityOffered !== null && String(equityOffered) !== '' ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Percent className="h-3.5 w-3.5 text-amber-600" />
              <span>Sunulan Hisse</span>
            </div>
            <div className="text-sm font-semibold text-foreground truncate">%{String(equityOffered)}</div>
          </div>
        ) : null}
      </div>

      {/* 2. Aranan Ortaklık Modelleri ve Türleri */}
      {allPartnershipTypes.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Aranan Ortaklık Modelleri ve Türleri</h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {allPartnershipTypes.map((type, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20 text-xs px-3 py-1.5 rounded-xl font-medium"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                {type}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {/* 3. Aranan Mesleki ve Yönetsel Yetkinlikler */}
      {allProfessionalSkills.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Aranan Mesleki ve Yönetsel Yetkinlikler</h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {allProfessionalSkills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/20 text-xs px-3 py-1.5 rounded-xl font-medium"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {/* 4. Aranan Teknik ve Sektörel Uzmanlıklar */}
      {allTechnicalSkills.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Code2 className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Aranan Teknik ve Sektörel Uzmanlıklar</h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {allTechnicalSkills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20 text-xs px-3 py-1.5 rounded-xl font-medium"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {/* 5. Kullanılan / Aranan Araçlar ve Teknolojiler */}
      {allTools.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Wrench className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Kullanılan Araçlar, Teknolojiler ve Ekipmanlar</h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {allTools.map((tool, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-purple-500/10 text-purple-800 dark:text-purple-300 border-purple-500/20 text-xs px-3 py-1.5 rounded-xl font-medium"
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
