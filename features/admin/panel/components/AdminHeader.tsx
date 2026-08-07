'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  ExternalLink,
  LogOut,
  Menu,
  UserRound,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AdminSearch } from '@/features/admin/panel/components/AdminSearch';
import { AdminSidebar } from '@/features/admin/panel/components/AdminSidebar';
import { getRoleLabel } from '@/features/authentication/constants/roles';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { DASHBOARD_ROUTES } from '@/features/dashboard/panel/dashboard-nav.constants';
import { initials } from '@/lib/utils';

export function AdminHeader() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.displayName ?? user?.email ?? 'Yönetici';
  const roleLabel = getRoleLabel(user?.rawRole ?? user?.role);

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-xl dark:border-white/10">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5 lg:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-2xl md:hidden"
              aria-label="Menüyü aç"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin menü</SheetTitle>
            </SheetHeader>
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <AdminSearch
          value={query}
          onChange={setQuery}
          placeholder="Kullanıcı, ilan veya işlem ara…"
          className="min-w-0 flex-1"
        />

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative h-10 w-10 rounded-2xl"
                aria-label="Bildirimler"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 rounded-2xl">
              <DropdownMenuLabel>Bildirimler</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                Yönetim bildirimleri yakında burada listelenecek.
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/notifications">Tüm bildirimler</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-2xl px-2 sm:px-3"
                aria-label="Profil menüsü"
              >
                <Avatar className="h-7 w-7 rounded-xl">
                  <AvatarFallback className="rounded-xl text-[10px] font-semibold">
                    {initials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[120px] truncate text-left sm:block">
                  <span className="block text-xs font-medium leading-tight text-foreground">
                    {displayName}
                  </span>
                  <span className="block text-[10px] leading-tight text-muted-foreground">
                    {roleLabel}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              <DropdownMenuLabel className="space-y-1">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <Badge variant="secondary" className="rounded-full text-[10px]">
                  {roleLabel}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={DASHBOARD_ROUTES.profil}>
                  <UserRound className="mr-2 h-4 w-4" />
                  Profilim
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Siteye dön
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => void logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
