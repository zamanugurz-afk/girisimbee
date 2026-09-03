'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadCompanyMedia } from '@/features/companies/lib/upload-company-media';
import { assertUploadImageSafe } from '@/features/listings/lib/image-safety';
import { cn } from '@/lib/utils';

interface CompanyMediaFieldProps {
  ownerId: string;
  kind: 'logo' | 'cover';
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  label: string;
  compact?: boolean;
}

export function CompanyMediaField({
  ownerId,
  kind,
  value,
  onChange,
  disabled,
  label,
  compact = false,
}: CompanyMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await assertUploadImageSafe(file);
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
      <div className={cn(compact ? 'space-y-1' : 'space-y-2')}>
        <p className={cn(compact ? 'text-xs font-semibold' : 'text-sm font-medium', 'text-foreground')}>{label}</p>
        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.03]',
            compact ? 'h-20' : 'h-36'
          )}
          style={value ? { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {!value && (
            <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">Kapak görseli yok</div>
          )}
          <div className={cn('absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/50 to-transparent', compact ? 'p-1.5' : 'p-3')}>
            <Button type="button" size="sm" variant="secondary" className={cn('rounded-lg', compact ? 'h-6 text-[11px] px-2' : '')} disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Camera className="mr-1 h-3 w-3" />}
              {compact ? 'Yükle' : 'Kapak Yükle'}
            </Button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div className={cn(compact ? 'space-y-1' : 'space-y-2')}>
      <p className={cn(compact ? 'text-xs font-semibold' : 'text-sm font-medium', 'text-foreground')}>{label}</p>
      <div className="flex items-center gap-3">
        <div className={cn('relative overflow-hidden rounded-xl border border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.03] shrink-0', compact ? 'h-14 w-14' : 'h-20 w-20')}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">Logo</div>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" className={cn('rounded-lg', compact ? 'h-7 text-xs px-2.5' : '')} disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Camera className="mr-1.5 h-3.5 w-3.5" />}
          Logo Yükle
        </Button>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
