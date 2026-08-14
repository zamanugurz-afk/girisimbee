'use client';

import { useCallback, useRef, useState } from 'react';
import {
  fingerprintCanonical,
  investmentAiPolishFingerprint,
} from '@/features/investments/ai/investment-ai-context';
import { getInvestmentAiCache, setInvestmentAiCache } from '@/features/investments/ai/investment-ai-cache';
import type { InvestmentAiRequest, InvestmentAiResult } from '@/features/investments/ai/investment-ai.types';

type InvestmentAiState = {
  loading: boolean;
  error: string | null;
  result: InvestmentAiResult | null;
};

function requestFingerprint(body: InvestmentAiRequest): string {
  if (body.action === 'analyze') {
    return body.fingerprint || fingerprintCanonical(body.context);
  }
  return investmentAiPolishFingerprint(body.kind, body.text);
}

export function useInvestmentAi() {
  const [state, setState] = useState<InvestmentAiState>({
    loading: false,
    error: null,
    result: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (body: InvestmentAiRequest): Promise<InvestmentAiResult | null> => {
    const fingerprint = requestFingerprint(body);
    const cached = getInvestmentAiCache<InvestmentAiResult>(fingerprint);
    if (cached) {
      setState({ loading: false, error: null, result: cached });
      return cached;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ loading: true, error: null, result: null });

    try {
      const res = await fetch('/api/investments/investment-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: InvestmentAiResult;
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        const message =
          json.code === 'AI_UNAVAILABLE' || json.code === 'VALIDATION_ERROR'
            ? json.error
              || 'AI özeti şu anda oluşturulamadı. Yatırımcı özetinizi manuel olarak yazabilirsiniz.'
            : json.code === 'PII_BLOCKED'
              ? 'Kişisel iletişim bilgisi AI isteğine eklenemez. Telefon, e-posta veya açık adresi silin.'
              : json.error || 'AI isteği başarısız oldu.';
        setState({ loading: false, error: message, result: null });
        return null;
      }
      const result = json.data ?? null;
      if (result) setInvestmentAiCache(fingerprint, result);
      setState({ loading: false, error: null, result });
      return result;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setState((prev) => ({ ...prev, loading: false }));
        return null;
      }
      setState({
        loading: false,
        error: 'AI özeti şu anda oluşturulamadı. Yatırımcı özetinizi manuel olarak yazabilirsiniz.',
        result: null,
      });
      return null;
    }
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    result: state.result,
    run,
    cancel: () => abortRef.current?.abort(),
  };
}
