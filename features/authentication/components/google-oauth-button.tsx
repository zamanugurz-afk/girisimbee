'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { signInWithOAuth } from '@/features/authentication/services/supabase-auth.service';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

export function GoogleOAuthButton({
  label = 'Google ile devam et',
  next = AUTH_ROUTES.account,
}: {
  label?: string;
  next?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await signInWithOAuth(supabase, 'google', { next });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Google girişi başlatılamadı.',
      );
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-lg"
      disabled={loading}
      onClick={() => void handleClick()}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.6 12.23c0-.74-.07-1.45-.19-2.14H12v4.05h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.43Z"
        />
        <path
          fill="currentColor"
          d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.23-2.5c-.9.6-2.04.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.59A9.99 9.99 0 0 0 12 22Z"
          opacity="0.85"
        />
        <path
          fill="currentColor"
          d="M6.39 13.9A6 6 0 0 1 6.08 12c0-.66.11-1.3.3-1.9V7.51H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.49l3.34-2.59Z"
          opacity="0.7"
        />
        <path
          fill="currentColor"
          d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.96 2.97 14.7 2 12 2A9.99 9.99 0 0 0 3.05 7.51l3.34 2.59C7.18 7.74 9.39 5.98 12 5.98Z"
          opacity="0.9"
        />
      </svg>
      {loading ? 'Google’a yönlendiriliyor…' : label}
    </Button>
  );
}

export function AuthSocialDivider({ label = 'veya' }: { label?: string }) {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/80 dark:border-white/10" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-background px-3 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
