/**
 * Position-first responsibility / achievement catalogs for Kariyer Kartı.
 * Options are keyed by role, not sector, so two roles in the same sector stay distinct.
 */

export type PositionBundle = {
  responsibilities: readonly string[];
  achievements: readonly string[];
  professionalSkills: readonly string[];
  technicalSkills: readonly string[];
};

export type RoleFamily =
  | 'reception'
  | 'host'
  | 'housekeeping'
  | 'hotelOps'
  | 'restaurant'
  | 'restaurantManager'
  | 'kitchen'
  | 'kitchenChef'
  | 'retail'
  | 'storeManager'
  | 'cashier'
  | 'callCenter'
  | 'customerSuccess'
  | 'salesIndoor'
  | 'salesField'
  | 'salesManager'
  | 'regionalManager'
  | 'insuranceOps'
  | 'bankFront'
  | 'branchManager'
  | 'portfolioManager'
  | 'credit'
  | 'accounting'
  | 'software'
  | 'techLead'
  | 'data'
  | 'product'
  | 'design'
  | 'devops'
  | 'qa'
  | 'teacher'
  | 'schoolPrincipal'
  | 'hr'
  | 'hrManager'
  | 'marketing'
  | 'brandManager'
  | 'legal'
  | 'logistics'
  | 'warehouseLead'
  | 'driver'
  | 'factory'
  | 'productionLead'
  | 'shiftSupervisor'
  | 'construction'
  | 'siteChief'
  | 'autoService'
  | 'serviceManager'
  | 'public'
  | 'energy'
  | 'farm'
  | 'farmLead'
  | 'media'
  | 'mediaLead'
  | 'consulting'
  | 'admin'
  | 'officeManager'
  | 'beauty'
  | 'security';

const FAMILIES: Record<RoleFamily, PositionBundle> = {
  reception: {
    responsibilities: [
      'Misafir check-in ve check-out işlemlerinin yürütülmesi',
      'Rezervasyon ve oda / randevu planının takibi',
      'Telefon, e-posta ve yüz yüze karşılama',
      'Şikayet ve özel talep yönetiminin yapılması',
      'Kasa, emanet ve vardiya tesliminin tutulması',
      'Diğer birimlerle ön büro koordinasyonu',
    ],
    achievements: [
      'Check-in bekleme süresinin kısaltılması',
      'Misafir memnuniyet skorunun yükseltilmesi',
      'Rezervasyon hata oranının düşürülmesi',
      'Ön büro vardiya tesliminin düzenlenmesi',
    ],
    professionalSkills: [
      'Misafir karşılama',
      'Rezervasyon yönetimi',
      'Ön büro operasyonu',
      'Şikayet yönetimi',
      'Çoklu görev',
    ],
    technicalSkills: ['Opera / PMS', 'Rezervasyon sistemi', 'Excel', 'Outlook'],
  },
  host: {
    responsibilities: [
      'Misafir karşılama ve masaya / alana yönlendirme',
      'Bekleme listesi ve doluluk yönetiminin yapılması',
      'Özel gün ve VIP karşılama organizasyonu',
      'Servis ekibiyle akış koordinasyonu',
    ],
    achievements: [
      'Karşılama süresinin kısaltılması',
      'Bekleme şikayetlerinin azaltılması',
      'VIP misafir deneyiminin iyileştirilmesi',
    ],
    professionalSkills: ['Karşılama', 'Misafir yönlendirme', 'İletişim', 'Organizasyon'],
    technicalSkills: ['Rezervasyon defteri', 'POS', 'Excel'],
  },
  housekeeping: {
    responsibilities: [
      'Oda ve ortak alan temizliğinin yapılması',
      'Minibar ve amenity kontrolü',
      'Arıza ve kayıp bildirimlerinin iletilmesi',
      'Kat arabası ve stok düzeninin sağlanması',
    ],
    achievements: [
      'Oda teslim süresinin kısaltılması',
      'Temizlik şikayetlerinin azaltılması',
    ],
    professionalSkills: ['Kat hizmetleri', 'Hijyen', 'Detay kontrolü'],
    technicalSkills: ['Kat hizmetleri uygulaması', 'Excel'],
  },
  hotelOps: {
    responsibilities: [
      'Otel günlük operasyonunun planlanması',
      'Ön büro, kat ve teknik birim koordinasyonu',
      'Doluluk ve gelir takibinin yapılması',
      'Misafir deneyimi standartlarının denetlenmesi',
    ],
    achievements: [
      'Doluluk oranının artırılması',
      'Operasyon şikayetlerinin azaltılması',
    ],
    professionalSkills: ['Otel operasyonu', 'Ekip yönetimi', 'Gelir takibi'],
    technicalSkills: ['PMS', 'Excel', 'Power BI'],
  },
  restaurant: {
    responsibilities: [
      'Masa servisi ve sipariş alımının yapılması',
      'Mutfak ile servis koordinasyonu',
      'Hesap kapama ve POS işlemleri',
      'Misafir talep ve alerji bilgisinin aktarılması',
    ],
    achievements: [
      'Servis süresinin kısaltılması',
      'Masa çevrim hızının artırılması',
      'Servis şikayetlerinin azaltılması',
    ],
    professionalSkills: ['Masa servisi', 'Misafir ilişkileri', 'Ekip çalışması'],
    technicalSkills: ['POS', 'Adisyon sistemi', 'Excel'],
  },
  kitchen: {
    responsibilities: [
      'Menü kalemlerinin reçeteye göre hazırlanması',
      'Mise en place ve istasyon düzeninin sağlanması',
      'Gıda güvenliği ve hijyen kurallarına uyum',
      'Fire ve stok kontrolünün yapılması',
    ],
    achievements: [
      'Teslim süresinin kısaltılması',
      'Fire oranının düşürülmesi',
      'Kalite standartlarının korunması',
    ],
    professionalSkills: ['Yemek hazırlama', 'Hijyen', 'İstasyon yönetimi'],
    technicalSkills: ['Reçete yazılımı', 'Stok takip', 'Excel'],
  },
  retail: {
    responsibilities: [
      'Mağaza müşterisine ürün danışmanlığı',
      'Teşhir ve stok düzeninin sağlanması',
      'Kasa ve iade işlemlerine destek',
      'Kampanya ve hedef takibinin yapılması',
    ],
    achievements: [
      'Mağaza ciro hedefinin yakalanması',
      'Sepet ortalamasının artırılması',
      'Stok sayım doğruluğunun yükseltilmesi',
    ],
    professionalSkills: ['Mağaza satışı', 'Ürün bilgisi', 'Müşteri danışmanlığı'],
    technicalSkills: ['Mağaza POS', 'Stok sistemi', 'Excel'],
  },
  cashier: {
    responsibilities: [
      'Kasa işlemlerinin hatasız kapatılması',
      'Nakit, kart ve iade mutabakatı',
      'Fiş / fatura düzeninin sağlanması',
      'Kuyruk ve müşteri akışına destek',
    ],
    achievements: [
      'Kasa farkının azaltılması',
      'İşlem süresinin kısaltılması',
    ],
    professionalSkills: ['Kasa yönetimi', 'Dikkat', 'Müşteri iletişimi'],
    technicalSkills: ['POS', 'Yazar kasa', 'Excel'],
  },
  callCenter: {
    responsibilities: [
      'Gelen çağrı ve taleplerin karşılanması',
      'Ticket / CRM kaydının açılması',
      'Çözüm ve yönlendirme süreçlerinin yürütülmesi',
      'Çağrı kalitesi standartlarına uyum',
    ],
    achievements: [
      'İlk temasta çözüm oranının artırılması',
      'Ortalama görüşme süresinin iyileştirilmesi',
      'Müşteri memnuniyet skorunun yükseltilmesi',
    ],
    professionalSkills: ['Çağrı karşılama', 'Aktif dinleme', 'Sorun çözme'],
    technicalSkills: ['Çağrı merkezi yazılımı', 'CRM', 'Excel'],
  },
  customerSuccess: {
    responsibilities: [
      'Müşteri sağlık skorunun takibi',
      'Onboarding ve eğitim planının yürütülmesi',
      'Yenileme ve genişleme fırsatlarının izlenmesi',
      'Kayıp riski olan hesapların kurtarılması',
    ],
    achievements: [
      'Yenileme oranının artırılması',
      'Churn oranının düşürülmesi',
    ],
    professionalSkills: ['Müşteri başarı', 'Hesap yönetimi', 'İhtiyaç analizi'],
    technicalSkills: ['CRM', 'Gainsight / CS aracı', 'Excel'],
  },
  salesIndoor: {
    responsibilities: [
      'İç satış hunisinin yönetilmesi',
      'Teklif ve sipariş süreçlerinin takibi',
      'Mevcut müşteriye çapraz satış',
      'CRM kayıtlarının güncel tutulması',
    ],
    achievements: [
      'İç satış hedefinin aşılması',
      'Teklif dönüşüm oranının artırılması',
    ],
    professionalSkills: ['İç satış', 'Teklif yönetimi', 'Müzakere'],
    technicalSkills: ['CRM', 'Excel', 'Outlook'],
  },
  salesField: {
    responsibilities: [
      'Saha ziyaret planının uygulanması',
      'Yeni müşteri kazanımı',
      'Sipariş ve tahsilat takibi',
      'Bölge raporunun hazırlanması',
    ],
    achievements: [
      'Bölge ciro hedefinin aşılması',
      'Aktif müşteri sayısının artırılması',
    ],
    professionalSkills: ['Saha satış', 'Rota planlama', 'Müzakere'],
    technicalSkills: ['CRM', 'Excel', 'Harita / saha uygulaması'],
  },
  insuranceOps: {
    responsibilities: [
      'Poliçe giriş ve yenileme işlemleri',
      'Hasar evraklarının takibi',
      'Teknik evrak ve teminat kontrolü',
      'Acente / müşteri bilgilendirmesi',
    ],
    achievements: [
      'Poliçe işlem süresinin kısaltılması',
      'Evrak hata oranının düşürülmesi',
    ],
    professionalSkills: ['Poliçe operasyonu', 'Hasar takibi', 'Teknik kontrol'],
    technicalSkills: ['Sigorta poliçe yazılımı', 'Excel', 'CRM'],
  },
  bankFront: {
    responsibilities: [
      'Şube müşteri işlemlerinin karşılanması',
      'Hesap, kart ve başvuru süreçlerinin yürütülmesi',
      'Ürün bilgilendirme ve yönlendirme',
      'Şube kasa / evrak düzeninin sağlanması',
    ],
    achievements: [
      'İşlem bekleme süresinin kısaltılması',
      'Şube ürün satışının artırılması',
    ],
    professionalSkills: ['Müşteri işlemleri', 'Şube operasyonu', 'Ürün bilgisi'],
    technicalSkills: ['Banka çekirdek sistemi', 'Excel', 'Outlook'],
  },
  credit: {
    responsibilities: [
      'Kredi başvurusunun mali analizinin yapılması',
      'Teminat ve evrak kontrolü',
      'Risk notunun değerlendirilmesi',
      'Kredi komitesi dosyasının hazırlanması',
    ],
    achievements: [
      'Değerlendirme süresinin kısaltılması',
      'Dosya iade oranının düşürülmesi',
    ],
    professionalSkills: ['Kredi analizi', 'Risk değerlendirme', 'Mali analiz'],
    technicalSkills: ['Kredi karar sistemi', 'Excel', 'Power BI'],
  },
  accounting: {
    responsibilities: [
      'Günlük muhasebe fişlerinin işlenmesi',
      'e-Fatura / e-Defter süreçlerinin takibi',
      'Ay sonu mutabakat ve raporlama',
      'Vergi beyanname hazırlık desteği',
    ],
    achievements: [
      'Kapanış süresinin kısaltılması',
      'Mutabakat farklarının azaltılması',
    ],
    professionalSkills: ['Muhasebe', 'Mutabakat', 'Mali raporlama'],
    technicalSkills: ['Logo', 'Mikro', 'Excel', 'e-Fatura'],
  },
  software: {
    responsibilities: [
      'Yazılım özelliklerinin geliştirilmesi',
      'Kod incelemesi ve kalite kontrolü',
      'Hata ayıklama ve performans iyileştirme',
      'Teknik dokümantasyon',
    ],
    achievements: [
      'Özellik yayını ile ölçülebilir etki',
      'Hata oranının düşürülmesi',
    ],
    professionalSkills: ['Yazılım geliştirme', 'Kod incelemesi', 'Agile / Scrum'],
    technicalSkills: ['TypeScript', 'Git', 'SQL'],
  },
  data: {
    responsibilities: [
      'Veri setlerinin temizlenmesi ve modellemesi',
      'Rapor ve dashboard hazırlığı',
      'İş birimlerine içgörü sunulması',
      'Veri kalitesi kontrollerinin yapılması',
    ],
    achievements: [
      'Rapor üretim süresinin kısaltılması',
      'Karar süreçlerine ölçülebilir katkı',
    ],
    professionalSkills: ['Veri analizi', 'Raporlama', 'İş zekâsı'],
    technicalSkills: ['SQL', 'Python', 'Power BI', 'Excel'],
  },
  product: {
    responsibilities: [
      'Ürün yol haritasının netleştirilmesi',
      'Paydaş ihtiyaçlarının önceliklendirilmesi',
      'Geliştirme ekibiyle sprint planlama',
      'Çıkış sonrası metrik takibi',
    ],
    achievements: [
      'Özellik benimsenme oranının artırılması',
      'Teslim öngörülebilirliğinin yükseltilmesi',
    ],
    professionalSkills: ['Ürün yönetimi', 'Önceliklendirme', 'Paydaş yönetimi'],
    technicalSkills: ['Jira', 'Figma', 'SQL', 'Excel'],
  },
  design: {
    responsibilities: [
      'Kullanıcı arayüzü ve deneyim tasarımı',
      'Tasarım sisteminin uygulanması',
      'Kullanılabilirlik testlerinin yürütülmesi',
      'Geliştirme ekibiyle tasarım teslimi',
    ],
    achievements: [
      'Görev tamamlanma oranının artırılması',
      'Tasarım-geliştirme revizyonunun azaltılması',
    ],
    professionalSkills: ['UI/UX', 'Kullanıcı araştırması', 'Görsel tasarım'],
    technicalSkills: ['Figma', 'Adobe XD', 'Jira'],
  },
  devops: {
    responsibilities: [
      'CI/CD hatlarının kurulması ve bakımı',
      'Altyapı ve ortam yönetiminin yapılması',
      'İzleme ve alarm süreçlerinin işletilmesi',
      'Sürüm ve olay müdahalesi',
    ],
    achievements: [
      'Dağıtım süresinin kısaltılması',
      'Kesinti süresinin azaltılması',
    ],
    professionalSkills: ['DevOps', 'Otomasyon', 'Olay yönetimi'],
    technicalSkills: ['Docker', 'Kubernetes', 'AWS', 'Git'],
  },
  qa: {
    responsibilities: [
      'Test senaryolarının yazılması',
      'Manuel ve otomatik testlerin çalıştırılması',
      'Hata kaydı ve doğrulama',
      'Sürüm kalite kapısının işletilmesi',
    ],
    achievements: [
      'Canlı hata oranının düşürülmesi',
      'Regresyon süresinin kısaltılması',
    ],
    professionalSkills: ['Yazılım testi', 'Senaryo yazımı', 'Kalite güvence'],
    technicalSkills: ['Selenium', 'Postman', 'Jira', 'Git'],
  },
  teacher: {
    responsibilities: [
      'Ders planı ve içerik hazırlığı',
      'Anlatım ve sınıf / grup yönetiminin yapılması',
      'Ölçme-değerlendirme ve geri bildirim',
      'Veli veya katılımcı iletişimi',
    ],
    achievements: [
      'Öğrenci başarı ortalamasının yükseltilmesi',
      'Devamsızlık / kopma oranının düşürülmesi',
    ],
    professionalSkills: ['Anlatım', 'Sınıf yönetimi', 'Ölçme ve değerlendirme'],
    technicalSkills: ['EBA / LMS', 'PowerPoint', 'Excel'],
  },
  hr: {
    responsibilities: [
      'İşe alım hunisinin yönetilmesi',
      'Aday mülakat ve teklif süreçleri',
      'Özlük ve bordro evrak takibi',
      'Çalışan talep ve performans süreçleri',
    ],
    achievements: [
      'İşe alım süresinin kısaltılması',
      'Aday deneyiminin iyileştirilmesi',
    ],
    professionalSkills: ['İşe alım', 'Mülakat', 'Çalışan ilişkileri'],
    technicalSkills: ['ATS / İK yazılımı', 'Excel', 'Outlook'],
  },
  marketing: {
    responsibilities: [
      'Kampanya planı ve yayınının yapılması',
      'İçerik ve kanal performansının izlenmesi',
      'Hedef kitle ve bütçe optimizasyonu',
      'Raporlama ve A/B test takibi',
    ],
    achievements: [
      'Kampanya dönüşümünün artırılması',
      'Edinme maliyetinin düşürülmesi',
    ],
    professionalSkills: ['Kampanya yönetimi', 'İçerik stratejisi', 'Performans pazarlama'],
    technicalSkills: ['Google Ads', 'Meta Ads', 'Google Analytics', 'Excel'],
  },
  legal: {
    responsibilities: [
      'Sözleşme taslağı ve revizyonunun yapılması',
      'Hukuki risk ve uyum kontrolü',
      'Dava / ihtilaf dosyasının takibi',
      'İç birimlere hukuki görüş verilmesi',
    ],
    achievements: [
      'Sözleşme kapanış süresinin kısaltılması',
      'Uyuşmazlık riskinin azaltılması',
    ],
    professionalSkills: ['Sözleşme hukuku', 'Hukuki değerlendirme', 'Uyuşmazlık yönetimi'],
    technicalSkills: ['Uyap', 'Sözleşme yazılımı', 'Excel'],
  },
  logistics: {
    responsibilities: [
      'Sevkiyat ve mal kabul planının yürütülmesi',
      'Stok sayım ve adresleme',
      'Araç / hat kapasitesinin planlanması',
      'Hasar ve gecikme takibinin yapılması',
    ],
    achievements: [
      'Sevkiyat zamanında teslim oranının artırılması',
      'Stok sapmasının azaltılması',
    ],
    professionalSkills: ['Sevkiyat planlama', 'Stok kontrolü', 'Depo operasyonu'],
    technicalSkills: ['WMS', 'SAP', 'Excel', 'Barkod sistemi'],
  },
  driver: {
    responsibilities: [
      'Rota planına göre teslimatın yapılması',
      'Araç kontrol ve evrak düzeninin sağlanması',
      'Teslim tutanağı ve POD kaydı',
      'Hasar / gecikme bildiriminin iletilmesi',
    ],
    achievements: [
      'Zamanında teslim oranının artırılması',
      'Hasar bildirimlerinin azaltılması',
    ],
    professionalSkills: ['Teslimat', 'Rota takibi', 'Müşteri teslimi'],
    technicalSkills: ['Teslimat uygulaması', 'Navigasyon', 'Excel'],
  },
  factory: {
    responsibilities: [
      'Hat / makine operasyonunun yürütülmesi',
      'Kalite ve fire kontrolünün yapılması',
      'Vardiya teslim ve üretim kaydı',
      'İSG kurallarına uyum',
    ],
    achievements: [
      'Hat verimliliğinin artırılması',
      'Fire oranının düşürülmesi',
    ],
    professionalSkills: ['Üretim operasyonu', 'Kalite kontrol', 'İSG'],
    technicalSkills: ['MES / üretim kaydı'],
  },
  construction: {
    responsibilities: [
      'Saha imalatının plan ve projeye göre yürütülmesi',
      'Malzeme ve ekip koordinasyonu',
      'İş güvenliği ve kalite kontrolü',
      'İlerleme raporunun tutulması',
    ],
    achievements: [
      'Saha tesliminin zamanında tamamlanması',
      'İş kazası riskinin azaltılması',
    ],
    professionalSkills: ['Saha imalatı', 'Proje okuma', 'İSG'],
    technicalSkills: ['Şantiye takip yazılımı', 'Excel', 'AutoCAD temel'],
  },
  autoService: {
    responsibilities: [
      'Müşteri kabul ve arıza tespitinin yapılması',
      'İş emri, parça ve randevu planının yönetilmesi',
      'Atölye ile müşteri arasında ilerleme bilgisinin aktarılması',
      'Teslim ve memnuniyet kapanışının yapılması',
    ],
    achievements: [
      'Servis teslim süresinin kısaltılması',
      'Tekrar işçilik oranının düşürülmesi',
      'Müşteri memnuniyetinin artırılması',
    ],
    professionalSkills: ['Servis danışmanlığı', 'İş emri yönetimi', 'Müşteri iletişimi'],
    technicalSkills: ['DMS / servis yazılımı', 'Excel', 'Outlook'],
  },
  public: {
    responsibilities: [
      'Vatandaş / evrak başvurularının karşılanması',
      'Resmi kayıt ve evrak takibinin yapılması',
      'Mevzuata uygun yazışma',
      'Birim içi evrak arşivinin düzenlenmesi',
    ],
    achievements: [
      'Başvuru sonuçlandırma süresinin kısaltılması',
      'Evrak hata oranının düşürülmesi',
    ],
    professionalSkills: ['Evrak yönetimi', 'Vatandaş iletişimi', 'Mevzuat takibi'],
    technicalSkills: ['e-Devlet / kurum yazılımı', 'Word', 'Excel'],
  },
  energy: {
    responsibilities: [
      'Saha ekipman ve hat kontrolünün yapılması',
      'Arıza ve bakım iş emirlerinin yürütülmesi',
      'Ölçüm ve güvenlik kayıtlarının tutulması',
      'Kesinti / iş bitirme raporunun yazılması',
    ],
    achievements: [
      'Arıza müdahale süresinin kısaltılması',
      'Plansız kesintinin azaltılması',
    ],
    professionalSkills: ['Saha operasyonu', 'Bakım', 'İş güvenliği'],
    technicalSkills: ['SCADA / iş emri sistemi', 'Excel'],
  },
  farm: {
    responsibilities: [
      'Üretim / sulama planının uygulanması',
      'Hasat ve stok kaydının tutulması',
      'Zararlı / hastalık gözlemi',
      'Ekipman ve sera düzeninin sağlanması',
    ],
    achievements: [
      'Verim kaybının azaltılması',
      'Hasat planına uyumun artırılması',
    ],
    professionalSkills: ['Tarımsal üretim', 'Saha takibi', 'Hasat planlama'],
    technicalSkills: ['Çiftlik kayıt defteri', 'Excel'],
  },
  media: {
    responsibilities: [
      'İçerik planı ve yayınının yapılması',
      'Metin / görsel / video kurgusunun hazırlanması',
      'Yayın takvimi ve kanal takibi',
      'Etkileşim ve performans raporlaması',
    ],
    achievements: [
      'İçerik etkileşiminin artırılması',
      'Yayın aksaklıklarının azaltılması',
    ],
    professionalSkills: ['İçerik üretimi', 'Kurgu', 'Kanal yönetimi'],
    technicalSkills: ['Adobe Premiere', 'Canva', 'Excel'],
  },
  consulting: {
    responsibilities: [
      'Mevcut durum analizinin yapılması',
      'İyileştirme önerisi ve yol haritası hazırlığı',
      'Paydaş atölyelerinin kolaylaştırılması',
      'Uygulama takibi ve raporlama',
    ],
    achievements: [
      'Süreç süresinin kısaltılması',
      'Karar kalitesinin artırılması',
    ],
    professionalSkills: ['Analiz', 'Süreç tasarımı', 'Paydaş yönetimi'],
    technicalSkills: ['PowerPoint', 'Excel', 'Miro'],
  },
  admin: {
    responsibilities: [
      'Ofis evrak ve randevu düzeninin sağlanması',
      'İdari satın alma ve tedarik takibi',
      'Ziyaretçi ve iç iletişim koordinasyonu',
      'Arşiv ve evrak tesliminin yapılması',
    ],
    achievements: [
      'İdari talep kapanış süresinin kısaltılması',
      'Evrak kayıp oranının düşürülmesi',
    ],
    professionalSkills: ['Ofis yönetimi', 'Organizasyon', 'İletişim'],
    technicalSkills: ['Outlook', 'Excel', 'Word'],
  },
  beauty: {
    responsibilities: [
      'Müşteri karşılama ve randevu yönetiminin yapılması',
      'Kesim, şekillendirme ve bakım uygulamalarının yürütülmesi',
      'Hijyen ve malzeme hazırlığının sağlanması',
      'Ürün önerisi ve satış desteğinin verilmesi',
      'Müşteri memnuniyetinin takibi',
    ],
    achievements: [
      'Randevu doluluk oranının artırılması',
      'Müşteri sadakatinin güçlendirilmesi',
      'Hijyen şikayetinin azaltılması',
    ],
    professionalSkills: ['Müşteri ilişkileri', 'Hijyen', 'Ürün bilgisi', 'Zaman yönetimi'],
    technicalSkills: ['Randevu sistemi', 'WhatsApp Business', 'Kasa / POS'],
  },
  security: {
    responsibilities: [
      'Görev bölgesinin kontrol ve raporlanması',
      'Giriş-çıkış kayıtlarının tutulması',
      'Olay anında prosedüre uygun müdahale',
      'Nöbet tesliminin yapılması',
    ],
    achievements: [
      'Olay müdahale süresinin kısaltılması',
      'Giriş-çıkış kayıt düzeninin güçlendirilmesi',
    ],
    professionalSkills: ['Gözlem', 'Prosedür uyumu', 'Kriz anı sakinliği'],
    technicalSkills: ['Kamera izleme', 'Turnike / kartlı geçiş', 'Telsiz'],
  },
  kitchenChef: {
    responsibilities: [
      'Mutfak ekibinin vardiya ve istasyon planının yönetilmesi',
      'Menü, reçete ve porsiyon standartlarının denetlenmesi',
      'Gıda güvenliği, fire ve stok maliyetinin kontrolü',
      'Servis temposuna göre üretim akışının yönetilmesi',
      'Tedarikçi ve malzeme kalitesinin takip edilmesi',
    ],
    achievements: [
      'Fire oranının düşürülmesi',
      'Mutfak teslim süresinin kısaltılması',
      'Gıda güvenliği denetim skorunun yükseltilmesi',
    ],
    professionalSkills: ['Mutfak yönetimi', 'Maliyet kontrolü', 'Ekip yönetimi', 'Hijyen'],
    technicalSkills: ['Reçete yazılımı', 'Stok takip', 'Excel'],
  },
  restaurantManager: {
    responsibilities: [
      'Restoran ciro, maliyet ve vardiya planının yönetilmesi',
      'Servis ve mutfak ekiplerinin koordinasyonunun sağlanması',
      'Misafir deneyimi, şikâyet ve rezervasyon standartlarının denetlenmesi',
      'Gıda güvenliği, fire ve stok maliyetinin kontrolü',
      'Personel performans ve eğitim planının yürütülmesi',
    ],
    achievements: [
      'Restoran kârlılığının artırılması',
      'Misafir memnuniyet skorunun yükseltilmesi',
      'Fire ve personel maliyetinin düşürülmesi',
    ],
    professionalSkills: ['Restoran yönetimi', 'Ekip yönetimi', 'Maliyet kontrolü', 'Misafir deneyimi'],
    technicalSkills: ['POS', 'Rezervasyon sistemi', 'Excel'],
  },
  storeManager: {
    responsibilities: [
      'Mağaza ciro, kadro ve vardiya planının yönetilmesi',
      'Satış hedeflerinin ekiple kırılıp takip edilmesi',
      'Teşhir, stok ve kasa kapanış standartlarının denetlenmesi',
      'Müşteri şikâyeti ve iade süreçlerinin çözülmesi',
      'Personel performans ve eğitim planının yürütülmesi',
    ],
    achievements: [
      'Mağaza ciro hedefinin aşılması',
      'Personel verimliliğinin artırılması',
      'Stok kayıp oranının düşürülmesi',
    ],
    professionalSkills: ['Mağaza yönetimi', 'Ekip yönetimi', 'Hedef takibi', 'Müşteri deneyimi'],
    technicalSkills: ['Mağaza POS', 'Stok sistemi', 'Excel'],
  },
  salesManager: {
    responsibilities: [
      'Satış ekibinin hedef, pipeline ve performansının yönetilmesi',
      'Bölge / kanal kârlılığının planlanması',
      'Kritik müşteri ve ihale süreçlerinin yönetilmesi',
      'Tahmin, raporlama ve üst yönetime sonuç sunumu',
      'Satış sürecinin koçluk ve standartlarla iyileştirilmesi',
    ],
    achievements: [
      'Ekip satış hedefinin aşılması',
      'Pipeline dönüşüm oranının artırılması',
      'Ortalama anlaşma değerinin yükseltilmesi',
    ],
    professionalSkills: ['Satış yönetimi', 'Koçluk', 'Hedef kırılımı', 'Müzakere'],
    technicalSkills: ['CRM', 'Excel', 'Power BI'],
  },
  regionalManager: {
    responsibilities: [
      'Bölge şube / mağaza performansının yönetilmesi',
      'Saha ziyareti ve operasyon denetiminin yapılması',
      'Bölge bütçe ve kadro planının yürütülmesi',
      'Müdür kadrosunun koçluk ve gelişiminin sağlanması',
      'Bölge risk, stok ve müşteri deneyiminin izlenmesi',
    ],
    achievements: [
      'Bölge ciro ve kârlılığın artırılması',
      'Şube / mağaza standart sapmasının azaltılması',
    ],
    professionalSkills: ['Bölge yönetimi', 'Saha denetimi', 'Koçluk', 'Bütçe takibi'],
    technicalSkills: ['CRM', 'Excel', 'Power BI'],
  },
  branchManager: {
    responsibilities: [
      'Şube kârlılık, kadro ve günlük operasyonun yönetilmesi',
      'Mevduat, kredi ve ürün hedeflerinin ekiple gerçekleştirilmesi',
      'Şube risk, kasa, evrak ve iç kontrolün denetlenmesi',
      'Personel performans, vardiya ve eğitim planının yürütülmesi',
      'Müşteri şikâyeti ve kritik hesap ilişkilerinin yönetilmesi',
      'Bölge müdürlüğüne şube sonuç raporunun sunulması',
    ],
    achievements: [
      'Şube kârlılığının artırılması',
      'Müşteri memnuniyet skorunun yükseltilmesi',
      'Personel devir oranının düşürülmesi',
      'Hedef ürün satışının aşılması',
    ],
    professionalSkills: ['Şube yönetimi', 'Ekip yönetimi', 'Hedef takibi', 'İç kontrol', 'Müşteri ilişkileri'],
    technicalSkills: ['Banka çekirdek sistemi', 'Excel', 'Outlook'],
  },
  portfolioManager: {
    responsibilities: [
      'Müşteri portföyünün risk ve getiri dengesinin yönetilmesi',
      'Yatırım / ürün önerisinin ihtiyaç analizine göre sunulması',
      'Portföy performansının izlenmesi ve raporlanması',
      'Yeni varlık kazanımı ve mevcut ilişkinin derinleştirilmesi',
      'Uyulması gereken mevzuat ve uygunluk kontrollerinin yapılması',
    ],
    achievements: [
      'Yönetilen varlık hacminin artırılması',
      'Portföy getirisinin kıyas grubunun üzerine çıkarılması',
      'Müşteri tutma oranının yükseltilmesi',
    ],
    professionalSkills: ['Portföy yönetimi', 'Yatırım danışmanlığı', 'Risk-getiri analizi'],
    technicalSkills: ['Portföy / hazine sistemi', 'Excel', 'Bloomberg / matriks'],
  },
  techLead: {
    responsibilities: [
      'Teknik yol haritası ve mimari kararların yönetilmesi',
      'Yazılım ekibinin iş dağılımı ve kod kalitesinin denetlenmesi',
      'Kritik sürüm, kapasite ve teknik borç planının yürütülmesi',
      'Paydaşlarla kapsam ve teslim taahhüdünün netleştirilmesi',
      'Ekip koçluğu ve teknik standartların yerleştirilmesi',
    ],
    achievements: [
      'Teslim öngörülebilirliğinin artırılması',
      'Canlı hata oranının düşürülmesi',
      'Ekip teslim hızının yükseltilmesi',
    ],
    professionalSkills: ['Teknik liderlik', 'Mimari karar', 'Ekip yönetimi', 'Paydaş yönetimi'],
    technicalSkills: ['Git', 'CI/CD', 'Cloud', 'Jira'],
  },
  schoolPrincipal: {
    responsibilities: [
      'Okul akademik ve idari işleyişinin yönetilmesi',
      'Öğretmen kadrosu, ders programı ve denetimin planlanması',
      'Öğrenci başarı, disiplin ve veli ilişkisinin yönetilmesi',
      'Okul bütçesi, tesis ve mevzuat uyumunun sağlanması',
      'İl / ilçe müdürlüğü raporlama ve denetim süreçlerinin yürütülmesi',
    ],
    achievements: [
      'Öğrenci başarı ortalamasının yükseltilmesi',
      'Öğretmen devam ve gelişim planının güçlendirilmesi',
      'Veli memnuniyetinin artırılması',
    ],
    professionalSkills: ['Okul yönetimi', 'Eğitim liderliği', 'Veli ilişkileri', 'Mevzuat'],
    technicalSkills: ['e-Okul / MEBBİS', 'Excel', 'PowerPoint'],
  },
  hrManager: {
    responsibilities: [
      'İK politikası, kadro ve bütçe planının yönetilmesi',
      'İşe alım, performans ve ücret süreçlerinin denetlenmesi',
      'Yönetici kadrosuna koçluk ve organizasyon tasarımı',
      'Çalışan ilişkileri, disiplin ve yasal uyumun sağlanması',
      'İK metriklerinin üst yönetime raporlanması',
    ],
    achievements: [
      'İşe alım süresinin kısaltılması',
      'Çalışan bağlılığının artırılması',
      'Devir oranının düşürülmesi',
    ],
    professionalSkills: ['İK yönetimi', 'Organizasyon tasarımı', 'Performans yönetimi', 'İş hukuku'],
    technicalSkills: ['HRIS / ATS', 'Excel', 'Power BI'],
  },
  brandManager: {
    responsibilities: [
      'Marka konumlandırma ve yıllık planın yönetilmesi',
      'Kampanya, bütçe ve ajans koordinasyonunun yürütülmesi',
      'Marka sağlık metriklerinin izlenmesi',
      'Ürün / kanal ekipleriyle lansman planının yapılması',
      'Rakip ve pazar içgörüsünün kararlara bağlanması',
    ],
    achievements: [
      'Marka bilinirliğinin artırılması',
      'Kampanya ROI değerinin yükseltilmesi',
    ],
    professionalSkills: ['Marka yönetimi', 'Konumlandırma', 'Kampanya yönetimi'],
    technicalSkills: ['Google Analytics', 'Excel', 'PowerPoint'],
  },
  warehouseLead: {
    responsibilities: [
      'Depo ekibi, vardiya ve mal kabul-sevkiyat planının yönetilmesi',
      'Stok doğruluğu, adresleme ve sayım disiplininin denetlenmesi',
      'İş güvenliği ve ekipman kullanım standartlarının sağlanması',
      'Taşıyıcı ve iç müşteri SLA takibinin yapılması',
      'Depo KPI raporunun hazırlanması',
    ],
    achievements: [
      'Zamanında sevkiyat oranının artırılması',
      'Stok sapmasının azaltılması',
      'Depo iş kazası riskinin düşürülmesi',
    ],
    professionalSkills: ['Depo yönetimi', 'Ekip planlama', 'Stok kontrolü', 'İSG'],
    technicalSkills: ['WMS', 'SAP', 'Excel'],
  },
  productionLead: {
    responsibilities: [
      'Üretim planı, kapasite ve vardiya dengesinin yönetilmesi',
      'Hat verimi, fire ve kalite hedeflerinin takibi',
      'Bakım, malzeme ve operatör koordinasyonunun sağlanması',
      'İSG ve kalite standartlarının denetlenmesi',
      'Üretim gerçekleşme raporunun sunulması',
    ],
    achievements: [
      'Hat OEE / veriminin artırılması',
      'Fire oranının düşürülmesi',
      'Planlanan üretim miktarına uyumun yükseltilmesi',
    ],
    professionalSkills: ['Üretim yönetimi', 'Planlama', 'Kalite', 'İSG'],
    technicalSkills: ['MES / ERP', 'Excel'],
  },
  shiftSupervisor: {
    responsibilities: [
      'Vardiya kadrosunun iş dağılımı ve tesliminin yönetilmesi',
      'Hat duruş, kalite sapması ve İSG olayının anlık çözülmesi',
      'Üretim kaydı ve vardiya raporunun tutulması',
      'Operatör performans ve eğitim ihtiyacının iletilmesi',
    ],
    achievements: [
      'Vardiya duruş süresinin kısaltılması',
      'Vardiya kalite sapmasının azaltılması',
    ],
    professionalSkills: ['Vardiya yönetimi', 'Problem çözme', 'İSG'],
    technicalSkills: ['MES / üretim kaydı', 'Excel'],
  },
  siteChief: {
    responsibilities: [
      'Şantiye imalat, ekip ve taşeron planının yönetilmesi',
      'İş programı, malzeme ve makine koordinasyonunun yapılması',
      'İş güvenliği, kalite ve metraj kontrolünün denetlenmesi',
      'İlerleme, hakediş ve saha raporunun hazırlanması',
      'İşveren / proje müdürlüğü ile saha koordinasyonu',
    ],
    achievements: [
      'Saha tesliminin programına yaklaştırılması',
      'İş kazası oranının düşürülmesi',
      'Revizyon ve fire maliyetinin azaltılması',
    ],
    professionalSkills: ['Şantiye yönetimi', 'Ekip / taşeron yönetimi', 'İSG', 'Metraj'],
    technicalSkills: ['Şantiye takip yazılımı', 'Excel', 'AutoCAD temel'],
  },
  serviceManager: {
    responsibilities: [
      'Servis atölyesi kapasite, randevu ve kadro planının yönetilmesi',
      'İş emri süresi, parça ve müşteri vaadinin denetlenmesi',
      'Teknisyen performans ve kalite tekrar işçilik takibi',
      'Müşteri şikâyeti ve garanti süreçlerinin yönetilmesi',
      'Servis ciro / verim raporunun sunulması',
    ],
    achievements: [
      'Servis teslim süresinin kısaltılması',
      'Tekrar işçilik oranının düşürülmesi',
      'Servis müşteri memnuniyetinin artırılması',
    ],
    professionalSkills: ['Servis yönetimi', 'Ekip yönetimi', 'Müşteri deneyimi'],
    technicalSkills: ['DMS / servis yazılımı', 'Excel'],
  },
  officeManager: {
    responsibilities: [
      'Ofis idari süreç, tedarik ve tesis yönetiminin yapılması',
      'Destek ekibi ve dış tedarikçi koordinasyonunun sağlanması',
      'Bütçe, sözleşme ve fatura takibinin yürütülmesi',
      'Ziyaretçi, toplantı ve iç hizmet standartlarının denetlenmesi',
    ],
    achievements: [
      'İdari talep kapanış süresinin kısaltılması',
      'Ofis işletme maliyetinin düşürülmesi',
    ],
    professionalSkills: ['İdari yönetim', 'Tedarik', 'Organizasyon'],
    technicalSkills: ['Outlook', 'Excel', 'Satınalma yazılımı'],
  },
  farmLead: {
    responsibilities: [
      'Üretim / sera planı ve saha ekibinin yönetilmesi',
      'Sulama, gübre ve hasat takviminin denetlenmesi',
      'Verim, hastalık ve girdi maliyetinin izlenmesi',
      'Hasat kalitesi ve sevkiyat koordinasyonunun sağlanması',
    ],
    achievements: [
      'Verim kaybının azaltılması',
      'Hasat planına uyumun artırılması',
    ],
    professionalSkills: ['Tarımsal üretim yönetimi', 'Saha ekibi', 'Hasat planlama'],
    technicalSkills: ['Çiftlik kayıt sistemi', 'Excel'],
  },
  mediaLead: {
    responsibilities: [
      'Yayın / içerik takvimi ve ekip iş dağılımının yönetilmesi',
      'Editoryal standart ve teslim kalitesinin denetlenmesi',
      'Kanal performansı ve kriz içeriğinin yönetilmesi',
      'Ajans / stüdyo ve paydaş koordinasyonunun yapılması',
    ],
    achievements: [
      'Yayın aksaklıklarının azaltılması',
      'İçerik etkileşiminin artırılması',
    ],
    professionalSkills: ['Yayın yönetimi', 'Editoryal liderlik', 'Ekip planlama'],
    technicalSkills: ['Yayın / CMS aracı', 'Excel', 'Analytics'],
  },
};

const ROLE_FAMILY: Record<string, RoleFamily> = {
  'Otel resepsiyonisti': 'reception',
  Resepsiyonist: 'reception',
  'Ön büro sorumlusu': 'hotelOps',
  'Host / hostes': 'host',
  'Kat görevlisi': 'housekeeping',
  'Turizm danışmanı': 'reception',
  'Rezervasyon uzmanı': 'reception',
  'Otel müdürü': 'hotelOps',
  Animatör: 'host',
  Garson: 'restaurant',
  'Servis elemanı': 'restaurant',
  Komi: 'restaurant',
  'Restoran müdürü': 'restaurantManager',
  Aşçı: 'kitchen',
  'Aşçı yardımcısı': 'kitchen',
  'Şef / mutfak şefi': 'kitchenChef',
  Barista: 'kitchen',
  'Barmen / Barmaid': 'kitchen',
  'Mutfak personeli': 'kitchen',
  'Gıda mühendisi': 'factory',
  'Satış danışmanı': 'retail',
  'Mağaza müdürü': 'storeManager',
  Kasiyer: 'cashier',
  'Market personeli': 'retail',
  'Vitrin sorumlusu': 'retail',
  'Bölge müdürü': 'regionalManager',
  'Müşteri temsilcisi': 'callCenter',
  'Çağrı merkezi temsilcisi': 'callCenter',
  'Çağrı merkezi satış temsilcisi': 'salesIndoor',
  'Müşteri başarı uzmanı': 'customerSuccess',
  'Destek uzmanı': 'callCenter',
  'Şikayet yönetimi uzmanı': 'callCenter',
  'İç satış uzmanı': 'salesIndoor',
  'Key account manager': 'salesIndoor',
  'Hesap yöneticisi': 'salesIndoor',
  'Bölge satış müdürü': 'salesManager',
  'Saha satış müdürü': 'salesManager',
  'Kanal satış müdürü': 'salesManager',
  'Satış müdürü': 'salesManager',
  'Saha satış uzmanı': 'salesField',
  'İş geliştirme uzmanı': 'salesIndoor',
  'Sigorta teknik uzmanı': 'insuranceOps',
  'Hasar uzmanı': 'insuranceOps',
  Broker: 'insuranceOps',
  'Acente temsilcisi': 'salesField',
  Underwriter: 'insuranceOps',
  'Poliçe operasyon uzmanı': 'insuranceOps',
  'Portföy yöneticisi': 'portfolioManager',
  'Risk değerlendirme uzmanı': 'credit',
  'Banka müşteri temsilcisi': 'bankFront',
  'Bankacı / banka personeli': 'bankFront',
  'Şube müdürü': 'branchManager',
  'Kredi uzmanı': 'credit',
  'Finans direktörü (CFO)': 'credit',
  'Finans müdürü': 'credit',
  'Finans uzmanı': 'credit',
  'Risk analisti': 'credit',
  'Hazine uzmanı': 'credit',
  'Bütçe ve raporlama uzmanı': 'accounting',
  Muhasebeci: 'accounting',
  'Mali müşavir yardımcısı': 'accounting',
  'Yatırım danışmanı': 'credit',
  'Operasyon uzmanı': 'admin',
  'İç kontrol uzmanı': 'credit',
  'İç denetim / İç kontrol uzmanı': 'credit',
  'Uyum (compliance) uzmanı': 'credit',
  'Yazılım geliştirici': 'software',
  'Frontend geliştirici': 'software',
  'Mobil uygulama geliştirici': 'software',
  'DevOps / Cloud mühendisi': 'devops',
  'QA / Test uzmanı': 'qa',
  'Ürün yöneticisi': 'product',
  'Product designer / UX': 'design',
  'UI/UX tasarımcı': 'design',
  'İş analisti': 'consulting',
  'Business analyst': 'consulting',
  'Proje yöneticisi': 'consulting',
  'Sistem yöneticisi': 'devops',
  'Teknik destek uzmanı': 'callCenter',
  'Bilgisayar teknik servis': 'devops',
  'Scrum Master': 'product',
  'CTO / Teknik lider': 'techLead',
  'Yapay zeka / ML mühendisi': 'data',
  'Veri analisti': 'data',
  'Data engineer': 'data',
  'Veri bilimci': 'data',
  'MLOps uzmanı': 'devops',
  'İş zekâsı uzmanı': 'data',
  'Prompt mühendisi': 'data',
  'E-ticaret uzmanı': 'marketing',
  'Pazaryeri operasyon uzmanı': 'retail',
  'Kategori yöneticisi': 'product',
  'Dijital pazarlama uzmanı': 'marketing',
  'Lojistik uzmanı': 'logistics',
  'Eğitmen / öğretmen': 'teacher',
  Akademisyen: 'teacher',
  'Eğitim koordinatörü': 'teacher',
  'Okul müdürü': 'schoolPrincipal',
  'Rehber öğretmen': 'teacher',
  'Özel ders öğretmeni': 'teacher',
  'Kurumsal eğitmen': 'teacher',
  'Eğitim danışmanı': 'teacher',
  'İdari personel': 'admin',
  'Pazarlama uzmanı': 'marketing',
  'Sosyal medya uzmanı': 'marketing',
  'Marka yöneticisi': 'brandManager',
  'İçerik uzmanı': 'media',
  'Medya planlama uzmanı': 'marketing',
  'Grafik tasarımcı': 'design',
  'Reklam hesap yöneticisi': 'marketing',
  'SEO / SEM uzmanı': 'marketing',
  'İnsan kaynakları uzmanı': 'hr',
  'İşe alım uzmanı': 'hr',
  'Bordro uzmanı': 'hr',
  'İK iş ortağı': 'hr',
  'Eğitim ve gelişim uzmanı': 'hr',
  'Organizasyonel gelişim uzmanı': 'hr',
  'İK yöneticisi': 'hrManager',
  Avukat: 'legal',
  'Hukuk müşaviri': 'legal',
  'Hukuk asistanı': 'legal',
  'Sözleşme uzmanı': 'legal',
  'Uyuşmazlık çözüm uzmanı': 'legal',
  'Şirket avukatı': 'legal',
  Memur: 'public',
  Uzman: 'public',
  'Büro personeli': 'admin',
  'Proje uzmanı': 'consulting',
  'Vatandaş ilişkileri personeli': 'public',
  'İdari işler sorumlusu': 'officeManager',
  'Enerji mühendisi': 'energy',
  Teknisyen: 'energy',
  'Proje mühendisi': 'construction',
  'Saha operasyon uzmanı': 'energy',
  'Bakım teknisyeni': 'factory',
  'Satış mühendisi': 'salesField',
  'Otomotiv teknisyeni': 'autoService',
  'Servis danışmanı': 'autoService',
  'Yedek parça sorumlusu': 'autoService',
  'Boya / kaporta ustası': 'autoService',
  'Oto yıkama personeli': 'autoService',
  'Servis müdürü': 'serviceManager',
  'Çiftçi / tarım işçisi': 'farm',
  'Ziraat mühendisi': 'farm',
  'Tarım danışmanı': 'farm',
  'Sera sorumlusu': 'farmLead',
  'Üretim sorumlusu': 'productionLead',
  'İçerik editörü': 'media',
  'Video editörü': 'media',
  Muhabir: 'media',
  'Topluluk yöneticisi': 'media',
  'Yayın yönetmeni': 'mediaLead',
  'Yönetim danışmanı': 'consulting',
  'Strateji danışmanı': 'consulting',
  'Süreç iyileştirme uzmanı': 'consulting',
  'Finansal danışman': 'credit',
  'Üretim işçisi': 'factory',
  'Fabrika işçisi': 'factory',
  'Makine operatörü': 'factory',
  'Kalite kontrol uzmanı': 'factory',
  'Üretim planlama uzmanı': 'factory',
  'Mühendis (endüstri)': 'factory',
  'Mühendis (makine)': 'factory',
  'Mühendis (elektrik)': 'energy',
  'Vardiya amiri': 'shiftSupervisor',
  'Depo görevlisi': 'logistics',
  'İş sağlığı ve güvenliği uzmanı': 'factory',
  'İnşaat işçisi': 'construction',
  'Mühendis (inşaat)': 'construction',
  Mimar: 'construction',
  'İç mimar': 'design',
  'Şantiye şefi': 'siteChief',
  'Gayrimenkul danışmanı': 'salesField',
  Elektrikçi: 'construction',
  Tesisatçı: 'construction',
  Boyacı: 'construction',
  Marangoz: 'construction',
  'Lojistik planlama uzmanı': 'logistics',
  'Depo sorumlusu': 'warehouseLead',
  'Forklift operatörü': 'logistics',
  'Sevkiyat sorumlusu': 'warehouseLead',
  'Kurye / motokurye': 'driver',
  'Şoför (kamyon / TIR)': 'driver',
  'Şoför (hafif ticari)': 'driver',
  'Şoför (otobüs / minibüs)': 'driver',
  'Personel servis şoförü': 'driver',
  'Tedarik zinciri uzmanı': 'logistics',
  'Berber / kuaför': 'beauty',
  'Güvenlik görevlisi': 'security',
  'Temizlik görevlisi': 'housekeeping',
  Sekreter: 'admin',
  'Ofis yöneticisi': 'officeManager',
  'Çaycı / ofis destek': 'admin',
  'Çelik işçisi': 'factory',
  Kaynakçı: 'factory',
  'Torna / freze operatörü': 'factory',
  'Mobilya ustası': 'factory',
  'Elektrik teknisyeni': 'energy',
  'Tamirci / teknik servis': 'autoService',
};

/** Role-specific first lines so two roles in the same family never look identical. */
const ROLE_OPENERS: Record<string, { responsibility: string; achievement: string }> = {
  Resepsiyonist: {
    responsibility: 'Resepsiyon bankosunda misafir kayıt ve yönlendirme',
    achievement: 'Resepsiyon kuyruk süresinin kısaltılması',
  },
  'Otel resepsiyonisti': {
    responsibility: 'Otel PMS üzerinden oda satış ve konaklama kaydı',
    achievement: 'Oda upsell ve erken check-in oranının artırılması',
  },
  'Host / hostes': {
    responsibility: 'Karşılama noktasında misafir akışının yönlendirilmesi',
    achievement: 'Karşılama bekleme şikayetinin azaltılması',
  },
  'Servis danışmanı': {
    responsibility: 'Servis kabulde arıza kaydı ve iş emri açılması',
    achievement: 'Servis randevu doluluk ve teslim vaadinin tutulması',
  },
  'Ön büro sorumlusu': {
    responsibility: 'Ön büro vardiya ve kasa kapanışının yönetilmesi',
    achievement: 'Ön büro gece denetim bulgularının azaltılması',
  },
  'Şube müdürü': {
    responsibility: 'Şube kârlılık, kadro ve günlük operasyonun yönetilmesi',
    achievement: 'Şube kârlılığının ve müşteri memnuniyetinin artırılması',
  },
  'Banka müşteri temsilcisi': {
    responsibility: 'Şube gişesinde müşteri işlem ve ürün yönlendirmesinin yapılması',
    achievement: 'İşlem bekleme süresinin kısaltılması',
  },
  'Mağaza müdürü': {
    responsibility: 'Mağaza ciro, kadro ve vardiya planının yönetilmesi',
    achievement: 'Mağaza ciro hedefinin aşılması',
  },
  'Satış danışmanı': {
    responsibility: 'Mağaza müşterisine ürün danışmanlığı ve satış kapanışı',
    achievement: 'Kişisel satış hedefinin yakalanması',
  },
  'Restoran müdürü': {
    responsibility: 'Restoran ciro, maliyet ve vardiya planının yönetilmesi',
    achievement: 'Restoran kârlılığının artırılması',
  },
  Garson: {
    responsibility: 'Masa servisi ve sipariş alımının yapılması',
    achievement: 'Servis süresinin kısaltılması',
  },
  'Otel müdürü': {
    responsibility: 'Otel doluluk, gelir ve birim operasyonunun yönetilmesi',
    achievement: 'Doluluk ve RevPAR değerinin artırılması',
  },
  'Okul müdürü': {
    responsibility: 'Okul akademik ve idari işleyişinin yönetilmesi',
    achievement: 'Öğrenci başarı ortalamasının yükseltilmesi',
  },
  'İK yöneticisi': {
    responsibility: 'İK politikası, kadro ve bütçe planının yönetilmesi',
    achievement: 'Devir oranının düşürülmesi',
  },
  'Satış müdürü': {
    responsibility: 'Satış ekibinin hedef, pipeline ve performansının yönetilmesi',
    achievement: 'Ekip satış hedefinin aşılması',
  },
};

function normalizeRole(role: string): string {
  return role.trim().toLocaleLowerCase('tr-TR');
}

function inferFamily(role: string): RoleFamily | null {
  const hay = normalizeRole(role);
  if (/finans müdür|mali işler müdür/.test(hay)) return 'accounting';
  if (/şube müdür/.test(hay)) return 'branchManager';
  if (/mağaza müdür/.test(hay)) return 'storeManager';
  if (/restoran müdür/.test(hay)) return 'restaurantManager';
  if (/okul müdür/.test(hay)) return 'schoolPrincipal';
  if (/servis müdür/.test(hay)) return 'serviceManager';
  if (/satış müdür|bölge satış/.test(hay)) return 'salesManager';
  if (/bölge müdür/.test(hay)) return 'regionalManager';
  if (/ik yönetici|insan kaynakları yönetici/.test(hay)) return 'hrManager';
  if (/ofis yönetici|idari işler/.test(hay)) return 'officeManager';
  if (/şantiye şefi/.test(hay)) return 'siteChief';
  if (/vardiya amiri/.test(hay)) return 'shiftSupervisor';
  if (/üretim sorumlusu/.test(hay)) return 'productionLead';
  if (/depo sorumlusu|sevkiyat sorumlusu/.test(hay)) return 'warehouseLead';
  if (/mutfak şefi|şef \/ mutfak/.test(hay)) return 'kitchenChef';
  if (/portföy yönet/.test(hay)) return 'portfolioManager';
  if (/\bcto\b|teknik lider/.test(hay)) return 'techLead';
  if (/marka yönet/.test(hay)) return 'brandManager';
  if (/yayın yönetmen/.test(hay)) return 'mediaLead';
  if (/sera sorumlusu/.test(hay)) return 'farmLead';
  if (/resepsiyon|ön büro|rezervasyon/.test(hay)) return 'reception';
  if (/host|hostes|animatör/.test(hay)) return 'host';
  if (/kat görev|housekeep/.test(hay)) return 'housekeeping';
  if (/otel müdür|turizm/.test(hay)) return 'hotelOps';
  if (/garson|servis eleman|komi/.test(hay)) return 'restaurant';
  if (/aşçı|barista|mutfak/.test(hay)) return 'kitchen';
  if (/kasiyer/.test(hay)) return 'cashier';
  if (/satış danışman|mağaza|market|vitrin/.test(hay)) return 'retail';
  if (/çağrı merkezi|müşteri temsil|destek uzman|şikayet|helpdesk/.test(hay)) return 'callCenter';
  if (/müşteri başarı/.test(hay)) return 'customerSuccess';
  if (/servis danışman|otomotiv|yedek parça|kaporta|oto yıkama/.test(hay)) return 'autoService';
  if (/saha satış/.test(hay)) return 'salesField';
  if (/satış|key account|iş geliştirme/.test(hay)) return 'salesIndoor';
  if (/sigorta|hasar|poliçe|broker|underwriter|acente/.test(hay)) return 'insuranceOps';
  if (/kredi|risk|hazine|uyum|iç kontrol|yatırım|finansal/.test(hay)) return 'credit';
  if (/muhasebe|mali müşavir/.test(hay)) return 'accounting';
  if (/banka/.test(hay)) return 'bankFront';
  if (/frontend|backend|full[\s-]?stack/.test(hay)) return 'software';
  if (/devops|cloud|sistem yöneticisi|teknik servis/.test(hay)) return 'devops';
  if (/\bqa\b|test uzman/.test(hay)) return 'qa';
  if (/veri|data|yapay zeka|mlops|iş zekâ|prompt/.test(hay)) return 'data';
  if (/ürün yöneticisi|scrum|product/.test(hay)) return 'product';
  if (/tasarım|ux|ui|grafik|iç mimar/.test(hay)) return 'design';
  if (/geliştirici|yazılım/.test(hay)) return 'software';
  if (/öğretmen|eğitmen|akademisyen|eğitim/.test(hay)) return 'teacher';
  if (/insan kaynak|işe alım|bordro|ik /.test(hay)) return 'hr';
  if (/pazarlama|reklam|sosyal medya|seo|e-ticaret|growth|büyüme/.test(hay)) return 'marketing';
  if (/avukat|hukuk|sözleşme|uyuşmazlık/.test(hay)) return 'legal';
  if (/şoför|kurye|personel servis/.test(hay)) return 'driver';
  if (/depo|lojistik|forklift|sevkiyat|tedarik/.test(hay)) return 'logistics';
  if (/inşaat|şantiye|mimar|elektrikçi|tesisat|boyacı|marangoz/.test(hay)) return 'construction';
  if (/üretim|fabrika|operatör|kalite|vardiya|isg|mühendis|kaynakçı|çelik|torna|mobilya/.test(hay)) {
    return 'factory';
  }
  if (/memur|vatandaş|kamu/.test(hay)) return 'public';
  if (/enerji|teknisyen|saha operasyon/.test(hay)) return 'energy';
  if (/tarım|ziraat|sera|çiftçi|veteriner/.test(hay)) return 'farm';
  if (/içerik|video|muhabir|yayın|topluluk/.test(hay)) return 'media';
  if (/danışman|analist|süreç iyileştir|proje/.test(hay)) return 'consulting';
  if (/büro|idari|operasyon uzman|sekreter|çaycı/.test(hay)) return 'admin';
  if (/berber|kuaför|güzellik/.test(hay)) return 'beauty';
  if (/güvenlik/.test(hay)) return 'security';
  if (/temizlik/.test(hay)) return 'housekeeping';
  return null;
}

function specialize(role: string, base: PositionBundle): PositionBundle {
  const opener = ROLE_OPENERS[role];
  const responsibilities = opener
    ? [opener.responsibility, ...base.responsibilities.filter((item) => item !== opener.responsibility)]
    : [...base.responsibilities];
  const achievements = opener
    ? [opener.achievement, ...base.achievements.filter((item) => item !== opener.achievement)]
    : [...base.achievements];
  return {
    responsibilities: responsibilities.slice(0, 6),
    achievements: achievements.slice(0, 5),
    professionalSkills: base.professionalSkills,
    technicalSkills: base.technicalSkills,
  };
}

export function resolveRoleFamily(role: string | null | undefined): RoleFamily | null {
  const trimmed = (role ?? '').trim();
  if (!trimmed || trimmed === 'Diğer' || trimmed === 'Diğer / Kendim gireceğim') return null;

  const exactFamily = ROLE_FAMILY[trimmed];
  if (exactFamily) return exactFamily;

  const needle = normalizeRole(trimmed);
  for (const [key, family] of Object.entries(ROLE_FAMILY)) {
    if (normalizeRole(key) === needle) return family;
  }

  return inferFamily(trimmed);
}

const TITLES_BY_FAMILY = new Map<RoleFamily, string[]>();

export function titlesForFamily(family: RoleFamily): string[] {
  const cached = TITLES_BY_FAMILY.get(family);
  if (cached) return cached;
  const titles = Object.entries(ROLE_FAMILY)
    .filter(([, value]) => value === family)
    .map(([title]) => title);
  TITLES_BY_FAMILY.set(family, titles);
  return titles;
}

export function resolvePositionBundle(role: string | null | undefined): PositionBundle | undefined {
  const trimmed = (role ?? '').trim();
  if (!trimmed || trimmed === 'Diğer' || trimmed === 'Diğer / Kendim gireceğim') return undefined;

  const family = resolveRoleFamily(trimmed);
  if (!family) return undefined;
  const exactKey = ROLE_FAMILY[trimmed]
    ? trimmed
    : Object.keys(ROLE_FAMILY).find((key) => normalizeRole(key) === normalizeRole(trimmed)) ?? trimmed;
  return specialize(exactKey, FAMILIES[family]);
}
