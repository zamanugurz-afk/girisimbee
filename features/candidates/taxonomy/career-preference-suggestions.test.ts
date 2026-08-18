import { describe, expect, it } from 'vitest';
import { MANUAL_OPTION } from '@/features/candidates/taxonomy/career-taxonomy';
import {
  pickLatestExperience,
  suggestPreferredRoles,
  suggestPreferredSectors,
} from './career-preference-suggestions';

describe('career preference suggestions from experience', () => {
  it('puts banking management sectors and roles first for şube müdürü', () => {
    const input = {
      experiences: [
        {
          sector: 'Finans / Bankacılık',
          role: 'Şube müdürü',
          roleOther: '',
        },
      ],
    };

    const sectors = suggestPreferredSectors(input);
    expect(sectors[0]).toBe('Finans / Bankacılık');
    expect(sectors).toEqual(
      expect.arrayContaining([
        'Sigorta',
        'Muhasebe / Mali müşavirlik',
        'Holding / Yönetim',
        'Danışmanlık',
        'Satış',
        MANUAL_OPTION,
      ]),
    );
    expect(sectors.at(-1)).toBe(MANUAL_OPTION);
    expect(sectors).not.toContain('Turizm / Otelcilik');
    expect(sectors).not.toContain('Tarım');
    expect(sectors).not.toContain('Çağrı merkezi');
    expect(sectors).not.toContain('Müşteri hizmetleri');
    expect(sectors).not.toContain('Hukuk');
    expect(sectors).not.toContain('Yapay zeka / Veri');

    const roles = suggestPreferredRoles(input);
    expect(roles[0]).toBe('Şube Müdürü');
    const managerSlice = roles.slice(0, 12);
    expect(managerSlice).toEqual(
      expect.arrayContaining(['Şube Müdürü', 'Bölge Müdürü', 'Satış Müdürü']),
    );
    expect(roles).toEqual(
      expect.arrayContaining([
        'Portföy Yöneticisi',
        'Yönetim Danışmanı',
        MANUAL_OPTION,
      ]),
    );
    expect(roles.at(-1)).toBe(MANUAL_OPTION);
    expect(roles).not.toContain('Müşteri Temsilcisi');
    expect(roles).not.toContain('Banka Müşteri Temsilcisi');
    expect(roles).not.toContain('Çağrı Merkezi Temsilcisi');
    expect(roles).not.toContain('Acente Temsilcisi');
    expect(roles).not.toContain('İç Satış Uzmanı');
    expect(roles).not.toContain('Hesap Yöneticisi');
    expect(roles).not.toContain('Bordro Uzmanı');
    expect(roles).not.toContain('İnsan Kaynakları Uzmanı');
    expect(roles).not.toContain('Underwriter');
    expect(roles).not.toContain('Kredi Uzmanı');
    expect(roles).not.toContain('Yatırım Danışmanı');
    expect(roles).not.toContain('Bankacı / Banka Personeli');
    expect(roles).not.toContain('Yazılım Geliştirici');
    expect(roles).not.toContain('Garson');
  });

  it('keeps already selected values and always offers manual entry', () => {
    const sectors = suggestPreferredSectors({
      experiences: [{ sector: 'Sağlık', role: 'Hemşire', roleOther: '' }],
      selected: ['Turizm / Otelcilik'],
    });
    expect(sectors).toContain('Turizm / Otelcilik');
    expect(sectors).toContain('Sağlık');
    expect(sectors.at(-1)).toBe(MANUAL_OPTION);

    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Sağlık', role: 'Hemşire', roleOther: '' }],
      selected: ['Garson'],
    });
    expect(roles).toContain('Garson');
    expect(roles).toContain('Hemşire');
    expect(roles.at(-1)).toBe(MANUAL_OPTION);
  });

  it('uses roleOther when the experience position is manual', () => {
    const roles = suggestPreferredRoles({
      experiences: [
        {
          sector: 'Finans / Bankacılık',
          role: MANUAL_OPTION,
          roleOther: 'şube müdürü',
        },
      ],
    });
    expect(roles).toEqual(expect.arrayContaining(['Şube Müdürü', 'Bölge Müdürü', 'Satış Müdürü', MANUAL_OPTION]));
  });

  it('does not dump the full market for a software developer', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Bilişim / Yazılım', role: 'Yazılım geliştirici', roleOther: '' }],
    });
    expect(roles[0]).toBe('Yazılım Geliştirici');
    expect(roles).toEqual(
      expect.arrayContaining(['Frontend Geliştirici', 'CTO / Teknik Lider', 'Ürün Yöneticisi', MANUAL_OPTION]),
    );
    expect(roles.indexOf('CTO / Teknik Lider')).toBeLessThan(roles.indexOf('QA / Test Uzmanı'));
    expect(roles.indexOf('Ürün Yöneticisi')).toBeLessThan(roles.indexOf('QA / Test Uzmanı'));
    expect(roles).not.toContain('Şube Müdürü');
    expect(roles).not.toContain('Aşçı');
  });

  it('surfaces store leadership and retail-adjacent work for mağaza müdürü', () => {
    const sectors = suggestPreferredSectors({
      experiences: [{ sector: 'Perakende / Mağaza', role: 'Mağaza müdürü', roleOther: '' }],
    });
    expect(sectors[0]).toBe('Perakende / Mağaza');
    expect(sectors).toEqual(
      expect.arrayContaining(['Satış', 'E-ticaret / Pazaryeri', 'Lojistik / Depolama', MANUAL_OPTION]),
    );

    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Perakende / Mağaza', role: 'Mağaza müdürü', roleOther: '' }],
    });
    expect(roles[0]).toBe('Mağaza Müdürü');
    expect(roles).toEqual(
      expect.arrayContaining(['Bölge Müdürü', 'Satış Müdürü', MANUAL_OPTION]),
    );
    expect(roles).not.toContain('Kasiyer');
    expect(roles).not.toContain('Satış Danışmanı');
    expect(roles).not.toContain('Satış Temsilcisi');
    expect(roles).not.toContain('Market Personeli');
    expect(roles).not.toContain('İç Satış Uzmanı');
  });

  it('hides waiters from a restaurant manager and payroll from an HR manager', () => {
    const restaurantRoles = suggestPreferredRoles({
      experiences: [{ sector: 'Gıda / Restoran', role: 'Restoran müdürü', roleOther: '' }],
    });
    expect(restaurantRoles[0]).toBe('Restoran Müdürü');
    expect(restaurantRoles).toEqual(expect.arrayContaining(['Otel Müdürü', 'Şef / Mutfak Şefi', MANUAL_OPTION]));
    expect(restaurantRoles).not.toContain('Garson');
    expect(restaurantRoles).not.toContain('Komi');
    expect(restaurantRoles).not.toContain('Aşçı Yardımcısı');

    const hrRoles = suggestPreferredRoles({
      experiences: [{ sector: 'İnsan kaynakları', role: 'İK yöneticisi', roleOther: '' }],
    });
    expect(hrRoles[0]).toBe('İK Yöneticisi');
    expect(hrRoles).not.toContain('Bordro Uzmanı');
    expect(hrRoles).not.toContain('İnsan Kaynakları Uzmanı');
    expect(hrRoles).not.toContain('İşe Alım Uzmanı');
  });

  it('lets a bank teller see frontline peers and a promotion path', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Finans / Bankacılık', role: 'Banka müşteri temsilcisi', roleOther: '' }],
    });
    expect(roles[0]).toBe('Banka Müşteri Temsilcisi');
    expect(roles).toEqual(
      expect.arrayContaining(['Müşteri Temsilcisi', 'Şube Müdürü', MANUAL_OPTION]),
    );
  });

  it('uses only the latest job, not older sales-rep experience', () => {
    const input = {
      experiences: [
        {
          sector: 'Perakende / Mağaza',
          role: 'Bölge müdürü',
          roleOther: '',
          isCurrent: true,
        },
        {
          sector: 'Satış',
          role: 'Satış temsilcisi',
          roleOther: '',
          isCurrent: false,
        },
      ],
      primarySector: 'Satış',
      desiredRole: 'Satış temsilcisi',
    };

    expect(pickLatestExperience(input.experiences)?.role).toBe('Bölge müdürü');

    const roles = suggestPreferredRoles(input);
    expect(roles[0]).toBe('Bölge Müdürü');
    expect(roles).toEqual(expect.arrayContaining(['Satış Müdürü', 'Mağaza Müdürü', MANUAL_OPTION]));
    expect(roles).not.toContain('Satış Temsilcisi');
    expect(roles).not.toContain('İç Satış Uzmanı');
    expect(roles).not.toContain('Saha Satış Uzmanı');
    expect(roles).not.toContain('Medikal Satış Temsilcisi');
    expect(roles).not.toContain('Hesap Yöneticisi');
    expect(roles).not.toContain('Key Account Manager');
    expect(roles).not.toContain('Bordro Uzmanı');
    expect(roles).not.toContain('İnsan Kaynakları Uzmanı');
    expect(roles).not.toContain('Sigorta Satış Uzmanı');
    expect(roles).not.toContain('İş Geliştirme Uzmanı');
  });

  it('puts shop-floor peers first for a factory worker, then related titles A–Z', () => {
    const input = {
      experiences: [{ sector: 'Üretim / Sanayi', role: 'Fabrika işçisi', roleOther: '' }],
    };

    const sectors = suggestPreferredSectors(input);
    expect(sectors[0]).toBe('Üretim / Sanayi');
    expect(sectors.indexOf('Üretim / Sanayi')).toBeLessThan(sectors.indexOf('Demir-çelik / Metal'));
    expect(sectors.indexOf('Otomotiv')).toBeLessThan(sectors.indexOf(MANUAL_OPTION));
    const relatedSectors = sectors.slice(sectors.indexOf('Üretim / Sanayi') + 1, -1);
    const firstRelated = relatedSectors.find((sector) => sector !== 'Üretim / Sanayi');
    expect(firstRelated).toBeTruthy();
    const azSectors = relatedSectors.slice();
    expect(azSectors).toEqual([...azSectors].sort((a, b) => a.localeCompare(b, 'tr')));
    expect(sectors).not.toContain('Madencilik');
    expect(sectors).not.toContain('Turizm / Otelcilik');
    expect(sectors).not.toContain('Tarım');

    const roles = suggestPreferredRoles(input);
    expect(roles[0]).toBe('Fabrika İşçisi');
    expect(roles).toEqual(
      expect.arrayContaining(['Üretim İşçisi', 'Makine Operatörü', 'Vardiya Amiri', MANUAL_OPTION]),
    );
    expect(roles.indexOf('Üretim İşçisi')).toBeLessThan(roles.indexOf('İş Sağlığı ve Güvenliği Uzmanı'));
    expect(roles.indexOf('Makine Operatörü')).toBeLessThan(roles.indexOf('Kalite Kontrol Uzmanı'));
    expect(roles.indexOf('Vardiya Amiri')).toBeLessThan(roles.indexOf('Mühendis (Makine)'));

    const relatedStart = Math.min(
      ...['Bakım Teknisyeni', 'İş Sağlığı ve Güvenliği Uzmanı', 'Kalite Kontrol Uzmanı', 'Mühendis (Endüstri)']
        .map((title) => roles.indexOf(title))
        .filter((index) => index >= 0),
    );
    const relatedRoles = roles.slice(relatedStart, -1).filter((title) => {
      return !['Fabrika İşçisi', 'Üretim İşçisi', 'Makine Operatörü', 'Vardiya Amiri', 'Üretim Sorumlusu', 'Bakım Teknisyeni'].includes(title);
    });
    const specialistTail = roles.filter((title) =>
      ['İş Sağlığı ve Güvenliği Uzmanı', 'Kalite Kontrol Uzmanı', 'Mühendis (Endüstri)', 'Mühendis (Makine)', 'Üretim Planlama Uzmanı'].includes(title),
    );
    expect(specialistTail.length).toBeGreaterThan(1);
    expect(specialistTail).toEqual([...specialistTail].sort((a, b) => a.localeCompare(b, 'tr')));

    expect(roles).not.toContain('Gıda Mühendisi');
    expect(roles).not.toContain('Çelik İşçisi');
    expect(roles).not.toContain('Kaynakçı');
    expect(roles).not.toContain('Mobilya Ustası');
    expect(roles).not.toContain('Torna / Freze Operatörü');
    expect(relatedRoles.length).toBeGreaterThanOrEqual(0);
  });

  it('keeps metal trades together for a steel worker, not furniture or food engineering', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Demir-çelik / Metal', role: 'Çelik işçisi', roleOther: '' }],
    });
    expect(roles[0]).toBe('Çelik İşçisi');
    expect(roles).toEqual(expect.arrayContaining(['Kaynakçı', 'Torna / Freze Operatörü', 'Üretim İşçisi', MANUAL_OPTION]));
    expect(roles.indexOf('Kaynakçı')).toBeLessThan(roles.indexOf('İş Sağlığı ve Güvenliği Uzmanı') === -1 ? roles.length : roles.indexOf('İş Sağlığı ve Güvenliği Uzmanı'));
    expect(roles).not.toContain('Mobilya Ustası');
    expect(roles).not.toContain('Gıda Mühendisi');
  });

  it('ranks İSG with quality peers, not as a generic factory dump', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Üretim / Sanayi', role: 'İş sağlığı ve güvenliği uzmanı', roleOther: '' }],
    });
    expect(roles[0]).toBe('İş Sağlığı ve Güvenliği Uzmanı');
    expect(roles).toEqual(expect.arrayContaining(['Kalite Kontrol Uzmanı', MANUAL_OPTION]));
    expect(roles.indexOf('Kalite Kontrol Uzmanı')).toBeLessThan(roles.indexOf('Fabrika İşçisi'));
    expect(roles).not.toContain('Gıda Mühendisi');
    expect(roles).not.toContain('Çelik İşçisi');
  });

  it('keeps machine engineers with engineers, not line workers', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Üretim / Sanayi', role: 'Mühendis (makine)', roleOther: '' }],
    });
    expect(roles[0]).toBe('Mühendis (Makine)');
    expect(roles).toEqual(expect.arrayContaining(['Mühendis (Endüstri)', MANUAL_OPTION]));
    expect(roles).not.toContain('Fabrika İşçisi');
    expect(roles).not.toContain('Kaynakçı');
    expect(roles).not.toContain('Gıda Mühendisi');
  });

  it('keeps nurse titles in health and construction trades off the sales desk', () => {
    const nurseRoles = suggestPreferredRoles({
      experiences: [{ sector: 'Sağlık', role: 'Hemşire', roleOther: '' }],
    });
    expect(nurseRoles[0]).toBe('Hemşire');
    expect(nurseRoles).toEqual(expect.arrayContaining(['Doktor', 'Ebe', MANUAL_OPTION]));
    expect(nurseRoles).not.toContain('Garson');
    expect(nurseRoles).not.toContain('Satış Temsilcisi');

    const constructionRoles = suggestPreferredRoles({
      experiences: [{ sector: 'İnşaat / Gayrimenkul', role: 'İnşaat işçisi', roleOther: '' }],
    });
    expect(constructionRoles[0]).toBe('İnşaat İşçisi');
    expect(constructionRoles).toEqual(expect.arrayContaining(['Şantiye Şefi', MANUAL_OPTION]));
    expect(constructionRoles).not.toContain('Gayrimenkul Danışmanı');
    expect(constructionRoles).not.toContain('Fabrika İşçisi');

    const driverRoles = suggestPreferredRoles({
      experiences: [{ sector: 'Ulaşım / Şoförlük', role: 'Şoför (kamyon / TIR)', roleOther: '' }],
    });
    expect(driverRoles[0]).toBe('Şoför (Kamyon / TIR)');
    expect(driverRoles).toEqual(expect.arrayContaining(['Şoför (Hafif Ticari)', MANUAL_OPTION]));
    expect(driverRoles).not.toContain('Fabrika İşçisi');
    expect(driverRoles).not.toContain('Kaynakçı');
  });
});
