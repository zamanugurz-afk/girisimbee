'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
  Layers,
  Rocket,
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
        title: 'Yapay Zeka Destekli Sahtecilik Koruması',
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
        desc: 'Girişimbee özel başvuru formunu doldurun.',
      },
      {
        step: '02',
        title: 'Evrak Onayı & Entegrasyon',
        desc: 'Kurumsal evraklarınız 2 saat içinde incelenir.',
      },
      {
        step: '03',
        title: 'Ödeme Almaya Başlayın',
        desc: 'Hazır modüller veya REST API ile tahsilata başlayın.',
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
        desc: 'LLM modelleri ve derin öğrenme eğitimi için yüksek performanslı NVIDIA GPU bulut sunucuları.',
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
        desc: 'Destek ekibimizle iletişime geçerek referans kodunuzu talep edin.',
      },
      {
        step: '02',
        title: 'AWS Activate Formunu Doldurun',
        desc: 'AWS panelinizde kodunuzu girerek başvurunuzu tamamlayın.',
      },
      {
        step: '03',
        title: 'Kredileriniz Hesabınızda',
        desc: 'Başvurunuz 48 saat içinde onaylanarak hesabınıza yüklenir.',
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
        desc: 'Web sitenizi ve reklam hesaplarınızı incelememiz için iletişime geçin.',
      },
      {
        step: '02',
        title: 'Strateji ve Büyüme Planı',
        desc: 'Hedef kitlenize uygun 3 aylık büyüme yol haritasını hazırlayalım.',
      },
      {
        step: '03',
        title: 'Kampanyaları Başlatın',
        desc: 'Kreatifler ve reklam setleri yayına alınarak optimize edilsin.',
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
        title: 'Gizlilik (NDA) ve Kurucu Ortaklık',
        desc: 'Hissedar hakları, vesting süreleri ve fikri mülkiyet devir maddelerini güvenceye alın.',
      },
      {
        title: 'KVKK ve Açık Rıza Uyum Dokümanları',
        desc: 'Web siteniz ve uygulamanız için yasal zorunlulukları karşılayan eksiksiz paket.',
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
        title: 'Avukat Onaylı İndirin',
        desc: 'Hukuk ekibimiz tarafından son kontrolü yapılan sözleşmeniz imzaya hazır.',
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
    <main className="gc-header-offset relative min-h-screen min-w-0 overflow-x-hidden bg-[#FAFBFC] dark:bg-zinc-950 py-4 sm:py-6">
      <div className="relative mx-auto min-w-0 max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* ÜST BREADCRUMB & GERİ DÖN NAVİGASYONU                                    */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" aria-hidden />
            <span>Girişimbee MARKET’e dön</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
            <Sparkles className="w-3 h-3 fill-current" />
            Seçili Çözüm & İş Birliği
          </span>
        </div>

        {/* ========================================================================= */}
        {/* ANA ÇÖZÜM KARTI (TEK SAYFA GÖRÜNÜRLÜĞÜ & 2 SÜTUNLU DİKEY AYRIM ÇİZGİSİ)   */}
        {/* ========================================================================= */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
          
          {/* 1. ÜST HERO GÖRSEL BANNER */}
          <div className="relative w-full h-[150px] sm:h-[185px] bg-slate-950 overflow-hidden">
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
                <Store className="h-10 w-10 opacity-30" aria-hidden />
              </div>
            )}
            
            {/* Güçlü Karartma Gradyanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-black/35 pointer-events-none" />

            {/* Banner Rozetleri */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black tracking-wide shadow-md">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                SEÇİLİ FIRSAT
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Doğrulanmış Partner
              </span>
            </div>

            {/* Banner İçi Başlık Başlığı */}
            <div className="absolute bottom-3.5 left-4 sm:left-6 right-4 sm:right-6 text-white z-10">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                {detailConfig.partnerName} · {detailConfig.badge}
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight truncate">
                {item.title}
              </h1>
            </div>
          </div>

          {/* 2. ÖZEL TEKLİF BANNERİ */}
          <div className="mx-4 sm:mx-6 mt-4 p-3 sm:p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shrink-0 shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-snug">
                <strong className="text-slate-900 dark:text-amber-300 font-bold">Girişimbee Üyelerine Özel:</strong> {detailConfig.specialOffer}
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. DİKEY AYRIM ÇİZGİLİ 2 SÜTUNLU GÖVDE                                    */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800 p-4 sm:p-6 gap-y-6 lg:gap-y-0">
            
            {/* SOL SÜTUN: ÇÖZÜM HAKKINDA & ÖNE ÇIKAN AVANTAJLAR */}
            <div className="lg:pr-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Çözüm Hakkında</h3>
                </div>
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-zinc-300 pl-3 border-l-2 border-amber-400">
                  {item.description}
                </p>
                <p className="text-[12px] text-slate-600 dark:text-zinc-400 pl-3">
                  {detailConfig.heroTagline}
                </p>
              </div>

              {/* Avantajlar Grid */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Öne Çıkan Avantajlar</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {detailConfig.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{feat.title}</span>
                      </div>
                      <p className="text-[11.5px] text-slate-600 dark:text-zinc-400 leading-snug">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SAĞ SÜTUN: NASIL YARARLANIRIM ADIMLARI & DESTEK */}
            <div className="lg:pl-6 space-y-5">
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-amber-500" />
                  <span>Nasıl Yararlanırım? (İşlem Adımları)</span>
                </h3>

                <div className="space-y-2">
                  {detailConfig.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex items-start gap-2.5"
                    >
                      <span className="text-xs font-black text-amber-500 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                        {step.step}
                      </span>
                      <div className="text-[11.5px] leading-snug">
                        <strong className="text-slate-900 dark:text-white">{step.title}:</strong> {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kurumsal Güvence */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Doğrulanmış Partner Güvencesi</span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                  Tüm partnerler Girişimbee kalite ve güvenlik standartlarından geçirilmiştir. Talepler doğrudan kurumsal temsilciye aktarılır.
                </p>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 4. ALT AKSİYON BUTONLARI                                                 */}
          {/* ========================================================================= */}
          <div className="border-t border-slate-200/90 dark:border-zinc-800 p-4 sm:p-5 bg-slate-50/60 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong className="text-slate-800 dark:text-zinc-200">Güvenli Başvuru:</strong> Talebiniz doğrudan yetkili temsilciye iletilir.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp ile Bilgi Al</span>
              </a>

              {detailConfig.externalLink ? (
                <a
                  href={detailConfig.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <span>Web Sitesine Git</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <a
                  href={`mailto:${detailConfig.contactEmail}?subject=${encodeURIComponent(item.title)}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>E-Posta ile Teklif İste</span>
                </a>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

export default MarketAdDetailView;
