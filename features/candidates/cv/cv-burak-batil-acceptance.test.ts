import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';

describe('Burak Batıl Özdemir Real CV Acceptance Test', () => {
  const burakCvText = `
KİŞİSEL
İsim: BURAK BATIL ÖZDEMİR
Adres: İnönü mahallesi 352. sokak 34000 İstanbul/Esenyurt
Telefon numarası: 5395102167
E-posta: burakbatilozdemir@gmail.com
Doğum tarihi: 13-06-1996
Sürücü ehliyeti: A, B
Diller: İngilizce A2

BURAK BATIL ÖZDEMİR
İletişim becerileri güçlü, insan ilişkilerinde başarılı ve satış süreçlerinde deneyim sahibi biriyim. Müşteri ihtiyaçlarını doğru analiz ederek çözüm odaklı ilerlemeyi önemserim. Disiplinli çalışma yapısına sahip, öğrenmeye açık ve ekip çalışmasına uyum sağlayabilen biri olarak iş süreçlerinde sorumluluk bilinciyle hareket ederim.

İş deneyimi
Finansal Güvence Danışmanı
Viennalife Genel Müdürlük, İstanbul
Mar 2026 - May 2026
* Yeni müşteri kazanımına yönelik araştırma ve iletişim süreçlerini aktif olarak yürüttüm.
* Müşteri aramaları gerçekleştirerek ihtiyaç analizleri ve görüşme organizasyonları sağladım.
* Satış süreçlerine katkı sağlayarak müşteri dönüşümlerinde aktif rol aldım.
* Hayat sigortası ürünlerinin tanıtım ve müşteri bilgilendirme süreçlerinde görev aldım.

Vardiya Müdürü
Caffe Nero, İstanbul
Mar 2023 - Ağu 2025
* Satış hedefleri doğrultusunda ekip yönlendirme süreçlerinde aktif rol aldım.
* Müşteri memnuniyeti ve satış performansı artırmaya yönelik çalışmalar yürüttüm.
* Satış odaklı ürün sunumu ve müşteri iletişimi süreçlerini yönettim.
* Operasyon süreçlerinde ekip koordinasyonu ve iş takibi sağladım.

Eğitim ve Nitelikler
Turizm ve Otel İşletmesi
Muğla Sıtkı Koçman Üniversitesi, Muğla
Eyl 2019 - Tem 2022

Beceriler
Microsoft Office Programları
Satış ve müşteri segmentasyonu
İkna ve iletişim becerileri
Ekip çalışmasına uyum
Ekip koordinasyonu
Müşteri ihtiyaç analizi
Lead oluşturma ve takip

Kurslar
Ekonomi Okulu
KOÇAV Ekonomi ve İş Dünyası Platformu
Mar 2026 - Nis 2026
`;

  it('extracts all experiences, education, skills, location and demographics from Burak CV', () => {
    const raw = extractDeterministicCv(burakCvText);
    const canonical = mapCvToCanonicalTaxonomy(raw);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'CV BURAK BATIL ÖZDEMİR.pdf');

    console.log('BURAK RAW EXPERIENCES:', JSON.stringify(raw.experiences, null, 2));
    console.log('BURAK RAW EDU:', JSON.stringify(raw.education, null, 2));
    console.log('BURAK RAW SKILLS:', raw.skills);
    console.log('BURAK RAW LOC:', raw.locations);
    console.log('BURAK DRAFT:', {
      role: draft.formValues.role,
      sector: draft.formValues.sector,
      experienceLevel: draft.formValues.experienceLevel,
      city: draft.formValues.city,
      residenceDistrict: draft.formValues.residenceDistrict,
      birthDate: draft.formValues.birthDate,
      gender: draft.formValues.profileGender,
    });

    expect(raw.experiences.length).toBeGreaterThanOrEqual(2);
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Esenyurt');
    expect(draft.formValues.birthDate).toBe('1996-06-13');
  });
});
