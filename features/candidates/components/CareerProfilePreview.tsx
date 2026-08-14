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
  Wallet,
} from 'lucide-react';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  estimateTotalExperienceYears,
  formatCareerPeriod,
  MONTH_OPTIONS,
  toCareerPeriodInterval,
} from '@/features/candidates/lib/career-experience-dates';
import { polishCareerSummary } from '@/features/candidates/lib/career-summary';
import {
  ageFromBirthDate,
  maskDisplaySurname,
  publicGenderLabel,
} from '@/features/candidates/lib/career-public-identity';
import {
  getExperienceLevelLabel,
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

function ChipRow({
  values,
  limit = 4,
}: {
  values: string[];
  limit?: number;
  tone?: 'hire' | 'seeker';
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
  tone?: 'hire' | 'seeker';
}) {
  return (
    <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
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
  tone?: 'hire' | 'seeker';
}) {
  const [expanded, setExpanded] = useState(false);
  if (values.length === 0) return <p className="text-sm text-muted-foreground">—</p>;
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

function EducationBlock({
  data,
  tone,
}: {
  data: CareerCardInput;
  tone: 'hire' | 'seeker';
}) {
  return (
    <div className="min-w-0">
      <SectionLabel
        icon={GraduationCap}
        title={tone === 'hire' ? 'Eğitim beklentisi' : 'Eğitim'}
      />
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
    </div>
  );
}

function CertLanguageBlock({
  certificates,
  languages,
}: {
  certificates: string[];
  languages: ReturnType<typeof parseCareerLanguages>;
  tone?: 'hire' | 'seeker';
}) {
  return (
    <div className="min-w-0">
      <SectionLabel icon={Award} title="Sertifika / Dil" />
      <div className="space-y-2.5">
        {certificates.length > 0 ? (
          <CompactList values={certificates} icon={Check} />
        ) : null}
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
  );
}

function experienceDuties(exp: CareerExperience): string[] {
  const selected = (exp.selectedResponsibilities ?? []).filter(Boolean);
  if (selected.length > 0) return selected.slice(0, 2);
  return (exp.responsibilities ?? '')
    .split(/\n|·/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function CoverThumb({
  coverUrl,
  initials,
}: {
  coverUrl?: string | null;
  initials: string;
}) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted sm:w-[148px] sm:shrink-0 lg:w-[168px]">
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
  const tone: 'hire' | 'seeker' = isHire ? 'hire' : 'seeker';
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
  const visibleExperiences = isHire ? [] : experiences.slice(0, 3);
  const extraExperienceCount = isHire ? 0 : Math.max(0, experiences.length - 3);
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
  const ctaLabel = isHire ? 'İlana Başvur' : 'İletişim Talebi Gönder';
  const listingId = chrome?.listingId;
  const { user } = useAuth();
  const isOwner = Boolean(user?.id && chrome?.ownerUserId && user.id === chrome.ownerUserId);
  const publicName =
    (data.displayName ?? '').trim()
    || data.displayNameMasked
    || (!isHire ? maskDisplaySurname(user?.displayName) : null);
  const age = data.age ?? (!isHire ? ageFromBirthDate(data.birthDate) : null);
  const gender = isHire ? null : publicGenderLabel(data.gender);
  const pills = [
    levelLabel,
    experienceHeadline,
    data.preferredCity,
    data.workplacePreference,
    data.workType,
    data.availability,
  ].filter((value): value is string => Boolean(value && value.trim()));
  const showRevealedPersonal =
    !isHire
    && !data.personalInfoPreview
    && Boolean(data.birthDate || data.residenceCity || data.residenceDistrict);

  return (
    <article className="overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] dark:bg-card">
      <div className="relative px-5 py-5 sm:px-6 sm:py-6 lg:px-8">
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

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
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
            <Heading className="mt-1 font-display text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.75rem]">
              {data.desiredRole || (isHire ? 'Açık pozisyon belirtilmedi' : 'Pozisyon belirtilmedi')}
            </Heading>
            {data.primarySector ? (
              <p className="mt-1 text-sm font-medium text-primary">{data.primarySector}</p>
            ) : null}
            {pills.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-foreground/80"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            ) : null}
            {salary ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Wallet className="h-3.5 w-3.5 text-primary" aria-hidden />
                {salary}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {isHire ? (
        <>
          <div className="grid gap-5 border-t border-border/50 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="min-w-0">
              <SectionLabel icon={Briefcase} title="Sektör" />
              <ChipRow values={sectorChips} />
            </div>
            <div className="min-w-0">
              <SectionLabel icon={Award} title="Aranan mesleki yetkinlikler" />
              <ChipRow values={professional} />
            </div>
            <div className="min-w-0">
              <SectionLabel icon={Monitor} title="Aranan teknik yetkinlikler" />
              <ChipRow values={technical} />
            </div>
          </div>
          <div className="grid gap-5 border-t border-border/50 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="min-w-0">
              <SectionLabel icon={Briefcase} title="İş tanımı" />
              {hireDuties.length > 0 || hireWins.length > 0 ? (
                <div className="space-y-3">
                  {hireDuties.length > 0 ? <CompactList values={hireDuties} /> : null}
                  {hireWins.length > 0 ? (
                    <CompactList values={hireWins} icon={Check} limit={2} />
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">İş tanımı eklenmedi</p>
              )}
            </div>
            <EducationBlock data={data} tone={tone} />
            <CertLanguageBlock certificates={certificates} languages={languages} />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-5 border-t border-border/50 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="min-w-0">
              <SectionLabel icon={Briefcase} title="Uzmanlık" />
              <ChipRow values={sectorChips} />
            </div>
            <EducationBlock data={data} tone={tone} />
            <CertLanguageBlock certificates={certificates} languages={languages} />
          </div>
          <div className="grid gap-5 border-t border-border/50 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="min-w-0">
              <SectionLabel icon={Briefcase} title="Deneyim" />
              {experiences.length > 0 ? (
                <div className="space-y-3">
                  {visibleExperiences.map((exp) => {
                    const period = formatCareerPeriod(exp) || exp.duration;
                    const duties = experienceDuties(exp);
                    return (
                      <div key={exp.id} className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{exp.role}</p>
                        {exp.sector || period ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {[exp.sector, period].filter(Boolean).join(' · ')}
                          </p>
                        ) : null}
                        {duties.length > 0 ? (
                          <ul className="mt-1.5 space-y-1">
                            {duties.map((duty) => (
                              <li key={duty} className="flex gap-2 text-xs leading-snug text-foreground/80">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span>{duty}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Deneyim eklenmedi</p>
              )}
              {extraExperienceCount > 0 ? (
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  {totalYears != null && totalYears > 0
                    ? `Toplam deneyim süresi: ${totalYears} yıl`
                    : `Toplam ${experiences.length} deneyim`}
                </p>
              ) : null}
            </div>
            <div className="min-w-0">
              <SectionLabel icon={Award} title="Mesleki" />
              <ChipRow values={professional} />
            </div>
            <div className="min-w-0">
              <SectionLabel icon={Monitor} title="Teknik" />
              <ChipRow values={technical} />
            </div>
          </div>
        </>
      )}

      {summary ? (
        <div className="border-t border-border/50 px-5 py-5 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {isHire ? 'Pozisyon özeti' : data.personalInfoPreview ? 'Kariyer özeti önerisi' : 'Kariyer özeti'}
          </p>
          {data.personalInfoPreview && !isHire ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Taslağı kullanabilir veya kendi özetinizi yazabilirsiniz.
            </p>
          ) : null}
          <p className="mt-2 text-sm leading-7 text-foreground/90">{summary}</p>
        </div>
      ) : null}

      {showRevealedPersonal ? (
        <div className="border-t border-border/50 px-5 py-4 sm:px-6 lg:px-8">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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

      <div className="flex flex-col gap-3 border-t border-border/50 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {chrome?.listingNumber ? (
            <span className="inline-flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" aria-hidden />
              {chrome.listingNumber}
            </span>
          ) : null}
          {chrome?.publishedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              {chrome.publishedAt}
            </span>
          ) : null}
          {chrome?.updatedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Güncelleme {chrome.updatedAt}
            </span>
          ) : null}
          {typeof chrome?.views === 'number' ? (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              {chrome.views.toLocaleString('tr-TR')} görüntülenme
            </span>
          ) : null}
        </div>
        <div className="w-full shrink-0 sm:w-auto">
          {listingId && !isOwner ? (
            <ListingContactCta
              listingId={listingId}
              listingTitle={chrome?.listingTitle}
              isOwner={isOwner}
              identityGated={chrome?.identityGated ?? !isHire}
              variant="compact"
              buttonLabel={ctaLabel}
              className="h-11 w-full rounded-2xl px-6 font-semibold sm:w-auto"
            />
          ) : listingId && isOwner ? (
            <Button type="button" disabled className="h-11 w-full rounded-2xl px-6 sm:w-auto">
              Sizin ilanınız
            </Button>
          ) : (
            <Button type="button" disabled className="h-11 w-full rounded-2xl px-6 font-semibold sm:w-auto">
              {ctaLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2.5 border-t border-primary/10 bg-primary/[0.04] px-5 py-3.5 text-[12px] leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <p>
          {isHire
            ? 'Telefon ve e-posta kartta görünmez. Adaylar “İletişim Talebi Gönder” ile başvurur; kabul edilince iletişim açılır.'
            : 'Soyad yıldızla gizlenir. Tam ad, doğum tarihi, adres ve iletişim bilgileri talep kabulünden sonra açılır.'}
        </p>
      </div>
    </article>
  );
}
