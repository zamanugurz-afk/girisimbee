'use client';

import { useRef, useState } from 'react';
import { GripVertical, ImagePlus, Plus, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ListingImageInput } from '@/features/listings/types/listing-engine.types';
import { uploadListingMedia } from '@/features/listings/lib/upload-listing-media';
import { cn } from '@/lib/utils';

export interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  max?: number;
}

export function TagsInput({ value, onChange, disabled, max = 20 }: TagsInputProps) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim();
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-2">
      <Label>Etiketler</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          disabled={disabled}
          placeholder="Etiket ekle..."
        />
        <Button type="button" variant="outline" size="icon" onClick={addTag} disabled={disabled}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} disabled={disabled}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function normalizeSortOrder(images: ListingImageInput[]): ListingImageInput[] {
  return images.map((img, index) => ({ ...img, sortOrder: index }));
}

export interface ImagesInputProps {
  value: ListingImageInput[];
  onChange: (images: ListingImageInput[]) => void;
  disabled?: boolean;
  max?: number;
  userId?: string;
}

export function ImagesInput({ value, onChange, disabled, max = 10, userId }: ImagesInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const sorted = [...value].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  async function handleFiles(files: FileList | null) {
    if (!files?.length || disabled || uploading) return;
    if (!userId) {
      toast.error('Görsel yüklemek için giriş yapmalısınız');
      return;
    }

    const remaining = max - value.length;
    if (remaining <= 0) {
      toast.error(`En fazla ${max} görsel ekleyebilirsiniz.`);
      return;
    }

    const batch = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploaded: ListingImageInput[] = [];
      for (const file of batch) {
        const url = await uploadListingMedia(userId, file);
        uploaded.push({ url, alt: file.name, sortOrder: value.length + uploaded.length });
      }
      onChange(normalizeSortOrder([...value, ...uploaded]));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Görsel yüklenemedi');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage(index: number) {
    onChange(normalizeSortOrder(sorted.filter((_, i) => i !== index)));
  }

  function setCover(index: number) {
    if (index === 0) return;
    const next = [...sorted];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(normalizeSortOrder(next));
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const next = [...sorted];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(index);
    onChange(normalizeSortOrder(next));
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label>Görseller</Label>
        <span className="text-xs text-muted-foreground">{sorted.length}/{max}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-lg"
        disabled={disabled || uploading || sorted.length >= max}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImagePlus className="mr-2 h-4 w-4" />
        {uploading ? 'Yükleniyor…' : 'Görsel Yükle'}
      </Button>

      <p className="text-xs text-muted-foreground">
        Sürükleyerek sıralayın. İlk görsel kapak olarak kullanılır.
      </p>

      {sorted.length > 0 && (
        <ul className="space-y-2">
          {sorted.map((img, index) => (
            <li
              key={`${img.url}-${index}`}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2',
                dragIndex === index && 'border-primary dark:border-white',
              )}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-[#F1F5F9] dark:bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  {img.alt || `Görsel ${index + 1}`}
                </p>
                {index === 0 ? (
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    Kapak
                  </Badge>
                ) : (
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground dark:hover:text-white"
                    disabled={disabled}
                    onClick={() => setCover(index)}
                  >
                    <Star className="h-3 w-3" />
                    Kapak yap
                  </button>
                )}
              </div>
              <button type="button" onClick={() => removeImage(index)} disabled={disabled}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
