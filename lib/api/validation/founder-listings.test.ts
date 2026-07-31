import { describe, it, expect } from 'vitest';
import {
  parseFounderListingCreate,
  parseFounderListingBrowseQuery,
} from '@/lib/api/validation/founder-listings';

describe('founder-listings validation', () => {
  it('parses create payload', () => {
    const parsed = parseFounderListingCreate({
      title: 'CTO Ortak Aranıyor',
      shortDescription: 'Fintech MVP için teknik kurucu ortağı arıyoruz',
      city: 'Istanbul',
      sector: 'Fintech',
      startupStage: 'mvp',
      requiredSkills: ['React'],
      contactEmail: 'founder@example.com',
    });

    expect(parsed.title).toBe('CTO Ortak Aranıyor');
    expect(parsed.requiredSkills).toEqual(['React']);
  });

  it('parses browse query with comma-separated skills', () => {
    const parsed = parseFounderListingBrowseQuery({
      city: 'Istanbul',
      skills: 'react,node',
    });

    expect(parsed.skills).toEqual(['react', 'node']);
  });
});
