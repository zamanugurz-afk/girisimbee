import { describe, it, expect } from 'vitest';
import {
  inferEducationLevel,
  sortEducationLevelsByRelevance,
} from '@/features/candidates/taxonomy/career-taxonomy';

describe('inferEducationLevel & sortEducationLevelsByRelevance', () => {
  it('correctly maps medical, healthcare, doctor roles to Lisans', () => {
    expect(inferEducationLevel('Sağlık', 'Doktor')).toBe('Lisans');
    expect(inferEducationLevel('Sağlık', 'Diş Hekimi')).toBe('Lisans');
    expect(inferEducationLevel('Sağlık', 'Eczacı')).toBe('Lisans');
    expect(inferEducationLevel('Sağlık', 'Fizyoterapist')).toBe('Lisans');
    expect(inferEducationLevel('Sağlık', 'Hemşire')).toBe('Lisans');
  });

  it('correctly maps banking, finance, accountant roles to Lisans', () => {
    expect(inferEducationLevel('Finans / Bankacılık', 'Bankacı')).toBe('Lisans');
    expect(inferEducationLevel('Finans / Bankacılık', 'Banka Uzmanı')).toBe('Lisans');
    expect(inferEducationLevel('Finans / Bankacılık', 'Kredi Analisti')).toBe('Lisans');
    expect(inferEducationLevel('Muhasebe / Mali müşavirlik', 'Mali Müşavir')).toBe('Lisans');
    expect(inferEducationLevel('Finans / Bankacılık', 'Portföy Yöneticisi')).toBe('Lisans');
  });

  it('correctly maps software, engineering, law and management to Lisans', () => {
    expect(inferEducationLevel('Bilişim / Yazılım', 'Yazılım geliştirici')).toBe('Lisans');
    expect(inferEducationLevel('Bilişim / Yazılım', 'DevOps / Cloud mühendisi')).toBe('Lisans');
    expect(inferEducationLevel('Hukuk', 'Avukat')).toBe('Lisans');
    expect(inferEducationLevel('Eğitim', 'Öğretmen')).toBe('Lisans');
    expect(inferEducationLevel('Holding / Yönetim', 'Genel Müdür')).toBe('Lisans');
  });

  it('correctly maps academic & doctorate roles', () => {
    expect(inferEducationLevel('Eğitim', 'Akademisyen')).toBe('Doktora');
    expect(inferEducationLevel('Eğitim', 'Profesör')).toBe('Doktora');
    expect(inferEducationLevel('Eğitim', 'Doçent')).toBe('Doktora');
  });

  it('correctly maps specialist / master degree roles', () => {
    expect(inferEducationLevel('Sağlık', 'Uzman Tabip')).toBe('Yüksek lisans');
    expect(inferEducationLevel('Sağlık', 'Uzman Doktor')).toBe('Yüksek lisans');
    expect(inferEducationLevel('Sağlık', 'Klinik Psikolog')).toBe('Yüksek lisans');
  });

  it('correctly maps technician and associate roles to Ön lisans', () => {
    expect(inferEducationLevel('Üretim ve Sanayi', 'Tekniker')).toBe('Ön lisans');
    expect(inferEducationLevel('Sağlık', 'Laborant')).toBe('Ön lisans');
    expect(inferEducationLevel('Muhasebe / Mali müşavirlik', 'Ön muhasebe elemanı')).toBe('Ön lisans');
    expect(inferEducationLevel('Sağlık', 'Tıbbi sekreter')).toBe('Ön lisans');
  });

  it('correctly maps service, trade and operational roles to Lise', () => {
    expect(inferEducationLevel('Lojistik', 'Kurye')).toBe('Lise');
    expect(inferEducationLevel('Lojistik', 'Şoför')).toBe('Lise');
    expect(inferEducationLevel('Güvenlik', 'Güvenlik görevlisi')).toBe('Lise');
    expect(inferEducationLevel('Gıda / Restoran', 'Garson')).toBe('Lise');
    expect(inferEducationLevel('Gıda / Restoran', 'Komi')).toBe('Lise');
  });

  it('sortEducationLevelsByRelevance puts inferred option first', () => {
    const listDoctor = sortEducationLevelsByRelevance('Sağlık', 'Doktor');
    expect(listDoctor[0]).toBe('Lisans');

    const listTech = sortEducationLevelsByRelevance('Bilişim / Yazılım', 'Tekniker');
    expect(listTech[0]).toBe('Ön lisans');

    const listCourier = sortEducationLevelsByRelevance('Lojistik', 'Kurye');
    expect(listCourier[0]).toBe('Lise');
  });
});
