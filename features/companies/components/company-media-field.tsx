'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadCompanyMedia } from '@/features/companies/lib/upload-company-media';
import { cn } from '@/lib/utils';

interface CompanyMediaFieldProps {
  ownerId: string;
  kind: 'logo' | 'cover';
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  label: string;
}

export function CompanyMediaField({
  ownerId,
  kind,
  value,
  onChange,
  disabled,
  label,
}: CompanyMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCompanyMedia(ownerId, file, kind);
      onChange(url);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Görsel yüklenemedi');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  if (kind === 'cover') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div
          className={cn(
            'relative h-36 overflow-hidden rounded-xl border border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.03]',
          )}
          style={value ? { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {!value && (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Kapak görseli yok</div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/40 to-transparent p-3">
            <Button type="button" size="sm" variant="secondary" className="rounded-lg" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              Yükle
            </Button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.03]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">Logo</div>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" className="rounded-lg" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
          Logo Yükle
        </Button>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
