import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { AccountEmptyState } from '@/features/account/components/AccountEmptyState';
import { DashboardPageHeader } from '@/features/dashboard/panel/DashboardPageHeader';

/** Temporary section shell while feature UI is migrated into /dashboard. */
export function DashboardPlaceholderPage({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon: Icon = Construction,
  cta,
}: {
  title: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  icon?: LucideIcon;
  cta?: { label: string; href: string };
}) {
  return (
    <>
      <DashboardPageHeader title={title} description={description} />
      <div className="px-5 py-8 sm:px-8">
        <AccountPanelCard className="hover:translate-y-0">
          <AccountEmptyState
            icon={Icon}
            title={emptyTitle ?? `${title} yakında`}
            description={
              emptyDescription
              ?? 'Bu bölüm kullanıcı paneli mimarisine eklendi. İçerik mevcut veri akışına bağlanacaktır.'
            }
            cta={cta}
          />
        </AccountPanelCard>
      </div>
    </>
  );
}
