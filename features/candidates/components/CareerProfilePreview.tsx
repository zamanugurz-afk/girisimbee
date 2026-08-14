'use client';

import type { ReactNode } from 'react';
import {
  Award,
  Briefcase,
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
  MONTH_OPTIONS,
  toCareerPeriodInterval,
} from '@/features/candidates/lib/career-experience-dates';
import { polishCareerSummary } from '@/features/candidates/lib/career-summary';
import {
  getExperienceLevelLabel,
  parseCareerLanguages,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { GcTag } from '@/components/girisimco/ui/gc-tag';

export type CareerCardInput = {
  variant?: 'seeker' | 'hire';
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
  salaryRange?: string | null;
  availability?: string | null;
  requiredResponsibilities?: string | null;
  requiredAchievements?: string | null;
  longDescription?: string | null;
  experiences?: CareerExperience[];
  coverUrl?: string | null;
  birthDate?: string | null;
  residenceCity?: string | null;
  residenceDistrict?: string | null;
  /** Form preview: explain these fields appear after an accepted request. */
  personalInfoPreview?: boolean;
};

function formatCareerBirthDate(value: string | null | undefined): string {
  const raw = (value ?? '').trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return raw;
  const month = MONTH_OPTIONS[Number(match[2]) - 1]?.label;
  if (!month) return raw;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

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

function bullets(text: string | null | undefined, limit = 2): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\n|[•]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function ChipRow({ values, limit = 4 }: { values: string[]; limit?: number }) {
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
}: {
  icon: typeof Briefcase;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
        {title}
      </p>
      {children}
    </div>
  );
}

/** Public/preview card shared by İş Arıyorum (seeker) and İşe Alıyorum (hire). */
export function CareerProfilePreview({ data }: { data: CareerCardInput }) {
  const isHire = data.variant === 'hire';
  const preferredSectors = asList(data.preferredSectors);
  const sectorChips = isHire
    ? (data.primarySector ? [data.primarySector] : [])
    : preferredSectors.length
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
  const hireDuties = asList(data.requiredResponsibilities);
  const hireWins = asList(data.requiredAchievements);
  const experiences = [...(data.experiences ?? [])].sort((a, b) => {
    const aInterval = toCareerPeriodInterval(a);
    const bInterval = toCareerPeriodInterval(b);
    if (aInterval && bInterval) return bInterval.end - aInterval.end;
    return 0;
  });
  const featuredExperience = experiences[0];
  const extraExperiences = isHire ? [] : experiences.slice(1);
  const levelLabel = getExperienceLevelLabel(data.experienceLevel) || data.experienceLevel || '';
  const totalYears = estimateTotalExperienceYears(experiences);
  const experienceHeadline = isHire
    ? null
    : totalYears != null && totalYears > 0
      ? `${totalYears} yıl deneyim`
      : experiences.length > 0
        ? `${experiences.length} deneyim`
        : null;
  const initials = roleInitials(data.desiredRole);
  const summary = polishCareerSummary(data.longDescription);
  const salary = isHire ? data.salaryRange : data.salaryExpectation;
  const metaChips = [
    levelLabel,
    experienceHeadline,
    data.preferredCity,
    data.workplacePreference,
    data.workType,
    data.availability,
  ].filter(Boolean) as string[];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="flex gap-5 p-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-28 sm:w-28">
          {data.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 self-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {isHire ? 'İş İlanı Kartı' : 'Kariyer Kartı'}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight text-foreground">
            {data.desiredRole || (isHire ? 'Açık pozisyon belirtilmedi' : 'Pozisyon belirtilmedi')}
          </h3>
          {data.primarySector ? (
            <p className="mt-1 text-sm font-medium text-primary">{data.primarySector}</p>
          ) : null}
          {metaChips.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {metaChips.map((chip) => (
                <GcTag key={chip} variant="muted" size="sm">
                  {chip}
                </GcTag>
              ))}
            </div>
          ) : null}
          {salary ? (
            <p className="mt-2 text-xs font-medium text-primary">{salary}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 border-t border-border/60 px-5 py-4 md:grid-cols-3">
        <CardSection icon={Briefcase} title={isHire ? 'Sektör' : 'Uzmanlık'}>
          <ChipRow values={sectorChips} />
        </CardSection>
        <CardSection icon={Award} title={isHire ? 'Aranan mesleki' : 'Mesleki'}>
          <ChipRow values={professional} />
        </CardSection>
        <CardSection icon={Monitor} title={isHire ? 'Aranan teknik' : 'Teknik'}>
          <ChipRow values={technical} />
        </CardSection>
      </div>

      <div className="grid gap-4 border-t border-border/60 px-5 py-4 md:grid-cols-3">
        <CardSection icon={Briefcase} title={isHire ? 'İş tanımı' : 'Deneyim'}>
          {isHire ? (
            hireDuties.length > 0 || hireWins.length > 0 ? (
              <div>
                {hireDuties.length > 0 ? (
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {hireDuties.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-1.5">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {hireWins.length > 0 ? (
                  <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                    {hireWins.slice(0, 2).map((item) => (
                      <li key={item} className="flex gap-1.5">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">İş tanımı eklenmedi</p>
            )
          ) : featuredExperience ? (
            <div>
              <p className="text-sm font-semibold text-foreground">{featuredExperience.role}</p>
              <p className="text-xs text-muted-foreground">
                {[featuredExperience.sector, featuredExperience.duration].filter(Boolean).join(' · ')}
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                {bullets(featuredExperience.responsibilities).map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Deneyim eklenmedi</p>
          )}
        </CardSection>

        <CardSection icon={GraduationCap} title={isHire ? 'Aranan eğitim' : 'Eğitim'}>
          {data.educationLevel || data.educationField ? (
            <div>
              <p className="text-sm font-semibold text-foreground">
                {data.educationLevel || 'Eğitim'}
              </p>
              {data.educationField ? (
                <p className="mt-0.5 text-sm text-primary">{data.educationField}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belirtilmedi</p>
          )}
        </CardSection>

        <CardSection icon={Award} title="Sertifika / Dil">
          <div className="space-y-2">
            {certificates.length > 0 ? (
              <ul className="space-y-1">
                {certificates.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-sm text-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {languages.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {languages.map((entry) => {
                  const name = entry.languageOther?.trim() || entry.language;
                  return (
                    <span key={`${name}-${entry.level}`} className="inline-flex items-center gap-1.5 text-xs">
                      <Languages className="h-3 w-3 text-primary" aria-hidden />
                      <span className="font-medium text-foreground">{name}</span>
                      <GcTag variant="default" size="sm">
                        {entry.level}
                      </GcTag>
                    </span>
                  );
                })}
              </div>
            ) : null}
            {certificates.length === 0 && languages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belirtilmedi</p>
            ) : null}
          </div>
        </CardSection>
      </div>

      {extraExperiences.length > 0 ? (
        <div className="grid gap-2 border-t border-border/60 px-4 py-3 sm:grid-cols-2">
          {extraExperiences.map((exp) => (
            <div key={exp.id} className="rounded-xl bg-muted/30 px-3 py-2">
              <p className="text-sm font-medium text-foreground">{exp.role}</p>
              <p className="text-xs text-muted-foreground">
                {[exp.sector, exp.duration].filter(Boolean).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {summary ? (
        <div className="border-t border-border/60 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {isHire ? 'Pozisyon özeti' : 'Kariyer özeti'}
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground/90">
            {summary}
          </p>
        </div>
      ) : null}

      {!isHire && (data.birthDate || data.residenceCity || data.residenceDistrict) ? (
        <div className="border-t border-border/60 px-4 py-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
            Kişisel bilgiler
          </p>
          {data.personalInfoPreview ? (
            <p className="mb-2 text-xs text-muted-foreground">
              Bu alanlar kamu kartında gizli kalır; iletişim talebi kabul edilince görünür.
            </p>
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {data.birthDate ? (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Doğum tarihi: </span>
                {formatCareerBirthDate(data.birthDate)}
              </p>
            ) : null}
            {data.residenceCity || data.residenceDistrict ? (
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground">Yaşadığı yer: </span>
                {[data.residenceCity, data.residenceDistrict].filter(Boolean).join(', ')}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {isHire ? (
        <p className="flex items-start gap-2 border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          Telefon ve e-posta kartta görünmez. Adaylar “İletişim Talebi Gönder” ile başvurur; kabul edilince iletişim açılır.
        </p>
      ) : (
      <p className="flex items-start gap-2 border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        {data.birthDate || data.residenceCity || data.residenceDistrict
          ? 'Ad, soyad ve iletişim bilgileri talep kabulünden sonra paylaşılır. Doğum tarihi ve yaşadığı yer yalnızca kabul edilen taleplerde görünür.'
          : 'Ad, soyad, doğum tarihi, adres ve iletişim bilgileri gizli. İşverenler “İletişim Talebi Gönder” ile ulaşabilir; kabul edilince doğum tarihi ve yaşadığı yer görünür.'}
      </p>
      )}
    </div>
  );
}
