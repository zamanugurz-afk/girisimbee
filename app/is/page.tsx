import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, UserRoundSearch, ArrowRight } from 'lucide-react';
import { GC_CATEGORY_COLORS } from '@/lib/design-tokens';

export const metadata: Metadata = {
  title: 'İş İlanları — İşe Alıyorum & İş Arıyorum | Girisimbee',
  description:
    'Açık pozisyon yayınlayın veya anonim kariyer özeti oluşturun. İşe Alıyorum ve İş Arıyorum akışları.',
};

const HIRE_COLOR = GC_CATEGORY_COLORS['ise-al'];
const SEEK_COLOR = '#0EA5E9';

/**
 * Hub for job marketplace — splits hiring vs anonymous job-seeker career profiles.
 * Does not change /hire (İşe Alıyorum) browse behavior.
 */
export default function IsHubPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          İş İlanları
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B1220] dark:text-foreground sm:text-4xl">
          Nasıl ilerlemek istersiniz?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">
          İşveren olarak açık pozisyon yayınlayın veya iş arayan olarak anonim bir kariyer özeti
          oluşturun. İki akış birbirinden bağımsızdır.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/hire"
          className="group relative flex min-h-[11rem] flex-col overflow-hidden rounded-xl border border-[#E6E8EE] bg-white p-5 transition-colors hover:border-[#C7CBD6] hover:bg-[#FAFBFC] dark:border-border dark:bg-card"
        >
          <span
            className="absolute inset-y-0 left-0 w-[3px]"
            style={{ backgroundColor: HIRE_COLOR }}
            aria-hidden
          />
          <span
            className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: HIRE_COLOR }}
          >
            <Briefcase className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
            İşverenler
          </span>
          <span className="mt-1 font-display text-lg font-semibold text-[#0B1220] dark:text-foreground">
            İşe Alıyorum
          </span>
          <span className="mt-1.5 flex-1 text-sm leading-relaxed text-[#64748B]">
            Açık pozisyon yayınlayın; adaylar ilanınızı görüp iletişim talebi gönderebilir.
          </span>
          <span
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: HIRE_COLOR }}
          >
            İlanları incele
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/is-ariyorum"
          className="group relative flex min-h-[11rem] flex-col overflow-hidden rounded-xl border border-[#E6E8EE] bg-white p-5 transition-colors hover:border-[#C7CBD6] hover:bg-[#FAFBFC] dark:border-border dark:bg-card"
        >
          <span
            className="absolute inset-y-0 left-0 w-[3px]"
            style={{ backgroundColor: SEEK_COLOR }}
            aria-hidden
          />
          <span
            className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: SEEK_COLOR }}
          >
            <UserRoundSearch className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]">
            İş arayanlar
          </span>
          <span className="mt-1 font-display text-lg font-semibold text-[#0B1220] dark:text-foreground">
            İş Arıyorum
          </span>
          <span className="mt-1.5 flex-1 text-sm leading-relaxed text-[#64748B]">
            CV ve firma adı olmadan anonim kariyer özeti oluşturun; işverenler iletişim talebi
            göndersin.
          </span>
          <span
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: SEEK_COLOR }}
          >
            Profilleri incele
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <p className="mt-8 text-sm text-[#64748B]">
        İlan vermek mi istiyorsunuz?{' '}
        <Link href="/ilan/olustur" className="font-medium text-primary underline-offset-2 hover:underline">
          İlan oluştur
        </Link>
      </p>
    </main>
  );
}
