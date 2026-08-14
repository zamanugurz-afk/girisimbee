'use client';

import { useEffect, useState } from 'react';
import { useCareerAi } from '@/features/candidates/hooks/use-career-ai';
import { isManualCareerOption } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  buildOccupationalContext,
  type OccupationalProfileInput,
} from '@/features/candidates/taxonomy/occupational-context';
import type { OccupationalSuggestionResult } from '@/features/candidates/taxonomy/occupational-suggestions';

function withoutManual(values: string[]): string[] {
  return values.filter((item) => !isManualCareerOption(item));
}

/** One optional rank call when deterministic confidence is low. Never writes into the profile. */
export function useOccupationalSuggestionCatalog(
  deterministic: OccupationalSuggestionResult,
  input: OccupationalProfileInput,
): OccupationalSuggestionResult {
  const { run } = useCareerAi();
  const [ranked, setRanked] = useState(deterministic);

  useEffect(() => {
    setRanked(deterministic);
    if (!deterministic.needsAi) return undefined;
    let cancelled = false;
    const context = buildOccupationalContext(input);
    void run({
      action: 'occupational',
      fingerprint: deterministic.fingerprint,
      sector: input.sector ?? undefined,
      role: input.role ?? undefined,
      roleOther: input.roleOther ?? undefined,
      experienceLevel: input.experienceLevel ?? undefined,
      totalExperienceYears: input.totalExperienceYears ?? null,
      audience: input.audience,
      experienceRoles: (input.experiences ?? [])
        .map((item) => String(item.role ?? ''))
        .filter(Boolean)
        .slice(0, 8),
      evidence: context.evidenceText.slice(0, 280),
      professionalCatalog: withoutManual(deterministic.professionalSkills).slice(0, 24),
      technicalCatalog: withoutManual(deterministic.technicalSkills).slice(0, 16),
      toolsCatalog: withoutManual(deterministic.tools).slice(0, 16),
    }).then((result) => {
      if (cancelled || !result || result.action !== 'occupational') return;
      setRanked({
        ...deterministic,
        professionalSkills: result.professionalSkills,
        technicalSkills: result.technicalSkills,
        tools: result.tools,
        confidence: result.confidence,
        source: 'taxonomy',
        needsAi: false,
      });
    });
    return () => {
      cancelled = true;
    };
    // Re-run only when the occupational fingerprint changes — not on every chip toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deterministic.fingerprint, deterministic.needsAi, run]);

  return deterministic.needsAi ? ranked : deterministic;
}
