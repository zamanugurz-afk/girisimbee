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
import { LISTING_TYPE_CONFIGS } from '@/features/listings/config/listing-type-config';
import {
  getModuleListingDetailPath,
  usesModulePublish,
} from '@/features/listings/config/listing-category-module.config';
import { listingFormValuesToModulePayload } from '@/features/listings/lib/listing-form-publish.mapper';
import { publishModuleListing } from '@/features/listings/lib/listing-module-api-client';
import { saveListingImages } from '@/features/listings/lib/save-listing-images';
import { traceListingPublish } from '@/lib/debug/listing-publish-trace';
import { cn } from '@/lib/utils';

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, actorId } = useListingEngine();

  const initialCategory = categoryRegistry.resolveCategoryId(
    searchParams.get('category') ?? searchParams.get('intent') ?? '',
  );

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
    if (!usesModulePublish(categoryId)) {
      throw new Error('Bu kategori için modül yayın yolu tanımlı değil.');
    }

    const moduleKey = LISTING_TYPE_CONFIGS.find((c) => c.categoryId === categoryId)?.slug ?? categoryId;
    traceListingPublish(String(moduleKey), 'form_submit', { input: values });

    let payload: Record<string, unknown>;
    try {
      payload = listingFormValuesToModulePayload(categoryId, values);
      traceListingPublish(String(moduleKey), 'mapper', { payload });
    } catch (error) {
      traceListingPublish(String(moduleKey), 'mapper_exception', { error });
      throw error;
    }

    let listing;
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

    toast.success('İlanınız yayınlandı');
    router.push(getModuleListingDetailPath(categoryId, listing.slug));
  }

  return (
    <main className="mx-auto max-w-2xl px-5 pb-16 pt-20 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">İlan Oluştur</h1>
          <p className="mt-1 text-gc-sm text-muted-foreground">
            Önce kategorinizi seçin — form yalnızca o kategoriye özel alanları gösterir.
          </p>
        </div>

        {!categoryId && (
          <section className="mb-8">
            <h2 className="mb-1 font-display text-gc-md font-semibold text-foreground">
              Hangi tür ilan vereceksiniz?
            </h2>
            <p className="mb-5 text-gc-sm text-muted-foreground">
              Her kategori farklı alanlar ve adımlar içerir.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {LISTING_TYPE_CONFIGS.map((config) => (
                <button
                  key={config.categoryId}
                  type="button"
                  onClick={() => selectCategory(config.categoryId)}
                  className={cn(
                    'gc-card-interactive p-4 text-left',
                    categoryId === config.categoryId && 'ring-1 ring-primary/20',
                  )}
                >
                  <p className="font-display text-gc-base font-semibold text-foreground">
                    {config.name}
                  </p>
                  <p className="mt-1 text-gc-xs leading-relaxed text-muted-foreground">
                    {config.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {categoryId && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-gc-xs text-muted-foreground">Seçilen kategori</p>
              <p className="text-gc-sm font-medium text-foreground">
                {LISTING_TYPE_CONFIGS.find((c) => c.categoryId === categoryId)?.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCategoryId(null);
                setListingTypeId(null);
              }}
              className="text-gc-sm font-medium text-primary hover:text-primary/80"
            >
              Değiştir
            </button>
          </div>
        )}

        {isReady && listingType && categoryId ? (
          <>
            <CategoryListingForm
              listingType={listingType}
              categoryId={categoryId}
              userId={actorId}
              onPublish={handlePublish}
              showPreviewButton
              showPublishButton
            />
          </>
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
    <Suspense fallback={null}>
      <CreateListingContent />
    </Suspense>
  );
}
