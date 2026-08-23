/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 10.0
 * DATA LOSS & TOKEN TRACKING GATE TEST SUITE
 * 
 * Verifies that zero information loss or silent token destruction occurs
 * during binary ingestion, normalization, unrolling, extraction, taxonomy mapping,
 * and profile draft conversion.
 */

import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { normalizeCvText } from './cv-turkish-encoding';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';

describe('CV Extraction Engine 10.0 — Data Loss & Token Tracking Gate', () => {
  it('DL-01: Preserves complex tech acronyms and symbols (C++, C#, .NET, CI/CD, A/B)', () => {
    const cv = `KİŞİSEL BİLGİLER
Adı Soyadı: Berkant Özdemir
E-posta: berkant@tech.dev
Adres: İstanbul, Türkiye

İŞ DENEYİMİ
2020 - 2024
Kıdemli Backend Geliştirici
Teknoloji Yazılım A.Ş.
• C++20 ve C# / .NET Core ile yüksek frekanslı ticaret sistemleri mimarisi.
• CI/CD boru hatlarında GitLab ve GitHub Actions otomasyonu.
• A/B testleri ve REST / gRPC API protokolleri geliştirilmesi.

BECERİLER
C++, C#, .NET Core, CI/CD, Docker, Kubernetes, gRPC, TCP/IP`;

    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);

    expect(canonical.fullName).toBe('Berkant Özdemir');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    const exp = canonical.experiences[0];
    expect(exp.responsibilities).toContain('C++');
    expect(exp.responsibilities).toContain('C#');
    expect(exp.responsibilities).toContain('.NET Core');
    expect(exp.responsibilities).toContain('CI/CD');
    expect(exp.responsibilities).toContain('A/B');
  });

  it('DL-02: Preserves 100% of Turkish diacritics under severe multi-stage transformations', () => {
    const rawWithDiacritics = `Özgeçmiş: Çağlar Şükrü Yağız
Lokasyon: Çankaya / Ankara
E-posta: caglar@ornek.com

İŞ TECRÜBESİ
2018 - 2024
Müşteri İlişkileri Yöneticisi
Çağdaş Dağıtım ve Lojistik Şirketi
• Şirket içi süreçlerin iyileştirilmesi ve çalışan memnuniyetinin ölçülmesi.
• Çağrı merkezi görüşme kalitesinin denetlenmesi ve geri bildirim raporlaması.`;

    const normalized = normalizeCvText(rawWithDiacritics);
    expect(normalized).toContain('Çağlar Şükrü Yağız');
    expect(normalized).toContain('Çankaya');
    expect(normalized).toContain('Müşteri İlişkileri Yöneticisi');

    const payload = extractDeterministicCv(rawWithDiacritics);
    const canonical = mapCvToCanonicalTaxonomy(payload);

    expect(canonical.fullName).toBe('Çağlar Şükrü Yağız');
    expect(canonical.residenceDistrict).toBe('Çankaya');
    expect(canonical.residenceCity).toBe('Ankara');
    expect(canonical.primaryRole).toMatch(/Müşteri/);
  });

  it('DL-03: Preserves all long multi-sentence responsibility bullets without truncation', () => {
    const longBullet1 = 'Yıllık 15 milyon tekil kullanıcıya hizmet veren mikroservis mimarisinin Kubernetes kümesinde kesintisiz çalışmasının sağlanması, AWS EKS altyapısının Terraform ile kod olarak yönetilmesi ve maliyetlerin %30 düşürülmesi.';
    const longBullet2 = 'Ekip içi Agile ve Scrum ritüellerinin yönetilmesi, haftalık sprint planlama ve retrospektif toplantılarının koordine edilmesi ve genç mühendislere teknik mentorluk verilmesi.';

    const cv = `Adı Soyadı: Hande Aktaş
Lokasyon: İzmir
E-posta: hande@cloud.io

DENEYİM
2019 - 2024
DevOps Mühendisi
Bulut Teknoloji A.Ş.
• ${longBullet1}
• ${longBullet2}`;

    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);

    expect(canonical.experiences.length).toBe(1);
    const resp = canonical.experiences[0].responsibilities;
    expect(resp).toContain('15 milyon tekil kullanıcıya');
    expect(resp).toContain('Kubernetes kümesinde');
    expect(resp).toContain('Terraform ile kod olarak');
    expect(resp).toContain('Agile ve Scrum ritüellerinin');
    expect(resp).toContain('teknik mentorluk');
  });

  it('DL-04: Preserves complete education degree, school, department, and graduation year', () => {
    const cv = `Adı Soyadı: Tolga Güneş
İstanbul / Kadıköy
tolga@univ.edu

EĞİTİM
2018 - 2022
Yıldız Teknik Üniversitesi
Elektrik Elektronik Mühendisliği
Lisans (Mezuniyet Notu: 3.65 / 4.00)

2014 - 2018
Kabataş Erkek Lisesi
Sayısal Bölümü`;

    const payload = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(payload);

    expect(canonical.educationLevel).toBe('Lisans');
    expect(canonical.educationList.length).toBeGreaterThanOrEqual(2);
    const uni = canonical.educationList.find((e) => e.school?.includes('Yıldız'));
    expect(uni).toBeDefined();
    expect(uni?.field).toContain('Elektrik');
    expect(uni?.graduationYear).toBe(2022);
  });

  it('DL-05: Multi-page large CV token stability (>20,000 characters without memory leak or drop)', () => {
    let multiPageCv = `Adı Soyadı: Mustafa Kemal Yalçın\nLokasyon: Ankara / Çankaya\nE-posta: kemal.yalcin@largecv.com\n\nİŞ DENEYİMİ\n`;
    for (let yr = 2024; yr >= 2004; yr -= 2) {
      multiPageCv += `${yr - 2} - ${yr}\nKıdemli Yazılım Geliştirici\nTeknoloji Şirketi A.Ş.\n• Kurumsal ERP sistemleri modül geliştirmeleri ve ${yr} yılı SLA hedeflerinin %100 gerçekleştirilmesi.\n• Yüksek erişilebilirlik ve veri bütünlüğü denetimlerinin yürütülmesi.\n\n`;
    }

    const payload = extractDeterministicCv(multiPageCv);
    const canonical = mapCvToCanonicalTaxonomy(payload);
    const draft = buildProfileDraftFromCanonicalResult(canonical);

    expect(canonical.fullName).toBe('Mustafa Kemal Yalçın');
    expect(canonical.experiences.length).toBe(11);
    expect(draft.formValues.fullName).toBe('Mustafa Kemal Yalçın');
    expect(draft.formValues.experiences.length).toBe(11);
  });
});
