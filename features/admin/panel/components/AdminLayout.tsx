'use client';

import type { ReactNode } from 'react';
import { AdminSidebar } from '@/features/admin/panel/components/AdminSidebar';
import { AdminHeader } from '@/features/admin/panel/components/AdminHeader';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 dark:bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <div className="hidden w-64 shrink-0 md:block lg:w-72">
          <div className="sticky top-0 h-screen">
            <AdminSidebar />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
