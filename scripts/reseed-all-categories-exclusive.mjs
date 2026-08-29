/**
 * Complete Database & Seed Wipe + 45 Realistic Exclusive Listings + Corporate Ads/Solutions.
 * 
 * Runs with SUPABASE_SERVICE_ROLE_KEY.
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tszvmnaejsxsyuawwclr.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const EXCLUSIVE_LISTINGS_DATA = [
  // =========================================================================
  // 1. GİRİŞİM & YATIRIM ARAYAN (yatirim-bul) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'yatirim-bul',
    title: 'B2B Lojistik Rota Optimizasyonu Yapan Yapay Zeka SaaS Platformu',
    shortDescription: 'Tedarik zinciri maliyetlerini %24 düşüren, 18 kurumsal müşteriye sahip erken aşama girişim seed turuna çıkıyor.',
    longDescription: 'Filo yönetimi ve gerçek zamanlı dinamik rota optimizasyonu sağlayan yapay zeka platformumuz, son 6 ayda %35 MRR büyümesi yakaladı. Avrupa pazarına açılım ve makine öğrenimi model altyapısının güçlendirilmesi amacıyla 1.500.000 TL tohum yatırım aranmaktadır.',
    city: 'İstanbul',
    district: 'Maslak',
    industry: 'Yapay Zeka & SaaS',
    remotePolicy: 'hybrid',
    customFields: {
      businessName: 'RoutePulse AI Logistics',
      sector: 'Yapay Zeka & SaaS',
      investmentAmount: '1.500.000 TL',
      valuation: '15.000.000 TL',
      shareOffered: '%10',
      currentMRR: '145.000 TL',
      customerCount: '18 Kurumsal Müşteri',
      stage: 'Gelir elde ediliyor (Büyüme Aşaması)',
      useOfFunds: 'Avrupa satış operasyonu, veri bilimi ekibi istihdamı, GPU bulut altyapısı',
      contactName: 'RoutePulse Kurucu Ekip',
    },
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'yatirim-bul',
    title: 'Yeni Nesil Biyometrik ve Çok Faktörlü Kimlik Doğrulama API Altyapısı',
    shortDescription: 'Fintech ve bankacılık uygulamaları için regülasyona tam uyumlu, SDK entegrasyonlu kimlik doğrulama çözümü.',
    longDescription: 'Yüz tanıma, liveness check ve çipli kimlik okuma teknolojilerini tek bir SDK altında toplayan siber güvenlik girişimimiz, pre-seed turunu kapatmak üzeredir. 4 aktif ödeme kuruluşu entegrasyonu tamamlanmıştır.',
    city: 'Ankara',
    district: 'Çankaya',
    industry: 'Fintech & Siber Güvenlik',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'VeriTrust BioAuth Labs',
      sector: 'Fintech & Siber Güvenlik',
      investmentAmount: '2.800.000 TL',
      valuation: '28.000.000 TL',
      shareOffered: '%10',
      stage: 'MVP Aşaması & İlk Müşteriler',
      useOfFunds: 'Uluslararası güvenlik sertifikasyonları, satış ekibi',
      contactName: 'VeriTrust Labs',
    },
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'yatirim-bul',
    title: 'Güneş Enerjisi Santralleri İçin Otonom Dron ve Termal Denetim Sistemi',
    shortDescription: 'GES sahalarındaki hücre kırıklarını ve panel arızalarını dakikalar içinde tespit eden patentli IoT & AI platformu.',
    longDescription: 'Türkiye ve MENA bölgesinde 420 MW kurulu güce sahip santrallerde başarıyla uygulanan otonom denetim teknolojimiz, bakım maliyetlerini %40 azaltmaktadır. Seri üretim ve global pazarlama için köprü turu başlatılmıştır.',
    city: 'İzmir',
    district: 'Bornova',
    industry: 'Temiz Enerji & IoT',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'SolarScan Otonom Sistemler',
      sector: 'Temiz Enerji & IoT',
      investmentAmount: '4.500.000 TL',
      valuation: '45.000.000 TL',
      shareOffered: '%10',
      stage: 'Ölçeklenme Aşaması',
      useOfFunds: 'Dron filosu üretimi, uluslararası enerji fuarları',
      contactName: 'SolarScan Mühendislik',
    },
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'yatirim-bul',
    title: 'KOBİ’ler İçin Otomatik E-Fatura ve Gelir-Gider Öngörü Asistanı',
    shortDescription: '1.200+ aktif abonesi olan, banka hesap entegrasyonlu ve nakit akışı tahminleyen finansal yönetim yazılımı.',
    longDescription: 'Açık bankacılık lisanslı partnerler üzerinden tüm banka hesap hareketlerini ve e-faturaları tek ekranda toplayan mikro-SaaS ürünümüz, aylık 210.000 TL tekrarlayan gelire ulaşmıştır.',
    city: 'İstanbul',
    district: 'Kadıköy',
    industry: 'Fintech & Muhasebe',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'HesapMatik Finansal Teknolojiler',
      sector: 'Fintech & Muhasebe',
      investmentAmount: '3.000.000 TL',
      valuation: '30.000.000 TL',
      shareOffered: '%10',
      currentMRR: '210.000 TL',
      customerCount: '1.200+ Aktif KOBİ',
      stage: 'Büyüme Aşaması',
      contactName: 'HesapMatik Ekibi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'yatirim-bul',
    title: 'Yapay Zeka Destekli Erken Teşhis ve Radyoloji Görüntü Analiz Yazılımı',
    shortDescription: 'MR ve Tomografi görüntülerinde anormallikleri saniyeler içinde raporlayan CE tıbbi cihaz adayı derin öğrenme modeli.',
    longDescription: '3 üniversite hastanesinde klinik testleri tamamlanan ve %96,4 doğruluk oranına sahip radyoloji yapay zeka algoritmamız, medikal sertifikasyon sürecindedir.',
    city: 'İstanbul',
    district: 'Şişli',
    industry: 'Sağlık Teknolojileri',
    remotePolicy: 'hybrid',
    customFields: {
      businessName: 'RadiaAI HealthTech',
      sector: 'Sağlık Teknolojileri',
      investmentAmount: '5.000.000 TL',
      valuation: '50.000.000 TL',
      shareOffered: '%10',
      stage: 'Klinik Doğrulama & Sertifikasyon',
      contactName: 'RadiaAI Medikal Ekip',
    },
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80',
  },

  // =========================================================================
  // 2. YATIRIM YAP / YATIRIMCI (yatirim-yap) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'yatirim-yap',
    title: 'B2B SaaS ve Yapay Zeka Girişimlerine 500K - 2.5M TL Tohum Yatırım',
    shortDescription: 'Ölçülebilir geliri olan ve global büyüme hedefleyen teknoloji ekiplerine akıllı sermaye ve mentorluk desteği sağlıyoruz.',
    longDescription: 'Portföyünde 14 başarılı teknoloji girişimi bulunan melek yatırım ağımız; B2B yazılım, yapay zeka ve siber güvenlik alanında ilk gelirlerini elde etmiş girişimleri değerlendirmektedir.',
    city: 'İstanbul',
    district: 'Levent',
    industry: 'Girişim Sermayesi & Melek Yatırım',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'Apex Angel Syndicate',
      sector: 'Girişim Sermayesi',
      investmentRange: '500.000 - 2.500.000 TL',
      preferredStages: 'Tohum Öncesi, Tohum, Erken Aşama',
      targetSectors: 'B2B SaaS, AI, DeepTech, Siber Güvenlik',
      portfolioCount: '14 Aktif Şirket',
      contactName: 'Apex Yatırım Komitesi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'yatirim-yap',
    title: 'E-Ticaret Altyapısı ve Lojistik Çözümlerine Stratejik Ortak ve Yatırımcı',
    shortDescription: 'D2C markalar, pazar yeri entegratörleri ve fulfilment teknolojilerine doğrudan sermaye ve kanal ortaklığı.',
    longDescription: 'Geniş perakende ve dağıtım ağına sahip holding iştirakimiz, e-ticaret lojistiği ve depo otomasyonu alanındaki ölçeklenme aşamasındaki girişimlere 5.000.000 TL’ye kadar yatırım yapmaktadır.',
    city: 'İstanbul',
    district: 'Ataşehir',
    industry: 'E-Ticaret & Lojistik',
    remotePolicy: 'hybrid',
    customFields: {
      businessName: 'Nexus Venture Capital',
      sector: 'Lojistik & Perakende',
      investmentRange: '2.000.000 - 5.000.000 TL',
      preferredStages: 'Büyüme ve Ölçeklenme Aşaması',
      contactName: 'Nexus Yatırım Direktörlüğü',
    },
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'yatirim-yap',
    title: 'Yeşil Enerji, Karbon Ayak İzi ve Sürdürülebilirlik Girişimlerine Erken Fonlama',
    shortDescription: 'İklim teknolojileri ve yenilenebilir enerji yazılımlarına etki yatırımı ve hibe eş finansmanı.',
    longDescription: 'Avrupa Yeşil Mutabakatı uyumlu, karbon kredisi ve enerji verimliliği odaklı yenilikçi projelere 1.000.000 TL ile 3.500.000 TL arasında tohum yatırımı sunuyoruz.',
    city: 'Ankara',
    district: 'Bilkent',
    industry: 'İklim & Temiz Teknoloji',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'GreenHorizon Etki Fonu',
      sector: 'Temiz Enerji & Sürdürülebilirlik',
      investmentRange: '1.000.000 - 3.500.000 TL',
      preferredStages: 'MVP, İlk Müşteriler',
      contactName: 'GreenHorizon Danışma Kurulu',
    },
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'yatirim-yap',
    title: 'Fintech ve Gömülü Finans Teknolojilerine 3.000.000 TL Girişim Sermayesi',
    shortDescription: 'Açık bankacılık, mikro-kredi ve ödeme ağ geçidi alanında regülasyon uyumlu teknoloji girişimleri aranıyor.',
    longDescription: 'Finans sektöründe 20+ yıllık deneyime sahip yönetici ortaklarımızla, büyüme potansiyeli yüksek fintech ürünlerine sermaye, mevzuat danışmanlığı ve banka iş birlikleri sağlıyoruz.',
    city: 'İstanbul',
    district: 'Bebek',
    industry: 'Finansal Teknolojiler',
    remotePolicy: 'hybrid',
    customFields: {
      businessName: 'Vanguard Fintech Partners',
      sector: 'Fintech',
      investmentRange: '1.500.000 - 4.000.000 TL',
      preferredStages: 'Gelir Elde Ediliyor',
      contactName: 'Vanguard Partners',
    },
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'yatirim-yap',
    title: 'Mobil Oyun ve Etkileşimli Eğlence Stüdyolarına Proje Bazlı Finansman',
    shortDescription: 'Hyper-casual ve Hybrid-casual mobil oyun projelerine kullanıcı edinme (UA) ve yayıncı sermayesi.',
    longDescription: 'Prototipleri hazır ve metrik testleri olumlu olan bağımsız oyun geliştirici stüdyolarına 750.000 TL - 2.000.000 TL aralığında fonlama ve yayıncılık mentorluğu sunulmaktadır.',
    city: 'İzmir',
    district: 'Urla',
    industry: 'Oyun & Eğlence',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'PixelPlay Gaming Ventures',
      sector: 'Mobil Oyun',
      investmentRange: '750.000 - 2.000.000 TL',
      preferredStages: 'Prototip & Test Aşaması',
      contactName: 'PixelPlay Yatırım Masası',
    },
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=700&q=80',
  },

  // =========================================================================
  // 3. ORTAK ARIYORUM (ortak-bul) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'ortak-bul',
    title: 'Yapay Zeka Destekli Hukuk Yazılımı İçin Teknik Kurucu Ortak (CTO)',
    shortDescription: 'Avukatlar için sözleşme analizi yapan, ilk kurumsal müşterileri hazır projemize %25 hisse ile teknik lider aranıyor.',
    longDescription: 'Yargıtay kararları ve sözleşmeler üzerinde çalışan LLM tabanlı legaltech girişimimizde ürün tasarımı ve iş geliştirme tarafı tamamlanmıştır. Python, LangChain ve bulut mimarilerinde deneyimli CTO ortak arıyoruz.',
    city: 'İstanbul',
    district: 'Kadıköy',
    industry: 'LegalTech & AI',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'LexiAI Hukuk Teknolojileri',
      sector: 'LegalTech & Yazılım',
      partnershipType: 'Teknik Kurucu Ortak (CTO)',
      equityShare: '%25 Hisse',
      requiredSkills: 'Python, FastAPI, LLM Fine-Tuning, PostgreSQL, Docker',
      currentStage: 'Prototip Hazır, 4 Hukuk Bürosu Pilot Testte',
      contactName: 'LexiAI Kurucu Masası',
    },
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'ortak-bul',
    title: 'Organik Kozmetik ve Cilt Bakım Markası İçin Büyüme & Pazarlama Ortağı',
    shortDescription: 'Sağlık Bakanlığı bildirimli 12 SKU ürünü hazır, e-ticaret operasyonunu büyütecek %20 ortak aranmaktadır.',
    longDescription: 'Formülasyon ve üretim altyapısı kurulu markamız için Meta reklamları, influencer iş birlikleri ve pazar yeri yönetiminde uzman, performansa dayalı büyüme ortağı arıyoruz.',
    city: 'İzmir',
    district: 'Alsancak',
    industry: 'E-Ticaret & Kozmetik',
    remotePolicy: 'hybrid',
    customFields: {
      businessName: 'Botanica Pure Skin',
      sector: 'E-Ticaret & D2C',
      partnershipType: 'Pazarlama ve Büyüme Ortağı (CMO)',
      equityShare: '%20 Hisse',
      requiredSkills: 'Meta Ads, Google Ads, TikTok Shop, E-Ticaret Yönetimi',
      contactName: 'Botanica Kurucuları',
    },
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'ortak-bul',
    title: 'Endüstriyel 3D Baskı ve Hızlı Prototipleme İçin Satış ve İş Geliştirme Ortağı',
    shortDescription: 'Savunma ve otomotiv sektörüne parça üreten atölyemize kurumsal müşteri portföyü getirecek iş ortağı.',
    longDescription: '5 adet endüstriyel SLS ve SLA 3D yazıcı parkuru bulunan tesisimize, B2B müşteri kazanımı ve ihale süreçlerini yönetecek sektör tecrübeli kurucu ortak arıyoruz.',
    city: 'Kocaeli',
    district: 'Gebze',
    industry: 'İmalat & 3D Teknolojileri',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'ProtoTech İleri İmalat',
      sector: 'İmalat Sanayi',
      partnershipType: 'B2B Satış & İş Geliştirme Ortağı',
      equityShare: '%30 Hisse',
      contactName: 'ProtoTech Yönetim',
    },
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'ortak-bul',
    title: 'Fitness ve Beslenme Mobil Uygulaması İçin UI/UX ve Ürün Tasarımı Ortağı',
    shortDescription: '50K organik indirmeye sahip iOS & Android uygulamamızı yeniden tasarlayacak tasarım lideri aranıyor.',
    longDescription: 'Abonelik geliri üreten mobil wellness uygulamamızın onboarding akışlarını, mikro-etkileşimlerini ve gamification sistemini sıfırdan kurgulayacak vizyoner tasarım ortağı aranmaktadır.',
    city: 'İstanbul',
    district: 'Beşiktaş',
    industry: 'Mobil Uygulama & Sağlık',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'FitPulse Mobile',
      sector: 'Mobil Uygulama',
      partnershipType: 'Tasarım Kurucu Ortağı (Head of Product)',
      equityShare: '%15 Hisse',
      requiredSkills: 'Figma, Design Systems, Mobile UX, Gamification',
      contactName: 'FitPulse Labs',
    },
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'ortak-bul',
    title: 'Almanya ve Avrupa Pazarına Açılan E-İhracat Girişimine Operasyon Ortağı',
    shortDescription: 'Amazon DE ve Otto üzerinden satış yapan ev tekstili markamıza Avrupa depo & lojistik ortağı.',
    longDescription: 'Aylık 45.000 Euro ciroya sahip e-ihracat operasyonumuz için gümrükleme, FBA envanter yönetimi ve Avrupa müşteri ilişkilerini koordine edecek ortak arıyoruz.',
    city: 'Bursa',
    district: 'Nilüfer',
    industry: 'E-İhracat & Tekstil',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'LoomLiving Home Collection',
      sector: 'E-İhracat',
      partnershipType: 'Operasyon ve Lojistik Ortağı',
      equityShare: '%20 Hisse',
      contactName: 'LoomLiving Ekip',
    },
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=700&q=80',
  },

  // =========================================================================
  // 4. FRANCHISE & BAYİLİK (franchise) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'franchise',
    title: 'Yeni Nesil Nitelikli Kahve ve Kruvasan Konsepti Franchise Fırsatı',
    shortDescription: 'Oturmuş marka bilinirliği, merkezi kavurmahane ve anahtar teslim şube kurulumu ile yüksek karlılık.',
    longDescription: 'Türkiye genelinde 16 aktif şubesi bulunan markamız; AVM ve ana cadde lokasyonları için yatırımcılara anahtar teslim mimari proje, barista eğitimi ve haftalık taze kavrulmuş çekirdek tedariği sunmaktadır.',
    city: 'İstanbul',
    district: 'Kadıköy',
    industry: 'Yeme & İçme',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'Roast & Roast Artisan Coffee',
      franchiseFee: '450.000 TL',
      totalInvestment: '2.200.000 - 3.000.000 TL',
      royaltyFee: '%4 Ciro Payı',
      roiDuration: '14 - 18 Ay',
      storeSize: '60 - 120 m²',
      contactName: 'Roast & Roast Franchise Direktörlüğü',
    },
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'franchise',
    title: 'Oto Ekspertiz ve Mobil Teşhis İstasyonu Yetkili Bayilik Paketi',
    shortDescription: 'TSE belgeli, 4x4 dinamometre ve yapay zeka destekli kaporta-boya teşhis cihazları dahil anahtar teslim paket.',
    longDescription: 'İkinci el araç pazarının güvenilir ekspertiz markası olarak, 81 il ve ilçe merkezlerinde bölge korumalı yeni bayilikler veriyoruz.',
    city: 'Ankara',
    district: 'Yenimahalle',
    industry: 'Otomotiv & Ekspertiz',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'MasterEksper Otomotiv Sistemleri',
      franchiseFee: '350.000 TL',
      totalInvestment: '1.600.000 TL',
      roiDuration: '10 - 12 Ay',
      contactName: 'MasterEksper Bayi Geliştirme',
    },
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'franchise',
    title: 'EMS Teknolojili 20 Dakikalık Butik Fitness Stüdyosu Franchise',
    shortDescription: 'Kablosuz yeni nesil EMS kıyafetleri, stüdyo yazılımı ve antrenör akademisi ile düşük metrekarede yüksek gelir.',
    longDescription: 'Sadece 70 m² alanda 2 antrenör ile ayda 180.000 TL net kar potansiyeline sahip butik spor stüdyosu franchise modeli.',
    city: 'İzmir',
    district: 'Karşıyaka',
    industry: 'Spor & Sağlık',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'FitPulse EMS Studio',
      franchiseFee: '280.000 TL',
      totalInvestment: '1.100.000 TL',
      roiDuration: '8 - 11 Ay',
      contactName: 'FitPulse Franchise Masası',
    },
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'franchise',
    title: 'Eğlenceli Çocuk Atölyesi ve Robotik Kodlama Merkezi Bayiliği',
    shortDescription: '4-14 yaş grubu için STEAM müfredatı, MEB onaylı eğitim modülleri ve lisanslı robotik kitleri.',
    longDescription: 'Çocuk gelişim kulübü ve teknoloji atölyesi konseptinde, velilerden düzenli aylık abonelik modeliyle çalışan prestijli eğitim bayiliği.',
    city: 'Bursa',
    district: 'Nilüfer',
    industry: 'Eğitim & Teknoloji',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'RoboKids Akıl & Bilim Atölyeleri',
      franchiseFee: '300.000 TL',
      totalInvestment: '1.400.000 TL',
      roiDuration: '12 - 15 Ay',
      contactName: 'RoboKids Genel Merkez',
    },
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'franchise',
    title: 'Hızlı Teslimatlı Gurme Burger ve Sos Restoranı Franchise',
    shortDescription: 'Özel marinasyonlu smash burger, patentli soslar ve paket servise optimize edilmiş kompakt mutfak sistemi.',
    longDescription: 'Minimal alan ve yüksek sipariş devir hızıyla tasarlanmış, karlılığı kanıtlanmış modern fast-casual restoran zinciri.',
    city: 'Antalya',
    district: 'Muratpaşa',
    industry: 'Yeme & İçme',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'SmashCraft Gurme Burger',
      franchiseFee: '400.000 TL',
      totalInvestment: '2.500.000 TL',
      roiDuration: '12 - 16 Ay',
      contactName: 'SmashCraft Franchise Ekibi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
  },

  // =========================================================================
  // 5. İŞLETME DEVRİ (isletme-devri) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'isletme-devri',
    title: 'Kadıköy Moda Caddesi’nde Yüksek Cirolu Butik Kafe ve Kahvaltı Salonu',
    shortDescription: '80 m² kapalı + 40 m² bahçeli, oturmuş yerel müdavimleri olan, tam teşekküllü karlı işletme devren satılıktır.',
    longDescription: 'Moda ana arter üzerinde 4 yıldır aralıksız hizmet veren, yüksek paket servis puanlarına ve günlük 18.000 - 25.000 TL ciro ortalamasına sahip kafe. Tüm profesyonel espresso makineleri ve mutfak ekipmanları dahildir.',
    city: 'İstanbul',
    district: 'Kadıköy',
    industry: 'Yeme & İçme',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'Moda Artisan Cafe',
      transferPrice: '3.250.000 TL',
      monthlyRent: '45.000 TL',
      monthlyRevenue: '320.000 TL',
      profitMargin: '%28',
      businessAge: '4 Yıl',
      employeeCount: '5 Çalışan',
      contactName: 'İşletme Sahibi Temsilcisi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'isletme-devri',
    title: 'Trendyol ve Hepsiburada’da 4.8 Puanlı Aktif E-Ticaret Kozmetik Markası Devri',
    shortDescription: 'Yıllık 4.2M TL cirolu, tescilli markası, tedarikçi anlaşmaları ve 18.000 müşteri veritabanı ile anahtar teslim.',
    longDescription: 'Cilt bakım ve saç bakım kategorilerinde en çok satanlar listesinde yer alan tescilli e-ticaret markamız, şirket hisseleri veya marka varlığı olarak devredilecektir. Depo stoğu fiyata dahildir.',
    city: 'İstanbul',
    district: 'Şişli',
    industry: 'E-Ticaret & Kozmetik',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'GlowSkin E-Ticaret A.Ş.',
      transferPrice: '2.850.000 TL',
      monthlyRevenue: '380.000 TL',
      profitMargin: '%32',
      businessAge: '3 Yıl',
      contactName: 'GlowSkin Devir Masası',
    },
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'isletme-devri',
    title: 'Levent Plazalar Bölgesinde 8 Yıllık Müşteri Portföylü Güzellik ve Estetik Merkezi',
    shortDescription: 'Metro çıkışında, 6 uygulama odalı, medikal cihazları tam ruhsatlı estetik kliniği devri.',
    longDescription: 'Plazalar bölgesinde 8 yıldır aktif, 3.800+ kayıtlı kurumsal danışanı olan klinik. FDA onaylı lazer ve cilt bakım cihazları eksiksiz devredilecektir.',
    city: 'İstanbul',
    district: 'Beşiktaş',
    industry: 'Sağlık & Güzellik',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'Levent Estetik & Wellness',
      transferPrice: '4.750.000 TL',
      monthlyRent: '70.000 TL',
      monthlyRevenue: '580.000 TL',
      profitMargin: '%35',
      businessAge: '8 Yıl',
      contactName: 'Klinik Yönetimi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'isletme-devri',
    title: 'Ataşehir’de Kurulu MEB Ruhsatlı Özel Anaokulu ve Gündüz Bakımevi Kompleksi',
    shortDescription: '85 öğrenci kapasiteli, geniş bahçeli, villa tipi müstakil binada %92 doluluk oranlı anaokulu devri.',
    longDescription: 'Ataşehir Batı bölgesinde villa tipi binada 5 yıldır aralıksız hizmet veren, kayıtları dolu, veli memnuniyeti yüksek prestijli anaokulu.',
    city: 'İstanbul',
    district: 'Ataşehir',
    industry: 'Eğitim',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'Arı Dünyası Anaokulu',
      transferPrice: '5.500.000 TL',
      monthlyRent: '90.000 TL',
      monthlyRevenue: '780.000 TL',
      profitMargin: '%30',
      businessAge: '5 Yıl',
      contactName: 'Kurucu Temsilcisi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'isletme-devri',
    title: 'Beşiktaş Çarşıda Aktif Çalışan E-Ticaret Lojistik ve Kargo Dağıtım Acentesi',
    shortDescription: 'Günlük 750+ paket işlem hacimli, 2 hafif ticari aracı ve kurumsal sözleşmeleriyle anahtar teslim devir.',
    longDescription: 'Beşiktaş merkezde ana artere yakın konumda, 4 personeli ve oturmuş bölgesel dağıtım hacmi ile düzenli kar üreten kargo acentesi.',
    city: 'İstanbul',
    district: 'Beşiktaş',
    industry: 'Lojistik & Kargo',
    remotePolicy: 'onsite',
    customFields: {
      businessName: 'Beşiktaş Lojistik Acentesi',
      transferPrice: '2.100.000 TL',
      monthlyRent: '38.000 TL',
      monthlyRevenue: '460.000 TL',
      profitMargin: '%22',
      businessAge: '3 Yıl',
      contactName: 'Acente Sahibi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80',
  },

  // =========================================================================
  // 6. İŞE ALIYORUM / İŞVEREN (ise-al) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'ise-al',
    title: 'Senior Full-Stack Developer (Next.js & Node.js / TypeScript)',
    shortDescription: 'Global B2B SaaS platformumuzun çekirdek mimarisini yönetecek, mikroservis deneyimli yazılım mühendisi arıyoruz.',
    longDescription: 'Yüksek trafikli SaaS ürünümüzde ölçeklenebilir backend servisleri ve modern frontend arayüzleri geliştirecek; PostgreSQL, Redis, Next.js ve AWS teknolojilerinde en az 4 yıl deneyimli ekip arkadaşı arıyoruz.',
    city: 'İstanbul',
    district: 'Maslak',
    industry: 'Yazılım Teknolojileri',
    remotePolicy: 'remote',
    customFields: {
      companyName: 'ScaleTech Global SaaS',
      position: 'Senior Full-Stack Developer',
      salaryRange: '95.000 - 130.000 TL',
      employmentType: 'Tam Zamanlı',
      experienceLevel: '4+ Yıl',
      techStack: 'TypeScript, Next.js, Node.js, PostgreSQL, Docker, AWS',
      contactName: 'ScaleTech İK Direktörlüğü',
    },
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'ise-al',
    title: 'Yapay Zeka ve Makine Öğrenimi Mühendisi (NLP & LLM Odaklı)',
    shortDescription: 'Büyük dil modellerini kurumsal verilerle özelleştirecek (RAG & Fine-Tuning) AI Engineer aranıyor.',
    longDescription: 'Python, PyTorch, LangChain ve vektör veritabanları ile kurumsal yapay zeka asistanları geliştirecek deneyimli makine öğrenimi mühendisi arayışımız bulunmaktadır.',
    city: 'Ankara',
    district: 'ODTÜ Teknokent',
    industry: 'Yapay Zeka & Veri Bilimi',
    remotePolicy: 'hybrid',
    customFields: {
      companyName: 'CognitiveLabs AI',
      position: 'Machine Learning Engineer',
      salaryRange: '110.000 - 150.000 TL',
      employmentType: 'Tam Zamanlı',
      experienceLevel: '3+ Yıl',
      contactName: 'CognitiveLabs Talent Team',
    },
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'ise-al',
    title: 'Kıdemli Performans Pazarlama ve Büyüme Lideri (Growth Lead)',
    shortDescription: 'Aylık 2M+ TL reklam bütçesini yönetecek, CAC düşürüp LTV artıracak veri odaklı pazarlama lideri.',
    longDescription: 'Meta Ads, Google Ads ve TikTok reklamlarında ileri düzey optimizasyon, A/B testi ve funnel analitiği yapabilen büyüme lideri arıyoruz.',
    city: 'İstanbul',
    district: 'Levent',
    industry: 'Dijital Pazarlama & E-Ticaret',
    remotePolicy: 'remote',
    customFields: {
      companyName: 'HyperGrowth Media Group',
      position: 'Head of Growth',
      salaryRange: '85.000 - 120.000 TL + Prim',
      employmentType: 'Tam Zamanlı',
      contactName: 'HyperGrowth İnsan Kaynakları',
    },
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'ise-al',
    title: 'Kıdemli UI/UX ve Ürün Tasarımcısı (Figma & Design Systems)',
    shortDescription: 'Fintech ve mobil uygulamalarımız için kullanıcı dostu, modern arayüzler ve mikro-etkileşimler tasarlayacak Product Designer.',
    longDescription: 'Kullanıcı araştırması, wireframe, interaktif prototip ve tasarım sistemi dokümantasyonunu uçtan uca yürütecek kreatif ürün tasarımcısı.',
    city: 'İzmir',
    district: 'Bayraklı',
    industry: 'Tasarım & UI/UX',
    remotePolicy: 'remote',
    customFields: {
      companyName: 'PixelStudio Digital',
      position: 'Senior Product Designer',
      salaryRange: '75.000 - 105.000 TL',
      employmentType: 'Tam Zamanlı',
      contactName: 'PixelStudio Tasarım Ekibi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'ise-al',
    title: 'Kurumsal B2B Satış Yöneticisi (Account Executive)',
    shortDescription: 'SaaS yazılım çözümlerimizi orta ve büyük ölçekli şirketlere tanıtacak, satış döngüsünü yönetecek yönetici.',
    longDescription: 'B2B teknoloji satışında en az 3 yıl deneyimli, sunum ve müzakere kabiliyeti yüksek kurumsal satış uzmanı arıyoruz.',
    city: 'İstanbul',
    district: 'Ataşehir',
    industry: 'Kurumsal Satış',
    remotePolicy: 'hybrid',
    customFields: {
      companyName: 'CloudCorp Enterprise Solutions',
      position: 'B2B Account Executive',
      salaryRange: '60.000 - 85.000 TL + Satış Primi',
      employmentType: 'Tam Zamanlı',
      contactName: 'CloudCorp Satış Masası',
    },
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=700&q=80',
  },

  // =========================================================================
  // 7. İŞ ARIYORUM / ADAYLAR (is-bul) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'is-bul',
    title: 'Senior Cloud & DevOps Mühendisi (AWS, Kubernetes, Terraform)',
    shortDescription: '6+ yıl deneyimli DevOps mühendisi; CI/CD pipeline, konteyner orkestrasyonu ve bulut maliyet optimizasyonu sunar.',
    longDescription: 'Yüksek erişilebilirlikli mikroservis mimarileri, multi-cloud stratejileri ve güvenlik otomasyonlarında kanıtlanmış başarıya sahip uzman mühendis tam zamanlı veya kontratlı roller aramaktadır.',
    city: 'İstanbul',
    district: 'Kadıköy',
    industry: 'DevOps & Bulut Bilişim',
    remotePolicy: 'remote',
    customFields: {
      candidateTitle: 'Kıdemli DevOps & Bulut Mimarı',
      expectedSalary: '115.000 TL / Ay',
      skills: 'AWS, Kubernetes, Docker, Terraform, GitHub Actions, Prometheus, Grafana',
      experienceYears: '6+ Yıl',
      contactName: 'Kıdemli DevOps Mühendisi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'is-bul',
    title: 'Kıdemli Mobil Uygulama Geliştirici (Flutter & iOS Swift)',
    shortDescription: '10+ yayınlanmış mağaza uygulaması referanslı, temiz kod ve performans odaklı mobil yazılımcı.',
    longDescription: 'Fintech, e-ticaret ve sağlık alanında sıfırdan mobil uygulama geliştirme, native modül entegrasyonu ve App Store / Play Store optimizasyonu deneyimi.',
    city: 'Ankara',
    district: 'Çankaya',
    industry: 'Mobil Yazılım',
    remotePolicy: 'remote',
    customFields: {
      candidateTitle: 'Senior Mobile Engineer',
      expectedSalary: '90.000 TL / Ay',
      skills: 'Flutter, Dart, Swift, REST API, Firebase, In-App Purchase',
      experienceYears: '5 Yıl',
      contactName: 'Kıdemli Mobil Geliştirici',
    },
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'is-bul',
    title: 'Veri Analisti ve İş Zekası Uzmanı (SQL, Power BI, Python)',
    shortDescription: 'Karmaşık iş verilerini anlamlı panolara ve gelir artıran içgörülere dönüştüren analitik uzmanı.',
    longDescription: 'Büyük veri setleri üzerinden kohort analizi, kullanıcı churn tahmini ve yönetim dashboardları oluşturma konusunda tecrübeli veri analisti.',
    city: 'İzmir',
    district: 'Bornova',
    industry: 'Veri Analitiği & İş Zekası',
    remotePolicy: 'remote',
    customFields: {
      candidateTitle: 'Data Analyst & BI Specialist',
      expectedSalary: '70.000 TL / Ay',
      skills: 'SQL, Python, Power BI, Tableau, Google Analytics 4, ETL',
      experienceYears: '4 Yıl',
      contactName: 'Veri Analisti',
    },
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'is-bul',
    title: 'Büyüme Odaklı İçerik ve Sosyal Medya Stratejisti',
    shortDescription: 'B2B ve B2C markalar için viral Reels/TikTok video üretimi, LinkedIn liderliği ve SEO uyumlu metin yazarlığı.',
    longDescription: 'Teknoloji girişimleri ve e-ticaret markaları için 0’dan topluluk oluşturma, video kurgu ve marka dili konumlandırması yapan yaratıcı içerik üreticisi.',
    city: 'İstanbul',
    district: 'Beşiktaş',
    industry: 'Sosyal Medya & İçerik',
    remotePolicy: 'remote',
    customFields: {
      candidateTitle: 'Content & Social Media Strategist',
      expectedSalary: '55.000 TL / Ay',
      skills: 'CapCut, Premiere Pro, SEO Copywriting, LinkedIn B2B, Community Building',
      experienceYears: '3 Yıl',
      contactName: 'İçerik Stratejisti',
    },
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'is-bul',
    title: 'Kıdemli Frontend Geliştirici (React, Next.js, Tailwind CSS)',
    shortDescription: 'Piksel hassasiyetinde modern UI kodlayan, web performans ve Core Web Vitals optimizasyonunda uzman.',
    longDescription: 'Design system kütüphanelerini kodlayan, SSR/SSG altyapılarını yöneten ve erişilebilirlik standartlarına uygun arayüzler üreten frontend mühendisi.',
    city: 'Bursa',
    district: 'Nilüfer',
    industry: 'Frontend Yazılım',
    remotePolicy: 'remote',
    customFields: {
      candidateTitle: 'Senior Frontend Developer',
      expectedSalary: '85.000 TL / Ay',
      skills: 'React, Next.js, TypeScript, Tailwind CSS, Zustand, GraphQL',
      experienceYears: '5 Yıl',
      contactName: 'Kıdemli Frontend Mühendisi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=700&q=80',
  },

  // =========================================================================
  // 8. HİZMETLER & DANIŞMANLIK (hizmetler) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'hizmetler',
    title: 'Girişimler ve Şirketler İçin Uçtan Uca Özel Yazılım ve SaaS Geliştirme',
    shortDescription: 'Fikrinizi 6-8 hafta içinde çalışan, ölçeklenebilir ve modern bir web/mobil SaaS ürününe dönüştürüyoruz.',
    longDescription: 'Yazılım mimarisi, UI/UX tasarımı, güvenli API entegrasyonları ve bulut sunucu kurulumunu anahtar teslim üstlenen deneyimli mühendislik ajansı.',
    city: 'İstanbul',
    district: 'Maslak',
    industry: 'Yazılım ve Teknoloji',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'CodeCraft Software Studio',
      servicePricing: '120.000 TL’den Başlayan Paketler',
      serviceScope: 'MVP Geliştirme, SaaS Mimarisi, Mobil Uygulama, API',
      deliveryTime: '4 - 8 Hafta',
      contactName: 'CodeCraft Proje Yönetimi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'hizmetler',
    title: 'Girişim Hukuku, Yatırım Sözleşmeleri ve KVKK Uyum Danışmanlığı',
    shortDescription: 'SAFE sözleşmeleri, hissedarlar sözleşmesi (SHA) ve şirket kuruluş işlemlerinde uzman hukuk bürosu.',
    longDescription: 'Teknoloji şirketlerinin tohum ve Seri A yatırım turlarında hukuki durum tespiti (Due Diligence), fikri mülkiyet koruması ve sözleşme müzakereleri hizmeti.',
    city: 'İstanbul',
    district: 'Levent',
    industry: 'Hukuk & Danışmanlık',
    remotePolicy: 'hybrid',
    customFields: {
      businessName: 'Vekil & Ortakları Hukuk Bürosu',
      servicePricing: 'Aylık Danışmanlık veya Proje Bazlı',
      serviceScope: 'Şirket Kuruluşu, Yatırım Sözleşmeleri, KVKK, Marka Tescil',
      contactName: 'Kurumsal Hukuk Departmanı',
    },
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'hizmetler',
    title: 'Teknoloji Şirketleri İçin Mali Müşavirlik, Teknokent ve Ar-Ge Bordro Yönetimi',
    shortDescription: 'Vergi teşvikleri, Teknokent muafiyetleri ve KOSGEB/TÜBİTAK hibe muhasebe süreçlerinde uzman mali danışmanlık.',
    longDescription: 'Startupların finansal raporlama, e-defter ve vergi optimizasyonu süreçlerini dijital ve hatasız yönetiyoruz.',
    city: 'Ankara',
    district: 'Bilkent Cyberpark',
    industry: 'Mali Müşavirlik & Finans',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'Vizyon Mali Müşavirlik & Denetim',
      servicePricing: 'Aylık Düzenli Hizmet Paketi',
      contactName: 'Mali Müşavirlik Masası',
    },
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'hizmetler',
    title: 'Kurumsal Kimlik, Logo ve Marka Konumlandırma Tasarım Paketi',
    shortDescription: 'Yatırımcı sunumu (Pitch Deck), logo, renk paleti ve tipografi rehberi ile markanızı global standartlara taşıyın.',
    longDescription: '30+ başarılı startup markalamasına imza atmış kreatif ekibimizle profesyonel görsel kimlik çözümleri.',
    city: 'İzmir',
    district: 'Alsancak',
    industry: 'Tasarım & Kreatif',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'BrandLab Creative Agency',
      servicePricing: '45.000 TL Sabit Paket',
      contactName: 'BrandLab Kreatif Direktör',
    },
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'hizmetler',
    title: 'Siber Güvenlik Sızma Testi (Pentest) ve Sunucu Güvenlik Denetimi',
    shortDescription: 'TSE belgeli etik hacker kadromuzla web, mobil ve API sistemlerinizdeki güvenlik açıklarını tespit edip kapatıyoruz.',
    longDescription: 'ISO 27001 ve KVKK uyumlu detaylı sızma testi raporu ve çözüm rehberliği.',
    city: 'İstanbul',
    district: 'Ümraniye',
    industry: 'Siber Güvenlik',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'CyberShield Güvenlik Çözümleri',
      servicePricing: 'Proje Bazlı Fiyatlandırma',
      contactName: 'CyberShield Operasyon Merkezi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=700&q=80',
  },

  // =========================================================================
  // 9. DİJİTAL VE AI ÇÖZÜMLERİ (dijital-ai) - 5 İlan
  // =========================================================================
  {
    categorySlug: 'dijital-ai',
    title: 'Yapay Zeka Destekli Otomatik Müşteri Destek ve Canlı Sohbet Botu',
    shortDescription: 'Web sitenize 5 dakikada entegre olan, şirket dökümanlarınızı öğrenip 7/24 müşteri yanıtlayan akıllı AI asistanı.',
    longDescription: 'WhatsApp, Web ve Instagram DM kanallarına tam entegre, insan müdahalesine gerek kalmadan %82 müşteri sorununu anında çözen yeni nesil SaaS platformu.',
    city: 'İstanbul',
    district: 'Maslak',
    industry: 'Yapay Zeka & Müşteri Hizmetleri',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'BotAssist AI SaaS',
      productTier: '14 Gün Ücretsiz Deneme · Sonra 890 TL/Ay',
      features: 'WhatsApp Entegrasyonu, Çoklu Dil Desteği, CRM Bağlantısı',
      contactName: 'BotAssist Satış Ekibi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'dijital-ai',
    title: 'E-Ticaret İçin Otomatik SEO ve AI Ürün Açıklaması Üretici',
    shortDescription: 'Binlerce ürünün başlık ve SEO açıklamalarını Google uyumlu şekilde saniyeler içinde oluşturan yapay zeka aracı.',
    longDescription: 'Shopify, Ticimax ve WooCommerce mağazaları için tek tıkla ürün fotoğraflarını analiz edip yüksek dönüşümlü satış metinleri üreten platform.',
    city: 'Ankara',
    district: 'Çankaya',
    industry: 'E-Ticaret & Yapay Zeka',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'ContentGenie AI',
      productTier: 'Aylık 1.250 TL',
      contactName: 'ContentGenie Ekibi',
    },
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'dijital-ai',
    title: 'Yapay Zeka Destekli Video Kurgu ve Otomatik Altyazı Yazılımı',
    shortDescription: 'Uzun videolarınızı dikey formatta viral Shorts ve Reels kliplerine dönüştüren yapay zeka video aracı.',
    longDescription: 'Sosyal medya üreticileri ve pazarlama ekipleri için ses tanıma, animasyonlu altyazı ve b-roll ekleme işlemlerini otomatikleştiren yerli AI çözümü.',
    city: 'İstanbul',
    district: 'Kadıköy',
    industry: 'Video & Medya Teknolojileri',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'ClipMagic AI Studio',
      productTier: 'Aylık 650 TL',
      contactName: 'ClipMagic Ürün Masası',
    },
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'dijital-ai',
    title: 'Toplantı Ses Kayıtlarını Özetleyen ve Göreve Dönüştüren AI Not Asistanı',
    shortDescription: 'Google Meet ve Zoom toplantılarınızı dinleyip aksiyon kararlarını Trello/Jira’ya aktaran akıllı asistan.',
    longDescription: 'Türkçe konuşmaları %98 doğrulukla metne döken, toplantı özetini e-posta ile katılımcılara gönderen kurumsal verimlilik yazılımı.',
    city: 'İzmir',
    district: 'Konak',
    industry: 'Verimlilik & Kurumsal AI',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'MeetSummary AI',
      productTier: 'Kullanıcı Başına 350 TL/Ay',
      contactName: 'MeetSummary Kurumsal',
    },
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
  },
  {
    categorySlug: 'dijital-ai',
    title: 'Otomatik Kod İnceleme ve Güvenlik Zafiyeti Tespit Eden AI Eklentisi',
    shortDescription: 'GitHub pull requestlerindeki güvenlik açıklarını ve performans hatalarını tespit eden geliştirici asistanı.',
    longDescription: 'Yazılım ekipleri için kod kalitesini artıran, OWASP Top 10 açıklarını tarayan ve refactoring önerileri sunan AI DevOps çözümü.',
    city: 'Eskişehir',
    district: 'Tepebaşı',
    industry: 'Yazılım & Developer Tools',
    remotePolicy: 'remote',
    customFields: {
      businessName: 'CodeReviewer Pro AI',
      productTier: 'Açık Kaynak Projelere Ücretsiz · Takımlar İçin 1.800 TL/Ay',
      contactName: 'CodeReviewer Labs',
    },
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=700&q=80',
  },
];

export const EXCLUSIVE_MARKET_ADS = [
  {
    id: 'market-ad-1',
    title: 'iyzico ile Girişiminiz İçin Güvenli ve Hızlı Ödeme Altyapısı',
    description: 'Tüm kredi kartlarından tek tıkla ödeme alın, ertesi gün hesabınıza geçsin. Girişimbee üyelerine özel komisyon avantajı.',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=500&fit=crop&q=80',
    linkUrl: '/reklam',
    ctaLabel: 'Çözümü İncele',
    sortOrder: 1,
    status: 'published',
  },
  {
    id: 'market-ad-2',
    title: 'AWS Cloud & Yapay Zeka Girişimlerine 5.000$ Bulut Kredisi',
    description: 'Ölçeklenebilir sunucu, GPU altyapısı ve teknik mimari mentorluğu ile girişiminizi AWS üzerinde hızla büyütün.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop&q=80',
    linkUrl: '/reklam',
    ctaLabel: 'Fırsatı Keşfet',
    sortOrder: 2,
    status: 'published',
  },
  {
    id: 'market-ad-3',
    title: 'GrowthBee ile B2B ve E-Ticaret Büyüme & Reklam Çözümleri',
    description: 'Yüksek bütçeli Meta ve Google Ads kampanyalarınızı ROAS odaklı yönetin. Kurumsal performans pazarlama iş birliği.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&q=80',
    linkUrl: '/reklam',
    ctaLabel: 'Detaylara Bak',
    sortOrder: 3,
    status: 'published',
  },
  {
    id: 'market-ad-4',
    title: 'LegalTech ile Otomatik Hissedar ve Yatırım Sözleşmeleri Paketi',
    description: 'Girişimler için standart SAFE, Gizlilik (NDA) ve Ortaklık sözleşmelerini avukat onaylı şablonlarla dakikalar içinde hazırlayın.',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&h=500&fit=crop&q=80',
    linkUrl: '/reklam',
    ctaLabel: 'Paketi İncele',
    sortOrder: 4,
    status: 'published',
  },
];

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
    .slice(0, 50);
  return `${base || 'ilan'}-${index}`;
}

async function main() {
  console.log('🚀 Starting Full Database Purge and Reseed with 45 Exclusive Realistic Listings...');

  // 1. Resolve owner_id
  let ownerId = null;
  const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 20 });
  const users = usersData?.users || [];
  if (users.length > 0) {
    ownerId = users[0].id;
  }

  if (!ownerId) {
    console.error('❌ No user found in Supabase auth to assign owner_id');
    process.exit(1);
  }
  console.log('✅ Resolved owner_id:', ownerId);

  // 2. Fetch all category IDs
  const { data: categories, error: catErr } = await supabase
    .from('marketplace_categories')
    .select('id, slug, name');

  if (catErr || !categories || categories.length === 0) {
    console.warn('⚠️ No marketplace_categories table data found, continuing...');
  }
  const categoryMap = new Map((categories || []).map((c) => [c.slug, c.id]));

  // 3. Purge all dependent tables
  console.log('🧹 Purging messages, conversations, contact requests, applications, and old listings...');
  await supabase.from('marketplace_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('marketplace_conversation_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('marketplace_conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('marketplace_contact_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('marketplace_applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('marketplace_saved_listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('marketplace_listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('market_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('✅ Purge complete.');

  // 4. Insert 45 Exclusive Realistic Listings
  console.log(`📦 Inserting ${EXCLUSIVE_LISTINGS_DATA.length} realistic listings across 9 categories...`);
  const now = Date.now();
  const listingRows = EXCLUSIVE_LISTINGS_DATA.map((item, index) => {
    const categoryId = categoryMap.get(item.categorySlug) || null;
    const publishedAt = new Date(now - index * 3600000 * 6).toISOString();

    return {
      id: randomUUID(),
      slug: slugify(item.title, index + 1),
      owner_id: ownerId,
      category_id: categoryId,
      title: item.title,
      short_description: item.shortDescription,
      long_description: item.longDescription,
      city: item.city,
      district: item.district,
      industry: item.industry,
      country: 'TR',
      remote_policy: item.remotePolicy || 'onsite',
      status: 'published',
      workflow_status: 'published',
      is_featured: index % 3 === 0,
      is_urgent: index % 5 === 0,
      is_verified: true,
      view_count: 180 + index * 24,
      application_count: 2 + (index % 7),
      custom_fields: item.customFields,
      cover_url: item.imageUrl,
      published_at: publishedAt,
      created_at: publishedAt,
      updated_at: publishedAt,
    };
  });

  const { data: insertedListings, error: insErr } = await supabase
    .from('marketplace_listings')
    .insert(listingRows)
    .select('id, title, slug');

  if (insErr) {
    console.error('❌ Error inserting listings:', insErr);
  } else {
    console.log(`✅ Successfully seeded ${insertedListings?.length || 0} listings in Supabase!`);
  }

  // 5. Insert Market Ads
  console.log('📢 Inserting 4 Corporate Market Ads & Solutions...');
  const adRows = EXCLUSIVE_MARKET_ADS.map((ad, i) => ({
    id: randomUUID(),
    title: ad.title,
    description: ad.description,
    image_url: ad.imageUrl,
    link_url: ad.linkUrl,
    cta_label: ad.ctaLabel,
    sort_order: ad.sortOrder,
    status: ad.status,
    published_at: new Date(now - i * 3600000).toISOString(),
    created_at: new Date(now - i * 3600000).toISOString(),
    updated_at: new Date(now - i * 3600000).toISOString(),
  }));

  const { error: adErr } = await supabase.from('market_items').insert(adRows);
  if (adErr) {
    console.warn('⚠️ Market items table insert note:', adErr.message);
  } else {
    console.log('✅ Successfully seeded Market Ads in Supabase!');
  }

  console.log('🎉 RESEED PROCESS COMPLETE!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
