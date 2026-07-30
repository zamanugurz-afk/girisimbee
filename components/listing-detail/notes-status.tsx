'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useListingNotes } from '@/hooks/use-listing-notes';
import {
  StickyNote,
  Pin,
  Trash2,
  Plus,
  Brain,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-warning-soft/30', border: 'border-warning/30' },
  { id: 'green', bg: 'bg-success-soft/30', border: 'border-success/30' },
  { id: 'blue', bg: 'bg-primary-soft/30', border: 'border-primary/30' },
  { id: 'red', bg: 'bg-danger-soft/30', border: 'border-danger/30' },
];

const COLOR_MAP = Object.fromEntries(NOTE_COLORS.map((c) => [c.id, c]));

interface NotesSectionProps {
  listingId: string;
}

export function NotesSection({ listingId }: NotesSectionProps) {
  const { notes, addNote, togglePin, deleteNote, isSaving } = useListingNotes(listingId);
  const [newNote, setNewNote] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote(newNote.trim(), selectedColor);
    setNewNote('');
    toast('Not eklendi');
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    toast('Not silindi');
  };

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="ib-card p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-soft text-warning">
          <StickyNote className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Notlar</h3>
          <p className="text-xs text-muted-foreground">Özel notlar · renk etiketleri</p>
        </div>
      </div>

      {/* Add note */}
      <div className="mb-4 space-y-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Not ekle…"
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition-all',
                  c.bg,
                  selectedColor === c.id ? 'border-primary ring-2 ring-primary/20' : 'border-border',
                )}
                aria-label={c.id}
              />
            ))}
          </div>
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Ekle
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <AnimatePresence>
          {sorted.map((note) => {
            const color = COLOR_MAP[note.color] ?? COLOR_MAP.yellow;
            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn('rounded-lg border p-3', color.bg, color.border)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm text-foreground">{note.text}</p>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className={cn(
                        'rounded p-1 transition-colors',
                        note.pinned ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                      )}
                      aria-label="Sabitle"
                    >
                      <Pin className={cn('h-3.5 w-3.5', note.pinned && 'fill-current')} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-danger"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {note.pinned && (
                  <span className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-primary">
                    <Pin className="h-2.5 w-2.5 fill-current" />
                    Sabitlendi
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {notes.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">Henüz not eklenmedi</p>
        )}
      </div>
    </motion.div>
  );
}

const PURCHASE_STATUSES = [
  { value: 'watching', label: 'İzleniyor', color: 'text-muted-foreground' },
  { value: 'interested', label: 'İlgileniyorum', color: 'text-primary' },
  { value: 'negotiating', label: 'Pazarlık Ediyorum', color: 'text-warning' },
  { value: 'meeting', label: 'Satıcı ile Görüşme', color: 'text-accent-foreground' },
  { value: 'purchased', label: 'Satın Alındı', color: 'text-success' },
  { value: 'rejected', label: 'Reddedildi', color: 'text-danger' },
];

interface PurchaseStatusSectionProps {
  listingId: string;
}

export function PurchaseStatusSection({ listingId }: PurchaseStatusSectionProps) {
  const { purchaseStatus, setPurchaseStatus, isSaving } = useListingNotes(listingId);
  const current = PURCHASE_STATUSES.find((s) => s.value === purchaseStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="ib-card p-6"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Tag className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Satın Alma Durumu</h3>
          <p className="text-xs text-muted-foreground">Bu ilanı nerede bıraktınız</p>
        </div>
      </div>

      <Select value={purchaseStatus} onValueChange={setPurchaseStatus} disabled={isSaving}>
        <SelectTrigger className="h-11 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PURCHASE_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {current && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm">
          <span className={cn('h-2 w-2 rounded-full bg-current', current.color)} />
          <span className={cn('font-medium', current.color)}>{current.label}</span>
        </div>
      )}
    </motion.div>
  );
}

interface AISummaryProps {
  listing: any;
  analysis: any;
  marketStats: any;
  seller: any;
}

export function AISummaryReport({ listing, analysis, marketStats, seller }: AISummaryProps) {
  const summary = generateSummary(listing, analysis, marketStats, seller);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="ib-card relative overflow-hidden border-l-4 border-l-primary p-6"
    >
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 -translate-y-8 translate-x-8" />
      <div className="relative">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">AI Özeti</h3>
            <p className="text-xs text-muted-foreground">Profesyonel satın alma raporu</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-4">
          <p className="text-sm leading-relaxed text-foreground">
            {analysis?.ai_summary ?? summary}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary-soft/10 px-4 py-2.5">
          <Brain className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-primary">
            Genel öneri: {getRecommendationLabel(analysis?.recommendation)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function generateSummary(listing: any, analysis: any, marketStats: any, seller: any): string {
  if (!listing || !analysis) return 'Analiz mevcut değil.';
  const median = marketStats?.median_price ?? listing.price;
  const diffPct = median > 0 ? Math.round(((listing.price - median) / median) * 1000) / 10 : 0;
  const sellerName = seller?.display_name ?? 'Satıcı';
  const trustScore = analysis.seller_score ?? 50;
  const imageScore = analysis.image_score ?? 50;
  const negProb = analysis.negotiation_score ?? 50;

  let summary = `Bu ilan şu an `;
  if (diffPct < 0) {
    summary += `piyasa ortalamasından %${Math.abs(diffPct).toFixed(1)} daha ucuz olarak fiyatlandırılmış. `;
  } else if (diffPct > 0) {
    summary += `piyasa ortalamasından %${diffPct.toFixed(1)} daha pahalı. `;
  } else {
    summary += `piyasa ortalamasına yakın fiyatlandırılmış. `;
  }

  summary += `Satıcı güveni ${trustScore}/100 seviyesinde ve ${sellerName} `;
  summary += trustScore >= 65 ? 'yüksek güvenilirlik profılı sergiliyor. ' : trustScore >= 40 ? 'orta düzey güvenilirlik gösteriyor. ' : 'düşük güvenilirlik profılı sergiliyor, dikkatli olun. ';

  summary += `Görseller ${imageScore >= 60 ? 'özgün ve yeterli görünüyor' : 'sınırlı veya düşük kalitede'}. `;
  summary += `Pazarlık kabul olasılığı %${negProb} olarak tahmin ediliyor. `;

  summary += `Genel öneri: ${getRecommendationLabel(analysis.recommendation)}.`;

  return summary;
}

function getRecommendationLabel(rec: string): string {
  const labels: Record<string, string> = {
    buy: 'HEMEN AL',
    negotiate: 'PAZARLIK ET',
    wait: 'BEKLE',
    avoid: 'KAÇIN',
  };
  return labels[rec] ?? 'BEKLE';
}
