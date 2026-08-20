import { describe, expect, it } from 'vitest';
import {
  matchCanonicalPosition,
  matchCanonicalSector,
  mapCvToCanonicalTaxonomy,
} from '@/features/candidates/cv/cv-taxonomy-mapper';

describe('CV Canonical Taxonomy Mapping QA', () => {
  it('maps English and Turkish raw job titles to canonical taxonomy records in Title Case', () => {
    // 1. Sales roles
    expect(matchCanonicalPosition('Sales Executive').canonical).toBe('Satış Uzmanı');
    expect(matchCanonicalPosition('sales specialist').canonical).toBe('Satış Uzmanı');
    expect(matchCanonicalPosition('Sales Representative').canonical).toBe('Satış Temsilcisi');

    // 2. Tech roles
    expect(matchCanonicalPosition('Software Engineer').canonical).toBe('Yazılım Geliştirici');
    expect(matchCanonicalPosition('full stack developer').canonical).toBe('Full Stack Geliştirici');
    expect(matchCanonicalPosition('DevOps Engineer').canonical).toBe('DevOps Mühendisi');

    // 3. Marketing roles
    expect(matchCanonicalPosition('Marketing Specialist').canonical).toBe('Pazarlama Uzmanı');
    expect(matchCanonicalPosition('Digital Marketing Specialist').canonical).toBe('Dijital Pazarlama Uzmanı');

    // 4. Product & HR roles
    expect(matchCanonicalPosition('Product Manager').canonical).toBe('Ürün Yöneticisi');
    expect(matchCanonicalPosition('HR Specialist').canonical).toBe('İnsan Kaynakları Uzmanı');
  });

  it('maps sector variations and aliases to canonical Girişimbee sectors', () => {
    expect(matchCanonicalSector('IT').canonical).toBe('Bilişim / Yazılım');
    expect(matchCanonicalSector('Software').canonical).toBe('Bilişim / Yazılım');
    expect(matchCanonicalSector('Banking').canonical).toBe('Finans / Bankacılık');
    expect(matchCanonicalSector('Fintech').canonical).toBe('Finans / Bankacılık');
    expect(matchCanonicalSector('E-Commerce').canonical).toBe('E-ticaret / Pazaryeri');
    expect(matchCanonicalSector('Healthcare').canonical).toBe('Sağlık');
  });

  it('flags ambiguous items with candidate options for user confirmation without failing', () => {
    const payload = {
      experiences: [
        {
          role: 'Business Growth & Customer Success Lead',
          sector: 'SaaS',
          durationYears: 3,
          startYear: 2021,
          endYear: 2024,
        },
      ],
      roles: ['Business Growth & Customer Success Lead'],
      sectors: ['SaaS'],
      skills: ['TypeScript', 'Client Management'],
      tools: ['HubSpot'],
      education: [],
      languages: ['İngilizce'],
      certificates: [],
      locations: ['İstanbul'],
      summary: 'Deneyimli profesyonel.',
      ambiguousItems: [],
    };

    const result = mapCvToCanonicalTaxonomy(payload);

    expect(result.ambiguousItems.length).toBeGreaterThanOrEqual(1);
    expect(
      result.ambiguousItems.some((item) =>
        item.raw.includes('Business Growth & Customer Success Lead'),
      ),
    ).toBe(true);
    expect(result.canonicalConfidence).toBeLessThan(1.0);
  });
});
