import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { CURATED_LISTING_TEMPLATES } from '@/features/listings/mock/curated-seed-listings';
import { randomUUID } from 'node:crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PRESERVED_EMAILS = [
  'ugurzaman1907@gmail.com',
  'zamanugurz@gmail.com',
];

function slugify(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${base || 'ilan'}-${index}`;
}

async function performCleanAndSeed(supabase: ReturnType<typeof createServiceRoleClient>) {
  const now = new Date().toISOString();

  // 1. Resolve a valid owner_id from existing listings or auth.users
  let ownerId: string | null = null;
  try {
    const { data: existingRows } = await supabase
      .from('marketplace_listings')
      .select('owner_id')
      .not('owner_id', 'is', null)
      .limit(1);
    if (existingRows?.[0]?.owner_id) {
      ownerId = existingRows[0].owner_id;
    }
  } catch {
    // ignore
  }

  if (!ownerId) {
    try {
      const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 50 });
      const users = usersData?.users || [];
      const preferred =
        users.find((u) => PRESERVED_EMAILS.includes((u.email || '').toLowerCase().trim())) ||
        users[0];
      if (preferred) ownerId = preferred.id;
    } catch (err) {
      console.warn('Auth admin listUsers error:', err);
    }
  }

  if (!ownerId) {
    return {
      success: false,
      error: 'Could not resolve a valid owner_id from auth.users or marketplace_listings',
    };
  }

  // 2. Soft-delete / Archive ALL existing test listings so they NEVER appear in active feed
  let archivedCount = 0;
  let archiveError = null;
  try {
    const { data: updated, error: updErr } = await supabase
      .from('marketplace_listings')
      .update({
        status: 'archived',
        workflow_status: 'archived',
        deleted_at: now,
        is_featured: false,
        is_urgent: false,
      })
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');

    if (updErr) {
      archiveError = updErr.message;
    } else {
      archivedCount = updated?.length || 0;
    }
  } catch (err) {
    archiveError = err instanceof Error ? err.message : String(err);
  }

  // 3. Purge all test messages, conversations, participants, contact requests, and applications
  try {
    await supabase
      .from('marketplace_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    await supabase
      .from('marketplace_conversation_participants')
      .delete()
      .neq('conversation_id', '00000000-0000-0000-0000-000000000000');

    await supabase
      .from('marketplace_conversations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    await supabase
      .from('marketplace_contact_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    await supabase
      .from('marketplace_job_applications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    await supabase
      .from('marketplace_applications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (err) {
    console.warn('Error clearing messaging records:', err);
  }

  // 4. Clear favorites
  try {
    await supabase.from('marketplace_favorites').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch {
    // ignore
  }

  // 4. Load taxonomy (categories & listing types)
  // 3. Ensure core taxonomy exists in Supabase
  const coreCategories = [
    { id: 'c1000001-0001-4000-8000-000000000001', slug: 'yatirim', name: 'Yatırım' },
    { id: 'c1000001-0001-4000-8000-000000000002', slug: 'is', name: 'İş ve Kariyer' },
    { id: 'c1000001-0001-4000-8000-000000000003', slug: 'ortaklik', name: 'Ortaklık ve Girişim' },
    { id: 'c1000001-0001-4000-8000-000000000006', slug: 'franchise', name: 'Franchise ve Bayilik' },
    { id: 'c1000001-0001-4000-8000-000000000008', slug: 'dijital-ai', name: 'Dijital ve AI Çözümleri' },
    { id: 'c1000001-0001-4000-8000-000000000009', slug: 'isletme-devri', name: 'İşletme Devri' },
    { id: 'c1000001-0001-4000-8000-000000000010', slug: 'hizmetler', name: 'Ustalar ve Hizmetler' },
    { id: 'e1000001-0001-4000-8000-000000000001', slug: 'yatirim-legacy', name: 'Yatırım Legacy' },
    { id: 'e1000001-0001-4000-8000-000000000002', slug: 'is-legacy', name: 'İş Legacy' },
    { id: 'e1000001-0001-4000-8000-000000000003', slug: 'ortaklik-legacy', name: 'Ortaklık Legacy' },
  ];

  const coreListingTypes = [
    { id: 'e1000001-0001-4000-8000-000000000001', category_id: 'c1000001-0001-4000-8000-000000000001', slug: 'yatirim-ariyorum', name: 'Yatırım Arıyorum' },
    { id: 'e1000001-0001-4000-8000-000000000002', category_id: 'c1000001-0001-4000-8000-000000000001', slug: 'yatirim-yapiyorum', name: 'Yatırım Yapıyorum' },
    { id: 'e1000001-0001-4000-8000-000000000003', category_id: 'c1000001-0001-4000-8000-000000000002', slug: 'is-ariyorum', name: 'İş Arıyorum' },
    { id: 'e1000001-0001-4000-8000-000000000004', category_id: 'c1000001-0001-4000-8000-000000000002', slug: 'ise-aliyorum', name: 'İşe Alıyorum' },
    { id: 'e1000001-0001-4000-8000-000000000005', category_id: 'c1000001-0001-4000-8000-000000000003', slug: 'ortak-ariyorum', name: 'Ortak Arıyorum' },
    { id: 'a0000006-0001-4000-8000-000000000006', category_id: 'c1000001-0001-4000-8000-000000000006', slug: 'bayilik-al', name: 'Bayilik Al' },
    { id: 'a0000007-0001-4000-8000-000000000007', category_id: 'c1000001-0001-4000-8000-000000000006', slug: 'bayilik-ver', name: 'Bayilik Ver' },
    { id: 'd1000001-0001-4000-8000-000000000008', category_id: 'c1000001-0001-4000-8000-000000000008', slug: 'dijital-ai-cozum', name: 'Dijital ve AI Çözüm' },
    { id: 'a0000009-0001-4000-8000-000000000009', category_id: 'c1000001-0001-4000-8000-000000000009', slug: 'business-transfer-sell', name: 'İşletme Devret' },
    { id: 'a0000010-0001-4000-8000-000000000010', category_id: 'c1000001-0001-4000-8000-000000000009', slug: 'business-transfer-buy', name: 'İşletme Devral' },
    { id: 'a0000011-0001-4000-8000-000000000011', category_id: 'c1000001-0001-4000-8000-000000000010', slug: 'hizmet-ver', name: 'Hizmet Ver' },
  ];

  try {
    await supabase.from('marketplace_categories').upsert(coreCategories, { onConflict: 'id' });
    await supabase.from('marketplace_listing_types').upsert(coreListingTypes, { onConflict: 'id' });
  } catch (taxErr) {
    console.warn('Taxonomy upsert notice:', taxErr);
  }

  // 4. Load taxonomy
  const [{ data: categories }, { data: listingTypes }] = await Promise.all([
    supabase.from('marketplace_categories').select('id, slug, name'),
    supabase.from('marketplace_listing_types').select('id, slug, name, category_id'),
  ]);

  const cats = categories?.length ? categories : coreCategories;
  const types = listingTypes?.length ? listingTypes : coreListingTypes;

  // 5. Build rich rows from CURATED_LISTING_TEMPLATES
  const rows = [];
  let index = 1;
  for (const template of CURATED_LISTING_TEMPLATES) {
    let cat = cats.find((c) => c.slug === template.categorySlug);
    if (!cat) {
      if (template.categorySlug === 'is-bul' || template.categorySlug === 'ise-al') {
        cat = cats.find((c) => c.slug === 'is' || c.slug === 'kariyer' || c.slug === 'is-kariyer' || c.id === 'c1000001-0001-4000-8000-000000000002') || cats[0];
      } else if (template.categorySlug === 'ortak-bul') {
        cat = cats.find((c) => c.slug === 'ortaklik' || c.slug === 'girisim-ortaklik' || c.id === 'c1000001-0001-4000-8000-000000000003') || cats[0];
      } else if (template.categorySlug === 'dijital-ai') {
        cat = cats.find((c) => c.slug === 'dijital-ai' || c.slug === 'digital-ai' || c.id === 'c1000001-0001-4000-8000-000000000008') || cats[0];
      } else if (template.categorySlug === 'isletme-devri') {
        cat = cats.find((c) => c.slug === 'isletme-devri' || c.slug === 'devir' || c.id === 'c1000001-0001-4000-8000-000000000009') || cats[0];
      } else if (template.categorySlug === 'franchise') {
        cat = cats.find((c) => c.slug === 'franchise' || c.slug === 'bayilik' || c.id === 'c1000001-0001-4000-8000-000000000006') || cats[0];
      } else if (template.categorySlug === 'hizmetler') {
        cat = cats.find((c) => c.slug === 'hizmetler' || c.slug === 'hizmet' || c.slug === 'esnaf' || c.id === 'c1000001-0001-4000-8000-000000000010') || cats[0];
      } else {
        cat = cats[0];
      }
    }
    const catId = cat.id;

    const catTypes = types.filter((t) => t.category_id === catId);
    let type = catTypes[0];
    if (template.categorySlug === 'is-bul') {
      type = catTypes.find((t) => t.slug.includes('ariyorum') || t.slug.includes('bul') || t.slug.includes('seek')) || type;
    } else if (template.categorySlug === 'ise-al') {
      type = catTypes.find((t) => t.slug.includes('aliyorum') || t.slug.includes('al') || t.slug.includes('hire')) || type;
    } else if (template.categorySlug === 'dijital-ai') {
      type = catTypes.find((t) => t.slug.includes('dijital') || t.slug.includes('ai')) || type;
    } else if (template.categorySlug === 'isletme-devri') {
      type = catTypes.find((t) => t.slug.includes('devret') || t.slug.includes('sell')) || type;
    } else if (template.categorySlug === 'franchise') {
      type = catTypes.find((t) => t.slug.includes('ver') || t.slug.includes('franchise')) || type;
    } else if (template.categorySlug === 'hizmetler') {
      type = catTypes.find((t) => t.slug.includes('hizmet') || t.slug.includes('esnaf')) || type;
    }
    const typeId = type ? type.id : null;

    const customFields = (template.customFields as Record<string, any>) || {};
    const phone = customFields.contactPhone || `+90532100${String(index).padStart(4, '0')}`;

    // Valid Postgres enum values for marketplace_module_key: 'founders' | 'employers' | 'candidates' | 'franchise' | null
    let moduleKey: string | null = null;
    if (template.categorySlug === 'is-bul') moduleKey = 'candidates';
    else if (template.categorySlug === 'ise-al') moduleKey = 'employers';
    else if (template.categorySlug === 'ortak-bul') moduleKey = 'founders';
    else if (template.categorySlug === 'franchise') moduleKey = 'franchise';

    rows.push({
      id: randomUUID(),
      slug: slugify(template.title, index),
      owner_id: ownerId,
      company_id: null,
      category_id: catId,
      listing_type_id: typeId,
      subcategory_id: null,
      module_key: moduleKey,
      title: template.title.slice(0, 200),
      short_description: template.shortDescription.slice(0, 500),
      long_description: template.longDescription,
      status: 'published',
      workflow_status: 'published',
      location: `${template.city}, ${template.district}`,
      city: template.city,
      district: template.district,
      industry: template.industry,
      country: 'TR',
      remote_policy: template.remotePolicy,
      anonymous_mode: template.categorySlug === 'is-bul',
      contact_phone: phone,
      contact_whatsapp: phone,
      contact_email: `ilan${index}@girisimbee.example`,
      contact_website: null,
      custom_fields: customFields,
      cover_url: (template as any).imageUrl || null,
      view_count: 120 + index * 17,
      interested_count: 5 + (index % 11),
      application_count: 2 + (index % 7),
      is_verified: true,
      is_featured: true,
      is_urgent: index % 6 === 0,
      featured_until: new Date(Date.now() + 60 * 86400000).toISOString(),
      urgent_until: index % 6 === 0 ? new Date(Date.now() + 14 * 86400000).toISOString() : null,
      published_at: new Date(Date.now() - (index % 10) * 86400000).toISOString(),
      expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
      rejected_reason: null,
      deleted_at: null,
    });
    index += 1;
  }

  // 6. Insert new curated rows one by one
  let insertedCount = 0;
  const insertErrors: Array<{ index: number; title: string; catId: string; typeId: string; error: string }> = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { data: inserted, error: insertErr } = await supabase.from('marketplace_listings').insert(row).select('id');
    if (insertErr) {
      insertErrors.push({
        index: i + 1,
        title: row.title,
        catId: row.category_id,
        typeId: row.listing_type_id,
        error: insertErr.message,
      });
    } else {
      insertedCount += inserted?.length || 0;
    }
  }

  return {
    success: true,
    archivedCount,
    insertedCount,
    archiveError,
    insertErrors,
    preservedEmails: PRESERVED_EMAILS,
    insertedSlugs: rows.map((r) => r.slug),
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  if (secret !== 'girisimbee-clean-2026' && secret !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Use ?secret=girisimbee-clean-2026' }, { status: 401 });
  }

  const action = url.searchParams.get('action');

  try {
    const supabase = createServiceRoleClient();
    if (action === 'categories') {
      const [{ data: categories }, { data: listingTypes }] = await Promise.all([
        supabase.from('marketplace_categories').select('id, slug, name'),
        supabase.from('marketplace_listing_types').select('id, slug, name, category_id'),
      ]);
      return NextResponse.json({ categories, listingTypes });
    }

    if (action === 'list') {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('id, slug, title, status, category_id, listing_type_id, module_key')
        .eq('status', 'published')
        .order('created_at', { ascending: true });
      return NextResponse.json({ count: data?.length ?? 0, error: error?.message ?? null, listings: data });
    }

    const result = await performCleanAndSeed(supabase);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Clean and seed failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServiceRoleClient();
    const result = await performCleanAndSeed(supabase);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Clean and seed failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
