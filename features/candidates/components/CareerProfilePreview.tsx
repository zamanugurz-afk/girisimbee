'use client';

import type { ReactNode } from 'react';
import {
  Award,
  Briefcase,
  Calendar,
  Check,
  GraduationCap,
  Languages,
  MapPin,
  Monitor,
  Shield,
} from 'lucide-react';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  estimateTotalExperienceYears,
  toCareerPeriodInterval,
} from '@/features/candidates/lib/career-experience-dates';
import {
  getExperienceLevelLabel,
  parseCareerLanguages,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { GcTag } from '@/components/girisimco/ui/gc-tag';
import { cn } from '@/lib/utils';

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
  return parseSelectedList(value);
}

function roleInitials(role: string | null | undefined): string {
  const words = (role ?? '')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word && !/^(ve|ile|veya|\/|-)$/i.test(word));
  if (words.length === 0) return 'KK';
  if (words.length === 1) return words[0]!.slice(0, 2).toLocaleUpperCase('tr-TR');
  return `${words[0]!.charAt(0)}${words[1]!.charAt(0)}`.toLocaleUpperCase('tr-TR');
}

function bullets(text: string | null | undefined, limit = 3): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n|[•]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function ChipRow({ values, limit = 5 }: { values: string[]; limit?: number }) {
  if (values.length === 0) return <p className="text-sm text-muted-foreground">—</p>;
  const visible = values.slice(0, limit);
  const hidden = values.length - visible.length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((value) => (
        <GcTag key={value} variant="default" size="sm">
          {value}
        </GcTag>
      ))}
      {hidden > 0 ? (
        <GcTag variant="muted" size="sm">
          +{hidden}
        </GcTag>
      ) : null}
    </div>
  );
}

function CardSection({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: typeof Briefcase;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
        {title}
      </p>
      {children}
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
  const professional = asList(data.professionalSkills);
  const technical = asList(data.technicalSkills);
  const certificates = asList(data.certificates);
  const languages = parseCareerLanguages(data.languages).filter(
    (entry) => (entry.languageOther || entry.language) && entry.level,
  );
  const experiences = [...(data.experiences ?? [])].sort((a, b) => {
    const aInterval = toCareerPeriodInterval(a);
    const bInterval = toCareerPeriodInterval(b);
    if (aInterval && bInterval) return bInterval.end - aInterval.end;
    return 0;
  });
  const featuredExperience = experiences[0];
  const levelLabel = getExperienceLevelLabel(data.experienceLevel) || data.experienceLevel || '';
  const totalYears = estimateTotalExperienceYears(experiences);
  const experienceHeadline =
    totalYears != null && totalYears > 0
      ? `${totalYears} yıl deneyim`
      : experiences.length > 0
        ? `${experiences.length} deneyim`
        : null;
  const initials = roleInitials(data.desiredRole);
  const hook = (data.longDescription ?? '').trim().split(/(?<=[.!?…])\s+/)[0] ?? '';

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex min-w-0 gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <Check className="h-3 w-3" aria-hidden />
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-xl font-semibold text-foreground">
              {data.desiredRole || 'Pozisyon belirtilmedi'}
            </h3>
            {data.primarySector ? (
              <p className="mt-0.5 text-sm font-medium text-primary">{data.primarySector}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {levelLabel ? (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {levelLabel}
                </span>
              ) : null}
              {experienceHeadline ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {experienceHeadline}
                </span>
              ) : null}
              {data.preferredCity ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {data.preferredCity}
                </span>
              ) : null}
            </div>
            {hook ? (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {hook}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-primary/15 bg-primary/[0.05] p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Monitor className="h-3.5 w-3.5 text-primary" aria-hidden />
            Çalışma tercihi
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {data.workplacePreference || data.workType || 'Belirtilmedi'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {[data.workType, data.availability, data.preferredCity].filter(Boolean).join(' · ')
              || 'Çalışma modeli belirtilmedi'}
          </p>
          {data.salaryExpectation ? (
            <p className="mt-2 text-xs font-medium text-primary">{data.salaryExpectation}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 border-t border-border/60 px-5 py-4 md:grid-cols-3">
        <CardSection icon={Briefcase} title="Uzmanlık alanları">
          <ChipRow values={sectorChips} />
        </CardSection>
        <CardSection icon={Award} title="Mesleki yetkinlikler">
          <ChipRow values={professional} />
        </CardSection>
        <CardSection icon={Monitor} title="Teknik yetkinlikler">
          <ChipRow values={technical} />
        </CardSection>
      </div>

      <div className="grid gap-4 border-t border-border/60 px-5 py-4 md:grid-cols-3">
        <CardSection icon={Briefcase} title="Deneyim">
          {featuredExperience ? (
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">{featuredExperience.role}</p>
              {featuredExperience.sector ? (
                <p className="text-xs text-muted-foreground">{featuredExperience.sector}</p>
              ) : null}
              {featuredExperience.duration ? (
                <p className="text-xs font-medium text-primary">{featuredExperience.duration}</p>
              ) : null}
              <ul className="space-y-1 text-xs text-muted-foreground">
                {bullets(featuredExperience.responsibilities).map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {experiences.length > 1 ? (
                <p className="pt-1 text-xs font-medium text-primary">
                  Tüm deneyimler ({experiences.length})
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Deneyim eklenmedi</p>
          )}
        </CardSection>

        <CardSection icon={GraduationCap} title="Eğitim">
          {data.educationLevel || data.educationField ? (
            <div>
              <p className="text-sm font-semibold text-foreground">
                {data.educationLevel || 'Eğitim'}
              </p>
              {data.educationField ? (
                <p className="mt-1 text-sm text-primary">{data.educationField}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belirtilmedi</p>
          )}
        </CardSection>

        <CardSection icon={Award} title="Sertifikalar">
          {certificates.length > 0 ? (
            <ul className="space-y-1.5">
              {certificates.slice(0, 4).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
              {certificates.length > 4 ? (
                <li className="text-xs font-medium text-primary">
                  Tüm sertifikalar ({certificates.length})
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Belirtilmedi</p>
          )}
        </CardSection>
      </div>

      {(languages.length > 0 || data.longDescription) ? (
        <div className="grid gap-4 border-t border-border/60 px-5 py-4 md:grid-cols-2">
          <CardSection icon={Languages} title="Yabancı diller">
            {languages.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {languages.map((entry) => {
                  const name = entry.languageOther?.trim() || entry.language;
                  return (
                    <span key={`${name}-${entry.level}`} className="inline-flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">{name}</span>
                      <GcTag variant="default" size="sm">
                        {entry.level}
                      </GcTag>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belirtilmedi</p>
            )}
          </CardSection>
          {data.longDescription ? (
            <div className="rounded-xl bg-primary/[0.04] px-4 py-3">
              <p className="text-xs font-semibold text-foreground">Kariyer özeti</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {data.longDescription}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {experiences.length > 1 ? (
        <div className="space-y-2 border-t border-border/60 px-5 py-4">
          <p className="text-xs font-semibold text-foreground">Tüm kariyer deneyimleri</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {experiences.map((exp) => (
              <li key={exp.id} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                <p className="text-sm font-medium text-foreground">
                  {exp.role}
                  {exp.sector ? ` · ${exp.sector}` : ''}
                </p>
                {exp.duration ? (
                  <p className="text-xs font-medium text-primary">{exp.duration}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="flex items-start gap-2 border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        Ad, soyad, şirket ve iletişim bilgileri gizli. İşverenler “İletişim Talebi Gönder” ile
        ulaşabilir; talebi kabul etmeden kişisel iletişim bilgileriniz paylaşılmaz.
      </p>
    </div>
  );
}
