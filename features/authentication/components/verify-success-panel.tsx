'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLink } from '@/features/authentication/components/auth-layout';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export function VerifySuccessPanel() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success sm:h-[4.5rem] sm:w-[4.5rem]">
          <CheckCircle2 className="h-9 w-9 sm:h-10 sm:w-10" aria-hidden />
        </div>
      </div>

      <div className="rounded-xl border border-success/20 bg-success-soft/40 px-4 py-4 text-sm dark:bg-success-soft/20">
        <p className="font-medium text-foreground">Doğrulama başarılı</p>
        <p className="mt-1.5 leading-relaxed text-muted-foreground">
          E-posta adresiniz başarıyla doğrulandı ve hesabınız aktif hale getirildi.
        </p>
      </div>

      <div className="space-y-3">
        <Button asChild className="w-full rounded-lg" size="lg">
          <Link href={AUTH_ROUTES.login}>Giriş Yap →</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <AuthLink href={AUTH_ROUTES.home}>Ana sayfaya dön</AuthLink>
        </p>
      </div>
    </div>
  );
}
