'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountPaymentCard } from '@/features/account/components/AccountPaymentCard';
import { AccountPaymentStats } from '@/features/account/components/AccountPaymentStats';
import { AccountPaymentsEmpty } from '@/features/account/components/AccountPaymentsEmpty';
import { formatTryAmount } from '@/features/account/services/account-payments-mock.service';
import { ACCOUNT_PAYMENTS_TABS } from '@/features/account/types/account-payments.constants';
import type {
  AccountPaymentCardData,
  AccountPaymentPackageType,
  AccountPaymentStatsData,
  AccountPaymentsTab,
} from '@/features/account/types/account-payments.types';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import {
  listPendingPackagePayments,
  type PendingPackagePayment,
} from '@/features/monetization/lib/pending-package-payments';
import { PLACEMENT_PACKAGE_CONFIG } from '@/features/monetization/types/listing-placement.types';

function mapPackageType(
  packages: PendingPackagePayment['packages'],
): AccountPaymentPackageType {
  if (packages.includes('hizli_erisim')) return 'acil_vitrin';
  if (packages.includes('vitrin')) return 'vitrin';
  return 'standart';
}

function mapStatus(
  status: PendingPackagePayment['status'],
): AccountPaymentCardData['status'] {
  if (status === 'succeeded') return 'completed';
  if (status === 'failed') return 'failed';
  return 'pending';
}

function toPaymentCard(item: PendingPackagePayment): AccountPaymentCardData {
  const names = item.packages
    .map((slug) => PLACEMENT_PACKAGE_CONFIG[slug]?.name ?? slug)
    .join(' + ');
  return {
    id: item.id,
    transactionNumber: item.id.replace('ppay_', 'GC-SIM-').toUpperCase(),
    packageName: names || 'Paket',
    packageType: mapPackageType(item.packages),
    paidAt: item.status === 'succeeded' ? item.updatedAt : null,
    amountTry: Math.round(item.amountCents / 100),
    status: mapStatus(item.status),
    invoiceNumber: null,
    listingId: item.listingId,
  };
}

function buildStats(items: AccountPaymentCardData[]): AccountPaymentStatsData {
  const completed = items.filter((item) => item.status === 'completed');
  return {
    totalPayments: items.length,
    totalSpentTry: completed.reduce((sum, item) => sum + item.amountTry, 0),
    activePackageCount: completed.length,
  };
}

function filterPayments(
  items: AccountPaymentCardData[],
  tab: AccountPaymentsTab,
): AccountPaymentCardData[] {
  if (tab === 'all') return items;
  return items.filter((item) => item.status === tab);
}

export function AccountPayments() {
  const { user } = useAuth();
  const [items, setItems] = useState<AccountPaymentCardData[]>([]);
  const [tab, setTab] = useState<AccountPaymentsTab>('all');

  const refresh = useCallback(() => {
    if (!user?.id) {
      setItems([]);
      return;
    }
    setItems(listPendingPackagePayments(user.id).map(toPaymentCard));
  }, [user?.id]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('GirisimBee:pending-payments-changed', onChange);
    return () => window.removeEventListener('GirisimBee:pending-payments-changed', onChange);
  }, [refresh]);

  const stats = useMemo(() => buildStats(items), [items]);
  const visible = useMemo(() => filterPayments(items, tab), [items, tab]);

  return (
    <div className="space-y-8">
      <AccountPaymentStats stats={stats} />

      <p className="text-xs text-muted-foreground">
        Bu sayfada yalnızca işlem geçmişi gösterilir. Kart numarası, CVV, son
        kullanma tarihi veya ödeme sağlayıcısı bilgisi saklanmaz. Simüle edilen
        paket ödemeleri burada listelenir.
      </p>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as AccountPaymentsTab)}
      >
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-muted/40 p-1">
          {ACCOUNT_PAYMENTS_TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="rounded-lg px-3 py-2 text-sm"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ACCOUNT_PAYMENTS_TABS.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-6 space-y-4">
            {visible.length === 0 ? (
              <AccountPaymentsEmpty />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {visible.length} işlem gösteriliyor
                  {item.id === 'all' ? ` · Toplam ${formatTryAmount(stats.totalSpentTry)}` : ''}
                </p>
                <div className="space-y-4">
                  {visible.map((payment) => (
                    <AccountPaymentCard key={payment.id} item={payment} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
