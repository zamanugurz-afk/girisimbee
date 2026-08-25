import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import {
  candidateApplicationSubmitSchema,
  candidateApplicationListQuerySchema,
} from '@/lib/api/validation/candidate-applications';
import { ids } from '@/lib/domain/ids';
import { CareerProfileService } from '@/features/career-profile/career-profile.service';
import { sendJobApplicationEmployerNotification } from '@/lib/email/job-application-email';

/** GET — list candidate's own job applications */
/** POST — apply to employer job listing */
export const GET = withAuth(async (ctx, request) => {
  const url = new URL(request.url);
  const query = candidateApplicationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const applications = await ctx.container.ecosystem.candidateApplicationService.listMyApplications(
    ctx.profileId,
    {
      status: query.status,
      submittedAfter: query.submittedAfter,
      submittedBefore: query.submittedBefore,
    },
  );
  return ok({ applications });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const parsed = candidateApplicationSubmitSchema.parse(body);
  let listingId = ids.listing(parsed.listingId);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.listingId);
  if (!isUuid) {
    try {
      const { createServiceRoleClient } = await import('@/lib/supabase/service');
      const admin = createServiceRoleClient();
      const { data: bySlug } = await admin
        .from('marketplace_listings')
        .select('id')
        .eq('slug', parsed.listingId)
        .maybeSingle();
      if (bySlug?.id) {
        listingId = ids.listing(bySlug.id);
      }
    } catch {}
  }

  // Fetch listing and employer details (using service role for accurate owner_id)
  const listing = await ctx.container.listingRepository.findById(listingId);
  let employerEmail: string | undefined;
  let employerUserId: import('@/lib/domain/ids').UserId | undefined = listing?.ownerId ?? undefined;

  try {
    const { createServiceRoleClient } = await import('@/lib/supabase/service');
    const admin = createServiceRoleClient();
    const { data: listingRow } = await admin
      .from('marketplace_listings')
      .select('owner_id')
      .eq('id', listingId)
      .maybeSingle();

    if (listingRow?.owner_id) {
      employerUserId = ids.user(listingRow.owner_id);
      const { data: profileRow } = await admin
        .from('marketplace_profiles')
        .select('email')
        .eq('user_id', listingRow.owner_id)
        .is('deleted_at', null)
        .maybeSingle();
      if (profileRow?.email) {
        employerEmail = profileRow.email;
      }

      if (!employerEmail) {
        try {
          const { data: authUser } = await admin.auth.admin.getUserById(listingRow.owner_id);
          if (authUser?.user?.email) {
            employerEmail = authUser.user.email;
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[applications] failed to resolve listing owner via service role:', err);
  }

  const profileSnapshot = parsed.profileSnapshot as import('@/features/candidates/components/CareerProfilePreview').CareerCardInput | undefined;

  const application = await ctx.container.ecosystem.candidateApplicationService.submitApplication(
    ctx.profileId,
    listingId,
    parsed.coverMessage,
    parsed.initialNote,
    profileSnapshot ?? null,
    {
      messagingService: ctx.container.messagingService,
      profileRepo: ctx.container.profileRepository,
      applicantUserId: ctx.userId,
      employerUserId,
      employerEmail,
      applicantName: ctx.profile?.displayName || (profileSnapshot?.displayName ?? undefined),
      onNotifyEmployer: sendJobApplicationEmployerNotification,
    },
  );

  // If user requested to save modified profile to main career profile as well
  if (parsed.saveToMainProfile && profileSnapshot) {
    try {
      const careerService = new CareerProfileService(ctx.container.listingRepository);
      await careerService.saveProfile(
        ctx.userId,
        undefined,
        {
          role: profileSnapshot.desiredRole || '',
          roles: profileSnapshot.desiredRole ? [profileSnapshot.desiredRole] : [],
          sector: profileSnapshot.primarySector || '',
          sectors: profileSnapshot.primarySector ? [profileSnapshot.primarySector] : [],
          experienceLevel: profileSnapshot.experienceLevel || '',
          city: profileSnapshot.preferredCity || profileSnapshot.residenceCity || '',
          workType: profileSnapshot.workType || '',
          workplacePreference: profileSnapshot.workplacePreference || '',
          educationLevel: profileSnapshot.educationLevel || '',
          educationField: profileSnapshot.educationField || '',
          languages: profileSnapshot.languages || '',
          certificates: profileSnapshot.certificates || '',
          tools: profileSnapshot.tools || '',
          availability: profileSnapshot.availability || 'Hemen',
          professionalSkills: profileSnapshot.professionalSkills || '',
          technicalSkills: profileSnapshot.technicalSkills || '',
          fullName: profileSnapshot.displayName || ctx.profile?.displayName || '',
          experiences: profileSnapshot.experiences || [],
          educationHistory: profileSnapshot.educationHistory || [],
          candidateTraits: profileSnapshot.longDescription || '',
        },
        'seek',
      );
    } catch (saveErr) {
      console.warn('[career-profile] failed to sync application profile to main profile:', saveErr);
    }
  }

  return created({ application });
});
