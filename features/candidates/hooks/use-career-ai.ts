'use client';

import { useCallback, useRef, useState } from 'react';
import type { CareerAiRequest, CareerAiResult } from '@/features/candidates/ai/career-ai.types';
import {
  careerAiPolishFingerprint,
  fingerprintCanonical,
} from '@/features/candidates/ai/career-ai-context';
import { getCareerAiCache, setCareerAiCache } from '@/features/candidates/ai/career-ai-cache';

type CareerAiState = {
  loading: boolean;
  error: string | null;
  result: CareerAiResult | null;
};

function requestFingerprint(body: CareerAiRequest): string {
  if (body.action === 'analyze') {
    return body.fingerprint || fingerprintCanonical(body.context);
  }
  if (body.action === 'polish') {
    return careerAiPolishFingerprint(body);
  }
  if (body.action === 'occupational') {
    return body.fingerprint || fingerprintCanonical({
      action: 'occupational',
      sector: body.sector,
      role: body.role,
      experienceLevel: body.experienceLevel,
    });
  }
  return fingerprintCanonical({
    action: 'suggest',
    kind: body.kind,
    text: body.text.trim(),
    catalog: body.catalog,
  });
}

export function useCareerAi() {
  const [state, setState] = useState<CareerAiState>({
    loading: false,
    error: null,
    result: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState({ loading: false, error: null, result: null });
  }, []);

  const run = useCallback(async (body: CareerAiRequest): Promise<CareerAiResult | null> => {
    const fingerprint = requestFingerprint(body);
    const cached = getCareerAiCache<CareerAiResult>(fingerprint);
    if (cached) {
      setState({ loading: false, error: null, result: cached });
      return cached;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ loading: true, error: null, result: null });

    try {
      const res = await fetch('/api/candidates/career-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: CareerAiResult;
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        const message =
          json.code === 'AI_UNAVAILABLE' || json.code === 'VALIDATION_ERROR'
            ? json.error ||
              'AI özeti şu anda oluşturulamadı. Kariyer özetinizi manuel olarak yazabilirsiniz.'
            : json.code === 'PII_BLOCKED'
              ? 'Kişisel iletişim bilgisi AI isteğine eklenemez. Telefon, e-posta veya açık adresi silin.'
              : json.error || 'AI isteği başarısız oldu.';
        setState({ loading: false, error: message, result: null });
        return null;
      }
      const result = json.data ?? null;
      if (result) setCareerAiCache(fingerprint, result);
      setState({ loading: false, error: null, result });
      return result;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setState((prev) => ({ ...prev, loading: false }));
        return null;
      }
      setState({
        loading: false,
        error: 'AI özeti şu anda oluşturulamadı. Kariyer özetinizi manuel olarak yazabilirsiniz.',
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
    reset,
    cancel: () => abortRef.current?.abort(),
  };
}
