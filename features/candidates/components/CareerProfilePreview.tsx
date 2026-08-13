'use client';

import type { ReactNode } from 'react';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import { estimateTotalExperienceYears } from '@/features/candidates/lib/career-experience-dates';
import { getExperienceLevelLabel } from '@/features/candidates/taxonomy/career-taxonomy';

export type CareerCardInput = {
  desiredRole?: string | null;
  experienceLevel?: string | null;
  primarySector?: string | null;
  workType?: string | null;
  preferredSectors?: string[] | string | null;
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  languages?: string | null;
  certificates?: string | null;
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
    return value.split(/[,•|·]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function skillChips(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/[,•|·/\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

/** Anonymous public/preview Kariyer Kartı for İş Arıyorum. */
export function CareerProfilePreview({ data }: { data: CareerCardInput }) {
  const preferredSectors = asList(data.preferredSectors);
  const sectorChips = preferredSectors.length
    ? preferredSectors
    : data.primarySector
      ? [data.primarySector]
      : [];
  const professional = skillChips(data.professionalSkills);
  const technical = skillChips(data.technicalSkills);
  const experiences = data.experiences ?? [];
  const levelLabel = getExperienceLevelLabel(data.experienceLevel) || data.experienceLevel || '';
  const totalYears = estimateTotalExperienceYears(experiences);
  const experienceHeadline =
    totalYears != null && totalYears > 0
      ? `${totalYears} yıl deneyim`
      : experiences.length > 0
        ? `${experiences.length} deneyim`
        : null;

  return (
    <div className="space-y-5 rounded-xl border border-border/70 bg-card p-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Kariyer Kartı
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
          {data.desiredRole || 'Pozisyon belirtilmedi'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {[levelLabel, experienceHeadline].filter(Boolean).join(' · ') || 'Seviye belirtilmedi'}
        </p>
      </div>

      {sectorChips.length > 0 ? (
        <Section title="Uzmanlık alanları / sektörler">
          {sectorChips.join(' · ')}
        </Section>
      ) : null}

      {professional.length > 0 ? (
        <Section title="Mesleki yetkinlikler">{professional.join(' · ')}</Section>
      ) : null}

      {technical.length > 0 ? (
        <Section title="Teknik yetkinlikler">{technical.join(' · ')}</Section>
      ) : null}

      {(data.educationLevel || data.educationField) ? (
        <Section title="Eğitim">
          {[data.educationLevel, data.educationField].filter(Boolean).join(' · ')}
        </Section>
      ) : null}

      {data.languages ? <Section title="Yabancı dil">{data.languages}</Section> : null}

      {data.certificates ? <Section title="Sertifikalar">{data.certificates}</Section> : null}

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
          <p className="text-xs font-medium text-muted-foreground">Kariyer deneyimleri</p>
          <ul className="space-y-2">
            {experiences.map((exp) => (
              <li
                key={exp.id}
                className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm"
              >
                <p className="font-medium text-foreground">
                  {exp.role}
                  {exp.sector ? ` · ${exp.sector}` : ''}
                </p>
                {exp.duration ? (
                  <p className="text-xs text-muted-foreground">{exp.duration}</p>
                ) : null}
                {exp.responsibilities ? (
                  <div className="mt-1.5">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Temel sorumluluklar
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-muted-foreground line-clamp-4">
                      {exp.responsibilities}
                    </p>
                  </div>
                ) : null}
                {exp.achievements ? (
                  <div className="mt-1.5">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Öne çıkan başarılar
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-muted-foreground line-clamp-3">
                      {exp.achievements}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.longDescription ? (
        <Section title="Kariyer özeti">
          <p className="whitespace-pre-wrap leading-relaxed">{data.longDescription}</p>
        </Section>
      ) : null}

      <p className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
        Ad, soyad, şirket ve iletişim bilgileri gizli. İşverenler “İletişim Talebi Gönder” ile
        ulaşabilir; talebi kabul etmeden kişisel iletişim bilgileriniz paylaşılmaz.
      </p>
    </div>
  );
}
