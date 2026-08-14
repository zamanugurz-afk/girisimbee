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
    expect(roles[0]).toBe('Şube müdürü');
    const managerSlice = roles.slice(0, 12);
    expect(managerSlice).toEqual(
      expect.arrayContaining(['Şube müdürü', 'Bölge müdürü', 'Satış müdürü']),
    );
    expect(roles).toEqual(
      expect.arrayContaining([
        'Portföy yöneticisi',
        'Yönetim danışmanı',
        MANUAL_OPTION,
      ]),
    );
    expect(roles.at(-1)).toBe(MANUAL_OPTION);
    expect(roles).not.toContain('Müşteri temsilcisi');
    expect(roles).not.toContain('Banka müşteri temsilcisi');
    expect(roles).not.toContain('Çağrı merkezi temsilcisi');
    expect(roles).not.toContain('Acente temsilcisi');
    expect(roles).not.toContain('İç satış uzmanı');
    expect(roles).not.toContain('Hesap yöneticisi');
    expect(roles).not.toContain('Bordro uzmanı');
    expect(roles).not.toContain('İnsan kaynakları uzmanı');
    expect(roles).not.toContain('Underwriter');
    expect(roles).not.toContain('Kredi uzmanı');
    expect(roles).not.toContain('Yatırım danışmanı');
    expect(roles).not.toContain('Bankacı / banka personeli');
    expect(roles).not.toContain('Yazılım geliştirici');
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
    expect(roles).toEqual(expect.arrayContaining(['şube müdürü', 'Bölge müdürü', 'Satış müdürü', MANUAL_OPTION]));
  });

  it('does not dump the full market for a software developer', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Bilişim / Yazılım', role: 'Yazılım geliştirici', roleOther: '' }],
    });
    expect(roles[0]).toBe('Yazılım geliştirici');
    expect(roles).toEqual(
      expect.arrayContaining(['Frontend geliştirici', 'CTO / Teknik lider', 'Ürün yöneticisi', MANUAL_OPTION]),
    );
    expect(roles.indexOf('CTO / Teknik lider')).toBeLessThan(roles.indexOf('QA / Test uzmanı'));
    expect(roles.indexOf('Ürün yöneticisi')).toBeLessThan(roles.indexOf('QA / Test uzmanı'));
    expect(roles).not.toContain('Şube müdürü');
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
    expect(roles[0]).toBe('Mağaza müdürü');
    expect(roles).toEqual(
      expect.arrayContaining(['Bölge müdürü', 'Satış müdürü', MANUAL_OPTION]),
    );
    expect(roles).not.toContain('Kasiyer');
    expect(roles).not.toContain('Satış danışmanı');
    expect(roles).not.toContain('Satış temsilcisi');
    expect(roles).not.toContain('Market personeli');
    expect(roles).not.toContain('İç satış uzmanı');
  });

  it('hides waiters from a restaurant manager and payroll from an HR manager', () => {
    const restaurantRoles = suggestPreferredRoles({
      experiences: [{ sector: 'Gıda / Restoran', role: 'Restoran müdürü', roleOther: '' }],
    });
    expect(restaurantRoles[0]).toBe('Restoran müdürü');
    expect(restaurantRoles).toEqual(expect.arrayContaining(['Otel müdürü', 'Şef / mutfak şefi', MANUAL_OPTION]));
    expect(restaurantRoles).not.toContain('Garson');
    expect(restaurantRoles).not.toContain('Komi');
    expect(restaurantRoles).not.toContain('Aşçı yardımcısı');

    const hrRoles = suggestPreferredRoles({
      experiences: [{ sector: 'İnsan kaynakları', role: 'İK yöneticisi', roleOther: '' }],
    });
    expect(hrRoles[0]).toBe('İK yöneticisi');
    expect(hrRoles).not.toContain('Bordro uzmanı');
    expect(hrRoles).not.toContain('İnsan kaynakları uzmanı');
    expect(hrRoles).not.toContain('İşe alım uzmanı');
  });

  it('lets a bank teller see frontline peers and a promotion path', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Finans / Bankacılık', role: 'Banka müşteri temsilcisi', roleOther: '' }],
    });
    expect(roles[0]).toBe('Banka müşteri temsilcisi');
    expect(roles).toEqual(
      expect.arrayContaining(['Müşteri temsilcisi', 'Şube müdürü', MANUAL_OPTION]),
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
    expect(roles[0]).toBe('Bölge müdürü');
    expect(roles).toEqual(expect.arrayContaining(['Satış müdürü', 'Mağaza müdürü', MANUAL_OPTION]));
    expect(roles).not.toContain('Satış temsilcisi');
    expect(roles).not.toContain('İç satış uzmanı');
    expect(roles).not.toContain('Saha satış uzmanı');
    expect(roles).not.toContain('Medikal satış temsilcisi');
    expect(roles).not.toContain('Hesap yöneticisi');
    expect(roles).not.toContain('Key account manager');
    expect(roles).not.toContain('Bordro uzmanı');
    expect(roles).not.toContain('İnsan kaynakları uzmanı');
    expect(roles).not.toContain('Sigorta satış uzmanı');
    expect(roles).not.toContain('İş geliştirme uzmanı');
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
    expect(roles[0]).toBe('Fabrika işçisi');
    expect(roles).toEqual(
      expect.arrayContaining(['Üretim işçisi', 'Makine operatörü', 'Vardiya amiri', MANUAL_OPTION]),
    );
    expect(roles.indexOf('Üretim işçisi')).toBeLessThan(roles.indexOf('İş sağlığı ve güvenliği uzmanı'));
    expect(roles.indexOf('Makine operatörü')).toBeLessThan(roles.indexOf('Kalite kontrol uzmanı'));
    expect(roles.indexOf('Vardiya amiri')).toBeLessThan(roles.indexOf('Mühendis (makine)'));

    const relatedStart = Math.min(
      ...['Bakım teknisyeni', 'İş sağlığı ve güvenliği uzmanı', 'Kalite kontrol uzmanı', 'Mühendis (endüstri)']
        .map((title) => roles.indexOf(title))
        .filter((index) => index >= 0),
    );
    const relatedRoles = roles.slice(relatedStart, -1).filter((title) => {
      return !['Fabrika işçisi', 'Üretim işçisi', 'Makine operatörü', 'Vardiya amiri', 'Üretim sorumlusu', 'Bakım teknisyeni'].includes(title);
    });
    const specialistTail = roles.filter((title) =>
      ['İş sağlığı ve güvenliği uzmanı', 'Kalite kontrol uzmanı', 'Mühendis (endüstri)', 'Mühendis (makine)', 'Üretim planlama uzmanı'].includes(title),
    );
    expect(specialistTail.length).toBeGreaterThan(1);
    expect(specialistTail).toEqual([...specialistTail].sort((a, b) => a.localeCompare(b, 'tr')));

    expect(roles).not.toContain('Gıda mühendisi');
    expect(roles).not.toContain('Çelik işçisi');
    expect(roles).not.toContain('Kaynakçı');
    expect(roles).not.toContain('Mobilya ustası');
    expect(roles).not.toContain('Torna / freze operatörü');
    expect(relatedRoles.length).toBeGreaterThanOrEqual(0);
  });

  it('keeps metal trades together for a steel worker, not furniture or food engineering', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Demir-çelik / Metal', role: 'Çelik işçisi', roleOther: '' }],
    });
    expect(roles[0]).toBe('Çelik işçisi');
    expect(roles).toEqual(expect.arrayContaining(['Kaynakçı', 'Torna / freze operatörü', 'Üretim işçisi', MANUAL_OPTION]));
    expect(roles.indexOf('Kaynakçı')).toBeLessThan(roles.indexOf('İş sağlığı ve güvenliği uzmanı') === -1 ? roles.length : roles.indexOf('İş sağlığı ve güvenliği uzmanı'));
    expect(roles).not.toContain('Mobilya ustası');
    expect(roles).not.toContain('Gıda mühendisi');
  });

  it('ranks İSG with quality peers, not as a generic factory dump', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Üretim / Sanayi', role: 'İş sağlığı ve güvenliği uzmanı', roleOther: '' }],
    });
    expect(roles[0]).toBe('İş sağlığı ve güvenliği uzmanı');
    expect(roles).toEqual(expect.arrayContaining(['Kalite kontrol uzmanı', MANUAL_OPTION]));
    expect(roles.indexOf('Kalite kontrol uzmanı')).toBeLessThan(roles.indexOf('Fabrika işçisi'));
    expect(roles).not.toContain('Gıda mühendisi');
    expect(roles).not.toContain('Çelik işçisi');
  });

  it('keeps machine engineers with engineers, not line workers', () => {
    const roles = suggestPreferredRoles({
      experiences: [{ sector: 'Üretim / Sanayi', role: 'Mühendis (makine)', roleOther: '' }],
    });
    expect(roles[0]).toBe('Mühendis (makine)');
    expect(roles).toEqual(expect.arrayContaining(['Mühendis (endüstri)', MANUAL_OPTION]));
    expect(roles).not.toContain('Fabrika işçisi');
    expect(roles).not.toContain('Kaynakçı');
    expect(roles).not.toContain('Gıda mühendisi');
  });

  it('keeps nurse titles in health and construction trades off the sales desk', () => {
    const nurseRoles = suggestPreferredRoles({
      experiences: [{ sector: 'Sağlık', role: 'Hemşire', roleOther: '' }],
    });
    expect(nurseRoles[0]).toBe('Hemşire');
    expect(nurseRoles).toEqual(expect.arrayContaining(['Doktor', 'Ebe', MANUAL_OPTION]));
    expect(nurseRoles).not.toContain('Garson');
    expect(nurseRoles).not.toContain('Satış temsilcisi');

    const constructionRoles = suggestPreferredRoles({
      experiences: [{ sector: 'İnşaat / Gayrimenkul', role: 'İnşaat işçisi', roleOther: '' }],
    });
    expect(constructionRoles[0]).toBe('İnşaat işçisi');
    expect(constructionRoles).toEqual(expect.arrayContaining(['Şantiye şefi', MANUAL_OPTION]));
    expect(constructionRoles).not.toContain('Gayrimenkul danışmanı');
    expect(constructionRoles).not.toContain('Fabrika işçisi');

    const driverRoles = suggestPreferredRoles({
      experiences: [{ sector: 'Ulaşım / Şoförlük', role: 'Şoför (kamyon / TIR)', roleOther: '' }],
    });
    expect(driverRoles[0]).toBe('Şoför (kamyon / TIR)');
    expect(driverRoles).toEqual(expect.arrayContaining(['Şoför (hafif ticari)', MANUAL_OPTION]));
    expect(driverRoles).not.toContain('Fabrika işçisi');
    expect(driverRoles).not.toContain('Kaynakçı');
  });
});
