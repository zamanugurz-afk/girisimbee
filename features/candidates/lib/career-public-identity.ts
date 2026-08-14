/** Public career-card identity helpers. Full name stays gated; surname is masked. */

export function maskDisplaySurname(fullName: string | null | undefined): string | null {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const first = parts[0]!;
  if (parts.length === 1) return first;
  const surnameChars = [...parts.slice(1).join('')].filter((char) => char.trim().length > 0);
  const count = Math.max(surnameChars.length, 1);
  return `${first} ${'*'.repeat(count)}`;
}

export function ageFromBirthDate(
  value: string | null | undefined,
  now = new Date(),
): number | null {
  const raw = (value ?? '').trim();
  const ymd = raw.length >= 10 ? raw.slice(0, 10) : raw;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  let age = now.getFullYear() - year;
  const monthDelta = now.getMonth() + 1 - month;
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < day)) age -= 1;
  if (age < 16 || age > 75) return null;
  return age;
}

export function publicGenderLabel(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  if (trimmed === 'Erkek' || trimmed === 'Kadın') return trimmed;
  return null;
}
