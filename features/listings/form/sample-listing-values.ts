/**
 * Sample fill values for listing create wizards (dev / ?demo=1).
 * Placeholders meet min lengths used by the form validators.
 */
import type { CategoryId } from '@/lib/domain/ids';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';
import type { ListingFormValues } from '@/features/listings/form/category-listing-form';
import { createEmptyCareerExperience } from '@/features/candidates/config/career-profile-fields';

type SamplePatch = {
  core?: Partial<ListingFormValues['core']>;
  customFields?: ListingFormValues['customFields'];
  tags?: ListingFormValues['tags'];
  images?: ListingFormValues['images'];
};

export function getSampleListingValues(categoryId: CategoryId): SamplePatch | null {
  switch (categoryId) {
    case CATEGORY_IDS.yatirimBul:
      return {
        core: {
          title: 'FaturaAI',
          shortDescription:
            'FaturaAI, SaaS / Yazılım alanında MVP aşaması bir girişimdir; KOBİ müşterilere yöneliktir; 2.500.000 - 5.000.000 TL yatırım aramaktadır.',
          longDescription:
            'FaturaAI SaaS / Yazılım sektöründe, MVP aşaması bir girişimdir. Çözülen problem: KOBİ’lerin fatura ve stok takibi dağınık ve manuel. Çözüm: Tek panelde fatura, stok ve nakit akışını birleştiren SaaS. Hedef müşteri KOBİ; iş modeli SaaS, Abonelik. Mevcut durum: MVP, İlk gelir, İlk müşteriler. Girilen traction: MRR 120.000 TL, Aktif müşteri 14. 2.500.000 - 5.000.000 TL yatırım aranıyor; %12 hisse teklif ediliyor. Yatırım Ürün geliştirme, Satış için kullanılacak. Farklılaşma: Sektöre özel muhasebe şablonları ve hızlı kurulum.',
          city: 'İstanbul',
          country: 'TR',
          remotePolicy: null,
        },
        customFields: {
          sector: 'SaaS / Yazılım',
          stage: 'MVP aşaması',
          productStatus: 'MVP',
          productName: 'FaturaAI',
          foundedYear: '2024',
          businessModel: ['SaaS', 'Abonelik'],
          targetCustomer: ['B2B', 'KOBİ'],
          problem: 'KOBİ’lerin fatura ve stok takibi dağınık ve manuel',
          solution: 'Tek panelde fatura, stok ve nakit akışını birleştiren SaaS',
          differentiation: 'Sektöre özel muhasebe şablonları ve hızlı kurulum',
          revenueStatus: 'İlk gelir',
          tractionStatus: 'İlk müşteriler',
          mrr: '120.000 TL',
          activeCustomers: '14',
          investmentAmount: '2.500.000 - 5.000.000 TL',
          equityOffered: 12,
          useOfFunds: ['Ürün geliştirme', 'Satış'],
          founderCount: '2',
          teamSize: '3-5',
          founderExpertise: ['Ürün yönetimi', 'Satış'],
        },
      };
    case CATEGORY_IDS.yatirimYap:
      return {
        core: {
          title: 'Erken Aşama Yapay Zeka ve Fintech Girişimlerine Yatırım Yapıyorum',
          shortDescription:
            'Seed ve pre-seed aşamasında 500 bin–2 milyon TL bilet ile yapay zeka, fintech ve B2B SaaS girişimlerine odaklanıyorum.',
          longDescription:
            'Operasyonel geçmişim e-ticaret ve yazılım satışında. Portföyümde erken aşama ürünlere go-to-market ve kurumsal satış desteği sunuyorum. Kurucularla düzenli mentorluk yapmayı ve takip turlarında yanlarında olmayı tercih ediyorum. Türkiye merkezli, global potansiyeli olan ekiplere öncelik veriyorum.',
          city: 'İstanbul',
          country: 'TR',
          remotePolicy: null,
        },
        customFields: {
          investmentAmount: '500.000 - 1.000.000 TL',
          preferredStages: 'MVP aşaması',
          sectors: ['Yapay zeka', 'Fintech', 'SaaS / Yazılım'],
        },
      };
    case CATEGORY_IDS.iseAl:
      return {
        core: {
          title: '',
          shortDescription: '',
          longDescription:
            'Bilişim alanında kıdemli full-stack geliştirici arıyoruz. Rolde yazılım özelliklerinin geliştirilmesi, kod incelemesi ve API tasarımı sorumlulukları bekleniyor. Aranan yetkinlikler yazılım geliştirme, Agile / Scrum ve kod incelemesi. Çalışmada TypeScript, React ve Node.js kullanılır. Eğitim beklentisi Lisans — Bilgisayar Mühendisliği. İstanbul konumunda hibrit ve tam zamanlı çalışma sunuluyor; 1 ay içinde başlama. Ücret aralığı 75.000 - 100.000 TL.',
          city: null,
          country: 'TR',
          remotePolicy: null,
        },
        customFields: {
          primarySector: 'Bilişim / Yazılım',
          desiredRole: 'Full-stack geliştirici',
          experienceLevel: 'Senior',
          workType: 'Tam zamanlı',
          requiredResponsibilities:
            'Yazılım özelliklerinin geliştirilmesi · Kod incelemesi ve kalite kontrolü · API tasarımı',
          requiredAchievements: 'Özellik yayını ile ölçülebilir etki',
          professionalSkills: 'Yazılım geliştirme · Agile / Scrum · Kod incelemesi · API tasarımı',
          technicalSkills: 'TypeScript · React · Node.js · SQL · Git',
          tools: 'Notion, Jira, Figma, Slack',
          educationLevel: 'Lisans',
          educationField: 'Bilgisayar Mühendisliği',
          languages: 'İngilizce — İyi',
          languageEntries: [
            { id: 'hire-sample-lang-1', language: 'İngilizce', languageOther: '', level: 'İyi' },
          ],
          certificates: 'Scrum Master',
          preferredCity: 'İstanbul',
          preferredDistrict: 'Kadıköy',
          workplacePreference: 'Hibrit',
          salaryRange: '75.000 - 100.000 TL',
          availability: '1 ay içinde',
        },
      };
    case CATEGORY_IDS.isBul: {
      const experience = createEmptyCareerExperience();
      return {
        core: {
          title: '',
          shortDescription: '',
          longDescription:
            'Son yıllarda e-ticaret ve SaaS ürünlerinde frontend ile API geliştirme yaptım. Güçlü yanlarım TypeScript, takım içi kod kalitesi ve kullanıcı odaklı düşünmek. Kısa vadede ürün ekibinde kıdemli geliştirici veya teknik liderlik yolunda ilerlemek istiyorum.',
          city: null,
          country: 'TR',
          remotePolicy: null,
        },
        customFields: {
          primarySector: 'Bilişim / Yazılım',
          desiredRole: 'Full-stack geliştirici',
          experienceLevel: 'Mid',
          workType: 'Tam zamanlı',
          profileGender: 'Belirtmek istemiyorum',
          residenceCity: 'İstanbul',
          residenceDistrict: 'Kadıköy',
          professionalSkills: 'Yazılım geliştirme · Agile / Scrum · Kod incelemesi · API tasarımı',
          technicalSkills: 'TypeScript · React · Node.js · SQL · Git',
          tools: 'Notion, Jira, Figma, Slack',
          educationLevel: 'Lisans',
          educationField: 'Bilgisayar Mühendisliği',
          languages: 'İngilizce — İyi',
          languageEntries: [
            { id: 'sample-lang-1', language: 'İngilizce', languageOther: '', level: 'İyi' },
          ],
          certificates: 'Scrum Master',
          preferredSectors: ['Bilişim / Yazılım', 'E-ticaret / Pazaryeri'],
          preferredRoles: ['Frontend geliştirici', 'Ürün yöneticisi'],
          preferredCity: 'İstanbul',
          preferredDistrict: 'Kadıköy',
          workplacePreference: 'Hibrit',
          salaryExpectation: '75.000 - 100.000 TL',
          availability: '1 ay içinde',
          experiences: [
            {
              ...experience,
              sector: 'Bilişim / Yazılım',
              role: 'Full-stack geliştirici',
              company: '',
              startMonth: 3,
              startYear: 2021,
              endMonth: 7,
              endYear: 2024,
              isCurrent: false,
              duration: 'Mart 2021 – Temmuz 2024',
              selectedResponsibilities: [
                'Yazılım özelliklerinin geliştirilmesi',
                'Kod incelemesi ve kalite kontrolü',
                'API tasarımı',
              ],
              responsibilities:
                'Yazılım özelliklerinin geliştirilmesi\nKod incelemesi ve kalite kontrolü\nAPI tasarımı',
              selectedAchievements: ['Özellik yayını ile ölçülebilir etki'],
              achievements: 'Özellik yayını ile ölçülebilir etki',
              achievementMetric: '%15 dönüşüm artışı',
            },
          ],
        },
      };
    }
    case CATEGORY_IDS.ortakBul:
      return {
        core: {
          title: 'Ürün Odaklı Teknik Kurucu Ortak Arıyoruz',
          shortDescription:
            'Pazara çıkmış mobil ürünümüz için yazılım ve ürün yönetimi deneyimli teknik kurucu ortak arıyoruz; equity konuşulur.',
          longDescription:
            'Mevcut ekipte iş geliştirme ve tasarım var; teknik liderlik ve mimari eksik. Haftalık düzenli katkı ve uzun vadeli ortaklık bekliyoruz. Equity aralığı ve roller şeffaf konuşulacak. Tercihen İstanbul veya güçlü uzaktan çalışma disiplinine sahip bir ortak arıyoruz. İlk görüşmede ürün demosu ve yol haritası paylaşılır.',
          city: 'İstanbul',
          country: 'TR',
          remotePolicy: null,
        },
        customFields: {
          partnershipType: 'Kurucu Ortak',
          expertise: ['CTO / Teknik liderlik', 'Yazılım geliştirme'],
          commitment: 'Tam zamanlı',
        },
      };
    case CATEGORY_IDS.dijitalAi:
      return {
        core: {
          title: 'KOBİ Satış Ekipleri İçin Yapay Zeka Asistanı',
          shortDescription:
            'Satış ekiplerinin teklif ve takip işlerini hızlandıran, Türkçe konuşan yapay zeka asistanı; abonelik modeliyle sunulur.',
          longDescription:
            'Çözüm CRM ve e-posta araçlarıyla entegre çalışır. Kullanım senaryoları: lead nitelendirme, teklif taslağı ve hatırlatma. Kurulum birkaç gün sürer; eğitim ve destek dahildir. KOBİ ve orta ölçekli firmalara uygundur. Fiyat paketlere göre değişir; demo talebi sonrası ihtiyaç analizi yapılır. Veri güvenliği ve KVKK uyumu önceliğimizdir.',
          city: 'İstanbul',
          country: 'TR',
          remotePolicy: null,
        },
        customFields: {
          solutionType: 'Yapay zeka asistanı / ajan',
          deliveryModel: 'Abonelik (SaaS)',
          targetAudience: 'KOBİ',
          priceRange: '5.000 - 25.000 TL',
          capabilities: [],
          supportedLanguages: ['Türkçe', 'İngilizce'],
        },
      };
    case CATEGORY_IDS.genelIlan:
      return {
        core: {
          title: 'Ofis Mobilyası Seti — Toplu Alıma Uygun',
          shortDescription:
            'Az kullanılmış ofis masa ve sandalye seti; yerinde teslim veya nakliye seçenekleri mevcuttur.',
          longDescription:
            'Ürünler iyi durumda, petekli ofis kullanımı için uygundur. Adet ve renk seçenekleri stok durumuna göre değişir. Fiyat pazarlığa açıktır; faturalı satış yapılabilir. Teslimat İstanbul içi planlanır, diğer şehirler için kargo maliyeti ayrıca konuşulur. Görüşme sonrası net teklif paylaşılır.',
          city: 'İstanbul',
          country: 'TR',
          remotePolicy: null,
        },
        customFields: {
          listingKind: 'Ürün',
          condition: 'Az kullanılmış',
          priceRange: '25.000 - 100.000 TL',
          sector: 'Perakende',
        },
      };
    case CATEGORY_IDS.bayilikAl:
      return {
        core: {
          title: 'Ev Tipi Kahve ve Atıştırmalık Franchise Fırsatı',
          shortDescription:
            '2016’dan beri büyüyen markamız; eğitim, lokasyon ve açılış desteğiyle yeni franchise ortakları arıyoruz.',
          longDescription:
            'Markamız kahve ve atıştırmalık segmentinde hizmet veriyor. Franchise paketine eğitim, standart reçete, pazarlama kiti ve saha desteği dahildir. Yatırım aralığı şehre göre değişir; geri dönüş süresi lokasyona bağlıdır. Adaylardan işletme deneyimi veya güçlü operasyon disiplini bekleriz. Detaylı sunum ve örnek sözleşme görüşmede paylaşılır.',
          city: 'İstanbul',
          country: 'TR',
          remotePolicy: null,
        },
        customFields: {
          companyName: 'Örnek Kahve Markası A.Ş.',
          establishmentYear: 2016,
          sector: 'Gıda & İçecek',
          branchCount: 12,
          totalInvestment: 2500000,
          entryFee: 150000,
          franchiseFee: 350000,
          profitMargin: 22,
          royaltyFee: 5,
          advertisingFee: 2,
          returnPeriod: '18-24 ay',
          averageSetupDuration: '2-3 ay',
          minSquareMeters: 80,
          availableCities: ['İstanbul', 'Ankara', 'İzmir'],
          storeSize: '50-100 m²',
          businessCategory: 'Cafe & Restoran',
          minCapitalRequirement: 800000,
          mallAvailable: true,
          streetStoreAvailable: true,
          trainingSupport: true,
          operationalSupport: true,
          marketingSupport: true,
        },
      };
    default:
      return null;
  }
}
