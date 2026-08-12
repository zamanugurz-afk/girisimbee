import type { ReactNode } from 'react';
import { DashboardPanelLayout } from '@/features/dashboard/panel';

/**
 * Mesajlarım lives outside /dashboard so RSC getServerSession in
 * dashboard/layout cannot bounce sticky sessions to /giris.
 */
export default function MesajlarimLayout({ children }: { children: ReactNode }) {
  return <DashboardPanelLayout>{children}</DashboardPanelLayout>;
}
