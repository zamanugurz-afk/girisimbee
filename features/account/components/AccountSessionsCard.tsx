import { Badge } from '@/components/ui/badge';
import type { AccountSecuritySession } from '@/features/account/types/account-security.types';
import { ACCOUNT_SESSION_STATUS_LABELS } from '@/features/account/types/account-security.constants';

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function AccountSessionsCard({ sessions }: { sessions: AccountSecuritySession[] }) {
  return (
    <section className="rounded-xl border border-border/80 bg-background p-5 dark:border-white/10 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Oturum geçmişi</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Son girişlerinizin cihaz ve konum özeti (IP kısmen maskelenir).
      </p>

      <div className="mt-5 space-y-3">
        {sessions.map((session) => (
          <article
            key={session.id}
            className="rounded-lg border border-border/70 p-4 dark:border-white/10"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">
                {session.device}
                {session.isCurrent ? ' · Bu cihaz' : ''}
              </p>
              <Badge variant={session.status === 'active' ? 'default' : 'outline'}>
                {ACCOUNT_SESSION_STATUS_LABELS[session.status]}
              </Badge>
            </div>
            <dl className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="shrink-0">Giriş:</dt>
                <dd className="text-foreground">{formatDateTime(session.loggedInAt)}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0">İşletim sistemi:</dt>
                <dd className="text-foreground">{session.os}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0">Tarayıcı:</dt>
                <dd className="text-foreground">{session.browser}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0">IP:</dt>
                <dd className="font-mono text-foreground">{session.ipAddress}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
