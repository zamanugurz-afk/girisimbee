/**
 * Deterministic mock data utilities — no external faker dependency.
 */
import { mockUuid, resetMockCounter, timestamps } from '@/lib/domain/factory';

export { mockUuid, resetMockCounter, timestamps };

const TURKISH_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
] as const;

const INDUSTRIES = [
  'SaaS', 'Fintech', 'E-ticaret', 'Yapay Zeka', 'Sağlık Teknolojisi', 'EdTech', 'Lojistik',
] as const;

const SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Product Management', 'Growth', 'Sales', 'Finance',
] as const;

export function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

export function pickCity(index: number): string {
  return pick(TURKISH_CITIES, index);
}

export function pickIndustry(index: number): string {
  return pick(INDUSTRIES, index);
}

export function pickSkills(index: number, count = 3): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push(pick(SKILLS, index + i));
  }
  return [...new Set(result)];
}

export function loremWords(count: number): string {
  const words = [
    'girişim', 'yatırım', 'büyüme', 'platform', 'teknoloji', 'ekip', 'pazar', 'ürün',
    'müşteri', 'gelir', 'strateji', 'inovasyon', 'ortaklık', 'işe alım', 'seri-a',
  ];
  return Array.from({ length: count }, (_, i) => pick(words, i)).join(' ');
}
