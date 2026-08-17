'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CareerProfilePreview } from '@/features/candidates/components/CareerProfilePreview';
import {
  EXPERIENCE_LEVEL_VALUES,
  getExperienceLevelLabel,
} from '@/features/candidates/taxonomy/career-taxonomy';
import {
  CAREER_AVAILABILITY_OPTIONS,
  CAREER_EDUCATION_LEVELS,
  CAREER_WORK_TYPE_OPTIONS,
  CAREER_WORKPLACE_OPTIONS,
  JOB_SECTOR_OPTIONS,
} from '@/features/listings/config/listing-field-options';
import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import { CAREER_PROFILE_FIELD_LABELS } from '@/features/career-profile/completion';
import {
  CAREER_PROFILE_PRIVACY_DETAIL,
  CAREER_PROFILE_PRIVACY_NOTE,
} from '@/features/career-profile/copy';
import { presentCareerJourney } from '@/features/career-profile/journey';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import type { CareerProfileFormValues, CareerProfileRecord } from '@/features/career-profile/types';

const fieldClass =
  'h-10 w-full min-w-0 rounded-2xl border border-border/80 bg-background px-3 text-sm text-foreground';
const areaClass =
  'min-h-[88px] w-full min-w-0 rounded-2xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground';

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="min-w-0 space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function CareerProfileForm({
  record,
  displayName,
}: {
  record: CareerProfileRecord;
  displayName?: string | null;
}) {
  const labels = CAREER_PROFILE_FIELD_LABELS[record.kind];
  const [values, setValues] = useState<CareerProfileFormValues>(record.values);
  const [completion, setCompletion] = useState(record.completion);
  const [saving, setSaving] = useState(false);
  const journey = presentCareerJourney(record.kind, completion);

  const preview = useMemo(
    () =>
      toSafeCareerPreviewInput({
        kind: record.kind,
        displayName,
        source: {
          city: values.city,
          customFields: {
            desiredRole: values.role,
            primarySector: values.sector,
            experienceLevel: values.experienceLevel,
            professionalSkills: values.professionalSkills,
            technicalSkills: values.technicalSkills,
            workType: values.workType,
            workplacePreference: values.workplacePreference,
            preferredCity: values.city,
            educationLevel: values.educationLevel,
            languages: values.languages,
            availability: values.availability,
            requiredResponsibilities: values.candidateTraits,
          },
        },
      }),
    [displayName, record.kind, values],
  );

  function patch<K extends keyof CareerProfileFormValues>(key: K, value: CareerProfileFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/career/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: record.listingId, values }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        data?: { profile?: CareerProfileRecord };
      };
      if (!res.ok || !json.data?.profile) {
        throw new Error(json.error ?? 'Profil kaydedilemedi.');
      }
      setValues(json.data.profile.values);
      setCompletion(json.data.profile.completion);
      toast.success('Kariyer profiliniz kaydedildi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Profil kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">Profilinizin tamamlanma durumu</h2>
        <p className="mt-2 text-sm font-medium text-foreground">{journey.completedLabel}</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, completion.percent))}%` }}
          />
        </div>
        {completion.complete ? (
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{journey.completeTitle}</p>
            <p>{journey.description}</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>{journey.description}</p>
            {journey.missingLabels.length > 0 ? (
              <div>
                <p className="font-medium text-foreground">{journey.strengthenTitle}</p>
                <ul className="mt-1 space-y-0.5">
                  {journey.missingLabels.map((label) => (
                    <li key={label}>• {label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground">{CAREER_PROFILE_PRIVACY_NOTE}</p>
        <p className="mt-1 text-xs text-muted-foreground">{CAREER_PROFILE_PRIVACY_DETAIL}</p>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">Temel Bilgiler</h2>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={labels.role}>
            <input className={fieldClass} value={values.role} onChange={(event) => patch('role', event.target.value)} />
          </Field>
          <Field label={labels.sector}>
            <select className={fieldClass} value={values.sector} onChange={(event) => patch('sector', event.target.value)}>
              <option value="">Seçin</option>
              {JOB_SECTOR_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label={labels.experience}>
            <select
              className={fieldClass}
              value={values.experienceLevel}
              onChange={(event) => patch('experienceLevel', event.target.value)}
            >
              <option value="">Seçin</option>
              {EXPERIENCE_LEVEL_VALUES.map((option) => (
                <option key={option} value={option}>{getExperienceLevelLabel(option)}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">Yetkinlikler</h2>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4">
          <Field label={labels.professionalSkills}>
            <input
              className={fieldClass}
              value={values.professionalSkills}
              placeholder="İletişim · Analitik düşünme"
              onChange={(event) => patch('professionalSkills', event.target.value)}
            />
          </Field>
          <Field label={labels.technicalSkills}>
            <input
              className={fieldClass}
              value={values.technicalSkills}
              placeholder="JavaScript · React"
              onChange={(event) => patch('technicalSkills', event.target.value)}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">Çalışma Tercihlerim</h2>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={labels.workType}>
            <select className={fieldClass} value={values.workType} onChange={(event) => patch('workType', event.target.value)}>
              <option value="">Seçin</option>
              {CAREER_WORK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label={labels.workplacePreference}>
            <select
              className={fieldClass}
              value={values.workplacePreference}
              onChange={(event) => patch('workplacePreference', event.target.value)}
            >
              <option value="">Seçin</option>
              {CAREER_WORKPLACE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label={labels.location}>
            <select className={fieldClass} value={values.city} onChange={(event) => patch('city', event.target.value)}>
              <option value="">Seçin</option>
              {TURKISH_CITIES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">Eğitim & Diller</h2>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={labels.education}>
            <select
              className={fieldClass}
              value={values.educationLevel}
              onChange={(event) => patch('educationLevel', event.target.value)}
            >
              <option value="">Seçin</option>
              {CAREER_EDUCATION_LEVELS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <Field label={labels.languages}>
            <input
              className={fieldClass}
              value={values.languages}
              placeholder="İngilizce — İyi, Türkçe — Ana Dil"
              onChange={(event) => patch('languages', event.target.value)}
            />
          </Field>
          {record.kind === 'seek' ? (
            <Field label={labels.availability}>
              <select
                className={fieldClass}
                value={values.availability}
                onChange={(event) => patch('availability', event.target.value)}
              >
                <option value="">Seçin</option>
                {CAREER_AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>
          ) : (
            <div className="md:col-span-2">
              <Field label={labels.candidateTraits}>
                <textarea
                  className={areaClass}
                  value={values.candidateTraits}
                  onChange={(event) => patch('candidateTraits', event.target.value)}
                />
              </Field>
            </div>
          )}
        </div>
      </section>

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <Button type="button" className="h-10 w-full rounded-2xl sm:w-auto" disabled={saving} onClick={() => void handleSave()}>
          Değişiklikleri Kaydet
        </Button>
        <Button asChild variant="outline" className="h-10 w-full rounded-2xl sm:w-auto">
          <Link href={record.editHref}>İlan formunda düzenle</Link>
        </Button>
      </div>

      <section className="min-w-0 rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">{journey.readyTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{journey.readyHint}</p>
        <Button asChild className="mt-4 h-10 w-full rounded-2xl sm:w-auto">
          <Link href={DASHBOARD_ROUTES.eslesmeler}>{journey.completeCta.label}</Link>
        </Button>
      </section>

      <section className="min-w-0 rounded-2xl border border-border/80 bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-foreground">Profil Önizleme</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Karşı tarafın iletişim talebinden önce görebileceği güvenli özet.
        </p>
        <div className="mt-4 min-w-0">
          <CareerProfilePreview data={preview} />
        </div>
      </section>
    </div>
  );
}
