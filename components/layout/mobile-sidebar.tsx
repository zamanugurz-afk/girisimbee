'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NAV_SECTIONS } from '@/config/navigation';
import { SITE, OWNER_ROUTE } from '@/config/site';
import { useUI } from '@/lib/stores';
import { Radar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileSidebar() {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useUI();

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
        <SheetHeader className="flex h-16 flex-row items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Radar className="h-[18px] w-[18px]" />
          </div>
          <div>
            <SheetTitle className="text-sm font-semibold">{SITE.name}</SheetTitle>
            <p className="text-[11px] text-muted-foreground">Özel · {SITE.city}</p>
          </div>
        </SheetHeader>
        <nav className="ib-scrollbar-none max-h-[calc(100vh-4rem)] overflow-y-auto px-3 py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="mb-5">
              <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === OWNER_ROUTE
                      ? pathname === OWNER_ROUTE
                      : pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary-soft text-primary'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px]" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
