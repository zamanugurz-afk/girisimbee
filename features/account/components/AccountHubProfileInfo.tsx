import { Globe, Link2, Phone, UserRound } from 'lucide-react';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { AccountEmptyState } from '@/features/account/components/AccountEmptyState';

export function AccountHubProfileInfo({
  fullName,
  username,
  phone,
  linkedIn,
  website,
}: {
  fullName: string;
  username: string | null;
  phone: string | null;
  linkedIn: string | null;
  website: string | null;
}) {
  const rows = [
    { label: 'Ad soyad', value: fullName, icon: UserRound },
    { label: 'Kullanıcı adı', value: username ? `@${username}` : null, icon: UserRound },
    { label: 'Telefon', value: phone, icon: Phone },
    { label: 'LinkedIn', value: linkedIn, icon: Link2 },
    { label: 'İnternet sitesi', value: website, icon: Globe },
  ];

  const hasAny = rows.some((r) => r.value);

  return (
    <AccountPanelCard className="h-full">
      <h3 className="font-display text-lg font-semibold text-foreground">
        Profil bilgileri
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Hesabınızda görünen temel kimlik bilgileri.
      </p>

      {!hasAny ? (
        <div className="mt-4">
          <AccountEmptyState
            icon={UserRound}
            title="Profil bilgisi yok"
            description="Profilinizi düzenleyerek ad, kullanıcı adı ve iletişim bilgilerinizi ekleyin."
            cta={{ label: 'Profili düzenle', href: '/ayarlar' }}
          />
        </div>
      ) : (
        <dl className="mt-5 space-y-3">
          {rows.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-xl border border-border/60 px-3 py-2.5 dark:border-white/10"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" aria-hidden />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="truncate text-sm font-medium text-foreground">
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
