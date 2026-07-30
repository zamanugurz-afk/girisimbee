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

  function buildPayload(values: ListingFormValues, asDraft = false) {
    return {
      core: {
        ...values.core,
        companyId: publisherMode === 'company' ? publisherCompanyId : null,
      },
      customFields: values.customFields,
      tags: values.tags,
      images: values.images,
      asDraft,
    };
  }

  async function handleSave(values: ListingFormValues) {
    if (!isAuthenticated) {
      toast.error('İlan düzenlemek için giriş yapmalısınız');
      return;
    }

    await updateListing(listingId, buildPayload(values, false));
    toast.success('İlan güncellendi');
    router.push('/ilanlarim');
  }

  async function handleSaveDraft(values: ListingFormValues) {
    if (!isAuthenticated) return;

    await updateListing(listingId, buildPayload(values, true));
    toast.success('Taslak kaydedildi');
    router.push('/ilanlarim');
  }

  async function handlePublish(values: ListingFormValues) {
    if (!isAuthenticated) return;

    await updateListing(listingId, buildPayload(values, false));
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
    <main className="mx-auto max-w-2xl px-5 pb-16 pt-20 lg:px-8">
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
            <ListingPublisherSelect
              mode={publisherMode}
              companyId={publisherCompanyId}
              onChange={(mode, companyId) => {
                setPublisherMode(mode);
                setPublisherCompanyId(companyId);
              }}
            />
            <CategoryListingForm
              listingType={listingType}
              categoryId={categoryId}
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
