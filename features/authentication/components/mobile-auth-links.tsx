'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useAuthorization } from '@/features/authentication/hooks/use-auth';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';
import { ROLE_LABELS } from '@/features/authentication/constants/roles';

export function MobileAuthLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isLoading, logout } = useAuth();
  const { role } = useAuthorization();

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

  return (
    <div className="mt-3 space-y-2 border-t border-border/80 pt-3 dark:border-white/10">
      <p className="px-3 text-sm font-medium text-foreground">
        {user.displayName ?? user.email}
      </p>
      <p className="px-3 text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
      <Button variant="ghost" size="sm" className="w-full justify-start rounded-lg" asChild onClick={onNavigate}>
        <Link href={AUTH_ROUTES.dashboard}>Panel</Link>
      </Button>
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
