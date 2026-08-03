'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Heart,
  LayoutDashboard,
  LayoutList,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { getRoleLabel } from '@/features/authentication/constants/roles';
import { useRbac } from '@/features/authorization/hooks/use-rbac';
import { roleTrace } from '@/features/authorization/lib/role-trace';

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
  const { user, isLoading, logout } = useAuth();
  const { menu } = useRbac();

  const displayRole = user ? (user.rawRole ?? user.role) : null;
  const roleLabel = user ? getRoleLabel(displayRole) : null;

  useEffect(() => {
    if (!user) return;
    roleTrace('AuthMenu:render', {
      email: user.email,
      role: user.role,
      rawRole: user.rawRole,
      displayRole,
      roleLabel,
    });
  }, [user, displayRole, roleLabel]);

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
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback className="bg-primary text-xs text-white dark:bg-white dark:text-primary-foreground">
              {initials(user.displayName, user.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{user.displayName ?? user.email}</p>
          <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={user.username ? `/profil/${user.username}` : '/dashboard/profil'}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            Profilim
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/ilanlarim" className="cursor-pointer">
            <LayoutList className="mr-2 h-4 w-4" />
            İlanlarım
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/favorilerim" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            Favorilerim
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/mesajlarim" className="cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            Mesajlarım
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/bildirimlerim" className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            Bildirimlerim
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
        {menu.showAdminPanel && (
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
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
