export interface PracticalBusinessIdea {
  id: string;
  monthEdition: string;
  isFeaturedThisMonth: boolean;
  title: string;
  tagline: string;
  imageUrl: string;
  category: string;
  businessModelBadge: string;
  capitalRange?: string;
  profitMarginBadge?: string;
  financials: {
    minCapital: number;
    monthlyAvgRevenue: number;
    monthlyNetProfit: number;
    paybackPeriodMonths: number;
    grossMarginPercent: number;
  };
  marketReality: {
    whyItWorks: string;
    idealLocationProfile: string;
    targetCustomer: string;
    firstMonthTractionPlan: string;
  };
  setupProfile: {
    minimumSpaceM2: number;
    requiredStaffCount: number;
    coreEquipments: string[];
  };
}

export const MONTHLY_TREND_IDEAS: PracticalBusinessIdea[] = [
  {
    id: 'pup-party-box',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: true,
    title: 'Pet Doğum Günü & Kutlama Paketi (Pup-Party Box)',
    tagline: 'Köpekler için şekersiz, fıstık ezmeli yaş pasta, temalı parti şapkası ve anı seti.',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&auto=format&fit=crop&q=80',
    category: 'Evcil Hayvan & Yaşam',
    businessModelBadge: 'Düşük Sabit Maliyet',
    capitalRange: '25.000 – 40.000 TL',
    profitMarginBadge: '%75 Brüt Marj',
    financials: {
      minCapital: 35000,
      monthlyAvgRevenue: 80000,
      monthlyNetProfit: 60000,
      paybackPeriodMonths: 1,
      grossMarginPercent: 75,
    },
    marketReality: {
      whyItWorks: 'Evcil hayvanlarını aile üyesi gören köpek sahipleri, doğum günlerinde özel temalı kutlama ve sosyal medya içeriği üretmek için hazır kişiselleştirilmiş parti kutularını yoğun olarak sipariş ediyor.',
      idealLocationProfile: 'Evcil hayvan yoğunluğu yüksek metropoller, e-ticaret kargo ağı ve yerel veteriner anlaşmaları.',
      targetCustomer: 'Köpek sahipleri, pet influencer\'ları ve hayvan severler.',
      firstMonthTractionPlan: 'Instagram ve TikTok\'ta popüler köpek sahiplerine ücretsiz ilk parti kutusu hediye etmek ve popüler veteriner kliniklerine broşür/örnek kutu bırakmak.',
    },
    setupProfile: {
      minimumSpaceM2: 10,
      requiredStaffCount: 1,
      coreEquipments: [
        'Özel Gıda Uyumlu Pasta Fırını & Kalıpları',
        'Özel Baskı & Paketleme / Kutu Şablonları',
        'Temalı Parti Aksesuarları & Doğal Fıstık Ezmesi Stok',
      ],
    },
  },
  {
    id: 'pop-up-cinema',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: true,
    title: 'Mobil Gün Batımı & Açık Hava Sinema Kurulumu (Pop-Up Cinema)',
    tagline: 'Bahçe, teras ve sahillere 2 saatte kurulan bohem şezlonglu açık hava sinema deneyimi.',
    imageUrl: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=1200&auto=format&fit=crop&q=80',
    category: 'Deneyim & Etkinlik',
    businessModelBadge: 'Dükkansız / Mobil',
    capitalRange: '45.000 – 70.000 TL',
    profitMarginBadge: '%85 Net Marj',
    financials: {
      minCapital: 55000,
      monthlyAvgRevenue: 95000,
      monthlyNetProfit: 80000,
      paybackPeriodMonths: 1,
      grossMarginPercent: 85,
    },
    marketReality: {
      whyItWorks: 'Evlilik teklifleri, yıldönümleri, doğum günleri ve özel arkadaş buluşmalarında otel ya da mekan kiralamak yerine kişiye özel açık hava sinema deneyimleri yüksek talep görüyor.',
      idealLocationProfile: 'Geniş bahçeli villa siteleri, teraslı konutlar, sahil kasabaları ve yazlık bölgeler.',
      targetCustomer: 'Çiftler, özel gün kutlayanlar, butik kurumsal ekipler.',
      firstMonthTractionPlan: 'İlk 5 kuruluma özel profesyonel video/drone çekimi yaparak Instagram Reels ve Pinterest üzerinden yerel hedef kitle reklamları çıkmak.',
    },
    setupProfile: {
      minimumSpaceM2: 0,
      requiredStaffCount: 1,
      coreEquipments: [
        '4K Akıllı Taşınabilir Projeksiyon & Şişme/Tripod Perde',
        'Bohem Kilim, Minder, Şezlong & Fener Aydınlatma Seti',
        'Retro Patlamış Mısır Makinesi & Bluetooth Surround Hoparlör',
      ],
    },
  },
  {
    id: 'epoksi-cicek-tablo',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: false,
    title: 'Özel Gün Çiçek Buketlerini Epoksi Reçine Tabloya Dönüştürme',
    tagline: 'Gelin buketi ve evlilik teklifi güllerini kristal reçine içinde sonsuz anı objesine çevirme.',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&auto=format&fit=crop&q=80',
    category: 'Zanaat & Hatıra',
    businessModelBadge: 'Düşük Sabit Maliyet',
    capitalRange: '25.000 – 40.000 TL',
    profitMarginBadge: '%85 Net Marj',
    financials: {
      minCapital: 30000,
      monthlyAvgRevenue: 75000,
      monthlyNetProfit: 63000,
      paybackPeriodMonths: 1,
      grossMarginPercent: 85,
    },
    marketReality: {
      whyItWorks: 'Gelin buketleri ve teklif çiçekleri birkaç günde solarken, gelinler bu manevi anıyı sararmayan kristal reçine bloklarda ömür boyu saklamak istiyor.',
      idealLocationProfile: 'Ev atölyesi / küçük stüdyo, Türkiye geneli kargo altyapısı.',
      targetCustomer: 'Yeni evlenen gelinler, nişanlı çiftler, evlilik yıldönümü kutlayanlar.',
      firstMonthTractionPlan: 'Düğün fotoğrafçıları ve gelinlik tasarımcılarıyla komisyonlu iş birliği kurarak gelin paketlerine tanıtım kartı eklemek.',
    },
    setupProfile: {
      minimumSpaceM2: 12,
      requiredStaffCount: 1,
      coreEquipments: [
        'Silika Jel Hızlı Çiçek Kurutma Haznesi',
        'Sararmaz UV Dayanımlı Ultra Şeffaf Epoksi Reçine',
        'Silikon Döküm Kalıpları (Tepsi, Masa Saati, Kitap Desteği)',
      ],
    },
  },
  {
    id: 'ses-dalgasi-sanat',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: false,
    title: 'Ses Dalgalı & QR Kodlu Kişiye Özel Neon / Ahşap Sanat Tabloları',
    tagline: 'Bebek kalp atışı, evlilik yemini ve özel ses kayıtlarını dinlenebilir sanat panolarına dönüştürün.',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80',
    category: 'Tasarım & Hediyelik',
    businessModelBadge: 'Düşük Sabit Maliyet',
    capitalRange: '35.000 – 55.000 TL',
    profitMarginBadge: '%75 Brüt Marj',
    financials: {
      minCapital: 45000,
      monthlyAvgRevenue: 85000,
      monthlyNetProfit: 64000,
      paybackPeriodMonths: 1,
      grossMarginPercent: 75,
    },
    marketReality: {
      whyItWorks: 'Kişiye özel hediyelik pazarında hem görsel sanat hem de taranabilir QR kod ile ses dinleme deneyimi bir arada sunularak yüksek duygusal bağ oluşturuluyor.',
      idealLocationProfile: 'Küçük tasarım atölyesi veya ev ofisi, online sipariş ve hediye pazar yerleri.',
      targetCustomer: 'Yeni ebeveynler, evlilik/yıldönümü hediyesi arayan çiftler, özel hediye koleksiyonerleri.',
      firstMonthTractionPlan: 'Kadın doğum klinikleri ve bebek fotoğrafçıları ile ortak kupon kampanyaları düzenlemek; TikTok\'ta yapım videoları paylaşmak.',
    },
    setupProfile: {
      minimumSpaceM2: 15,
      requiredStaffCount: 1,
      coreEquipments: [
        'Masaüstü CNC / Lazer Kazıma & Kesim Cihazı',
        'Esnek LED Neon Şerit & Pleksi/Doğal Masif Ahşap Plakalar',
        'Özel QR Kod & Ses Dalgası Vektör Modelleme Yazılımı',
      ],
    },
  },
  {
    id: 'diy-parfum-kiti',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: false,
    title: '"Kendi Parfümünü Kendin Yap" Evde Atölye Kiti (DIY Perfume Box)',
    tagline: '12 temel koku esansı, cam damlalıklar ve formül defteriyle evde imza koku tasarlama seti.',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1200&auto=format&fit=crop&q=80',
    category: 'Kozmetik & Deneyim',
    businessModelBadge: 'Düşük Sabit Maliyet',
    capitalRange: '35.000 – 60.000 TL',
    profitMarginBadge: '%80 Brüt Marj',
    financials: {
      minCapital: 48000,
      monthlyAvgRevenue: 105000,
      monthlyNetProfit: 84000,
      paybackPeriodMonths: 1,
      grossMarginPercent: 80,
    },
    marketReality: {
      whyItWorks: 'Niş parfümeri fiyatlarının artmasıyla insanlar kendi tenine uygun imza kokuyu evde eğlenceli bir atölye deneyimiyle keşfetmeyi çok seviyor.',
      idealLocationProfile: 'E-ticaret odaklı paketleme atölyesi veya ev ofis.',
      targetCustomer: 'Koku meraklıları, çiftler (birlikte etkinlik arayanlar), kurumsal hediye alıcıları.',
      firstMonthTractionPlan: 'Lifestyle ve güzellik vlogger\'larına unboxing içerikleri için PR kutuları göndermek; Sevgililer Günü/Yılbaşı özel çift kutuları oluşturmak.',
    },
    setupProfile: {
      minimumSpaceM2: 15,
      requiredStaffCount: 1,
      coreEquipments: [
        '12 Çeşit IFRA Onaylı Konsantre Parfüm Esansı & Çözücü Alkol',
        'Dereceli Cam Damlalık & Hassas Karışım Beherleri',
        'Özel Tasarım Sprey Şişeleri & Koku Formül Defteri',
      ],
    },
  },
  {
    id: 'kisisellestirilmis-hikaye-kitabi',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: false,
    title: 'Kişiselleştirilmiş Hikaye Kitabı (Çocuğun Kahraman Olduğu Masallar)',
    tagline: 'Çocuğun adı, karakteri ve fotoğrafıyla basılan; kendi macerasını yaşadığı renkli ciltli masal kitabı.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
    category: 'Yayıncılık & Çocuk',
    businessModelBadge: 'Düşük Sabit Maliyet',
    capitalRange: '25.000 – 40.000 TL',
    profitMarginBadge: '%75 Brüt Marj',
    financials: {
      minCapital: 35000,
      monthlyAvgRevenue: 85000,
      monthlyNetProfit: 64000,
      paybackPeriodMonths: 1,
      grossMarginPercent: 75,
    },
    marketReality: {
      whyItWorks: 'Ebeveynler çocuklarına okuma alışkanlığı kazandırmak ve ömür boyu saklanacak duygusal bir hatıra bırakmak için çocuğun başrolde olduğu kitapları tercih ediyor.',
      idealLocationProfile: 'Dijital e-ticaret platformu + anlaşmalı dijital matbaa baskı ağı.',
      targetCustomer: '0-10 yaş çocuğu olan ebeveynler, büyükanne/büyükbabalar, öğretmenler.',
      firstMonthTractionPlan: 'Anaokulu veli grupları ve anne-çocuk topluluklarında kişiye özel önizleme demoları yayınlamak.',
    },
    setupProfile: {
      minimumSpaceM2: 0,
      requiredStaffCount: 1,
      coreEquipments: [
        'Kişiselleştirilebilir Masal & İllüstrasyon Şablon Altyapısı',
        'Web Tabanlı Canlı Kitap Önizleme Arayüzü',
        'Yüksek Çözünürlüklü Dijital Ciltli Baskı Anlaşması',
      ],
    },
  },
  {
    id: 'mobil-ev-sarj-kurtarma',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: false,
    title: 'Mobil Elektrikli Araç (EV) Acil Şarj & Kurtarma Kiti (On-Demand EV Rescue)',
    tagline: 'Yolda kalan elektrikli araçlara hafif ticari araçtan 15-20 dakikada 50-80 km acil menzil transferi.',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    category: 'Otomotiv & Mobil Enerji',
    businessModelBadge: 'Dükkansız / Mobil',
    capitalRange: '180.000 – 320.000 TL',
    profitMarginBadge: '%80 Net Marj',
    financials: {
      minCapital: 250000,
      monthlyAvgRevenue: 190000,
      monthlyNetProfit: 152000,
      paybackPeriodMonths: 2,
      grossMarginPercent: 80,
    },
    marketReality: {
      whyItWorks: 'Elektrikli araç sayısı hızla artarken şarj istasyonu kuyrukları ve şarjı bitip yolda kalan sürücüler için çekici masrafı yerine yerinde acil şarj hayat kurtarıcı bir çözüm sunuyor.',
      idealLocationProfile: 'Yoğun otoyol bağlantıları, metropol çevre yolları ve tatil güzergahları.',
      targetCustomer: 'Togg, Tesla ve diğer EV sahipleri, filo kiralama şirketleri ve yol yardım sigorta firmaları.',
      firstMonthTractionPlan: 'Elektrikli araç kulüpleri (Tesla/Togg Türkiye forumları) ve yerel yol yardım firmalarıyla anlaşarak acil çağrı yönlendirmesi almak.',
    },
    setupProfile: {
      minimumSpaceM2: 0,
      requiredStaffCount: 1,
      coreEquipments: [
        'Taşınabilir 20-30 kWh LFP Hızlı Şarj Güç Bataryası',
        'CCS2 / Type-2 Çift Çıkışlı Mobil DC Hızlı Şarj Ünitesi',
        'Araç İçi İnverter & Güvenlikli Güç Dağıtım Panosu',
      ],
    },
  },
  {
    id: 'mobil-aku-bms-servis',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: false,
    title: 'Mobil Akü Değişim & Kodlama / BMS Sağlık Test İstasyonu',
    tagline: 'Start-Stop ve EV/hibrit araçların 12V akülerini kapıda test eden, OBD-II ile beyne tanıtan mobil servis.',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&auto=format&fit=crop&q=80',
    category: 'Otomotiv & Yerinde Servis',
    businessModelBadge: 'Dükkansız / Mobil',
    capitalRange: '50.000 – 85.000 TL',
    profitMarginBadge: '%75 Brüt Marj',
    financials: {
      minCapital: 68000,
      monthlyAvgRevenue: 130000,
      monthlyNetProfit: 97500,
      paybackPeriodMonths: 1,
      grossMarginPercent: 75,
    },
    marketReality: {
      whyItWorks: 'Yeni nesil Start-Stop ve hibrit araçlarda akü değişimi sonrası araç beynine kodlama yapılması zorunludur. Sürücüler servise gitmek yerine kapıda 20 dakikada akü değişimini tercih ediyor.',
      idealLocationProfile: 'Büyükşehirler, yoğun site otoparkları ve iş merkezi plazaları.',
      targetCustomer: 'Start-Stop araç sahipleri, kurumsal filo yöneticileri, ticari taksi ve VIP transfer filoları.',
      firstMonthTractionPlan: 'Bölgesel oto kurtarıcılar, kasko acenteleri ve taksi duraklarına hızlı komisyonlu acil yönlendirme hattı açmak.',
    },
    setupProfile: {
      minimumSpaceM2: 0,
      requiredStaffCount: 1,
      coreEquipments: [
        'Profesyonel OBD-II Akü Eşleştirme & BMS Kodlama Cihazı',
        'Dijital İletkenlik & Akü Sağlık Test Cihazı (CCA / SoH / SoC)',
        'AGM & EFB Akü Başlangıç Stoğu ve Bellek Koruyucu Güç Kaynağı',
      ],
    },
  },
];
