'use client';

import { useCallback, useRef, useState } from 'react';
import { fingerprintCanonical } from '@/features/investments/ai/investment-ai-context';
import { investorAiPolishFingerprint } from '@/features/investors/ai/investor-ai-context';
import { getInvestorAiCache, setInvestorAiCache } from '@/features/investors/ai/investor-ai-cache';
import type { InvestorAiRequest, InvestorAiResult } from '@/features/investors/ai/investor-ai.types';

type InvestorAiState = {
  loading: boolean;
  error: string | null;
  result: InvestorAiResult | null;
};

function requestFingerprint(body: InvestorAiRequest): string {
  if (body.action === 'analyze') {
    return body.fingerprint || fingerprintCanonical(body.context);
  }
  return investorAiPolishFingerprint(body.kind, body.text);
}

export function useInvestorAi() {
  const [state, setState] = useState<InvestorAiState>({
    loading: false,
    error: null,
    result: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (body: InvestorAiRequest): Promise<InvestorAiResult | null> => {
    const fingerprint = requestFingerprint(body);
    const cached = getInvestorAiCache<InvestorAiResult>(fingerprint);
    if (cached) {
      setState({ loading: false, error: null, result: cached });
      return cached;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ loading: true, error: null, result: null });

    try {
      const res = await fetch('/api/investors/investor-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: InvestorAiResult;
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
      if (result) setInvestorAiCache(fingerprint, result);
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
