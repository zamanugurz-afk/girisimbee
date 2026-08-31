import type { BusinessTemplate, SetupEquipment } from '../types/business-setup.types';

/**
 * m² değerine göre dinamik olarak yangın tüpü, klima ve masa adetlerini hesaplar.
 * Binaların Yangından Korunması Hakkında Yönetmelik Md. 99 gereği:
 * - 0 - 100 m²: Asgari 1 adet 6kg ABC
 * - 101 - 200 m²: Asgari 2 adet 6kg ABC
 * - 201 - 300 m²: Asgari 3 adet
 * - 301+ m²: Her 100 m² için +1 adet
 */
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

export const BUSINESS_SETUP_TEMPLATES: BusinessTemplate[] = [
  // =========================================================================
  // 1. KİŞİSEL BAKIM, GÜZELLİK & SAĞLIK
  // =========================================================================
  {
    id: 'eczane',
    name: 'Eczane & Medikal',
    emoji: '💊',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 60,
    fitoutCostPerM2: 4500,
    initialInventoryCost: 450000,
    initialInventoryDescription: 'Ecza deposundan ilk ruhsatlı reçeteli ilaçlar, OTC vitaminler, dermokozmetik, bebek maması ve medikal ilk ürün stok paketi.',
    softwareLicense: {
      name: 'TEB Medula & İTS Entegre Eczane ERP Yazılımı (RxMediaPharma / TEBEOS / İlon)',
      type: 'Eczane ERP & İlaç Takip',
      initialCost: 14500,
      monthlyCost: 850,
      description: 'Karekod İTS bildirimleri, reçete provizyonu, SGK Medula faturalama ve ecza deposu e-Fatura entegrasyonu.',
    },
    monthlyUtilitiesEstimate: 6000,
    monthlyAccountingFee: 3000,
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
      { id: 'ecz-1', name: 'Yangın Söndürme Tüpü (6kg ABC Kuru Kimyevi Toz)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Binaların Yangından Korunması Hakkında Yönetmelik Md. 99 (Her 100m² için en az 1 adet 6kg ABC tüp).' },
      { id: 'ecz-2', name: 'TEB Standartlarında Kilitli İlaç Çekmece Dolapları (Raylı Sistem)', category: 'mandatory', unitCost: 65000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Eczacılık Yönetmeliği ilaç saklama standartları.' },
      { id: 'ecz-3', name: 'Isı ve Nem Takip Cihazlı Medikal Aşı Buzdolabı (+2°C / +8°C)', category: 'appliances', unitCost: 36000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Bakanlık soğuk zincir aşı ve ilaç saklama zorunluluğu.' },
      { id: 'ecz-4', name: 'Majistral İlaç Hazırlama Laboratuvar Tezgahı & Hassas Terazi', category: 'machinery', unitCost: 28000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Majistral ilaç hazırlama alanı yasal zorunludur.' },
      { id: 'ecz-5', name: 'Kırmızı/Yeşil Reçeteli İlaçlar İçin Kilitli Çelik Kasa', category: 'mandatory', unitCost: 12500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Uyuşturucu ve psikotrop ilaçlar kilitli kasada tutulmalıdır.' },
      { id: 'ecz-6', name: 'Eczane Satış Bankosu ve 2D Karekod Okuyuculu Bilgisayarlar', category: 'core_tech', unitCost: 32000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'ecz-7', name: 'Eczane Dış E-Logo Tabelası (Bakanlık Standartlarında LED)', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Standart E logosu tabelası zorunludur.' },
      
      // KONFOR & OPERASYONEL DEMİRBAŞLAR
      { id: 'ecz-8', name: 'Eczane Tipi Boy-Kilo Ölçerli Dijital Analiz Tartısı & Tansiyon İstasyonu', category: 'comfort', unitCost: 18500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', description: 'Gelen danışanlar için boy, kilo, BMI ve tansiyon ölçüm cihazı.' },
      { id: 'ecz-9', name: 'Müşteri Bekleme Koltukları & Reçete Bekleme Sehpası', category: 'comfort', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım', description: 'Reçete hazırlanmasını bekleyen hastalar için dinlenme alanı.' },
      { id: 'ecz-10', name: 'Otomatik Çay & Kahve İkram Makinesi', category: 'comfort', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', description: 'Müşteri ve personel için sıcak içecek makinesi.' },
      { id: 'ecz-11', name: 'İnverter Split İklimlendirme Kliması (18.000 BTU)', category: 'comfort', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 80, description: 'İlaçların 25°C oda sıcaklığında tutulması ve müşteri konforu.' },
      { id: 'ecz-12', name: 'Dermokozmetik & Vitamin LED Işıklı Cam Teşhir Reyonları', category: 'furniture', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', description: 'Cilt bakım ve besin takviyesi ürünleri için özel aydınlatmalı raflar.' },
      { id: 'ecz-13', name: 'Arıtmalı Sıcak-Soğuk Su Sebili', category: 'comfort', unitCost: 6500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'ecz-14', name: 'Eczane İçi Müzik & Ambiyans Ses Sistemi', category: 'comfort', unitCost: 9500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Sahip & Mesul Müdür Eczacı', count: 1, avgSalary: 55000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi eczacı ise 0 seçebilir.' },
      { role: 'Eczane Teknisyeni / Kalfası', count: 1, avgSalary: 30000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },
  {
    id: 'dis_klinigi',
    name: 'Diş Kliniği & Muayenehane',
    emoji: '🦷',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 90,
    fitoutCostPerM2: 5800,
    initialInventoryCost: 65000,
    initialInventoryDescription: 'Kompozit dolgu setleri, kanal eğeleri, ölçü maddeleri, anestezi ampulleri, cerrahi eldiven ve steril sarf malzeme ilk stoku.',
    softwareLicense: {
      name: 'Dental Klinik Hasta Takip, PACS Radyoloji & Randevu ERP Lisansı',
      type: 'Klinik ERP',
      initialCost: 16500,
      monthlyCost: 950,
      description: 'Diş şeması, dijital röntgen PACS entegrasyonu, SMS randevu hatırlatma ve e-SMM modülü.',
    },
    monthlyUtilitiesEstimate: 8500,
    monthlyAccountingFee: 3500,
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
      { id: 'dis-1', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'dis-2', name: 'Tam Donanımlı Dental Ünit & LED Reflektör & Hekim Taburesi', category: 'machinery', unitCost: 220000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Yönetmelik Ek-1 klinik asgari tıbbi donanım standardı.' },
      { id: 'dis-3', name: 'Dental Otoklav Sterilizasyon Cihazı (B Sınıfı 18L)', category: 'machinery', unitCost: 55000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Tıbbi aletlerin sterilizasyonu için B sınıfı otoklav zorunludur.' },
      { id: 'dis-4', name: 'Yağsız Sessiz Dental Kompresör & Cerrahi Aspiratör Sistemi', category: 'machinery', unitCost: 38000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'dis-5', name: 'Hasta Karşılama, Bekleme Koltukları ve Danışma Bankosu', category: 'furniture', unitCost: 28000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'dis-6', name: 'Klinik İçi Kahve & Çay İkram İstasyonu', category: 'comfort', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'dis-7', name: 'Bekleme Alanı Akıllı TV & Bilgilendirme Ekranı', category: 'comfort', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'dis-8', name: 'İnverter Klinik Kliması (24.000 BTU)', category: 'comfort', unitCost: 32000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Diş Hekimi (Mesul Müdür)', count: 1, avgSalary: 60000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi diş hekimi ise 0 seçebilir.' },
      { role: 'Ağız ve Diş Sağlığı Teknikeri / Asistanı', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },
  {
    id: 'kadin_kuaforu',
    name: 'Kadın Kuaförü & Güzellik Salonu',
    emoji: '💇‍♀️',
    categoryGroup: 'Kişisel Bakım & Sağlık',
    defaultM2: 80,
    fitoutCostPerM2: 3800,
    initialInventoryCost: 45000,
    initialInventoryDescription: 'Profesyonel saç boyaları, açıcılar, keratin bakım setleri, şampuanlar, sir ağda ve tek kullanımlık havlu stoku.',
    softwareLicense: {
      name: 'Kuaför & Güzellik Salonu Randevu & Adisyon CRM Lisansı',
      type: 'Salon CRM',
      initialCost: 7500,
      monthlyCost: 450,
      description: 'Müşteri geçmişi, uzman prim takibi, WhatsApp randevu teyidi ve kasa takibi.',
    },
    monthlyUtilitiesEstimate: 7500,
    monthlyAccountingFee: 2500,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: '3308 Sayılı Mesleki Eğitim Kanunu (Kuaförlük Ustalık Belgesi)',
      description: 'İşyeri sahibinin veya mesul müdürün Kuaförlük Ustalık Belgesi zorunludur.',
    },
    mandatoryLegalItems: [
      { name: 'Belediye Sıhhi Müessese Kuaför Ruhsatı', cost: 11000, description: 'Hijyen denetimi ve açılış harcı' },
      { name: 'Kuaförler ve Berberler Esnaf Odası Kaydı', cost: 6500, description: 'Oda tescili ve ustalık tasdiki' },
      { name: 'Yangın ve Havalandırma Uygunluk Belgesi', cost: 3500, description: 'Kimyasal koku tahliye ve yangın teftişi' },
    ],
    equipments: [
      { id: 'kua-1', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'kua-2', name: 'Işıklı Aynalı Profesyonel Kuaför Tezgahı & Hidrolik Koltuk', category: 'furniture', unitCost: 22000, defaultQty: 3, minQty: 1, isLocked: true, unitLabel: 'Takım', scalesWithM2: true, m2Ratio: 25 },
      { id: 'kua-3', name: 'Seramik Başlıklı Masajlı Saç Yıkama Seti', category: 'machinery', unitCost: 18500, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kua-4', name: 'Ayaklı Dijital Ozonlu Saç Vapozon & Klimazon Cihazı', category: 'machinery', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'kua-5', name: 'UV Sterilizatör & Fırça/Makas Hijyen Cihazı', category: 'machinery', unitCost: 6500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Hijyen mevzuatı alet sterilizasyon şartı.' },
      { id: 'kua-6', name: 'Müşteri Bekleme Lounge Koltuk Takımı & Dergi Sehpası', category: 'comfort', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'kua-7', name: 'Tam Otomatik Kahve & Çay İkram Makinesi', category: 'comfort', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'kua-8', name: 'Salon Tipi İnverter Klima (24.000 BTU)', category: 'comfort', unitCost: 32000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'kua-9', name: 'Ambiyans Müzik Ses Sistemi & Bluetooth Hoparlörler', category: 'comfort', unitCost: 9500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Usta Kuaför / Saç Tasarımcısı', count: 1, avgSalary: 42000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi ustalık belgeli kuaför ise 0 seçebilir.' },
      { role: 'Kalfa / Renklendirme Uzmanı', count: 1, avgSalary: 30000, isMandatory: false, allowOwnerFulfillment: false },
      { role: 'Çırak / Yıkama & Asistan', count: 1, avgSalary: 22000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },

  // =========================================================================
  // 2. YEME - İÇME & GASTRONOMİ
  // =========================================================================
  {
    id: 'kafe_kahveci',
    name: 'Kafe & 3. Nesil Kahveci',
    emoji: '☕',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 85,
    fitoutCostPerM2: 4500,
    initialInventoryCost: 48000,
    initialInventoryDescription: 'Nitelikli çekirdek kahveler, bitkisel/özel sütler, şuruplar, karton bardaklar, pasta ve tatlı ilk hammadde stoku.',
    softwareLicense: {
      name: 'Bulut Restoran & Kafe Adisyon / QR Menü / e-Adisyon ERP Lisansı (Adisyo / SambaPOS / Menulux)',
      type: 'Adisyon & POS ERP',
      initialCost: 11000,
      monthlyCost: 650,
      description: 'Masa sipariş, paket servis, garson el terminali, QR dijital menü ve Gelir İdaresi e-Adisyon entegrasyonu.',
    },
    monthlyUtilitiesEstimate: 12500,
    monthlyAccountingFee: 3000,
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
      { id: 'kaf-1', name: 'Yangın Söndürme Donanımı (1x 6kg ABC Kuru Kimyevi Toz + 1x 5kg CO2 Gazlı)', category: 'safety', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 80, regulatoryNote: 'Yangın Yönetmeliği Md. 99 (Mutfak ve elektrik panoları için 2 adet farklı tip tüp).' },
      { id: 'kaf-2', name: 'Endüstriyel 2 Gruplu Espresso Makinesi (La Marzocco / Sanremo / Nuova)', category: 'machinery', unitCost: 145000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kaf-3', name: 'On-Demand Otomatik Kahve Değirmeni (Mahlkönig / Mazzer)', category: 'machinery', unitCost: 32000, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'kaf-4', name: 'Sanayi Tipi Su Arıtma & Yumuşatma Sistemi', category: 'appliances', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Espresso makinelerinin kireçten korunması için zorunlu altyapı.' },
      { id: 'kaf-5', name: 'Tezgah Altı Çift Kapılı Paslanmaz Buzdolabı', category: 'appliances', unitCost: 34000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'kaf-6', name: 'Endüstriyel Günlük 40kg Buz Yapma Makinesi', category: 'appliances', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'kaf-7', name: 'Dokunmatik POS Terminali + Adisyon Yazıcısı', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'kaf-8', name: 'Masa & Sandalye / Berjer Oturma Grubu (İç & Dış Masa Takımları)', category: 'furniture', unitCost: 68000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 50 },
      { id: 'kaf-9', name: 'Soğutmalı Cam Pasta & Tatlı Teşhir Vitrini', category: 'appliances', unitCost: 38000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'kaf-10', name: 'Ambiyans Ses Sistemi (Bluetooth Tavan / Duvar Hoparlörleri)', category: 'comfort', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'kaf-11', name: 'Salon Tipi İnverter İklimlendirme Kliması (24.000 BTU)', category: 'comfort', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 80 },
    ],
    recommendedStaff: [
      { role: 'Baş Barista (Head Barista)', count: 1, avgSalary: 34000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi barista ise 0 seçebilir.' },
      { role: 'Yardımcı Barista / Servis Elemanı', count: 2, avgSalary: 25000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },
  {
    id: 'restoran_lokanta',
    name: 'Restoran & Lokanta',
    emoji: '🍽️',
    categoryGroup: 'Yeme - İçme',
    defaultM2: 130,
    fitoutCostPerM2: 5500,
    initialInventoryCost: 75000,
    initialInventoryDescription: 'Karkas et, sıvı yağ, bakliyat, un, sebze, baharat, meşrubat ve paket servis ambalaj stoku.',
    softwareLicense: {
      name: 'Kapsamlı Restoran ERP, Mutfak KDS & e-Dönüşüm Yazılım Lisansı',
      type: 'Restoran ERP',
      initialCost: 18500,
      monthlyCost: 1100,
      description: 'Mutfak ekranı (KDS), kurye takip, paket servis entegrasyonu (Yemeksepeti/Getir/Trendyol) ve e-Adisyon.',
    },
    monthlyUtilitiesEstimate: 22000,
    monthlyAccountingFee: 3500,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: '1. Sınıf Gayrisıhhi / Sıhhi Müessese Yönetmeliği & İtfaiye Baca Standartları',
      description: 'Sermaye şartı yoktur; mutfak baca sistemi, yangın yağ tutucu ve çevre uyumluluğu zorunludur.',
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
      { id: 'res-7', name: 'Restoran Salon Masa & Sandalye Grubu (20 Masa / 80 Sandalye)', category: 'furniture', unitCost: 110000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 60 },
      { id: 'res-8', name: 'El Terminali Destekli Restoran POS & Mutfak Yazıcı Sistemi', category: 'core_tech', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'res-9', name: 'Müşteri Salonu İklimlendirme & Havalandırma Ünitesi', category: 'comfort', unitCost: 42000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 70 },
    ],
    recommendedStaff: [
      { role: 'Aşçıbaşı / Usta Şef (Ustalık Belgeli)', count: 1, avgSalary: 45000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu şef ise 0 seçebilir.' },
      { role: 'Aşçı Yardımcısı & Bulaşıkhane', count: 2, avgSalary: 26000, isMandatory: false, allowOwnerFulfillment: false },
      { role: 'Kaptan Garson / Servis Elemanı', count: 2, avgSalary: 27000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },

  // =========================================================================
  // 3. PERAKENDE, MAĞAZACILIK & TİCARET
  // =========================================================================
  {
    id: 'market_bakkal',
    name: 'Market & Süpermarket',
    emoji: '🛒',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 110,
    fitoutCostPerM2: 3200,
    initialInventoryCost: 280000,
    initialInventoryDescription: 'Kuru gıda, süt ve süt ürünleri, içecek, temizlik, bisküvi, şarküteri ve temel tüketim maddeleri ilk reyon dolumu.',
    softwareLicense: {
      name: 'Market ERP, Hızlı Satış Barkod & Stok/Sayım Yazılım Lisansı (Netsis / Logo / NarPOS / Vega)',
      type: 'Market ERP & Barkod',
      initialCost: 16000,
      monthlyCost: 800,
      description: 'Gramajlı terazi barkod okuma, e-Arşiv fatura, e-İrsaliye, toptancı stok takibi ve kasa açığı kontrolü.',
    },
    monthlyUtilitiesEstimate: 14000,
    monthlyAccountingFee: 3000,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: 'Ticari İşyeri Açma ve Perakende Ticaret Yönetmeliği',
      description: 'Sermaye şartı yoktur; barkodlu terazi, perakende satış ruhsatı ve itfaiye belgesi aranır.',
    },
    mandatoryLegalItems: [
      { name: 'Ticari Market İşyeri Açma Ruhsatı', cost: 14000, description: 'Belediye perakende satış ruhsatı' },
      { name: 'TAPDK Tütün ve Alkol Satış Belgesi (Opsiyonel)', cost: 8500, description: 'Tarım Bakanlığı tütün/içecek satış izni' },
      { name: 'İtfaiye ve Elektrik Tesisat Uygunluk Belgesi', cost: 5000, description: 'Yangın ve aydınlatma teftişi' },
    ],
    equipments: [
      { id: 'mar-1', name: 'Yangın Söndürme Tüpleri (6kg ABC Kuru Kimyevi Toz)', category: 'safety', unitCost: 1800, defaultQty: 2, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99 (Her 100m² için en az 1 adet 6kg ABC).' },
      { id: 'mar-2', name: 'Barkodlu Kasa Bankosu + Terazi + Optik Okuyucu + Para Çekmecesi', category: 'core_tech', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'mar-3', name: 'Duvar Tipi Soğutmalı Sütlük & Şarküteri Dolabı (3 Metre)', category: 'appliances', unitCost: 75000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'mar-4', name: 'Dikey Camlı İçecek ve Meşrubat Dolabı', category: 'appliances', unitCost: 28000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'mar-5', name: 'Çift Taraflı Orta Market Reyonları ve Duvar Rafları (Çelik)', category: 'furniture', unitCost: 55000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 50 },
      { id: 'mar-6', name: 'Manav Teşhir Standı ve Aynalı Meyve-Sebze Reyonu', category: 'furniture', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'mar-7', name: '8 Kameralı Gece Görüşlü Güvenlik Kamera ve Kayıt Sistemi', category: 'core_tech', unitCost: 19500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      
      // ZENGİN KONFOR & OPERASYONEL DONANIMLAR
      { id: 'mar-8', name: 'Market İçi İnverter İklimlendirme Kliması (24.000 BTU)', category: 'comfort', unitCost: 34000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 80 },
      { id: 'mar-9', name: 'Müşteri Alışveriş Arabaları & El Sepetleri Seti (15 Sepet + 5 Araba)', category: 'comfort', unitCost: 14500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set', description: 'Müşteriler için tekerlekli metal market arabaları ve plastik el sepetleri.' },
      { id: 'mar-10', name: 'Otomatik Sahte Para Dedektörü & Para Sayma Makinesi', category: 'comfort', unitCost: 12500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', description: 'Kasa güvenliği için UV/manyetik sahte para tespit ve sayım cihazı.' },
      { id: 'mar-11', name: 'Giriş Kapısı Hava Perdesi (Isı Yalıtımı ve Toz Engelleme)', category: 'comfort', unitCost: 14000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', description: 'Kapı açıkken dışarıdaki sıcağı/soğuğu ve sinekleri içeri almayan hava perdesi.' },
      { id: 'mar-12', name: 'Kesintisiz Güç Kaynağı (Kasa & Kameralar İçin 3 kVA UPS)', category: 'comfort', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet', description: 'Elektrik kesintisinde kasa ve buzdolaplarının zarar görmesini önleyen güç kaynağı.' },
    ],
    recommendedStaff: [
      { role: 'Market Sorumlusu / Kasiyer', count: 1, avgSalary: 28000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kasiyerlik yapacaksa 0 seçebilir.' },
      { role: 'Reyon Görevlisi / Çırak', count: 1, avgSalary: 24000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },
  {
    id: 'butik_giyim',
    name: 'Butik Giyim & Moda',
    emoji: '👗',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 60,
    fitoutCostPerM2: 3600,
    initialInventoryCost: 220000,
    initialInventoryDescription: 'İlk sezon koleksiyonu (Elbise, ceket, pantolon, gömlek, çanta, kemer ve aksesuar askı stoku).',
    softwareLicense: {
      name: 'Omni-channel Butik Stok, Barkod & e-Ticaret / Pazaryeri ERP Lisansı (Nebim / İkas / Logo)',
      type: 'Mağaza ERP & e-Ticaret',
      initialCost: 14000,
      monthlyCost: 750,
      description: 'Fiziki mağaza ve Instagram/Trendyol stok senkronizasyonu, barkod basımı ve e-Arşiv fatura.',
    },
    monthlyUtilitiesEstimate: 4500,
    monthlyAccountingFee: 2500,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: 'Perakende Mağazacılık Ruhsatı',
      description: 'Sermaye şartı aranmaz.',
    },
    mandatoryLegalItems: [
      { name: 'Belediye Perakende Mağaza Ruhsatı', cost: 8500, description: 'Tekstil ve giyim satış izni' },
      { name: 'Oda Kaydı ve Vergi Tescil Harçları', cost: 6500, description: 'Esnaf veya Ticaret Odası kaydı' },
      { name: 'Yangın Güvenlik Uygunluğu', cost: 2500, description: 'Yangın tüpü ve tahliye belgesi' },
    ],
    equipments: [
      { id: 'but-1', name: 'Yangın Söndürme Tüpü & İlk Yardım Kiti', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'but-2', name: 'Mağaza Girişi Akusto-Manyetik Alarm Kapı Anteni + Sökücü', category: 'core_tech', unitCost: 22000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'but-3', name: 'Gold / Siyah Metal Duvar Askı Sistemleri ve Orta Stantlar', category: 'furniture', unitCost: 34000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 40 },
      { id: 'but-4', name: 'LED Aydınlatmalı Boy Aynalı Soyunma Kabinleri (2 Kabin)', category: 'furniture', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Takım' },
      { id: 'but-5', name: 'Sanayi Tipi Dikey Buharlı Kırışıklık Giderici Ütü', category: 'appliances', unitCost: 12500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'but-6', name: 'Müşteri Dinlenme Koltuğu & Sehpa', category: 'comfort', unitCost: 12000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'but-7', name: 'Mağaza İçi Müzik & Ambiyans Ses Sistemi', category: 'comfort', unitCost: 11000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'but-8', name: 'Barkodlu Kasa ve Stok Takip Bilgisayarı + POS', category: 'core_tech', unitCost: 19000, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'but-9', name: 'Otomatik Çay & Kahve İkram Makinesi', category: 'comfort', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'but-10', name: 'İnverter Mağaza Kliması (18.000 BTU)', category: 'comfort', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Mağaza Satış Temsilcisi / Stilist', count: 1, avgSalary: 28000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi satışta duracaksa 0 seçebilir.' },
    ],
  },
  {
    id: 'optik_gozluk',
    name: 'Optik & Gözlük Mağazası',
    emoji: '👓',
    categoryGroup: 'Perakende & Mağazacılık',
    defaultM2: 55,
    fitoutCostPerM2: 4200,
    initialInventoryCost: 190000,
    initialInventoryDescription: 'Optik reçeteli çerçeveler, güneş gözlükleri, hazır stok camlar, kontak lensler ve solüsyon ilk stok paketi.',
    softwareLicense: {
      name: 'Medula Optik SGK Entegre Stok & Karekod Lisansı',
      type: 'Optik ERP',
      initialCost: 12500,
      monthlyCost: 650,
      description: 'SGK Medula Optik reçete provizyonu, cam numara eşleme ve çerçeve barkod takip modülü.',
    },
    monthlyUtilitiesEstimate: 4500,
    monthlyAccountingFee: 2800,
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
      { id: 'opt-1', name: 'Yangın Söndürme Tüpü (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'opt-2', name: 'Otomatik Dijital Fokometre / Lensmetre (UV & Mavi Işık Ölçerli)', category: 'machinery', unitCost: 48000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: '5193 Sayılı Kanun gereği reçeteli cam ölçümü için zorunlu cihaz.' },
      { id: 'opt-3', name: 'Dijital Pupillometre (Gözbebeği Mesafe Ölçüm Cihazı)', category: 'machinery', unitCost: 16500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Odaklama mesafesi tespiti için yasal zorunlu.' },
      { id: 'opt-4', name: 'Ultrasonik Gözlük Temizleme ve Cam Kesim Montaj Tezgahı', category: 'machinery', unitCost: 26000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'opt-5', name: 'LED Aydınlatmalı Kilitli Çerçeve Teşhir Vitrinleri', category: 'furniture', unitCost: 42000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'opt-6', name: 'Müşteri Gözlük Deneme Koltukları & Aynalı Masa', category: 'comfort', unitCost: 15000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'opt-7', name: 'Kahve & Çay İkram Makinesi', category: 'comfort', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'opt-8', name: 'Medula Uyumlu Optik Kasa & Barkod Sistemi', category: 'core_tech', unitCost: 21000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'Mesul Müdür (Ruhsatlı Optisyen)', count: 1, avgSalary: 42000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu kendisi optisyen ise 0 seçebilir.' },
      { role: 'Optik Satış Danışmanı', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },

  // =========================================================================
  // 4. FİNANS & HİZMET SEKTÖRÜ
  // =========================================================================
  {
    id: 'sigorta_acentesi',
    name: 'Sigorta Acentesi',
    emoji: '🛡️',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 45,
    fitoutCostPerM2: 2400,
    initialInventoryCost: 8500,
    initialInventoryDescription: 'Poliçe basım kağıtları, kurumsal dosya, kaşe, matbu evrak ve kırtasiye başlangıç paketi.',
    softwareLicense: {
      name: 'Sigorta Acente Ekranları & Çoklu Teklif ERP Lisansı (Polisoft / Acente24 / Quick)',
      type: 'Sigorta Acente ERP',
      initialCost: 14000,
      monthlyCost: 950,
      description: '30+ sigorta şirketinden tek tıkla kasko/trafik/sağlık teklif karşılaştırma ve poliçe tanzimi.',
    },
    monthlyUtilitiesEstimate: 3500,
    monthlyAccountingFee: 2500,
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
      { id: 'sig-1', name: 'Yangın Söndürme Tüpü & İlk Yardım Seti (6kg ABC)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Binaların Yangından Korunması Hakkında Yönetmelik Md. 99.' },
      { id: 'sig-2', name: 'Kilitli Çelik Arşiv ve Kıymetli Evrak Kasası', category: 'mandatory', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'SEDDK mevzuatı gereği poliçe ve teminat evrakları kilitli kasada saklanmalıdır.' },
      { id: 'sig-3', name: 'Acente Operasyon İş İstasyonu (PC + Çift Monitör + UPS Kesintisiz Güç Kaynağı)', category: 'core_tech', unitCost: 28500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'sig-4', name: 'Yüksek Hızlı Çok Fonksiyonlu Belge Tarayıcı & Lazer Yazıcı', category: 'core_tech', unitCost: 16800, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'sig-5', name: 'Müşteri Karşılama ve Poliçe İnceleme Koltuk Grubu', category: 'comfort', unitCost: 15400, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'sig-6', name: 'Ofis Tipi Otomatik Çay & Kahve İkram Makinesi', category: 'comfort', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'sig-7', name: 'İnverter Split Klima (18.000 BTU A+++)', category: 'comfort', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'sig-8', name: 'Su Sebili / Arıtmalı Sıcak-Soğuk Su Makinesi', category: 'comfort', unitCost: 6500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'sig-9', name: 'Yönetici & Acente Müdürü Masa Takımı (Deri Koltuklu)', category: 'furniture', unitCost: 22500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
    ],
    recommendedStaff: [
      { role: 'Teknik Müdür (SEGEM Belgeli Sorumlu Müdür)', count: 1, avgSalary: 38000, isMandatory: true, allowOwnerFulfillment: true, description: 'İşletme sahibi SEGEM belgesine sahipse ve bizzat müdürlük yapacaksa 0 seçebilirsiniz.' },
      { role: 'Teknik Personel & Satış Uzmanı', count: 1, avgSalary: 28000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },
  {
    id: 'emlak_ofisi',
    name: 'Emlak & Gayrimenkul Ofisi',
    emoji: '🏢',
    categoryGroup: 'Finans & Hizmet',
    defaultM2: 50,
    fitoutCostPerM2: 2800,
    initialInventoryCost: 6500,
    initialInventoryDescription: 'Sözleşme koçanları, yetki belgeleri, branda, afiş ve kurumsal kırtasiye seti.',
    softwareLicense: {
      name: 'Emlak Portföy CRM & Çoklu İlan Portalları Entegrasyon Lisansı (Re-OS / Fizbo)',
      type: 'Emlak CRM',
      initialCost: 11000,
      monthlyCost: 700,
      description: 'Sahibinden/Hepsiemlak/Emlakjet otomatik ilan eşitleme, müşteri talep eşleştirme ve sözleşme arşivi.',
    },
    monthlyUtilitiesEstimate: 3800,
    monthlyAccountingFee: 2500,
    capitalRequirement: {
      minLegalCapital: 0,
      legalBasis: 'Taşınmaz Ticareti Hakkında Yönetmelik Md. 6',
      description: 'Sermaye şartı aranmaz; işletme sahibinin Seviye 5 Sorumlu Emlak Danışmanı Belgesi şarttır.',
    },
    mandatoryLegalItems: [
      { name: 'Taşınmaz Ticareti Yetki Belgesi Harcı', cost: 12000, description: 'Ticaret Bakanlığı onaylı yetki belgesi ve mesleki yeterlilik kaydı' },
      { name: 'İşyeri Açma ve Çalışma Ruhsatı', cost: 6500, description: 'Belediye ticari işyeri ruhsatı' },
      { name: 'Emlakçılar Odası & Ticaret Odası Kaydı', cost: 8500, description: 'Oda tescil ve sicil tasdiknamesi' },
      { name: 'Vergi Dairesi Mükellefiyet & e-İmza Kurulumu', cost: 2500, description: 'Resmi sözleşmeler için dijital altyapı' },
    ],
    equipments: [
      { id: 'eml-1', name: 'Işıklı LED Vitrin İlan Askı Panoları (A4/A3 Modüler Panolar)', category: 'mandatory', unitCost: 18500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'Taşınmaz Ticareti Yönetmeliği fiziki vitrin ilan standartları.' },
      { id: 'eml-2', name: 'Yangın Söndürme Tüpü (6kg ABC Kuru Kimyevi Toz)', category: 'safety', unitCost: 1800, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', scalesWithM2: true, m2Ratio: 100, regulatoryNote: 'Yangın Yönetmeliği Md. 99.' },
      { id: 'eml-3', name: 'Danışman Bilgisayar İstasyonu (Laptop + 27 inç Monitör)', category: 'core_tech', unitCost: 24000, defaultQty: 2, minQty: 1, isLocked: false, unitLabel: 'Set' },
      { id: 'eml-4', name: 'Renkli A3/A4 Çıktı ve Sözleşme Yazıcısı', category: 'core_tech', unitCost: 14500, defaultQty: 1, minQty: 1, isLocked: false, unitLabel: 'Adet' },
      { id: 'eml-5', name: 'Müşteri Görüşme ve Pazarlık Masası (6 Kişilik)', category: 'furniture', unitCost: 19500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Takım' },
      { id: 'eml-6', name: 'Geniş Açı Gayrimenkul Çekim Seti & Gimbal Sabitleyici', category: 'core_tech', unitCost: 16000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'eml-7', name: 'Müşteri İkram Kahve & Çay Makinesi', category: 'comfort', unitCost: 8500, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
      { id: 'eml-8', name: 'İnverter Split Klima (18.000 BTU)', category: 'comfort', unitCost: 26000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Adet' },
    ],
    recommendedStaff: [
      { role: 'Sorumlu Emlak Danışmanı (Seviye 5 Belgeli)', count: 1, avgSalary: 35000, isMandatory: true, allowOwnerFulfillment: true, description: 'İşletme sahibi Seviye 5 yetki belgesine sahipse 0 seçebilirsiniz.' },
      { role: 'Saha Gayrimenkul Danışmanı (Seviye 4)', count: 1, avgSalary: 26000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },

  // =========================================================================
  // 5. OTOMOTİV & SANAYİ HİZMETLERİ
  // =========================================================================
  {
    id: 'oto_ekspertiz',
    name: 'Oto Ekspertiz İstasyonu',
    emoji: '🔍',
    categoryGroup: 'Otomotiv & Sanayi Hizmetleri',
    defaultM2: 150,
    fitoutCostPerM2: 4500,
    initialInventoryCost: 15000,
    initialInventoryDescription: 'Araç içi koruma kılıfları, test etiketleri, kalibrasyon sıvıları ve raporlama kağıtları.',
    softwareLicense: {
      name: 'TSE 13805 Onaylı Dinamik Ekspertiz Raporlama & Bulut Diyagnostik Lisansı',
      type: 'Ekspertiz ERP',
      initialCost: 22000,
      monthlyCost: 1200,
      description: 'QR kodlu güvenli ekspertiz raporu, fren/süspansiyon test grafikleri ve bulut arşiv.',
    },
    monthlyUtilitiesEstimate: 12000,
    monthlyAccountingFee: 3000,
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
      { id: 'otoe-1', name: 'Yangın Söndürme İstasyonu (2x 6kg ABC + 1x 5kg CO2)', category: 'safety', unitCost: 3500, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', scalesWithM2: true, m2Ratio: 80, regulatoryNote: 'Sanayi tipi mekan ve araç altı denetim için 2 adet yangın tüpü zorunludur.' },
      { id: 'otoe-2', name: 'TSE Onaylı 4x4 Fren Test & Süspansiyon & Yanal Kayma Test Hattı', category: 'machinery', unitCost: 340000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set', regulatoryNote: 'TSE 13805 zorunlu test hattı.' },
      { id: 'otoe-3', name: 'Elektro-Hidrolik 4 Ton Araç Altı Kontrol Lifti', category: 'machinery', unitCost: 85000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet', regulatoryNote: 'Şasi ve alt takım muayenesi için zorunlu.' },
      { id: 'otoe-4', name: 'Evrensel OBD Beyin & Arıza Tespit Diyagnostik Cihazı', category: 'core_tech', unitCost: 45000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Adet' },
      { id: 'otoe-5', name: 'Dijital Manyetik Boya Kalınlık Ölçüm Cihazı (2 Adet)', category: 'core_tech', unitCost: 14000, defaultQty: 1, minQty: 1, isLocked: true, unitLabel: 'Set' },
      { id: 'otoe-6', name: 'Müşteri Bekleme Salonu Koltukları + TV + Çay Makinesi', category: 'comfort', unitCost: 22000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
      { id: 'otoe-7', name: 'Otomatik Raporlama Kiosku & Lazer Yazıcı', category: 'core_tech', unitCost: 24000, defaultQty: 1, minQty: 0, isLocked: false, unitLabel: 'Set' },
    ],
    recommendedStaff: [
      { role: 'TSE Belgeli Baş Ekspertiz Teknisyeni', count: 1, avgSalary: 42000, isMandatory: true, allowOwnerFulfillment: true, description: 'Kurucu teknisyen ise 0 seçebilir.' },
      { role: 'Mekanik / Kaporta Kontrol Ustası', count: 1, avgSalary: 32000, isMandatory: false, allowOwnerFulfillment: false },
    ],
  },
];

/**
 * Akıllı Demirbaş Arama & Öneri Sözlüğü (Kullanıcı arama yaptığında otomatik eşleşen hazır donanımlar)
 */
export interface SmartEquipmentPreset {
  keywords: string[];
  name: string;
  category: 'comfort' | 'furniture' | 'appliances' | 'core_tech' | 'safety' | 'machinery';
  suggestedUnitCost: number;
  unitLabel: string;
  description: string;
}

export const SMART_EQUIPMENT_DICTIONARY: SmartEquipmentPreset[] = [
  // Masalar & Mobilya
  { keywords: ['masa', 'makam', 'yönetici'], name: 'Yönetici Makam Masası & Deri Koltuk Takımı', category: 'furniture', suggestedUnitCost: 24000, unitLabel: 'Takım', description: 'Görüşmeler için lüks yönetici çalışma masası ve döner koltuk.' },
  { keywords: ['masa', 'çalışma', 'ofis'], name: 'Modüler Personel Çalışma Masası', category: 'furniture', suggestedUnitCost: 8500, unitLabel: 'Adet', description: 'Kablo kanallı ve çekmeceli ofis çalışma masası.' },
  { keywords: ['masa', 'bekleme', 'sehpa'], name: 'Müşteri Bekleme Masası & Zigon Sehpa Seti', category: 'furniture', suggestedUnitCost: 6500, unitLabel: 'Set', description: 'Misafir karşılama ve dergi sehpaları.' },
  { keywords: ['masa', 'toplantı', 'müzakere'], name: '8 Kişilik Oval Toplantı & Müzakere Masası', category: 'furniture', suggestedUnitCost: 28000, unitLabel: 'Takım', description: 'Priz kutulu kurumsal toplantı masası.' },
  { keywords: ['masa', 'restoran', 'yemek', 'kafe'], name: 'Restoran / Kafe Yemek Masası & 4 Sandalye', category: 'furniture', suggestedUnitCost: 7500, unitLabel: 'Takım', description: 'Ahşap/metal dayanıklı müşteri yemek masası.' },

  // Koltuklar
  { keywords: ['koltuk', 'berjer', 'dinlenme', 'bekleme'], name: 'Müşteri Bekleme Lounge Koltuk Grubu (İkili + Tekli)', category: 'comfort', suggestedUnitCost: 16000, unitLabel: 'Takım', description: 'Misafirler için konforlu bekleme koltuğu seti.' },
  { keywords: ['koltuk', 'personel', 'çalışma'], name: 'Ortopedik Fileli Yönetici / Personel Koltuğu', category: 'furniture', suggestedUnitCost: 5500, unitLabel: 'Adet', description: 'Bel destekli ayarlanabilir ofis sandalyesi.' },

  // İklimlendirme & Klimalar
  { keywords: ['klima', 'inverter', 'soğutma', 'ısıtma'], name: 'İnverter Split Klima (18.000 BTU A+++)', category: 'comfort', suggestedUnitCost: 26000, unitLabel: 'Adet', description: 'Enerji tasarruflu sessiz mekan iklimlendirme.' },
  { keywords: ['klima', 'salon', 'büyük'], name: 'Salon Tipi Ayaklı Ticari Klima (24.000 BTU)', category: 'comfort', suggestedUnitCost: 36000, unitLabel: 'Adet', description: 'Geniş ticari mekanlar için yüksek debili klima.' },
  { keywords: ['hava perdesi', 'kapı', 'perde'], name: 'Otomatik Giriş Kapısı Hava Perdesi (120 cm)', category: 'comfort', suggestedUnitCost: 14000, unitLabel: 'Adet', description: 'Giriş kapısından toz, koku ve ısı kaybını önleyen hava akımı.' },

  // Çay & Kahve & İkram
  { keywords: ['kahve', 'çay', 'ikram', 'otomat'], name: 'Otomatik Çay & Kahve İkram Makinesi', category: 'comfort', suggestedUnitCost: 8500, unitLabel: 'Adet', description: 'Müşteriler için taze çekirdekten kahve ve çay otomatı.' },
  { keywords: ['su', 'sebil', 'arıtma'], name: 'Arıtmalı Sıcak-Soğuk Su Sebili', category: 'comfort', suggestedUnitCost: 6500, unitLabel: 'Adet', description: 'Şebekeye bağlı filtreli sıcak/soğuk su makinesi.' },
  { keywords: ['çay kazanı', 'sanayi'], name: 'Endüstriyel 3 Demlikli Bakır Çay Kazanı', category: 'appliances', suggestedUnitCost: 16500, unitLabel: 'Adet', description: 'Yoğun işletmeler için tam otomatik çay ocağı.' },

  // Sağlık, Tartı & Baskül
  { keywords: ['tartı', 'baskül', 'boy', 'kilo', 'tansiyon'], name: 'Boy-Kilo Ölçerli Dijital Eczane Tartısı & Tansiyon Kiti', category: 'comfort', suggestedUnitCost: 18500, unitLabel: 'Set', description: 'Müşteriler için boy, kilo, yağ oranı ve tansiyon ölçüm istasyonu.' },
  { keywords: ['terazi', 'barkodlu', 'market'], name: 'Fiyat Hesaplamalı Barkodlu Terazi (30 kg)', category: 'core_tech', suggestedUnitCost: 16000, unitLabel: 'Adet', description: 'Market ve şarküteri için etiket basan hassas terazi.' },

  // Güvenlik, Kasa & Enerji
  { keywords: ['kasa', 'çelik', 'para'], name: 'Kilitli Ağır Hizmet Çelik Para ve Evrak Kasası', category: 'core_tech', suggestedUnitCost: 14500, unitLabel: 'Adet', description: 'Yangına ve darbelere dayanıklı şifreli çelik kasa.' },
  { keywords: ['kamera', 'güvenlik', 'kayıt'], name: '8 Kameralı Gece Görüşlü Güvenlik Kamera Seti + NVR', category: 'core_tech', suggestedUnitCost: 19500, unitLabel: 'Set', description: 'Cep telefonundan izlenebilir 4K gece görüşlü güvenlik sistemi.' },
  { keywords: ['alarm', 'kapı', 'ürün koruma'], name: 'Akusto-Manyetik Mağaza Ürün Koruma Kapı Anteni', category: 'core_tech', suggestedUnitCost: 22000, unitLabel: 'Set', description: 'Hırsızlığa karşı ürün alarmlarını tespit eden kapı anteni.' },
  { keywords: ['ups', 'güç kaynağı', 'kesintisiz'], name: 'Kesintisiz Güç Kaynağı (Online 3 kVA UPS)', category: 'core_tech', suggestedUnitCost: 16000, unitLabel: 'Adet', description: 'Elektrik kesildiğinde POS, bilgisayar ve modemleri açık tutan akü.' },
  { keywords: ['jeneratör', 'benzinli', 'elektrik'], name: 'Otomatik Transfer Panolu 8.5 kVA Benzinli Jeneratör', category: 'machinery', suggestedUnitCost: 38000, unitLabel: 'Adet', description: 'Elektrik kesintisinde anında devreye giren güç ünitesi.' },
  { keywords: ['para sayma', 'sahte para'], name: 'Otomatik Sahte Para Tespit ve Karışık Para Sayma Makinesi', category: 'core_tech', suggestedUnitCost: 12500, unitLabel: 'Adet', description: 'TL, USD ve EUR için UV/manyetik dedektörlü sayıcı.' },

  // Ses & Görüntü
  { keywords: ['ses', 'müzik', 'hoparlör'], name: 'Bluetooth & Tavan Tipi Mağaza / Kafe Ambiyans Ses Sistemi', category: 'comfort', suggestedUnitCost: 12500, unitLabel: 'Set', description: 'Mekan geneline homojen müzik yayını sağlayan tavan hoparlörleri ve amfi.' },
  { keywords: ['tv', 'televizyon', 'ekran', 'akıllı'], name: '55 inç 4K UHD Akıllı Bilgilendirme TV & Askı Aparatı', category: 'comfort', suggestedUnitCost: 18500, unitLabel: 'Adet', description: 'Müşteri bekleme alanı için akıllı televizyon.' },

  // Tabela & Aydınlatma
  { keywords: ['tabela', 'led', 'ışıklı', 'reklam'], name: 'LED Işıklı Pleksi Kutu Harf Dış Cephe Tabelası', category: 'core_tech', suggestedUnitCost: 26000, unitLabel: 'Adet', description: 'Kurumsal dış cephe ışıklı mağaza tabelası.' },
  { keywords: ['aydınlatma', 'spot', 'ray'], name: 'Ray Spot LED Mağaza Aydınlatma Seti (10 Spot + Raylar)', category: 'furniture', suggestedUnitCost: 16000, unitLabel: 'Set', description: 'Ürünleri ve reyonları öne çıkaran profesyonel sıcak ışık spotları.' },
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
