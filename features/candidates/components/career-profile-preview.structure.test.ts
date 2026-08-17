import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../../..');

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('CareerProfilePreview hire card structure', () => {
  const source = read('features/candidates/components/CareerProfilePreview.tsx');
  const listingMain = read('components/girisimco/listing/listing-main-content.tsx');
  const mapper = read('features/listings/mappers/listing-detail.mapper.ts');

  it('keeps hire and seeker on the same card with a hire-only branch', () => {
    expect(source).toContain("const isHire = data.variant === 'hire'");
    expect(source).toContain("{isHire ? (");
    expect(source).toContain("title={isHire ? 'Pozisyon özeti' : 'Kariyer özeti'}");
  });

  it('uses a single pozisyon özeti and does not repeat iş tanımı', () => {
    expect(source.split("Pozisyon özeti").length - 1).toBe(1);
    expect(source).not.toContain('İş tanımı');
    expect(source).not.toContain('bg-muted/30');
  });

  it('renders hire sections in the requested hierarchy', () => {
    const summary = source.indexOf("title={isHire ? 'Pozisyon özeti' : 'Kariyer özeti'}");
    const profile = source.indexOf('title="Aranan profil"');
    const duties = source.indexOf('title="Pozisyon sorumlulukları"');
    const skills = source.indexOf('title="Aranan yetkinlikler"');
    const conditions = source.indexOf('title="Çalışma koşulları"');
    expect(summary).toBeGreaterThan(0);
    expect(profile).toBeGreaterThan(summary);
    expect(duties).toBeGreaterThan(profile);
    expect(skills).toBeGreaterThan(duties);
    expect(conditions).toBeGreaterThan(skills);
  });

  it('keeps seeker-only career sections out of the hire branch', () => {
    expect(source).toContain('title="Uzmanlık alanları"');
    expect(source).toContain('title="Mesleki yetkinlikler"');
    expect(source).toContain('title="Teknik yetkinlikler"');
    expect(source).toContain('title="Kariyer deneyimi"');
    expect(source).toContain('title="Eğitim"');
    expect(source).toContain('Kariyer gelişimi:');
    expect(source).not.toContain("title={isHire ? 'Sektör'");
    expect(source).not.toContain("title={isHire ? 'Aranan mesleki yetkinlikler'");
    expect(source).not.toContain("title={isHire ? 'Eğitim beklentisi'");
  });

  it('does not change public CTA or KVKK gating', () => {
    expect(source).toContain("const ctaLabel = 'İletişim Talebi Gönder'");
    expect(source).toContain('identityGated={chrome?.identityGated ?? !isHire}');
    expect(listingMain).toContain("identityGated: listing.identityRedacted || listing.category.id === 'find-job'");
  });

  it('preserves hire structured fields in the mapper for later role matching', () => {
    expect(mapper).toContain("variant: 'hire'");
    expect(mapper).toContain('desiredRole');
    expect(mapper).toContain('requiredResponsibilities');
    expect(mapper).toContain('requiredAchievements');
    expect(mapper).toContain('professionalSkills');
    expect(mapper).toContain('technicalSkills');
    expect(mapper).toContain('primarySector');
    expect(mapper).toContain('experienceLevel');
  });
});
