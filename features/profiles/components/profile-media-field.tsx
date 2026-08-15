'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadProfileMedia } from '@/features/profiles/lib/upload-profile-media';
import { assertUploadImageSafe } from '@/features/listings/lib/image-safety';
import { cn } from '@/lib/utils';

interface ProfileMediaFieldProps {
  userId: string;
  kind: 'avatar' | 'cover';
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  label: string;
}

export function ProfileMediaField({
  userId,
  kind,
  value,
  onChange,
  disabled,
  label,
}: ProfileMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await assertUploadImageSafe(file);
      const url = await uploadProfileMedia(userId, file, kind);
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
            value && 'bg-cover bg-center',
          )}
          style={value ? { backgroundImage: `url(${value})` } : undefined}
        >
          {!value && (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Kapak görseli yok
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/40 to-transparent p-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-lg"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              Yükle
            </Button>
          </div>
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-0 text-xs text-destructive"
            disabled={disabled || uploading}
            onClick={() => onChange(null)}
          >
            Kaldır
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border/80 bg-muted/40 dark:border-white/10 dark:bg-white/[0.03]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
              Foto
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-lg"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            Profil Fotoğrafı Yükle
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 justify-start px-0 text-xs text-destructive"
              disabled={disabled || uploading}
              onClick={() => onChange(null)}
            >
              Kaldır
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
