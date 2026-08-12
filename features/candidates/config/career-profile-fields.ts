/**
 * Anonymous career-profile experience rows (İş Arıyorum).
 * Company / employer names are never collected.
 */
export type CareerExperience = {
  id: string;
  sector: string;
  role: string;
  duration: string;
  responsibilities: string;
  achievements: string;
};

export function createEmptyCareerExperience(): CareerExperience {
  return {
    id: crypto.randomUUID(),
    sector: '',
    role: '',
    duration: '',
    responsibilities: '',
    achievements: '',
  };
}

export function parseCareerExperiences(value: unknown): CareerExperience[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const r = row as Record<string, unknown>;
      const id = typeof r.id === 'string' && r.id ? r.id : crypto.randomUUID();
      return {
        id,
        sector: String(r.sector ?? '').trim(),
        role: String(r.role ?? '').trim(),
        duration: String(r.duration ?? '').trim(),
        responsibilities: String(r.responsibilities ?? '').trim(),
        achievements: String(r.achievements ?? '').trim(),
      } satisfies CareerExperience;
    })
    .filter((row): row is CareerExperience => Boolean(row));
}

export function validateCareerExperiences(experiences: CareerExperience[]): string | null {
  if (experiences.length < 1) {
    return 'En az bir deneyim ekleyin.';
  }
  for (let i = 0; i < experiences.length; i += 1) {
    const exp = experiences[i]!;
    if (!exp.sector || !exp.role || !exp.duration) {
      return `${i + 1}. deneyimde sektör, pozisyon ve süre zorunludur.`;
    }
    if (!exp.responsibilities || exp.responsibilities.length < 20) {
      return `${i + 1}. deneyimde sorumluluklar en az 20 karakter olmalıdır.`;
    }
  }
  return null;
}
