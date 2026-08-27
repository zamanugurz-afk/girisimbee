'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award,
  BarChart3,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  CreditCard,
  ExternalLink,
  Globe,
  GraduationCap,
  Layers,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  Store,
  Target,
  Timer,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';
import {
  monthLabel,
  toCareerPeriodInterval,
} from '@/features/candidates/lib/career-experience-dates';
import { polishCareerSummary } from '@/features/candidates/lib/career-summary';
import {
  maskDisplaySurname,
} from '@/features/candidates/lib/career-public-identity';
import {
  getExperienceLevelLabel,
  parseCareerLanguages,
  parseSelectedList,
  suggestResponsibilities,
  suggestAchievements,
  suggestProfessionalSkills,
  suggestTechnicalSkills,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { Button } from '@/components/ui/button';
import { ListingOwnerActionsBar } from '@/components/girisimco/listing/listing-owner-actions-bar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { loginUrl } from '@/features/authentication/constants/routes';
import { LEGAL_ROUTES } from '@/features/authentication/constants/legal-routes';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { ListingOwnerPackagePanel } from '@/components/girisimco/listing/listing-owner-package-panel';
import { PremiumGate } from '@/components/girisimco/premium/premium-gate';
import { CONTACT_REQUEST_CONFIG } from '@/features/contact-requests/config/contact-request.config';
import {
  isContactRequestEligibleCategory,
} from '@/features/contact-requests/config/contact-cta-copy';
import type { ContactRequestPublicView } from '@/features/contact-requests/types/contact-request.types';
import { JobApplicationModal } from '@/features/candidates/components/JobApplicationModal';
import { cn } from '@/lib/utils';

export type CareerCardInput = {
  variant?: 'seeker' | 'hire';
  companyName?: string | null;
  desiredRole?: string | null;
  preferredRoles?: string[] | string | null;
  experienceLevel?: string | null;
  primarySector?: string | null;
  workType?: string | null;
  preferredSectors?: string[] | string | null;
  professionalSkills?: string | null;
  technicalSkills?: string | null;
  tools?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  educationHistory?: Array<{ level: string; field?: string; school?: string; graduationYear?: number | null }>;
  languages?: string | null;
  certificates?: string | null;
  preferredCity?: string | null;
  preferredDistrict?: string | null;
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
  contactEmail?: string | null;
  contactPhone?: string | null;
  age?: number | null;
  gender?: string | null;
  birthDate?: string | null;
  residenceCity?: string | null;
  residenceDistrict?: string | null;
  careerProgressions?: Array<{ from: string; to: string }>;
  highlightedSkills?: string[];
  highlightedAchievements?: string[];
  cvFileName?: string | null;
  cvDocumentId?: string | null;
  coverMessage?: string | null;
  /** Form preview: explain these fields appear after an accepted request. */
  personalInfoPreview?: boolean;
  isFormPreview?: boolean;
  onEditExperience?: (index: number) => void;
  onDeleteExperience?: (index: number) => void;
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

function asList(value: string[] | string | null | undefined): string[] {
  return parseSelectedList(value);
}

function dedupeStrings(list: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of list) {
    const trimmed = (item || '').trim();
    if (!trimmed) continue;
    const key = trimmed.toLocaleLowerCase('tr-TR');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function splitLines(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(/\n|·/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function experienceResponsibilities(exp: CareerExperience): string[] {
  const selected = (exp.selectedResponsibilities ?? []).filter(Boolean);
  if (selected.length > 0) return selected;
  if (exp.responsibilities) return splitLines(exp.responsibilities);
  if (exp.achievements) return splitLines(exp.achievements);
  const selectedAch = (exp.selectedAchievements ?? []).filter(Boolean);
  if (selectedAch.length > 0) return selectedAch;
  return [];
}

function formatExperienceDurationBadge(exp: {
  startMonth?: number | null;
  startYear?: number | null;
  endMonth?: number | null;
  endYear?: number | null;
  isCurrent?: boolean;
  duration?: string | null;
}): string {
  const interval = toCareerPeriodInterval(exp);
  if (!interval) return (exp.duration ?? '').trim();
  const totalMonths = interval.end - interval.start + 1;
  if (totalMonths <= 0) return '';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years > 0 && months > 0) return `${years} yıl ${months} ay`;
  if (years > 0) return `${years} yıl`;
  return `${months} ay`;
}

function formatLocationCityDistrict(
  city?: string | null,
  district?: string | null,
  fallback?: string | null,
): string {
  let cleanCity = (city || fallback || '').trim();
  cleanCity = cleanCity.replace(/İstanbul\s+(Anadolu|Avrupa)\s+Yakası/gi, 'İstanbul');
  cleanCity = cleanCity.replace(/(Anadolu|Avrupa)\s+Yakası/gi, 'İstanbul');
  cleanCity = cleanCity.replace(/\s+/g, ' ').trim();

  let cleanDistrict = (district || '').trim();
  cleanDistrict = cleanDistrict.replace(/İstanbul\s+(Anadolu|Avrupa)\s+Yakası/gi, '');
  cleanDistrict = cleanDistrict.replace(/(Anadolu|Avrupa)\s+Yakası/gi, '');
  cleanDistrict = cleanDistrict.trim();

  if (cleanCity && cleanDistrict) {
    return `${cleanCity} - ${cleanDistrict}`;
  }
  return cleanCity || cleanDistrict || '';
}

function getLanguageStars(level?: string | null): number {
  if (!level) return 0;
  const l = level.trim().toLocaleLowerCase('tr-TR');
  if (
    l.includes('ana dil') ||
    l.includes('native') ||
    l.includes('c2') ||
    l.includes('ileri') ||
    l.includes('c1')
  ) {
    return 5;
  }
  if (l.includes('iyi') || l.includes('b2')) {
    return 4;
  }
  if (l.includes('orta') || l.includes('b1')) {
    return 3;
  }
  if (l.includes('temel') || l.includes('a2')) {
    return 2;
  }
  if (l.includes('başlangıç') || l.includes('baslangic') || l.includes('a1') || l.includes('az')) {
    return 1;
  }
  return 3;
}

function ExpandableSummary({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const checkOverflow = () => {
      // scrollHeight > clientHeight indicates the text actually exceeds line clamp
      setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div className="space-y-1.5">
      <p
        ref={textRef}
        className={cn(
          'text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-normal',
          !expanded && 'line-clamp-4',
        )}
      >
        {text}
      </p>
      {(isOverflowing || expanded) ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
        >
          {expanded ? 'Daha az göster' : 'Devamını gör'}
        </button>
      ) : null}
    </div>
  );
}

function rankSkillsByRoleAndSector(
  skills: string[],
  role?: string | null,
  sector?: string | null,
  professionalSkills: string[] = [],
  technicalSkills: string[] = [],
  preferredSectors: string[] = [],
): string[] {
  const roleLower = (role ?? '').toLocaleLowerCase('tr-TR');
  const sectorLower = (sector ?? '').toLocaleLowerCase('tr-TR');

  const scored = skills.map((skill) => {
    const sLower = skill.toLocaleLowerCase('tr-TR');
    let score = 0;

    // Professional skills and tools have high inherent value
    if (professionalSkills.includes(skill)) score += 40;
    if (technicalSkills.includes(skill)) score += 30;
    if (preferredSectors.includes(skill)) score += 10;

    // Direct match with primary sector
    if (sectorLower && (sLower.includes(sectorLower) || sectorLower.includes(sLower))) {
      score += 50;
    }

    // Direct match with position / role keywords
    const roleWords = roleLower.split(/[\s/,-]+/).filter((w) => w.length > 2);
    for (const word of roleWords) {
      if (sLower.includes(word)) {
        score += 60;
        break;
      }
    }

    return { skill, score };
  });

  // Sort descending by score; keep stable tie-break
  scored.sort((a, b) => b.score - a.score);

  return dedupeStrings(scored.map((item) => item.skill));
}

function getSkillIcon(skill: string) {
  const s = skill.toLocaleLowerCase('tr-TR');

  // Tech / Software / Coding / Database / Cloud
  if (
    /yazılım|kod|program|kodlama|api|sql|veri|data|python|java|react|front|back|fullstack|devops|cloud|aws|azure|docker|git/.test(
      s,
    )
  ) {
    return Code2;
  }
  // Data / BI / Analytics / Reports / Excel / CRM / ERP
  if (/crm|erp|sap|excel|ofis|office|dashboard|power bi|analiz|rapor|istatistik/.test(s)) {
    return BarChart3;
  }
  // Insurance / Law / Audit / Security / Policy / Risk / Compliance
  if (/sigorta|poliçe|hasar|risk|aktüerya|hukuk|kvkk|mevzuat|denetim|isg|güvenlik/.test(s)) {
    return ShieldCheck;
  }
  // Sales / Marketing / Growth / SEO / Ads
  if (/satış|pazarlama|marketing|b2b|b2c|müşteri|ikna|müzakere|seo|ads|hedef/.test(s)) {
    return Target;
  }
  // Management / Leadership / Strategy / Organization / Coordination
  if (
    /yönetim|liderlik|holding|organizasyon|planlama|strateji|koordinasyon|ekip|proje|şantiye|direktör|müdür/.test(
      s,
    )
  ) {
    return Briefcase;
  }
  // Finance / Banking / Accounting / Budget / Tax
  if (/muhasebe|finans|banka|kredi|bütçe|mali|vergi|hesap|smmm|spk|borsa/.test(s)) {
    return Layers;
  }
  // Communication / HR / Education / Consulting
  if (/iletişim|halkla|sunum|eğitim|danışmanlık|koçluk|insan kaynakları|ik|mülakat|psikoloji/.test(s)) {
    return Sparkles;
  }

  return CheckCircle2;
}

export function SkillChips({
  values,
  limit = 8,
  layout = 'row',
  variant = 'seeker',
}: {
  values: string[];
  limit?: number;
  layout?: 'row' | 'column';
  variant?: 'seeker' | 'hire';
}) {
  const [expanded, setExpanded] = useState(false);
  if (values.length === 0) return null;

  const isHire = variant === 'hire';
  const visible = expanded ? values : values.slice(0, limit);
  const hidden = values.length - visible.length;
  const isCol = layout === 'column';

  const iconBg = isHire
    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400';
  const buttonText = isHire
    ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
    : 'text-blue-600 hover:text-blue-700 dark:text-blue-400';

  if (isCol) {
    return (
      <div className="flex flex-col items-start gap-2.5 w-full">
        {visible.map((val, idx) => {
          const Icon = getSkillIcon(val);
          return (
            <div
              key={`${val}-${idx}`}
              className="flex items-center gap-2.5 py-0.5 min-w-0 max-w-full group"
            >
              <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md', iconBg)}>
                <Icon className="h-3.5 w-3.5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-foreground truncate leading-tight">
                {val}
              </span>
            </div>
          );
        })}
        {!expanded && hidden > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={cn('text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer pt-1', buttonText)}
          >
            +{hidden} diğer uzmanlık
          </button>
        ) : null}
        {expanded && values.length > limit ? (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className={cn('text-xs font-semibold transition-colors pt-1', buttonText)}
          >
            Daha az göster
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map((val, idx) => {
        const Icon = getSkillIcon(val);
        return (
          <div
            key={`${val}-${idx}`}
            className="inline-flex max-w-full items-center gap-2 py-0.5"
          >
            <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md', iconBg)}>
              <Icon className="h-3.5 w-3.5 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-foreground truncate leading-tight">
              {val}
            </span>
          </div>
        );
      })}
      {!expanded && hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn('text-xs font-semibold pl-1', buttonText)}
        >
          +{hidden} diğer
        </button>
      ) : null}
      {expanded && values.length > limit ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className={cn('text-xs font-semibold pl-1', buttonText)}
        >
          Daha az göster
        </button>
      ) : null}
    </div>
  );
}

function parseJobSections(data: CareerCardInput): Array<{ title: string; subtitle?: string; tag: string; badge: string; duties: string[] }> {
  const sections: Array<{ title: string; subtitle?: string; tag: string; badge: string; duties: string[] }> = [];

  // 1. Sorumluluklar
  let duties1: string[] = [];
  if (data.requiredResponsibilities) {
    duties1 = data.requiredResponsibilities
      .split(/\r?\n|•|\*/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (duties1.length === 0) {
    const suggested = suggestResponsibilities({
      sector: data.primarySector,
      role: data.desiredRole,
      experienceLevel: data.experienceLevel,
    });
    duties1 = suggested.length > 0 ? suggested.slice(0, 3) : [
      `${data.desiredRole || 'Pozisyon'} süreçlerinin günlük operasyonel yönetimi`,
      'Şirket ve departman hedefleri doğrultusunda iş planlarının eksiksiz uygulanması',
      'Ekip içi koordinasyon ve süreç geliştirme çalışmalarına katkı',
    ];
  }
  sections.push({
    title: `${data.desiredRole || 'Pozisyon'} Temel Görevleri`,
    subtitle: data.primarySector ? `${data.primarySector} Departmanı` : 'Operasyonel Süreçler',
    tag: 'Görevler',
    badge: 'Sorumluluk',
    duties: duties1.slice(0, 3),
  });

  // 2. Kriterler & Yetkinlikler
  const duties2: string[] = [];
  const levelText = getExperienceLevelLabel(data.experienceLevel) || data.experienceLevel;
  if (levelText) {
    duties2.push(`Aranan deneyim seviyesi: ${levelText}`);
  }
  if (data.educationLevel) {
    duties2.push(`Eğitim kriteri: ${data.educationLevel}${data.educationField ? ` (${data.educationField})` : ''}`);
  }
  if (data.requiredAchievements) {
    const achLines = data.requiredAchievements
      .split(/\r?\n|•|\*/)
      .map((s) => s.trim())
      .filter(Boolean);
    duties2.push(...achLines);
  }
  if (duties2.length < 2) {
    const suggestedAch = suggestAchievements({
      sector: data.primarySector,
      role: data.desiredRole,
      experienceLevel: data.experienceLevel,
    });
    if (suggestedAch.length > 0) {
      duties2.push(...suggestedAch.slice(0, 2));
    }
  }
  sections.push({
    title: 'Aranan Kriterler & Yetkinlikler',
    subtitle: levelText || 'Deneyim & Donanım',
    tag: 'Kriterler',
    badge: 'Yetkinlik',
    duties: duties2.slice(0, 3),
  });

  // 3. Çalışma Modeli & Sağlanan İmkanlar
  const duties3: string[] = [];
  if (data.workplacePreference) {
    duties3.push(`Çalışma ortamı: ${data.workplacePreference}`);
  }
  if (data.workType) {
    duties3.push(`Çalışma tipi: ${data.workType}`);
  }
  if (data.salaryRange) {
    duties3.push(`Ücret / Bütçe skalası: ${data.salaryRange}`);
  }
  if (data.availability) {
    duties3.push(`İşe başlama takvimi: ${data.availability}`);
  }
  if (duties3.length === 0) {
    duties3.push(
      'Kurumsal çalışma kültürü ve dinamik ekip ortamı',
      'Kariyer gelişimi ve sürekli öğrenme fırsatları',
      'Modern çalışma şartları ve esnek süreçler',
    );
  }
  sections.push({
    title: 'Çalışma Modeli & İmkanlar',
    subtitle: data.preferredCity || 'Lokasyon & Esneklik',
    tag: 'Şartlar',
    badge: 'İmkanlar',
    duties: duties3.slice(0, 3),
  });

  return sections;
}

export function CareerProfilePreview({
  data,
  chrome,
  headingAs: Heading = 'h2',
  readOnlySnapshot = false,
  isOwnApplication = false,
  canViewFullApplicantProfile = false,
  compact = false,
}: {
  data: CareerCardInput;
  chrome?: CareerCardChrome;
  headingAs?: 'h1' | 'h2' | 'h3';
  readOnlySnapshot?: boolean;
  isOwnApplication?: boolean;
  canViewFullApplicantProfile?: boolean;
  compact?: boolean;
}) {
  const isCompact = Boolean(compact || readOnlySnapshot);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isHire = data.variant === 'hire';
  const isOwner = Boolean(
    isOwnApplication ||
    (user?.id && chrome?.ownerUserId && user.id === chrome.ownerUserId),
  );
  const canViewFullProfile = Boolean(isOwnApplication || canViewFullApplicantProfile || isOwner);
  const listingId = chrome?.listingId;
  const isEligible = Boolean(listingId && isContactRequestEligibleCategory('is-bul'));

  const [mine, setMine] = useState<ContactRequestPublicView | null | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [directContactDialogOpen, setDirectContactDialogOpen] = useState(false);
  const [jobAppModalOpen, setJobAppModalOpen] = useState(false);
  const [appliedInfo, setAppliedInfo] = useState<{
    hasApplied: boolean;
    conversationId?: string | null;
    status?: string | null;
  } | null>(null);
  const [message, setMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if current user already submitted a job application to this listing
  useEffect(() => {
    if (authLoading || !user || !listingId || !isHire || isOwner || readOnlySnapshot) return;
    let mounted = true;

    fetch(`/api/listings/${listingId}/application-check`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const payload = json?.data || json;
        if (mounted && payload?.hasApplied) {
          setAppliedInfo({
            hasApplied: true,
            conversationId: payload.application?.conversationId,
            status: payload.application?.status,
          });
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [authLoading, user, listingId, isHire, isOwner, readOnlySnapshot]);

  const handleViewApplication = useCallback(async () => {
    if (appliedInfo?.conversationId) {
      router.push(`/mesajlarim?c=${appliedInfo.conversationId}`);
      return;
    }
    if (!listingId) {
      router.push('/mesajlarim');
      return;
    }
    try {
      const res = await fetch(`/api/listings/${listingId}/application-check`);
      const json = await res.json();
      const payload = json?.data || json;
      const convId = payload?.application?.conversationId;
      if (convId) {
        setAppliedInfo({
          hasApplied: true,
          conversationId: convId,
          status: payload?.application?.status,
        });
        router.push(`/mesajlarim?c=${convId}`);
        return;
      }
    } catch {}
    router.push('/mesajlarim');
  }, [appliedInfo, listingId, router]);

  const loadMine = useCallback(async () => {
    if (!user || isOwner || !listingId || !isEligible) {
      setMine(null);
      return;
    }
    try {
      const res = await fetch(`/api/listings/${listingId}/contact-requests/mine`);
      if (!res.ok) {
        setMine(null);
        return;
      }
      const json = (await res.json()) as { data?: { request?: ContactRequestPublicView | null } };
      setMine(json.data?.request ?? null);
    } catch {
      setMine(null);
    }
  }, [user, isOwner, listingId, isEligible]);

  useEffect(() => {
    if (authLoading || !listingId || !isEligible) return;
    void loadMine();
  }, [authLoading, listingId, isEligible, loadMine]);

  const isContactAccepted = mine?.effectiveStatus === 'accepted';
  const isPending = mine?.effectiveStatus === 'pending';

  const toolsAll = asList(data.tools);
  const professionalAll = asList(data.professionalSkills);
  const technicalAll = dedupeStrings([...asList(data.technicalSkills), ...toolsAll]);
  const preferredSectors = asList(data.preferredSectors);

  // Sector and position-driven ranking:
  const rawSkills = dedupeStrings([...professionalAll, ...technicalAll, ...preferredSectors]);
  const allSkills = rankSkillsByRoleAndSector(
    rawSkills,
    data.desiredRole,
    data.primarySector,
    professionalAll,
    technicalAll,
    preferredSectors,
  );

  const certificates = asList(data.certificates);
  const languages = parseCareerLanguages(data.languages).filter(
    (entry) => (entry.languageOther || entry.language) && entry.level,
  );
  const hasCertificatesOrLanguages = certificates.length > 0 || languages.length > 0;

  const hasEducation = Boolean(
    (data.educationHistory && data.educationHistory.length > 0) ||
    data.educationLevel ||
    data.educationField,
  );

  const [expandedExperiences, setExpandedExperiences] = useState(false);
  const experiences = useMemo(() => {
    return [...(data.experiences ?? [])].sort((a, b) => {
      const aInterval = toCareerPeriodInterval(a);
      const bInterval = toCareerPeriodInterval(b);
      if (aInterval && bInterval) return bInterval.end - aInterval.end;
      return 0;
    });
  }, [data.experiences]);

  const INITIAL_EXPERIENCE_LIMIT = 3;
  const visibleExperiences = expandedExperiences ? experiences : experiences.slice(0, INITIAL_EXPERIENCE_LIMIT);
  const visibleCount = visibleExperiences.length;

  const summary = polishCareerSummary(data.longDescription || data.requiredResponsibilities);
  const levelLabel = getExperienceLevelLabel(data.experienceLevel) || data.experienceLevel || '';
  const salary = isHire ? data.salaryRange : data.salaryExpectation;

  const locationText = useMemo(() => {
    return formatLocationCityDistrict(data.residenceCity, data.residenceDistrict, data.preferredCity);
  }, [data.residenceCity, data.residenceDistrict, data.preferredCity]);

  const workPreferenceFacts = useMemo(() => {
    const facts: Array<{ label: string; value: string; icon: typeof User }> = [];
    if (levelLabel) {
      facts.push({ label: 'Kariyer Seviyesi', value: levelLabel, icon: Award });
    }
    if (data.workplacePreference) {
      facts.push({ label: 'Çalışma Modeli', value: data.workplacePreference, icon: Store });
    }
    if (data.workType) {
      facts.push({ label: 'Çalışma Tercihi', value: data.workType, icon: Timer });
    }
    if (data.availability) {
      facts.push({ label: 'İşe Başlama', value: data.availability, icon: Calendar });
    }
    if (salary) {
      facts.push({ label: 'Ücret Beklentisi', value: salary, icon: CreditCard });
    }
    if (data.preferredCity && data.preferredCity !== data.residenceCity) {
      const cleanPreferred = formatLocationCityDistrict(data.preferredCity, null, null);
      if (cleanPreferred) {
        facts.push({ label: 'Tercih Edilen Lokasyon', value: cleanPreferred, icon: MapPin });
      }
    }
    return facts;
  }, [
    levelLabel,
    data.workplacePreference,
    data.workType,
    data.availability,
    salary,
    data.preferredCity,
    data.residenceCity,
  ]);

  const contactEmail = data.contactEmail || (isContactAccepted ? mine?.ownerContactEmail : null);
  const contactPhone = data.contactPhone || (isContactAccepted ? mine?.ownerContactPhone : null);
  const hasContactChannels = Boolean(contactEmail || contactPhone);

  const publicName = useMemo(() => {
    if (isHire) {
      return data.companyName?.trim() || 'Kurumsal Şirket';
    }
    if (canViewFullProfile) {
      return (
        (data.displayName ?? '').trim() ||
        (user?.displayName ?? '').trim() ||
        'Kariyer Profiliniz'
      );
    }
    return (
      (data.displayName ?? '').trim() ||
      (isContactAccepted && mine?.ownerFullName ? mine.ownerFullName : null) ||
      data.displayNameMasked ||
      (!listingId ? maskDisplaySurname(data.displayName || user?.displayName) : null)
    );
  }, [isHire, canViewFullProfile, data.companyName, data.displayName, data.displayNameMasked, isContactAccepted, mine?.ownerFullName, listingId, user?.displayName]);

  const theme = useMemo(() => {
    if (isHire) {
      return {
        cardBorder: 'border-emerald-300/80 dark:border-emerald-800/80',
        cardGlow: 'shadow-[0_4px_24px_-4px_rgba(16,185,129,0.12)]',
        headerText: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
        badgeBg: 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400',
        numNode: 'bg-emerald-600 text-xs font-bold text-white shadow-sm',
        ctaBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      };
    }
    return {
      cardBorder: 'border-sky-300/80 dark:border-sky-800/80',
      cardGlow: 'shadow-[0_4px_24px_-4px_rgba(14,165,233,0.12)]',
      headerText: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      badgeBg: 'border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400',
      numNode: 'bg-blue-600 text-xs font-bold text-white shadow-sm',
      ctaBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
    };
  }, [isHire]);

  const hireSuggestedSkills = useMemo(() => {
    if (!isHire) return [];
    const input = {
      sector: data.primarySector,
      role: data.desiredRole,
      experienceLevel: data.experienceLevel,
    };
    const prof = suggestProfessionalSkills(input);
    const tech = suggestTechnicalSkills(input);
    return dedupeStrings([...prof, ...tech]);
  }, [isHire, data.primarySector, data.desiredRole, data.experienceLevel]);

  const displaySkills = useMemo(() => {
    if (allSkills.length > 0) return allSkills;
    if (isHire && hireSuggestedSkills.length > 0) return hireSuggestedSkills;
    return allSkills;
  }, [allSkills, isHire, hireSuggestedSkills]);

  const jobSections = useMemo(() => {
    if (!isHire) return [];
    return parseJobSections(data);
  }, [isHire, data]);

  const showContactBanner = Boolean(listingId && !isOwner && !readOnlySnapshot);

  function requireLogin() {
    router.push(loginUrl(pathname || `/ilan/${listingId}`));
  }

  function handleOpenJobApplicationModal() {
    if (!user) {
      requireLogin();
      return;
    }
    if (appliedInfo?.hasApplied) {
      if (appliedInfo.conversationId) {
        router.push(`/mesajlarim?c=${appliedInfo.conversationId}`);
      } else {
        router.push('/mesajlarim');
      }
      return;
    }
    setJobAppModalOpen(true);
  }

  function handleOpenContactModal() {
    if (!user) {
      requireLogin();
      return;
    }
    setModalOpen(true);
  }

  async function handleContactSubmit() {
    const trimmed = message.trim();
    if (trimmed.length < CONTACT_REQUEST_CONFIG.messageMinLength) {
      toast.error(`Mesaj en az ${CONTACT_REQUEST_CONFIG.messageMinLength} karakter olmalıdır.`);
      return;
    }
    if (!acceptTerms) {
      toast.error('Lütfen yasal aydınlatma ve kuralları onaylayın.');
      return;
    }
    if (!listingId) {
      toast.error('İlan bilgisi bulunamadı.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/contact-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, termsAccepted: true }),
      });
      const json = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok || json.error) {
        throw new Error(json.error || 'İletişim talebi iletilemedi');
      }
      toast.success('İletişim talebiniz başarıyla gönderildi.');
      setModalOpen(false);
      setMessage('');
      setAcceptTerms(false);
      void loadMine();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Talep gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDirectContact() {
    setDirectContactDialogOpen(true);
  }

  return (
    <div className="w-full space-y-5">
      {listingId && isOwner ? (
        <ListingOwnerActionsBar
          listingId={listingId}
          title={publicName || (isHire ? 'Açık Pozisyon' : 'Kariyer İlanı')}
          views={chrome?.views}
        />
      ) : null}

      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]",
        isCompact ? "gap-3.5 sm:gap-4" : "gap-5"
      )}>
        <aside className={cn(
          "space-y-3 sm:space-y-3.5",
          !isCompact && "sm:space-y-4"
        )}>
          <div className={cn("rounded-2xl border bg-white dark:bg-card", isCompact ? "p-3.5 sm:p-4" : "p-4 sm:p-5", theme.cardBorder, theme.cardGlow)}>
            <Heading className={cn("truncate font-bold text-slate-900 dark:text-foreground", isCompact ? "text-sm sm:text-base" : "text-base sm:text-lg")}>
              {publicName || (isHire ? 'Açık Pozisyon' : 'Anonim Profesyonel')}
            </Heading>
            <hr className="border-slate-100 dark:border-border/80 my-2" />
            <div className="space-y-0.5">
              {(data.primarySector || data.desiredRole) ? (
                <p className="truncate text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                  {[data.primarySector, data.desiredRole].filter(Boolean).join(' - ')}
                </p>
              ) : null}
              {locationText ? (
                <p className="truncate text-[11px] sm:text-xs text-slate-500 dark:text-muted-foreground">
                  {locationText}
                </p>
              ) : null}
            </div>
          </div>

          {hasEducation ? (
            <div className={cn("rounded-2xl border bg-white dark:bg-card space-y-2.5", isCompact ? "p-3 sm:p-3.5" : "p-4 sm:p-5", theme.cardBorder, theme.cardGlow)}>
              <div className={cn("flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider", theme.headerText)}>
                <GraduationCap className="h-4 w-4" />
                <span>{isHire ? 'ARANAN EĞİTİM' : 'EĞİTİM'}</span>
              </div>
              {data.educationHistory && data.educationHistory.length > 0 ? (
                <div className="space-y-2.5">
                  {data.educationHistory.map((edu, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                        {edu.level || 'Eğitim'}
                      </p>
                      {edu.field ? (
                        <p className="text-xs text-slate-600 dark:text-slate-300">{edu.field}</p>
                      ) : null}
                      {edu.school || edu.graduationYear ? (
                        <p className="text-[11px] text-slate-400 dark:text-muted-foreground">
                          {[edu.school, edu.graduationYear].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-foreground">
                    {data.educationLevel || 'Eğitim'}
                  </p>
                  {data.educationField ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300">{data.educationField}</p>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

          {hasCertificatesOrLanguages ? (
            <div className={cn("rounded-2xl border bg-white dark:bg-card space-y-2.5", isCompact ? "p-3 sm:p-3.5" : "p-4 sm:p-5", theme.cardBorder, theme.cardGlow)}>
              <div className={cn("flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider", theme.headerText)}>
                <Award className="h-4 w-4" />
                <span>{isHire ? 'ARANAN DİL & SERTİFİKA' : 'SERTİFİKA / DİL'}</span>
              </div>
              <div className="space-y-2">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full", theme.iconBg)}>
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-snug">
                      {cert}
                    </p>
                  </div>
                ))}
                {languages.map((lang, idx) => {
                  const name = lang.languageOther?.trim() || lang.language;
                  const starCount = getLanguageStars(lang.level);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Globe className={cn("h-3.5 w-3.5 shrink-0", theme.headerText)} />
                        <span className="text-xs font-semibold text-slate-800 dark:text-foreground">
                          {name}
                        </span>
                      </div>
                      {starCount > 0 ? (
                        <div className="flex items-center gap-0.5 ml-1" title={lang.level || ''}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                'h-3 w-3',
                                star <= starCount
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-100 text-slate-200 dark:fill-slate-800 dark:text-slate-700',
                              )}
                            />
                          ))}
                        </div>
                      ) : lang.level ? (
                        <span className={cn("ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", theme.badgeBg)}>
                          {lang.level}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {workPreferenceFacts.length > 0 ? (
            <div className={cn("rounded-2xl border bg-white dark:bg-card space-y-2.5", isCompact ? "p-3 sm:p-3.5" : "p-4 sm:p-5", theme.cardBorder, theme.cardGlow)}>
              <div className={cn("flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider", theme.headerText)}>
                <Briefcase className="h-4 w-4" />
                <span>{isHire ? 'ÇALIŞMA ŞARTLARI' : 'ÇALIŞMA TERCİHLERİ'}</span>
              </div>
              <div className="space-y-2">
                {workPreferenceFacts.map((fact, idx) => {
                  const IconComponent = fact.icon;
                  return (
                    <div key={idx} className="flex items-start gap-2.5">
                      <IconComponent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-muted-foreground">
                          {fact.label}
                        </p>
                        <p className="truncate text-xs sm:text-[13px] font-semibold text-slate-800 dark:text-foreground mt-0.5">
                          {fact.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {canViewFullProfile ? (
            (contactPhone || contactEmail || user?.email || data.contactPhone || data.contactEmail) ? (
              <div className={cn("rounded-2xl border bg-white p-3.5 sm:p-4 dark:bg-card space-y-2.5", theme.cardBorder, theme.cardGlow)}>
                <div className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider", theme.headerText)}>
                  <Phone className="h-4 w-4" />
                  <span>{isOwnApplication ? 'İLETİŞİM BİLGİLERİNİZ' : 'ADAY İLETİŞİM BİLGİLERİ'}</span>
                </div>
                <div className="space-y-2">
                  {(contactPhone || data.contactPhone) ? (
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-foreground font-semibold min-w-0">
                        <Phone className={cn("h-3.5 w-3.5 shrink-0", theme.headerText)} />
                        <span className="truncate">{contactPhone || data.contactPhone}</span>
                      </div>
                      {!isOwnApplication ? (
                        <a
                          href={`tel:${contactPhone || data.contactPhone}`}
                          className={cn("shrink-0 text-[11px] font-semibold underline", theme.headerText)}
                        >
                          Ara
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  {(contactEmail || data.contactEmail || (isOwnApplication ? user?.email : null)) ? (
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate font-medium">{contactEmail || data.contactEmail || (isOwnApplication ? user?.email : null)}</span>
                      </div>
                    </div>
                  ) : null}

                  {isOwnApplication && (
                    <div className="pt-2 border-t border-slate-100 dark:border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/kariyer-profilim')}
                        className="w-full text-xs font-semibold h-8 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 rounded-xl"
                      >
                        Güncel Profilimi Gör / Düzenle
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : null
          ) : isHire ? (
            <div className={cn("rounded-2xl border bg-white p-4 sm:p-5 dark:bg-card flex items-start gap-2.5 animate-pulse", theme.cardBorder, theme.cardGlow)}>
              <ShieldCheck className={cn("mt-0.5 h-4 w-4 shrink-0", theme.headerText)} />
              <p className="text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                Başvurunuz şirket yetkilileri tarafından incelendikten sonra doğrudan sizinle iletişime geçilecektir.
              </p>
            </div>
          ) : isContactAccepted ? (
            <>
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-800/80 dark:bg-emerald-950/30">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    İletişim talebiniz kabul edildi.
                  </p>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                    Adayla doğrudan iletişime geçebilirsiniz.
                  </p>
                </div>
              </div>

              <div className={cn("rounded-2xl border bg-white p-3.5 sm:p-4 dark:bg-card space-y-2.5", theme.cardBorder, theme.cardGlow)}>
                <div className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider", theme.headerText)}>
                  <Phone className="h-4 w-4" />
                  <span>İLETİŞİM BİLGİLERİ</span>
                </div>
                <div className="space-y-2">
                  {(contactPhone || mine?.ownerContactPhone) ? (
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-foreground font-semibold min-w-0">
                        <Phone className={cn("h-3.5 w-3.5 shrink-0", theme.headerText)} />
                        <span className="truncate">{contactPhone || mine?.ownerContactPhone}</span>
                      </div>
                      <a
                        href={`tel:${contactPhone || mine?.ownerContactPhone}`}
                        className={cn("shrink-0 text-[11px] font-semibold underline", theme.headerText)}
                      >
                        Ara
                      </a>
                    </div>
                  ) : null}
                  {(contactEmail || mine?.ownerContactEmail) ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate font-medium">{contactEmail || mine?.ownerContactEmail}</span>
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    onClick={handleDirectContact}
                    className={cn("w-full mt-1.5 rounded-xl text-white text-xs font-semibold py-2 h-8 shadow-sm flex items-center justify-center gap-1.5", theme.ctaBtn)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Site İçi Mesaj Gönder</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className={cn("rounded-2xl border bg-white p-4 sm:p-5 dark:bg-card flex items-start gap-2.5 animate-pulse", theme.cardBorder, theme.cardGlow)}>
              <Lock className={cn("mt-0.5 h-4 w-4 shrink-0", theme.headerText)} />
              <p className="text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                Kişisel bilgiler ve iletişim bilgileri iletişim talebiniz kabul edildiğinde paylaşılacaktır.
              </p>
            </div>
          )}
        </aside>

        <main className={cn(
          "rounded-2xl border bg-white dark:bg-card flex flex-col justify-between",
          isCompact ? "p-3.5 sm:p-4 lg:p-4.5 pb-3 gap-3.5 sm:gap-4" : "p-5 sm:p-6 lg:p-6 pb-4 gap-5 sm:gap-6",
          theme.cardBorder,
          theme.cardGlow
        )}>
          <div className={cn("space-y-3.5 sm:space-y-4", !isCompact && "sm:space-y-5")}>
            {summary ? (
              <div className="space-y-1">
                <div className={cn("flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider", theme.headerText)}>
                  <User className="h-4 w-4" />
                  <span>{isHire ? 'POZİSYON ÖZETİ' : 'KARİYER ÖZETİ'}</span>
                </div>
                <div className={cn(
                  "rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50",
                  isCompact ? "p-3 sm:p-3.5 text-xs sm:text-[13px]" : "p-4 sm:p-4.5"
                )}>
                  <ExpandableSummary text={summary} />
                </div>
              </div>
            ) : null}

            {isHire ? (
              <div className={cn("grid grid-cols-1 lg:grid-cols-12 items-start", isCompact ? "gap-4 lg:gap-5" : "gap-5 lg:gap-7")}>
                <div className={cn('space-y-2.5', displaySkills.length > 0 ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12')}>
                  <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider", theme.headerText)}>
                      <Briefcase className="h-4 w-4" />
                      <span>ARANAN NİTELİKLER & GÖREVLER</span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-muted dark:text-muted-foreground">
                      {jobSections.length} Bölüm
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {jobSections.map((section, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 relative flex items-start",
                          isCompact ? "p-2.5 sm:p-3.5 gap-3" : "p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5"
                        )}
                      >
                        <div className="flex flex-col items-center">
                          <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", theme.numNode)}>
                            {idx + 1}
                          </div>
                        </div>

                        <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                          <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                            {section.tag}
                          </p>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                              {section.title}
                            </h4>
                            {section.subtitle ? (
                              <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                                {section.subtitle}
                              </p>
                            ) : null}
                          </div>

                          {section.duties && section.duties.length > 0 ? (
                            <ul className="mt-1.5 space-y-0.5 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              {section.duties.map((duty, dIdx) => (
                                <li key={dIdx} className="flex items-start gap-1.5">
                                  <span className="text-slate-400 font-bold">•</span>
                                  <span>{duty}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {displaySkills.length > 0 ? (
                  <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-slate-200/90 dark:lg:border-border/80 lg:pl-5 space-y-2.5 pt-3.5 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-border/60">
                    <div className={cn("flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider", theme.headerText)}>
                      <Sliders className="h-4 w-4" />
                      <span>ARANAN UZMANLIK ALANLARI</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <SkillChips values={displaySkills} limit={12} layout="column" variant="hire" />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className={cn("grid grid-cols-1 lg:grid-cols-12 items-start", isCompact ? "gap-4 lg:gap-5" : "gap-5 lg:gap-7")}>
                <div className={cn('space-y-2.5', allSkills.length > 0 ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12')}>
                  <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider", theme.headerText)}>
                      <Briefcase className="h-4 w-4" />
                      <span>İŞ DENEYİMLERİ</span>
                    </div>
                    {experiences.length > 0 ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-muted dark:text-muted-foreground">
                        {Math.min(visibleExperiences.length, experiences.length)} / {experiences.length}
                      </span>
                    ) : null}
                  </div>

                  {experiences.length > 0 ? (
                    <div className="space-y-2.5">
                      {visibleExperiences.map((exp, idx) => {
                        const durationBadge = formatExperienceDurationBadge(exp);
                        const startText =
                          exp.startMonth && exp.startYear
                            ? `${monthLabel(exp.startMonth)} ${exp.startYear}`
                            : '';
                        const endText = exp.isCurrent
                          ? 'Halen'
                          : exp.endMonth && exp.endYear
                            ? `${monthLabel(exp.endMonth)} ${exp.endYear}`
                            : '';
                        const duties = experienceResponsibilities(exp);

                        return (
                          <div
                            key={exp.id || idx}
                            className={cn(
                              "rounded-xl border border-slate-200/90 bg-slate-50/50 shadow-2xs dark:border-border dark:bg-card/50 relative flex items-start",
                              isCompact ? "p-2.5 sm:p-3.5 gap-3" : "p-3.5 sm:p-4.5 gap-3.5 sm:gap-4.5"
                            )}
                          >
                            <div className="flex flex-col items-center">
                              <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full", theme.numNode)}>
                                {idx + 1}
                              </div>
                            </div>

                            <div className="w-20 sm:w-24 shrink-0 pt-0.5">
                              <p className="text-xs font-semibold text-slate-800 dark:text-foreground leading-tight">
                                {startText || 'Başlangıç'}
                              </p>
                              {endText ? (
                                <p className="text-[11px] font-medium text-slate-500 dark:text-muted-foreground leading-tight mt-0.5">
                                  - {endText}
                                </p>
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-foreground leading-snug">
                                    {exp.role || (isContactAccepted || canViewFullProfile || data.personalInfoPreview ? exp.company : '') || 'Pozisyon'}
                                  </h4>
                                  <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-muted-foreground mt-0.5">
                                    {[
                                      (isContactAccepted || canViewFullProfile || data.personalInfoPreview) && exp.company && exp.company !== exp.role ? exp.company : null,
                                      exp.sector,
                                    ]
                                      .filter(Boolean)
                                      .join('  |  ')}
                                  </p>
                                </div>
                                {data.isFormPreview ? (
                                  <div className="flex items-center gap-1">
                                    {data.onEditExperience ? (
                                      <button
                                        type="button"
                                        onClick={() => data.onEditExperience?.(idx)}
                                        className="p-1 text-slate-400 hover:text-blue-600"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                    ) : null}
                                    {data.onDeleteExperience ? (
                                      <button
                                        type="button"
                                        onClick={() => data.onDeleteExperience?.(idx)}
                                        className="p-1 text-slate-400 hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>

                              {duties.length > 0 ? (
                                <ul className="mt-2 space-y-1 text-xs sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {duties.map((duty, dIdx) => (
                                    <li key={dIdx} className="flex items-start gap-1.5">
                                      <span className="text-slate-400 font-bold">•</span>
                                      <span>{duty}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Henüz iş deneyimi eklenmedi.</p>
                  )}

                  {experiences.length > INITIAL_EXPERIENCE_LIMIT ? (
                    <div className="pt-0.5 pl-1 sm:pl-2">
                      <button
                        type="button"
                        onClick={() => setExpandedExperiences((v) => !v)}
                        className="text-xs font-semibold text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/90 inline-flex items-center gap-1.5 transition-colors cursor-pointer bg-primary/5 hover:bg-primary/10 rounded-lg px-2.5 py-1 border border-primary/20"
                      >
                        <span>
                          {expandedExperiences
                            ? 'Daha az göster'
                            : `+ ${experiences.length - INITIAL_EXPERIENCE_LIMIT} diğer deneyimi göster`}
                        </span>
                        <span className="font-bold text-sm leading-none">
                          {expandedExperiences ? '−' : '+'}
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>

                {allSkills.length > 0 ? (
                  <div className="lg:col-span-5 xl:col-span-4 lg:border-l lg:border-slate-200/90 dark:lg:border-border/80 lg:pl-6 space-y-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-border/60">
                    <div className={cn("flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider", theme.headerText)}>
                      <Sliders className="h-4 w-4" />
                      <span>UZMANLIK ALANLARI</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <SkillChips values={allSkills} limit={12} layout="column" variant="seeker" />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {(showContactBanner || (!authLoading && isOwner && listingId)) ? (
            <div className="mt-auto pt-2 space-y-3.5">
              {showContactBanner ? (
                isHire ? (
                  appliedInfo?.hasApplied ? (
                    <div
                      className="rounded-xl p-4 sm:p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3.5 transition-colors border border-emerald-100 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/40"
                    >
                      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                            Bu ilana daha önce başvurdunuz
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Başvurunuz ve mesajlarınız Mesajlarım sayfasında kayıtlıdır.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto flex justify-end">
                        <Button
                          type="button"
                          onClick={handleViewApplication}
                          className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 shadow-sm shrink-0 flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Başvuruyu Gör</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-xl p-4 sm:p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3.5 transition-colors border border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-teal-950/30"
                    >
                      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm dark:bg-card dark:text-emerald-400">
                          <Send className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                            POZİSYONA BAŞVUR
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            Kariyer profilinizle bu pozisyona doğrudan başvurun ve işverenle mesajlaşın.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto flex justify-end">
                        <Button
                          type="button"
                          onClick={handleOpenJobApplicationModal}
                          className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 shadow-sm shrink-0 flex items-center justify-center gap-2"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Pozisyona Başvur</span>
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div
                    className={cn(
                      'rounded-xl p-4 sm:p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3.5 transition-colors',
                      isContactAccepted
                        ? 'border border-emerald-100 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/40'
                        : 'border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:border-blue-900/40 dark:from-blue-950/40 dark:to-indigo-950/30',
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      {isContactAccepted ? (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-card dark:text-blue-400">
                          <Send className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'text-xs font-bold uppercase tracking-wider',
                            isContactAccepted
                              ? 'text-emerald-900 dark:text-emerald-200'
                              : 'text-blue-900 dark:text-blue-200',
                          )}
                        >
                          {isContactAccepted ? 'İletişim talebiniz kabul edildi.' : 'İLETİŞİM TALEBİ GÖNDER'}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {isContactAccepted
                            ? 'Artık bu adayla iletişime geçebilirsiniz.'
                            : 'Bu adayla iletişime geçmek için talebinizi iletin. Uygun gördüğünüz adaylarla görüşebilirsiniz.'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto flex justify-end">
                      {isContactAccepted ? (
                        <Button
                          type="button"
                          onClick={handleDirectContact}
                          className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 shadow-sm shrink-0 flex items-center justify-center gap-2"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>Adayla İletişime Geç</span>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleOpenContactModal}
                          disabled={isPending}
                          className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 shadow-sm shrink-0 flex items-center justify-center gap-2"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>{isPending ? 'Talep Bekliyor' : 'İletişim Talebi Gönder'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              ) : null}

              {!authLoading && isOwner && listingId ? (
                <div id="owner-package-panel">
                  <PremiumGate>
                    <ListingOwnerPackagePanel listingId={listingId} />
                  </PremiumGate>
                </div>
              ) : null}
            </div>
          ) : null}
        </main>
      </div>

      {/* Contact Request Modal Dialog */}
      {showContactBanner ? (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Send className="h-4 w-4 text-primary" />
                İletişim Talebi Gönder
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Aday talebinizi onayladığında telefon ve iletişim kanalları açılacaktır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact-message" className="text-xs font-semibold text-foreground">
                  Mesajınız
                </Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Pozisyon ve şirketiniz hakkında kısa bilgi verin..."
                  rows={4}
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="terms-accept"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(Boolean(checked))}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms-accept"
                  className="text-xs text-muted-foreground leading-snug cursor-pointer select-none"
                >
                  <Link
                    href={LEGAL_ROUTES.contactCommunication}
                    target="_blank"
                    className="font-medium text-primary underline hover:text-primary/80"
                  >
                    İletişim ve Mesajlaşma Kullanım Koşullarını
                  </Link>{' '}
                  okudum ve kabul ediyorum.
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleContactSubmit}
                disabled={submitting}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5"
              >
                {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Doğrudan İletişim Kanalları Modalı */}
      <Dialog open={directContactDialogOpen} onOpenChange={setDirectContactDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>İletişim Kanalları</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-muted-foreground">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{publicName || 'İlan'}</span> için doğrudan iletişim seçenekleri:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            {(contactPhone || mine?.ownerContactPhone) && (
              <a
                href={`tel:${contactPhone || mine?.ownerContactPhone}`}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs sm:text-sm transition-all group dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>Telefonla Ara: {contactPhone || mine?.ownerContactPhone}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </a>
            )}

            {(contactPhone || mine?.ownerContactPhone) && (
              <a
                href={`https://wa.me/${(contactPhone || mine?.ownerContactPhone || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm transition-all group dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp&apos;tan Yaz ({contactPhone || mine?.ownerContactPhone})</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </a>
            )}

            {(contactEmail || mine?.ownerContactEmail) && (
              <a
                href={`mailto:${contactEmail || mine?.ownerContactEmail}`}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-medium text-xs sm:text-sm transition-all group dark:bg-muted dark:border-border dark:text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span>E-posta Gönder: {contactEmail || mine?.ownerContactEmail}</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </a>
            )}

            {mine?.conversationId && (
              <button
                type="button"
                onClick={() => {
                  setDirectContactDialogOpen(false);
                  router.push(`${DASHBOARD_ROUTES.mesajlarim}?c=${mine.conversationId}`);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 font-bold text-xs sm:text-sm transition-all group dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-200"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 text-sky-600" />
                  <span>Site İçi Mesajlaşmaya Git</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isHire && listingId ? (
        <JobApplicationModal
          open={jobAppModalOpen}
          onOpenChange={setJobAppModalOpen}
          listingId={listingId}
          listingTitle={data.desiredRole || 'İş İlanı'}
          companyName={data.companyName}
          onSuccess={(res) => {
            setAppliedInfo({
              hasApplied: true,
              conversationId: res.conversationId,
            });
          }}
        />
      ) : null}
    </div>
  );
}
