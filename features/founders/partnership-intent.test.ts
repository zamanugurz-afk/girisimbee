import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PARTNERSHIP_INTENT,
  parsePartnershipIntentParam,
  partnershipBrowseHref,
  partnershipCreateHref,
  partnershipBrowseCopy,
  partnershipCreatePageCopy,
  partnershipDetailHeadline,
  resolvePartnershipIntent,
} from '@/features/founders/partnership-intent';

describe('partnership intent resolver', () => {
  it('defaults missing and invalid values to seeking', () => {
    expect(resolvePartnershipIntent(null)).toBe('seeking');
    expect(resolvePartnershipIntent(undefined)).toBe('seeking');
    expect(resolvePartnershipIntent({ customFields: {} })).toBe(DEFAULT_PARTNERSHIP_INTENT);
    expect(resolvePartnershipIntent({ customFields: { partnershipIntent: 'other' } })).toBe(
      'seeking',
    );
  });

  it('reads joining from customFields or a direct field', () => {
    expect(resolvePartnershipIntent({ customFields: { partnershipIntent: 'joining' } })).toBe(
      'joining',
    );
    expect(resolvePartnershipIntent({ partnershipIntent: 'joining' })).toBe('joining');
  });

  it('parses query params without treating category aliases as intent', () => {
    expect(parsePartnershipIntentParam('seeking')).toBe('seeking');
    expect(parsePartnershipIntentParam('joining')).toBe('joining');
    expect(parsePartnershipIntentParam('find-partner')).toBeUndefined();
    expect(parsePartnershipIntentParam('ortak-bul')).toBeUndefined();
  });

  it('keeps public browse and create URLs stable', () => {
    expect(partnershipBrowseHref('seeking')).toBe('/partners?intent=seeking');
    expect(partnershipBrowseHref('joining')).toBe('/partners?intent=joining');
    expect(partnershipCreateHref('seeking')).toBe(
      '/ilan/olustur?category=ortak-bul&intent=seeking',
    );
    expect(partnershipCreateHref('joining')).toBe(
      '/ilan/olustur?category=ortak-bul&intent=joining',
    );
    expect(partnershipDetailHeadline('seeking')).toBe('Bu girişim bir ortak arıyor.');
    expect(partnershipDetailHeadline('joining')).toBe(
      'Bu kullanıcı bir girişime ortak olmak istiyor.',
    );
  });

  it('keeps browse and create copy distinct without career terms', () => {
    const seeking = partnershipBrowseCopy('seeking');
    const joining = partnershipBrowseCopy('joining');
    expect(seeking.emptyTitle).toBe('Henüz yayınlanmış bir ortaklık fırsatı bulunmuyor.');
    expect(joining.emptyTitle).toBe('Henüz size uygun bir ortaklık profili bulamadık.');
    expect(joining.seoDescription).not.toMatch(/aday|pozisyon|iş arıyorum/i);
    expect(partnershipCreatePageCopy('seeking').title).toBe('Ortak Arıyorum');
    expect(partnershipCreatePageCopy('joining').title).toBe('Ortak Olmak İstiyorum');
  });
});
