import Link from 'next/link';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
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
    <AccountPanelCard className="h-full">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="gc-section-title">
            Doğrulama merkezi
          </h3>
          <p className="mt-1 text-gc-sm leading-relaxed text-muted-foreground">
            Yalnızca e-posta ve SMS doğrulaması. Diğer doğrulama türleri bu sürümde yok.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const ok = status[id];
          return (
            <li
              key={id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-3.5 py-3"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-gc-sm font-medium text-foreground">{label}</span>
              </div>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-gc-xs font-medium',
                  ok
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {ok ? 'Doğrulandı' : 'Bekliyor'}
              </span>
            </li>
          );
        })}
      </ul>

      {!emailVerified || !phoneVerified ? (
        <Button asChild className="mt-5 w-full rounded-xl sm:w-auto">
          <Link href="/dashboard/dogrulamalar">
            {!emailVerified ? 'E-postayı doğrula' : 'Telefon / SMS doğrula'}
          </Link>
        </Button>
      ) : (
        <p className="mt-5 text-gc-sm font-medium text-emerald-700 dark:text-emerald-400">
          Temel doğrulamalar tamamlandı.
        </p>
      )}
    </AccountPanelCard>
  );
}
