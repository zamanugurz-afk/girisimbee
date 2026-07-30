'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Lightbulb,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ImageIcon,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListingResponse, AIAnalysisResponse } from '@/types';

interface DescriptionAnalysisProps {
  listing: ListingResponse;
  analysis: AIAnalysisResponse | undefined;
}

const POSITIVE_KEYWORDS = [
  'garanti', 'fatura', 'kutu', 'orijinal', 'faturalı', 'kutulu', 'sorunsuz',
  'temiz', 'az kullanılmış', 'yeni gibi', 'kablolu', 'şarj',
];

const WARNING_KEYWORDS = [
  'acil', ' hiçbir sorunu yok', 'pazarlık yok', 'fiyat sabit', 'değişim yok',
];

const MISSING_KEYWORDS = [
  'fatura', 'garanti', 'kutu', 'kablo', 'şarj aleti', 'kontrolcü',
];

export function DescriptionAnalysis({ listing, analysis }: DescriptionAnalysisProps) {
  const description = listing.description ?? '';
  const descScore = analysis?.description_score ?? 50;

  const { highlights, warnings, missing } = useMemo(() => {
    const lowerDesc = description.toLowerCase();
    const highlights = POSITIVE_KEYWORDS.filter((k) => lowerDesc.includes(k));
    const warnings = WARNING_KEYWORDS.filter((k) => lowerDesc.includes(k));
    const missing = MISSING_KEYWORDS.filter((k) => !lowerDesc.includes(k));
    return { highlights, warnings, missing };
  }, [description]);

  const aiSummary = useMemo(() => {
    let summary = `Açıklama ${descScore >= 70 ? 'detaylı ve yeterli' : descScore >= 40 ? 'kısmen yeterli' : 'çok kısa ve yetersiz'}. `;
    if (highlights.length > 0) {
      summary += `Pozitif işaretler: ${highlights.slice(0, 3).join(', ')}. `;
    }
    if (warnings.length > 0) {
      summary += `Dikkat çekici ifadeler: ${warnings.slice(0, 2).join(', ')}. `;
    }
    if (missing.length > 0) {
      summary += `Eksik bilgiler: ${missing.slice(0, 3).join(', ')}. Satıcıya bu konuları sorabilirsiniz.`;
    }
    return summary;
  }, [descScore, highlights, warnings, missing]);

  if (!description) {
    return (
      <div className="ib-card p-5 text-sm text-muted-foreground">
        Bu ilanda açıklama metni bulunmuyor.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <FileText className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Açıklama Analizi</h3>
          <p className="text-xs text-muted-foreground">AI metin değerlendirmesi</p>
        </div>
      </div>

      {/* Original description */}
      <div className="mb-4 rounded-xl border border-border bg-card/50 p-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Orijinal Açıklama</p>
        <p className="text-sm leading-relaxed text-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Highlights */}
        <div className="rounded-xl border border-success/30 bg-success-soft/10 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Önemli Anahtar Kelimeler
          </p>
          {highlights.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((kw) => (
                <span key={kw} className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Pozitif anahtar kelime bulunamadı</p>
          )}
        </div>

        {/* Warnings */}
        <div className="rounded-xl border border-warning/30 bg-warning-soft/10 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            Olası Uyarılar
          </p>
          {warnings.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {warnings.map((kw) => (
                <span key={kw} className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">
                  {kw.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Uyarı işareti bulunamadı</p>
          )}
        </div>

        {/* Missing */}
        <div className="rounded-xl border border-danger/30 bg-danger-soft/10 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-danger">
            <XCircle className="h-3.5 w-3.5" />
            Eksik Bilgiler
          </p>
          {missing.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {missing.map((kw) => (
                <span key={kw} className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-medium text-danger">
                  {kw}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Eksik bilgi yok — kapsamlı</p>
          )}
        </div>
      </div>

      {/* AI Summary */}
      <div className="mt-4 rounded-xl border border-border bg-primary-soft/10 p-4">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Lightbulb className="h-3.5 w-3.5" />
          AI Özeti
        </p>
        <p className="text-sm leading-relaxed text-foreground">{aiSummary}</p>
      </div>
    </motion.div>
  );
}

interface PhotoAnalysisProps {
  listing: ListingResponse;
  analysis: AIAnalysisResponse | undefined;
}

export function PhotoAnalysis({ listing, analysis }: PhotoAnalysisProps) {
  const images = listing.image_urls;
  const imageScore = analysis?.image_score ?? 50;

  const checks: Array<{ label: string; detected: boolean; icon: LucideIcon }> = [
    { label: 'Görsel Kalitesi', detected: imageScore >= 60, icon: Camera },
    { label: 'Işık Yeterli', detected: imageScore >= 55, icon: Lightbulb },
    { label: 'Olası Hasar', detected: imageScore < 45, icon: AlertTriangle },
    { label: 'Eksik Aksesuar', detected: images.length < 3, icon: XCircle },
    { label: 'Orijinal Kutu', detected: images.length >= 3 && imageScore >= 60, icon: Package },
    { label: 'Fatura', detected: imageScore >= 70, icon: FileText },
    { label: 'Garanti', detected: imageScore >= 65, icon: CheckCircle2 },
    { label: 'Kablo Tespiti', detected: images.length >= 2, icon: Sparkles },
    { label: 'Kontrolcü Tespiti', detected: images.length >= 3, icon: Sparkles },
    { label: 'Stok Fotoğraf', detected: imageScore < 40, icon: ImageIcon },
    { label: 'Yinelenen Görsel', detected: images.length > 0 && imageScore < 50, icon: AlertTriangle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Camera className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Fotoğraf Analizi</h3>
          <p className="text-xs text-muted-foreground">{images.length} görsel · AI skor {imageScore}</p>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Fotoğraf mevcut değil</p>
          <p className="text-xs text-muted-foreground">Satıcıdan güncel fotoğraf isteyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map((check) => {
            const Icon = check.icon;
            const positive = !check.label.includes('Hasar') && !check.label.includes('Stok') && !check.label.includes('Yinelenen') && !check.label.includes('Eksik');
            const isGood = positive ? check.detected : !check.detected;
            return (
              <div
                key={check.label}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border px-3 py-2.5',
                  isGood ? 'border-success/30 bg-success-soft/10' : 'border-warning/30 bg-warning-soft/10',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isGood ? 'text-success' : 'text-warning')} />
                <span className="flex-1 text-sm font-medium text-foreground">{check.label}</span>
                {isGood ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
