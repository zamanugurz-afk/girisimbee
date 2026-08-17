/**
 * Wipe ALL marketplace listings and seed 5 published listings per active
 * listing type in the current IA:
 *   İş Arıyorum, İşe Alıyorum, Ortak Arıyorum, Ortak Olmak İstiyorum,
 *   Franchise, Dijital & AI.
 *
 * Does NOT seed Yatırım Arıyorum / Yatırım Yap.
 *
 * Usage:
 *   node scripts/seed-home-card-listings.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
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
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DIJITAL_AI_CATEGORY_ID = 'c1000001-0001-4000-8000-000000000008';
const DIJITAL_AI_TYPE_ID = 'd1000001-0001-4000-8000-000000000008';

function slugify(title, index) {
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
    .slice(0, 55);
  return `${base || 'ilan'}-${String(index).padStart(3, '0')}`;
}

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString();
}

function contactFor(i) {
  const n = String(532100000 + (i * 7919) % 7000000);
  return {
    contact_phone: `+90${n}`,
    contact_whatsapp: `+90${n}`,
    contact_email: `ilan.demo${String(i).padStart(2, '0')}@girisimbee.example`,
    contact_website: null,
  };
}

/** 5 listings per active product type. IDs resolved against live taxonomy. */
const CARD_SPECS = [
  {
    label: 'İş Arıyorum',
    typeSlugs: ['is-ariyorum'],
    categorySlugs: ['is-ariyorum', 'is-bul', 'is'],
    moduleKey: 'candidates',
    anonymousMode: true,
    fallbackCategoryId: 'e1000001-0001-4000-8000-000000000002',
    fallbackTypeId: 'e1000001-0001-4000-8000-000000000003',
    listings: [
      {
        title: 'Kıdemli full-stack yazılım geliştirici — React & Node',
        short_description:
          'B2B SaaS ürünlerinde 6 yıl uçtan uca geliştirme. TypeScript, PostgreSQL, AWS. Tam zamanlı, hibrit veya uzaktan.',
        long_description: `## Profil
B2B SaaS ekiplerinde API, ödeme entegrasyonu ve admin paneli teslim ettim.

## Aradığım rol
Kıdemli full-stack. İlk 90 günde somut teslimat.

## Yetkinlikler
TypeScript, React, Node.js, PostgreSQL, AWS.`,
        city: 'İstanbul',
        district: 'Kadıköy',
        industry: 'Bilişim / Yazılım',
        remote_policy: 'hybrid',
        custom_fields: {
          primarySector: 'Bilişim / Yazılım',
          desiredRole: 'Yazılım Geliştirici',
          experienceLevel: 'Senior',
          workType: 'Tam zamanlı',
          preferredCity: 'İstanbul',
          preferredDistrict: 'Kadıköy',
          workplacePreference: 'Hibrit',
          salaryExpectation: '100.000 - 150.000 TL',
          availability: '1 ay içinde',
        },
      },
      {
        title: 'Ürün yöneticisi — B2B SaaS discovery ve roadmap',
        short_description:
          '0→1 ve 1→n ürün yolculuğu. Discovery, PRD ve sprint sahipliği. Uzaktan veya Ankara hibrit.',
        long_description: `## Profil
Kullanıcı görüşmeleri, metrik odaklı önceliklendirme ve çapraz ekip koordinasyonu.

## Aradığım rol
B2B ürün yöneticisi. SQL okuryazarlığı mevcut.

## Çalışma
Uzaktan tercih, ayda birkaç gün ofis kabul.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Bilişim / Yazılım',
        remote_policy: 'remote',
        custom_fields: {
          primarySector: 'Bilişim / Yazılım',
          desiredRole: 'Ürün Yöneticisi',
          experienceLevel: 'Senior',
          workType: 'Tam zamanlı',
          preferredCity: 'Ankara',
          preferredDistrict: 'Çankaya',
          workplacePreference: 'Uzaktan',
          salaryExpectation: '100.000 - 150.000 TL',
          availability: '2 hafta içinde',
        },
      },
      {
        title: 'Performans pazarlama uzmanı — Meta & Google Ads',
        short_description:
          'Aylık medya bütçesi yönetimi, CAC/ROAS odaklı test ritmi. Tam zamanlı, İstanbul hibrit.',
        long_description: `## Profil
Kampanya kurgusu, creative test ve haftalık raporlama.

## Yetkinlikler
Meta Ads, Google Ads, GA4, Looker Studio.

## Tercih
Hibrit İstanbul. Hemen başlayabilirim.`,
        city: 'İstanbul',
        district: 'Şişli',
        industry: 'Pazarlama / Reklam',
        remote_policy: 'hybrid',
        custom_fields: {
          primarySector: 'Pazarlama / Reklam',
          desiredRole: 'Pazarlama Uzmanı',
          experienceLevel: 'Mid',
          workType: 'Tam zamanlı',
          preferredCity: 'İstanbul',
          preferredDistrict: 'Şişli',
          workplacePreference: 'Hibrit',
          salaryExpectation: '50.000 - 75.000 TL',
          availability: 'Hemen',
        },
      },
      {
        title: 'Veri analisti — growth ve ürün metrikleri',
        short_description:
          'Funnel, retention ve gelir dashboard’ları. SQL, Python. Tam zamanlı, İzmir veya uzaktan.',
        long_description: `## Profil
Haftalık growth review’ları ve tek kaynaktan metrik okuma.

## Stack
SQL, Python, Metabase.

## Tercih
Uzaktan veya İzmir hibrit.`,
        city: 'İzmir',
        district: 'Bornova',
        industry: 'Yapay zeka / Veri',
        remote_policy: 'remote',
        custom_fields: {
          primarySector: 'Yapay zeka / Veri',
          desiredRole: 'Veri Analisti',
          experienceLevel: 'Mid',
          workType: 'Tam zamanlı',
          preferredCity: 'İzmir',
          preferredDistrict: 'Bornova',
          workplacePreference: 'Uzaktan',
          salaryExpectation: '50.000 - 75.000 TL',
          availability: '1 ay içinde',
        },
      },
      {
        title: 'İK uzmanı — teknik işe alım ve onboarding',
        short_description:
          'Teknik ve non-teknik roller, skor kartı ve 30-60-90 onboarding. Tam zamanlı, Bursa ofis veya hibrit.',
        long_description: `## Profil
Uçtan uca hiring ve işveren markası içeriği.

## Aradığım rol
İK / talent acquisition. ATS disiplini mevcut.

## Tercih
Bursa ofis veya hibrit.`,
        city: 'Bursa',
        district: 'Nilüfer',
        industry: 'İnsan kaynakları',
        remote_policy: 'hybrid',
        custom_fields: {
          primarySector: 'İnsan kaynakları',
          desiredRole: 'İnsan Kaynakları Uzmanı',
          experienceLevel: 'Mid',
          workType: 'Tam zamanlı',
          preferredCity: 'Bursa',
          preferredDistrict: 'Nilüfer',
          workplacePreference: 'Hibrit',
          salaryExpectation: '50.000 - 75.000 TL',
          availability: 'Esnek',
        },
      },
    ],
  },
  {
    label: 'İşe Alıyorum',
    typeSlugs: ['ise-aliyorum'],
    categorySlugs: ['ise-al', 'is'],
    moduleKey: 'employers',
    fallbackCategoryId: 'e1000001-0001-4000-8000-000000000002',
    fallbackTypeId: 'e1000001-0001-4000-8000-000000000004',
    listings: [
      {
        title: 'Kıdemli full-stack geliştirici — Node.js / React',
        short_description:
          'Fintech ürün ekibi. 4+ yıl TypeScript. Hibrit İstanbul. Maaş bandı 100.000–150.000 TL.',
        long_description: `## Rol
Ödeme paneli ve API geliştirme.

## Aranan
TypeScript, Node, React, PostgreSQL.

## Teklif
Hibrit, yemek ve öğrenme bütçesi görüşmede.`,
        city: 'İstanbul',
        district: 'Kadıköy',
        industry: 'Finans / Bankacılık',
        remote_policy: 'hybrid',
        custom_fields: {
          primarySector: 'Finans / Bankacılık',
          desiredRole: 'Yazılım Geliştirici',
          experienceLevel: 'Senior',
          workType: 'Tam zamanlı',
          preferredCity: 'İstanbul',
          preferredDistrict: 'Kadıköy',
          workplacePreference: 'Hibrit',
          salaryRange: '100.000 - 150.000 TL',
          availability: '1 ay içinde',
        },
      },
      {
        title: 'Ürün yöneticisi — B2B SaaS',
        short_description:
          'Roadmap, discovery ve metrik sahipliği. 3+ yıl PM. Uzaktan, ayda 2 gün Ankara.',
        long_description: `## Sorumluluk
Quarterly roadmap, kullanıcı araştırması, sprint önceliği.

## Aranan
B2B SaaS PM, SQL temel, net iletişim.

## Çalışma
Uzaktan öncelikli.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Bilişim / Yazılım',
        remote_policy: 'remote',
        custom_fields: {
          primarySector: 'Bilişim / Yazılım',
          desiredRole: 'Ürün Yöneticisi',
          experienceLevel: 'Senior',
          workType: 'Tam zamanlı',
          preferredCity: 'Ankara',
          preferredDistrict: 'Çankaya',
          workplacePreference: 'Uzaktan',
          salaryRange: '75.000 - 100.000 TL',
          availability: '2 hafta içinde',
        },
      },
      {
        title: 'Kurumsal satış temsilcisi — saha',
        short_description:
          'Lojistik yazılımı B2B satış. Primli model. 2+ yıl saha satış. İzmir ofis / saha.',
        long_description: `## Hedef
Yeni müşteri ve mevcut hesap büyütme.

## Aranan
B2B satış, CRM disiplini, ehliyet.

## Ücret
Sabit + prim.`,
        city: 'İzmir',
        district: 'Bornova',
        industry: 'Lojistik / Depolama',
        remote_policy: 'onsite',
        custom_fields: {
          primarySector: 'Lojistik / Depolama',
          desiredRole: 'Satış Temsilcisi',
          experienceLevel: 'Mid',
          workType: 'Tam zamanlı',
          preferredCity: 'İzmir',
          preferredDistrict: 'Bornova',
          workplacePreference: 'Saha',
          salaryRange: '35.000 - 50.000 TL',
          availability: 'Hemen',
        },
      },
      {
        title: 'Veri analisti — e-ticaret metrikleri',
        short_description:
          'Pazaryeri ve D2C analiz. SQL zorunlu. Hibrit İstanbul. 2–4 yıl deneyim.',
        long_description: `## İş
Cohort, birim ekonomi, kampanya analizi.

## Stack
SQL, dashboard; Python artı.

## Ortam
Haftada 2 gün ofis.`,
        city: 'İstanbul',
        district: 'Şişli',
        industry: 'E-ticaret / Pazaryeri',
        remote_policy: 'hybrid',
        custom_fields: {
          primarySector: 'E-ticaret / Pazaryeri',
          desiredRole: 'Veri Analisti',
          experienceLevel: 'Mid',
          workType: 'Tam zamanlı',
          preferredCity: 'İstanbul',
          preferredDistrict: 'Şişli',
          workplacePreference: 'Hibrit',
          salaryRange: '50.000 - 75.000 TL',
          availability: '1 ay içinde',
        },
      },
      {
        title: 'Müşteri başarı uzmanı — SaaS onboarding',
        short_description:
          'Kickoff, QBR ve yenileme. 2–4 yıl CSM veya hesap yönetimi. Antalya hibrit.',
        long_description: `## Görev
Onboarding, churn önleme, memnuniyet.

## KPI
Yenileme, churn, CSAT.

## Çalışma
Hibrit, TR saatleri.`,
        city: 'Antalya',
        district: 'Konyaaltı',
        industry: 'Bilişim / Yazılım',
        remote_policy: 'hybrid',
        custom_fields: {
          primarySector: 'Bilişim / Yazılım',
          desiredRole: 'Müşteri Başarı Uzmanı',
          experienceLevel: 'Mid',
          workType: 'Tam zamanlı',
          preferredCity: 'Antalya',
          preferredDistrict: 'Konyaaltı',
          workplacePreference: 'Hibrit',
          salaryRange: '25.000 - 50.000 TL',
          availability: 'Esnek',
        },
      },
    ],
  },
  {
    label: 'Ortak Arıyorum',
    typeSlugs: ['ortak-ariyorum'],
    categorySlugs: ['ortak-bul', 'ortaklik'],
    moduleKey: 'founders',
    fallbackCategoryId: 'e1000001-0001-4000-8000-000000000003',
    fallbackTypeId: 'e1000001-0001-4000-8000-000000000005',
    listings: [
      {
        title: 'B2B SaaS için teknik kurucu ortak (CTO) arıyorum',
        short_description:
          'İlk müşteriler kapandı. Mimari ve ürün sahipliği için tam zamanlı teknik ortak. Hisse görüşmeye açık.',
        long_description: `## Durum
MVP canlı, ödeme yapan müşteri var. Satış tarafı bende.

## Aranan ortak
Backend + cloud, equity odaklı.

## Teklif
Kurucu unvanı, İstanbul hibrit.`,
        city: 'İstanbul',
        district: 'Beşiktaş',
        industry: 'SaaS / Yazılım',
        remote_policy: 'hybrid',
        custom_fields: {
          partnershipIntent: 'seeking',
          sector: 'SaaS / Yazılım',
          projectStage: 'İlk müşteriler',
          partnershipType: 'Kurucu Ortak',
          expertise: ['CTO / Teknik liderlik', 'Yazılım geliştirme'],
          equityOffered: 22,
          commitment: 'Tam zamanlı',
        },
      },
      {
        title: 'E-ticaret operasyonu için COO ortağı arıyorum',
        short_description:
          'Sipariş hacmi arttı. Depo, iade ve kanal yönetimi için tam zamanlı operasyon ortağı.',
        long_description: `## İhtiyaç
Stok, fulfillment, birim ekonomi.

## Ortaklık
Hisse + operasyon sahipliği. Bursa ofis.`,
        city: 'Bursa',
        district: 'Osmangazi',
        industry: 'E-ticaret',
        remote_policy: 'onsite',
        custom_fields: {
          partnershipIntent: 'seeking',
          sector: 'E-ticaret',
          projectStage: 'Gelir elde ediliyor',
          partnershipType: 'İş Ortağı',
          expertise: ['COO / Operasyon', 'Satış'],
          equityOffered: 15,
          commitment: 'Tam zamanlı',
        },
      },
      {
        title: 'Healthtech MVP için ürün / UX kurucu ortak',
        short_description:
          'Teknik prototip hazır. Klinik deneyim ve ürün tasarımı ile fark yaratacak ortak arıyorum.',
        long_description: `## Ürün
Hasta takip paneli MVP.

## Ortak profili
UX + ürün yönetimi.

## Çalışma
Ankara veya uzaktan.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Sağlık teknolojisi',
        remote_policy: 'remote',
        custom_fields: {
          partnershipIntent: 'seeking',
          sector: 'Sağlık teknolojisi',
          projectStage: 'MVP aşaması',
          partnershipType: 'Kurucu Ortak',
          expertise: ['Ürün yönetimi', 'Tasarım / UX'],
          equityOffered: 20,
          commitment: 'Tam zamanlı',
        },
      },
      {
        title: 'Yerel büyüme için iş geliştirme ortağı',
        short_description:
          'Ürün çalışıyor. Ankara/İzmir açılışı için yerel network ve satış kapasitesi arıyorum.',
        long_description: `## Neden ortak?
Talep üretimi ve yerel hesap yönetimi.

## Model
Yarı zamanlı başlayıp tam zamana geçilebilir.`,
        city: 'Antalya',
        district: 'Muratpaşa',
        industry: 'Marketplace',
        remote_policy: 'hybrid',
        custom_fields: {
          partnershipIntent: 'seeking',
          sector: 'Marketplace',
          projectStage: 'Büyüme aşaması',
          partnershipType: 'İş Ortağı',
          expertise: ['İş geliştirme', 'Satış'],
          equityOffered: 10,
          commitment: 'Yarı zamanlı',
        },
      },
      {
        title: 'Yapay zeka ürününe growth / pazarlama ortağı',
        short_description:
          'Ürün canlı, PLG funnel zayıf. İçerik ve performans pazarlaması ile büyüme ortağı arıyorum.',
        long_description: `## Aranan
Growth marketing, SEO, paid social.

## Teklif
Hisse + danışmanlık opsiyonu. Remote.`,
        city: 'İstanbul',
        district: 'Ataşehir',
        industry: 'Yapay zeka',
        remote_policy: 'remote',
        custom_fields: {
          partnershipIntent: 'seeking',
          sector: 'Yapay zeka',
          projectStage: 'İlk müşteriler',
          partnershipType: 'Danışman',
          expertise: ['Büyüme pazarlaması', 'İş geliştirme'],
          equityOffered: 12,
          commitment: 'Yarı zamanlı',
        },
      },
    ],
  },
  {
    label: 'Ortak Olmak İstiyorum',
    typeSlugs: ['ortak-ariyorum'],
    categorySlugs: ['ortak-bul', 'ortaklik'],
    moduleKey: 'founders',
    fallbackCategoryId: 'e1000001-0001-4000-8000-000000000003',
    fallbackTypeId: 'e1000001-0001-4000-8000-000000000005',
    listings: [
      {
        title: 'Teknik kurucu / CTO olarak girişimlere katılıyorum',
        short_description:
          '10+ yıl yazılım. Mimari, ekip kurma ve MVP. SaaS ve fintech. Tam zamanlı, hisse beklentisi net.',
        long_description: `## Sunduğum
Teknik liderlik, sprint ritmi, cloud maliyet disiplini.

## İlgilendiğim
MVP veya ilk müşteri aşaması, B2B ürünler.

## Çalışma
İstanbul hibrit veya uzaktan.`,
        city: 'İstanbul',
        district: 'Beşiktaş',
        industry: 'SaaS / Yazılım',
        remote_policy: 'hybrid',
        custom_fields: {
          partnershipIntent: 'joining',
          expertise: ['CTO / Teknik liderlik', 'Yazılım geliştirme'],
          offeredSkills: ['CTO / Teknik liderlik', 'Yazılım geliştirme', 'Yapay zeka / ML'],
          sectors: ['SaaS / Yazılım', 'Fintech', 'Yapay zeka'],
          partnershipType: 'Kurucu Ortak',
          projectStage: 'MVP aşaması',
          commitment: 'Tam zamanlı',
          experience: '10+ yıl',
          equityOffered: 20,
        },
      },
      {
        title: 'Operasyon ve finans disiplini ile ortak olmak istiyorum',
        short_description:
          'COO/CFO profili. Nakit, süreç ve saha operasyonu. Gelir üreten ekiplere tam zamanlı katılım.',
        long_description: `## Sunduğum
Birim ekonomi, tedarik, raporlama.

## İlgilendiğim
E-ticaret, lojistik, hizmet operasyonu.

## Lokasyon
Bursa / İstanbul, ofis ağırlıklı.`,
        city: 'Bursa',
        district: 'Nilüfer',
        industry: 'E-ticaret',
        remote_policy: 'onsite',
        custom_fields: {
          partnershipIntent: 'joining',
          expertise: ['COO / Operasyon', 'CFO / Finans'],
          offeredSkills: ['COO / Operasyon', 'CFO / Finans'],
          sectors: ['E-ticaret', 'Lojistik', 'Gıda teknolojisi'],
          partnershipType: 'İş Ortağı',
          projectStage: 'Gelir elde ediliyor',
          commitment: 'Tam zamanlı',
          experience: '5-10 yıl',
          equityOffered: 15,
        },
      },
      {
        title: 'Ürün ve UX ile erken aşama ekiplere katılıyorum',
        short_description:
          'Discovery, prototip ve tasarım sistemi. Healthtech ve SaaS. Tam zamanlı veya yoğun yarı zamanlı.',
        long_description: `## Sunduğum
Kullanıcı araştırması, akış, Figma sistemi.

## İlgilendiğim
MVP ve ilk müşteri aşaması.

## Çalışma
Ankara veya remote.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Sağlık teknolojisi',
        remote_policy: 'remote',
        custom_fields: {
          partnershipIntent: 'joining',
          expertise: ['Ürün yönetimi', 'Tasarım / UX'],
          offeredSkills: ['Ürün yönetimi', 'Tasarım / UX'],
          sectors: ['Sağlık teknolojisi', 'SaaS / Yazılım', 'Eğitim teknolojisi'],
          partnershipType: 'Kurucu Ortak',
          projectStage: 'MVP aşaması',
          commitment: 'Tam zamanlı',
          experience: '5-10 yıl',
          equityOffered: 18,
        },
      },
      {
        title: 'B2B satış ve iş geliştirme ortağı olarak katılıyorum',
        short_description:
          'Kurumsal pipeline, demo ve kapanış. Marketplace ve SaaS. Tam zamanlı saha + hibrit.',
        long_description: `## Sunduğum
Hesap haritası, teklif, partner kanalı.

## İlgilendiğim
İlk müşteriden büyümeye kadar.

## Bölge
İzmir ve Ege.`,
        city: 'İzmir',
        district: 'Karşıyaka',
        industry: 'Marketplace',
        remote_policy: 'hybrid',
        custom_fields: {
          partnershipIntent: 'joining',
          expertise: ['Satış', 'İş geliştirme'],
          offeredSkills: ['Satış', 'İş geliştirme'],
          sectors: ['Marketplace', 'SaaS / Yazılım', 'Lojistik'],
          partnershipType: 'İş Ortağı',
          projectStage: 'İlk müşteriler',
          commitment: 'Tam zamanlı',
          experience: '5-10 yıl',
          equityOffered: 12,
        },
      },
      {
        title: 'Growth pazarlama danışmanı olarak hisse karşılığı katkı',
        short_description:
          'SEO, içerik, paid social. PLG funnel. Yarı zamanlı / danışmanlık. AI ve edtech.',
        long_description: `## Sunduğum
Kanal testi, yaratıcı ritmi, aktivasyon deneyleri.

## İlgilendiğim
İlk müşteri ve büyüme aşaması.

## Model
Danışmanlık, remote.`,
        city: 'İstanbul',
        district: 'Üsküdar',
        industry: 'Yapay zeka',
        remote_policy: 'remote',
        custom_fields: {
          partnershipIntent: 'joining',
          expertise: ['Büyüme pazarlaması', 'CMO / Pazarlama'],
          offeredSkills: ['Büyüme pazarlaması', 'CMO / Pazarlama'],
          sectors: ['Yapay zeka', 'Eğitim teknolojisi', 'SaaS / Yazılım'],
          partnershipType: 'Danışman',
          projectStage: 'Büyüme aşaması',
          commitment: 'Danışmanlık',
          experience: '3-5 yıl',
          equityOffered: 8,
        },
      },
    ],
  },
  {
    label: 'Franchise',
    typeSlugs: ['bayilik-ver', 'franchise-ilan-ver'],
    categorySlugs: ['bayilik-al', 'franchise'],
    moduleKey: 'franchise',
    fallbackCategoryId: 'c1000001-0001-4000-8000-000000000006',
    fallbackTypeId: 'a0000007-0001-4000-8000-000000000007',
    listings: [
      {
        title: 'Brew&Go kahve zinciri — İstanbul Anadolu yakası bayiliği',
        short_description:
          'Hızlı servis kahve. 28 şube. Toplam yatırım tahmini 1.8–2.4M TL. Eğitim ve açılış desteği dahil.',
        long_description: `## Marka
Ofis ve AVM odaklı kahve konsepti.

## Destek
2 hafta eğitim, 90 gün saha koçu, merkezi tedarik.

## Süreç
Ön görüşme → lokasyon → eğitim → açılış.`,
        city: 'İstanbul',
        district: 'Ataşehir',
        industry: 'Gıda & İçecek',
        remote_policy: 'onsite',
        custom_fields: {
          companyName: 'Brew&Go',
          establishmentYear: 2014,
          sector: 'Gıda & İçecek',
          branchCount: 28,
          website: 'https://www.brewgo.example',
          entryFee: 450000,
          franchiseFee: 450000,
          totalInvestment: 2100000,
          businessCategory: 'Cafe & Restoran',
          storeSize: '50-100 m²',
          returnPeriod: '24-36 ay',
          experienceRequirement: '1-3 yıl işletme deneyimi',
          educationRequirement: 'Lise mezunu',
          companyEstablishmentRequired: true,
          trainingSupport: true,
          operationalSupport: true,
          marketingSupport: true,
          workingHours: '08:00 - 22:00',
        },
      },
      {
        title: 'FitBox spor stüdyosu — Ankara Çankaya franchise',
        short_description:
          'Boutique fitness. 14 stüdyo. Açılış paketi ekipman ve yazılım dahil. Marka ve üyelik sistemi hazır.',
        long_description: `## Format
Küçük metrekare, yüksek üyelik dönüşümü.

## Paket
Ekipman, yazılım, eğitim, soft opening.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Sağlık & Güzellik',
        remote_policy: 'onsite',
        custom_fields: {
          companyName: 'FitBox',
          establishmentYear: 2016,
          sector: 'Sağlık & Güzellik',
          branchCount: 14,
          website: 'https://www.fitbox.example',
          entryFee: 600000,
          franchiseFee: 600000,
          totalInvestment: 2800000,
          businessCategory: 'Hizmet noktası',
          storeSize: '100-200 m²',
          returnPeriod: '24-36 ay',
          experienceRequirement: '3-5 yıl işletme deneyimi',
          educationRequirement: 'Ön lisans / Lisans',
          companyEstablishmentRequired: true,
          trainingSupport: true,
          operationalSupport: true,
          marketingSupport: true,
          workingHours: '06:30 - 22:00',
        },
      },
      {
        title: 'PetCare klinik formatı — İzmir bayilik fırsatı',
        short_description:
          'Veteriner + pet shop hibrit. 9 nokta. Merkezi stok ve klinik protokol. Cadde veya site altı.',
        long_description: `## Model
Klinik hizmet + perakende.

## Destek
SOP, tedarik, marka reklam fonu.`,
        city: 'İzmir',
        district: 'Karşıyaka',
        industry: 'Perakende',
        remote_policy: 'onsite',
        custom_fields: {
          companyName: 'PetCare',
          establishmentYear: 2012,
          sector: 'Perakende',
          branchCount: 9,
          website: 'https://www.petcare.example',
          entryFee: 550000,
          franchiseFee: 550000,
          totalInvestment: 3200000,
          businessCategory: 'Perakende mağaza',
          storeSize: '100-200 m²',
          returnPeriod: '36+ ay',
          experienceRequirement: 'Deneyim gerekmez',
          educationRequirement: 'Lise mezunu',
          companyEstablishmentRequired: true,
          trainingSupport: true,
          operationalSupport: true,
          marketingSupport: true,
          workingHours: '09:00 - 21:00',
        },
      },
      {
        title: 'QuickWash oto yıkama — Bursa Nilüfer şube hakkı',
        short_description:
          'Su tasarruflu otomatik yıkama. 6 şube. Operasyon basit, vardiya modeli net. Hedef geri dönüş 24–30 ay.',
        long_description: `## Avantaj
Düşük personel, yüksek tekrar ziyaret.

## Paket
Makine, yazılım, saha eğitimi.`,
        city: 'Bursa',
        district: 'Nilüfer',
        industry: 'Otomotiv',
        remote_policy: 'onsite',
        custom_fields: {
          companyName: 'QuickWash',
          establishmentYear: 2018,
          sector: 'Otomotiv',
          branchCount: 6,
          website: 'https://www.quickwash.example',
          entryFee: 280000,
          franchiseFee: 280000,
          totalInvestment: 1100000,
          businessCategory: 'Hizmet noktası',
          storeSize: '200-500 m²',
          returnPeriod: '18-24 ay',
          experienceRequirement: 'Deneyim gerekmez',
          educationRequirement: 'Eğitim şartı yok',
          companyEstablishmentRequired: true,
          trainingSupport: true,
          operationalSupport: true,
          marketingSupport: true,
          workingHours: '08:00 - 20:00',
        },
      },
      {
        title: 'EduKids dil okulu — Gaziantep franchise',
        short_description:
          'Çocuk İngilizce. 11 kampüs. Müfredat, öğretmen akademisi ve CRM dahil. Eğitim veya satış geçmişi tercih.',
        long_description: `## Segment
4–12 yaş.

## Destek
Müfredat, öğretmen eğitimi, kayıt funnel’ı.`,
        city: 'Gaziantep',
        district: 'Şehitkamil',
        industry: 'Eğitim',
        remote_policy: 'onsite',
        custom_fields: {
          companyName: 'EduKids',
          establishmentYear: 2010,
          sector: 'Eğitim',
          branchCount: 11,
          website: 'https://www.edukids.example',
          entryFee: 400000,
          franchiseFee: 400000,
          totalInvestment: 1800000,
          businessCategory: 'Hizmet noktası',
          storeSize: '100-200 m²',
          returnPeriod: '24-36 ay',
          experienceRequirement: '1-3 yıl işletme deneyimi',
          educationRequirement: 'Ön lisans / Lisans',
          companyEstablishmentRequired: true,
          trainingSupport: true,
          operationalSupport: true,
          marketingSupport: true,
          workingHours: '09:00 - 19:00',
        },
      },
    ],
  },
  {
    label: 'Dijital & AI Çözümleri',
    typeSlugs: ['dijital-ai-cozum'],
    categorySlugs: ['dijital-ai'],
    moduleKey: null,
    fallbackCategoryId: DIJITAL_AI_CATEGORY_ID,
    fallbackTypeId: DIJITAL_AI_TYPE_ID,
    listings: [
      {
        title: 'WhatsApp satış asistanı — KOBİ’ler için hazır AI ajan',
        short_description:
          'Sipariş, SSS ve randevu. 7 günde canlı. Aylık abonelik + kurulum. Türkçe dil modeli.',
        long_description: `## Çözüm
Hazır WhatsApp AI ajanı; katalog bağlantısı.

## Teslim
Kurulum 7 gün, bir eğitim oturumu.

## Model
Kurulum + aylık kullanım.`,
        city: 'İstanbul',
        district: 'Üsküdar',
        industry: 'Yapay zeka',
        remote_policy: 'remote',
        custom_fields: {
          solutionType: 'Yapay zeka asistanı / ajan',
          deliveryModel: 'Abonelik (SaaS)',
          targetAudience: 'KOBİ',
          priceRange: '5.000 - 25.000 TL',
          capabilities: ['Yapay Zeka Asistanı', 'İş Akışı Otomasyonu'],
          supportedLanguages: ['Türkçe'],
        },
      },
      {
        title: 'E-ticaret ürün açıklaması ve SEO metin otomasyonu',
        short_description:
          'Pazaryeri / mağaza için toplu içerik. Marka tonu profili ve kalite paneli. TR/EN çıktı.',
        long_description: `## Kullanım
CSV/API ile ürün basma.

## Model
Kredi paketi veya aylık plan.`,
        city: 'İstanbul',
        district: 'Bakırköy',
        industry: 'E-ticaret',
        remote_policy: 'remote',
        custom_fields: {
          solutionType: 'NLP / metin işleme',
          deliveryModel: 'Abonelik (SaaS)',
          targetAudience: 'KOBİ',
          priceRange: '1.000 - 5.000 TL',
          capabilities: ['AI Destekli İçerik Üretimi'],
          supportedLanguages: ['Türkçe', 'İngilizce'],
        },
      },
      {
        title: 'Çağrı merkezi sesli AI — niyet ve özet paketi',
        short_description:
          'IVR sonrası niyet sınıflandırma ve ajan özeti. VPC kurulum. Kurumsal lisans.',
        long_description: `## Kapsam
Niyet, özet, ajan desteği.

## Kurulum
8–12 haftalık pilot.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Yapay zeka',
        remote_policy: 'hybrid',
        custom_fields: {
          solutionType: 'Chatbot & müşteri desteği',
          deliveryModel: 'Kurulum + bakım',
          targetAudience: 'Kurumsal',
          priceRange: '100.000 TL ve üzeri',
          capabilities: ['Yapay Zeka Asistanı', 'Veri Analitiği & Raporlama'],
          supportedLanguages: ['Türkçe'],
        },
      },
      {
        title: 'İşe alım CV eleme ve mülakat soru asistanı',
        short_description:
          'Rol profiline göre skor ve soru seti. İnsan onaylı kısa liste. Aylık koltuk modeli.',
        long_description: `## Değer
Ön eleme süresini kısaltır.

## Satış
İK ekiplerine abonelik.`,
        city: 'İzmir',
        district: 'Konak',
        industry: 'İnsan kaynakları',
        remote_policy: 'remote',
        custom_fields: {
          solutionType: 'SaaS ürünü',
          deliveryModel: 'Abonelik (SaaS)',
          targetAudience: 'Kurumsal',
          priceRange: '5.000 - 25.000 TL',
          capabilities: ['Yapay Zeka Asistanı', 'Entegrasyon & API'],
          supportedLanguages: ['Türkçe', 'İngilizce'],
        },
      },
      {
        title: 'Üretim hattı görüntü kontrolü — kalite AI kiti',
        short_description:
          'Kamera + edge model. Çizik/eksik parça. Fabrika sahasında 4–6 haftada POC.',
        long_description: `## Donanım
Endüstriyel kamera önerisi + edge kutu.

## POC
Tek hat, başarı kriteri birlikte tanımlanır.`,
        city: 'Kocaeli',
        district: 'Gebze',
        industry: 'Üretim',
        remote_policy: 'onsite',
        custom_fields: {
          solutionType: 'Bilgisayarlı görü',
          deliveryModel: 'Proje bazlı',
          targetAudience: 'Kurumsal',
          priceRange: '25.000 - 100.000 TL',
          capabilities: ['Veri Analitiği & Raporlama', 'İş Akışı Otomasyonu'],
          supportedLanguages: ['Türkçe'],
        },
      },
    ],
  },
];

async function resolveOwnerId() {
  const { data: users, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (error) throw error;
  const list = users?.users ?? [];
  const preferred =
    list.find((u) => u.email === 'zamanugurz@gmail.com')
    || list.find((u) => u.email === 'ugurzaman1907@gmail.com')
    || list[0];
  if (!preferred) throw new Error('No auth.users — kayıt ol veya bir kullanıcı oluştur.');
  return preferred.id;
}

async function loadTaxonomy() {
  const [{ data: cats, error: cErr }, { data: types, error: tErr }] = await Promise.all([
    supabase.from('marketplace_categories').select('id, slug, name'),
    supabase.from('marketplace_listing_types').select('id, slug, name, category_id'),
  ]);
  if (cErr) throw cErr;
  if (tErr) throw tErr;
  return { cats: cats ?? [], types: types ?? [] };
}

async function ensureDijitalAi(taxonomy) {
  let category = taxonomy.cats.find(
    (c) => c.slug === 'dijital-ai' || c.id === DIJITAL_AI_CATEGORY_ID,
  );
  if (!category) {
    const row = {
      id: DIJITAL_AI_CATEGORY_ID,
      slug: 'dijital-ai',
      name: 'Dijital ve AI Çözümleri',
      description: 'Yapay zeka ve dijital ürün/hizmet çözümleri',
      sort_order: 80,
      status: 'active',
      accent_color: '#8B5CF6',
    };
    const { error } = await supabase.from('marketplace_categories').upsert(row);
    if (error) {
      console.warn('dijital-ai category upsert:', error.message);
    } else {
      category = row;
      taxonomy.cats.push(row);
      console.log('Ensured category dijital-ai');
    }
  }

  let listingType = taxonomy.types.find(
    (t) => t.slug === 'dijital-ai-cozum' || t.id === DIJITAL_AI_TYPE_ID,
  );
  if (!listingType) {
    const catId = category?.id ?? DIJITAL_AI_CATEGORY_ID;
    const row = {
      id: DIJITAL_AI_TYPE_ID,
      category_id: catId,
      slug: 'dijital-ai-cozum',
      name: 'Dijital & AI Çözüm',
      description: 'Dijital ve yapay zeka çözüm ilanı',
      status: 'active',
      sort_order: 0,
      field_schema: { fields: [] },
    };
    const { error } = await supabase.from('marketplace_listing_types').upsert(row);
    if (error) {
      console.warn('dijital-ai type upsert:', error.message);
    } else {
      listingType = row;
      taxonomy.types.push(row);
      console.log('Ensured listing type dijital-ai-cozum');
    }
  }

  return { category, listingType };
}

function resolveIds(spec, taxonomy) {
  const type =
    taxonomy.types.find((t) => spec.typeSlugs.includes(t.slug))
    || taxonomy.types.find((t) => t.id === spec.fallbackTypeId);
  const category =
    taxonomy.cats.find((c) => spec.categorySlugs.includes(c.slug))
    || taxonomy.cats.find((c) => c.id === (type?.category_id || spec.fallbackCategoryId))
    || taxonomy.cats.find((c) => c.id === spec.fallbackCategoryId);

  return {
    categoryId: category?.id ?? spec.fallbackCategoryId,
    listingTypeId: type?.id ?? spec.fallbackTypeId,
    moduleKey: spec.moduleKey,
  };
}

async function wipeListings() {
  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

async function main() {
  if ((process.env.NODE_ENV || 'development') === 'production') {
    console.error('Refused: NODE_ENV=production');
    process.exit(1);
  }

  console.log('Owner…');
  const ownerId = await resolveOwnerId();
  console.log('Owner:', ownerId);

  console.log('Taxonomy…');
  const taxonomy = await loadTaxonomy();
  await ensureDijitalAi(taxonomy);
  console.log('Categories:', taxonomy.cats.map((c) => c.slug).join(', '));
  console.log('Types:', taxonomy.types.map((t) => t.slug).join(', '));

  console.log('Wiping marketplace_listings…');
  await wipeListings();

  const rows = [];
  let index = 1;
  for (const spec of CARD_SPECS) {
    const ids = resolveIds(spec, taxonomy);
    console.log(
      `${spec.label} → category=${ids.categoryId} type=${ids.listingTypeId} (${spec.listings.length})`,
    );
    for (const item of spec.listings) {
      const contacts = contactFor(index);
      rows.push({
        id: randomUUID(),
        slug: slugify(item.title, index),
        owner_id: ownerId,
        company_id: null,
        category_id: ids.categoryId,
        listing_type_id: ids.listingTypeId,
        subcategory_id: null,
        module_key: ids.moduleKey,
        title: item.title.slice(0, 200),
        short_description: item.short_description.slice(0, 500),
        long_description: item.long_description,
        status: 'published',
        workflow_status: 'published',
        location: `${item.city}, ${item.district}`,
        city: item.city,
        district: item.district,
        industry: item.industry,
        country: 'TR',
        remote_policy: item.remote_policy,
        anonymous_mode: spec.anonymousMode === true,
        ...contacts,
        custom_fields: item.custom_fields,
        view_count: 80 + index * 17,
        interested_count: 3 + (index % 12),
        application_count: 1 + (index % 8),
        is_verified: index % 3 === 0,
        is_featured: true,
        is_urgent: index % 7 === 0,
        featured_until: daysFromNow(30),
        urgent_until: index % 7 === 0 ? daysFromNow(7) : null,
        published_at: daysAgo(index % 20),
        expires_at: daysFromNow(60),
        rejected_reason: null,
        deleted_at: null,
      });
      index += 1;
    }
  }

  console.log(`Inserting ${rows.length} listings…`);
  for (let i = 0; i < rows.length; i += 10) {
    const chunk = rows.slice(i, i + 10);
    const { error } = await supabase.from('marketplace_listings').insert(chunk);
    if (error) {
      console.error('Insert failed', error.message, error.details, error.hint);
      throw error;
    }
  }

  const { data: published } = await supabase
    .from('marketplace_listings')
    .select('title, module_key, listing_type_id, custom_fields')
    .eq('status', 'published')
    .is('deleted_at', null);

  const byLabel = {};
  for (const spec of CARD_SPECS) {
    byLabel[spec.label] = spec.listings.length;
  }

  console.log('Done. Published listings:', published?.length ?? 0);
  console.log('By type:', byLabel);
  const seekingYatirim = (published ?? []).filter((row) => {
    const intent = row.custom_fields?.partnershipIntent;
    const title = String(row.title ?? '').toLocaleLowerCase('tr-TR');
    return title.includes('yatırım arıyorum') || row.module_key === 'entrepreneurs';
  });
  console.log('Investment-seeking leftovers:', seekingYatirim.length);
  for (const r of rows) {
    console.log(' -', r.title);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
