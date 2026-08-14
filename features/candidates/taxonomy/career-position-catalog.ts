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

type RoleFamily =
  | 'reception'
  | 'host'
  | 'housekeeping'
  | 'hotelOps'
  | 'restaurant'
  | 'kitchen'
  | 'retail'
  | 'cashier'
  | 'callCenter'
  | 'customerSuccess'
  | 'salesIndoor'
  | 'salesField'
  | 'insuranceOps'
  | 'bankFront'
  | 'credit'
  | 'accounting'
  | 'software'
  | 'data'
  | 'product'
  | 'design'
  | 'devops'
  | 'qa'
  | 'teacher'
  | 'hr'
  | 'marketing'
  | 'legal'
  | 'logistics'
  | 'driver'
  | 'factory'
  | 'construction'
  | 'autoService'
  | 'public'
  | 'energy'
  | 'farm'
  | 'media'
  | 'consulting'
  | 'admin'
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
    technicalSkills: ['MES / üretim kaydı', 'Excel'],
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
  'Restoran müdürü': 'hotelOps',
  Aşçı: 'kitchen',
  'Aşçı yardımcısı': 'kitchen',
  'Şef / mutfak şefi': 'kitchen',
  Barista: 'kitchen',
  'Mutfak personeli': 'kitchen',
  'Gıda mühendisi': 'factory',
  'Satış danışmanı': 'retail',
  'Mağaza müdürü': 'retail',
  Kasiyer: 'cashier',
  'Market personeli': 'retail',
  'Vitrin sorumlusu': 'retail',
  'Bölge müdürü': 'salesField',
  'Müşteri temsilcisi': 'callCenter',
  'Çağrı merkezi temsilcisi': 'callCenter',
  'Çağrı merkezi satış temsilcisi': 'salesIndoor',
  'Müşteri başarı uzmanı': 'customerSuccess',
  'Destek uzmanı': 'callCenter',
  'Şikayet yönetimi uzmanı': 'callCenter',
  'İç satış uzmanı': 'salesIndoor',
  'Key account manager': 'salesIndoor',
  'Hesap yöneticisi': 'salesIndoor',
  'Bölge satış müdürü': 'salesField',
  'Satış müdürü': 'salesField',
  'İş geliştirme uzmanı': 'salesIndoor',
  'Sigorta teknik uzmanı': 'insuranceOps',
  'Hasar uzmanı': 'insuranceOps',
  Broker: 'insuranceOps',
  'Acente temsilcisi': 'salesField',
  Underwriter: 'insuranceOps',
  'Poliçe operasyon uzmanı': 'insuranceOps',
  'Portföy yöneticisi': 'bankFront',
  'Risk değerlendirme uzmanı': 'credit',
  'Banka müşteri temsilcisi': 'bankFront',
  'Bankacı / banka personeli': 'bankFront',
  'Şube müdürü': 'bankFront',
  'Kredi uzmanı': 'credit',
  'Finans uzmanı': 'credit',
  'Risk analisti': 'credit',
  'Hazine uzmanı': 'credit',
  Muhasebeci: 'accounting',
  'Mali müşavir yardımcısı': 'accounting',
  'Yatırım danışmanı': 'credit',
  'Operasyon uzmanı': 'admin',
  'İç kontrol uzmanı': 'credit',
  'Uyum (compliance) uzmanı': 'credit',
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
  'CTO / Teknik lider': 'software',
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
  'Okul müdürü': 'teacher',
  'Rehber öğretmen': 'teacher',
  'Özel ders öğretmeni': 'teacher',
  'Kurumsal eğitmen': 'teacher',
  'Eğitim danışmanı': 'teacher',
  'İdari personel': 'admin',
  'Pazarlama uzmanı': 'marketing',
  'Sosyal medya uzmanı': 'marketing',
  'Marka yöneticisi': 'marketing',
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
  'İK yöneticisi': 'hr',
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
  'İdari işler sorumlusu': 'admin',
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
  'Servis müdürü': 'autoService',
  'Çiftçi / tarım işçisi': 'farm',
  'Ziraat mühendisi': 'farm',
  'Tarım danışmanı': 'farm',
  'Sera sorumlusu': 'farm',
  'Üretim sorumlusu': 'factory',
  'İçerik editörü': 'media',
  'Video editörü': 'media',
  Muhabir: 'media',
  'Topluluk yöneticisi': 'media',
  'Yayın yönetmeni': 'media',
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
  'Vardiya amiri': 'factory',
  'Depo görevlisi': 'logistics',
  'İş sağlığı ve güvenliği uzmanı': 'factory',
  'İnşaat işçisi': 'construction',
  'Mühendis (inşaat)': 'construction',
  Mimar: 'construction',
  'İç mimar': 'design',
  'Şantiye şefi': 'construction',
  'Gayrimenkul danışmanı': 'salesField',
  Elektrikçi: 'construction',
  Tesisatçı: 'construction',
  Boyacı: 'construction',
  Marangoz: 'construction',
  'Lojistik planlama uzmanı': 'logistics',
  'Depo sorumlusu': 'logistics',
  'Forklift operatörü': 'logistics',
  'Sevkiyat sorumlusu': 'logistics',
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
  'Ofis yöneticisi': 'admin',
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
};

function normalizeRole(role: string): string {
  return role.trim().toLocaleLowerCase('tr-TR');
}

function inferFamily(role: string): RoleFamily | null {
  const hay = normalizeRole(role);
  if (/resepsiyon|ön büro|rezervasyon/.test(hay)) return 'reception';
  if (/host|hostes|animatör/.test(hay)) return 'host';
  if (/kat görev|housekeep/.test(hay)) return 'housekeeping';
  if (/otel müdür|turizm/.test(hay)) return 'hotelOps';
  if (/garson|servis eleman|komi/.test(hay)) return 'restaurant';
  if (/aşçı|şef|barista|mutfak/.test(hay)) return 'kitchen';
  if (/kasiyer/.test(hay)) return 'cashier';
  if (/satış danışman|mağaza|market|vitrin/.test(hay)) return 'retail';
  if (/çağrı merkezi|müşteri temsil|destek uzman|şikayet/.test(hay)) return 'callCenter';
  if (/müşteri başarı/.test(hay)) return 'customerSuccess';
  if (/servis danışman|otomotiv|yedek parça|kaporta|oto yıkama|servis müdür/.test(hay)) {
    return 'autoService';
  }
  if (/saha satış|bölge satış|satış müdür/.test(hay)) return 'salesField';
  if (/satış|key account|iş geliştirme/.test(hay)) return 'salesIndoor';
  if (/sigorta|hasar|poliçe|broker|underwriter|acente/.test(hay)) return 'insuranceOps';
  if (/kredi|risk|hazine|uyum|iç kontrol|yatırım|finansal/.test(hay)) return 'credit';
  if (/muhasebe|mali müşavir/.test(hay)) return 'accounting';
  if (/banka|şube müdür|portföy/.test(hay)) return 'bankFront';
  if (/devops|cloud|sistem yöneticisi|teknik servis/.test(hay)) return 'devops';
  if (/\bqa\b|test uzman/.test(hay)) return 'qa';
  if (/veri|data|yapay zeka|mlops|iş zekâ|prompt/.test(hay)) return 'data';
  if (/ürün yöneticisi|scrum|product/.test(hay)) return 'product';
  if (/tasarım|ux|ui|grafik|iç mimar/.test(hay)) return 'design';
  if (/geliştirici|yazılım|cto/.test(hay)) return 'software';
  if (/öğretmen|eğitmen|akademisyen|eğitim/.test(hay)) return 'teacher';
  if (/insan kaynak|işe alım|bordro|ik /.test(hay)) return 'hr';
  if (/pazarlama|reklam|sosyal medya|seo|marka|e-ticaret/.test(hay)) return 'marketing';
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
  if (/büro|idari|operasyon uzman|sekreter|ofis yönetici|çaycı/.test(hay)) return 'admin';
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

export function resolvePositionBundle(role: string | null | undefined): PositionBundle | undefined {
  const trimmed = (role ?? '').trim();
  if (!trimmed || trimmed === 'Diğer' || trimmed === 'Diğer / Kendim gireceğim') return undefined;

  const exactFamily = ROLE_FAMILY[trimmed];
  if (exactFamily) return specialize(trimmed, FAMILIES[exactFamily]);

  const needle = normalizeRole(trimmed);
  for (const [key, family] of Object.entries(ROLE_FAMILY)) {
    if (normalizeRole(key) === needle) return specialize(key, FAMILIES[family]);
  }

  const inferred = inferFamily(trimmed);
  if (inferred) return specialize(trimmed, FAMILIES[inferred]);
  return undefined;
}
