'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Check, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function MaintenanceUnlockForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientIp, setClientIp] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ip')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ips?.[0]) {
          setClientIp(data.ips[0]);
        }
        if (data?.isAllowlisted || data?.hasPreviewCookie) {
          // If already allowlisted, reload to home
          window.location.href = '/';
        }
      })
      .catch(() => {});
  }, []);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/preview/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        document.cookie = 'gb_preview=1; path=/; max-age=31536000';
        window.location.href = '/';
      } else {
        setError('Geçersiz erişim kodu');
        setLoading(false);
      }
    } catch {
      setError('Bağlantı hatası oluştu');
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      {!isOpen ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-500 shadow-2xs backdrop-blur-xs transition hover:border-amber-400 hover:text-slate-800 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <KeyRound className="h-3.5 w-3.5 text-amber-500" />
            <span>Önizleme / Yönetici Erişimi</span>
          </button>
          {clientIp && (
            <span className="text-[11px] font-mono text-slate-400">
              IP: {clientIp}
            </span>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleUnlock}
          className="w-full max-w-xs space-y-2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              <span>Girişimbee Önizleme</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600"
            >
              Kapat
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Erişim kodu..."
              className="h-9 text-xs"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading || !code.trim()}
              size="sm"
              className="h-9 bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

          {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
          {clientIp && <p className="text-[10px] font-mono text-slate-400">Bağlantı IP: {clientIp}</p>}
        </form>
      )}
    </div>
  );
}
