'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from 'lucide-react';
import type { MarketItem } from '@/features/admin/market/types/market.types';
import { cn } from '@/lib/utils';

interface SolutionDetailConfig {
  partnerName: string;
  badge: string;
  heroTagline: string;
  features: Array<{ title: string; desc: string }>;
  steps: Array<{ step: string; title: string; desc: string }>;
  specialOffer: string;
  contactEmail: string;
  contactWhatsapp: string;
  externalLink?: string;
}

const SOLUTION_DETAILS: Record<string, SolutionDetailConfig> = {
  'market-ad-1': {
    partnerName: 'iyzico PaySwitch',
    badge: 'Resmi Ödeme Altyapısı Partneri',
    heroTagline: 'Girişiminize özel komisyon oranları ve ertesi gün nakit akışı ile ödeme almaya başlayın.',
    specialOffer: 'Girişimbee girişimcilerine özel %1.49’dan başlayan komisyon oranları ve 0 TL sanal POS açılış bedeli.',
    features: [
      {
        title: 'Ertesi Gün Nakit Transferi',
        desc: 'Satışlarınızdan elde edilen tahsilatlar beklemeden, ertesi iş günü doğrudan şirket banka hesabınıza aktarılır.',
      },
      {
        title: 'Tek Tıkla Ödeme & iyzico ile Öde',
        desc: '3 milyondan fazla kayıtlı iyzico kullanıcısına şifresiz ve kart girmeden hızlı ödeme deneyimi sunun.',
      },
      {
        title: 'Yapay Zeka Destekli Sahtecilik (Fraud) Koruması',
        desc: 'Gelişmiş makine öğrenimi filtreleri ile şüpheli işlemleri ve ters ibraz (chargeback) risklerini sıfıra indirin.',
      },
      {
        title: 'Abonelik ve Tekrarlayan Tahsilat',
        desc: 'SaaS ve abonelik bazlı projeleriniz için otomatik periyodik kart çekimi ve faturalandırma.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Hemen Başvuru Oluşturun',
        desc: 'Aşağıdaki bağlantı üzerinden Girişimbee özel başvuru formunu doldurun.',
      },
      {
        step: '02',
        title: 'Evrak Onayı & Entegrasyon',
        desc: 'Kurumsal evraklarınız 2 saat içinde incelenir ve API anahtarlarınız tanımlanır.',
      },
      {
        step: '03',
        title: 'Ödeme Almaya Başlayın',
        desc: 'Hazır e-ticaret modülleri veya REST API ile sitenizden tahsilata başlayın.',
      },
    ],
    contactEmail: 'reklam@girisimbee.com',
    contactWhatsapp: '+905321000000',
    externalLink: 'https://www.iyzico.com',
  },
  'market-ad-2': {
    partnerName: 'Amazon Web Services (AWS Activate)',
    badge: 'Bulut Altyapısı & AI Partneri',
    heroTagline: 'Girişiminizi dünya standartlarında AWS sunucuları ve GPU kümleri üzerinde ölçekleyin.',
    specialOffer: 'Girişimbee topluluğuna özel 5.000$ AWS Activate Bulut Kredisi + 1 Yıl Ücretsiz Teknik Destek.',
    features: [
      {
        title: '5.000$ AWS Bulut Kredisi',
        desc: 'EC2, S3, RDS, Lambda ve SageMaker servislerinde 2 yıl boyunca geçerli bulut fonlaması.',
      },
      {
        title: '1-1 Çözüm Mimarı Mentorluğu',
        desc: 'AWS Kıdemli Mühendisleri ile mimari inceleme ve maliyet optimizasyonu oturumları.',
      },
      {
        title: 'GPU ve Yapay Zeka Desteği',
        desc: 'LLM modelleri ve derin öğrenme eğitimi için yüksek performanslı NVIDIA A100/H100 bulut sunucuları.',
      },
      {
        title: 'Global Startup Ekosistemi Erişimi',
        desc: 'AWS Activate Console üzerinden 100+ kurumsal yazılımda %90’a varan partner indirimleri.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Girişimbee Kodunuzu Alın',
        desc: 'Destek ekibimizle iletişime geçerek topluluk referans kodunuzu talep edin.',
      },
      {
        step: '02',
        title: 'AWS Activate Formunu Doldurun',
        desc: 'AWS panelinizde kodunuzu girerek başvuru işlemini tamamlayın.',
      },
      {
        step: '03',
        title: 'Kredileriniz Hesabınızda',
        desc: 'Başvurunuz 48 saat içinde onaylanarak 5.000$ krediniz AWS hesabınıza yüklenir.',
      },
    ],
    contactEmail: 'reklam@girisimbee.com',
    contactWhatsapp: '+905321000000',
    externalLink: 'https://aws.amazon.com/activate/',
  },
  'market-ad-3': {
    partnerName: 'GrowthBee Büyüme Ajansı',
    badge: 'Performans Pazarlama & Büyüme Çözümü',
    heroTagline: 'B2B ve E-Ticaret girişimleri için ROAS odaklı büyüme ve dijital reklam stratejileri.',
    specialOffer: 'İlk reklam harcamanızda %20 ek bütçe desteği ve Ücretsiz Kapsamlı Funnel Analiz Raporu.',
    features: [
      {
        title: 'Meta & Google Ads Yönetimi',
        desc: 'Yüksek dönüşüm oranlı reklam kampanyaları, pixel kurulumu ve CAPI sunucu entegrasyonu.',
      },
      {
        title: 'Kreatif Video & UGC Reklam Üretimi',
        desc: 'TikTok ve Reels için yüksek tıklama oranına (CTR) sahip dikey video reklam içerikleri.',
      },
      {
        title: 'A/B Testleri & Açılış Sayfası Optimizasyonu',
        desc: 'Kullanıcı edinme maliyetlerini (CAC) düşüren veri odaklı landing page geliştirmeleri.',
      },
      {
        title: 'Canlı Büyüme Dashboard Paneli',
        desc: 'Tüm harcamalarınızı ve dönüşümlerinizi şeffaf bir şekilde takip edebileceğiniz özel pano.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Ücretsiz Analiz Talep Edin',
        desc: 'Web sitenizi ve mevcut reklam hesaplarınızı incelememiz için iletişime geçin.',
      },
      {
        step: '02',
        title: 'Strateji ve Büyüme Planı',
        desc: 'Hedef kitlenize ve bütçenize en uygun 3 aylık büyüme yol haritasını hazırlayalım.',
      },
      {
        step: '03',
        title: 'Kampanyaları Başlatın',
        desc: 'Kreatifler ve reklam setleri yayına alınarak optimize edilmeye başlasın.',
      },
    ],
    contactEmail: 'reklam@girisimbee.com',
    contactWhatsapp: '+905321000000',
  },
  'market-ad-4': {
    partnerName: 'LegalTech Hukuki Çözümler',
    badge: 'Girişim Hukuku & Sözleşme Çözümü',
    heroTagline: 'Startuplar için avukat onaylı yatırım ve ortaklık sözleşmelerini dakikalar içinde hazırlayın.',
    specialOffer: 'Girişimbee üyelerine özel Standart Startup Hukuk Paketi %35 indirimli.',
    features: [
      {
        title: 'Avukat Onaylı SAFE & SHA Sözleşmeleri',
        desc: 'Melek yatırımcı ve VC görüşmelerinizde kullanabileceğiniz regülasyon uyumlu şablonlar.',
      },
      {
        title: 'Gizlilik (NDA) ve Kurucu Ortaklık Protokolü',
        desc: 'Hissedar hakları, vesting süreleri ve fikri mülkiyet devir maddelerini güvence altına alın.',
      },
      {
        title: 'KVKK ve Açık Rıza Uyum Dokümanları',
        desc: 'Web siteniz ve mobil uygulamanız için yasal zorunlulukları karşılayan eksiksiz paket.',
      },
      {
        title: 'E-İmza & Güvenli Arşivleme',
        desc: 'Sözleşmelerinizi taraflarla dijital olarak imzalayın ve bulutta güvenle saklayın.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'İhtiyacınız Olan Paketi Seçin',
        desc: 'Yatırım, ortaklık veya KVKK paketlerinden girişiminize uygun olanı belirleyin.',
      },
      {
        step: '02',
        title: 'Bilgilerinizi Girin',
        desc: 'Otomatik form üzerinden şirket ve ortaklık detaylarınızı doldurun.',
      },
      {
        step: '03',
        title: 'Avukat İncelemeli Sözleşmenizi İndirin',
        desc: 'Hukuk ekibimiz tarafından son kontrolü yapılan sözleşmeniz imzaya hazır hale gelsin.',
      },
    ],
    contactEmail: 'reklam@girisimbee.com',
    contactWhatsapp: '+905321000000',
  },
};

export function MarketAdDetailView({ item }: { item: MarketItem }) {
  const detailConfig = SOLUTION_DETAILS[item.id] || {
    partnerName: 'Girişimbee Çözüm Partneri',
    badge: 'Doğrulanmış Kurumsal Çözüm',
    heroTagline: 'Girişiminizi büyütmek için doğrulanmış stratejik fırsat ve kurumsal çözüm.',
    specialOffer: 'Girişimbee üyelerine özel avantajlı iş birliği koşulları.',
    features: [
      {
        title: 'Doğrulanmış Kurumsal Hizmet',
        desc: 'Girişim ekosisteminin güvenilir partnerleri tarafından sunulan özel çözüm.',
      },
      {
        title: 'Özel Topluluk İndirimi',
        desc: 'Girişimbee kullanıcılarına sunulan avantajlı fiyatlandırma ve esnek koşullar.',
      },
    ],
    steps: [
      {
        step: '01',
        title: 'Talep Oluşturun',
        desc: 'İletişim kanallarımız üzerinden talebinizi iletin.',
      },
      {
        step: '02',
        title: 'Teklif Alın',
        desc: 'Girişiminize özel koşullarla teklifinizi hazırlayalım.',
      },
    ],
    contactEmail: 'reklam@girisimbee.com',
    contactWhatsapp: '+905321000000',
  };

  const whatsappUrl = `https://wa.me/${detailConfig.contactWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Merhaba, Girişimbee MARKET üzerinden "${item.title}" çözümü hakkında detaylı bilgi ve teklif almak istiyorum.`,
  )}`;

  return (
    <main className="gc-header-offset relative min-h-screen min-w-0 overflow-x-hidden bg-[#FAFBFC] dark:bg-zinc-950">
      <div className="relative mx-auto min-w-0 max-w-5xl px-5 py-6 lg:px-8 lg:py-10">
        
        {/* Geri Dön Butonu */}
        <div className="flex items-center justify-between">
          <Link
            href="/market"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 transition-colors hover:text-slate-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Girişimbee MARKET’e dön
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Seçili Çözüm & İş Birliği
          </span>
        </div>

        {/* Ana Çözüm Kartı */}
        <div className="mt-6 overflow-hidden rounded-[2.25rem] border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
          
          {/* Üst Büyük Görsel & Hero Banner */}
          <div className="relative w-full aspect-[16/8] sm:aspect-[21/9] bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover object-center"
                unoptimized
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Store className="h-14 w-14 opacity-40" aria-hidden />
              </div>
            )}
            
            {/* Karartma Gradyanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Banner Rozetleri */}
            <div className="absolute top-4 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wide shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                SEÇİLİ FIRSAT
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Doğrulanmış Partner
              </span>
            </div>

            {/* Banner İçi Başlık Başlığı */}
            <div className="absolute bottom-5 left-5 sm:left-8 right-5 sm:right-8 text-white">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                {detailConfig.partnerName} · {detailConfig.badge}
              </span>
              <h1 className="mt-1 text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {item.title}
              </h1>
            </div>
          </div>

          {/* Gövde Detay Alanı */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-8">
            
            {/* Özel Teklif Banneri */}
            <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 p-5 sm:p-6 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 shadow-sm">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="font-sans text-base sm:text-lg font-bold text-slate-900 dark:text-amber-300">
                  Girişimbee Üyelerine Özel Ayrıcalık
                </h3>
                <p className="mt-1 text-sm sm:text-[15px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {detailConfig.specialOffer}
                </p>
              </div>
            </div>

            {/* Çözüm Açıklaması */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Çözüm Hakkında</h3>
              <p className="text-[15px] sm:text-base leading-relaxed text-slate-600 dark:text-zinc-400">
                {item.description}
              </p>
              <p className="text-[15px] sm:text-base leading-relaxed text-slate-600 dark:text-zinc-400">
                {detailConfig.heroTagline}
              </p>
            </div>

            {/* Öne Çıkan Avantajlar Grid */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Öne Çıkan Avantajlar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {detailConfig.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{feat.title}</h4>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed pl-6">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nasıl Yararlanırım? (Adımlar) */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nasıl Yararlanırım?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {detailConfig.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 relative overflow-hidden"
                  >
                    <span className="text-2xl font-black text-amber-500/40 dark:text-amber-400/20 absolute top-3 right-3">
                      {step.step}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white relative z-10">{step.title}</h4>
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed relative z-10">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alt Aksiyon Butonları */}
            <div className="border-t border-slate-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Güvenli Başvuru:</span> Talebiniz doğrudan yetkili temsilciye iletilir.
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-3 shadow-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp ile Bilgi Al</span>
                </a>

                {detailConfig.externalLink ? (
                  <a
                    href={detailConfig.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-sm px-5 py-3 shadow-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                  >
                    <span>Resmi Web Sitesine Git</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href={`mailto:${detailConfig.contactEmail}?subject=${encodeURIComponent(item.title)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-sm px-5 py-3 shadow-md transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                  >
                    <Mail className="w-4 h-4" />
                    <span>E-Posta ile Teklif İste</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
