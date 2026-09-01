import type { BusinessTemplate, SetupEquipment } from '../types/business-setup.types';

export function calculateDynamicEquipmentQty(eq: SetupEquipment, m2: number): { minQty: number; defaultQty: number } {
  if (!eq.scalesWithM2 || !eq.m2Ratio) {
    return { minQty: eq.minQty, defaultQty: eq.defaultQty };
  }

  const calculated = Math.max(eq.minQty, Math.ceil(m2 / eq.m2Ratio));
  return {
    minQty: eq.isLocked ? calculated : eq.minQty,
    defaultQty: Math.max(calculated, eq.defaultQty),
  };
}

export const BUSINESS_TEMPLATES: Record<string, BusinessTemplate> = {
  // ================= 1. FİNANS & HİZMET =================
  'sigorta-acentesi': {
    id: 'sigorta-acentesi',
    name: 'Sigorta Acentesi',
    emoji: '🛡️',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 45,
    fitoutCostPerM2: 2800,
    legalBasis: 'Sigorta Acenteleri Yönetmeliği Madde 9 (SEDDK 2026 Tebliği)',
    statutoryCapital: 4149275,
    mandatoryLegalItems: [
      { name: 'TOBB Sigorta Acenteleri Levha Kayıt Bedeli', cost: 85000, description: 'TOBB / SAİK resmi levha tescil harcı' },
      { name: 'Limited Şirket Kuruluşu & Sicil Gazetesi İlanı', cost: 42000, description: 'Ticaret Sicil Gazetesi ilanı ve noter tasdikleri' },
      { name: 'Mesleki Sorumluluk Sigortası (Yıllık Poliçe)', cost: 30000, description: 'SEDDK zorunlu mesleki teminat poliçesi' },
      { name: 'Belediye İşyeri Açma ve Çalışma Ruhsatı', cost: 14000, description: 'İlçe belediyesi ticari müessese harcı' },
      { name: 'İtfaiye Yangın & Tahliye Uygunluk Raporu', cost: 6500, description: 'Yangın güvenliği onay belgesi' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü & İlk Yardım Seti (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'archive_cab', name: 'Kilitli Ağır Hizmet Çelik Arşiv & Kıymetli Evrak Kasası', category: 'mandatory', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'SEDDK poliçe ve teminat evrakları güvenlik şartı.' },
      { id: 'pc_setup', name: 'Çift Monitörlü Acente Bilgisayarı (Intel i7 + UPS Kesintisiz Güç)', category: 'core_tech', unitCost: 34000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet', description: 'Çoklu ekran ekranlarında poliçe karşılaştırma iş istasyonu.' },
      { id: 'scanner_printer', name: 'Yüksek Hızlı Çok Fonksiyonlu Lazer Yazıcı & ADF Tarayıcı', category: 'core_tech', unitCost: 18500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cctv_kit', name: '4 Kameralı Gece Görüşlü NVR Güvenlik Kamera Sistemi', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', description: 'İşyeri güvenliği ve 30 günlük kayıt cihazı.' },
      { id: 'cash_drawer', name: 'Kilitli Para Çekmecesi & Sahte Para Dedektörü', category: 'core_tech', unitCost: 6500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'manager_desk', name: 'Yönetici & Acente Müdürü Makam Masası ve Koltuk Takımı', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'guest_lounge', name: 'Müşteri Karşılama ve Poliçe İnceleme Koltuk Grubu (İkili + 2 Berjer)', category: 'furniture', unitCost: 18500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', description: 'Müşteri ağırlama deri koltuk ve sehpa takımı.' },
      { id: 'file_cabinet', name: 'Kilitli Personel Dosya & Klasör Dolapları', category: 'furniture', unitCost: 8500, defaultQty: 2, minQty: 0, isLocked: false, unitLabel: 'Ünite' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU A+++)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
      { id: 'coffee_tea', name: 'Otomatik Çay & Çekirdek Kahve İkram Makinesi', category: 'appliances', unitCost: 9500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'water_dispenser', name: 'Arıtmalı Sıcak-Soğuk Su Sebili', category: 'appliances', unitCost: 6800, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'LED Işıklı Pleksi Kutu Harf Dış Cephe Tabelası', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 12000,
    initialInventoryDescription: 'Poliçe basım kağıtları, kurumsal dosya, kaşe, matbu evrak ve ofis kırtasiye başlangıç paketi.',
    softwareLicenseCost: { annual: 32000, monthlyMaintenance: 2400, name: 'Sigorta Acente Ekranları & Çoklu Teklif ERP Lisansı (Polisoft/Acente24)' },
    recommendedStaff: [
      { role: 'Teknik Müdür (4 Yıl Lisans + SEGEM + 2 Yıl Deneyim)', count: 1, avgSalary: 65000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Teknik Personel & Satış Uzmanı (SEGEM)', count: 1, avgSalary: 38000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Günlük Tanzim Edilen Poliçe Adedi', unitPrice: 3800, targetUnitsPerDay: 8, unitLabel: 'Poliçe / Gün' },
    revenueModel: {
      avgTicketPrice: 3800, // Ortalama Poliçe Primi (Trafik, Kasko, DASK, Konut, Sağlık karma)
      defaultDailyVolume: 8, // Günde 8 poliçe
      minDailyVolume: 2,
      maxDailyVolume: 35,
      unitLabel: 'Poliçe',
      grossMarginPercent: 11.5, // %11.5 Gerçekçi Sektörel Ağırlıklı Ortalama Brüt Komisyon
      daysPerMonth: 26,
      description: 'Trafik (%8-%10), Kasko (%13-%15), DASK (%12.5) ve Sağlık poliçelerinden oluşan ağırlıklı ortalama %11.5 acente komisyonu.'
    },
    monthlyUtilitiesEstimate: 5500,
    monthlyAccountingFee: 3200,
  },

  'emlak-gayrimenkul': {
    id: 'emlak-gayrimenkul',
    name: 'Emlak & Gayrimenkul Ofisi',
    emoji: '🏢',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 50,
    fitoutCostPerM2: 3000,
    legalBasis: 'Ticaret Bakanlığı Taşınmaz Ticareti Yönetmeliği',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Taşınmaz Ticareti Yetki Belgesi & Oda Tescili', cost: 28000, description: 'Ticaret İl Müdürlüğü yetkilendirme harçları' },
      { name: 'Şirket Kuruluş & Vergi Levhası Onayları', cost: 20000, description: 'Ticaret sicil ilanları' },
      { name: 'Belediye İşyeri Ruhsat Harcı', cost: 12000, description: 'Belediye açılış ruhsatı' }
    ],
    equipments: [
      { id: 'led_showcase', name: 'Işıklı Pleksi Cam İlan Vitrini Panoları (A4/A3 LED Askı Seti)', category: 'mandatory', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Taşınmaz Ticareti Yönetmeliği vitrin standartları.' },
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'meeting_table', name: 'Sözleşme & Müzakere Toplantı Masası Grubu (6 Kişilik)', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'consultant_desks', name: 'Danışman Çalışma Masası ve Koltuk Takımı', category: 'furniture', unitCost: 14000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'presentation_tv', name: '55 inç 4K Ultra HD Portföy & Proje Sunum Ekranı', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'office_pc', name: 'Ofis Bilgisayarı & Çok Fonksiyonlu Renkli Lazer Yazıcı', category: 'core_tech', unitCost: 32000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'guest_lounge', name: 'Müşteri Karşılama Lounge Koltuk Seti', category: 'furniture', unitCost: 16500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'safe_box', name: 'Çelik Para ve Tapu Evrak Kasası', category: 'core_tech', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'coffee_tea', name: 'Otomatik Çay & Kahve Makinesi & Su Sebili', category: 'appliances', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'led_signboard', name: 'LED Dış Cephe Işıklı Tabela & Kurumsal Cam Giydirme', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 8500,
    initialInventoryDescription: 'Sözleşme koçanları, yetki belgeleri, branda, afiş ve kurumsal kırtasiye seti.',
    softwareLicenseCost: { annual: 24000, monthlyMaintenance: 1800, name: 'Emlak Portalları Entegre CRM & Sözleşme Yönetim Paketi' },
    recommendedStaff: [
      { role: 'Sorumlu Emlak Danışmanı (Seviye 5 MYK)', count: 1, avgSalary: 50000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Saha Satış Danışmanı', count: 1, avgSalary: 32000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Aylık Kiralama & Satış İşlemi', unitPrice: 35000, targetUnitsPerDay: 0.25, unitLabel: 'İşlem / Ay' },
    revenueModel: {
      avgTicketPrice: 35000, // Kiralama veya satış başına ortalama komisyon geliri
      defaultDailyVolume: 0.25, // Ayda 6-7 işlem
      minDailyVolume: 0.1,
      maxDailyVolume: 1.5,
      unitLabel: 'İşlem',
      grossMarginPercent: 82, // Hizmet sektöründe brüt kar marjı
      daysPerMonth: 26,
      description: 'Konut ve ticari gayrimenkul kiralama ve satış aracılık hizmet bedeli.'
    },
    monthlyUtilitiesEstimate: 4800,
    monthlyAccountingFee: 3000,
  },

  'muhasebe-smmm': {
    id: 'muhasebe-smmm',
    name: 'Mali Müşavirlik & SMMM Bürosu',
    emoji: '📊',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 50,
    fitoutCostPerM2: 2800,
    legalBasis: '3568 Sayılı SMMM Kanunu & TÜRMOB Yönetmelikleri',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'SMMM Oda Giriş Harcı & Büro Tescil Belgesi', cost: 48000, description: 'İl SMMM Odası kayıt harçları' },
      { name: 'Şirket/Büro Kuruluş Masrafları', cost: 16000, description: 'Vergi levhası ve noter defter tasdikleri' }
    ],
    equipments: [
      { id: 'archive_system', name: 'Kilitli Çelik Mükellef Evrak Arşiv Dolapları', category: 'mandatory', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'TÜRMOB mükellef evrak gizliliği standardı.' },
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'scanner', name: 'Yüksek Hızlı Çift Taraflı ADF Belge Tarayıcı (Günde 5000 Sayfa)', category: 'core_tech', unitCost: 22500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'pc_setup', name: 'Müşavir Çift Ekranlı Muhasebe İş İstasyonları', category: 'core_tech', unitCost: 34000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'manager_desk', name: 'SMMM Yönetici Makam Masası & Deri Koltuk', category: 'furniture', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'guest_chairs', name: 'Mükellef Görüşme Koltukları & Sehpa Takımı', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'ups', name: 'Kesintisiz Güç Kaynağı (Online 3 kVA UPS)', category: 'core_tech', unitCost: 16500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'tea_water', name: 'Çay Makinesi & Arıtmalı Su Sebili', category: 'appliances', unitCost: 9500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'signboard', name: 'Pirinç / Pleksi Kurumsal Dış Tabela', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 9500,
    initialInventoryDescription: 'e-İmza tokenları, arşivleme klasörleri, fatura basım kağıtları ve kırtasiye stoku.',
    softwareLicenseCost: { annual: 36000, monthlyMaintenance: 2600, name: 'Bulut Müşavir Muhasebe Paketi & e-İmza Altyapısı (Luca/Zirve)' },
    recommendedStaff: [
      { role: 'SMMM Mesul Müdür', count: 1, avgSalary: 70000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Muhasebe Meslek Elemanı', count: 1, avgSalary: 36000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Aylık Aktif Defter Mükellefi', unitPrice: 2400, targetUnitsPerDay: 1.5, unitLabel: 'Mükellef / Ay' },
    revenueModel: {
      avgTicketPrice: 2400, // Mükellef başı aylık defter tutma bedeli
      defaultDailyVolume: 2.3, // ~60 aktif mükellef
      minDailyVolume: 0.5,
      maxDailyVolume: 6.0,
      unitLabel: 'Mükellef',
      grossMarginPercent: 80,
      daysPerMonth: 26,
      description: 'Aylık düzenli muhasebe, beyanname ve bordro danışmanlığı ücretleri.'
    },
    monthlyUtilitiesEstimate: 4500,
    monthlyAccountingFee: 0,
  },

  'hukuk-burosu': {
    id: 'hukuk-burosu',
    name: 'Hukuk & Avukatlık Bürosu',
    emoji: '⚖️',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 60,
    fitoutCostPerM2: 3400,
    legalBasis: '1136 Sayılı Avukatlık Kanunu & TBB Yönetmelikleri',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'Baro Levha Tescil & Giriş Harçları', cost: 42000, description: 'İl Barosu büro açılış tescili' },
      { name: 'Büro Vergi Açılış & Noter Giderleri', cost: 15000, description: 'Resmi tasdikler' }
    ],
    equipments: [
      { id: 'archive_steel', name: 'Dava Dosyaları Çelik Kilitli Arşivleme Dolap Sistemi', category: 'mandatory', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Baro müvekkil dosya gizliliği şartı.' },
      { id: 'fire_ext', name: 'Yangın Tüpü & İlk Yardım Seti', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'lawyer_desk', name: 'Klasik Avukat Makam Masası & Hakiki Deri Yönetici Koltuğu', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'meeting_suite', name: '8 Kişilik Müvekkil Müzakere & Arabuluculuk Toplantı Masası', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'library_cabinets', name: 'Ahşap Kütüphane Dolapları (Hukuk İçtihatları İçin)', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'pc_setup', name: 'UYAP Uyumlu e-İmza Terminalleri, PC ve Lazer Ağ Yazıcısı', category: 'core_tech', unitCost: 34000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'guest_berjer', name: 'Misafir Deri Berjer Takımı & Sehpa', category: 'furniture', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'coffee_machine', name: 'Çekirdek Kahve & Çay Makinesi & Su Sebili', category: 'appliances', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'brass_sign', name: 'Pirinç Dış Büro Tabelası', category: 'core_tech', unitCost: 15000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 11000,
    initialInventoryDescription: 'Dava dosyası gömlekleri, vekaletname evrakları, kurumsal antetli kağıt ve mühür.',
    softwareLicenseCost: { annual: 18000, monthlyMaintenance: 1300, name: 'UYAP Entegre İcra/Dava & İçtihat Otomasyonu' },
    recommendedStaff: [
      { role: 'Ruhsatlı Avukat', count: 1, avgSalary: 65000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Hukuk Katibi / Asistan', count: 1, avgSalary: 28000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Aylık Alınan Dava / Danışmanlık Dosyası', unitPrice: 22000, targetUnitsPerDay: 0.3, unitLabel: 'Dava / Ay' },
    revenueModel: {
      avgTicketPrice: 22000,
      defaultDailyVolume: 0.38, // Ayda 10 dava / danışmanlık
      minDailyVolume: 0.1,
      maxDailyVolume: 1.5,
      unitLabel: 'Dosya',
      grossMarginPercent: 82,
      daysPerMonth: 26,
      description: 'Dava vekalet ücretleri, icra takipleri ve aylık kurumsal danışmanlık sözleşmeleri.'
    },
    monthlyUtilitiesEstimate: 4800,
    monthlyAccountingFee: 2800,
  },

  'yazilim-ajans': {
    id: 'yazilim-ajans',
    name: 'Yazılım & Dijital Ajans',
    emoji: '💻',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 70,
    fitoutCostPerM2: 3200,
    legalBasis: 'Türk Ticaret Kanunu (Şirket Kuruluş Esasları)',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'Şirket Kuruluşu & Marka Tescil Başvurusu', cost: 26000, description: 'Ticaret odası ve TÜRKPATENT başvurusu' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'workstations', name: 'Ergonomik Yükseklik Ayarlı Geliştirici Masaları', category: 'furniture', unitCost: 14000, defaultQty: 4, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'ortho_chairs', name: 'Ortopedik Profesyonel Çalışma Koltukları', category: 'furniture', unitCost: 6500, defaultQty: 4, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'network_server', name: 'Gigabit Yönetilebilir Switch & Firewall Ağ Kabini', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'meeting_screen', name: '65 inç 4K Ultra HD Proje & Sunum Ekranı + Cam Yazı Tahtası', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'lounge_corner', name: 'Lounge Dinlenme Koltuk Takımı & Sehpa', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'coffee_bar', name: 'İtalyan Çekirdek Kahve Makinesi & Arıtmalı Su Sebili', category: 'appliances', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 6000,
    initialInventoryDescription: 'Sunucu kabloları, test cihazları ve ofis sarf malzemeleri.',
    softwareLicenseCost: { annual: 48000, monthlyMaintenance: 3800, name: 'Tasarım & Geliştirme Lisans Paketi (Adobe CC, Figma, Jira, AWS)' },
    recommendedStaff: [
      { role: 'Kıdemli Yazılım / Tasarım Uzmanı', count: 2, avgSalary: 75000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Aylık Tamamlanan Proje / Sprint', unitPrice: 55000, targetUnitsPerDay: 0.15, unitLabel: 'Proje / Ay' },
    revenueModel: {
      avgTicketPrice: 55000,
      defaultDailyVolume: 0.2, // Ayda 5-6 proje
      minDailyVolume: 0.05,
      maxDailyVolume: 1.0,
      unitLabel: 'Proje',
      grossMarginPercent: 70,
      daysPerMonth: 26,
      description: 'Web/Mobil yazılım geliştirme, bulut altyapı ve aylık dijital pazarlama yönetim hizmetleri.'
    },
    monthlyUtilitiesEstimate: 6500,
    monthlyAccountingFee: 3200,
  },

  // ================= 2. YEME - İÇME =================
  'kafe-kahve': {
    id: 'kafe-kahve',
    name: 'Kafe & 3. Nesil Kahveci',
    emoji: '☕',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 70,
    fitoutCostPerM2: 4800,
    legalBasis: '5996 Sayılı Veteriner Hizmetleri, Bitki Sağlığı, Gıda ve Yem Kanunu',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Tarım İlçe İşletme Kayıt & Hijyen Onayı', cost: 18000, description: 'Gıda satış ve üretim izni' },
      { name: 'İtfaiye Yangın & Baca Uygunluk Raporu', cost: 16000, description: 'Ruhsat denetimi' },
      { name: 'Belediye İşyeri Açma Ruhsatı', cost: 15000, description: 'İşyeri tescili' }
    ],
    equipments: [
      { id: 'hood_system', name: 'Endüstriyel Karbon Filtreli Davlumbaz & Havalandırma', category: 'mandatory', unitCost: 58000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'İtfaiye ve belediye hijyen şartı.' },
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpleri & İlk Yardım Kiti', category: 'mandatory', unitCost: 4500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'espresso_machine', name: '2 Gruplu Profesyonel Espresso Makinesi (İtalyan)', category: 'machinery', unitCost: 135000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'grinders', name: 'On-Demand Otomatik Espresso & Filtre Değirmenleri (2 Adet)', category: 'machinery', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ice_maker', name: 'Sanayi Tipi Paslanmaz Çelik Buz Makinesi (Günde 40kg)', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cake_cooler', name: 'Camlı Soğutmalı Pasta & Tatlı Teşhir Dolabı', category: 'appliances', unitCost: 45000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'bar_fridge', name: 'Tezgah Altı Şişe & Meşrubat Soğutucu Dolap', category: 'appliances', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'water_filter', name: 'Ters Ozmoz Endüstriyel Su Arıtma Sistemi (Mineral Ayarlı)', category: 'appliances', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'dish_washer', name: 'Sanayi Tipi 2 Dakikalık Hızlı Bulaşık Makinesi', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cafe_furniture', name: '4 Kişilik Masif Ahşap & Metal Kafe Masa-Sandalye Takımları', category: 'furniture', unitCost: 9500, defaultQty: 8, minQty: 2, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 9 },
      { id: 'pos_cash', name: 'Restoran Bulut Dokunmatik POS, Para Çekmecesi & Barkod Okuyucu', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'sound_system', name: 'Tavan Tipi Homojen Ambiyans Müzik Ses Sistemi', category: 'core_tech', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Salon Tipi Ticari Inverter Klima (24.000 BTU)', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'Dış Cephe Işıklı Kutu Harf Tabela & Tente Gölgelendirme', category: 'core_tech', unitCost: 32000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 75000,
    initialInventoryDescription: 'Nitelikli çekirdek kahveler, bitkisel/özel sütler, şuruplar, karton bardaklar, pasta ve tatlı ilk hammadde stoku.',
    softwareLicenseCost: { annual: 18000, monthlyMaintenance: 1400, name: 'Restoran Bulut POS & QR Menü Adisyon Otomasyonu' },
    recommendedStaff: [
      { role: 'Barista / Mutfak Sorumlusu', count: 2, avgSalary: 35000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Servis Personeli', count: 1, avgSalary: 26000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Günlük Kahve & Tatlı Siparişi', unitPrice: 220, targetUnitsPerDay: 70, unitLabel: 'Sipariş / Gün' },
    revenueModel: {
      avgTicketPrice: 220, // Ortalama adisyon tutarı (Kahve + Tatlı)
      defaultDailyVolume: 90, // Günde 90 müşteri
      minDailyVolume: 30,
      maxDailyVolume: 300,
      unitLabel: 'Müşteri',
      grossMarginPercent: 62, // %62 Gerçekçi Kahve & Yeme-İçme Brüt Marjı
      daysPerMonth: 30,
      description: 'Nitelikli kahve, soğuk içecekler, kruvasan ve taze pasta satışlarından oluşan ortalama sipariş.'
    },
    monthlyUtilitiesEstimate: 14000,
    monthlyAccountingFee: 3200,
  },

  'restoran-lokanta': {
    id: 'restoran-lokanta',
    name: 'Restoran & Lokanta',
    emoji: '🍽️',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 120,
    fitoutCostPerM2: 5800,
    legalBasis: 'Gıda Hijyen Yönetmeliği & İtfaiye Yangın Proje Esasları',
    statutoryCapital: 150000,
    mandatoryLegalItems: [
      { name: 'Sulu Filtreli Baca & Çatı Çıkış Onayı', cost: 48000, description: 'Belediye çevre müdürlüğü baca projesi' },
      { name: 'Gıda Sicil & İşyeri Açma Harcı', cost: 24000, description: 'Ruhsatlandırma' },
      { name: 'Yangın Söndürme Tesisat Projesi', cost: 18000, description: 'İtfaiye onay harçları' }
    ],
    equipments: [
      { id: 'water_hood', name: 'Sulu Sistem Endüstriyel Davlumbaz & Karbon Filtre', category: 'mandatory', unitCost: 98000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'İtfaiye ve çevre duman tahliye şartı.' },
      { id: 'hood_fire', name: 'Davlumbaz İçi Otomatik Yangın Söndürme Nozul Kiti', category: 'mandatory', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem' },
      { id: 'cooker_4', name: '4 Gözlü Sanayi Tipi Kuzine & Gazlı Döküm Ocaklar', category: 'machinery', unitCost: 72000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'deep_fryer', name: 'Endüstriyel Çift Sepetli Fritöz (2x10L)', category: 'machinery', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'deep_freeze', name: 'Sanayi Tipi Çift Kapılı Paslanmaz Dik Soğutucu ve Dondurucu', category: 'appliances', unitCost: 65000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'prep_tables', name: 'Paslanmaz Çelik Hazırlık Tezgahları & Evyeler (3 Adet)', category: 'furniture', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'dish_guillotine', name: 'Giyotin Tip Sanayi Bulaşık Makinesi', category: 'appliances', unitCost: 48000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'tableware_set', name: 'Porselen Tabak, Çatal-Bıçak, Bardak ve Servis Ekipmanları Seti', category: 'furniture', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Full Set' },
      { id: 'dining_tables', name: '4 Kişilik Restoran Masaları ve Konforlu Döşemeli Sandalyeler', category: 'furniture', unitCost: 12000, defaultQty: 12, minQty: 4, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 9 },
      { id: 'kds_pos', name: 'Mutfak KDS Ekranı, Garson El Terminalleri & Ana POS Kasası', category: 'core_tech', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'safe_box', name: 'Kilitli Çelik Kasa & Sahte Para Dedektörü', category: 'core_tech', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_salon', name: 'Salon Tipi Güçlü Inverter Klima (28.000 BTU)', category: 'appliances', unitCost: 44000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_facade', name: 'Dış Cephe LED Işıklı Tabela & Karşılama Bankosu', category: 'core_tech', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 135000,
    initialInventoryDescription: 'Karkas et, sıvı yağ, bakliyat, un, sebze, baharat, meşrubat ve paket servis ambalaj stoku.',
    softwareLicenseCost: { annual: 26000, monthlyMaintenance: 2100, name: 'Mutfak KDS Ekranı & Garson El Terminali Restoran ERP' },
    recommendedStaff: [
      { role: 'Mutfak Şefi / Aşçı', count: 1, avgSalary: 55000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Aşçı Yardımcısı & Bulaşıkçı', count: 2, avgSalary: 28000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Günlük Ana Yemek Porsiyonu', unitPrice: 380, targetUnitsPerDay: 60, unitLabel: 'Porsiyon / Gün' },
    revenueModel: {
      avgTicketPrice: 380,
      defaultDailyVolume: 85,
      minDailyVolume: 25,
      maxDailyVolume: 250,
      unitLabel: 'Müşteri',
      grossMarginPercent: 50, // %50 Gerçekçi Restoran Gıda Marjı
      daysPerMonth: 30,
      description: 'Öğle ve akşam servisi ana yemek, içecek ve meze siparişlerinin kişi başı ortalama tutarı.'
    },
    monthlyUtilitiesEstimate: 24000,
    monthlyAccountingFee: 3800,
  },

  'donerci-kebapci': {
    id: 'donerci-kebapci',
    name: 'Dönerci & Fast-Food Kebap',
    emoji: '🥙',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 85,
    fitoutCostPerM2: 5000,
    legalBasis: 'İşyeri Açma ve Çalışma Ruhsatlarına İlişkin Yönetmelik',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Müstakil Baca Çatı Tahliye Uygunluğu', cost: 42000, description: 'Duman tahliye proje izni' },
      { name: 'Belediye Ruhsat & Hijyen Harçları', cost: 20000, description: 'İşyeri ruhsatı' }
    ],
    equipments: [
      { id: 'hood_system', name: 'Sulu Filtreli Davlumbaz & Çatı Tahliye Bacası', category: 'mandatory', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem' },
      { id: 'doner_burner', name: '4 Radyanlı Motorlu Gazlı Döner Ocağı & Otomatik Bıçak/Robot', category: 'machinery', unitCost: 54000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'fryer_toast', name: 'Sanayi Tipi Çiftli Fritöz & Döküm Tost Makinesi', category: 'machinery', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'salad_bar', name: 'Soğutmalı Salata Barı ve Meze Tezgahı', category: 'appliances', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'beverage_cooler', name: 'Dik Camlı Meşrubat & Ayran Soğutma Dolabı', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'tables_set', name: 'Dönerci Masa & Sandalye Takımları (4 Kişilik)', category: 'furniture', unitCost: 8500, defaultQty: 8, minQty: 2, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 10 },
      { id: 'pos_cash', name: 'Dokunmatik Paket Servis POS Terminali & Para Çekmecesi', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'Dış LED Işıklı Tabela & Karşılama Teşhiri', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 95000,
    initialInventoryDescription: 'Yaprak et/tavuk döner takımı, lavaş, ekmek, patates, soslar ve ambalaj malzemeleri.',
    softwareLicenseCost: { annual: 16000, monthlyMaintenance: 1200, name: 'Paket Servis & Hızlı Sipariş POS Otomasyonu' },
    recommendedStaff: [
      { role: 'Döner Ustası', count: 1, avgSalary: 52000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Paket / Kurye Personeli', count: 2, avgSalary: 28000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Günlük Döner & Dürüm Porsiyonu', unitPrice: 260, targetUnitsPerDay: 75, unitLabel: 'Dürüm / Gün' },
    revenueModel: {
      avgTicketPrice: 260,
      defaultDailyVolume: 120,
      minDailyVolume: 40,
      maxDailyVolume: 350,
      unitLabel: 'Porsiyon',
      grossMarginPercent: 48, // %48 Döner Fast-Food Brüt Marjı
      daysPerMonth: 30,
      description: 'Et/Tavuk döner dürüm, porsiyon, patates ve içecekten oluşan hızlı tüketim siparişleri.'
    },
    monthlyUtilitiesEstimate: 18000,
    monthlyAccountingFee: 3200,
  },

  'cigkofte-subesi': {
    id: 'cigkofte-subesi',
    name: 'Çiğköfte & Hızlı Dürüm Şubesi',
    emoji: '🌯',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 35,
    fitoutCostPerM2: 3000,
    legalBasis: 'Belediye 3. Sınıf Gayrisıhhi Müessese Yönetmeliği',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'Gıda Satış Sicil & Belediye Harçları', cost: 14000, description: 'İşletme tescil onayı' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'cigkofte_counter', name: 'Camlı, LED Işıklı & Statik Soğutmalı Çiğköfte Sunum Tezgahı', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'drink_cooler', name: 'Dik Camlı Meşrubat & Ayran Soğutma Dolabı', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'tables_chairs', name: '4 Kişilik Kompakt Çiğköfte Masa & Sandalye Takımları', category: 'furniture', unitCost: 7500, defaultQty: 3, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'pos_cash', name: 'Dokunmatik Hızlı Satış POS Terminali & Kilitli Para Çekmecesi', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'tea_samovar', name: 'Endüstriyel Çay Otomatı / Semaver', category: 'appliances', unitCost: 6500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (12.000 BTU)', category: 'appliances', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cctv_kit', name: '4 Kameralı Gece Görüşlü Güvenlik Sistemi', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'led_signboard', name: 'Dış Cephe LED Işıklı Çiğköfte Tabelası & Cam Giydirme', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 40000,
    initialInventoryDescription: 'İlk çiğköfte partisi, lavaşlar, yeşillikler, nar ekşisi, soslar ve servis ambalajları.',
    softwareLicenseCost: { annual: 9500, monthlyMaintenance: 750, name: 'Hızlı Paketleme & Barkodlu POS Terminali' },
    recommendedStaff: [
      { role: 'Usta / Dürüm Hazırlama Personeli', count: 1, avgSalary: 32000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Porsiyon / Dürüm Satışı', unitPrice: 140, targetUnitsPerDay: 60, unitLabel: 'Dürüm / Gün' },
    revenueModel: {
      avgTicketPrice: 140,
      defaultDailyVolume: 95,
      minDailyVolume: 30,
      maxDailyVolume: 250,
      unitLabel: 'Sipariş',
      grossMarginPercent: 48, // %48 Çiğköfte Perakende Brüt Marjı
      daysPerMonth: 30,
      description: 'Dürüm ve kilo ile çiğköfte paket satışları.'
    },
    monthlyUtilitiesEstimate: 5800,
    monthlyAccountingFee: 2400,
  },

  'firin-unlu-mamuller': {
    id: 'firin-unlu-mamuller',
    name: 'Fırın & Unlu Mamüller',
    emoji: '🥖',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 110,
    fitoutCostPerM2: 5500,
    legalBasis: 'Sanayi Kapasite Raporu & Ekmek Üretim Tebliği',
    statutoryCapital: 200000,
    mandatoryLegalItems: [
      { name: 'Kapasite Raporu & Sanayi Elektriği Proje İzni', cost: 45000, description: 'Sanayi İl Müdürlüğü tescili' },
      { name: 'Gıda Üretim İzin Harçları', cost: 26000, description: 'Tarım Bakanlığı kayıt' }
    ],
    equipments: [
      { id: 'deck_oven', name: 'Katlı Taş Tabanlı / Döner Arabalı Ekmek & Pasta Fırını', category: 'machinery', unitCost: 195000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'spiral_mixer', name: '50kg Spiral Hamur Yoğurma Kazanı & Yuvarlama Makinesi', category: 'machinery', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'heated_counter', name: 'Isıtmalı Camlı Börek, Poğaça & Simit Teşhir Tezgahları', category: 'furniture', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'cake_cooler', name: 'Soğutmalı Yaş Pasta & Sütlü Tatlı Teşhir Dolabı', category: 'appliances', unitCost: 45000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'bread_slicer', name: 'Ekmek Dilimleme Makinesi & Terazi Entegre Hızlı POS', category: 'machinery', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'tea_service', name: 'Çay/Kahve İkram Tezgahı & Oturma Masaları', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'Dış Cephe Işıklı Tabela & Aydınlatma Spotları', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 110000,
    initialInventoryDescription: 'Un çuvalları, maya, susam, yağ, şeker, peynir, kıyma ve fırın ambalaj stoku.',
    softwareLicenseCost: { annual: 14000, monthlyMaintenance: 1100, name: 'Terazi Entegre Hızlı Kasa & Üretim Takip Yazılımı' },
    recommendedStaff: [
      { role: 'Fırın & Hamurkar Ustası', count: 1, avgSalary: 58000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Satış / Kasa Elemanı', count: 2, avgSalary: 26000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Günlük Ekmek & Unlu Mamul Satışı', unitPrice: 65, targetUnitsPerDay: 380, unitLabel: 'Fiş / Gün' },
    revenueModel: {
      avgTicketPrice: 65,
      defaultDailyVolume: 420,
      minDailyVolume: 150,
      maxDailyVolume: 900,
      unitLabel: 'Müşteri',
      grossMarginPercent: 54, // %54 Unlu Mamul Brüt Marjı
      daysPerMonth: 30,
      description: 'Ekmek, simit, poğaça, börek ve unlu mamul perakende tezgah satışları.'
    },
    monthlyUtilitiesEstimate: 26000,
    monthlyAccountingFee: 3600,
  },

  // ================= 3. KİŞİSEL BAKIM & SAĞLIK =================
  'eczane-medikal': {
    id: 'eczane-medikal',
    name: 'Eczane',
    emoji: '💊',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 75,
    fitoutCostPerM2: 4800,
    legalBasis: '6197 Sayılı Eczacılar ve Eczaneler Hakkında Kanun (TİTCK)',
    statutoryCapital: 250000,
    mandatoryLegalItems: [
      { name: 'Sağlık Bakanlığı Eczane Açılış Ruhsatı', cost: 48000, description: 'İl Sağlık Müdürlüğü uygunluk harcı' },
      { name: 'Eczacı Odası Kayıt & Tescil Bedeli', cost: 26000, description: 'Resmi oda tescili' }
    ],
    equipments: [
      { id: 'pharma_fridge', name: 'Dijital Dereceli Aşı ve İlaç Buzdolabı (+2°C / +8°C)', category: 'mandatory', unitCost: 52000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Bakanlık soğuk zincir aşı ve ilaç saklama standardı.' },
      { id: 'safe_red', name: 'Kilitli Çelik Kırmızı & Yeşil Reçete Kasası', category: 'mandatory', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Uyuşturucu ve psikotrop ilaçlar kilitli kasada tutulmalıdır.' },
      { id: 'lab_set', name: 'Majistral Laboratuvar Tezgahı, Hassas Terazi & Saf Su Kiti', category: 'mandatory', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Majistral ilaç hazırlama alanı yasal zorunludur.' },
      { id: 'pharma_drawers', name: 'Kademeli Raylı İlaç Çekmece Blokları (24 Çekmeceli Sistem)', category: 'furniture', unitCost: 115000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem' },
      { id: 'display_shelves', name: 'LED Aydınlatmalı Cam Eczane Teşhir Dolapları & Gondol Raflar', category: 'furniture', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem' },
      { id: 'service_counter', name: 'Eczane Reçete Karşılama ve Hasta Danışmanlık Bankosu (2 Kişilik)', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'weigh_station', name: 'Boy-Kilo Ölçerli Dijital Eczane Baskülü & Otomatik Tansiyon Aleti', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'pc_medula', name: 'TEB Medula Uyumlu 2x PC, Barkod Okuyucu ve Reçete Yazıcıları', category: 'core_tech', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ups_pharma', name: 'Kesintisiz Güç Kaynağı (Online 3 kVA UPS)', category: 'core_tech', unitCost: 16500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'patient_chairs', name: 'Müşteri Bekleme Deri Koltuk Grubu', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'e_logo_sign', name: 'Standart LED Işıklı Eczane "E" Logosu & Dış Işıklı Tabela', category: 'core_tech', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Sağlık Bakanlığı standart Eczane ve E logosu zorunluluğu.' },
      { id: 'cctv_kit', name: '8 Kameralı Gece Görüşlü NVR Güvenlik Sistemi', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 580000,
    initialInventoryDescription: 'Ecza deposundan ilk ruhsatlı reçeteli ilaçlar, OTC vitaminler, dermokozmetik, bebek maması ve medikal ilk ürün stok paketi.',
    softwareLicenseCost: { annual: 26000, monthlyMaintenance: 1900, name: 'TEB Medula & İTS İlaç Takip Sistemi Otomasyonu' },
    recommendedStaff: [
      { role: 'Mesul Müdür Eczacı', count: 1, avgSalary: 75000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Eczane Teknisyeni / Kalfası', count: 2, avgSalary: 36000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Günlük Reçete & OTC Satış Adedi', unitPrice: 420, targetUnitsPerDay: 75, unitLabel: 'Reçete / Gün' },
    revenueModel: {
      avgTicketPrice: 420, // Reçete + OTC ortalama sepet
      defaultDailyVolume: 90, // Günde 90 işlem
      minDailyVolume: 35,
      maxDailyVolume: 220,
      unitLabel: 'Hasta / Reçete',
      grossMarginPercent: 24, // %24 İlaç Fiyat Kararnamesi kademeli eczacı brüt marjı
      daysPerMonth: 26,
      description: 'SGK reçeteli ilaçlar, OTC gıda takviyeleri, dermokozmetik ve medikal ürün satışları.'
    },
    monthlyUtilitiesEstimate: 7500,
    monthlyAccountingFee: 3200,
  },

  'kuafor-guzellik': {
    id: 'kuafor-guzellik',
    name: 'Kuaför & Güzellik Merkezi',
    emoji: '💇‍♀️',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 80,
    fitoutCostPerM2: 4000,
    legalBasis: 'MEB Ustalık Mevzuatı & Güzellik Salonları Yönetmeliği',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Ustalık Belgesi Tescil & Esnaf Odası Harcı', cost: 24000, description: 'Ruhsat şartı' },
      { name: 'Belediye Çevre Hijyen & Açılış İzni', cost: 15000, description: 'Gayrisıhhi müessese harcı' }
    ],
    equipments: [
      { id: 'ventilation', name: 'Özel Kimyasal Koku Tahliye Havalandırması', category: 'mandatory', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'Kuaför kimyasal buhar tahliye zorunluluğu.' },
      { id: 'autoclave', name: 'B Tipi Otoklav / UV Alet Sterilizatörü', category: 'mandatory', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Alet sterilizasyon şartı.' },
      { id: 'hair_stations', name: 'Hidrolik Kuaför Koltukları & Aynalı LED Işıklı Tezgah Takımları', category: 'furniture', unitCost: 24000, defaultQty: 3, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 25 },
      { id: 'wash_station', name: 'Seramik Masajlı Saç Yıkama Koltukları', category: 'furniture', unitCost: 28000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'hair_dryers', name: 'Ayaklı Vapozon Buhar Makinesi & Profesyonel Fön Makineleri Seti', category: 'machinery', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'beauty_bed', name: 'Cilt Bakım & Ağda/Lazer Odası Yatağı ve Taburesi', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'lounge_chairs', name: 'Müşteri Bekleme Lounge Koltukları & Çay/Kahve İkram Barı', category: 'furniture', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'pos_cash', name: 'Randevu POS Terminali & Kilitli Para Kasası', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'LED Işıklı Mağaza Tabelası & Vitrin Görselleri', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 52000,
    initialInventoryDescription: 'Profesyonel saç boyaları, açıcılar, keratin bakım setleri, şampuanlar, sir ağda ve tek kullanımlık havlu stoku.',
    softwareLicenseCost: { annual: 12000, monthlyMaintenance: 950, name: 'Salon Randevu, Müşteri Sadakat & SMS CRM Paketi' },
    recommendedStaff: [
      { role: 'Usta Kuaför / Uzman Estetisyen', count: 2, avgSalary: 42000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Yardımcı / Kalfa', count: 1, avgSalary: 26000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Günlük Hizmet Verilen Müşteri', unitPrice: 950, targetUnitsPerDay: 12, unitLabel: 'Müşteri / Gün' },
    revenueModel: {
      avgTicketPrice: 950,
      defaultDailyVolume: 16,
      minDailyVolume: 5,
      maxDailyVolume: 40,
      unitLabel: 'Müşteri',
      grossMarginPercent: 68, // %68 Hizmet & Kozmetik Brüt Marjı
      daysPerMonth: 26,
      description: 'Saç kesim, renklendirme, ombre, keratin bakım, manikür/pedikür ve cilt bakımı seansları.'
    },
    monthlyUtilitiesEstimate: 8500,
    monthlyAccountingFee: 2800,
  },

  'dis-klinigi': {
    id: 'dis-klinigi',
    name: 'Diş Kliniği & Muayenehane',
    emoji: '🦷',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 100,
    fitoutCostPerM2: 6200,
    legalBasis: 'Ağız ve Diş Sağlığı Hizmeti Sunulan Özel Sağlık Kuruluşları Yönetmeliği',
    statutoryCapital: 300000,
    mandatoryLegalItems: [
      { name: 'İl Sağlık Müdürlüğü Klinik Ruhsatı & Tescil', cost: 58000, description: 'Sağlık Bakanlığı onay harçları' },
      { name: 'Kurşun Kaplama Radyasyon Güvenlik Raporu (TAEK/TENMAK)', cost: 32000, description: 'Röntgen odası lisansı' }
    ],
    equipments: [
      { id: 'dental_unit', name: 'Entegre Diş Hekimi Koltuk Üniti, Reflektör & Kreşuar', category: 'machinery', unitCost: 260000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'autoclave_med', name: 'B Sınıfı Vakumlu Medikal Otoklav & Paketleme Cihazı', category: 'mandatory', unitCost: 52000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Tıbbi aletlerin sterilizasyonu için zorunlu cihaz.' },
      { id: 'air_compressor', name: 'Medikal Yağsız ve Sessiz Hava Kompresörü & Aspiratör', category: 'mandatory', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'lead_lining', name: 'Kurşun Kaplama Duvar Panelleri & Koruma Önlükleri', category: 'mandatory', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Radyasyon güvenliği standardı.' },
      { id: 'stools_cabinets', name: 'Hekim Tabureleri & Tıbbi Paslanmaz Çekmece Dolapları', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'reception_lounge', name: 'Hasta Karşılama Bankosu, Bekleme Koltukları & 55 inç TV', category: 'furniture', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'signboard', name: 'Kurumsal Klinik Dış Tabelası', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 150000,
    initialInventoryDescription: 'Kompozit dolgu setleri, kanal eğeleri, ölçü maddeleri, anestezi ampulleri, cerrahi eldiven ve steril sarf malzeme ilk stoku.',
    softwareLicenseCost: { annual: 24000, monthlyMaintenance: 1800, name: 'Dental Klinik Yönetim & Dijital Hasta Takip Sistemi' },
    recommendedStaff: [
      { role: 'Diş Hekimi (Mesul Müdür)', count: 1, avgSalary: 85000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Ağız ve Diş Sağlığı Teknikeri', count: 1, avgSalary: 36000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Günlük Tedavi & Dolgu / Bakım Sayısı', unitPrice: 2200, targetUnitsPerDay: 4, unitLabel: 'Hasta / Gün' },
    revenueModel: {
      avgTicketPrice: 2200,
      defaultDailyVolume: 6,
      minDailyVolume: 2,
      maxDailyVolume: 16,
      unitLabel: 'Hasta',
      grossMarginPercent: 62,
      daysPerMonth: 26,
      description: 'Dolgu, kanal tedavisi, diş temizliği, protez ve estetik diş hekimliği uygulamaları.'
    },
    monthlyUtilitiesEstimate: 9500,
    monthlyAccountingFee: 3600,
  },

  'optik-magazasi': {
    id: 'optik-magazasi',
    name: 'Optik & Gözlük Mağazası',
    emoji: '👓',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 60,
    fitoutCostPerM2: 4500,
    legalBasis: '5193 Sayılı Optisyenlik Hakkında Kanun',
    statutoryCapital: 150000,
    mandatoryLegalItems: [
      { name: 'Sağlık Bakanlığı Optisyenlik Müessese Ruhsatı', cost: 38000, description: 'İl Sağlık Müdürlüğü tescili' }
    ],
    equipments: [
      { id: 'lensmeter', name: 'Dijital Odaklama Cihazı (Fokometre)', category: 'mandatory', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: '5193 Sayılı Kanun gereği zorunlu cihaz.' },
      { id: 'lens_edger', name: 'Otomatik Cam Kesim & Kanal Açma Makinesi', category: 'machinery', unitCost: 175000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'display_cabinets', name: 'Kilitli & LED Aydınlatmalı Gözlük Teşhir Vitrinleri & Aynalar', category: 'furniture', unitCost: 75000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem' },
      { id: 'trial_tables', name: 'Gözlük Deneme Masaları ve Deri Koltuklar', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'pos_medula', name: 'Medula Optik Entegre Bilgisayar & Barkod Okuyucu', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'Optik Işıklı Dış Tabela & Vitrin Spotları', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 240000,
    initialInventoryDescription: 'Optik reçeteli çerçeveler, güneş gözlükleri, hazır stok camlar, kontak lensler ve solüsyon ilk stok paketi.',
    softwareLicenseCost: { annual: 16000, monthlyMaintenance: 1200, name: 'Optik Medula & ÜTS Ürün Takip Sistemi Yazılımı' },
    recommendedStaff: [
      { role: 'Mesul Müdür Optisyen', count: 1, avgSalary: 55000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Satış Danışmanı', count: 1, avgSalary: 30000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Günlük Gözlük & Cam Satış Adedi', unitPrice: 2400, targetUnitsPerDay: 3, unitLabel: 'Gözlük / Gün' },
    revenueModel: {
      avgTicketPrice: 2400,
      defaultDailyVolume: 5,
      minDailyVolume: 1,
      maxDailyVolume: 15,
      unitLabel: 'Müşteri',
      grossMarginPercent: 48,
      daysPerMonth: 26,
      description: 'Reçeteli optik cam/çerçeve, güneş gözlüğü ve kontak lens paket satışları.'
    },
    monthlyUtilitiesEstimate: 5200,
    monthlyAccountingFee: 3000,
  },

  'pilates-yoga': {
    id: 'pilates-yoga',
    name: 'Pilates, Yoga & PT Stüdyosu',
    emoji: '🧘‍♀️',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 80,
    fitoutCostPerM2: 3800,
    legalBasis: 'Özel Beden Eğitimi ve Spor Tesisleri Yönetmeliği',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'Gençlik ve Spor İl Müdürlüğü Tesis İzni', cost: 26000, description: 'Antrenörlük belgesi ve tesis uygunluğu' }
    ],
    equipments: [
      { id: 'fire_firstaid', name: 'Yangın Tüpü & İlk Yardım Seti', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Tesis güvenlik şartı.' },
      { id: 'reformer', name: 'Ahşap Reformer & Tower/Cadillac Pilates Aleti', category: 'machinery', unitCost: 46000, defaultQty: 4, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'mat_props', name: 'Matlar, Direnç Bantları, Toplar & Yoga Blokları Seti', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'wall_mirrors', name: 'Boydan Boya Güvenli Pilates/Dans Aynaları (Duvar Kaplama)', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem' },
      { id: 'lockers', name: 'Soyunma Odası Kilitli Çelik Dolapları', category: 'furniture', unitCost: 16000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'turnstile_pos', name: 'Turnike / Kartlı Geçiş ve Üye Takip Bilgisayarı', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'sound_ac', name: 'Ambiyans Ses Sistemi & Inverter Klima (24.000 BTU)', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 16000,
    initialInventoryDescription: 'Pilates çorapları, matlar, direnç bantları ve dezenfektan havlu sarf malzemeleri.',
    softwareLicenseCost: { annual: 11000, monthlyMaintenance: 850, name: 'Üye Takip, Turnike & Online Ders Rezervasyon Yazılımı' },
    recommendedStaff: [
      { role: 'Sertifikalı Pilates/Yoga Eğitmeni', count: 2, avgSalary: 38000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Aylık Aktif Paket Alan Üye Sayısı', unitPrice: 3800, targetUnitsPerDay: 1.2, unitLabel: 'Üye / Ay' },
    revenueModel: {
      avgTicketPrice: 3800, // 8 Seanslık Aylık Reformer Paketi
      defaultDailyVolume: 2.2, // ~55 aktif paket
      minDailyVolume: 0.5,
      maxDailyVolume: 6.0,
      unitLabel: 'Üye Paketi',
      grossMarginPercent: 78,
      daysPerMonth: 26,
      description: 'Birebir PT dersleri, düet reformer seansları ve aylık mat yoga üyelikleri.'
    },
    monthlyUtilitiesEstimate: 5500,
    monthlyAccountingFee: 2600,
  },

  // ================= 4. PERAKENDE & MAĞAZACILIK =================
  'market-bakkal': {
    id: 'market-bakkal',
    name: 'Market & Mini Süpermarket',
    emoji: '🛒',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 100,
    fitoutCostPerM2: 3400,
    legalBasis: 'Ticari İşyeri Açma ve TAPDK Tütün-Alkol Mevzuatı',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'TAPDK Belgesi & Belediye İşyeri Ruhsatı', cost: 28000, description: 'Ruhsat ve tütün satış izinleri' }
    ],
    equipments: [
      { id: 'cam_system', name: '8 Kanallı Gece Görüşlü NVR Güvenlik Kamera Sistemi', category: 'mandatory', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'İşyeri güvenlik standardı.' },
      { id: 'dairy_cooler', name: '3 Metre Sütlük & Şarküteri Soğutma Dolabı', category: 'appliances', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'deep_freeze_ugur', name: 'Camlı Dondurma ve Donuk Gıda Derin Dondurucu', category: 'appliances', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'shelves', name: 'Ağır Hizmet Duvar ve Orta Market Rafları', category: 'furniture', unitCost: 18000, defaultQty: 8, minQty: 2, isLocked: false, unitLabel: 'Ünite', scalesWithM2: true, m2Ratio: 12 },
      { id: 'pos_scale', name: 'Barkod Okuyuculu Dokunmatik Kasa Bankosu, Terazi & Para Çekmecesi', category: 'core_tech', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'rfid_gates', name: 'Manyetik Ürün Güvenlik Kapı Antenleri', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'Dış Cephe Işıklı Tabela & Spot Aydınlatma', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 310000,
    initialInventoryDescription: 'Kuru gıda, süt ve süt ürünleri, içecek, temizlik, bisküvi, şarküteri ve temel tüketim maddeleri ilk reyon dolumu.',
    softwareLicenseCost: { annual: 16000, monthlyMaintenance: 1200, name: 'Market Hızlı Barkod Satış, Terazi & Stok ERP' },
    recommendedStaff: [
      { role: 'Kasiyer & Reyon Elemanı', count: 2, avgSalary: 28000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Market Kasa Fiş Sayısı', unitPrice: 190, targetUnitsPerDay: 95, unitLabel: 'Fiş / Gün' },
    revenueModel: {
      avgTicketPrice: 190,
      defaultDailyVolume: 160,
      minDailyVolume: 50,
      maxDailyVolume: 400,
      unitLabel: 'Müşteri / Fiş',
      grossMarginPercent: 19, // %19 Hızlı Tüketim & Tekel Ortalama Brüt Marjı
      daysPerMonth: 30,
      description: 'Gıda, şarküteri, temizlik ve günlük temel tüketim ürünleri kasa satışları.'
    },
    monthlyUtilitiesEstimate: 16000,
    monthlyAccountingFee: 3200,
  },

  'butik-giyim': {
    id: 'butik-giyim',
    name: 'Butik Giyim & Moda Mağazası',
    emoji: '👗',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 75,
    fitoutCostPerM2: 3800,
    legalBasis: 'Ticaret Odası Esnaf Sicil & Fiyat Etiketi Tebliği',
    statutoryCapital: 75000,
    mandatoryLegalItems: [
      { name: 'Ticaret Sicil & Belediye Açılış Harçları', cost: 20000, description: 'İşyeri tescili' }
    ],
    equipments: [
      { id: 'rfid_gates', name: 'Manyetik Ürün Güvenlik Kapı Antenleri & 2000 Adet Alarm Butonu', category: 'mandatory', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Mağaza ürün koruma standardı.' },
      { id: 'hanger_stands', name: 'Özel Tasarım Işıklı Askılık ve Raf Duvar Üniteleri & Orta Masalar', category: 'furniture', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem' },
      { id: 'fitting_room', name: 'Aynalı ve LED Aydınlatmalı Prova Kabinleri (Perdeli/Kapılı)', category: 'furniture', unitCost: 16000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'mannequins', name: 'Vitrin Mankenleri (Full Beden Bayan/Erkek - 4 Adet)', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'pos_cash', name: 'Kasa Masası, Varyantlı Barkod Okuyucu & Para Çekmecesi', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'steamer', name: 'Sanayi Tipi Askılı Buharlı Kıyafet Ütüsü', category: 'appliances', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'Işıklı Kutu Harf Butik Tabelası & Vitrin Spotları', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 180000,
    initialInventoryDescription: 'İlk sezon koleksiyonu (Elbise, ceket, pantolon, gömlek, çanta, kemer ve aksesuar askı stoku).',
    softwareLicenseCost: { annual: 14000, monthlyMaintenance: 1100, name: 'Renk / Beden Varyantlı Mağazacılık Barkod Programı' },
    recommendedStaff: [
      { role: 'Mağaza Satış Sorumlusu', count: 2, avgSalary: 28000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Parça Kıyafet Satışı', unitPrice: 850, targetUnitsPerDay: 10, unitLabel: 'Parça / Gün' },
    revenueModel: {
      avgTicketPrice: 850,
      defaultDailyVolume: 18,
      minDailyVolume: 5,
      maxDailyVolume: 50,
      unitLabel: 'Müşteri',
      grossMarginPercent: 46, // %46 Hazır Giyim Brüt Marjı
      daysPerMonth: 26,
      description: 'Kadın/Erkek hazır giyim, ceket, elbise ve tamamlayıcı aksesuar satışları.'
    },
    monthlyUtilitiesEstimate: 5200,
    monthlyAccountingFee: 2800,
  },

  'petshop-urunleri': {
    id: 'petshop-urunleri',
    name: 'Petshop & Evcil Hayvan Ürünleri',
    emoji: '🐾',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 60,
    fitoutCostPerM2: 3200,
    legalBasis: '5199 Sayılı Hayvanları Koruma Kanunu & İl Tarım Ruhsatı',
    statutoryCapital: 75000,
    mandatoryLegalItems: [
      { name: 'İl Tarım Ev ve Süs Hayvanları Satış Ruhsatı', cost: 20000, description: 'Tarım İl Müdürlüğü harçları' }
    ],
    equipments: [
      { id: 'carbon_vent', name: 'Karbon Filtreli Koku Tahliye Havalandırma Sistemi', category: 'mandatory', unitCost: 35000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'İl Tarım koku ve hijyen yönetmeliği şartı.' },
      { id: 'steel_shelves', name: 'Ağır Yük Çelik Mama Rafları ve Ahşap Aksesuar Teşhir Üniteleri', category: 'furniture', unitCost: 16000, defaultQty: 6, minQty: 2, isLocked: false, unitLabel: 'Ünite' },
      { id: 'pos_cash', name: 'Barkod POS Kasası, Para Çekmecesi & Barkod Okuyucu', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cctv_kit', name: '4 Kameralı Gece Görüşlü Güvenlik Kamerası', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'led_signboard', name: 'LED Işıklı Petshop Tabelası', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 135000,
    initialInventoryDescription: 'Kedi/köpek mamaları, kumlar, tasmalar, oyuncaklar, ödül mamaları ve bakım ürünleri.',
    softwareLicenseCost: { annual: 11000, monthlyMaintenance: 850, name: 'Petshop Barkod Satış & Son Kullanma Tarihi Takip Yazılımı' },
    recommendedStaff: [
      { role: 'Satış & Reyon Danışmanı', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Mama & Aksesuar Sepeti', unitPrice: 520, targetUnitsPerDay: 20, unitLabel: 'Sepet / Gün' },
    revenueModel: {
      avgTicketPrice: 520,
      defaultDailyVolume: 30,
      minDailyVolume: 10,
      maxDailyVolume: 80,
      unitLabel: 'Sepet',
      grossMarginPercent: 30, // %30 Petshop Mama & Aksesuar Brüt Marjı
      daysPerMonth: 26,
      description: 'Süper premium kedi/köpek maması, bentonit kum, tasma ve kemirgen/kuş yemleri.'
    },
    monthlyUtilitiesEstimate: 4800,
    monthlyAccountingFee: 2600,
  },

  'kirtasiye-kitap': {
    id: 'kirtasiye-kitap',
    name: 'Kırtasiye, Kitap & Dijital Baskı',
    emoji: '📚',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 70,
    fitoutCostPerM2: 3000,
    legalBasis: 'Esnaf Sicil & Yazar Kasa Tescil Mevzuatı',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'Oda Kaydı & Belediye Ruhsatı', cost: 16000, description: 'Esnaf tescil harçları' }
    ],
    equipments: [
      { id: 'copier_heavy', name: 'Yüksek Hızlı A3/A4 Renkli Lazer Çok Fonksiyonlu Fotokopi Makinesi', category: 'core_tech', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'binding_mach', name: 'Spiralleme, Laminasyon & Giyotin Kağıt Kesme Tezgahı', category: 'appliances', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'book_racks', name: 'Ahşap Kitaplıklar, Kalem Standları ve Kırtasiye Rafları', category: 'furniture', unitCost: 14000, defaultQty: 6, minQty: 2, isLocked: false, unitLabel: 'Ünite' },
      { id: 'pos_cash', name: 'Kasa POS, Barkod Okuyucu & Kilitli Para Kasası', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'LED Işıklı Kırtasiye Tabelası', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 110000,
    initialInventoryDescription: 'Defterler, kalemler, boyalar, fotokopi kağıtları, sınav hazırlık kitapları ve ofis kırtasiyesi.',
    softwareLicenseCost: { annual: 9500, monthlyMaintenance: 750, name: 'Kırtasiye Hızlı Kasa & Fotokopi Sayaç Takip Programı' },
    recommendedStaff: [
      { role: 'Kırtasiye ve Baskı Elemanı', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Kasa Fiş & Fotokopi İşlemi', unitPrice: 120, targetUnitsPerDay: 85, unitLabel: 'Fiş / Gün' },
    revenueModel: {
      avgTicketPrice: 120,
      defaultDailyVolume: 110,
      minDailyVolume: 35,
      maxDailyVolume: 280,
      unitLabel: 'Müşteri',
      grossMarginPercent: 44, // %44 Kırtasiye & Baskı Brüt Marjı
      daysPerMonth: 26,
      description: 'Okul ve ofis kırtasiyesi, test kitapları, dijital baskı, çıktı ve laminasyon hizmetleri.'
    },
    monthlyUtilitiesEstimate: 5200,
    monthlyAccountingFee: 2600,
  },

  'cicekci-botanik': {
    id: 'cicekci-botanik',
    name: 'Çiçekçi & Botanik Tasarım',
    emoji: '💐',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 50,
    fitoutCostPerM2: 3200,
    legalBasis: 'Perakende Ticaret Ruhsatı',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'Belediye İşyeri Açma İzin Harcı', cost: 13000, description: 'Ruhsatlandırma' }
    ],
    equipments: [
      { id: 'flower_fridge', name: 'Çift Camlı Kesme Çiçek Soğutma Dolabı (Sıcaklık ve Nem Kontrollü)', category: 'appliances', unitCost: 58000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'craft_table', name: 'Ahşap/Mermer Buket Tasarım Tezgahı & Paketleme Standı', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'plant_stands', name: 'Saksı Bitkileri Merdiven Rafları ve Askılıklar', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'pos_cash', name: 'Kasa POS, Para Çekmecesi & Barkod Okuyucu', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'LED Işıklı Botanik Tabelası', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 45000,
    initialInventoryDescription: 'Kesme güller, orkideler, saksı bitkileri, ithal çiçekler, ambalaj kağıtları ve süsleme kurdeleleri.',
    softwareLicenseCost: { annual: 8500, monthlyMaintenance: 650, name: 'Çiçek Sipariş, Web Entegrasyon & Kurye Takip Yazılımı' },
    recommendedStaff: [
      { role: 'Çiçek Tasarım Ustası', count: 1, avgSalary: 36000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Buket & Çiçek Siparişi', unitPrice: 480, targetUnitsPerDay: 15, unitLabel: 'Sipariş / Gün' },
    revenueModel: {
      avgTicketPrice: 480,
      defaultDailyVolume: 22,
      minDailyVolume: 6,
      maxDailyVolume: 65,
      unitLabel: 'Sipariş',
      grossMarginPercent: 52, // %52 Çiçek & Tasarım Brüt Marjı
      daysPerMonth: 26,
      description: 'Özel gün buketleri, saksı çiçekleri, çelenk ve kurumsal mekan süsleme siparişleri.'
    },
    monthlyUtilitiesEstimate: 4500,
    monthlyAccountingFee: 2400,
  },

  'telefon-aksesuar': {
    id: 'telefon-aksesuar',
    name: 'Cep Telefonu, Aksesuar & Teknik Servis',
    emoji: '📱',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 40,
    fitoutCostPerM2: 3400,
    legalBasis: 'Satış Sonrası Hizmetler Yönetmeliği (Ticaret Bakanlığı)',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'Ustalık Tescili & Belediye Ruhsatı', cost: 16000, description: 'Teknik servis tescili' }
    ],
    equipments: [
      { id: 'esd_bench', name: 'ESD Antistatik Topraklamalı Servis Masası', category: 'mandatory', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Statik elektrik koruma standardı.' },
      { id: 'solder_station', name: 'Sıcak Hava Lehim İstasyonu, Dijital Mikroskop & Ekran Ayırıcı', category: 'machinery', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'case_stands', name: 'Işıklı Kılıf Duvar Panelleri ve Cam Kilitli Telefon Vitrinleri', category: 'furniture', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem' },
      { id: 'pos_cash', name: 'Barkod POS Kasası & Kilitli Para Kasası', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'LED Işıklı Servis & Aksesuar Tabelası', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 95000,
    initialInventoryDescription: 'Ekranlar, bataryalar, şarj aletleri, kılıflar, kırılmaz camlar ve soket yedek parçaları.',
    softwareLicenseCost: { annual: 11000, monthlyMaintenance: 850, name: 'Teknik Servis Cihaz Takip, Barkod & SMS Bildirim Yazılımı' },
    recommendedStaff: [
      { role: 'Mobil Cihaz Teknikeri', count: 1, avgSalary: 40000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Tamir & Aksesuar Satışı', unitPrice: 420, targetUnitsPerDay: 18, unitLabel: 'İşlem / Gün' },
    revenueModel: {
      avgTicketPrice: 420,
      defaultDailyVolume: 24,
      minDailyVolume: 8,
      maxDailyVolume: 60,
      unitLabel: 'Müşteri',
      grossMarginPercent: 58, // %58 Teknik Servis & Aksesuar Brüt Marjı
      daysPerMonth: 26,
      description: 'Ekran/batarya değişimi, soket tamiri, kılıf, şarj aleti ve koruyucu cam uygulamaları.'
    },
    monthlyUtilitiesEstimate: 4800,
    monthlyAccountingFee: 2600,
  },

  // ================= 5. OTOMOTİV & SANAYİ =================
  'oto-ekspertiz': {
    id: 'oto-ekspertiz',
    name: 'Oto Ekspertiz İstasyonu',
    emoji: '🔍',
    categoryGroup: 'Otomotiv & Sanayi',
    defaultM2: 180,
    fitoutCostPerM2: 4800,
    legalBasis: 'TSE HYB 13805 Standardı (Ticaret Bakanlığı 2. El Araç Yönetmeliği)',
    statutoryCapital: 200000,
    mandatoryLegalItems: [
      { name: 'TSE Hizmet Yeterlilik Belgesi Harcı & Kalibrasyon', cost: 65000, description: 'TSE HYB resmi tescili' },
      { name: 'Belediye Gayrisıhhi Müessese Ruhsatı', cost: 26000, description: 'İşyeri açma harcı' }
    ],
    equipments: [
      { id: 'dyno_test', name: '4x4 Dinamometre Motor Gücü Test Cihazı', category: 'machinery', unitCost: 340000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Hat' },
      { id: 'brake_test', name: 'Fren Test, Süspansiyon & Yanal Kayma Parkuru', category: 'machinery', unitCost: 260000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Hat' },
      { id: 'exhaust_vent', name: 'Egzoz Gazı Tahliye & Havalandırma Sistemi', category: 'mandatory', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'TSE 13805 zorunlu havalandırma standardı.' },
      { id: 'paint_meter', name: 'Dijital Boya Kalınlık Ölçüm Cihazları (2 Adet) & OBD Arıza Tespit Cihazı', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'car_lift', name: 'Araç Altı İnceleme Lifti (4 Tonluk Hidrolik Lift)', category: 'machinery', unitCost: 95000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'lounge_tv', name: 'Müşteri Bekleme Salonu Koltukları, 55 inç Canlı Test İzleme TV & Çay Barı', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'pos_cash', name: 'Raporlama Bilgisayarı, Lazer Yazıcı & POS Kasası', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'led_signboard', name: 'TSE Standartlarında Dış Cephe Işıklı Totem ve Tabela', category: 'core_tech', unitCost: 36000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 24000,
    initialInventoryDescription: 'Araç içi koruma kılıfları, test etiketleri, kalibrasyon sıvıları ve raporlama kağıtları.',
    softwareLicenseCost: { annual: 36000, monthlyMaintenance: 2800, name: 'TSE & Noter Entegre Bulut Oto Ekspertiz Raporlama Yazılımı' },
    recommendedStaff: [
      { role: 'Mesleki Yeterlilik Belgeli Ekspertiz Uzmanı', count: 2, avgSalary: 48000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Ekspertiz Yapılan Araç Sayısı', unitPrice: 3400, targetUnitsPerDay: 5, unitLabel: 'Araç / Gün' },
    revenueModel: {
      avgTicketPrice: 3400,
      defaultDailyVolume: 8,
      minDailyVolume: 2,
      maxDailyVolume: 25,
      unitLabel: 'Araç',
      grossMarginPercent: 72, // %72 Ekspertiz Hizmet Brüt Marjı
      daysPerMonth: 26,
      description: 'Full paket ekspertiz (Motor, mekanik, kaporta-boya, fren, süspansiyon ve diagnostik).'
    },
    monthlyUtilitiesEstimate: 14000,
    monthlyAccountingFee: 3200,
  },

  'oto-yikama': {
    id: 'oto-yikama',
    name: 'Oto Yıkama & Detailing (Kuaför)',
    emoji: '🚿',
    categoryGroup: 'Otomotiv & Sanayi',
    defaultM2: 150,
    fitoutCostPerM2: 4000,
    legalBasis: 'İSKİ / Su ve Kanalizasyon İdaresi Atık Su Ön Arıtma & Deşarj Yönetmeliği',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Atık Su Deşarj İzni & İSKİ Kanal Bağlantı Onayı', cost: 52000, description: 'Çevre arıtma izni' },
      { name: 'Ruhsat Harçları', cost: 18000, description: 'Oto yıkama ruhsatı' }
    ],
    equipments: [
      { id: 'sand_trap', name: 'Yağ ve Çamur Tutucu Ön Arıtma Havuz Izgarası', category: 'mandatory', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'Çevre ve atık su deşarj mevzuatı şartı.' },
      { id: 'wash_pumps', name: '200 Bar Sıcak/Soğuk Sanayi Tipi Basınçlı Yıkama Makineleri (2 Adet)', category: 'machinery', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'foam_tank', name: 'Paslanmaz Köpük Tankı (60L) ve 500L Kompresör', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'vac_cleaners', name: '3 Motorlu Islak-Kuru Sanayi Tipi Süpürgeler (2 Adet)', category: 'appliances', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'detailing_kit', name: 'Detailing Pasta-Cila & Koltuk Yıkama/Kurutma Makinesi', category: 'machinery', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'waiting_room', name: 'Müşteri Bekleme Odası Mobilyaları & Çay Otomatı', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'pos_cash', name: 'Kasa POS & Para Çekmecesi', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'led_signboard', name: 'Dış LED Tabela & Kameralar', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 40000,
    initialInventoryDescription: 'Oto şampuanları, jant temizleyiciler, cila pastaları, seramik kaplama kimyasalları ve mikrofiber bezler.',
    softwareLicenseCost: { annual: 9500, monthlyMaintenance: 750, name: 'Oto Yıkama Hızlı Fiş, Randevu & Abone Takip Yazılımı' },
    recommendedStaff: [
      { role: 'Yıkama & Detailing Ustası', count: 2, avgSalary: 34000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Yıkanan & Detailing Yapılan Araç', unitPrice: 450, targetUnitsPerDay: 22, unitLabel: 'Araç / Gün' },
    revenueModel: {
      avgTicketPrice: 450,
      defaultDailyVolume: 32,
      minDailyVolume: 10,
      maxDailyVolume: 75,
      unitLabel: 'Araç',
      grossMarginPercent: 65, // %65 Oto Kuaför & Yıkama Brüt Marjı
      daysPerMonth: 30,
      description: 'İç-dış yıkama, motor temizliği, hızlı cila ve detaylı kuaför/pasta-cila uygulamaları.'
    },
    monthlyUtilitiesEstimate: 18000,
    monthlyAccountingFee: 2800,
  },

  'lastik-servisi': {
    id: 'lastik-servisi',
    name: 'Lastik Tamir, Balans & Satış Servisi',
    emoji: '🛞',
    categoryGroup: 'Otomotiv & Sanayi',
    defaultM2: 120,
    fitoutCostPerM2: 3800,
    legalBasis: 'Ömrünü Tamamlamış Lastiklerin Kontrolü Yönetmeliği (Çevre Bakanlığı)',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Ustalık Tescil & Atık Depolama Ruhsatı', cost: 24000, description: 'Ruhsat harçları' }
    ],
    equipments: [
      { id: 'air_compressor_500', name: '500 Litre Sanayi Tipi Pistonlu Hava Kompresörü', category: 'mandatory', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Pnömatik servis güvenlik standardı.' },
      { id: 'tire_changer', name: 'Pnömatik Otomatik Lastik Sökme-Takma Makinesi (Run-Flat Destekli)', category: 'machinery', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'balancer', name: 'Dijital 3D Ekranlı Lastik Balans Makinesi', category: 'machinery', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'jacks_set', name: '3 Tonluk Düşük Profil Hidrolik Krikolar ve Sehpa Seti', category: 'machinery', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'hotel_racks', name: 'Lastik Oteli Ağır Yük Depolama Rafları', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Sistem' },
      { id: 'pos_cash', name: 'Kasa, Bilgisayar & Para Çekmecesi', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'led_signboard', name: 'Dış Cephe Lastik Servis Tabelası', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 160000,
    initialInventoryDescription: 'Yazlık/kışlık sıfır lastikler, siboplar, kurşun balans ağırlıkları, yama ve fitil tamir kitleri.',
    softwareLicenseCost: { annual: 11000, monthlyMaintenance: 850, name: 'Lastik Oteli, Barkod & Hızlı Servis Takip Programı' },
    recommendedStaff: [
      { role: 'Lastik ve Balans Ustası', count: 2, avgSalary: 36000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Lastik Değişim / Tamir Sayısı', unitPrice: 650, targetUnitsPerDay: 12, unitLabel: 'İşlem / Gün' },
    revenueModel: {
      avgTicketPrice: 650,
      defaultDailyVolume: 18,
      minDailyVolume: 5,
      maxDailyVolume: 50,
      unitLabel: 'Araç / İşlem',
      grossMarginPercent: 42, // %42 Lastik Satış & İşçilik Brüt Marjı
      daysPerMonth: 26,
      description: 'Lastik sökme-takma, rot-balans ayarı, lastik oteli saklama ve sıfır/ikinci el lastik satışları.'
    },
    monthlyUtilitiesEstimate: 11000,
    monthlyAccountingFee: 2800,
  },

  'kuru-temizleme': {
    id: 'kuru-temizleme',
    name: 'Kuru Temizleme & Lostra / Terzi',
    emoji: '👔',
    categoryGroup: 'Otomotiv & Sanayi',
    defaultM2: 65,
    fitoutCostPerM2: 4200,
    legalBasis: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı VOC Emisyon Esasları',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Buhar Kazanı & Emisyon Uygunluk İzni', cost: 28000, description: 'Belediye çevre ruhsatı' }
    ],
    equipments: [
      { id: 'dry_clean_machine', name: 'Kapalı Devre Çevre Dostu Kuru Temizleme Makinesi (12-15 kg)', category: 'machinery', unitCost: 280000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'steam_iron', name: 'Vakumlu ve Üflemeli Buharlı Paskala Ütü Tezgahı & Buhar Kazanı', category: 'appliances', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'conveyor', name: 'Motorlu Döner Elbise Askı Konveyörü (150-200 Parça)', category: 'furniture', unitCost: 42000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'stain_remover', name: 'Leke Çıkarma Tezgahı & Terzi Dikiş Makinesi', category: 'machinery', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'counter_pos', name: 'Karşılama Bankosu, Parça Barkod Yazıcısı & Kasa POS', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'led_signboard', name: 'LED Işıklı Kuru Temizleme Tabelası', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' }
    ],
    initialInventoryCost: 45000,
    initialInventoryDescription: 'Perkloretilen / hidrokarbon solventler, leke çıkarıcı kimyasallar, elbise poşetleri ve askılar.',
    softwareLicenseCost: { annual: 11000, monthlyMaintenance: 850, name: 'Kuru Temizleme Parça Takip, Barkod & SMS Otomasyonu' },
    recommendedStaff: [
      { role: 'Kuru Temizleme & Ütü Ustası', count: 1, avgSalary: 40000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Kuru Temizleme Parça Sayısı', unitPrice: 260, targetUnitsPerDay: 30, unitLabel: 'Parça / Gün' },
    revenueModel: {
      avgTicketPrice: 260,
      defaultDailyVolume: 45,
      minDailyVolume: 15,
      maxDailyVolume: 120,
      unitLabel: 'Parça',
      grossMarginPercent: 60, // %60 Kuru Temizleme Brüt Marjı
      daysPerMonth: 26,
      description: 'Takım elbise, kaban, gelinlik, perde, ütü ve lostra hizmetleri.'
    },
    monthlyUtilitiesEstimate: 16000,
    monthlyAccountingFee: 2800,
  }
};

export const BUSINESS_SETUP_TEMPLATES: BusinessTemplate[] = Object.values(BUSINESS_TEMPLATES);

export function getBusinessTemplateById(id: string): BusinessTemplate {
  if (BUSINESS_TEMPLATES[id]) return BUSINESS_TEMPLATES[id];
  const found = BUSINESS_SETUP_TEMPLATES.find((t) => t.id === id);
  return found || BUSINESS_TEMPLATES['sigorta-acentesi'];
}

export function getTemplatesByCategoryGroup(groupName: string): BusinessTemplate[] {
  return BUSINESS_SETUP_TEMPLATES.filter((t) => t.categoryGroup === groupName);
}

export function getAllCategoryGroups(): ('Finans & Hizmet' | 'Yeme - İçme' | 'Kişisel Bakım & Sağlık' | 'Perakende & Mağazacılık' | 'Otomotiv & Sanayi')[] {
  return [
    'Finans & Hizmet',
    'Yeme - İçme',
    'Kişisel Bakım & Sağlık',
    'Perakende & Mağazacılık',
    'Otomotiv & Sanayi'
  ];
}

export interface SmartEquipmentPreset {
  keywords: string[];
  name: string;
  category: 'comfort' | 'furniture' | 'appliances' | 'core_tech' | 'safety' | 'machinery' | 'mandatory';
  suggestedUnitCost: number;
  unitLabel: string;
  description: string;
}

export const SMART_EQUIPMENT_DICTIONARY: SmartEquipmentPreset[] = [
  // Masalar & Mobilya
  { keywords: ['masa', 'makam', 'yönetici'], name: 'Yönetici Makam Masası & Deri Koltuk Takımı', category: 'furniture', suggestedUnitCost: 26000, unitLabel: 'Takım', description: 'Görüşmeler için lüks yönetici çalışma masası ve döner koltuk.' },
  { keywords: ['masa', 'çalışma', 'ofis', 'personel'], name: 'Modüler Personel Çalışma Masası', category: 'furniture', suggestedUnitCost: 9500, unitLabel: 'Adet', description: 'Kablo kanallı ve çekmeceli ofis çalışma masası.' },
  { keywords: ['masa', 'bekleme', 'sehpa'], name: 'Müşteri Bekleme Masası & Zigon Sehpa Seti', category: 'furniture', suggestedUnitCost: 7500, unitLabel: 'Set', description: 'Misafir karşılama ve dergi sehpaları.' },
  { keywords: ['masa', 'toplantı', 'müzakere'], name: '8 Kişilik Oval Toplantı & Müzakere Masası', category: 'furniture', suggestedUnitCost: 32000, unitLabel: 'Takım', description: 'Priz kutulu kurumsal toplantı masası.' },
  { keywords: ['masa', 'restoran', 'yemek', 'kafe', 'çiğköfte'], name: 'Restoran / Kafe Yemek Masası & 4 Sandalye', category: 'furniture', suggestedUnitCost: 8500, unitLabel: 'Takım', description: 'Ahşap/metal dayanıklı müşteri yemek masası.' },

  // Koltuklar
  { keywords: ['koltuk', 'berjer', 'dinlenme', 'bekleme', 'lounge'], name: 'Müşteri Bekleme Lounge Koltuk Grubu (İkili + Tekli)', category: 'furniture', suggestedUnitCost: 18500, unitLabel: 'Takım', description: 'Misafirler için konforlu bekleme koltuğu seti.' },
  { keywords: ['koltuk', 'personel', 'çalışma', 'fileli'], name: 'Ortopedik Fileli Yönetici / Personel Koltuğu', category: 'furniture', suggestedUnitCost: 6500, unitLabel: 'Adet', description: 'Bel destekli ayarlanabilir ofis sandalyesi.' },

  // İklimlendirme & Klimalar
  { keywords: ['klima', 'inverter', 'soğutma', 'ısıtma'], name: 'İnverter Split Klima (18.000 BTU A+++)', category: 'appliances', suggestedUnitCost: 29500, unitLabel: 'Adet', description: 'Enerji tasarruflu sessiz mekan iklimlendirme.' },
  { keywords: ['klima', 'salon', 'büyük'], name: 'Salon Tipi Ayaklı Ticari Klima (24.000 BTU)', category: 'appliances', suggestedUnitCost: 38000, unitLabel: 'Adet', description: 'Geniş ticari mekanlar için yüksek debili klima.' },
  { keywords: ['hava perdesi', 'kapı', 'perde'], name: 'Otomatik Giriş Kapısı Hava Perdesi (120 cm)', category: 'appliances', suggestedUnitCost: 15000, unitLabel: 'Adet', description: 'Giriş kapısından toz, koku ve ısı kaybını önleyen hava akımı.' },

  // Çay & Kahve & İkram
  { keywords: ['kahve', 'çay', 'ikram', 'otomat'], name: 'Otomatik Çay & Kahve İkram Makinesi', category: 'appliances', suggestedUnitCost: 9500, unitLabel: 'Adet', description: 'Müşteriler için taze çekirdekten kahve ve çay otomatı.' },
  { keywords: ['su', 'sebil', 'arıtma'], name: 'Arıtmalı Sıcak-Soğuk Su Sebili', category: 'appliances', suggestedUnitCost: 6800, unitLabel: 'Adet', description: 'Şebekeye bağlı filtreli sıcak/soğuk su makinesi.' },
  { keywords: ['çay kazanı', 'sanayi'], name: 'Endüstriyel 3 Demlikli Bakır Çay Kazanı', category: 'appliances', suggestedUnitCost: 18000, unitLabel: 'Adet', description: 'Yoğun işletmeler için tam otomatik çay ocağı.' },

  // Sağlık, Tartı & Baskül
  { keywords: ['tartı', 'baskül', 'boy', 'kilo', 'tansiyon'], name: 'Boy-Kilo Ölçerli Dijital Eczane Tartısı & Tansiyon Kiti', category: 'core_tech', suggestedUnitCost: 22000, unitLabel: 'Set', description: 'Müşteriler için boy, kilo, yağ oranı ve tansiyon ölçüm istasyonu.' },
  { keywords: ['terazi', 'barkodlu', 'market'], name: 'Fiyat Hesaplamalı Barkodlu Terazi (30 kg)', category: 'core_tech', suggestedUnitCost: 18000, unitLabel: 'Adet', description: 'Market ve şarküteri için etiket basan hassas terazi.' },

  // Güvenlik, Kasa & Enerji
  { keywords: ['kasa', 'çelik', 'para'], name: 'Kilitli Ağır Hizmet Çelik Para ve Evrak Kasası', category: 'core_tech', suggestedUnitCost: 16500, unitLabel: 'Adet', description: 'Yangına ve darbelere dayanıklı şifreli çelik kasa.' },
  { keywords: ['kamera', 'güvenlik', 'kayıt', 'cctv'], name: '8 Kameralı Gece Görüşlü Güvenlik Kamera Seti + NVR', category: 'core_tech', suggestedUnitCost: 22000, unitLabel: 'Set', description: 'Cep telefonundan izlenebilir 4K gece görüşlü güvenlik sistemi.' },
  { keywords: ['alarm', 'kapı', 'ürün koruma'], name: 'Akusto-Manyetik Mağaza Ürün Koruma Kapı Anteni', category: 'core_tech', suggestedUnitCost: 24000, unitLabel: 'Set', description: 'Hırsızlığa karşı ürün alarmlarını tespit eden kapı anteni.' },
  { keywords: ['ups', 'güç kaynağı', 'kesintisiz'], name: 'Kesintisiz Güç Kaynağı (Online 3 kVA UPS)', category: 'core_tech', suggestedUnitCost: 16500, unitLabel: 'Adet', description: 'Elektrik kesildiğinde POS, bilgisayar ve modemleri açık tutan akü.' },
  { keywords: ['jeneratör', 'benzinli', 'elektrik'], name: 'Otomatik Transfer Panolu 8.5 kVA Benzinli Jeneratör', category: 'machinery', suggestedUnitCost: 42000, unitLabel: 'Adet', description: 'Elektrik kesintisinde anında devreye giren güç ünitesi.' },
  { keywords: ['para sayma', 'sahte para'], name: 'Otomatik Sahte Para Tespit ve Karışık Para Sayma Makinesi', category: 'core_tech', suggestedUnitCost: 14000, unitLabel: 'Adet', description: 'TL, USD ve EUR için UV/manyetik dedektörlü sayıcı.' },

  // Ses & Görüntü
  { keywords: ['ses', 'müzik', 'hoparlör'], name: 'Bluetooth & Tavan Tipi Mağaza / Kafe Ambiyans Ses Sistemi', category: 'core_tech', suggestedUnitCost: 14000, unitLabel: 'Set', description: 'Mekan geneline homojen müzik yayını sağlayan tavan hoparlörleri ve amfi.' },
  { keywords: ['tv', 'televizyon', 'ekran', 'akıllı'], name: '55 inç 4K UHD Akıllı Bilgilendirme TV & Askı Aparatı', category: 'core_tech', suggestedUnitCost: 19500, unitLabel: 'Adet', description: 'Müşteri bekleme alanı için akıllı televizyon.' },

  // Tabela & Aydınlatma
  { keywords: ['tabela', 'led', 'ışıklı', 'reklam'], name: 'LED Işıklı Pleksi Kutu Harf Dış Cephe Tabelası', category: 'core_tech', suggestedUnitCost: 28000, unitLabel: 'Adet', description: 'Kurumsal dış cephe ışıklı mağaza tabelası.' },
  { keywords: ['aydınlatma', 'spot', 'ray'], name: 'Ray Spot LED Mağaza Aydınlatma Seti (10 Spot + Raylar)', category: 'furniture', suggestedUnitCost: 18000, unitLabel: 'Set', description: 'Ürünleri ve reyonları öne çıkaran profesyonel sıcak ışık spotları.' },
];
