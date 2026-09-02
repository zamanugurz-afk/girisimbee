import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { VentureBuilderWizard } from '@/components/girisimco/venture-builder/VentureBuilderWizard';

export const metadata = {
  title: 'Fikrim Var, Bütçem Yok | Girişim Modelleme & Yatırımcı Çağrısı',
  description:
    'İş fikrinizi, şahsi aracınızı, mekanınızı ve emeğinizi modelleyin; aradığınız başlangıç sermayesi ve ekipman için doğrulanmış melek yatırımcı bulun.',
};

export default function FikrimVarPage() {
  return (
    <div className="gc-header-offset min-w-0 overflow-x-hidden border-b border-[#EEF0F4] bg-[#FAFBFC] dark:border-border dark:bg-background">
      <div className="mx-auto min-w-0 max-w-[1240px] px-4 py-4 sm:py-6">
        {/* Üst Geri Dön Bağlantısı */}
        <div className="mb-3.5 flex items-center justify-between">
          <Link
            href="/trend-fikirler"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-zinc-400 transition-colors hover:text-slate-950 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Trend Fikirlere Dön
          </Link>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <Sparkles className="w-3 h-3 fill-current" />
            Girişim İnkübatörü
          </span>
        </div>

        {/* Başlık & Tanıtım Alanı */}
        <div className="mb-4 max-w-2xl">
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            &quot;Fikrim Var, Bütçem Yok&quot;
          </h1>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            Harika bir iş fikrin, şahsi bir araban, evinde atölye alanın veya emeğin mi var? Fikrinin fizibilitesini dakikalar içinde modelle; onaylanan projenle <strong>Yatırım & Ortaklık Radarına</strong> çık.
          </p>
        </div>

        {/* Çok Adımlı Modelleme Sihirbazı */}
        <VentureBuilderWizard />
      </div>
    </div>
  );
}
