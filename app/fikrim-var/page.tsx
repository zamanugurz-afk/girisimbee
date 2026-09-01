import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Lightbulb, ShieldCheck, Coins } from 'lucide-react';
import { VentureBuilderWizard } from '@/components/girisimco/venture-builder/VentureBuilderWizard';

export const metadata = {
  title: 'Fikrim Var, Bütçem Yok | Girişim Modelleme & Yatırımcı Çağrısı',
  description:
    'İş fikrinizi, şahsi aracınızı, mekanınızı ve emeğinizi modelleyin; aradığınız başlangıç sermayesi ve ekipman için doğrulanmış melek yatırımcı bulun.',
};

export default function FikrimVarPage() {
  return (
    <div className="gc-header-offset min-w-0 overflow-x-hidden border-b border-[#EEF0F4] bg-[#FAFBFC] dark:border-border dark:bg-background">
      <div className="mx-auto min-w-0 max-w-[1280px] px-5 py-8 lg:px-8 lg:py-10">
        {/* Üst Geri Dön Bağlantısı */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/trend-fikirler"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 transition-colors hover:text-slate-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Trend Fikirlere Dön
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Girişim İnkübatörü
          </span>
        </div>

        {/* Başlık & Tanıtım Alanı */}
        <div className="mb-8 max-w-3xl">
          <p className="inline-flex items-center gap-1.5 font-display text-[13px] font-bold tracking-tight text-amber-600 dark:text-amber-400">
            <Lightbulb className="h-4 w-4 shrink-0" />
            Girişimbee Girişim Modelleme & Ortaklık Motoru
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl lg:text-4xl">
            &quot;Fikrim Var, Bütçem Yok&quot; <span className="text-amber-500">Stüdyosu</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400 sm:text-base">
            Harika bir iş fikrin, şahsi bir araban, evinde atölye alanın veya tam zamanlı emeğin mi var? Bütçe eksikliğini engel olmaktan çıkar. Fikrinin gelir-gider fizibilitesini dakikalar içinde modelle; onaylanan projenle <strong>Yatırım & Ortaklık Radarına</strong> çık.
          </p>
        </div>

        {/* Çok Adımlı Modelleme Sihirbazı */}
        <VentureBuilderWizard />
      </div>
    </div>
  );
}
