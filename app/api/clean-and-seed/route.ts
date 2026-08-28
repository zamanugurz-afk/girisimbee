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
  // 1. Clear all old listings and test data from Supabase
  const tablesToClear = [
    'contact_request_messages',
    'contact_requests',
    'chat_messages',
    'chat_conversations',
    'notifications',
    'ad_inquiries',
    'marketplace_listing_activities',
    'marketplace_listing_reviews',
    'marketplace_favorites',
    'marketplace_listings',
  ];

  const clearResults: Record<string, string> = {};
  for (const table of tablesToClear) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      clearResults[table] = error ? error.message : 'cleared';
    } catch (e) {
      clearResults[table] = e instanceof Error ? e.message : 'error';
    }
  }

  // 2. Resolve admin owner ID (preserve ugurzaman1907 and zamanugurz)
  let ownerId: string | null = null;
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
    const users = usersData?.users || [];
    for (const u of users) {
      const email = (u.email || '').toLowerCase().trim();
      if (PRESERVED_EMAILS.includes(email)) {
        if (!ownerId) ownerId = u.id;
      }
    }
  } catch (err) {
    console.warn('User check note:', err);
  }

  if (!ownerId) {
    ownerId = 'e1000001-0001-4000-8000-000000000001';
  }

  // 3. Load taxonomy (categories & listing types)
  const [{ data: categories }, { data: listingTypes }] = await Promise.all([
    supabase.from('marketplace_categories').select('id, slug, name'),
    supabase.from('marketplace_listing_types').select('id, slug, name, category_id'),
  ]);

  const cats = categories || [];
  const types = listingTypes || [];

  // 4. Build rich rows from CURATED_LISTING_TEMPLATES
  const rows = [];
  let index = 1;
  for (const template of CURATED_LISTING_TEMPLATES) {
    let cat = cats.find((c) => c.slug === template.categorySlug);
    if (!cat) {
      if (template.categorySlug === 'isletme-devri') {
        cat = cats.find((c) => c.slug.includes('devir') || c.name.toLowerCase().includes('devir')) || cats[0];
      } else if (template.categorySlug === 'franchise') {
        cat = cats.find((c) => c.slug.includes('franchise') || c.slug.includes('bayilik')) || cats[0];
      } else if (template.categorySlug === 'ortak-bul') {
        cat = cats.find((c) => c.slug.includes('ortak')) || cats[0];
      } else if (template.categorySlug === 'is-bul') {
        cat = cats.find((c) => c.slug === 'is-bul' || c.slug === 'is-ariyorum' || c.slug === 'is') || cats[0];
      } else if (template.categorySlug === 'ise-al') {
        cat = cats.find((c) => c.slug === 'ise-al' || c.slug === 'ise-aliyorum') || cats[0];
      } else {
        cat = cats[0];
      }
    }

    const catId = cat?.id || 'e1000001-0001-4000-8000-000000000002';
    const type = types.find((t) => t.category_id === catId) || types[0];
    const typeId = type?.id || 'e1000001-0001-4000-8000-000000000003';

    const customFields = template.customFields || {};
    const phone = customFields.contactPhone || `+90532100${String(index).padStart(4, '0')}`;

    rows.push({
      id: randomUUID(),
      slug: slugify(template.title, index),
      owner_id: ownerId,
      company_id: null,
      category_id: catId,
      listing_type_id: typeId,
      subcategory_id: null,
      module_key: template.categorySlug === 'is-bul' ? 'candidates' : template.categorySlug === 'ise-al' ? 'employers' : template.categorySlug === 'ortak-bul' ? 'founders' : template.categorySlug === 'franchise' ? 'franchise' : 'general',
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
      view_count: 85 + index * 17,
      interested_count: 3 + (index % 11),
      application_count: 1 + (index % 7),
      is_verified: index % 2 === 0,
      is_featured: true,
      is_urgent: index % 6 === 0,
      featured_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      urgent_until: index % 6 === 0 ? new Date(Date.now() + 7 * 86400000).toISOString() : null,
      published_at: new Date(Date.now() - (index % 12) * 86400000).toISOString(),
      expires_at: new Date(Date.now() + 60 * 86400000).toISOString(),
      rejected_reason: null,
      deleted_at: null,
    });
    index += 1;
  }

  // 5. Insert rows in chunks
  for (let i = 0; i < rows.length; i += 10) {
    const chunk = rows.slice(i, i + 10);
    const { error: insertErr } = await supabase.from('marketplace_listings').insert(chunk);
    if (insertErr) {
      console.error('Insert error in chunk:', insertErr);
    }
  }

  // 6. Seed sample market ads
  try {
    await supabase.from('ad_inquiries').insert([
      {
        id: randomUUID(),
        owner_id: ownerId,
        full_name: 'Uğur Zaman',
        email: 'ugurzaman1907@gmail.com',
        phone: '+905321234567',
        company: 'BeeTech AI & Cloud Çözümleri',
        title: 'B2B SaaS ve Yapay Zekâ Otomasyon Platformu',
        description: 'İşletmenizin müşteri hizmetlerini ve satış süreçlerini yapay zekâ asistanlarımızla 7/24 otomatikleştirin.',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        link_url: 'https://girisimbee.com',
        cta_label: 'Hemen İncele',
        status: 'approved',
        created_at: new Date().toISOString(),
      },
    ]);
  } catch {
    // ignore
  }

  return {
    success: true,
    totalSeeded: rows.length,
    clearResults,
    preservedEmails: PRESERVED_EMAILS,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  if (secret !== 'girisimbee-clean-2026' && secret !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized. Use ?secret=girisimbee-clean-2026' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
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
