'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AccountDateFormat,
  AccountLanguage,
  AccountPreferenceSettingsState,
} from '@/features/account/types/account-settings.types';
import {
  ACCOUNT_DATE_FORMAT_LABELS,
  ACCOUNT_LANGUAGE_LABELS,
  ACCOUNT_TIMEZONE_OPTIONS,
} from '@/features/account/types/account-settings.constants';

export function AccountPreferenceSettings({
  value,
  onChange,
}: {
  value: AccountPreferenceSettingsState;
  onChange: (next: AccountPreferenceSettingsState) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Hesap tercihleri
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Dil, saat dilimi ve tarih biçimi. Tema ayarı bu bölümde yoktur.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Dil seçimi</Label>
          <Select
            value={value.language}
            onValueChange={(language) =>
              onChange({ ...value, language: language as AccountLanguage })
            }
          >
            <SelectTrigger className="rounded-xl border border-sky-200/80 bg-sky-50/30 dark:border-sky-800/40 dark:bg-sky-950/20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ACCOUNT_LANGUAGE_LABELS) as AccountLanguage[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {ACCOUNT_LANGUAGE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Saat dilimi</Label>
          <Select
            value={value.timezone}
            onValueChange={(timezone) => onChange({ ...value, timezone })}
          >
            <SelectTrigger className="rounded-xl border border-sky-200/80 bg-sky-50/30 dark:border-sky-800/40 dark:bg-sky-950/20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TIMEZONE_OPTIONS.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Tarih biçimi</Label>
          <Select
            value={value.dateFormat}
            onValueChange={(dateFormat) =>
              onChange({ ...value, dateFormat: dateFormat as AccountDateFormat })
            }
          >
            <SelectTrigger className="rounded-xl border border-sky-200/80 bg-sky-50/30 dark:border-sky-800/40 dark:bg-sky-950/20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ACCOUNT_DATE_FORMAT_LABELS) as AccountDateFormat[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {ACCOUNT_DATE_FORMAT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}
