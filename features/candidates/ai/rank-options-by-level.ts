import { MANUAL_OPTION, isManualCareerOption } from '@/features/candidates/taxonomy/career-taxonomy';

const LEADERSHIP_RE = /yönet|lider|strateji|bütçe|ekip kur|koordinasyon|p&l|müdürlük/i;

function isJuniorLevel(experienceLevel?: string | null): boolean {
  return /stajyer|yeni mezun|giriş|junior|başlangıç/i.test(String(experienceLevel ?? ''));
}

function isLeadershipLevel(experienceLevel?: string | null): boolean {
  return /yönetici|direktör|senior|kıdemli|üst düzey/i.test(String(experienceLevel ?? ''));
}

/**
 * Reorders catalog options by career level. Never removes options.
 * Junior: leadership-like items last. Senior/manager: those items first.
 */
export function rankCareerOptionsByLevel(
  options: string[],
  experienceLevel?: string | null,
): string[] {
  const manual = options.filter((option) => isManualCareerOption(option) || option === MANUAL_OPTION);
  const rest = options.filter((option) => !isManualCareerOption(option) && option !== MANUAL_OPTION);
  const leadership = rest.filter((option) => LEADERSHIP_RE.test(option));
  const other = rest.filter((option) => !LEADERSHIP_RE.test(option));

  if (isJuniorLevel(experienceLevel)) {
    return [...other, ...leadership, ...manual];
  }
  if (isLeadershipLevel(experienceLevel)) {
    return [...leadership, ...other, ...manual];
  }
  return [...rest, ...manual];
}
