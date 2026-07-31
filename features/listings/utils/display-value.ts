/** Returns true when a value should not be shown in the UI. */
export function isEmptyDisplayValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number' && Number.isNaN(value)) return true;
  if (Array.isArray(value)) {
    return value.length === 0 || value.every((item) => isEmptyDisplayValue(item));
  }
  const normalized = String(value).trim();
  return (
    !normalized
    || normalized === '—'
    || normalized === 'null'
    || normalized === 'undefined'
    || normalized === 'NaN'
  );
}

/** Format a value for display; returns empty string when missing. */
export function toDisplayValue(value: unknown): string {
  if (isEmptyDisplayValue(value)) return '';
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0)
      .join(', ');
  }
  return String(value).trim();
}
