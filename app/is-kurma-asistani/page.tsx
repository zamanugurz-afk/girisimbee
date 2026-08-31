import { Metadata } from 'next';
import { HomeBusinessSetupAssistantSection } from '@/components/girisimco/home/HomeBusinessSetupAssistantSection';
import { Sparkles, ArrowLeft, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'İş Kurma Asistanı | Akıllı Kurulum, Demirbaş & Bütçe Robotu | Girişimbee',
  description: 'Türkiye\'nin 81 ilinde ve tüm sektörlerde; dükkan kirası, zorunlu demirbaşlar, yasal asgari sermaye şartları, personel SGK bordrosu ve başabaş fizibilite bütçenizi saniyeler içinde simüle edin.',
  keywords: [
    'iş kurma asistanı',
    'iş kurma maliyeti hesaplama',
    'eczane açma maliyeti',
    'kafe açma maliyeti',
    'market açma bütçesi',
    'sigorta acentesi sermaye şartı 2026',
    'oto ekspertiz açma maliyeti',
    'fizibilite raporu',
    'girişimbee',
  ],
};

export default function BusinessSetupAssistantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-8 sm:py-12">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Üst Navigasyon & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2026 Güncel Sektörel Mevzuat Entegre</span>
          </div>
        </div>

        {/* Ana Asistan Kokpiti */}
        <HomeBusinessSetupAssistantSection />

        {/* Alt Bilgilendirme Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-[1280px] mx-auto">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
              <CheckCircle2 className="w-4 h-4 text-amber-500" />
              <span>Gerçekçi Ticari Rayiçler</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              TÜİK, Sanayi ve Ticaret Odaları ile ilçe bazlı ticari gayrimenkul m² kira endeksleriyle hesaplama yapılır.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>2026 Mevzuat & Sermaye Şartı</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              SEDDK, TEB, TSE, Sağlık Bakanlığı ve Meslek Odalarının en güncel yasal kuruluş gereksinimleri yer alır.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Girişimbee Pazar Entegrasyonu</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              İhtiyaç duyduğunuz demirbaş, usta ve devren işletmeleri Girişimbee Pazar üzerinden doğrudan temin edebilirsiniz.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
