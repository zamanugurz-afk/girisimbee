'use client';

import { Eye, EyeOff, Globe, Link2, Mail, Phone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AccountPanelCard } from '@/features/account/components/AccountPanelCard';
import { toast } from 'sonner';

export function AccountHubPrivacy({
  emailVisible,
  phoneVisible,
  linkedInVisible,
  websiteVisible,
}: {
  emailVisible: boolean;
  phoneVisible: boolean;
  /** LinkedIn visibility is UI-only until a dedicated field exists — mirrors websiteVisible display */
  linkedInVisible: boolean;
  websiteVisible: boolean;
}) {
  const rows = [
    {
      id: 'email',
      label: 'E-posta görünürlüğü',
      checked: emailVisible,
      icon: Mail,
    },
    {
      id: 'phone',
      label: 'Telefon görünürlüğü',
      checked: phoneVisible,
      icon: Phone,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn görünürlüğü',
      checked: linkedInVisible,
      icon: Link2,
    },
    {
      id: 'website',
      label: 'İnternet sitesi görünürlüğü',
      checked: websiteVisible,
      icon: Globe,
    },
  ] as const;

  return (
    <AccountPanelCard className="h-full" id="gizlilik">
      <h3 className="font-display text-lg font-semibold text-foreground">
        Gizlilik ayarları
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Profilinizde hangi iletişim bilgilerinin görüneceğini yönetin.
      </p>

      <div className="mt-5 space-y-3">
        {rows.map(({ id, label, checked, icon: Icon }) => (
          <div
            key={id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border/60 px-3 py-3 dark:border-white/10"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
              <div>
                <Label htmlFor={`hub-privacy-${id}`} className="text-sm font-medium">
                  {label}
                </Label>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  {checked ? (
                    <>
                      <Eye className="h-3 w-3" /> Görünür
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" /> Gizli
                    </>
                  )}
                </p>
              </div>
            </div>
            <Switch
              id={`hub-privacy-${id}`}
              checked={checked}
              onCheckedChange={() =>
                toast.message('Gizlilik ayarlarını Gizlilik sayfasından güncelleyebilirsiniz.', {
                  action: {
                    label: 'Aç',
                    onClick: () => {
                      window.location.href = '/dashboard/gizlilik';
                    },
                  },
                })
              }
            />
          </div>
        ))}
      </div>
    </AccountPanelCard>
  );
}
