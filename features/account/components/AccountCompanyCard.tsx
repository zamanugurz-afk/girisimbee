import type { AccountPanelCompanyInfo } from '@/features/account/types/account-profile-panel.types';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-44 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="break-all text-sm font-medium text-foreground">{value || '—'}</dd>
    </div>
  );
}

export function AccountCompanyCard({ company }: { company: AccountPanelCompanyInfo }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Kurumsal bilgiler
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">İsteğe bağlı şirket bilgileri.</p>

      <dl className="mt-6 space-y-3">
        <Row label="Şirket adı" value={company.companyName} />
        <Row label="Vergi dairesi" value={company.taxOffice} />
        <Row label="Vergi numarası" value={company.taxNumber} />
        <Row label="İnternet sitesi" value={company.website} />
        <Row label="LinkedIn profili" value={company.linkedIn} />
      </dl>
    </section>
  );
}
