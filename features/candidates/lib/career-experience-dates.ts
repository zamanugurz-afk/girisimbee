/** Month/year experience date helpers for Kariyer Kartı. */

export const MONTH_OPTIONS = [
  { value: 1, label: 'Ocak' },
  { value: 2, label: 'Şubat' },
  { value: 3, label: 'Mart' },
  { value: 4, label: 'Nisan' },
  { value: 5, label: 'Mayıs' },
  { value: 6, label: 'Haziran' },
  { value: 7, label: 'Temmuz' },
  { value: 8, label: 'Ağustos' },
  { value: 9, label: 'Eylül' },
  { value: 10, label: 'Ekim' },
  { value: 11, label: 'Kasım' },
  { value: 12, label: 'Aralık' },
] as const;

export function monthLabel(month: number | null | undefined): string {
  if (!month || month < 1 || month > 12) return '';
  return MONTH_OPTIONS[month - 1]!.label;
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function currentMonth(): number {
  return new Date().getMonth() + 1;
}

export function yearOptions(from = 1970, to = currentYear()): number[] {
  const years: number[] = [];
  for (let y = to; y >= from; y -= 1) years.push(y);
  return years;
}

export function toMonthIndex(year: number, month: number): number {
  return year * 12 + month;
}

export function isFutureMonthYear(year: number, month: number): boolean {
  return toMonthIndex(year, month) > toMonthIndex(currentYear(), currentMonth());
}

export function formatCareerPeriod(input: {
  startMonth?: number | null;
  startYear?: number | null;
  endMonth?: number | null;
  endYear?: number | null;
  isCurrent?: boolean;
  /** Legacy free-text fallback */
  duration?: string | null;
}): string {
  const startM = input.startMonth ?? null;
  const startY = input.startYear ?? null;
  if (startM && startY) {
    const start = `${monthLabel(startM)} ${startY}`;
    if (input.isCurrent) return `${start} – Halen`;
    const endM = input.endMonth ?? null;
    const endY = input.endYear ?? null;
    if (endM && endY) return `${start} – ${monthLabel(endM)} ${endY}`;
    return start;
  }
  return (input.duration ?? '').trim();
}

export function validateCareerPeriod(input: {
  startMonth?: number | null;
  startYear?: number | null;
  endMonth?: number | null;
  endYear?: number | null;
  isCurrent?: boolean;
}): string | null {
  const startMonth = input.startMonth ?? null;
  const startYear = input.startYear ?? null;
  const endMonth = input.endMonth ?? null;
  const endYear = input.endYear ?? null;
  const isCurrent = Boolean(input.isCurrent);

  if (!startMonth || !startYear) {
    return 'Başlangıç tarihi (ay ve yıl) zorunludur.';
  }
  if (startMonth < 1 || startMonth > 12) {
    return 'Başlangıç ayı geçersiz.';
  }
  if (isFutureMonthYear(startYear, startMonth)) {
    return 'Başlangıç tarihi gelecekte olamaz.';
  }

  if (isCurrent) {
    if (endMonth || endYear) {
      return 'Halen çalışıyorum seçiliyken bitiş tarihi girilemez.';
    }
    return null;
  }

  if (!endMonth || !endYear) {
    return 'Bitiş tarihi (ay ve yıl) zorunludur veya “Halen çalışıyorum” seçilmelidir.';
  }
  if (endMonth < 1 || endMonth > 12) {
    return 'Bitiş ayı geçersiz.';
  }
  if (isFutureMonthYear(endYear, endMonth)) {
    return 'Bitiş tarihi gelecekte olamaz.';
  }
  if (toMonthIndex(endYear, endMonth) < toMonthIndex(startYear, startMonth)) {
    return 'Bitiş tarihi başlangıç tarihinden önce olamaz.';
  }
  return null;
}

/** Approximate total experience years from period rows (for kariyer kartı). */
export function estimateTotalExperienceYears(
  periods: Array<{
    startMonth?: number | null;
    startYear?: number | null;
    endMonth?: number | null;
    endYear?: number | null;
    isCurrent?: boolean;
  }>,
): number | null {
  let months = 0;
  let counted = 0;
  for (const p of periods) {
    if (!p.startMonth || !p.startYear) continue;
    const endY = p.isCurrent ? currentYear() : p.endYear;
    const endM = p.isCurrent ? currentMonth() : p.endMonth;
    if (!endY || !endM) continue;
    const span = toMonthIndex(endY, endM) - toMonthIndex(p.startYear, p.startMonth) + 1;
    if (span > 0) {
      months += span;
      counted += 1;
    }
  }
  if (!counted) return null;
  return Math.max(0, Math.round(months / 12));
}
