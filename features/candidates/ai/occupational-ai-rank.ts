import 'server-only';

import { getCareerAiCache, setCareerAiCache } from '@/features/candidates/ai/career-ai-cache';
import {
  CAREER_AI_SYSTEM_OCCUPATIONAL,
  occupationalRankPrompt,
} from '@/features/candidates/ai/career-ai-prompts';
import type {
  CareerAiOccupationalRequest,
  CareerAiOccupationalResult,
} from '@/features/candidates/ai/career-ai.types';
import { openaiJsonCompletion } from '@/lib/openai/career-openai';
import { isManualCareerOption, MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import { resolveOccupationalSuggestions } from '@/features/candidates/taxonomy/occupational-suggestions';

function keepCatalog(values: string[] | undefined, catalog: string[], limit: number): string[] {
  const allowed = new Set(catalog.filter((item) => item && !isManualCareerOption(item)));
  const out: string[] = [];
  for (const value of values ?? []) {
    const trimmed = value.trim();
    if (!allowed.has(trimmed) || out.includes(trimmed)) continue;
    out.push(trimmed);
    if (out.length >= limit) break;
  }
  return out;
}

function withManual(values: string[]): string[] {
  return [...values.filter((item) => !isManualCareerOption(item)), MANUAL_OPTION];
}

export async function runCareerAiOccupationalRank(
  input: CareerAiOccupationalRequest,
): Promise<CareerAiOccupationalResult> {
  const deterministic = resolveOccupationalSuggestions({
    audience: input.audience,
    sector: input.sector,
    role: input.role,
    roleOther: input.roleOther,
    experienceLevel: input.experienceLevel,
    totalExperienceYears: input.totalExperienceYears,
    experiences: (input.experienceRoles ?? []).map((role) => ({ role })),
  });

  const fingerprint = input.fingerprint || deterministic.fingerprint;
  if (!deterministic.needsAi) {
    return {
      action: 'occupational',
      source: 'taxonomy',
      professionalSkills: deterministic.professionalSkills,
      technicalSkills: deterministic.technicalSkills,
      tools: deterministic.tools,
      confidence: deterministic.confidence,
      fingerprint,
    };
  }

  const cached = getCareerAiCache<CareerAiOccupationalResult>(fingerprint);
  if (cached) return { ...cached, source: 'cache', fingerprint };

  const professionalCatalog = (input.professionalCatalog.length
    ? input.professionalCatalog
    : deterministic.professionalSkills
  ).filter((item) => !isManualCareerOption(item)).slice(0, 24);
  const technicalCatalog = (input.technicalCatalog.length
    ? input.technicalCatalog
    : deterministic.technicalSkills
  ).filter((item) => !isManualCareerOption(item)).slice(0, 16);
  const toolsCatalog = (input.toolsCatalog.length
    ? input.toolsCatalog
    : deterministic.tools
  ).filter((item) => !isManualCareerOption(item)).slice(0, 16);

  const { json } = await openaiJsonCompletion({
    system: CAREER_AI_SYSTEM_OCCUPATIONAL,
    user: occupationalRankPrompt({
      sector: input.sector ?? '',
      role: input.role ?? '',
      experienceLevel: input.experienceLevel ?? '',
      totalExperienceYears: input.totalExperienceYears ?? null,
      audience: input.audience ?? 'generic',
      experienceRoles: input.experienceRoles ?? [],
      evidence: (input.evidence ?? '').slice(0, 280),
      professionalCatalog,
      technicalCatalog,
      toolsCatalog,
    }),
    maxTokens: 220,
  });
  const record = json && typeof json === 'object' ? (json as Record<string, unknown>) : {};
  const professionalSkills = withManual(
    keepCatalog(record.professionalSkills as string[] | undefined, professionalCatalog, 7),
  );
  const technicalSkills = withManual(
    keepCatalog(record.technicalSkills as string[] | undefined, technicalCatalog, 7),
  );
  const tools = withManual(keepCatalog(record.tools as string[] | undefined, toolsCatalog, 7));
  const confidence = Number(record.confidence);
  const result: CareerAiOccupationalResult = {
    action: 'occupational',
    source: 'ai',
    professionalSkills: professionalSkills.length > 1 ? professionalSkills : deterministic.professionalSkills,
    technicalSkills: technicalSkills.length > 1 ? technicalSkills : deterministic.technicalSkills,
    tools: tools.length > 1 ? tools : deterministic.tools,
    confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : deterministic.confidence,
    fingerprint,
  };
  setCareerAiCache(fingerprint, result);
  return result;
}
