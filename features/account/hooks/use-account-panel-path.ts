'use client';

import { usePathname } from 'next/navigation';
import { ACCOUNT_PANEL_BASE } from '@/features/account/types/account-panel.constants';

/** Active nav helper for account sidebar (client-only pathname). */
export function useAccountPanelPath() {
  const pathname = usePathname() ?? ACCOUNT_PANEL_BASE;

  function isActive(href: string): boolean {
    const pathOnly = href.split('#')[0].split('?')[0];

    if (pathOnly === ACCOUNT_PANEL_BASE) {
      return pathname === ACCOUNT_PANEL_BASE;
    }

    return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  }

  return { pathname, isActive };
}
