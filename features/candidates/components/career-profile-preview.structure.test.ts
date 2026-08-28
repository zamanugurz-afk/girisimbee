import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { valuesFromCareerSource } from '@/features/career-profile/completion';

const ROOT = path.resolve(__dirname, '../../..');

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('CareerProfilePreview 2-column card structure & Design System Compliance', () => {
  const source = read('features/candidates/components/CareerProfilePreview.tsx');
  const mapper = read('features/listings/mappers/listing-detail.mapper.ts');

  it('1. contains the 2-column layout with left (aside) and main columns', () => {
    expect(source).toContain('lg:grid-cols-[280px_minmax(0,1fr)]');
    expect(source).toContain('<aside');
    expect(source).toContain('<main');
  });

  it('2. uses clean typography for profile identity without photo/avatar images', () => {
    // Ensure identity card does not embed photo img tags
    expect(source).not.toContain('<img src={data.avatarUrl}');
  });

  it('3. renders EĞİTİM, SERTİFİKA / DİL and ÇALIŞMA TERCİHLERİ in left column', () => {
    expect(source).toContain("<span>{isHire ? 'ARANAN EĞİTİM' : 'EĞİTİM'}</span>");
    expect(source).toContain("<span>{isHire ? 'ARANAN DİL & SERTİFİKA' : 'SERTİFİKA / DİL'}</span>");
    expect(source).toContain("<span>{isHire ? 'ÇALIŞMA ŞARTLARI' : 'ÇALIŞMA TERCİHLERİ'}</span>");
  });

  it('4. renders KARİYER ÖZETİ, UZMANLIK ALANLARI and İŞ DENEYİMLERİ in main column', () => {
    expect(source).toContain("<span>{isHire ? 'POZİSYON ÖZETİ' : 'KARİYER ÖZETİ'}</span>");
    expect(source).toContain('<span>UZMANLIK ALANLARI</span>');
    expect(source).toContain('<span>İŞ DENEYİMLERİ</span>');
  });

  it('5. enforces compact experiences initially and has expand/collapse control', () => {
    expect(source).toContain('expandedExperiences');
    expect(source).toContain('diğer deneyimi göster');
    expect(source).toContain('Daha az göster');
    expect(source).toContain('experiences.length > INITIAL_EXPERIENCE_LIMIT');
  });

  it('6. uses framed card boxes with theme number nodes for experiences', () => {
    expect(source).toContain('theme.numNode');
    expect(source).toContain('rounded-xl border border-slate-200/90 bg-slate-50/50');
  });

  it('7. uses categorized logo icons and clean typography for skills with deduplication', () => {
    expect(source).toContain('getSkillIcon');
    expect(source).toContain('dedupeStrings');
    expect(source).toContain('rankSkillsByRoleAndSector');
  });

  it('8. renders contact request banner and actions at the bottom of the card', () => {
    expect(source).toContain('İLETİŞİM TALEBİ GÖNDER');
    expect(source).toContain('İletişim talebiniz kabul edildi.');
  });

  it('9. does NOT render "Sonraki Adım" or "Deneyim Ekle" in public preview card', () => {
    expect(source).not.toContain('Sonraki Adım');
    expect(source).not.toContain('Deneyim Ekle');
  });

  it('10. verifies end-to-end data transformation into safe preview input', () => {
    const customFields = formValuesToCustomFields('seek', {
      role: 'Çağrı Merkezi Operasyonları Direktörü',
      sector: 'Finans',
      experienceLevel: 'Direktör',
      workType: 'Tam zamanlı',
      workplacePreference: 'Hibrit',
      availability: 'Hemen',
      city: 'İstanbul',
      residenceCity: 'İstanbul',
      residenceDistrict: 'Maltepe',
      candidateTraits: '19 yıllık kurumsal yönetim deneyimi...',
      professionalSkills: 'Satış Yönetimi, Çağrı Merkezi Yönetimi',
      educationLevel: 'Lisans',
      educationField: 'İşletme',
      educationHistory: [
        { level: 'Lisans', school: 'Marmara Üniversitesi', field: 'İşletme', graduationYear: 2004 },
      ],
      certificates: 'SEGEM, BES',
      languages: 'Türkçe (Ana dil), İngilizce (İleri)',
      experiences: [
        {
          role: 'Çağrı Merkezi Operasyonları Direktörü',
          company: 'ABC Holding',
          sector: 'Finans',
          duration: '3 yıl',
          responsibilities: 'Saha satış yönetimi.',
          startYear: 2020,
          isCurrent: true,
        },
      ],
    });

    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: { city: 'İstanbul', location: 'İstanbul', customFields },
      displayName: 'Uğur Zaman',
    });

    expect(preview.desiredRole).toBe('Çağrı Merkezi Operasyonları Direktörü');
    expect(preview.primarySector).toBe('Finans');
    expect(preview.experienceLevel).toBe('Üst Düzey Yönetici');
    expect(preview.residenceCity).toBe('İstanbul');
    expect(preview.residenceDistrict).toBe('Maltepe');
    expect(preview.educationHistory?.length).toBe(1);
    expect(preview.experiences?.length).toBe(1);
    expect(preview.certificates).toContain('SEGEM');
    expect(preview.languages).toContain('İngilizce');
  });
});
