import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

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
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Exact DB Categories
const DB_CATEGORIES = {
  yatirim: 'e1000001-0001-4000-8000-000000000001',
  is: 'e1000001-0001-4000-8000-000000000002',
  ortaklik: 'e1000001-0001-4000-8000-000000000003',
  franchise: 'c1000001-0001-4000-8000-000000000006',
  dijitalAi: 'c1000001-0001-4000-8000-000000000008',
};

// Exact DB Listing Types
const DB_LISTING_TYPES = {
  yatirimAriyorum: 'e1000001-0001-4000-8000-000000000001',
  yatirimYapiyorum: 'e1000001-0001-4000-8000-000000000002',
  isAriyorum: 'e1000001-0001-4000-8000-000000000003',
  iseAliyorum: 'e1000001-0001-4000-8000-000000000004',
  ortakAriyorum: 'e1000001-0001-4000-8000-000000000005',
  bayilikAl: 'a0000006-0001-4000-8000-000000000006',
  bayilikVer: 'a0000007-0001-4000-8000-000000000007',
  dijitalAiCozum: 'd1000001-0001-4000-8000-000000000008',
};

function slugify(title, idx) {
  const trMap = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u' };
  const cleaned = title
    .toLowerCase()
    .split('')
    .map((c) => trMap[c] || c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${cleaned}-${idx}-${Date.now().toString(36).slice(-4)}`;
}

async function resolveUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) throw error;

  let targetUser = data.users.find((u) => u.email === 'zamanugurz@gmail.com');
  if (!targetUser) {
    console.log('User zamanugurz@gmail.com not found, using first user...');
    targetUser = data.users[0];
  }

  const otherUsers = data.users.filter((u) => u.id !== targetUser?.id);
  const counterpartUserId = otherUsers.length > 0 ? otherUsers[0].id : targetUser.id;

  return {
    targetUserId: targetUser.id,
    targetEmail: targetUser.email,
    counterpartUserId,
  };
}

async function wipeAllListings() {
  console.log('Deleting old marketplace_listings...');
  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.warn('Wipe warning:', error.message);
  }
}

function makeRow(data, idx) {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    slug: slugify(data.title, idx),
    owner_id: data.owner_id,
    company_id: null,
    category_id: data.category_id,
    listing_type_id: data.listing_type_id,
    subcategory_id: null,
    module_key: data.module_key ?? null,
    title: data.title,
    short_description: data.short_description,
    long_description: data.long_description,
    status: 'published',
    workflow_status: 'published',
    location: data.location || `${data.city || 'İstanbul'}, Türkiye`,
    city: data.city || 'İstanbul',
    district: data.district || null,
    industry: data.industry || null,
    country: 'TR',
    remote_policy: data.remote_policy || null,
    anonymous_mode: false,
    custom_fields: data.custom_fields || {},
    view_count: data.view_count ?? 85,
    interested_count: data.interested_count ?? 6,
    application_count: data.application_count ?? 2,
    is_verified: data.is_verified ?? true,
    is_featured: data.is_featured ?? false,
    is_urgent: false,
    expires_at: data.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: now,
    created_at: now,
    updated_at: now,
  };
}

async function seedData() {
  const { targetUserId, targetEmail, counterpartUserId } = await resolveUsers();
  console.log(`Target User: ${targetEmail} (${targetUserId})`);
  console.log(`Counterpart Owner ID: ${counterpartUserId}`);

  await wipeAllListings();

  const rows = [];
  let index = 1;

  // ==========================================
  // 1. TARGET USER'S 5 ACTIVE LISTINGS
  // ==========================================

  // (1) Career: Job Seeker (Senior Full Stack Developer)
  rows.push(
    makeRow(
      {
        owner_id: targetUserId,
        category_id: DB_CATEGORIES.is,
        listing_type_id: DB_LISTING_TYPES.isAriyorum,
        module_key: 'candidates',
        title: 'Kıdemli Full Stack Developer (React & Node.js)',
        short_description: '6+ yıl deneyimli Full Stack geliştirici. Modern React, Next.js, Node.js ve cloud mimarilerinde uzman.',
        long_description: 'Fintech ve SaaS alanında ölçeklenebilir web uygulamaları geliştirme deneyimine sahibim. Hibrit veya uzaktan çalışabilecek yenilikçi girişimler arıyorum.',
        location: 'Kadıköy, İstanbul Anadolu',
        city: 'İstanbul Anadolu',
        district: 'Kadıköy',
        industry: 'Yazılım',
        custom_fields: {
          desiredRole: 'Yazılım Geliştirici',
          positionTitle: 'Yazılım Geliştirici',
          primarySector: 'Yazılım',
          experienceLevel: 'senior',
          workplacePreference: 'hybrid',
          professionalSkills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'TailwindCSS'],
          salary: '75.000 - 100.000 TL',
        },
        view_count: 142,
        interested_count: 12,
        application_count: 4,
        is_featured: true,
      },
      index++
    )
  );

  // (2) Career: Job Hiring (B2B SaaS Satış Uzmanı)
  rows.push(
    makeRow(
      {
        owner_id: targetUserId,
        category_id: DB_CATEGORIES.is,
        listing_type_id: DB_LISTING_TYPES.iseAliyorum,
        module_key: 'employers',
        title: 'B2B SaaS Girişimimiz için Satış Uzmanı',
        short_description: 'Büyüyen B2B SaaS ürünümüz için kurumsal müşteri portföyünü yönetecek ve satış süreçlerini yönetecek Satış Uzmanı arıyoruz.',
        long_description: 'Yenilikçi ürünümüzü KOBİ ve kurumsal şirketlere sunacak, CRM yönetimi ve sunum becerileri güçlü satış profesyonelleri arıyoruz.',
        location: 'Ataşehir, İstanbul Anadolu',
        city: 'İstanbul Anadolu',
        district: 'Ataşehir',
        industry: 'Teknoloji',
        custom_fields: {
          desiredRole: 'Satış Uzmanı',
          positionTitle: 'Satış Uzmanı',
          primarySector: 'Teknoloji',
          experienceLevel: 'mid',
          workplacePreference: 'hybrid',
          professionalSkills: ['B2B Satış', 'CRM', 'Müşteri İlişkileri', 'İkna', 'Sunum'],
          salary: '45.000 - 65.000 TL',
        },
        view_count: 98,
        interested_count: 8,
        application_count: 3,
        is_featured: true,
      },
      index++
    )
  );

  // (3) Partnership: Seeking Partner (Fintech AI Startup)
  rows.push(
    makeRow(
      {
        owner_id: targetUserId,
        category_id: DB_CATEGORIES.ortaklik,
        listing_type_id: DB_LISTING_TYPES.ortakAriyorum,
        module_key: 'founders',
        title: 'Fintech AI Girişimimiz için Büyüme & Pazarlama Kurucu Ortağı',
        short_description: 'MVP aşamasını tamamlayan fintech girişimimize kullanıcı kazanımı ve pazarlama süreçlerine liderlik edecek kurucu ortak arıyoruz.',
        long_description: 'Ürünümüz hazır ve ilk beta kullanıcılarıyla test ediliyor. Büyüme, performans pazarlaması ve B2B satış konusunda tam zamanlı katkı verecek bir ortak arayışındayız.',
        location: 'Beşiktaş, İstanbul',
        city: 'İstanbul',
        district: 'Beşiktaş',
        industry: 'Fintech',
        custom_fields: {
          partnershipIntent: 'seeking',
          stage: 'MVP',
          partnershipType: 'Kurucu Ortak',
          commitment: 'Tam zamanlı',
          skills: ['Pazarlama', 'Büyüme', 'B2B Satış', 'Dijital Pazarlama'],
          sectors: ['Fintech', 'Yapay Zeka'],
          equity: 15,
        },
        view_count: 215,
        interested_count: 19,
        application_count: 7,
        is_featured: true,
      },
      index++
    )
  );

  // (4) Digital & AI: Solution Provider (Restaurant AI CRM SaaS)
  rows.push(
    makeRow(
      {
        owner_id: targetUserId,
        category_id: DB_CATEGORIES.dijitalAi,
        listing_type_id: DB_LISTING_TYPES.dijitalAiCozum,
        module_key: null,
        title: 'Restoran & Cafe AI Müşteri Yönetim ve Sadakat Platformu',
        short_description: 'Restoran ve cafeler için sipariş analizleri, akıllı rezervasyon ve yapay zeka destekli müşteri sadakat otomasyonu.',
        long_description: 'KOBİ ölçeğindeki yeme-içme işletmelerine özel tasarlanmış bulut tabanlı CRM ve iş akışı otomasyonu yazılımı.',
        location: 'Şişli, İstanbul',
        city: 'İstanbul',
        district: 'Şişli',
        industry: 'Gıda & İçecek',
        custom_fields: {
          solutionType: 'SaaS ürünü',
          deliveryModel: 'Abonelik (SaaS)',
          targetAudience: 'KOBİ',
          capabilities: ['CRM', 'İş Akışı Otomasyonu', 'Analitik & Raporlama', 'Müşteri Yönetimi'],
          priceRange: '20.000 - 50.000 TL',
          industry: 'Gıda & İçecek',
          supportedLanguages: ['Türkçe', 'İngilizce'],
          demoUrl: 'https://demo.girisimbee.com/restaurant-ai',
        },
        view_count: 310,
        interested_count: 24,
        application_count: 9,
        is_featured: true,
      },
      index++
    )
  );

  // (5) Franchise: Giving Opportunity (GirişimBee Express Coffee)
  rows.push(
    makeRow(
      {
        owner_id: targetUserId,
        category_id: DB_CATEGORIES.franchise,
        listing_type_id: DB_LISTING_TYPES.bayilikVer,
        module_key: 'franchise',
        title: 'GirişimBee Express Kahve & Bakery Franchise Bayiliği',
        short_description: 'Yüksek kârlılık oranına sahip, konsept tasarımı ve tedarik zinciri hazır 3. nesil kahve & bakery franchise fırsatı.',
        long_description: 'Anahtar teslim kurulum, merkezi barista eğitimi ve lokasyon analiz desteği sunan, geri dönüş süresi 12-18 ay olan franchise modeli.',
        location: 'Kadıköy, İstanbul',
        city: 'İstanbul',
        district: 'Kadıköy',
        industry: 'Gıda & İçecek',
        custom_fields: {
          companyName: 'GirişimBee Express Ltd.',
          sector: 'Gıda & İçecek',
          businessCategory: 'Cafe & Restoran',
          totalInvestment: 1500000,
          availableCities: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'],
          experienceRequirement: '1-3 yıl işletme deneyimi',
          streetStoreAvailable: true,
          mallAvailable: true,
          royaltyFee: '%4',
          storeSize: '50-100 m²',
          setupDuration: '3-4 Hafta',
          paybackPeriod: '12-18 Ay',
        },
        view_count: 512,
        interested_count: 38,
        application_count: 14,
        is_featured: true,
      },
      index++
    )
  );

  // =======================================================
  // 2. COUNTERPART & MARKETPLACE MATCHING LISTINGS (OTHER OWNERS)
  // =======================================================

  // A. Career Counterpart 1 (High Match Employer for target's Dev profile): %90+ Match
  rows.push(
    makeRow(
      {
        owner_id: counterpartUserId,
        category_id: DB_CATEGORIES.is,
        listing_type_id: DB_LISTING_TYPES.iseAliyorum,
        module_key: 'employers',
        title: 'Nova Teknoloji — Senior Full Stack Developer (React & Node)',
        short_description: 'Fintech ürünlerimizin mimarisine güç katacak Kıdemli Full Stack Geliştirici arıyoruz.',
        long_description: 'Mikroservis mimarisinde çalışan, TypeScript, React ve Node.js ekosistemine hakim takım arkadaşı arayışımız bulunmaktadır.',
        location: 'Kadıköy, İstanbul Anadolu',
        city: 'İstanbul Anadolu',
        district: 'Kadıköy',
        industry: 'Yazılım',
        custom_fields: {
          desiredRole: 'Yazılım Geliştirici',
          positionTitle: 'Yazılım Geliştirici',
          primarySector: 'Yazılım',
          experienceLevel: 'senior',
          workplacePreference: 'hybrid',
          professionalSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
          salary: '80.000 - 100.000 TL',
        },
      },
      index++
    )
  );

  // B. Career Counterpart 2 (High Match Candidate for target's Sales Hiring listing): %88+ Match
  rows.push(
    makeRow(
      {
        owner_id: counterpartUserId,
        category_id: DB_CATEGORIES.is,
        listing_type_id: DB_LISTING_TYPES.isAriyorum,
        module_key: 'candidates',
        title: 'Deneyimli B2B SaaS & Teknoloji Satış Uzmanı',
        short_description: '4 yıl kurumsal SaaS satış deneyimi, CRM ve pipeline yönetimi konusunda uzman satış profesyoneli.',
        long_description: 'İstanbul Anadolu yakasında veya hibrit modelde çalışabilecek, hedef odaklı teknoloji girişimlerinde rol arıyorum.',
        location: 'Ataşehir, İstanbul Anadolu',
        city: 'İstanbul Anadolu',
        district: 'Ataşehir',
        industry: 'Teknoloji',
        custom_fields: {
          desiredRole: 'Satış Uzmanı',
          positionTitle: 'Satış Uzmanı',
          primarySector: 'Teknoloji',
          experienceLevel: 'mid',
          workplacePreference: 'hybrid',
          professionalSkills: ['B2B Satış', 'CRM', 'Müşteri İlişkileri', 'İkna', 'Sunum'],
          salary: '50.000 - 65.000 TL',
        },
      },
      index++
    )
  );

  // C. Partnership Counterpart 1 (High Match Partner for target's Fintech AI Startup): %88+ Match
  rows.push(
    makeRow(
      {
        owner_id: counterpartUserId,
        category_id: DB_CATEGORIES.ortaklik,
        listing_type_id: DB_LISTING_TYPES.ortakAriyorum,
        module_key: 'founders',
        title: 'Fintech & B2B SaaS Girişimleri için Büyüme / CMO Kurucu Ortak Adayı',
        short_description: '7 yıllık dijital büyüme ve B2B SaaS pazarlama liderliği tecrübesiyle MVP aşamasındaki fintech girişimlerine ortak olmak istiyorum.',
        long_description: 'Kullanıcı edinimi, büyüme hunisi optimizasyonu ve kurumsal marka konumlandırma alanlarında tam zamanlı ortaklık hedefliyorum.',
        location: 'Beşiktaş, İstanbul',
        city: 'İstanbul',
        district: 'Beşiktaş',
        industry: 'Fintech',
        custom_fields: {
          partnershipIntent: 'joining',
          stage: 'MVP',
          partnershipType: 'Kurucu Ortak',
          commitment: 'Tam zamanlı',
          skills: ['Pazarlama', 'Büyüme', 'B2B Satış', 'Dijital Pazarlama'],
          sectors: ['Fintech', 'Yapay Zeka'],
          equity: 15,
        },
      },
      index++
    )
  );

  // D. Franchise Counterpart 1 (High Match Seeker for target's Franchise opportunity): %92+ Match
  rows.push(
    makeRow(
      {
        owner_id: counterpartUserId,
        category_id: DB_CATEGORIES.franchise,
        listing_type_id: DB_LISTING_TYPES.bayilikAl,
        module_key: 'franchise',
        title: 'İstanbul Anadolu Yakasında Kahve & Cafe Bayiliği Arayan Yatırımcı',
        short_description: '1.5M - 2.0M TL bütçeyle anahtar teslim kahve / cafe franchise fırsatları arıyorum.',
        long_description: 'Gıda ve yeme-içme sektöründe 2 yıl mağaza işletme deneyimim bulunuyor. Cadde konsepti için hazır bütçemle bayilik almak istiyorum.',
        location: 'Kadıköy, İstanbul',
        city: 'İstanbul',
        district: 'Kadıköy',
        industry: 'Gıda & İçecek',
        custom_fields: {
          sector: 'Gıda & İçecek',
          businessCategory: 'Cafe & Restoran',
          budgetRange: '1.000.000 - 2.000.000 TL',
          preferredCity: 'İstanbul',
          experienceLevel: '1-3 yıl işletme deneyimi',
        },
      },
      index++
    )
  );

  // E. Digital Solution Counterpart (Another Solution to showcase comparison and recommendations)
  rows.push(
    makeRow(
      {
        owner_id: counterpartUserId,
        category_id: DB_CATEGORIES.dijitalAi,
        listing_type_id: DB_LISTING_TYPES.dijitalAiCozum,
        module_key: null,
        title: 'Otel & Konaklama Tesisleri için Akıllı PMS ve Kanal Yöneticisi',
        short_description: 'Butik oteller ve konaklama tesisleri için yapay zeka tabanlı dinamik fiyatlandırma ve kanal yönetimi.',
        long_description: 'Rezervasyonları tek merkezden yöneten, OTA komisyonlarını düşüren bulut PMS platformu.',
        location: 'Antalya, Muratpaşa',
        city: 'Antalya',
        industry: 'Turizm',
        custom_fields: {
          solutionType: 'SaaS ürünü',
          deliveryModel: 'Abonelik (SaaS)',
          targetAudience: 'KOBİ',
          capabilities: ['Analitik & Raporlama', 'Kanal Yönetimi', 'Rezervasyon Entegrasyonu'],
          priceRange: '15.000 - 30.000 TL',
          industry: 'Turizm',
          supportedLanguages: ['Türkçe', 'İngilizce', 'Almanca'],
        },
      },
      index++
    )
  );

  // F. More diverse marketplace listings to populate all ecosystem screens
  const extraListings = [
    {
      title: 'İklim Teknolojileri & Karbon Ayak İzi SaaS Platformu',
      cat: DB_CATEGORIES.dijitalAi,
      type: DB_LISTING_TYPES.dijitalAiCozum,
      module: null,
      city: 'İstanbul',
      industry: 'Yapay zeka',
      cf: {
        solutionType: 'SaaS ürünü',
        deliveryModel: 'Abonelik (SaaS)',
        targetAudience: 'Büyük Ölçekli',
        capabilities: ['Analitik & Raporlama', 'Karbon Takibi'],
        priceRange: '50.000 - 100.000 TL',
        industry: 'Temiz enerji',
      },
    },
    {
      title: 'Oto Ekspertiz & Servis Hizmetleri Franchise Bayiliği',
      cat: DB_CATEGORIES.franchise,
      type: DB_LISTING_TYPES.bayilikVer,
      module: 'franchise',
      city: 'Ankara',
      industry: 'Hizmet',
      cf: {
        companyName: 'MasterAuto Ekspertiz',
        sector: 'Hizmet',
        businessCategory: 'Hizmet noktası',
        totalInvestment: 3500000,
        availableCities: ['Ankara', 'Konya', 'Eskişehir'],
      },
    },
    {
      title: 'Lojistik ve Tedarik Zinciri Otomasyon Çözümü',
      cat: DB_CATEGORIES.dijitalAi,
      type: DB_LISTING_TYPES.dijitalAiCozum,
      module: null,
      city: 'İzmir',
      industry: 'Lojistik',
      cf: {
        solutionType: 'API & Entegrasyon',
        deliveryModel: 'Kullandıkça Öde',
        targetAudience: 'KOBİ',
        capabilities: ['İş Akışı Otomasyonu', 'Lojistik Entegrasyonu'],
        priceRange: '15.000 - 35.000 TL',
        industry: 'Lojistik',
      },
    },
    {
      title: 'Erken Aşama HealthTech Girişimi için Seed Yatırım Arıyorum',
      cat: DB_CATEGORIES.yatirim,
      type: DB_LISTING_TYPES.yatirimAriyorum,
      module: 'entrepreneurs',
      city: 'İstanbul',
      industry: 'Sağlık teknolojisi',
      cf: {
        investmentAmount: '1.000.000 - 2.500.000 TL',
        equityOffered: 10,
        stage: 'MVP aşaması',
      },
    },
  ];

  for (const extra of extraListings) {
    rows.push(
      makeRow(
        {
          owner_id: counterpartUserId,
          category_id: extra.cat,
          listing_type_id: extra.type,
          module_key: extra.module,
          title: extra.title,
          short_description: `${extra.title} hakkında detaylı bilgiler ve başvuru koşulları.`,
          long_description: `${extra.title} Girişimbee platformunda doğrulanmış aktif pazar ilanıdır.`,
          location: `${extra.city}, Türkiye`,
          city: extra.city,
          industry: extra.industry,
          custom_fields: extra.cf,
        },
        index++
      )
    );
  }

  console.log(`Inserting ${rows.length} total curated listings into Supabase...`);
  
  // Insert in chunks
  for (let i = 0; i < rows.length; i += 10) {
    const chunk = rows.slice(i, i + 10);
    const { error: insErr } = await supabase.from('marketplace_listings').insert(chunk);
    if (insErr) {
      console.error('Insert error at chunk', i, insErr);
      throw insErr;
    }
  }

  // Seed sample favorites for target user's listings
  const targetListings = rows.filter((r) => r.owner_id === targetUserId);
  const favoriteRows = targetListings.map((l, i) => ({
    id: randomUUID(),
    user_id: counterpartUserId,
    listing_id: l.id,
    status: 'active',
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  }));

  if (favoriteRows.length > 0) {
    const { error: favErr } = await supabase.from('marketplace_favorites').insert(favoriteRows);
    if (favErr) console.log('Fav seed info:', favErr.message);
  }

  // Seed sample contact requests for target user's listings
  const contactRows = targetListings.slice(0, 3).map((l) => ({
    id: randomUUID(),
    listing_id: l.id,
    owner_user_id: targetUserId,
    requester_user_id: counterpartUserId,
    status: 'pending',
    message: 'Merhaba, ilanınızla ilgileniyoruz. Detayları görüşmek isteriz.',
    terms_version: 'v1.0',
    terms_accepted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  }));

  if (contactRows.length > 0) {
    const { error: cntErr } = await supabase.from('marketplace_listing_contact_requests').insert(contactRows);
    if (cntErr) console.log('Contact seed info:', cntErr.message);
  }

  console.log(`Successfully seeded database! ${rows.length} listings published.`);
}

seedData().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
