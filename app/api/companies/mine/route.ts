import { withAuth, parseJsonBody } from '@/lib/api/with-auth';
import { ok, created } from '@/lib/api/response';
import { createClient } from '@/lib/supabase/server';
import { suggestCompanySlug } from '@/features/companies/validation/company-editor.schema';

export const GET = withAuth(async (ctx) => {
  const supabase = createClient();

  // 1. Check existing companies
  const { data: existingCompanies, error: cErr } = await supabase
    .from('marketplace_companies')
    .select('*')
    .eq('owner_id', ctx.userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (!cErr && existingCompanies && existingCompanies.length > 0) {
    const mapped = existingCompanies.map((c: any) => ({
      id: c.id,
      ownerId: c.owner_id,
      name: c.name,
      slug: c.slug,
      logoUrl: c.logo_url,
      coverUrl: c.cover_url,
      description: c.description,
      industry: c.industry,
      employeeCount: c.employee_count,
      city: c.city,
      country: c.country,
      contactEmail: c.contact_email,
      website: c.website,
      isVerified: c.is_verified,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
    return ok({ companies: mapped });
  }

  // 2. Auto-recover company from user's published listings (e.g. Martı, Napolyon)
  const { data: userListings } = await supabase
    .from('marketplace_listings')
    .select('id, title, city, custom_fields, created_at')
    .eq('owner_id', ctx.userId)
    .order('created_at', { ascending: false });

  const jobListingWithCompany = (userListings || []).find(
    (l: any) => l.custom_fields?.companyName || l.custom_fields?.businessName,
  );

  if (jobListingWithCompany) {
    const rawName = String(
      jobListingWithCompany.custom_fields?.companyName ||
      jobListingWithCompany.custom_fields?.businessName || '',
    ).trim();

    if (rawName) {
      const companyId = crypto.randomUUID();
      const slug = suggestCompanySlug(rawName);
      const industry = String(
        jobListingWithCompany.custom_fields?.primarySector ||
        jobListingWithCompany.custom_fields?.sector ||
        'Hizmet & Ticaret',
      );
      const city = jobListingWithCompany.city || 'İstanbul';
      const email = ctx.user?.email || null;

      const newCompanyRow = {
        id: companyId,
        owner_id: ctx.userId,
        name: rawName,
        slug,
        industry,
        city,
        country: 'TR',
        status: 'active',
        contact_email: email,
        description: `${rawName} kurumsal iş yeri profili.`,
      };

      const { data: inserted, error: iErr } = await supabase
        .from('marketplace_companies')
        .insert(newCompanyRow)
        .select('*')
        .single();

      if (!iErr && inserted) {
        // Also register ownership in members table
        await supabase
          .from('marketplace_company_members')
          .insert({
            company_id: companyId,
            user_id: ctx.userId,
            role: 'owner',
          })
          .catch(() => undefined);

        return ok({
          companies: [
            {
              id: inserted.id,
              ownerId: inserted.owner_id,
              name: inserted.name,
              slug: inserted.slug,
              logoUrl: inserted.logo_url,
              coverUrl: inserted.cover_url,
              description: inserted.description,
              industry: inserted.industry,
              city: inserted.city,
              country: inserted.country,
              contactEmail: inserted.contact_email,
              status: inserted.status,
              createdAt: inserted.created_at,
              updatedAt: inserted.updated_at,
            },
          ],
        });
      }
    }
  }

  return ok({ companies: [] });
});

export const POST = withAuth(async (ctx, request) => {
  const body = await parseJsonBody(request);
  const name = String(body.name || '').trim();
  if (!name) {
    throw new Error('Şirket adı zorunludur.');
  }

  const supabase = createClient();
  const slug = (body.slug ? String(body.slug) : suggestCompanySlug(name)).toLowerCase().trim();

  const { count } = await supabase
    .from('marketplace_companies')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)
    .is('deleted_at', null);

  if ((count ?? 0) > 0) {
    throw new Error('Bu kullanıcı adı (slug) zaten alınmış.');
  }

  const companyId = crypto.randomUUID();
  const newRow = {
    id: companyId,
    owner_id: ctx.userId,
    name,
    slug,
    logo_url: body.logoUrl || null,
    cover_url: body.coverUrl || null,
    description: body.description || null,
    industry: body.industry || null,
    employee_count: body.employeeCount || null,
    founded_year: body.foundedYear ? Number(body.foundedYear) : null,
    website: body.website || null,
    linkedin_url: body.linkedInUrl || null,
    twitter_url: body.twitterUrl || null,
    city: body.city || null,
    location: body.location || null,
    country: body.country || 'TR',
    contact_email: body.contactEmail || ctx.user?.email || null,
    status: 'active',
  };

  const { data: createdCompany, error: createErr } = await supabase
    .from('marketplace_companies')
    .insert(newRow)
    .select('*')
    .single();

  if (createErr || !createdCompany) {
    throw new Error(createErr?.message || 'Şirket oluşturulamadı.');
  }

  await supabase
    .from('marketplace_company_members')
    .insert({
      company_id: companyId,
      user_id: ctx.userId,
      role: 'owner',
    })
    .catch(() => undefined);

  return created({
    company: {
      id: createdCompany.id,
      ownerId: createdCompany.owner_id,
      name: createdCompany.name,
      slug: createdCompany.slug,
      logoUrl: createdCompany.logo_url,
      coverUrl: createdCompany.cover_url,
      description: createdCompany.description,
      industry: createdCompany.industry,
      city: createdCompany.city,
      country: createdCompany.country,
      contactEmail: createdCompany.contact_email,
      status: createdCompany.status,
      createdAt: createdCompany.created_at,
      updatedAt: createdCompany.updated_at,
    },
  });
});
