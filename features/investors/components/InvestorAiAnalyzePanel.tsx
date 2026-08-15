'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInvestorAi } from '@/features/investors/hooks/use-investor-ai';
import {
  compactInvestorAiContext,
  investorAiFingerprint,
  toInvestorAiSafeContext,
} from '@/features/investors/ai/investor-ai-context';
import { shouldReuseInvestorAiFingerprint } from '@/features/investors/ai/investor-ai-persist';
import { getInvestorAiCache } from '@/features/investors/ai/investor-ai-cache';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import type { InvestorAiAnalysis, InvestorAiStoredAnalysis } from '@/features/investors/ai/investor-ai.types';
import {
  buildInvestorCriteriaContext,
  hasInvestorProfileReady,
} from '@/features/investors/lib/investor-criteria';

type PanelView = 'idle' | 'preview' | 'edit' | 'polish';

export function InvestorAiAnalyzePanel({
  title,
  customFields,
  longDescription,
  disabled,
  stored,
  onStore,
  onAcceptSummary,
}: {
  title: string;
  customFields: Record<string, unknown>;
  longDescription: string;
  disabled?: boolean;
  stored?: InvestorAiStoredAnalysis | null;
  onStore: (value: InvestorAiStoredAnalysis | null) => void;
  onAcceptSummary: (summary: { longDescription: string; shortDescription: string }) => void;
}) {
  const { loading, error, run, cancel } = useInvestorAi();
  const [local, setLocal] = useState<InvestorAiAnalysis & { fingerprint: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [polishDraft, setPolishDraft] = useState('');
  const [view, setView] = useState<PanelView>('idle');
  const [piiError, setPiiError] = useState<string | null>(null);
  const [dismissedFingerprint, setDismissedFingerprint] = useState<string | null>(null);

  const context = useMemo(
    () =>
      compactInvestorAiContext(
        toInvestorAiSafeContext(buildInvestorCriteriaContext({ title, customFields })),
      ),
    [customFields, title],
  );
  const fingerprint = investorAiFingerprint(context);
  const profileReady = hasInvestorProfileReady(
    buildInvestorCriteriaContext({ title, customFields }),
  );
  const acceptedSame =
    stored?.accepted && shouldReuseInvestorAiFingerprint(fingerprint, stored.fingerprint)
      ? stored
      : null;
  const cachedAnalyze = getInvestorAiCache<InvestorAiAnalysis & { fingerprint?: string }>(
    fingerprint,
  );
  const analysis =
    local?.fingerprint === fingerprint
      ? local
      : acceptedSame
        ? acceptedSame
        : cachedAnalyze?.professionalInvestorSummary
          ? { ...cachedAnalyze, fingerprint }
          : null;

  const manualText = longDescription.trim();
  const canPolishManual = manualText.length >= 40;

  const applyDraft = useCallback((next: InvestorAiAnalysis & { fingerprint: string }) => {
    setLocal(next);
    setDraft(next.professionalInvestorSummary);
    setView((current) => (current === 'edit' || current === 'polish' ? current : 'preview'));
  }, []);

  const startAnalyze = useCallback(async () => {
    setPiiError(null);
    if (!profileReady) return;
    if (analysis?.professionalInvestorSummary) {
      applyDraft({
        fingerprint,
        professionalInvestorSummary: analysis.professionalInvestorSummary,
        shortInvestorSummary: analysis.shortInvestorSummary ?? '',
        investmentThesis: analysis.investmentThesis ?? '',
        investmentHighlights: analysis.investmentHighlights ?? [],
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
      professionalInvestorSummary: result.professionalInvestorSummary,
      shortInvestorSummary: result.shortInvestorSummary,
      investmentThesis: result.investmentThesis,
      investmentHighlights: result.investmentHighlights,
      profileGaps: result.profileGaps,
      improvementSuggestions: result.improvementSuggestions,
    });
  }, [analysis, applyDraft, context, fingerprint, profileReady, run]);

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
    });
    if (!result || result.action !== 'polish') return;
    setPolishDraft(result.polished);
    setView('polish');
  }

  function handleAccept(summary: string) {
    const text = summary.trim();
    if (!text) return;
    onAcceptSummary({
      longDescription: text,
      shortDescription: (local?.shortInvestorSummary || text).slice(0, 500),
    });
    if (local && local.fingerprint === fingerprint) {
      onStore({
        ...local,
        professionalInvestorSummary: text,
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

  const showRestore = dismissedFingerprint === fingerprint && Boolean(cachedAnalyze?.professionalInvestorSummary);

  return (
    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/[0.03] px-3 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">AI ile yatırımcı profilimi oluştur</p>
        <p className="text-xs text-muted-foreground">
          Tek analiz çağrısı mevcut kriterleri sentezler. Onayınız olmadan özet alanına yazılmaz.
          Aynı profil için tekrar AI çağrılmaz.
        </p>
      </div>

      {loading && view !== 'polish' ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Yatırımcı profili hazırlanıyor…
          <Button type="button" variant="ghost" size="sm" onClick={cancel}>
            İptal
          </Button>
        </p>
      ) : null}

      {view === 'idle' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={disabled || loading || !profileReady}
            onClick={() => void startAnalyze()}
          >
            AI ile yatırımcı profilimi oluştur
          </Button>
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

      {!profileReady ? (
        <p className="text-xs text-muted-foreground">
          Kimlik, sektör, aşama ve yatırım biletini doldurunca AI kullanılabilir.
        </p>
      ) : null}
      {piiError ? <p className="text-xs text-destructive">{piiError}</p> : null}
      {error ? (
        <p className="text-xs text-destructive">
          {error.includes('manuel')
            ? error
            : 'AI özeti şu anda oluşturulamadı. Yatırımcı özetinizi manuel olarak yazabilirsiniz.'}
        </p>
      ) : null}

      {view === 'preview' && local && local.fingerprint === fingerprint ? (
        <div className="space-y-3">
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {local.professionalInvestorSummary}
          </p>
          {local.shortInvestorSummary ? (
            <p className="text-sm text-muted-foreground">{local.shortInvestorSummary}</p>
          ) : null}
          {local.investmentHighlights.length > 0 ? (
            <ul className="list-disc space-y-0.5 pl-4 text-sm">
              {local.investmentHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => handleAccept(local.professionalInvestorSummary)}
            >
              Kullan
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                setDraft(local.professionalInvestorSummary);
                setView('edit');
              }}
            >
              Düzenle
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={handleReject}>
              Kullanma / Manuel yaz
            </Button>
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
              Kullan
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setView('preview')}>
              Vazgeç
            </Button>
          </div>
        </div>
      ) : null}

      {view === 'polish' ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Yazım ve anlatım düzeltmesi (yeni kriter eklenmez).</p>
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
                onAcceptSummary({
                  longDescription: polishDraft.trim(),
                  shortDescription: polishDraft.trim().slice(0, 500),
                });
                setView('idle');
              }}
            >
              Kullan
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
