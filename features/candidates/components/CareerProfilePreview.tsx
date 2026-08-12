'use client';

import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

type PreviewInput = {
  desiredRole?: string | null;
  experienceLevel?: string | null;
  workType?: string | null;
  preferredSectors?: string[] | string | null;
  professionalSkills?: string | null;
  preferredCity?: string | null;
  workplacePreference?: string | null;
  salaryExpectation?: string | null;
  availability?: string | null;
  longDescription?: string | null;
  experiences?: CareerExperience[];
};

function asList(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,•|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function skillChips(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/[,•|/\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

/** Anonymous public/preview card for İş Arıyorum career profiles. */
export function CareerProfilePreview({ data }: { data: PreviewInput }) {
  const sectors = asList(data.preferredSectors);
  const skills = skillChips(data.professionalSkills);
  const experiences = data.experiences ?? [];

  return (
    <div className="space-y-5 rounded-xl border border-border/70 bg-card p-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Anonim kariyer profili
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
          {data.desiredRole || 'Pozisyon belirtilmedi'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {[data.experienceLevel, experiences.length ? `${experiences.length} deneyim` : null]
            .filter(Boolean)
            .join(' · ') || 'Seviye belirtilmedi'}
        </p>
      </div>

      {sectors.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Sektörler</p>
          <p className="mt-1 text-sm text-foreground">{sectors.join(' • ')}</p>
        </div>
      ) : null}

      {skills.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Yetkinlikler</p>
          <p className="mt-1 text-sm text-foreground">{skills.join(' • ')}</p>
        </div>
      ) : null}

      <div>
        <p className="text-xs font-medium text-muted-foreground">Çalışma tercihi</p>
        <p className="mt-1 text-sm text-foreground">
          {[data.preferredCity, data.workplacePreference, data.workType, data.availability]
            .filter(Boolean)
            .join(' · ') || '—'}
        </p>
        {data.salaryExpectation ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{data.salaryExpectation}</p>
        ) : null}
      </div>

      {experiences.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Deneyimler</p>
          <ul className="space-y-2">
            {experiences.map((exp) => (
              <li key={exp.id} className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm">
                <p className="font-medium text-foreground">
                  {exp.role}
                  {exp.sector ? ` · ${exp.sector}` : ''}
                </p>
                {exp.duration ? (
                  <p className="text-xs text-muted-foreground">{exp.duration}</p>
                ) : null}
                {exp.responsibilities ? (
                  <p className="mt-1 text-muted-foreground line-clamp-3">{exp.responsibilities}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.longDescription ? (
        <div>
          <p className="text-xs font-medium text-muted-foreground">Kariyer özeti</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {data.longDescription}
          </p>
        </div>
      ) : null}

      <p className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
        İletişim bilgileri gizli. İşverenler “İletişim Talebi Gönder” ile ulaşabilir; siz kabul
        ederseniz bilgiler paylaşılır.
      </p>
    </div>
  );
}
