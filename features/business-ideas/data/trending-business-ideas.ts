import type { BusinessIdea } from '../types/business-ideas.types';

export const TRENDING_BUSINESS_IDEAS: BusinessIdea[] = [
  {
    id: 'mobil-koltuk-yikama',
    slug: 'mobil-koltuk-yikama',
    title: 'Mobil Koltuk, Yatak & Halı Yıkama',
    emoji: '🛋️',
    tagline: 'Taşınabilir profesyonel makine ile ev ve ofislere yerinde derinlemesine yıkama hizmeti.',
    category: 'side_hustle',
    categoryLabel: 'Mesai Sonrası / Hafta Sonu',
    workStyle: 'after_hours',
    workStyleLabel: 'Akşam & Hafta Sonu',
    capitalTier: 'low',
    capitalRange: {
      min: 22000,
      max: 38000,
      formatted: '22.000 ₺ - 38.000 ₺',
    },
    timeToFirstIncome: '1 - 3 Gün',
    potentialMonthlyEarnings: {
      min: 25000,
      max: 65000,
      average: 42000,
      formatted: '25.000 ₺ - 65.000 ₺ / Ay',
    },
    profitMarginPercent: 82,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Günlük Sıcak Nakit',
    dailyRevenueExample: 'Günde 2 ev (1 L koltuk + 1 çift kişilik yatak) = ~2.200 ₺ ciro, ~1.850 ₺ net günlük kazanç.',
    difficultyLevel: 'Kolay',
    trendBadge: '🔥 En Çok Tercih Edilen Ek Gelir',
    summaryDescription: 'Tam zamanlı bir işte çalışırken bile akşam 18:00 sonrası veya hafta sonu günde 2-3 randevu alarak yüksek günlük nakit akışı sağlayabileceğiniz en risksiz hizmet modellerinden biridir.',
    targetCustomers: [
      'Evcil hayvanı veya küçük çocuğu olan aileler',
      'Taşınma öncesi veya sonrası derin temizlik isteyen kiracılar',
      'Koltuk ve sandalyelerini yeniletmek isteyen ofis ve klinikler',
      'Airbnb ve kiralık daire sahipleri',
    ],
    requiredTools: [
      { name: 'Profesyonel Puzzi Tipi Koltuk Yıkama Makinesi', estimatedCost: 19500, isMandatory: true, description: 'Yüksek vakum güçlü taşınabilir profesyonel yıkama cihazı.' },
      { name: 'Özel Koltuk Şampuanı ve Leke Çıkarıcı Seti', estimatedCost: 2800, isMandatory: true, description: 'Deri, nubuk ve kumaş uyumlu profesyonel deterjanlar.' },
      { name: 'Döner Başlıklı Matkap Fırça Uçları ve Detay Fırçaları', estimatedCost: 950, isMandatory: true, description: 'Zorlu lekeleri kumaşa zarar vermeden gevşetmek için fırçalar.' },
      { name: 'Taşıma Çantası ve Koruyucu Örtüler', estimatedCost: 850, isMandatory: false },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Ekipman ve Kimyasalları Tedarik Edin', description: 'İkinci el veya sıfır kaliteli bir ekstraksiyon makinesi ve leke kimyasallarını temin edin.' },
      { stepNumber: 2, title: 'Kendi Evinizde ve Yakınlarınızda Test Videosu Çekin', description: 'Önce ve Sonra videoları çekerek Instagram ve WhatsApp için referans portföyü oluşturun.' },
      { stepNumber: 3, title: 'Yerel Çevrede ve Gruplarda Duyurun', description: 'Site ve apartman WhatsApp grupları, yerel sosyal medya sayfaları ve mahalle esnafına broşür bırakın.' },
      { stepNumber: 4, title: 'Akşam ve Hafta Sonu Randevuları ile Başlayın', description: 'Hafta içi 18:30 sonrası 1 ev, cumartesi-pazar günleri 3 ev randevusuyla ayda 30 üzeri işlem tamamlayın.' },
    ],
    proTips: [
      'Müşteriye iş bittiğinde ekstra olarak yatak dezenfeksiyonu veya araç koltuğu teklif ederek sepet tutarını %40 artırabilirsiniz.',
      'Her temizlenen koltuğa hafif aromatik kumaş parfümü sıkmak müşteri memnuniyetini ve tavsiye oranını 3 katına çıkarır.',
    ],
    commonMistakes: [
      'Kumaş türünü test etmeden aşırı agresif kimyasal kullanıp kumaşın rengini soldurmak.',
      'Koltukta aşırı su bırakmak (iyi vakum yapmamak) ve müşteriye kuruma süresi hakkında net bilgi vermemek.',
    ],
  },

  {
    id: 'google-harita-esnaf',
    slug: 'google-harita-esnaf',
    title: 'Yerel Esnafa Google Harita & Yerel SEO Hizmeti',
    emoji: '📍',
    tagline: 'Mahallenizdeki restoran, kuaför ve tamircilerin Google Haritalar üzerinde öne çıkmasını sağlayın.',
    category: 'local_business_services',
    categoryLabel: "Esnafa & KOBİ'lere Hizmet",
    workStyle: 'after_hours',
    workStyleLabel: 'Esnek & Dijital',
    capitalTier: 'micro',
    capitalRange: {
      min: 0,
      max: 4000,
      formatted: '0 ₺ - 4.000 ₺ (Sıfır Sermaye)',
    },
    timeToFirstIncome: '1 - 3 Gün',
    potentialMonthlyEarnings: {
      min: 18000,
      max: 55000,
      average: 34000,
      formatted: '18.000 ₺ - 55.000 ₺ / Ay',
    },
    profitMarginPercent: 95,
    revenueFrequency: 'project',
    revenueFrequencyLabel: 'İşlem Başı & Aylık Bakım',
    dailyRevenueExample: 'Haftada 3 esnafa harita doğrulama, fotoğraf ve profil optimizasyonu = 7.500 ₺ haftalık net kazanç.',
    difficultyLevel: 'Kolay',
    trendBadge: '⚡ Sıfır Sermaye ile Başla',
    summaryDescription: 'Türkiye genelindeki esnafların çoğunun Google Harita profilleri eksik, doğrulanmamış veya kalitesiz fotoğraflarla dolu. Akıllı telefonunuz ve temel internet bilginizle esnafları ziyaret edip anında değer üretebilirsiniz.',
    targetCustomers: [
      'Kuaför ve güzellik salonları',
      'Oto tamir, lastikçi ve ekspertiz servisleri',
      'Çiğköfteci, kafe ve yerel lokantalar',
      'Diş klinikleri, veterinerler ve avukatlık büroları',
    ],
    requiredTools: [
      { name: 'Kamera Kalitesi İyi Bir Akıllı Telefon', estimatedCost: 0, isMandatory: true, description: 'İşyerinin iç ve dış profesyonel fotoğraflarını çekmek için.' },
      { name: 'Google Business Profile Bilgisi', estimatedCost: 0, isMandatory: true, description: 'Ücretsiz Google eğitimleri ve rehberleri.' },
      { name: 'QR Kodlu Yorum Kartvizitleri Baskısı', estimatedCost: 650, isMandatory: false, description: 'Esnafın masalarına koyacağı Değerlendirme QR kartları.' },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Bölgenizdeki Eksik Harita Kayıtlarını Tespit Edin', description: 'Google Haritalar uygulamasını açıp çevrenizdeki işletmeleri inceleyin; fotoğrafı olmayan veya çalışma saatleri eksik olanları listeleyin.' },
      { stepNumber: 2, title: 'Esnafı Yüz Yüze Ziyaret Edin', description: 'İşletme sahibine Google üzerinde arayan müşterilerin dükkanı nasıl gördüğünü ve eksikleri nasıl 1 günde giderebileceğinizi gösterin.' },
      { stepNumber: 3, title: 'Hızlıca Fotoğrafları Çekip Profili Optimize Edin', description: 'Menü, çalışma saatleri, ürün fotoğrafları ve anahtar kelimeleri ekleyin.' },
      { stepNumber: 4, title: 'Aylık Yorum Yönetimi & Fotoğraf Güncelleme Paketi Sunun', description: 'Tek seferlik 2.500 ₺ yerine aylık 1.500 ₺ düzenli bakım sözleşmesi bağlayın.' },
    ],
    proTips: [
      'İşletmeye özel masalara konulan akrilik Google Yorum Yap QR standı hediye edin; bu esnafın size güvenini ve referansını katlar.',
      'Bir mahalledeki oto sanayi sitesine girip arka arkaya 5-6 tamirciye aynı gün içinde toplu hizmet verebilirsiniz.',
    ],
    commonMistakes: [
      'Google resmi yetkilisi gibi davranmak yerine samimi bir yerel dijital danışman gibi yaklaşmamak.',
      'Sadece kayıt açıp bırakmak, esnafa yorum toplamanın önemini anlatmamak.',
    ],
  },

  {
    id: 'airbnb-yonetim-temizlik',
    slug: 'airbnb-yonetim-temizlik',
    title: 'Airbnb & Kısa Dönem Kiralık Ev Yönetimi',
    emoji: '🔑',
    tagline: 'Ev sahipleri adına misafir karşılama, anahtar teslimi, temizlik ve otel standartlarında hazırlık.',
    category: 'side_hustle',
    categoryLabel: 'Mesai Sonrası / Hafta Sonu',
    workStyle: 'after_hours',
    workStyleLabel: 'Gezici & Esnek',
    capitalTier: 'micro',
    capitalRange: {
      min: 3000,
      max: 12000,
      formatted: '3.000 ₺ - 12.000 ₺',
    },
    timeToFirstIncome: '1 Hafta',
    potentialMonthlyEarnings: {
      min: 30000,
      max: 85000,
      average: 52000,
      formatted: '30.000 ₺ - 85.000 ₺ / Ay',
    },
    profitMarginPercent: 78,
    revenueFrequency: 'monthly',
    revenueFrequencyLabel: 'Düzenli Ev Başı Komisyon',
    dailyRevenueExample: 'Yönetilen 5 daireden aylık komisyon (%18) + temizlik ücretleri = ~48.000 ₺ net aylık gelir.',
    difficultyLevel: 'Orta',
    trendBadge: '💎 Yüksek Düzenli Gelir',
    summaryDescription: 'Şehir merkezlerinde veya turistik bölgelerde yüzlerce ev sahibi yoğunluktan dolayı misafir karşılayamıyor ve temizlik koordinasyonunu yapamıyor. 4-6 evin operasyonunu üstlenerek düzenli pasif benzeri gelir elde edebilirsiniz.',
    targetCustomers: [
      'Yurt dışında veya şehir dışında yaşayan gayrimenkul sahipleri',
      'Yoğun çalışan ve misafir mesajlarına yetişemeyen ev sahipleri',
      'Kısa dönem kiraya verilen rezidans ve villa sahipleri',
    ],
    requiredTools: [
      { name: 'Yedek Otel Tipi Beyaz Çarşaf & Havlu Setleri', estimatedCost: 4500, isMandatory: true, description: 'Hızlı sirkülasyon için yedek tekstil stoğu.' },
      { name: 'Şifreli Anahtar Kutusu (Key Lockbox)', estimatedCost: 950, isMandatory: true, description: 'Temassız misafir girişi için.' },
      { name: 'Otel Tipi Mini Buklet Şampuan & Sabun Seti', estimatedCost: 1200, isMandatory: false },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Bölgenizdeki Airbnb İlanlarını Tarayın', description: 'Sahibinden veya Airbnb üzerinden bölgenizdeki ev sahipleriyle iletişime geçin.' },
      { stepNumber: 2, title: 'Paket Hizmet Teklif Edin', description: 'Giriş ve çıkış kontrolü, temizlik, çamaşır ve misafir iletişimi için rezervasyon başına %15-%20 komisyon teklif edin.' },
      { stepNumber: 3, title: 'Güvenilir Temizlik Standardı Kurun', description: 'Her çıkış sonrası 2 saatte evi otel temizliğinde hazırlayacak pratik bir kontrol listesi oluşturun.' },
      { stepNumber: 4, title: 'Ev Sayısını 5-10 Daireye Çıkarın', description: 'Düzenli müşteri memnuniyetiyle diğer ev sahiplerine referans olun.' },
    ],
    proTips: [
      'Girişte misafire küçük bir Türk lokumu ve yerel rehber kitapçığı bırakmak ev sahibinin 5 yıldız almasını sağlar, ev sahibi de sizden asla vazgeçmez.',
      'Şifreli akıllı kilit sistemi kurarak gece geç gelen misafirler için bile yataktan kalkmadan operasyonu yönetebilirsiniz.',
    ],
    commonMistakes: [
      'Çıkış ile yeni giriş arasındaki kısa sürede temizliği yetiştirememek ve yedek çarşaf bulundurmamak.',
      'Misafirlerin acil sorularına (WiFi şifresi, sıcak su vb.) geç yanıt vermek.',
    ],
  },

  {
    id: 'mobil-far-cizik',
    slug: 'mobil-far-cizik',
    title: 'Mobil Far Parlatma & Hızlı Çizik Giderme',
    emoji: '🚗',
    tagline: 'Otoparklarda ve araç sahiplerinin kapısında sararmış farları ilk günkü haline getirme.',
    category: 'field_mobile',
    categoryLabel: 'Sahada & Günlük Nakit',
    workStyle: 'after_hours',
    workStyleLabel: 'Sahada & Mobil',
    capitalTier: 'low',
    capitalRange: {
      min: 8000,
      max: 18000,
      formatted: '8.000 ₺ - 18.000 ₺',
    },
    timeToFirstIncome: '1 - 2 Gün',
    potentialMonthlyEarnings: {
      min: 22000,
      max: 58000,
      average: 38000,
      formatted: '22.000 ₺ - 58.000 ₺ / Ay',
    },
    profitMarginPercent: 88,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Günlük Sıcak Nakit',
    dailyRevenueExample: 'Günde 3 araç far temizleme & seramik koruma (araç başı 800 ₺) = 2.400 ₺ ciro, 2.150 ₺ net günlük kazanç.',
    difficultyLevel: 'Kolay',
    trendBadge: '⚡ Hızlı Nakit Akışı',
    summaryDescription: 'Trafikteki araçların yarısından fazlasının farları güneşten ve zamandan dolayı sararmış durumda ve bu durum araç muayenesinden (TÜVTÜRK) geçmeyi engelliyor. Küçük bir çantayla araç sahibinin ayağına giderek 30 dakikada mükemmel sonuç sunabilirsiniz.',
    targetCustomers: [
      'TÜVTÜRK araç muayenesine girecek araç sahipleri',
      'Aracını satılığa çıkaran ve değerini artırmak isteyenler',
      'Oto galericiler ve filo kiralama şirketleri',
      'Site otoparklarındaki bireysel araç sahipleri',
    ],
    requiredTools: [
      { name: 'Kloroformlu Buharlı Far Temizleme Kupa Seti', estimatedCost: 3500, isMandatory: true, description: 'Polikarbon far camını buharla sıfırlayan kit.' },
      { name: 'Akülü Orbital Zımpara & Polisaj Makinesi', estimatedCost: 5500, isMandatory: true, description: 'Elektrik prizine ihtiyaç duymadan otoparkta çalışmak için.' },
      { name: 'Sulu Zımpara Seti (800-1200-2000-3000 Grit)', estimatedCost: 650, isMandatory: true },
      { name: 'Far Koruyucu UV Seramik Kaplama Spreyi', estimatedCost: 1400, isMandatory: true, description: 'Farın yeniden sararmasını 2 yıl engelleyen koruyucu.' },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Seti Alıp Kendi Aracınızda Deneyin', description: 'Zımparalama ve kloroform buharı tekniğini 2-3 far üzerinde uygulayarak mükemmelleştirin.' },
      { stepNumber: 2, title: 'Önce ve Sonra Videosu Çekin', description: 'Sararmış farın buharla anında cam gibi parladığı büyüleyici 15 saniyelik sosyal medya videosu kaydedin.' },
      { stepNumber: 3, title: 'Oto Sanayi ve Muayene İstasyonu Yakınlarında Tanıtım Yapın', description: 'TÜVTÜRK istasyonuna giden güzergahlarda veya site otoparklarında kartvizit bırakın.' },
      { stepNumber: 4, title: 'Randevulu Mobil Hizmet Verin', description: 'Müşterinin işyeri otoparkına gidip o çalışırken 35 dakikada aracını teslim edin.' },
    ],
    proTips: [
      'Galericilerle anlaşıp haftada 1 gün galerideki tüm satılık 8-10 aracın farlarını toplu olarak temizleyip tek seferde yüksek fatura kesebilirsiniz.',
      'Far temizliğinin yanına kaput ucu çizik giderme ve hızlı cila ekleyerek paket fiyatınızı yükseltin.',
    ],
    commonMistakes: [
      'Zımparalama aşamasını aceleye getirip eski verniği tam kazımadan buhar vermek.',
      'İşlem sonrası UV koruyucu seramik sürmeyip farın 2 ay sonra tekrar sararmasına yol açmak.',
    ],
  },

  {
    id: 'su-aritma-filtre',
    slug: 'su-aritma-filtre',
    title: 'Su Arıtma Satış & 6 Aylık Periyodik Filtre Servisi',
    emoji: '💧',
    tagline: 'Evlere ve ofislere arıtma montajı ve her 6 ayda bir düzenli filtre değişim aboneliği.',
    category: 'field_mobile',
    categoryLabel: 'Sahada & Günlük Nakit',
    workStyle: 'after_hours',
    workStyleLabel: 'Sahada & Gezici',
    capitalTier: 'low',
    capitalRange: {
      min: 15000,
      max: 45000,
      formatted: '15.000 ₺ - 45.000 ₺',
    },
    timeToFirstIncome: '1 Hafta',
    potentialMonthlyEarnings: {
      min: 28000,
      max: 75000,
      average: 48000,
      formatted: '28.000 ₺ - 75.000 ₺ / Ay',
    },
    profitMarginPercent: 70,
    revenueFrequency: 'monthly',
    revenueFrequencyLabel: 'Tekrarlayan Düzenli Gelir',
    dailyRevenueExample: 'Günde 3 filtre değişimi (1.200 ₺/ev) + 1 cihaz satışı = ~4.500 ₺ net günlük kâr.',
    difficultyLevel: 'Orta',
    trendBadge: '📈 Abonelik Benzeri Düzenli Gelir',
    summaryDescription: 'Damacana su fiyatlarının yükseldiği bu dönemde su arıtma cihazı taktırmak her ailenin ilk tercihi. Ancak asıl büyük kazanç; cihazı taktıktan sonra her 6 ayda bir o müşteriye gidip filtre değiştirmektir.',
    targetCustomers: [
      'Yüksek damacana maliyetinden yorulan aileler',
      'Çay ocağı, kuaför, ofis ve küçük işletmeler',
      'Yeni taşınan veya evlenen çiftler',
      'Mevcut arıtma servisine ulaşamayan veya yüksek fiyat alan müşteriler',
    ],
    requiredTools: [
      { name: 'Toptan 5 Aşamalı Filtre Setleri (10 Takım)', estimatedCost: 6500, isMandatory: true, description: 'Sediment, karbon, blok karbon ve membran filtreler.' },
      { name: 'Basit Sıhhi Tesisat Alet Çantası (İngiliz anahtarı, teflon, hortum kesici)', estimatedCost: 2200, isMandatory: true },
      { name: 'Dijital TDS Su Kalite Ölçüm Kalemi', estimatedCost: 450, isMandatory: true, description: 'Müşteriye musluk suyu ile arıtılmış su arasındaki farkı göstermek için.' },
      { name: 'Numune 1 Adet Kapalı Kasa Su Arıtma Cihazı', estimatedCost: 4800, isMandatory: false },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Toptancıdan Uygun Fiyatlı Filtre ve Cihaz Temin Edin', description: 'Toptancılardan doğrudan kaliteli filtre setleri alın.' },
      { stepNumber: 2, title: 'Mevcut Arıtma Kullananları Bulun', description: 'Apartman yöneticileri ve komşulara arıtmanın filtre değişim zamanının gelip gelmediğini sorup ücretsiz TDS su analizi yapın.' },
      { stepNumber: 3, title: 'TDS Cihazıyla Canlı Su Testi Yapın', description: 'Musluk suyunu ve arıtma suyunu test ederek filtrenin durumunu müşteriye gösterin.' },
      { stepNumber: 4, title: 'Müşteri Hatırlatma Takvimi Oluşturun', description: 'Basit bir tablo ile her müşterinin 6. ayında otomatik arayıp randevu oluşturun.' },
    ],
    proTips: [
      'Her taktığınız cihaza üzerinde kendi telefon numaranız ve bir sonraki değişim tarihi yazan şık bir etiket yapıştırın.',
      '100 düzenli filtre müşterisine ulaştığınızda sadece filtre değişimlerinden ayda 40.000 ₺ garantili düzenli geliriniz olur.',
    ],
    commonMistakes: [
      'Membran filtreyi takarken contayı oturtmayıp su sızdırmak.',
      'Müşterilerin filtre değişim tarihlerini kaydetmeyip unutmak.',
    ],
  },

  {
    id: 'usta-ekipman-kiralama',
    slug: 'usta-ekipman-kiralama',
    title: 'Profesyonel Usta & Tadilat Aletleri Günlük Kiralama',
    emoji: '🔨',
    tagline: 'Pahalı hilti, karot, kaynak ve boya makinelerini ustalara ve bireylere günlük kiralayın.',
    category: 'field_mobile',
    categoryLabel: 'Sahada & Günlük Nakit',
    workStyle: 'home',
    workStyleLabel: 'Evden / Garajdan',
    capitalTier: 'medium',
    capitalRange: {
      min: 40000,
      max: 110000,
      formatted: '40.000 ₺ - 110.000 ₺',
    },
    timeToFirstIncome: '3 - 5 Gün',
    potentialMonthlyEarnings: {
      min: 35000,
      max: 95000,
      average: 58000,
      formatted: '35.000 ₺ - 95.000 ₺ / Ay',
    },
    profitMarginPercent: 92,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Günlük Kiralama Bedeli',
    dailyRevenueExample: 'Hilti (900 ₺/gün) + Karot (1.800 ₺/gün) + Lazer Terazi (450 ₺/gün) = ~3.150 ₺ günlük pasif ciro.',
    difficultyLevel: 'Kolay',
    trendBadge: '💰 Yüksek Sermaye Getirisi',
    summaryDescription: 'Evinde tadilat yapacak kişi veya ara sıra iş alan ustalar yüksek maliyetle karot veya kırıcı almak istemez. Evinizin garajından sözleşme ve depozito karşılığı bu aletleri kiralayarak makine başına 1-2 ayda amortisman sağlayabilirsiniz.',
    targetCustomers: [
      'Kendi evini tadilat yapan bireysel kullanıcılar',
      'Ağır aletleri olmayan elektrikçi, tesisatçı ve mermerci ustaları',
      'Kısa süreli şantiye ve inşaat ekipleri',
      'Bahçe düzenlemesi yapan peyzaj ekipleri',
    ],
    requiredTools: [
      { name: 'Ağır Hizmet Kırıcı Delici Hilti (15-20 kg)', estimatedCost: 18000, isMandatory: true },
      { name: 'Sulu Karot Beton Delme Makinesi & Uçları', estimatedCost: 26000, isMandatory: true },
      { name: 'Havasız (Airless) Profesyonel Duvar Boya Püskürtme Makinesi', estimatedCost: 16000, isMandatory: false },
      { name: '360 Derece Yeşil Işınlı 3D Lazer Hizalama Terazisi', estimatedCost: 6500, isMandatory: true },
      { name: 'Standart Kira Sözleşmesi ve Kimlik Fotokopisi Formu', estimatedCost: 0, isMandatory: true },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'En Çok Talep Gören 3-4 Temel Ağır Aleti Satın Alın', description: 'Kırıcı hilti, karot, lazer terazi ve kaynak makinesi gibi talep gören aletlerle başlayın.' },
      { stepNumber: 2, title: 'İnternette Günlük Kiralık İlanları Açın', description: 'Günlük Kiralık Karot ve Günlük Kiralık Kırıcı Hilti başlıklarıyla yerel ilanlar verin.' },
      { stepNumber: 3, title: 'Sağlam Sözleşme ve Depozito ile Teslim Edin', description: 'Kimlik fotokopisi, kira sözleşmesi ve depozito alarak teslim edin.' },
      { stepNumber: 4, title: 'Aletleri Bakımlı Tutup Portföyü Genişletin', description: 'Gelen kazançla parke zımpara makinesi veya karot uçları ekleyin.' },
    ],
    proTips: [
      'Aletin yanına uçları, yağları ve güvenlik gözlüğünü tam takım olarak verin; müşteri ertesi gün yine sizden kiralayacaktır.',
      'Eve kadar teslimat hizmeti için ekstra kurye ve yakıt bedeli ekleyebilirsiniz.',
    ],
    commonMistakes: [
      'Depozito veya kimlik sözleşmesi almadan aleti teslim etmek.',
      'Alet geri geldiğinde çalışıp çalışmadığını müşterinin önünde test etmeden teslim almak.',
    ],
  },

  {
    id: '3d-baski-hediyelik',
    slug: '3d-baski-hediyelik',
    title: '3D Yazıcı ile Litofan Gece Lambası & Özel Yedek Parça',
    emoji: '🖨️',
    tagline: 'Evden kişiye özel fotoğraflı ışıklı gece lambaları ve piyasada bulunmayan plastik yedek parçalar üretin.',
    category: 'home_craft',
    categoryLabel: 'Evden / Butik Üretim',
    workStyle: 'home',
    workStyleLabel: 'Evden / Masabaşı',
    capitalTier: 'low',
    capitalRange: {
      min: 16000,
      max: 32000,
      formatted: '16.000 ₺ - 32.000 ₺',
    },
    timeToFirstIncome: '3 - 7 Gün',
    potentialMonthlyEarnings: {
      min: 20000,
      max: 52000,
      average: 34000,
      formatted: '20.000 ₺ - 52.000 ₺ / Ay',
    },
    profitMarginPercent: 85,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Sipariş Başı Gelir',
    dailyRevenueExample: 'Günde 3 adet litofan fotoğraflı gece lambası (tanesi 650 ₺, filament maliyeti 45 ₺) = ~1.750 ₺ net günlük kâr.',
    difficultyLevel: 'Kolay',
    trendBadge: '🎨 Evden Yüksek Kâr Marjı',
    summaryDescription: 'Modern hızlı 3D yazıcılar artık son derece pratik. Müşterinin gönderdiği aile fotoğrafını ışığı açınca parlayan 3D ay lambasına veya eski model arabaların kırılan klima ızgarası tırnaklarına dönüştürerek evinizden üretim yapabilirsiniz.',
    targetCustomers: [
      'Özel gün hediyesi arayan bireysel müşteriler',
      'Eski veya ithal arabasının plastik parçasını bulamayan oto sanayi ustaları',
      'Masaüstü figür ve oyun meraklıları',
      'Özel stand ve teşhir ürünü isteyen butik mağazalar',
    ],
    requiredTools: [
      { name: 'Hızlı ve Otomatik Kalibrasyonlu 3D Yazıcı (Bambu Lab / Creality)', estimatedCost: 16500, isMandatory: true },
      { name: 'PLA ve PETG Filament Çeşitleri (Beyaz, Ahşap, Siyah)', estimatedCost: 3200, isMandatory: true },
      { name: 'Ahşap Lamba Altlığı ve Dokunmatik LED Işık Kiti', estimatedCost: 1800, isMandatory: true },
      { name: 'Hediye Kutusu ve Kargo Ambalaj Malzemeleri', estimatedCost: 950, isMandatory: false },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Yazıcıyı Kurup Ücretsiz Litofan Yazılımlarını Öğrenin', description: 'Fotoğrafı 3 boyutlu kavisli lamba paneline dönüştüren web araçlarını test edin.' },
      { stepNumber: 2, title: 'Numune Ürünler Basıp Işıklı Videolar Çekin', description: 'Karanlık odada lambanın açıldığı anı gösteren etkileyici sosyal medya videoları hazırlayın.' },
      { stepNumber: 3, title: 'E-Ticaret ve Sosyal Medya Mağazası Açın', description: 'Kişiye Özel Fotoğraflı 3D Ay Lambası başlığıyla sipariş toplamaya başlayın.' },
      { stepNumber: 4, title: 'Sanayideki Oto Döşemecilere ve Tamircilere Parça Basın', description: 'Bulunamayan kırık plastik klips ve tırnakları basarak sanayi kanalını devreye sokun.' },
    ],
    proTips: [
      'Özellikle Anneler Günü, Sevgililer Günü ve Yılbaşında siparişler katlanır; bu dönemler öncesinde stok ahşap altlık ve kutu hazırlayın.',
      'Otomobil kulüplerinin gruplarına üye olup nadir araçların kırılan bardaklık ve ızgaralarını satın.',
    ],
    commonMistakes: [
      'Kalitesiz filament kullanarak lambada yüzey pürüzleri yaratmak.',
      'Kargolarken koruyucu balonlu naylon kullanmayıp lambanın kırılmasına sebep olmak.',
    ],
  },

  {
    id: 'evcil-hayvan-pansiyon',
    slug: 'evcil-hayvan-pansiyon',
    title: 'Hafta Sonu Evcil Hayvan Pansiyonu & Köpek Gezdirme',
    emoji: '🐕',
    tagline: 'Tatile veya iş seyahatine giden hayvan sahiplerinin evcil hayvanlarına sıcak ev ortamında pansiyon hizmeti.',
    category: 'side_hustle',
    categoryLabel: 'Mesai Sonrası / Hafta Sonu',
    workStyle: 'home',
    workStyleLabel: 'Evden & Çevrede',
    capitalTier: 'micro',
    capitalRange: {
      min: 1500,
      max: 6000,
      formatted: '1.500 ₺ - 6.000 ₺ (Sıfır Sermaye)',
    },
    timeToFirstIncome: '1 - 3 Gün',
    potentialMonthlyEarnings: {
      min: 16000,
      max: 45000,
      average: 28000,
      formatted: '16.000 ₺ - 45.000 ₺ / Ay',
    },
    profitMarginPercent: 95,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Günlük Konaklama Bedeli',
    dailyRevenueExample: 'Hafta sonu 3 kedi veya küçük ırk köpek misafir etme (günlük 650 ₺/patili) = ~3.900 ₺ hafta sonu net kazanç.',
    difficultyLevel: 'Kolay',
    trendBadge: '🐾 Sıfır Risk & Sevgi Dolu İş',
    summaryDescription: 'Hayvan sahipleri tatile giderken can dostlarını soğuk kafesli pet otellerine bırakmak istemiyor; ev ortamında şefkatle bakılmasını tercih ediyor. Eviniz müsaitse ve hayvanları seviyorsanız sıfır sermayeyle hemen başlayabilirsiniz.',
    targetCustomers: [
      'Hafta sonu tatile veya şehir dışına çıkan aileler',
      'Günde 10-12 saat yoğun çalışan ve köpeğini gezdiremeyen çalışanlar',
      'Yaz aylarında yıllık izne ayrılan kedi ve köpek sahipleri',
    ],
    requiredTools: [
      { name: 'Yedek Mama & Su Kapları, Tırmalama Tahtası ve Yataklar', estimatedCost: 1800, isMandatory: true },
      { name: 'Güvenli Gezdirme Tasmaları & Dışkı Torbaları', estimatedCost: 650, isMandatory: true },
      { name: 'Evcil Hayvan İlk Yardım Spreyi ve Temizlik Seti', estimatedCost: 850, isMandatory: true },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Evinizi Güvenli Hale Getirin', description: 'Pencerelere güvenlik teli takın, açıkta tehlikeli kablo veya bitki bırakmayın.' },
      { stepNumber: 2, title: 'Bölgenizdeki Petshop ve Veterinerlere Kart Bırakın', description: 'Mahallenizdeki veterinerlere gidip kendinizi tanıtın ve ev ortamında baktığınızı söyleyin.' },
      { stepNumber: 3, title: 'Gün Boyu Sahibine Fotoğraf ve Video Gönderin', description: 'Günde 3-4 kez WhatsApp üzerinden köpeğin veya kedinin oyun oynarken videosunu paylaşın.' },
      { stepNumber: 4, title: 'Düzenli Müşteri Havuzu Oluşturun', description: 'Memnun kalan hayvan sahipleri her seyahatte doğrudan sizi arayacaktır.' },
    ],
    proTips: [
      'Aynı anda sadece birbiriyle anlaşabilen sakin hayvanları kabul edin; huzurlu bir ortam yaratın.',
      'Gündüzleri 45 dakikalık köpek gezdirme hizmeti ekleyerek yürüyüş başına ek gelir sağlayın.',
    ],
    commonMistakes: [
      'Aşı kartı eksik veya uyumsuz hayvanları kabul etmek.',
      'Sahibinin verdiği özel mamanın dışına çıkıp hayvanın midesini bozmak.',
    ],
  },

  {
    id: 'ikinci-el-yenileme',
    slug: 'ikinci-el-yenileme',
    title: 'İkinci El Mobilya & Eşya Yenileme ve Satış (Flipping)',
    emoji: '🪑',
    tagline: 'Uygun fiyata alınan masif ahşap mobilyaları boyayıp, kulp takarak yüksek fiyata satma.',
    category: 'home_craft',
    categoryLabel: 'Evden / Butik Üretim',
    workStyle: 'home',
    workStyleLabel: 'Evden / Garajdan',
    capitalTier: 'low',
    capitalRange: {
      min: 6000,
      max: 20000,
      formatted: '6.000 ₺ - 20.000 ₺',
    },
    timeToFirstIncome: '3 - 7 Gün',
    potentialMonthlyEarnings: {
      min: 24000,
      max: 60000,
      average: 38000,
      formatted: '24.000 ₺ - 60.000 ₺ / Ay',
    },
    profitMarginPercent: 75,
    revenueFrequency: 'project',
    revenueFrequencyLabel: 'Ürün Başı Kâr',
    dailyRevenueExample: '1.200 ₺ ile alınan masif komodine 400 ₺ boya masrafı yapıp 5.500 ₺ ile satarak parça başı 3.900 ₺ net kâr.',
    difficultyLevel: 'Kolay',
    trendBadge: '♻️ Yaratıcı Dönüşüm',
    summaryDescription: 'İnsanlar taşınırken veya ev yenilerken sapasağlam masif ahşap sehpaları ve komodinleri elden çıkarıyor. Bu eşyaları zımparalayıp modern renklerle boyayarak yüksek fiyatlara satabilirsiniz.',
    targetCustomers: [
      'Evine uygun fiyatlı ama tarz vintage mobilya arayanlar',
      'Kafe, butik otel ve fotoğraf stüdyosu sahipleri',
      'Sosyal medyada estetik ev dekorasyonu seven kitle',
    ],
    requiredTools: [
      { name: 'Tebeşir Boyası ve Akrilik Mobilya Boyaları Seti', estimatedCost: 2400, isMandatory: true },
      { name: 'Eksantrik Zımpara Makinesi & Zımpara Kağıtları', estimatedCost: 3200, isMandatory: true },
      { name: 'Vintage Mobilya Kulp Çeşitleri', estimatedCost: 1200, isMandatory: false },
      { name: 'Koruyucu Su Bazlı Vernik ve Rulo Fırçalar', estimatedCost: 1100, isMandatory: true },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'İkinci El Sitelerinden Masif Mobilyaları Bulun', description: 'Taşınma nedeniyle satılan masif ahşap mobilya ilanlarını takip edin.' },
      { stepNumber: 2, title: 'Zımpara ve Trend Renklerle Boyama Yapın', description: 'Adaçayı yeşili, antrasit, kırık beyaz gibi çok satan renklere boyayıp şık kulplar takın.' },
      { stepNumber: 3, title: 'Estetik Bir İç Mekan Fotoğrafı Çekin', description: 'Üzerine vazo ve kitap koyarak doğal gün ışığında profesyonel fotoğraf çekin.' },
      { stepNumber: 4, title: 'Pazaryerlerinde Satışa Çıkarın', description: 'Yenilenmiş Masif Vintage Mobilya başlığıyla değerinde fiyatlandırarak satın.' },
    ],
    proTips: [
      'Mobilyanın dönüşüm sürecini hızlandırılmış video olarak sosyal medyada paylaşın; ürün bitmeden alıcı bulur.',
      'Sadece masif ahşap mobilyalara odaklanın.',
    ],
    commonMistakes: [
      'Boyamadan önce yüzeyi yağ ve kirden iyice arındırmamak.',
      'Karanlık ortamda kötü fotoğraflar çekip ürünün değerini düşürmek.',
    ],
  },

  {
    id: 'ozel-gun-butik-ikram',
    slug: 'ozel-gun-butik-ikram',
    title: 'Özel Gün Butik Pasta, Kurabiye & Şirket İkram Kutuları',
    emoji: '🧁',
    tagline: 'Ev mutfağınızda doğum günleri, nişanlar ve şirket kahvaltıları için gurme ikram kutuları üretin.',
    category: 'home_craft',
    categoryLabel: 'Evden / Butik Üretim',
    workStyle: 'home',
    workStyleLabel: 'Evden & Butik',
    capitalTier: 'low',
    capitalRange: {
      min: 5000,
      max: 18000,
      formatted: '5.000 ₺ - 18.000 ₺',
    },
    timeToFirstIncome: '3 - 5 Gün',
    potentialMonthlyEarnings: {
      min: 22000,
      max: 65000,
      average: 40000,
      formatted: '22.000 ₺ - 65.000 ₺ / Ay',
    },
    profitMarginPercent: 68,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Sipariş Başı Gelir',
    dailyRevenueExample: 'Hafta sonu 4 adet özel tasarım butik pasta ve kurabiye seti = ~7.500 ₺ ciro, ~5.100 ₺ net hafta sonu kârı.',
    difficultyLevel: 'Orta',
    trendBadge: '🍰 Tatlı & Lezzetli Girişim',
    summaryDescription: 'Pastanelerin sıradan ürünlerinden sıkılan müşteriler özel günlerinde ev yapımı, şık paketlenmiş butik lezzetler arıyor. Ev mutfağınızdaki fırını kullanarak şık sunumla yüksek kârlı bir butik ikram işi kurabilirsiniz.',
    targetCustomers: [
      'Çocuk doğum günü organizasyonu yapan aileler',
      'Şirket içi sabah toplantıları için ikram arayan ofisler',
      'Söz, nişan merasimleri için özel ikram kutusu isteyenler',
    ],
    requiredTools: [
      { name: 'Stand Mikser & Profesyonel Pasta Süsleme Başlıkları', estimatedCost: 6500, isMandatory: true },
      { name: 'Pencereli Şık Kraft İkram Kutuları & Kurdeleler', estimatedCost: 1600, isMandatory: true },
      { name: 'Kaliteli Belçika Çikolatası ve Malzeme İlk Stok', estimatedCost: 3500, isMandatory: true },
    ],
    executionSteps: [
      { stepNumber: 1, title: '2-3 İmza Ürün Belirleyin', description: 'Islak brownie kutusu, kişiye özel harfli kurabiyeler ve mini sandviçler belirleyin.' },
      { stepNumber: 2, title: 'Şık ve İştah Açıcı Sunum Fotoğrafları Çekin', description: 'Doğal ışıkla profesyonel ürün çekimleri yapın.' },
      { stepNumber: 3, title: 'Çevrenizdeki Ofisleri Ziyaret Edin', description: 'Küçük numune ikram kutusu bırakarak haftalık toplantı kahvaltılarına talip olun.' },
      { stepNumber: 4, title: 'Ön Ödemeli Sipariş Alın', description: 'Siparişleri en az 2 gün önceden ve kapora ile kabul ederek sıfır fireyle çalışın.' },
    ],
    proTips: [
      'Ofislere haftalık motivasyon ikram kutusu aboneliği teklif edin.',
      'Kutuların üzerine müşterinin ismine özel not kartı ekleyin.',
    ],
    commonMistakes: [
      'Kötü ambalaj kullanıp ürünün yolda dağılmasına sebep olmak.',
      'Maliyet hesabını doğru yapmamak.',
    ],
  },

  {
    id: 'qr-menu-whatsapp-siparis',
    slug: 'qr-menu-whatsapp-siparis',
    title: 'Kafe & Restoranlara QR Menü & WhatsApp Sipariş Kurulumu',
    emoji: '📱',
    tagline: 'Yerel kafe, pastane ve paket servis restoranlarına dakikalar içinde şık dijital menü kurun.',
    category: 'local_business_services',
    categoryLabel: "Esnafa & KOBİ'lere Hizmet",
    workStyle: 'after_hours',
    workStyleLabel: 'Masabaşı & Dijital',
    capitalTier: 'micro',
    capitalRange: {
      min: 0,
      max: 2500,
      formatted: '0 ₺ - 2.500 ₺ (Sıfır Sermaye)',
    },
    timeToFirstIncome: '1 - 2 Gün',
    potentialMonthlyEarnings: {
      min: 20000,
      max: 60000,
      average: 36000,
      formatted: '20.000 ₺ - 60.000 ₺ / Ay',
    },
    profitMarginPercent: 95,
    revenueFrequency: 'monthly',
    revenueFrequencyLabel: 'Aylık Düzenli Lisans Bedeli',
    dailyRevenueExample: 'Haftada 2 restorana kurulum (2.500 ₺/kurulum + 600 ₺/ay bakım) = ~6.200 ₺ haftalık kazanç.',
    difficultyLevel: 'Kolay',
    trendBadge: '⚡ Sıfır Kodlama & Hızlı Gelir',
    summaryDescription: 'Kafe ve lokantalar kağıt menü basmaktan yoruldu; fiyatlar sık sık güncelleniyor. Hazır no-code QR menü yazılımlarını kullanarak esnafa 1 saatte güncellenebilir şık menü kurabilir ve aylık düzenli abonelik geliri bağlayabilirsiniz.',
    targetCustomers: [
      'Menü fiyatlarını güncel tutmak isteyen restoran ve kafeler',
      'Plaj, havuz başı ve teras işletmeleri',
      'Paket servis yapan yerel dükkanlar',
    ],
    requiredTools: [
      { name: 'Bilgisayar veya Tablet', estimatedCost: 0, isMandatory: true },
      { name: 'Masaüstü Akrilik QR Menü Standları (Numune)', estimatedCost: 450, isMandatory: false },
      { name: 'Hazır QR Menü Altyapısı / No-Code Şablon', estimatedCost: 650, isMandatory: true },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Bölgenizdeki Kağıt Menü Kullanan Yerleri Gezin', description: 'Yıpranmış kağıt menüsü olan yerleri tespit edin.' },
      { stepNumber: 2, title: 'İşletme Sahibine Canlı Demo Gösterin', description: 'Kendi telefonunuzdan bir demo QR okutup fiyatların nasıl saniyeler içinde değiştiğini gösterin.' },
      { stepNumber: 3, title: 'Menü Fotoğraflarını Yükleyip Masalara QR Standı Bırakın', description: 'İşletmenin logosuna özel QR kodlu şık standları yerleştirin.' },
      { stepNumber: 4, title: 'Aylık Menü Güncelleme Bedeli Alın', description: 'Kurulum bedeli ve her ay düzenli destek ücreti alın.' },
    ],
    proTips: [
      'Menünün altına WhatsApp üzerinden Masaya Sipariş Ver butonu ekleyin.',
      '30 restorana ulaştığınızda ayda düzenli pasif bakım geliriniz olur.',
    ],
    commonMistakes: [
      'PDF indirmeye zorlayan kötü bir QR menü sistemi kullanmak.',
      'Yemeklerin fotoğraflarını net eklememek.',
    ],
  },

  {
    id: 'etkinlik-ses-isik-kiralama',
    slug: 'etkinlik-ses-isik-kiralama',
    title: 'Özel Gün & Doğum Günü Ses, Işık & Projeksiyon Kiralama',
    emoji: '🎉',
    tagline: 'Ev partileri, bahçe sinemaları, söz-nişan ve doğum günlerine taşınabilir ses ve ışık seti kiralayın.',
    category: 'side_hustle',
    categoryLabel: 'Mesai Sonrası / Hafta Sonu',
    workStyle: 'after_hours',
    workStyleLabel: 'Akşam & Hafta Sonu',
    capitalTier: 'medium',
    capitalRange: {
      min: 25000,
      max: 55000,
      formatted: '25.000 ₺ - 55.000 ₺',
    },
    timeToFirstIncome: '3 - 5 Gün',
    potentialMonthlyEarnings: {
      min: 26000,
      max: 70000,
      average: 45000,
      formatted: '26.000 ₺ - 70.000 ₺ / Ay',
    },
    profitMarginPercent: 90,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Günlük Kiralama Bedeli',
    dailyRevenueExample: 'Hafta sonu 2 doğum günü + 1 bahçe sineması seti kiralama (etkinlik başı 2.500 ₺) = ~7.500 ₺ hafta sonu net kazancı.',
    difficultyLevel: 'Kolay',
    trendBadge: '🌙 Hafta Sonu Favorisi',
    summaryDescription: 'İnsanlar evinde doğum günü veya bahçesinde film gecesi yaparken yüksek maliyetle ses sistemi ve projeksiyon almak istemez. Taşınabilir akülü hoparlör, kablosuz mikrofon, parti ışığı ve projeksiyon perdesinden oluşan pratik bir seti kiraya vererek hafta sonları yüksek gelir elde edebilirsiniz.',
    targetCustomers: [
      'Bahçeli evlerde doğum günü ve parti düzenleyen aileler',
      'Evde söz ve nişan organizasyonu yapan çiftler',
      'Açık hava sinema gecesi yapan topluluklar',
      'Şirket içi kutlama yapan küçük ofisler',
    ],
    requiredTools: [
      { name: 'Yüksek Güçlü Bluetooth Taşınabilir Parti Hoparlörü', estimatedCost: 19500, isMandatory: true },
      { name: 'Çift Kablosuz El Mikrofonu Seti', estimatedCost: 2800, isMandatory: true },
      { name: 'Full HD Taşınabilir Akıllı Projeksiyon Cihazı & Ayaklı Perde', estimatedCost: 14500, isMandatory: true },
      { name: 'RGB Parti Işık Efekt Cihazı', estimatedCost: 3200, isMandatory: false },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Kompakt Ses ve Görüntü Seti Oluşturun', description: 'Tek bir binek araç bagajına sığabilecek ergonomik ekipmanları seçin.' },
      { stepNumber: 2, title: 'Açık Hava Sinema ve Parti Paketi İlanı Verin', description: 'Akşam kurulmuş ışıl ışıl bahçe sineması fotoğraflarıyla ilan açın.' },
      { stepNumber: 3, title: 'Adrese Teslim Edin ve Kurulumu Yapın', description: 'Müşteriye bağlantıyı gösterip çalışır vaziyette teslim edin.' },
      { stepNumber: 4, title: 'Ertesi Gün Sabah Ekipmanı Teslim Alın', description: 'Ekipmanı kontrol edip teslim alın ve yeni randevuya hazırlayın.' },
    ],
    proTips: [
      'Projeksiyonun yanına küçük bir patlamış mısır makinesi ekleyerek paket fiyatını artırın.',
      'Organizasyon şirketleri ile iletişime geçip onlara ekipman sağlayın.',
    ],
    commonMistakes: [
      'Ekipman tesliminde depozito veya sözleşme almamak.',
      'Hoparlörün şarjını tam doldurmadan teslim etmek.',
    ],
  },

  {
    id: 'bahce-ofis-bitki-bakim',
    slug: 'bahce-ofis-bitki-bakim',
    title: 'Site & Ofis İç Mekan Bitkileri Periyodik Bakımı',
    emoji: '🌿',
    tagline: 'Plaza ofisleri, kafeler ve apartmanların salon bitkilerine düzenli sulama, budama ve toprak bakımı.',
    category: 'field_mobile',
    categoryLabel: 'Sahada & Günlük Nakit',
    workStyle: 'after_hours',
    workStyleLabel: 'Sahada & Doğa ile İç İçe',
    capitalTier: 'micro',
    capitalRange: {
      min: 2500,
      max: 8000,
      formatted: '2.500 ₺ - 8.000 ₺',
    },
    timeToFirstIncome: '1 Hafta',
    potentialMonthlyEarnings: {
      min: 20000,
      max: 48000,
      average: 32000,
      formatted: '20.000 ₺ - 48.000 ₺ / Ay',
    },
    profitMarginPercent: 88,
    revenueFrequency: 'monthly',
    revenueFrequencyLabel: 'Aylık Bakım Sözleşmesi',
    dailyRevenueExample: 'Haftada 8 ofis veya klinik periyodik bitki bakımı (ofis başı aylık 2.000 ₺) = ~16.000 ₺/ay düzenli ek gelir.',
    difficultyLevel: 'Kolay',
    trendBadge: '🌱 Doğa Dostu & Düzenli Gelir',
    summaryDescription: 'Büyük ofisler, klinikler ve şık kafeler iç mekanlarına salon bitkileri alıyor ancak vakitsizlikten bitkiler kuruyabiliyor. 15 günde bir uğrayarak bu bitkilerin bakımını üstlenip düzenli aylık sözleşmeler bağlayabilirsiniz.',
    targetCustomers: [
      'Hukuk büroları, klinikler ve mimarlık ofisleri',
      'İç mekanında çok sayıda saksı bitkisi olan kafeler',
      'Balkon ve teras bitkilerini canlandırmak isteyen site sakinleri',
    ],
    requiredTools: [
      { name: 'Profesyonel Budama Makası ve Toprak Bakım Seti', estimatedCost: 950, isMandatory: true },
      { name: 'Bitki Besinleri, Sıvı Vitaminler ve Yaprak Parlatıcılar', estimatedCost: 1200, isMandatory: true },
      { name: 'Toprak Nem ve pH Ölçer Çubuk', estimatedCost: 450, isMandatory: true },
      { name: 'Taşınabilir Basınçlı İlaçlama ve Püskürtme Pompası', estimatedCost: 650, isMandatory: true },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Temel İç Mekan Bitki Bakımı Bilgilerini Edinin', description: 'Yaygın salon bitkilerinin sulama, ışık ve bakım yöntemlerini öğrenin.' },
      { stepNumber: 2, title: 'İş Merkezlerindeki Ofisleri Ziyaret Edin', description: 'Bitkilerin kurumaması için periyodik vitamin ve budama hizmetinizi anlatın.' },
      { stepNumber: 3, title: 'Her Bitkiye Özel Sulama ve Bakım Kartı Asın', description: 'Saksılara kurumsal bakım etiketleri asarak profesyonelliğinizi gösterin.' },
      { stepNumber: 4, title: 'Aylık Düzenli Bakım Anlaşması Yapın', description: 'Ayda 2 ziyaret için sabit sözleşme imzalayın.' },
    ],
    proTips: [
      'Sararan bitkilerin yerine canlı yeni saksı bitkileri satarak ekstra kâr elde edin.',
      'Kafelerle anlaşıp bahar aylarında tüm dış mekan saksılarını yenileyin.',
    ],
    commonMistakes: [
      'Bitkileri aşırı sulayarak kök çürümesine yol açmak.',
      'Zararlı böcek veya mantar hastalığını erken fark edememek.',
    ],
  },

  {
    id: 'e-ticaret-urun-gorsel',
    slug: 'e-ticaret-urun-gorsel',
    title: 'KOBİ\'ler için Akıllı Telefon ile Ürün Fotoğrafçılığı',
    emoji: '📸',
    tagline: 'Yerel ayakkabıcı, butik, takıcı ve fırınlara e-ticaret için profesyonel ürün çekimi.',
    category: 'local_business_services',
    categoryLabel: "Esnafa & KOBİ'lere Hizmet",
    workStyle: 'after_hours',
    workStyleLabel: 'Taşınabilir & Esnek',
    capitalTier: 'micro',
    capitalRange: {
      min: 3000,
      max: 10000,
      formatted: '3.000 ₺ - 10.000 ₺',
    },
    timeToFirstIncome: '2 - 4 Gün',
    potentialMonthlyEarnings: {
      min: 22000,
      max: 55000,
      average: 35000,
      formatted: '22.000 ₺ - 55.000 ₺ / Ay',
    },
    profitMarginPercent: 92,
    revenueFrequency: 'project',
    revenueFrequencyLabel: 'Ürün / Çekim Başı',
    dailyRevenueExample: 'Haftada 2 butiğe 20\'şer parça ürün çekimi ve dekupe (parça başı 120 ₺) = ~4.800 ₺ haftalık net kazanç.',
    difficultyLevel: 'Kolay',
    trendBadge: '📸 Yaratıcı & Pratik',
    summaryDescription: 'Pazaryerlerinde ve Instagram üzerinde satış yapan küçük esnafın ürün fotoğrafları genellikle yetersiz. Taşınabilir bir mini ışık çadırı ve telefonunuzla esnafın dükkanında 1 saatte beyaz fonda katalog fotoğrafları çekebilirsiniz.',
    targetCustomers: [
      'E-ticarete yeni giren yerel mağazalar',
      'Instagram üzerinden takı, çanta ve ayakkabı satan butikler',
      'Online sipariş platformları için menü fotoğrafı isteyen lokantalar',
    ],
    requiredTools: [
      { name: 'Kamera Kalitesi İyi Bir Akıllı Telefon', estimatedCost: 0, isMandatory: true },
      { name: 'Taşınabilir LED Katlanabilir Ürün Çekim Çadırı', estimatedCost: 1800, isMandatory: true },
      { name: 'Mini Tripod ve Bluetooth Deklanşör', estimatedCost: 650, isMandatory: true },
      { name: 'Mobil Fotoğraf Düzenleme Uygulaması', estimatedCost: 800, isMandatory: true },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Kendi Eşyalarınızla Portföy Oluşturun', description: 'Işık çadırında 10 farklı ürün çekip profesyonel bir örnek katalog hazırlayın.' },
      { stepNumber: 2, title: 'Çevrenizdeki Butik ve Takıcıları Ziyaret Edin', description: 'Ürünleri beyaz fonda stüdyo kalitesinde çekerek satışları artırma teklifi sunun.' },
      { stepNumber: 3, title: 'Dükkanda 1 Saatte Ürünleri Çekin', description: 'Taşınabilir çadırı masaya kurup hızla ürünleri fotoğraflayın.' },
      { stepNumber: 4, title: 'Arka Planı Temizleyip Aynı Gün Teslim Edin', description: 'Mobil uygulamalarla dekupe edip bulut linkiyle teslim edin.' },
    ],
    proTips: [
      'Fotoğrafların yanına 10 saniyelik dönen video eklerseniz paket fiyatınızı artırabilirsiniz.',
      'Esnafa her ay yeni gelen sezon ürünleri için düzenli çekim paketi teklif edin.',
    ],
    commonMistakes: [
      'Doğru ışık açısını ayarlamayıp ürün üzerinde parlama bırakmak.',
      'Ürünün gerçek rengini fotoğrafta aşırı filtreyle bozmak.',
    ],
  },

  {
    id: 'birebir-pratik-egitmenlik',
    slug: 'birebir-pratik-egitmenlik',
    title: 'Hafta Sonu Birebir Direksiyon & Pratik Beceri Koçluğu',
    emoji: '🚗',
    tagline: 'Ehliyeti olan ama trafiğe çıkmaya korkanlara veya pratik beceri öğrenmek isteyenlere birebir koçluk.',
    category: 'side_hustle',
    categoryLabel: 'Mesai Sonrası / Hafta Sonu',
    workStyle: 'after_hours',
    workStyleLabel: 'Yüz Yüze & Sahada',
    capitalTier: 'micro',
    capitalRange: {
      min: 0,
      max: 3000,
      formatted: '0 ₺ - 3.000 ₺ (Sıfır Sermaye)',
    },
    timeToFirstIncome: '1 - 3 Gün',
    potentialMonthlyEarnings: {
      min: 24000,
      max: 60000,
      average: 38000,
      formatted: '24.000 ₺ - 60.000 ₺ / Ay',
    },
    profitMarginPercent: 95,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Saatlik / Günlük Ücret',
    dailyRevenueExample: 'Hafta sonu günde 2 seans direksiyon ve park koçluğu (2 saat seans 1.800 ₺) = ~7.200 ₺ hafta sonu net kazancı.',
    difficultyLevel: 'Kolay',
    trendBadge: '⚡ Sıfır Maliyet & Saf Kazanç',
    summaryDescription: 'Ehliyeti olup da yoğun trafikte araba kullanmaktan veya iki araç arasına paralel park etmekten korkan birçok sürücü var. Sakin, sabırlı ve güven veren bir yaklaşımla hafta sonları pratik sürüş koçluğu yaparak saatlik yüksek kazanç elde edebilirsiniz.',
    targetCustomers: [
      'Yeni ehliyet almış ama trafiğe tek başına çıkamayan sürücüler',
      'İşe arabayla gitmek isteyen ama güzergah korkusu olan çalışanlar',
      'Özellikle AVM ve sokak arası paralel park konusunda pratik yapmak isteyenler',
    ],
    requiredTools: [
      { name: 'Sabırlı, Sakin ve Güven Verici İletişim Becerisi', estimatedCost: 0, isMandatory: true },
      { name: 'Geniş Açılı Yardımcı Kör Nokta Aynası', estimatedCost: 250, isMandatory: true },
      { name: 'Antrenman Park Kukaları (4 Adet)', estimatedCost: 450, isMandatory: false },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Bölgenizdeki Güvenli Boş Park Alanlarını Belirleyin', description: 'Geniş otoparklar ve trafiğin az olduğu yolları rota olarak çıkarın.' },
      { stepNumber: 2, title: 'Sosyal Medyada Güven Veren Tanıtım Yapın', description: 'Sakin ve stressiz ortamda park ve trafik pratiği vurgulu paylaşımlar yapın.' },
      { stepNumber: 3, title: 'Önce Boş Alanda Park, Sonra Ev-İş Güzergahı Çalışın', description: 'Müşterinin her gün gideceği gerçek ev-iş rotasında pratik yaptırın.' },
      { stepNumber: 4, title: 'Memnun Kalan Müşterilerden Referans Alın', description: 'Trafik korkusunu yenen sürücülerin teşekkür mesajlarını paylaşarak yeni müşteriler çekin.' },
    ],
    proTips: [
      'Kadın sürücülere yönelik anlayışlı yaklaşım bu alanda en çok tavsiye edilen özelliktir.',
      'Paket ders satarak peşin nakit girişi sağlayabilirsiniz.',
    ],
    commonMistakes: [
      'Müşteriye sert davranıp panikletmek (müşteri sabır ve güven için ödeme yapıyor).',
      'Kaskosuz veya bakımsız araçla tehlikeli trafiğe erken girmek.',
    ],
  },

  {
    id: 'akilli-kilit-ev-guvenlik',
    slug: 'akilli-kilit-ev-guvenlik',
    title: 'Ev & Ofislere Akıllı Kilit, Kamera ve Alarm Kurulumu',
    emoji: '🔐',
    tagline: 'Parmak izli akıllı kapı kilitleri, akıllı ziller ve kablosuz WiFi güvenlik kameraları montajı.',
    category: 'field_mobile',
    categoryLabel: 'Sahada & Günlük Nakit',
    workStyle: 'after_hours',
    workStyleLabel: 'Sahada & Teknik',
    capitalTier: 'low',
    capitalRange: {
      min: 12000,
      max: 30000,
      formatted: '12.000 ₺ - 30.000 ₺',
    },
    timeToFirstIncome: '2 - 4 Gün',
    potentialMonthlyEarnings: {
      min: 28000,
      max: 75000,
      average: 46000,
      formatted: '28.000 ₺ - 75.000 ₺ / Ay',
    },
    profitMarginPercent: 72,
    revenueFrequency: 'daily',
    revenueFrequencyLabel: 'Montaj & Cihaz Satış Kârı',
    dailyRevenueExample: 'Günde 1 akıllı kilit + 2 WiFi kamera montajı = ~3.800 ₺ ciro, ~2.600 ₺ net günlük kazanç.',
    difficultyLevel: 'Orta',
    trendBadge: '🚀 Yükselen Trend',
    summaryDescription: 'Geleneksel anahtarlar yerini parmak izli, şifreli ve telefondan açılan akıllı kilitlere bırakıyor. Hem cihaz satıp hem 45 dakikada montajını yaparak yüksek kâr marjı yakalayabilirsiniz.',
    targetCustomers: [
      'Airbnb ve kiralık ev sahipleri (anahtar vermekten kurtulmak isteyenler)',
      'Çocuğu okuldan gelen veya anahtar unutan çalışan aileler',
      'Personel giriş-çıkışını takip etmek isteyen küçük işletmeler',
    ],
    requiredTools: [
      { name: 'Şarjlı Vidalama / Matkap ve Ahşap Panç Uçları', estimatedCost: 4500, isMandatory: true },
      { name: 'Tornavida, Kumpas ve Temel Montaj Alet Seti', estimatedCost: 1800, isMandatory: true },
      { name: 'Numune 1 Adet Parmak İzli Akıllı Kilit', estimatedCost: 4200, isMandatory: true },
      { name: 'Kablosuz 2K Gece Görüşlü WiFi Güvenlik Kamerası', estimatedCost: 2800, isMandatory: false },
    ],
    executionSteps: [
      { stepNumber: 1, title: 'Kendi Kapınızda Akıllı Kilit Montajını Deneyin', description: 'Eski bareli söküp akıllı kilidi ve mobil uygulamasını kurmayı öğrenin.' },
      { stepNumber: 2, title: 'Anahtarsız Yaşam ve Akıllı Kilit Tanıtımı Yapın', description: 'Parmak iziyle hızlı açılan kapı videolarını paylaşın.' },
      { stepNumber: 3, title: 'Adrese Gidip Kilit ve Kamera Montajını Yapın', description: 'Temiz bir montajla takıp müşterinin telefonuna uygulamayı kurun.' },
      { stepNumber: 4, title: 'Apartmandaki Komşulara Tanıtım Kartı Bırakın', description: 'Binadaki diğer komşular kapıdaki şık kilidi görünce talepte bulunacaktır.' },
    ],
    proTips: [
      'Airbnb ev sahiplerine süreli şifre oluşturma özelliğini gösterin; birden fazla evi için sipariş verirler.',
      'Cihazın yanına akıllı görüntülü kapı zili ekleyerek çapraz satış yapın.',
    ],
    commonMistakes: [
      'Kapının kilit barel ölçüsünü almadan yanlış ebatta kilit sipariş etmek.',
      'Müşteriye mekanik acil durum anahtarını dışarıda (arabada vb.) saklaması gerektiğini belirtmemek.',
    ],
  },
];

export function getBusinessIdeaById(id: string): BusinessIdea | undefined {
  return TRENDING_BUSINESS_IDEAS.find((i) => i.id === id || i.slug === id);
}

export function filterBusinessIdeas(options: {
  category?: string;
  capitalTier?: string;
  workStyle?: string;
  searchQuery?: string;
  sortBy?: 'popular' | 'lowest_capital' | 'highest_earning' | 'fastest_income';
}): BusinessIdea[] {
  let list = [...TRENDING_BUSINESS_IDEAS];

  if (options.category && options.category !== 'all') {
    list = list.filter((item) => item.category === options.category);
  }

  if (options.capitalTier && options.capitalTier !== 'all') {
    list = list.filter((item) => item.capitalTier === options.capitalTier);
  }

  if (options.workStyle && options.workStyle !== 'all') {
    list = list.filter((item) => item.workStyle === options.workStyle);
  }

  if (options.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.targetCustomers.some((c) => c.toLowerCase().includes(q)) ||
        item.categoryLabel.toLowerCase().includes(q)
    );
  }

  // Sıralama
  if (options.sortBy === 'lowest_capital') {
    list.sort((a, b) => a.capitalRange.min - b.capitalRange.min);
  } else if (options.sortBy === 'highest_earning') {
    list.sort((a, b) => b.potentialMonthlyEarnings.average - a.potentialMonthlyEarnings.average);
  } else if (options.sortBy === 'fastest_income') {
    const weight = (t: string) => (t.includes('Gün') ? 1 : t.includes('1 Hafta') ? 2 : 3);
    list.sort((a, b) => weight(a.timeToFirstIncome) - weight(b.timeToFirstIncome));
  }

  return list;
}
