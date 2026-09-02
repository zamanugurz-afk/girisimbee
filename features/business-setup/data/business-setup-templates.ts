import type { BusinessTemplate, SetupEquipment } from '../types/business-setup.types';

/**
 * m²'ye göre dinamik ekipman ve demirbaş adetlerini hesaplar.
 * Yangın tüpü, klima, çalışma masaları, müşteri masaları, reformerlar, market rafları, kuaför koltukları vb.
 */
export function calculateDynamicEquipmentQty(
  eq: SetupEquipment,
  m2: number
): { minQty: number; defaultQty: number } {
  if (!eq.scalesWithM2 || !eq.m2Ratio || eq.m2Ratio <= 0) {
    return { minQty: eq.minQty, defaultQty: eq.defaultQty };
  }

  const calculated = Math.max(1, Math.ceil(m2 / eq.m2Ratio));
  const minQty = eq.isLocked ? calculated : eq.minQty;
  const defaultQty = Math.max(minQty, calculated);

  return { minQty, defaultQty };
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü & İlk Yardım Seti (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99 (Her 100 m² için 1 adet 6kg tüp).' },
      { id: 'archive_cab', name: 'Kilitli Ağır Hizmet Çelik Arşiv & Kıymetli Evrak Kasası', category: 'mandatory', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'SEDDK poliçe ve teminat evrakları güvenlik şartı.' },
      { id: 'pc_setup', name: 'Çift Monitörlü Personel Masası & Acente İş İstasyonu', category: 'core_tech', unitCost: 34000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 25, description: 'Masa, koltuk, çift monitörlü PC ve UPS içeren çalışma istasyonu.' },
      { id: 'scanner_printer', name: 'Yüksek Hızlı Çok Fonksiyonlu Lazer Yazıcı & ADF Tarayıcı', category: 'core_tech', unitCost: 18500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cctv_kit', name: 'Gece Görüşlü NVR Güvenlik Kamera Kiti', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 75, description: 'İşyeri güvenliği ve 30 günlük kayıt cihazı.' },
      { id: 'cash_drawer', name: 'Kilitli Para Çekmecesi & Sahte Para Dedektörü', category: 'core_tech', unitCost: 6500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'manager_desk', name: 'Yönetici & Acente Müdürü Makam Masası ve Koltuk Takımı', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'guest_lounge', name: 'Müşteri Karşılama ve Poliçe İnceleme Koltuk Grubu (İkili + 2 Berjer)', category: 'furniture', unitCost: 18500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 50, description: 'Müşteri ağırlama deri koltuk ve sehpa takımı.' },
      { id: 'file_cabinet', name: 'Kilitli Personel Dosya & Klasör Dolapları', category: 'furniture', unitCost: 8500, defaultQty: 2, minQty: 0, isLocked: false, unitLabel: 'Ünite', scalesWithM2: true, m2Ratio: 30 },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU A+++)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Tanzim Edilen Poliçe Hacmi',
      unitLabel: 'Poliçe',
      priceLabel: 'Ortalama Poliçe Primi',
      defaultVolume: 8,
      minVolume: 2,
      maxVolume: 35,
      stepVolume: 1,
      avgTicketPrice: 3800,
      grossMarginPercent: 11.5,
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
      { id: 'consultant_desks', name: 'Danışman Çalışma Masası, Koltuk & PC İstasyonu', category: 'furniture', unitCost: 24000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 25 },
      { id: 'presentation_tv', name: '55 inç 4K Ultra HD Portföy & Proje Sunum Ekranı', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'guest_lounge', name: 'Müşteri Karşılama Lounge Koltuk Seti', category: 'furniture', unitCost: 16500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 50 },
      { id: 'safe_box', name: 'Çelik Para ve Tapu Evrak Kasası', category: 'core_tech', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'monthly',
      volumeLabel: 'Aylık Kiralama & Satış İşlem Sayısı',
      unitLabel: 'İşlem',
      priceLabel: 'İşlem Başına Ortalama Hizmet Bedeli',
      defaultVolume: 6,
      minVolume: 1,
      maxVolume: 20,
      stepVolume: 1,
      avgTicketPrice: 35000,
      grossMarginPercent: 82,
      description: 'Konut ve ticari gayrimenkul kiralama ve satış aracılık hizmet bedelleri.'
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
      { id: 'archive_system', name: 'Kilitli Çelik Mükellef Evrak Arşiv Dolapları', category: 'mandatory', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 35, regulatoryNote: 'TÜRMOB mükellef evrak gizliliği standardı.' },
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'scanner', name: 'Yüksek Hızlı Çift Taraflı ADF Belge Tarayıcı (Günde 5000 Sayfa)', category: 'core_tech', unitCost: 22500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'pc_setup', name: 'Müşavir & Personel Çift Ekranlı Çalışma İstasyonu', category: 'core_tech', unitCost: 26000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 25 },
      { id: 'manager_desk', name: 'SMMM Yönetici Makam Masası & Deri Koltuk', category: 'furniture', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'guest_chairs', name: 'Mükellef Görüşme Koltukları & Sehpa Takımı', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 50 },
      { id: 'ups', name: 'Kesintisiz Güç Kaynağı (Online 3 kVA UPS)', category: 'core_tech', unitCost: 16500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'monthly',
      volumeLabel: 'Aylık Aktif Defter Mükellefi Sayısı',
      unitLabel: 'Mükellef',
      priceLabel: 'Mükellef Başına Aylık Muhasebe Ücreti',
      defaultVolume: 60,
      minVolume: 15,
      maxVolume: 180,
      stepVolume: 5,
      avgTicketPrice: 2400,
      grossMarginPercent: 80,
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
      { id: 'archive_steel', name: 'Dava Dosyaları Çelik Kilitli Arşivleme Dolap Sistemi', category: 'mandatory', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 35, regulatoryNote: 'Baro müvekkil dosya gizliliği şartı.' },
      { id: 'fire_ext', name: 'Yangın Tüpü & İlk Yardım Seti', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 100 },
      { id: 'lawyer_desk', name: 'Klasik Avukat Makam Masası & Hakiki Deri Yönetici Koltuğu', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'meeting_suite', name: '8 Kişilik Müvekkil Müzakere & Arabuluculuk Toplantı Masası', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'library_cabinets', name: 'Ahşap Kütüphane Dolapları (Hukuk İçtihatları İçin)', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 40 },
      { id: 'pc_setup', name: 'UYAP Uyumlu e-İmza Terminalleri, PC ve Çalışma Masası', category: 'core_tech', unitCost: 28000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 30 },
      { id: 'guest_berjer', name: 'Misafir Deri Berjer Takımı & Sehpa', category: 'furniture', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 50 },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'monthly',
      volumeLabel: 'Aylık Yeni Dava / Danışmanlık Dosyası',
      unitLabel: 'Dosya',
      priceLabel: 'Dosya Başına Ortalama Vekalet Ücreti',
      defaultVolume: 10,
      minVolume: 2,
      maxVolume: 35,
      stepVolume: 1,
      avgTicketPrice: 22000,
      grossMarginPercent: 82,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'workstations', name: 'Ergonomik Yükseklik Ayarlı Geliştirici Masaları & Koltuk', category: 'furniture', unitCost: 18000, defaultQty: 4, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 18 },
      { id: 'network_server', name: 'Gigabit Yönetilebilir Switch & Firewall Ağ Kabini', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'meeting_screen', name: '65 inç 4K Ultra HD Proje & Sunum Ekranı + Cam Yazı Tahtası', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'lounge_corner', name: 'Lounge Dinlenme Koltuk Takımı & Sehpa', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 60 },
      { id: 'coffee_bar', name: 'İtalyan Çekirdek Kahve Makinesi & Arıtmalı Su Sebili', category: 'appliances', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 }
    ],
    initialInventoryCost: 6000,
    initialInventoryDescription: 'Sunucu kabloları, test cihazları ve ofis sarf malzemeleri.',
    softwareLicenseCost: { annual: 48000, monthlyMaintenance: 3800, name: 'Tasarım & Geliştirme Lisans Paketi (Adobe CC, Figma, Jira, AWS)' },
    recommendedStaff: [
      { role: 'Kıdemli Yazılım / Tasarım Uzmanı', count: 2, avgSalary: 75000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Aylık Tamamlanan Proje / Sprint', unitPrice: 55000, targetUnitsPerDay: 0.15, unitLabel: 'Proje / Ay' },
    revenueModel: {
      periodType: 'monthly',
      volumeLabel: 'Aylık Tamamlanan Proje / Sözleşme',
      unitLabel: 'Proje',
      priceLabel: 'Proje Başına Ortalama Hizmet Bedeli',
      defaultVolume: 5,
      minVolume: 1,
      maxVolume: 20,
      stepVolume: 1,
      avgTicketPrice: 55000,
      grossMarginPercent: 70,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpleri & İlk Yardım Kiti', category: 'mandatory', unitCost: 4500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'espresso_machine', name: '2 Gruplu Profesyonel Espresso Makinesi (İtalyan)', category: 'machinery', unitCost: 135000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'grinders', name: 'On-Demand Otomatik Espresso & Filtre Değirmenleri (2 Adet)', category: 'machinery', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ice_maker', name: 'Sanayi Tipi Paslanmaz Çelik Buz Makinesi (Günde 40kg)', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cake_cooler', name: 'Camlı Soğutmalı Pasta & Tatlı Teşhir Dolabı', category: 'appliances', unitCost: 45000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'bar_fridge', name: 'Tezgah Altı Şişe & Meşrubat Soğutucu Dolap', category: 'appliances', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'water_filter', name: 'Ters Ozmoz Endüstriyel Su Arıtma Sistemi (Mineral Ayarlı)', category: 'appliances', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'dish_washer', name: 'Sanayi Tipi 2 Dakikalık Hızlı Bulaşık Makinesi', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cafe_furniture', name: '4 Kişilik Masif Ahşap & Metal Kafe Masa-Sandalye Takımları', category: 'furniture', unitCost: 9500, defaultQty: 8, minQty: 2, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 8 },
      { id: 'pos_cash', name: 'Restoran Bulut Dokunmatik POS, Para Çekmecesi & Barkod Okuyucu', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'sound_system', name: 'Tavan Tipi Homojen Ambiyans Müzik Ses Sistemi', category: 'core_tech', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Salon Tipi Ticari Inverter Klima (24.000 BTU)', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Kahve & Tatlı Müşterisi',
      unitLabel: 'Müşteri',
      priceLabel: 'Ortalama Kişi Başı Adisyon Tutarı',
      defaultVolume: 90,
      minVolume: 30,
      maxVolume: 300,
      stepVolume: 5,
      avgTicketPrice: 220,
      grossMarginPercent: 62,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpleri & İlk Yardım Kiti', category: 'mandatory', unitCost: 4500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 100 },
      { id: 'cooker_4', name: '4 Gözlü Sanayi Tipi Kuzine & Gazlı Döküm Ocaklar', category: 'machinery', unitCost: 72000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'deep_fryer', name: 'Endüstriyel Çift Sepetli Fritöz (2x10L)', category: 'machinery', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'deep_freeze', name: 'Sanayi Tipi Çift Kapılı Paslanmaz Dik Soğutucu ve Dondurucu', category: 'appliances', unitCost: 65000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 80 },
      { id: 'prep_tables', name: 'Paslanmaz Çelik Hazırlık Tezgahları & Evyeler (3 Adet)', category: 'furniture', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'dish_guillotine', name: 'Giyotin Tip Sanayi Bulaşık Makinesi', category: 'appliances', unitCost: 48000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'tableware_set', name: 'Porselen Tabak, Çatal-Bıçak, Bardak ve Servis Ekipmanları Seti', category: 'furniture', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Full Set', scalesWithM2: true, m2Ratio: 100 },
      { id: 'dining_tables', name: '4 Kişilik Restoran Masaları ve Konforlu Döşemeli Sandalyeler', category: 'furniture', unitCost: 12000, defaultQty: 14, minQty: 4, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 8 },
      { id: 'kds_pos', name: 'Mutfak KDS Ekranı, Garson El Terminalleri & Ana POS Kasası', category: 'core_tech', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'safe_box', name: 'Kilitli Çelik Kasa & Sahte Para Dedektörü', category: 'core_tech', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_salon', name: 'Salon Tipi Güçlü Inverter Klima (28.000 BTU)', category: 'appliances', unitCost: 44000, defaultQty: 2, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 60 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Ana Yemek & Adisyon Sayısı',
      unitLabel: 'Müşteri',
      priceLabel: 'Ortalama Kişi Başı Hesap Tutarı',
      defaultVolume: 85,
      minVolume: 25,
      maxVolume: 250,
      stepVolume: 5,
      avgTicketPrice: 380,
      grossMarginPercent: 50,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'doner_burner', name: '4 Radyanlı Motorlu Gazlı Döner Ocağı & Otomatik Bıçak/Robot', category: 'machinery', unitCost: 54000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'fryer_toast', name: 'Sanayi Tipi Çiftli Fritöz & Döküm Tost Makinesi', category: 'machinery', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'salad_bar', name: 'Soğutmalı Salata Barı ve Meze Tezgahı', category: 'appliances', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'beverage_cooler', name: 'Dik Camlı Meşrubat & Ayran Soğutma Dolabı', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'tables_set', name: 'Dönerci Masa & Sandalye Takımları (4 Kişilik)', category: 'furniture', unitCost: 8500, defaultQty: 9, minQty: 2, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 9 },
      { id: 'pos_cash', name: 'Dokunmatik Paket Servis POS Terminali & Para Çekmecesi', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Döner & Dürüm Porsiyonu',
      unitLabel: 'Porsiyon',
      priceLabel: 'Ortalama Dürüm / Menü Tutarı',
      defaultVolume: 120,
      minVolume: 40,
      maxVolume: 350,
      stepVolume: 10,
      avgTicketPrice: 260,
      grossMarginPercent: 48,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'cigkofte_counter', name: 'Camlı, LED Işıklı & Statik Soğutmalı Çiğköfte Sunum Tezgahı', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'drink_cooler', name: 'Dik Camlı Meşrubat & Ayran Soğutma Dolabı', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'tables_chairs', name: '4 Kişilik Kompakt Çiğköfte Masa & Sandalye Takımları', category: 'furniture', unitCost: 7500, defaultQty: 4, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 8 },
      { id: 'pos_cash', name: 'Dokunmatik Hızlı Satış POS Terminali & Kilitli Para Çekmecesi', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'tea_samovar', name: 'Endüstriyel Çay Otomatı / Semaver', category: 'appliances', unitCost: 6500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (12.000 BTU)', category: 'appliances', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 40 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Dürüm & Paket Siparişi',
      unitLabel: 'Sipariş',
      priceLabel: 'Ortalama Dürüm / Sipariş Tutarı',
      defaultVolume: 95,
      minVolume: 30,
      maxVolume: 250,
      stepVolume: 5,
      avgTicketPrice: 140,
      grossMarginPercent: 48,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'deck_oven', name: 'Katlı Taş Tabanlı / Döner Arabalı Ekmek & Pasta Fırını', category: 'machinery', unitCost: 195000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'spiral_mixer', name: '50kg Spiral Hamur Yoğurma Kazanı & Yuvarlama Makinesi', category: 'machinery', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'heated_counter', name: 'Isıtmalı Camlı Börek, Poğaça & Simit Teşhir Tezgahları', category: 'furniture', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'cake_cooler', name: 'Soğutmalı Yaş Pasta & Sütlü Tatlı Teşhir Dolabı', category: 'appliances', unitCost: 45000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'bread_slicer', name: 'Ekmek Dilimleme Makinesi & Terazi Entegre Hızlı POS', category: 'machinery', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'tea_service', name: 'Çay/Kahve İkram Tezgahı & Oturma Masaları', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 40 },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Müşteri / Fiş Sayısı',
      unitLabel: 'Müşteri',
      priceLabel: 'Ortalama Müşteri Fiş Tutarı',
      defaultVolume: 420,
      minVolume: 150,
      maxVolume: 900,
      stepVolume: 20,
      avgTicketPrice: 65,
      grossMarginPercent: 54,
      daysPerMonth: 30,
      description: 'Ekmek, simit, poğaça, börek ve unlu mamul perakende tezgah satışları.'
    },
    monthlyUtilitiesEstimate: 26000,
    monthlyAccountingFee: 3600,
  },

  'waffle-cikolata': {
    id: 'waffle-cikolata',
    name: 'Waffle & Butik Tatlıcı',
    emoji: '🧇',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 45,
    fitoutCostPerM2: 4200,
    legalBasis: '5996 Sayılı Veteriner Hizmetleri, Bitki Sağlığı, Gıda ve Yem Kanunu & Hijyen Yönetmeliği',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'İlçe Tarım Gıda İşletme Kayıt Belgesi', cost: 16000, description: 'Gıda üretim ve satış izni' },
      { name: 'İtfaiye Yangın & Havalandırma Raporu', cost: 14000, description: 'İşyeri açma ruhsatı ön şartı' },
      { name: 'Belediye İşyeri Açma ve Çalışma Ruhsatı', cost: 14000, description: 'Ruhsat ve çevre temizlik harçları' },
    ],
    equipments: [
      { id: 'hood_system', name: 'Karbon Filtreli Davlumbaz & Koku Tahliye Havalandırma', category: 'mandatory', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'İtfaiye ve belediye hijyen şartı.' },
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpleri & İlk Yardım Kiti', category: 'mandatory', unitCost: 4500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 100 },
      { id: 'waffle_iron', name: 'Çift Gözlü Döküm Endüstriyel Waffle Pişirme Makineleri (2 Adet)', category: 'machinery', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'crepe_machine', name: 'Profesyonel Elektrikli Pleyt Krep Makinesi', category: 'machinery', unitCost: 16500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'chocolate_melter', name: '3 Gözlü Paslanmaz Çikolata Eritme & Şelale Ünitesi', category: 'machinery', unitCost: 29000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'topping_cooler', name: 'Soğutmalı Camlı Meyve, Çerez & Topping Teşhir Barı (12 Gastronom)', category: 'appliances', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Ünite' },
      { id: 'ice_cream_freezer', name: 'Statik Soğutmalı Dondurma Teşhir Dolabı (6-8 Küvet)', category: 'appliances', unitCost: 44000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'undercounter_fridge', name: 'Tezgah Altı Paslanmaz Soğutucu Dolap & Hazırlık Masası', category: 'appliances', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'blender_milkshake', name: 'Endüstriyel Bar Blender & Milkshake Mikseri', category: 'machinery', unitCost: 18500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'dish_washer', name: 'Sanayi Tipi Bardak & Tabak Yıkama Makinesi', category: 'appliances', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'cafe_furniture', name: 'Waffle & Tatlı Masaları, Döşemeli Berjer & Sandalye Seti', category: 'furniture', unitCost: 8500, defaultQty: 6, minQty: 2, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 8 },
      { id: 'pos_cash', name: 'Dokunmatik Restoran POS, Termal Adisyon Yazıcı & Kasa', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
      { id: 'led_signboard', name: 'LED Işıklı Neon & Kutu Harf Tabela', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    initialInventoryCost: 65000,
    initialInventoryDescription: 'Belçika waffle harcı, birinci sınıf sütlü/bitter/beyaz kuvertür çikolata, taze meyveler (çilek, muz, kivi), fındık/fıstık ezmesi, dondurma ve özel servis kutuları.',
    softwareLicenseCost: { annual: 16000, monthlyMaintenance: 1200, name: 'Restoran Bulut POS & QR Menü Sistemi' },
    recommendedStaff: [
      { role: 'Waffle & Tatlı Ustası', count: 1, avgSalary: 38000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Servis & Kasa Personeli', count: 1, avgSalary: 26000, isMandatory: false },
    ],
    breakEvenMetric: { label: 'Günlük Waffle & Tatlı Porsiyonu', unitPrice: 240, targetUnitsPerDay: 55, unitLabel: 'Porsiyon / Gün' },
    revenueModel: {
      periodType: 'daily',
      volumeLabel: 'Günlük Waffle / Krep / Tatlı Satışı',
      unitLabel: 'Porsiyon',
      priceLabel: 'Ortalama Porsiyon & İçecek Fiyatı',
      defaultVolume: 75,
      minVolume: 25,
      maxVolume: 250,
      stepVolume: 5,
      avgTicketPrice: 240,
      grossMarginPercent: 68,
      daysPerMonth: 30,
      description: 'Waffle, krep, fondü, dondurma ve kahve/soğuk meşrubat satışlarından oluşan ortalama sipariş.',
    },
    monthlyUtilitiesEstimate: 12500,
    monthlyAccountingFee: 3200,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'pharma_fridge', name: 'Dijital Dereceli Aşı ve İlaç Buzdolabı (+2°C / +8°C)', category: 'mandatory', unitCost: 52000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Bakanlık soğuk zincir aşı ve ilaç saklama standardı.' },
      { id: 'safe_red', name: 'Kilitli Çelik Kırmızı & Yeşil Reçete Kasası', category: 'mandatory', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Uyuşturucu ve psikotrop ilaçlar kilitli kasada tutulmalıdır.' },
      { id: 'lab_set', name: 'Majistral Laboratuvar Tezgahı, Hassas Terazi & Saf Su Kiti', category: 'mandatory', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Majistral ilaç hazırlama alanı yasal zorunludur.' },
      { id: 'pharma_drawers', name: 'Kademeli Raylı İlaç Çekmece Blokları (24 Çekmeceli Sistem)', category: 'furniture', unitCost: 115000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem', scalesWithM2: true, m2Ratio: 75 },
      { id: 'display_shelves', name: 'LED Aydınlatmalı Cam Eczane Teşhir Dolapları & Gondol Raflar', category: 'furniture', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem', scalesWithM2: true, m2Ratio: 40 },
      { id: 'service_counter', name: 'Eczane Reçete Karşılama ve Hasta Danışmanlık Bankosu (2 Kişilik)', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'weigh_station', name: 'Boy-Kilo Ölçerli Dijital Eczane Baskülü & Otomatik Tansiyon Aleti', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'pc_medula', name: 'TEB Medula Uyumlu PC, Barkod Okuyucu ve Reçete Yazıcısı', category: 'core_tech', unitCost: 22000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 40 },
      { id: 'ups_pharma', name: 'Kesintisiz Güç Kaynağı (Online 3 kVA UPS)', category: 'core_tech', unitCost: 16500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'patient_chairs', name: 'Müşteri Bekleme Deri Koltuk Grubu', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 50 },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
      { id: 'e_logo_sign', name: 'Standart LED Işıklı Eczane "E" Logosu & Dış Işıklı Tabela', category: 'core_tech', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Sağlık Bakanlığı standart Eczane ve E logosu zorunluluğu.' },
      { id: 'cctv_kit', name: 'Gece Görüşlü NVR Güvenlik Sistemi', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 75 }
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
      periodType: 'daily',
      volumeLabel: 'Günlük Hasta & Reçete Sayısı',
      unitLabel: 'Hasta / Reçete',
      priceLabel: 'Reçete & OTC Ortalama Sepet Tutarı',
      defaultVolume: 90,
      minVolume: 35,
      maxVolume: 220,
      stepVolume: 5,
      avgTicketPrice: 420,
      grossMarginPercent: 24,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'ventilation', name: 'Özel Kimyasal Koku Tahliye Havalandırması', category: 'mandatory', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'Kuaför kimyasal buhar tahliye zorunluluğu.' },
      { id: 'autoclave', name: 'B Tipi Otoklav / UV Alet Sterilizatörü', category: 'mandatory', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Alet sterilizasyon şartı.' },
      { id: 'hair_stations', name: 'Hidrolik Kuaför Koltuğu & Aynalı LED Tezgah Takımı', category: 'furniture', unitCost: 24000, defaultQty: 4, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 20 },
      { id: 'wash_station', name: 'Seramik Masajlı Saç Yıkama Koltukları', category: 'furniture', unitCost: 28000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 40 },
      { id: 'hair_dryers', name: 'Ayaklı Vapozon Buhar Makinesi & Profesyonel Fön Makineleri Seti', category: 'machinery', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'beauty_bed', name: 'Cilt Bakım & Ağda/Lazer Odası Yatağı ve Taburesi', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 50 },
      { id: 'lounge_chairs', name: 'Müşteri Bekleme Lounge Koltukları & Çay/Kahve İkram Barı', category: 'furniture', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 50 },
      { id: 'pos_cash', name: 'Randevu POS Terminali & Kilitli Para Kasası', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Hizmet Verilen Müşteri Sayısı',
      unitLabel: 'Müşteri',
      priceLabel: 'Müşteri Başına Ortalama Hizmet Tutarı',
      defaultVolume: 16,
      minVolume: 5,
      maxVolume: 40,
      stepVolume: 1,
      avgTicketPrice: 950,
      grossMarginPercent: 68,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'dental_unit', name: 'Entegre Diş Hekimi Koltuk Üniti, Reflektör & Kreşuar', category: 'machinery', unitCost: 260000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 60 },
      { id: 'autoclave_med', name: 'B Sınıfı Vakumlu Medikal Otoklav & Paketleme Cihazı', category: 'mandatory', unitCost: 52000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Tıbbi aletlerin sterilizasyonu için zorunlu cihaz.' },
      { id: 'air_compressor', name: 'Medikal Yağsız ve Sessiz Hava Kompresörü & Aspiratör', category: 'mandatory', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'lead_lining', name: 'Kurşun Kaplama Duvar Panelleri & Koruma Önlükleri', category: 'mandatory', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Radyasyon güvenliği standardı.' },
      { id: 'stools_cabinets', name: 'Hekim Tabureleri & Tıbbi Paslanmaz Çekmece Dolapları', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 50 },
      { id: 'reception_lounge', name: 'Hasta Karşılama Bankosu, Bekleme Koltukları & 55 inç TV', category: 'furniture', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 2, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Tedavi Gören Hasta Sayısı',
      unitLabel: 'Hasta',
      priceLabel: 'Hasta Başına Ortalama Tedavi Tutarı',
      defaultVolume: 6,
      minVolume: 2,
      maxVolume: 16,
      stepVolume: 1,
      avgTicketPrice: 2200,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'lensmeter', name: 'Dijital Odaklama Cihazı (Fokometre)', category: 'mandatory', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: '5193 Sayılı Kanun gereği zorunlu cihaz.' },
      { id: 'lens_edger', name: 'Otomatik Cam Kesim & Kanal Açma Makinesi', category: 'machinery', unitCost: 175000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'display_cabinets', name: 'Kilitli & LED Aydınlatmalı Gözlük Teşhir Vitrinleri & Aynalar', category: 'furniture', unitCost: 75000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem', scalesWithM2: true, m2Ratio: 35 },
      { id: 'trial_tables', name: 'Gözlük Deneme Masaları ve Deri Koltuklar', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 40 },
      { id: 'pos_medula', name: 'Medula Optik Entegre Bilgisayar & Barkod Okuyucu', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Gözlük & Cam Satış Adedi',
      unitLabel: 'Gözlük',
      priceLabel: 'Ortalama Gözlük / Çerçeve Tutarı',
      defaultVolume: 5,
      minVolume: 1,
      maxVolume: 15,
      stepVolume: 1,
      avgTicketPrice: 2400,
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
      { id: 'fire_firstaid', name: 'Yangın Tüpü & İlk Yardım Seti', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Tesis güvenlik şartı.' },
      { id: 'reformer', name: 'Ahşap Reformer & Tower/Cadillac Pilates Aleti', category: 'machinery', unitCost: 46000, defaultQty: 4, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 18 },
      { id: 'mat_props', name: 'Matlar, Direnç Bantları, Toplar & Yoga Blokları Seti', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 40 },
      { id: 'wall_mirrors', name: 'Boydan Boya Güvenli Pilates/Dans Aynaları (Duvar Kaplama)', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem', scalesWithM2: true, m2Ratio: 40 },
      { id: 'lockers', name: 'Soyunma Odası Kilitli Çelik Dolapları', category: 'furniture', unitCost: 16000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 40 },
      { id: 'turnstile_pos', name: 'Turnike / Kartlı Geçiş ve Üye Takip Bilgisayarı', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'sound_ac', name: 'Ambiyans Ses Sistemi & Inverter Klima (24.000 BTU)', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 50 }
    ],
    initialInventoryCost: 16000,
    initialInventoryDescription: 'Pilates çorapları, matlar, direnç bantları ve dezenfektan havlu sarf malzemeleri.',
    softwareLicenseCost: { annual: 11000, monthlyMaintenance: 850, name: 'Üye Takip, Turnike & Online Ders Rezervasyon Yazılımı' },
    recommendedStaff: [
      { role: 'Sertifikalı Pilates/Yoga Eğitmeni', count: 2, avgSalary: 38000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Aylık Aktif Paket Alan Üye Sayısı', unitPrice: 3800, targetUnitsPerDay: 1.2, unitLabel: 'Üye / Ay' },
    revenueModel: {
      periodType: 'monthly',
      volumeLabel: 'Aylık Düzenli Aktif Üye / Paket Sayısı',
      unitLabel: 'Üye',
      priceLabel: 'Aylık Reformer / Yoga Paket Ücreti',
      defaultVolume: 55,
      minVolume: 15,
      maxVolume: 150,
      stepVolume: 5,
      avgTicketPrice: 3800,
      grossMarginPercent: 78,
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
      { id: 'cam_system', name: 'Gece Görüşlü NVR Güvenlik Kamera Sistemi', category: 'mandatory', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', scalesWithM2: true, m2Ratio: 75, regulatoryNote: 'İşyeri güvenlik standardı.' },
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'dairy_cooler', name: '3 Metre Sütlük & Şarküteri Soğutma Dolabı', category: 'appliances', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 75 },
      { id: 'deep_freeze_ugur', name: 'Camlı Dondurma ve Donuk Gıda Derin Dondurucu', category: 'appliances', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 75 },
      { id: 'shelves', name: 'Ağır Hizmet Duvar ve Orta Market Rafları', category: 'furniture', unitCost: 18000, defaultQty: 10, minQty: 2, isLocked: false, unitLabel: 'Ünite', scalesWithM2: true, m2Ratio: 10 },
      { id: 'pos_scale', name: 'Barkod Okuyuculu Dokunmatik Kasa Bankosu, Terazi & Para Çekmecesi', category: 'core_tech', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 80 },
      { id: 'rfid_gates', name: 'Manyetik Ürün Güvenlik Kapı Antenleri', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (24.000 BTU)', category: 'appliances', unitCost: 34000, defaultQty: 2, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Kasa Fiş Sayısı',
      unitLabel: 'Kasa Fişi',
      priceLabel: 'Ortalama Market Sepet Tutarı',
      defaultVolume: 160,
      minVolume: 50,
      maxVolume: 400,
      stepVolume: 10,
      avgTicketPrice: 190,
      grossMarginPercent: 19,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'rfid_gates', name: 'Manyetik Ürün Güvenlik Kapı Antenleri & 2000 Adet Alarm Butonu', category: 'mandatory', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Mağaza ürün koruma standardı.' },
      { id: 'hanger_stands', name: 'Özel Tasarım Işıklı Askılık ve Raf Duvar Üniteleri & Orta Masalar', category: 'furniture', unitCost: 42000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Sistem', scalesWithM2: true, m2Ratio: 35 },
      { id: 'fitting_room', name: 'Aynalı ve LED Aydınlatmalı Prova Kabinleri (Perdeli/Kapılı)', category: 'furniture', unitCost: 16000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 35 },
      { id: 'mannequins', name: 'Vitrin Mankenleri (Full Beden Bayan/Erkek - 4 Adet)', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 40 },
      { id: 'pos_cash', name: 'Kasa Masası, Varyantlı Barkod Okuyucu & Para Çekmecesi', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'steamer', name: 'Sanayi Tipi Askılı Buharlı Kıyafet Ütüsü', category: 'appliances', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Satılan Kıyafet / Parça Sayısı',
      unitLabel: 'Parça',
      priceLabel: 'Parça Başına Ortalama Satış Tutarı',
      defaultVolume: 18,
      minVolume: 5,
      maxVolume: 50,
      stepVolume: 1,
      avgTicketPrice: 850,
      grossMarginPercent: 46,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'carbon_vent', name: 'Karbon Filtreli Koku Tahliye Havalandırma Sistemi', category: 'mandatory', unitCost: 35000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'İl Tarım koku ve hijyen yönetmeliği şartı.' },
      { id: 'steel_shelves', name: 'Ağır Yük Çelik Mama Rafları ve Ahşap Aksesuar Teşhir Üniteleri', category: 'furniture', unitCost: 16000, defaultQty: 6, minQty: 2, isLocked: false, unitLabel: 'Ünite', scalesWithM2: true, m2Ratio: 10 },
      { id: 'pos_cash', name: 'Barkod POS Kasası, Para Çekmecesi & Barkod Okuyucu', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Mama & Aksesuar Müşterisi',
      unitLabel: 'Sepet',
      priceLabel: 'Ortalama Müşteri Sepet Tutarı',
      defaultVolume: 30,
      minVolume: 10,
      maxVolume: 80,
      stepVolume: 2,
      avgTicketPrice: 520,
      grossMarginPercent: 30,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'copier_heavy', name: 'Yüksek Hızlı A3/A4 Renkli Lazer Çok Fonksiyonlu Fotokopi Makinesi', category: 'core_tech', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'binding_mach', name: 'Spiralleme, Laminasyon & Giyotin Kağıt Kesme Tezgahı', category: 'appliances', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'book_racks', name: 'Ahşap Kitaplıklar, Kalem Standları ve Kırtasiye Rafları', category: 'furniture', unitCost: 14000, defaultQty: 6, minQty: 2, isLocked: false, unitLabel: 'Ünite', scalesWithM2: true, m2Ratio: 12 },
      { id: 'pos_cash', name: 'Kasa POS, Barkod Okuyucu & Kilitli Para Kasası', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Kırtasiye & Baskı Müşterisi',
      unitLabel: 'Müşteri',
      priceLabel: 'Ortalama Müşteri Fiş Tutarı',
      defaultVolume: 110,
      minVolume: 35,
      maxVolume: 280,
      stepVolume: 5,
      avgTicketPrice: 120,
      grossMarginPercent: 44,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'flower_fridge', name: 'Çift Camlı Kesme Çiçek Soğutma Dolabı (Sıcaklık ve Nem Kontrollü)', category: 'appliances', unitCost: 58000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
      { id: 'craft_table', name: 'Ahşap/Mermer Buket Tasarım Tezgahı & Paketleme Standı', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'plant_stands', name: 'Saksı Bitkileri Merdiven Rafları ve Askılıklar', category: 'furniture', unitCost: 14000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 25 },
      { id: 'pos_cash', name: 'Kasa POS, Para Çekmecesi & Barkod Okuyucu', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Buket & Çiçek Siparişi',
      unitLabel: 'Sipariş',
      priceLabel: 'Buket Başına Ortalama Sipariş Tutarı',
      defaultVolume: 22,
      minVolume: 6,
      maxVolume: 65,
      stepVolume: 1,
      avgTicketPrice: 480,
      grossMarginPercent: 52,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'esd_bench', name: 'ESD Antistatik Topraklamalı Servis Masası', category: 'mandatory', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 25, regulatoryNote: 'Statik elektrik koruma standardı.' },
      { id: 'solder_station', name: 'Sıcak Hava Lehim İstasyonu, Dijital Mikroskop & Ekran Ayırıcı', category: 'machinery', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'case_stands', name: 'Işıklı Kılıf Duvar Panelleri ve Cam Kilitli Telefon Vitrinleri', category: 'furniture', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Sistem', scalesWithM2: true, m2Ratio: 25 },
      { id: 'pos_cash', name: 'Barkod POS Kasası & Kilitli Para Kasası', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 40 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Tamir & Aksesuar Satışı',
      unitLabel: 'İşlem',
      priceLabel: 'İşlem Başına Ortalama Tutar',
      defaultVolume: 24,
      minVolume: 8,
      maxVolume: 60,
      stepVolume: 1,
      avgTicketPrice: 420,
      grossMarginPercent: 58,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 2, minQty: 2, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'dyno_test', name: '4x4 Dinamometre Motor Gücü Test Cihazı', category: 'machinery', unitCost: 340000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Hat' },
      { id: 'brake_test', name: 'Fren Test, Süspansiyon & Yanal Kayma Parkuru', category: 'machinery', unitCost: 260000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Hat' },
      { id: 'exhaust_vent', name: 'Egzoz Gazı Tahliye & Havalandırma Sistemi', category: 'mandatory', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Sistem', regulatoryNote: 'TSE 13805 zorunlu havalandırma standardı.' },
      { id: 'paint_meter', name: 'Dijital Boya Kalınlık Ölçüm Cihazları (2 Adet) & OBD Arıza Tespit Cihazı', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'car_lift', name: 'Araç Altı İnceleme Lifti (4 Tonluk Hidrolik Lift)', category: 'machinery', unitCost: 95000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 90 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Ekspertiz Yapılan Araç Sayısı',
      unitLabel: 'Araç',
      priceLabel: 'Araç Başına Full Paket Ekspertiz Bedeli',
      defaultVolume: 8,
      minVolume: 2,
      maxVolume: 25,
      stepVolume: 1,
      avgTicketPrice: 3400,
      grossMarginPercent: 72,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'wash_pumps', name: '200 Bar Sıcak/Soğuk Sanayi Tipi Basınçlı Yıkama Makineleri', category: 'machinery', unitCost: 24000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 75 },
      { id: 'foam_tank', name: 'Paslanmaz Köpük Tankı (60L) ve 500L Kompresör', category: 'appliances', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'vac_cleaners', name: '3 Motorlu Islak-Kuru Sanayi Tipi Süpürgeler', category: 'appliances', unitCost: 11000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 75 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Yıkanan Araç Sayısı',
      unitLabel: 'Araç',
      priceLabel: 'Araç Başına Ortalama Yıkama/Kuaför Tutarı',
      defaultVolume: 32,
      minVolume: 10,
      maxVolume: 75,
      stepVolume: 2,
      avgTicketPrice: 450,
      grossMarginPercent: 65,
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
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'air_compressor_500', name: '500 Litre Sanayi Tipi Pistonlu Hava Kompresörü', category: 'mandatory', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Pnömatik servis güvenlik standardı.' },
      { id: 'tire_changer', name: 'Pnömatik Otomatik Lastik Sökme-Takma Makinesi (Run-Flat Destekli)', category: 'machinery', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'balancer', name: 'Dijital 3D Ekranlı Lastik Balans Makinesi', category: 'machinery', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'jacks_set', name: '3 Tonluk Düşük Profil Hidrolik Krikolar ve Sehpa Seti', category: 'machinery', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'hotel_racks', name: 'Lastik Oteli Ağır Yük Depolama Rafları', category: 'furniture', unitCost: 32000, defaultQty: 2, minQty: 0, isLocked: false, unitLabel: 'Sistem', scalesWithM2: true, m2Ratio: 50 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Lastik & Servis İşlemi',
      unitLabel: 'Araç',
      priceLabel: 'Araç Başına Ortalama Servis Tutarı',
      defaultVolume: 18,
      minVolume: 5,
      maxVolume: 50,
      stepVolume: 1,
      avgTicketPrice: 650,
      grossMarginPercent: 42,
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
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'dry_clean_machine', name: 'Kapalı Devre Çevre Dostu Kuru Temizleme Makinesi (12-15 kg)', category: 'machinery', unitCost: 280000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'steam_iron', name: 'Vakumlu ve Üflemeli Buharlı Paskala Ütü Tezgahı & Buhar Kazanı', category: 'appliances', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'conveyor', name: 'Motorlu Döner Elbise Askı Konveyörü (150-200 Parça)', category: 'furniture', unitCost: 42000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 50 },
      { id: 'stain_remover', name: 'Leke Çıkarma Tezgahı & Terzi Dikiş Makinesi', category: 'machinery', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'counter_pos', name: 'Karşılama Bankosu, Parça Barkod Yazıcısı & Kasa POS', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 },
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
      periodType: 'daily',
      volumeLabel: 'Günlük Kuru Temizleme Parça Sayısı',
      unitLabel: 'Parça',
      priceLabel: 'Parça Başına Ortalama Temizleme Ücreti',
      defaultVolume: 45,
      minVolume: 15,
      maxVolume: 120,
      stepVolume: 5,
      avgTicketPrice: 260,
      grossMarginPercent: 60,
      daysPerMonth: 26,
      description: 'Takım elbise, kaban, gelinlik, perde, ütü ve lostra hizmetleri.'
    },
    monthlyUtilitiesEstimate: 16000,
    monthlyAccountingFee: 2800,
  },

  // ================= 26. KREŞ & GÜNDÜZ BAKIMEVİ =================
  'kres-gunduz-bakimevi': {
    id: 'kres-gunduz-bakimevi',
    name: 'Kreş & Gündüz Bakımevi / Anaokulu',
    emoji: '👶',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 220,
    fitoutCostPerM2: 3500,
    legalBasis: 'Aile ve Sosyal Hizmetler Bakanlığı Özel Kreş ve Gündüz Bakımevleri Yönetmeliği',
    statutoryCapital: 300000,
    mandatoryLegalItems: [
      { name: 'Aile Bakanlığı Açılış İzin Harcı & Ruhsatı', cost: 45000, description: 'İl Aile ve Sosyal Hizmetler Müdürlüğü onay harcı' },
      { name: 'İtfaiye Yangın & Çift Kaçış Merdiveni Uygunluk Raporu', cost: 18000, description: 'Bina tahliye ve yangın güvenlik onayı' },
      { name: 'İl Sağlık Müdürlüğü Hijyen & Kapasite Raporu', cost: 12000, description: 'Grup odaları hava debisi ve aydınlatma onayı' },
      { name: 'Ticaret Sicil Şirket Kuruluş Harçları', cost: 24000, description: 'Ana sözleşme ve tescil' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü & Yangın Dolabı (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 3, minQty: 2, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 75, regulatoryNote: 'Özel Kreş Yönetmeliği yangın güvenlik şartı.' },
      { id: 'cctv_parent', name: 'Ebeveyn Canlı İzleme NVR Güvenlik Kamera Sistemi (16 Kamera)', category: 'core_tech', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', description: 'Tüm sınıfları ve bahçeyi kaydeden yüksek çözünürlüklü IP kamera seti.' },
      { id: 'kids_furniture', name: 'Ahşap Ergonomik Çocuk Aktivite Masası & Sandalye Seti (4 Grup)', category: 'furniture', unitCost: 42000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 50 },
      { id: 'soft_play', name: 'Yumuşak Zemin Kaplama, Top Havuzu & Eğitici Oyun Alanı', category: 'machinery', unitCost: 55000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'beds_rest', name: 'İstiflenebilir Anti-Bakteriyel Çocuk Yatakları & Uyku Seti (30 Adet)', category: 'furniture', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kitchen_inox', name: 'Paslanmaz Çelik Kreş Mutfak & Yemekhane Ekipmanları', category: 'appliances', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'smart_board', name: 'Etkileşimli Akıllı Eğitim Tahtası & Ses Sistemi', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_system', name: 'Merkezi Havalandırma & Filtreli Inverter Klimalar', category: 'appliances', unitCost: 58000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 80 }
    ],
    initialInventoryCost: 35000,
    initialInventoryDescription: 'Montessori materyalleri, boyama setleri, hijyen sarf malzemeleri ve ilk yardım kitleri.',
    softwareLicenseCost: { annual: 18000, monthlyMaintenance: 1200, name: 'Kreş Ebeveyn İletişim, Yemek & Yoklama Otomasyonu' },
    recommendedStaff: [
      { role: 'Kurum Müdürü (Çocuk Gelişimi / Okul Öncesi Lisans)', count: 1, avgSalary: 60000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Okul Öncesi Öğretmeni & Eğitmen', count: 2, avgSalary: 42000, isMandatory: true },
      { role: 'Yardımcı Bakıcı & Mutfak Personeli', count: 1, avgSalary: 30000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Aylık Kayıtlı Öğrenci Sayısı', unitPrice: 18000, targetUnitsPerDay: 20, unitLabel: 'Öğrenci' },
    revenueModel: {
      periodType: 'monthly',
      volumeLabel: 'Aylık Kayıtlı Öğrenci Sayısı',
      unitLabel: 'Öğrenci',
      priceLabel: 'Aylık Öğrenci Başı Kreş Ücreti',
      defaultVolume: 35,
      minVolume: 10,
      maxVolume: 80,
      stepVolume: 5,
      avgTicketPrice: 18000,
      grossMarginPercent: 65,
      daysPerMonth: 30,
      description: 'Tam gün bakım, kahvaltı, öğle yemeği, ikindi ve pedagojik eğitim paketi.'
    },
    monthlyUtilitiesEstimate: 18000,
    monthlyAccountingFee: 4000,
  },

  // ================= 27. KURYE & LOJİSTİK =================
  'lojistik-kurye': {
    id: 'lojistik-kurye',
    name: 'Kurye Dağıtım & Şehir İçi Lojistik',
    emoji: '🛵',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 40,
    fitoutCostPerM2: 2200,
    legalBasis: 'Ulaştırma ve Altyapı Bakanlığı Kargo ve Kurye Yönetmeliği (P2 / K1)',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Ulaştırma Bakanlığı P2 / Kurye Yetki Belgesi Harcı', cost: 65000, description: 'Şehir içi kargo/kurye işletme yetkilendirmesi' },
      { name: 'Şirket Kuruluş & Vergi Levhası', cost: 20000, description: 'Ticaret Sicil tescili' },
      { name: 'Belediye İşyeri Ruhsat Harcı', cost: 10000, description: 'Lojistik ofis ruhsatı' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'dispatch_server', name: 'Kurye Rota Optimizasyon Sunucusu & Çoklu Çağrı PC İstasyonu', category: 'core_tech', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', description: 'Canlı GPS kurye haritası ve sipariş dağıtım terminali.' },
      { id: 'barcode_scanners', name: 'Endüstriyel El Terminalleri & Barkod/Karekod Okuyucular (4 Adet)', category: 'core_tech', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'secure_racks', name: 'Kilitli Emanet & Paket Ayrıştırma Raf Sistemi', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'courier_gear', name: 'Kurye Güvenlik Ekipman Seti (DOT Kask, Reflektörlü Mont, Termal Çantalar - 4 Kurye)', category: 'mandatory', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'cctv_kit', name: 'Güvenlik Kamera Sistemi (Ofis & Depo)', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' }
    ],
    initialInventoryCost: 18000,
    initialInventoryDescription: 'Kargo zarfları, hava kabarcıklı poşetler, bantlar ve fatura fiş ruloları.',
    softwareLicenseCost: { annual: 24000, monthlyMaintenance: 1600, name: 'Canlı Kurye Takip, Mobil Sürücü Uygulaması & Müşteri Takip API' },
    recommendedStaff: [
      { role: 'Operasyon & Filo Sorumlusu', count: 1, avgSalary: 45000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Motorlu Kurye', count: 3, avgSalary: 35000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Günlük Teslim Edilen Paket / Gönderi', unitPrice: 75, targetUnitsPerDay: 85, unitLabel: 'Paket / Gün' },
    revenueModel: {
      periodType: 'daily',
      volumeLabel: 'Günlük Teslim Edilen Paket Sayısı',
      unitLabel: 'Paket',
      priceLabel: 'Paket Başına Ortalama Teslimat Ücreti',
      defaultVolume: 140,
      minVolume: 40,
      maxVolume: 450,
      stepVolume: 20,
      avgTicketPrice: 75,
      grossMarginPercent: 45,
      daysPerMonth: 26,
      description: 'E-ticaret aynı gün teslimat, restoran kurye kiralama ve kurumsal evrak taşıma.'
    },
    monthlyUtilitiesEstimate: 8000,
    monthlyAccountingFee: 3000,
  },

  // ================= 28. MİMARLIK & MÜHENDİSLİK =================
  'mimarlik-muhendislik': {
    id: 'mimarlik-muhendislik',
    name: 'Mimarlık & Mühendislik Proje Ofisi',
    emoji: '📐',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 55,
    fitoutCostPerM2: 2800,
    legalBasis: 'TMMOB Mimarlar Odası / İnşaat Mühendisleri Odası Büro Tescil Belgesi (BTB)',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'TMMOB Oda Kayıt & Büro Tescil Belgesi (BTB) Harcı', cost: 22000, description: 'Oda serbest mimarlık/mühendislik tescili' },
      { name: 'Limited Şirket / Şahıs Kuruluş & Tescil Harcı', cost: 18000, description: 'Ticaret Sicil tescili' },
      { name: 'Belediye İşyeri Ruhsat Harcı', cost: 9500, description: 'Ofis çalışma ruhsatı' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'render_workstations', name: 'Yüksek Performanslı 3D Render & BIM İş İstasyonları (Çift Monitör - 2 Adet)', category: 'core_tech', unitCost: 75000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', description: 'RTX ekran kartlı, 64GB RAM mimari çizim ve render PC takımları.' },
      { id: 'plotter_a0', name: 'A0 Geniş Format Renkli Mühendislik Plotter / Çizici', category: 'machinery', unitCost: 65000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'plan_archive', name: 'Çelik Yatay Pafta & Proje Arşiv Dolabı', category: 'furniture', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'meeting_table', name: 'Müşteri Proje Sunum & Müzakere Toplantı Masası Grubu', category: 'furniture', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'presentation_screen', name: '55 inç 4K 3D Render ve Proje Sunum Ekranı', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 }
    ],
    initialInventoryCost: 12000,
    initialInventoryDescription: 'A0/A1 plotter rulo kağıtları, kartuşlar, numune malzeme katalogları ve kurumsal dosyalar.',
    softwareLicenseCost: { annual: 48000, monthlyMaintenance: 2800, name: 'BIM / CAD & 3D Mimari Modelleme Lisans Paketi (Autodesk Revit / Archicad / Lumion)' },
    recommendedStaff: [
      { role: 'Yönetici Mimar / İnşaat Mühendisi (İmza Yetkili)', count: 1, avgSalary: 70000, isMandatory: true, allowOwnerFulfillment: true },
      { role: '3D Görselleştirme & Çizim Teknikeri', count: 1, avgSalary: 42000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Aylık Tamamlanan Proje Sayısı', unitPrice: 75000, targetUnitsPerDay: 1, unitLabel: 'Proje / Ay' },
    revenueModel: {
      periodType: 'monthly',
      volumeLabel: 'Aylık Tamamlanan Proje Sayısı',
      unitLabel: 'Proje',
      priceLabel: 'Proje Başına Ortalama Mimari / Statik Tasarım Ücreti',
      defaultVolume: 3,
      minVolume: 1,
      maxVolume: 10,
      stepVolume: 1,
      avgTicketPrice: 75000,
      grossMarginPercent: 75,
      daysPerMonth: 30,
      description: 'Ruhsat projeleri, iç mekan konsept tasarım, şantiye kontrollüğü ve 3D görselleştirme.'
    },
    monthlyUtilitiesEstimate: 6000,
    monthlyAccountingFee: 3200,
  },

  // ================= 29. PASTANE & TATLICI =================
  'tatlici-pastane': {
    id: 'tatlici-pastane',
    name: 'Pastane, Tatlıcı & Butik Fırın',
    emoji: '🍰',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 75,
    fitoutCostPerM2: 4500,
    legalBasis: 'Tarım ve Orman Bakanlığı Gıda Hijyeni Yönetmeliği',
    statutoryCapital: 100000,
    mandatoryLegalItems: [
      { name: 'Tarım ve Orman Bakanlığı Gıda İşletme Onay Belgesi', cost: 18000, description: 'Gıda üretim ve satış izin tescili' },
      { name: 'Belediye Sıhhi Müessese Ruhsatı', cost: 15000, description: 'Pastane açılış ruhsatı' },
      { name: 'İtfaiye Baca ve Yangın Uygunluk Raporu', cost: 9000, description: 'Fırın bacası onay raporu' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü (6kg ABC) & Yangın Battaniyesi', category: 'mandatory', unitCost: 4500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 75 },
      { id: 'cake_showcase', name: 'Nem Ayarlı LED Işıklı Yatay Pasta Teşhir Dolabı (2.5 Metre)', category: 'appliances', unitCost: 78000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', description: 'Pastaların kurumasını önleyen cam vitrinli buzdolabı.' },
      { id: 'convection_oven', name: 'Konveksiyonel 4 Tepsili Buharlı Pasta & Börek Fırını', category: 'machinery', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'planetary_mixer', name: 'Planet Mikser (20 Litre) & Hamur Yoğurma Makinesi', category: 'machinery', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'inox_workbenches', name: 'Paslanmaz Çelik Mermer Tezgahlı Çalışma Bankoları', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'espresso_tea', name: 'Çift Gruplu Espresso Kahve Makinesi & Otomatik Çay Kazanı', category: 'appliances', unitCost: 42000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'patisserie_tables', name: 'İç & Dış Mekan Müşteri Masaları ve Sandalyeleri (6 Masa Takımı)', category: 'furniture', unitCost: 36000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 20 },
      { id: 'pos_counter', name: 'Dokunmatik Kasa POS, Barkodlu Terazi & Çekmece', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 }
    ],
    initialInventoryCost: 65000,
    initialInventoryDescription: 'Un, tereyağı, Belçika çikolatası, fıstık, meyve püreleri, pasta kutuları ve ambalaj malzemeleri.',
    softwareLicenseCost: { annual: 12000, monthlyMaintenance: 950, name: 'Pastane Adisyon, Reçete Maliyet & Hızlı Satış POS Yazılımı' },
    recommendedStaff: [
      { role: 'Baş Pastacı & Tatlı Ustası', count: 1, avgSalary: 55000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Servis, Barista & Kasa Personeli', count: 1, avgSalary: 32000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Günlük Satılan Pasta / Tatlı Porsiyonu', unitPrice: 150, targetUnitsPerDay: 50, unitLabel: 'Porsiyon / Gün' },
    revenueModel: {
      periodType: 'daily',
      volumeLabel: 'Günlük Satılan Pasta & Tatlı Porsiyon Sayısı',
      unitLabel: 'Porsiyon',
      priceLabel: 'Porsiyon Başına Ortalama Satış Fiyatı',
      defaultVolume: 90,
      minVolume: 30,
      maxVolume: 250,
      stepVolume: 10,
      avgTicketPrice: 150,
      grossMarginPercent: 62,
      daysPerMonth: 30,
      description: 'Özel tasarım yaş pastalar, kuru pasta, baklava, kruvasan ve sıcak/soğuk kahve içecekleri.'
    },
    monthlyUtilitiesEstimate: 17000,
    monthlyAccountingFee: 3200,
  },

  // ================= 30. PSİKOLOJİK DANIŞMANLIK =================
  'psikolojik-danismanlik': {
    id: 'psikolojik-danismanlik',
    name: 'Psikolojik Danışmanlık & Terapi',
    emoji: '🧠',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 55,
    fitoutCostPerM2: 2600,
    legalBasis: 'İl Sağlık Müdürlüğü ve Aile ve Sosyal Hizmetler İl Müdürlüğü Danışmanlık Yönetmeliği',
    statutoryCapital: 50000,
    mandatoryLegalItems: [
      { name: 'Aile Danışma Merkezi / Danışmanlık Açılış İzni', cost: 20000, description: 'Resmi danışmanlık merkezi açılış harcı' },
      { name: 'Şahıs / Limited Şirket Kuruluşu', cost: 15000, description: 'Vergi levhası ve oda tescili' },
      { name: 'Belediye İşyeri Ruhsat Harcı', cost: 9000, description: 'Danışmanlık ofis ruhsatı' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Tüpü (6kg ABC)', category: 'mandatory', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100 },
      { id: 'acoustic_panels', name: 'Akustik Ses Yalıtımlı Terapi Odası Kapı & Duvar Panelleri', category: 'furniture', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', description: 'Danışan gizliliği için ses yalıtım sistemi.' },
      { id: 'therapy_armchairs', name: 'Ortopedik Konforlu Terapi Koltuk Grubu & Sehpa Seti', category: 'furniture', unitCost: 24000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'white_noise', name: 'Beyaz Gürültü (White Noise) Ses Maskeleme Cihazı', category: 'core_tech', unitCost: 6500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'psychology_tests', name: 'Akredite Psikolojik Test & Değerlendirme Materyalleri Kiti', category: 'core_tech', unitCost: 18000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'reception_lounge', name: 'Danışan Bekleme Odası Koltukları & Dinlendirici Işık Ünitesi', category: 'furniture', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'pc_setup', name: 'Danışan Kayıt PC, Yazıcı & Kilitli Gizli Evrak Arşivi', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 }
    ],
    initialInventoryCost: 8000,
    initialInventoryDescription: 'Danışan formları, test materyalleri, aromaterapi difüzörleri ve ikram paketleri.',
    softwareLicenseCost: { annual: 10000, monthlyMaintenance: 750, name: 'Danışan Randevu, Online Terapi Entegrasyonu & KVKK Uyumlu Not Yazılımı' },
    recommendedStaff: [
      { role: 'Uzman Klinik Psikolog / Aile Danışmanı', count: 1, avgSalary: 65000, isMandatory: true, allowOwnerFulfillment: true }
    ],
    breakEvenMetric: { label: 'Günlük Terapi / Danışmanlık Seansı', unitPrice: 1800, targetUnitsPerDay: 2, unitLabel: 'Seans / Gün' },
    revenueModel: {
      periodType: 'daily',
      volumeLabel: 'Günlük Tamamlanan Terapi Seansı Sayısı',
      unitLabel: 'Seans',
      priceLabel: 'Seans Başına Ortalama Terapi Ücreti',
      defaultVolume: 5,
      minVolume: 1,
      maxVolume: 12,
      stepVolume: 1,
      avgTicketPrice: 1800,
      grossMarginPercent: 88,
      daysPerMonth: 24,
      description: 'Bireysel yetişkin terapisi, çift ve aile danışmanlığı, çocuk-ergen terapisi ve kurumsal eğitimler.'
    },
    monthlyUtilitiesEstimate: 5000,
    monthlyAccountingFee: 2800,
  },

  // ================= 31. SÜRÜCÜ KURSU =================
  'surucu-kursu': {
    id: 'surucu-kursu',
    name: 'Sürücü Kursu & MTSK Merkezi',
    emoji: '🚗',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 140,
    fitoutCostPerM2: 3000,
    legalBasis: 'MEB Özel Motorlu Taşıt Sürücüleri Kursu Yönetmeliği',
    statutoryCapital: 250000,
    mandatoryLegalItems: [
      { name: 'MEB Özel Öğretim Kurumu Açılış İzin Harcı & Ruhsatı', cost: 42000, description: 'İl Milli Eğitim Müdürlüğü açılış tescili' },
      { name: 'İtfaiye ve MEB Derslik Uygunluk Raporu', cost: 16000, description: 'Tahliye ve aydınlatma onayı' },
      { name: 'Şirket Kuruluş ve Ticaret Sicil Gazetesi', cost: 22000, description: 'Şirket ana sözleşme tescili' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü & İlkyardım Dolabı', category: 'mandatory', unitCost: 4500, defaultQty: 2, minQty: 2, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 75 },
      { id: 'driver_simulator', name: 'MEB Onaylı 3 Ekranlı Sürücü Eğitim Simülatörü', category: 'machinery', unitCost: 95000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', description: 'MEB mevzuatınca zorunlu simülatör cihazı.' },
      { id: 'classroom_desks', name: 'Trafik & İlkyardım Derslik Sıraları & Sandalyeleri (20 Kişilik)', category: 'furniture', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'engine_cutout_model', name: 'Kesit Motor ve Şanzıman Mekanik Eğitim Maketi', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'smart_board_meb', name: 'Derslik Akıllı Tahta & Projeksiyon Sistemi', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'admin_furniture', name: 'Müdür Odası, Öğretmenler Odası ve Kayıt Masaları', category: 'furniture', unitCost: 32000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Derslik & İdare Inverter Klimalar (2 Adet)', category: 'appliances', unitCost: 48000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 70 }
    ],
    initialInventoryCost: 15000,
    initialInventoryDescription: 'Trafik ders kitapları, ilkyardım mankenleri, makbuzlar ve MEBBİS formları.',
    softwareLicenseCost: { annual: 16000, monthlyMaintenance: 1100, name: 'MEBBİS Entegre Sürücü Kursu Otomasyonu, e-Sınav & Ders Takip Yazılımı' },
    recommendedStaff: [
      { role: 'Kurum Müdürü (MEB Şartlarını Taşıyan Lisans Mezunu)', count: 1, avgSalary: 55000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Direksiyon & Trafik Usta Öğreticisi', count: 2, avgSalary: 40000, isMandatory: true }
    ],
    breakEvenMetric: { label: 'Aylık Yeni Ehliyet Kursiyer Kaydı', unitPrice: 16000, targetUnitsPerDay: 18, unitLabel: 'Kursiyer / Ay' },
    revenueModel: {
      periodType: 'monthly',
      volumeLabel: 'Aylık Yeni Kayıt Olan Kursiyer Sayısı',
      unitLabel: 'Kursiyer',
      priceLabel: 'Kursiyer Başına Ortalama Ehliyet Eğitim Ücreti (B Sınıfı)',
      defaultVolume: 32,
      minVolume: 10,
      maxVolume: 90,
      stepVolume: 2,
      avgTicketPrice: 16000,
      grossMarginPercent: 55,
      daysPerMonth: 30,
      description: 'B sınıfı otomobil, A sınıfı motosiklet, özel direksiyon dersleri ve SRC belgesi eğitimleri.'
    },
    monthlyUtilitiesEstimate: 14000,
    monthlyAccountingFee: 3500,
  },

  // ================= 32. VETERİNER KLİNİĞİ =================
  'veteriner-klinigi': {
    id: 'veteriner-klinigi',
    name: 'Veteriner Kliniği & Hayvan Hastanesi',
    emoji: '🩺',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 85,
    fitoutCostPerM2: 4800,
    legalBasis: 'Tarım ve Orman Bakanlığı Veteriner Teşhis ve Tedavi Merkezleri Yönetmeliği',
    statutoryCapital: 200000,
    mandatoryLegalItems: [
      { name: 'Tarım ve Orman Bakanlığı Veteriner Kliniği Ruhsat Harcı', cost: 35000, description: 'İl Tarım Müdürlüğü klinik tescili' },
      { name: 'TAEK / NDK Röntgen Cihazı Lisans ve Zırhlama Onayı', cost: 28000, description: 'Röntgen odası kurşun zırhlama ve TAEK lisansı' },
      { name: 'Veteriner Hekimler Odası Tescil Harcı', cost: 16000, description: 'Oda üye ve klinik levhası' },
      { name: 'Belediye İşyeri Açma Ruhsatı', cost: 12000, description: 'Sıhhi müessese ruhsatı' }
    ],
    equipments: [
      { id: 'fire_ext', name: 'Yangın Söndürme Tüpü & Medikal Atık Kutusu', category: 'mandatory', unitCost: 4500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 85 },
      { id: 'dr_xray', name: 'Yüksek Frekanslı Dijital Veteriner Röntgen (DR) Sistemi', category: 'machinery', unitCost: 240000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', description: 'Kurşun zırhlı oda için doğrudan dijital röntgen dedektörü ve jeneratör.' },
      { id: 'blood_analyzer', name: 'Otomatik Veteriner Biyokimya & Hemogram Kan Sayım Cihazı', category: 'core_tech', unitCost: 110000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'operation_table', name: 'Paslanmaz Hidrolik Cerrahi Operasyon Masası & Tavan Skialitik Lambası', category: 'machinery', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'autoclave_vet', name: 'B Sınıfı Medikal Otoklav Sterilizatör & Cerrahi El Aletleri Seti', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'icu_cages', name: 'Paslanmaz Çelik Hasta Hayvan Post-Op & Yoğun Bakım Kafes Ünitesi (6 Bölmeli)', category: 'furniture', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'vaccine_fridge', name: 'Dijital Sıcaklık Takip Kayıtlı Aşı ve İlaç Medikal Buzdolabı', category: 'appliances', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'examination_table', name: 'Muayene Masası, Hasta Tartısı & Otoskop/Oftalmoskop Kiti', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ac_unit', name: 'Inverter Split Klima (18.000 BTU)', category: 'appliances', unitCost: 29500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 45 }
    ],
    initialInventoryCost: 85000,
    initialInventoryDescription: 'Aşılar, antibiyotikler, anestezi ilaçları, serumlar, bandaj ve cerrahi sarf malzemeleri.',
    softwareLicenseCost: { annual: 16000, monthlyMaintenance: 1200, name: 'Veteriner Hasta Takip, Aşı Hatırlatma, Çip & e-Reçete (İTS/ATS) Entegrasyonu' },
    recommendedStaff: [
      { role: 'Sorumlu Veteriner Hekim (Klinik Sahibi)', count: 1, avgSalary: 75000, isMandatory: true, allowOwnerFulfillment: true },
      { role: 'Veteriner Sağlık Teknikeri & Yardımcı', count: 1, avgSalary: 38000, isMandatory: false }
    ],
    breakEvenMetric: { label: 'Günlük Muayene, Aşı & Operasyon Sayısı', unitPrice: 1250, targetUnitsPerDay: 6, unitLabel: 'İşlem / Gün' },
    revenueModel: {
      periodType: 'daily',
      volumeLabel: 'Günlük Tamamlanan Muayene, Aşı & Tedavi Sayısı',
      unitLabel: 'İşlem',
      priceLabel: 'İşlem Başına Ortalama Veterinerlik Hizmet Geliri',
      defaultVolume: 14,
      minVolume: 3,
      maxVolume: 35,
      stepVolume: 1,
      avgTicketPrice: 1250,
      grossMarginPercent: 68,
      daysPerMonth: 26,
      description: 'Muayene, aşı takvimi, kısırlaştırma cerrahisi, dijital röntgen, laboratuvar tahlilleri ve pet pansiyon.'
    },
    monthlyUtilitiesEstimate: 12000,
    monthlyAccountingFee: 3200,
  },

  // ================= YENİ EKLENEN 22 POPÜLER MESLEK & SEKTÖR =================
  'bubble-tea-bar': {
  "id": "bubble-tea-bar",
  "name": "Bubble Tea & Özel İçecek Barı",
  "emoji": "🧋",
  "categoryGroup": "Yeme - İçme",
  "defaultM2": 35,
  "fitoutCostPerM2": 3800,
  "legalBasis": "5996 Sayılı Gıda ve Yem Kanunu & İlçe Tarım İşletme Kayıt Tebliği",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "İlçe Tarım Gıda İşletme Kayıt Belgesi",
      "cost": 16000,
      "description": "Gıda ve içecek hazırlama/satış resmi tescili"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 14000,
      "description": "İlçe belediyesi ticari işletme ruhsat harcı"
    },
    {
      "name": "İtfaiye Yangın & Tahliye Uygunluk Raporu",
      "cost": 7500,
      "description": "İşyeri yangın güvenliği onay raporu"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Seti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "cup_sealer",
      "name": "Otomatik Dijital Bardak Kapatma (Cup Sealing) Makinesi",
      "category": "machinery",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "description": "Bubble tea bardaklarını sızdırmaz film ile presleyen ünite."
    },
    {
      "id": "shaker_machine",
      "name": "Çift Kollu Otomatik İçecek Çalkalama (Shaker) Makinesi",
      "category": "machinery",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "fructose_dispenser",
      "name": "Hassas Dijital Fruktoz & Şurup Dozajlama Dispenseri (16 Buton)",
      "category": "machinery",
      "unitCost": 19500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "tea_brewer",
      "name": "Otomatik Çay Demleme & Sıcak Tutma Termos İstasyonu (3 Gözlü)",
      "category": "machinery",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ice_maker",
      "name": "Endüstriyel Gurme Kar Buz Yapma Makinesi (Günde 80kg)",
      "category": "appliances",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "tapioca_cooker",
      "name": "Otomatik Karıştırmalı Manyetik Boba/Tapyoka Pişirme Kazanı",
      "category": "machinery",
      "unitCost": 21000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "undercounter_fridge",
      "name": "Tezgah Altı Paslanmaz Bar Soğutucusu & Gastronom Küvetler",
      "category": "appliances",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "pos_system",
      "name": "Dokunmatik POS Kasa, Barkod Okuyucu & Termal Sipariş Yazıcı",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "bar_seating",
      "name": "Gençlik Konsepti Bar Tabureleri & Küçük Bistro Masalar",
      "category": "furniture",
      "unitCost": 6500,
      "defaultQty": 4,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 10
    },
    {
      "id": "neon_signboard",
      "name": "Işıklı Neon Tabela & Dijital Menü Board Ekranı",
      "category": "core_tech",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    }
  ],
  "initialInventoryCost": 55000,
  "initialInventoryDescription": "Tapyoka incileri, patlayan meyveli bobalar, yasemin yeşil çayı, siyah Seylan çayı, meyve püreleri, özel süt tozları, kalın pipetler ve logo baskılı bardaklar.",
  "softwareLicenseCost": {
    "annual": 14000,
    "monthlyMaintenance": 1100,
    "name": "Restoran Bulut POS, Sadakat Kart & Online Paket Entegrasyonu"
  },
  "recommendedStaff": [
    {
      "role": "Bubble Tea Baristası & Hazırlık Görevlisi",
      "count": 1,
      "avgSalary": 32000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Kasa & Sipariş Karşılama Elemanı",
      "count": 1,
      "avgSalary": 26000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Satılan Bubble Tea Bardağı",
    "unitPrice": 140,
    "targetUnitsPerDay": 70,
    "unitLabel": "Bardak / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Bubble Tea & Özel İçecek Satışı",
    "unitLabel": "Bardak",
    "priceLabel": "Ortalama Bardak Fiyatı",
    "defaultVolume": 120,
    "minVolume": 40,
    "maxVolume": 350,
    "stepVolume": 10,
    "avgTicketPrice": 140,
    "grossMarginPercent": 72,
    "daysPerMonth": 30,
    "description": "Sütlü çaylar, meyveli buzlu çaylar, smoothie ve waffle çubukları satışından oluşan ortalama günlük sepet."
  },
  "monthlyUtilitiesEstimate": 11500,
  "monthlyAccountingFee": 3000
},

  'butik-burger': {
  "id": "butik-burger",
  "name": "Butik Burger & Sokak Lezzetleri",
  "emoji": "🍔",
  "categoryGroup": "Yeme - İçme",
  "defaultM2": 65,
  "fitoutCostPerM2": 4500,
  "legalBasis": "Gıda Hijyen Yönetmeliği & İlçe Tarım ve Orman Müdürlüğü Kayıt Tebliği",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "İlçe Tarım Gıda Üretim & Satış Kayıt Belgesi",
      "cost": 18000,
      "description": "Et ve sıcak yemek işleme resmi ruhsatı"
    },
    {
      "name": "İtfaiye Baca, Davlumbaz & Yangın Raporu",
      "cost": 18000,
      "description": "Ağır duman/koku tahliye uygunluk izni"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 16000,
      "description": "Restoran açılış ruhsatı ve çevre temizlik harcı"
    }
  ],
  "equipments": [
    {
      "id": "exhaust_hood",
      "name": "Elektrostatik Filtreli Paslanmaz Sanayi Davlumbaz & Emiş Motoru",
      "category": "mandatory",
      "unitCost": 65000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Sistem",
      "regulatoryNote": "İtfaiye ve çevre sağlık yönetmeliği koku filtresi şartı."
    },
    {
      "id": "fire_ext",
      "name": "Davlumbaz İçi Otomatik Yangın Söndürme Sistemi (K Tipi)",
      "category": "mandatory",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Sistem",
      "regulatoryNote": "Mutfak Yangın Yönetmeliği zorunlu otomatik söndürme tertibatı."
    },
    {
      "id": "griddle_plate",
      "name": "Krom Kaplama Döküm Gazlı Smash Burger Pleyt Izgarası (90 cm)",
      "category": "machinery",
      "unitCost": 48000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet"
    },
    {
      "id": "fryer_double",
      "name": "Çift Hazneli Termostatlı Endüstriyel Fritöz (2x12 Litre)",
      "category": "machinery",
      "unitCost": 36000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set"
    },
    {
      "id": "bun_toaster",
      "name": "Dikey Karamelize Burger Ekmeği Kızartma Makinesi",
      "category": "machinery",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "prep_fridge",
      "name": "Üstten Gastronom Soğutuculu Paslanmaz Burger Hazırlık Tezgahı",
      "category": "appliances",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "meat_grinder",
      "name": "Soğutmalı Paslanmaz Kıyma Makinesi & Smash Burger Presi",
      "category": "machinery",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "drink_cooler",
      "name": "Çift Kapılı Dik Camlı Meşrubat & Sos Teşhir Dolabı",
      "category": "appliances",
      "unitCost": 34000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "pos_kitchen",
      "name": "Dokunmatik Kasa POS + Mutfak KDS Ekranı & Adisyon Yazıcı",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "dining_tables",
      "name": "Endüstriyel Ahşap/Metal Burger Masaları & Sandalye Grubu (8 Takım)",
      "category": "furniture",
      "unitCost": 9500,
      "defaultQty": 8,
      "minQty": 2,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 8
    },
    {
      "id": "ac_unit",
      "name": "Salon Tipi Yüksek Debili Ticari Klima (24.000 BTU)",
      "category": "appliances",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 50
    },
    {
      "id": "signboard",
      "name": "Retro Işıklı Kutu Harf Tabela & Cephe Aydınlatması",
      "category": "core_tech",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 95000,
  "initialInventoryDescription": "Taze dana döş kıyma, tereyağlı brioche ekmekleri, cheddar peyniri, trüf/füme/özel burger sosları, patates kızartması ve kraft paket servis kutuları.",
  "softwareLicenseCost": {
    "annual": 18000,
    "monthlyMaintenance": 1400,
    "name": "Restoran Bulut POS, Yemeksepeti/Getir/Trendyol Çoklu Sipariş Entegratörü"
  },
  "recommendedStaff": [
    {
      "role": "Smash Burger Ustası & Şef",
      "count": 1,
      "avgSalary": 45000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Fritöz / Hazırlık & Paketleme Elemanı",
      "count": 1,
      "avgSalary": 30000,
      "isMandatory": false
    },
    {
      "role": "Kasa & Salon Görevlisi",
      "count": 1,
      "avgSalary": 26000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Satılan Burger Menü Adedi",
    "unitPrice": 320,
    "targetUnitsPerDay": 55,
    "unitLabel": "Menü / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Burger & Yan Lezzet Siparişi",
    "unitLabel": "Menü",
    "priceLabel": "Ortalama Menü Fiş Tutarı",
    "defaultVolume": 110,
    "minVolume": 35,
    "maxVolume": 300,
    "stepVolume": 5,
    "avgTicketPrice": 320,
    "grossMarginPercent": 62,
    "daysPerMonth": 30,
    "description": "Salonda tüketim ve paket servis platformlarından (Yemeksepeti, Getir, Trendyol) oluşan toplam siparişler."
  },
  "monthlyUtilitiesEstimate": 18000,
  "monthlyAccountingFee": 3400
},

  'dondurma-gelato': {
  "id": "dondurma-gelato",
  "name": "Artisan Dondurmacı & Gelato Barı",
  "emoji": "🍨",
  "categoryGroup": "Yeme - İçme",
  "defaultM2": 40,
  "fitoutCostPerM2": 4000,
  "legalBasis": "5996 Sayılı Gıda Güvenliği Kanunu & Süt Ürünleri Hijyen Tebliği",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "İlçe Tarım Dondurma Üretim ve Satış İzni",
      "cost": 16000,
      "description": "Sütlü tatlı ve dondurma imalat tescili"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 14000,
      "description": "Ruhsat ve çevre temizlik harcı"
    },
    {
      "name": "İtfaiye Yangın & Güvenlik Raporu",
      "cost": 7500,
      "description": "Yangın güvenliği uygunluk onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Seti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "gelato_machine",
      "name": "İtalyan Tipi Endüstriyel Dondurma & Gelato Yapıcı (Batch Freezer)",
      "category": "machinery",
      "unitCost": 185000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "description": "Taze sütten dakikada kremsi artisan gelato üreten makine."
    },
    {
      "id": "pasteurizer",
      "name": "Süt Pastörizatörü & Dondurma Miks Hazırlama Kazanı (30 Litre)",
      "category": "machinery",
      "unitCost": 65000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "blast_chiller",
      "name": "Şok Dondurucu Dolap (-40°C Hızlı Şoklama)",
      "category": "appliances",
      "unitCost": 52000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "gelato_display",
      "name": "Görsel Havalandırmalı Kavisli Cam Gelato Teşhir Reyonu (18 Küvet)",
      "category": "appliances",
      "unitCost": 75000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Ünite"
    },
    {
      "id": "waffle_cone",
      "name": "Külah Pişirme & Kıvırma Makinesi (Taze Kornet)",
      "category": "machinery",
      "unitCost": 14000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "pos_cash",
      "name": "Dokunmatik Satış POS & Hızlı Kasa Terminali",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "outdoor_seating",
      "name": "Renkli Dış Mekan Bistro Masa & Sandalye Seti (4 Takım)",
      "category": "furniture",
      "unitCost": 7500,
      "defaultQty": 4,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 10
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "led_sign",
      "name": "Işıklı Dondurma Külahı Tasarımlı 3D Tabela",
      "category": "core_tech",
      "unitCost": 26000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 60000,
  "initialInventoryDescription": "Taze çiftlik sütü, krema, Belçika çikolatası, Antep fıstığı ezmesi, İtalyan meyve püreleri, vanilya çubukları, kornet külahlar ve biyoçözünür dondurma kapları.",
  "softwareLicenseCost": {
    "annual": 12000,
    "monthlyMaintenance": 950,
    "name": "Hızlı Kasa & Terazi Entegre Perakende Satış Yazılımı"
  },
  "recommendedStaff": [
    {
      "role": "Dondurma & Gelato Ustası",
      "count": 1,
      "avgSalary": 42000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Satış & Servis Elemanı",
      "count": 1,
      "avgSalary": 26000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Satılan Dondurma Topu / Porsiyonu",
    "unitPrice": 120,
    "targetUnitsPerDay": 75,
    "unitLabel": "Porsiyon / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Porsiyon Dondurma & Tatlı Satışı",
    "unitLabel": "Porsiyon",
    "priceLabel": "Ortalama Porsiyon Fiyatı",
    "defaultVolume": 140,
    "minVolume": 40,
    "maxVolume": 400,
    "stepVolume": 10,
    "avgTicketPrice": 120,
    "grossMarginPercent": 75,
    "daysPerMonth": 30,
    "description": "Külah dondurma, kiloluk paket dondurma, dondurmalı waffle ve soğuk frappe satışları."
  },
  "monthlyUtilitiesEstimate": 14500,
  "monthlyAccountingFee": 3000
},

  'kahvalti-borek-salonu': {
  "id": "kahvalti-borek-salonu",
  "name": "Kahvaltı & Serpme Börek Salonu",
  "emoji": "🍳",
  "categoryGroup": "Yeme - İçme",
  "defaultM2": 90,
  "fitoutCostPerM2": 3200,
  "legalBasis": "Gıda Hijyen Yönetmeliği & İlçe Tarım ve Orman Müdürlüğü Kaydı",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "İlçe Tarım Gıda İşletme Kayıt Belgesi",
      "cost": 16000,
      "description": "Sıcak kahvaltı ve unlu mamul sunum izni"
    },
    {
      "name": "İtfaiye Yangın & Baca Uygunluk Raporu",
      "cost": 14000,
      "description": "Mutfak havalandırma ve güvenlik onayı"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 16000,
      "description": "Ticari lokanta/kahvaltı salonu ruhsatı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti",
      "category": "mandatory",
      "unitCost": 4500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "heated_borek_display",
      "name": "Isıtmalı Camlı Çift Katlı Börek & Poğaça Teşhir Tezgahı (180 cm)",
      "category": "furniture",
      "unitCost": 44000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet"
    },
    {
      "id": "tea_boiler",
      "name": "Bakır İşlemeli 4 Demlikli Tam Otomatik Doğalgazlı Çay Kazanı",
      "category": "appliances",
      "unitCost": 26000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet"
    },
    {
      "id": "kitchen_range",
      "name": "4 Gözlü Sanayi Tipi Ocak & Menemen/Sahanda Yumurta İstasyonu",
      "category": "machinery",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "salad_prep_fridge",
      "name": "Paslanmaz Soğutmalı Kahvaltılık Şarküteri Hazırlık Tezgahı",
      "category": "appliances",
      "unitCost": 36000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "commercial_dishwasher",
      "name": "Sanayi Tipi 500 Tabak/Saat Hızlı Bulaşık Yıkama Makinesi",
      "category": "appliances",
      "unitCost": 34000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "breakfast_tables",
      "name": "Geniş Serpme Kahvaltı Masaları & Ahşap Sandalye Takımları (12 Takım)",
      "category": "furniture",
      "unitCost": 8500,
      "defaultQty": 12,
      "minQty": 4,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 7.5
    },
    {
      "id": "pos_system",
      "name": "Dokunmatik Restoran POS, Garson El Terminali & Adisyon Yazıcı",
      "category": "core_tech",
      "unitCost": 26000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Salon Tipi İnverter Ticari Klima (24.000 BTU)",
      "category": "appliances",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 50
    },
    {
      "id": "signboard",
      "name": "Işıklı Dış Cephe Tabela & Giriş Totemi",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 75000,
  "initialInventoryDescription": "Su böreği, kol böreği, peynir çeşitleri (Ezine, kaşar, tulum), zeytin çeşitleri, tereyağı, bal, reçeller, yumurta, sucuk, domates, salatalık ve Rize çayı.",
  "softwareLicenseCost": {
    "annual": 16000,
    "monthlyMaintenance": 1200,
    "name": "Restoran Masalı POS & Stok Takip Sistemi"
  },
  "recommendedStaff": [
    {
      "role": "Kahvaltı Şefi / Sıcak Ustası",
      "count": 1,
      "avgSalary": 42000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Servis / Garson",
      "count": 2,
      "avgSalary": 26000,
      "isMandatory": false
    },
    {
      "role": "Mutfak Yardımcısı & Bulaşık",
      "count": 1,
      "avgSalary": 24000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Serpme & Hızlı Kahvaltı Masası",
    "unitPrice": 350,
    "targetUnitsPerDay": 45,
    "unitLabel": "Masa / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Kahvaltı & Börek Masası",
    "unitLabel": "Masa",
    "priceLabel": "Ortalama Masa / Fiş Tutarı",
    "defaultVolume": 85,
    "minVolume": 25,
    "maxVolume": 200,
    "stepVolume": 5,
    "avgTicketPrice": 350,
    "grossMarginPercent": 60,
    "daysPerMonth": 30,
    "description": "Hafta içi hızlı börek/poğaça & çay kahvaltısı, hafta sonu zengin serpme aile kahvaltıları."
  },
  "monthlyUtilitiesEstimate": 16000,
  "monthlyAccountingFee": 3200
},

  'corbaci-paca': {
  "id": "corbaci-paca",
  "name": "Tarihi Gece Çorbacısı & Paça Salonu",
  "emoji": "🥣",
  "categoryGroup": "Yeme - İçme",
  "defaultM2": 80,
  "fitoutCostPerM2": 3600,
  "legalBasis": "Gıda Hijyen Yönetmeliği & 24 Saat Çalışma Belediye İzni",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "İlçe Tarım Gıda Üretim Kayıt Tescili",
      "cost": 16000,
      "description": "Sıcak et suyu ve çorba üretim izni"
    },
    {
      "name": "Belediye 24 Saat / Gece Çalışma Ruhsatı",
      "cost": 22000,
      "description": "Gece açık kalabilme resmi ruhsat harcı"
    },
    {
      "name": "İtfaiye Yangın & Baca Uygunluk Raporu",
      "cost": 16000,
      "description": "Sürekli kaynayan kazanlar için baca onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti",
      "category": "mandatory",
      "unitCost": 4500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "soup_counter",
      "name": "Bakır İşlemeli 6 Gözlü Sıcak Benmari Çorba Tezgahı (180 cm)",
      "category": "machinery",
      "unitCost": 55000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet"
    },
    {
      "id": "stock_pot_burner",
      "name": "Endüstriyel Ayaklı Çorba Kaynatma Ocakları (2 Adet)",
      "category": "machinery",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set"
    },
    {
      "id": "stainless_prep",
      "name": "Et Ayıklama ve Sarımsak/Sirke Sos Hazırlama Paslanmaz Masaları",
      "category": "furniture",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "meat_cooler",
      "name": "Büyük Boy Paslanmaz Et & Kemik Suyu Soğuk Depolama Dolabı",
      "category": "appliances",
      "unitCost": 42000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "dishwasher",
      "name": "Sanayi Tipi Hızlı Tabak Yıkama Makinesi (Günde 1000 Kase)",
      "category": "appliances",
      "unitCost": 34000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "dining_sets",
      "name": "Geleneksel Ahşap Çorbacı Masaları & Deri Sandalyeler (10 Takım)",
      "category": "furniture",
      "unitCost": 8000,
      "defaultQty": 10,
      "minQty": 3,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 8
    },
    {
      "id": "pos_cash",
      "name": "Dokunmatik Kasa POS & Adisyon Yazıcı",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (24.000 BTU)",
      "category": "appliances",
      "unitCost": 34000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "neon_sign",
      "name": "Gece Görünürlüğü Yüksek Işıklı Neon & Kutu Harf Tabela",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 80000,
  "initialInventoryDescription": "İlikli dana kemiği, kuzu kelle, paça, işkembe, tereyağı, un, sarımsak, sirke, pul biber ve taze sıcak ekmek tedariği.",
  "softwareLicenseCost": {
    "annual": 14000,
    "monthlyMaintenance": 1100,
    "name": "Restoran POS & Gece Vardiyası Kasa Raporlama Sistemi"
  },
  "recommendedStaff": [
    {
      "role": "Gündüz Çorba & Mutfak Ustası",
      "count": 1,
      "avgSalary": 45000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Gece Vardiyası Çorba Ustası",
      "count": 1,
      "avgSalary": 48000,
      "isMandatory": true
    },
    {
      "role": "Servis / Garson (Gündüz + Gece)",
      "count": 2,
      "avgSalary": 28000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Satılan Kase Çorba Sayısı",
    "unitPrice": 160,
    "targetUnitsPerDay": 90,
    "unitLabel": "Kase / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Kase Çorba & Yan Ürün Satışı",
    "unitLabel": "Kase",
    "priceLabel": "Ortalama Kase Fiyatı",
    "defaultVolume": 180,
    "minVolume": 60,
    "maxVolume": 450,
    "stepVolume": 10,
    "avgTicketPrice": 160,
    "grossMarginPercent": 65,
    "daysPerMonth": 30,
    "description": "Mercimek, ezogelin, tavuk suyu, kelle paça, beyran, işkembe ve pilav satışları (24 saat çalışma esası)."
  },
  "monthlyUtilitiesEstimate": 21000,
  "monthlyAccountingFee": 3400
},

  'guzellik-lazer-merkezi': {
  "id": "guzellik-lazer-merkezi",
  "name": "Güzellik & Lazer Epilasyon Merkezi",
  "emoji": "💄",
  "categoryGroup": "Kişisel Bakım & Sağlık",
  "defaultM2": 85,
  "fitoutCostPerM2": 3800,
  "legalBasis": "Güzellik Salonları Yönetmeliği (Sağlık Bakanlığı & Belediye Tebliği)",
  "statutoryCapital": 100000,
  "mandatoryLegalItems": [
    {
      "name": "Usta Öğreticilik / Güzellik Uzmanlığı Ruhsat Tescili",
      "cost": 24000,
      "description": "Meslek odası ve il sağlık uygunluk belgesi"
    },
    {
      "name": "Belediye Güzellik Merkezi Açma ve Çalışma Ruhsatı",
      "cost": 18000,
      "description": "Ruhsat ve mekan uygunluk harçları"
    },
    {
      "name": "İtfaiye Yangın & Havalandırma Raporu",
      "cost": 8500,
      "description": "Lazer odaları havalandırma uygunluk onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpleri & Acil Müdahale Kiti",
      "category": "mandatory",
      "unitCost": 4500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "diode_laser",
      "name": "Buz Başlıklı 808nm / 3 Dalga Boylu Medikal Diyot Lazer Cihazı",
      "category": "machinery",
      "unitCost": 240000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "description": "FDA/CE onaylı acısız 4 mevsim epilasyon cihazı."
    },
    {
      "id": "hydrafacial_machine",
      "name": "14 Fonksiyonlu Medikal Cilt Bakımı & Hydrafacial Cihazı",
      "category": "machinery",
      "unitCost": 48000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "motorized_beds",
      "name": "3 Motorlu Uzaktan Kumandalı Estetik Tedavi & Sedye Koltuğu",
      "category": "furniture",
      "unitCost": 26000,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "autoclave_sterilizer",
      "name": "B Sınıfı Medikal Otoklav & Kuru Hava Sterilizasyon Cihazı",
      "category": "machinery",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "regulatoryNote": "İl Sağlık ve hijyen yönetmeliği şartı."
    },
    {
      "id": "lounge_reception",
      "name": "Estetik Karşılama Bankosu & VIP Müşteri Bekleme Lounge Grubu",
      "category": "furniture",
      "unitCost": 34000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "skin_analyzer",
      "name": "3D Dijital Cilt Analiz ve Yüz Haritalama Cihazı",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "ac_units",
      "name": "Her Kabin İçin Inverter Split Klima (2 Adet)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 40
    },
    {
      "id": "signboard",
      "name": "Lüks Pleksi Gold Işıklı Dış Tabela & Cam Giydirme",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 65000,
  "initialInventoryDescription": "Lazer soğutucu jeller, tek kullanımlık sedye örtüleri, profesyonel serumlar, peeling solüsyonları, maskeler, eldivenler ve steril bakım sarf malzemeleri.",
  "softwareLicenseCost": {
    "annual": 16000,
    "monthlyMaintenance": 1200,
    "name": "Güzellik Merkezi Randevu, Seans Takip, SMS Hatırlatma & Kasa ERP Yazılımı"
  },
  "recommendedStaff": [
    {
      "role": "Usta Öğretici / Mesul Müdür (Güzellik Uzmanı)",
      "count": 1,
      "avgSalary": 55000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Estetisyen / Lazer Uygulama Uzmanı",
      "count": 1,
      "avgSalary": 36000,
      "isMandatory": false
    },
    {
      "role": "Danışma & Randevu Karşılama",
      "count": 1,
      "avgSalary": 26000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Tamamlanan Seans / Danışan Sayısı",
    "unitPrice": 1400,
    "targetUnitsPerDay": 5,
    "unitLabel": "Seans / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Ortalama Seans & Paket Satışı",
    "unitLabel": "Seans",
    "priceLabel": "Seans / Paket Başı Ortalama Tutar",
    "defaultVolume": 12,
    "minVolume": 3,
    "maxVolume": 30,
    "stepVolume": 1,
    "avgTicketPrice": 1400,
    "grossMarginPercent": 78,
    "daysPerMonth": 26,
    "description": "Tüm vücut lazer epilasyon paketleri (6-8 seans), medikal cilt bakımı, bölgesel incelme ve dermapen işlemleri."
  },
  "monthlyUtilitiesEstimate": 12500,
  "monthlyAccountingFee": 3200
},

  'nail-art-protez-tirnak': {
  "id": "nail-art-protez-tirnak",
  "name": "Nail Art & Protez Tırnak Stüdyosu",
  "emoji": "💅",
  "categoryGroup": "Kişisel Bakım & Sağlık",
  "defaultM2": 40,
  "fitoutCostPerM2": 3200,
  "legalBasis": "Güzellik ve Kişisel Bakım Salonları Hijyen Yönetmeliği",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Güzellik / Manikür-Pedikür Mesleki Yeterlilik Belgesi",
      "cost": 14000,
      "description": "MYK Seviye 4 tırnak uygulayıcı belgesi"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 12000,
      "description": "Belediye güzellik hizmetleri açılış ruhsatı"
    },
    {
      "name": "İtfaiye Yangın & Tahliye Uygunluk Raporu",
      "cost": 6500,
      "description": "İşyeri yangın onay belgesi"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Seti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "nail_desks",
      "name": "Toz Emiş Motorlu Profesyonel Manikür & Nail Art Masası (2 Takım)",
      "category": "furniture",
      "unitCost": 22000,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 15
    },
    {
      "id": "uv_led_lamps",
      "name": "Hızlı Kurutucu Akıllı Sensörlü UV/LED Tırnak Lambaları (4 Adet)",
      "category": "core_tech",
      "unitCost": 6500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "milling_drill",
      "name": "Profesyonel 35.000 RPM Sessiz Freze Tırnak Törpü Cihazı (2 Adet)",
      "category": "machinery",
      "unitCost": 12500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "pedicure_spa_chair",
      "name": "Masajlı & Jakuzili Pedikür Spa Koltuğu",
      "category": "furniture",
      "unitCost": 36000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "sterilizer_oven",
      "name": "Kuru Hava Sterilizatörü & Ultrasonik Alet Temizleyici",
      "category": "machinery",
      "unitCost": 18000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "regulatoryNote": "Mantar ve enfeksiyon önleme zorunlu hijyen standardı."
    },
    {
      "id": "guest_couch",
      "name": "Estetik Misafir Bekleme Koltuğu & Sehpa",
      "category": "furniture",
      "unitCost": 16000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "pos_cash",
      "name": "Dokunmatik POS Kasa & Randevu Ekranı",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "neon_sign",
      "name": "Estetik Neon Yazılı Duvar Dekoru & Işıklı Dış Tabela",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 45000,
  "initialInventoryDescription": "200+ renk kalıcı oje seti, protez tırnak jelleri, akrilik tozlar, tipsler, nail art fırça ve taşları, tırnak bakım yağları, steril tek kullanımlık törpüler.",
  "softwareLicenseCost": {
    "annual": 12000,
    "monthlyMaintenance": 950,
    "name": "Online Randevu, Instagram Entegrasyonu & Müşteri Takip Sistemi"
  },
  "recommendedStaff": [
    {
      "role": "Kıdemli Nail Art & Protez Tırnak Uzmanı",
      "count": 1,
      "avgSalary": 38000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Manikür / Pedikür Teknikeri",
      "count": 1,
      "avgSalary": 28000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Tamamlanan Tırnak / Bakım İşlemi",
    "unitPrice": 650,
    "targetUnitsPerDay": 5,
    "unitLabel": "İşlem / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Nail Art & Protez Tırnak İşlemi",
    "unitLabel": "İşlem",
    "priceLabel": "İşlem Başına Ortalama Tutar",
    "defaultVolume": 15,
    "minVolume": 4,
    "maxVolume": 35,
    "stepVolume": 1,
    "avgTicketPrice": 650,
    "grossMarginPercent": 82,
    "daysPerMonth": 26,
    "description": "Kalıcı oje, jel tırnak, protez tırnak, nail art çizimleri, spa pedikür ve ipek kirpik işlemleri."
  },
  "monthlyUtilitiesEstimate": 8500,
  "monthlyAccountingFee": 2800
},

  'diyetisyen-beslenme-klinigi': {
  "id": "diyetisyen-beslenme-klinigi",
  "name": "Diyetisyen & Beslenme Danışmanlığı",
  "emoji": "🥗",
  "categoryGroup": "Kişisel Bakım & Sağlık",
  "defaultM2": 45,
  "fitoutCostPerM2": 2800,
  "legalBasis": "Sağlık Meslek Mensupları Yönetmeliği & İl Sağlık Müdürlüğü Uygunluk Belgesi",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Beslenme ve Diyetetik Lisans Diploması & Sağlık Bakanlığı Tescili",
      "cost": 18000,
      "description": "Resmi diyetisyenlik meslek tescili"
    },
    {
      "name": "İl Sağlık Müdürlüğü Muayenehane / Merkez Uygunluk Belgesi",
      "cost": 16000,
      "description": "Danışmanlık merkezi açılış onayı"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 12000,
      "description": "Belediye açılış ruhsatı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü & İlk Yardım Kiti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "bia_analyzer",
      "name": "Medikal Segmental Vücut Analiz Cihazı (Tanita / InBody Profesyonel)",
      "category": "machinery",
      "unitCost": 110000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "description": "Kas, yağ, ödem ve viseral yağlanmayı miligram hassasiyetinde ölçen cihaz."
    },
    {
      "id": "stadiometer",
      "name": "Dijital Boy Ölçerli Boy-Kilo Medikal Tartı İstasyonu",
      "category": "core_tech",
      "unitCost": 18000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "dietitian_desk",
      "name": "Diyetisyen Makam Masası & Ergonomik Hekim Koltuğu",
      "category": "furniture",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "client_chairs",
      "name": "Danışan Görüşme Koltukları & Sehpa Takımı",
      "category": "furniture",
      "unitCost": 14000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "pc_setup",
      "name": "Diyet Yazılımı Entegre PC, Monitör & Renkli Grafik Rapor Yazıcısı",
      "category": "core_tech",
      "unitCost": 26000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "water_coffee",
      "name": "Detoks Su Sebili & Bitki Çayı / Kahve İkram İstasyonu",
      "category": "appliances",
      "unitCost": 9500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "brass_sign",
      "name": "Pirinç / Pleksi Kurumsal Dış Tabela",
      "category": "core_tech",
      "unitCost": 16000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    }
  ],
  "initialInventoryCost": 20000,
  "initialInventoryDescription": "Baskılı diyet listesi klasörleri, mezura setleri, vücut ölçüm kartları, kurumsal dosya ve sağlıklı ikram başlangıç paketi.",
  "softwareLicenseCost": {
    "annual": 16000,
    "monthlyMaintenance": 1200,
    "name": "Diyetisyen Danışan Takip, Kalori/Makro Hesaplama & Mobil Danışan Uygulaması"
  },
  "recommendedStaff": [
    {
      "role": "Uzman Diyetisyen (Klinik Sahibi)",
      "count": 1,
      "avgSalary": 65000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Klinik Sekreteri & Danışan İletişim",
      "count": 1,
      "avgSalary": 26000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Yüz Yüze / Online Diyet Seansı",
    "unitPrice": 900,
    "targetUnitsPerDay": 4,
    "unitLabel": "Seans / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Danışan & Diyet Paketi Seansı",
    "unitLabel": "Seans",
    "priceLabel": "Seans Başı Ortalama Gelir",
    "defaultVolume": 8,
    "minVolume": 2,
    "maxVolume": 20,
    "stepVolume": 1,
    "avgTicketPrice": 900,
    "grossMarginPercent": 88,
    "daysPerMonth": 24,
    "description": "Yüz yüze haftalık tartı kontrolleri, online diyet takibi, sporcu beslenmesi ve kurumsal beslenme danışmanlığı."
  },
  "monthlyUtilitiesEstimate": 7500,
  "monthlyAccountingFee": 2800
},

  'yeni-nesil-berber': {
  "id": "yeni-nesil-berber",
  "name": "Yeni Nesil Berber & Erkek Bakım Salonu",
  "emoji": "💈",
  "categoryGroup": "Kişisel Bakım & Sağlık",
  "defaultM2": 50,
  "fitoutCostPerM2": 3400,
  "legalBasis": "Berberler ve Kuaförler Odası Standartları & Belediye Ruhsatı",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Ustalık Belgesi & Esnaf Odası Kayıt Harçları",
      "cost": 16000,
      "description": "Erkek berberliği resmi ustalık tescili"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 12000,
      "description": "Ruhsat ve hijyen muayene harcı"
    },
    {
      "name": "İtfaiye Yangın Uygunluk Raporu",
      "cost": 6500,
      "description": "İşyeri yangın önlem belgesi"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "barber_chairs",
      "name": "Ağır Hizmet Hidrolik Yatar Berber Koltuğu (3 Adet)",
      "category": "furniture",
      "unitCost": 24000,
      "defaultQty": 3,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 16
    },
    {
      "id": "barber_stations",
      "name": "Işıklı Aynalı Ahşap Berber Tezgahı & Lavabo Ünitesi (3 İstasyon)",
      "category": "furniture",
      "unitCost": 28000,
      "defaultQty": 3,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 16
    },
    {
      "id": "hair_wash_unit",
      "name": "Seramik Masajlı Saç Yıkama Koltuğu & Bataryası",
      "category": "furniture",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "uv_sterilizer",
      "name": "UV Sterilizatör & Sıcak Havlu Isıtıcı Dolabı",
      "category": "machinery",
      "unitCost": 14000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "regulatoryNote": "Ustura ve makas sterilizasyon şartı."
    },
    {
      "id": "clipper_set",
      "name": "Profesyonel Kablosuz Tıraş & Saç Kesim Makineleri (Wahl/Panasonic)",
      "category": "machinery",
      "unitCost": 18000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "waiting_lounge",
      "name": "Deri Chesterfield Müşteri Bekleme Koltuğu & Sehpa",
      "category": "furniture",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "pos_cash",
      "name": "Dokunmatik Kasa POS & Randevu Takip Ekranı",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "barber_pole",
      "name": "Dönen Işıklı Orijinal Berber Direği (Barber Pole) & Dış Tabela",
      "category": "core_tech",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 35000,
  "initialInventoryDescription": "Erkek saç şekillendirici killer, vaks, sakal serumları, şampuanlar, tıraş köpüğü, kolonyalar ve tek kullanımlık havlular.",
  "softwareLicenseCost": {
    "annual": 12000,
    "monthlyMaintenance": 950,
    "name": "Berber Online Randevu, SMS Hatırlatma & Gelir-Gider Programı"
  },
  "recommendedStaff": [
    {
      "role": "Usta Berber / Salon Sahibi",
      "count": 1,
      "avgSalary": 45000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Kalfa / Tıraş Uzmanı",
      "count": 1,
      "avgSalary": 32000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Tamamlanan Saç & Sakal Tıraşı",
    "unitPrice": 350,
    "targetUnitsPerDay": 10,
    "unitLabel": "Tıraş / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Saç, Sakal & Cilt Bakım Tıraşı",
    "unitLabel": "Tıraş",
    "priceLabel": "İşlem Başına Ortalama Ücret",
    "defaultVolume": 24,
    "minVolume": 8,
    "maxVolume": 60,
    "stepVolume": 2,
    "avgTicketPrice": 350,
    "grossMarginPercent": 80,
    "daysPerMonth": 26,
    "description": "Saç kesimi, sakal tasarımı, saç yıkama, cilt bakımı ve saç şekillendirici ürün perakende satışları."
  },
  "monthlyUtilitiesEstimate": 9500,
  "monthlyAccountingFee": 2800
},

  'nalbur-yapi-market': {
  "id": "nalbur-yapi-market",
  "name": "Nalbur & Yapı Hırdavat Marketi",
  "emoji": "🔨",
  "categoryGroup": "Perakende & Zanaat",
  "defaultM2": 120,
  "fitoutCostPerM2": 2400,
  "legalBasis": "Ticaret Bakanlığı Perakende Ticaret Kanunu & İtfaiye Yanıcı Madde Güvenlik Tebliği",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Ticaret / Esnaf Odası Kaydı & Vergi Tescili",
      "cost": 18000,
      "description": "Hırdavat ve yapı malzemeleri tescili"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 16000,
      "description": "Ruhsat harcı ve çevre temizlik vergisi"
    },
    {
      "name": "İtfaiye Yangın & Kimyasal/Tiner Depolama Raporu",
      "cost": 12000,
      "description": "Yanıcı boya ve tiner güvenlik raporu"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpleri (6kg KKT & Köpüklü)",
      "category": "mandatory",
      "unitCost": 4500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "heavy_racks",
      "name": "Ağır Hizmet Modüler Çelik Yapı Market Raf Sistemleri (30 Metretül)",
      "category": "furniture",
      "unitCost": 55000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 40
    },
    {
      "id": "paint_mixer",
      "name": "Otomatik Bilgisayarlı Boya Renk Karıştırma & Çalkalama Makinesi",
      "category": "machinery",
      "unitCost": 78000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "tool_display_boards",
      "name": "Perfore Delikli El Aletleri & Hırdavat Askı Panoları",
      "category": "furniture",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "hand_pallet_truck",
      "name": "Hidrolik Manuel Yük Taşıma Transpaleti (2.5 Ton)",
      "category": "machinery",
      "unitCost": 16500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "pos_barcode",
      "name": "Barkod Okuyuculu Hızlı Satış POS Kasa & Etiket Yazıcı",
      "category": "core_tech",
      "unitCost": 26000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "cctv_system",
      "name": "8 Kameralı Gece Görüşlü Mağaza Güvenlik Sistemi",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Salon Tipi Ticari Klima (24.000 BTU)",
      "category": "appliances",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 60
    },
    {
      "id": "signboard",
      "name": "Büyük Boy Işıklı Dış Cephe Tabela & Giriş Totemi",
      "category": "core_tech",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 350000,
  "initialInventoryDescription": "Boya ve astarlar, tinerler, su/elektrik tesisat malzemeleri, cıvata/vida çeşitleri, el aletleri (matkap, spiral), kilitler, yapıştırıcılar ve zımpara.",
  "softwareLicenseCost": {
    "annual": 16000,
    "monthlyMaintenance": 1200,
    "name": "Hırdavat Barkodlu Stok Takip, Cari Hesap & e-Fatura ERP Programı"
  },
  "recommendedStaff": [
    {
      "role": "Mağaza Müdürü / Satış Uzmanı",
      "count": 1,
      "avgSalary": 40000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Depo & Sevkiyat Elemanı",
      "count": 1,
      "avgSalary": 28000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Müşteri Alışveriş Fişi",
    "unitPrice": 450,
    "targetUnitsPerDay": 35,
    "unitLabel": "Fiş / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Alışveriş Yapan Müşteri / Usta Sayısı",
    "unitLabel": "Müşteri",
    "priceLabel": "Ortalama Sepet Tutarı",
    "defaultVolume": 60,
    "minVolume": 20,
    "maxVolume": 180,
    "stepVolume": 5,
    "avgTicketPrice": 450,
    "grossMarginPercent": 38,
    "daysPerMonth": 26,
    "description": "Mahalle sakinleri, ustalar, müteahhitler ve tadilat müşterilerine hırdavat, boya ve tesisat satışı."
  },
  "monthlyUtilitiesEstimate": 9500,
  "monthlyAccountingFee": 3200
},

  'kuyumcu-sarraf': {
  "id": "kuyumcu-sarraf",
  "name": "Kuyumcu & Sarrafiye Mağazası",
  "emoji": "💍",
  "categoryGroup": "Perakende & Zanaat",
  "defaultM2": 35,
  "fitoutCostPerM2": 6000,
  "legalBasis": "Kuyum Ticareti Hakkında Yönetmelik (Ticaret Bakanlığı & MASAK Tebliği)",
  "statutoryCapital": 1000000,
  "mandatoryLegalItems": [
    {
      "name": "Ticaret Bakanlığı Kuyum Ticareti Yetki Belgesi",
      "cost": 45000,
      "description": "Resmi kuyumculuk yetki belgesi harcı"
    },
    {
      "name": "MASAK Uyum & Kimlik Doğrulama Altyapı Tescili",
      "cost": 25000,
      "description": "Mali suçları önleme resmi bildirim sistemi"
    },
    {
      "name": "Kuyumcular Odası Kayıt & Ustalık Tescili",
      "cost": 28000,
      "description": "Oda levha kayıt ve teminat onayı"
    },
    {
      "name": "Belediye İşyeri Açma Ruhsatı",
      "cost": 20000,
      "description": "1. Sınıf güvenlikli kuyumcu ruhsatı"
    },
    {
      "name": "İl Emniyet Panik Butonu & Alarm Hat Entegrasyonu",
      "cost": 18000,
      "description": "Polis imdat doğrudan hat entegrasyonu"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "bulletproof_glass",
      "name": "BR4 Seviye Kurşun Geçirmez Vitrin & Banko Camı",
      "category": "mandatory",
      "unitCost": 85000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "regulatoryNote": "Kuyum Ticareti Yönetmeliği zorunlu güvenlik standardı."
    },
    {
      "id": "heavy_safe",
      "name": "Kademeli Zırhlı Çelik Para & Altın Kasası (2.5 Ton Ağır Gövde)",
      "category": "mandatory",
      "unitCost": 140000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "regulatoryNote": "Sigorta ve mevzuat onaylı zırhlı kasa."
    },
    {
      "id": "precision_scale",
      "name": "Bakanlık Mühürlü Dijital Hassas Kuyumcu Terazisi (0.01g)",
      "category": "mandatory",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "regulatoryNote": "Sanayi ve Teknoloji Bakanlığı damgalı terazi."
    },
    {
      "id": "cctv_4k_alarm",
      "name": "4K Ultra HD Gece Görüşlü CCTV + Panik Butonlu Alarm Sistemi",
      "category": "mandatory",
      "unitCost": 45000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set"
    },
    {
      "id": "showcase_led",
      "name": "Özel Işıklı Kadife & Deri Mücevher Teşhir Bankoları",
      "category": "furniture",
      "unitCost": 65000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "gold_pos",
      "name": "Kuyumcu ERP, Canlı Altın/Döviz Ekranı & Barkodlu POS",
      "category": "core_tech",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "signboard",
      "name": "Lüks Pirinç & LED Işıklı Kutu Harf Tabela",
      "category": "core_tech",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 1200000,
  "initialInventoryDescription": "Çeyrek/Yarım/Tam ziynet altınları, 22 ayar bilezikler, 14 ayar takı setleri, pırlanta tektaşlar ve gümüş aksesuarlar.",
  "softwareLicenseCost": {
    "annual": 24000,
    "monthlyMaintenance": 1800,
    "name": "Canlı Kapalıçarşı Altın Kurları Entegre Kuyumcu POS & Stok Takip ERP"
  },
  "recommendedStaff": [
    {
      "role": "Mesul Müdür / Kuyumcu (Yetki Belgeli)",
      "count": 1,
      "avgSalary": 75000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Satış Danışmanı & Kasa Görevlisi",
      "count": 1,
      "avgSalary": 35000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Sarrafiye & Takı İşlem Hacmi",
    "unitPrice": 4200,
    "targetUnitsPerDay": 8,
    "unitLabel": "İşlem / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Gerçekleşen Altın / Takı İşlemi",
    "unitLabel": "İşlem",
    "priceLabel": "İşlem Başına Ortalama Tutar",
    "defaultVolume": 18,
    "minVolume": 4,
    "maxVolume": 60,
    "stepVolume": 1,
    "avgTicketPrice": 4200,
    "grossMarginPercent": 6.5,
    "daysPerMonth": 26,
    "description": "Ziynet altın alım-satım makas farkı (%2.5), 14/22 ayar işçilikli takı ve pırlanta kâr marjı (%15-%25)."
  },
  "monthlyUtilitiesEstimate": 14000,
  "monthlyAccountingFee": 4500
},

  'zuccaciye-ev-esyalari': {
  "id": "zuccaciye-ev-esyalari",
  "name": "Züccaciye & Ev Eşyaları Mağazası",
  "emoji": "🍽️",
  "categoryGroup": "Perakende & Zanaat",
  "defaultM2": 90,
  "fitoutCostPerM2": 2200,
  "legalBasis": "Perakende Ticaretin Düzenlenmesi Hakkında Kanun & Belediye Ruhsatı",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Ticaret Odası Kaydı & Vergi Levhası Onayları",
      "cost": 18000,
      "description": "Züccaciye perakende tescili"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 14000,
      "description": "İşyeri açılış ruhsatı harçları"
    },
    {
      "name": "İtfaiye Yangın Önlem Raporu",
      "cost": 7500,
      "description": "Yangın güvenliği uygunluk onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "glass_shelves",
      "name": "Spot Aydınlatmalı Cam & Ahşap Züccaciye Teşhir Rafları (25 Metretül)",
      "category": "furniture",
      "unitCost": 48000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 35
    },
    {
      "id": "middle_display_islands",
      "name": "Orta Reyon Teşhir Masaları & Porselen Sunum Adaları",
      "category": "furniture",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "packing_station",
      "name": "Hediye Paketi & Balonlu Naylon Ambalajlama Tezgahı",
      "category": "furniture",
      "unitCost": 12000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "pos_barcode",
      "name": "Barkod Okuyuculu Hızlı Kasa POS & Fiş Yazıcı",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "cctv_system",
      "name": "Mağaza İçi 6 Kameralı Güvenlik Sistemi",
      "category": "core_tech",
      "unitCost": 18000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Salon Tipi Ticari Klima (24.000 BTU)",
      "category": "appliances",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 50
    },
    {
      "id": "signboard",
      "name": "Işıklı Dış Cephe Tabela & Vitrin Spotları",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 220000,
  "initialInventoryDescription": "Porselen yemek takımları, tencere/tava setleri, çatal-bıçak takımları, cam bardak setleri, plastik ev gereçleri ve hediyelik eşyalar.",
  "softwareLicenseCost": {
    "annual": 14000,
    "monthlyMaintenance": 1100,
    "name": "Perakende Barkodlu Stok Takip & Çoklu Kasa Programı"
  },
  "recommendedStaff": [
    {
      "role": "Mağaza Müdürü & Satış Danışmanı",
      "count": 1,
      "avgSalary": 38000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Kasa & Paketleme Elemanı",
      "count": 1,
      "avgSalary": 26000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Alışveriş Fişi Sayısı",
    "unitPrice": 480,
    "targetUnitsPerDay": 25,
    "unitLabel": "Fiş / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Satış Yapılan Müşteri Sayısı",
    "unitLabel": "Müşteri",
    "priceLabel": "Ortalama Müşteri Sepeti",
    "defaultVolume": 45,
    "minVolume": 15,
    "maxVolume": 150,
    "stepVolume": 5,
    "avgTicketPrice": 480,
    "grossMarginPercent": 46,
    "daysPerMonth": 26,
    "description": "Çeyiz alışverişleri, günlük mutfak gereçleri, hediyelik eşya ve küçük ev aletleri perakende satışları."
  },
  "monthlyUtilitiesEstimate": 8500,
  "monthlyAccountingFee": 3000
},

  'dijital-baski-matbaa': {
  "id": "dijital-baski-matbaa",
  "name": "Dijital Baskı & Matbaa Merkezi",
  "emoji": "🖨️",
  "categoryGroup": "Perakende & Zanaat",
  "defaultM2": 70,
  "fitoutCostPerM2": 2600,
  "legalBasis": "Basım ve Yayın Faaliyetleri Mevzuatı & Belediye Ruhsatı",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Ticaret Odası Basım & Yayıncılık Meslek Kaydı",
      "cost": 18000,
      "description": "Matbaacılık ve dijital baskı tescili"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 14000,
      "description": "İşletme çalışma ruhsatı harçları"
    },
    {
      "name": "İtfaiye Yangın & Kağıt Depolama Güvenlik Raporu",
      "cost": 8500,
      "description": "Kağıt ve kimyasal mürekkep yangın onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti",
      "category": "mandatory",
      "unitCost": 4500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "plotter_printer",
      "name": "Geniş Format Eko-Solvent Dijital Baskı & Folyo Kesici Plotter (160 cm)",
      "category": "machinery",
      "unitCost": 165000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "description": "Branda, folyo, one way vision ve kanvas basan endüstriyel makine."
    },
    {
      "id": "copier_production",
      "name": "Yüksek Hızlı Renkli Dijital Üretim Fotokopi & Baskı İstasyonu",
      "category": "machinery",
      "unitCost": 95000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet"
    },
    {
      "id": "paper_cutter",
      "name": "Elektrikli Programlanabilir Hidrolik Giyotin Kağıt Kesme Makinesi",
      "category": "machinery",
      "unitCost": 42000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "laminator_binder",
      "name": "Sıcak-Soğuk Rulo Selefon & Spiral Ciltleme Makinesi",
      "category": "machinery",
      "unitCost": 26000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "designer_workstation",
      "name": "Grafik Tasarım İş İstasyonu (iMac / Yüksek RAM PC + Çift Monitör)",
      "category": "core_tech",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "pos_cash",
      "name": "Dokunmatik POS Kasa & Sipariş Takip Terminali",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "signboard",
      "name": "LED Işıklı Örnek Baskı Dış Cephe Tabelası",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 75000,
  "initialInventoryDescription": "Branda ruloları, yapışkanlı folyolar, 80g-350g kuşe kağıtlar, orijinal kartuş/mürekkep setleri, cilt spiralleri ve laminasyon filmleri.",
  "softwareLicenseCost": {
    "annual": 22000,
    "monthlyMaintenance": 1600,
    "name": "Adobe Creative Cloud Kurumsal Lisansı & RIP Baskı Yazılımı"
  },
  "recommendedStaff": [
    {
      "role": "Grafik Tasarımcı & Baskı Operatörü",
      "count": 1,
      "avgSalary": 42000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Baskı Sonrası / Uygulama & Teslimat Elemanı",
      "count": 1,
      "avgSalary": 28000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Tamamlanan Baskı & Reklam Siparişi",
    "unitPrice": 750,
    "targetUnitsPerDay": 8,
    "unitLabel": "Sipariş / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Tamamlanan Baskı Siparişi",
    "unitLabel": "Sipariş",
    "priceLabel": "Sipariş Başı Ortalama Tutar",
    "defaultVolume": 35,
    "minVolume": 10,
    "maxVolume": 120,
    "stepVolume": 5,
    "avgTicketPrice": 750,
    "grossMarginPercent": 65,
    "daysPerMonth": 26,
    "description": "Kartvizit, broşür, etiket, tabela, araç giydirme, afiş, tez ciltleme ve promosyon ürün baskıları."
  },
  "monthlyUtilitiesEstimate": 12500,
  "monthlyAccountingFee": 3200
},

  'dil-okulu-kurs': {
  "id": "dil-okulu-kurs",
  "name": "Yabancı Dil Kursu & Sınav Hazırlık",
  "emoji": "📚",
  "categoryGroup": "Finans & Hizmet",
  "defaultM2": 160,
  "fitoutCostPerM2": 2800,
  "legalBasis": "MEB Özel Öğretim Kurumları Kanunu & Standartlar Yönergesi",
  "statutoryCapital": 100000,
  "mandatoryLegalItems": [
    {
      "name": "MEB Özel Öğretim Kurumu Kurum Açma İzin Harcı",
      "cost": 35000,
      "description": "Milli Eğitim Bakanlığı resmi kurum açılış izni"
    },
    {
      "name": "İlçe İtfaiye Yangın Merdiveni & Tahliye Raporu",
      "cost": 22000,
      "description": "Öğrenci güvenliği ve yangın merdiveni onayı"
    },
    {
      "name": "İl Sağlık Müdürlüğü Mekansal Hijyen & Havalandırma İzni",
      "cost": 16000,
      "description": "Derslik aydınlatma ve temiz hava onayı"
    },
    {
      "name": "Belediye İşyeri Ruhsatı & Numarataj",
      "cost": 18000,
      "description": "Eğitim kurumu ticari ruhsat harcı"
    }
  ],
  "equipments": [
    {
      "id": "fire_system",
      "name": "Yangın Söndürme Dolabı, Tüpler & Yangın İkaz Butonları",
      "category": "mandatory",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Sistem",
      "regulatoryNote": "MEB yangın güvenlik standartları."
    },
    {
      "id": "smart_boards",
      "name": "İnteraktif Akıllı Dokunmatik Tahtalar & Projeksiyon (4 Derslik)",
      "category": "core_tech",
      "unitCost": 36000,
      "defaultQty": 4,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 35
    },
    {
      "id": "student_desks",
      "name": "Ergonomik Öğrenci Sandalye & Kolçaklı Yazı Masası (60 Adet)",
      "category": "furniture",
      "unitCost": 1800,
      "defaultQty": 60,
      "minQty": 15,
      "isLocked": true,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 2.5
    },
    {
      "id": "teachers_room",
      "name": "Öğretmenler Odası Masa, Koltuk & Kilitli Dolap Seti",
      "category": "furniture",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "reception_desk",
      "name": "Giriş Kayıt Kabul Bankosu & Bekleme Koltuk Grubu",
      "category": "furniture",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "pc_admin",
      "name": "MEBBİS & Öğrenci Kayıt Yönetim PC İstasyonları (2 Adet)",
      "category": "core_tech",
      "unitCost": 24000,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "ac_classrooms",
      "name": "Derslikler İçin Inverter Split Klimalar (4 Adet)",
      "category": "appliances",
      "unitCost": 26000,
      "defaultQty": 4,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 40
    },
    {
      "id": "signboard",
      "name": "MEB Kurumsal Kimlik Uyumlu Dış Cephe Tabelası",
      "category": "core_tech",
      "unitCost": 34000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 45000,
  "initialInventoryDescription": "Orijinal İngilizce/Almanca ders kitapları, seviye tespit sınav evrakları, öğrenci kimlik kartları ve kırtasiye malzemeleri.",
  "softwareLicenseCost": {
    "annual": 24000,
    "monthlyMaintenance": 1800,
    "name": "MEB Uyumlu Öğrenci Bilgi Sistemi, Yoklama, Online Test & Veli SMS Portalı"
  },
  "recommendedStaff": [
    {
      "role": "Kurum Müdürü (MEB Şartlarını Taşıyan Eğitimci)",
      "count": 1,
      "avgSalary": 55000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Yabancı Dil Öğretmeni (İngilizce / Almanca)",
      "count": 2,
      "avgSalary": 38000,
      "isMandatory": true
    },
    {
      "role": "Kayıt / Eğitim Danışmanı",
      "count": 1,
      "avgSalary": 28000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Aylık Kayıtlı Aktif Kursiyer Sayısı",
    "unitPrice": 4500,
    "targetUnitsPerDay": 40,
    "unitLabel": "Öğrenci / Ay"
  },
  "revenueModel": {
    "periodType": "monthly",
    "volumeLabel": "Aylık Kayıtlı Aktif Öğrenci Sayısı",
    "unitLabel": "Öğrenci",
    "priceLabel": "Aylık Kurs & Eğitim Ücreti",
    "defaultVolume": 85,
    "minVolume": 25,
    "maxVolume": 250,
    "stepVolume": 5,
    "avgTicketPrice": 4500,
    "grossMarginPercent": 58,
    "daysPerMonth": 30,
    "description": "Genel İngilizce kurları, IELTS/TOEFL sınav hazırlık, Almanca A1-B2 aile birleşimi ve kurumsal şirket eğitimleri."
  },
  "monthlyUtilitiesEstimate": 16000,
  "monthlyAccountingFee": 3600
},

  'turizm-seyahat-acentesi': {
  "id": "turizm-seyahat-acentesi",
  "name": "Turizm & Seyahat Acentesi (TÜRSAB)",
  "emoji": "✈️",
  "categoryGroup": "Finans & Hizmet",
  "defaultM2": 50,
  "fitoutCostPerM2": 2800,
  "legalBasis": "1618 Sayılı Seyahat Acentaları ve Seyahat Acentaları Birliği Kanunu",
  "statutoryCapital": 350000,
  "mandatoryLegalItems": [
    {
      "name": "Kültür ve Turizm Bakanlığı A Grubu Acente Belgesi",
      "cost": 65000,
      "description": "Bakanlık resmi seyahat acentası unvan tescili"
    },
    {
      "name": "TÜRSAB Giriş Aidatı & Levha Kayıt Harcı",
      "cost": 85000,
      "description": "TÜRSAB sicil kayıt bedeli"
    },
    {
      "name": "Bakanlık Resmi Teminat Mektubu Masrafları",
      "cost": 35000,
      "description": "Banka teminat mektubu komisyon ve noter tescili"
    },
    {
      "name": "Mesleki Sorumluluk Turizm Sigortası",
      "cost": 24000,
      "description": "Zorunlu paket tur sigorta poliçesi"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 14000,
      "description": "Ticari acente çalışma ruhsatı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü & İlk Yardım Seti (6kg ABC)",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "booking_desks",
      "name": "Biletleme & Satış Danışmanı Masası, Koltuk ve PC İstasyonu (2 Takım)",
      "category": "furniture",
      "unitCost": 26000,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 25
    },
    {
      "id": "manager_desk",
      "name": "Acente Müdürü Makam Masası & Deri Koltuk Takımı",
      "category": "furniture",
      "unitCost": 26000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "tour_presentation_tv",
      "name": "55 inç 4K Ultra HD Turizm & Otel Sunum Ekranı",
      "category": "core_tech",
      "unitCost": 19500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "guest_lounge",
      "name": "Müşteri Tatil Planlama Lounge Oturma Grubu",
      "category": "furniture",
      "unitCost": 18500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 50
    },
    {
      "id": "scanner_printer",
      "name": "Hızlı Lazer Renkli Yazıcı, Vize Evrak Tarayıcı & POS Terminali",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "signboard",
      "name": "TÜRSAB Plaket Yuvalı Işıklı Kurumsal Dış Tabela",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 25000,
  "initialInventoryDescription": "Bilet ve voucher kapları, seyahat katalogları, vize başvuru evrak dosyaları ve kurumsal promosyon ürünleri.",
  "softwareLicenseCost": {
    "annual": 28000,
    "monthlyMaintenance": 2200,
    "name": "GDS Uçak Bileti (Amadeus/Sabre/Galileo), B2B Otel & Turizm ERP Portalı"
  },
  "recommendedStaff": [
    {
      "role": "Sorumlu Müdür (Enformasyon Memuru veya 4 Yıl Turizm Lisans)",
      "count": 1,
      "avgSalary": 55000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Biletleme & Rezervasyon Satış Uzmanı",
      "count": 1,
      "avgSalary": 35000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Tamamlanan Uçak Bileti & Tur Rezervasyonu",
    "unitPrice": 6500,
    "targetUnitsPerDay": 5,
    "unitLabel": "Rezervasyon / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Satılan Bilet, Otel & Tur Sayısı",
    "unitLabel": "Rezervasyon",
    "priceLabel": "Ortalama Rezervasyon Tutarı",
    "defaultVolume": 12,
    "minVolume": 3,
    "maxVolume": 40,
    "stepVolume": 1,
    "avgTicketPrice": 6500,
    "grossMarginPercent": 9.5,
    "daysPerMonth": 26,
    "description": "Yurtiçi/yurtdışı uçak bileti servis bedelleri, kültür turları (%12-%18 komisyon), otel rezervasyonları ve vize danışmanlığı."
  },
  "monthlyUtilitiesEstimate": 7500,
  "monthlyAccountingFee": 3200
},

  'parti-cocuk-oyun-evi': {
  "id": "parti-cocuk-oyun-evi",
  "name": "Çocuk Oyun Evi & Doğum Günü Atölyesi",
  "emoji": "🎈",
  "categoryGroup": "Finans & Hizmet",
  "defaultM2": 120,
  "fitoutCostPerM2": 3400,
  "legalBasis": "Çocuk Oyun Alanları Güvenlik Standardı (TS EN 1176/1177) & Belediye Ruhsatı",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Oyun Alanı TSE EN 1176 Güvenlik & Darbe Emici Zemin Uygunluğu",
      "cost": 22000,
      "description": "TSE onaylı çocuk güvenlik sertifikası"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 16000,
      "description": "Eğlence ve oyun evi işletme ruhsatı"
    },
    {
      "name": "İtfaiye Yangın & Acil Tahliye Raporu",
      "cost": 12000,
      "description": "Çocuk mekanları yangın güvenliği onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpleri & Çocuk İlk Yardım Donanımı",
      "category": "mandatory",
      "unitCost": 4500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "softplay_arena",
      "name": "Modüler Çift Katlı Softplay Top Havuzu, Trambolin & Kaydırak Parkuru",
      "category": "machinery",
      "unitCost": 145000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Sistem",
      "description": "TSE güvenlik belgeli yumuşak sünger kaplı oyun parkuru."
    },
    {
      "id": "workshop_tables",
      "name": "Çocuk Ahşap Sanat/Atölye Masaları & Renkli Sandalyeler (4 Takım)",
      "category": "furniture",
      "unitCost": 12000,
      "defaultQty": 4,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "party_room_setup",
      "name": "Tematik Doğum Günü Kutlama Masası, Fon Perdesi & LED Işıklandırma",
      "category": "furniture",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "parent_cafe_tables",
      "name": "Ebeveyn Bekleme Kafe Masaları & Konforlu Sandalyeler (6 Takım)",
      "category": "furniture",
      "unitCost": 8500,
      "defaultQty": 6,
      "minQty": 2,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 18
    },
    {
      "id": "cctv_safety",
      "name": "Ebeveynlerin İzleyebileceği 8 Kameralı Full HD Güvenlik Kamera Sistemi",
      "category": "core_tech",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "pos_entry",
      "name": "Saatlik Giriş / Biletleme POS Kasa & Turnike/Kart Sistemi",
      "category": "core_tech",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Yüksek Debili Taze Hava Destekli Ticari Klima (24.000 BTU)",
      "category": "appliances",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 50
    },
    {
      "id": "signboard",
      "name": "Renkli 3D Işıklı Çocuk Dostu Dış Tabela",
      "category": "core_tech",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 40000,
  "initialInventoryDescription": "Boya ve seramik atölye malzemeleri, parti süsleri, balonlar, tek kullanımlık tabak/bardaklar, ebeveyn kafe çay/kahve ve atıştırmalık stokları.",
  "softwareLicenseCost": {
    "annual": 14000,
    "monthlyMaintenance": 1100,
    "name": "Oyun Evi Süre Takip, Doğum Günü Rezervasyon & Kasa Yazılımı"
  },
  "recommendedStaff": [
    {
      "role": "Çocuk Gelişimi Uzmanı / Oyun Ablası (Sorumlu)",
      "count": 1,
      "avgSalary": 36000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Oyun Alanı Gözetmeni / Etkinlik Asistanı",
      "count": 1,
      "avgSalary": 26000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Saatlik Oyun Girişi + Hafta Sonu Parti",
    "unitPrice": 200,
    "targetUnitsPerDay": 25,
    "unitLabel": "Çocuk / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Saatlik Giriş Sayısı (Aylık Partiler Dahil)",
    "unitLabel": "Giriş",
    "priceLabel": "Ortalama Saatlik Giriş / Paket Tutarı",
    "defaultVolume": 35,
    "minVolume": 10,
    "maxVolume": 100,
    "stepVolume": 5,
    "avgTicketPrice": 200,
    "grossMarginPercent": 78,
    "daysPerMonth": 30,
    "description": "Saatlik serbest oyun girişleri (200 TL/saat), hafta sonu özel kapatmalı doğum günü organizasyonları (10.000 - 25.000 TL) ve atölyeler."
  },
  "monthlyUtilitiesEstimate": 14000,
  "monthlyAccountingFee": 3000
},

  'oto-kiralama-rentacar': {
  "id": "oto-kiralama-rentacar",
  "name": "Oto Kiralama & Rent A Car Ofisi",
  "emoji": "🚘",
  "categoryGroup": "Finans & Hizmet",
  "defaultM2": 45,
  "fitoutCostPerM2": 3000,
  "legalBasis": "Kiralık Araç Bildirim Sistemi (KABİS) & Ticaret Bakanlığı Yetki Belgesi",
  "statutoryCapital": 250000,
  "mandatoryLegalItems": [
    {
      "name": "İl Emniyet Müdürlüğü KABİS Sistem Entegrasyonu & Onayı",
      "cost": 16000,
      "description": "Emniyet Genel Müdürlüğü resmi kiralık araç bildirim sistemi"
    },
    {
      "name": "Ticaret Bakanlığı Motorlu Kara Taşıtı Ticareti / Kiralama Yetkisi",
      "cost": 24000,
      "description": "Ticaret İl Müdürlüğü açılış belgesi"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 14000,
      "description": "Oto kiralama işletme ruhsatı"
    },
    {
      "name": "Kiralık Araç Filo Kasko Poliçe Giderleri",
      "cost": 45000,
      "description": "Rent a car kaskosu ve teminatları"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü & İlk Yardım Seti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "key_safe",
      "name": "Şifreli Elektronik Güvenlikli Araç Anahtar Kasası (50 Kapasiteli)",
      "category": "mandatory",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "regulatoryNote": "Araç anahtarları ve ruhsat evrakları güvenlik şartı."
    },
    {
      "id": "rental_desks",
      "name": "KABİS Entegre Rezervasyon & Sözleşme Çalışma Masası ve PC",
      "category": "furniture",
      "unitCost": 26000,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 25
    },
    {
      "id": "lounge_seating",
      "name": "Müşteri Karşılama ve Sözleşme İmzalama Koltuk Grubu",
      "category": "furniture",
      "unitCost": 18500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 50
    },
    {
      "id": "pos_provizyon",
      "name": "Mail Order & Kredi Kartı Depozito Provizyon Destekli POS Terminali",
      "category": "core_tech",
      "unitCost": 18000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "gps_tracking_hub",
      "name": "Filo GPS Araç Takip & Uzaktan Motor Kilitleme Yazılım İstasyonu",
      "category": "core_tech",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "signboard",
      "name": "LED Işıklı Kurumsal Dış Tabela & Yol Yönlendirme Panosu",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 35000,
  "initialInventoryDescription": "Sözleşme koçanları, araç içi yıkama ve temizlik setleri, OGS/HGS etiketleri, araç takip sim kartları ve kurumsal teslim formları.",
  "softwareLicenseCost": {
    "annual": 22000,
    "monthlyMaintenance": 1600,
    "name": "KABİS Entegre Rent a Car Filo, Sözleşme, Findex & Provizyon ERP Programı"
  },
  "recommendedStaff": [
    {
      "role": "Acente Müdürü / Filo Yöneticisi",
      "count": 1,
      "avgSalary": 45000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Araç Teslimat & Karşılama Personeli",
      "count": 1,
      "avgSalary": 28000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Kirada Olan Araç Sayısı",
    "unitPrice": 1600,
    "targetUnitsPerDay": 5,
    "unitLabel": "Araç / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Kirada Olan Ortalama Araç Sayısı",
    "unitLabel": "Araç",
    "priceLabel": "Günlük Ortalama Araç Kiralama Bedeli",
    "defaultVolume": 14,
    "minVolume": 4,
    "maxVolume": 45,
    "stepVolume": 1,
    "avgTicketPrice": 1600,
    "grossMarginPercent": 64,
    "daysPerMonth": 30,
    "description": "Ekonomik ve orta segment binek araçların günlük/haftalık/aylık kiralanması, ek kasko ve havalimanı teslimat gelirleri."
  },
  "monthlyUtilitiesEstimate": 8500,
  "monthlyAccountingFee": 3200
},

  'oto-yedek-parca': {
  "id": "oto-yedek-parca",
  "name": "Oto Yedek Parça & Akü Satış",
  "emoji": "⚙️",
  "categoryGroup": "Perakende & Zanaat",
  "defaultM2": 80,
  "fitoutCostPerM2": 2400,
  "legalBasis": "Motorlu Araçlar Yedek Parça Ticareti Tebliği & Belediye Ruhsatı",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Ticaret Odası Otomotiv Yedek Parça Meslek Tescili",
      "cost": 18000,
      "description": "Yedek parça ve madeni yağ toptan/perakende kaydı"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 14000,
      "description": "İşletme çalışma ruhsatı harcı"
    },
    {
      "name": "İtfaiye Yangın & Akü/Yağ Güvenlik Raporu",
      "cost": 8500,
      "description": "Akü asidi ve yağ depolama yangın onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg KKT) & İlk Yardım Seti",
      "category": "mandatory",
      "unitCost": 4500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "auto_part_racks",
      "name": "Ağır Hizmet Modüler Çelik Parça Raf Sistemleri (20 Metretül)",
      "category": "furniture",
      "unitCost": 48000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 35
    },
    {
      "id": "battery_tester",
      "name": "Dijital Akü Test, Yükleme & Hızlı Şarj Cihazı İstasyonu",
      "category": "machinery",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "epc_pc",
      "name": "Orijinal Şasi No (VIN) & TecDoc Parça Arama Bilgisayar İstasyonu",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 35
    },
    {
      "id": "pos_barcode",
      "name": "Barkod Okuyuculu Hızlı Kasa POS, Fiş & e-Arşiv Yazıcı",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "counter_desk",
      "name": "Ağır Hizmet Müşteri Tezgahı & Karşılama Bankosu",
      "category": "furniture",
      "unitCost": 18000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "signboard",
      "name": "LED Işıklı Dış Tabela & Akü Markaları Panosu",
      "category": "core_tech",
      "unitCost": 28000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 400000,
  "initialInventoryDescription": "Periyodik bakım filtreleri (yağ, hava, polen, yakıt), fren balata ve diskleri, motor yağları, antifriz, akü çeşitleri, bujiler ve silecekler.",
  "softwareLicenseCost": {
    "annual": 24000,
    "monthlyMaintenance": 1800,
    "name": "TecDoc / Parça Katalogu Entegre Oto Yedek Parça ERP & e-Fatura Sistemi"
  },
  "recommendedStaff": [
    {
      "role": "Yedek Parça Uzmanı / Satış Danışmanı",
      "count": 1,
      "avgSalary": 42000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Depo & Sevkiyat / Kurye Personeli",
      "count": 1,
      "avgSalary": 28000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Satılan Yedek Parça & Bakım Kalemi",
    "unitPrice": 850,
    "targetUnitsPerDay": 20,
    "unitLabel": "Parça / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Satılan Yedek Parça & Ürün Kalemi",
    "unitLabel": "Parça",
    "priceLabel": "Parça Başına Ortalama Satış Tutarı",
    "defaultVolume": 40,
    "minVolume": 12,
    "maxVolume": 120,
    "stepVolume": 5,
    "avgTicketPrice": 850,
    "grossMarginPercent": 35,
    "daysPerMonth": 26,
    "description": "Oto sanayi tamirhanelerine toptan parça satışı, perakende araç sahiplerine periyodik bakım setleri ve akü satış/montajı."
  },
  "monthlyUtilitiesEstimate": 9500,
  "monthlyAccountingFee": 3200
},

  'dijital-pazarlama-ajansi': {
  "id": "dijital-pazarlama-ajansi",
  "name": "Dijital Pazarlama & Sosyal Medya Ajansı",
  "emoji": "📢",
  "categoryGroup": "Finans & Hizmet",
  "defaultM2": 60,
  "fitoutCostPerM2": 3000,
  "legalBasis": "Türk Ticaret Kanunu & Fikir ve Sanat Eserleri Kanunu",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Ticaret Odası Reklam & Dijital Medya Faaliyet Tescili",
      "cost": 18000,
      "description": "Reklam ajansı ve dijital pazarlama tescili"
    },
    {
      "name": "Vergi Dairesi Açılış & e-Fatura Kayıtları",
      "cost": 12000,
      "description": "Elektronik fatura ve mali mühür onayı"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 12000,
      "description": "Ofis çalışma ruhsatı harcı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü & İlk Yardım Seti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "creative_desks",
      "name": "Ergonomik Yükseklik Ayarlı Ajans Çalışma Masaları & Fileli Koltuklar (4 İstasyon)",
      "category": "furniture",
      "unitCost": 18000,
      "defaultQty": 4,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım",
      "scalesWithM2": true,
      "m2Ratio": 15
    },
    {
      "id": "design_macs",
      "name": "Yüksek Performanslı Video Kurgu & Grafik Tasarım İstasyonları (iMac / M-Serisi)",
      "category": "core_tech",
      "unitCost": 55000,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "studio_lighting_camera",
      "name": "Stüdyo Fotoğraf & Video Çekim Kiti (4K Kamera, Softbox Işıklar & Mikrofon)",
      "category": "core_tech",
      "unitCost": 45000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "client_meeting_table",
      "name": "Müşteri Sunum & Strateji Toplantı Masası (8 Kişilik) + 55 inç Sunum TV",
      "category": "furniture",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "lounge_coffee",
      "name": "Ajans Kahve Barı & Relax Müşteri Koltuk Grubu",
      "category": "furniture",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "ac_unit",
      "name": "Inverter Split Klima (18.000 BTU)",
      "category": "appliances",
      "unitCost": 29500,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 45
    },
    {
      "id": "signboard",
      "name": "Neon Işıklı Kurumsal Ajans Dış & İç Tabelası",
      "category": "core_tech",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 20000,
  "initialInventoryDescription": "Sunum dosyaları, kurumsal kimlik kitleri, çekim arka plan fonları ve ofis sarf malzemeleri.",
  "softwareLicenseCost": {
    "annual": 32000,
    "monthlyMaintenance": 2400,
    "name": "Adobe Creative Cloud Team, Meta Ads/Google Analytics Dashboard & Semrush SEO Yazılımı"
  },
  "recommendedStaff": [
    {
      "role": "Ajans Başkanı / Dijital Stratejist",
      "count": 1,
      "avgSalary": 60000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Sosyal Medya Yöneticisi & İçerik Üreticisi",
      "count": 1,
      "avgSalary": 35000,
      "isMandatory": false
    },
    {
      "role": "Grafik Tasarımcı & Video Kurgucu",
      "count": 1,
      "avgSalary": 38000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Aylık Düzenli Retainer Müşteri Portföyü",
    "unitPrice": 22000,
    "targetUnitsPerDay": 8,
    "unitLabel": "Marka / Ay"
  },
  "revenueModel": {
    "periodType": "monthly",
    "volumeLabel": "Aylık Düzenli Hizmet Verilen Marka Sayısı",
    "unitLabel": "Marka",
    "priceLabel": "Marka Başına Aylık Retainer Hizmet Bedeli",
    "defaultVolume": 18,
    "minVolume": 4,
    "maxVolume": 50,
    "stepVolume": 1,
    "avgTicketPrice": 22000,
    "grossMarginPercent": 72,
    "daysPerMonth": 30,
    "description": "Aylık sosyal medya yönetimi (Instagram/TikTok), Google/Meta reklam yönetimi, SEO ve web tasarım/prodüksiyon sözleşmeleri."
  },
  "monthlyUtilitiesEstimate": 7500,
  "monthlyAccountingFee": 3200
},

  'mobilya-dekorasyon': {
  "id": "mobilya-dekorasyon",
  "name": "Butik Mobilya & Ev Dekorasyonu",
  "emoji": "🛋️",
  "categoryGroup": "Perakende & Zanaat",
  "defaultM2": 140,
  "fitoutCostPerM2": 2600,
  "legalBasis": "Tüketicinin Korunması Hakkında Kanun & Belediye Ruhsatı",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Ticaret Odası Mobilya & Ev Eşyaları Perakende Tescili",
      "cost": 18000,
      "description": "Mobilya ve dekorasyon ticaret tescili"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 18000,
      "description": "Büyük mağaza açılış ruhsatı harcı"
    },
    {
      "name": "İtfaiye Yangın & Ahşap Güvenlik Raporu",
      "cost": 12000,
      "description": "Ahşap ve döşeme yangın uygunluk onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & Yangın Dolabı",
      "category": "mandatory",
      "unitCost": 6500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "lighting_spots",
      "name": "Ray Spot Mimari Mağaza Aydınlatma Seti (30 Spot + Raylar)",
      "category": "furniture",
      "unitCost": 45000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 50
    },
    {
      "id": "interior_design_desk",
      "name": "İç Mimar & Tasarımcı Görüşme Masası, PC ve Kumaş Numune Standı",
      "category": "furniture",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Takım"
    },
    {
      "id": "pos_barcode",
      "name": "Barkodlu Kasa POS & Taksitli Satış Terminali",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "ac_unit",
      "name": "Salon Tipi Ticari Klima (24.000 BTU - 2 Adet)",
      "category": "appliances",
      "unitCost": 38000,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet",
      "scalesWithM2": true,
      "m2Ratio": 70
    },
    {
      "id": "signboard",
      "name": "Lüks Pleksi Gold Işıklı Showroom Tabelası",
      "category": "core_tech",
      "unitCost": 36000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 380000,
  "initialInventoryDescription": "Teşhir koltuk takımları, yemek masaları, konsollar, sehpa setleri, aydınlatma abajurları, tablolar ve dekoratif objeler.",
  "softwareLicenseCost": {
    "annual": 18000,
    "monthlyMaintenance": 1400,
    "name": "Mobilya Sipariş, Özel Ölçü Üretim & Sevkiyat ERP Programı"
  },
  "recommendedStaff": [
    {
      "role": "İç Mimar / Satış Yöneticisi",
      "count": 1,
      "avgSalary": 48000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Satış Danışmanı & Müşteri Temsilcisi",
      "count": 1,
      "avgSalary": 30000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Aylık Tamamlanan Mobilya / Dekorasyon Siparişi",
    "unitPrice": 45000,
    "targetUnitsPerDay": 6,
    "unitLabel": "Sipariş / Ay"
  },
  "revenueModel": {
    "periodType": "monthly",
    "volumeLabel": "Aylık Satılan Mobilya & Dekorasyon Takımı",
    "unitLabel": "Takım",
    "priceLabel": "Takım / Sipariş Başı Ortalama Tutar",
    "defaultVolume": 15,
    "minVolume": 4,
    "maxVolume": 50,
    "stepVolume": 1,
    "avgTicketPrice": 45000,
    "grossMarginPercent": 48,
    "daysPerMonth": 30,
    "description": "Özel üretim salon takımları, yemek odaları, butik konsollar, tablolar ve anahtar teslim iç mimari dekorasyon projeleri."
  },
  "monthlyUtilitiesEstimate": 14000,
  "monthlyAccountingFee": 3400
},

  'cilingir-anahtar': {
  "id": "cilingir-anahtar",
  "name": "Çilingir & Güvenlik Kilit Atölyesi",
  "emoji": "🔑",
  "categoryGroup": "Perakende & Zanaat",
  "defaultM2": 30,
  "fitoutCostPerM2": 2400,
  "legalBasis": "Çilingirlik ve Kilitçilik Mesleki Yeterlilik Standartları & Emniyet Bildirimi",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Çilingirler ve Anahtarcılar Odası Ustalık Tescili",
      "cost": 16000,
      "description": "Resmi çilingir ustalık belgesi ve sicil kaydı"
    },
    {
      "name": "İl Emniyet Müdürlüğü Çilingir Güvenlik Soruşturma Onayı",
      "cost": 12000,
      "description": "Emniyet adli sicil ve kayıt onayı"
    },
    {
      "name": "Belediye İşyeri Açma ve Çalışma Ruhsatı",
      "cost": 10000,
      "description": "Belediye çalışma ruhsatı harcı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpü (6kg ABC) & İlk Yardım Kiti",
      "category": "mandatory",
      "unitCost": 3500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "key_cutting_lathe",
      "name": "Otomatik Çift Kollu Lazer / Mekanik Anahtar Çoğaltma Makinesi",
      "category": "machinery",
      "unitCost": 38000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "description": "Oda ve çelik kapı anahtarlarını kopyalayan hassas freze."
    },
    {
      "id": "auto_key_programmer",
      "name": "İmmobilizer Oto Çipli Anahtar Kopyalama & Kodlama Cihazı",
      "category": "machinery",
      "unitCost": 45000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "key_blanks_board",
      "name": "Duvar Tipi Ham Anahtar Askı Panoları (500+ Model Kapasiteli)",
      "category": "furniture",
      "unitCost": 14000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "mobile_locksmith_kit",
      "name": "Acil Kapı Açma & Maymuncuk Çilingir El Takımı Çantası",
      "category": "machinery",
      "unitCost": 16000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "counter_desk",
      "name": "Atölye Çalışma Tezgahı, Mengene & Kasa",
      "category": "furniture",
      "unitCost": 14000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "pos_cash",
      "name": "Mobil Saha Destekli POS Terminali & Yazar Kasa",
      "category": "core_tech",
      "unitCost": 16000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "signboard",
      "name": "LED Işıklı Anahtar Tasarımlı Dış Tabela & Gece Totemi",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 45000,
  "initialInventoryDescription": "Bilyalı çelik kapı kilit göbekleri (Kale/Yuma), asma kilitler, ham pirinç anahtar taslakları, oto kumanda kapları, piller ve kilit emniyet rozetleri.",
  "softwareLicenseCost": {
    "annual": 12000,
    "monthlyMaintenance": 950,
    "name": "Oto İmmobilizer PIN Kod & Müşteri İşlem Kayıt Yazılımı"
  },
  "recommendedStaff": [
    {
      "role": "Usta Çilingir / Atölye Sahibi",
      "count": 1,
      "avgSalary": 45000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Saha / Gezici Kapı Açma Elemanı",
      "count": 1,
      "avgSalary": 30000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Anahtar Kopyalama & Kapı Açma Servisi",
    "unitPrice": 380,
    "targetUnitsPerDay": 8,
    "unitLabel": "İşlem / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Anahtar Kopyalama & Çilingir Servisi",
    "unitLabel": "İşlem",
    "priceLabel": "İşlem Başına Ortalama Gelir",
    "defaultVolume": 20,
    "minVolume": 6,
    "maxVolume": 50,
    "stepVolume": 2,
    "avgTicketPrice": 380,
    "grossMarginPercent": 75,
    "daysPerMonth": 30,
    "description": "Ev anahtarı kopyalama (50-150 TL), oto immobilizer kumanda kodlama (800-2500 TL), kilit değişimi ve 7/24 acil kapı açma servisleri."
  },
  "monthlyUtilitiesEstimate": 5500,
  "monthlyAccountingFee": 2600
},

  'oto-tamir-mekanik': {
  "id": "oto-tamir-mekanik",
  "name": "Oto Tamir & Mekanik Bakım Servisi",
  "emoji": "🔧",
  "categoryGroup": "Otomotiv & Sanayi",
  "defaultM2": 110,
  "fitoutCostPerM2": 2800,
  "legalBasis": "TSE 12047 Yetkili/Özel Servis Standardı & Belediye Sanayi Ruhsatı",
  "statutoryCapital": 50000,
  "mandatoryLegalItems": [
    {
      "name": "Sanayi / Esnaf Odası Motorlu Araç Bakım Ustalık Tescili",
      "cost": 18000,
      "description": "Motor ve mekanik ustalık tescili"
    },
    {
      "name": "Belediye Gayrisıhhi Müessese İşyeri Ruhsatı",
      "cost": 22000,
      "description": "Sanayi sitesi işyeri açma ruhsatı"
    },
    {
      "name": "İtfaiye Yangın & Atık Yağ Depolama Raporu",
      "cost": 14000,
      "description": "Atık motor yağı bertaraf ve yangın onayı"
    }
  ],
  "equipments": [
    {
      "id": "fire_ext",
      "name": "Yangın Söndürme Tüpleri (6kg KKT & Köpüklü)",
      "category": "mandatory",
      "unitCost": 4500,
      "defaultQty": 2,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set",
      "scalesWithM2": true,
      "m2Ratio": 100
    },
    {
      "id": "hydraulic_lift",
      "name": "Elektro-Hidrolik 2 Sütunlu Araç Kaldırma Lifti (4 Ton Kapasiteli)",
      "category": "machinery",
      "unitCost": 85000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Adet",
      "description": "TSE/CE onaylı araç altı mekanik onarım lifti."
    },
    {
      "id": "diagnostic_scanner",
      "name": "Universal Arıza Tespit & Beyin Kodlama Cihazı (Launch/Autel)",
      "category": "core_tech",
      "unitCost": 45000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Set"
    },
    {
      "id": "tool_chest",
      "name": "Dolu Mekanik Takım Arabası & Lokma/Anahtar Setleri (7 Çekmeceli)",
      "category": "machinery",
      "unitCost": 34000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": true,
      "unitLabel": "Takım"
    },
    {
      "id": "oil_drainer",
      "name": "Pnömatik Atık Yağ Emiş & Boşaltma Tankı (80 Litre)",
      "category": "machinery",
      "unitCost": 16500,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "compressor_air",
      "name": "Vidalı/Pistonlu Hava Kompresörü (300 Litre 8 Bar)",
      "category": "machinery",
      "unitCost": 32000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Adet"
    },
    {
      "id": "office_desk",
      "name": "Müşteri Kabul Masası, PC İstasyonu & Koltuk",
      "category": "furniture",
      "unitCost": 18000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "pos_cash",
      "name": "POS Kasa & e-Fatura Terminali",
      "category": "core_tech",
      "unitCost": 22000,
      "defaultQty": 1,
      "minQty": 1,
      "isLocked": false,
      "unitLabel": "Set"
    },
    {
      "id": "signboard",
      "name": "LED Işıklı Sanayi Dış Tabela",
      "category": "core_tech",
      "unitCost": 24000,
      "defaultQty": 1,
      "minQty": 0,
      "isLocked": false,
      "unitLabel": "Set"
    }
  ],
  "initialInventoryCost": 65000,
  "initialInventoryDescription": "Filtreler, motor yağları, fren hidrolikleri, bujiler, kelepçeler, cıvatalar, balata spreyleri ve temizlik kimyasalları.",
  "softwareLicenseCost": {
    "annual": 16000,
    "monthlyMaintenance": 1200,
    "name": "Oto Servis İş Emri, Parça Maliyet & Müşteri Takip Programı"
  },
  "recommendedStaff": [
    {
      "role": "Baş Mekanik Ustası / Servis Sahibi",
      "count": 1,
      "avgSalary": 55000,
      "isMandatory": true,
      "allowOwnerFulfillment": true
    },
    {
      "role": "Mekanik Kalfası & Bakım Elemanı",
      "count": 1,
      "avgSalary": 35000,
      "isMandatory": false
    }
  ],
  "breakEvenMetric": {
    "label": "Günlük Periyodik Bakım & Onarım Aracı",
    "unitPrice": 1800,
    "targetUnitsPerDay": 4,
    "unitLabel": "Araç / Gün"
  },
  "revenueModel": {
    "periodType": "daily",
    "volumeLabel": "Günlük Bakım & Tamir Yapılan Araç Sayısı",
    "unitLabel": "Araç",
    "priceLabel": "Araç Başına Ortalama İşçilik & Bakım Tutarı",
    "defaultVolume": 8,
    "minVolume": 2,
    "maxVolume": 25,
    "stepVolume": 1,
    "avgTicketPrice": 1800,
    "grossMarginPercent": 55,
    "daysPerMonth": 26,
    "description": "Periyodik yağ/filtre bakımları (800-1500 TL işçilik), fren/balata değişimi, alt takım onarımı ve motor revizyonları."
  },
  "monthlyUtilitiesEstimate": 12000,
  "monthlyAccountingFee": 3200
},

};

export const BUSINESS_SETUP_TEMPLATES: BusinessTemplate[] = Object.values(BUSINESS_TEMPLATES).sort((a, b) =>
  a.name.localeCompare(b.name, 'tr')
);

export function getBusinessTemplateById(id: string): BusinessTemplate {
  if (BUSINESS_TEMPLATES[id]) return BUSINESS_TEMPLATES[id];
  const found = BUSINESS_SETUP_TEMPLATES.find((t) => t.id === id);
  return found || BUSINESS_TEMPLATES['sigorta-acentesi'];
}

export function getTemplatesByCategoryGroup(groupName: string): BusinessTemplate[] {
  if (groupName === 'Tümü') return BUSINESS_SETUP_TEMPLATES;
  return BUSINESS_SETUP_TEMPLATES.filter((t) => t.categoryGroup === groupName);
}

export function getAllCategoryGroups(): ('Finans & Hizmet' | 'Yeme - İçme' | 'Kişisel Bakım & Sağlık' | 'Perakende & Zanaat' | 'Perakende & Mağazacılık' | 'Otomotiv & Sanayi')[] {
  return [
    'Finans & Hizmet',
    'Yeme - İçme',
    'Kişisel Bakım & Sağlık',
    'Perakende & Zanaat',
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
