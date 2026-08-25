import { describe, expect, it } from 'vitest';
import {
  isMeaninglessContent,
  normalizeListingDescription,
  normalizeListingTitle,
  validateListingQualityHard,
  evaluateListingContentQuality,
} from '@/features/listings/lib/listing-content-quality';

describe('listing-content-quality', () => {
  it('TEST 1 title case', () => {
    expect(normalizeListingTitle('yatırımcı arıyoruz')).toBe('Yatırımcı Arıyoruz');
  });

  it('TEST 2 all caps', () => {
    expect(normalizeListingTitle('YATIRIMCI ARIYORUZ')).toBe('Yatırımcı Arıyoruz');
  });

  it('TEST 2b mixed caps with common words and acronyms', () => {
    expect(normalizeListingTitle('Kağıt fABRİKASINA ORTAK aRIYORUM')).toBe(
      'Kağıt Fabrikasına Ortak Arıyorum',
    );
    expect(normalizeListingTitle('b2b yapay zeka saas cto arıyoruz')).toBe(
      'B2B Yapay Zeka SaaS CTO Arıyoruz',
    );
  });

  it('TEST 3 multi-word title', () => {
    expect(normalizeListingTitle('fintech girişimimize yatırımcı arıyoruz')).toBe(
      'FinTech Girişimimize Yatırımcı Arıyoruz',
    );
  });

  it('TEST 4 preserves AI and SaaS', () => {
    expect(normalizeListingTitle('AI VE SAAS PLATFORMU')).toBe('AI ve SaaS Platformu');
  });

  it('TEST 5 description sentence breaks and typos', () => {
    const out = normalizeListingDescription(
      'istanbulda yatırımcı arıyoruz yatırımımızı büyütmek istiyoruz',
    );
    expect(out).toMatch(/İstanbul'da/i);
    expect(out).toMatch(/arıyoruz\./i);
    expect(out).toMatch(/Yatırımımızı/i);
  });

  it('TEST 5b fixes MVP, suffix consonant stutters and Turkish word integrity', () => {
    const out = normalizeListingDescription(
      'Mvp aşamasındadd olan firmamız için yatırım arıyoruz.',
    );
    expect(out).toBe('MVP aşamasında olan firmamız için yatırım arıyoruz.');
  });

  it('TEST 5c fixes B2B SaaS acronyms and typos in body', () => {
    const out = normalizeListingDescription(
      'b2b saas girisimimizze ve cto arıyoruz',
    );
    expect(out).toBe('B2B SaaS girişimimize ve CTO arıyoruz.');
  });

  it('TEST 6 strips title trailing bangs', () => {
    expect(normalizeListingTitle('Yatırımcı Arıyoruz!!!')).toBe('Yatırımcı Arıyoruz');
  });

  it('TEST 7 rejects asdfghhhhhhh', () => {
    expect(isMeaninglessContent('asdfghhhhhhh')).toBe(true);
    expect(
      validateListingQualityHard({ title: 'asdfghhhhhhh' }).some((i) => i.code === 'meaningless'),
    ).toBe(true);
  });

  it('TEST 8 rejects aaaaaaaaaaaaaaaa', () => {
    expect(isMeaninglessContent('aaaaaaaaaaaaaaaa')).toBe(true);
  });

  it('accepts real Turkish job description at min length', () => {
    const longDescription =
      'Çağrı merkezi sektöründe çalışmış, özellikle sigorta konusunda tecrübeli müşteri temsilcisi arıyorum';
    expect(longDescription.length).toBe(100);
    expect(isMeaninglessContent(longDescription)).toBe(false);
    expect(
      validateListingQualityHard({ longDescription }).some((i) => i.code === 'meaningless'),
    ).toBe(false);
  });

  it('accepts other real Turkish listing blurbs', () => {
    expect(
      isMeaninglessContent(
        'B2B SaaS ürünümüze teknik kurucu ortak arıyorum. Ürün geliştirme ve ekip yönetimi deneyimi önemli.',
      ),
    ).toBe(false);
    expect(
      isMeaninglessContent(
        'İstanbul Anadolu yakasında franchise şube hakkı veriyoruz. Yatırım ve lokasyon detayları ilanda.',
      ),
    ).toBe(false);
  });

  it('TEST 9 rejects word spam', () => {
    expect(
      validateListingQualityHard({
        title: 'Yatırım yatırım yatırım yatırım',
      }).some((i) => i.code === 'spam_repeat'),
    ).toBe(true);
  });

  it('TEST 10 rejects profanity without echoing term', () => {
    const issues = validateListingQualityHard({ title: 'Bu ilan siktir git' });
    expect(issues.some((i) => i.code === 'profanity')).toBe(true);
    expect(issues[0]?.message).not.toMatch(/siktir/i);
  });

  it('TEST 11 accepts AI SaaS title', () => {
    const title = normalizeListingTitle('AI tabanlı SaaS platformu');
    expect(title).toContain('AI');
    expect(title).toContain('SaaS');
    expect(validateListingQualityHard({ title }).length).toBe(0);
  });

  it('TEST 12 strips emojis from title', () => {
    expect(normalizeListingTitle('🚀🔥🔥🔥 YATIRIMCI ARIYORUZ 🔥🔥🔥')).toBe(
      'Yatırımcı Arıyoruz',
    );
  });

  it('TEST 13 Turkish diacritics', () => {
    expect(normalizeListingTitle('Yatirimci ariyoruz')).toBe('Yatırımcı Arıyoruz');
  });

  it('evaluate returns suggestions without forcing', () => {
    const result = evaluateListingContentQuality({
      title: 'yatirimci ariyoruz',
      applyNormalization: false,
    });
    expect(result.suggestions.some((s) => s.field === 'title')).toBe(true);
    expect(result.normalized.title).toBe('Yatırımcı Arıyoruz');
  });

  it('does not suggest when only a trailing period would be added', () => {
    const longDescription =
      'Çağrı merkezi sektöründe çalışmış, özellikle sigorta konusunda tecrübeli müşteri temsilcisi arıyorum';
    const result = evaluateListingContentQuality({
      longDescription,
      applyNormalization: false,
    });
    expect(result.suggestions.some((s) => s.field === 'longDescription')).toBe(false);
    expect(result.normalized.longDescription.endsWith('.')).toBe(true);
  });
});
