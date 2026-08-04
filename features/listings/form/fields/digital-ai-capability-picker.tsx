'use client';

import { Check } from 'lucide-react';
import { DIGITAL_AI_CAPABILITIES } from '@/features/listings/config/digital-ai-capabilities';
import {
  DIGITAL_AI_ACCENT,
  DigitalAiCapabilityIconBadge,
} from '@/components/girisimco/listing/digital-ai-capability-icons';
import { cn } from '@/lib/utils';

export function DigitalAiCapabilityPicker({
  value,
  onChange,
  disabled,
  error,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
}) {
  const selected = Array.isArray(value) ? value.map(String) : [];

  function toggle(title: string) {
    if (disabled) return;
    const next = selected.includes(title)
      ? selected.filter((item) => item !== title)
      : [...selected, title];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DIGITAL_AI_CAPABILITIES.map((capability) => {
          const checked = selected.includes(capability.title);

          return (
            <button
              key={capability.id}
              type="button"
              disabled={disabled}
              aria-pressed={checked}
              onClick={() => toggle(capability.title)}
              className={cn(
                'group relative flex h-full flex-col rounded-2xl border bg-card p-5 text-left shadow-[0_8px_30px_-18px_rgba(15,23,42,0.28)] transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(15,23,42,0.35)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF0]/35',
                checked
                  ? 'border-[#7C6CF0]/55 ring-1 ring-[#7C6CF0]/25'
                  : 'border-border/70',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {checked ? (
                <span
                  className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: DIGITAL_AI_ACCENT }}
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              ) : null}

              <DigitalAiCapabilityIconBadge icon={capability.icon} />

              <span className="mt-4 pr-7 text-[15px] font-semibold leading-snug text-foreground">
                {capability.title}
              </span>
              <span className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                {capability.description}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-gc-xs text-destructive">{error}</p>
      ) : (
        <p className="text-gc-xs text-muted-foreground">
          Seçilen yetenekler detay sayfasında aynı kart düzeninde gösterilir.
          {selected.length > 0 ? ` (${selected.length} seçili)` : ''}
        </p>
      )}
    </div>
  );
}
