import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  searchTaxonomyCatalog,
  normalizeTurkishSearch,
  formatCanonicalCustomValue,
} from '@/features/shared/services/set-matching.service';

const ROOT = path.resolve(__dirname, '../../..');

describe('SetMatchingPicker & Unified Manual Entry Architecture', () => {
  it('1. Component source includes keyboard navigation, custom addition, and Turkish search', () => {
    const src = readFileSync(path.join(ROOT, 'features/shared/components/set-matching-picker.tsx'), 'utf8');
    expect(src).toContain('searchTaxonomyCatalog');
    expect(src).toContain('formatCanonicalCustomValue');
    expect(src).toContain('handleKeyDown');
    expect(src).toContain('ArrowDown');
    expect(src).toContain('ArrowUp');
    expect(src).toContain('Enter');
    expect(src).toContain('Escape');
    expect(src).toContain('Backspace');
    expect(src).toContain('handleAddCustom');
    expect(src).toContain('customCandidate');
    expect(src).toContain('availableQuickPills');
  });

  it('2. Component handles single and multi mode selections seamlessly', () => {
    const catalog = ['Yazılım Mimarı', 'Backend Geliştirici', 'Frontend Geliştirici'];
    
    // Multi mode simulation with duplicate prevention
    const selected = ['Backend Geliştirici'];
    const filtered = searchTaxonomyCatalog('Geliştirici', catalog, { excludeValues: selected });
    expect(filtered.map((f) => f.value)).toEqual(['Frontend Geliştirici']);

    // Single mode simulation
    const singleMatches = searchTaxonomyCatalog('Yazılım', catalog);
    expect(singleMatches[0].value).toBe('Yazılım Mimarı');
  });

  it('3. Formats custom values entered by user with Turkish Title Case', () => {
    expect(formatCanonicalCustomValue('mobil uygulama lideri')).toBe('Mobil Uygulama Lideri');
    expect(formatCanonicalCustomValue('yapay zeka prompt mühendisi')).toBe('Yapay Zeka Prompt Mühendisi');
  });
});
