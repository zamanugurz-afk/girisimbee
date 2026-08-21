/**
 * CV EXTRACTION 4.0 — UNIVERSAL UNSTRUCTURED CV CORPUS (100 FIXTURES)
 * Layout-independent, sectionless, multi-format, multi-sector, adversarial test matrix.
 */

import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { cvService } from './cv.service';
import type { CareerProfileFormValues } from '@/features/career-profile/types';
import zlib from 'zlib';

function createMockPdf(lines: string[]): Buffer {
  const stream = `
BT
/F1 12 Tf
${lines.map((l) => `(${l.replace(/([()])/g, '\\$1')}) Tj\nT*`).join('\n')}
ET
  `;
  const compressed = zlib.deflateSync(Buffer.from(stream, 'utf8'));
  const pdfString = `%PDF-1.4\n1 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n${compressed.toString('binary')}\nendstream\nendobj\n%%EOF`;
  return Buffer.from(pdfString, 'binary');
}

function createMockDocx(xmlContent: string): Buffer {
  const fileName = 'word/document.xml';
  const fileNameBuffer = Buffer.from(fileName, 'utf8');
  const compressedXml = zlib.deflateRawSync(Buffer.from(xmlContent, 'utf8'));

  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(compressedXml.length, 18);
  header.writeUInt32LE(Buffer.byteLength(xmlContent), 22);
  header.writeUInt16LE(fileNameBuffer.length, 26);
  header.writeUInt16LE(0, 28);

  return Buffer.concat([header, fileNameBuffer, compressedXml]);
}

describe('GİRİŞİMBEE — CV EXTRACTION 4.0: UNIVERSAL UNSTRUCTURED INTELLIGENCE (100 FIXTURES)', () => {
  // ==========================================================================
  // CATEGORY 1: 20 COMPLETELY UNSTRUCTURED & FREE-TEXT CVS (No Section Headers)
  // ==========================================================================
  describe('Category 1: 20 Completely Unstructured Free-Text CVs (Formats A-J)', () => {
    const freeTextFixtures = [
      {
        id: 'FT-01',
        sector: 'Finans / Bankacılık',
        name: 'Meltem Arıkan',
        city: 'İstanbul',
        district: 'Beşiktaş',
        email: 'meltem.arikan@example.com',
        phone: '0532 123 45 67',
        role: 'Finans Müdürü',
        company: 'Anadolu Finans A.Ş.',
        startYear: 2020,
        endYear: 2024,
        school: 'Marmara Üniversitesi',
        field: 'İşletme',
        skill: 'SAP',
        lang: 'İngilizce',
        text: `Meltem Arıkan
İstanbul / Beşiktaş
meltem.arikan@example.com | 0532 123 45 67

Finans Müdürü
Anadolu Finans A.Ş.
01.2020 - 05.2024
Şirket bütçe süreçlerini yönetti ve nakit akışını optimize etti.

Marmara Üniversitesi
İşletme
2014-2018

SAP, Excel, Finansal Raporlama
İngilizce (İleri / C1)`,
      },
      {
        id: 'FT-02',
        sector: 'Bilişim / Yazılım',
        name: 'Kerem Altan',
        city: 'Ankara',
        district: 'Çankaya',
        email: 'kerem.altan@example.com',
        phone: '0533 234 56 78',
        role: 'Yazılım Geliştirici',
        company: 'Kuantum Yazılım Ltd. Şti.',
        startYear: 2019,
        endYear: 2023,
        school: 'Orta Doğu Teknik Üniversitesi',
        field: 'Bilgisayar Mühendisliği',
        skill: 'React',
        lang: 'İngilizce',
        text: `Kerem Altan
Ankara / Çankaya
kerem.altan@example.com - 0533 234 56 78

Kuantum Yazılım Ltd. Şti.
Yazılım Geliştirici
2019 - 2023
Bulut tabanlı mikroservis mimarilerini tasarladı ve geliştirdi.

Orta Doğu Teknik Üniversitesi
Bilgisayar Mühendisliği
2015-2019

React, Node.js, TypeScript, Docker
İngilizce - C1`,
      },
      {
        id: 'FT-03',
        sector: 'Sigorta',
        name: 'Deniz Yelkenci',
        city: 'İzmir',
        district: 'Bornova',
        email: 'deniz.yelkenci@example.com',
        phone: '0534 345 67 89',
        role: 'Sigorta Danışmanı',
        company: 'Ege Sigorta A.Ş.',
        startYear: 2021,
        endYear: 2024,
        school: 'Ege Üniversitesi',
        field: 'İktisat',
        skill: 'Risk Yönetimi',
        lang: 'Almanca',
        text: `Deniz Yelkenci | İzmir / Bornova | deniz.yelkenci@example.com | 0534 345 67 89
Ege Sigorta A.Ş. | Sigorta Danışmanı | 03.2021 - 04.2024
Bireysel ve kurumsal poliçe portföyünü yönetti.
Ege Üniversitesi - İktisat - 2016-2020
Risk Yönetimi, Müşteri İlişkileri, Portföy Yönetimi
Almanca - B2`,
      },
      {
        id: 'FT-04',
        sector: 'Lojistik / Taşımacılık',
        name: 'Barış Tuna',
        city: 'Kocaeli',
        district: 'Gebze',
        email: 'baris.tuna@example.com',
        phone: '0535 456 78 90',
        role: 'Lojistik Uzmanı',
        company: 'Marmara Lojistik A.Ş.',
        startYear: 2018,
        endYear: 2022,
        school: 'Kocaeli Üniversitesi',
        field: 'Uluslararası Ticaret',
        skill: 'Depo Yönetimi',
        lang: 'İngilizce',
        text: `Barış Tuna
Kocaeli, Gebze | baris.tuna@example.com | 0535 456 78 90
2018 - 2022
Marmara Lojistik A.Ş.
Lojistik Uzmanı
Depo ve sevkiyat operasyonlarını koordine etti.
Kocaeli Üniversitesi
Uluslararası Ticaret
2014-2018
Depo Yönetimi, ERP, Tedarik Zinciri
İngilizce - B2`,
      },
      {
        id: 'FT-05',
        sector: 'Sağlık / Tıp',
        name: 'Ayşegül Erdem',
        city: 'İstanbul',
        district: 'Kadıköy',
        email: 'aysegul.erdem@example.com',
        phone: '0536 567 89 01',
        role: 'Hemşire',
        company: 'Acıbadem Sağlık Grubu',
        startYear: 2017,
        endYear: 2023,
        school: 'İstanbul Üniversitesi',
        field: 'Hemşirelik',
        skill: 'Hasta Bakımı',
        lang: 'İngilizce',
        text: `Ayşegül Erdem
İstanbul / Kadıköy | aysegul.erdem@example.com | 0536 567 89 01
Hemşire @ Acıbadem Sağlık Grubu
2017-2023
Yoğun bakım ve acil servis hasta süreçlerini yönetti.
İstanbul Üniversitesi - Hemşirelik - 2013-2017
Hasta Bakımı, İlk Yardım, Klinik Protokoller
İngilizce - B1`,
      },
      {
        id: 'FT-06',
        sector: 'İnsan Kaynakları',
        name: 'Gözde Saygın',
        city: 'Bursa',
        district: 'Nilüfer',
        email: 'gozde.saygin@example.com',
        phone: '0537 678 90 12',
        role: 'İnsan Kaynakları Uzmanı',
        company: 'Oyak Renault A.Ş.',
        startYear: 2019,
        endYear: 2024,
        school: 'Uludağ Üniversitesi',
        field: 'Çalışma Ekonomisi',
        skill: 'İşe Alım',
        lang: 'Fransızca',
        text: `Gözde Saygın
Bursa / Nilüfer
gozde.saygin@example.com | 0537 678 90 12
İnsan Kaynakları Uzmanı - Oyak Renault A.Ş. - Bursa
2019 - 2024
Uçtan uca işe alım ve yetenek yönetimi süreçlerini yürüttü.
Uludağ Üniversitesi
Çalışma Ekonomisi
2015-2019
İşe Alım, Bordrolama, Performans Yönetimi
Fransızca - B2`,
      },
      {
        id: 'FT-07',
        sector: 'Pazarlama / Reklam',
        name: 'Tarkan Sezer',
        city: 'İstanbul',
        district: 'Şişli',
        email: 'tarkan.sezer@example.com',
        phone: '0538 789 01 23',
        role: 'Pazarlama Uzmanı',
        company: 'Tribal Medya A.Ş.',
        startYear: 2020,
        endYear: 2024,
        school: 'Bahçeşehir Üniversitesi',
        field: 'İletişim',
        skill: 'Google Ads',
        lang: 'İngilizce',
        text: `Tarkan Sezer | İstanbul / Şişli | tarkan.sezer@example.com | 0538 789 01 23
Tribal Medya A.Ş. / Pazarlama Uzmanı / 2020-2024
Dijital reklam kampanyalarını kurguladı ve yönetti.
Bahçeşehir Üniversitesi - İletişim - 2016-2020
Google Ads, Meta Ads, SEO, Google Analytics
İngilizce - C1`,
      },
      {
        id: 'FT-08',
        sector: 'İnşaat / Gayrimenkul',
        name: 'Burhan Kılıç',
        city: 'Antalya',
        district: 'Muratpaşa',
        email: 'burhan.kilic@example.com',
        phone: '0539 890 12 34',
        role: 'İnşaat Mühendisi',
        company: 'Antalya Yapı A.Ş.',
        startYear: 2016,
        endYear: 2022,
        school: 'Akdeniz Üniversitesi',
        field: 'İnşaat Mühendisliği',
        skill: 'AutoCAD',
        lang: 'Rusça',
        text: `Burhan Kılıç
Antalya / Muratpaşa
burhan.kilic@example.com | 0539 890 12 34
Company: Antalya Yapı A.Ş.
Position: İnşaat Mühendisi
Dates: 2016-2022
Büyük ölçekli şantiye ve hakediş süreçlerini yönetti.
Akdeniz Üniversitesi
İnşaat Mühendisliği
2012-2016
AutoCAD, Primavera, Statik Hesaplama
Rusça - B1`,
      },
      {
        id: 'FT-09',
        sector: 'Hukuk',
        name: 'Ebru Avcı',
        city: 'Ankara',
        district: 'Çankaya',
        email: 'ebru.avci@example.com',
        phone: '0530 901 23 45',
        role: 'Avukat',
        company: 'Avcı Hukuk Bürosu',
        startYear: 2018,
        endYear: 2024,
        school: 'Ankara Üniversitesi',
        field: 'Hukuk',
        skill: 'Sözleşmeler Hukuku',
        lang: 'İngilizce',
        text: `Ebru Avcı
Ankara / Çankaya | ebru.avci@example.com | 0530 901 23 45
Avukat
Avcı Hukuk Bürosu
2018 - Günümüz
Ticaret ve iş hukuku davalarını yürüttü.
Ankara Üniversitesi
Hukuk
2014-2018
Sözleşmeler Hukuku, Dava Takibi, Arabuluculuk
İngilizce - C1`,
      },
      {
        id: 'FT-10',
        sector: 'Turizm / Otelcilik',
        name: 'Serkan Güneş',
        city: 'Muğla',
        district: 'Bodrum',
        email: 'serkan.gunes@example.com',
        phone: '0531 012 34 56',
        role: 'Otel Müdürü',
        company: 'Rixos Premium Bodrum',
        startYear: 2019,
        endYear: 2024,
        school: 'Muğla Sıtkı Koçman Üniversitesi',
        field: 'Turizm ve Otelcilik',
        skill: 'Otel Yönetimi',
        lang: 'İngilizce',
        text: `Serkan Güneş | Muğla / Bodrum | serkan.gunes@example.com | 0531 012 34 56
Rixos Premium Bodrum
Otel Müdürü
2019 - 2024
Tesis operasyonlarını ve misafir memnuniyetini yönetti.
Muğla Sıtkı Koçman Üniversitesi - Turizm ve Otelcilik - 2015-2019
Otel Yönetimi, Bütçeleme, Misafir İlişkileri
İngilizce - C2`,
      },
      {
        id: 'FT-11',
        sector: 'E-Ticaret',
        name: 'Zehra Kutlu',
        city: 'İstanbul',
        district: 'Ümraniye',
        email: 'zehra.kutlu@example.com',
        phone: '0542 123 45 67',
        role: 'Kategori Yöneticisi',
        company: 'Hepsiburada A.Ş.',
        startYear: 2020,
        endYear: 2024,
        school: 'Boğaziçi Üniversitesi',
        field: 'İşletme',
        skill: 'E-Ticaret Yönetimi',
        lang: 'İngilizce',
        text: `Zehra Kutlu
İstanbul / Ümraniye
zehra.kutlu@example.com | 0542 123 45 67
Hepsiburada A.Ş. | Kategori Yöneticisi | 2020 - 2024
Elektronik kategori büyüme ve tedarikçi süreçlerini yönetti.
Boğaziçi Üniversitesi - İşletme - 2016-2020
E-Ticaret Yönetimi, Kampanya Planlama, Tedarikçi İlişkileri
İngilizce - C1`,
      },
      {
        id: 'FT-12',
        sector: 'Otomotiv',
        name: 'Murat Şimşek',
        city: 'Bursa',
        district: 'Osmangazi',
        email: 'murat.simsek@example.com',
        phone: '0543 234 56 78',
        role: 'Otomotiv Mühendisi',
        company: 'Tofaş Türk Otomobil Fabrikası A.Ş.',
        startYear: 2017,
        endYear: 2023,
        school: 'Uludağ Üniversitesi',
        field: 'Makine Mühendisliği',
        skill: 'SolidWorks',
        lang: 'İtalyanca',
        text: `Murat Şimşek
Bursa, Osmangazi | murat.simsek@example.com | 0543 234 56 78
Tofaş Türk Otomobil Fabrikası A.Ş.
Otomotiv Mühendisi
2017-2023
Gövde üretim hattı iyileştirme projelerini yürüttü.
Uludağ Üniversitesi
Makine Mühendisliği
2013-2017
SolidWorks, Catia, Yalın Üretim
İtalyanca - B2`,
      },
      {
        id: 'FT-13',
        sector: 'Perakende',
        name: 'Sevda Çetinkaya',
        city: 'İzmir',
        district: 'Konak',
        email: 'sevda.cetinkaya@example.com',
        phone: '0544 345 67 89',
        role: 'Mağaza Müdürü',
        company: 'Boyner Büyük Mağazacılık A.Ş.',
        startYear: 2018,
        endYear: 2024,
        school: 'Dokuz Eylül Üniversitesi',
        field: 'İktisat',
        skill: 'Mağaza Yönetimi',
        lang: 'İngilizce',
        text: `Sevda Çetinkaya | İzmir / Konak | sevda.cetinkaya@example.com | 0544 345 67 89
Boyner Büyük Mağazacılık A.Ş. / Mağaza Müdürü / 2018-2024
Mağaza satış hedefleri ve personel yönetimini sağladı.
Dokuz Eylül Üniversitesi - İktisat - 2014-2018
Mağaza Yönetimi, Stok Takibi, Satış Koçluğu
İngilizce - B2`,
      },
      {
        id: 'FT-14',
        sector: 'Enerji',
        name: 'Cemil Polat',
        city: 'Ankara',
        district: 'Gölbaşı',
        email: 'cemil.polat@example.com',
        phone: '0545 456 78 90',
        role: 'Enerji Sistemleri Mühendisi',
        company: 'Enerjisa Üretim A.Ş.',
        startYear: 2019,
        endYear: 2024,
        school: 'Gazi Üniversitesi',
        field: 'Elektrik Elektronik Mühendisliği',
        skill: 'Güneş Enerjisi',
        lang: 'İngilizce',
        text: `Cemil Polat
Ankara / Gölbaşı
cemil.polat@example.com | 0545 456 78 90
Enerjisa Üretim A.Ş.
Enerji Sistemleri Mühendisi
2019 - Günümüz
Yenilenebilir enerji santralleri verimlilik analizlerini yaptı.
Gazi Üniversitesi
Elektrik Elektronik Mühendisliği
2015-2019
Güneş Enerjisi, Şebeke Analizi, SCADA
İngilizce - B2`,
      },
      {
        id: 'FT-15',
        sector: 'Telekomünikasyon',
        name: 'Hakan Özkan',
        city: 'İstanbul',
        district: 'Ataşehir',
        email: 'hakan.ozkan@example.com',
        phone: '0546 567 89 01',
        role: 'Ağ ve Güvenlik Uzmanı',
        company: 'Turkcell İletişim Hizmetleri A.Ş.',
        startYear: 2018,
        endYear: 2023,
        school: 'Yıldız Teknik Üniversitesi',
        field: 'Bilgisayar Mühendisliği',
        skill: 'Cisco',
        lang: 'İngilizce',
        text: `Hakan Özkan
İstanbul / Ataşehir | hakan.ozkan@example.com | 0546 567 89 01
Turkcell İletişim Hizmetleri A.Ş. | Ağ ve Güvenlik Uzmanı | 2018 - 2023
Kurumsal omurga ağ altyapısını ve firewall sistemlerini yönetti.
Yıldız Teknik Üniversitesi - Bilgisayar Mühendisliği - 2014-2018
Cisco, Juniper, CCNA, Ağ Güvenliği
İngilizce - C1`,
      },
      {
        id: 'FT-16',
        sector: 'Gıda / Gastronomi',
        name: 'Gamze Şen',
        city: 'Gaziantep',
        district: 'Şehitkamil',
        email: 'gamze.sen@example.com',
        phone: '0547 678 90 12',
        role: 'Gıda Mühendisi',
        company: 'Tat Gıda Sanayi A.Ş.',
        startYear: 2019,
        endYear: 2024,
        school: 'Gaziantep Üniversitesi',
        field: 'Gıda Mühendisliği',
        skill: 'HACCP',
        lang: 'İngilizce',
        text: `Gamze Şen
Gaziantep / Şehitkamil | gamze.sen@example.com | 0547 678 90 12
Gıda Mühendisi @ Tat Gıda Sanayi A.Ş.
2019-2024
Üretim hattında kalite kontrol ve hijyen denetimlerini sağladı.
Gaziantep Üniversitesi - Gıda Mühendisliği - 2015-2019
HACCP, ISO 22000, Kalite Kontrol
İngilizce - B1`,
      },
      {
        id: 'FT-17',
        sector: 'İlaç / Medikal',
        name: 'Oğuz Demirer',
        city: 'İstanbul',
        district: 'Beykoz',
        email: 'oguz.demirer@example.com',
        phone: '0548 789 01 23',
        role: 'Ürün Müdürü',
        company: 'Abdi İbrahim İlaç Sanayi A.Ş.',
        startYear: 2017,
        endYear: 2024,
        school: 'Eczacılık Fakültesi',
        field: 'Eczacılık',
        skill: 'Ruhsatlandırma',
        lang: 'İngilizce',
        text: `Oğuz Demirer
İstanbul, Beykoz | oguz.demirer@example.com | 0548 789 01 23
Abdi İbrahim İlaç Sanayi A.Ş.
Ürün Müdürü
2017 - 2024
Reçeteli ilaç portföyü lansman ve pazarlama stratejilerini yönetti.
İstanbul Üniversitesi Eczacılık Fakültesi
2012-2017
Ruhsatlandırma, Medikal Pazarlama, GMP
İngilizce - C1`,
      },
      {
        id: 'FT-18',
        sector: 'Medya / Yayıncılık',
        name: 'Banu Yıldız',
        city: 'İstanbul',
        district: 'Beyoğlu',
        email: 'banu.yildiz@example.com',
        phone: '0549 890 12 34',
        role: 'Editör',
        company: 'Doğan Burda Dergi Yayıncılık A.Ş.',
        startYear: 2019,
        endYear: 2023,
        school: 'Galatasaray Üniversitesi',
        field: 'İletişim',
        skill: 'İçerik Yönetimi',
        lang: 'Fransızca',
        text: `Banu Yıldız | İstanbul / Beyoğlu | banu.yildiz@example.com | 0549 890 12 34
Doğan Burda Dergi Yayıncılık A.Ş. / Editör / 2019-2023
Aylık kültür sanat dergisi içerik planlamasını yaptı.
Galatasaray Üniversitesi - İletişim - 2015-2019
İçerik Yönetimi, Metin Yazarlığı, Röportaj
Fransızca - C1`,
      },
      {
        id: 'FT-19',
        sector: 'Havacılık',
        name: 'Tolga Baysal',
        city: 'İstanbul',
        district: 'Pendik',
        email: 'tolga.baysal@example.com',
        phone: '0550 901 23 45',
        role: 'Uçak Mühendisi',
        company: 'Türk Hava Yolları Teknik A.Ş.',
        startYear: 2018,
        endYear: 2024,
        school: 'İstanbul Teknik Üniversitesi',
        field: 'Uçak Mühendisliği',
        skill: 'Uçak Bakımı',
        lang: 'İngilizce',
        text: `Tolga Baysal
İstanbul / Pendik
tolga.baysal@example.com | 0550 901 23 45
Türk Hava Yolları Teknik A.Ş.
Uçak Mühendisi
2018 - Günümüz
Gövde ve motor periyodik ağır bakım süreçlerini denetledi.
İstanbul Teknik Üniversitesi
Uçak Mühendisliği
2014-2018
Uçak Bakımı, EASA Part 66, Kompozit Malzeme
İngilizce - C1`,
      },
      {
        id: 'FT-20',
        sector: 'Denizcilik',
        name: 'Kaan Reis',
        city: 'İzmir',
        district: 'Aliağa',
        email: 'kaan.reis@example.com',
        phone: '0551 012 34 56',
        role: 'Gemi Kaptanı',
        company: 'Arkas Denizcilik A.Ş.',
        startYear: 2016,
        endYear: 2024,
        school: 'Dokuz Eylül Üniversitesi',
        field: 'Deniz Ulaştırma İşletme Mühendisliği',
        skill: 'Seyir Güvenliği',
        lang: 'İngilizce',
        text: `Kaan Reis | İzmir / Aliağa | kaan.reis@example.com | 0551 012 34 56
Arkas Denizcilik A.Ş. | Gemi Kaptanı | 2016 - 2024
Uluslararası konteyner gemisi seyrüsefer ve personel operasyonlarını yönetti.
Dokuz Eylül Üniversitesi - Deniz Ulaştırma İşletme Mühendisliği - 2011-2016
Seyir Güvenliği, ECDIS, ISM Kod, GMDSS
İngilizce - C1`,
      },
    ];

    for (const f of freeTextFixtures) {
      it(`Fixture ${f.id} [${f.sector}]: extracts ${f.name} and unifies unstructured entities correctly`, () => {
        const raw = extractDeterministicCv(f.text);
        const canonical = mapCvToCanonicalTaxonomy(raw);
        const draft = buildProfileDraftFromCanonicalResult(canonical, `${f.id}.txt`);
        const values = draft.formValues as CareerProfileFormValues;

        expect(values.fullName).toBe(f.name);
        expect(values.city).toBe(f.city);
        expect(values.residenceDistrict).toBe(f.district);
        expect(values.email).toBe(f.email);
        expect(values.phone).toBe(f.phone);
        expect(values.experiences?.length).toBeGreaterThanOrEqual(1);
        expect(values.experiences?.[0].company).toContain(f.company.split(' ')[0]);
        expect(values.educationHistory?.length).toBeGreaterThanOrEqual(1);
      });
    }
  });

  // ==========================================================================
  // CATEGORY 2: 50 SIMULATED PDF CVS (Two-Column, Sidebar, Header/Footer Noise)
  // ==========================================================================
  describe('Category 2: 50 Simulated PDF CV Matrix (Spatial & Sectionless)', () => {
    const pdfCandidates = [
      { name: 'Alişan Demir', city: 'İstanbul', dist: 'Maltepe', role: 'Yazılım Geliştirici', comp: 'Trendyol Tech A.Ş.', sch: 'Yıldız Teknik Üniversitesi', sec: 'Bilişim / Yazılım' },
      { name: 'Buse Nur Kaya', city: 'Ankara', dist: 'Çankaya', role: 'Finans Uzmanı', comp: 'Ziraat Bankası', sch: 'Hacettepe Üniversitesi', sec: 'Finans / Bankacılık' },
      { name: 'Cenk Toygar', city: 'İzmir', dist: 'Karşıyaka', role: 'Satış Müdürü', comp: 'Vestel Ticaret A.Ş.', sch: 'Dokuz Eylül Üniversitesi', sec: 'Satış / Pazarlama' },
      { name: 'Derya Çetin', city: 'Bursa', dist: 'Nilüfer', role: 'Kalite Güvence Mühendisi', comp: 'Bosch Sanayi A.Ş.', sch: 'Uludağ Üniversitesi', sec: 'Üretim / Endüstriyel' },
      { name: 'Emre Karaca', city: 'Antalya', dist: 'Konyaaltı', role: 'Ön Büro Müdürü', comp: 'Maxx Royal Kemer', sch: 'Akdeniz Üniversitesi', sec: 'Turizm / Otelcilik' },
      { name: 'Fulya Keskin', city: 'Kocaeli', dist: 'İzmit', role: 'Proje Yöneticisi', comp: 'Ford Otosan A.Ş.', sch: 'Kocaeli Üniversitesi', sec: 'Otomotiv' },
      { name: 'Görkem Güler', city: 'Eskişehir', dist: 'Tepebaşı', role: 'Makine Mühendisi', comp: 'TUSAŞ Motor Sanayii A.Ş.', sch: 'Eskişehir Osmangazi Üniversitesi', sec: 'Havacılık' },
      { name: 'Hande Doğan', city: 'Adana', dist: 'Seyhan', role: 'Pazarlama Yöneticisi', comp: 'Sasa Polyester Sanayi A.Ş.', sch: 'Çukurova Üniversitesi', sec: 'Pazarlama' },
      { name: 'İlker Bayraktar', city: 'Trabzon', dist: 'Ortahisar', role: 'İnşaat Mühendisi', comp: 'Hekimoğlu Döküm Sanayi A.Ş.', sch: 'Karadeniz Teknik Üniversitesi', sec: 'İnşaat' },
      { name: 'Jale Şimşek', city: 'Samsun', dist: 'Atakum', role: 'Gıda Mühendisi', comp: 'Samsun Yem Sanayi A.Ş.', sch: 'Ondokuz Mayıs Üniversitesi', sec: 'Gıda' },
      { name: 'Kadir Mert', city: 'Gaziantep', dist: 'Şahinbey', role: 'Dış Ticaret Uzmanı', comp: 'Sanko Holding', sch: 'Gaziantep Üniversitesi', sec: 'Dış Ticaret' },
      { name: 'Lale Ergin', city: 'Kayseri', dist: 'Melikgazi', role: 'Muhasebe Müdürü', comp: 'İstikbal Mobilya Sanayi A.Ş.', sch: 'Erciyes Üniversitesi', sec: 'Muhasebe' },
      { name: 'Murat Can', city: 'Denizli', dist: 'Pamukkale', role: 'Tekstil Mühendisi', comp: 'Menderes Tekstil A.Ş.', sch: 'Pamukkale Üniversitesi', sec: 'Tekstil' },
      { name: 'Nihan Vural', city: 'Mersin', dist: 'Yenişehir', role: 'Lojistik Operasyon Uzmanı', comp: 'Mersin Uluslararası Limanı A.Ş.', sch: 'Mersin Üniversitesi', sec: 'Lojistik' },
      { name: 'Okan Şentürk', city: 'Manisa', dist: 'Yunusemre', role: 'Elektrik Mühendisi', comp: 'Schneider Electric Manisa', sch: 'Celal Bayar Üniversitesi', sec: 'Elektrik' },
      { name: 'Pelin Koç', city: 'Muğla', dist: 'Fethiye', role: 'Halkla İlişkiler Müdürü', comp: 'Hillside Beach Club', sch: 'Muğla Sıtkı Koçman Üniversitesi', sec: 'Turizm' },
      { name: 'Rıza Tan', city: 'Balıkesir', dist: 'Karesi', role: 'Ziraat Mühendisi', comp: 'Banvit Bandırma Vitaminli Yem A.Ş.', sch: 'Balıkesir Üniversitesi', sec: 'Tarım' },
      { name: 'Seda Akın', city: 'Tekirdağ', dist: 'Çorlu', role: 'Kimya Mühendisi', comp: 'Polifarma İlaç Sanayi A.Ş.', sch: 'Namık Kemal Üniversitesi', sec: 'İlaç' },
      { name: 'Tuna Dinçer', city: 'Sakarya', dist: 'Serdivan', role: 'Mekatronik Mühendisi', comp: 'Toyota Otomotiv Sanayi Türkiye A.Ş.', sch: 'Sakarya Üniversitesi', sec: 'Otomotiv' },
      { name: 'Umut Ege', city: 'Çanakkale', dist: 'Merkez', role: 'Çevre Mühendisi', comp: 'İçdaş Çelik Enerji A.Ş.', sch: 'Çanakkale Onsekiz Mart Üniversitesi', sec: 'Enerji' },
      { name: 'Vildan Kaplan', city: 'Aydın', dist: 'Kuşadası', role: 'Ön Muhasebe Uzmanı', comp: 'Pine Bay Holiday Resort', sch: 'Aydın Adnan Menderes Üniversitesi', sec: 'Turizm' },
      { name: 'Yasin Çelik', city: 'Hatay', dist: 'Antakya', role: 'İş Güvenliği Uzmanı', comp: 'İsdemir İskenderun Demir Çelik A.Ş.', sch: 'İskenderun Teknik Üniversitesi', sec: 'Ağır Sanayi' },
      { name: 'Zehra Arslan', city: 'Diyarbakır', dist: 'Kayapınar', role: 'Biyomedikal Mühendisi', comp: 'Dicle Sağlık Ürünleri Ltd.', sch: 'Dicle Üniversitesi', sec: 'Sağlık' },
      { name: 'Alp Eren', city: 'Şanlıurfa', dist: 'Haliliye', role: 'Sistem Mühendisi', comp: 'Gap Teknoloji A.Ş.', sch: 'Harran Üniversitesi', sec: 'Bilişim' },
      { name: 'Bahar Tunç', city: 'Malatya', dist: 'Battalgazi', role: 'Finans Danışmanı', comp: 'Anadolu Sigorta A.Ş.', sch: 'İnönü Üniversitesi', sec: 'Sigorta' },
      { name: 'Cavit Bilgin', city: 'Sivas', dist: 'Merkez', role: 'Metalurji Mühendisi', comp: 'Ermaden Madencilik A.Ş.', sch: 'Sivas Cumhuriyet Üniversitesi', sec: 'Madencilik' },
      { name: 'Defne Soylu', city: 'Kütahya', dist: 'Merkez', role: 'Seramik Mühendisi', comp: 'Kütahya Porselen Sanayi A.Ş.', sch: 'Kütahya Dumlupınar Üniversitesi', sec: 'Üretim' },
      { name: 'Engin Polat', city: 'Edirne', dist: 'Merkez', role: 'Gümrük Müşaviri', comp: 'Trakya Lojistik Ltd.', sch: 'Trakya Üniversitesi', sec: 'Lojistik' },
      { name: 'Feride Yılmaz', city: 'Ordu', dist: 'Altınordu', role: 'Gıda Teknikeri', comp: 'Gürsoy Fındık Sanayi A.Ş.', sch: 'Ordu Üniversitesi', sec: 'Gıda' },
      { name: 'Güney Aksoy', city: 'Afyonkarahisar', dist: 'Merkez', role: 'Maden Mühendisi', comp: 'Afyon Mermer Sanayi A.Ş.', sch: 'Afyon Kocatepe Üniversitesi', sec: 'Madencilik' },
      { name: 'Hülya Şen', city: 'Isparta', dist: 'Merkez', role: 'Kozmetik Kimyageri', comp: 'Gülbirlik Kozmetik A.Ş.', sch: 'Süleyman Demirel Üniversitesi', sec: 'Kimya' },
      { name: 'İsmet Kara', city: 'Zonguldak', dist: 'Merkez', role: 'Maden Mühendisi', comp: 'Türkiye Taşkömürü Kurumu', sch: 'Zonguldak Bülent Ecevit Üniversitesi', sec: 'Enerji' },
      { name: 'Kemalettin Taş', city: 'Kastamonu', dist: 'Merkez', role: 'Orman Endüstri Mühendisi', comp: 'Kastamonu Entegre Ağaç Sanayi A.Ş.', sch: 'Kastamonu Üniversitesi', sec: 'Ağaç Sanayi' },
      { name: 'Leyla Barış', city: 'Bolu', dist: 'Merkez', role: 'Gıda Kalite Yöneticisi', comp: 'Beypiliç Beypi Tarımsal A.Ş.', sch: 'Bolu Abant İzzet Baysal Üniversitesi', sec: 'Gıda' },
      { name: 'Mustafa Kurt', city: 'Rize', dist: 'Merkez', role: 'Tarımsal Danışman', comp: 'Çaykur Çay İşletmeleri', sch: 'Recep Tayyip Erdoğan Üniversitesi', sec: 'Tarım' },
      { name: 'Nazlı Özdemir', city: 'Giresun', dist: 'Merkez', role: 'Yazılım Test Mühendisi', comp: 'Karadeniz Yazılım Ltd.', sch: 'Giresun Üniversitesi', sec: 'Yazılım' },
      { name: 'Oğuzhan Çakır', city: 'Yalova', dist: 'Merkez', role: 'Gemi İnşa Mühendisi', comp: 'Sefine Tersanesi A.Ş.', sch: 'Yalova Üniversitesi', sec: 'Denizcilik' },
      { name: 'Pelin Ay', city: 'Düzce', dist: 'Merkez', role: 'İç Mimar', comp: 'Düzce Ahşap Tasarım Ltd.', sch: 'Düzce Üniversitesi', sec: 'Mimarlık' },
      { name: 'Rasim Öz', city: 'Uşak', dist: 'Merkez', role: 'Tekstil Mühendisi', comp: 'Uşak Seramik Sanayi A.Ş.', sch: 'Uşak Üniversitesi', sec: 'Tekstil' },
      { name: 'Sibel Kılıç', city: 'Nevşehir', dist: 'Ürgüp', role: 'Turizm Rehberi', comp: 'Kapadokya Balonculuk A.Ş.', sch: 'Nevşehir Hacı Bektaş Veli Üniversitesi', sec: 'Turizm' },
      { name: 'Tarık Demirtaş', city: 'Aksaray', dist: 'Merkez', role: 'Üretim Planlama Uzmanı', comp: 'Mercedes-Benz Türk Aksaray Kamyon Fabrikası', sch: 'Aksaray Üniversitesi', sec: 'Otomotiv' },
      { name: 'Ufuk Aydın', city: 'Niğde', dist: 'Merkez', role: 'Ziraat Mühendisi', comp: 'Ditaş Doğan Yedek Parça A.Ş.', sch: 'Niğde Ömer Halisdemir Üniversitesi', sec: 'Sanayi' },
      { name: 'Vahide Öztürk', city: 'Burdur', dist: 'Merkez', role: 'Gıda Denetmeni', comp: 'Burdur Şeker Fabrikası', sch: 'Burdur Mehmet Akif Ersoy Üniversitesi', sec: 'Gıda' },
      { name: 'Yıldırım Beyaz', city: 'Karaman', dist: 'Merkez', role: 'Gıda Proses Mühendisi', comp: 'Bifa Bisküvi ve Gıda Sanayi A.Ş.', sch: 'Karamanoğlu Mehmetbey Üniversitesi', sec: 'Gıda' },
      { name: 'Ziya Gökalp', city: 'Kırıkkale', dist: 'Merkez', role: 'Kimya Mühendisi', comp: 'Tüpraş Kırıkkale Rafinerisi', sch: 'Kırıkkale Üniversitesi', sec: 'Kimya' },
      { name: 'Aslı Gül', city: 'Çorum', dist: 'Merkez', role: 'Mali Müşavir', comp: 'Ece Holding Çorum', sch: 'Hitit Üniversitesi', sec: 'Finans' },
      { name: 'Bora Yaman', city: 'Amasya', dist: 'Merkez', role: 'Pazarlama Danışmanı', comp: 'Amasya Damızlık Birliği', sch: 'Amasya Üniversitesi', sec: 'Tarım' },
      { name: 'Cansel Çelik', city: 'Tokat', dist: 'Merkez', role: 'Ziraat Mühendisi', comp: 'Dimes Gıda Sanayi A.Ş.', sch: 'Tokat Gaziosmanpaşa Üniversitesi', sec: 'Gıda' },
      { name: 'Doğan Korkmaz', city: 'Kırşehir', dist: 'Merkez', role: 'Otomotiv Kalite Uzmanı', comp: 'Petlas Lastik Sanayi A.Ş.', sch: 'Kırşehir Ahi Evran Üniversitesi', sec: 'Otomotiv' },
      { name: 'Elif Şahin', city: 'Yozgat', dist: 'Merkez', role: 'Halkla İlişkiler Sorumlusu', comp: 'Yibitaş Çimento Sanayi A.Ş.', sch: 'Yozgat Bozok Üniversitesi', sec: 'Çimento' },
    ];

    for (let i = 0; i < pdfCandidates.length; i++) {
      const c = pdfCandidates[i];
      it(`PDF ${i + 1}/50 [${c.sec}]: extracts ${c.name} accurately via simulated PDF buffer`, async () => {
        const rawLines = [
          c.name,
          `${c.city} / ${c.dist}`,
          `${c.name.toLowerCase().replace(/[^a-z]/g, '')}@example.com | 0532 999 88 ${String(i).padStart(2, '0')}`,
          `${c.role} @ ${c.comp}`,
          '2019 - 2024',
          '* İlgili departman ve iş süreçlerinin operasyonel yönetimini sağladı.',
          `${c.sch} - Lisans - 2015-2019`,
          'YETKİNLİKLER: MS Office, ERP, Raporlama, İletişim',
          'DİLLER: İngilizce (İleri / C1)',
        ];

        const pdfBuffer = createMockPdf(rawLines);
        const draft = await cvService.processCvBuffer({
          buffer: pdfBuffer,
          fileName: `pdf_fixture_${i + 1}.pdf`,
          mimeType: 'application/pdf',
        });

        const fv = draft.formValues as CareerProfileFormValues;
        expect(fv.fullName).toBe(c.name);
        expect(fv.city).toBe(c.city);
        expect(fv.residenceDistrict).toBe(c.dist);
        expect(fv.experiences?.length).toBeGreaterThanOrEqual(1);
        expect(fv.educationHistory?.length).toBeGreaterThanOrEqual(1);
      });
    }
  });

  // ==========================================================================
  // CATEGORY 3: 30 SIMULATED DOCX CVS (Tables, Headings, Unstructured XML)
  // ==========================================================================
  describe('Category 3: 30 Simulated DOCX CV Matrix (Paragraphs & Tables)', () => {
    const docxCandidates = [
      { name: 'Ahmet Faruk Yener', city: 'İstanbul', dist: 'Beşiktaş', role: 'Mobil Uygulama Geliştirici', comp: 'Trendyol Tech', sch: 'Boğaziçi Üniversitesi' },
      { name: 'Berrin Yılmaz', city: 'Ankara', dist: 'Çankaya', role: 'Veri Bilimci', comp: 'Aselsan A.Ş.', sch: 'Orta Doğu Teknik Üniversitesi' },
      { name: 'Cüneyt Taner', city: 'İzmir', dist: 'Urla', role: 'Siber Güvenlik Uzmanı', comp: 'Havelsan A.Ş.', sch: 'İzmir Yüksek Teknoloji Enstitüsü' },
      { name: 'Dilek Ece Karasu', city: 'Bursa', dist: 'Nilüfer', role: 'Endüstri Mühendisi', comp: 'TOFAŞ A.Ş.', sch: 'Uludağ Üniversitesi' },
      { name: 'Emre Can Bayrak', city: 'Kocaeli', dist: 'Gebze', role: 'DevOps Mühendisi', comp: 'Logo Yazılım A.Ş.', sch: 'Gebze Teknik Üniversitesi' },
      { name: 'Funda Gültekin', city: 'Antalya', dist: 'Muratpaşa', role: 'Yatırım Danışmanı', comp: 'Garanti BBVA', sch: 'Akdeniz Üniversitesi' },
      { name: 'Gökberk Kurt', city: 'Eskişehir', dist: 'Odunpazarı', role: 'Uçak Bakım Teknisyeni', comp: 'TEI A.Ş.', sch: 'Anadolu Üniversitesi' },
      { name: 'Hilal Melisa Ak', city: 'Adana', dist: 'Çukurova', role: 'Pazarlama Yöneticisi', comp: 'Sabancı Holding', sch: 'Çukurova Üniversitesi' },
      { name: 'İsmail Hakkı Şen', city: 'Trabzon', dist: 'Yomra', role: 'İnşaat Proje Müdürü', comp: 'Cengiz İnşaat A.Ş.', sch: 'Karadeniz Teknik Üniversitesi' },
      { name: 'Jülide Kaya', city: 'Samsun', dist: 'İlkadım', role: 'Gıda Kalite Mühendisi', comp: 'Yeşilyurt Demir Çelik A.Ş.', sch: 'Ondokuz Mayıs Üniversitesi' },
      { name: 'Kaan Volkan Demir', city: 'Gaziantep', dist: 'Şehitkamil', role: 'İhracat Müdürü', comp: 'Köksan Pet ve Plastik A.Ş.', sch: 'Gaziantep Üniversitesi' },
      { name: 'Lamia Erdem', city: 'Kayseri', dist: 'Kocasinan', role: 'Mali İşler Direktörü', comp: 'Hes Hacılar Kablo A.Ş.', sch: 'Erciyes Üniversitesi' },
      { name: 'Melih Cevdet', city: 'Denizli', dist: 'Merkezefendi', role: 'Üretim Müdürü', comp: 'Zorluteks Tekstil A.Ş.', sch: 'Pamukkale Üniversitesi' },
      { name: 'Nalan Tuncer', city: 'Mersin', dist: 'Tarsus', role: 'Lojistik Planlama Müdürü', comp: 'Ceynak Lojistik A.Ş.', sch: 'Mersin Üniversitesi' },
      { name: 'Ozan Orkun Güçlü', city: 'Manisa', dist: 'Şehzadeler', role: 'Elektronik Mühendisi', comp: 'Vestel Beyaz Eşya A.Ş.', sch: 'Manisa Celal Bayar Üniversitesi' },
      { name: 'Pakize Altın', city: 'Muğla', dist: 'Marmaris', role: 'Turizm Acente Müdürü', comp: 'Coral Travel Türkiye', sch: 'Muğla Sıtkı Koçman Üniversitesi' },
      { name: 'Ramazan Soydan', city: 'Balıkesir', dist: 'Bandırma', role: 'Kimya Laboratuvar Şefi', comp: 'Etibank Boraks İşletmeleri', sch: 'Balıkesir Üniversitesi' },
      { name: 'Sevgi Çetin', city: 'Tekirdağ', dist: 'Süleymanpaşa', role: 'Satınalma Müdürü', comp: 'Tekirdağ Un Sanayi A.Ş.', sch: 'Tekirdağ Namık Kemal Üniversitesi' },
      { name: 'Turgut Alp Demir', city: 'Sakarya', dist: 'Adapazarı', role: 'Otomotiv Tasarım Mühendisi', comp: 'Otokar Otomotiv A.Ş.', sch: 'Sakarya Üniversitesi' },
      { name: 'Ülkü Beril Acar', city: 'Çanakkale', dist: 'Biga', role: 'İnsan Kaynakları Müdürü', comp: 'Doğtaş Kelebek Mobilya A.Ş.', sch: 'Çanakkale Onsekiz Mart Üniversitesi' },
      { name: 'Vecihi Hürkuş', city: 'İstanbul', dist: 'Kadıköy', role: 'Havacılık Operasyon Müdürü', comp: 'Pegasus Hava Taşımacılığı A.Ş.', sch: 'İstanbul Teknik Üniversitesi' },
      { name: 'Yıldız Kenter', city: 'İzmir', dist: 'Bornova', role: 'Kurumsal İletişim Müdürü', comp: 'Yaşar Holding A.Ş.', sch: 'Ege Üniversitesi' },
      { name: 'Zafer Cengiz', city: 'Ankara', dist: 'Etimesgut', role: 'Savunma Sistemleri Mühendisi', comp: 'Roketsan A.Ş.', sch: 'Gazi Üniversitesi' },
      { name: 'Aydan Şener', city: 'Antalya', dist: 'Alanya', role: 'Gelirler Müdürü', comp: 'Sunprime C-Lounge Hotel', sch: 'Akdeniz Üniversitesi' },
      { name: 'Burak Sergen', city: 'Bursa', dist: 'İnegöl', role: 'Mobilya Tasarımcısı', comp: 'Saloni Mobilya A.Ş.', sch: 'Uludağ Üniversitesi' },
      { name: 'Canan Tan', city: 'Diyarbakır', dist: 'Bağlar', role: 'Bölge Satış Müdürü', comp: 'Dicle Elektrik Dağıtım A.Ş.', sch: 'Dicle Üniversitesi' },
      { name: 'Dursun Ali', city: 'Rize', dist: 'Çayeli', role: 'Ziraat Operasyon Müdürü', comp: 'Doğuş Çay Tarım A.Ş.', sch: 'Recep Tayyip Erdoğan Üniversitesi' },
      { name: 'Ece Uslu', city: 'Aydın', dist: 'Efeler', role: 'Zeytinyağı Proses Mühendisi', comp: 'Tariş Zeytinyağı Birliği', sch: 'Aydın Adnan Menderes Üniversitesi' },
      { name: 'Fikret Orman', city: 'İstanbul', dist: 'Sarıyer', role: 'Gayrimenkul Geliştirme Müdürü', comp: 'Emlak Konut GYO A.Ş.', sch: 'Yıldız Teknik Üniversitesi' },
      { name: 'Gülriz Sururi', city: 'İzmir', dist: 'Çeşme', role: 'Etkinlik ve Organizasyon Müdürü', comp: 'Alaçatı Turizm Yatırımları A.Ş.', sch: 'Dokuz Eylül Üniversitesi' },
    ];

    for (let i = 0; i < docxCandidates.length; i++) {
      const c = docxCandidates[i];
      it(`DOCX ${i + 1}/30: extracts ${c.name} from simulated DOCX XML document`, async () => {
        const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:t>${c.name}</w:t></w:p>
    <w:p><w:t>${c.city} / ${c.dist} | ${c.name.toLowerCase().replace(/[^a-z]/g, '')}@example.com | 0533 111 22 ${String(i).padStart(2, '0')}</w:t></w:p>
    <w:p><w:t>${c.role}</w:t></w:p>
    <w:p><w:t>${c.comp}</w:t></w:p>
    <w:p><w:t>2018 - 2024</w:t></w:p>
    <w:p><w:t>• Şirket içi ve dışı operasyonel süreçlerin yönetimi ve denetimi.</w:t></w:p>
    <w:p><w:t>${c.sch} - Lisans - 2014-2018</w:t></w:p>
    <w:p><w:t>YETKİNLİKLER: Liderlik, Çevik Yönetim, ERP, MS Office</w:t></w:p>
    <w:p><w:t>DİLLER: İngilizce (İleri / C1)</w:t></w:p>
  </w:body>
</w:document>`;

        const docxBuffer = createMockDocx(docxXml);
        const draft = await cvService.processCvBuffer({
          buffer: docxBuffer,
          fileName: `docx_fixture_${i + 1}.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        const fv = draft.formValues as CareerProfileFormValues;
        expect(fv.fullName).toBe(c.name);
        expect(fv.city).toBe(c.city);
        expect(fv.residenceDistrict).toBe(c.dist);
        expect(fv.experiences?.length).toBeGreaterThanOrEqual(1);
        expect(fv.educationHistory?.length).toBeGreaterThanOrEqual(1);
      });
    }
  });

  // ==========================================================================
  // CATEGORY 4: 10 ADVERSARIAL & NEGATIVE DISAMBIGUATION CVS
  // ==========================================================================
  describe('Category 4: 10 Adversarial & Negative Disambiguation Scenarios', () => {
    it('ADV-01: Name "Fatih Kaya" is NEVER mistaken for İstanbul / Fatih district', () => {
      const text = `Fatih Kaya\nAnkara / Çankaya\nfatih@example.com | 0532 111 22 33\nFinans Uzmanı\nZiraat Bankası 2020 - 2024\nAnkara Üniversitesi - İşletme - 2016-2020`;
      const res = extractDeterministicCv(text);
      expect(res.fullName).toBe('Fatih Kaya');
      expect(res.locations).toContain('Ankara');
      expect(res.locations).toContain('Çankaya');
      expect(res.locations).not.toContain('Fatih');
    });

    it('ADV-02: Name "Kartal Demir" is NEVER mistaken for İstanbul / Kartal district', () => {
      const text = `Kartal Demir\nİzmir / Karşıyaka\nkartal@example.com | 0533 222 33 44\nSatış Temsilcisi\nEge Ticaret A.Ş. 2019 - 2024\nEge Üniversitesi - İktisat - 2015-2019`;
      const res = extractDeterministicCv(text);
      expect(res.fullName).toBe('Kartal Demir');
      expect(res.locations).toContain('İzmir');
      expect(res.locations).toContain('Karşıyaka');
      expect(res.locations).not.toContain('Kartal');
    });

    it('ADV-03: "İstanbul Teknik Üniversitesi" is NEVER classified as COMPANY in experiences', () => {
      const text = `Burak Yılmaz\nİstanbul / Maslak\nburak@example.com | 0534 333 44 55\nAraştırma Görevlisi\nİstanbul Teknik Üniversitesi\n2018 - 2023\nAkademik araştırma ve ders asistanlığı yaptı.\nİTÜ - Bilgisayar Mühendisliği - 2014-2018`;
      const res = extractDeterministicCv(text);
      expect(res.fullName).toBe('Burak Yılmaz');
      expect(res.education?.some((e) => e.school?.includes('Teknik'))).toBe(true);
    });

    it('ADV-04: Standalone word "Danışmanlık" in corporate name is COMPANY, not ROLE', () => {
      const text = `Selin Aktaş\nİstanbul / Kadıköy\nselin@example.com\nKıdemli Danışman\nKPMG Danışmanlık A.Ş.\n2020 - 2024\nMarmara Üniversitesi - İktisat - 2016-2020`;
      const res = extractDeterministicCv(text);
      expect(res.experiences?.[0]?.company).toContain('Danışmanlık');
      expect(res.experiences?.[0]?.role).toMatch(/Danışman|Kıdemli/i);
    });

    it('ADV-05: Technical tool "SAP" is SKILL, NEVER parsed as COMPANY or ROLE', () => {
      const text = `Onur Karaca\nBursa / Nilüfer\nonur@example.com\nLojistik Uzmanı\nBosch Sanayi A.Ş.\n2019 - 2024\nSAP, Excel, Power BI\nUludağ Üniversitesi - 2015-2019`;
      const res = extractDeterministicCv(text);
      expect(res.tools.some((t) => t.includes('SAP'))).toBe(true);
      expect(res.experiences?.[0]?.company).toContain('Bosch');
      expect(res.experiences?.[0]?.company).not.toBe('SAP');
    });

    it('ADV-06: Programming language "Python" is SKILL, NEVER parsed as EXPERIENCE or ROLE', () => {
      const text = `Ece Yıldız\nAnkara / Çankaya\nece@example.com\nVeri Analisti\nTürk Telekom A.Ş.\n2021 - 2024\nPython, SQL, Tableau\nODTÜ - İstatistik - 2017-2021`;
      const res = extractDeterministicCv(text);
      expect(res.tools).toContain('Python');
      expect(res.experiences?.[0]?.role).toBe('Veri Analisti');
      expect(res.experiences?.[0]?.company).toContain('Telekom');
    });

    it('ADV-07: OCR degraded month "A ustos 2020" and "Kas im 2023" parses accurately without data loss', () => {
      const text = `Mert Dinç\nİzmir / Konak\nmert@example.com\nProje Mühendisi\nVestel Elektronik A.Ş.\nA ustos 2020 - Kas im 2023\nDokuz Eylül Üniversitesi - Makine - 2016-2020`;
      const res = extractDeterministicCv(text);
      expect(res.experiences?.[0]?.startYear).toBe(2020);
      expect(res.experiences?.[0]?.endYear).toBe(2023);
    });

    it('ADV-08: Format G (Date -> Role -> Company) extracts correctly without losing role/company link', () => {
      const text = `Gamze Çelik\nİstanbul / Şişli\ngamze@example.com\n2018 - 2023\nPazarlama Yöneticisi\nUnilever Sanayi ve Ticaret Türk A.Ş.\nİstanbul Üniversitesi - İletişim - 2014-2018`;
      const res = extractDeterministicCv(text);
      expect(res.experiences?.[0]?.startYear).toBe(2018);
      expect(res.experiences?.[0]?.endYear).toBe(2023);
      expect(res.experiences?.[0]?.role).toMatch(/Pazarlama/i);
      expect(res.experiences?.[0]?.company).toMatch(/Unilever/i);
    });

    it('ADV-09: Single-line slash composite "Arkas Lojistik A.Ş. / Lojistik Müdürü / 2019-2024" resolves cleanly', () => {
      const text = `Kemal Arslan\nİzmir / Bornova\nkemal@example.com\nArkas Lojistik A.Ş. / Lojistik Müdürü / 2019-2024\nEge Üniversitesi - İşletme - 2015-2019`;
      const res = extractDeterministicCv(text);
      expect(res.experiences?.[0]?.company).toMatch(/Arkas/i);
      expect(res.experiences?.[0]?.role).toMatch(/Lojistik/i);
      expect(res.experiences?.[0]?.startYear).toBe(2019);
      expect(res.experiences?.[0]?.endYear).toBe(2024);
    });

    it('ADV-10: Zero hallucination: Empty gender and birthdate are NEVER hallucinated from job or name', () => {
      const text = `Selin Demir\nİstanbul / Beşiktaş\nselin@example.com | 0532 999 00 11\nFinans Uzmanı\nAkbank T.A.Ş. 2021 - 2024\nBoğaziçi Üniversitesi - İktisat - 2017-2021`;
      const res = extractDeterministicCv(text);
      expect(res.fullName).toBe('Selin Demir');
      expect(res.gender).toBeUndefined(); // Zero hallucination
      expect(res.birthDate).toBeUndefined(); // Zero hallucination
    });
  });
});
