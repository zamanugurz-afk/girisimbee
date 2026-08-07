'use client';

import { Phone } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/authentication/hooks/use-auth';
import { cn } from '@/lib/utils';

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return phone;
  const visibleStart = digits.slice(0, 4);
  const visibleEnd = digits.slice(-2);
  return `${visibleStart} ••• •• ${visibleEnd}`;
}

export interface ListingCallButtonProps {
  phone?: string | null;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  /** Full-width primary style for mobile bars */
  fullWidth?: boolean;
  label?: string;
}

/** V1 contact CTA — phone only (no messaging). */
export function ListingCallButton({
  phone,
  size = 'default',
  className,
  fullWidth,
  label = 'Ara',
}: ListingCallButtonProps) {
  const { isAuthenticated } = useAuth();
  const hasPhone = Boolean(phone?.trim());

  if (!isAuthenticated) {
    return (
      <Button asChild size={size} className={cn(fullWidth && 'w-full', className)}>
        <Link href="/giris">
          <Phone className="mr-2 h-4 w-4" />
          Giriş yapıp ara
        </Link>
      </Button>
    );
  }

  if (!hasPhone) {
    return (
      <Button
        type="button"
        size={size}
        variant="outline"
        className={cn(fullWidth && 'w-full', className)}
        disabled
        title="İlan sahibinin telefonu paylaşılmamış"
      >
        <Phone className="mr-2 h-4 w-4" />
        Telefon yok
      </Button>
    );
  }

  const href = toTelHref(phone!);

  return (
    <Button asChild size={size} className={cn(fullWidth && 'w-full', className)}>
      <a
        href={href}
        onClick={() => {
          toast.message('Telefon uygulaması açılıyor', {
            description: maskPhone(phone!),
          });
        }}
      >
        <Phone className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}

export function formatListingPhoneDisplay(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  return phone.trim();
}
