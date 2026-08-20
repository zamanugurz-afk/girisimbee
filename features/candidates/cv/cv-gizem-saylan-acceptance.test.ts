import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';

describe('Gizem Şaylan Real CV Acceptance Test (Canva 2-Column Format)', () => {
  const gizemCvText = `
KİŞİSEL BİLGİLER
İsim: Gizem Şaylan
Adres: Caferağa Mah. Moda Cad. 34710 İstanbul/Kadıköy
Telefon: 0532 111 22 33
E-posta: gizem.saylan@example.com
Doğum Tarihi: 24-04-1997
Diller: İngilizce B2, Almanca A1

GİZEM ŞAYLAN
İletişim ve organizasyon becerileri yüksek, insan kaynakları ve idari işler süreçlerinde deneyimli bir profesyonelim.

İŞ DENEYİMİ
İnsan Kaynakları Uzmanı
LC Waikiki Genel Müdürlük, İstanbul
Oca 2022 - Ağu 2024
- İşe alım ve mülakat organizasyonlarını yürüttüm.
- Personel özlük işleri ve bordro süreçlerine destek verdim.
- Performans değerlendirme sisteminin takibini yaptım.

İnsan Kaynakları Asistanı
Defacto, İstanbul
Eyl 2020 - Ara 2021
- Aday tarama ve ilk telefon mülakatlarını gerçekleştirdim.
- İşe giriş-çıkış evraklarını düzenledim.

EĞİTİM VE NİTELİKLER
İstanbul Üniversitesi - İktisat Fakültesi (Lisans)
Eyl 2016 - Haz 2020

BECERİLER
- İşe Alım ve Mülakat Teknikleri
- Bordro ve Özlük İşleri
- SAP HR
- Excel / Microsoft Office
- Performans Yönetimi
`;

  it('extracts all experiences, education, skills, location and gender for Gizem Şaylan without defaulting to Yazılım Geliştirici', () => {
    const raw = extractDeterministicCv(gizemCvText);
    const canonical = mapCvToCanonicalTaxonomy(raw);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'CV Gizem Şaylan.pdf');

    expect(raw.experiences.length).toBe(2);
    expect(raw.experiences[0].role).toBe('İnsan Kaynakları Uzmanı');
    expect(raw.experiences[0].company).toMatch(/LC Waikiki/i);
    expect(raw.experiences[0].startYear).toBe(2022);
    expect(raw.experiences[0].endYear).toBe(2024);

    expect(draft.formValues.role).toBe('İnsan Kaynakları Uzmanı');
    expect(draft.formValues.sector).toBe('İnsan kaynakları');
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Kadıköy');
    expect(draft.formValues.profileGender).toBe('Kadın');
    expect(draft.formValues.birthDate).toBe('1997-04-24');
    expect(draft.formValues.tools).toContain('SAP');
    expect(draft.formValues.tools).toMatch(/Excel|Office/i);
  });
});
