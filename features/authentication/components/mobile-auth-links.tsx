'use client';

import Link from 'next/link';
import {
  Bell,
  Heart,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { getRoleLabel } from '@/features/authentication/constants/roles';

export function MobileAuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="mt-3 flex gap-2">
        <Button variant="ghost" size="sm" className="flex-1 rounded-lg" asChild onClick={onNavigate}>
          <Link href={AUTH_ROUTES.login}>Giriş Yap</Link>
        </Button>
        <Button size="sm" className="flex-1 rounded-lg bg-primary dark:bg-white dark:text-primary-foreground" asChild onClick={onNavigate}>
          <Link href={AUTH_ROUTES.register}>Kayıt Ol</Link>
        </Button>
      </div>
    );
  }

  const links = [
    { href: AUTH_ROUTES.dashboard, label: 'Panel', icon: LayoutDashboard },
    {
      href: user.username ? `/profil/${user.username}` : '/dashboard/profil',
      label: 'Profilim',
      icon: User,
    },
    { href: '/dashboard/ilanlarim', label: 'İlanlarım', icon: LayoutList },
    { href: '/dashboard/favorilerim', label: 'Favorilerim', icon: Heart },
    { href: '/dashboard/bildirimlerim', label: 'Bildirimlerim', icon: Bell },
    { href: '/ayarlar', label: 'Profili Düzenle', icon: Settings },
  ] as const;

  return (
    <div className="mt-3 space-y-1 border-t border-border/80 pt-3 dark:border-white/10">
      <p className="px-3 text-sm font-medium text-foreground">
        {user.displayName ?? user.email}
      </p>
      <p className="mb-2 px-3 text-xs text-muted-foreground">
        {getRoleLabel(user.rawRole ?? user.role)}
      </p>
      {links.map(({ href, label, icon: Icon }) => (
        <Button
          key={href}
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-lg"
          asChild
          onClick={onNavigate}
        >
          <Link href={href}>
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </Link>
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start rounded-lg text-destructive"
        onClick={() => {
          onNavigate?.();
          logout();
        }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Çıkış Yap
      </Button>
    </div>
  );
}
