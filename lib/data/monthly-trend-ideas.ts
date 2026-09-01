export interface PracticalBusinessIdea {
  id: string;
  monthEdition: string;
  isFeaturedThisMonth: boolean;
  title: string;
  tagline: string;
  category: 'Otomotiv & Mobil' | 'Gıda & Mutfak' | 'Hizmet & Otomasyon' | 'B2B & Kurumsal' | 'Evcil Hayvan';
  businessModelBadge: 'Dükkansız / Mobil' | 'Personelsiz / Otomat' | 'B2B Düzenli Gelir' | 'Düşük Sabit Maliyet';
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
    id: 'mobil-detailing',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: true,
    title: 'Mobil Buharlı Araç & Koltuk Detailing',
    tagline: 'Dükkan kirası ödemeden, plazalarda ve sitelerde randevulu yerinde bakım.',
    category: 'Otomotiv & Mobil',
    businessModelBadge: 'Dükkansız / Mobil',
    financials: {
      minCapital: 320000,
      monthlyAvgRevenue: 135000,
      monthlyNetProfit: 85000,
      paybackPeriodMonths: 4,
      grossMarginPercent: 75
    },
    marketReality: {
      whyItWorks: 'Plaza ve site sakinleri araç yıkama kuyruklarında vakit kaybetmek yerine mesai saatinde kapıda teslimatı tercih ediyor.',
      idealLocationProfile: 'A+ Konut Siteleri, Finans Merkezleri ve Teknokent Otoparkları',
      targetCustomer: 'Beyaz yaka çalışanlar ve zamanı kısıtlı araç sahipleri',
      firstMonthTractionPlan: 'Site yönetimleri ve kurumsal şirket İK birimleriyle indirimli deneme temizliği anlaşmaları.'
    },
    setupProfile: {
      minimumSpaceM2: 0,
      requiredStaffCount: 1,
      coreEquipments: ['10 Bar Endüstriyel Buhar Jeneratörü', 'Sessiz Taşınabilir İnverter Güç Kaynağı', 'Islak-Kuru Sanayi Vakumu']
    }
  },
  {
    id: 'self-pet-wash',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: true,
    title: 'Self-Servis 7/24 Jetonlu Köpek Yıkama Kabini',
    tagline: 'Personelsiz, otomat mantığıyla çalışan iklimlendirmeli yıkama ve kurutma istasyonu.',
    category: 'Evcil Hayvan',
    businessModelBadge: 'Personelsiz / Otomat',
    financials: {
      minCapital: 480000,
      monthlyAvgRevenue: 95000,
      monthlyNetProfit: 65000,
      paybackPeriodMonths: 7,
      grossMarginPercent: 80
    },
    marketReality: {
      whyItWorks: 'Apartman dairelerinde evcil hayvan yıkama zorluğu ve klasik pet kuaförlerin randevu yoğunluğunu 15 dakikada çözer.',
      idealLocationProfile: 'Evcil hayvan parkları yakını, veteriner yoğunluklu caddeler ve site altı açık alanlar',
      targetCustomer: 'Köpek sahipleri',
      firstMonthTractionPlan: 'Bölgedeki veteriner kliniklerine ve petshoplara ilk kullanım kuponları dağıtımı.'
    },
    setupProfile: {
      minimumSpaceM2: 18,
      requiredStaffCount: 0,
      coreEquipments: ['Jetonlu/Kredi Kartlı Yıkama & Kurutma Kabini', 'Sıcak Su Boyler & Arıtma Sistemi', 'Antibakteriyel Zemin Izgarası']
    }
  },
  {
    id: 'b2b-cold-brew',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: false,
    title: 'Ofislere Soğuk Kahve (Cold Brew) & Nitelikli Çekirdek Aboneliği',
    tagline: 'Yazılım ve finans ofislerine düzenli fıçı ve şişeli taze kahve tedariği.',
    category: 'B2B & Kurumsal',
    businessModelBadge: 'B2B Düzenli Gelir',
    financials: {
      minCapital: 380000,
      monthlyAvgRevenue: 160000,
      monthlyNetProfit: 95000,
      paybackPeriodMonths: 5,
      grossMarginPercent: 70
    },
    marketReality: {
      whyItWorks: 'Şirketler çalışan memnuniyeti için kaliteli kahveyi hazır fıçılarda ofiste tutmak istiyor.',
      idealLocationProfile: 'Merkezi dağıtıma uygun küçük bir üretim atölyesi (30-40 m²)',
      targetCustomer: '20+ çalışanı olan teknoloji firmaları, hukuk büroları ve ajanslar',
      firstMonthTractionPlan: 'Plazalardaki ilk 15 ofise 1 haftalık ücretsiz soğuk demleme fıçısı denemesi bırakmak.'
    },
    setupProfile: {
      minimumSpaceM2: 35,
      requiredStaffCount: 1,
      coreEquipments: ['Paslanmaz Soğuk Demleme Tankları', 'Azot/Nitro Musluk Dispanseri', 'Yarı Otomatik Şişeleme Ünitesi']
    }
  },
  {
    id: 'kurye-kask-bakim',
    monthEdition: 'Eylül 2026',
    isFeaturedThisMonth: false,
    title: 'Motosiklet & Kurye Kask Hijyen / Hızlı Bakım İstasyonu',
    tagline: 'Ozonik kask sterilizasyonu, vizör bakımı ve mont temizliği mikro noktası.',
    category: 'Hizmet & Otomasyon',
    businessModelBadge: 'Düşük Sabit Maliyet',
    financials: {
      minCapital: 290000,
      monthlyAvgRevenue: 110000,
      monthlyNetProfit: 70000,
      paybackPeriodMonths: 4,
      grossMarginPercent: 75
    },
    marketReality: {
      whyItWorks: 'Hızla büyüyen moto-kurye pazarında ekipman hijyeni ve hızlı vizör bakımı için yerel nokta eksikliği.',
      idealLocationProfile: 'Paket servis ve motokurye toplanma noktalarına yakın 15-20 m² mikro dükkanlar',
      targetCustomer: 'Bireysel ve kurumsal filo moto-kuryeleri',
      firstMonthTractionPlan: 'Yemek ve kargo dağıtım depolarına toplu filo bakım paketleri sunulması.'
    },
    setupProfile: {
      minimumSpaceM2: 20,
      requiredStaffCount: 1,
      coreEquipments: ['Ozonlu Kask Sterilizasyon ve Kurutma Kabini', 'Buharlı Ekipman Dezenfektörü', 'Hızlı Vizör Polisaj Tezgahı']
    }
  }
];
