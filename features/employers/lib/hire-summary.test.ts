import { describe, expect, it } from 'vitest';
import { findCareerProfileContentViolation } from '@/features/candidates/lib/career-profile-content-policy';
import { buildHiringSummaryDraft } from './hire-summary';

describe('buildHiringSummaryDraft', () => {
  it('builds an editable Turkish job posting from hire form fields', () => {
    const draft = buildHiringSummaryDraft({
      desiredRole: 'Full-stack geliştirici',
      experienceLevel: 'Senior',
      primarySector: 'Bilişim / Yazılım',
      workType: 'Tam zamanlı',
      professionalSkills: 'Yazılım geliştirme · Kod incelemesi',
      technicalSkills: 'TypeScript · React',
      educationLevel: 'Lisans',
      educationField: 'Bilgisayar Mühendisliği',
      preferredCity: 'İstanbul',
      workplacePreference: 'Hibrit',
      availability: '1 ay içinde',
      salaryRange: '75.000 - 100.000 TL',
      requiredResponsibilities: 'Yazılım özelliklerinin geliştirilmesi · API tasarımı',
    });

    expect(draft).toMatch(/Full-stack geliştirici/);
    expect(draft).toMatch(/arıyoruz/i);
    expect(draft).toMatch(/TypeScript|React|Yazılım/);
    expect(draft).not.toMatch(/Aranan yetkinlikler/);
    expect(draft).not.toMatch(/Eğitim beklentisi/);
    expect(draft).not.toMatch(/Dil beklentisi/);
    expect(draft).not.toMatch(/Rolde .+\s+sorumlulukları bekleniyor/);
    expect(draft.length).toBeGreaterThanOrEqual(100);
    expect(draft).not.toMatch(/@|https?:\/\//i);
    expect(draft).not.toMatch(/telefon ile ulaşır/i);
    expect(findCareerProfileContentViolation(draft)).toBeNull();
  });

  it('still produces a usable draft when only the role is present', () => {
    const draft = buildHiringSummaryDraft({ desiredRole: 'Hemşire' });
    expect(draft).toMatch(/Hemşire/);
    expect(draft).toMatch(/arıyoruz/i);
    expect(draft.length).toBeGreaterThanOrEqual(100);
  });

  it('reads as a short job ad instead of a labeled field dump', () => {
    const draft = buildHiringSummaryDraft({
      desiredRole: 'Bankacı / banka personeli',
      experienceLevel: 'Mid',
      primarySector: 'Finans / Bankacılık',
      workType: 'Tam zamanlı',
      professionalSkills: 'Takım çalışması · Liderlik · Ürün bilgisi',
      technicalSkills: 'Banka çekirdek sistemi',
      tools: 'Excel · Outlook',
      educationLevel: 'Lisans',
      educationField: 'Bankacılık ve Sigortacılık',
      languages: 'İngilizce — İyi',
      preferredCity: 'İstanbul Anadolu Yakası',
      preferredDistrict: 'Kadıköy',
      workplacePreference: 'Hibrit',
      availability: '1 ay içinde',
      salaryRange: '50.000 - 75.000 TL',
      requiredResponsibilities:
        'Şube müşteri işlemlerinin karşılanması · Hesap, kart ve başvuru süreçlerinin yürütülmesi',
    });

    expect(draft).toMatch(/Finans ve bankacılık alanında/);
    expect(draft).toMatch(/Görev kapsamında/);
    expect(draft).toMatch(/öne çıkıyor/);
    expect(draft).toMatch(/Kadıköy/);
    expect(draft).toMatch(/Excel/);
    expect(draft).toMatch(/mezuniyeti/);
    expect(draft).not.toMatch(/Aranan yetkinlikler|Eğitim beklentisi|Dil beklentisi/);
    expect(findCareerProfileContentViolation(draft)).toBeNull();
  });

  it('includes company name if provided', () => {
    const draft = buildHiringSummaryDraft({
      companyName: 'Acıbadem Sağlık Grubu',
      desiredRole: 'Eczane Teknisyeni',
      primarySector: 'Sağlık',
    });
    expect(draft).toMatch(/Acıbadem Sağlık Grubu bünyesinde/);
    expect(draft).toMatch(/Eczane Teknisyeni/);
  });
});
