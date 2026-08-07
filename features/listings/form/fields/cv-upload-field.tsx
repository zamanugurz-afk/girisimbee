'use client';

import { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadListingCv } from '@/features/listings/lib/upload-listing-cv';
import { FormFieldFooter } from '@/features/listings/form/form-field-footer';
import { FieldLabelWithTooltip } from '@/features/listings/form/field-label-with-tooltip';

export interface CvUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  error?: string;
  userId?: string;
}

export function CvUploadField({
  value,
  onChange,
  disabled,
  error,
  userId,
}: CvUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    if (!file || disabled || uploading) return;
    if (!userId) {
      toast.error('Özgeçmiş yüklemek için giriş yapmalısınız');
      return;
    }

    const formData = new FormData();
    formData.append('cv', file, file.name);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CvUploadField] FormData entries:', [...formData.entries()].map(([k, v]) => [k, v instanceof File ? { name: v.name, type: v.type, size: v.size } : v]));
    }

    setUploading(true);
    try {
      const url = await uploadListingCv(userId, file);
      onChange(url);
      setFileName(file.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Dosya yüklenemedi.';
      toast.error(message === 'Dosya yüklenemedi.' ? message : 'Dosya yüklenemedi.', {
        description: message !== 'Dosya yüklenemedi.' ? message : 'Desteklenen formatlar: PDF, DOC, DOCX.',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeFile() {
    onChange(null);
    setFileName(null);
  }

  return (
    <div className="space-y-3">
      <FieldLabelWithTooltip label="Özgeçmiş (CV)" required />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {fileName ?? 'Yüklenen özgeçmiş'}
              </p>
              <p className="text-xs text-muted-foreground">PDF, DOC veya DOCX</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || uploading}
            onClick={removeFile}
            aria-label="Özgeçmişi kaldır"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-lg"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Yükleniyor…' : 'Özgeçmiş Yükle'}
        </Button>
      )}

      <FormFieldFooter
        helperText="Kabul edilen formatlar: PDF, DOC, DOCX. Maksimum 10 MB."
        error={error}
      />
    </div>
  );
}
