import { describe, expect, it } from 'vitest';
import {
  applyCommonTurkishTypos,
  autoCorrectTurkishText,
  isMeaningfulTextCorrection,
  normalizeTurkishTypography,
  toTurkishSentenceCase,
} from '@/features/listings/lib/turkish-text-autocorrect';

describe('turkish-text-autocorrect', () => {
  it('normalizes typography', () => {
    expect(normalizeTurkishTypography('Merhaba  ,dünya')).toBe('Merhaba, dünya');
  });

  it('fixes common typos', () => {
    expect(applyCommonTurkishTypos('yatirim ve girisim icin')).toContain('yatırım');
    expect(applyCommonTurkishTypos('yatirim ve girisim icin')).toContain('girişim');
    expect(applyCommonTurkishTypos('yatirim ve girisim icin')).toContain('için');
  });

  it('applies title mode', () => {
    expect(autoCorrectTurkishText('martı döner ortak arıyor', 'title')).toBe(
      'Martı Döner Ortak Arıyor',
    );
  });

  it('applies sentence case for body', () => {
    const out = toTurkishSentenceCase('merhaba. bu bir test.');
    expect(out.startsWith('Merhaba')).toBe(true);
    expect(out).toContain('Bu bir test');
  });

  it('auto-corrects body text end to end', () => {
    const out = autoCorrectTurkishText('yatirim ariyoruz. musteri odaklıyız.', 'body');
    expect(out).toContain('Yatırım');
    expect(out).toContain('Müşteri');
  });

  it('treats trailing-period-only as not meaningful', () => {
    const original =
      'Çağrı merkezi sektöründe çalışmış, özellikle sigorta konusunda tecrübeli müşteri temsilcisi arıyorum';
    const withPeriod = `${original}.`;
    expect(isMeaningfulTextCorrection(original, withPeriod)).toBe(false);
    expect(isMeaningfulTextCorrection(original, original)).toBe(false);
  });

  it('treats typo fixes as meaningful', () => {
    expect(
      isMeaningfulTextCorrection('yatirim ariyoruz', 'Yatırım arıyoruz.'),
    ).toBe(true);
  });
});
