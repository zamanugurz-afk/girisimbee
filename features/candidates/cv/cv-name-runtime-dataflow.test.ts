import { describe, expect, it } from 'vitest';
import { extractCandidateName, isForbiddenNameCandidate, formatTurkishTitleCase } from './cv-name-extractor';
import { normalizeCvText } from './cv-turkish-encoding';
import { extractUniversalDemographics } from './cv-universal-normalizer';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { mergeCustomFieldDefaults } from '@/features/listings/form/build-dynamic-schema';
import { JOB_SEEKER_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import { UGUR_ZAMAN_CV_TEXT } from './cv-real-world-ugur-zaman.test';

describe('CV Name Runtime Data-Flow End-to-End Trace', () => {
  it('traces Uğur Zaman CV across all 10 pipeline steps and verifies exact "Uğur Zaman" output', () => {
    // 1. RAW CV TEXT
    const rawCvText = UGUR_ZAMAN_CV_TEXT;
    expect(rawCvText).toContain('UĞUR ZAMAN');

    // 2. NORMALIZED TEXT
    const normalizedText = normalizeCvText(rawCvText, true);
    expect(normalizedText).toContain('UĞUR ZAMAN');

    // 3. deterministic.fullName
    const deterministic = extractDeterministicCv(normalizedText);
    expect(deterministic.fullName).toBe('Uğur Zaman');
    expect(deterministic.fullName).not.toBe('Eğitim');

    // 4. AI fullName (reconciled / mapped)
    const canonical = mapCvToCanonicalTaxonomy(deterministic);
    expect(canonical.fullName).toBe('Uğur Zaman');
    expect(canonical.fullName).not.toBe('Eğitim');

    // 5. cv-profile-builder fullName
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'ugur_zaman_cv.pdf');
    expect(draft.formValues.fullName).toBe('Uğur Zaman');
    expect(draft.formValues.fullName).not.toBe('Eğitim');

    // 6. draft.formValues.fullName
    const draftFullName = draft.formValues.fullName;
    expect(draftFullName).toBe('Uğur Zaman');

    // 7. handleApplyCvDraft() logic -> customFields.fullName
    const customFields: Record<string, unknown> = {};
    if (draft.formValues.fullName && !isForbiddenNameCandidate(draft.formValues.fullName)) {
      customFields.fullName = draft.formValues.fullName;
    } else {
      customFields.fullName = '';
    }
    expect(customFields.fullName).toBe('Uğur Zaman');

    // 8. mergedCustomFields.fullName
    const merged = mergeCustomFieldDefaults(JOB_SEEKER_FIELD_SCHEMA, customFields);
    expect(merged.fullName).toBe('Uğur Zaman');

    // 9. DynamicField'e verilen value
    const dynamicFieldValue =
      typeof merged.fullName === 'string'
        ? (isForbiddenNameCandidate(merged.fullName) ? '' : merged.fullName)
        : '';
    expect(dynamicFieldValue).toBe('Uğur Zaman');

    // 10. Ekranda render edilen final value (FieldControl input value)
    const finalInputValue =
      isForbiddenNameCandidate(dynamicFieldValue) ? '' : dynamicFieldValue;
    expect(finalInputValue).toBe('Uğur Zaman');

    console.log('\n--- UĞUR ZAMAN CV RUNTIME DATA-FLOW TRACE ---');
    console.log('1. RAW fullName token in text:', 'UĞUR ZAMAN');
    console.log('2. NORMALIZED fullName token:', 'UĞUR ZAMAN');
    console.log('3. deterministic.fullName:', deterministic.fullName);
    console.log('4. canonical.fullName:', canonical.fullName);
    console.log('5. cv-profile-builder fullName:', draft.formValues.fullName);
    console.log('6. draft.formValues.fullName:', draftFullName);
    console.log('7. handleApplyCvDraft customFields.fullName:', customFields.fullName);
    console.log('8. mergedCustomFields.fullName:', merged.fullName);
    console.log('9. DynamicField value prop:', dynamicFieldValue);
    console.log('10. Final Input render value:', finalInputValue);
  });

  it('traces Headless / Name-less CV across all 10 steps and verifies strictly empty "" output without fallback bleed', () => {
    // 1. RAW CV TEXT (CV starts with Eğitim, contains no person name)
    const headlessCv = `EĞİTİM
İstanbul Teknik Üniversitesi
Bilgisayar Mühendisliği 2020

İŞ DENEYİMİ
Trendyol A.Ş. 2021 - 2024
Yazılım Geliştirici

YETENEKLER
TypeScript, React, Node.js`;

    // 2. NORMALIZED TEXT
    const normalizedText = normalizeCvText(headlessCv, true);

    // 3. deterministic.fullName
    const deterministic = extractDeterministicCv(normalizedText);
    expect(deterministic.fullName).toBeUndefined();

    // 4. canonical.fullName
    const canonical = mapCvToCanonicalTaxonomy(deterministic);
    expect(canonical.fullName).toBeUndefined();

    // 5. cv-profile-builder fullName
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'headless.pdf');
    expect(draft.formValues.fullName).toBe('');

    // 6. draft.formValues.fullName
    const draftFullName = draft.formValues.fullName;
    expect(draftFullName).toBe('');

    // 7. handleApplyCvDraft() logic -> customFields.fullName
    const customFields: Record<string, unknown> = {};
    if (draft.formValues.fullName && !isForbiddenNameCandidate(draft.formValues.fullName)) {
      customFields.fullName = draft.formValues.fullName;
    } else {
      customFields.fullName = '';
    }
    expect(customFields.fullName).toBe('');

    // 8. mergedCustomFields.fullName
    const merged = mergeCustomFieldDefaults(JOB_SEEKER_FIELD_SCHEMA, customFields);
    expect(merged.fullName).toBe('');

    // 9. DynamicField'e verilen value
    const dynamicFieldValue =
      typeof merged.fullName === 'string'
        ? (isForbiddenNameCandidate(merged.fullName) ? '' : merged.fullName)
        : '';
    expect(dynamicFieldValue).toBe('');

    // 10. Ekranda render edilen final value
    const finalInputValue =
      isForbiddenNameCandidate(dynamicFieldValue) ? '' : dynamicFieldValue;
    expect(finalInputValue).toBe('');

    console.log('\n--- HEADLESS CV RUNTIME DATA-FLOW TRACE ---');
    console.log('1. RAW text start:', 'EĞİTİM');
    console.log('2. NORMALIZED text start:', 'EĞİTİM');
    console.log('3. deterministic.fullName:', deterministic.fullName ?? 'undefined');
    console.log('4. canonical.fullName:', canonical.fullName ?? 'undefined');
    console.log('5. cv-profile-builder fullName:', JSON.stringify(draft.formValues.fullName));
    console.log('6. draft.formValues.fullName:', JSON.stringify(draftFullName));
    console.log('7. handleApplyCvDraft customFields.fullName:', JSON.stringify(customFields.fullName));
    console.log('8. mergedCustomFields.fullName:', JSON.stringify(merged.fullName));
    console.log('9. DynamicField value prop:', JSON.stringify(dynamicFieldValue));
    console.log('10. Final Input render value:', JSON.stringify(finalInputValue));
  });
});
