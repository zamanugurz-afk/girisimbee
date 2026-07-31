/** Start of current day in Europe/Istanbul as ISO string for DB filters. */
export function startOfTodayIstanbulIso(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return `${parts}T00:00:00+03:00`;
}

/** End of current day in Europe/Istanbul as ISO string for DB filters. */
export function endOfTodayIstanbulIso(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return `${parts}T23:59:59.999+03:00`;
}
