import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph } from './cv-evidence-graph';

describe('CV Extraction Engine 9.0 — 100 Multilingual & Mixed-Language CV Matrix Suite', () => {
  it('[MULTILINGUAL_1/100] Correctly resolves Hans Müller with DE / Mixed structure', () => {
    const cv = `
Hans Müller
Berlin | contact@example.com
Senior Software Engineer

BERUFSERFAHRUNG
Siemens AG - Senior Software Engineer (2018 - 2024)
Strategic leadership, execution and team management.

AUSBILDUNG
University of Science - Degree (2012 - 2016)

KOMPETENZEN
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Müller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_2/100] Correctly resolves Jean Dupont with FR / Mixed structure', () => {
    const cv = `
Jean Dupont
Paris | 0532 999 00 11
Directeur Financier

DENEYİM
BNP Paribas S.A. - Directeur Financier (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Jean Dupont');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_3/100] Correctly resolves Carlos Rodriguez with ES / Mixed structure', () => {
    const cv = `
Carlos Rodriguez
İstanbul / Kadıköy | 0533 111 22 33
Director de Operaciones

PROFESSIONAL EXPERIENCE
Inditex S.A. - Director de Operaciones (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Carlos Rodriguez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_4/100] Correctly resolves John Smith with EN / Mixed structure', () => {
    const cv = `
John Smith
Ankara / Çankaya | cand@example.com
Head of Product Management

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('John Smith');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_5/100] Correctly resolves Ahmet Yılmaz with TR / Mixed structure', () => {
    const cv = `
Ahmet Yılmaz
İstanbul | contact@example.com
Çağrı Merkezi Operasyon Müdürü

İŞ DENEYİMİ
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Strategic leadership, execution and team management.

EĞİTİM
University of Science - Degree (2012 - 2016)

YETKİNLİKLER
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_6/100] Correctly resolves Klaus Becker with DE / Mixed structure', () => {
    const cv = `
Klaus Becker
Berlin | 0532 999 00 11
Senior Software Engineer

DENEYİM
Siemens AG - Senior Software Engineer (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Klaus Becker');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_7/100] Correctly resolves Pierre Martin with FR / Mixed structure', () => {
    const cv = `
Pierre Martin
İstanbul / Kadıköy | 0533 111 22 33
Directeur Financier

PROFESSIONAL EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pierre Martin');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_8/100] Correctly resolves Alejandro Morales with ES / Mixed structure', () => {
    const cv = `
Alejandro Morales
Ankara / Çankaya | cand@example.com
Director de Operaciones

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Inditex S.A. - Director de Operaciones (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alejandro Morales');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_9/100] Correctly resolves David Miller with EN / Mixed structure', () => {
    const cv = `
David Miller
Dublin | contact@example.com
Head of Product Management

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Strategic leadership, execution and team management.

EDUCATION
University of Science - Degree (2012 - 2016)

CORE SKILLS
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('David Miller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_10/100] Correctly resolves Mustafa Çelik with TR / Mixed structure', () => {
    const cv = `
Mustafa Çelik
İstanbul | 0532 999 00 11
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mustafa Çelik');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_11/100] Correctly resolves Stefan Wagner with DE / Mixed structure', () => {
    const cv = `
Stefan Wagner
İstanbul / Kadıköy | 0533 111 22 33
Senior Software Engineer

PROFESSIONAL EXPERIENCE
Siemens AG - Senior Software Engineer (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Stefan Wagner');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_12/100] Correctly resolves Michel Bernard with FR / Mixed structure', () => {
    const cv = `
Michel Bernard
Ankara / Çankaya | cand@example.com
Directeur Financier

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Michel Bernard');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_13/100] Correctly resolves Javier Lopez with ES / Mixed structure', () => {
    const cv = `
Javier Lopez
Madrid | contact@example.com
Director de Operaciones

EXPERIENCIA LABORAL
Inditex S.A. - Director de Operaciones (2018 - 2024)
Strategic leadership, execution and team management.

EDUCACIÓN
University of Science - Degree (2012 - 2016)

HABILIDADES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Javier Lopez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_14/100] Correctly resolves Robert Johnson with EN / Mixed structure', () => {
    const cv = `
Robert Johnson
Dublin | 0532 999 00 11
Head of Product Management

DENEYİM
Google Ireland Ltd. - Head of Product Management (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Robert Johnson');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_15/100] Correctly resolves Mehmet Demir with TR / Mixed structure', () => {
    const cv = `
Mehmet Demir
İstanbul / Kadıköy | 0533 111 22 33
Çağrı Merkezi Operasyon Müdürü

PROFESSIONAL EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mehmet Demir');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_16/100] Correctly resolves Wolfgang Weber with DE / Mixed structure', () => {
    const cv = `
Wolfgang Weber
Ankara / Çankaya | cand@example.com
Senior Software Engineer

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Siemens AG - Senior Software Engineer (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Wolfgang Weber');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_17/100] Correctly resolves Antoine Thomas with FR / Mixed structure', () => {
    const cv = `
Antoine Thomas
Paris | contact@example.com
Directeur Financier

EXPÉRIENCE PROFESSIONNELLE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Strategic leadership, execution and team management.

FORMATION
University of Science - Degree (2012 - 2016)

COMPÉTENCES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Antoine Thomas');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_18/100] Correctly resolves Mateo Hernandez with ES / Mixed structure', () => {
    const cv = `
Mateo Hernandez
Madrid | 0532 999 00 11
Director de Operaciones

DENEYİM
Inditex S.A. - Director de Operaciones (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mateo Hernandez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_19/100] Correctly resolves William Brown with EN / Mixed structure', () => {
    const cv = `
William Brown
İstanbul / Kadıköy | 0533 111 22 33
Head of Product Management

PROFESSIONAL EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('William Brown');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_20/100] Correctly resolves Ali Kaya with TR / Mixed structure', () => {
    const cv = `
Ali Kaya
Ankara / Çankaya | cand@example.com
Çağrı Merkezi Operasyon Müdürü

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ali Kaya');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_21/100] Correctly resolves Hans Dupont with DE / Mixed structure', () => {
    const cv = `
Hans Dupont
Berlin | contact@example.com
Senior Software Engineer

BERUFSERFAHRUNG
Siemens AG - Senior Software Engineer (2018 - 2024)
Strategic leadership, execution and team management.

AUSBILDUNG
University of Science - Degree (2012 - 2016)

KOMPETENZEN
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Dupont');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_22/100] Correctly resolves Jean Rodriguez with FR / Mixed structure', () => {
    const cv = `
Jean Rodriguez
Paris | 0532 999 00 11
Directeur Financier

DENEYİM
BNP Paribas S.A. - Directeur Financier (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Jean Rodriguez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_23/100] Correctly resolves Carlos Smith with ES / Mixed structure', () => {
    const cv = `
Carlos Smith
İstanbul / Kadıköy | 0533 111 22 33
Director de Operaciones

PROFESSIONAL EXPERIENCE
Inditex S.A. - Director de Operaciones (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Carlos Smith');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_24/100] Correctly resolves John Yılmaz with EN / Mixed structure', () => {
    const cv = `
John Yılmaz
Ankara / Çankaya | cand@example.com
Head of Product Management

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('John Yılmaz');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_25/100] Correctly resolves Ahmet Becker with TR / Mixed structure', () => {
    const cv = `
Ahmet Becker
İstanbul | contact@example.com
Çağrı Merkezi Operasyon Müdürü

İŞ DENEYİMİ
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Strategic leadership, execution and team management.

EĞİTİM
University of Science - Degree (2012 - 2016)

YETKİNLİKLER
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Becker');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_26/100] Correctly resolves Klaus Martin with DE / Mixed structure', () => {
    const cv = `
Klaus Martin
Berlin | 0532 999 00 11
Senior Software Engineer

DENEYİM
Siemens AG - Senior Software Engineer (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Klaus Martin');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_27/100] Correctly resolves Pierre Morales with FR / Mixed structure', () => {
    const cv = `
Pierre Morales
İstanbul / Kadıköy | 0533 111 22 33
Directeur Financier

PROFESSIONAL EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pierre Morales');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_28/100] Correctly resolves Alejandro Miller with ES / Mixed structure', () => {
    const cv = `
Alejandro Miller
Ankara / Çankaya | cand@example.com
Director de Operaciones

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Inditex S.A. - Director de Operaciones (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alejandro Miller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_29/100] Correctly resolves David Çelik with EN / Mixed structure', () => {
    const cv = `
David Çelik
Dublin | contact@example.com
Head of Product Management

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Strategic leadership, execution and team management.

EDUCATION
University of Science - Degree (2012 - 2016)

CORE SKILLS
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('David Çelik');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_30/100] Correctly resolves Mustafa Wagner with TR / Mixed structure', () => {
    const cv = `
Mustafa Wagner
İstanbul | 0532 999 00 11
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mustafa Wagner');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_31/100] Correctly resolves Stefan Bernard with DE / Mixed structure', () => {
    const cv = `
Stefan Bernard
İstanbul / Kadıköy | 0533 111 22 33
Senior Software Engineer

PROFESSIONAL EXPERIENCE
Siemens AG - Senior Software Engineer (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Stefan Bernard');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_32/100] Correctly resolves Michel Lopez with FR / Mixed structure', () => {
    const cv = `
Michel Lopez
Ankara / Çankaya | cand@example.com
Directeur Financier

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Michel Lopez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_33/100] Correctly resolves Javier Johnson with ES / Mixed structure', () => {
    const cv = `
Javier Johnson
Madrid | contact@example.com
Director de Operaciones

EXPERIENCIA LABORAL
Inditex S.A. - Director de Operaciones (2018 - 2024)
Strategic leadership, execution and team management.

EDUCACIÓN
University of Science - Degree (2012 - 2016)

HABILIDADES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Javier Johnson');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_34/100] Correctly resolves Robert Demir with EN / Mixed structure', () => {
    const cv = `
Robert Demir
Dublin | 0532 999 00 11
Head of Product Management

DENEYİM
Google Ireland Ltd. - Head of Product Management (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Robert Demir');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_35/100] Correctly resolves Mehmet Weber with TR / Mixed structure', () => {
    const cv = `
Mehmet Weber
İstanbul / Kadıköy | 0533 111 22 33
Çağrı Merkezi Operasyon Müdürü

PROFESSIONAL EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mehmet Weber');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_36/100] Correctly resolves Wolfgang Thomas with DE / Mixed structure', () => {
    const cv = `
Wolfgang Thomas
Ankara / Çankaya | cand@example.com
Senior Software Engineer

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Siemens AG - Senior Software Engineer (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Wolfgang Thomas');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_37/100] Correctly resolves Antoine Hernandez with FR / Mixed structure', () => {
    const cv = `
Antoine Hernandez
Paris | contact@example.com
Directeur Financier

EXPÉRIENCE PROFESSIONNELLE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Strategic leadership, execution and team management.

FORMATION
University of Science - Degree (2012 - 2016)

COMPÉTENCES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Antoine Hernandez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_38/100] Correctly resolves Mateo Brown with ES / Mixed structure', () => {
    const cv = `
Mateo Brown
Madrid | 0532 999 00 11
Director de Operaciones

DENEYİM
Inditex S.A. - Director de Operaciones (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mateo Brown');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_39/100] Correctly resolves William Kaya with EN / Mixed structure', () => {
    const cv = `
William Kaya
İstanbul / Kadıköy | 0533 111 22 33
Head of Product Management

PROFESSIONAL EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('William Kaya');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_40/100] Correctly resolves Ali Müller with TR / Mixed structure', () => {
    const cv = `
Ali Müller
Ankara / Çankaya | cand@example.com
Çağrı Merkezi Operasyon Müdürü

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ali Müller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_41/100] Correctly resolves Hans Rodriguez with DE / Mixed structure', () => {
    const cv = `
Hans Rodriguez
Berlin | contact@example.com
Senior Software Engineer

BERUFSERFAHRUNG
Siemens AG - Senior Software Engineer (2018 - 2024)
Strategic leadership, execution and team management.

AUSBILDUNG
University of Science - Degree (2012 - 2016)

KOMPETENZEN
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Rodriguez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_42/100] Correctly resolves Jean Smith with FR / Mixed structure', () => {
    const cv = `
Jean Smith
Paris | 0532 999 00 11
Directeur Financier

DENEYİM
BNP Paribas S.A. - Directeur Financier (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Jean Smith');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_43/100] Correctly resolves Carlos Yılmaz with ES / Mixed structure', () => {
    const cv = `
Carlos Yılmaz
İstanbul / Kadıköy | 0533 111 22 33
Director de Operaciones

PROFESSIONAL EXPERIENCE
Inditex S.A. - Director de Operaciones (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Carlos Yılmaz');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_44/100] Correctly resolves John Becker with EN / Mixed structure', () => {
    const cv = `
John Becker
Ankara / Çankaya | cand@example.com
Head of Product Management

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('John Becker');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_45/100] Correctly resolves Ahmet Martin with TR / Mixed structure', () => {
    const cv = `
Ahmet Martin
İstanbul | contact@example.com
Çağrı Merkezi Operasyon Müdürü

İŞ DENEYİMİ
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Strategic leadership, execution and team management.

EĞİTİM
University of Science - Degree (2012 - 2016)

YETKİNLİKLER
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Martin');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_46/100] Correctly resolves Klaus Morales with DE / Mixed structure', () => {
    const cv = `
Klaus Morales
Berlin | 0532 999 00 11
Senior Software Engineer

DENEYİM
Siemens AG - Senior Software Engineer (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Klaus Morales');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_47/100] Correctly resolves Pierre Miller with FR / Mixed structure', () => {
    const cv = `
Pierre Miller
İstanbul / Kadıköy | 0533 111 22 33
Directeur Financier

PROFESSIONAL EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pierre Miller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_48/100] Correctly resolves Alejandro Çelik with ES / Mixed structure', () => {
    const cv = `
Alejandro Çelik
Ankara / Çankaya | cand@example.com
Director de Operaciones

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Inditex S.A. - Director de Operaciones (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alejandro Çelik');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_49/100] Correctly resolves David Wagner with EN / Mixed structure', () => {
    const cv = `
David Wagner
Dublin | contact@example.com
Head of Product Management

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Strategic leadership, execution and team management.

EDUCATION
University of Science - Degree (2012 - 2016)

CORE SKILLS
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('David Wagner');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_50/100] Correctly resolves Mustafa Bernard with TR / Mixed structure', () => {
    const cv = `
Mustafa Bernard
İstanbul | 0532 999 00 11
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mustafa Bernard');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_51/100] Correctly resolves Stefan Lopez with DE / Mixed structure', () => {
    const cv = `
Stefan Lopez
İstanbul / Kadıköy | 0533 111 22 33
Senior Software Engineer

PROFESSIONAL EXPERIENCE
Siemens AG - Senior Software Engineer (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Stefan Lopez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_52/100] Correctly resolves Michel Johnson with FR / Mixed structure', () => {
    const cv = `
Michel Johnson
Ankara / Çankaya | cand@example.com
Directeur Financier

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Michel Johnson');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_53/100] Correctly resolves Javier Demir with ES / Mixed structure', () => {
    const cv = `
Javier Demir
Madrid | contact@example.com
Director de Operaciones

EXPERIENCIA LABORAL
Inditex S.A. - Director de Operaciones (2018 - 2024)
Strategic leadership, execution and team management.

EDUCACIÓN
University of Science - Degree (2012 - 2016)

HABILIDADES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Javier Demir');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_54/100] Correctly resolves Robert Weber with EN / Mixed structure', () => {
    const cv = `
Robert Weber
Dublin | 0532 999 00 11
Head of Product Management

DENEYİM
Google Ireland Ltd. - Head of Product Management (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Robert Weber');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_55/100] Correctly resolves Mehmet Thomas with TR / Mixed structure', () => {
    const cv = `
Mehmet Thomas
İstanbul / Kadıköy | 0533 111 22 33
Çağrı Merkezi Operasyon Müdürü

PROFESSIONAL EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mehmet Thomas');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_56/100] Correctly resolves Wolfgang Hernandez with DE / Mixed structure', () => {
    const cv = `
Wolfgang Hernandez
Ankara / Çankaya | cand@example.com
Senior Software Engineer

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Siemens AG - Senior Software Engineer (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Wolfgang Hernandez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_57/100] Correctly resolves Antoine Brown with FR / Mixed structure', () => {
    const cv = `
Antoine Brown
Paris | contact@example.com
Directeur Financier

EXPÉRIENCE PROFESSIONNELLE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Strategic leadership, execution and team management.

FORMATION
University of Science - Degree (2012 - 2016)

COMPÉTENCES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Antoine Brown');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_58/100] Correctly resolves Mateo Kaya with ES / Mixed structure', () => {
    const cv = `
Mateo Kaya
Madrid | 0532 999 00 11
Director de Operaciones

DENEYİM
Inditex S.A. - Director de Operaciones (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mateo Kaya');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_59/100] Correctly resolves William Müller with EN / Mixed structure', () => {
    const cv = `
William Müller
İstanbul / Kadıköy | 0533 111 22 33
Head of Product Management

PROFESSIONAL EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('William Müller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_60/100] Correctly resolves Ali Dupont with TR / Mixed structure', () => {
    const cv = `
Ali Dupont
Ankara / Çankaya | cand@example.com
Çağrı Merkezi Operasyon Müdürü

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ali Dupont');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_61/100] Correctly resolves Hans Smith with DE / Mixed structure', () => {
    const cv = `
Hans Smith
Berlin | contact@example.com
Senior Software Engineer

BERUFSERFAHRUNG
Siemens AG - Senior Software Engineer (2018 - 2024)
Strategic leadership, execution and team management.

AUSBILDUNG
University of Science - Degree (2012 - 2016)

KOMPETENZEN
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Smith');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_62/100] Correctly resolves Jean Yılmaz with FR / Mixed structure', () => {
    const cv = `
Jean Yılmaz
Paris | 0532 999 00 11
Directeur Financier

DENEYİM
BNP Paribas S.A. - Directeur Financier (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Jean Yılmaz');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_63/100] Correctly resolves Carlos Becker with ES / Mixed structure', () => {
    const cv = `
Carlos Becker
İstanbul / Kadıköy | 0533 111 22 33
Director de Operaciones

PROFESSIONAL EXPERIENCE
Inditex S.A. - Director de Operaciones (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Carlos Becker');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_64/100] Correctly resolves John Martin with EN / Mixed structure', () => {
    const cv = `
John Martin
Ankara / Çankaya | cand@example.com
Head of Product Management

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('John Martin');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_65/100] Correctly resolves Ahmet Morales with TR / Mixed structure', () => {
    const cv = `
Ahmet Morales
İstanbul | contact@example.com
Çağrı Merkezi Operasyon Müdürü

İŞ DENEYİMİ
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Strategic leadership, execution and team management.

EĞİTİM
University of Science - Degree (2012 - 2016)

YETKİNLİKLER
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Morales');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_66/100] Correctly resolves Klaus Miller with DE / Mixed structure', () => {
    const cv = `
Klaus Miller
Berlin | 0532 999 00 11
Senior Software Engineer

DENEYİM
Siemens AG - Senior Software Engineer (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Klaus Miller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_67/100] Correctly resolves Pierre Çelik with FR / Mixed structure', () => {
    const cv = `
Pierre Çelik
İstanbul / Kadıköy | 0533 111 22 33
Directeur Financier

PROFESSIONAL EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pierre Çelik');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_68/100] Correctly resolves Alejandro Wagner with ES / Mixed structure', () => {
    const cv = `
Alejandro Wagner
Ankara / Çankaya | cand@example.com
Director de Operaciones

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Inditex S.A. - Director de Operaciones (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alejandro Wagner');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_69/100] Correctly resolves David Bernard with EN / Mixed structure', () => {
    const cv = `
David Bernard
Dublin | contact@example.com
Head of Product Management

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Strategic leadership, execution and team management.

EDUCATION
University of Science - Degree (2012 - 2016)

CORE SKILLS
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('David Bernard');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_70/100] Correctly resolves Mustafa Lopez with TR / Mixed structure', () => {
    const cv = `
Mustafa Lopez
İstanbul | 0532 999 00 11
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mustafa Lopez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_71/100] Correctly resolves Stefan Johnson with DE / Mixed structure', () => {
    const cv = `
Stefan Johnson
İstanbul / Kadıköy | 0533 111 22 33
Senior Software Engineer

PROFESSIONAL EXPERIENCE
Siemens AG - Senior Software Engineer (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Stefan Johnson');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_72/100] Correctly resolves Michel Demir with FR / Mixed structure', () => {
    const cv = `
Michel Demir
Ankara / Çankaya | cand@example.com
Directeur Financier

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Michel Demir');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_73/100] Correctly resolves Javier Weber with ES / Mixed structure', () => {
    const cv = `
Javier Weber
Madrid | contact@example.com
Director de Operaciones

EXPERIENCIA LABORAL
Inditex S.A. - Director de Operaciones (2018 - 2024)
Strategic leadership, execution and team management.

EDUCACIÓN
University of Science - Degree (2012 - 2016)

HABILIDADES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Javier Weber');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_74/100] Correctly resolves Robert Thomas with EN / Mixed structure', () => {
    const cv = `
Robert Thomas
Dublin | 0532 999 00 11
Head of Product Management

DENEYİM
Google Ireland Ltd. - Head of Product Management (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Robert Thomas');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_75/100] Correctly resolves Mehmet Hernandez with TR / Mixed structure', () => {
    const cv = `
Mehmet Hernandez
İstanbul / Kadıköy | 0533 111 22 33
Çağrı Merkezi Operasyon Müdürü

PROFESSIONAL EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mehmet Hernandez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_76/100] Correctly resolves Wolfgang Brown with DE / Mixed structure', () => {
    const cv = `
Wolfgang Brown
Ankara / Çankaya | cand@example.com
Senior Software Engineer

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Siemens AG - Senior Software Engineer (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Wolfgang Brown');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_77/100] Correctly resolves Antoine Kaya with FR / Mixed structure', () => {
    const cv = `
Antoine Kaya
Paris | contact@example.com
Directeur Financier

EXPÉRIENCE PROFESSIONNELLE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Strategic leadership, execution and team management.

FORMATION
University of Science - Degree (2012 - 2016)

COMPÉTENCES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Antoine Kaya');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_78/100] Correctly resolves Mateo Müller with ES / Mixed structure', () => {
    const cv = `
Mateo Müller
Madrid | 0532 999 00 11
Director de Operaciones

DENEYİM
Inditex S.A. - Director de Operaciones (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mateo Müller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_79/100] Correctly resolves William Dupont with EN / Mixed structure', () => {
    const cv = `
William Dupont
İstanbul / Kadıköy | 0533 111 22 33
Head of Product Management

PROFESSIONAL EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('William Dupont');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_80/100] Correctly resolves Ali Rodriguez with TR / Mixed structure', () => {
    const cv = `
Ali Rodriguez
Ankara / Çankaya | cand@example.com
Çağrı Merkezi Operasyon Müdürü

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ali Rodriguez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_81/100] Correctly resolves Hans Yılmaz with DE / Mixed structure', () => {
    const cv = `
Hans Yılmaz
Berlin | contact@example.com
Senior Software Engineer

BERUFSERFAHRUNG
Siemens AG - Senior Software Engineer (2018 - 2024)
Strategic leadership, execution and team management.

AUSBILDUNG
University of Science - Degree (2012 - 2016)

KOMPETENZEN
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Hans Yılmaz');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_82/100] Correctly resolves Jean Becker with FR / Mixed structure', () => {
    const cv = `
Jean Becker
Paris | 0532 999 00 11
Directeur Financier

DENEYİM
BNP Paribas S.A. - Directeur Financier (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Jean Becker');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_83/100] Correctly resolves Carlos Martin with ES / Mixed structure', () => {
    const cv = `
Carlos Martin
İstanbul / Kadıköy | 0533 111 22 33
Director de Operaciones

PROFESSIONAL EXPERIENCE
Inditex S.A. - Director de Operaciones (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Carlos Martin');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_84/100] Correctly resolves John Morales with EN / Mixed structure', () => {
    const cv = `
John Morales
Ankara / Çankaya | cand@example.com
Head of Product Management

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('John Morales');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_85/100] Correctly resolves Ahmet Miller with TR / Mixed structure', () => {
    const cv = `
Ahmet Miller
İstanbul | contact@example.com
Çağrı Merkezi Operasyon Müdürü

İŞ DENEYİMİ
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Strategic leadership, execution and team management.

EĞİTİM
University of Science - Degree (2012 - 2016)

YETKİNLİKLER
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Miller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_86/100] Correctly resolves Klaus Çelik with DE / Mixed structure', () => {
    const cv = `
Klaus Çelik
Berlin | 0532 999 00 11
Senior Software Engineer

DENEYİM
Siemens AG - Senior Software Engineer (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Klaus Çelik');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_87/100] Correctly resolves Pierre Wagner with FR / Mixed structure', () => {
    const cv = `
Pierre Wagner
İstanbul / Kadıköy | 0533 111 22 33
Directeur Financier

PROFESSIONAL EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Pierre Wagner');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_88/100] Correctly resolves Alejandro Bernard with ES / Mixed structure', () => {
    const cv = `
Alejandro Bernard
Ankara / Çankaya | cand@example.com
Director de Operaciones

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Inditex S.A. - Director de Operaciones (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Alejandro Bernard');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_89/100] Correctly resolves David Lopez with EN / Mixed structure', () => {
    const cv = `
David Lopez
Dublin | contact@example.com
Head of Product Management

WORK EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Strategic leadership, execution and team management.

EDUCATION
University of Science - Degree (2012 - 2016)

CORE SKILLS
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('David Lopez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_90/100] Correctly resolves Mustafa Johnson with TR / Mixed structure', () => {
    const cv = `
Mustafa Johnson
İstanbul | 0532 999 00 11
Çağrı Merkezi Operasyon Müdürü

DENEYİM
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mustafa Johnson');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_91/100] Correctly resolves Stefan Demir with DE / Mixed structure', () => {
    const cv = `
Stefan Demir
İstanbul / Kadıköy | 0533 111 22 33
Senior Software Engineer

PROFESSIONAL EXPERIENCE
Siemens AG - Senior Software Engineer (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Stefan Demir');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_92/100] Correctly resolves Michel Weber with FR / Mixed structure', () => {
    const cv = `
Michel Weber
Ankara / Çankaya | cand@example.com
Directeur Financier

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
BNP Paribas S.A. - Directeur Financier (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Michel Weber');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_93/100] Correctly resolves Javier Thomas with ES / Mixed structure', () => {
    const cv = `
Javier Thomas
Madrid | contact@example.com
Director de Operaciones

EXPERIENCIA LABORAL
Inditex S.A. - Director de Operaciones (2018 - 2024)
Strategic leadership, execution and team management.

EDUCACIÓN
University of Science - Degree (2012 - 2016)

HABILIDADES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Javier Thomas');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_94/100] Correctly resolves Robert Hernandez with EN / Mixed structure', () => {
    const cv = `
Robert Hernandez
Dublin | 0532 999 00 11
Head of Product Management

DENEYİM
Google Ireland Ltd. - Head of Product Management (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Robert Hernandez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_95/100] Correctly resolves Mehmet Brown with TR / Mixed structure', () => {
    const cv = `
Mehmet Brown
İstanbul / Kadıköy | 0533 111 22 33
Çağrı Merkezi Operasyon Müdürü

PROFESSIONAL EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mehmet Brown');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_96/100] Correctly resolves Wolfgang Kaya with DE / Mixed structure', () => {
    const cv = `
Wolfgang Kaya
Ankara / Çankaya | cand@example.com
Senior Software Engineer

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Siemens AG - Senior Software Engineer (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Wolfgang Kaya');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_97/100] Correctly resolves Antoine Müller with FR / Mixed structure', () => {
    const cv = `
Antoine Müller
Paris | contact@example.com
Directeur Financier

EXPÉRIENCE PROFESSIONNELLE
BNP Paribas S.A. - Directeur Financier (2018 - 2024)
Strategic leadership, execution and team management.

FORMATION
University of Science - Degree (2012 - 2016)

COMPÉTENCES
Leadership, Agile, Strategy, Communication
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Antoine Müller');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_98/100] Correctly resolves Mateo Dupont with ES / Mixed structure', () => {
    const cv = `
Mateo Dupont
Madrid | 0532 999 00 11
Director de Operaciones

DENEYİM
Inditex S.A. - Director de Operaciones (2019 - 2024)
Responsible for international project roadmap and operations.

EĞİTİM
Technical University - Master of Science (2014 - 2016)

BECERİLER
Management, Cloud Infrastructure, Docker, Kubernetes
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Mateo Dupont');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_99/100] Correctly resolves William Rodriguez with EN / Mixed structure', () => {
    const cv = `
William Rodriguez
İstanbul / Kadıköy | 0533 111 22 33
Head of Product Management

PROFESSIONAL EXPERIENCE
Google Ireland Ltd. - Head of Product Management (2018 - 2024)
Bölgesel operasyonların yürütülmesi ve stratejik hedeflerin gerçekleştirilmesi.

ACADEMIC BACKGROUND
İstanbul Teknik Üniversitesi - Mühendislik Lisans (2010 - 2014)

SKILLS & EXPERTISE
Liderlik, Bütçe Yönetimi, Stratejik Planlama
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('William Rodriguez');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });

  it('[MULTILINGUAL_100/100] Correctly resolves Ali Smith with TR / Mixed structure', () => {
    const cv = `
Ali Smith
Ankara / Çankaya | cand@example.com
Çağrı Merkezi Operasyon Müdürü

AUSBILDUNG
Technical University of Munich - Informatik B.Sc. (2011 - 2015)

WORK EXPERIENCE
Turkcell Global Bilgi A.Ş. - Çağrı Merkezi Operasyon Müdürü (2017 - 2024)
System engineering and cloud deployment architecture.

KOMPETENZEN & SKILLS
Python, Go, CI/CD, Problem Solving
`;
    const res = extractDeterministicCv(cv);
    const graph = buildCvEvidenceGraph({ rawText: cv, rawExtraction: res });
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ali Smith');
    expect(canonical.fullName).not.toBe('Education');
    expect(canonical.fullName).not.toBe('Berufserfahrung');
    expect(canonical.fullName).not.toBe('Experience');
    expect(canonical.primarySector).not.toBe('Kamu / Belediye');
    expect(canonical.primaryRole).not.toBe('Uzman');
    expect(res.experiences.length).toBeGreaterThanOrEqual(1);
  });
});
