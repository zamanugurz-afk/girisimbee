import { withAdmin } from '@/lib/api/with-admin';
import { parseJsonBody } from '@/lib/api/with-auth';
import { ok, apiError } from '@/lib/api/response';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { ids } from '@/lib/domain/ids';
import type { CompanyStatus } from '@/features/companies/types/company.types';

/**
 * GET /api/admin/companies
 * List companies with search query, verification filter, and status filter.
 */
export const GET = withAdmin(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const query = (url.searchParams.get('query') ?? '').trim();
    const status = url.searchParams.get('status');
    const isVerified = url.searchParams.get('isVerified');
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)));
    const offset = (page - 1) * limit;

    let supabaseCompanies: any[] = [];
    let totalCount = 0;

    try {
      const admin = createServiceRoleClient();
      let dbQuery = admin
        .from('marketplace_companies')
        .select('*', { count: 'exact' })
        .is('deleted_at', null);

      if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,slug.ilike.%${query}%,industry.ilike.%${query}%,city.ilike.%${query}%`);
      }
      if (status && status !== 'all') {
        dbQuery = dbQuery.eq('status', status);
      }
      if (isVerified === 'true') {
        dbQuery = dbQuery.eq('is_verified', true);
      } else if (isVerified === 'false') {
        dbQuery = dbQuery.eq('is_verified', false);
      }

      dbQuery = dbQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await dbQuery;
      if (!error && data) {
        supabaseCompanies = data;
        totalCount = count ?? data.length;
      }
    } catch {
      // fallback to container
    }

    if (supabaseCompanies.length === 0 && ctx.container.companyRepository) {
      const memoryResult = await ctx.container.companyRepository.findMany(
        {
          query: query || undefined,
          status: status && status !== 'all' ? (status as CompanyStatus) : undefined,
          isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
          includeDeleted: false,
        },
        { page, limit },
      );
      return ok({
        items: memoryResult.data,
        total: memoryResult.total,
        page,
        limit,
      });
    }

    const mapped = supabaseCompanies.map((c) => ({
      id: c.id,
      ownerId: c.owner_id,
      name: c.name,
      slug: c.slug,
      logoUrl: c.logo_url ?? null,
      coverUrl: c.cover_url ?? null,
      description: c.description ?? null,
      website: c.website ?? null,
      linkedInUrl: c.linkedin_url ?? null,
      twitterUrl: c.twitter_url ?? null,
      city: c.city ?? null,
      location: c.location ?? null,
      country: c.country ?? 'TR',
      industry: c.industry ?? null,
      employeeCount: c.employee_count ?? null,
      foundedYear: c.founded_year ?? null,
      contactEmail: c.contact_email ?? null,
      isVerified: Boolean(c.is_verified),
      websiteVerified: Boolean(c.website_verified),
      emailVerified: Boolean(c.email_verified),
      status: c.status ?? 'active',
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    return ok({
      items: mapped,
      total: totalCount,
      page,
      limit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Şirketler listelenemedi';
    return apiError(message, 500);
  }
});

/**
 * PATCH /api/admin/companies
 * Updates company verification or status.
 */
export const PATCH = withAdmin(async (ctx, request) => {
  try {
    const body = (await parseJsonBody(request)) as {
      id: string;
      action: 'verify' | 'unverify' | 'suspend' | 'activate' | 'delete';
    };

    if (!body?.id || !body?.action) {
      return apiError('Geçersiz işlem parametreleri', 400);
    }

    const companyId = ids.company(body.id);
    let patchPayload: Record<string, unknown> = {};

    if (body.action === 'verify') {
      patchPayload = { is_verified: true, updated_at: new Date().toISOString() };
    } else if (body.action === 'unverify') {
      patchPayload = { is_verified: false, updated_at: new Date().toISOString() };
    } else if (body.action === 'suspend') {
      patchPayload = { status: 'suspended', updated_at: new Date().toISOString() };
    } else if (body.action === 'activate') {
      patchPayload = { status: 'active', updated_at: new Date().toISOString() };
    } else if (body.action === 'delete') {
      patchPayload = { deleted_at: new Date().toISOString(), status: 'deleted' };
    }

    try {
      const admin = createServiceRoleClient();
      await admin
        .from('marketplace_companies')
        .update(patchPayload)
        .eq('id', companyId);
    } catch {
      // fallback
    }

    if (ctx.container.companyRepository) {
      if (body.action === 'verify') {
        await ctx.container.companyRepository.update(companyId, { isVerified: true });
      } else if (body.action === 'unverify') {
        await ctx.container.companyRepository.update(companyId, { isVerified: false });
      } else if (body.action === 'suspend') {
        await ctx.container.companyRepository.update(companyId, { status: 'suspended' });
      } else if (body.action === 'activate') {
        await ctx.container.companyRepository.update(companyId, { status: 'active' });
      } else if (body.action === 'delete') {
        await ctx.container.companyRepository.delete(companyId);
      }
    }

    return ok({ success: true, action: body.action });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Şirket güncellenemedi';
    return apiError(message, 500);
  }
});
