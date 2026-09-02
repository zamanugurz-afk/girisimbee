import { describe, it, expect, beforeEach } from 'vitest';
import { createEcosystemTestHarness, TEST_USER, TEST_PROFILE } from '@/lib/testing/ecosystem-test-fixtures';
import { CATEGORY_IDS, LISTING_TYPE_IDS } from '@/features/listings/config/listing-type-config';
import { getMockPublishedMarketItems } from '@/features/admin/market/mock/market.mock';
import {
  MARKET_AD_PRICE_TL,
  AD_INQUIRY_KIND_LABELS,
  ADS_ROUTES,
} from '@/features/ads/constants/ad-inquiry.constants';
import { aggregateToListingDetail } from '@/features/listings/mappers/listing-detail.mapper';

describe('Gece Çalışması — Tüm Kategorilerde Manuel İlan & Market/Reklam Doğrulaması', () => {
  let harness: ReturnType<typeof createEcosystemTestHarness>;

  beforeEach(() => {
    harness = createEcosystemTestHarness();
  });

  it('1. Girişimci / Yatırım Arıyorum — 5 Manuel İlan Başarıyla Yayınlanır', async () => {
    const { entrepreneurService } = harness.services;
    await entrepreneurService.activateProfile(TEST_PROFILE);

    const listings = [
      {
        title: 'Tarım Teknolojileri & IoT Tabanlı Akıllı Sulama Girişimi (AgriSense)',
        shortDescription: 'Yapay zeka destekli toprak sensörleri ve mobil kontrol sistemi.',
        city: 'İzmir',
        industry: 'Tarım Teknolojileri',
        fundingGoal: 2500000,
        valuation: 15000000,
        equityOffered: 15,
      },
      {
        title: 'Yeni Nesil B2B Lojistik & Yük Optimizasyon SaaS Platformu (YolPay)',
        shortDescription: 'Kamyon ve tırların boş dönüşlerini engelleyen lojistik SaaS.',
        city: 'İstanbul',
        industry: 'Lojistik & Taşımacılık',
        fundingGoal: 4000000,
        valuation: 25000000,
        equityOffered: 12,
      },
      {
        title: 'Sağlık Turizmi & Çok Dilli Tele-Tıp Asistanı (HealPass)',
        shortDescription: 'Yurtdışından gelen hastalar ile Türkiye kliniklerini eşleştiren platform.',
        city: 'Antalya',
        industry: 'Sağlık & MedTech',
        fundingGoal: 1800000,
        valuation: 12000000,
        equityOffered: 10,
      },
      {
        title: 'Biyoplastik & Geri Dönüştürülebilir Kahve Posası Ambalaj Üretimi',
        shortDescription: 'Kahve posasını endüstriyel ambalaj ve kurye poşetine dönüştüren girişim.',
        city: 'Bursa',
        industry: 'Sürdürülebilirlik & Kimya',
        fundingGoal: 5000000,
        valuation: 30000000,
        equityOffered: 18,
      },
      {
        title: 'Restoran ve Kafeler için AI Sesli Sipariş ve Kasa Terminali',
        shortDescription: 'Drive-thru ve masa siparişlerinde sesi anında POS sistemine giren yapay zeka.',
        city: 'Ankara',
        industry: 'Yapay Zeka & Perakende',
        fundingGoal: 3000000,
        valuation: 20000000,
        equityOffered: 12,
      },
    ];

    for (const item of listings) {
      const created = await entrepreneurService.createStartupListing({
        ownerId: TEST_USER,
        profileId: TEST_PROFILE,
        asDraft: false,
        listing: item,
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe(item.title);
      expect(created.status).toBe('published');
      expect(created.slug).toBeTruthy();

      const detail = aggregateToListingDetail({
        listing: created,
        tags: [],
        images: [],
        activityHistory: [],
      });
      expect(detail.id).toBe(created.slug);
      expect(detail.title).toBe(item.title);
      expect(detail.location).toContain(item.city);
    }
  });

  it('2. Yatırımcı / Yatırım Yapıyorum — 5 Manuel İlan Başarıyla Yayınlanır', async () => {
    const { investorService } = harness.services;
    await investorService.activateProfile(TEST_PROFILE);

    const listings = [
      {
        title: 'Erken Aşama B2B SaaS ve AI Girişimlerine 500K-3M TL Melek Yatırım',
        shortDescription: 'ARR üretmiş veya güçlü MVP sahibi yazılım girişimlerine sermaye.',
        city: 'İstanbul',
        ticketMin: 500000,
        ticketMax: 3000000,
        sectors: ['SaaS', 'Yapay Zeka'],
      },
      {
        title: 'Gıda ve Tarım Teknolojileri Girişimlerine Stratejik Fon ve Distribütörlük',
        shortDescription: 'Tarımda verimlilik ve soğuk zincir takip sistemlerine sermaye.',
        city: 'İzmir',
        ticketMin: 2000000,
        ticketMax: 8000000,
        sectors: ['AgriTech', 'FoodTech'],
      },
      {
        title: 'E-Ticaret ve D2C Markalarına Özel Gelir Paylaşımlı Büyüme Sermayesi',
        shortDescription: 'Aylık cirosu 500K TL üzeri e-ticaret markalarına stok ve pazarlama fonu.',
        city: 'İstanbul',
        ticketMin: 1000000,
        ticketMax: 5000000,
        sectors: ['E-Ticaret', 'D2C'],
      },
      {
        title: 'Oyun ve Eğlence Teknolojileri Stüdyolarına Yayıncılık & Finansman',
        shortDescription: 'Mobil ve PC oyun stüdyolarına doğrudan proje bazlı yatırım.',
        city: 'Ankara',
        ticketMin: 1500000,
        ticketMax: 6000000,
        sectors: ['Gaming', 'Animasyon'],
      },
      {
        title: 'Yenilenebilir Enerji ve Karbon Ayak İzi Projelerine Etki Yatırımı',
        shortDescription: 'Güneş enerjisi ve batarya depolama teknolojilerine finansman.',
        city: 'Bursa',
        ticketMin: 3000000,
        ticketMax: 10000000,
        sectors: ['CleanTech', 'Energy'],
      },
    ];

    for (const item of listings) {
      const created = await investorService.createThesisListing({
        ownerId: TEST_USER,
        profileId: TEST_PROFILE,
        asDraft: false,
        listing: item,
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe(item.title);
      expect(created.status).toBe('published');
      expect(created.slug).toBeTruthy();

      const detail = aggregateToListingDetail({
        listing: created,
        tags: [],
        images: [],
        activityHistory: [],
      });
      expect(detail.id).toBe(created.slug);
      expect(detail.title).toBe(item.title);
      expect(detail.location).toContain(item.city);
    }
  });

  it('3. İş Arıyorum (Aday / Kariyer Profili) — 5 Manuel İlan Başarıyla Yayınlanır', async () => {
    const { candidateService } = harness.services;
    await candidateService.activateProfile(TEST_PROFILE);

    const listings = [
      {
        title: 'Senior Full Stack & AI Entegrasyon Mühendisi (React, Node.js, Python)',
        shortDescription: '8+ yıl deneyimli yazılım mühendisi. LLM entegrasyonları uzmanı.',
        longDescription: 'Kapsamlı mikroservis, bulut ve LLM prompt mimarisi deneyimi.',
        city: 'İstanbul',
        desiredRole: 'Senior Full Stack Developer',
        experienceLevel: 'Senior',
        workType: 'Remote',
        experiences: [
          {
            sector: 'Yazılım',
            role: 'Senior Full Stack Developer',
            company: 'Tech Solutions A.Ş.',
            startMonth: 1,
            startYear: 2021,
            isCurrent: true,
            responsibilities: 'Bulut altyapısı ve backend mikroservis mimarisi geliştirme.',
          },
        ],
      },
      {
        title: 'Büyüme & Performans Pazarlama Yöneticisi (Head of Growth / Performance)',
        shortDescription: 'B2B SaaS ve e-ticaret markalarında ROAS ve CAC optimizasyon lideri.',
        longDescription: 'Dijital reklam bütçe yönetimi, funnel ve kullanıcı edinimi uzmanı.',
        city: 'İzmir',
        desiredRole: 'Growth Marketing Lead',
        experienceLevel: 'Lead',
        workType: 'Remote',
        experiences: [
          {
            sector: 'Pazarlama',
            role: 'Growth Marketing Lead',
            company: 'GrowthHub',
            startMonth: 3,
            startYear: 2020,
            isCurrent: true,
            responsibilities: 'Performans reklamları ve veri analitiği yönetimi.',
          },
        ],
      },
      {
        title: 'Kıdemli Ürün Yöneticisi (Senior Product Manager) — FinTech & Ödeme',
        shortDescription: 'Ödeme geçitleri ve sanal POS regülasyonlarında 6+ yıl ürün stratejisti.',
        longDescription: 'Ödeme sistemleri, regülasyon ve çevik ürün yol haritası yönetimi.',
        city: 'İstanbul',
        desiredRole: 'Senior Product Manager',
        experienceLevel: 'Senior',
        workType: 'Hybrid',
        experiences: [
          {
            sector: 'Finans',
            role: 'Senior Product Manager',
            company: 'PayTech Ltd.',
            startMonth: 6,
            startYear: 2019,
            isCurrent: true,
            responsibilities: 'Ödeme ağ geçidi ürün yol haritası ve sprint yönetimi.',
          },
        ],
      },
      {
        title: 'UI/UX & Tasarım Sistemleri Uzmanı (Lead Product Designer)',
        shortDescription: 'Kullanıcı odaklı mobil ve web arayüzleri oluşturan ürün tasarımcısı.',
        longDescription: 'Figma tasarım sistemleri, kullanıcı deneyimi araştırmaları ve prototipleme.',
        city: 'Ankara',
        desiredRole: 'Lead UI/UX Designer',
        experienceLevel: 'Senior',
        workType: 'Remote',
        experiences: [
          {
            sector: 'Tasarım',
            role: 'Lead UI/UX Designer',
            company: 'DesignCraft Studio',
            startMonth: 2,
            startYear: 2020,
            isCurrent: true,
            responsibilities: 'Design system ve kullanıcı arayüzü tasarımı.',
          },
        ],
      },
      {
        title: 'Kurumsal İnsan Kaynakları & Yetenek Kazanımı Yöneticisi (Talent Partner)',
        shortDescription: 'Teknoloji şirketlerinde 200+ mühendis istihdamı yönetmiş İK uzmanı.',
        longDescription: 'Teknik yetenek kazanımı, mülakat süreçleri ve kurum kültürü.',
        city: 'İstanbul',
        desiredRole: 'Head of Talent',
        experienceLevel: 'Manager',
        workType: 'Office',
        experiences: [
          {
            sector: 'İnsan Kaynakları',
            role: 'Head of Talent',
            company: 'Global Talent HR',
            startMonth: 5,
            startYear: 2018,
            isCurrent: true,
            responsibilities: 'Mühendis işe alım süreçleri ve oryantasyon yönetimi.',
          },
        ],
      },
    ];

    for (const item of listings) {
      const created = await candidateService.createCandidateListing({
        ownerId: TEST_USER,
        profileId: TEST_PROFILE,
        asDraft: false,
        listing: item as any,
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe(item.title);
      expect(created.status).toBe('published');
      expect(created.slug).toBeTruthy();

      const detail = aggregateToListingDetail({
        listing: created,
        tags: [],
        images: [],
        activityHistory: [],
      });
      expect(detail.id).toBe(created.slug);
      expect(detail.title).toBe(item.title);
      expect(detail.location).toContain(item.city);
    }
  });

  it('4. İşe Alıyorum (İşveren / Açık Pozisyon) — 5 Manuel İlan Başarıyla Yayınlanır', async () => {
    const { employerService } = harness.services;
    await employerService.activateProfile(TEST_PROFILE);

    const listings = [
      {
        title: 'Kıdemli Flutter & Mobil Uygulama Geliştiricisi (Senior Mobile Dev)',
        shortDescription: '1M+ indirmeye sahip küresel mobil uygulamamız için uzman geliştirici.',
        city: 'İstanbul',
        positionTitle: 'Senior Flutter Developer',
        experienceLevel: 'Senior',
        companyName: 'TechNova A.Ş.',
      },
      {
        title: 'Kurumsal Satış ve İş Geliştirme Müdürü (Enterprise Sales Executive)',
        shortDescription: 'B2B SaaS ürünlerimizin kurumsal müşterilere satışını yönetecek lider.',
        city: 'İstanbul',
        positionTitle: 'Enterprise Sales Manager',
        experienceLevel: 'Manager',
        companyName: 'CloudCorp Ltd.',
      },
      {
        title: 'DevOps & Bulut Güvenlik Mühendisi (AWS / Kubernetes)',
        shortDescription: '7/24 kesintisiz çalışan mikroservis mimarimizin güvenliğini yönetecek mühendis.',
        city: 'Ankara',
        positionTitle: 'DevOps Engineer',
        experienceLevel: 'Mid-Senior',
        companyName: 'InfraSecure',
      },
      {
        title: 'Grafik Tasarımcı & Sosyal Medya Görsel İçerik Uzmanı',
        shortDescription: 'Markalarımızın sosyal medya kampanyalarını hazırlayacak yaratıcı tasarımcı.',
        city: 'İzmir',
        positionTitle: 'Visual Designer',
        experienceLevel: 'Mid',
        companyName: 'CreativeStudio',
      },
      {
        title: 'Restoran Şube Müdürü & Servis Operasyon Şefi (Gıda & Hizmet)',
        shortDescription: 'Zincir restoranımızın yeni şubesinde salon ve mutfak koordinasyonu.',
        city: 'Antalya',
        positionTitle: 'Şube Müdürü',
        experienceLevel: 'Manager',
        companyName: 'Kahve Durağı A.Ş.',
      },
    ];

    for (const item of listings) {
      const created = await employerService.createJobListing({
        ownerId: TEST_USER,
        profileId: TEST_PROFILE,
        asDraft: false,
        listing: item,
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe(item.title);
      expect(created.status).toBe('published');
      expect(created.slug).toBeTruthy();

      const detail = aggregateToListingDetail({
        listing: created,
        tags: [],
        images: [],
        activityHistory: [],
      });
      expect(detail.id).toBe(created.slug);
      expect(detail.title).toBe(item.title);
      expect(detail.location).toContain(item.city);
    }
  });

  it('5. Kurucu Ortak Arayışı (Founders) — 5 Manuel İlan Başarıyla Yayınlanır', async () => {
    const { founderService } = harness.services;
    await founderService.activateProfile(TEST_PROFILE);

    const listings = [
      {
        title: 'FinTech Girişimimize Eş-Kurucu Teknik Ortak (CTO / Co-Founder)',
        shortDescription: 'Lisanslı ödeme kuruluşu altyapısı için hisse paylaşımlı CTO arıyoruz.',
        city: 'İstanbul',
        founderType: 'technical',
        startupStage: 'mvp',
      },
      {
        title: 'Yapay Zeka Hukuk Asistanı için Hukukçu / Avukat Kurucu Ortak',
        shortDescription: 'İçtihat ve sözleşme analiz platformumuza mevzuat bilgisi sağlayacak ortak.',
        city: 'Ankara',
        founderType: 'industry_expert',
        startupStage: 'idea',
      },
      {
        title: 'E-İhracat ve Amazon/Etsy Mağazalarımıza Sermaye & Büyüme Ortağı',
        shortDescription: 'Avrupa ve ABD pazarına ihracat yapan mağazalarımıza sermaye ortağı.',
        city: 'Bursa',
        founderType: 'financial',
        startupStage: 'growth',
      },
      {
        title: 'Mikro-Mobilite & Elektrikli Scooter için Saha Operasyon Ortağı (COO)',
        shortDescription: 'Filomuz için saha operasyonunu yürütecek dinamik operasyonel ortak.',
        city: 'Eskişehir',
        founderType: 'operational',
        startupStage: 'launched',
      },
      {
        title: 'EdTech / Yeni Nesil Çocuk Kodlama Platformuna Pazarlama Ortağı (CMO)',
        shortDescription: 'Platformumuzun okullara ve velilere ulaşmasını sağlayacak pazarlama ortağı.',
        city: 'İzmir',
        founderType: 'marketing',
        startupStage: 'mvp',
      },
    ];

    for (const item of listings) {
      const created = await founderService.createCofounderListing({
        ownerId: TEST_USER,
        profileId: TEST_PROFILE,
        asDraft: false,
        listing: item,
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe(item.title);
      expect(created.status).toBe('published');
      expect(created.slug).toBeTruthy();

      const detail = aggregateToListingDetail({
        listing: created,
        tags: [],
        images: [],
        activityHistory: [],
      });
      expect(detail.id).toBe(created.slug);
      expect(detail.title).toBe(item.title);
      expect(detail.location).toContain(item.city);
    }
  });

  it('6. Franchise & Bayilik (Franchise) — 5 Manuel İlan Başarıyla Yayınlanır', async () => {
    const { franchiseService } = harness.services;
    await franchiseService.activateProfile(TEST_PROFILE, 'give');

    const listings = [
      {
        title: '3. Nesil Nitelikli Kahve & Kruvasan Zinciri Şube Bayiliği',
        shortDescription: 'Türkiye genelinde 28 şubesi olan kahve markamızın anahtar teslim şube konsepti.',
        city: 'İstanbul',
        franchiseFee: 450000,
        totalInvestmentMin: 2200000,
        totalInvestmentMax: 3000000,
      },
      {
        title: 'Oto Ekspertiz & TSE Onaylı Mobil Araç Muayene Bayilik Ağı',
        shortDescription: 'Son teknoloji diagnostik cihazlar ve garantili raporlama altyapısı.',
        city: 'Kocaeli',
        franchiseFee: 300000,
        totalInvestmentMin: 1400000,
        totalInvestmentMax: 2000000,
      },
      {
        title: 'Sıfır Atık Ekolojik Deterjan & Temizlik Dolum İstasyonları Bayiliği',
        shortDescription: 'Tüketicilerin kendi şişeleriyle doldurabildiği çevreci temizlik konsepti.',
        city: 'İzmir',
        franchiseFee: 150000,
        totalInvestmentMin: 650000,
        totalInvestmentMax: 900000,
      },
      {
        title: 'Fast-Casual Gurme Burger & Tavuk Restoranı Bayiliği',
        shortDescription: 'Özel marinasyon sosları ve taze ekmek üretimiyle paket servis ve restoranda yüksek ciro.',
        city: 'Adana',
        franchiseFee: 350000,
        totalInvestmentMin: 1800000,
        totalInvestmentMax: 2500000,
      },
      {
        title: 'Robotik Kodlama ve Çocuk Zeka Oyunları Atölyesi Bayiliği',
        shortDescription: '4-14 yaş arası çocuklara yönelik MEB uyumlu STEM ve kodlama eğitim müfredatı.',
        city: 'Bursa',
        franchiseFee: 200000,
        totalInvestmentMin: 750000,
        totalInvestmentMax: 1100000,
      },
    ];

    for (const item of listings) {
      const created = await franchiseService.createListing({
        ownerId: TEST_USER,
        profileId: TEST_PROFILE,
        flow: 'give',
        asDraft: false,
        listing: item,
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe(item.title);
      expect(created.status).toBe('published');
      expect(created.slug).toBeTruthy();

      const detail = aggregateToListingDetail({
        listing: created,
        tags: [],
        images: [],
        activityHistory: [],
      });
      expect(detail.id).toBe(created.slug);
      expect(detail.title).toBe(item.title);
      expect(detail.location).toContain(item.city);
    }
  });

  it('7. İşletme Devri, Dijital AI ve Hizmetler Kategorileri — Doğrudan Başarıyla Yayınlanır', async () => {
    const { listingRepository } = harness.repos;

    const specialListings = [
      // İşletme Devri
      {
        title: 'Kadıköy Moda Caddesi’nde Aktif Müşterili Devren Kahve Dükkanı',
        shortDescription: 'Tüm ekipmanları eksiksiz bahçeli ruhsatlı devren kafe.',
        city: 'İstanbul',
        categoryId: CATEGORY_IDS.isletmeDevri,
        listingTypeId: LISTING_TYPE_IDS.businessTransferSell,
      },
      // Dijital AI
      {
        title: 'E-Ticaret için AI Destekli Ürün Fotoğrafı Arka Plan Değiştirici (PhotoAI)',
        shortDescription: 'Tek tıkla stüdyo kalitesinde e-ticaret görseli üreten hazır mikro SaaS.',
        city: 'İstanbul',
        categoryId: CATEGORY_IDS.dijitalAi,
        listingTypeId: LISTING_TYPE_IDS.dijitalAiDefault,
      },
      // Hizmetler
      {
        title: 'Uçtan Uca Mobil ve Web Yazılım Geliştirme & AI Entegrasyon Hizmeti',
        shortDescription: 'Girişimler ve KOBİ’ler için hızlı MVP üretimi ve mobil uygulama ajans hizmeti.',
        city: 'İstanbul',
        categoryId: CATEGORY_IDS.hizmetler,
        listingTypeId: LISTING_TYPE_IDS.serviceDefault,
      },
    ];

    for (const item of specialListings) {
      const created = await listingRepository.create({
        ownerId: TEST_USER,
        title: item.title,
        shortDescription: item.shortDescription,
        city: item.city,
        categoryId: item.categoryId,
        listingTypeId: item.listingTypeId,
        status: 'published',
        workflowStatus: 'published',
      });

      expect(created.id).toBeDefined();
      expect(created.title).toBe(item.title);
      expect(created.status).toBe('published');

      const detail = aggregateToListingDetail({
        listing: created,
        tags: [],
        images: [],
        activityHistory: [],
      });
      expect(detail.id).toBe(created.slug);
      expect(detail.title).toBe(item.title);
      expect(detail.location).toContain(item.city);
    }
  });

  it('8. Market Kataloğu ve Reklam Paketleri Doğrulaması', () => {
    const marketItems = getMockPublishedMarketItems();
    expect(marketItems.length).toBeGreaterThan(0);
    marketItems.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.publishedAt).toBeTruthy();
      expect(item.status).toBe('published');
    });

    expect(MARKET_AD_PRICE_TL).toBe(5000);
    expect(AD_INQUIRY_KIND_LABELS.market_ad).toBe('MARKET reklamı');
    expect(ADS_ROUTES.public).toBe('/reklam');
  });
});
