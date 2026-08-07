import { Mail, Phone, UserRound } from 'lucide-react';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { AccountEmptyState } from '@/features/account/components/AccountEmptyState';

/** Only fields collected at signup / Auth — no LinkedIn, website, etc. */
export function AccountHubProfileInfo({
  fullName,
  username,
  email,
  phone,
}: {
  fullName: string;
  username: string | null;
  email: string | null;
  phone: string | null;
}) {
  const rows = [
    { label: 'Ad soyad', value: fullName || null, icon: UserRound },
    { label: 'Kullanıcı adı', value: username ? `@${username}` : null, icon: UserRound },
    { label: 'E-posta', value: email, icon: Mail },
    { label: 'Telefon', value: phone, icon: Phone },
  ];

  const hasAny = rows.some((r) => r.value);

  return (
    <AccountPanelCard className="h-full">
      <h3 className="gc-section-title">
        Profil bilgileri
      </h3>
      <p className="mt-1 text-gc-sm leading-relaxed text-muted-foreground">
        Kayıt sırasında alınan temel kimlik bilgileri.
      </p>

      {!hasAny ? (
        <div className="mt-4">
          <AccountEmptyState
            icon={UserRound}
            title="Profil bilgisi yok"
            description="Hesap bilgilerinizi düzenleyerek ad, kullanıcı adı ve telefon ekleyin."
            cta={{ label: 'Hesap bilgileri', href: '/dashboard/profil' }}
          />
        </div>
      ) : (
        <dl className="mt-5 space-y-2.5">
          {rows.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 px-3.5 py-3"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <dt className="text-gc-xs font-medium text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-0.5 truncate text-gc-sm font-medium text-foreground">
                  {value || '—'}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </AccountPanelCard>
  );
}
