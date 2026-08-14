'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInvestmentAi } from '@/features/investments/hooks/use-investment-ai';
import {
  compactInvestmentAiContext,
  investmentAiFingerprint,
  toInvestmentAiSafeContext,
} from '@/features/investments/ai/investment-ai-context';
import { shouldReuseInvestmentAiFingerprint } from '@/features/investments/ai/investment-ai-persist';
import { getInvestmentAiCache } from '@/features/investments/ai/investment-ai-cache';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import type { InvestmentAiAnalysis, InvestmentAiStoredAnalysis } from '@/features/investments/ai/investment-ai.types';
import { buildInvestmentContext, hasInvestmentProfileReady } from '@/features/investments/lib/investment-context';

type PanelView = 'idle' | 'preview' | 'edit' | 'polish';

export function InvestmentAiAnalyzePanel({
  title,
  city,
  customFields,
  longDescription,
  disabled,
  stored,
  onStore,
  onAcceptSummary,
}: {
  title: string;
  city?: string | null;
  customFields: Record<string, unknown>;
  longDescription: string;
  disabled?: boolean;
  stored?: InvestmentAiStoredAnalysis | null;
  onStore: (value: InvestmentAiStoredAnalysis | null) => void;
  onAcceptSummary: (summary: { longDescription: string; shortDescription: string }) => void;
}) {
  const { loading, error, run, cancel } = useInvestmentAi();
  const [local, setLocal] = useState<InvestmentAiAnalysis & { fingerprint: string } | null>(null);
  const [draft, setDraft] = useState('');
  const [polishDraft, setPolishDraft] = useState('');
  const [view, setView] = useState<PanelView>('idle');
  const [piiError, setPiiError] = useState<string | null>(null);
  const [dismissedFingerprint, setDismissedFingerprint] = useState<string | null>(null);

  const context = useMemo(
    () =>
      compactInvestmentAiContext(
        toInvestmentAiSafeContext(buildInvestmentContext({ title, city, customFields })),
      ),
    [city, customFields, title],
  );
  const fingerprint = investmentAiFingerprint(context);
  const profileReady = hasInvestmentProfileReady(
    buildInvestmentContext({ title, city, customFields }),
  );
  const acceptedSame =
    stored?.accepted && shouldReuseInvestmentAiFingerprint(fingerprint, stored.fingerprint)
      ? stored
      : null;
  const cachedAnalyze = getInvestmentAiCache<InvestmentAiAnalysis & { fingerprint?: string }>(
    fingerprint,
  );
  const analysis =
    local?.fingerprint === fingerprint
      ? local
      : acceptedSame
        ? acceptedSame
        : cachedAnalyze?.professionalInvestmentSummary
          ? { ...cachedAnalyze, fingerprint }
          : null;

  const manualText = longDescription.trim();
  const canPolishManual = manualText.length >= 40;

  const applyDraft = useCallback((next: InvestmentAiAnalysis & { fingerprint: string }) => {
    setLocal(next);
    setDraft(next.professionalInvestmentSummary);
    setView((current) => (current === 'edit' || current === 'polish' ? current : 'preview'));
  }, []);

  const startAnalyze = useCallback(async () => {
    setPiiError(null);
    if (!profileReady) return;
    if (analysis?.professionalInvestmentSummary) {
      applyDraft({
        fingerprint,
        professionalInvestmentSummary: analysis.professionalInvestmentSummary,
        shortInvestmentSummary: analysis.shortInvestmentSummary ?? '',
        investmentHighlights: analysis.investmentHighlights ?? [],
        businessModelSummary: analysis.businessModelSummary ?? '',
        fundingUseSummary: analysis.fundingUseSummary ?? '',
        strengths: analysis.strengths ?? [],
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
      professionalInvestmentSummary: result.professionalInvestmentSummary,
      shortInvestmentSummary: result.shortInvestmentSummary,
      investmentHighlights: result.investmentHighlights,
      businessModelSummary: result.businessModelSummary,
      fundingUseSummary: result.fundingUseSummary,
      strengths: result.strengths,
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
      shortDescription: (local?.shortInvestmentSummary || text).slice(0, 500),
    });
    if (local && local.fingerprint === fingerprint) {
      onStore({
        ...local,
        professionalInvestmentSummary: text,
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

  const showRestore = dismissedFingerprint === fingerprint && Boolean(cachedAnalyze?.professionalInvestmentSummary);

  return (
    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/[0.03] px-3 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">AI ile yatırımcı özetini oluştur</p>
        <p className="text-xs text-muted-foreground">
          Tek analiz çağrısı yapılandırılmış veriyi sentezler. Onayınız olmadan özet alanına yazılmaz.
          Aynı profil için tekrar AI çağrılmaz.
        </p>
      </div>

      {loading && view !== 'polish' ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Yatırımcı özeti hazırlanıyor…
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
            AI ile yatırımcı özetini oluştur
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
          Sektör, aşama, iş modeli, problem/çözüm, traction ve yatırım ihtiyacını doldurunca AI kullanılabilir.
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
            {local.professionalInvestmentSummary}
          </p>
          {local.shortInvestmentSummary ? (
            <p className="text-sm text-muted-foreground">{local.shortInvestmentSummary}</p>
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
              onClick={() => handleAccept(local.professionalInvestmentSummary)}
            >
              Kullan
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                setDraft(local.professionalInvestmentSummary);
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
