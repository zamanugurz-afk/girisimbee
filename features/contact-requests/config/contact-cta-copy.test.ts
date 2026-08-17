import { describe, expect, it } from 'vitest';
import {
  CAREER_CONTACT_STATUS_COPY,
  CONTACT_CTA_DEFAULT_LABEL,
  isCareerContactCategory,
  isContactIdentityGated,
  resolveContactCtaLabel,
  resolveContactStatusLabel,
} from '@/features/contact-requests/config/contact-cta-copy';

describe('contact CTA copy', () => {
  it('keeps career labels on the shared contact-request phrase', () => {
    expect(resolveContactCtaLabel('find-job')).toBe(CONTACT_CTA_DEFAULT_LABEL);
    expect(resolveContactCtaLabel('hire')).toBe('Doğrudan Mesaj Gönder');
  });

  it('uses partnership and franchise labels without new request types', () => {
    expect(resolveContactCtaLabel('find-partner')).toBe('Ortaklık İletişim Talebi Gönder');
    expect(resolveContactCtaLabel('franchise')).toBe('Franchise İletişim Talebi Gönder');
    expect(resolveContactCtaLabel('digital-ai')).toBe('Çözüm Hakkında Bilgi Al');
    expect(resolveContactCtaLabel('dijital-ai')).toBe('Çözüm Hakkında Bilgi Al');
  });

  it('gates identity copy for job-seeker and redacted listings only', () => {
    expect(isContactIdentityGated('find-job', false)).toBe(true);
    expect(isContactIdentityGated('is-bul', false)).toBe(true);
    expect(isContactIdentityGated('hire', false)).toBe(false);
    expect(isContactIdentityGated('find-partner', true)).toBe(true);
  });

  it('uses career-only status copy without changing other categories', () => {
    expect(isCareerContactCategory('find-job')).toBe(true);
    expect(isCareerContactCategory('hire')).toBe(true);
    expect(isCareerContactCategory('franchise')).toBe(false);
    expect(resolveContactStatusLabel('pending', { categoryId: 'hire' })).toBe(
      CAREER_CONTACT_STATUS_COPY.pending,
    );
    expect(resolveContactStatusLabel('accepted', { categoryId: 'find-job', identityGated: true })).toContain(
      'Karşı taraf talebinizi kabul etti.',
    );
    expect(resolveContactStatusLabel('rejected', { categoryId: 'hire' })).toBe(
      CAREER_CONTACT_STATUS_COPY.rejected,
    );
    expect(resolveContactStatusLabel('pending', { categoryId: 'franchise' })).toBe(
      'Talebiniz ilan sahibine iletildi. Yanıt bekleniyor.',
    );
  });
});
