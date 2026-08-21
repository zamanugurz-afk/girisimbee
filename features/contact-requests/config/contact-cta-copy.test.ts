import { describe, expect, it } from 'vitest';
import {
  CAREER_CONTACT_STATUS_COPY,
  CONTACT_CTA_DEFAULT_LABEL,
  isCareerContactCategory,
  isContactIdentityGated,
  isContactRequestEligibleCategory,
  resolveContactCtaLabel,
  resolveContactStatusLabel,
} from '@/features/contact-requests/config/contact-cta-copy';

describe('contact CTA copy & eligibility', () => {
  it('keeps career and partnership labels on the contact-request phrase', () => {
    expect(resolveContactCtaLabel('find-job')).toBe(CONTACT_CTA_DEFAULT_LABEL);
    expect(resolveContactCtaLabel('is-ariyorum')).toBe(CONTACT_CTA_DEFAULT_LABEL);
    expect(resolveContactCtaLabel('find-partner')).toBe('Ortaklık İletişim Talebi Gönder');
    expect(resolveContactCtaLabel('ortak-ariyorum')).toBe('Ortaklık İletişim Talebi Gönder');
    expect(resolveContactCtaLabel('ortak-olmak')).toBe('Ortaklık İletişim Talebi Gönder');
  });

  it('strictly validates category eligibility for the 3 allowed categories', () => {
    // 3 Allowed Categories
    expect(isContactRequestEligibleCategory('find-job')).toBe(true);
    expect(isContactRequestEligibleCategory('is-bul')).toBe(true);
    expect(isContactRequestEligibleCategory('is-ariyorum')).toBe(true);
    expect(isContactRequestEligibleCategory('find-partner')).toBe(true);
    expect(isContactRequestEligibleCategory('ortak-bul')).toBe(true);
    expect(isContactRequestEligibleCategory('ortak-ariyorum')).toBe(true);
    expect(isContactRequestEligibleCategory('ortak-olmak')).toBe(true);

    // Disallowed Categories
    expect(isContactRequestEligibleCategory('hire')).toBe(false);
    expect(isContactRequestEligibleCategory('ise-al')).toBe(false);
    expect(isContactRequestEligibleCategory('ise-aliyorum')).toBe(false);
    expect(isContactRequestEligibleCategory('franchise')).toBe(false);
    expect(isContactRequestEligibleCategory('bayilik-al')).toBe(false);
    expect(isContactRequestEligibleCategory('isletme-devri')).toBe(false);
    expect(isContactRequestEligibleCategory('digital-ai')).toBe(false);
    expect(isContactRequestEligibleCategory('dijital-ai')).toBe(false);
    expect(isContactRequestEligibleCategory('market')).toBe(false);
    expect(isContactRequestEligibleCategory('firsatlar')).toBe(false);
  });

  it('gates identity copy for job-seeker and redacted listings only', () => {
    expect(isContactIdentityGated('find-job', false)).toBe(true);
    expect(isContactIdentityGated('is-bul', false)).toBe(true);
    expect(isContactIdentityGated('is-ariyorum', false)).toBe(true);
    expect(isContactIdentityGated('hire', false)).toBe(false);
    expect(isContactIdentityGated('find-partner', true)).toBe(true);
  });

  it('uses career-only status copy for job seekers', () => {
    expect(isCareerContactCategory('find-job')).toBe(true);
    expect(isCareerContactCategory('is-ariyorum')).toBe(true);
    expect(isCareerContactCategory('hire')).toBe(false);
    expect(isCareerContactCategory('franchise')).toBe(false);
    expect(resolveContactStatusLabel('pending', { categoryId: 'find-job' })).toBe(
      CAREER_CONTACT_STATUS_COPY.pending,
    );
    expect(resolveContactStatusLabel('accepted', { categoryId: 'find-job' })).toBe(
      CAREER_CONTACT_STATUS_COPY.accepted,
    );
    expect(resolveContactStatusLabel('rejected', { categoryId: 'find-job' })).toBe(
      CAREER_CONTACT_STATUS_COPY.rejected,
    );
  });
});
