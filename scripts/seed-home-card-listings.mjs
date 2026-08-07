/**
 * Seed 5 realistic published listings for each home marketplace card:
 * Yatırım Bul, Ortak Bul, Franchise, İş İlanları, Dijital ve AI.
 *
 * Usage:
 *   node scripts/seed-home-card-listings.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Wipes marketplace_listings then inserts 25 demo rows.
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

/** Home card titles → listing payloads (5 each). IDs resolved at runtime. */
const CARD_SPECS = [
  {
    label: 'Yatırım Bul',
    typeSlugs: ['yatirim-ariyorum'],
    categorySlugs: ['yatirim-bul', 'yatirim'],
    moduleKey: 'entrepreneurs',
    fallbackCategoryId: 'e1000001-0001-4000-8000-000000000001',
    fallbackTypeId: 'e1000001-0001-4000-8000-000000000001',
    listings: [
      {
        title: 'PayFlow: KOBİ tahsilat otomasyonu için 2.5M TL tohum turu',
        short_description:
          'B2B fintech SaaS. 48 ödeme müşterisi, aylık 180K GMV. Seed turunda ürün ve satış ekibini büyütüyoruz.',
        long_description: `## Girişim
PayFlow, KOBİ’lerin çek/senet ve açık hesap tahsilatını otomatikleştiren bir SaaS.

## Traction
- 48 aktif işletme
- Aylık işlem hacmi ~180K TL
- Net retention %112

## Tur
2.5M TL tohum; %12–15 hisse görüşmeye açık. Fon: ürün, compliance ve satış.

## Ekip
2 kurucu (fintech + backend), 1 full-stack, 1 CSM.`,
        city: 'İstanbul',
        district: 'Kadıköy',
        industry: 'Fintech',
        remote_policy: 'hybrid',
        custom_fields: {
          investmentAmount: '1.000.000 - 2.500.000 TL',
          equityOffered: 12,
          stage: 'Gelir elde ediliyor',
          useOfFunds: ['Ürün geliştirme', 'Satış / pazarlama', 'Operasyon'],
        },
      },
      {
        title: 'MediSlot: Klinik randevu AI asistanına Series A öncesi yatırım',
        short_description:
          'Sağlık teknolojisi. 22 klinik, 14K aylık randevu. Regülasyon uyumlu dil modeli ile no-show oranını düşürüyoruz.',
        long_description: `## Problem
Klinikler randevu kaçırma ve telefon yoğunluğu yüzünden kapasite kaybediyor.

## Çözüm
WhatsApp + panel üzerinden AI asistan; randevu, hatırlatma ve triyaj.

## Metrikler
22 klinik · 14K randevu/ay · no-show −28%.

## Aranan yatırım
4M TL. Kullanım: model iyileştirme, hastane satışları, KVKK süreçleri.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Sağlık teknolojisi',
        remote_policy: 'hybrid',
        custom_fields: {
          investmentAmount: '2.500.000 - 5.000.000 TL',
          equityOffered: 10,
          stage: 'Gelir elde ediliyor',
          useOfFunds: ['Ürün geliştirme', 'Satış / pazarlama'],
        },
      },
      {
        title: 'RouteWise: Son mil rota optimizasyonu MVP yatırım arıyor',
        short_description:
          'Lojistik SaaS. 6 pilot kurye ağı, ortalama %18 maliyet düşüşü. Seed ile İstanbul ölçeğine çıkıyoruz.',
        long_description: `## Ürün
Canlı trafik + teslimat penceresi ile rota motoru.

## Pilot
6 operatör, 3 ay, ortalama %18 yakıt/süre tasarrufu.

## Tur
1.2M TL. Hisse %14. Fon: motor, mobil app, 2 satış.`,
        city: 'İzmir',
        district: 'Bayraklı',
        industry: 'Lojistik',
        remote_policy: 'onsite',
        custom_fields: {
          investmentAmount: '1.000.000 - 2.500.000 TL',
          equityOffered: 14,
          stage: 'MVP aşaması',
          useOfFunds: ['Ürün geliştirme', 'Operasyon'],
        },
      },
      {
        title: 'LearnLoop: Kurumsal mikro-öğrenme platformuna angel yatırım',
        short_description:
          'EdTech. 9 kurumsal müşteri, 6.2K aktif öğrenen. İçerik stüdyosu ve satış için 800K–1.5M TL arıyoruz.',
        long_description: `## Model
Abonelik + içerik paketi. NPS 61.

## Müşteriler
Perakende ve çağrı merkezi odaklı 9 sözleşme.

## Tur
Angel / pre-seed. Fon: içerik üretimi, CSM, outbound.`,
        city: 'İstanbul',
        district: 'Şişli',
        industry: 'Eğitim teknolojisi',
        remote_policy: 'remote',
        custom_fields: {
          investmentAmount: '500.000 - 1.000.000 TL',
          equityOffered: 15,
          stage: 'İlk müşteriler',
          useOfFunds: ['Satış / pazarlama', 'Ürün geliştirme'],
        },
      },
      {
        title: 'GreenMeter: Enerji izleme IoT için pre-Series A',
        short_description:
          'Temiz enerji. 35 fabrika sensör kurulumu, yıllık 2.1M TL ARR. Üretim ve Avrupa satış için büyüme turu.',
        long_description: `## Traction
ARR 2.1M TL · gross margin %68 · churn %0.9/ay.

## Kullanım
Donanım ölçekleme, Almanya partner, veri platformu.

## Tur
7.5M TL. Term sheet görüşmeye açık.`,
        city: 'Bursa',
        district: 'Nilüfer',
        industry: 'Temiz enerji',
        remote_policy: 'hybrid',
        custom_fields: {
          investmentAmount: '5.000.000 TL üzeri',
          equityOffered: 9,
          stage: 'Büyüme aşaması',
          useOfFunds: ['Operasyon', 'Satış / pazarlama', 'Ürün geliştirme'],
        },
      },
    ],
  },
  {
    label: 'Ortak Bul',
    typeSlugs: ['ortak-ariyorum'],
    categorySlugs: ['ortak-bul', 'ortaklik'],
    moduleKey: 'founders',
    fallbackCategoryId: 'e1000001-0001-4000-8000-000000000003',
    fallbackTypeId: 'e1000001-0001-4000-8000-000000000005',
    listings: [
      {
        title: 'B2B SaaS için teknik kurucu ortak (CTO) arıyorum',
        short_description:
          'Satış tarafı hazır, ilk 11 müşteri kapandı. Ürün ve mimari sahipliği için tam zamanlı teknik ortak.',
        long_description: `## Durum
MVP canlı, 11 ödeme yapan müşteri. Ben satış/operasyondayım.

## Aradığım ortak
Backend + cloud mimari deneyimi, equity odaklı.

## Teklif
%20–25 hisse + kurucu unvanı. İstanbul hibrit.`,
        city: 'İstanbul',
        district: 'Beşiktaş',
        industry: 'SaaS',
        remote_policy: 'hybrid',
        custom_fields: {
          partnerType: 'Kurucu Ortak',
          expertise: ['CTO / Teknik liderlik', 'Yazılım geliştirme'],
          stage: 'İlk müşteriler',
          equityOffered: 22,
          commitment: 'Tam zamanlı',
        },
      },
      {
        title: 'E-ticaret markasına operasyon / COO ortağı',
        short_description:
          'Aylık 1.4M ciro. Depo, iade ve kanal yönetimi için operasyon ortağı arıyorum.',
        long_description: `## İş
D2C + pazaryeri. 4 kişi ekip.

## İhtiyaç
Stok, fulfillment, birim ekonomi.

## Ortaklık
%15 hisse + kâr paylaşımı. Bursa ofis.`,
        city: 'Bursa',
        district: 'Osmangazi',
        industry: 'E-ticaret',
        remote_policy: 'onsite',
        custom_fields: {
          partnerType: 'İş Ortağı',
          expertise: ['COO / Operasyon', 'Satış'],
          stage: 'Gelir elde ediliyor',
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
UX + ürün yönetimi, sağlık domain bilgisi artı.

## Hisse
%18–25. Ankara / remote.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Sağlık teknolojisi',
        remote_policy: 'remote',
        custom_fields: {
          partnerType: 'Kurucu Ortak',
          expertise: ['Ürün yönetimi', 'Tasarım / UX'],
          stage: 'MVP aşaması',
          equityOffered: 20,
          commitment: 'Tam zamanlı',
        },
      },
      {
        title: 'Franchise zincirine satış ve iş geliştirme ortağı',
        short_description:
          '12 şubelik yerel marka. Yeni şehir açılışları için satış ortağı / franchise geliştirme.',
        long_description: `## Marka
Kahve + atıştırmalık. 12 şube.

## Rol
Aday bayilik görüşmeleri, lokasyon, sözleşme.

## Model
%10 hisse + performans primi.`,
        city: 'Antalya',
        district: 'Muratpaşa',
        industry: 'Perakende',
        remote_policy: 'hybrid',
        custom_fields: {
          partnerType: 'İş Ortağı',
          expertise: ['İş geliştirme', 'Satış'],
          stage: 'Büyüme aşaması',
          equityOffered: 10,
          commitment: 'Tam zamanlı',
        },
      },
      {
        title: 'AI ajan ürününe growth / pazarlama ortağı',
        short_description:
          'Ürün canlı, PLG funnel zayıf. İçerik + performans pazarlaması ile büyütmek için ortak.',
        long_description: `## Metrik
1.8K MAU, %4 freemium→paid.

## Aranan
Growth marketing, SEO/content, paid social.

## Teklif
%12 hisse + danışmanlık opsiyonu. Remote.`,
        city: 'İstanbul',
        district: 'Ataşehir',
        industry: 'Yapay zeka',
        remote_policy: 'remote',
        custom_fields: {
          partnerType: 'Danışman',
          expertise: ['Pazarlama', 'İş geliştirme'],
          stage: 'İlk müşteriler',
          equityOffered: 12,
          commitment: 'Yarı zamanlı',
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
          'Hızlı servis kahve. 28 şube. Yatırım 1.8–2.4M TL. Eğitim, ekipman ve açılış desteği dahil.',
        long_description: `## Marka
Brew&Go — ofis ve AVM odaklı.

## Yatırım
Franchise bedeli + dekor + stok: 1.8–2.4M TL.

## Destek
2 hafta eğitim, 90 gün saha koçu, merkezi tedarik.`,
        city: 'İstanbul',
        district: 'Ataşehir',
        industry: 'Yiyecek & içecek',
        remote_policy: 'onsite',
        custom_fields: {
          businessCategory: 'Yeme-İçme',
          sector: 'Kahve',
          investmentRange: '1.000.000 - 2.500.000 TL',
          franchiseFee: 450000,
          storeSize: '40-80 m²',
          returnPeriod: '24-36 ay',
          setupDuration: '2-3 ay',
          experienceRequirement: 'Tercihen perakende/yeme-içme',
          educationRequirement: 'Lise ve üzeri',
          companyEstablishmentRequired: true,
        },
      },
      {
        title: 'FitBox spor stüdyosu — Ankara Çankaya master franchise',
        short_description:
          'Boutique fitness. 14 stüdyo. Açılış paketi 2.2M TL’den. Marka bilinirliği ve dijital üyelik sistemi hazır.',
        long_description: `## Format
Küçük metrekare, yüksek üyelik dönüşümü.

## Paket
Ekipman, yazılım, eğitim, soft opening.

## Aday
Spor işletme veya satış deneyimi artı.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Spor & sağlıklı yaşam',
        remote_policy: 'onsite',
        custom_fields: {
          businessCategory: 'Hizmet',
          sector: 'Fitness',
          investmentRange: '2.500.000 - 5.000.000 TL',
          franchiseFee: 600000,
          storeSize: '120-200 m²',
          returnPeriod: '30-40 ay',
          setupDuration: '3-4 ay',
          experienceRequirement: 'İşletme deneyimi tercih edilir',
          educationRequirement: 'Önlisans / lisans',
          companyEstablishmentRequired: true,
        },
      },
      {
        title: 'PetCare klinik formatı — İzmir bayilik fırsatı',
        short_description:
          'Veteriner + pet shop hibrit. 9 nokta. Yatırım bandı 3M TL bandı. Merkezi stok ve klinik protokol.',
        long_description: `## Model
Klinik hizmet + perakende.

## Destek
Klinik SOP, tedarik, marka reklam fonu.

## Lokasyon
Ana cadde / site altı 150–250 m².`,
        city: 'İzmir',
        district: 'Karşıyaka',
        industry: 'Perakende',
        remote_policy: 'onsite',
        custom_fields: {
          businessCategory: 'Perakende',
          sector: 'Pet',
          investmentRange: '2.500.000 - 5.000.000 TL',
          franchiseFee: 550000,
          storeSize: '150-250 m²',
          returnPeriod: '36 ay',
          setupDuration: '4-5 ay',
          experienceRequirement: 'Yok / eğitim verilir',
          educationRequirement: 'Lise ve üzeri',
          companyEstablishmentRequired: true,
        },
      },
      {
        title: 'QuickWash oto yıkama — Bursa Nilüfer şube hakkı',
        short_description:
          'Su tasarruflu otomatik yıkama. 6 şube. Yatırım ~1.1M TL. Operasyon basit, vardiya modeli net.',
        long_description: `## Avantaj
Düşük personel, yüksek tekrar ziyaret.

## Paket
Makine, yazılım, saha eğitimi.

## ROI
Hedef 24–30 ay.`,
        city: 'Bursa',
        district: 'Nilüfer',
        industry: 'Otomotiv hizmet',
        remote_policy: 'onsite',
        custom_fields: {
          businessCategory: 'Hizmet',
          sector: 'Oto yıkama',
          investmentRange: '1.000.000 - 2.500.000 TL',
          franchiseFee: 280000,
          storeSize: '200-400 m²',
          returnPeriod: '24-30 ay',
          setupDuration: '2 ay',
          experienceRequirement: 'Yok',
          educationRequirement: 'Lise',
          companyEstablishmentRequired: true,
        },
      },
      {
        title: 'EduKids dil okulu — Gaziantep franchise',
        short_description:
          'Çocuk İngilizce. 11 kampüs. Açılış 1.6–2.0M TL. Müfredat, öğretmen akademisi ve CRM dahil.',
        long_description: `## Segment
4–12 yaş.

## Destek
Müfredat, öğretmen eğitimi, kayıt funnel’ı.

## Aday
Eğitim veya satış geçmişi tercih.`,
        city: 'Gaziantep',
        district: 'Şehitkamil',
        industry: 'Eğitim',
        remote_policy: 'onsite',
        custom_fields: {
          businessCategory: 'Eğitim',
          sector: 'Dil okulu',
          investmentRange: '1.000.000 - 2.500.000 TL',
          franchiseFee: 400000,
          storeSize: '180-300 m²',
          returnPeriod: '30-36 ay',
          setupDuration: '3 ay',
          experienceRequirement: 'Eğitim sektörü tercih',
          educationRequirement: 'Lisans tercih',
          companyEstablishmentRequired: true,
        },
      },
    ],
  },
  {
    label: 'İş İlanları',
    typeSlugs: ['ise-aliyorum'],
    categorySlugs: ['ise-al', 'is'],
    moduleKey: 'employers',
    fallbackCategoryId: 'e1000001-0001-4000-8000-000000000002',
    fallbackTypeId: 'e1000001-0001-4000-8000-000000000004',
    listings: [
      {
        title: 'Senior Full-Stack Developer (Node.js / React) — hibrit İstanbul',
        short_description:
          'Fintech ürün ekibi. 4+ yıl deneyim. Net 95–120K TL + yan haklar. Hibrit Kadıköy.',
        long_description: `## Rol
Ödeme paneli ve API geliştirmesi.

## Aranan
TypeScript, Node, React, PostgreSQL.

## Paket
Maaş bandı 95–120K net, yemek, özel sağlık.`,
        city: 'İstanbul',
        district: 'Kadıköy',
        industry: 'Fintech',
        remote_policy: 'hybrid',
        custom_fields: {
          position: 'Full-Stack Developer',
          experienceLevel: 'Senior (4-6 yıl)',
          salaryRange: '75.000 - 100.000 TL',
          workType: 'Hibrit',
        },
      },
      {
        title: 'Product Manager — B2B SaaS (Ankara / remote)',
        short_description:
          'KOBİ SaaS. Roadmap, discovery ve metrik sahipliği. 3+ yıl PM deneyimi.',
        long_description: `## Sorumluluk
Quarterly roadmap, kullanıcı araştırması, sprint önceliklendirme.

## Aranan
B2B SaaS PM, SQL temel, iyi iletişim.

## Çalışma
Remote-first, ayda 2 gün Ankara.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'SaaS',
        remote_policy: 'remote',
        custom_fields: {
          position: 'Product Manager',
          experienceLevel: 'Mid-Senior (3-5 yıl)',
          salaryRange: '60.000 - 85.000 TL',
          workType: 'Uzaktan',
        },
      },
      {
        title: 'Satış Temsilcisi — Kurumsal (İzmir)',
        short_description:
          'Lojistik yazılımı saha satışı. Primli model. 2+ yıl B2B satış.',
        long_description: `## Hedef
Yeni logos + upsell.

## Araçlar
CRM, demo ortamı, saha kit.

## Ücret
Sabit + prim; başarılı aylarda 2x sabit mümkün.`,
        city: 'İzmir',
        district: 'Bornova',
        industry: 'Lojistik',
        remote_policy: 'onsite',
        custom_fields: {
          position: 'Satış Temsilcisi',
          experienceLevel: 'Junior-Mid (1-3 yıl)',
          salaryRange: '35.000 - 50.000 TL',
          workType: 'Ofis',
        },
      },
      {
        title: 'Data Analyst — e-ticaret (İstanbul hibrit)',
        short_description:
          'Pazaryeri ve D2C metrikleri. SQL + Looker/Metabase. 2–4 yıl deneyim.',
        long_description: `## İş
Cohort, birim ekonomi, kampanya analizi.

## Stack
BigQuery/SQL, Python bonus.

## Ortam
Hibrit, 2 gün ofis.`,
        city: 'İstanbul',
        district: 'Şişli',
        industry: 'E-ticaret',
        remote_policy: 'hybrid',
        custom_fields: {
          position: 'Data Analyst',
          experienceLevel: 'Mid (2-4 yıl)',
          salaryRange: '45.000 - 65.000 TL',
          workType: 'Hibrit',
        },
      },
      {
        title: 'Müşteri Başarı Uzmanı (CSM) — SaaS',
        short_description:
          'Onboarding ve churn önleme. 40 hesap portföyü. İyi iletişim, SaaS deneyimi artı.',
        long_description: `## Görev
Kickoff, QBR, yenileme.

## KPI
NRR, churn, CSAT.

## Lokasyon
Antalya ofis veya remote (TR saatleri).`,
        city: 'Antalya',
        district: 'Konyaaltı',
        industry: 'SaaS',
        remote_policy: 'hybrid',
        custom_fields: {
          position: 'Customer Success',
          experienceLevel: 'Mid (2-4 yıl)',
          salaryRange: '40.000 - 55.000 TL',
          workType: 'Hibrit',
        },
      },
    ],
  },
  {
    label: 'Dijital ve AI Çözümleri',
    typeSlugs: ['dijital-ai-cozum'],
    categorySlugs: ['dijital-ai'],
    moduleKey: null,
    fallbackCategoryId: DIJITAL_AI_CATEGORY_ID,
    fallbackTypeId: DIJITAL_AI_TYPE_ID,
    listings: [
      {
        title: 'WhatsApp satış asistanı — KOBİ’ler için hazır AI ajan',
        short_description:
          'Sipariş, SSS ve randevu. 7 günde canlı. Aylık abonelik + kurulum. TR dil modeli ince ayarlı.',
        long_description: `## Çözüm
Hazır WhatsApp AI ajanı; katalog ve stok bağlantısı.

## Teslim
Kurulum 7 gün, eğitim 1 oturum.

## Fiyatlandırma
Kurulum + aylık kullanım. Demo mevcut.`,
        city: 'İstanbul',
        district: 'Üsküdar',
        industry: 'Yapay zeka',
        remote_policy: 'remote',
        custom_fields: {
          solutionType: 'AI Asistan / Chatbot',
          deliveryModel: 'SaaS abonelik',
          targetAudience: 'KOBİ',
          capabilities: ['Müşteri desteği', 'Satış otomasyonu', 'WhatsApp entegrasyonu'],
          languages: ['Türkçe'],
        },
      },
      {
        title: 'E-ticaret ürün açıklaması ve SEO metin otomasyonu',
        short_description:
          'Pazaryeri / Shopify için toplu içerik üretimi. Marka tonu profili + kalite kontrol paneli.',
        long_description: `## Kullanım
CSV/API ile ürün basma, TR/EN çıktı.

## Sonuç
İçerik ekibinde %60 süre tasarrufu (pilot).

## Model
Kredi paketi veya aylık plan.`,
        city: 'İstanbul',
        district: 'Bakırköy',
        industry: 'E-ticaret',
        remote_policy: 'remote',
        custom_fields: {
          solutionType: 'İçerik / SEO AI',
          deliveryModel: 'SaaS abonelik',
          targetAudience: 'E-ticaret markaları',
          capabilities: ['İçerik üretimi', 'SEO', 'Toplu işlem'],
          languages: ['Türkçe', 'İngilizce'],
        },
      },
      {
        title: 'Çağrı merkezi sesli AI — banka / telecom pilot paketi',
        short_description:
          'IVR sonrası niyet sınıflandırma ve özet. On-prem veya VPC. KVKK uyumlu mimari.',
        long_description: `## Kapsam
Niyet, sentiment, agent assist özeti.

## Kurulum
8–12 haftalık pilot.

## Uyum
Log maskeleme, rol bazlı erişim.`,
        city: 'Ankara',
        district: 'Çankaya',
        industry: 'Yapay zeka',
        remote_policy: 'hybrid',
        custom_fields: {
          solutionType: 'Sesli AI / Call center',
          deliveryModel: 'Kurumsal lisans + kurulum',
          targetAudience: 'Kurumsal',
          capabilities: ['Ses işleme', 'Agent assist', 'Analitik'],
          languages: ['Türkçe'],
        },
      },
      {
        title: 'İşe alım CV eleme ve mülakat soru asistanı',
        short_description:
          'ATS eklentisi. Rol profiline göre skor + soru seti. İnsan onaylı kısa liste.',
        long_description: `## Entegrasyon
Greenhouse / özel ATS webhook.

## Değer
Ön eleme süresini kısaltır, bias kontrol checklist’i var.

## Satış
HR ekiplerine aylık koltuk.`,
        city: 'İzmir',
        district: 'Konak',
        industry: 'İnsan kaynakları',
        remote_policy: 'remote',
        custom_fields: {
          solutionType: 'İK / İşe alım AI',
          deliveryModel: 'SaaS abonelik',
          targetAudience: 'İK ekipleri',
          capabilities: ['CV analiz', 'Mülakat desteği', 'ATS entegrasyonu'],
          languages: ['Türkçe', 'İngilizce'],
        },
      },
      {
        title: 'Üretim hattı görüntü kontrolü — kalite AI kiti',
        short_description:
          'Kamera + edge model. Çizik/eksik parça tespiti. Fabrika sahasında 4–6 haftada POC.',
        long_description: `## Donanım
Endüstriyel kamera önerisi + edge box.

## Yazılım
Dashboard, alarm, vardiya raporu.

## POC
Tek hat, başarı kriteri birlikte tanımlanır.`,
        city: 'Kocaeli',
        district: 'Gebze',
        industry: 'Üretim',
        remote_policy: 'onsite',
        custom_fields: {
          solutionType: 'Görüntü / kalite AI',
          deliveryModel: 'POC + lisans',
          targetAudience: 'Üretici firmalar',
          capabilities: ['Görüntü işleme', 'Kalite kontrol', 'Edge inference'],
          languages: ['Türkçe'],
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
        anonymous_mode: false,
        ...contacts,
        custom_fields: item.custom_fields,
        view_count: 80 + index * 17,
        interested_count: 3 + (index % 12),
        application_count: 1 + (index % 8),
        is_verified: index % 3 === 0,
        is_featured: index <= 5,
        is_urgent: index % 7 === 0,
        featured_until: index <= 5 ? daysFromNow(30) : null,
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

  const { count } = await supabase
    .from('marketplace_listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('deleted_at', null);

  console.log('Done. Published listings:', count);
  for (const r of rows) {
    console.log(' -', r.title);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
