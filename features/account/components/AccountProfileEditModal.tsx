'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AccountProfile } from '@/features/account/types/account-profile.types';

export type AccountProfileEditDraft = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
};

function toDraft(profile: AccountProfile): AccountProfileEditDraft {
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    username: profile.username ?? '',
    phone: profile.phone ?? '',
  };
}

export function AccountProfileEditModal({
  open,
  profile,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  profile: AccountProfile;
  saving?: boolean;
  onClose: () => void;
  onSave: (next: AccountProfileEditDraft) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState(() => toDraft(profile));

  useEffect(() => {
    if (open) setDraft(toDraft(profile));
  }, [open, profile]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Kapat"
        onClick={onClose}
        disabled={saving}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-profile-edit-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200/90 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2
          id="account-profile-edit-title"
          className="font-display text-xl font-semibold text-foreground"
        >
          Bilgileri düzenle
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ad, soyad, kullanıcı adı ve telefon bilgilerinizi güncelleyin.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Ad">
            <Input
              value={draft.firstName}
              onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
              className="rounded-lg"
              disabled={saving}
            />
          </Field>
          <Field label="Soyad">
            <Input
              value={draft.lastName}
              onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
              className="rounded-lg"
              disabled={saving}
            />
          </Field>
          <Field label="Kullanıcı adı">
            <Input
              value={draft.username}
              onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              className="rounded-lg"
              disabled={saving}
            />
          </Field>
          <Field label="Telefon">
            <Input
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              className="rounded-lg"
              disabled={saving}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={onClose}
            disabled={saving}
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            className="rounded-lg"
            disabled={saving}
            onClick={() => void onSave(draft)}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
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
