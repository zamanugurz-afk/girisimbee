'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CvProfileDraftResult, RawAmbiguousCvItem } from '@/features/candidates/cv/cv.types';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  X,
  FileCheck,
} from 'lucide-react';

interface CvUploadStepProps {
  onDraftReady: (draft: CvProfileDraftResult) => void;
  onSkipManual: () => void;
  currentCvName?: string;
  onRemoveCv?: () => void;
}

export function CvUploadStep({
  onDraftReady,
  onSkipManual,
  currentCvName,
  onRemoveCv,
}: CvUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CvProfileDraftResult | null>(null);
  const [ambiguousChoices, setAmbiguousChoices] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
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
      toast.error('Lütfen PDF veya DOCX formatında bir CV dosyası seçin.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5 MB sınırını aşıyor.');
      return;
    }

    setSelectedFile(file);
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
        throw new Error(json.error || 'CV analiz edilirken bir sorun oluştu.');
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
      toast.error(err.message || 'CV okunamadı. Lütfen manuel olarak devam edin.');
    } finally {
      setIsUploading(false);
    }
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

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900 md:p-8">
      {/* Existing CV status if any */}
      {currentCvName && !analysisResult && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Kayıtlı CV: {currentCvName}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Profilinizde kayıtlı CV bulunmaktadır.
              </p>
            </div>
          </div>
          {onRemoveCv && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemoveCv}
              className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              CV'yi Kaldır
            </Button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-2xl">
          CV’nizi yükleyerek profilinizi hızlıca oluşturun
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
          CV’nizi yükleyin. Girişimbee, CV’nizde bulunan bilgileri profilinize aktararak profilinizi daha
          hızlı tamamlamanıza yardımcı olur.
        </p>
      </div>

      {/* Upload Zone */}
      {!analysisResult && (
        <div className="mt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/10'
                : 'border-slate-300 bg-slate-50/60 hover:border-amber-400 hover:bg-amber-50/20 dark:border-zinc-700 dark:bg-zinc-800/40 dark:hover:border-amber-500/60'
            } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                  CV’niz analiz ediliyor…
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-500">
                  Deneyimler, yetkinlikler ve eğitim bilgileri çıkarılıyor
                </p>
              </div>
            ) : (
              <>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-900/5 group-hover:scale-105 dark:bg-zinc-800">
                  <UploadCloud className="h-6 w-6 text-slate-600 group-hover:text-amber-600 dark:text-zinc-300" />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
                >
                  CV Yükle
                </Button>
                <p className="mt-2.5 text-xs text-slate-500 dark:text-zinc-400">
                  PDF veya DOCX · Maks. 5 MB
                </p>
              </>
            )}
          </div>

          {/* Alternative Skip Button */}
          <div className="mt-6 flex flex-col items-center justify-center border-t border-slate-100 pt-6 dark:border-zinc-800">
            <button
              type="button"
              onClick={onSkipManual}
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-amber-600 hover:underline dark:text-zinc-400 dark:hover:text-amber-400"
            >
              Profilimi manuel oluşturacağım
            </button>
            <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
              CV yüklemeden adımları kendiniz doldurabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Success Breakdown */}
      {analysisResult && (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-950 dark:text-emerald-100">
                  CV’niz analiz edildi
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {analysisResult.extractedCount} bilgi başarıyla bulundu ve taksonomiye eşlendi.
                </p>
              </div>
            </div>

            {/* Category checklist */}
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-emerald-200/60 pt-3 text-xs text-emerald-900 dark:border-emerald-800/40 dark:text-emerald-200">
              {analysisResult.categoriesFound.experiences > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>İş Deneyimleri ({analysisResult.categoriesFound.experiences})</span>
                </div>
              )}
              {analysisResult.categoriesFound.roles > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Pozisyonlar</span>
                </div>
              )}
              {analysisResult.categoriesFound.sectors > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sektörler</span>
                </div>
              )}
              {analysisResult.categoriesFound.skills > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Yetkinlikler ({analysisResult.categoriesFound.skills})</span>
                </div>
              )}
              {analysisResult.categoriesFound.tools > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Araç & Yazılımlar ({analysisResult.categoriesFound.tools})</span>
                </div>
              )}
              {analysisResult.categoriesFound.education && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Eğitim Bilgisi</span>
                </div>
              )}
              {analysisResult.categoriesFound.languages > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Diller ({analysisResult.categoriesFound.languages})</span>
                </div>
              )}
              {analysisResult.categoriesFound.certificates > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sertifikalar ({analysisResult.categoriesFound.certificates})</span>
                </div>
              )}
              {analysisResult.categoriesFound.locations > 0 && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Lokasyon Bilgisi</span>
                </div>
              )}
              {analysisResult.categoriesFound.summary && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Kariyer Özeti</span>
                </div>
              )}
            </div>
          </div>

          {/* Ambiguous items if any */}
          {analysisResult.ambiguousItems && analysisResult.ambiguousItems.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>
                  {analysisResult.ambiguousItems.length} bilgi için seçiminize ihtiyacımız var:
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {analysisResult.ambiguousItems.map((item) => (
                  <div
                    key={item.raw}
                    className="rounded-xl border border-amber-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                      CV'deki metin: <span className="font-semibold text-slate-800 dark:text-zinc-200">"{item.raw}"</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
                      Bu bilgiyi hangi alana en yakın görüyorsunuz?
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.candidates.map((c) => {
                        const isSelected = ambiguousChoices[item.raw] === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleAmbiguousChoiceChange(item.raw, c)}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
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
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setAnalysisResult(null);
                setSelectedFile(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Farklı bir CV yükle
            </button>
            <Button
              type="button"
              onClick={handleConfirmAndProceed}
              className="gap-2 rounded-xl bg-amber-500 px-6 font-semibold text-slate-950 hover:bg-amber-400"
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
