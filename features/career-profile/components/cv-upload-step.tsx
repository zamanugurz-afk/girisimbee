'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RotateCcw,
  UserCheck,
  FileCheck,
  Briefcase,
  Wrench,
  GraduationCap,
  Languages,
  Award,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface CvUploadStepProps {
  onDraftReady: (draft: CvProfileDraftResult) => void;
  onSkipManual: () => void;
  currentCvName?: string;
  onRemoveCv?: () => void;
}

interface CvErrorDetails {
  title: string;
  description: string;
  reason?: string;
}

function resolveFriendlyReason(errorMessage?: string): string | undefined {
  if (!errorMessage) return undefined;
  const lower = errorMessage.toLowerCase();
  if (lower.includes('5 mb') || lower.includes('boyut')) {
    return 'Dosya boyutu 5 MB sınırını aşıyor';
  }
  if (lower.includes('desteklenmeyen') || lower.includes('format') || lower.includes('pdf veya docx')) {
    return 'Desteklenmeyen belge yapısı';
  }
  if (lower.includes('boş') || lower.includes('okunamıyor')) {
    return 'Dosya okunamadı veya boş';
  }
  if (lower.includes('yeterli metin') || lower.includes('yeterli bilgi')) {
    return 'CV’den yeterli metin veya kariyer bilgisi okunamadı';
  }
  return undefined;
}

export function CvUploadStep({
  onDraftReady,
  onSkipManual,
  currentCvName,
  onRemoveCv,
}: CvUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(currentCvName || null);
  const [analysisResult, setAnalysisResult] = useState<CvProfileDraftResult | null>(null);
  const [errorState, setErrorState] = useState<CvErrorDetails | null>(null);
  const [ambiguousChoices, setAmbiguousChoices] = useState<Record<string, string>>({});
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
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorState({
        title: 'CV analiz edilemedi',
        description:
          'Seçtiğiniz dosya formatı desteklenmiyor. Lütfen PDF veya DOCX formatında bir dosya yükleyin.',
        reason: 'Desteklenmeyen dosya formatı (Yalnızca PDF ve DOCX)',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorState({
        title: 'CV analiz edilemedi',
        description:
          'Yüklemek istediğiniz dosya 5 MB boyut sınırını aşıyor. Lütfen daha küçük bir dosya yükleyin veya manuel devam edin.',
        reason: 'Dosya boyutu 5 MB sınırını aşıyor',
      });
      return;
    }

    setSelectedFileName(file.name);
    setErrorState(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/career/cv/analyze', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.error || 'CV analiz edilirken bir sorun oluştu.';
        setErrorState({
          title: 'CV analiz edilemedi',
          description:
            "CV'nizdeki bilgiler otomatik olarak yeterli düzeyde okunamadı. Profilinizi manuel olarak tamamlayabilirsiniz.",
          reason: resolveFriendlyReason(errorMsg),
        });
        return;
      }

      const draft: CvProfileDraftResult = json.data;
      setAnalysisResult(draft);

      // Initialize ambiguous choices with default suggestion
      if (draft.ambiguousItems && draft.ambiguousItems.length > 0) {
        const initialChoices: Record<string, string> = {};
        for (const item of draft.ambiguousItems) {
          initialChoices[item.raw] = item.suggestedCanonical || item.candidates[0] || item.raw;
        }
        setAmbiguousChoices(initialChoices);
      }

      toast.success('✨ CV başarıyla analiz edildi!');
    } catch (err: any) {
      setErrorState({
        title: 'CV analiz edilemedi',
        description:
          "CV'nizdeki bilgiler otomatik olarak yeterli düzeyde okunamadı. Profilinizi manuel olarak tamamlayabilirsiniz.",
        reason: resolveFriendlyReason(err?.message),
      });
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRetryUpload = () => {
    setErrorState(null);
    setAnalysisResult(null);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleAmbiguousChoiceChange = (raw: string, chosen: string) => {
    setAmbiguousChoices((prev) => ({ ...prev, [raw]: chosen }));
  };

  const handleConfirmAndProceed = () => {
    if (!analysisResult) return;

    // Apply any resolved ambiguous choices to draft formValues
    const finalDraft = { ...analysisResult };
    for (const [raw, chosen] of Object.entries(ambiguousChoices)) {
      if (finalDraft.formValues.role === raw) finalDraft.formValues.role = chosen;
      if (finalDraft.formValues.sector === raw) finalDraft.formValues.sector = chosen;
    }

    onDraftReady(finalDraft);
  };

  const cf = analysisResult?.categoriesFound;

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 md:p-7">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        disabled={isUploading}
        className="hidden"
      />

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
          CV’nizi yükleyerek profilinizi hızlıca oluşturun
        </h2>
        <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-slate-600 dark:text-zinc-400">
          Girişimbee, CV’nizdeki geçmiş deneyim ve yetkinlikleri otomatik ayrıştırır; geleceğe yönelik
          tercihlerinizi özgürce belirlemenizi sağlar.
        </p>

        {/* 4-Step Process Visual Guide */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 dark:bg-zinc-800">
            <span className="text-amber-600 font-bold dark:text-amber-400">1.</span> CV Yükle
          </span>
          <span className="text-slate-300 dark:text-zinc-600">→</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 dark:bg-zinc-800">
            <span className="text-amber-600 font-bold dark:text-amber-400">2.</span> Otomatik Analiz
          </span>
          <span className="text-slate-300 dark:text-zinc-600">→</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 dark:bg-zinc-800">
            <span className="text-amber-600 font-bold dark:text-amber-400">3.</span> Bilgileri İncele
          </span>
          <span className="text-slate-300 dark:text-zinc-600">→</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 dark:bg-zinc-800">
            <span className="text-amber-600 font-bold dark:text-amber-400">4.</span> Tercihlerini Seç
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* STATE 1: ERROR STATE */}
      {/* ========================================================= */}
      {errorState && !isUploading && (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                {errorState.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-rose-800 dark:text-rose-300">
                {errorState.description}
              </p>
              {errorState.reason && (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-md bg-rose-100/80 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                    Durum: {errorState.reason}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-rose-200/70 pt-3 dark:border-rose-900/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetryUpload}
              className="gap-1.5 rounded-xl border-rose-300 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Tekrar CV Yükle</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSkipManual}
              className="gap-1.5 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-slate-950 dark:hover:bg-white"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Manuel Devam Et</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STATE 2: UPLOAD DROPZONE */}
      {/* ========================================================= */}
      {!analysisResult && !errorState && (
        <div className="mt-5">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-slate-300/90 bg-slate-50/50 hover:border-amber-400 hover:bg-amber-50/20 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-amber-500/50'
            } ${isUploading ? 'pointer-events-none opacity-85' : ''}`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2.5 py-4">
                <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  CV’niz analiz ediliyor…
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Deneyimler, yetkinlikler ve eğitim bilgileri çıkarılıyor
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-slate-900/5 group-hover:scale-105 dark:bg-zinc-800">
                  <UploadCloud className="h-5 w-5 text-slate-600 group-hover:text-amber-600 dark:text-zinc-300" />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl bg-slate-900 px-5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                >
                  CV Yükle
                </Button>
                <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
                  PDF veya DOCX · Maks. 5 MB
                </p>
              </>
            )}
          </div>

          {/* Alternative Skip Button */}
          <div className="mt-4 flex flex-col items-center justify-center border-t border-slate-100 pt-4 dark:border-zinc-800">
            <button
              type="button"
              disabled={isUploading}
              onClick={onSkipManual}
              className="text-xs font-medium text-slate-600 underline-offset-4 hover:text-amber-600 hover:underline dark:text-zinc-400 dark:hover:text-amber-400"
            >
              Profilimi manuel oluşturacağım
            </button>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-500">
              CV yüklemeden formu kendiniz adım adım doldurabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STATE 3: SUCCESS BREAKDOWN */}
      {/* ========================================================= */}
      {analysisResult && !isUploading && (
        <div className="mt-5 space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    ✓ CV’niz analiz edildi
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {selectedFileName && (
                      <span className="rounded-md bg-emerald-100/80 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                        {selectedFileName}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {analysisResult.extractedCount} bilgi bulundu
                    </span>
                  </div>
                </div>
              </div>

              {/* Replace / Remove Controls */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-emerald-300 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-850 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  <span>CV'yi Değiştir</span>
                </Button>
                {onRemoveCv && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onRemoveCv();
                      setAnalysisResult(null);
                      setSelectedFileName(null);
                    }}
                    className="rounded-xl text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    CV'yi Kaldır
                  </Button>
                )}
              </div>
            </div>

            {/* Dynamic Category Checklist (Pure Real Backend Numbers) */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-emerald-200/70 pt-3 text-xs text-emerald-950 dark:border-emerald-800/40 dark:text-emerald-200">
              {cf && cf.experiences > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/40 px-2 py-1 dark:bg-emerald-900/20">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{cf.experiences} Deneyim</span>
                </div>
              )}
              {cf && cf.skills > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/40 px-2 py-1 dark:bg-emerald-900/20">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{cf.skills} Yetkinlik</span>
                </div>
              )}
              {cf && cf.tools > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/40 px-2 py-1 dark:bg-emerald-900/20">
                  <Wrench className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{cf.tools} Araç</span>
                </div>
              )}
              {cf && cf.education && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/40 px-2 py-1 dark:bg-emerald-900/20">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">1 Eğitim</span>
                </div>
              )}
              {cf && cf.languages > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/40 px-2 py-1 dark:bg-emerald-900/20">
                  <Languages className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{cf.languages} Dil</span>
                </div>
              )}
              {cf && cf.certificates > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/40 px-2 py-1 dark:bg-emerald-900/20">
                  <Award className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{cf.certificates} Sertifika</span>
                </div>
              )}
              {cf && cf.locations > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/40 px-2 py-1 dark:bg-emerald-900/20">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">Lokasyon</span>
                </div>
              )}
              {cf && cf.summary && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/40 px-2 py-1 dark:bg-emerald-900/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">Kariyer Özeti</span>
                </div>
              )}
            </div>
          </div>

          {/* Ambiguous items if any */}
          {analysisResult.ambiguousItems && analysisResult.ambiguousItems.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>
                  {analysisResult.ambiguousItems.length} bilgi için uygun seçimi belirleyin:
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                {analysisResult.ambiguousItems.map((item) => (
                  <div
                    key={item.raw}
                    className="rounded-xl border border-amber-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      CV’deki metin: <span className="font-semibold text-slate-800 dark:text-zinc-200">"{item.raw}"</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.candidates.map((c) => {
                        const isSelected = ambiguousChoices[item.raw] === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleAmbiguousChoiceChange(item.raw, c)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="button"
              onClick={handleConfirmAndProceed}
              className="gap-2 rounded-xl bg-amber-500 px-6 font-semibold text-slate-950 hover:bg-amber-400 shadow-sm"
            >
              <span>Bilgileri İncele</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
