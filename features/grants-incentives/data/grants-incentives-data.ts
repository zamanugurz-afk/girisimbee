import type {
  SectorIncentiveProfile,
  GrantSupportItem,
  RegionalIncentiveZone,
} from '../types/grants-incentives.types';

// =========================================================================
// 1. TÜRKİYE 81 İL BÖLGESEL YATIRIM TEŞVİK DERECELERİ (1. - 6. BÖLGE)
// =========================================================================

export const TURKEY_CITY_INCENTIVE_ZONES: Record<string, RegionalIncentiveZone> = {
  // 1. Bölge: En gelişmiş iller (İstanbul, Ankara, İzmir, Bursa, Kocaeli, Antalya, Eskişehir, Muğla)
  İstanbul: { zone: 1, zoneName: '1. Bölge (Gelişmiş Sanayi & Ticaret)', sgkEmployerShareSupportYears: 2, taxReductionRate: '%50', interestSupportPoints: 3, description: 'Gelişmiş metropol bölgesi; teknoloji, ihracat ve genç girişimci odaklı teşvikler önceliklidir.' },
  Ankara: { zone: 1, zoneName: '1. Bölge (Başkent & Teknoloji)', sgkEmployerShareSupportYears: 2, taxReductionRate: '%50', interestSupportPoints: 3, description: 'Savunma sanayii, yazılım ve Ar-Ge yatırımlarında yüksek hibe oranları.' },
  İzmir: { zone: 1, zoneName: '1. Bölge (Liman & Ticaret)', sgkEmployerShareSupportYears: 2, taxReductionRate: '%50', interestSupportPoints: 3, description: 'Ege bölgesi ana lojistik ve ticaret teşvikleri.' },
  Bursa: { zone: 1, zoneName: '1. Bölge (Otomotiv & Sanayi)', sgkEmployerShareSupportYears: 2, taxReductionRate: '%50', interestSupportPoints: 3, description: 'Sanayi ve imalat makinelerinde KOSGEB teşvikleri.' },
  Kocaeli: { zone: 1, zoneName: '1. Bölge (Ağır Sanayi & Kimya)', sgkEmployerShareSupportYears: 2, taxReductionRate: '%50', interestSupportPoints: 3, description: 'Teknopark ve üretim odaklı istihdam destekleri.' },
  Antalya: { zone: 1, zoneName: '1. Bölge (Turizm & Hizmet)', sgkEmployerShareSupportYears: 2, taxReductionRate: '%50', interestSupportPoints: 3, description: 'Turizm, gıda ve hizmet sektörü genç girişimci muafiyetleri.' },
  Eskişehir: { zone: 1, zoneName: '1. Bölge (Havacılık & Eğitim)', sgkEmployerShareSupportYears: 2, taxReductionRate: '%50', interestSupportPoints: 3, description: 'Havacılık ve dijital sektör teşvikleri.' },
  Muğla: { zone: 1, zoneName: '1. Bölge (Kıyı Turizmi & Hizmet)', sgkEmployerShareSupportYears: 2, taxReductionRate: '%50', interestSupportPoints: 3, description: 'Hizmet ve butik işletme genç girişimci destekleri.' },

  // 2. Bölge
  Adana: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Çukurova sanayi ve tarım teşvik havzası.' },
  Aydın: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Ege tarım ve turizm entegre destekleri.' },
  Balıkesir: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Marmara geçiş bölgesi üretim ve gıda teşvikleri.' },
  Denizli: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Tekstil, ihracat ve makine hibe destekleri.' },
  Edirne: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Trakya sınır ve lojistik teşvikleri.' },
  Kayseri: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'İç Anadolu sanayi ve mobilya üretim destekleri.' },
  Konya: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Tarım makineleri ve gıda imalatı teşvikleri.' },
  Manisa: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Elektronik ve beyaz eşya tedarik teşvikleri.' },
  Sakarya: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Otomotiv yan sanayi ve metal işleme destekleri.' },
  Tekirdağ: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Trakya OSB ve liman bölgesi destekleri.' },
  Yalova: { zone: 2, zoneName: '2. Bölge', sgkEmployerShareSupportYears: 3, taxReductionRate: '%55', interestSupportPoints: 4, description: 'Tersane ve kimya ihtisas teşvikleri.' },

  // 3. Bölge
  Bilecik: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Seramik ve mermer sanayi teşvikleri.' },
  Bolu: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Gıda ve doğa turizmi destekleri.' },
  Çanakkale: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Tarım ve boğaz geçiş lojistiği teşvikleri.' },
  Düzce: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Orman ürünleri ve otomotiv yan sanayi.' },
  Gaziantep: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Güneydoğu ana sanayi ve ihracat merkezi.' },
  Karabük: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Demir-çelik ve ağır metal teşvikleri.' },
  Kırklareli: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Trakya gıda ve süt ürünleri teşvikleri.' },
  Kütahya: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Porselen, çini ve madencilik destekleri.' },
  Mersin: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Akdeniz ana limanı ve lojistik teşvikleri.' },
  Samsun: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Karadeniz ana ticaret ve medikal cihaz merkezi.' },
  Trabzon: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Doğu Karadeniz lojistik ve balıkçılık teşvikleri.' },
  Uşak: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Geri dönüşüm ve deri sanayi teşvikleri.' },
  Zonguldak: { zone: 3, zoneName: '3. Bölge', sgkEmployerShareSupportYears: 5, taxReductionRate: '%60', interestSupportPoints: 5, description: 'Enerji ve maden sahası yatırımları.' },

  // 4. Bölge
  Afyonkarahisar: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Termal turizm ve et entegre teşvikleri.' },
  Amasya: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Tarım ve gıda işleme destekleri.' },
  Artvin: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Yenilenebilir enerji ve sınır ticareti.' },
  Bartın: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Ağaç işleme ve kıyı turizmi.' },
  Çorum: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Makine imalatı ve un/yem sanayi.' },
  Elazığ: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Doğu Anadolu madencilik ve hizmet merkezi.' },
  Erzincan: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Süt ürünleri ve doğa sporları turizmi.' },
  Giresun: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Fındık mamulleri ve gıda işleme.' },
  Kastamonu: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Ahşap sanayi ve sarımsak entegre tesisleri.' },
  Kırıkkale: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Silah ve metal sanayi teşvikleri.' },
  Kırşehir: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Petlas lastik yan sanayi ve jeotermal.' },
  Malatya: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Kayısı işleme ve tekstil OSB destekleri.' },
  Nevşehir: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Kapadokya turizmi ve soğuk hava depoculuğu.' },
  Rize: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Çay sanayi ve lojistik liman teşvikleri.' },
  Sivas: { zone: 4, zoneName: '4. Bölge', sgkEmployerShareSupportYears: 6, taxReductionRate: '%70', interestSupportPoints: 6, description: 'Demiryolu makineleri ve tarım aletleri.' },

  // 5. Bölge
  Adıyaman: { zone: 5, zoneName: '5. Bölge (Yüksek Öncelikli Bölge)', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Deprem sonrası yeniden yapılanma ve tekstil teşvikleri.' },
  Aksaray: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Kamyon yan sanayi ve tarımsal sanayi.' },
  Bayburt: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Hayvancılık ve taş ocağı işletmeciliği.' },
  Çankırı: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Tuz ve lastik sanayi teşvikleri.' },
  Erzurum: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Kış turizmi ve bölgesel sağlık merkezi.' },
  Gümüşhane: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Pestil-köme ve maden zenginleştirme.' },
  Kahramanmaraş: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'İplik, kumaş ve dondurma sanayi teşvikleri.' },
  Kilis: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Zeytinyağı ve sınır ticareti teşvikleri.' },
  Niğde: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Patates işleme ve elma entegre tesisleri.' },
  Ordu: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Fındık ve arıcılık mamulleri teşvikleri.' },
  Osmaniye: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Yassı çelik ve yer fıstığı sanayi.' },
  Sinop: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Su ürünleri ve tekne imalatı.' },
  Tokat: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Salça, konserve ve tekstil üretimi.' },
  Yozgat: { zone: 5, zoneName: '5. Bölge', sgkEmployerShareSupportYears: 7, taxReductionRate: '%80', interestSupportPoints: 7, description: 'Tarımsal üretim ve et kombinası destekleri.' },

  // 6. Bölge: En yüksek teşvik oranı (Doğu ve Güneydoğu)
  Ağrı: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: '10 Yıl SGK primi Hazine karşılaması ve %90 vergi indirimi.' },
  Ardahan: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Sınır kapısı ve hayvancılık maksimum hibe havzası.' },
  Batman: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Tekstil ve petrol yan ürünleri azami teşvikleri.' },
  Bingöl: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Sütaş entegre ve arıcılık maksimum teşvikleri.' },
  Bitlis: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Tekstil kent ve gıda işleme azami destekleri.' },
  Diyarbakır: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Güneydoğu ana sanayi ve tarım teknolojileri teşvikleri.' },
  Hakkari: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Çinko-kurşun madencilik ve sınır ticareti teşvikleri.' },
  Iğdır: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: '3 Ülkeye sınır lojistik ve meyvecilik teşvikleri.' },
  Kars: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Lojistik merkez ve peynir imalatı azami destekleri.' },
  Mardin: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Un, makarna ve tarihi turizm maksimum teşvikleri.' },
  Muş: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Ova tarımı ve büyükbaş hayvancılık teşvikleri.' },
  Siirt: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Fıstık işleme ve bakır madenciliği teşvikleri.' },
  Şanlıurfa: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'GAP tarımsal sanayi ve ayakkabıcılar OSB teşvikleri.' },
  Şırnak: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Habur gümrük kapısı ve kömür enerjisi destekleri.' },
  Tunceli: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'Organik tarım ve doğa turizmi azami teşvikleri.' },
  Van: { zone: 6, zoneName: '6. Bölge (Maksimum Teşvik Bölgesi)', sgkEmployerShareSupportYears: 10, taxReductionRate: '%90', interestSupportPoints: 9, description: 'İran sınır ticareti ve çağrı merkezleri teşvikleri.' },
};

export function getCityIncentiveZone(city: string): RegionalIncentiveZone {
  return (
    TURKEY_CITY_INCENTIVE_ZONES[city] ||
    TURKEY_CITY_INCENTIVE_ZONES['İstanbul']
  );
}

// =========================================================================
// 2. 25 SEKTÖR İÇİN DETAYLI NACE & HİBE PROFİLLERİ
// =========================================================================

export const SECTOR_INCENTIVE_PROFILES: Record<string, SectorIncentiveProfile> = {
  // 1. Yazılım & Dijital Ajans (Yüksek Teknoloji)
  'yazilim-ajans': {
    sectorId: 'yazilim-ajans',
    sectorName: 'Yazılım & Dijital Ajans',
    emoji: '💻',
    categoryGroup: 'Finans & Hizmet',
    naceCode: '62.01.01',
    naceDescription: 'Bilgisayar Programlama Faaliyetleri (Sistem, veri tabanı, network, web ve yapay zeka)',
    isKosgebEligible: true,
    kosgebCategory: 'İleri Girişimci (Teknoloji/İmalat)',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500, // 330.000 TL %25 diliminde
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_ileri_yazilim',
        provider: 'KOSGEB',
        programName: 'İleri Girişimci Destek Programı (Yüksek Teknoloji)',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 440000,
        coverageRatio: '%75 Hibe',
        conditions: [
          'KOSGEB İleri Girişimcilik e-Akademi sertifikası tamamlanmalıdır.',
          'Şirket kuruluşu son 1 yıl içinde yapılmış veya henüz kurulmamış olmalıdır.',
          'Makine, donanım, sunucu ve lisanslı yazılım alımları faturalandırılır.',
        ],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: '65.000 TL kuruluş hibesi + 375.000 TL sunucu, bilgisayar ve yazılım donanımı geri ödemesiz hibesi.',
        officialReference: 'KOSGEB Girişimcilik Destek Programı Uygulama Esasları',
        sampleBusinessPlan: {
          title: 'KOSGEB İleri Girişimci Yazılım ve SaaS İş Planı Taslağı',
          targetMarket: 'B2B Kurumsal Yazılım, Yapay Zeka Otomasyonu ve İhracat',
          equipmentNeeds: 'Yüksek Performanslı İş İstasyonları, Bulut Sunucu Altyapısı, Kurumsal IDE Lisansları',
          projectMilestones: [
            '1. Ay: Şirket tescili ve KOSGEB veri tabanına kayıt.',
            '3. Ay: Donanım ve sunucu altyapısının devreye alınması.',
            '6. Ay: İlk ticari sürüm ve pilot müşteri teslimatları.',
          ],
          justificationText: 'Yüksek katma değerli yazılım ihracatı ve yerli yapay zeka çözümleri geliştirmek amacıyla başvuru yapılmaktadır.',
        },
      },
      {
        id: 'tubitak_1512_bigg',
        provider: 'TÜBİTAK',
        programName: 'TÜBİTAK 1512 - BİGG Girişimcilik Sermaye Desteği',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 900000,
        coverageRatio: '%100 Hibe',
        conditions: [
          'Teknolojik ve yenilikçi bir iş fikrine sahip olmak.',
          'Üniversite lisans son sınıf veya mezun olmak.',
        ],
        applicationUrl: 'https://bigg.tubitak.gov.tr',
        summary: 'Teknoloji tabanlı erken aşama yazılım girişimleri için 900.000 TL sermaye desteği.',
        officialReference: 'TÜBİTAK 1512 Program Çağrısı',
      },
      {
        id: 'ticaret_ihracat_hibe',
        provider: 'Ticaret Bakanlığı',
        programName: 'Bilişim & Yazılım İhracatı Teşvik Paketi (HİB)',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 350000,
        coverageRatio: '%60 Hibe',
        conditions: [
          'Yurtdışına yazılım satışı veya yabancı pazaryeri listelemesi yapmak.',
          'Hizmet İhracatçıları Birliği (HİB) üyesi olmak.',
        ],
        applicationUrl: 'https://kolaydestek.gov.tr',
        summary: 'Yurtdışı Google Ads reklamları, yazılım mağazası komisyonları ve pazar araştırma giderlerinin %60\'ı karşılanır.',
        officialReference: '5448 sayılı Döviz Kazandırıcı Hizmet Sektörleri Tebliği',
      },
    ],
  },

  // 2. Sigorta Acentesi
  'sigorta-acentesi': {
    sectorId: 'sigorta-acentesi',
    sectorName: 'Sigorta Acentesi',
    emoji: '🛡️',
    categoryGroup: 'Finans & Hizmet',
    naceCode: '66.22.01',
    naceDescription: 'Sigorta Acentelerinin ve Aracılarının Faaliyetleri',
    isKosgebEligible: true,
    kosgebCategory: 'Geleneksel Girişimci',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_geleneksel_sigorta',
        provider: 'KOSGEB',
        programName: 'Geleneksel Girişimci Destek Programı',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 85000,
        coverageRatio: '%100 Hibe',
        conditions: [
          'KOSGEB Geleneksel Girişimcilik Eğitimi online tamamlanmalıdır.',
          'Limited şirket veya şahıs işletmesi kuruluşu.',
          'Kadın veya genç girişimcilerde +20.000 TL ilave hibe ödenir.',
        ],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: '65.000 TL taban kuruluş desteği + kadın/genç girişimciler için 20.000 TL ilave nakit hibe.',
        officialReference: 'KOSGEB Geleneksel Girişimci Yönetmeliği',
      },
      {
        id: 'iskur_istihdam_sigorta',
        provider: 'İŞKUR',
        programName: 'Yeni İstihdam SGK İşveren Prim Teşviki',
        supportType: 'Vergi / Prim Muafiyeti',
        maxAmount: 54000,
        coverageRatio: '%100 Karşılama',
        conditions: [
          'Teknik personel / SEGEM belgeli personel işe alımı.',
          'İşe alınan kişinin son 3 aydır İŞKUR kayıtlı olması.',
        ],
        applicationUrl: 'https://www.iskur.gov.tr',
        summary: 'İşe alınan her teknik personel için 6 ay boyunca aylık SGK işveren prim payı devletçe ödenir.',
        officialReference: '5510 Sayılı Kanun Ek Madde 17',
      },
    ],
  },

  // 3. Emlak & Gayrimenkul
  'emlak-gayrimenkul': {
    sectorId: 'emlak-gayrimenkul',
    sectorName: 'Emlak & Gayrimenkul Ofisi',
    emoji: '🏢',
    categoryGroup: 'Finans & Hizmet',
    naceCode: '68.31.01',
    naceDescription: 'Gayrimenkul Acentelerinin Faaliyetleri (Komisyonculuk ve Danışmanlık)',
    isKosgebEligible: true,
    kosgebCategory: 'Geleneksel Girişimci',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_geleneksel_emlak',
        provider: 'KOSGEB',
        programName: 'Geleneksel Girişimcilik Kuruluş Hibe Programı',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 85000,
        coverageRatio: '%100 Hibe',
        conditions: [
          'TTBS Taşınmaz Yetki Belgesi sürecinde olan girişimciler.',
          'Online KOSGEB girişimcilik eğitimi tamamlanmalıdır.',
        ],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: '65.000 TL kuruluş desteği + genç/kadın girişimcilere 20.000 TL ek hibe.',
        officialReference: 'KOSGEB Girişimci Tebliği',
      },
    ],
  },

  // 4. Kafe & Kahve Dükkanı
  'kafe-kahve': {
    sectorId: 'kafe-kahve',
    sectorName: 'Kafe & Kahve Dükkanı',
    emoji: '☕',
    categoryGroup: 'Yeme - İçme',
    naceCode: '56.30.02',
    naceDescription: 'Çay Ocakları, Kıraathaneler, Kahvehaneler ve Özel Kahve Sunum Kafeleri',
    isKosgebEligible: true,
    kosgebCategory: 'Geleneksel Girişimci',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_kafe_hibe',
        provider: 'KOSGEB',
        programName: 'KOSGEB Hizmet Sektörü Kuruluş Desteği',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 85000,
        coverageRatio: '%100 Hibe',
        conditions: [
          'İşyeri açılışı öncesi KOSGEB sertifikası alınmış olmalıdır.',
          'Kadın girişimciler için pozitif ayrımcılık uygulanır.',
        ],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: 'Kafe açılışında 65.000 TL nakit hibe + 20.000 TL ek destek.',
        officialReference: 'KOSGEB Hizmet Sektörü Destekleri',
      },
      {
        id: 'iskur_barista_destegi',
        provider: 'İŞKUR',
        programName: 'İşbaşı Eğitim Programı (İEP) Barista & Servis Desteği',
        supportType: 'Vergi / Prim Muafiyeti',
        maxAmount: 68000,
        coverageRatio: '%100 Karşılama',
        conditions: [
          '3 ay boyunca istihdam edilecek baristanın net asgari ücreti ve SGK\'sı İŞKUR tarafından ödenir.',
        ],
        applicationUrl: 'https://www.iskur.gov.tr',
        summary: 'Personel istihdamında 3 ay boyunca maaş ve prim İŞKUR tarafından karşılanır.',
        officialReference: 'İŞKUR İEP Yönetmeliği',
      },
    ],
  },

  // 5. Restoran & Lokanta
  'restoran-lokanta': {
    sectorId: 'restoran-lokanta',
    sectorName: 'Restoran & Lokanta',
    emoji: '🍽️',
    categoryGroup: 'Yeme - İçme',
    naceCode: '56.10.08',
    naceDescription: 'Lokantalar ve Restoranların Faaliyetleri (Oturarak servis yapılanlar)',
    isKosgebEligible: true,
    kosgebCategory: 'Geleneksel Girişimci',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_restoran_kurulus',
        provider: 'KOSGEB',
        programName: 'Hizmet ve Ticaret Girişimci Desteği',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 85000,
        coverageRatio: '%100 Hibe',
        conditions: ['Gıda işletme kayıt belgesi ve hijyen eğitimi şartı.'],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: 'Restoran açılışında 85.000 TL\'ye varan karşılıksız kuruluş hibesi.',
        officialReference: 'KOSGEB Destekleri',
      },
    ],
  },

  // 6. Güzellik Salonu & Kuaför
  'kuafor-guzellik': {
    sectorId: 'kuafor-guzellik',
    sectorName: 'Güzellik Salonu & Kuaför',
    emoji: '💇‍♀️',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    naceCode: '96.02.01',
    naceDescription: 'Güzellik Salonlarının Faaliyetleri (Cilt bakımı, manikür, epilasyon vb.)',
    isKosgebEligible: true,
    kosgebCategory: 'Geleneksel Girişimci',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_guzellik_kadin',
        provider: 'KOSGEB',
        programName: 'Kadın Girişimci Öncelikli Hizmet Hibe Paketi',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 85000,
        coverageRatio: '%100 Hibe',
        conditions: ['Ustalık belgesi veya mesul müdürlük tescili.'],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: 'Salon açılışı için 65.000 TL + Kadın girişimcilere 20.000 TL doğrudan hibe.',
        officialReference: 'KOSGEB Kadın Girişimci Fonu',
      },
    ],
  },

  // 7. Fırın & Unlu Mamüller (İmalat Sektörü - İleri Girişimci)
  'firin-unlu-mamuller': {
    sectorId: 'firin-unlu-mamuller',
    sectorName: 'Fırın & Unlu Mamüller',
    emoji: '🥖',
    categoryGroup: 'Yeme - İçme',
    naceCode: '10.71.01',
    naceDescription: 'Fırın Ürünleri İmalatı (Ekmek, sade pide, simit vb.)',
    isKosgebEligible: true,
    kosgebCategory: 'İleri Girişimci (Teknoloji/İmalat)',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_imalat_firin',
        provider: 'KOSGEB',
        programName: 'İleri Girişimci İmalat Sanayi Makine Teçhizat Desteği',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 375000,
        coverageRatio: '%75 Hibe',
        conditions: [
          'Döner fırın, hamur yoğurma ve un siloları gibi yerli/ithal sıfır makineler.',
          'KOSGEB İleri Girişimci İmalat eğitim sertifikası.',
        ],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: 'Endüstriyel fırın makineleri alımında 300.000 TL + 75.000 TL kuruluş hibesi.',
        officialReference: 'KOSGEB İmalat Sektörü Destekleri',
      },
    ],
  },

  // 8. Eczane & Medikal
  'eczane-medikal': {
    sectorId: 'eczane-medikal',
    sectorName: 'Eczane & Medikal Ürünler',
    emoji: '💊',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    naceCode: '47.73.01',
    naceDescription: 'Belirli Bir Mala Tahsis Edilmiş Mağazalarda Eczacılık Ürünlerinin Perakende Ticareti',
    isKosgebEligible: true,
    kosgebCategory: 'Geleneksel Girişimci',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_eczane_kurulus',
        provider: 'KOSGEB',
        programName: 'Sağlık Perakendesi Girişimci Desteği',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 85000,
        coverageRatio: '%100 Hibe',
        conditions: ['Eczacılık fakültesi diploması ve İl Sağlık eczane ruhsatnamesi.'],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: 'Yeni eczane açılışında 85.000 TL nakit kuruluş hibesi.',
        officialReference: 'KOSGEB Sağlık Sektörü Kılavuzu',
      },
    ],
  },

  // 9. Diş Polikliniği
  'dis-klinigi': {
    sectorId: 'dis-klinigi',
    sectorName: 'Diş Polikliniği / Ağız Diş',
    emoji: '🦷',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    naceCode: '86.23.01',
    naceDescription: 'Özel Diş Hekimliği Faaliyetleri ve Ağız Diş Sağlığı Poliklinikleri',
    isKosgebEligible: true,
    kosgebCategory: 'İleri Girişimci (Teknoloji/İmalat)',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_medikal_dis',
        provider: 'KOSGEB',
        programName: 'Yüksek Teknoloji Tıbbi Cihaz Teçhizat Desteği',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 375000,
        coverageRatio: '%75 Hibe',
        conditions: ['Panoramik röntgen, diş üniti ve otoklav cihazı alımları faturalandırılır.'],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: 'Diş polikliniği medikal cihaz alımlarında 375.000 TL hibe desteği.',
        officialReference: 'KOSGEB Medikal Sağlık Cihazları Tebliği',
      },
    ],
  },

  // 10. Oto Ekspertiz
  'oto-ekspertiz': {
    sectorId: 'oto-ekspertiz',
    sectorName: 'Oto Ekspertiz İstasyonu',
    emoji: '🔍',
    categoryGroup: 'Perakende & Zanaat',
    naceCode: '71.20.08',
    naceDescription: 'Motorlu Taşıtların Teknik Muayene ve Ekspertiz Faaliyetleri',
    isKosgebEligible: true,
    kosgebCategory: 'İleri Girişimci (Teknoloji/İmalat)',
    taxExemptions: {
      youngEntrepreneurTaxDiscount: true,
      bagkurPremiumSupportDays: 365,
      annualEstimatedTaxSaving: 82500,
      annualBagkurSaving: 84000,
    },
    availableGrants: [
      {
        id: 'kosgeb_dyno_ekspertiz',
        provider: 'KOSGEB',
        programName: 'Test ve Analiz Ekipmanı İleri Girişimci Hibe Paketi',
        supportType: 'Hibe (Geri Ödemesiz)',
        maxAmount: 375000,
        coverageRatio: '%75 Hibe',
        conditions: ['TSE 13805 standardına uygun Dyno, fren ve süspansiyon test cihazları.'],
        applicationUrl: 'https://edevlet.kosgeb.gov.tr',
        summary: 'Ekspertiz test hatları ve lift alımlarında 375.000 TL hibe.',
        officialReference: 'KOSGEB Teknik Hizmet Destekleri',
      },
    ],
  },
};

// Kalan sektörler için standart profil oluşturucu
const DEFAULT_NACE_MAPPING: Record<
  string,
  {
    name: string;
    emoji: string;
    category: 'Finans & Hizmet' | 'Yeme - İçme' | 'Kişisel Bakım & Sağlık' | 'Perakende & Zanaat';
    nace: string;
    desc: string;
    isAdvanced?: boolean;
  }
> = {
  'muhasebe-smmm': { name: 'Mali Müşavirlik & SMMM Bürosu', emoji: '📊', category: 'Finans & Hizmet', nace: '69.20.01', desc: 'Mali Müşavirlik, Muhasebe ve Vergi Danışmanlığı' },
  'hukuk-burosu': { name: 'Hukuk & Avukatlık Bürosu', emoji: '⚖️', category: 'Finans & Hizmet', nace: '69.10.01', desc: 'Hukuki Danışmanlık ve Avukatlık Faaliyetleri' },
  'donerci-kebapci': { name: 'Dönerci & Kebapçı', emoji: '🥙', category: 'Yeme - İçme', nace: '56.10.07', desc: 'Döner, Kebap ve Sıcak Yemek Sunan Lokantalar' },
  'cigkofte-subesi': { name: 'Çiğköfteci & Fast Food', emoji: '🌯', category: 'Yeme - İçme', nace: '56.10.08', desc: 'Çiğköfte ve Hızlı Yiyecek Hazırlama ve Satışı' },
  'optik-magazasi': { name: 'Optik Mağazası & Gözlükçü', emoji: '👓', category: 'Kişisel Bakım & Sağlık', nace: '47.78.02', desc: 'Gözlük, Lens ve Optik Ürünlerin Perakende Satışı' },
  'pilates-yoga': { name: 'Pilates & Reformer Stüdyosu', emoji: '🧘‍♀️', category: 'Kişisel Bakım & Sağlık', nace: '93.13.01', desc: 'Fitness ve Spor Merkezleri Faaliyetleri' },
  'market-bakkal': { name: 'Süpermarket & Bakkal', emoji: '🛒', category: 'Perakende & Zanaat', nace: '47.11.01', desc: 'Bakkal ve Marketlerde Gıda Perakende Ticareti' },
  'butik-giyim': { name: 'Butik & Giyim Mağazası', emoji: '👗', category: 'Perakende & Zanaat', nace: '47.71.01', desc: 'Tekstil ve Giyim Eşyalarının Perakende Ticareti' },
  'petshop-urunleri': { name: 'Petshop & Veteriner Ürünleri', emoji: '🐾', category: 'Perakende & Zanaat', nace: '47.76.02', desc: 'Evcil Hayvanlar ve Yemlerinin Perakende Satışı' },
  'kirtasiye-kitap': { name: 'Kırtasiye & Kitabevi', emoji: '📚', category: 'Perakende & Zanaat', nace: '47.62.01', desc: 'Kitap, Kırtasiye ve Büro Malzemeleri Perakende Satışı' },
  'cicekci-botanik': { name: 'Çiçekçi & Botanik Tasarım', emoji: '💐', category: 'Perakende & Zanaat', nace: '47.76.01', desc: 'Çiçek, Bitki ve Tohum Perakende Ticareti' },
  'telefon-aksesuar': { name: 'Telefon & Aksesuar Mağazası', emoji: '📱', category: 'Perakende & Zanaat', nace: '47.42.01', desc: 'Telekomünikasyon Teçhizatı ve Telefon Aksesuarı Satışı' },
  'oto-yikama': { name: 'Oto Yıkama & Detailing', emoji: '🚗', category: 'Perakende & Zanaat', nace: '45.20.06', desc: 'Otomobil Yıkama, Cilalama ve Benzeri Faaliyetler' },
  'lastik-servisi': { name: 'Lastik & Jant Servis Merkezi', emoji: '🛞', category: 'Perakende & Zanaat', nace: '45.20.04', desc: 'Lastik Onarımı, Değişimi ve Balans Ayarı' },
  'kuru-temizleme': { name: 'Kuru Temizleme & Terzi', emoji: '👔', category: 'Perakende & Zanaat', nace: '96.01.01', desc: 'Çamaşırhane ve Kuru Temizleme Hizmetleri' },
};

for (const [id, def] of Object.entries(DEFAULT_NACE_MAPPING)) {
  if (!SECTOR_INCENTIVE_PROFILES[id]) {
    const isAdv = !!def.isAdvanced;
    SECTOR_INCENTIVE_PROFILES[id] = {
      sectorId: id,
      sectorName: def.name,
      emoji: def.emoji,
      categoryGroup: def.category,
      naceCode: def.nace,
      naceDescription: def.desc,
      isKosgebEligible: true,
      kosgebCategory: isAdv ? 'İleri Girişimci (Teknoloji/İmalat)' : 'Geleneksel Girişimci',
      taxExemptions: {
        youngEntrepreneurTaxDiscount: true,
        bagkurPremiumSupportDays: 365,
        annualEstimatedTaxSaving: 82500,
        annualBagkurSaving: 84000,
      },
      availableGrants: [
        {
          id: `kosgeb_${id}`,
          provider: 'KOSGEB',
          programName: isAdv ? 'İleri Girişimci Destek Programı' : 'Geleneksel Girişimcilik Kuruluş Hibe Programı',
          supportType: 'Hibe (Geri Ödemesiz)',
          maxAmount: isAdv ? 375000 : 85000,
          coverageRatio: isAdv ? '%75 Hibe' : '%100 Hibe',
          conditions: [
            'KOSGEB Girişimcilik online eğitimi tamamlanmış olmalıdır.',
            'İşletme tescilinden sonra KOSGEB portalı üzerinden başvuru yapılır.',
            'Kadın veya genç girişimcilerde ek hibe ödenir.',
          ],
          applicationUrl: 'https://edevlet.kosgeb.gov.tr',
          summary: isAdv
            ? '375.000 TL makine ve ekipman geri ödemesiz hibe desteği.'
            : '65.000 TL taban kuruluş desteği + kadın/genç girişimcilere 20.000 TL ek hibe.',
          officialReference: 'KOSGEB Girişimcilik Uygulama Esasları',
        },
        {
          id: `iskur_${id}`,
          provider: 'İŞKUR',
          programName: 'İstihdam Prim Desteği (SGK İşveren Teşviki)',
          supportType: 'Vergi / Prim Muafiyeti',
          maxAmount: 54000,
          coverageRatio: '%100 Karşılama',
          conditions: ['Yeni işe alınacak personelin İŞKUR kaydının bulunması.'],
          applicationUrl: 'https://www.iskur.gov.tr',
          summary: 'Personel başına 6 ay boyunca SGK işveren hissesi devletçe karşılanır.',
          officialReference: '5510 sayılı Kanun',
        },
      ],
    };
  }
}

export function getSectorIncentiveProfile(sectorId: string): SectorIncentiveProfile {
  return (
    SECTOR_INCENTIVE_PROFILES[sectorId] ||
    SECTOR_INCENTIVE_PROFILES['yazilim-ajans']
  );
}
