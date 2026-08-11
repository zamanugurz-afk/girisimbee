/** Admin-managed profanity / block terms (mock in-memory store). */

export type ProfanityWordStatus = 'active' | 'inactive';

export interface ProfanityWord {
  id: string;
  term: string;
  status: ProfanityWordStatus;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PROFANITY_SEED: Omit<ProfanityWord, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { term: 'amk', status: 'active' },
  { term: 'aq', status: 'active' },
  { term: 'orospu', status: 'active' },
  { term: 'siktir', status: 'active' },
  { term: 'sikerim', status: 'active' },
  { term: 'yarrak', status: 'active' },
  { term: 'piç', status: 'active' },
  { term: 'pezevenk', status: 'active' },
  { term: 'kahpe', status: 'active' },
  { term: 'ibne', status: 'active' },
  { term: 'gavat', status: 'active' },
  { term: 'salak', status: 'active' },
  { term: 'aptal', status: 'active' },
  { term: 'gerizekalı', status: 'active' },
  { term: 'oç', status: 'active' },
  { term: 'amına', status: 'active' },
  { term: 'fuck', status: 'active' },
  { term: 'shit', status: 'active' },
  { term: 'bitch', status: 'active' },
  { term: 'porn', status: 'active' },
  { term: 'porno', status: 'active' },
  { term: 'xxx', status: 'active' },
  { term: 'nude', status: 'active' },
];

function stamp(): string {
  return new Date().toISOString();
}

function seedWords(): ProfanityWord[] {
  const now = stamp();
  return DEFAULT_PROFANITY_SEED.map((row, index) => ({
    id: `pw-${index + 1}`,
    term: row.term,
    status: row.status,
    createdAt: now,
    updatedAt: now,
  }));
}

let store: ProfanityWord[] = seedWords();

export function cloneProfanityWords(): ProfanityWord[] {
  return store.map((row) => ({ ...row }));
}

export function getActiveProfanityTerms(): string[] {
  return store.filter((row) => row.status === 'active').map((row) => row.term);
}

export function replaceProfanityWords(next: ProfanityWord[]): void {
  store = next.map((row) => ({ ...row }));
}

export function createProfanityWordId(): string {
  return `pw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
