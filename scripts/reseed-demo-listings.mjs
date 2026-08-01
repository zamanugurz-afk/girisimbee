/**
 * Wipe ALL marketplace listings and seed 100 realistic, fully-filled demo listings.
 *
 * Usage:
 *   node scripts/reseed-demo-listings.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnv() {
  for (const rel of ['.env.local', '.env']) {
    const full = path.join(projectRoot, rel);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, 'utf8').split(/\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 0) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}
if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const CITIES = [
  { city: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Ataşehir', 'Bakırköy'] },
  { city: 'Ankara', districts: ['Çankaya', 'Yenimahalle', 'Keçiören', 'Ümitköy'] },
  { city: 'İzmir', districts: ['Konak', 'Bornova', 'Karşıyaka', 'Bayraklı'] },
  { city: 'Bursa', districts: ['Nilüfer', 'Osmangazi', 'Yıldırım'] },
  { city: 'Antalya', districts: ['Muratpaşa', 'Konyaaltı', 'Kepez'] },
  { city: 'Kocaeli', districts: ['İzmit', 'Gebze', 'Başiskele'] },
  { city: 'Gaziantep', districts: ['Şahinbey', 'Şehitkamil'] },
  { city: 'Konya', districts: ['Selçuklu', 'Meram'] },
  { city: 'Adana', districts: ['Seyhan', 'Çukurova'] },
  { city: 'Eskişehir', districts: ['Tepebaşı', 'Odunpazarı'] },
];

const INDUSTRIES = [
  'Fintech',
  'SaaS',
  'E-ticaret',
  'Sağlık teknolojisi',
  'Eğitim teknolojisi',
  'Lojistik',
  'Temiz enerji',
  'Yapay zeka',
  'Mobil uygulama',
  'Perakende',
  'Gıda teknolojisi',
  'Siber güvenlik',
];

const INVESTMENT_AMOUNTS = [
  "500.000 TL'ye kadar",
  '500.000 - 1.000.000 TL',
  '1.000.000 - 2.500.000 TL',
  '2.500.000 - 5.000.000 TL',
  '5.000.000 - 10.000.000 TL',
  '10.000.000 TL ve üzeri',
];

const STAGES = [
  'Fikir aşaması',
  'MVP aşaması',
  'İlk müşteriler',
  'Gelir elde ediliyor',
  'Büyüme aşaması',
  'Ölçeklenme aşaması',
];

const USE_OF_FUNDS = [
  'Ürün geliştirme',
  'Yazılım geliştirme',
  'Yapay zeka',
  'Pazarlama',
  'İnsan kaynakları',
  'Operasyon',
  'Ar-Ge',
  'Uluslararası genişleme',
  'Üretim',
  'Donanım',
];

const JOB_POSITIONS = [
  'Yazılım geliştirici',
  'Ürün yöneticisi',
  'Pazarlama uzmanı',
  'Satış danışmanı',
  'Finans uzmanı',
  'İnsan kaynakları uzmanı',
  'Veri analisti',
  'Grafik tasarımcı',
  'Operasyon uzmanı',
  'Proje yöneticisi',
  'Saha satış uzmanı',
];

const EXPERIENCE_LEVELS = ['Başlangıç', 'Orta', 'Kıdemli', 'Lider', 'Direktör'];
const SALARY_EXPECTATIONS = [
  '25.000 - 50.000 TL',
  '50.000 - 75.000 TL',
  '75.000 - 100.000 TL',
  '100.000 - 150.000 TL',
  '150.000 TL ve üzeri',
];
const HIRING_SALARIES = [
  '35.000–50.000 TL',
  '50.000–75.000 TL',
  '75.000–100.000 TL',
  '100.000+ TL',
];
const WORK_TYPES_SEEKER = ['Tam zamanlı', 'Yarı zamanlı', 'Proje bazlı'];
const WORK_TYPES_HIRING = ['Tam zamanlı', 'Yarı zamanlı', 'Sözleşmeli'];
const PARTNERSHIP_TYPES = ['Teknik Ortak', 'İş Ortağı', 'Kurucu Ortak', 'Danışman'];
const PARTNER_EXPERTISE = [
  'CTO / Teknik liderlik',
  'COO / Operasyon',
  'CMO / Pazarlama',
  'Yazılım geliştirme',
  'Ürün yönetimi',
  'İş geliştirme',
  'Satış',
  'Tasarım / UX',
  'Yapay zeka / ML',
];
const FRANCHISE_SECTORS = [
  'Gıda & İçecek',
  'Perakende',
  'Hizmet',
  'Eğitim',
  'Sağlık & Güzellik',
  'Teknoloji',
];
const FRANCHISE_RETURN = ['6-12 ay', '12-18 ay', '18-24 ay', '24-36 ay', '36+ ay'];
const FRANCHISE_STORE = ['50 m² altı', '50-100 m²', '100-200 m²', '200-500 m²', '500 m² üzeri'];
const FRANCHISE_EXPERIENCE = [
  'Deneyim gerekmez',
  '1-3 yıl işletme deneyimi',
  '3-5 yıl işletme deneyimi',
  '5-10 yıl işletme deneyimi',
];
const FRANCHISE_EDUCATION = [
  'Eğitim şartı yok',
  'Lise mezunu',
  'Ön lisans / Lisans',
  'Sektörel sertifika',
];
const FRANCHISE_BUSINESS = [
  'Fast food / Quick service',
  'Cafe & Restoran',
  'Perakende mağaza',
  'Hizmet noktası',
  'E-ticaret + fiziksel mağaza',
  'Diğer',
];

const STARTUPS = [
  {
    name: 'NovaPay',
    pitch: 'KOBİ’ler için anlık hesap birleştirme ve nakit akışı tahmini sunan fintech platformu',
    traction: '420 aktif işletme, aylık 18M TL işlem hacmi, %12 MoM büyüme',
    team: '3 kurucu (finans, yazılım, satış), 7 kişilik çekirdek ekip',
  },
  {
    name: 'ClearStack',
    pitch: 'B2B SaaS firmaları için abonelik geliri, churn ve kohort analitiğini tek panelde toplayan ürün',
    traction: '85 ücretli müşteri, 1.1M TL ARR, NRR %108',
    team: '2 kurucu + 4 mühendis + 1 müşteri başarısı',
  },
  {
    name: 'GreenRoute',
    pitch: 'Şehir içi teslimat filoları için rota optimizasyonu ve karbon raporlama yazılımı',
    traction: '12 lojistik firması pilot, günlük 9.000 rota optimizasyonu',
    team: 'Kurucu CTO + operasyon ortağı, 5 kişilik ürün ekibi',
  },
  {
    name: 'MediLink',
    pitch: 'Klinikler arası randevu, tetkik ve hasta dosyası paylaşımını kolaylaştıran sağlık ağı',
    traction: '28 klinik entegrasyonu, 14.000 aylık aktif hasta kaydı',
    team: 'Hekim kurucu + 2 yazılım + 1 regülasyon danışmanı',
  },
  {
    name: 'EduSpark',
    pitch: 'Kurumsal ekipler için mikro-öğrenme ve beceri ölçüm platformu',
    traction: '6 kurumsal sözleşme, 9.500 kullanıcı lisansı',
    team: 'Eğitim tasarımı + ürün + 3 mühendis',
  },
  {
    name: 'FleetWise',
    pitch: 'Orta ölçekli filolar için bakım, yakıt ve sürücü skor kartı sistemi',
    traction: '1.800 araç altında, 4 bayi kanalı',
    team: '2 kurucu, saha satış ekibi 3 kişi',
  },
  {
    name: 'SecureNest',
    pitch: 'KOBİ’lere yönetilen siber güvenlik ve phishing simülasyonu paketi',
    traction: '110 abone, ortalama sözleşme süresi 14 ay',
    team: 'Güvenlik mühendisi kurucu + satış lideri',
  },
  {
    name: 'Marketly',
    pitch: 'Yerel üreticileri süpermarket alım ekipleriyle eşleştiren B2B marketplace',
    traction: 'GMV 6.4M TL / çeyrek, 340 üretici, 22 zincir market',
    team: 'Marketplace operasyon + 2 ürün + 4 account manager',
  },
  {
    name: 'AquaSense',
    pitch: 'Tarım işletmeleri için toprak nemi ve sulama otomasyonu IoT çözümü',
    traction: '65 çiftlik kurulumu, donanım + yazılım aboneliği modeli',
    team: 'Donanım mühendisi + tarım danışmanı + 3 yazılım',
  },
  {
    name: 'HireFlow',
    pitch: 'Orta ölçek şirketler için AI destekli aday eleme ve mülakat planlama aracı',
    traction: '40 HR ekibi kullanıyor, ortalama işe alım süresi %28 kısaldı',
    team: '2 ürün kurucusu, 5 mühendis',
  },
  {
    name: 'BrightCart',
    pitch: 'D2C markalar için stok, kargo ve iade operasyonunu birleştiren e-ticaret OS',
    traction: '70 marka, aylık 120K sipariş işleniyor',
    team: 'Operasyon + mühendislik + müşteri başarı',
  },
  {
    name: 'SolarGrid',
    pitch: 'Çatı GES yatırımları için fizibilite, teklif ve izleme platformu',
    traction: '190 fizibilite raporu, 22 kurulum partneri',
    team: 'Enerji mühendisi kurucu + satış + 3 yazılım',
  },
  {
    name: 'VoiceLab',
    pitch: 'Çağrı merkezleri için konuşma analizi ve kalite skorlama AI’ı',
    traction: '8 contact center pilotu, 2.1M dakika analiz',
    team: 'ML mühendisi + ses işleme + CSM',
  },
  {
    name: 'FarmBit',
    pitch: 'Sera üreticileri için hasat tahmin ve toptancı sipariş paneli',
    traction: '41 sera, 3 toptancı hali entegrasyonu',
    team: 'Tarım teknoloğu + 2 full-stack',
  },
  {
    name: 'CityPulse',
    pitch: 'Belediye ve AVM’ler için ziyaretçi yoğunluğu ve ısı haritası analitiği',
    traction: '5 AVM + 2 belediye pilotu',
    team: 'Veri bilimi + IoT + satış',
  },
  {
    name: 'Trustly',
    pitch: 'Kiralık ofis ve depo için dijital sözleşme + teminat yönetimi',
    traction: '1.200 aktif sözleşme, %96 otomatik yenileme oranı',
    team: 'Hukuk + ürün + 4 mühendis',
  },
  {
    name: 'SkillPath',
    pitch: 'Yazılım stajyerleri için proje tabanlı portfolyo ve işveren eşleştirme',
    traction: '3.400 öğrenci, 90 işveren hesabı',
    team: 'Eğitim + community + 3 mühendis',
  },
];

const FRANCHISE_BRANDS = [
  {
    name: 'KahveDurağı',
    sector: 'Gıda & İçecek',
    category: 'Cafe & Restoran',
    concept: 'Üçüncü nesil kahve + hafif atıştırmalık konsepti',
    support: '2 haftalık barista eğitimi, merkezi menü, aylık saha denetimi',
  },
  {
    name: 'FitBowl',
    sector: 'Gıda & İçecek',
    category: 'Cafe & Restoran',
    concept: 'Sağlıklı bowl ve protein menüleri, ofis bölgelerine yakın şubeler',
    support: 'Merkezi tedarik, dijital kasa, performans paneli',
  },
  {
    name: 'PetPati',
    sector: 'Perakende',
    category: 'Perakende mağaza',
    concept: 'Premium pet food + aksesuar mağazası',
    support: 'Planogram, açılış kampanyası, e-ticaret yönlendirme',
  },
  {
    name: 'CleanGo',
    sector: 'Hizmet',
    category: 'Hizmet noktası',
    concept: 'Mobil ve şubeli profesyonel temizlik hizmeti',
    support: 'Operasyon yazılımı, eğitim, üniforma ve ekipman paketi',
  },
  {
    name: 'BurgerHouse',
    sector: 'Gıda & İçecek',
    category: 'Fast food / Quick service',
    concept: 'Smash burger + craft soda fast-casual zinciri',
    support: 'Mutfak setup, reçete kitabı, yerel reklam bütçesi',
  },
  {
    name: 'TechFix',
    sector: 'Teknoloji',
    category: 'Hizmet noktası',
    concept: 'Telefon / laptop onarım ve aksesuar satış noktası',
    support: 'Teknik eğitim, yedek parça ağı, CRM',
  },
  {
    name: 'BabyNest',
    sector: 'Perakende',
    category: 'Perakende mağaza',
    concept: 'Bebek ürünleri specialty mağaza',
    support: 'Tedarikçi anlaşmaları, vitrin tasarımı, personel eğitimi',
  },
  {
    name: 'SmileDent',
    sector: 'Sağlık & Güzellik',
    category: 'Hizmet noktası',
    concept: 'Diş kliniği franchise modeli (estetika odaklı)',
    support: 'Klinik kurulum, doktor ağı, hasta CRM',
  },
  {
    name: 'BookCorner',
    sector: 'Perakende',
    category: 'E-ticaret + fiziksel mağaza',
    concept: 'Kitap + cafe köşesi butik konsept',
    support: 'Stok rotasyonu, etkinlik takvimi, sadakat programı',
  },
  {
    name: 'FreshBox',
    sector: 'Gıda & İçecek',
    category: 'Fast food / Quick service',
    concept: 'Günlük taze salata / wrap dark kitchen + pick-up',
    support: 'Mutfak layout, aggregator entegrasyonları, paketleme standardı',
  },
  {
    name: 'GymOne',
    sector: 'Sağlık & Güzellik',
    category: 'Hizmet noktası',
    concept: 'Boutique fitness stüdyosu (reformer + HIIT)',
    support: 'Antrenör sertifikasyonu, üyelik yazılımı, marka kiti',
  },
  {
    name: 'StyleCut',
    sector: 'Sağlık & Güzellik',
    category: 'Hizmet noktası',
    concept: 'Erkek kuaför + sakal bakımı zinciri',
    support: 'Eğitim akademisi, ürün reyonu, randevu uygulaması',
  },
  {
    name: 'AutoCare',
    sector: 'Hizmet',
    category: 'Hizmet noktası',
    concept: 'Hızlı oto yıkama + detaylı iç temizlik',
    support: 'Ekipman leasing, operasyon SOP, yerel SEO paketi',
  },
  {
    name: 'TeaTime',
    sector: 'Gıda & İçecek',
    category: 'Cafe & Restoran',
    concept: 'Premium çay ve tatlı evi',
    support: 'Menü R&D, personel eğitim, franchise portal',
  },
  {
    name: 'PizzaNova',
    sector: 'Gıda & İçecek',
    category: 'Fast food / Quick service',
    concept: 'Neapolitan pizza + teslimat odaklı şube',
    support: 'Fırın kurulumu, hamur standardı, delivery ops',
  },
  {
    name: 'Washly',
    sector: 'Hizmet',
    category: 'Hizmet noktası',
    concept: 'Self-servis + drop-off çamaşırhane',
    support: 'Makine bakımı, yazılım, şube tasarımı',
  },
];

const INVESTOR_PROFILES = [
  {
    title: 'Erken aşama B2B SaaS girişimlerine angel yatırım',
    focus: 'ARR’i olan veya net pilot geliri olan B2B SaaS',
    ticket: '500.000 - 1.000.000 TL',
    stage: 'İlk müşteriler',
    sectors: 'SaaS, B2B, Fintech',
    valueAdd: 'Fiyatlandırma, ilk 10 kurumsal müşteri ve hiring desteği',
  },
  {
    title: 'Fintech ve ödeme altyapısı yatırımları',
    focus: 'Lisans yol haritası net, regülasyon bilinci yüksek ekipler',
    ticket: '1.000.000 - 2.500.000 TL',
    stage: 'Gelir elde ediliyor',
    sectors: 'Fintech, Ödeme, Embedded finance',
    valueAdd: 'Banka / PSP network erişimi ve go-to-market mentorluğu',
  },
  {
    title: 'Sağlık teknolojisi seed yatırımı',
    focus: 'Klinik workflow’u hızlandıran yazılım ve cihaz-yazılım hibritleri',
    ticket: '500.000 - 1.000.000 TL',
    stage: 'MVP aşaması',
    sectors: 'Sağlık teknolojisi, Medtech',
    valueAdd: 'Klinik pilot bulma ve KVKK / regülasyon checklist',
  },
  {
    title: 'E-ticaret operasyon yazılımlarına yatırım',
    focus: 'D2C markaların birim ekonomisini iyileştiren araçlar',
    ticket: '1.000.000 - 2.500.000 TL',
    stage: 'Büyüme aşaması',
    sectors: 'E-ticaret, Lojistik, SaaS',
    valueAdd: 'Marka network’ü ve operasyon KPI takibi',
  },
  {
    title: 'Yapay zeka ürünlerine pre-seed / seed',
    focus: 'Gerçek veri erişimi olan, dikey AI uygulamaları',
    ticket: "500.000 TL'ye kadar",
    stage: 'MVP aşaması',
    sectors: 'Yapay zeka, Veri, SaaS',
    valueAdd: 'ML hiring ve ürün paketleme mentorluğu',
  },
  {
    title: 'Temiz enerji ve GES yazılım yatırımları',
    focus: 'Fizibilite, izleme ve finansman süreçlerini dijitalleştiren ürünler',
    ticket: '2.500.000 - 5.000.000 TL',
    stage: 'Gelir elde ediliyor',
    sectors: 'Temiz enerji, Climate tech',
    valueAdd: 'EPC partner ağı ve proje finansmanı bağlantıları',
  },
  {
    title: 'Edtech B2B abonelik modellerine yatırım',
    focus: 'Kurumsal L&D ve ölçülebilir öğrenme çıktısı olan ürünler',
    ticket: '500.000 - 1.000.000 TL',
    stage: 'İlk müşteriler',
    sectors: 'Eğitim teknolojisi, HR tech',
    valueAdd: 'Kurumsal satış playbook ve referans müşteri',
  },
  {
    title: 'Lojistik ve filo teknolojilerine yatırım',
    focus: 'Rota, bakım ve sürücü performansını iyileştiren çözümler',
    ticket: '1.000.000 - 2.500.000 TL',
    stage: 'Büyüme aşaması',
    sectors: 'Lojistik, Mobility',
    valueAdd: 'Filo operatör intros ve saha pilot desteği',
  },
  {
    title: 'Kadın kuruculu teknoloji girişimlerine öncelik',
    focus: 'Ölçülebilir traction ve şeffaf raporlama kültürü',
    ticket: '500.000 - 1.000.000 TL',
    stage: 'Tüm aşamalar',
    sectors: 'SaaS, Marketplace, Consumer tech',
    valueAdd: 'Yönetim kurulu gözlemi + hiring network',
  },
  {
    title: 'Anadolu merkezli ölçeklenebilir işlere yatırım',
    focus: 'İstanbul dışı operasyonu güçlü, Türkiye geneline yayılabilir modeller',
    ticket: '1.000.000 - 2.500.000 TL',
    stage: 'Gelir elde ediliyor',
    sectors: 'Perakende tech, Gıda teknolojisi, Hizmet',
    valueAdd: 'Bölgesel partner bulma ve operasyon kurulum',
  },
  {
    title: 'Marketplace birim ekonomisi odaklı yatırım',
    focus: 'Take-rate ve contribution margin’i kanıtlanmış marketplace’ler',
    ticket: '2.500.000 - 5.000.000 TL',
    stage: 'Ölçeklenme aşaması',
    sectors: 'Marketplace, E-ticaret',
    valueAdd: 'Unit economics review ve büyüme kanalı testi',
  },
  {
    title: 'Siber güvenlik MSSP / ürün hibritlerine yatırım',
    focus: 'Tekrarlayan gelir + hizmet katmanı olan güvenlik şirketleri',
    ticket: '1.000.000 - 2.500.000 TL',
    stage: 'Gelir elde ediliyor',
    sectors: 'Siber güvenlik, SaaS',
    valueAdd: 'Enterprise satış ve partner channel',
  },
  {
    title: 'Foodtech ve dark kitchen altyapı yatırımı',
    focus: 'Mutfak verimliliği, atık azaltma ve çok markalı operasyon',
    ticket: '500.000 - 1.000.000 TL',
    stage: 'İlk müşteriler',
    sectors: 'Gıda teknolojisi, Operasyon',
    valueAdd: 'Tedarik zinciri ve lokal açılış desteği',
  },
  {
    title: 'Kurumsal müşterisi olan B2B ürünlere seri A öncesi',
    focus: 'En az 3 kurumsal referans ve yenilenebilir sözleşme',
    ticket: '5.000.000 - 10.000.000 TL',
    stage: 'Büyüme aşaması',
    sectors: 'SaaS, Fintech, HR tech',
    valueAdd: 'Sonraki tur hazırlığı ve board reporting',
  },
  {
    title: 'Mobil uygulama consumer growth yatırımı',
    focus: 'Organik + ücretli kanal dengesi kurabilen consumer app’ler',
    ticket: "500.000 TL'ye kadar",
    stage: 'MVP aşaması',
    sectors: 'Mobil uygulama, Consumer',
    valueAdd: 'UA / retention workshop ve creative test',
  },
  {
    title: 'İstanbul merkezli early-stage fon ortağıyım',
    focus: 'Teknik kurucusu güçlü, 12–18 aylık runway planı net ekipler',
    ticket: '1.000.000 - 2.500.000 TL',
    stage: 'Tüm aşamalar',
    sectors: 'SaaS, Yapay zeka, Fintech, Healthtech',
    valueAdd: 'Haftalık check-in, metrik disiplini, investor update şablonu',
  },
  {
    title: 'Hardware + software IoT yatırımları',
    focus: 'Donanım maliyeti kontrol altında, yazılım aboneliği ölçekleyen modeller',
    ticket: '2.500.000 - 5.000.000 TL',
    stage: 'Gelir elde ediliyor',
    sectors: 'IoT, Tarım teknolojisi, Enerji',
    valueAdd: 'Üretim partneri ve maliyet düşürme mentorluğu',
  },
];

const JOB_SEEKERS = [
  {
    title: 'Senior Full-stack Developer — React & Node',
    role: 'Yazılım geliştirici',
    exp: 'Kıdemli',
    salary: '100.000 - 150.000 TL',
    work: 'Tam zamanlı',
    stack: 'TypeScript, React, Node.js, PostgreSQL, AWS',
    summary:
      'Son 6 yıldır B2B SaaS ürünlerinde uçtan uca özellik geliştirdim. Ölçeklenen API’ler, ödeme entegrasyonları ve admin panelleri teslim ettim.',
  },
  {
    title: 'Product Manager — B2B SaaS deneyimli',
    role: 'Ürün yöneticisi',
    exp: 'Kıdemli',
    salary: '100.000 - 150.000 TL',
    work: 'Tam zamanlı',
    stack: 'Roadmap, discovery, SQL, Amplitude, Notion',
    summary:
      '0→1 ve 1→n ürün yolculuklarında çalıştım. Discovery görüşmeleri, PRD yazımı ve sprint planlamasında sahiplik aldım.',
  },
  {
    title: 'Performans pazarlama uzmanı',
    role: 'Pazarlama uzmanı',
    exp: 'Orta',
    salary: '50.000 - 75.000 TL',
    work: 'Tam zamanlı',
    stack: 'Meta Ads, Google Ads, GA4, Looker Studio',
    summary:
      'Aylık 1M+ TL medya bütçesi yönettim. CAC / ROAS odaklı kampanya kurgusu ve creative test ritmi kuruyorum.',
  },
  {
    title: 'Finans analisti — startup / scale-up',
    role: 'Finans uzmanı',
    exp: 'Orta',
    salary: '50.000 - 75.000 TL',
    work: 'Tam zamanlı',
    stack: 'Excel, cashflow, birim ekonomi, board pack',
    summary:
      'Runway planlama, cohort bazlı gelir modeli ve yatırımcı raporları hazırladım. Operasyon ekipleriyle yakın çalışırım.',
  },
  {
    title: 'UI/UX tasarımcı — ürün odaklı portfolyo',
    role: 'Grafik tasarımcı',
    exp: 'Orta',
    salary: '50.000 - 75.000 TL',
    work: 'Tam zamanlı',
    stack: 'Figma, design system, user interview, prototyping',
    summary:
      'B2B paneller ve mobil onboarding akışları tasarladım. Tasarımı metriklerle bağlayarak iterasyon yaparım.',
  },
  {
    title: 'SaaS satış uzmanı — demo & kapanış',
    role: 'Satış danışmanı',
    exp: 'Kıdemli',
    salary: '75.000 - 100.000 TL',
    work: 'Tam zamanlı',
    stack: 'HubSpot, demo script, MEDDIC, outbound',
    summary:
      'Orta segment B2B satışta kota üstü kapattım. Discovery’den proposal’a kadar pipeline’ı tek başıma yönetebilirim.',
  },
  {
    title: 'Veri analisti — growth & ürün metrikleri',
    role: 'Veri analisti',
    exp: 'Orta',
    salary: '50.000 - 75.000 TL',
    work: 'Tam zamanlı',
    stack: 'SQL, Python, dbt, Metabase',
    summary:
      'Funnel, retention ve gelir metriklerini tek kaynaktan okunur hale getirdim. Haftalık growth review’ları yönetirim.',
  },
  {
    title: 'İK uzmanı — işe alım ve onboarding',
    role: 'İnsan kaynakları uzmanı',
    exp: 'Orta',
    salary: '50.000 - 75.000 TL',
    work: 'Tam zamanlı',
    stack: 'ATS, mülakat skor kartı, employer branding',
    summary:
      'Teknik ve non-teknik rollerde uçtan uca hiring yürüttüm. 30-60-90 onboarding planları kuruyorum.',
  },
  {
    title: 'E-ticaret operasyon uzmanı',
    role: 'Operasyon uzmanı',
    exp: 'Orta',
    salary: '50.000 - 75.000 TL',
    work: 'Tam zamanlı',
    stack: 'WMS, kargo SLA, iade süreçleri, stok',
    summary:
      'Günlük 3.000+ sipariş operasyonunda SLA ve maliyet optimizasyonu yaptım. Cross-functional koordinasyon güçlüm.',
  },
  {
    title: 'Agile proje yöneticisi — yazılım ekipleri',
    role: 'Proje yöneticisi',
    exp: 'Kıdemli',
    salary: '75.000 - 100.000 TL',
    work: 'Tam zamanlı',
    stack: 'Jira, Scrum, risk register, stakeholder mgmt',
    summary:
      'Çok ekipli yol haritalarında bağımlılıkları yönettim. Teslim tarihlerini şeffaf risklerle takip ederim.',
  },
  {
    title: 'Backend developer — NestJS & PostgreSQL',
    role: 'Yazılım geliştirici',
    exp: 'Orta',
    salary: '75.000 - 100.000 TL',
    work: 'Tam zamanlı',
    stack: 'NestJS, Postgres, Redis, Docker',
    summary:
      'Yüksek trafikli API’ler, queue sistemleri ve gözlemlenebilirlik (logs/metrics) konularında deneyimliyim.',
  },
  {
    title: 'Growth marketing uzmanı',
    role: 'Pazarlama uzmanı',
    exp: 'Kıdemli',
    salary: '75.000 - 100.000 TL',
    work: 'Tam zamanlı',
    stack: 'SEO, lifecycle, referral, experimentation',
    summary:
      'Activation ve retention deneyleri kurguladım. Paid + organic kanalları birlikte büyüttüm.',
  },
  {
    title: 'Müşteri başarı uzmanı — B2B onboarding',
    role: 'Operasyon uzmanı',
    exp: 'Orta',
    salary: '50.000 - 75.000 TL',
    work: 'Tam zamanlı',
    stack: 'Onboarding playbook, NPS, churn önleme',
    summary:
      'Yeni müşteri aktivasyonunu 14 günden 6 güne indirdim. QBR ve expansion fırsatlarını takip ederim.',
  },
  {
    title: 'Mobil developer — Flutter',
    role: 'Yazılım geliştirici',
    exp: 'Orta',
    salary: '75.000 - 100.000 TL',
    work: 'Tam zamanlı',
    stack: 'Flutter, Firebase, CI/CD, App Store',
    summary:
      'Consumer ve internal app’lerde release ritmi kurdum. Crash-free oranı ve performans bütçesine dikkat ederim.',
  },
  {
    title: 'İş geliştirme uzmanı — kurumsal satış',
    role: 'Saha satış uzmanı',
    exp: 'Kıdemli',
    salary: '75.000 - 100.000 TL',
    work: 'Tam zamanlı',
    stack: 'Account mapping, partnerlik, RFP',
    summary:
      'Holding ve orta ölçek firmalarda uzun satış döngülerini yönettim. Partner kanalları açabilirim.',
  },
  {
    title: 'Marka / ürün görsel tasarımcısı',
    role: 'Grafik tasarımcı',
    exp: 'Başlangıç',
    salary: '25.000 - 50.000 TL',
    work: 'Yarı zamanlı',
    stack: 'Illustrator, Photoshop, Figma, sosyal içerik',
    summary:
      'Startup temposunda hızlı üretiyorum. Landing, pitch deck ve sosyal içerik setleri hazırlarım.',
  },
  {
    title: 'Junior veri analisti — öğrenmeye açık',
    role: 'Veri analisti',
    exp: 'Başlangıç',
    salary: '25.000 - 50.000 TL',
    work: 'Tam zamanlı',
    stack: 'SQL temeli, Excel, Python başlangıç',
    summary:
      'Staj ve freelance projelerde dashboard ürettim. Mentörlük alan bir ekipte hızlı katkı vermek istiyorum.',
  },
];

const HIRING_ROLES = [
  {
    title: 'React Native Developer arıyoruz',
    role: 'Yazılım geliştirici',
    salary: '75.000–100.000 TL',
    work: 'Tam zamanlı',
    company: 'ClearStack',
    mustHave: '3+ yıl mobil, TypeScript, release deneyimi',
    nice: 'CI/CD, crash monitoring, App Store süreçleri',
  },
  {
    title: 'Saha satış uzmanı — İstanbul Anadolu',
    role: 'Saha satış uzmanı',
    salary: '50.000–75.000 TL',
    work: 'Tam zamanlı',
    company: 'FleetWise',
    mustHave: 'B2B saha satış, CRM disiplini, ehliyet',
    nice: 'Lojistik / filo sektör tecrübesi',
  },
  {
    title: 'Ürün yöneticisi — B2B SaaS',
    role: 'Ürün yöneticisi',
    salary: '100.000+ TL',
    work: 'Tam zamanlı',
    company: 'NovaPay',
    mustHave: 'Discovery, roadmap sahipliği, SQL okuryazarlığı',
    nice: 'Fintech veya billing ürün deneyimi',
  },
  {
    title: 'Performans pazarlama uzmanı',
    role: 'Pazarlama uzmanı',
    salary: '50.000–75.000 TL',
    work: 'Tam zamanlı',
    company: 'BrightCart',
    mustHave: 'Meta/Google Ads, bütçe yönetimi, raporlama',
    nice: 'E-ticaret büyüme deneyimi',
  },
  {
    title: 'Finans uzmanı — startup deneyimi tercih',
    role: 'Finans uzmanı',
    salary: '50.000–75.000 TL',
    work: 'Tam zamanlı',
    company: 'Marketly',
    mustHave: 'Nakit akışı, maliyet takibi, Excel modelleme',
    nice: 'Yatırımcı raporlama tecrübesi',
  },
  {
    title: 'Müşteri destek temsilcisi (hybrid)',
    role: 'Operasyon uzmanı',
    salary: '35.000–50.000 TL',
    work: 'Tam zamanlı',
    company: 'HireFlow',
    mustHave: 'İyi iletişim, ticket disiplini, yazılı Türkçe',
    nice: 'Zendesk / Intercom deneyimi',
  },
  {
    title: 'Backend Engineer — Node.js',
    role: 'Yazılım geliştirici',
    salary: '75.000–100.000 TL',
    work: 'Tam zamanlı',
    company: 'SecureNest',
    mustHave: 'Node.js, Postgres, API tasarımı',
    nice: 'Güvenlik / audit log deneyimi',
  },
  {
    title: 'İK uzmanı — teknik işe alım',
    role: 'İnsan kaynakları uzmanı',
    salary: '50.000–75.000 TL',
    work: 'Tam zamanlı',
    company: 'VoiceLab',
    mustHave: 'Teknik rol hiring, mülakat koordinasyonu',
    nice: 'Employer branding içeriği üretebilme',
  },
  {
    title: 'Depo & lojistik operasyon uzmanı',
    role: 'Operasyon uzmanı',
    salary: '35.000–50.000 TL',
    work: 'Tam zamanlı',
    company: 'BrightCart',
    mustHave: 'Vardiya koordinasyonu, WMS, problem çözme',
    nice: 'E-ticaret fulfillment deneyimi',
  },
  {
    title: 'Veri analisti — büyüme metrikleri',
    role: 'Veri analisti',
    salary: '50.000–75.000 TL',
    work: 'Tam zamanlı',
    company: 'EduSpark',
    mustHave: 'SQL, dashboard, net iletişim',
    nice: 'dbt / Python',
  },
  {
    title: 'Sosyal medya & marka tasarımcısı',
    role: 'Grafik tasarımcı',
    salary: '35.000–50.000 TL',
    work: 'Yarı zamanlı',
    company: 'PetPati',
    mustHave: 'Figma/PS, hızlı üretim, marka tutarlılığı',
    nice: 'Motion / short-form video',
  },
  {
    title: 'Müşteri implementasyon proje yöneticisi',
    role: 'Proje yöneticisi',
    salary: '50.000–75.000 TL',
    work: 'Tam zamanlı',
    company: 'MediLink',
    mustHave: 'Stakeholder yönetimi, timeline sahipliği',
    nice: 'Sağlık sektörü tecrübesi',
  },
  {
    title: 'Full-stack yazılım geliştirici',
    role: 'Yazılım geliştirici',
    salary: '75.000–100.000 TL',
    work: 'Tam zamanlı',
    company: 'AquaSense',
    mustHave: 'React + Node, ownership kültürü',
    nice: 'IoT / dashboard deneyimi',
  },
  {
    title: 'Çağrı merkezi satış temsilcisi',
    role: 'Satış danışmanı',
    salary: '35.000–50.000 TL',
    work: 'Tam zamanlı',
    company: 'Trustly',
    mustHave: 'Telefon satış, itiraz yönetimi, CRM kaydı',
    nice: 'SaaS inbound deneyimi',
  },
  {
    title: 'DevOps mühendisi — AWS & CI/CD',
    role: 'Yazılım geliştirici',
    salary: '100.000+ TL',
    work: 'Tam zamanlı',
    company: 'SolarGrid',
    mustHave: 'AWS, Terraform veya CDK, observability',
    nice: 'Kubernetes',
  },
  {
    title: 'Kurumsal hesap iş geliştirme uzmanı',
    role: 'Saha satış uzmanı',
    salary: '75.000–100.000 TL',
    work: 'Tam zamanlı',
    company: 'CityPulse',
    mustHave: 'Uzun satış döngüsü, teklif hazırlama',
    nice: 'Belediye / AVM satışı',
  },
  {
    title: 'Mobil öncelikli ürün tasarımcısı',
    role: 'Grafik tasarımcı',
    salary: '50.000–75.000 TL',
    work: 'Tam zamanlı',
    company: 'SkillPath',
    mustHave: 'Mobil UX, prototype, usability test',
    nice: 'Design system bakım',
  },
];

const PARTNER_NEEDS = [
  {
    title: 'Teknik kurucu ortak arıyorum — B2B SaaS MVP',
    type: 'Kurucu Ortak',
    expertise: ['CTO / Teknik liderlik', 'Yazılım geliştirme'],
    stage: 'Fikir aşaması',
    equity: 25,
    commitment: 'Tam zamanlı',
    problem: 'Müşteri problemleri doğrulandı; teknik MVP ve ilk mimari eksik.',
  },
  {
    title: 'Pazarlama ortağı ile büyütmek istediğim ürün',
    type: 'İş Ortağı',
    expertise: ['CMO / Pazarlama', 'İş geliştirme'],
    stage: 'İlk müşteriler',
    equity: 15,
    commitment: 'Tam zamanlı',
    problem: 'Ürün çalışıyor; tutarlı talep üretimi ve marka konumlandırması lazım.',
  },
  {
    title: 'Finans / operasyon ortağı arıyorum',
    type: 'Kurucu Ortak',
    expertise: ['COO / Operasyon', 'CFO / Finans'],
    stage: 'Gelir elde ediliyor',
    equity: 20,
    commitment: 'Tam zamanlı',
    problem: 'Satış artıyor; süreç, maliyet ve nakit disiplini kurulmalı.',
  },
  {
    title: 'B2B satış odaklı kurucu ortak',
    type: 'Kurucu Ortak',
    expertise: ['Satış', 'İş geliştirme'],
    stage: 'MVP aşaması',
    equity: 22,
    commitment: 'Tam zamanlı',
    problem: 'Demo-ready ürün var; ilk 20 ücretli müşteriyi birlikte kapatacağız.',
  },
  {
    title: 'Mobil uygulama için CTO ortağı',
    type: 'Teknik Ortak',
    expertise: ['CTO / Teknik liderlik', 'Mobil geliştirme'],
    stage: 'Fikir aşaması',
    equity: 30,
    commitment: 'Tam zamanlı',
    problem: 'Kullanıcı araştırması tamam; native/Flutter kararını birlikte verip çıkaracağız.',
  },
  {
    title: 'E-ticaret markası için operasyon ortağı',
    type: 'İş Ortağı',
    expertise: ['COO / Operasyon', 'Satış'],
    stage: 'Büyüme aşaması',
    equity: 12,
    commitment: 'Tam zamanlı',
    problem: 'Sipariş hacmi arttı; depo, iade ve tedarik zinciri sahipliği arıyorum.',
  },
  {
    title: 'Yapay zeka ürününde ürün ortağı',
    type: 'Kurucu Ortak',
    expertise: ['Ürün yönetimi', 'Yapay zeka / ML'],
    stage: 'MVP aşaması',
    equity: 20,
    commitment: 'Tam zamanlı',
    problem: 'Model prototipi var; paketleme, pricing ve kullanıcı akışı netleşmeli.',
  },
  {
    title: 'Yerel büyüme için iş ortağı',
    type: 'İş Ortağı',
    expertise: ['İş geliştirme', 'Satış'],
    stage: 'Gelir elde ediliyor',
    equity: 10,
    commitment: 'Yarı zamanlı',
    problem: 'Ankara/İzmir açılışı için yerel network ve satış kapasitesi lazım.',
  },
  {
    title: 'Edtech için pedagoji + tech ortaklık',
    type: 'Kurucu Ortak',
    expertise: ['Ürün yönetimi', 'Diğer'],
    stage: 'İlk müşteriler',
    equity: 18,
    commitment: 'Tam zamanlı',
    problem: 'İçerik kalitesi yüksek; ürünleşme ve kurumsal satış eksik.',
  },
  {
    title: 'Lojistik startupında kurucu ortaklık',
    type: 'Kurucu Ortak',
    expertise: ['COO / Operasyon', 'Yazılım geliştirme'],
    stage: 'MVP aşaması',
    equity: 25,
    commitment: 'Tam zamanlı',
    problem: 'Pilot müşteri var; yazılım + saha operasyonunu birlikte ölçekleyeceğiz.',
  },
  {
    title: 'Healthtech klinik + ürün ortağı',
    type: 'İş Ortağı',
    expertise: ['Ürün yönetimi', 'İş geliştirme'],
    stage: 'İlk müşteriler',
    equity: 15,
    commitment: 'Yarı zamanlı',
    problem: 'Klinik erişim ve ürün geri bildirimi döngüsünü hızlandırmak istiyorum.',
  },
  {
    title: 'Marketplace için iş geliştirme ortağı',
    type: 'İş Ortağı',
    expertise: ['İş geliştirme', 'Satış'],
    stage: 'Gelir elde ediliyor',
    equity: 12,
    commitment: 'Tam zamanlı',
    problem: 'Arz tarafı dolu; talep tarafı hesap yönetimi güçlendirilecek.',
  },
  {
    title: 'Clean energy projesine teknik ortak',
    type: 'Teknik Ortak',
    expertise: ['Yazılım geliştirme', 'CTO / Teknik liderlik'],
    stage: 'Fikir aşaması',
    equity: 28,
    commitment: 'Tam zamanlı',
    problem: 'Saha partnerleri hazır; fizibilite yazılımının teknik sahipliği açık.',
  },
  {
    title: 'Foodtech dark kitchen operasyon ortağı',
    type: 'İş Ortağı',
    expertise: ['COO / Operasyon', 'Satış'],
    stage: 'İlk müşteriler',
    equity: 16,
    commitment: 'Tam zamanlı',
    problem: 'Mutfak kuruldu; vardiya, maliyet ve kanal yönetimi için ortak arıyorum.',
  },
  {
    title: 'Siber güvenlik ürününde satış ortağı',
    type: 'Danışman',
    expertise: ['Satış', 'İş geliştirme'],
    stage: 'Gelir elde ediliyor',
    equity: 8,
    commitment: 'Danışmanlık',
    problem: 'Ürün olgun; enterprise pipeline ve partner channel kurulacak.',
  },
  {
    title: 'Design-led ürün için UX kurucu ortak',
    type: 'Kurucu Ortak',
    expertise: ['Tasarım / UX', 'Ürün yönetimi'],
    stage: 'MVP aşaması',
    equity: 22,
    commitment: 'Tam zamanlı',
    problem: 'Teknik iskelet var; deneyim kalitesi ve tasarım sistemi ile fark yaratacağız.',
  },
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function place(i) {
  const loc = pick(CITIES, i);
  return {
    city: loc.city,
    district: pick(loc.districts, i),
    location: `${loc.city}, ${pick(loc.districts, i)}`,
  };
}

function slugify(title, index) {
  const base = title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 55);
  return `${base || 'ilan'}-${String(index).padStart(3, '0')}`;
}

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString();
}

function contactFor(i) {
  const n = String(500000000 + (i * 137) % 400000000);
  return {
    contact_phone: `+905${n}`,
    contact_whatsapp: `+905${n}`,
    contact_email: `demo.ilan${String(i).padStart(3, '0')}@girisimco.example`,
    contact_website: i % 3 === 0 ? `https://www.demo-girisim-${i}.com` : null,
  };
}

function remotePolicy(i) {
  return i % 3 === 0 ? 'remote' : i % 3 === 1 ? 'hybrid' : 'onsite';
}

const TYPE_SPECS = [
  {
    slug: 'yatirim-ariyorum',
    categoryId: 'e1000001-0001-4000-8000-000000000001',
    listingTypeId: 'e1000001-0001-4000-8000-000000000001',
    moduleKey: 'entrepreneurs',
    count: 17,
    build(i) {
      const startup = pick(STARTUPS, i);
      const stage = pick(STAGES, i);
      const amount = pick(INVESTMENT_AMOUNTS, i);
      const loc = place(i);
      const funds = [pick(USE_OF_FUNDS, i), pick(USE_OF_FUNDS, i + 2), pick(USE_OF_FUNDS, i + 5)];
      const equity = 8 + (i % 15);
      const title = `${startup.name}: ${startup.pitch.split(' ').slice(0, 8).join(' ')}… yatırım arıyoruz`;
      return {
        title: `${startup.name} — ${pick(INDUSTRIES, i)} girişimime ${amount} yatırım arıyorum`,
        short_description: `${startup.pitch}. Aşama: ${stage}. Traction: ${startup.traction}. Sunulan hisse: %${equity}.`,
        long_description: [
          `## Girişim özeti`,
          startup.pitch + '.',
          ``,
          `## Neden şimdi?`,
          `${stage} seviyesindeyiz. ${startup.traction}. Bu tur ile ürünü hızlandırıp satış kapasitesini ölçeklemek istiyoruz.`,
          ``,
          `## Ekip`,
          startup.team + '.',
          ``,
          `## Yatırımın kullanımı`,
          `Fonlar öncelikle şu alanlara gidecek: ${funds.join(', ')}. Aylık burn ve 18 aylık runway planı görüşmede paylaşılır.`,
          ``,
          `## Yatırımcıya sunduğumuz`,
          `- %${equity} hisse (görüşmeye açık)`,
          `- Aylık metrik raporu ve şeffaf board update`,
          `- ${loc.city} ofisinde veya online düzenli sync`,
          ``,
          `## Sonraki adım`,
          `Kısa bir intro görüşmesi + one-pager paylaşımı. Due diligence için veri odası hazır.`,
        ].join('\n'),
        city: loc.city,
        district: loc.district,
        location: loc.location,
        industry: pick(INDUSTRIES, i),
        remote_policy: remotePolicy(i),
        custom_fields: {
          investmentAmount: amount,
          equityOffered: equity,
          stage,
          useOfFunds: funds,
        },
      };
    },
  },
  {
    slug: 'yatirim-yapiyorum',
    categoryId: 'e1000001-0001-4000-8000-000000000001',
    listingTypeId: 'e1000001-0001-4000-8000-000000000002',
    moduleKey: 'investors',
    count: 17,
    build(i) {
      const inv = pick(INVESTOR_PROFILES, i);
      const loc = place(i + 1);
      return {
        title: inv.title,
        short_description: `${inv.focus}. Yatırım bandı: ${inv.ticket}. Tercih aşama: ${inv.stage}. Sektörler: ${inv.sectors}.`,
        long_description: [
          `## Yatırım tezi`,
          inv.focus + '.',
          ``,
          `## Ticket ve aşama`,
          `Tipik çek boyutu ${inv.ticket}. Tercih ettiğim aşama: ${inv.stage}.`,
          ``,
          `## Sektör odağı`,
          inv.sectors + '.',
          ``,
          `## Nasıl değer katarım?`,
          inv.valueAdd + '.',
          ``,
          `## Süreç`,
          `1) 30 dk intro  2) Metrik / demo incelemesi  3) Referans + term sheet.`,
          `Görüşmeler ${loc.city} veya online. Aylık 2–4 yeni girişime bakıyorum.`,
          ``,
          `## Aradığım kurucu profili`,
          `Net problem tanımı, ölçülebilir traction, hızlı iletişim ve öğrenme hızı.`,
        ].join('\n'),
        city: loc.city,
        district: loc.district,
        location: loc.location,
        industry: inv.sectors.split(',')[0].trim(),
        remote_policy: 'hybrid',
        custom_fields: {
          investmentAmount: inv.ticket,
          preferredStages: inv.stage,
          sectors: inv.sectors,
        },
      };
    },
  },
  {
    slug: 'is-ariyorum',
    categoryId: 'e1000001-0001-4000-8000-000000000002',
    listingTypeId: 'e1000001-0001-4000-8000-000000000003',
    moduleKey: 'candidates',
    count: 17,
    build(i) {
      const person = pick(JOB_SEEKERS, i);
      const loc = place(i + 2);
      return {
        title: person.title,
        short_description: `${person.exp} seviye ${person.role}. ${person.work}. Maaş beklentisi: ${person.salary}. Stack: ${person.stack}.`,
        long_description: [
          `## Kısa profil`,
          person.summary,
          ``,
          `## Aradığım rol`,
          `${person.role} — ${person.work.toLowerCase()}, ${person.exp.toLowerCase()} seviye sorumluluk.`,
          ``,
          `## Yetkinlikler`,
          person.stack + '.',
          ``,
          `## Çalışma tercihi`,
          `${loc.city} / ${loc.district} veya ${remotePolicy(i)} model. İlk 90 günde somut teslimat hedeflerim.`,
          ``,
          `## Maaş beklentisi`,
          person.salary + ' (yan haklara göre esnek).',
          ``,
          `## Nasıl ilerleyelim?`,
          `CV + portfolyo görüşmede. 20 dakikalık tanışma için mesaj atabilirsiniz.`,
        ].join('\n'),
        city: loc.city,
        district: loc.district,
        location: loc.location,
        industry: pick(INDUSTRIES, i + 3),
        remote_policy: remotePolicy(i),
        custom_fields: {
          desiredRole: person.role,
          experienceLevel: person.exp,
          salaryExpectation: person.salary,
          workType: person.work,
        },
      };
    },
  },
  {
    slug: 'ise-aliyorum',
    categoryId: 'e1000001-0001-4000-8000-000000000002',
    listingTypeId: 'e1000001-0001-4000-8000-000000000004',
    moduleKey: 'employers',
    count: 17,
    build(i) {
      const job = pick(HIRING_ROLES, i);
      const loc = place(i + 3);
      return {
        title: job.title,
        short_description: `${job.company} ekibine ${job.role} arıyoruz. ${job.work}. Maaş: ${job.salary}. Lokasyon: ${loc.city}.`,
        long_description: [
          `## Şirket`,
          `${job.company}, büyüyen ürün ekibine ${job.role.toLowerCase()} arıyor. Ofis: ${loc.location}.`,
          ``,
          `## Rol`,
          `Çalışma tipi: ${job.work}. Maaş aralığı: ${job.salary}.`,
          ``,
          `## Zorunlu nitelikler`,
          job.mustHave + '.',
          ``,
          `## Tercih edilen`,
          job.nice + '.',
          ``,
          `## Süreç`,
          `1) CV ekranı  2) Teknik / rol görüşmesi  3) Kültür uyumu  4) Teklif.`,
          `İlk 90 gün için net hedefler ve mentorluk tanımlı.`,
          ``,
          `## Yan haklar`,
          `Yemek / yol desteği, esnek izin, öğrenme bütçesi (role göre). Detay görüşmede.`,
        ].join('\n'),
        city: loc.city,
        district: loc.district,
        location: loc.location,
        industry: pick(INDUSTRIES, i + 1),
        remote_policy: remotePolicy(i + 1),
        custom_fields: {
          positionTitle: job.role,
          salaryRange: job.salary,
          workType: job.work,
        },
      };
    },
  },
  {
    slug: 'ortak-ariyorum',
    categoryId: 'e1000001-0001-4000-8000-000000000003',
    listingTypeId: 'e1000001-0001-4000-8000-000000000005',
    moduleKey: 'founders',
    count: 16,
    build(i) {
      const need = pick(PARTNER_NEEDS, i);
      const startup = pick(STARTUPS, i + 4);
      const loc = place(i + 4);
      return {
        title: need.title,
        short_description: `${startup.name} için ${need.type.toLowerCase()} arıyorum. Aşama: ${need.stage}. Hisse: %${need.equity}. Uzmanlık: ${need.expertise.join(', ')}.`,
        long_description: [
          `## Proje`,
          `${startup.name} — ${startup.pitch}.`,
          ``,
          `## Neden ortak?`,
          need.problem,
          ``,
          `## Ortaklık tipi`,
          `${need.type}, taahhüt: ${need.commitment}. Önerilen hisse: %${need.equity} (görüşmeye açık).`,
          ``,
          `## Aranan uzmanlık`,
          need.expertise.join(', ') + '.',
          ``,
          `## Mevcut durum`,
          `Aşama: ${need.stage}. Traction notu: ${startup.traction}. Ekip: ${startup.team}.`,
          ``,
          `## Çalışma modeli`,
          `${loc.city} buluşmaları + haftalık online sync. İlk 90 günde net milestone’lar yazıyoruz.`,
          ``,
          `## Başvuru`,
          `Kısa bio + neden bu proje + haftalık ayırabileceğin saat ile yazman yeterli.`,
        ].join('\n'),
        city: loc.city,
        district: loc.district,
        location: loc.location,
        industry: pick(INDUSTRIES, i + 2),
        remote_policy: 'hybrid',
        custom_fields: {
          partnershipType: need.type,
          equityOffered: need.equity,
          commitment: need.commitment,
          expertise: need.expertise,
          projectStage: need.stage,
        },
      };
    },
  },
  {
    slug: 'bayilik-ver',
    categoryId: 'c1000001-0001-4000-8000-000000000006',
    listingTypeId: 'a0000007-0001-4000-8000-000000000007',
    moduleKey: 'franchise',
    count: 16,
    build(i) {
      const brand = pick(FRANCHISE_BRANDS, i);
      const loc = place(i + 5);
      const entry = 180000 + i * 22000;
      const franchiseFee = 90000 + i * 8000;
      const total = entry + franchiseFee + 140000;
      const cities = [loc.city, pick(CITIES, i + 2).city, pick(CITIES, i + 4).city];
      return {
        title: `${brand.name} bayilik fırsatı — ${brand.sector}`,
        short_description: `${brand.concept}. Toplam yatırım ~${total.toLocaleString('tr-TR')} ₺. Uygun şehirler: ${cities.join(', ')}.`,
        long_description: [
          `## Marka`,
          `${brand.name}, ${brand.sector} kategorisinde ${brand.concept.toLowerCase()}.`,
          ``,
          `## Yatırım kalemleri`,
          `- Giriş bedeli: ${entry.toLocaleString('tr-TR')} ₺`,
          `- Franchise bedeli: ${franchiseFee.toLocaleString('tr-TR')} ₺`,
          `- Toplam yatırım (dekor + stok + işletme sermayesi dahil tahmini): ${total.toLocaleString('tr-TR')} ₺`,
          ``,
          `## Destek paketi`,
          brand.support + '.',
          ``,
          `## Lokasyon kriterleri`,
          `Uygun şehirler: ${cities.join(', ')}. İlçe örneği: ${loc.district}. Minimum nüfus ve cadde/AVM uygunluğu değerlendirmede kritik.`,
          ``,
          `## Aday profili`,
          `İşletme sahiplenmesi yüksek, yerel network’ü olan veya öğrenmeye açık yatırımcı / operatör.`,
          ``,
          `## Süreç`,
          `Ön görüşme → finansal model paylaşımı → lokasyon onayı → eğitim → açılış.`,
        ].join('\n'),
        city: loc.city,
        district: loc.district,
        location: loc.location,
        industry: brand.sector,
        remote_policy: null,
        custom_fields: {
          companyName: brand.name,
          establishmentYear: 2005 + (i % 18),
          sector: brand.sector,
          branchCount: 18 + i * 3,
          website: `https://www.${brand.name.toLowerCase()}.com.tr`,
          entryFee: entry,
          franchiseFee,
          totalInvestment: total,
          royaltyFee: 4 + (i % 4),
          advertisingFee: 1 + (i % 3),
          returnPeriod: pick(FRANCHISE_RETURN, i),
          availableCities: cities,
          districts: `${loc.district} ve çevre ilçeler`,
          minPopulation: 80000 + i * 15000,
          storeSize: pick(FRANCHISE_STORE, i),
          mallAvailable: i % 2 === 0,
          streetStoreAvailable: true,
          businessCategory: brand.category,
          employeeCount: 4 + (i % 8),
          dailyCustomerCapacity: 80 + i * 15,
          workingHours: '09:00 - 22:00',
          trainingSupport: true,
          operationalSupport: true,
          marketingSupport: true,
          minCapitalRequirement: Math.round(total * 0.35),
          experienceRequirement: pick(FRANCHISE_EXPERIENCE, i),
          educationRequirement: pick(FRANCHISE_EDUCATION, i),
          companyEstablishmentRequired: true,
          guaranteeRequirement: 'Kira süresi boyunca teminat mektubu veya eşdeğer güvence',
          introductionVideoUrl: null,
          presentationPdfUrl: null,
          sampleContractUrl: null,
        },
      };
    },
  },
];

async function resolveOwnerId() {
  const { data: existing } = await supabase
    .from('marketplace_listings')
    .select('owner_id')
    .limit(1);
  if (existing?.[0]?.owner_id) return existing[0].owner_id;

  const { data: users, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 50 });
  if (error) throw error;
  const preferred = users.users.find((u) => u.email === 'zamanugurz@gmail.com');
  const fallback = preferred ?? users.users[0];
  if (!fallback) throw new Error('No auth.users found to own demo listings');
  return fallback.id;
}

async function wipeAllListings() {
  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

function buildRows(ownerId) {
  const rows = [];
  let globalIndex = 1;

  for (const spec of TYPE_SPECS) {
    for (let i = 0; i < spec.count; i += 1) {
      const built = spec.build(i);
      const featured = globalIndex <= 10 || globalIndex % 9 === 0;
      const urgent = globalIndex % 11 === 0;
      const contacts = contactFor(globalIndex);

      rows.push({
        id: randomUUID(),
        slug: slugify(built.title, globalIndex),
        owner_id: ownerId,
        company_id: null,
        category_id: spec.categoryId,
        listing_type_id: spec.listingTypeId,
        subcategory_id: null,
        module_key: spec.moduleKey,
        title: built.title.slice(0, 200),
        short_description: built.short_description.slice(0, 500),
        long_description: built.long_description,
        status: 'published',
        workflow_status: 'published',
        location: built.location,
        city: built.city,
        district: built.district,
        industry: built.industry ?? null,
        country: 'TR',
        remote_policy: built.remote_policy ?? null,
        anonymous_mode: false,
        ...contacts,
        custom_fields: built.custom_fields,
        view_count: 40 + ((globalIndex * 23) % 520),
        interested_count: 2 + ((globalIndex * 5) % 48),
        application_count: 1 + ((globalIndex * 3) % 30),
        is_verified: globalIndex % 4 === 0,
        is_featured: featured,
        is_urgent: urgent,
        featured_until: featured ? daysFromNow(30) : null,
        urgent_until: urgent ? daysFromNow(7) : null,
        published_at: daysAgo(globalIndex % 45),
        expires_at: daysFromNow(60 + (globalIndex % 30)),
        rejected_reason: null,
        deleted_at: null,
      });

      globalIndex += 1;
    }
  }

  return rows;
}

async function insertInChunks(rows, chunkSize = 20) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('marketplace_listings').insert(chunk);
    if (error) {
      console.error('Insert failed at chunk', i, error.message, error.details);
      throw error;
    }
    console.log(`Inserted ${Math.min(i + chunkSize, rows.length)} / ${rows.length}`);
  }
}

async function main() {
  console.log('Resolving owner...');
  const ownerId = await resolveOwnerId();
  console.log('Owner:', ownerId);

  console.log('Wiping ALL marketplace_listings...');
  await wipeAllListings();

  const { count: afterWipe } = await supabase
    .from('marketplace_listings')
    .select('id', { count: 'exact', head: true });
  console.log('Remaining after wipe:', afterWipe ?? 0);

  const rows = buildRows(ownerId);
  console.log(`Seeding ${rows.length} detailed demo listings...`);
  await insertInChunks(rows);

  const { count } = await supabase
    .from('marketplace_listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('deleted_at', null);

  const { data: byType } = await supabase
    .from('marketplace_listings')
    .select('listing_type_id, title')
    .eq('status', 'published')
    .is('deleted_at', null);

  const typeCounts = {};
  for (const row of byType ?? []) {
    typeCounts[row.listing_type_id] = (typeCounts[row.listing_type_id] ?? 0) + 1;
  }

  console.log('Done. Published count:', count);
  console.log('By listing_type_id:', typeCounts);
  console.log('Sample titles:');
  for (const row of (byType ?? []).slice(0, 8)) {
    console.log(' -', row.title);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
