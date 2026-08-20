'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import type { AccountProfile } from '@/features/account/types/account-profile.types';

type Step = 'phone' | 'code';

export function AccountPhoneVerifyDialog({
  open,
  profile,
  onClose,
  onVerified,
}: {
  open: boolean;
  profile: AccountProfile;
  onClose: () => void;
  onVerified: (next: Pick<AccountProfile, 'phone' | 'phoneVerified'> & Partial<AccountProfile>) => void;
}) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState(profile.phone ?? '');

  useEffect(() => {
    if (open) {
      setStep('phone');
      setPhone(profile.phone ?? '');
      setCode('');
      setMaskedPhone(profile.phone ?? '');
    }
  }, [open, profile.phone]);

  if (!open) return null;

  async function handleSend() {
    setBusy(true);
    try {
      const res = await fetch('/api/account/verification/phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const json = (await res.json()) as {
        data?: { phone?: string; debugCode?: string; message?: string };
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || 'Kod gönderilemedi');
      }
      setMaskedPhone(json.data?.phone ?? phone);
      setStep('code');
      if (json.data?.debugCode) {
        toast.success(`Doğrulama kodu: ${json.data.debugCode}`, {
          description: 'Geliştirme ortamı — SMS yerine kod burada gösterilir.',
          duration: 12000,
        });
      } else {
        toast.success(json.data?.message || 'Doğrulama kodu gönderildi');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Kod gönderilemedi');
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    if (!/^\d{6}$/.test(code)) {
      toast.error('6 haneli kodu girin');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/account/verification/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = (await res.json()) as {
        data?: { phone?: string | null; phoneVerified?: boolean };
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || 'Doğrulama başarısız');
      }
      onVerified({
        phone: json.data?.phone ?? maskedPhone,
        phoneVerified: true,
      });
      toast.success('Telefon doğrulandı');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Doğrulama başarısız');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Kapat"
        onClick={onClose}
        disabled={busy}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-verify-title"
        className="relative z-10 w-full max-w-md rounded-t-2xl border border-slate-200/90 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 id="phone-verify-title" className="font-display text-xl font-semibold text-foreground">
          Telefon doğrulama
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 'phone'
            ? 'Numaranızı onaylayın; size 6 haneli bir kod göndereceğiz.'
            : `${maskedPhone} numarasına gönderilen 6 haneli kodu girin.`}
        </p>

        {step === 'phone' ? (
          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-phone">Telefon</Label>
              <Input
                id="verify-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxxx"
                className="rounded-lg"
                disabled={busy}
              />
            </div>
            <Button
              type="button"
              className="w-full rounded-xl"
              onClick={handleSend}
              disabled={busy || !phone.trim()}
            >
              {busy ? 'Gönderiliyor…' : 'Kod gönder'}
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={busy}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              type="button"
              className="w-full rounded-xl"
              onClick={handleVerify}
              disabled={busy || code.length !== 6}
            >
              {busy ? 'Doğrulanıyor…' : 'Doğrula'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl"
              onClick={handleSend}
              disabled={busy}
            >
              Kodu yeniden gönder
            </Button>
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full rounded-xl"
          onClick={onClose}
          disabled={busy}
        >
          Kapat
        </Button>
      </div>
    </div>
  );
}
