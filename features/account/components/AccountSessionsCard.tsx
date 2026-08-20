import { Laptop, Smartphone, Tablet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AccountSecuritySession } from '@/features/account/types/account-security.types';
import { ACCOUNT_SESSION_STATUS_LABELS } from '@/features/account/types/account-security.constants';
import { cn } from '@/lib/utils';

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

function getDeviceIcon(device: string) {
  const lower = device.toLowerCase();
  if (lower.includes('mobil') || lower.includes('phone') || lower.includes('ios') || lower.includes('android')) {
    return Smartphone;
  }
  if (lower.includes('tablet') || lower.includes('ipad')) {
    return Tablet;
  }
  return Laptop;
}

export function AccountSessionsCard({ sessions }: { sessions: AccountSecuritySession[] }) {
  // Show top 2 sessions for clean single-page unity
  const displaySessions = sessions.slice(0, 2);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6 transition-all">
      <h2 className="font-display text-base font-bold text-slate-950 dark:text-white">
        Aktif Oturumlar & Cihaz Geçmişi
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
        Son girişlerinizin cihaz, konum ve IP özeti.
      </p>

      <div className="mt-4 space-y-2.5">
        {displaySessions.map((session) => {
          const Icon = getDeviceIcon(session.device);
          return (
            <article
              key={session.id}
              className={cn(
                'rounded-xl border p-3.5 transition-all',
                session.isCurrent
                  ? 'border-emerald-300/80 bg-emerald-50/30 dark:border-emerald-800/40 dark:bg-emerald-950/20'
                  : 'border-sky-200/70 bg-sky-50/40 dark:border-sky-800/40 dark:bg-sky-950/20',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 text-slate-500 shrink-0" />
                  <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {session.device}
                    {session.isCurrent ? ' · Bu Cihaz' : ''}
                  </p>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.2 text-[10px] font-bold',
                      session.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {ACCOUNT_SESSION_STATUS_LABELS[session.status]}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 shrink-0">
                  {formatDateTime(session.loggedInAt)}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                <span>{session.os}</span>
                <span>•</span>
                <span>{session.browser}</span>
                <span>•</span>
                <span className="font-mono">{session.ipAddress}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
