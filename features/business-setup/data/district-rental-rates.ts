/**
 * Türkiye 81 İl ve İlçe Ticari Gayrimenkul m² Kira Çarpan Havuzu (₺/m²/ay)
 * 2026 Yılı Güncel Ticari Piyasa, Sahibinden, Endeksa ve TÜİK Ticari Gayrimenkul Verileri Baz Alınmıştır.
 */

export interface CityRentalRate {
  city: string;
  plate: string;
  defaultM2Rate: number; // İl genel ortalaması (₺/m²)
  minSmallShopFloorRent?: number; // 35 m² altı ticari dükkanlar için taban kira eşiği (₺/ay)
  districtRates: Record<string, number>; // İlçe bazlı ticari m² rayiçleri (₺/m²)
}

export const RENTAL_RATES_METADATA = {
  lastUpdatedMonth: 'Eylül 2026',
  version: '2026.09-v2',
  dataSource: 'Girişimbee Ticari Gayrimenkul Endeksi, TÜİK, Sahibinden & Endeksa 2026 Verileri',
  nextScheduledUpdate: 'Ekim 2026',
};

export const TURKEY_CITY_RENTAL_RATES: Record<string, CityRentalRate> = {
  'İstanbul': {
    city: 'İstanbul',
    plate: '34',
    defaultM2Rate: 950,
    minSmallShopFloorRent: 30000,
    districtRates: {
      'Kadıköy': 1450,
      'Beşiktaş': 1600,
      'Şişli': 1500,
      'Bakırköy': 1250,
      'Sarıyer': 1350,
      'Beyoğlu': 1250,
      'Fatih': 1100,
      'Ataşehir': 1050,
      'Üsküdar': 950,
      'Maltepe': 900,
      'Kartal': 800,
      'Ümraniye': 850,
      'Kağıthane': 900,
      'Zeytinburnu': 800,
      'Eyüpsultan': 750,
      'Pendik': 700,
      'Başakşehir': 750,
      'Bahçelievler': 750,
      'Küçükçekmece': 680,
      'Beylikdüzü': 650,
      'Güngören': 680,
      'Bağcılar': 600,
      'Tuzla': 600,
      'Çekmeköy': 650,
      'Sancaktepe': 580,
      'Esenyurt': 520,
      'Sultangazi': 500,
      'Sultanbeyli': 500,
      'Büyükçekmece': 550,
      'Silivri': 450,
      'Arnavutköy': 450,
      'Çatalca': 380,
      'Şile': 420,
      'Adalar': 750,
    },
  },
  'Ankara': {
    city: 'Ankara',
    plate: '06',
    defaultM2Rate: 650,
    minSmallShopFloorRent: 20000,
    districtRates: {
      'Çankaya': 950,
      'Yenimahalle': 750,
      'Gölbaşı': 650,
      'Etimesgut': 580,
      'Keçiören': 520,
      'Mamak': 450,
      'Altındağ': 550,
      'Sincan': 420,
      'Pursaklar': 420,
      'Kahramankazan': 380,
      'Akyurt': 340,
      'Polatlı': 320,
      'Beypazarı': 300,
      'Çubuk': 320,
    },
  },
  'İzmir': {
    city: 'İzmir',
    plate: '35',
    defaultM2Rate: 700,
    minSmallShopFloorRent: 22000,
    districtRates: {
      'Konak': 1100,
      'Karşıyaka': 950,
      'Bornova': 850,
      'Bayraklı': 900,
      'Çeşme': 1400,
      'Urla': 900,
      'Balçova': 800,
      'Narlıdere': 750,
      'Güzelbahçe': 700,
      'Buca': 580,
      'Gaziemir': 650,
      'Çiğli': 580,
      'Menemen': 480,
      'Torbalı': 450,
      'Kemalpaşa': 450,
      'Aliağa': 520,
      'Seferihisar': 600,
      'Ödemiş': 320,
      'Tire': 320,
      'Bergama': 320,
    },
  },
  'Antalya': {
    city: 'Antalya',
    plate: '07',
    defaultM2Rate: 750,
    minSmallShopFloorRent: 24000,
    districtRates: {
      'Muratpaşa': 950,
      'Konyaaltı': 900,
      'Alanya': 900,
      'Manavgat': 750,
      'Kepez': 580,
      'Kemer': 850,
      'Kaş': 1100,
      'Serik': 600,
      'Döşemealtı': 550,
      'Kumluca': 450,
      'Finike': 420,
      'Gazipaşa': 450,
    },
  },
  'Bursa': {
    city: 'Bursa',
    plate: '16',
    defaultM2Rate: 600,
    minSmallShopFloorRent: 18000,
    districtRates: {
      'Nilüfer': 850,
      'Osmangazi': 680,
      'Yıldırım': 520,
      'Mudanya': 700,
      'Gemlik': 500,
      'İnegöl': 550,
      'Gürsu': 420,
      'Kestel': 420,
      'Mustafakemalpaşa': 350,
      'Karacabey': 350,
      'Orhangazi': 400,
    },
  },
  'Kocaeli': {
    city: 'Kocaeli',
    plate: '41',
    defaultM2Rate: 580,
    minSmallShopFloorRent: 18000,
    districtRates: {
      'İzmit': 780,
      'Gebze': 750,
      'Başiskele': 650,
      'Kartepe': 600,
      'Darıca': 620,
      'Çayırova': 580,
      'Gölcük': 520,
      'Körfez': 520,
      'Derince': 480,
      'Karamürsel': 450,
      'Dilovası': 420,
      'Kandıra': 350,
    },
  },
  'Adana': {
    city: 'Adana',
    plate: '01',
    defaultM2Rate: 480,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Seyhan': 620,
      'Çukurova': 680,
      'Yüreğir': 420,
      'Sarıçam': 450,
      'Ceyhan': 340,
      'Kozan': 320,
    },
  },
  'Mersin': {
    city: 'Mersin',
    plate: '33',
    defaultM2Rate: 520,
    minSmallShopFloorRent: 16000,
    districtRates: {
      'Yenişehir': 720,
      'Mezitli': 680,
      'Akdeniz': 550,
      'Toroslar': 450,
      'Tarsus': 420,
      'Erdemli': 480,
      'Silifke': 450,
      'Anamur': 420,
    },
  },
  'Gaziantep': {
    city: 'Gaziantep',
    plate: '27',
    defaultM2Rate: 500,
    minSmallShopFloorRent: 16000,
    districtRates: {
      'Şehitkamil': 680,
      'Şahinbey': 580,
      'Nizip': 380,
      'İslahiye': 320,
    },
  },
  'Konya': {
    city: 'Konya',
    plate: '42',
    defaultM2Rate: 450,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Selçuklu': 620,
      'Meram': 550,
      'Karatay': 480,
      'Ereğli': 340,
      'Akşehir': 320,
      'Beyşehir': 320,
    },
  },
  'Eskişehir': {
    city: 'Eskişehir',
    plate: '26',
    defaultM2Rate: 520,
    minSmallShopFloorRent: 16000,
    districtRates: {
      'Tepebaşı': 650,
      'Odunpazarı': 620,
      'Sivrihisar': 280,
      'Çifteler': 260,
    },
  },
  'Muğla': {
    city: 'Muğla',
    plate: '48',
    defaultM2Rate: 850,
    minSmallShopFloorRent: 26000,
    districtRates: {
      'Bodrum': 1600,
      'Fethiye': 1100,
      'Marmaris': 1200,
      'Menteşe': 650,
      'Milas': 600,
      'Ortaca': 650,
      'Datça': 850,
      'Dalaman': 550,
      'Köyceğiz': 550,
      'Yatağan': 400,
    },
  },
  'Samsun': {
    city: 'Samsun',
    plate: '55',
    defaultM2Rate: 460,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Atakum': 650,
      'İlkadım': 550,
      'Canik': 420,
      'Bafra': 360,
      'Çarşamba': 340,
    },
  },
  'Trabzon': {
    city: 'Trabzon',
    plate: '61',
    defaultM2Rate: 480,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Ortahisar': 620,
      'Akçaabat': 460,
      'Yomra': 500,
      'Of': 380,
      'Vakfıkebir': 340,
    },
  },
  'Kayseri': {
    city: 'Kayseri',
    plate: '38',
    defaultM2Rate: 440,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Melikgazi': 550,
      'Kocasinan': 480,
      'Talas': 520,
      'Develi': 300,
      'Yahyalı': 260,
    },
  },
  'Denizli': {
    city: 'Denizli',
    plate: '20',
    defaultM2Rate: 460,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Pamukkale': 580,
      'Merkezefendi': 620,
      'Acıpayam': 300,
      'Tavas': 280,
      'Sarayköy': 300,
    },
  },
  'Sakarya': {
    city: 'Sakarya',
    plate: '54',
    defaultM2Rate: 480,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Serdivan': 680,
      'Adapazarı': 580,
      'Erenler': 460,
      'Hendek': 380,
      'Akyazı': 360,
      'Sapanca': 600,
      'Karasu': 420,
    },
  },
  'Aydın': {
    city: 'Aydın',
    plate: '09',
    defaultM2Rate: 520,
    minSmallShopFloorRent: 16000,
    districtRates: {
      'Efeler': 620,
      'Kuşadası': 1100,
      'Didim': 850,
      'Nazilli': 480,
      'Söke': 500,
      'İncirliova': 380,
    },
  },
  'Tekirdağ': {
    city: 'Tekirdağ',
    plate: '59',
    defaultM2Rate: 480,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Süleymanpaşa': 580,
      'Çorlu': 620,
      'Çerkezköy': 550,
      'Kapaklı': 460,
      'Ergene': 420,
      'Marmaraereğlisi': 450,
    },
  },
  'Balıkesir': {
    city: 'Balıkesir',
    plate: '10',
    defaultM2Rate: 480,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Karesi': 550,
      'Altıeylül': 520,
      'Bandırma': 600,
      'Edremit': 650,
      'Ayvalık': 950,
      'Burhaniye': 550,
      'Erdek': 550,
      'Gönen': 380,
    },
  },
  'Manisa': {
    city: 'Manisa',
    plate: '45',
    defaultM2Rate: 440,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Yunusemre': 580,
      'Şehzadeler': 520,
      'Akhisar': 420,
      'Turgutlu': 440,
      'Salihli': 420,
      'Soma': 350,
      'Alaşehir': 350,
    },
  },
  'Hatay': {
    city: 'Hatay',
    plate: '31',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Antakya': 450,
      'İskenderun': 550,
      'Defne': 400,
      'Dörtyol': 380,
      'Kırıkhan': 320,
      'Reyhanlı': 300,
      'Samandağ': 350,
    },
  },
  'Diyarbakır': {
    city: 'Diyarbakır',
    plate: '21',
    defaultM2Rate: 420,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Kayapınar': 620,
      'Bağlar': 420,
      'Yenişehir': 520,
      'Sur': 450,
      'Bismil': 300,
      'Ergani': 300,
    },
  },
  'Şanlıurfa': {
    city: 'Şanlıurfa',
    plate: '63',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Haliliye': 500,
      'Karaköprü': 550,
      'Eyyübiye': 380,
      'Siverek': 280,
      'Viranşehir': 280,
    },
  },
  'Malatya': {
    city: 'Malatya',
    plate: '44',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Battalgazi': 440,
      'Yeşilyurt': 460,
      'Doğanşehir': 240,
      'Akçadağ': 220,
    },
  },
  'Kahramanmaraş': {
    city: 'Kahramanmaraş',
    plate: '46',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Onikişubat': 460,
      'Dulkadiroğlu': 400,
      'Elbistan': 320,
      'Afşin': 280,
    },
  },
  'Van': {
    city: 'Van',
    plate: '65',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'İpekyolu': 480,
      'Tuşba': 380,
      'Edremit': 420,
      'Erciş': 300,
    },
  },
  'Elazığ': {
    city: 'Elazığ',
    plate: '23',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 460,
      'Kovancılar': 280,
      'Karakoçan': 260,
    },
  },
  'Sivas': {
    city: 'Sivas',
    plate: '58',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 450,
      'Şarkışla': 260,
      'Suşehri': 240,
    },
  },
  'Çanakkale': {
    city: 'Çanakkale',
    plate: '17',
    defaultM2Rate: 520,
    minSmallShopFloorRent: 16000,
    districtRates: {
      'Merkez': 680,
      'Biga': 450,
      'Çan': 360,
      'Gelibolu': 500,
      'Ayvacık': 550,
      'Bozcaada': 1200,
      'Gökçeada': 650,
    },
  },
  'Yalova': {
    city: 'Yalova',
    plate: '77',
    defaultM2Rate: 520,
    minSmallShopFloorRent: 16000,
    districtRates: {
      'Merkez': 680,
      'Çiftlikköy': 550,
      'Çınarcık': 580,
      'Altınova': 480,
      'Termal': 520,
      'Armutlu': 420,
    },
  },
  'Afyonkarahisar': {
    city: 'Afyonkarahisar',
    plate: '03',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 480,
      'Sandıklı': 280,
      'Dinar': 260,
      'Bolvadin': 260,
    },
  },
  'Isparta': {
    city: 'Isparta',
    plate: '32',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Merkez': 500,
      'Eğirdir': 320,
      'Yalvaç': 280,
    },
  },
  'Bolu': {
    city: 'Bolu',
    plate: '14',
    defaultM2Rate: 440,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Merkez': 550,
      'Gerede': 320,
      'Mengen': 280,
      'Göynük': 280,
    },
  },
  'Düzce': {
    city: 'Düzce',
    plate: '81',
    defaultM2Rate: 440,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Merkez': 540,
      'Akçakoca': 500,
      'Kaynaşlı': 340,
      'Gölyaka': 300,
    },
  },
  'Zonguldak': {
    city: 'Zonguldak',
    plate: '67',
    defaultM2Rate: 420,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 520,
      'Karadeniz Ereğli': 580,
      'Çaycuma': 380,
      'Devrek': 340,
    },
  },
  'Ordu': {
    city: 'Ordu',
    plate: '52',
    defaultM2Rate: 440,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Altınordu': 580,
      'Ünye': 480,
      'Fatsa': 480,
    },
  },
  'Giresun': {
    city: 'Giresun',
    plate: '28',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 500,
      'Bulancak': 400,
      'Görele': 320,
    },
  },
  'Rize': {
    city: 'Rize',
    plate: '53',
    defaultM2Rate: 440,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Merkez': 550,
      'Çayeli': 400,
      'Ardeşen': 420,
      'Pazar': 380,
    },
  },
  'Edirne': {
    city: 'Edirne',
    plate: '22',
    defaultM2Rate: 480,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Merkez': 620,
      'Keşan': 480,
      'Uzunköprü': 360,
    },
  },
  'Kırklareli': {
    city: 'Kırklareli',
    plate: '39',
    defaultM2Rate: 440,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Merkez': 520,
      'Lüleburgaz': 600,
      'Babaeski': 380,
    },
  },
  'Kütahya': {
    city: 'Kütahya',
    plate: '43',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 480,
      'Tavşanlı': 340,
      'Simav': 280,
      'Gediz': 260,
    },
  },
  'Uşak': {
    city: 'Uşak',
    plate: '64',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 500,
      'Banaz': 280,
      'Eşme': 260,
    },
  },
  'Aksaray': {
    city: 'Aksaray',
    plate: '68',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 480,
      'Ortaköy': 280,
      'Eskil': 240,
    },
  },
  'Nevşehir': {
    city: 'Nevşehir',
    plate: '50',
    defaultM2Rate: 480,
    minSmallShopFloorRent: 15000,
    districtRates: {
      'Merkez': 550,
      'Ürgüp': 950,
      'Avanos': 700,
      'Göre': 600,
    },
  },
  'Niğde': {
    city: 'Niğde',
    plate: '51',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 450,
      'Bor': 300,
    },
  },
  'Karaman': {
    city: 'Karaman',
    plate: '70',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 460,
      'Ermenek': 260,
    },
  },
  'Kırıkkale': {
    city: 'Kırıkkale',
    plate: '71',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 450,
      'Yahşihan': 420,
    },
  },
  'Kırşehir': {
    city: 'Kırşehir',
    plate: '40',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 450,
      'Kaman': 260,
    },
  },
  'Yozgat': {
    city: 'Yozgat',
    plate: '66',
    defaultM2Rate: 340,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 420,
      'Sorgun': 340,
      'Akdağmadeni': 260,
    },
  },
  'Çorum': {
    city: 'Çorum',
    plate: '19',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 480,
      'Sungurlu': 300,
      'Osmancık': 300,
    },
  },
  'Amasya': {
    city: 'Amasya',
    plate: '05',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 500,
      'Merzifon': 440,
      'Suluova': 340,
    },
  },
  'Tokat': {
    city: 'Tokat',
    plate: '60',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 460,
      'Erbaa': 360,
      'Turhal': 340,
      'Niksar': 300,
    },
  },
  'Kastamonu': {
    city: 'Kastamonu',
    plate: '37',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 460,
      'Tosya': 320,
      'Taşköprü': 280,
    },
  },
  'Sinop': {
    city: 'Sinop',
    plate: '57',
    defaultM2Rate: 420,
    minSmallShopFloorRent: 14000,
    districtRates: {
      'Merkez': 540,
      'Boyabat': 360,
      'Gerze': 420,
    },
  },
  'Karabük': {
    city: 'Karabük',
    plate: '78',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 480,
      'Safranbolu': 580,
    },
  },
  'Bartın': {
    city: 'Bartın',
    plate: '74',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 500,
      'Amasra': 650,
    },
  },
  'Çankırı': {
    city: 'Çankırı',
    plate: '18',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 400,
      'Çerkeş': 260,
    },
  },
  'Bilecik': {
    city: 'Bilecik',
    plate: '11',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 460,
      'Bozüyük': 450,
      'Söğüt': 280,
    },
  },
  'Burdur': {
    city: 'Burdur',
    plate: '15',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 450,
      'Bucak': 360,
    },
  },
  'Erzurum': {
    city: 'Erzurum',
    plate: '25',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Yakutiye': 520,
      'Palandöken': 540,
      'Aziziye': 400,
      'Oltu': 280,
    },
  },
  'Erzincan': {
    city: 'Erzincan',
    plate: '24',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 460,
      'Üzümlü': 260,
    },
  },
  'Kars': {
    city: 'Kars',
    plate: '36',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 480,
      'Sarıkamış': 380,
      'Kağızman': 260,
    },
  },
  'Ağrı': {
    city: 'Ağrı',
    plate: '04',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 400,
      'Doğubayazıt': 380,
      'Patnos': 300,
    },
  },
  'Muş': {
    city: 'Muş',
    plate: '49',
    defaultM2Rate: 300,
    minSmallShopFloorRent: 10000,
    districtRates: {
      'Merkez': 380,
      'Bulanık': 240,
      'Malazgirt': 220,
    },
  },
  'Bitlis': {
    city: 'Bitlis',
    plate: '13',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 380,
      'Tatvan': 460,
      'Ahlat': 340,
    },
  },
  'Bingöl': {
    city: 'Bingöl',
    plate: '12',
    defaultM2Rate: 340,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 420,
      'Genç': 240,
    },
  },
  'Batman': {
    city: 'Batman',
    plate: '72',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 500,
      'Kozluk': 260,
    },
  },
  'Mardin': {
    city: 'Mardin',
    plate: '47',
    defaultM2Rate: 400,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Artuklu': 540,
      'Kızıltepe': 460,
      'Midyat': 480,
      'Nusaybin': 340,
    },
  },
  'Siirt': {
    city: 'Siirt',
    plate: '56',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 400,
      'Kurtalan': 260,
    },
  },
  'Şırnak': {
    city: 'Şırnak',
    plate: '73',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 380,
      'Cizre': 460,
      'Silopi': 420,
    },
  },
  'Hakkari': {
    city: 'Hakkari',
    plate: '30',
    defaultM2Rate: 300,
    minSmallShopFloorRent: 10000,
    districtRates: {
      'Merkez': 360,
      'Yüksekova': 420,
    },
  },
  'Adıyaman': {
    city: 'Adıyaman',
    plate: '02',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 380,
      'Kahta': 300,
      'Besni': 260,
    },
  },
  'Osmaniye': {
    city: 'Osmaniye',
    plate: '80',
    defaultM2Rate: 380,
    minSmallShopFloorRent: 13000,
    districtRates: {
      'Merkez': 480,
      'Kadirli': 360,
      'Düziçi': 300,
    },
  },
  'Kilis': {
    city: 'Kilis',
    plate: '79',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 400,
    },
  },
  'Gümüşhane': {
    city: 'Gümüşhane',
    plate: '29',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 400,
      'Kelkit': 260,
    },
  },
  'Bayburt': {
    city: 'Bayburt',
    plate: '69',
    defaultM2Rate: 300,
    minSmallShopFloorRent: 10000,
    districtRates: {
      'Merkez': 380,
    },
  },
  'Artvin': {
    city: 'Artvin',
    plate: '08',
    defaultM2Rate: 360,
    minSmallShopFloorRent: 12000,
    districtRates: {
      'Merkez': 440,
      'Hopa': 480,
      'Borçka': 300,
      'Arhavi': 420,
    },
  },
  'Ardahan': {
    city: 'Ardahan',
    plate: '75',
    defaultM2Rate: 300,
    minSmallShopFloorRent: 10000,
    districtRates: {
      'Merkez': 380,
      'Göle': 240,
    },
  },
  'Iğdır': {
    city: 'Iğdır',
    plate: '76',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 420,
    },
  },
  'Tunceli': {
    city: 'Tunceli',
    plate: '62',
    defaultM2Rate: 320,
    minSmallShopFloorRent: 11000,
    districtRates: {
      'Merkez': 400,
      'Ovacık': 260,
    },
  },
};

/**
 * Verilen il ve ilçeye göre ticari m² kira rayicini hesaplar.
 */
export function getDistrictRentalRate(city: string, district?: string): number {
  const cityData = TURKEY_CITY_RENTAL_RATES[city];
  if (!cityData) return 650;

  if (district && cityData.districtRates[district]) {
    return cityData.districtRates[district];
  }

  return cityData.defaultM2Rate;
}

/**
 * m² ve bölgeye göre dükkanın aylık tahmini kira bedelini hesaplar.
 * Küçük dükkan taban kira eşiğini (küçük metrekare çarpanı) uygular.
 */
export function calculateMonthlyRent(city: string, district: string | undefined, m2: number): number {
  if (!m2 || m2 <= 0) return 0;
  const m2Rate = getDistrictRentalRate(city, district);
  const rawRent = Math.round(m2 * m2Rate);
  
  const cityData = TURKEY_CITY_RENTAL_RATES[city];
  const floorRent = cityData?.minSmallShopFloorRent || 15000;

  // Küçük alanlarda (< 35m²) çarpan eğrisi
  if (m2 < 35) {
    const smallFactor = 1 + ((35 - m2) / 70); // %0 - %25 arası küçük dükkan çarpanı
    return Math.max(floorRent, Math.round(rawRent * smallFactor));
  }

  return rawRent;
}

/**
 * Giriş Peşinatı (1 Peşin + Depozito + Opsiyonel Emlakçı Komisyonu) hesaplar.
 * Varsayılan: 1 Peşin + 1 Depozito = 2x Kira Peşinatı
 */
export function calculateLeaseInitialCost(
  monthlyRent: number,
  depositMonths = 1,
  includeBrokerFee = false
): {
  firstMonthRent: number;
  depositTotal: number;
  brokerFee: number;
  totalLeaseUpfront: number;
} {
  const firstMonthRent = monthlyRent;
  const depositTotal = monthlyRent * depositMonths;
  const brokerFee = includeBrokerFee ? Math.round(monthlyRent * 1.2) : 0; // %20 KDV dahil 1 kira emlak komisyonu

  return {
    firstMonthRent,
    depositTotal,
    brokerFee,
    totalLeaseUpfront: firstMonthRent + depositTotal + brokerFee,
  };
}
