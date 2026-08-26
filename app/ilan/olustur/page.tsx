'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users } from 'lucide-react';
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
import { loginUrl } from '@/features/authentication/constants/routes';
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
import { getPartnerFormSchema } from '@/features/founders/partnership-form';
import {
  parsePartnershipIntentParam,
  partnershipCreateHref,
  partnershipCreatePageCopy,
  type PartnershipIntent,
} from '@/features/founders/partnership-intent';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, actorId, createListing, publishListing } = useListingEngine();
  const { user, isLoading: authLoading } = useAuth();
  const [sessionReady, setSessionReady] = useState(false);

  const urlPartnershipIntent = parsePartnershipIntentParam(searchParams.get('intent'));
  const resolvedInitialCategory = categoryRegistry.resolveCategoryId(
    searchParams.get('category')
    ?? (urlPartnershipIntent ? '' : searchParams.get('intent'))
    ?? '',
  );
  /** Deferred create types (e.g. Yatırım Yapacağım) cannot be opened via ?category= */
  const initialCategory =
    resolvedInitialCategory
    && !CREATE_LISTING_DEFERRED_CATEGORY_IDS.includes(resolvedInitialCategory)
      ? resolvedInitialCategory
      : null;

  const [careerHubOpen, setCareerHubOpen] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState<CategoryId | null>(null);
  const [overrideIntent, setOverrideIntent] = useState<PartnershipIntent | null>(null);

  const categoryId = initialCategory || overrideCategory;
  const partnershipIntent: PartnershipIntent | null =
    categoryId === CATEGORY_IDS.ortakBul
      ? (overrideIntent ?? urlPartnershipIntent ?? 'seeking')
      : null;
  const searchIntent = searchParams.get('intent');
  const listingTypeId: ListingTypeId | null = categoryId
    ? (
      categoryId === CATEGORY_IDS.bayilikAl
        ? LISTING_TYPE_IDS.franchiseGiveDefault
        : categoryId === CATEGORY_IDS.isletmeDevri && (searchIntent === 'buy' || searchIntent === 'devral')
          ? LISTING_TYPE_IDS.businessTransferBuyDefault
          : categoryId === CATEGORY_IDS.isletmeDevri
            ? LISTING_TYPE_IDS.businessTransferSellDefault
            : (CREATE_LISTING_TYPE_CONFIGS.find((c) => c.categoryId === categoryId)?.listingTypeId
              ?? categoryRegistry.getDefaultListingType(categoryId)?.id
              ?? null)
    )
    : null;
  const hubStep: 'career' | 'venture' | null = categoryId
    ? null
    : searchParams.get('hub') === 'venture'
      ? 'venture'
      : careerHubOpen
        ? 'career'
        : null;
  const { listingType, isReady } = useListingFormConfig(categoryId, listingTypeId);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user) {
      if (searchParams.get('test_session') === '1') {
        setSessionReady(true);
        return;
      }
      const qs = searchParams.toString();
      router.replace(loginUrl(qs ? `/ilan/olustur?${qs}` : '/ilan/olustur'));
      return;
    }
    setSessionReady(true);
  }, [authLoading, isAuthenticated, user, router, searchParams]);

  if (authLoading || !sessionReady) {
    return (
      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-20 lg:px-8">
        <div className="mb-8 space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border/80 bg-muted/40"
            />
          ))}
        </div>
      </main>
    );
  }

  function selectCategory(
    id: CategoryId,
    options?: { partnershipIntent?: PartnershipIntent; subIntent?: string },
  ) {
    if (CREATE_LISTING_DEFERRED_CATEGORY_IDS.includes(id)) return;
    setOverrideCategory(id);
    if (options?.partnershipIntent) {
      setOverrideIntent(options.partnershipIntent);
    }
    setCareerHubOpen(false);
    if (id === CATEGORY_IDS.ortakBul) {
      router.push('/ilan/olustur?category=ortak-bul&intent=seeking');
      return;
    }
    if (id === CATEGORY_IDS.bayilikAl) {
      router.push('/ilan/olustur?category=franchise');
      return;
    }
    if (id === CATEGORY_IDS.isletmeDevri) {
      router.push('/ilan/olustur?category=isletme-devri&intent=sell');
      return;
    }
    const slug = categoryRegistry.getCategory(id)?.slug;
    router.push(slug ? `/ilan/olustur?category=${slug}` : '/ilan/olustur');
  }

  function resetCategorySelection() {
    setOverrideCategory(null);
    setOverrideIntent(null);
    setCareerHubOpen(false);
    if (
      categoryId === CATEGORY_IDS.ortakBul ||
      categoryId === CATEGORY_IDS.isletmeDevri
    ) {
      router.push('/ilan/olustur?hub=venture');
      return;
    }
    router.push('/ilan/olustur');
  }

  function handleHubStepChange(step: 'career' | 'venture' | null) {
    if (step === 'venture') {
      setCareerHubOpen(false);
      router.push('/ilan/olustur?hub=venture');
      return;
    }
    if (step === 'career') {
      setCareerHubOpen(true);
      return;
    }
    setCareerHubOpen(false);
    router.push('/ilan/olustur');
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
        payload = listingFormValuesToModulePayload(categoryId, {
          ...values,
          customFields: {
            ...values.customFields,
            ...(partnershipIntent ? { partnershipIntent } : {}),
          },
        });
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
          customFields: {
            ...values.customFields,
            ...(partnershipIntent ? { partnershipIntent } : {}),
          },
          tags: values.tags,
          images: values.images,
          asDraft: false,
        });
        listing = aggregate.listing;
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

    // Two-Way Sync: Update central career profile
    const isCareerCat =
      categoryId === CATEGORY_IDS.isBul ||
      categoryId === CATEGORY_IDS.iseAl ||
      categoryId === CATEGORY_IDS.ortakBul;

    if (isCareerCat && listing?.id) {
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
          listingId: listing.id,
          persona,
          values: syncValues,
        }),
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

    const returnToParam = searchParams.get('returnTo');
    const targetSlug = listing?.slug || listing?.id;
    const redirectPath = returnToParam || (targetSlug
      ? getModuleListingDetailPath(categoryId, targetSlug)
      : `/kategori/${categoryId === CATEGORY_IDS.isBul ? 'is-ariyorum' : 'ilanlar'}`);

    console.log('[CreateListingPage] Successfully published, navigating to:', redirectPath);

    if (typeof window !== 'undefined') {
      window.location.assign(redirectPath);
    } else {
      router.push(redirectPath);
    }
  }

  const createCopy =
    categoryId === CATEGORY_IDS.ortakBul && partnershipIntent
      ? partnershipCreatePageCopy(partnershipIntent)
      : null;
  const selectedLabel =
    createCopy?.title
    ?? CREATE_LISTING_TYPE_CONFIGS.find((c) => c.categoryId === categoryId)?.name
    ?? '';
  const formListingType =
    listingType && categoryId === CATEGORY_IDS.ortakBul
      ? {
          ...listingType,
          fieldSchema: getPartnerFormSchema(partnershipIntent ?? 'seeking'),
        }
      : listingType;

  return (
    <main
      className={cn(
        'relative mx-auto bg-[#FAFBFC] px-4 pb-20 pt-[calc(var(--gc-header-height,3.75rem)+2rem)] sm:pt-[calc(var(--gc-header-height,3.75rem)+2.75rem)] dark:bg-background lg:px-8',
        'max-w-[1240px]',
      )}
    >
      {!categoryId ? (
        <CreateListingCategoryPicker
          onSelect={selectCategory}
          hubStep={hubStep}
          onHubStepChange={handleHubStepChange}
        />
      ) : null}

      {isReady && formListingType && categoryId ? (
        <CategoryListingForm
          key={`${categoryId}-${listingTypeId ?? 'default'}-${partnershipIntent ?? 'none'}`}
          listingType={formListingType}
          categoryId={categoryId}
          partnershipIntent={partnershipIntent ?? undefined}
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

class CreateListingErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CreateListingPage Exception caught]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto max-w-[1240px] px-4 py-20 text-center">
          <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-8">
            <h2 className="text-lg font-bold text-foreground">İlan oluşturma sayfası yüklenirken bir sorun oluştu</h2>
            {this.state.error?.message && (
              <pre className="mt-3 max-h-40 overflow-auto text-xs font-mono text-destructive bg-destructive/10 p-2.5 rounded-lg text-left whitespace-pre-wrap break-words">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack?.split('\n').slice(0, 3).join('\n')}
              </pre>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Sayfa önbelleğini yenileyerek veya kategori seçerek devam edebilirsiniz.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer"
              >
                Sayfayı Yenile
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/ilan/olustur?category=ise-al';
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted cursor-pointer"
              >
                İşe Alım İlanı Oluştur
              </button>
            </div>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export default function CreateListingPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-[1280px] px-5 pb-20 pt-[calc(var(--gc-header-height,3.75rem)+2rem)] sm:pt-[calc(var(--gc-header-height,3.75rem)+2.75rem)] lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-border/80 bg-muted/40"
              />
            ))}
          </div>
        </main>
      }
    >
      <CreateListingErrorBoundary>
        <CreateListingContent />
      </CreateListingErrorBoundary>
    </Suspense>
  );
}
