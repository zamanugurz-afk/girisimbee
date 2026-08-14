'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    const suggestions = matchTaxonomyOptions(prepared.text, catalog ?? [], 5);
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
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
      <div className="flex flex-wrap gap-2">
        {canSuggest ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || loading || Boolean(qualityIssue)}
            onClick={handleSuggest}
          >
            Yakın seçenekleri öner
          </Button>
        ) : null}
        {canPolish ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || loading || Boolean(qualityIssue)}
            onClick={() => void handlePolish()}
          >
            {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            AI ile bu ifadeyi geliştir
          </Button>
        ) : null}
        {loading ? (
          <Button type="button" variant="ghost" size="sm" onClick={cancel}>
            İptal
          </Button>
        ) : null}
      </div>
      {qualityIssue ? (
        <p className="text-xs text-muted-foreground">Öneri için önce geçerli bir metin yazın.</p>
      ) : null}
      {piiError ? <p className="text-xs text-destructive">{piiError}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {suggestResult && onAcceptCatalog ? (
        <div className="space-y-2">
          {suggestResult.length === 0 ? (
            <p className="text-xs text-muted-foreground">Yakın bir katalog seçeneği bulunamadı.</p>
          ) : (
            <ul className="space-y-1">
              {suggestResult.map((item) => {
                const checked = picked.includes(item);
                return (
                  <li key={item}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={(event) => {
                          setPicked((prev) =>
                            event.target.checked
                              ? [...prev, item]
                              : prev.filter((value) => value !== item),
                          );
                        }}
                      />
                      <span>{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={disabled || picked.length === 0}
              onClick={() => {
                onAcceptCatalog(picked);
                setTaxonomySuggestions(null);
                setPicked([]);
              }}
            >
              Seçilenleri ekle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setTaxonomySuggestions(null);
                setPicked([]);
              }}
            >
              Reddet
            </Button>
          </div>
        </div>
      ) : null}

      {polishResult && onAcceptPolished ? (
        <div className="space-y-2">
          <Textarea
            rows={3}
            value={draft}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
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
            >
              Kabul et
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowPolish(false);
                reset();
              }}
            >
              Reddet
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
