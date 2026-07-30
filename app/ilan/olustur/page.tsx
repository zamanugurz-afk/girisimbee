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
import type { CategoryId, ListingTypeId, CompanyId } from '@/lib/domain/ids';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import {
  ListingPublisherSelect,
  type ListingPublisherMode,
} from '@/features/listings/components/listing-publisher-select';
import { LISTING_TYPE_CONFIGS } from '@/features/listings/config/listing-type-config';
import { cn } from '@/lib/utils';

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createListing, publishListing, isAuthenticated, actorId } = useListingEngine();

  const initialCategory = categoryRegistry.resolveCategoryId(
    searchParams.get('category') ?? searchParams.get('intent') ?? '',
  );

  const [categoryId, setCategoryId] = useState<CategoryId | null>(initialCategory);
  const [listingTypeId, setListingTypeId] = useState<ListingTypeId | null>(() => {
    if (!initialCategory) return null;
    return categoryRegistry.getDefaultListingType(initialCategory)?.id ?? null;
  });

  const [publisherMode, setPublisherMode] = useState<ListingPublisherMode>('personal');
  const [publisherCompanyId, setPublisherCompanyId] = useState<CompanyId | null>(null);

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

  function buildPayload(values: ListingFormValues, asDraft = false) {
    if (!categoryId || !listingTypeId) throw new Error('Kategori seçilmedi');

    return {
      categoryId,
      listingTypeId,
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

  function validatePublisher() {
    if (publisherMode === 'company' && !publisherCompanyId) {
      toast.error('Şirket ilanı için bir şirket seçin');
      return false;
    }
    return true;
  }

  async function handleSaveDraft(values: ListingFormValues) {
    if (!isAuthenticated || !validatePublisher()) return;

    const aggregate = await createListing(buildPayload(values, true));
    toast.success('Taslak kaydedildi');
    router.push(`/ilanlarim/${aggregate.listing.id}/duzenle`);
  }

  async function handlePublish(values: ListingFormValues) {
    if (!isAuthenticated || !validatePublisher()) return;

    const aggregate = await createListing(buildPayload(values, false));
    const published = await publishListing(aggregate.listing.id);

    if (published.listing.status === 'pending_review') {
      toast.success('İlan incelemeye gönderildi', {
        description: 'Onaylandığında yayına alınacaktır.',
      });
      router.push('/ilanlarim');
      return;
    }

    toast.success('İlanınız yayınlandı');
    router.push(`/ilan/${published.listing.slug}`);
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
              userId={actorId}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              showDraftButton
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
