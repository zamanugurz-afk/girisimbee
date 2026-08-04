import type { AccountProfile } from '@/features/account/types/account-profile.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import Link from 'next/link';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-44 shrink-0 text-sm font-semibold text-foreground/70">{label}</dt>
      <dd className="text-sm font-semibold text-foreground">{value || '—'}</dd>
    </div>
  );
}

function VerificationRow({
  label,
  verified,
  onVerify,
  verifyLabel,
}: {
  label: string;
  verified: boolean;
  onVerify?: () => void;
  verifyLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <dt className="w-44 shrink-0 text-sm font-semibold text-foreground/70">{label}</dt>
      <dd className="flex flex-wrap items-center gap-2">
        <Badge variant={verified ? 'default' : 'outline'} className="font-semibold">
          {verified ? 'Doğrulandı' : 'Doğrulanmadı'}
        </Badge>
        {!verified && onVerify ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 rounded-lg px-2.5 text-xs font-semibold"
            onClick={onVerify}
          >
            {verifyLabel}
          </Button>
        ) : null}
      </dd>
    </div>
  );
}

export function AccountProfileCard({
  profile,
  onEdit,
  onVerifyEmail,
  onVerifyPhone,
  emailVerified,
  emailDisplay,
}: {
  profile: AccountProfile;
  onEdit: () => void;
  onVerifyEmail?: () => void;
  onVerifyPhone?: () => void;
  /** Supabase Auth `email_confirmed_at` — source of truth for the badge. */
  emailVerified: boolean;
  /** Prefer Auth session email when account profile email is empty. */
  emailDisplay?: string;
  onChangeEmail?: () => void;
  onChangePhone?: () => void;
  onFreeze?: () => void;
  onDelete?: () => void;
}) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const email = (emailDisplay ?? profile.email ?? '').trim();

  return (
    <AccountPanelCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            Profil bilgileri
          </h2>
          <p className="mt-1 text-sm font-medium leading-relaxed text-foreground/70">
            Kayıt sırasında alınan kimlik bilgileri. E-posta ve SMS doğrulamasını buradan yönetebilirsiniz.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" size="sm" className="rounded-2xl" onClick={onEdit}>
            Hesap bilgilerini düzenle
          </Button>
          <Button asChild type="button" size="sm" variant="outline" className="rounded-2xl">
            <Link href="/ayarlar">Herkese açık profili düzenle</Link>
          </Button>
        </div>
      </div>

      <dl className="mt-6 space-y-3">
        <Row label="Ad soyad" value={fullName} />
        <Row label="Kullanıcı adı" value={profile.username ? `@${profile.username}` : ''} />
        <Row label="Telefon" value={profile.phone ?? ''} />
        <Row label="E-posta" value={email} />
        <VerificationRow
          label="E-posta doğrulama"
          verified={emailVerified}
          onVerify={onVerifyEmail}
          verifyLabel="Doğrula"
        />
        <VerificationRow
          label="SMS / telefon doğrulama"
          verified={profile.phoneVerified}
          onVerify={onVerifyPhone}
          verifyLabel={profile.phone ? 'Doğrula' : 'Telefon ekle / doğrula'}
        />
      </dl>
    </AccountPanelCard>
  );
}
