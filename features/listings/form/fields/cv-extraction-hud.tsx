'use client';

import { CheckCircle2, Sparkles, FileText, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CvExtractionHudProps {
  fileName?: string;
  experienceCount: number;
  educationCount: number;
  languageCount: number;
  skillCount: number;
  location?: string;
  onReupload?: () => void;
  onRemove?: () => void;
}

export function CvExtractionHud({
  fileName,
  experienceCount,
  educationCount,
  languageCount,
  skillCount,
  location,
  onReupload,
  onRemove,
}: CvExtractionHudProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-linear-to-r from-sky-50/90 via-blue-50/60 to-amber-50/40 p-4 sm:p-5 dark:border-sky-900/50 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-amber-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm font-semibold text-foreground">
                CV Başarıyla Analiz Edildi
              </h4>
              {fileName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-100/80 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[140px] truncate">{fileName}</span>
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Bilgileriniz otomatik aktarıldı. Alanları aşağıdan kontrol edip düzenleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onReupload && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReupload}
              className="h-8 gap-1.5 rounded-lg border-sky-200 bg-white/80 text-xs text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-zinc-900 dark:text-sky-300"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Yeniden Yükle</span>
            </Button>
          )}
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
              aria-label="CV'yi Kaldır"
            >
              <X className="h-4 w-4" />
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
