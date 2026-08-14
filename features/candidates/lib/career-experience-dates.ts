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
    if (endM && endY) {
      if (endM === startM && endY === startY) return start;
      return `${start} – ${monthLabel(endM)} ${endY}`;
    }
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

export type CareerPeriodInput = {
  startMonth?: number | null;
  startYear?: number | null;
  endMonth?: number | null;
  endYear?: number | null;
  isCurrent?: boolean;
};

export type CareerPeriodInterval = {
  start: number;
  end: number;
  index: number;
};

export function toCareerPeriodInterval(
  period: CareerPeriodInput,
  index = 0,
): CareerPeriodInterval | null {
  if (!period.startMonth || !period.startYear) return null;
  const start = toMonthIndex(period.startYear, period.startMonth);
  const endY = period.isCurrent ? currentYear() : period.endYear;
  const endM = period.isCurrent ? currentMonth() : period.endMonth;
  if (!endY || !endM) return null;
  const end = toMonthIndex(endY, endM);
  if (end < start) return null;
  return { start, end, index };
}

export function periodsOverlap(a: CareerPeriodInterval, b: CareerPeriodInterval): boolean {
  return a.start <= b.end && b.start <= a.end;
}

/** Inclusive month ranges that share at least one month. Adjacent months are allowed. */
export function findOverlappingExperiencePair(
  periods: CareerPeriodInput[],
): { firstIndex: number; secondIndex: number } | null {
  const intervals = periods
    .map((period, index) => toCareerPeriodInterval(period, index))
    .filter((interval): interval is CareerPeriodInterval => Boolean(interval));

  for (let i = 0; i < intervals.length; i += 1) {
    for (let j = i + 1; j < intervals.length; j += 1) {
      const left = intervals[i]!;
      const right = intervals[j]!;
      if (periodsOverlap(left, right)) {
        return {
          firstIndex: Math.min(left.index, right.index),
          secondIndex: Math.max(left.index, right.index),
        };
      }
    }
  }
  return null;
}

export function validateExperienceOverlaps(periods: CareerPeriodInput[]): string | null {
  const pair = findOverlappingExperiencePair(periods);
  if (!pair) return null;
  const first = formatCareerPeriod(periods[pair.firstIndex] ?? {});
  const second = formatCareerPeriod(periods[pair.secondIndex] ?? {});
  const firstLabel = first || `${pair.firstIndex + 1}. deneyim`;
  const secondLabel = second || `${pair.secondIndex + 1}. deneyim`;
  return `${pair.firstIndex + 1}. deneyim (${firstLabel}) ile ${pair.secondIndex + 1}. deneyim (${secondLabel}) tarihleri çakışıyor. Aynı dönemde ikinci bir deneyim eklenemez.`;
}

/** Approximate total experience years from period rows (for kariyer kartı). */
export function estimateTotalExperienceYears(periods: CareerPeriodInput[]): number | null {
  const intervals = periods
    .map((period, index) => toCareerPeriodInterval(period, index))
    .filter((interval): interval is CareerPeriodInterval => Boolean(interval))
    .sort((a, b) => a.start - b.start);

  if (intervals.length === 0) return null;

  const merged: CareerPeriodInterval[] = [];
  for (const interval of intervals) {
    const last = merged[merged.length - 1];
    if (last && interval.start <= last.end + 1) {
      last.end = Math.max(last.end, interval.end);
    } else {
      merged.push({ ...interval });
    }
  }

  const months = merged.reduce((sum, interval) => sum + (interval.end - interval.start + 1), 0);
  return Math.max(0, Math.round(months / 12));
}
