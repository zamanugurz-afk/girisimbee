'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCareerAi } from '@/features/candidates/hooks/use-career-ai';
import {
  buildCareerAiSafeContext,
  fingerprintCanonical,
  hasCareerAiProfileReady,
} from '@/features/candidates/ai/career-ai-context';
import { decideCareerAiAutoAnalyze } from '@/features/candidates/ai/career-ai-auto';
import { shouldReuseCareerAiFingerprint } from '@/features/candidates/ai/career-ai-persist';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import type { CareerAiAnalysis, CareerAiStoredAnalysis } from '@/features/candidates/ai/career-ai.types';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import { estimateTotalExperienceYears } from '@/features/candidates/lib/career-experience-dates';
import { isManualCareerOption } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  getCareerAiCache,
  hasCareerAiAutoAnalyzeRequested,
  markCareerAiAutoAnalyzeRequested,
} from '@/features/candidates/ai/career-ai-cache';

type PanelView = 'idle' | 'preview' | 'edit' | 'polish';

export function CareerAiAnalyzePanel({
  customFields,
  longDescription,
  disabled,
  stored,
  onStore,
  onAcceptSummary,
}: {
  customFields: Record<string, unknown>;
  longDescription: string;
  disabled?: boolean;
  stored?: CareerAiStoredAnalysis | null;
  onStore: (value: CareerAiStoredAnalysis | null) => void;
  onAcceptSummary: (summary: string) => void;
}) {
  const { loading, error, run, cancel } = useCareerAi();
  const [local, setLocal] = useState<CareerAiAnalysis & { fingerprint: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [polishDraft, setPolishDraft] = useState('');
  const [view, setView] = useState<PanelView>('idle');
  const [piiError, setPiiError] = useState<string | null>(null);
  const [dismissedFingerprint, setDismissedFingerprint] = useState<string | null>(null);

  const desiredRole = isManualCareerOption(customFields.desiredRole)
    ? String(customFields.desiredRoleOther ?? '')
    : String(customFields.desiredRole ?? '');
  const experiences = Array.isArray(customFields.experiences)
    ? (customFields.experiences as CareerExperience[])
    : [];
  const totalExperienceYears = estimateTotalExperienceYears(experiences);

  const context = useMemo(
    () =>
      buildCareerAiSafeContext({
        primarySector: String(customFields.primarySector ?? ''),
        desiredRole,
        experienceLevel: String(customFields.experienceLevel ?? ''),
        professionalSkills: String(customFields.professionalSkills ?? ''),
        technicalSkills: String(customFields.technicalSkills ?? ''),
        educationLevel: String(customFields.educationLevel ?? ''),
        educationField: String(customFields.educationField ?? ''),
        certificates: String(customFields.certificates ?? ''),
        languages: customFields.languageEntries ?? customFields.languages,
        experiences,
        totalExperienceYears,
      }),
    [customFields, desiredRole, experiences, totalExperienceYears],
  );
  const fingerprint = fingerprintCanonical(context);
  const profileReady = hasCareerAiProfileReady(context);
  const acceptedSame = stored?.accepted && shouldReuseCareerAiFingerprint(fingerprint, stored.fingerprint)
    ? stored
    : null;
  const cachedAnalyze = getCareerAiCache<CareerAiAnalysis & { fingerprint?: string }>(fingerprint);
  const analysis =
    local?.fingerprint === fingerprint
      ? local
      : acceptedSame
        ? acceptedSame
        : cachedAnalyze?.professionalSummary
          ? { ...cachedAnalyze, fingerprint }
          : null;

  const manualText = longDescription.trim();
  const canPolishManual = manualText.length >= 40;

  const applyDraft = useCallback((next: CareerAiAnalysis & { fingerprint: string }) => {
    setLocal(next);
    setDraft(next.professionalSummary);
    setView((current) => (current === 'edit' || current === 'polish' ? current : 'preview'));
  }, []);

  const startAnalyze = useCallback(async () => {
    setPiiError(null);
    if (!profileReady) return;
    if (analysis?.professionalSummary) {
      applyDraft({
        fingerprint,
        professionalSummary: analysis.professionalSummary,
        shortSummary: analysis.shortSummary ?? '',
        strengths: analysis.strengths ?? [],
        highlightedAchievements: analysis.highlightedAchievements ?? [],
        profileGaps: analysis.profileGaps ?? [],
        improvementSuggestions: analysis.improvementSuggestions ?? [],
      });
      return;
    }
    const result = await run({
      action: 'analyze',
      context,
      fingerprint,
    });
    if (!result || result.action !== 'analyze') return;
    applyDraft({
      fingerprint: result.fingerprint,
      professionalSummary: result.professionalSummary,
      shortSummary: result.shortSummary,
      strengths: result.strengths,
      highlightedAchievements: result.highlightedAchievements,
      profileGaps: result.profileGaps,
      improvementSuggestions: result.improvementSuggestions,
    });
  }, [analysis, applyDraft, context, fingerprint, profileReady, run]);

  const viewRef = useRef(view);
  viewRef.current = view;
  const analysisRef = useRef(analysis);
  analysisRef.current = analysis;
  const startAnalyzeRef = useRef(startAnalyze);
  startAnalyzeRef.current = startAnalyze;

  useEffect(() => {
    const current = analysisRef.current;
    const decision = decideCareerAiAutoAnalyze({
      profileReady,
      disabled,
      fingerprint,
      dismissedFingerprint,
      hasCachedResult: Boolean(current?.professionalSummary),
      alreadyRequested: hasCareerAiAutoAnalyzeRequested(fingerprint),
    });
    if (decision === 'skip') return;
    if (decision === 'show-cached') {
      if (current?.professionalSummary && viewRef.current !== 'edit' && viewRef.current !== 'polish') {
        applyDraft({
          fingerprint,
          professionalSummary: current.professionalSummary,
          shortSummary: current.shortSummary ?? '',
          strengths: current.strengths ?? [],
          highlightedAchievements: current.highlightedAchievements ?? [],
          profileGaps: current.profileGaps ?? [],
          improvementSuggestions: current.improvementSuggestions ?? [],
        });
      }
      return;
    }
    if (!markCareerAiAutoAnalyzeRequested(fingerprint)) return;
    void startAnalyzeRef.current();
  }, [applyDraft, disabled, dismissedFingerprint, fingerprint, profileReady]);

  async function handlePolishManual() {
    setPiiError(null);
    const prepared = prepareTextForCareerAi(manualText, 24);
    if (prepared.blocked) {
      setPiiError('Kişisel iletişim bilgisi AI isteğine eklenemez. Telefon, e-posta veya açık adresi silin.');
      return;
    }
    const result = await run({
      action: 'polish',
      kind: 'summary',
      text: prepared.text,
      role: context.desiredRole,
      sector: context.primarySector,
      experienceLevel: context.experienceLevel,
      totalExperienceYears: context.totalExperienceYears,
    });
    if (!result || result.action !== 'polish') return;
    setPolishDraft(result.polished);
    setView('polish');
  }

  function handleAccept(summary: string) {
    const text = summary.trim();
    if (!text) return;
    onAcceptSummary(text);
    if (local && local.fingerprint === fingerprint) {
      onStore({
        ...local,
        professionalSummary: text,
        accepted: true,
      });
    }
    setView('idle');
  }

  function handleReject() {
    setLocal(null);
    setDraft('');
    setPolishDraft('');
    setDismissedFingerprint(fingerprint);
    setView('idle');
    onStore(null);
  }

  const showRestore = dismissedFingerprint === fingerprint && Boolean(cachedAnalyze?.professionalSummary);

  return (
    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/[0.03] px-3 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Kariyer özeti</p>
        <p className="text-xs text-muted-foreground">
          Profiliniz yeterli olduğunda AI taslağı otomatik hazırlanır. Onayınız olmadan kariyer
          özeti alanına yazılmaz.
        </p>
      </div>

      {loading && view !== 'polish' ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Kariyer özeti hazırlanıyor…
          <Button type="button" variant="ghost" size="sm" onClick={cancel}>
            İptal
          </Button>
        </p>
      ) : null}

      {view === 'idle' ? (
        <div className="flex flex-wrap gap-2">
          {showRestore ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || loading}
              onClick={() => {
                setDismissedFingerprint(null);
                void startAnalyze();
              }}
            >
              Kayıtlı AI taslağını göster
            </Button>
          ) : null}
          {error && !loading ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || !profileReady}
              onClick={() => void startAnalyze()}
            >
              Tekrar dene
            </Button>
          ) : null}
          {canPolishManual ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || loading}
              onClick={() => void handlePolishManual()}
            >
              AI ile iyileştir
            </Button>
          ) : null}
        </div>
      ) : null}

      {piiError ? <p className="text-xs text-destructive">{piiError}</p> : null}
      {error ? (
        <p className="text-xs text-destructive">
          {error.includes('manuel')
            ? error
            : 'AI özeti şu anda oluşturulamadı. Kariyer özetinizi manuel olarak yazabilirsiniz.'}
        </p>
      ) : null}

      {view === 'preview' && local && local.fingerprint === fingerprint ? (
        <div className="space-y-3">
          <p className="whitespace-pre-wrap text-sm text-foreground">{local.professionalSummary}</p>
          <p className="text-xs text-muted-foreground">
            AI tarafından profil bilgileriniz kullanılarak oluşturuldu.
          </p>
          {local.shortSummary ? (
            <p className="text-sm text-muted-foreground">{local.shortSummary}</p>
          ) : null}
          {local.strengths.length > 0 ? (
            <ul className="list-disc space-y-0.5 pl-4 text-sm">
              {local.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => handleAccept(local.professionalSummary)}
            >
              ✓ Kullan
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                setDraft(local.professionalSummary);
                setView('edit');
              }}
            >
              ✏ Düzenle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || loading}
              onClick={() => void startAnalyze()}
            >
              ↻ Yeniden oluştur
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={handleReject}>
              Kullanma / Manuel yaz
            </Button>
            {canPolishManual ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || loading}
                onClick={() => void handlePolishManual()}
              >
                AI ile iyileştir
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {view === 'edit' && local ? (
        <div className="space-y-2">
          <Textarea
            rows={6}
            value={draft}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={disabled || !draft.trim()}
              onClick={() => handleAccept(draft)}
            >
              ✓ Kullan
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setView('preview')}>
              Vazgeç
            </Button>
          </div>
        </div>
      ) : null}

      {view === 'polish' ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Yazım ve anlatım düzeltmesi (yeni bilgi eklenmez).</p>
          <Textarea
            rows={6}
            value={polishDraft}
            disabled={disabled}
            onChange={(event) => setPolishDraft(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={disabled || !polishDraft.trim()}
              onClick={() => {
                onAcceptSummary(polishDraft.trim());
                setView('idle');
              }}
            >
              ✓ Kullan
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setView('idle')}>
              Kullanma
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
