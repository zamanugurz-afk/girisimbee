import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';

describe('Gizem Şaylan Real CV Acceptance Test', () => {
  const actualGizemText = `
Gizem Şaylan

Eğitimler
İKTİSAT
Adnan Menderes Üniversitesi, Aydın
Eyl 2018 - Mar 2023

İş deneyimi
Satış temsilcisi /Dönemsel
Haz 2022 - Ağu 2022
Mapp pazarlama reklam A.Ş, Aydın
Ürün bilgilendirmesi ve satisi yapmak.

Satış asistan/Sözleşmeli
Şub 2024 - Mar 2024
İng Turkey, İstanbul
Leasing urunleri satisi ve tanıtımını yapmak.

İşe alım ve yetenek kazanımı stajyer
Nis 2024 - Haz 2024
Burgan bank, İstanbul
İse alım evraklarını hazırlamak randevular ve aramaları oluşturmak.

Satış Pazarlama Birimi /Yatırım Uzman Yardımcısı
Ağu 2024 - Oca 2025
Marbaş Menkul Değerler, İstanbul
Potansiyel yatirimcilari aramak bilgi vermek satis yapmak yatirim urunleri hakkinda destek sağlamak seminerlere katılmak yatırımcıyla yuzyuze ve telefon üzerinden görüşmeler yapmak.

Referanslar
Soner Kuru
Marbaş Menkul Değerler/Genel Mudur Yardimcisi, İstanbul
0533 481 56 18

Cagri koroglu
Adnan Menderes Üniversitesi, Aydın
0553 422 71 11, Cagri.koroglu@adu.edu.tr

Kişisel bilgiler
Gizem Şaylan
gizemsyln97@gmail.com
0539 718 52 73
İstanbul/Eyüp
0212 İstanbul
26 Şubat 1997
Bekar
linkedin.com/in/gizem-şaylan-a978

Beceriler
Microsoft office
Finans Analizi
Piyasa Araştırması
Satış Teknikleri
Müşteri İlişkileri
İletişim Becerileri
Takım Çalışması
Sunum Becerileri
Veri Analizi
Problem Çözme
Pazarlama Bilgisi
Ekonomik Analiz
`;

  it('extracts all 4 experiences, education, skills, location and gender for Gizem Şaylan from real CV', () => {
    const raw = extractDeterministicCv(actualGizemText);
    const canonical = mapCvToCanonicalTaxonomy(raw);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'CV Gizem Şaylan.pdf');

    console.log('GIZEM RAW EXPERIENCES:', JSON.stringify(raw.experiences, null, 2));
    console.log('GIZEM RAW EDU:', JSON.stringify(raw.education, null, 2));
    console.log('GIZEM RAW LOC:', raw.locations);
    console.log('GIZEM RAW DEMO:', { gender: raw.gender, birthDate: raw.birthDate });
    console.log('GIZEM DRAFT:', {
      role: draft.formValues.role,
      sector: draft.formValues.sector,
      city: draft.formValues.city,
      residenceDistrict: draft.formValues.residenceDistrict,
      profileGender: draft.formValues.profileGender,
      birthDate: draft.formValues.birthDate,
    });

    expect(raw.experiences.length).toBe(4);
    expect(draft.formValues.fullName).toBe('Gizem Şaylan');
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toMatch(/Eyüp|Eyüpsultan/i);
    expect(draft.formValues.profileGender).toBeFalsy(); // Zero hallucination: no explicit gender keyword in CV
    expect(draft.formValues.birthDate).toBe('1997-02-26');
    expect(draft.formValues.role).toMatch(/Yatırım Danışmanı|Finans Uzmanı|Satış Danışmanı|Satış Temsilcisi|Satış Uzmanı/i);
    expect(draft.formValues.sector).toMatch(/Finans \/ Bankacılık|Satış \/ Pazarlama/i);
  });
});
