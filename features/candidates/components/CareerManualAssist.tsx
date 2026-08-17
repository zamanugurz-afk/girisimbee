'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Wand2, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCareerAi } from '@/features/candidates/hooks/use-career-ai';
import type { CareerAiManualKind } from '@/features/candidates/ai/career-ai.types';
import { matchTaxonomyOptions } from '@/features/candidates/ai/match-taxonomy';
import { findCareerTextQualityIssue } from '@/features/candidates/lib/career-text-quality';
import { prepareTextForCareerAi } from '@/features/candidates/ai/career-ai-pii';
import {
  needsSemanticCareerPolish,
  polishCareerManualDeterministic,
} from '@/features/candidates/ai/career-ai-deterministic-polish';
import { careerAiPolishFingerprint } from '@/features/candidates/ai/career-ai-context';
import { getCareerAiCache, setCareerAiCache } from '@/features/candidates/ai/career-ai-cache';
import type { CareerAiPolishResult } from '@/features/candidates/ai/career-ai.types';

export function CareerManualAssist({
  kind,
  text,
  catalog,
  metric,
  sector,
  role,
  experienceLevel,
  disabled,
  onAcceptCatalog,
  onAcceptPolished,
}: {
  kind: CareerAiManualKind;
  text: string;
  catalog?: string[];
  metric?: string;
  sector?: string;
  role?: string;
  experienceLevel?: string;
  disabled?: boolean;
  onAcceptCatalog?: (items: string[]) => void;
  onAcceptPolished?: (text: string) => void;
}) {
  const { loading, error, run, reset, cancel } = useCareerAi();
  const [draft, setDraft] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [taxonomySuggestions, setTaxonomySuggestions] = useState<string[] | null>(null);
  const [piiError, setPiiError] = useState<string | null>(null);
  const [showPolish, setShowPolish] = useState(false);
  const minLength = kind === 'role' || kind === 'education' || kind === 'certificate' ? 2 : 10;
  const qualityIssue = findCareerTextQualityIssue(text, {
    fieldLabel: 'Manuel giriş',
    minLength,
    maxLength: 2000,
    required: true,
  });

  const canSuggest = Boolean(onAcceptCatalog) && (catalog?.length ?? 0) > 0;
  const canPolish = Boolean(onAcceptPolished) && (kind === 'responsibility' || kind === 'achievement');

  function handleSuggest() {
    if (!canSuggest || qualityIssue) return;
    setPiiError(null);
    const prepared = prepareTextForCareerAi(text, minLength);
    if (prepared.blocked) {
      setTaxonomySuggestions(null);
      setPiiError('Kişisel iletişim bilgisi AI isteğine eklenemez.');
      return;
    }
    const suggestions = matchTaxonomyOptions(prepared.text, catalog ?? [], 6);
    setTaxonomySuggestions(suggestions);
    setPicked(suggestions);
    reset();
  }

  async function handlePolish() {
    if (!canPolish || qualityIssue) return;
    setPiiError(null);
    const prepared = prepareTextForCareerAi(text, 8);
    if (prepared.blocked) {
      setPiiError('Kişisel iletişim bilgisi AI isteğine eklenemez.');
      return;
    }
    setTaxonomySuggestions(null);
    const polishKind = kind === 'achievement' ? 'achievement' : 'responsibility';
    const fingerprint = careerAiPolishFingerprint({
      kind: polishKind,
      text: prepared.text,
      metric,
      role,
      experienceLevel,
    });
    const cached = getCareerAiCache<CareerAiPolishResult>(fingerprint);
    if (cached?.polished) {
      setDraft(cached.polished);
      setShowPolish(true);
      return;
    }
    if (!needsSemanticCareerPolish(prepared.text, polishKind)) {
      const polished = polishCareerManualDeterministic(polishKind, prepared.text, metric);
      setCareerAiCache(fingerprint, {
        action: 'polish',
        source: 'deterministic',
        polished,
        fingerprint,
      });
      setDraft(polished);
      setShowPolish(true);
      return;
    }
    const next = await run({
      action: 'polish',
      kind: polishKind,
      text: prepared.text,
      metric,
      role,
      experienceLevel,
    });
    if (next?.action === 'polish') {
      setDraft(next.polished);
      setShowPolish(true);
    }
  }

  const polishResult = showPolish;
  const suggestResult = taxonomySuggestions;

  return (
    <div className="space-y-2.5 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-primary/5 to-transparent p-3 transition-all">
      <div className="flex flex-wrap items-center gap-2">
        {canSuggest ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || loading || Boolean(qualityIssue)}
            onClick={handleSuggest}
            className="h-8 gap-1.5 rounded-xl border-amber-500/40 bg-white/90 px-3 text-xs font-medium text-amber-700 shadow-2xs hover:bg-amber-500/10 dark:border-amber-500/30 dark:bg-zinc-900 dark:text-amber-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>✨ Yapay Zeka ile Yakın Seçenekleri Öner</span>
          </Button>
        ) : null}
        {canPolish ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || loading || Boolean(qualityIssue)}
            onClick={() => void handlePolish()}
            className="h-8 gap-1.5 rounded-xl border-purple-500/40 bg-white/90 px-3 text-xs font-medium text-purple-700 shadow-2xs hover:bg-purple-500/10 dark:border-purple-500/30 dark:bg-zinc-900 dark:text-purple-300"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 text-purple-500" />
            )}
            <span>✨ AI ile İfadeyi Profesyonelleştir</span>
          </Button>
        ) : null}
        {loading ? (
          <Button type="button" variant="ghost" size="sm" onClick={cancel} className="h-8 text-xs">
            İptal
          </Button>
        ) : null}
      </div>

      {qualityIssue ? (
        <p className="text-[11px] text-muted-foreground">
          Yapay zeka önerisi almak için önce ilgili alana en az {minLength} harf yazın.
        </p>
      ) : null}
      {piiError ? <p className="text-xs text-destructive">{piiError}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {suggestResult && onAcceptCatalog ? (
        <div className="space-y-2.5 rounded-xl border border-amber-500/30 bg-white/95 p-3 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Yapay Zeka ile Eşleşen Seçenekler:
            </span>
            <span className="text-[11px] text-muted-foreground">
              Tek tıkla seçip uygulayabilirsiniz
            </span>
          </div>

          {suggestResult.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">
              Yazdığınız ifadeye uygun katalog seçeneği bulunamadı; girdiğiniz özel unvan aynen korunacak.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 py-1">
              {suggestResult.map((item) => {
                const checked = picked.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      // 1-click accept direct match if single choice
                      if (kind === 'role') {
                        onAcceptCatalog([item]);
                        setTaxonomySuggestions(null);
                        setPicked([]);
                      } else {
                        setPicked((prev) =>
                          checked ? prev.filter((v) => v !== item) : [...prev, item],
                        );
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${
                      checked
                        ? 'border border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-200 shadow-2xs'
                        : 'border border-slate-200 bg-slate-50 text-foreground/80 hover:border-amber-400 hover:bg-amber-50/50 dark:border-zinc-800 dark:bg-zinc-800'
                    }`}
                  >
                    <span>+ {item}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
            {kind !== 'role' && suggestResult.length > 0 && (
              <Button
                type="button"
                size="sm"
                disabled={disabled || picked.length === 0}
                onClick={() => {
                  onAcceptCatalog(picked);
                  setTaxonomySuggestions(null);
                  setPicked([]);
                }}
                className="h-7.5 text-xs rounded-xl px-3"
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Seçilenleri Ekle ({picked.length})
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setTaxonomySuggestions(null);
                setPicked([]);
              }}
              className="h-7.5 text-xs rounded-xl"
            >
              Kapat
            </Button>
          </div>
        </div>
      ) : null}

      {polishResult && onAcceptPolished ? (
        <div className="space-y-2.5 rounded-xl border border-purple-500/30 bg-white/95 p-3 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <Wand2 className="h-3.5 w-3.5 text-purple-500" />
            <span>Yapay Zeka ile Geliştirilmiş İfade:</span>
          </div>
          <Textarea
            rows={3}
            value={draft}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            className="text-xs rounded-xl border-purple-300 dark:border-purple-900"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={disabled || !draft.trim()}
              onClick={() => {
                onAcceptPolished(draft.trim());
                setShowPolish(false);
                reset();
              }}
              className="h-7.5 text-xs rounded-xl px-3 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Metni Uygula
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowPolish(false);
                reset();
              }}
              className="h-7.5 text-xs rounded-xl"
            >
              Vazgeç
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
