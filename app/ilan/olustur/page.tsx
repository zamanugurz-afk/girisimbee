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
  CATEGORY_IDS,
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
  const { user } = useAuth();

  const resolvedInitialCategory = categoryRegistry.resolveCategoryId(
    searchParams.get('category') ?? searchParams.get('intent') ?? '',
  );
  const initialCategory =
    resolvedInitialCategory && resolvedInitialCategory !== CATEGORY_IDS.yatirimYap
      ? resolvedInitialCategory
      : null;

  const [categoryId, setCategoryId] = useState<CategoryId | null>(initialCategory);
  const [listingTypeId, setListingTypeId] = useState<ListingTypeId | null>(() => {
    if (!initialCategory) return null;
    return categoryRegistry.getDefaultListingType(initialCategory)?.id ?? null;
  });

  const { listingType, isReady } = useListingFormConfig(categoryId, listingTypeId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/giris?redirect=/ilan/olustur');
    }
  }, [isAuthenticated, router]);

  function selectCategory(id: CategoryId) {
    if (id === CATEGORY_IDS.yatirimYap) return;
    setCategoryId(id);
    const defaultType = categoryRegistry.getDefaultListingType(id);
    setListingTypeId(defaultType?.id ?? null);
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
        'relative mx-auto px-5 pb-16 pt-20 lg:px-8',
        categoryId ? 'max-w-2xl' : 'max-w-5xl',
      )}
    >
      {!categoryId && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.10),_transparent_60%)]"
          aria-hidden
        />
      )}

      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          İlan Oluştur
        </h1>
        <p className="mt-1.5 max-w-xl text-gc-sm leading-relaxed text-muted-foreground sm:text-gc-base">
          {categoryId
            ? 'Formu doldurun; yayın öncesi içerik kontrolünden geçer.'
            : 'Önce kategorinizi seçin — form yalnızca o kategoriye özel alanları gösterir.'}
        </p>
      </div>

      {!categoryId && (
        <CreateListingCategoryPicker
          options={CREATE_LISTING_TYPE_CONFIGS}
          onSelect={selectCategory}
        />
      )}

      {categoryId && (
        <CreateListingSelectedCategoryBar
          categoryId={categoryId}
          label={selectedLabel}
          onChange={() => {
            setCategoryId(null);
            setListingTypeId(null);
          }}
        />
      )}

      {isReady && listingType && categoryId ? (
        <CategoryListingForm
          listingType={listingType}
          categoryId={categoryId}
          userId={actorId}
          onPublish={handlePublish}
          showPreviewButton
          showPublishButton
        />
      ) : (
        categoryId && (
          <div className="rounded-xl border border-dashed border-border/80 p-12 text-center text-gc-sm text-muted-foreground">
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
        <main className="mx-auto max-w-5xl px-5 pb-16 pt-20 lg:px-8">
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
