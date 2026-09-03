import { withAuth, withOptionalAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  employerListingBrowseQuerySchema,
  parseEmployerListingCreate,
} from '@/lib/api/validation/employer-listings';
import { traceListingPublish, logPublicationState } from '@/lib/debug/listing-publish-trace';
import { stripListingsContactPhone } from '@/features/contact-requests/lib/strip-listing-phone';

/** GET — browse published job listings */
export const GET = withOptionalAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = employerListingBrowseQuerySchema.parse(Object.fromEntries(url.searchParams));
  const supabase = (await import('@/lib/supabase/server')).createClient();
  const container =
    ctx?.container ?? (await import('@/lib/persistence/container')).getServerContainer(supabase);

  const result = await container.ecosystem.employerService.browseJobs({
    city: query.city,
    district: query.district,
    sector: query.sector,
    remotePolicy: query.remotePolicy,
  });

  return ok({ listings: stripListingsContactPhone(result.data), pagination: result });
});

/** POST — create job listing (draft or publish via ?publish=true) */
export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  traceListingPublish('employers', 'api_input', { input: body });

  const parsed = parseEmployerListingCreate(body);
  traceListingPublish('employers', 'api_validated', { payload: parsed });

  const url = new URL(request.url);
  const publishNow = url.searchParams.get('publish') === 'true';
  traceListingPublish('employers', 'publish_intent', {
    payload: { publishNow, expected_status: publishNow ? 'published' : 'draft' },
  });

  try {
    const listing = await ctx.container.ecosystem.employerService.createJobListing({
      ownerId: ctx.userId,
      profileId: ctx.profileId,
      listing: parsed,
      asDraft: !publishNow,
    });

    // Auto-create company profile on server if companyName is provided
    const compName = String((parsed as any).companyName || (parsed as any).businessName || '').trim();
    if (compName) {
      try {
        const existing = await ctx.container.companyRepository.findByOwnerId(ctx.userId);
        const match = existing.find((c) => c.name.toLowerCase() === compName.toLowerCase());
        if (!match) {
          const compSlug = compName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 120);
          await ctx.container.companyRepository.create({
            ownerId: ctx.userId,
            name: compName,
            slug: compSlug,
            industry: String((parsed as any).primarySector || (parsed as any).sector || 'Hizmet & Ticaret'),
            city: (parsed as any).city || 'İstanbul',
            contactEmail: ctx.user?.email,
            description: `${compName} kurumsal iş yeri profili.`,
          });
        }
      } catch (e) {
        console.warn('Server auto-create company non-fatal error:', e);
      }
    }

    logPublicationState('employers', 'after_insert', {
      status: listing.status,
      published_at: listing.publishedAt,
      reviewed_at: null,
      deleted_at: listing.deletedAt,
    });
    return created({ listing });
  } catch (error) {
    traceListingPublish('employers', 'repository_exception', { error });
    throw error;
  }
});
