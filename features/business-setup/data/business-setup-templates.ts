import type { BusinessTemplate } from '../types/business-setup.types';

export const BUSINESS_SETUP_TEMPLATES: BusinessTemplate[] = [
  // =========================================================================
  // 1. FİNANS & HİZMET SEKTÖRÜ
  // =========================================================================
  {
    id: 'sigorta_acentesi',
    name: 'Sigorta Acentesi',
    emoji: '🛡️',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 45,
    fitoutCostPerM2: 2400,
    monthlyUtilitiesEstimate: 3500,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 3200,
    capitalRequirement: {
      minLegalCapital: 600000,
      legalBasis: 'Sigorta Acenteleri Yönetmeliği (SEDDK) Md. 4',
      description: 'Tüzel kişi sigorta acentelerinde asgari 600.000 ₺ (Gerçek kişi acentelerde 300.000 ₺) ödenmiş sermaye / malvarlığı yasal şarttır.',
    },
    mandatoryLegalItems: [
      { name: 'SEGEM Ruhsat & TOBB Levha Kayıt Bedeli', cost: 18500, description: 'TOBB ve Hazine onaylı Sigorta Acenteleri Levhası resmi tescil harcı' },
      { name: 'Belediye İşyeri Açma & Çalışma Ruhsatı', cost: 6500, description: 'İlçe belediyesi 3. sınıf gayrisıhhi/ticari müessese harcı' },
      { name: 'Ticaret Odası Kayıt & Şirket Kuruluşu', cost: 9500, description: 'Ticaret Sicil Gazetesi ilanı, ana sözleşme ve noter onayları' },
      { name: 'Yangın ve Güvenlik Uygunluk Raporu', cost: 3200, description: 'İtfaiye yangın tüpü ve tahliye planı onay belgesi' },
    ],
    equipments: [
      { id: 'sig-1', name: 'Yangın Söndürme Tüpü & İlk Yardım Seti (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Binaların Yangından Korunması Hakkında Yönetmelik Md. 99 gereği 100m² altı için 1 adet 6kg ABC tüp zorunludur.' },
      { id: 'sig-2', name: 'Kilitli Çelik Arşiv ve Kıymetli Evrak Kasası', category: 'mandatory', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'SEDDK mevzuatı gereği poliçe ve teminat evrakları kilitli kasada saklanmalıdır.' },
      { id: 'sig-3', name: 'Acente Operasyon İş İstasyonu (PC + Çift Monitör + UPS Kesintisiz Güç Kaynağı)', category: 'core_tech', unitCost: 28500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', description: 'Sigorta ekranları ve poliçe kesimi için optimize edilmiş çift ekranlı terminal.' },
      { id: 'sig-4', name: 'Yüksek Hızlı Çok Fonksiyonlu Belge Tarayıcı & Lazer Yazıcı', category: 'core_tech', unitCost: 16800, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet', description: 'Ruhsat ve kimlik taramaları için otomatik beslemeli tarayıcı.' },
      { id: 'sig-5', name: 'Yönetici & Acente Müdürü Masa Takımı (Deri Koltuklu)', category: 'furniture', unitCost: 22500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'sig-6', name: 'Müşteri Karşılama ve Poliçe İnceleme Koltuk Grubu', category: 'furniture', unitCost: 15400, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'sig-7', name: 'İnverter Split Klima (18.000 BTU A+++)', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'sig-8', name: 'Güvenlik Kamerası & Alarm Sistemi (4 Kameralı)', category: 'core_tech', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Teknik Müdür (SEGEM Belgeli Sorumlu Müdür)', count: 1, avgSalary: 38000, isMandatory: true, allowOwnerFulfillment: true, description: 'İşletme sahibi SEGEM belgesine sahipse ve bizzat müdürlük yapacaksa 0 seçebilirsiniz.' },
      { role: 'Teknik Personel & Satış Uzmanı', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: false, description: 'Poliçe teklif ve tahsilat işlemleri için yardımcı personel.' },
    ],
    breakEvenMetric: {
      label: 'Düzenlenen Kasko / Trafik / Tamamlayıcı Sağlık Poliçesi',
      unitPrice: 1250, // Ortalama net komisyon geliri
      targetUnitsPerDay: 3.5,
      unitLabel: 'Poliçe / Gün',
    },
  },
  {
    id: 'emlak_ofisi',
    name: 'Emlak & Gayrimenkul Ofisi',
    emoji: '🏢',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 50,
    fitoutCostPerM2: 2800,
    monthlyUtilitiesEstimate: 3800,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 4500,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: 'Taşınmaz Ticareti Hakkında Yönetmelik Md. 6',
      description: 'Sermaye şartı aranmaz; ancak işletme sahibinin Seviye 5 Sorumlu Emlak Danışmanı Mesleki Yeterlilik Belgesi ve en az lise mezuniyeti şarttır.',
    },
    mandatoryLegalItems: [
      { name: 'Taşınmaz Ticareti Yetki Belgesi Harcı', cost: 12000, description: 'Ticaret Bakanlığı onaylı yetki belgesi ve mesleki yeterlilik kaydı' },
      { name: 'İşyeri Açma ve Çalışma Ruhsatı', cost: 6500, description: 'Belediye ticari işyeri ruhsatı' },
      { name: 'Emlakçılar Odası & Ticaret Odası Kaydı', cost: 8500, description: 'Oda tescil ve sicil tasdiknamesi' },
      { name: 'Vergi Dairesi Mükellefiyet & e-İmza Kurulumu', cost: 2500, description: 'Resmi sözleşmeler için dijital altyapı' },
    ],
    equipments: [
      { id: 'eml-1', name: 'Işıklı LED Vitrin İlan Askı Panoları (A4/A3 Modüler Panolar)', category: 'mandatory', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Taşınmaz Ticareti Yönetmeliği fiziki vitrin ilan standartları.' },
      { id: 'eml-2', name: 'Yangın Söndürme Tüpü (6kg ABC Kuru Kimyevi Toz)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Yangın Yönetmeliği Md. 99 gereği zorunlu.' },
      { id: 'eml-3', name: 'Danışman Bilgisayar İstasyonu (Laptop + 27 inç Monitör)', category: 'core_tech', unitCost: 24000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'eml-4', name: 'Renkli A3/A4 Çıktı ve Sözleşme Yazıcısı', category: 'core_tech', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'eml-5', name: 'Müşteri Görüşme ve Pazarlık Masası (6 Kişilik)', category: 'furniture', unitCost: 19500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'eml-6', name: 'Geniş Açı Gayrimenkul Çekim Seti & Gimbal Sabitleyici', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'eml-7', name: 'Ofis Tipi Otomatik Kahve & Çay Makinesi', category: 'appliances', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Sorumlu Emlak Danışmanı (Seviye 5 Belgeli)', count: 1, avgSalary: 35000, isMandatory: true, allowOwnerFulfillment: true, description: 'İşletme sahibi Seviye 5 yetki belgesine sahipse 0 seçebilirsiniz.' },
      { role: 'Saha Gayrimenkul Danışmanı (Seviye 4)', count: 1, avgSalary: 26000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Tamamlanan Kiralama / Satış Hizmet Sözleşmesi',
      unitPrice: 18000,
      targetUnitsPerDay: 0.15,
      unitLabel: 'İşlem / Ay',
    },
  },
  {
    id: 'muhasebe_ofisi',
    name: 'Mali Müşavirlik / Muhasebe Ofisi',
    emoji: '📊',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 55,
    fitoutCostPerM2: 2200,
    monthlyUtilitiesEstimate: 3600,
    monthlyAccountingFee: 0,
    monthlySoftwareFee: 5500,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: '3568 Sayılı SMMM Kanunu Md. 4',
      description: 'Sermaye şartı yoktur. Ruhsatlı Serbest Muhasebeci Mali Müşavir (SMMM) kaşesi ve büro tescil belgesi zorunludur.',
    },
    mandatoryLegalItems: [
      { name: 'TÜRMOB / SMMM Odası Büro Tescil Belgesi', cost: 16500, description: 'Bağımsız mesleki faaliyet tescili ve ruhsat onayı' },
      { name: 'Belediye İzin & Meslek Levhası Harcı', cost: 5500, description: 'Ruhsat ve tabela onayları' },
      { name: 'Kayıtlı Elektronik Posta (KEP) & e-Mühür Kurulumu', cost: 3500, description: 'GİB entegrasyonu için yasal sertifikalar' },
    ],
    equipments: [
      { id: 'muh-1', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'muh-2', name: 'Kilitli Klasörlük & Metal Dosya Arşiv Dolapları', category: 'mandatory', unitCost: 18000, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'VUK gereği mükellef defter ve belgelerinin güvenli kilitli arşivde saklanması zorunludur.' },
      { id: 'muh-3', name: 'Mali Müşavir & Uzman PC İş İstasyonu (Hızlı NVMe SSD + Çift Monitör)', category: 'core_tech', unitCost: 27000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'muh-4', name: 'Yüksek Kapasiteli Çift Taraflı Otomatik Belge Tarayıcı & Lazer Yazıcı', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'muh-5', name: 'Evrak İmha Makinesi (P-4 Gizlilik Standardı)', category: 'core_tech', unitCost: 6500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'muh-6', name: 'SMMM Makam Masa & Misafir Koltuk Takımı', category: 'furniture', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
    ],
    recommendedStaff: [
      { role: 'SMMM Ruhsatlı Mali Müşavir', count: 1, avgSalary: 45000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi mali müşavir ise 0 seçebilir.' },
      { role: 'Kıdemli Muhasebe Uzmanı / Stajyer', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Aylık Düzenli Defter Tutulan Şirket / Mükellef Sayısı',
      unitPrice: 2800,
      targetUnitsPerDay: 1.2,
      unitLabel: 'Mükellef Dosyası',
    },
  },
  {
    id: 'hukuk_burosu',
    name: 'Hukuk & Danışmanlık Bürosu',
    emoji: '⚖️',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 65,
    fitoutCostPerM2: 3200,
    monthlyUtilitiesEstimate: 4200,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 3800,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: '1136 Sayılı Avukatlık Kanunu Md. 43',
      description: 'Sermaye şartı yoktur. Baro levhasına kayıtlı avukatlık ruhsatnamesi zorunludur.',
    },
    mandatoryLegalItems: [
      { name: 'Baro Levha Kayıt & Büro Açılış Bildirimi', cost: 14000, description: 'İl Baro Başkanlığı yetki ve levha kayıt harcı' },
      { name: 'UYAP Kurumsal Donanım & Güvenlik Altyapısı', cost: 4500, description: 'Avukat portalı, e-imza ve mobil imza tescilleri' },
      { name: 'Resmi Tabela & İşyeri Bildirimi', cost: 3500, description: 'Avukatlık Kanunu tabela standartları onayı' },
    ],
    equipments: [
      { id: 'huk-1', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'huk-2', name: 'Müvekkil Dosya & İçtihat Kütüphane Kitaplığı', category: 'mandatory', unitCost: 21000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Takım' },
      { id: 'huk-3', name: 'UYAP Uyumlu Avukat Bilgisayarı & Güvenli Sunucu', category: 'core_tech', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'huk-4', name: 'Hızlı Tarayıcı & Çok Sayfalı Dilekçe Yazıcısı', category: 'core_tech', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'huk-5', name: 'Müvekkil Toplantı ve Arabuluculuk Masası (8 Kişilik)', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'huk-6', name: 'Avukat Makam Koltuk & Klasik Ahşap Masa Takımı', category: 'furniture', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
    ],
    recommendedStaff: [
      { role: 'Ruhsatlı Avukat (Kurucu Ortak)', count: 1, avgSalary: 50000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi avukat ise 0 seçebilir.' },
      { role: 'Yasal Stajyer Avukat / Katip', count: 1, avgSalary: 26000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Aylık Dava Dosyası & Kurumsal Hukuki Danışmanlık',
      unitPrice: 15000,
      targetUnitsPerDay: 0.25,
      unitLabel: 'Dosya / Ay',
    },
  },
  {
    id: 'yazilim_ajansi',
    name: 'Yazılım & Dijital Ajans',
    emoji: '💻',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 70,
    fitoutCostPerM2: 3000,
    monthlyUtilitiesEstimate: 5500,
    monthlyAccountingFee: 3000,
    monthlySoftwareFee: 8500,
    capitalRequirement: {
      minLegalCapital: 50000,
      legalBasis: '6102 Sayılı Türk Ticaret Kanunu (TTK) Md. 580',
      description: 'Limited şirket için asgari 50.000 ₺, Anonim şirket için asgari 250.000 ₺ sermaye tescili aranır.',
    },
    mandatoryLegalItems: [
      { name: 'Ticaret Odası Tescili & Şirket Kuruluşu', cost: 11000, description: 'Ltd. Şti. sermaye tescili ve gazete ilanı' },
      { name: 'Belediye İşyeri Çalışma Ruhsatı', cost: 6500, description: 'Ofis çalışma ruhsatı' },
      { name: 'BTK & KVKK Uyumluluk Kaydı', cost: 4500, description: 'Veri sorumlusu sicil ve yasal uyumluluk' },
    ],
    equipments: [
      { id: 'yaz-1', name: 'Yangın Söndürme Tüpü (6kg CO2 / KKT)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Elektrik ve elektronik cihazlar için CO2 yangın tüpü.' },
      { id: 'yaz-2', name: 'Geliştirici İş İstasyonu (i7/M3 Pro + Çift 4K Monitör + Ergonomik Koltuk)', category: 'core_tech', unitCost: 55000, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'yaz-3', name: 'GigaBit Yönetilebilir Switch & Firewall Ağ Cihazı', category: 'core_tech', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'yaz-4', name: 'Toplantı & Sunum Ekranı (65 inç 4K Akıllı TV + Kamera)', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'yaz-5', name: 'Modüler Açık Ofis Çalışma Masaları Grubu', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'yaz-6', name: 'Tam Otomatik Çekirdekten Kahve Makinesi', category: 'appliances', unitCost: 18500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Kıdemli Yazılım Geliştirici / Tech Lead', count: 1, avgSalary: 65000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu yazılımcı ise 0 seçebilir.' },
      { role: 'UI/UX Tasarımcı & Frontend Geliştirici', count: 1, avgSalary: 45000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Tamamlanan Web / Mobil / SaaS Yazılım Projesi',
      unitPrice: 45000,
      targetUnitsPerDay: 0.1,
      unitLabel: 'Proje / Ay',
    },
  },

  // =========================================================================
  // 2. YEME - İÇME SEKTÖRÜ
  // =========================================================================
  {
    id: 'kafe_kahveci',
    name: 'Kafe & 3. Nesil Kahveci',
    emoji: '☕',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 85,
    fitoutCostPerM2: 4500,
    monthlyUtilitiesEstimate: 12500,
    monthlyAccountingFee: 3000,
    monthlySoftwareFee: 2400,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: 'İşyeri Açma ve Çalışma Ruhsatlarına İlişkin Yönetmelik (Sıhhi Müessese)',
      description: 'Sermaye şartı yoktur; belediye sıhhi müessese gıda işletmesi hijyen ve itfaiye onayları aranır.',
    },
    mandatoryLegalItems: [
      { name: 'Sıhhi Müessese İşyeri Açma Ruhsatı', cost: 14500, description: 'İlçe belediyesi gıda işletmesi denetim ve ruhsat harcı' },
      { name: 'İl Tarım ve Orman Müdürlüğü İşletme Kayıt Belgesi', cost: 4200, description: 'Gıda güvenliği yasal zorunlu kayıt' },
      { name: 'İtfaiye Yangın ve Baca Uygunluk Raporu', cost: 6500, description: 'Mekan baca, davlumbaz ve yangın güvenliği teftişi' },
      { name: 'Müzik Yayın İzni & Telif Lisansı (MÜYAP/MSG)', cost: 5500, description: 'Ticari mekan kamuya açık müzik yayını izni' },
    ],
    equipments: [
      { id: 'kaf-1', name: 'Yangın Söndürme Donanımı (1x 6kg ABC Kuru Kimyevi Toz + 1x 5kg CO2 Gazlı)', category: 'safety', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Yangın Yönetmeliği Md. 99 gereği mutfak ve elektrik panoları için 2 adet farklı tip tüp zorunludur.' },
      { id: 'kaf-2', name: 'Endüstriyel 2 Gruplu Espresso Makinesi (La Marzocco / Sanremo / Nuova)', category: 'machinery', unitCost: 145000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', description: 'Ana kahve üretim ünitesi.' },
      { id: 'kaf-3', name: 'On-Demand Otomatik Kahve Değirmeni (Mahlkönig / Mazzer)', category: 'machinery', unitCost: 32000, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kaf-4', name: 'Sanayi Tipi Su Arıtma & Yumuşatma Sistemi', category: 'appliances', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Espresso makinelerinin kireçten korunması ve su kalitesi için zorunlu altyapı.' },
      { id: 'kaf-5', name: 'Tezgah Altı Çift Kapılı Paslanmaz Buzdolabı', category: 'appliances', unitCost: 34000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'kaf-6', name: 'Endüstriyel Günlük 40kg Buz Yapma Makinesi', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'kaf-7', name: 'Dokunmatik POS Terminali + Adisyon / e-Adisyon Yazıcısı', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kaf-8', name: 'Masa & Sandalye / Berjer Oturma Grubu (İç & Dış 15 Masa)', category: 'furniture', unitCost: 68000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'kaf-9', name: 'Soğutmalı Cam Pasta & Tatlı Teşhir Vitrini', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Baş Barista (Head Barista)', count: 1, avgSalary: 34000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi barista ise 0 seçebilir.' },
      { role: 'Yardımcı Barista / Servis Elemanı', count: 2, avgSalary: 25000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Ortalama Kahve & İçecek / Tatlı Satışı',
      unitPrice: 110,
      targetUnitsPerDay: 90,
      unitLabel: 'Sipariş / Gün',
    },
  },
  {
    id: 'restoran_lokanta',
    name: 'Restoran & Lokanta',
    emoji: '🍽️',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 130,
    fitoutCostPerM2: 5500,
    monthlyUtilitiesEstimate: 22000,
    monthlyAccountingFee: 3500,
    monthlySoftwareFee: 3000,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: '1. Sınıf Gayrisıhhi / Sıhhi Müessese Yönetmeliği & İtfaiye Baca Standartları',
      description: 'Sermaye şartı yoktur; ancak mutfak baca sistemi, yangın yağ tutucu ve çevre uyumluluğu zorunludur.',
    },
    mandatoryLegalItems: [
      { name: '1. Sınıf Sıhhi Müessese / Lokanta Ruhsat Harcı', cost: 18000, description: 'Belediye mutfak ve salon denetimi' },
      { name: 'İl Tarım Gıda Üretim ve Satış İzni', cost: 5500, description: 'HACCP standartları gıda sicili' },
      { name: 'Ağır Hizmet Baca & Karbon Filtre İtfaiye Uygunluk Belgesi', cost: 12500, description: 'Çevre ve yangın yönetmeliği baca uygunluğu' },
      { name: 'Gres Yağ Tutucu / Atık Yağ Sözleşmesi', cost: 4500, description: 'Belediye çevre müdürlüğü atık yağ bertaraf onayı' },
    ],
    equipments: [
      { id: 'res-1', name: 'Davlumbaz İçi Otomatik Yangın Söndürme Sistemi (K Sınıfı Yağ Yangını)', category: 'safety', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'İtfaiye Yönetmeliği Md. 57 gereği endüstriyel mutfaklarda davlumbaz içi otomatik söndürme zorunludur.' },
      { id: 'res-2', name: 'Paslanmaz Endüstriyel Davlumbaz ve Salyangoz Emiş Motoru', category: 'machinery', unitCost: 45000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Belediye çevre yönetmeliği koku ve duman tahliyesi.' },
      { id: 'res-3', name: '4 Gözlü Sanayi Tipi Ocak & Kuzine Fırın (Doğalgazlı / CE Belgeli)', category: 'machinery', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'res-4', name: 'Giyotin Tip Endüstriyel Bulaşık Yıkama Makinesi', category: 'appliances', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'res-5', name: 'Dik Tip Çift Kapılı Paslanmaz Derin Dondurucu & Soğutucu Dolap', category: 'appliances', unitCost: 55000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'res-6', name: 'Paslanmaz Çelik Çalışma Tezgahları & Evyeler (304 Kalite)', category: 'furniture', unitCost: 32000, defaultQty: 3, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'res-7', name: 'Restoran Salon Masa & Sandalye Grubu (20 Masa / 80 Sandalye)', category: 'furniture', unitCost: 110000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'res-8', name: 'El Terminali Destekli Restoran POS & Mutfak Yazıcı Sistemi', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Aşçıbaşı / Usta Şef (Ustalık Belgeli)', count: 1, avgSalary: 45000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu şef ise 0 seçebilir.' },
      { role: 'Aşçı Yardımcısı & Bulaşıkhane', count: 2, avgSalary: 26000, isMandatory: false, allowOwnerFulfillment: false },
      { role: 'Kaptan Garson / Servis Elemanı', count: 2, avgSalary: 27000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Ortalama Yemek Masası & Paket Servis Siparişi',
      unitPrice: 280,
      targetUnitsPerDay: 50,
      unitLabel: 'Kişi / Gün',
    },
  },

  // =========================================================================
  // 3. SAĞLIK & KİŞİSEL BAKIM SEKTÖRÜ
  // =========================================================================
  {
    id: 'eczane',
    name: 'Eczane & Medikal',
    emoji: '💊',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 60,
    fitoutCostPerM2: 4500,
    monthlyUtilitiesEstimate: 6000,
    monthlyAccountingFee: 3000,
    monthlySoftwareFee: 3500,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: '6197 Sayılı Eczacılar ve Eczaneler Hakkında Kanun Md. 2',
      description: 'Eczane açmak için Eczacılık Fakültesi diploması ve TEB oda kaydı şarttır. Eczaneler sadece gerçek kişi eczacı adına açılabilir.',
    },
    mandatoryLegalItems: [
      { name: 'İl Sağlık Müdürlüğü Eczane Açılış Ruhsatı', cost: 24000, description: 'Sağlık Bakanlığı kura ve mevzuat onayı' },
      { name: 'Eczacı Odası Kayıt ve Tescil Harcı', cost: 12000, description: 'TEB oda sicil tescili' },
      { name: 'Medula & İTS (İlaç Takip Sistemi) Sözleşme Harcı', cost: 6500, description: 'Bakanlık İTS karekod entegrasyonu' },
    ],
    equipments: [
      { id: 'ecz-1', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'ecz-2', name: 'TEB Standartlarında Kilitli İlaç Çekmece Dolapları (Raylı Sistem)', category: 'mandatory', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Eczacılık Yönetmeliği ilaç saklama standartları.' },
      { id: 'ecz-3', name: 'Isı ve Nem Takip Cihazlı Medikal Aşı Buzdolabı (+2°C / +8°C)', category: 'appliances', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Bakanlık soğuk zincir aşı ve ilaç saklama zorunluluğu.' },
      { id: 'ecz-4', name: 'Majistral İlaç Hazırlama Laboratuvar Tezgahı & Hassas Terazi', category: 'machinery', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Majistral ilaç hazırlama alanı yasal zorunludur.' },
      { id: 'ecz-5', name: 'Kırmızı/Yeşil Reçeteli İlaçlar İçin Kilitli Çelik Kasa', category: 'mandatory', unitCost: 12500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Uyuşturucu ve psikotrop ilaçlar kilitli kasada tutulmalıdır.' },
      { id: 'ecz-6', name: 'Eczane Satış Bankosu ve 2D Karekod Okuyuculu Bilgisayarlar', category: 'core_tech', unitCost: 32000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ecz-7', name: 'Eczane Dış E-Logo Tabelası (Bakanlık Standartlarında LED)', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Standart E logosu tabelası zorunludur.' },
    ],
    recommendedStaff: [
      { role: 'Sahip & Mesul Müdür Eczacı', count: 1, avgSalary: 55000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi eczacı ise 0 seçebilir.' },
      { role: 'Eczane Teknisyeni / Kalfası', count: 1, avgSalary: 30000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Reçete ve OTC / Dermokozmetik Satış Cirosu',
      unitPrice: 220,
      targetUnitsPerDay: 40,
      unitLabel: 'Fiş / Gün',
    },
  },
  {
    id: 'dis_klinigi',
    name: 'Diş Kliniği & Muayenehane',
    emoji: '🦷',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 90,
    fitoutCostPerM2: 5800,
    monthlyUtilitiesEstimate: 8500,
    monthlyAccountingFee: 3500,
    monthlySoftwareFee: 4000,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: 'Ağız ve Diş Sağlığı Hizmeti Sunulan Özel Sağlık Kuruluşları Hakkında Yönetmelik',
      description: 'Diş hekimliği diploması ve İl Sağlık Müdürlüğü uygunluk belgesi şarttır.',
    },
    mandatoryLegalItems: [
      { name: 'İl Sağlık Müdürlüğü Ağız ve Diş Sağlığı Ruhsatı', cost: 28000, description: 'Sağlık Bakanlığı poliklinik/muayenehane ruhsatı' },
      { name: 'Diş Hekimleri Odası Tescili', cost: 11000, description: 'Oda kayıt ve hekimlik belgesi' },
      { name: 'TAEK / NDK Röntgen Cihazı Lisanslama Harcı', cost: 9500, description: 'Radyasyon güvenliği ve kurşun zırhlama onayı' },
      { name: 'Tıbbi Atık Bertaraf Sözleşmesi', cost: 4500, description: 'Belediye çevre ve tıbbi atık belgesi' },
    ],
    equipments: [
      { id: 'dis-1', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'dis-2', name: 'Tam Donanımlı Dental Ünit & LED Reflektör & Hekim Taburesi', category: 'machinery', unitCost: 220000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Yönetmelik Ek-1 klinik asgari tıbbi donanım standardı.' },
      { id: 'dis-3', name: 'Dental Otoklav Sterilizasyon Cihazı (B Sınıfı 18L)', category: 'machinery', unitCost: 55000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Tıbbi aletlerin sterilizasyonu için B sınıfı otoklav zorunludur.' },
      { id: 'dis-4', name: 'Yağsız Sessiz Dental Kompresör & Cerrahi Aspiratör Sistemi', category: 'machinery', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'dis-5', name: 'Dijital Periapikal Röntgen Cihazı ve RVG Sensör', category: 'core_tech', unitCost: 110000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'dis-6', name: 'Hasta Karşılama, Bekleme Koltukları ve Danışma Bankosu', category: 'furniture', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
    ],
    recommendedStaff: [
      { role: 'Diş Hekimi (Mesul Müdür)', count: 1, avgSalary: 60000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi diş hekimi ise 0 seçebilir.' },
      { role: 'Ağız ve Diş Sağlığı Teknikeri / Asistanı', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Hasta Tedavisi (Dolgu, Kanal, İmplant, Temizlik)',
      unitPrice: 2200,
      targetUnitsPerDay: 2.2,
      unitLabel: 'Hasta / Gün',
    },
  },
  {
    id: 'optik_gozluk',
    name: 'Optik & Gözlük Mağazası',
    emoji: '👓',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 55,
    fitoutCostPerM2: 4200,
    monthlyUtilitiesEstimate: 4500,
    monthlyAccountingFee: 2800,
    monthlySoftwareFee: 3200,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: '5193 Sayılı Optisyenlik Hakkında Kanun Md. 3',
      description: 'Mesul müdürün Optisyenlik programı mezunu diploması ve İl Sağlık Müdürlüğü ruhsatnamesi zorunludur.',
    },
    mandatoryLegalItems: [
      { name: 'İl Sağlık Müdürlüğü Optisyenlik Müessesesi Ruhsatı', cost: 18500, description: 'Sağlık Bakanlığı optisyenlik açılış ve denetim harcı' },
      { name: 'Optisyenler ve Gözlükçüler Odası Kaydı', cost: 8500, description: 'Oda tescil ve oda levhası' },
      { name: 'Medula & SGK Sözleşme ve Entegrasyon Harcı', cost: 4500, description: 'SGK reçeteli cam/çerçeve sistemi' },
    ],
    equipments: [
      { id: 'opt-1', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'opt-2', name: 'Otomatik Dijital Fokometre / Lensmetre (UV & Mavi Işık Ölçerli)', category: 'machinery', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: '5193 Sayılı Kanun gereği reçeteli cam ölçümü için zorunlu cihaz.' },
      { id: 'opt-3', name: 'Dijital Pupillometre (Gözbebeği Mesafe Ölçüm Cihazı)', category: 'machinery', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Odaklama mesafesi tespiti için yasal zorunlu.' },
      { id: 'opt-4', name: 'Ultrasonik Gözlük Temizleme ve Cam Kesim Montaj Tezgahı', category: 'machinery', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'opt-5', name: 'LED Aydınlatmalı Kilitli Çerçeve Teşhir Vitrinleri', category: 'furniture', unitCost: 42000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'opt-6', name: 'Medula Uyumlu Optik Kasa & Barkod Sistemi', category: 'core_tech', unitCost: 21000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Mesul Müdür (Ruhsatlı Optisyen)', count: 1, avgSalary: 42000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi optisyen ise 0 seçebilir.' },
      { role: 'Optik Satış Danışmanı', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Satılan Numaralı Gözlük / Güneş Gözlüğü & Lens',
      unitPrice: 1800,
      targetUnitsPerDay: 2.0,
      unitLabel: 'Gözlük / Gün',
    },
  },
  {
    id: 'oto_ekspertiz',
    name: 'Oto Ekspertiz İstasyonu',
    emoji: '🔍',
    categoryGroup: 'Otomotiv & Sanayi Hizmetleri',
    defaultM2: 150,
    fitoutCostPerM2: 4500,
    monthlyUtilitiesEstimate: 12000,
    monthlyAccountingFee: 3000,
    monthlySoftwareFee: 5000,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: 'TSE 13805 Karayolu Taşıtları Ekspertiz İstasyonları Hizmet Standardı',
      description: 'TSE HYB belgesi ve kalibrasyonlu test cihazları zorunludur.',
    },
    mandatoryLegalItems: [
      { name: 'TSE HYB (Hizmet Yeterlilik Belgesi) Harcı', cost: 32000, description: 'TSE 13805 standartlarında kurumsal ekspertiz tescili' },
      { name: 'Belediye Gayrisıhhi Müessese Ekspertiz Ruhsatı', cost: 18000, description: 'Teknik denetim istasyonu ruhsatı' },
      { name: 'İtfaiye ve Sanayi Elektrik Onayı', cost: 6500, description: 'Güvenlik ve kaldırma lifti onayı' },
    ],
    equipments: [
      { id: 'otoe-1', name: 'Yangın Söndürme İstasyonu (2x 6kg ABC + 1x 5kg CO2)', category: 'safety', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Sanayi tipi mekan ve araç altı denetim için 2 adet yangın tüpü zorunludur.' },
      { id: 'otoe-2', name: 'TSE Onaylı 4x4 Fren Test & Süspansiyon & Yanal Kayma Test Hattı', category: 'machinery', unitCost: 340000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'TSE 13805 zorunlu test hattı.' },
      { id: 'otoe-3', name: 'Elektro-Hidrolik 4 Ton Araç Altı Kontrol Lifti', category: 'machinery', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Şasi ve alt takım muayenesi için zorunlu.' },
      { id: 'otoe-4', name: 'Evrensel OBD Beyin & Arıza Tespit Diyagnostik Cihazı', category: 'core_tech', unitCost: 45000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'otoe-5', name: 'Dijital Manyetik Boya Kalınlık Ölçüm Cihazı (2 Adet)', category: 'core_tech', unitCost: 14000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'otoe-6', name: 'Otomatik Raporlama Kiosku & Lazer Yazıcı', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'TSE Belgeli Baş Ekspertiz Teknisyeni', count: 1, avgSalary: 42000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu teknisyen ise 0 seçebilir.' },
      { role: 'Mekanik / Kaporta Kontrol Ustası', count: 1, avgSalary: 32000, isMandatory: false, allowOwnerFulfillment: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Full Paket / Standart Ekspertiz Raporu',
      unitPrice: 2400,
      targetUnitsPerDay: 3.0,
      unitLabel: 'Araç / Gün',
    },
  },
];

export function getBusinessTemplateById(id: string): BusinessTemplate {
  const found = BUSINESS_SETUP_TEMPLATES.find((t) => t.id === id);
  return found || BUSINESS_SETUP_TEMPLATES[0];
}

export function getTemplatesByCategoryGroup(groupName: string): BusinessTemplate[] {
  return BUSINESS_SETUP_TEMPLATES.filter((t) => t.categoryGroup === groupName);
}

export function getAllCategoryGroups(): string[] {
  return Array.from(new Set(BUSINESS_SETUP_TEMPLATES.map((t) => t.categoryGroup)));
}
