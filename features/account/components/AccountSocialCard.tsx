import type { AccountPanelSocialInfo } from '@/features/account/types/account-profile-panel.types';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-44 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="break-all text-sm font-medium text-foreground">{value || '—'}</dd>
    </div>
  );
}

export function AccountSocialCard({ social }: { social: AccountPanelSocialInfo }) {
  return (
    <section className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Sosyal medya
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Profil bağlantılarınız.</p>

      <dl className="mt-6 space-y-3">
        <Row label="LinkedIn" value={social.linkedIn} />
        <Row label="X" value={social.x} />
        <Row label="Instagram" value={social.instagram} />
      </dl>
    </section>
  );
}
