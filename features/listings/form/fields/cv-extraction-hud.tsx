'use client';

import { useRef, type ChangeEvent } from 'react';
import { CheckCircle2, Sparkles, FileText, X, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CvExtractionHudProps {
  fileName?: string;
  experienceCount: number;
  educationCount: number;
  languageCount: number;
  skillCount: number;
  location?: string;
  onApply?: () => void;
  isApplied?: boolean;
  onReupload?: () => void;
  onFileSelected?: (file: File) => void;
  isUploading?: boolean;
  onRemove?: () => void;
}

export function CvExtractionHud({
  fileName,
  experienceCount,
  educationCount,
  languageCount,
  skillCount,
  location,
  onApply,
  isApplied = false,
  onReupload,
  onFileSelected,
  isUploading = false,
  onRemove,
}: CvExtractionHudProps) {
  const reuploadInputRef = useRef<HTMLInputElement>(null);

  const handleReuploadClick = () => {
    if (isUploading) return;
    if (onFileSelected && reuploadInputRef.current) {
      reuploadInputRef.current.click();
    } else if (onReupload) {
      onReupload();
    }
  };

  const handleReuploadFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file && onFileSelected) {
        onFileSelected(file);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-linear-to-r from-sky-50/90 via-blue-50/60 to-amber-50/40 p-4 sm:p-5 pr-12 dark:border-sky-900/50 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-amber-950/20">
      <input
        ref={reuploadInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleReuploadFileChange}
        disabled={isUploading}
        className="hidden"
      />
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="absolute top-3.5 right-3.5 h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
          aria-label="CV'yi Kaldır"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm font-semibold text-foreground">
                {isUploading ? 'CV Yeniden Analiz Ediliyor...' : 'CV Başarıyla Analiz Edildi'}
              </h4>
              {fileName && !isUploading && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-100/80 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[140px] truncate">{fileName}</span>
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isUploading
                ? 'Dosyanız taranıyor ve yapay zeka ile form alanlarına dönüştürülüyor...'
                : isApplied
                  ? 'Deneyimler, eğitimler ve yetkinlikler ilgili adımlara aktarıldı. Temel bilgilerinizi aşağıdan belirleyebilirsiniz.'
                  : 'CV analiz edildi. Bilgileri sonraki adımlara doldurmak için "CV\'yi Aktar" butonuna tıklayın.'}
            </p>
          </div>
        </div>

        {/* Action Buttons Column — Exactly Equal Dimensions (w-36 h-8) */}
        <div className="flex flex-col gap-2 shrink-0 self-end sm:self-center">
          {(onFileSelected || onReupload) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReuploadClick}
              disabled={isUploading}
              className="h-8 w-36 gap-1.5 rounded-lg border-sky-200 bg-white/80 text-xs font-medium text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-zinc-900 dark:text-sky-300 shadow-2xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Yükleniyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Yeniden Yükle</span>
                </>
              )}
            </Button>
          )}

          {onApply && (
            <Button
              type="button"
              variant={isApplied ? 'outline' : 'default'}
              size="sm"
              onClick={onApply}
              disabled={isUploading}
              className={cn(
                'h-8 w-36 gap-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all',
                isApplied
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600',
              )}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>CV Aktarıldı</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>CV&apos;yi Aktar</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Extracted Counts HUD Grid */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-sky-200/50 pt-3 dark:border-sky-900/40">
        {experienceCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs dark:bg-zinc-900 dark:text-slate-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{experienceCount} Deneyim</span>
          </span>
        )}
        {educationCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs dark:bg-zinc-900 dark:text-slate-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{educationCount} Eğitim</span>
          </span>
        )}
        {languageCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs dark:bg-zinc-900 dark:text-slate-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{languageCount} Yabancı Dil</span>
          </span>
        )}
        {skillCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs dark:bg-zinc-900 dark:text-slate-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{skillCount} Yetkinlik</span>
          </span>
        )}
        {location && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs dark:bg-zinc-900 dark:text-slate-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{location}</span>
          </span>
        )}
      </div>
    </div>
  );
}
