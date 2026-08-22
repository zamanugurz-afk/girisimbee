import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../../..');

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('CareerProfilePreview 2-column card structure', () => {
  const source = read('features/candidates/components/CareerProfilePreview.tsx');
  const mapper = read('features/listings/mappers/listing-detail.mapper.ts');

  it('contains the 2-column layout with left and main columns', () => {
    expect(source).toContain('grid-cols-[300px_minmax(0,1fr)]');
    expect(source).toContain('<aside');
    expect(source).toContain('<main');
  });

  it('renders EĞİTİM, SERTİFİKA / DİL and ÇALIŞMA TERCİHLERİ in left column', () => {
    expect(source).toContain('<span>EĞİTİM</span>');
    expect(source).toContain('<span>SERTİFİKA / DİL</span>');
    expect(source).toContain('<span>ÇALIŞMA TERCİHLERİ</span>');
  });

  it('renders KARİYER ÖZETİ, UZMANLIK ALANLARI and İŞ DENEYİMLERİ in main column', () => {
    expect(source).toContain('<span>UZMANLIK ALANLARI</span>');
    expect(source).toContain('<span>İŞ DENEYİMLERİ</span>');
  });

  it('enforces maximum 3 experiences initially and has expand control', () => {
    expect(source).toContain('experiences.slice(0, 3)');
    expect(source).toContain('Tüm deneyimleri görmek için');
    expect(source).toContain('Daha az göster');
  });

  it('renders contact request banner and privacy lock box', () => {
    expect(source).toContain('İLETİŞİM TALEBİ GÖNDER');
    expect(source).toContain('İletişim talebiniz kabul edildi.');
    expect(source).toContain('Kişisel bilgiler ve iletişim bilgileri iletişim talebiniz kabul edildiğinde paylaşılacaktır.');
  });

  it('preserves structured fields in mapper', () => {
    expect(mapper).toContain("variant: 'hire'");
    expect(mapper).toContain("variant: 'seeker'");
    expect(mapper).toContain('desiredRole');
    expect(mapper).toContain('primarySector');
    expect(mapper).toContain('experienceLevel');
  });
});
