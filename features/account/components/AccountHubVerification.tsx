import Link from 'next/link';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ITEMS = [
  { id: 'email', label: 'E-posta doğrulaması', icon: Mail },
  { id: 'phone', label: 'SMS / telefon doğrulaması', icon: Phone },
] as const;

export function AccountHubVerification({
  emailVerified,
  phoneVerified,
}: {
  emailVerified: boolean;
  phoneVerified: boolean;
}) {
  const status: Record<(typeof ITEMS)[number]['id'], boolean> = {
    email: emailVerified,
    phone: phoneVerified,
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-950 dark:text-white">
            Doğrulama Merkezi
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Hesap güvenliğiniz ve platformda güvenilir görünmek için e-posta ve telefon doğrulamalarınızı tamamlayın.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const ok = status[id];
          return (
            <li
              key={id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-800/40 px-3.5 py-3"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-slate-500 dark:text-zinc-400" aria-hidden />
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{label}</span>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                  ok
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                )}
              >
                {ok ? 'Doğrulandı' : 'Bekliyor'}
              </span>
            </li>
          );
        })}
      </ul>

      {!emailVerified || !phoneVerified ? (
        <Button asChild className="mt-5 w-full rounded-xl text-xs font-bold shadow-2xs">
          <Link href="/dashboard/profil">
            {!emailVerified ? 'E-postayı Doğrula' : 'Telefon / SMS Doğrula'}
          </Link>
        </Button>
      ) : (
        <p className="mt-5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          <span>Tüm temel doğrulamalarınız tamamlandı.</span>
        </p>
      )}
    </section>
  );
}
