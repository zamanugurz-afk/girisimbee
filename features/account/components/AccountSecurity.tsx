'use client';

import { useMemo, useState } from 'react';
import { AccountDangerZone } from '@/features/account/components/AccountDangerZone';
import { AccountPasswordCard } from '@/features/account/components/AccountPasswordCard';
import { AccountSessionsCard } from '@/features/account/components/AccountSessionsCard';
import { AccountTwoFactorCard } from '@/features/account/components/AccountTwoFactorCard';
import { getMockAccountSecurity } from '@/features/account/services/account-security-mock.service';

export function AccountSecurity() {
  const initial = useMemo(() => getMockAccountSecurity(), []);
  const [sessions, setSessions] = useState(initial.sessions);
  const [twoFactor, setTwoFactor] = useState(initial.twoFactor);

  return (
    <div className="space-y-6">
      <AccountPasswordCard />
      <AccountSessionsCard sessions={sessions} />
      <AccountTwoFactorCard twoFactor={twoFactor} onChange={setTwoFactor} />
      <AccountDangerZone
        onSignOutAll={() =>
          setSessions((prev) =>
            prev.map((session) => ({
              ...session,
              status: 'ended' as const,
              isCurrent: false,
            })),
          )
        }
      />
    </div>
  );
}
