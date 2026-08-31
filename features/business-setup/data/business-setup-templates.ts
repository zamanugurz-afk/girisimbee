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
    mandatoryLegalItems: [
      { name: 'SEGEM Ruhsat & Levha Kayıt Bedeli', cost: 18500, description: 'TOBB ve Hazine onaylı Sigorta Acenteleri Levhası resmi tescil harcı' },
      { name: 'Belediye İşyeri Açma & Çalışma Ruhsatı', cost: 6500, description: 'İlçe belediyesi 3. sınıf gayrisıhhi/ticari müessese harcı' },
      { name: 'Ticaret Odası Kayıt & Şirket Kuruluşu', cost: 9500, description: 'Ticaret Sicil Gazetesi ilanı, ana sözleşme ve noter onayları' },
      { name: 'Yangın ve Güvenlik Uygunluk Raporu', cost: 3200, description: 'İtfaiye yangın tüpü ve tahliye planı onay belgesi' },
    ],
    equipments: [
      { id: 'sig-1', name: 'Yangın Söndürme Tüpü & İlk Yardım Seti (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 2, minQty: 2, isLocked: true, unitLabel: 'Adet' },
      { id: 'sig-2', name: 'Kilitli Çelik Arşiv ve Kıymetli Evrak Kasası', category: 'mandatory', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'sig-3', name: 'Acente Operasyon İş İstasyonu (PC + Çift Monitör + UPS)', category: 'core_tech', unitCost: 28500, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'sig-4', name: 'Yüksek Hızlı Çok Fonksiyonlu Belge Tarayıcı & Lazer Yazıcı', category: 'core_tech', unitCost: 16800, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'sig-5', name: 'Yönetici & Acente Müdürü Masa Takımı (Deri Koltuklu)', category: 'furniture', unitCost: 22500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'sig-6', name: 'Müşteri Karşılama ve Poliçe İnceleme Koltuk Grubu', category: 'furniture', unitCost: 15400, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'sig-7', name: 'İnverter Split Klima (18.000 BTU A+++)', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Teknik Müdür (SEGEM Belgeli Sorumlu)', count: 1, avgSalary: 38000, isMandatory: true, description: 'Poliçe kesmeye yetkili müdür' },
      { role: 'Müşteri Temsilcisi & Satış Uzmanı', count: 1, avgSalary: 28000, isMandatory: false, description: 'Portföy ve teklif takibi' },
    ],
    breakEvenMetric: {
      label: 'Düzenlenen Kasko / Trafik / Tamamlayıcı Sağlık Poliçesi',
      unitPrice: 1250, // Ortalama komisyon geliri
      targetUnitsPerDay: 4,
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
    mandatoryLegalItems: [
      { name: 'Taşınmaz Ticareti Yetki Belgesi Harcı', cost: 12000, description: 'Ticaret Bakanlığı onaylı yetki belgesi ve mesleki yeterlilik kaydı' },
      { name: 'İşyeri Açma ve Çalışma Ruhsatı', cost: 6500, description: 'Belediye ticari işyeri ruhsatı' },
      { name: 'Emlakçılar Odası & Ticaret Odası Kaydı', cost: 8500, description: 'Oda tescil ve sicil tasdiknamesi' },
      { name: 'Vergi Dairesi Mükellefiyet & e-İmza Kurulumu', cost: 2500, description: 'Resmi sözleşmeler için dijital altyapı' },
    ],
    equipments: [
      { id: 'eml-1', name: 'Işıklı LED Vitrin İlan Askı Panoları (A4/A3 Modüler)', category: 'mandatory', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'eml-2', name: 'Yangın Güvenlik Seti ve Acil Çıkış Levhaları', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'eml-3', name: 'Danışman Bilgisayar İstasyonu (Laptop + Monitör)', category: 'core_tech', unitCost: 24000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'eml-4', name: 'Renkli A3/A4 Çıktı ve Sözleşme Yazıcısı', category: 'core_tech', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'eml-5', name: 'Müşteri Görüşme ve Pazarlık Masası (6 Kişilik)', category: 'furniture', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'eml-6', name: 'Geniş Açı Gayrimenkul Çekim Seti & Gimbal', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'eml-7', name: 'Ofis Tipi Otomatik Kahve & Çay Makinesi', category: 'appliances', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Sorumlu Emlak Danışmanı (Seviye 5 Belgeli)', count: 1, avgSalary: 35000, isMandatory: true },
      { role: 'Saha Gayrimenkul Danışmanı', count: 1, avgSalary: 26000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Tamamlanan Kiralama / Satış Hizmet Sözleşmesi',
      unitPrice: 18000, // Ortalama komisyon payı
      targetUnitsPerDay: 0.15, // Ayda ~4-5 işlem
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
    monthlyAccountingFee: 0, // Kendisi yapıyor
    monthlySoftwareFee: 5500, // LUCA / Zirve / e-Defter
    mandatoryLegalItems: [
      { name: 'TÜRMOB / SMMM Odası Büro Tescil Belgesi', cost: 16500, description: 'Bağımsız mesleki faaliyet tescili ve ruhsat onayı' },
      { name: 'Belediye İzin & Meslek Levhası Harcı', cost: 5500, description: 'Ruhsat ve tabela onayları' },
      { name: 'Kayıtlı Elektronik Posta (KEP) & e-Mühür Kurulumu', cost: 3500, description: 'GİB entegrasyonu için yasal sertifikalar' },
    ],
    equipments: [
      { id: 'muh-1', name: 'Yangın ve Güvenlik Tüpü (6kg CO2 / KKT)', category: 'safety', unitCost: 1900, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'muh-2', name: 'Kilitli Klasörlük & Metal Dosya Arşiv Dolapları', category: 'mandatory', unitCost: 18000, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'muh-3', name: 'Mali Müşavir & Uzman PC İş İstasyonu (Hızlı SSD + Çift Ekran)', category: 'core_tech', unitCost: 27000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'muh-4', name: 'Yüksek Kapasiteli Çift Taraflı Otomatik Belge Tarayıcı & Yazıcı', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'muh-5', name: 'Evrak İmha Makinesi (P-4 Gizlilik Standardı)', category: 'core_tech', unitCost: 6500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'muh-6', name: 'SMMM Makam Masa & Misafir Koltuk Takımı', category: 'furniture', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
    ],
    recommendedStaff: [
      { role: 'SMMM Ruhsatlı Mali Müşavir', count: 1, avgSalary: 45000, isMandatory: true },
      { role: 'Kıdemli Muhasebe Uzmanı / Stajyer', count: 1, avgSalary: 28000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Aylık Düzenli Defter Tutulan Şirket / Mükellef Sayısı',
      unitPrice: 2800, // Ortalama mükellef aylık ücreti
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
    mandatoryLegalItems: [
      { name: 'Baro Levha Kayıt & Büro Açılış Bildirimi', cost: 14000, description: 'İl Baro Başkanlığı yetki ve levha kayıt harcı' },
      { name: 'UYAP Kurumsal Donanım & Güvenlik Altyapısı', cost: 4500, description: 'Avukat portalı, e-imza ve mobil imza tescilleri' },
      { name: 'Resmi Tabela & İşyeri Bildirimi', cost: 3500, description: 'Avukatlık Kanunu tabela standartları onayı' },
    ],
    equipments: [
      { id: 'huk-1', name: 'Yangın Söndürme Tüpü & İlk Yardım Dolabı', category: 'safety', unitCost: 1800, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'huk-2', name: 'Müvekkil Dosya & İçtihat Kütüphane Kitaplığı', category: 'mandatory', unitCost: 21000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Takım' },
      { id: 'huk-3', name: 'UYAP Uyumlu Avukat Bilgisayarı & Güvenli Sunucu', category: 'core_tech', unitCost: 32000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'huk-4', name: 'Hızlı Tarayıcı & Çok Sayfalı Dilekçe Yazıcısı', category: 'core_tech', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'huk-5', name: 'Müvekkil Toplantı ve Arabuluculuk Masası (8 Kişilik)', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'huk-6', name: 'Avukat Makam Koltuk & Klasik Ahşap Masa Takımı', category: 'furniture', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
    ],
    recommendedStaff: [
      { role: 'Ruhsatlı Avukat (Kurucu Ortak)', count: 1, avgSalary: 50000, isMandatory: true },
      { role: 'Yasal Stajyer Avukat / Katip', count: 1, avgSalary: 26000, isMandatory: false },
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
    mandatoryLegalItems: [
      { name: 'Ticaret Odası Tescili & Şirket Kuruluşu', cost: 11000, description: 'Ltd. Şti. sermaye tescili ve gazete ilanı' },
      { name: 'Belediye İşyeri Çalışma Ruhsatı', cost: 6500, description: 'Ofis çalışma ruhsatı' },
      { name: 'BTK & KVKK Uyumluluk Kaydı', cost: 4500, description: 'Veri sorumlusu sicil ve yasal uyumluluk' },
    ],
    equipments: [
      { id: 'yaz-1', name: 'Yangın Güvenlik & İlk Yardım İstasyonu', category: 'safety', unitCost: 1800, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'yaz-2', name: 'Geliştirici İş İstasyonu (i7/M3 Pro + Çift 4K Monitör + Ergonomik Koltuk)', category: 'core_tech', unitCost: 55000, defaultQty: 3, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'yaz-3', name: 'GigaBit Yönetilebilir Switch & Firewall Ağ Cihazı', category: 'core_tech', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'yaz-4', name: 'Toplantı & Sunum Ekranı (65 inç 4K Akıllı TV + Kamera)', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'yaz-5', name: 'Modüler Açık Ofis Çalışma Masaları Grubu', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'yaz-6', name: 'Tam Otomatik Çekirdekten Kahve Makinesi', category: 'appliances', unitCost: 18500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Kıdemli Yazılım Geliştirici / Tech Lead', count: 1, avgSalary: 65000, isMandatory: true },
      { role: 'UI/UX Tasarımcı & Frontend Geliştirici', count: 1, avgSalary: 45000, isMandatory: false },
      { role: 'Proje Yöneticisi / Satış Temsilcisi', count: 1, avgSalary: 38000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Tamamlanan Web / Mobil / SaaS Yazılım Projesi',
      unitPrice: 45000,
      targetUnitsPerDay: 0.1, // Ayda ~3 proje
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
    monthlyUtilitiesEstimate: 12500, // Yüksek elektrik & su
    monthlyAccountingFee: 3000,
    monthlySoftwareFee: 2400, // POS & Adisyon
    mandatoryLegalItems: [
      { name: 'Sıhhi Müessese İşyeri Açma Ruhsatı', cost: 14500, description: 'İlçe belediyesi gıda işletmesi denetim ve ruhsat harcı' },
      { name: 'İl Tarım ve Orman Müdürlüğü İşletme Kayıt Belgesi', cost: 4200, description: 'Gıda güvenliği yasal zorunlu kayıt' },
      { name: 'İtfaiye Yangın ve Baca Uygunluk Raporu', cost: 6500, description: 'Mekan baca, davlumbaz ve yangın güvenliği teftişi' },
      { name: 'Müzik Yayın İzni & Telif Lisansı (MÜYAP/MSG)', cost: 5500, description: 'Ticari mekan kamuya açık müzik yayını izni' },
    ],
    equipments: [
      { id: 'kaf-1', name: 'Yangın Söndürme Sistemi & Duman Dedektörü', category: 'safety', unitCost: 3500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'kaf-2', name: 'Endüstriyel 2 Gruplu Espresso Makinesi (La Marzocco / Sanremo / Nuova)', category: 'machinery', unitCost: 145000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kaf-3', name: 'On-Demand Otomatik Kahve Değirmeni (Mahlkönig / Mazzer)', category: 'machinery', unitCost: 32000, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kaf-4', name: 'Sanayi Tipi Su Arıtma & Yumuşatma Sistemi', category: 'appliances', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kaf-5', name: 'Tezgah Altı Çift Kapılı Paslanmaz Buzdolabı', category: 'appliances', unitCost: 34000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'kaf-6', name: 'Endüstriyel Günlük 40kg Buz Yapma Makinesi', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'kaf-7', name: 'Dokunmatik POS Terminali + Adisyon / e-Adisyon Yazıcısı', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kaf-8', name: 'Masa & Sandalye / Berjer Oturma Grubu (İç & Dış 15 Masa)', category: 'furniture', unitCost: 68000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kaf-9', name: 'Soğutmalı Cam Pasta & Tatlı Teşhir Vitrini', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Baş Barista (Head Barista)', count: 1, avgSalary: 34000, isMandatory: true },
      { role: 'Yardımcı Barista / Servis Elemanı', count: 2, avgSalary: 25000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Ortalama Kahve & İçecek / Tatlı Satışı',
      unitPrice: 110, // Ortalama sepet tutarı / içecek fiyatı
      targetUnitsPerDay: 95,
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
    monthlyUtilitiesEstimate: 22000, // Doğalgaz + Elektrik + Su
    monthlyAccountingFee: 3500,
    monthlySoftwareFee: 3000,
    mandatoryLegalItems: [
      { name: '1. Sınıf Sıhhi Müessese / Lokanta Ruhsat Harcı', cost: 18000, description: 'Belediye mutfak ve salon denetimi' },
      { name: 'İl Tarım Gıda Üretim ve Satış İzni', cost: 5500, description: 'HACCP standartları gıda sicili' },
      { name: 'Ağır Hizmet Baca & Karbon Filtre İtfaiye Uygunluk Belgesi', cost: 12500, description: 'Çevre ve yangın yönetmeliği baca uygunluğu' },
      { name: 'Gres Yağ Tutucu / Atık Yağ Sözleşmesi', cost: 4500, description: 'Belediye çevre müdürlüğü atık yağ bertaraf onayı' },
    ],
    equipments: [
      { id: 'res-1', name: 'Yangın Söndürme & Davlumbaz Otomatik Söndürme Sistemi', category: 'safety', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'res-2', name: 'Paslanmaz Endüstriyel Davlumbaz ve Salyangoz Emiş Motoru', category: 'machinery', unitCost: 45000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'res-3', name: '4 Gözlü Sanayi Tipi Ocak & Kuzine Fırın (Doğalgazlı)', category: 'machinery', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'res-4', name: 'Giyotin Tip Endüstriyel Bulaşık Yıkama Makinesi', category: 'appliances', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'res-5', name: 'Dik Tip Çift Kapılı Paslanmaz Derin Dondurucu & Soğutucu Dolap', category: 'appliances', unitCost: 55000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'res-6', name: 'Paslanmaz Çelik Çalışma Tezgahları & Evyeler (304 Kalite)', category: 'furniture', unitCost: 32000, defaultQty: 3, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'res-7', name: 'Restoran Salon Masa & Sandalye Grubu (20 Masa / 80 Sandalye)', category: 'furniture', unitCost: 110000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'res-8', name: 'Mutfak Hazırlık & Porselen / Çatal-Bıçak Servis Takımları', category: 'appliances', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'res-9', name: 'El Terminali Destekli Restoran POS & Mutfak Yazıcı Sistemi', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Aşçıbaşı / Usta Şef', count: 1, avgSalary: 45000, isMandatory: true },
      { role: 'Aşçı Yardımcısı & Bulaşıkhane', count: 2, avgSalary: 26000, isMandatory: false },
      { role: 'Kaptan Garson / Servis Elemanı', count: 2, avgSalary: 27000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Ortalama Yemek Masası & Paket Servis Siparişi',
      unitPrice: 280, // Ortalama kişi başı yemek hesabı
      targetUnitsPerDay: 55,
      unitLabel: 'Kişi / Gün',
    },
  },
  {
    id: 'donerci_kebapci',
    name: 'Dönerci & Kebapçı',
    emoji: '🥩',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 75,
    fitoutCostPerM2: 4800,
    monthlyUtilitiesEstimate: 16000,
    monthlyAccountingFee: 3000,
    monthlySoftwareFee: 2400,
    mandatoryLegalItems: [
      { name: 'Belediye Döner / Kebap İşyeri Açma Ruhsatı', cost: 16000, description: 'Et işleme ve pişirme ruhsatı' },
      { name: 'Tarım İl Müdürlüğü Et & Gıda Kaydı', cost: 4500, description: 'Karkas et ve gıda hijyen onayı' },
      { name: 'Kömürlü/Gazlı Ocak Davlumbaz İtfaiye Raporu', cost: 11000, description: 'Baca emiş ve yangın teftişi' },
    ],
    equipments: [
      { id: 'don-1', name: 'Yangın Söndürme Cihazları ve Güvenlik Levhaları', category: 'safety', unitCost: 2500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'don-2', name: '4-5 Radyanlı Otomatik Motorlu Paslanmaz Döner Ocağı', category: 'machinery', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'don-3', name: 'Lavataşlı / Kömürlü Kebap Izgarası & Paslanmaz Davlumbaz', category: 'machinery', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'don-4', name: 'Elektrikli Profesyonel Döner Dilimleme Bıçağı', category: 'appliances', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'don-5', name: 'Soğutmalı Meze & Salata Hazırlık Tezgahı (Camlı)', category: 'appliances', unitCost: 29000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'don-6', name: 'Paslanmaz Et Dinlendirme ve Saklama Dolabı', category: 'appliances', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'don-7', name: 'Salon Masa & Sandalye Grubu (12 Masa / 48 Sandalye)', category: 'furniture', unitCost: 52000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'don-8', name: 'Hızlı Sipariş & Paket Servis POS Cihazı + Caller ID', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Döner Ustası / Kebap Ustası', count: 1, avgSalary: 48000, isMandatory: true },
      { role: 'Tezgah / Mutfak Yardımcısı', count: 1, avgSalary: 26000, isMandatory: false },
      { role: 'Paket Kurye / Servis Elemanı', count: 1, avgSalary: 28000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Porsiyon Döner / Dürüm & Kebap Satışı',
      unitPrice: 190,
      targetUnitsPerDay: 85,
      unitLabel: 'Porsiyon / Gün',
    },
  },
  {
    id: 'firin_unlumamul',
    name: 'Fırın & Unlu Mamüller',
    emoji: '🥖',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 120,
    fitoutCostPerM2: 5200,
    monthlyUtilitiesEstimate: 24000, // Elektrik + Sanayi Doğalgazı
    monthlyAccountingFee: 3500,
    monthlySoftwareFee: 2000,
    mandatoryLegalItems: [
      { name: '1. Sınıf Gayrisıhhi Müessese / Fırın Ruhsat Harcı', cost: 22000, description: 'Sanayi ve belediye unlu mamul imalat ruhsatı' },
      { name: 'Tarım İl Müdürlüğü Ekmek/Gıda Üretim İzni', cost: 6500, description: 'Gıda kodeksi ekmek üretim yetkisi' },
      { name: 'Fırın Baca & Çevre Emisyon Uygunluk Raporu', cost: 14000, description: 'Yüksek sıcaklık baca ve kurum filtresi onayı' },
    ],
    equipments: [
      { id: 'fir-1', name: 'Yangın ve Güvenlik Tertibatı (Otomatik Algılama)', category: 'safety', unitCost: 8500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'fir-2', name: 'Taş Tabanlı Katlı / Döner Arabalı Ekmek & Pasta Fırını', category: 'machinery', unitCost: 280000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'fir-3', name: 'Spiral Hamur Yoğurma Kazanı (50kg Kapasiteli)', category: 'machinery', unitCost: 55000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'fir-4', name: 'Otomatik Un Eleme ve Havalandırma Makinesi', category: 'machinery', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'fir-5', name: 'İklimlendirmeli Hamur Mayalandırma Kabini', category: 'machinery', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'fir-6', name: 'Otomatik Ekmek Dilimleme Makinesi (Bıçaklı)', category: 'machinery', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'fir-7', name: 'Işıklı Ahşap Ekmek ve Unlu Mamül Teşhir Reyonları', category: 'furniture', unitCost: 45000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'fir-8', name: 'Barkodlu Terazi ve Hızlı Kasa Satış Terminali', category: 'core_tech', unitCost: 21000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Fırın Ustası (Ekmek / Unlu Mamul)', count: 1, avgSalary: 45000, isMandatory: true },
      { role: 'Hamurkar / Fırıncı Çırağı', count: 1, avgSalary: 28000, isMandatory: false },
      { role: 'Kasa & Tezgah Satış Elemanı', count: 1, avgSalary: 25000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Ekmek, Simit, Poğaça ve Unlu Mamül Adedi',
      unitPrice: 20, // Ortalama birim satış
      targetUnitsPerDay: 480,
      unitLabel: 'Adet / Gün',
    },
  },
  {
    id: 'cigkofteci',
    name: 'Çiğköfte & Hızlı Fast-Food',
    emoji: '🌯',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 35,
    fitoutCostPerM2: 3200,
    monthlyUtilitiesEstimate: 6000,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 1800,
    mandatoryLegalItems: [
      { name: 'Belediye İşyeri Açma ve Çalışma Ruhsatı', cost: 8500, description: 'Hızlı gıda satış ruhsatı' },
      { name: 'İl Tarım Gıda Satış Kayıt Belgesi', cost: 3500, description: 'Gıda güvenliği tescili' },
      { name: 'Yangın Tüpü ve Uygunluk Onayı', cost: 2000, description: 'İtfaiye onay belgesi' },
    ],
    equipments: [
      { id: 'cig-1', name: 'Yangın Söndürme Tüpü (6kg)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'cig-2', name: 'Soğutmalı Camlı Paslanmaz Çiğköfte Teşhir Tezgahı', category: 'machinery', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'cig-3', name: 'Dikey Çift Kapılı İçecek ve Yeşillik Dolabı', category: 'appliances', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'cig-4', name: 'Masa Sandalye Seti (4 Masa / 16 Sandalye)', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'cig-5', name: 'Işıklı Dış Tabela ve Dijital Menüboard Ekranı', category: 'core_tech', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'cig-6', name: 'Dokunmatik POS Kasa & Paket Sipariş Terminali', category: 'core_tech', unitCost: 15000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Çiğköfte Usta / İşletmeci', count: 1, avgSalary: 30000, isMandatory: true },
      { role: 'Moto Kurye / Yardımcı', count: 1, avgSalary: 26000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Dürüm & Porsiyon Çiğköfte Satışı',
      unitPrice: 85,
      targetUnitsPerDay: 75,
      unitLabel: 'Porsiyon / Gün',
    },
  },
  {
    id: 'pastane_tatlici',
    name: 'Pastane & Tatlıcı',
    emoji: '🍰',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 70,
    fitoutCostPerM2: 4200,
    monthlyUtilitiesEstimate: 11000,
    monthlyAccountingFee: 2800,
    monthlySoftwareFee: 2200,
    mandatoryLegalItems: [
      { name: 'Belediye Tatlı & Pastane Ruhsatı', cost: 13500, description: 'Gıda satış ve servis ruhsatı' },
      { name: 'Tarım İl Müdürlüğü Gıda Onayı', cost: 4200, description: 'İşletme kayıt belgesi' },
      { name: 'İtfaiye Yangın Güvenlik Onayı', cost: 4500, description: 'Yangın ve tahliye raporu' },
    ],
    equipments: [
      { id: 'pas-1', name: 'Yangın ve Güvenlik Ekipmanları Seti', category: 'safety', unitCost: 2200, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'pas-2', name: 'Bombeli Camlı Soğutmalı Yaş Pasta Vitrini (2 Metre)', category: 'machinery', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'pas-3', name: 'Isıtmalı / Nötr Şerbetli Tatlı ve Baklava Reyonu', category: 'machinery', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'pas-4', name: 'Kuru Pasta ve Kurabiye Teşhir Dolabı', category: 'furniture', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'pas-5', name: '3 Demlikli Bakır Çay Kazanı (Otomatik Su Almalı)', category: 'appliances', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'pas-6', name: 'Oturma Alanı Masa & Sandalye Grubu (8 Masa)', category: 'furniture', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'pas-7', name: 'Barkodlu Terazi & Hızlı POS Satış Sistemi', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Tezgah Sorumlusu / Pastacı', count: 1, avgSalary: 32000, isMandatory: true },
      { role: 'Servis ve Paketleme Elemanı', count: 1, avgSalary: 25000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Kilo / Porsiyon Tatlı ve Pasta Siparişi',
      unitPrice: 160,
      targetUnitsPerDay: 50,
      unitLabel: 'Porsiyon / Gün',
    },
  },

  // =========================================================================
  // 3. PERAKENDE & MAĞAZACILIK SEKTÖRÜ
  // =========================================================================
  {
    id: 'market_bakkal',
    name: 'Market & Süpermarket',
    emoji: '🛒',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 110,
    fitoutCostPerM2: 3200,
    monthlyUtilitiesEstimate: 14000, // Yoğun soğutucu elektrik tüketimi
    monthlyAccountingFee: 3000,
    monthlySoftwareFee: 2800, // Barkodlu stok & kasa
    mandatoryLegalItems: [
      { name: 'Ticari Market İşyeri Açma Ruhsatı', cost: 14000, description: 'Belediye perakende satış ruhsatı' },
      { name: 'TAPDK Tütün ve Alkol Satış Belgesi (Opsiyonel/Standart)', cost: 8500, description: 'Tarım Bakanlığı tütün/içecek satış izni' },
      { name: 'İtfaiye ve Elektrik Tesisat Uygunluk Belgesi', cost: 5000, description: 'Yangın ve aydınlatma teftişi' },
    ],
    equipments: [
      { id: 'mar-1', name: 'Yangın Söndürme Tüpleri ve Güvenlik Aynaları', category: 'safety', unitCost: 3200, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'mar-2', name: 'Barkodlu Kasa Bankosu + Terazi + Optik Okuyucu + Para Çekmecesi', category: 'core_tech', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'mar-3', name: 'Duvar Tipi Soğutmalı Sütlük & Şarküteri Dolabı (3 Metre)', category: 'appliances', unitCost: 75000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'mar-4', name: 'Dikey Camlı İçecek ve Meşrubat Dolabı', category: 'appliances', unitCost: 28000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'mar-5', name: 'Çift Taraflı Orta Market Reyonları ve Duvar Rafları (Çelik)', category: 'furniture', unitCost: 55000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'mar-6', name: 'Manav Teşhir Standı ve Aynalı Meyve-Sebze Reyonu', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'mar-7', name: '8 Kameralı Gece Görüşlü Güvenlik Kamera ve Kayıt Sistemi', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Market Sorumlusu / Kasiyer', count: 1, avgSalary: 28000, isMandatory: true },
      { role: 'Reyon Görevlisi / Çırak', count: 1, avgSalary: 24000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Kasa Fişi / Müşteri Alışveriş Sepeti',
      unitPrice: 140, // Ortalama sepet tutarı
      targetUnitsPerDay: 130,
      unitLabel: 'Fiş / Gün',
    },
  },
  {
    id: 'butik_giyim',
    name: 'Butik Giyim & Moda',
    emoji: '👗',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 60,
    fitoutCostPerM2: 3600,
    monthlyUtilitiesEstimate: 4500,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 2000,
    mandatoryLegalItems: [
      { name: 'Belediye Perakende Mağaza Ruhsatı', cost: 8500, description: 'Tekstil ve giyim satış izni' },
      { name: 'Oda Kaydı ve Vergi Tescil Harçları', cost: 6500, description: 'Esnaf veya Ticaret Odası kaydı' },
      { name: 'Yangın Güvenlik Uygunluğu', cost: 2500, description: 'Yangın tüpü ve tahliye belgesi' },
    ],
    equipments: [
      { id: 'but-1', name: 'Yangın Söndürme Tüpü & İlk Yardım Kiti', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'but-2', name: 'Mağaza Girişi Akusto-Manyetik Alarm Kapı Anteni + Sökücü', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'but-3', name: 'Gold / Siyah Metal Duvar Askı Sistemleri ve Orta Stantlar', category: 'furniture', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'but-4', name: 'LED Aydınlatmalı Boy Aynalı Soyunma Kabinleri (2 Kabin)', category: 'furniture', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'but-5', name: 'Vitrin Mankeni / Terzi Mankeni Seti (4 Adet)', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'but-6', name: 'Sanayi Tipi Dikey Buharlı Kırışıklık Giderici Ütü', category: 'appliances', unitCost: 12500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'but-7', name: 'Barkodlu Kasa ve Stok Takip Bilgisayarı + POS', category: 'core_tech', unitCost: 19000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Mağaza Satış Temsilcisi / Stilist', count: 1, avgSalary: 28000, isMandatory: true },
    ],
    breakEvenMetric: {
      label: 'Günlük Satılan Kıyafet & Aksesuar Parça Sayısı',
      unitPrice: 650, // Ortalama parça fiyatı
      targetUnitsPerDay: 7,
      unitLabel: 'Parça / Gün',
    },
  },
  {
    id: 'kirtasiye_kitabevi',
    name: 'Kırtasiye & Dijital Baskı / Kitabevi',
    emoji: '📚',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 70,
    fitoutCostPerM2: 2800,
    monthlyUtilitiesEstimate: 5000,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 2000,
    mandatoryLegalItems: [
      { name: 'Belediye Kırtasiye ve Perakende Ruhsatı', cost: 8500, description: 'Ticari faaliyet izni' },
      { name: 'Kültür Bakanlığı Sertifika Harcı (Kitap Satışı)', cost: 2500, description: 'Fikir ve Sanat Eserleri tescili' },
      { name: 'Oda Kayıt ve Tescil Harçları', cost: 6000, description: 'Esnaf / Ticaret odası kaydı' },
    ],
    equipments: [
      { id: 'kir-1', name: 'Yangın Söndürme Donanımı', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'kir-2', name: 'Yüksek Hızlı Renkli A3/A4 Çok Fonksiyonlu Fotokopi & Yazıcı', category: 'core_tech', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kir-3', name: 'Helezon Spiral Ciltleme & Laminasyon / PVC Kaplama Makinesi', category: 'machinery', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kir-4', name: 'Giyotin Kağıt Kesme & Ağır Hizmet Zımba Makinesi', category: 'machinery', unitCost: 9500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kir-5', name: 'Çelik ve Ahşap Kitaplık / Kırtasiye Duvar Rafları', category: 'furniture', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kir-6', name: 'Barkod Okuyuculu Kasa ve Stok Terminali', category: 'core_tech', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Kırtasiye Satış ve Dijital Baskı Görevlisi', count: 1, avgSalary: 27000, isMandatory: true },
    ],
    breakEvenMetric: {
      label: 'Günlük Kırtasiye, Çıktı & Kitap Satış Sepeti',
      unitPrice: 120,
      targetUnitsPerDay: 45,
      unitLabel: 'İşlem / Gün',
    },
  },
  {
    id: 'cicekci_botanik',
    name: 'Çiçekçi & Botanik',
    emoji: '🌸',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 45,
    fitoutCostPerM2: 3000,
    monthlyUtilitiesEstimate: 4500,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 1800,
    mandatoryLegalItems: [
      { name: 'Belediye Çiçek Satış Ruhsatı', cost: 7500, description: 'İşyeri açma ruhsatı' },
      { name: 'Oda Tescil ve Sicil Harcı', cost: 5500, description: 'Esnaf odası kaydı' },
      { name: 'Yangın ve Güvenlik Belgesi', cost: 2000, description: 'İtfaiye raporu' },
    ],
    equipments: [
      { id: 'cic-1', name: 'Yangın Söndürme Tüpü', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'cic-2', name: 'Nem ve Sıcaklık Kontrollü Cam Çiçek Koruma Dolabı (2m)', category: 'machinery', unitCost: 44000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'cic-3', name: 'Çiçek Düzenleme ve Buket Tasarım Çalışma Masası', category: 'furniture', unitCost: 15000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'cic-4', name: 'Basamaklı Saksı & Bitki Teşhir Stantları', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'cic-5', name: 'Ambalaj, Tül, Kurdele ve Vazo Aksesuar Reyonu', category: 'furniture', unitCost: 12000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'cic-6', name: 'Hızlı Sipariş & POS Kasa Sistemi', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Çiçek Tasarımcısı / Florist', count: 1, avgSalary: 30000, isMandatory: true },
    ],
    breakEvenMetric: {
      label: 'Günlük Buket, Aranjman & Saksı Bitkisi Satışı',
      unitPrice: 450,
      targetUnitsPerDay: 6,
      unitLabel: 'Sipariş / Gün',
    },
  },
  {
    id: 'petshop',
    name: 'Petshop & Evcil Hayvan',
    emoji: '🐾',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 65,
    fitoutCostPerM2: 2900,
    monthlyUtilitiesEstimate: 4800,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 2000,
    mandatoryLegalItems: [
      { name: 'Tarım ve Orman İl Müdürlüğü Petshop İzin Belgesi', cost: 9500, description: 'Evcil hayvan malzemesi ve yem satış tescili' },
      { name: 'Belediye İşyeri Ruhsatı', cost: 8500, description: 'Perakende satış izin harcı' },
      { name: 'Yangın ve Güvenlik Onayı', cost: 2500, description: 'İtfaiye uygunluk belgesi' },
    ],
    equipments: [
      { id: 'pet-1', name: 'Yangın Tüpü ve İlk Yardım Donanımı', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'pet-2', name: 'Hassas Dijital Yem/Mama Tartım Terazisi', category: 'core_tech', unitCost: 8500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'pet-3', name: 'Ağır Hizmet Çuval Mama ve Konserve Teşhir Rafları', category: 'furniture', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'pet-4', name: 'Aksesuar, Tasma, Taşıma Çantası ve Oyuncak Stantları', category: 'furniture', unitCost: 19000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'pet-5', name: 'Barkodlu Kasa ve Stok Takip Bilgisayarı', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Petshop Satış ve Danışma Personeli', count: 1, avgSalary: 27000, isMandatory: true },
    ],
    breakEvenMetric: {
      label: 'Günlük Mama, Ödül & Evcil Hayvan Bakım Sepeti',
      unitPrice: 280,
      targetUnitsPerDay: 20,
      unitLabel: 'Sepet / Gün',
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
    monthlySoftwareFee: 3200, // Medula Optik Entegrasyonu
    mandatoryLegalItems: [
      { name: 'İl Sağlık Müdürlüğü Optisyenlik Müessesesi Ruhsatı', cost: 18500, description: 'Sağlık Bakanlığı optisyenlik açılış ve denetim harcı' },
      { name: 'Optisyenler ve Gözlükçüler Odası Kaydı', cost: 8500, description: 'Oda tescil ve oda levhası' },
      { name: 'Medula & SGK Sözleşme ve Entegrasyon Harcı', cost: 4500, description: 'SGK reçeteli cam/çerçeve sistemi' },
    ],
    equipments: [
      { id: 'opt-1', name: 'Yangın ve Güvenlik Seti', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'opt-2', name: 'Otomatik Dijital Fokometre / Lensmetre (UV & Mavi Işık Ölçerli)', category: 'machinery', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'opt-3', name: 'Dijital Pupillometre (Gözbebeği Mesafe Ölçüm Cihazı)', category: 'machinery', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'opt-4', name: 'Ultrasonik Gözlük Temizleme ve Cam Kesim Montaj Tezgahı', category: 'machinery', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'opt-5', name: 'LED Aydınlatmalı Kilitli Çerçeve Teşhir Vitrinleri', category: 'furniture', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'opt-6', name: 'Gözlük Deneme Masaları ve Aynalı Danışma Bankoları', category: 'furniture', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'opt-7', name: 'Medula Uyumlu Optik Kasa & Barkod Sistemi', category: 'core_tech', unitCost: 21000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Mesul Müdür (Ruhsatlı Optisyen)', count: 1, avgSalary: 42000, isMandatory: true },
      { role: 'Optik Satış Danışmanı', count: 1, avgSalary: 28000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Satılan Numaralı Gözlük / Güneş Gözlüğü & Lens',
      unitPrice: 1800, // Ortalama reçeteli gözlük fiyatı
      targetUnitsPerDay: 2.2,
      unitLabel: 'Gözlük / Gün',
    },
  },

  // =========================================================================
  // 4. KİŞİSEL BAKIM & SAĞLIK SEKTÖRÜ
  // =========================================================================
  {
    id: 'kuafor_guzellik',
    name: 'Kuaför & Güzellik Merkezi',
    emoji: '💇',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 70,
    fitoutCostPerM2: 3800,
    monthlyUtilitiesEstimate: 7500,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 2000,
    mandatoryLegalItems: [
      { name: 'Belediye Sıhhi Müessese Kuaför Ruhsatı', cost: 11000, description: 'Hijyen ve ustalık belgesi onaylı ruhsat' },
      { name: 'Berberler ve Kuaförler Odası Kaydı', cost: 6500, description: 'Meslek odası sicil kaydı' },
      { name: 'Yangın ve Sıhhi Tesisat Uygunluk Belgesi', cost: 3000, description: 'İtfaiye onay raporu' },
    ],
    equipments: [
      { id: 'kua-1', name: 'Yangın Tüpü ve İlk Yardım Dolabı', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'kua-2', name: 'UV Sterilizatör & Otoklav Alet Dezenfeksiyon Cihazı', category: 'mandatory', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kua-3', name: 'Hidrolik Kuaför Koltuğu + LED Işıklı Aynalı Tezgah Seti', category: 'furniture', unitCost: 18500, defaultQty: 3, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'kua-4', name: 'Seramik Lavabolu Yatarlı Saç Yıkama Seti (2 Adet)', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'kua-5', name: 'Profesyonel İyonik Fön Makineleri ve Şekillendirici Seti', category: 'appliances', unitCost: 16000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kua-6', name: 'Müşteri Bekleme Lounge Koltukları & Sehpa', category: 'furniture', unitCost: 15000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'kua-7', name: 'Randevu & Müşteri Takip POS Terminali', category: 'core_tech', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Usta Kuaför / Saç Tasarımcısı (Ustalık Belgeli)', count: 1, avgSalary: 38000, isMandatory: true },
      { role: 'Kalf / Kuaför Yardımcısı', count: 1, avgSalary: 25000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Saç Kesim, Boya, Bakım & Şekillendirme İşlemi',
      unitPrice: 350, // Ortalama işlem ücreti
      targetUnitsPerDay: 10,
      unitLabel: 'Müşteri / Gün',
    },
  },
  {
    id: 'eczane',
    name: 'Eczane & Medikal',
    emoji: '💊',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 60,
    fitoutCostPerM2: 4500,
    monthlyUtilitiesEstimate: 6000,
    monthlyAccountingFee: 3000,
    monthlySoftwareFee: 3500, // Medula & Eczane Otomasyonu
    mandatoryLegalItems: [
      { name: 'İl Sağlık Müdürlüğü Eczane Açılış Ruhsatı', cost: 24000, description: 'Sağlık Bakanlığı kura ve mevzuat onayı' },
      { name: 'Eczacı Odası Kayıt ve Tescil Harcı', cost: 12000, description: 'TEB oda sicil tescili' },
      { name: 'Medula & İTS (İlaç Takip Sistemi) Sözleşme Harcı', cost: 6500, description: 'Bakanlık İTS karekod entegrasyonu' },
    ],
    equipments: [
      { id: 'ecz-1', name: 'Yangın Güvenlik ve Alarm Donanımı', category: 'safety', unitCost: 2500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'ecz-2', name: 'TEB Standartlarında Kilitli İlaç Çekmece Dolapları (Raylı)', category: 'mandatory', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'ecz-3', name: 'Isı ve Nem Takip Cihazlı Medikal Aşı Buzdolabı (+2°C / +8°C)', category: 'appliances', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'ecz-4', name: 'Majistral İlaç Hazırlama Laboratuvar Tezgahı & Hassas Terazi', category: 'machinery', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'ecz-5', name: 'Kırmızı/Yeşil Reçeteli İlaçlar İçin Kilitli Çelik Kasa', category: 'mandatory', unitCost: 12500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'ecz-6', name: 'Eczane Satış Bankosu ve 2D Karekod Okuyuculu Bilgisayarlar', category: 'core_tech', unitCost: 32000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ecz-7', name: 'Dermokozmetik & Vitamin Teşhir Rafları', category: 'furniture', unitCost: 30000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'ecz-8', name: 'Eczane Dış E-Logo Tabelası (Bakanlık Standartlarında)', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Sahip & Mesul Müdür Eczacı', count: 1, avgSalary: 55000, isMandatory: true },
      { role: 'Eczane Teknisyeni / Kalfası', count: 1, avgSalary: 30000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Reçete ve OTC / Dermokozmetik Satış Cirosu',
      unitPrice: 220, // Ortalama sepet tutarı
      targetUnitsPerDay: 45,
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
    mandatoryLegalItems: [
      { name: 'İl Sağlık Müdürlüğü Ağız ve Diş Sağlığı Ruhsatı', cost: 28000, description: 'Sağlık Bakanlığı poliklinik/muayenehane ruhsatı' },
      { name: 'Diş Hekimleri Odası Tescili', cost: 11000, description: 'Oda kayıt ve hekimlik belgesi' },
      { name: 'TAEK / NDK Röntgen Cihazı Lisanslama Harcı', cost: 9500, description: 'Radyasyon güvenliği ve zırhlama onayı' },
      { name: 'Tıbbi Atık Bertaraf Sözleşmesi', cost: 4500, description: 'Belediye çevre ve tıbbi atık belgesi' },
    ],
    equipments: [
      { id: 'dis-1', name: 'Yangın ve Acil Durum Tahliye Ekipmanı', category: 'safety', unitCost: 2500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'dis-2', name: 'Tam Donanımlı Dental Ünit & LED Reflektör & Hekim Taburesi', category: 'machinery', unitCost: 220000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'dis-3', name: 'Dental Otoklav Sterilizasyon Cihazı (B Sınıfı 18L)', category: 'machinery', unitCost: 55000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'dis-4', name: 'Yağsız Sessiz Dental Kompresör & Cerrahi Aspiratör Sistemi', category: 'machinery', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'dis-5', name: 'Dijital Periapikal / Panoramik Röntgen Cihazı ve RVG Sensör', category: 'core_tech', unitCost: 110000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'dis-6', name: 'Hasta Karşılama, Bekleme Koltukları ve Danışma Bankosu', category: 'furniture', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'dis-7', name: 'Klinik Hasta Takip ve Randevu Bilgisayarı', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Diş Hekimi (Mesul Müdür)', count: 1, avgSalary: 60000, isMandatory: true },
      { role: 'Ağız ve Diş Sağlığı Teknikeri / Asistanı', count: 1, avgSalary: 28000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Hasta Tedavisi (Dolgu, Kanal, İmplant, Temizlik)',
      unitPrice: 2200, // Ortalama işlem bedeli
      targetUnitsPerDay: 2.5,
      unitLabel: 'Hasta / Gün',
    },
  },
  {
    id: 'pilates_yoga',
    name: 'Pilates & Yoga Stüdyosu',
    emoji: '🧘',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 80,
    fitoutCostPerM2: 3400,
    monthlyUtilitiesEstimate: 5000,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 2200,
    mandatoryLegalItems: [
      { name: 'Gençlik ve Spor İl Müdürlüğü Özel Beden Eğitimi Ruhsatı', cost: 16000, description: 'Federasyon onaylı antrenörlük ve salon tescili' },
      { name: 'Belediye İşyeri Açma Ruhsatı', cost: 8500, description: 'Spor salonu işletme ruhsatı' },
      { name: 'İtfaiye Yangın ve Havalandırma Raporu', cost: 4500, description: 'Acil çıkış ve duman tahliyesi' },
    ],
    equipments: [
      { id: 'pil-1', name: 'Yangın ve İlk Yardım Güvenlik Kiti', category: 'safety', unitCost: 2000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'pil-2', name: 'Ahşap Reformer Combo Cadillac Aleti (Yaylı & Boxlu)', category: 'machinery', unitCost: 42000, defaultQty: 3, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'pil-3', name: 'Pilates Wunda Chair & Spine Corrector Omurga Düzeltici', category: 'machinery', unitCost: 18000, defaultQty: 2, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'pil-4', name: 'Duvardan Duvara Boy Aynası ve Parke / Kauçuk Zemin', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'pil-5', name: 'Mat, Çember, Pilates Topu ve Direnç Lastikleri Ekipman Seti', category: 'appliances', unitCost: 12000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'pil-6', name: 'Soyunma Odası Kilitli Dolapları & Duş / Lavabo', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'pil-7', name: 'Danışma Masası & Bluetooth Ambiyans Ses Sistemi', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Sertifikalı Baş Pilates Eğitmeni (2. Kademe)', count: 1, avgSalary: 36000, isMandatory: true },
      { role: 'Yardımcı Antrenör / Seans Eğitmeni', count: 1, avgSalary: 26000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Aylık Düzenli Paket Alan Bireysel / Düet Üye Sayısı',
      unitPrice: 3800, // Ortalama 8 seanslık paket ücreti
      targetUnitsPerDay: 0.9,
      unitLabel: 'Aktif Üye',
    },
  },

  // =========================================================================
  // 5. OTOMOTİV & SANAYİ HİZMETLERİ
  // =========================================================================
  {
    id: 'oto_yikama',
    name: 'Oto Yıkama & Detailing',
    emoji: '🚗',
    categoryGroup: 'Otomotiv & Sanayi Hizmetleri',
    defaultM2: 120,
    fitoutCostPerM2: 3800,
    monthlyUtilitiesEstimate: 16000, // Yüksek su ve sanayi elektriği
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 1500,
    mandatoryLegalItems: [
      { name: 'Belediye Gayrisıhhi Müessese Yıkama Ruhsatı', cost: 16500, description: 'Oto yıkama ve temizlik faaliyet izni' },
      { name: 'SKİ / Çevre Müdürlüğü Çamur ve Yağ Tutucu Atık İzni', cost: 9500, description: 'Geri dönüşüm ve su tahliye izni' },
      { name: 'İtfaiye ve Elektrik Topraklama Uygunluk Belgesi', cost: 5000, description: 'Yüksek voltaj ve yangın güvenliği' },
    ],
    equipments: [
      { id: 'otoy-1', name: 'Yangın Söndürme Tüpleri ve Güvenlik Levhaları', category: 'safety', unitCost: 2500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'otoy-2', name: 'Sanayi Tipi Sıcak-Soğuk Yüksek Basınçlı Yıkama Pompası (200 Bar)', category: 'machinery', unitCost: 38000, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'otoy-3', name: 'Pnömatik Köpük Püskürtme Tankı (60 Litre Paslanmaz)', category: 'machinery', unitCost: 11000, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'otoy-4', name: '3 Motorlu Sanayi Tipi Islak-Kuru Vakumlu Oto Süpürgesi', category: 'machinery', unitCost: 19500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'otoy-5', name: 'Pasta Cila & Seramik Kaplama Polisaj Makinesi Seti', category: 'machinery', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'otoy-6', name: 'Yıkama Bölmesi Özel LED Tünel Aydınlatma Sistemi', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'otoy-7', name: 'Müşteri Bekleme Salonu Koltukları + TV + Çay Makinesi', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Usta Yıkama ve Detailing Sorumlusu', count: 1, avgSalary: 32000, isMandatory: true },
      { role: 'Yıkama Elemanı / Kurulama Personeli', count: 2, avgSalary: 24000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük İç-Dış Yıkama & Detailing / Kuaför Araç Sayısı',
      unitPrice: 320, // Ortalama yıkama fiyatı
      targetUnitsPerDay: 18,
      unitLabel: 'Araç / Gün',
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
    monthlySoftwareFee: 5000, // Ekspertiz raporlama yazılımı & TSE
    mandatoryLegalItems: [
      { name: 'TSE HYB (Hizmet Yeterlilik Belgesi) Harcı', cost: 32000, description: 'TSE 13805 standartlarında kurumsal ekspertiz tescili' },
      { name: 'Belediye Gayrisıhhi Müessese Ekspertiz Ruhsatı', cost: 18000, description: 'Teknik denetim istasyonu ruhsatı' },
      { name: 'İtfaiye ve Sanayi Elektrik Onayı', cost: 6500, description: 'Güvenlik ve kaldırma lifti onayı' },
    ],
    equipments: [
      { id: 'otoe-1', name: 'Yangın Güvenlik İstasyonu & İlk Yardım Ünitesi', category: 'safety', unitCost: 3500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'otoe-2', name: 'TSE Onaylı 4x4 Fren Test & Süspansiyon & Yanal Kayma Test Hattı', category: 'machinery', unitCost: 340000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'otoe-3', name: 'Elektro-Hidrolik 4 Ton Araç Altı Kontrol Lifti', category: 'machinery', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'otoe-4', name: 'Evrensel OBD Beyin & Arıza Tespit Diyagnostik Cihazı', category: 'core_tech', unitCost: 45000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'otoe-5', name: 'Dijital Manyetik Boya Kalınlık Ölçüm Cihazı (2 Adet)', category: 'core_tech', unitCost: 14000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'otoe-6', name: 'Otomatik Raporlama Kiosku & Lazer Yazıcı', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'otoe-7', name: 'Cam Bölmeli Müşteri Bekleme ve Rapor Teslim Alanı', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'TSE Belgeli Baş Ekspertiz Teknisyeni', count: 1, avgSalary: 42000, isMandatory: true },
      { role: 'Mekanik / Kaporta Kontrol Ustası', count: 1, avgSalary: 32000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Full Paket / Standart Ekspertiz Raporu',
      unitPrice: 2400, // Ortalama ekspertiz paketi
      targetUnitsPerDay: 3.5,
      unitLabel: 'Araç / Gün',
    },
  },
  {
    id: 'telefon_tamir',
    name: 'Cep Telefonu & Elektronik Tamir',
    emoji: '📱',
    categoryGroup: 'Otomotiv & Sanayi Hizmetleri',
    defaultM2: 40,
    fitoutCostPerM2: 2800,
    monthlyUtilitiesEstimate: 3500,
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 1800,
    mandatoryLegalItems: [
      { name: 'Belediye Elektronik Tamir & Satış Ruhsatı', cost: 7500, description: 'İşyeri açma ruhsatı' },
      { name: 'Ticaret İl Müdürlüğü İkinci El Telefon Satış Yetki Belgesi', cost: 6500, description: 'Yenilenmiş cihaz ve tamir yetkisi' },
      { name: 'Oda Kaydı ve Yangın Belgesi', cost: 4500, description: 'Esnaf sicil tescili' },
    ],
    equipments: [
      { id: 'tel-1', name: 'Yangın Söndürme Tüpü & ESD Antistatik Ekipman', category: 'safety', unitCost: 2200, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'tel-2', name: 'Trinoküler Büyütmeli Mikroskop & HD Kamera Seti', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'tel-3', name: 'Sıcak Hava Üflemeli Havya & Lehim İstasyonu (Quick/JBC)', category: 'machinery', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'tel-4', name: 'Isıtıcılı Vakumlu Ekran ve Cam Ayırma Makinesi', category: 'machinery', unitCost: 14000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'tel-5', name: 'Hassas DC Ayarlı Güvenlikli Laboratuvar Güç Kaynağı', category: 'core_tech', unitCost: 8500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'tel-6', name: 'Kılıf, Ekran Koruyucu ve Aksesuar Teşhir Duvar Panoları', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'tel-7', name: 'Kasa Bankosu + Teknik Servis Takip Programı Bilgisayarı', category: 'core_tech', unitCost: 19000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Kıdemli Elektronik & Anakart Teknisyeni', count: 1, avgSalary: 38000, isMandatory: true },
      { role: 'Tezgah Satış ve Müşteri Kabul Elemanı', count: 1, avgSalary: 25000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Ekran/Batarya Tamiri & Aksesuar Satışı',
      unitPrice: 550, // Ortalama tamir kâr marjı
      targetUnitsPerDay: 5,
      unitLabel: 'İşlem / Gün',
    },
  },
  {
    id: 'kuru_temizleme',
    name: 'Kuru Temizleme & Terzi / Lostra',
    emoji: '👔',
    categoryGroup: 'Otomotiv & Sanayi Hizmetleri',
    defaultM2: 65,
    fitoutCostPerM2: 3500,
    monthlyUtilitiesEstimate: 9500, // Buhar elektriği ve su
    monthlyAccountingFee: 2500,
    monthlySoftwareFee: 1600,
    mandatoryLegalItems: [
      { name: 'Belediye Gayrisıhhi Müessese Kuru Temizleme Ruhsatı', cost: 12500, description: 'Buharlı temizleme ve terzi ruhsatı' },
      { name: 'Terziler ve Kuru Temizlemeciler Odası Kaydı', cost: 5500, description: 'Esnaf sicil onayı' },
      { name: 'İtfaiye Havalandırma ve Yangın Uygunluk Raporu', cost: 4000, description: 'Buhar kazanı ve yangın güvenliği' },
    ],
    equipments: [
      { id: 'krt-1', name: 'Yangın Söndürme Tüpü ve Emniyet Donanımı', category: 'safety', unitCost: 2000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'krt-2', name: 'Sanayi Tipi Vakumlu ve Üflemeli Paspaslı Buharlı Pleyt Ütü Masası', category: 'machinery', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'krt-3', name: 'Profesyonel Düz Dikiş Makinesi + 4 İplikli Overlok Makinesi', category: 'machinery', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'krt-4', name: 'Soğuk Leke Çıkarma Masası & Tabancaları', category: 'machinery', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'krt-5', name: 'Döner Motorlu Konveyör Giysi Askılık Sistemi (200 Askı)', category: 'machinery', unitCost: 32000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'krt-6', name: 'Müşteri Kabul Bankosu ve Fiş Yazıcılı Takip Bilgisayarı', category: 'core_tech', unitCost: 17500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Usta Terzi / Kuru Temizleme Ustası', count: 1, avgSalary: 35000, isMandatory: true },
      { role: 'Ütücü / Kabul Elemanı', count: 1, avgSalary: 25000, isMandatory: false },
    ],
    breakEvenMetric: {
      label: 'Günlük Kuru Temizleme Giysi & Tadilat / Paça Adedi',
      unitPrice: 180,
      targetUnitsPerDay: 18,
      unitLabel: 'Parça / Gün',
    },
  },
];

/**
 * ID ile işletme şablonunu getirir
 */
export function getBusinessTemplateById(id: string): BusinessTemplate {
  const found = BUSINESS_SETUP_TEMPLATES.find((t) => t.id === id);
  return found || BUSINESS_SETUP_TEMPLATES[0];
}

/**
 * Kategori grubuna göre şablonları listeler
 */
export function getTemplatesByCategoryGroup(groupName: string): BusinessTemplate[] {
  return BUSINESS_SETUP_TEMPLATES.filter((t) => t.categoryGroup === groupName);
}

/**
 * Mevcut tüm kategori gruplarını döner
 */
export function getAllCategoryGroups(): string[] {
  return Array.from(new Set(BUSINESS_SETUP_TEMPLATES.map((t) => t.categoryGroup)));
}
