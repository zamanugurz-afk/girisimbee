'use client';

import { usePathname } from 'next/navigation';
import { DASHBOARD_BASE } from '@/features/dashboard/panel/dashboard-nav.constants';

export function useDashboardPanelPath() {
  const pathname = usePathname() ?? DASHBOARD_BASE;

  function isActive(href: string): boolean {
    if (href === DASHBOARD_BASE) {
      return pathname === DASHBOARD_BASE;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return { pathname, isActive };
}
