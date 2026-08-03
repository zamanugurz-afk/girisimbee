import Link from 'next/link';
import {
  BadgeCheck,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { cn } from '@/lib/utils';

const ITEMS = [
  { id: 'email', label: 'E-posta doğrulaması', icon: Mail },
  { id: 'phone', label: 'Telefon doğrulaması', icon: Phone },
  { id: 'user', label: 'Kullanıcı doğrulaması', icon: BadgeCheck },
  { id: 'company', label: 'Şirket doğrulaması', icon: Building2 },
  { id: 'investor', label: 'Yatırımcı doğrulaması', icon: TrendingUp },
] as const;

export function AccountHubVerification({
  emailVerified,
  phoneVerified,
  userVerified,
  companyVerified,
  investorVerified,
}: {
  emailVerified: boolean;
  phoneVerified: boolean;
  userVerified: boolean;
  /** Company verification is not always available — show as pending when unknown */
  companyVerified?: boolean;
  investorVerified: boolean;
}) {
  const status: Record<(typeof ITEMS)[number]['id'], boolean> = {
    email: emailVerified,
    phone: phoneVerified,
    user: userVerified,
    company: Boolean(companyVerified),
    investor: investorVerified,
  };

  return (
    <AccountPanelCard className="h-full">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Doğrulama merkezi
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Güven sinyallerinizi güçlendirmek için doğrulamalarınızı tamamlayın.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const ok = status[id];
          return (
            <li
              key={id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5 dark:border-white/10"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-primary/80" aria-hidden />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
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

      <Button asChild className="mt-5 w-full rounded-2xl sm:w-auto">
        <Link href="/dashboard/dogrulamalar">Doğrulama başvurusu oluştur</Link>
      </Button>
    </AccountPanelCard>
  );
}
