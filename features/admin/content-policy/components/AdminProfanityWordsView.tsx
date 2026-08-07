'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminEmptyState } from '@/features/admin/panel/components/AdminEmptyState';
import { AdminPageShell } from '@/features/admin/panel/components/AdminPageShell';
import {
  cloneProfanityWords,
  createProfanityWordId,
  replaceProfanityWords,
  type ProfanityWord,
} from '@/features/admin/content-policy/mock/profanity-words.mock';

export function AdminProfanityWordsView() {
  const [words, setWords] = useState<ProfanityWord[]>(() => cloneProfanityWords());
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return words
      .filter((row) => !q || row.term.toLocaleLowerCase('tr-TR').includes(q))
      .sort((a, b) => a.term.localeCompare(b.term, 'tr'));
  }, [words, query]);

  function persist(next: ProfanityWord[]) {
    setWords(next);
    replaceProfanityWords(next);
  }

  function handleAdd() {
    const term = draft.trim().toLocaleLowerCase('tr-TR');
    if (!term) {
      toast.error('Kelime gerekli.');
      return;
    }
    if (words.some((row) => row.term === term)) {
      toast.error('Bu kelime zaten listede.');
      return;
    }
    const now = new Date().toISOString();
    persist([
      {
        id: createProfanityWordId(),
        term,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      ...words,
    ]);
    setDraft('');
    toast.success('Kelime eklendi (mock)');
  }

  function toggleStatus(id: string) {
    persist(
      words.map((row) =>
        row.id === id
          ? {
              ...row,
              status: row.status === 'active' ? 'inactive' : 'active',
              updatedAt: new Date().toISOString(),
            }
          : row,
      ),
    );
  }

  function removeWord(id: string) {
    persist(words.filter((row) => row.id !== id));
    toast.success('Kelime silindi (mock)');
  }

  return (
    <AdminPageShell
      title="Küfür / engelli kelimeler"
      description="İlan başlık ve açıklamalarında engellenecek kelimeleri yönetin. Değişiklikler anında form doğrulamasına yansır (mock)."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Yeni kelime…"
          className="sm:max-w-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" onClick={handleAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Ekle
        </Button>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Listede ara…"
          className="sm:ml-auto sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState title="Kelime yok" description="Liste boş veya arama sonucu bulunamadı." />
      ) : (
        <ul className="divide-y divide-border/60 rounded-2xl border border-border/80 bg-card">
          {filtered.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
            >
              <span className="min-w-0 flex-1 font-medium text-foreground">{row.term}</span>
              <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>
                {row.status === 'active' ? 'Aktif' : 'Pasif'}
              </Badge>
              <Button type="button" variant="outline" size="sm" onClick={() => toggleStatus(row.id)}>
                {row.status === 'active' ? 'Pasifleştir' : 'Aktifleştir'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => removeWord(row.id)}
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AdminPageShell>
  );
}
