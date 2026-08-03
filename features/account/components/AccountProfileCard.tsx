import type { AccountProfile } from '@/features/account/types/account-profile.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import Link from 'next/link';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-44 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || '—'}</dd>
    </div>
  );
}

export function AccountProfileCard({
  profile,
  onEdit,
}: {
  profile: AccountProfile;
  onEdit: () => void;
  onChangeEmail?: () => void;
  onChangePhone?: () => void;
  onFreeze?: () => void;
  onDelete?: () => void;
}) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');

  return (
    <AccountPanelCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Profil bilgileri
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hesabınıza ait temel kimlik bilgileri.
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
        <Row label="E-posta" value={profile.email ?? ''} />
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <dt className="w-44 shrink-0 text-sm text-muted-foreground">E-posta doğrulama</dt>
          <dd>
            <Badge variant={profile.emailVerified ? 'default' : 'outline'}>
              {profile.emailVerified ? 'Doğrulandı' : 'Doğrulanmadı'}
            </Badge>
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
          <dt className="w-44 shrink-0 text-sm text-muted-foreground">Telefon doğrulama</dt>
          <dd>
            <Badge variant={profile.phoneVerified ? 'default' : 'outline'}>
              {profile.phoneVerified ? 'Doğrulandı' : 'Doğrulanmadı'}
            </Badge>
          </dd>
        </div>
      </dl>
    </AccountPanelCard>
  );
}
