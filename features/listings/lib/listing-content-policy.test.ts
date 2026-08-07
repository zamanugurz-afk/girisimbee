import { describe, expect, it } from 'vitest';
import {
  contentPolicyIssuesToFieldErrors,
  hasExcessiveCaps,
  hasSpamRepetition,
  isTurkishTitleCase,
  toTurkishTitleCase,
  validateListingContentPolicy,
  validateListingTitle,
  validateListingTextBody,
  findContactLeaks,
  findProfanity,
  findCompetitorMention,
  assertSafeListingImageName,
  assertListingImageDimensions,
  collectSuspiciousFlags,
} from '@/features/listings/lib/listing-content-policy';

describe('listing-content-policy', () => {
  it('formats Turkish title case', () => {
    expect(toTurkishTitleCase('martı döner ortak arıyor')).toBe('Martı Döner Ortak Arıyor');
    expect(isTurkishTitleCase('Martı Döner Ortak Arıyor')).toBe(true);
    expect(isTurkishTitleCase('martı döner ortak arıyor')).toBe(false);
  });

  it('blocks email and phone in description', () => {
    const email = findContactLeaks('Bana yazin: test@example.com');
    expect(email.some((i) => i.code === 'contact_email')).toBe(true);

    const phone = findContactLeaks('Ara: 0532 111 22 33');
    expect(phone.some((i) => i.code === 'contact_phone')).toBe(true);
  });

  it('does not treat plain investment amounts as phone', () => {
    const issues = findContactLeaks('Yatirim tutari 100000 TL civarinda');
    expect(issues.some((i) => i.code === 'contact_phone')).toBe(false);
  });

  it('detects profanity', () => {
    expect(findProfanity('Bu ilan siktir git demek istiyor')).toBeTruthy();
  });

  it('detects excessive caps and spam', () => {
    expect(hasExcessiveCaps('BU TAMAMEN BUYUK HARF METNI')).toBe(true);
    expect(hasSpamRepetition('Fırsat!!!! aaaaa')).toBe(true);
  });

  it('flags competitors as suspicious', () => {
    expect(findCompetitorMention('Sahibinden gibi bir fırsat')).toBeTruthy();
    const issues = validateListingTextBody(
      'Sahibinden tarzı güzel fırsat',
      'shortDescription',
    );
    expect(issues.some((i) => i.code === 'competitor' && i.severity === 'suspicious')).toBe(true);
    expect(collectSuspiciousFlags(issues)).toContain('competitor');
  });

  it('flags unsafe image names and dimensions', () => {
    expect(assertSafeListingImageName('vacation-nude.jpg')?.code).toBe('unsafe_image_name');
    expect(assertSafeListingImageName('storefront.jpg')).toBeNull();
    expect(assertListingImageDimensions(320, 200)?.code).toBe('image_dimensions');
    expect(assertListingImageDimensions(1200, 800)).toBeNull();
  });

  it('validateListingTitle requires title case', () => {
    const issues = validateListingTitle('martı döner');
    expect(issues.some((i) => i.code === 'title_case')).toBe(true);
  });

  it('maps block issues to field errors and skips suspicious by default', () => {
    const issues = validateListingContentPolicy({
      title: 'Martı Döner Ortak Arıyor',
      shortDescription: 'Sahibinden benzeri firsat, detaylar icinde',
    });
    const errors = contentPolicyIssuesToFieldErrors(issues);
    expect(errors.shortDescription).toBeUndefined();
    const withSoft = contentPolicyIssuesToFieldErrors(issues, { includeSuspicious: true });
    expect(withSoft.shortDescription).toBeTruthy();
  });

  it('blocks call-me patterns', () => {
    const issues = findContactLeaks('Detay icin beni ara hemen');
    expect(issues.some((i) => i.code === 'call_me')).toBe(true);
  });
});
