import type { AccountProfile } from '@/features/account/types/account-profile.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-sky-200/70 bg-sky-50/40 px-3.5 py-2.5 dark:border-sky-800/40 dark:bg-sky-950/20">
      <dt className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-xs font-bold text-slate-900 dark:text-white">{value || '—'}</dd>
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
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/40 px-3.5 py-2.5 dark:border-amber-800/40 dark:bg-amber-950/20">
      <dt className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{label}</dt>
      <dd className="flex items-center gap-2">
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-[10px] font-bold',
            verified
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
          )}
        >
          {verified ? 'Doğrulandı' : 'Doğrulanmadı'}
        </span>
        {!verified && onVerify ? (
          <Button
            type="button"
            size="sm"
            className="h-6 rounded-lg px-2 text-[11px] font-bold shadow-2xs"
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
  emailVerified: boolean;
  emailDisplay?: string;
  onChangeEmail?: () => void;
  onChangePhone?: () => void;
  onFreeze?: () => void;
  onDelete?: () => void;
}) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const email = (emailDisplay ?? profile.email ?? '').trim();

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
            Profil Bilgileri
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Kayıt sırasında alınan kimlik bilgileri ve doğrulama durumunuz.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" className="h-8 rounded-xl text-xs font-semibold shadow-2xs" onClick={onEdit}>
            Düzenle
          </Button>
          <Button asChild type="button" size="sm" variant="outline" className="h-8 rounded-xl text-xs font-semibold">
            <Link href="/ayarlar">Açık Profil</Link>
          </Button>
        </div>
      </div>

      <dl className="mt-4 space-y-2">
        <Row label="Ad Soyad" value={fullName} />
        <Row label="Kullanıcı Adı" value={profile.username ? `@${profile.username}` : ''} />
        <Row label="Telefon" value={profile.phone ?? ''} />
        <Row label="E-posta" value={email} />
        <VerificationRow
          label="E-posta Doğrulama"
          verified={emailVerified}
          onVerify={onVerifyEmail}
          verifyLabel="Doğrula"
        />
        <VerificationRow
          label="SMS / Telefon Doğrulama"
          verified={profile.phoneVerified}
          onVerify={onVerifyPhone}
          verifyLabel={profile.phone ? 'Doğrula' : 'Telefon Ekle / Doğrula'}
        />
      </dl>
    </section>
  );
}
