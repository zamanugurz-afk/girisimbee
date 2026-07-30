'use client';

import Link from 'next/link';
import { LogOut, LayoutDashboard, LayoutList, Settings, User, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useAuthorization } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { ROLE_LABELS } from '@/features/authentication/constants/roles';

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function AuthMenu() {
  const { user, isLoading, signOut } = useAuth();
  const { role, isAdmin } = useAuthorization();

  if (isLoading) {
    return <div className="hidden h-9 w-9 rounded-lg bg-muted sm:block" aria-hidden />;
  }

  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="hidden rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex dark:hover:text-white"
          asChild
        >
          <Link href={AUTH_ROUTES.login}>Giriş Yap</Link>
        </Button>
        <Button
          size="sm"
          className="hidden sm:inline-flex"
          asChild
        >
          <Link href={AUTH_ROUTES.register}>Kayıt Ol</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80"
          aria-label="Hesap menüsü"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-xs text-white dark:bg-white dark:text-primary-foreground">
              {initials(user.displayName, user.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{user.displayName ?? user.email}</p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={user.username ? `/profil/${user.username}` : '/ayarlar'}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            Profilim
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/ilanlarim" className="cursor-pointer">
            <LayoutList className="mr-2 h-4 w-4" />
            İlanlarım
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/ayarlar" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Profili Düzenle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={AUTH_ROUTES.dashboard} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Panel
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              Yönetim
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
