import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';

describe('Meryem Ekşi CV Extraction & Demographics Acceptance Test', () => {
  const meryemCvText = `
Bu özgeçmiş, hesap sahibi tarafından indirilmiştir.
Meryem Ekşi
+90 (537) 484 28 78
meryem.eksiogluuuuu@icloud.com
1993 (32 Yaş)
İstanbul(Asya) , Pendik
Özel Bilgiler
Cinsiyet Kadın
Vatandaşlık Türkiye Cumhuriyeti
Sürücü Belgesi Yok
İş Deneyimleri
Satış Temsilcisi
Angel City İnşaat | Haziran 2025 - Nisan 2026
Satış Asistanı
Yaba İnşaat | Haziran 2024 - Mayıs 2025
Satış Asistanı
Hocaoğlu İnşaat | Kasım 2023 - Haziran 2024
Satış Pazarlama Danışmanı
Dap Holding | Haziran 2021 - Eylül 2023
Sürekli / Tam zamanlı
İnşaat Sektörü
Aktif Satış Yöneticisi / Yönetmeni
Özel Adatıphastanesi | Aralık 2018 - Mayıs 2021
İstanbul(Asya) , Sürekli / Tam zamanlı
Sağlık Sektörü, Satış Departmanı
Doktor Asistanı
Stardent Ağız-Diş Polikliniği | Nisan 2018 - Kasım 2018
Sağlık Sektörü
Doktor Asistanı
Kurtköy Tıp Merkezi | Ekim 2017 - Mart 2018
Sağlık Sektörü
Satış Yetkilisi
Mavi Jeans | Kasım 2014 - Eylül 2017
Sürekli / Tam zamanlı
Hazır Giyim Sektörü
Eğitim Bilgileri
Melek Aknil Kız Teknik Ve Meslek Lisesi
Çocuk Gelişimi ve Eğitimi, Kız Meslek Lisesi | Haziran 2014
Lise
Diller
İngilizce (Orta)
Sertifika / Seminer ve Kurslar
Tıbbi Sekreterlik
Karaca Akademi /Antalya | Nisan 2016
Anaokulu Yeri Açma
Melek Aknil Kız Teknik Ve Meslek Lisesi | Haziran 2014
Tıbbi Sekreter
Karacan Akademi | Nisan 2016 - Haziran 2016
`;

  it('extracts all 8 experiences, education, languages, certificates and demographics (Kadın, 1993)', () => {
    const rawPayload = extractDeterministicCv(meryemCvText);
    expect(rawPayload.gender).toBe('Kadın');
    expect(rawPayload.birthDate).toBe('1993-01-01');
    expect(rawPayload.locations).toContain('İstanbul');
    expect(rawPayload.locations).toContain('Pendik');
    expect(rawPayload.experiences.length).toBe(8);

    const canonical = mapCvToCanonicalTaxonomy(rawPayload);
    expect(canonical.gender).toBe('Kadın');
    expect(canonical.birthDate).toBe('1993-01-01');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.residenceDistrict).toBe('Pendik');
    expect(canonical.experiences.length).toBe(8);
    expect(canonical.languages).toContain('İngilizce');

    const draft = buildProfileDraftFromCanonicalResult(
      canonical,
      'meryem_eksi_cv.pdf',
      'doc-meryem-123',
    );

    expect(canonical.experiences[0].role).toBe('Satış Temsilcisi');
    expect(canonical.experiences[0].company).toBe('Angel City İnşaat');
    expect(canonical.experiences[1].role).toBe('Satış Danışmanı');
    expect(canonical.experiences[1].company).toBe('Yaba İnşaat');
    expect(canonical.experiences[2].role).toBe('Satış Danışmanı');
    expect(canonical.experiences[2].company).toBe('Hocaoğlu İnşaat');
    expect(canonical.experiences[3].role).toBe('Satış Danışmanı');
    expect(canonical.experiences[3].company).toBe('Dap Holding');
    expect(canonical.experiences[4].role).toBe('Satış Müdürü');
    expect(canonical.experiences[4].company).toBe('Özel Adatıphastanesi');
    expect(canonical.experiences[5].role).toBe('Doktor Asistanı');
    expect(canonical.experiences[5].company).toBe('Stardent Ağız-Diş Polikliniği');
    expect(canonical.experiences[6].role).toBe('Doktor Asistanı');
    expect(canonical.experiences[6].company).toBe('Kurtköy Tıp Merkezi');
    expect(canonical.experiences[7].role).toBe('Satış Danışmanı');
    expect(canonical.experiences[7].company).toBe('Mavi Jeans');

    expect(canonical.primaryRole).toBe('Satış Temsilcisi');

    expect(draft.formValues.profileGender).toBe('Kadın');
    expect(draft.formValues.birthDate).toBe('1993-01-01');
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Pendik');
    expect(draft.formValues.experiences?.length).toBe(8);
    expect(draft.cvFilledFieldKeys).toContain('profileGender');
    expect(draft.cvFilledFieldKeys).toContain('birthDate');
  });
});
