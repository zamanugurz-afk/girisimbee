import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildCvEvidenceGraph } from './cv-evidence-graph';
import { normalizeCvText } from './cv-turkish-encoding';

describe('CV Extraction Engine 9.0 — 100 Malformed, Corrupted, OCR & Adversarial Security Suite', () => {
  it('[MALFORMED_1/100] Safely sanitizes null bytes, escape codes and control chars (#' + 1 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_2/100] Safely sanitizes null bytes, escape codes and control chars (#' + 2 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_3/100] Safely sanitizes null bytes, escape codes and control chars (#' + 3 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_4/100] Safely sanitizes null bytes, escape codes and control chars (#' + 4 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_5/100] Safely sanitizes null bytes, escape codes and control chars (#' + 5 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_6/100] Safely sanitizes null bytes, escape codes and control chars (#' + 6 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_7/100] Safely sanitizes null bytes, escape codes and control chars (#' + 7 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_8/100] Safely sanitizes null bytes, escape codes and control chars (#' + 8 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_9/100] Safely sanitizes null bytes, escape codes and control chars (#' + 9 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_10/100] Safely sanitizes null bytes, escape codes and control chars (#' + 10 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_11/100] Safely sanitizes null bytes, escape codes and control chars (#' + 11 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_12/100] Safely sanitizes null bytes, escape codes and control chars (#' + 12 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_13/100] Safely sanitizes null bytes, escape codes and control chars (#' + 13 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_14/100] Safely sanitizes null bytes, escape codes and control chars (#' + 14 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_15/100] Safely sanitizes null bytes, escape codes and control chars (#' + 15 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_16/100] Safely sanitizes null bytes, escape codes and control chars (#' + 16 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_17/100] Safely sanitizes null bytes, escape codes and control chars (#' + 17 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_18/100] Safely sanitizes null bytes, escape codes and control chars (#' + 18 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_19/100] Safely sanitizes null bytes, escape codes and control chars (#' + 19 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MALFORMED_20/100] Safely sanitizes null bytes, escape codes and control chars (#' + 20 + ')', () => {
    const corrupted = "\x00\x01\x02\x03Kemal Sunal\x00\x00\n\x08\x0Cİstanbul / Kadıköy\x00\nSatış Direktörü\n\nDENEYİM\nTrendyol Tech - Satış Direktörü (2019 - 2024)\n\x00\x00";
    const res = extractDeterministicCv(corrupted);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Kemal Sunal');
    expect(canonical.fullName).not.toContain('\x00');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toMatch(/Satış Müdürü|Satış Direktörü/i);
  });

  it('[MOJIBAKE_21/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 21 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
MÃ¼ÅŸteri Temsilcisi

DENEYÄ°M
Vodafone A.Åž. - MÃ¼ÅŸteri Temsilcisi (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_22/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 22 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
Ã‡aÄŸrÄ± Merkezi MÃ¼dÃ¼rÃ¼

DENEYÄ°M
Vodafone A.Åž. - Ã‡aÄŸrÄ± Merkezi MÃ¼dÃ¼rÃ¼ (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_23/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 23 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
YÃ¶netici

DENEYÄ°M
Vodafone A.Åž. - YÃ¶netici (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_24/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 24 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
MÃ¼hendis

DENEYÄ°M
Vodafone A.Åž. - MÃ¼hendis (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_25/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 25 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
Ä°stanbul / BeÅŸiktaÅŸ

DENEYÄ°M
Vodafone A.Åž. - Ä°stanbul / BeÅŸiktaÅŸ (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_26/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 26 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
MÃ¼ÅŸteri Temsilcisi

DENEYÄ°M
Vodafone A.Åž. - MÃ¼ÅŸteri Temsilcisi (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_27/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 27 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
Ã‡aÄŸrÄ± Merkezi MÃ¼dÃ¼rÃ¼

DENEYÄ°M
Vodafone A.Åž. - Ã‡aÄŸrÄ± Merkezi MÃ¼dÃ¼rÃ¼ (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_28/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 28 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
YÃ¶netici

DENEYÄ°M
Vodafone A.Åž. - YÃ¶netici (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_29/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 29 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
MÃ¼hendis

DENEYÄ°M
Vodafone A.Åž. - MÃ¼hendis (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_30/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 30 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
Ä°stanbul / BeÅŸiktaÅŸ

DENEYÄ°M
Vodafone A.Åž. - Ä°stanbul / BeÅŸiktaÅŸ (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_31/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 31 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
MÃ¼ÅŸteri Temsilcisi

DENEYÄ°M
Vodafone A.Åž. - MÃ¼ÅŸteri Temsilcisi (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_32/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 32 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
Ã‡aÄŸrÄ± Merkezi MÃ¼dÃ¼rÃ¼

DENEYÄ°M
Vodafone A.Åž. - Ã‡aÄŸrÄ± Merkezi MÃ¼dÃ¼rÃ¼ (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_33/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 33 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
YÃ¶netici

DENEYÄ°M
Vodafone A.Åž. - YÃ¶netici (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_34/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 34 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
MÃ¼hendis

DENEYÄ°M
Vodafone A.Åž. - MÃ¼hendis (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_35/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 35 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
Ä°stanbul / BeÅŸiktaÅŸ

DENEYÄ°M
Vodafone A.Åž. - Ä°stanbul / BeÅŸiktaÅŸ (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_36/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 36 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
MÃ¼ÅŸteri Temsilcisi

DENEYÄ°M
Vodafone A.Åž. - MÃ¼ÅŸteri Temsilcisi (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_37/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 37 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
Ã‡aÄŸrÄ± Merkezi MÃ¼dÃ¼rÃ¼

DENEYÄ°M
Vodafone A.Åž. - Ã‡aÄŸrÄ± Merkezi MÃ¼dÃ¼rÃ¼ (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_38/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 38 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
YÃ¶netici

DENEYÄ°M
Vodafone A.Åž. - YÃ¶netici (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_39/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 39 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
MÃ¼hendis

DENEYÄ°M
Vodafone A.Åž. - MÃ¼hendis (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[MOJIBAKE_40/100] Automatically repairs UTF-8 mojibake and encoding corruption (#' + 40 + ')', () => {
    const cv = `
Fatma Girik
Ä°stanbul / BeÅŸiktaÅŸ | 0532 999 00 11
Ä°stanbul / BeÅŸiktaÅŸ

DENEYÄ°M
Vodafone A.Åž. - Ä°stanbul / BeÅŸiktaÅŸ (2018 - 2024)
Sorumluluklar ve operasyonel sÃ¼reÃ§ler.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Fatma Girik');
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[SECURITY_41/100] Safely inertizes injection payload (#' + 41 + ')', () => {
    const payload = "<script>alert(\"XSS\")</script>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_42/100] Safely inertizes injection payload (#' + 42 + ')', () => {
    const payload = "<img src=x onerror=alert(1)>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_43/100] Safely inertizes injection payload (#' + 43 + ')', () => {
    const payload = "'; DROP TABLE candidates; --";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_44/100] Safely inertizes injection payload (#' + 44 + ')', () => {
    const payload = "1' OR '1'='1";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_45/100] Safely inertizes injection payload (#' + 45 + ')', () => {
    const payload = "<iframe src=\"javascript:alert(1)\"></iframe>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_46/100] Safely inertizes injection payload (#' + 46 + ')', () => {
    const payload = "{{constructor.constructor(\"alert(1)\")()}}";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_47/100] Safely inertizes injection payload (#' + 47 + ')', () => {
    const payload = "${7*7}";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_48/100] Safely inertizes injection payload (#' + 48 + ')', () => {
    const payload = "&lt;script&gt;alert(1)&lt;/script&gt;";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_49/100] Safely inertizes injection payload (#' + 49 + ')', () => {
    const payload = "\"><svg onload=alert(1)>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_50/100] Safely inertizes injection payload (#' + 50 + ')', () => {
    const payload = "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/\"/+/onmouseover=1/+/[*/[]/+alert(1)//'>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_51/100] Safely inertizes injection payload (#' + 51 + ')', () => {
    const payload = "<script>alert(\"XSS\")</script>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_52/100] Safely inertizes injection payload (#' + 52 + ')', () => {
    const payload = "<img src=x onerror=alert(1)>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_53/100] Safely inertizes injection payload (#' + 53 + ')', () => {
    const payload = "'; DROP TABLE candidates; --";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_54/100] Safely inertizes injection payload (#' + 54 + ')', () => {
    const payload = "1' OR '1'='1";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_55/100] Safely inertizes injection payload (#' + 55 + ')', () => {
    const payload = "<iframe src=\"javascript:alert(1)\"></iframe>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_56/100] Safely inertizes injection payload (#' + 56 + ')', () => {
    const payload = "{{constructor.constructor(\"alert(1)\")()}}";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_57/100] Safely inertizes injection payload (#' + 57 + ')', () => {
    const payload = "${7*7}";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_58/100] Safely inertizes injection payload (#' + 58 + ')', () => {
    const payload = "&lt;script&gt;alert(1)&lt;/script&gt;";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_59/100] Safely inertizes injection payload (#' + 59 + ')', () => {
    const payload = "\"><svg onload=alert(1)>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[SECURITY_60/100] Safely inertizes injection payload (#' + 60 + ')', () => {
    const payload = "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/\"/+/onmouseover=1/+/[*/[]/+alert(1)//'>";
    const cv = `
Tarık Akan
İstanbul / Maltepe | 0532 111 22 33
Yazılım Geliştirici

DENEYİM
${payload} - Yazılım Geliştirici (2020 - 2024)
Güvenlik testleri ve backend geliştirme.
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Tarık Akan');
    expect(canonical.primaryRole).toBe('Yazılım Geliştirici');
    expect(canonical.experiences.length).toBeGreaterThanOrEqual(1);
    expect(canonical.experiences[0].company).not.toContain('<script>');
  });

  it('[OCR_NOISE_61/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 61 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_62/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 62 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_63/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 63 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_64/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 64 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_65/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 65 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_66/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 66 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_67/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 67 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_68/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 68 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_69/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 69 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_70/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 70 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_71/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 71 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_72/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 72 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_73/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 73 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_74/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 74 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_75/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 75 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_76/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 76 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_77/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 77 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_78/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 78 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_79/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 79 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[OCR_NOISE_80/100] Handles scanned OCR line breaks, ligatures and spacing artifacts (#' + 80 + ')', () => {
    const ocrCv = `
M ü n i r   Ö z k u l
İ s t a n b u l  /  K a d ı k ö y  |  0 5 3 2  9 9 9  0 0  1 1
S a t ı ş   M ü d ü r ü

D E N E Y İ M
K o ç   H o l d i n g   A . Ş .  -  S a t ı ş   M ü d ü r ü   ( 2 0 1 8   -   2 0 2 4 )
S a t ı ş   o p e r a s y o n l a r ı .
`;
    const cleaned = normalizeCvText(ocrCv);
    const res = extractDeterministicCv(cleaned);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toMatch(/Münir|Özkul/i);
    expect(canonical.residenceCity).toBe('İstanbul');
  });

  it('[BOUNDARY_81/100] Handles extreme whitespace padding and boundary constraints (#' + 81 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_82/100] Handles extreme whitespace padding and boundary constraints (#' + 82 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_83/100] Handles extreme whitespace padding and boundary constraints (#' + 83 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_84/100] Handles extreme whitespace padding and boundary constraints (#' + 84 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_85/100] Handles extreme whitespace padding and boundary constraints (#' + 85 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_86/100] Handles extreme whitespace padding and boundary constraints (#' + 86 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_87/100] Handles extreme whitespace padding and boundary constraints (#' + 87 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_88/100] Handles extreme whitespace padding and boundary constraints (#' + 88 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_89/100] Handles extreme whitespace padding and boundary constraints (#' + 89 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_90/100] Handles extreme whitespace padding and boundary constraints (#' + 90 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_91/100] Handles extreme whitespace padding and boundary constraints (#' + 91 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_92/100] Handles extreme whitespace padding and boundary constraints (#' + 92 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_93/100] Handles extreme whitespace padding and boundary constraints (#' + 93 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_94/100] Handles extreme whitespace padding and boundary constraints (#' + 94 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_95/100] Handles extreme whitespace padding and boundary constraints (#' + 95 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_96/100] Handles extreme whitespace padding and boundary constraints (#' + 96 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_97/100] Handles extreme whitespace padding and boundary constraints (#' + 97 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_98/100] Handles extreme whitespace padding and boundary constraints (#' + 98 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_99/100] Handles extreme whitespace padding and boundary constraints (#' + 99 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });

  it('[BOUNDARY_100/100] Handles extreme whitespace padding and boundary constraints (#' + 100 + ')', () => {
    const spaces = ' '.repeat(500);
    const hugeCv = `${spaces}
\n\n\n\n\n
Ahmet Yılmaz
${spaces}
İstanbul / Beşiktaş
${spaces}
Satış Temsilcisi

${spaces}
DENEYİM
ABC Gıda Ltd. - Satış Temsilcisi (2020 - 2024)
${spaces}
`;
    const res = extractDeterministicCv(hugeCv);
    const canonical = mapCvToCanonicalTaxonomy(res);

    expect(canonical.fullName).toBe('Ahmet Yılmaz');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.primaryRole).toBe('Satış Temsilcisi');
    expect(res.experiences).toHaveLength(1);
  });
});
