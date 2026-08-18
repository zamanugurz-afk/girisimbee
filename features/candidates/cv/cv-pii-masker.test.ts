import { describe, expect, it } from 'vitest';
import { maskCvPii } from '@/features/candidates/cv/cv-pii-masker';

describe('CV PII Masking QA', () => {
  it('masks emails, various phone number formats, LinkedIn URLs and portfolios completely', () => {
    const rawCvWithPii = `
Ahmet Yılmaz
E-posta: ahmet.yilmaz@example.com
Alternatif: test_user.work-123@sub.company.co.uk
Telefon: +90 555 123 45 67
GSM: 0532 987 65 43
Ofis: (0542) 111-22-33
Kısa tel: 05051234567
LinkedIn: https://www.linkedin.com/in/ahmet-yilmaz-dev-123
Profil: linkedin.com/in/ahmetyilmaz
Portfolyo: https://github.com/ahmetyilmaz
Web: https://ahmetyilmaz.dev ve behance.net/ahmetyilmaz

Deneyim:
Software Engineer olarak 2020-2024 yılları arasında İstanbul'da çalıştı.
    `.trim();

    const result = maskCvPii(rawCvWithPii);

    // 1. Assert all PII tokens are present in masked text
    expect(result.maskedText).toContain('[EMAIL]');
    expect(result.maskedText).toContain('[PHONE]');
    expect(result.maskedText).toContain('[LINKEDIN]');
    expect(result.maskedText).toContain('[WEBSITE]');

    // 2. Assert raw sensitive data NEVER appears in maskedText
    expect(result.maskedText).not.toContain('ahmet.yilmaz@example.com');
    expect(result.maskedText).not.toContain('test_user.work-123@sub.company.co.uk');
    expect(result.maskedText).not.toContain('555 123 45 67');
    expect(result.maskedText).not.toContain('0532 987 65 43');
    expect(result.maskedText).not.toContain('0542');
    expect(result.maskedText).not.toContain('05051234567');
    expect(result.maskedText).not.toContain('linkedin.com/in/ahmet-yilmaz');
    expect(result.maskedText).not.toContain('github.com/ahmetyilmaz');
    expect(result.maskedText).not.toContain('ahmetyilmaz.dev');
    expect(result.maskedText).not.toContain('behance.net/ahmetyilmaz');

    // 3. Assert structured contact details were captured deterministically
    expect(result.contacts.emails).toHaveLength(2);
    expect(result.contacts.emails).toContain('ahmet.yilmaz@example.com');
    expect(result.contacts.phones).toContain('+90 555 123 45 67');
    expect(result.contacts.linkedInUrls).toHaveLength(2);
    expect(result.piiMaskedCount).toBeGreaterThanOrEqual(8);
  });
});
