'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  CategoryListingForm,
  useListingFormConfig,
  useListingEngine,
  categoryRegistry,
} from '@/features/listings';
import type { CategoryId, ListingTypeId } from '@/lib/domain/ids';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import {
  LISTING_TYPE_CONFIGS,
  CREATE_LISTING_TYPE_CONFIGS,
  CREATE_LISTING_DEFERRED_CATEGORY_IDS,
} from '@/features/listings/config/listing-type-config';
import {
  getModuleListingDetailPath,
  usesModulePublish,
} from '@/features/listings/config/listing-category-module.config';
import { listingFormValuesToModulePayload } from '@/features/listings/lib/listing-form-publish.mapper';
import { publishModuleListing } from '@/features/listings/lib/listing-module-api-client';
import { saveListingImages } from '@/features/listings/lib/save-listing-images';
import { traceListingPublish } from '@/lib/debug/listing-publish-trace';
import { cn } from '@/lib/utils';
import {
  createPendingPackagePayment,
  updatePendingPackagePayment,
} from '@/features/monetization/lib/pending-package-payments';
import { notifyPackageActivated } from '@/features/monetization/lib/package-payment-notifications';
import { isPremiumEnabled } from '@/features/shared/config/features';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import {
  collectSuspiciousFlags,
  validateListingContentPolicy,
} from '@/features/listings/lib/listing-content-policy';
import { registerListingTextFingerprint } from '@/features/listings/lib/listing-duplicate-registry';
import { enqueueSuspiciousContent } from '@/features/admin/content-policy/mock/suspicious-content.mock';
import {
  CreateListingCategoryPicker,
  CreateListingSelectedCategoryBar,
} from '@/components/girisimco/listing/create-listing-category-picker';

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, actorId, createListing, publishListing } = useListingEngine();
  const { user, isLoading: authLoading } = useAuth();
  const [sessionReady, setSessionReady] = useState(false);

  const resolvedInitialCategory = categoryRegistry.resolveCategoryId(
    searchParams.get('category') ?? searchParams.get('intent') ?? '',
  );
  /** Deferred create types (e.g. Yatırım Yapacağım) cannot be opened via ?category= */
  const initialCategory =
    resolvedInitialCategory
    && !CREATE_LISTING_DEFERRED_CATEGORY_IDS.includes(resolvedInitialCategory)
      ? resolvedInitialCategory
      : null;

  const [categoryId, setCategoryId] = useState<CategoryId | null>(initialCategory);
  const [listingTypeId, setListingTypeId] = useState<ListingTypeId | null>(() => {
    if (!initialCategory) return null;
    return (
      CREATE_LISTING_TYPE_CONFIGS.find((c) => c.categoryId === initialCategory)?.listingTypeId
      ?? null
    );
  });
  const { listingType, isReady } = useListingFormConfig(categoryId, listingTypeId);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      router.replace(`/giris?next=${encodeURIComponent('/ilan/olustur')}`);
      return;
    }
    setSessionReady(true);
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || !sessionReady) {
    return (
      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-20 lg:px-8">
        <div className="mb-8 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border/80 bg-muted/40"
            />
          ))}
        </div>
      </main>
    );
  }

  function selectCategory(id: CategoryId) {
    if (CREATE_LISTING_DEFERRED_CATEGORY_IDS.includes(id)) return;
    setCategoryId(id);
    const fromConfig = CREATE_LISTING_TYPE_CONFIGS.find((c) => c.categoryId === id);
    const defaultType =
      fromConfig?.listingTypeId
      ?? categoryRegistry.getDefaultListingType(id)?.id
      ?? null;
    setListingTypeId(defaultType);
  }

  function resetCategorySelection() {
    setCategoryId(null);
    setListingTypeId(null);
  }

  async function handlePublish(values: ListingFormValues) {
    if (!isAuthenticated) {
      throw new Error('Oturum açmanız gerekiyor.');
    }
    if (!categoryId) {
      throw new Error('Kategori seçilmedi.');
    }
    if (!listingTypeId) {
      throw new Error('İlan tipi seçilmedi.');
    }

    const moduleKey = LISTING_TYPE_CONFIGS.find((c) => c.categoryId === categoryId)?.slug ?? categoryId;
    traceListingPublish(String(moduleKey), 'form_submit', { input: values });

    let listing;

    if (usesModulePublish(categoryId)) {
      let payload: Record<string, unknown>;
      try {
        payload = listingFormValuesToModulePayload(categoryId, values);
        traceListingPublish(String(moduleKey), 'mapper', { payload });
      } catch (error) {
        traceListingPublish(String(moduleKey), 'mapper_exception', { error });
        throw error;
      }

      try {
        listing = await publishModuleListing(categoryId, payload);
        if (values.images.length > 0) {
          await saveListingImages(listing.id, values.images);
        }
        traceListingPublish(String(moduleKey), 'redirect', {
          response: { slug: listing.slug, status: listing.status, moduleKey: listing.moduleKey },
        });
      } catch (error) {
        traceListingPublish(String(moduleKey), 'action_exception', { error });
        throw error;
      }
    } else {
      try {
        const aggregate = await createListing({
          categoryId,
          listingTypeId,
          core: {
            title: values.core.title,
            shortDescription: values.core.shortDescription,
            longDescription: values.core.longDescription,
            city: values.core.city ?? null,
          },
          customFields: values.customFields,
          tags: values.tags,
          images: values.images,
          asDraft: true,
        });
        const published = await publishListing(aggregate.listing.id);
        listing = published.listing;
        traceListingPublish(String(moduleKey), 'redirect', {
          response: { slug: listing.slug, status: listing.status, moduleKey: listing.moduleKey },
        });
      } catch (error) {
        traceListingPublish(String(moduleKey), 'action_exception', { error });
        throw error;
      }
    }

    const placements = values.packageSelection?.placements ?? [];
    const simulationReady = values.packageSelection?.simulationStatus === 'ready';
    const ownerId = user?.id ?? String(actorId);

    // Persist publish-consent audit (non-blocking for UX; server validates keys).
    if (values.publishConsents && listing?.id) {
      void fetch(`/api/listings/${listing.id}/publish-consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishConsents: values.publishConsents }),
      }).catch(() => undefined);
    }

    registerListingTextFingerprint(
      String(values.core?.title ?? ''),
      String(values.core?.shortDescription ?? ''),
    );
    const policyIssues = validateListingContentPolicy({
      title: values.core?.title,
      shortDescription: values.core?.shortDescription,
      longDescription: values.core?.longDescription,
      tags: values.tags,
    });
    const flags = collectSuspiciousFlags(policyIssues);
    if (flags.length > 0) {
      enqueueSuspiciousContent({
        listingId: listing.id,
        title: String(values.core?.title ?? listing.title),
        snippet: String(values.core?.shortDescription ?? ''),
        flags,
        ownerLabel: user?.email ?? ownerId,
      });
    }

    if (isPremiumEnabled() && placements.length > 0 && simulationReady && ownerId) {
      try {
        const pending = createPendingPackagePayment({
          userId: ownerId,
          listingId: listing.id,
          listingTitle: values.core?.title,
          packages: placements,
        });
        const succeeded =
          updatePendingPackagePayment(pending.id, 'succeeded') ?? {
            ...pending,
            status: 'succeeded' as const,
          };
        void notifyPackageActivated(ownerId, succeeded).catch(() => undefined);
        toast.success(
          listing.status === 'published'
            ? 'İlanınız yayınlandı. Seçtiğiniz paketler kaydedildi (ödeme simülasyonu).'
            : 'İlanınız incelemeye gönderildi. Seçtiğiniz paketler kaydedildi (ödeme simülasyonu).',
        );
      } catch {
        toast.success(
          listing.status === 'published'
            ? 'İlanınız yayınlandı. Paket kaydı tamamlanamadı — daha sonra tekrar deneyebilirsiniz.'
            : 'İlanınız incelemeye gönderildi. Paket kaydı tamamlanamadı — daha sonra tekrar deneyebilirsiniz.',
        );
      }
    } else if (listing.status === 'published') {
      toast.success('İlanınız yayınlandı');
    } else {
      toast.success('İlanınız admin onayına gönderildi');
    }

    router.push(getModuleListingDetailPath(categoryId, listing.slug));
  }

  const selectedLabel =
    CREATE_LISTING_TYPE_CONFIGS.find((c) => c.categoryId === categoryId)?.name ?? '';

  return (
    <main
      className={cn(
        'relative mx-auto bg-[#FAFBFC] px-5 pb-16 pt-20 dark:bg-background lg:px-8',
        categoryId ? 'max-w-2xl' : 'max-w-[1280px]',
      )}
    >
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-3xl">
          İlan Oluştur
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#64748B] sm:text-[15px]">
          {categoryId
            ? 'Formu doldurun; yayın öncesi içerik kontrolünden geçer.'
            : 'Önce kategorinizi seçin — form yalnızca o kategoriye özel alanları gösterir.'}
        </p>
      </div>

      {!categoryId ? (
        <CreateListingCategoryPicker
          options={CREATE_LISTING_TYPE_CONFIGS}
          onSelect={selectCategory}
        />
      ) : null}

      {categoryId && (
        <CreateListingSelectedCategoryBar
          categoryId={categoryId}
          label={selectedLabel}
          onChange={resetCategorySelection}
        />
      )}

      {isReady && listingType && categoryId ? (
        <CategoryListingForm
          key={categoryId}
          listingType={listingType}
          categoryId={categoryId}
          userId={actorId}
          onPublish={handlePublish}
          showPreviewButton
          showPublishButton
        />
      ) : (
        categoryId && (
          <div className="rounded-xl border border-dashed border-[#E6E8EE] bg-white p-12 text-center text-sm text-[#64748B] dark:border-border dark:bg-card">
            Form yükleniyor…
          </div>
        )
      )}
    </main>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-20 lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-border/80 bg-muted/40"
              />
            ))}
          </div>
        </main>
      }
    >
      <CreateListingContent />
    </Suspense>
  );
}
