'use client';

import { useState } from 'react';
import {
  Award,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Eye,
  GraduationCap,
  Hash,
  Heart,
  Languages,
  MapPin,
  Monitor,
  Shield,
  User,
} from 'lucide-react';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  estimateTotalExperienceYears,
  formatCareerPeriod,
  MONTH_OPTIONS,
  toCareerPeriodInterval,
} from '@/features/candidates/lib/career-experience-dates';
import { polishCareerSummary, isRelatedCareerRole } from '@/features/candidates/lib/career-summary';
import { detectCareerProgression } from '@/features/candidates/ai/career-progression';
import { pickHighlightedSkills } from '@/features/candidates/ai/skill-relevance';
import { composeAchievementWithMetric } from '@/features/candidates/ai/compose-achievement';
import {
  ageFromBirthDate,
  maskDisplaySurname,
  publicGenderLabel,
} from '@/features/candidates/lib/career-public-identity';
import {
  getExperienceLevelLabel,
  isManualCareerOption,
  parseCareerLanguages,
  parseSelectedList,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { FavoriteButton } from '@/components/girisimco/marketplace/favorite-button';
import { ListingContactCta } from '@/features/contact-requests/components/listing-contact-cta';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { ListingId } from '@/lib/domain/ids';

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
  displayName?: string | null;
  displayNameMasked?: string | null;
  age?: number | null;
  gender?: string | null;
  birthDate?: string | null;
  residenceCity?: string | null;
  residenceDistrict?: string | null;
  careerProgressions?: Array<{ from: string; to: string }>;
  highlightedSkills?: string[];
  highlightedAchievements?: string[];
  /** Form preview: explain these fields appear after an accepted request. */
  personalInfoPreview?: boolean;
};

export type CareerCardChrome = {
  listingId?: string;
  listingNumber?: string;
  publishedAt?: string;
  updatedAt?: string;
  views?: number;
  listingTitle?: string;
  identityGated?: boolean;
  ownerUserId?: string;
};

function formatCareerBirthDate(value: string | null | undefined): string {
  const raw = (value ?? '').trim();
  const ymd = raw.length >= 10 ? raw.slice(0, 10) : raw;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return raw;
  const month = MONTH_OPTIONS[Number(match[2]) - 1]?.label;
  if (!month) return raw;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

function asList(value: string[] | string | null | undefined): string[] {
  return parseSelectedList(value);
}

function prioritizeListedSkills(all: string[], highlighted: string[]): string[] {
  const rank = new Set(highlighted);
  return [...all.filter((item) => rank.has(item)), ...all.filter((item) => !rank.has(item))];
}

function splitLines(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(/\n|·/)
    .map((item) => item.trim())
    .filter(Boolean);
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

function ChipRow({
  values,
  limit = 5,
}: {
  values: string[];
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (values.length === 0) return <p className="text-sm text-muted-foreground">—</p>;
  const visible = expanded ? values : values.slice(0, limit);
  const hidden = values.length - visible.length;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {visible.map((value) => (
          <span
            key={value}
            className="inline-flex max-w-full items-center rounded-full bg-primary/[0.08] px-2.5 py-1 text-[12px] font-medium leading-snug text-primary"
          >
            <span className="truncate">{value}</span>
          </span>
        ))}
        {!expanded && hidden > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
          >
            +{hidden}
          </button>
        ) : null}
      </div>
      {expanded && values.length > limit ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          Daha az göster
        </button>
      ) : null}
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  title,
}: {
  icon: typeof Briefcase;
  title: string;
}) {
  return (
    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
      <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
      {title}
    </p>
  );
}

function CompactList({
  values,
  limit = 3,
  icon: Icon,
}: {
  values: string[];
  limit?: number;
  icon?: typeof Check;
}) {
  const [expanded, setExpanded] = useState(false);
  if (values.length === 0) return null;
  const visible = expanded ? values : values.slice(0, limit);
  const hidden = values.length - visible.length;
  return (
    <div>
      <ul className="space-y-1.5">
        {visible.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-snug text-foreground/85">
            {Icon ? (
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            ) : (
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {!expanded && hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          Tümünü gör · +{hidden}
        </button>
      ) : null}
    </div>
  );
}

function ExpandableText({
  text,
  lines = 4,
}: {
  text: string;
  lines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsToggle = text.length > 220;
  return (
    <div>
      <p
        className={cn(
          'text-sm leading-7 text-foreground/90',
          !expanded && needsToggle && (lines <= 3 ? 'line-clamp-3' : 'line-clamp-5'),
        )}
      >
        {text}
      </p>
      {needsToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-[12px] font-medium text-primary hover:text-primary/80"
        >
          {expanded ? 'Daha az göster' : 'Devamını gör'}
        </button>
      ) : null}
    </div>
  );
}

function HeroFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function CoverThumb({
  coverUrl,
  initials,
}: {
  coverUrl?: string | null;
  initials: string;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted sm:w-[152px] sm:shrink-0 lg:w-[176px]">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-muted">
          <span className="text-3xl font-semibold tracking-wide text-primary/80">{initials}</span>
        </div>
      )}
    </div>
  );
}

function experienceResponsibilities(exp: CareerExperience): string[] {
  const selected = (exp.selectedResponsibilities ?? []).filter(Boolean);
  if (selected.length > 0) return selected;
  return splitLines(exp.responsibilities);
}

function experienceAchievements(exp: CareerExperience): string[] {
  const selected = (exp.selectedAchievements ?? []).filter(
    (item) => item && !isManualCareerOption(item),
  );
  const lines = selected.length > 0 ? selected : splitLines(exp.achievements);
  const metric = (exp.achievementMetric ?? '').trim();
  if (!metric) return lines;
  if (lines.length === 0) return [metric];
  const [first, ...rest] = lines;
  return [composeAchievementWithMetric(first, metric), ...rest];
}

/** Public/preview card shared by İş Arıyorum (seeker) and İşe Alıyorum (hire). */
export function CareerProfilePreview({
  data,
  chrome,
  headingAs = 'h3',
}: {
  data: CareerCardInput;
  chrome?: CareerCardChrome;
  headingAs?: 'h1' | 'h2' | 'h3';
}) {
  const isHire = data.variant === 'hire';
  const preferredSectors = asList(data.preferredSectors);
  const sectorChips = preferredSectors.length
    ? preferredSectors
    : data.primarySector
      ? [data.primarySector]
      : [];
  const professionalAll = asList(data.professionalSkills);
  const technicalAll = asList(data.technicalSkills);
  const highlightedSkills = isHire
    ? pickHighlightedSkills({
        professionalSkills: data.professionalSkills,
        technicalSkills: data.technicalSkills,
        desiredRole: data.desiredRole,
        primarySector: data.primarySector,
        limit: 7,
      })
    : (data.highlightedSkills?.length
      ? data.highlightedSkills
      : pickHighlightedSkills({
          professionalSkills: data.professionalSkills,
          technicalSkills: data.technicalSkills,
          desiredRole: data.desiredRole,
          primarySector: data.primarySector,
          experiences: data.experiences,
          limit: 7,
        }));
  const professional = isHire
    ? prioritizeListedSkills(professionalAll, highlightedSkills)
    : highlightedSkills.filter((skill) => professionalAll.includes(skill));
  const technical = isHire
    ? prioritizeListedSkills(technicalAll, highlightedSkills)
    : highlightedSkills.filter((skill) => technicalAll.includes(skill));
  const certificates = asList(data.certificates);
  const languages = parseCareerLanguages(data.languages).filter(
    (entry) => (entry.languageOther || entry.language) && entry.level,
  );
  const hireDuties = asList(data.requiredResponsibilities);
  const hireWins = asList(data.requiredAchievements);
  const experiences = [...(data.experiences ?? [])].sort((a, b) => {
    if (!isHire && data.desiredRole) {
      const aRelated = isRelatedCareerRole(a.role, data.desiredRole) ? 1 : 0;
      const bRelated = isRelatedCareerRole(b.role, data.desiredRole) ? 1 : 0;
      if (aRelated !== bRelated) return bRelated - aRelated;
    }
    const aInterval = toCareerPeriodInterval(a);
    const bInterval = toCareerPeriodInterval(b);
    if (aInterval && bInterval) return bInterval.end - aInterval.end;
    return 0;
  });
  const [experiencesOpen, setExperiencesOpen] = useState(false);
  const featuredLimit = isHire ? 0 : 2;
  const visibleExperiences = isHire
    ? []
    : experiencesOpen
      ? experiences
      : experiences.slice(0, featuredLimit);
  const compactExperiences = isHire || experiencesOpen
    ? []
    : experiences.slice(featuredLimit);
  const extraExperienceCount = isHire ? 0 : Math.max(0, experiences.length - featuredLimit);
  const progressions =
    data.careerProgressions?.length
      ? data.careerProgressions
      : isHire
        ? []
        : detectCareerProgression(data.experiences ?? []);
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
  const Heading = headingAs;
  const ctaLabel = 'İletişim Talebi Gönder';
  const listingId = chrome?.listingId;
  const { user } = useAuth();
  const isOwner = Boolean(user?.id && chrome?.ownerUserId && user.id === chrome.ownerUserId);
  const showPublicCta = Boolean(listingId);
  const showChromeMeta = Boolean(
    chrome?.listingNumber
    || chrome?.publishedAt
    || chrome?.updatedAt
    || typeof chrome?.views === 'number',
  );
  const publicName =
    (data.displayName ?? '').trim()
    || data.displayNameMasked
    || (!listingId && !isHire ? maskDisplaySurname(user?.displayName) : null);
  const age = data.age ?? (!isHire ? ageFromBirthDate(data.birthDate) : null);
  const gender = isHire ? null : publicGenderLabel(data.gender);
  const showRevealedPersonal =
    !isHire
    && !data.personalInfoPreview
    && Boolean(data.birthDate || data.residenceCity || data.residenceDistrict);
  const hireConditions = [
    data.workplacePreference ? { label: 'Çalışma şekli', value: data.workplacePreference } : null,
    data.workType ? { label: 'Çalışma türü', value: data.workType } : null,
    data.preferredCity ? { label: 'Çalışma lokasyonu', value: data.preferredCity } : null,
    data.availability ? { label: 'İşe başlama', value: data.availability } : null,
    salary ? { label: 'Ücret aralığı', value: salary } : null,
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
  const heroFacts = isHire
    ? []
    : [
        levelLabel ? { label: 'Kariyer seviyesi', value: levelLabel } : null,
        experienceHeadline ? { label: 'Toplam deneyim', value: experienceHeadline } : null,
        data.preferredCity ? { label: 'Tercih edilen il', value: data.preferredCity } : null,
        data.workplacePreference ? { label: 'Çalışma modeli', value: data.workplacePreference } : null,
        data.workType ? { label: 'Çalışma tercihi', value: data.workType } : null,
        data.availability ? { label: 'İşe başlama', value: data.availability } : null,
        data.salaryExpectation ? { label: 'Ücret beklentisi', value: data.salaryExpectation } : null,
      ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
  const hireHasProfile = Boolean(
    data.educationLevel || data.educationField || certificates.length > 0 || languages.length > 0,
  );

  const sectionClass = 'border-t border-border/40 px-5 py-6 sm:px-6 lg:px-8 lg:py-7';

  return (
    <article className="overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] dark:bg-card">
      <div className="relative px-5 py-6 sm:px-6 sm:py-7 lg:px-8">
        <div className="absolute right-5 top-5 sm:right-6 lg:right-8">
          {listingId ? (
            <FavoriteButton
              listingId={listingId as ListingId}
              title={chrome?.listingTitle ?? data.desiredRole ?? undefined}
              className="h-10 w-10 rounded-full border-border/60 bg-white shadow-sm"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground shadow-sm">
              <Heart className="h-4 w-4" aria-hidden />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <CoverThumb coverUrl={data.coverUrl} initials={initials} />
          <div className="min-w-0 flex-1 pr-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              {isHire ? 'İş ilanı kartı' : 'Kariyer kartı'}
            </p>
            {!isHire && (publicName || age || gender) ? (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
                {publicName ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold tracking-tight text-foreground">
                    <User className="h-3.5 w-3.5 text-primary" aria-hidden />
                    {publicName}
                  </span>
                ) : null}
                {publicName && (age || gender) ? <span aria-hidden>·</span> : null}
                {age ? <span>{age} yaş</span> : null}
                {age && gender ? <span aria-hidden>·</span> : null}
                {gender ? <span>{gender}</span> : null}
              </p>
            ) : null}
            <Heading className="mt-2 break-words font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.8rem]">
              {data.desiredRole || (isHire ? 'Açık pozisyon belirtilmedi' : 'Pozisyon belirtilmedi')}
            </Heading>
            {isHire ? (
              data.primarySector || levelLabel ? (
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  {data.primarySector ? (
                    <span className="font-medium text-primary">{data.primarySector}</span>
                  ) : null}
                  {data.primarySector && levelLabel ? (
                    <span className="text-muted-foreground" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  {levelLabel ? (
                    <span className="text-muted-foreground">{levelLabel}</span>
                  ) : null}
                </p>
              ) : null
            ) : (
              <>
                {data.primarySector ? (
                  <p className="mt-1.5 text-sm font-medium text-primary">{data.primarySector}</p>
                ) : null}
                {heroFacts.length > 0 ? (
                  <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                    {heroFacts.map((fact) => (
                      <HeroFact key={fact.label} label={fact.label} value={fact.value} />
                    ))}
                  </dl>
                ) : null}
              </>
            )}
            {!isHire && progressions.length > 0 ? (
              <p className="mt-4 text-sm text-foreground">
                <span className="text-muted-foreground">Kariyer gelişimi: </span>
                {progressions.map((item) => `${item.from} → ${item.to}`).join(' · ')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {summary ? (
        <div className={sectionClass}>
          <SectionLabel icon={User} title={isHire ? 'Pozisyon özeti' : 'Kariyer özeti'} />
          <ExpandableText text={summary} lines={3} />
        </div>
      ) : null}

      {isHire ? (
        <>
          {hireHasProfile ? (
            <div className={sectionClass}>
              <SectionLabel icon={GraduationCap} title="Aranan profil" />
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Eğitim
                  </p>
                  {data.educationLevel || data.educationField ? (
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {data.educationLevel || 'Eğitim'}
                      </p>
                      {data.educationField ? (
                        <p className="mt-0.5 text-sm text-muted-foreground">{data.educationField}</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belirtilmedi</p>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Sertifika / Dil
                  </p>
                  <div className="space-y-3">
                    {certificates.length > 0 ? <CompactList values={certificates} icon={Check} /> : null}
                    {languages.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {languages.map((entry) => {
                          const name = entry.languageOther?.trim() || entry.language;
                          return (
                            <span
                              key={`${name}-${entry.level}`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs"
                            >
                              <Languages className="h-3 w-3 text-primary" aria-hidden />
                              <span className="font-medium text-foreground">{name}</span>
                              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {entry.level}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                    {certificates.length === 0 && languages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Belirtilmedi</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {hireDuties.length > 0 || hireWins.length > 0 ? (
            <div className={sectionClass}>
              <SectionLabel icon={Briefcase} title="Pozisyon sorumlulukları" />
              {hireDuties.length > 0 ? <CompactList values={hireDuties} limit={4} /> : null}
              {hireWins.length > 0 ? (
                <div className={hireDuties.length > 0 ? 'mt-4' : undefined}>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Beklenen sonuçlar
                  </p>
                  <CompactList values={hireWins} icon={Check} limit={2} />
                </div>
              ) : null}
            </div>
          ) : null}

          {professional.length > 0 || technical.length > 0 ? (
            <div className={sectionClass}>
              <SectionLabel icon={Award} title="Aranan yetkinlikler" />
              <div className="grid gap-6 sm:grid-cols-2">
                {professional.length > 0 ? (
                  <div className="min-w-0">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Mesleki
                    </p>
                    <ChipRow values={professional} limit={5} />
                  </div>
                ) : null}
                {technical.length > 0 ? (
                  <div className="min-w-0">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Teknik
                    </p>
                    <ChipRow values={technical} limit={5} />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {hireConditions.length > 0 ? (
            <div className={sectionClass}>
              <SectionLabel icon={MapPin} title="Çalışma koşulları" />
              <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                {hireConditions.map((fact) => (
                  <HeroFact key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </dl>
            </div>
          ) : null}
        </>
      ) : (
        <>
      <div className={sectionClass}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0">
            <SectionLabel
              icon={Briefcase}
              title="Uzmanlık alanları"
            />
            <ChipRow values={sectorChips} />
          </div>
          <div className="min-w-0">
            <SectionLabel
              icon={Award}
              title="Mesleki yetkinlikler"
            />
            <ChipRow values={professional} />
          </div>
          <div className="min-w-0">
            <SectionLabel
              icon={Monitor}
              title="Teknik yetkinlikler"
            />
            <ChipRow values={technical} />
          </div>
        </div>
      </div>

        <div className={sectionClass}>
          <SectionLabel icon={Briefcase} title="Kariyer deneyimi" />
          {experiences.length > 0 ? (
            <ol className="space-y-0">
              {visibleExperiences.map((exp, index) => {
                const period = formatCareerPeriod(exp) || exp.duration;
                const duties = experienceResponsibilities(exp);
                const wins = experienceAchievements(exp);
                const isLast = index === visibleExperiences.length - 1;
                return (
                  <li
                    key={exp.id}
                    className="relative grid grid-cols-1 gap-2 border-l border-border pl-4 sm:grid-cols-[8rem_1rem_minmax(0,1fr)] sm:gap-x-4 sm:border-l-0 sm:pl-0"
                  >
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-white sm:hidden dark:bg-card" />
                    <p className="pt-0.5 text-xs font-medium leading-5 text-muted-foreground sm:text-right">
                      {period || 'Tarih belirtilmedi'}
                    </p>
                    <div className="relative hidden sm:block">
                      <span className="absolute left-1/2 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-primary bg-white dark:bg-card" />
                      {!isLast ? (
                        <span className="absolute bottom-[-14px] left-1/2 top-4 w-px -translate-x-1/2 bg-border" />
                      ) : null}
                    </div>
                    <div className={cn('min-w-0 pb-6', isLast && extraExperienceCount === 0 && 'pb-0')}>
                      <p className="text-sm font-semibold text-foreground">{exp.role}</p>
                      {exp.sector ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{exp.sector}</p>
                      ) : null}
                      {duties.length > 0 ? (
                        <div className="mt-2.5">
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            Temel sorumluluklar
                          </p>
                          <CompactList values={duties} limit={3} />
                        </div>
                      ) : null}
                      {wins.length > 0 ? (
                        <div className="mt-2.5">
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            Öne çıkan başarılar
                          </p>
                          <CompactList values={wins} icon={Check} limit={2} />
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Deneyim eklenmedi</p>
          )}
          {compactExperiences.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {compactExperiences.map((exp) => (
                <li key={exp.id} className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{exp.role}</span>
                  {exp.sector ? ` · ${exp.sector}` : ''}
                  {' · '}
                  {formatCareerPeriod(exp) || exp.duration || 'Tarih belirtilmedi'}
                </li>
              ))}
            </ul>
          ) : null}
          {extraExperienceCount > 0 ? (
            <button
              type="button"
              onClick={() => setExperiencesOpen((value) => !value)}
              className="mt-1 text-[12px] font-medium text-primary hover:text-primary/80"
            >
              {experiencesOpen
                ? 'Daha az göster'
                : `+ ${extraExperienceCount} deneyim daha`}
            </button>
          ) : null}
        </div>

      <div className={sectionClass}>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="min-w-0">
            <SectionLabel
              icon={GraduationCap}
              title="Eğitim"
            />
            {data.educationLevel || data.educationField ? (
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {data.educationLevel || 'Eğitim'}
                </p>
                {data.educationField ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">{data.educationField}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belirtilmedi</p>
            )}
          </div>
          <div className="min-w-0">
            <SectionLabel icon={Award} title="Sertifika / Dil" />
            <div className="space-y-3">
              {certificates.length > 0 ? <CompactList values={certificates} icon={Check} /> : null}
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((entry) => {
                    const name = entry.languageOther?.trim() || entry.language;
                    return (
                      <span
                        key={`${name}-${entry.level}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs"
                      >
                        <Languages className="h-3 w-3 text-primary" aria-hidden />
                        <span className="font-medium text-foreground">{name}</span>
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          {entry.level}
                        </span>
                      </span>
                    );
                  })}
                </div>
              ) : null}
              {certificates.length === 0 && languages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belirtilmedi</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {showRevealedPersonal ? (
        <div className="border-t border-border/40 px-5 py-5 sm:px-6 lg:px-8">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
            Kişisel bilgiler
          </p>
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

      {showChromeMeta || showPublicCta ? (
        <div className="flex flex-col gap-3 border-t border-border/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
            {chrome?.listingNumber ? (
              <span className="inline-flex items-center gap-1.5">
                <Hash className="h-3 w-3" aria-hidden />
                {chrome.listingNumber}
              </span>
            ) : null}
            {chrome?.publishedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3" aria-hidden />
                {chrome.publishedAt}
              </span>
            ) : null}
            {chrome?.updatedAt ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" aria-hidden />
                Güncelleme {chrome.updatedAt}
              </span>
            ) : null}
            {typeof chrome?.views === 'number' ? (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3 w-3" aria-hidden />
                {chrome.views.toLocaleString('tr-TR')} görüntülenme
              </span>
            ) : null}
          </div>
          {showPublicCta ? (
            <div className="w-full shrink-0 sm:max-w-sm">
              {listingId && !isOwner ? (
                <ListingContactCta
                  listingId={listingId}
                  listingTitle={chrome?.listingTitle}
                  isOwner={isOwner}
                  categoryId={isHire ? 'hire' : 'find-job'}
                  identityGated={chrome?.identityGated ?? !isHire}
                  variant="compact"
                  buttonLabel={ctaLabel}
                  className="h-11 w-full rounded-2xl px-6 font-semibold sm:w-auto"
                />
              ) : (
                <Button type="button" disabled className="h-11 w-full rounded-2xl px-6 sm:w-auto">
                  Sizin ilanınız
                </Button>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-start gap-2.5 border-t border-primary/10 bg-primary/[0.04] px-5 py-3 text-[11px] leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <p>
          {isHire
            ? 'Telefon ve e-posta kartta görünmez. Adaylar “İletişim Talebi Gönder” ile ulaşır; kabul edilince iletişim açılır.'
            : 'Soyad yıldızla gizlenir. Tam ad, doğum tarihi, adres ve iletişim bilgileri talep kabulünden sonra açılır.'}
        </p>
      </div>
    </article>
  );
}
