'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export interface CvUploadCardProps {
  onDraftReady: (draft: CvProfileDraftResult) => void;
  onSkipManual: () => void;
  isManualMode?: boolean;
}

export function CvUploadCard({
  onDraftReady,
  onSkipManual,
  isManualMode = false,
}: CvUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isUploading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFileSelected(e.dataTransfer.files[0]!);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void handleFileSelected(e.target.files[0]!);
    }
  };

  const handleFileSelected = async (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      const err = 'Lütfen geçerli bir PDF veya DOCX dosyası yükleyin.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const err = 'Dosya boyutu 5 MB sınırını aşıyor.';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/career/cv/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'CV analizi sırasında bir hata oluştu.');
      }

      const draft = ((data.draft || data.data) as CvProfileDraftResult);
      onDraftReady(draft);
      toast.success('✨ CV başarıyla analiz edildi!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'CV analiz edilemedi.';
      setErrorMessage(msg);
      toast.error(msg, {
        description: 'Dilerseniz formu manuel doldurarak devam edebilirsiniz.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* 2-Choice Grid: CV vs Manuel */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Option 1: CV Upload (Primary Highlight) */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-6 transition-all duration-200 ${
            isDragging
              ? 'border-sky-500 bg-sky-50/50 shadow-md dark:border-sky-400 dark:bg-sky-950/20'
              : isUploading
                ? 'border-border/80 bg-muted/30 opacity-80'
                : 'border-dashed border-sky-300/80 bg-linear-to-br from-sky-50/40 via-white to-blue-50/30 hover:border-sky-500 hover:shadow-sm dark:border-sky-800/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-sky-950/20 dark:hover:border-sky-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInputChange}
            disabled={isUploading}
            className="hidden"
          />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 transition-colors group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-500/20 dark:text-sky-400">
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </div>
              <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                Hızlı & Önerilen
              </span>
            </div>

            <h3 className="mt-4 font-display text-base font-bold text-foreground">
              CV&apos;den devam et
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              CV&apos;nizdeki bilgileri otomatik alalım.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-sky-100/80 pt-3 text-xs font-medium text-sky-700 dark:border-sky-900/40 dark:text-sky-400">
            <span>{isUploading ? 'Analiz ediliyor…' : 'PDF veya DOCX seçin'}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Option 2: Manuel Continuation */}
        <div
          onClick={onSkipManual}
          className={`group flex cursor-pointer flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
            isManualMode
              ? 'border-primary/60 bg-primary/5 shadow-xs'
              : 'border-border/80 bg-white hover:border-slate-400 hover:shadow-xs dark:bg-zinc-900 dark:hover:border-zinc-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-800 group-hover:text-white dark:bg-zinc-800 dark:text-slate-300 dark:group-hover:bg-zinc-700">
                <UserCheck className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-slate-400">
                Manuel
              </span>
            </div>

            <h3 className="mt-4 font-display text-base font-bold text-foreground">
              Manuel devam et
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Bilgileri kendiniz girebilirsiniz.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3 text-xs font-medium text-muted-foreground group-hover:text-foreground">
            <span>Formu aç</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Error notification if upload fails */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage} Dilerseniz yukarıdaki &quot;Manuel Olarak Devam Et&quot; butonuna basarak formu doldurabilirsiniz.</span>
        </div>
      )}
    </div>
  );
}
