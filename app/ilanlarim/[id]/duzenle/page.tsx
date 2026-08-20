'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CategoryListingForm,
  useListingFormConfig,
  useListingEngine,
} from '@/features/listings';
import { aggregateToFormValues } from '@/features/listings/utils/aggregate-form.mapper';
import { ListingStatusBanner } from '@/features/listings/components/listing-status-banner';
import type { ListingId, CompanyId, CategoryId, ListingTypeId } from '@/lib/domain/ids';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import type { ListingStatus } from '@/features/listings/types/listing.entity.types';
import {
  ListingPublisherSelect,
  type ListingPublisherMode,
} from '@/features/listings/components/listing-publisher-select';
import { coerceCompanyId } from '@/lib/persistence/supabase-payload';
import { supportsCompanyPublisher } from '@/features/listings/config/listing-category-module.config';
import { getPartnerFormSchema } from '@/features/founders/partnership-form';
import { resolvePartnershipIntent } from '@/features/founders/partnership-intent';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';

const EDITABLE_STATUSES: ListingStatus[] = [
  'draft',
  'pending_review',
  'published',
  'paused',
  'expired',
  'archived',
  'rejected',
  'sold',
];

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const listingId = params.id as ListingId;
  const { getListing, updateListing, publishListing, isAuthenticated, actorId } = useListingEngine();

  const [initialValues, setInitialValues] = useState<ListingFormValues | null>(null);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [listingTypeId, setListingTypeId] = useState<ListingTypeId | null>(null);
  const [listingStatus, setListingStatus] = useState<ListingStatus | null>(null);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [publisherMode, setPublisherMode] = useState<ListingPublisherMode>('personal');
  const [publisherCompanyId, setPublisherCompanyId] = useState<CompanyId | null>(null);

  const { listingType, isReady } = useListingFormConfig(categoryId, listingTypeId);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const aggregate = await getListing(listingId);
        if (cancelled) return;

        if (!aggregate) {
          setLoadError('İlan bulunamadı.');
          return;
        }

        if (!EDITABLE_STATUSES.includes(aggregate.listing.status)) {
          setLoadError('Bu ilan düzenlenemez.');
          return;
        }

        setCategoryId(aggregate.listing.categoryId);
        setListingTypeId(aggregate.listing.listingTypeId);
        setListingStatus(aggregate.listing.status);
        setRejectedReason(aggregate.listing.rejectedReason);
        setExpiresAt(aggregate.listing.expiresAt);
        setInitialValues(aggregateToFormValues(aggregate));
        if (aggregate.listing.companyId) {
          setPublisherMode('company');
          setPublisherCompanyId(aggregate.listing.companyId);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'İlan yüklenemedi');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [getListing, listingId]);

  const formInitialValues = useMemo(() => initialValues ?? undefined, [initialValues]);

  const canPublish = listingStatus === 'draft' || listingStatus === 'rejected';
  const showDraftButton = listingStatus === 'draft' || listingStatus === 'rejected';
  const showCompanyPublisher = categoryId ? supportsCompanyPublisher(categoryId) : false;

  function buildPayload(values: ListingFormValues, asDraft = false) {
    const companyId =
      publisherMode === 'company'
        ? coerceCompanyId(publisherCompanyId)
        : null;

    const partnershipIntent =
      categoryId === CATEGORY_IDS.ortakBul
        ? resolvePartnershipIntent({ customFields: values.customFields })
        : undefined;

    const payload = {
      core: {
        ...values.core,
        companyId,
      },
      customFields: {
        ...values.customFields,
        ...(partnershipIntent ? { partnershipIntent } : {}),
      },
      tags: values.tags,
      images: values.images,
      asDraft,
    };

    console.log('[EditListingPage] buildPayload', JSON.stringify(payload, null, 2));
    return payload;
  }

  async function handleSave(values: ListingFormValues) {
    if (!isAuthenticated) {
      throw new Error('İlan düzenlemek için giriş yapmalısınız.');
    }
    if (showCompanyPublisher && publisherMode === 'company' && !publisherCompanyId) {
      throw new Error('Şirket ilanı için bir şirket seçin.');
    }

    await updateListing(listingId, buildPayload(values, false));

    // Two-Way Sync: Update central career profile
    const isCareerCat =
      categoryId === CATEGORY_IDS.isBul ||
      categoryId === CATEGORY_IDS.iseAl ||
      categoryId === CATEGORY_IDS.ortakBul;

    if (isCareerCat) {
      const persona =
        categoryId === CATEGORY_IDS.iseAl
          ? 'hire'
          : categoryId === CATEGORY_IDS.ortakBul
            ? 'partner'
            : 'seek';

      const custom = values.customFields || {};
      const syncValues = {
        role: String(custom.desiredRole || custom.positionTitle || values.core.title || ''),
        roles: Array.isArray(custom.preferredRoles)
          ? custom.preferredRoles
          : typeof custom.preferredRoles === 'string'
            ? custom.preferredRoles.split(',').map((s: string) => s.trim()).filter(Boolean)
            : undefined,
        sector: String(custom.primarySector || ''),
        sectors: Array.isArray(custom.preferredSectors)
          ? custom.preferredSectors
          : typeof custom.preferredSectors === 'string'
            ? custom.preferredSectors.split(',').map((s: string) => s.trim()).filter(Boolean)
            : undefined,
        experienceLevel: String(custom.experienceLevel || ''),
        workType: String(custom.workType || custom.employmentType || ''),
        workplacePreference: String(custom.workplacePreference || ''),
        city: String(custom.preferredCity || values.core.city || ''),
        professionalSkills: String(custom.professionalSkills || ''),
        technicalSkills: String(custom.technicalSkills || ''),
        educationLevel: String(custom.educationLevel || ''),
        languages: String(custom.languages || ''),
        availability: String(custom.availability || ''),
        candidateTraits: String(custom.requiredResponsibilities || values.core.shortDescription || ''),
        companyName: String(custom.companyName || ''),
        salaryMin: typeof custom.salaryMin === 'number' ? custom.salaryMin : undefined,
        salaryMax: typeof custom.salaryMax === 'number' ? custom.salaryMax : undefined,
      };

      void fetch('/api/career/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          persona,
          values: syncValues,
        }),
      }).catch(() => undefined);
    }

    toast.success('İlan güncellendi');
    router.push('/ilanlarim');
  }

  async function handleSaveDraft(values: ListingFormValues) {
    if (!isAuthenticated) {
      throw new Error('Oturum açmanız gerekiyor.');
    }
    if (showCompanyPublisher && publisherMode === 'company' && !publisherCompanyId) {
      throw new Error('Şirket ilanı için bir şirket seçin.');
    }

    await updateListing(listingId, buildPayload(values, true));
    toast.success('Taslak kaydedildi');
    router.push('/ilanlarim');
  }

  async function handlePublish(values: ListingFormValues) {
    if (!isAuthenticated) {
      throw new Error('Oturum açmanız gerekiyor.');
    }
    if (showCompanyPublisher && publisherMode === 'company' && !publisherCompanyId) {
      throw new Error('Şirket ilanı için bir şirket seçin.');
    }

    await updateListing(listingId, buildPayload(values, false));

    // Two-Way Sync
    const isCareerCat =
      categoryId === CATEGORY_IDS.isBul ||
      categoryId === CATEGORY_IDS.iseAl ||
      categoryId === CATEGORY_IDS.ortakBul;

    if (isCareerCat) {
      const persona =
        categoryId === CATEGORY_IDS.iseAl
          ? 'hire'
          : categoryId === CATEGORY_IDS.ortakBul
            ? 'partner'
            : 'seek';

      const custom = values.customFields || {};
      const syncValues = {
        role: String(custom.desiredRole || custom.positionTitle || values.core.title || ''),
        roles: Array.isArray(custom.preferredRoles)
          ? custom.preferredRoles
          : typeof custom.preferredRoles === 'string'
            ? custom.preferredRoles.split(',').map((s: string) => s.trim()).filter(Boolean)
            : undefined,
        sector: String(custom.primarySector || ''),
        sectors: Array.isArray(custom.preferredSectors)
          ? custom.preferredSectors
          : typeof custom.preferredSectors === 'string'
            ? custom.preferredSectors.split(',').map((s: string) => s.trim()).filter(Boolean)
            : undefined,
        experienceLevel: String(custom.experienceLevel || ''),
        workType: String(custom.workType || custom.employmentType || ''),
        workplacePreference: String(custom.workplacePreference || ''),
        city: String(custom.preferredCity || values.core.city || ''),
        professionalSkills: String(custom.professionalSkills || ''),
        technicalSkills: String(custom.technicalSkills || ''),
        educationLevel: String(custom.educationLevel || ''),
        languages: String(custom.languages || ''),
        availability: String(custom.availability || ''),
        candidateTraits: String(custom.requiredResponsibilities || values.core.shortDescription || ''),
        companyName: String(custom.companyName || ''),
        salaryMin: typeof custom.salaryMin === 'number' ? custom.salaryMin : undefined,
        salaryMax: typeof custom.salaryMax === 'number' ? custom.salaryMax : undefined,
      };

      void fetch('/api/career/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          persona,
          values: syncValues,
        }),
      }).catch(() => undefined);
    }

    const published = await publishListing(listingId);

    if (published.listing.status === 'pending_review') {
      toast.success('İlan incelemeye gönderildi');
      router.push('/ilanlarim');
      return;
    }

    toast.success('İlan yayınlandı');
    router.push(`/ilan/${published.listing.slug}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 pb-20 pt-[calc(var(--gc-header-height,3.75rem)+2rem)] sm:pt-[calc(var(--gc-header-height,3.75rem)+2.75rem)] lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            İlanı Düzenle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            İlan bilgilerinizi güncelleyin ve kaydedin.
          </p>
        </div>

        {listingStatus && (
          <ListingStatusBanner
            status={listingStatus}
            rejectedReason={rejectedReason}
            expiresAt={expiresAt}
          />
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        )}

        {!isLoading && loadError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && isReady && listingType && categoryId && formInitialValues && (
          <>
            {showCompanyPublisher && (
              <ListingPublisherSelect
                mode={publisherMode}
                companyId={publisherCompanyId}
                onChange={(mode, companyId) => {
                  setPublisherMode(mode);
                  setPublisherCompanyId(companyId);
                }}
              />
            )}
            <CategoryListingForm
              listingType={
                categoryId === CATEGORY_IDS.ortakBul
                  ? {
                      ...listingType,
                      fieldSchema: getPartnerFormSchema(
                        resolvePartnershipIntent({ customFields: formInitialValues.customFields }),
                      ),
                    }
                  : listingType
              }
              categoryId={categoryId}
              listingId={listingId}
              partnershipIntent={
                categoryId === CATEGORY_IDS.ortakBul
                  ? resolvePartnershipIntent({ customFields: formInitialValues.customFields })
                  : undefined
              }
              initialValues={formInitialValues}
              userId={actorId}
              onSubmit={handleSave}
              onSaveDraft={showDraftButton ? handleSaveDraft : undefined}
              onPublish={canPublish ? handlePublish : undefined}
              submitLabel="Değişiklikleri Kaydet"
              showDraftButton={showDraftButton}
              showPreviewButton
              showPublishButton={canPublish}
            />
          </>
        )}
    </main>
  );
}
