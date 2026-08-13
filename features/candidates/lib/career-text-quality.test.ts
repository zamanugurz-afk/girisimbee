import { describe, expect, it } from 'vitest';
import { findCareerTextQualityIssue, suggestTitleCaseTr } from './career-text-quality';

describe('career text quality', () => {
  it('rejects empty and whitespace', () => {
    expect(findCareerTextQualityIssue('   ', { fieldLabel: 'Alan', required: true })).toMatch(
      /zorunlu/,
    );
    expect(findCareerTextQualityIssue('', { fieldLabel: 'Alan', required: true })).toMatch(
      /zorunlu/,
    );
  });

  it('rejects punctuation-only and repeated chars', () => {
    expect(findCareerTextQualityIssue('.......', { fieldLabel: 'Alan' })).toBeTruthy();
    expect(findCareerTextQualityIssue('aaaaaaa', { fieldLabel: 'Alan' })).toBeTruthy();
    expect(findCareerTextQualityIssue('11111111', { fieldLabel: 'Alan' })).toBeTruthy();
  });

  it('rejects obvious gibberish and profanity', () => {
    expect(findCareerTextQualityIssue('asdfgh', { fieldLabel: 'Alan' })).toBeTruthy();
    expect(findCareerTextQualityIssue('bu bir amk metni', { fieldLabel: 'Alan' })).toBeTruthy();
  });

  it('accepts valid Turkish professional text', () => {
    expect(
      findCareerTextQualityIssue('Satış hedeflerinin üzerinde performans', {
        fieldLabel: 'Alan',
        minLength: 10,
      }),
    ).toBeNull();
  });

  it('suggests title case without rewriting long prose', () => {
    expect(suggestTitleCaseTr('  satış   uzmanı ')).toBe('Satış Uzmanı');
    const long =
      'Son yıllarda saha satışında müşteri portföyü yönettim ve hedeflerin üzerinde büyüdüm.';
    expect(suggestTitleCaseTr(long)).toBe(long);
  });
});
