/**
 * Contact-request local test fixture.
 *
 * Modes:
 *   other-listing  — Create a published listing owned by a different user
 *                    so YOU can open it and send an iletişim talebi.
 *   incoming       — Insert a pending request FROM another user onto YOUR listing
 *                    so "Gelen iletişim talepleri" shows a row.
 *
 * Usage:
 *   node scripts/seed-contact-request-test.mjs --mode=other-listing
 *   node scripts/seed-contact-request-test.mjs --mode=incoming
 *
 * Optional:
 *   --owner-email=you@example.com   (your account; default prefers zamanugurz@gmail.com)
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Does NOT wipe listings. Does NOT push migrations.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnv() {
  for (const rel of ['.env.local', '.env']) {
    const full = path.join(projectRoot, rel);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, 'utf8').split(/\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TEST_OTHER_EMAIL = 'contact-request-tester@girisimbee.local';
const TEST_OTHER_PASSWORD = 'TestContactRequest!234';
const TERMS_VERSION = 'contact-communication.v1';

function arg(name, fallback = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString();
}

async function listUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) throw error;
  return data?.users ?? [];
}

async function resolveMyUser(preferredEmail) {
  const users = await listUsers();
  const preferred =
    (preferredEmail && users.find((u) => u.email === preferredEmail)) ||
    users.find((u) => u.email === 'zamanugurz@gmail.com') ||
    users.find((u) => u.email === 'ugurzaman1907@gmail.com') ||
    users[0];
  if (!preferred) throw new Error('No auth.users found — önce kendi hesabınla kayıt ol.');
  return preferred;
}

async function ensureOtherUser(myId) {
  const users = await listUsers();
  let other = users.find((u) => u.email === TEST_OTHER_EMAIL);
  if (!other) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_OTHER_EMAIL,
      password: TEST_OTHER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        display_name: 'Test İlan Sahibi',
        first_name: 'Test',
        last_name: 'Satıcı',
      },
    });
    if (error) throw error;
    other = data.user;
    console.log('Created other user:', TEST_OTHER_EMAIL);
  } else {
    console.log('Using existing other user:', TEST_OTHER_EMAIL);
  }
  if (other.id === myId) {
    throw new Error('Other user id equals your id — pick another account.');
  }
  return other;
}

async function assertContactRequestsTable() {
  const { error } = await supabase
    .from('marketplace_listing_contact_requests')
    .select('id')
    .limit(1);
  if (error) {
    console.error('\n❌ marketplace_listing_contact_requests yok veya erişilemiyor.');
    console.error('   Mesaj:', error.message);
    console.error(
      '   Önce local migration zincirini uygula (20260810180000 + 20260810190000).',
    );
    console.error('   Production’a db push yapmadan önce onaylı migration planı kullan.\n');
    process.exit(1);
  }
}

async function pickTaxonomy() {
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('category_id, listing_type_id, module_key')
    .eq('status', 'published')
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle();
  if (listing?.category_id && listing?.listing_type_id) {
    return {
      category_id: listing.category_id,
      listing_type_id: listing.listing_type_id,
      module_key: listing.module_key ?? 'entrepreneurs',
    };
  }
  return {
    category_id: 'e1000001-0001-4000-8000-000000000001',
    listing_type_id: 'e1000001-0001-4000-8000-000000000001',
    module_key: 'entrepreneurs',
  };
}

async function createOtherOwnedListing(otherUser) {
  const tax = await pickTaxonomy();
  const id = randomUUID();
  const slug = `iletisim-test-${id.slice(0, 8)}`;
  const row = {
    id,
    slug,
    owner_id: otherUser.id,
    company_id: null,
    category_id: tax.category_id,
    listing_type_id: tax.listing_type_id,
    subcategory_id: null,
    module_key: tax.module_key,
    title: 'İletişim talebi test ilanı (başka kullanıcı)',
    short_description:
      'Bu ilan contact-request testleri için seed edildi. Sahiplik farklı kullanıcıda.',
    long_description:
      '## Test ilanı\n\nBu kaydı silmekte sakınca yok. İletişim talebi akışını denemek için oluşturuldu.',
    status: 'published',
    workflow_status: 'published',
    location: 'İstanbul, Kadıköy',
    city: 'İstanbul',
    district: 'Kadıköy',
    industry: 'Fintech',
    country: 'TR',
    remote_policy: 'hybrid',
    anonymous_mode: false,
    contact_phone: '+905321110000',
    contact_whatsapp: '+905321110000',
    contact_email: TEST_OTHER_EMAIL,
    custom_fields: { stage: 'MVP aşaması' },
    view_count: 12,
    interested_count: 0,
    application_count: 0,
    is_verified: false,
    is_featured: false,
    is_urgent: false,
    featured_until: null,
    urgent_until: null,
    published_at: new Date().toISOString(),
    expires_at: daysFromNow(60),
    rejected_reason: null,
    deleted_at: null,
  };

  const { error } = await supabase.from('marketplace_listings').insert(row);
  if (error) throw error;
  return row;
}

async function pickMyListing(myId) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('id, slug, title, owner_id')
    .eq('owner_id', myId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      'Senin yayınlanmış ilanın yok. Önce bir ilan yayınla veya --mode=other-listing kullan.',
    );
  }
  return data;
}

async function insertIncomingRequest({ listing, owner, requester }) {
  const now = new Date();
  const expires = new Date(now);
  expires.setUTCDate(expires.getUTCDate() + 14);

  // Drop previous active fixture from this requester+listing (idempotent re-run)
  await supabase
    .from('marketplace_listing_contact_requests')
    .delete()
    .eq('listing_id', listing.id)
    .eq('requester_user_id', requester.id)
    .in('status', ['pending', 'accepted']);

  const row = {
    id: randomUUID(),
    listing_id: listing.id,
    requester_user_id: requester.id,
    owner_user_id: owner.id,
    message: 'Merhaba, bu bir test iletişim talebidir. Kabul/red akışını deneyebilirsiniz.',
    status: 'pending',
    conversation_id: null,
    terms_version: TERMS_VERSION,
    terms_accepted_at: now.toISOString(),
    owner_terms_version: null,
    owner_terms_accepted_at: null,
    created_at: now.toISOString(),
    responded_at: null,
    accepted_at: null,
    rejected_at: null,
    cancelled_at: null,
    expires_at: expires.toISOString(),
  };

  const { error } = await supabase.from('marketplace_listing_contact_requests').insert(row);
  if (error) throw error;
  return row;
}

async function main() {
  const mode = arg('mode', 'other-listing');
  const ownerEmail = arg('owner-email', null);

  console.log('Mode:', mode);
  const me = await resolveMyUser(ownerEmail);
  console.log('Your user:', me.email, me.id);

  if (mode === 'other-listing') {
    const other = await ensureOtherUser(me.id);
    const listing = await createOtherOwnedListing(other);
    console.log('\n✅ Başka kullanıcıya ait test ilanı oluşturuldu.');
    console.log('   Owner :', other.email, other.id);
    console.log('   Title :', listing.title);
    console.log('   URL   :', `http://localhost:3000/ilan/${listing.slug}`);
    console.log('\nSen kendi hesabınla bu URL’yi aç → İletişim Talebi Gönder.');
    console.log('Diğer hesap (ilan sahibi) girişi için:');
    console.log('   email   :', TEST_OTHER_EMAIL);
    console.log('   password:', TEST_OTHER_PASSWORD);
    return;
  }

  if (mode === 'incoming') {
    await assertContactRequestsTable();
    const other = await ensureOtherUser(me.id);
    const listing = await pickMyListing(me.id);
    const request = await insertIncomingRequest({
      listing,
      owner: me,
      requester: other,
    });
    console.log('\n✅ Gelen test talebi eklendi.');
    console.log('   Listing:', listing.title);
    console.log('   URL    :', `http://localhost:3000/ilan/${listing.slug}`);
    console.log('   Request:', request.id, request.status);
    console.log('\nKendi hesabınla ilan sayfasını yenile → Gelen iletişim talepleri.');
    return;
  }

  console.error('Unknown --mode. Use other-listing | incoming');
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
