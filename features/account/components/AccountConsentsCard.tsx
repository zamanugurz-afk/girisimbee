import { Badge } from '@/components/ui/badge';
import type { UserConsent } from '@/features/account/types/user-consent.types';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function ConsentRow({ label, accepted }: { label: string; accepted: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2.5 dark:border-white/10">
      <span className="text-sm text-foreground">{label}</span>
      <Badge variant={accepted ? 'default' : 'outline'}>
        {accepted ? 'Onaylı' : 'Onaysız'}
      </Badge>
    </div>
  );
}

export function AccountConsentsCard({ consent }: { consent: UserConsent | null }) {
  return (
    <section className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Onaylar</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Kayıt sırasında verdiğiniz yasal ve iletişim onayları.
      </p>

      {!consent ? (
        <p className="mt-6 rounded-lg border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground dark:border-white/10">
          Henüz kayıtlı bir onay bulunmuyor.
        </p>
      ) : (
        <div className="mt-5 space-y-2">
          <ConsentRow label="Kullanıcı sözleşmesi" accepted={consent.termsAccepted} />
          <ConsentRow label="Gizlilik politikası" accepted={consent.privacyAccepted} />
          <ConsentRow label="KVKK" accepted={consent.kvkkAccepted} />
          <ConsentRow label="Çerez politikası" accepted={consent.cookiesAccepted} />
          <ConsentRow label="Pazarlama" accepted={consent.marketingAccepted} />
          <ConsentRow label="SMS" accepted={consent.smsAccepted} />
          <ConsentRow label="E-posta iletişimi" accepted={consent.emailAccepted} />
          <p className="pt-2 text-xs text-muted-foreground">
            Kayıt tarihi: {formatDate(consent.createdAt)}
          </p>
        </div>
      )}
    </section>
  );
}
