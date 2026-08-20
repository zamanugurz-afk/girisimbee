'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AccountPasswordFormState } from '@/features/account/types/account-security.types';

const EMPTY: AccountPasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function AccountPasswordCard() {
  const [form, setForm] = useState<AccountPasswordFormState>(EMPTY);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Tüm şifre alanlarını doldurun');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Yeni şifre en az 8 karakter olmalı');
      return;
    }
    toast.success('Şifre güncellendi (mock)');
    setForm(EMPTY);
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <h2 className="font-display text-lg font-semibold text-foreground">Şifre değiştir</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hesap şifrenizi güncelleyin. Değişiklikler şu an yalnızca arayüzde simüle edilir.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <Field label="Mevcut şifre">
          <Input
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            className="rounded-lg"
          />
        </Field>
        <Field label="Yeni şifre">
          <Input
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="rounded-lg"
          />
        </Field>
        <Field label="Yeni şifre tekrarı">
          <Input
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="rounded-lg"
          />
        </Field>
        <Button type="submit" className="rounded-lg">
          Şifreyi güncelle
        </Button>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
