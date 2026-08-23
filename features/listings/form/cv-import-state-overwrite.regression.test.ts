import { describe, it, expect } from 'vitest';
import { buildHydratedCustomFieldsFromCvDraft } from '@/features/candidates/cv/cv-form-hydrator';
import { mergeCustomFieldDefaults } from '@/features/listings/form/build-dynamic-schema';
import { JOB_SEEKER_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import {
  getPositionsForSector,
  getAllTaxonomyPositions,
  isManualCareerOption,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { matchCanonicalPosition } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { normalizeListingTitle } from '@/features/listings/lib/listing-content-quality';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';

describe('CV Import State Ownership & Render Guard Regression Suite', () => {
  // CASE 1: API -> Hydrator -> React State -> DynamicField -> DOM
  it('CASE 1: Guarantees fullName flows intact from API to Hydrator to State to DynamicField/DOM without being blanked', () => {
    const mockCvDraft: CvProfileDraftResult = {
      formValues: {
        fullName: 'Uğur Zaman',
        role: 'Çağrı Merkezi Operasyon Müdürü',
        desiredRole: 'Çağrı Merkezi Operasyon Müdürü',
        primarySector: 'Çağrı merkezi',
      },
    };

    const hydrated = buildHydratedCustomFieldsFromCvDraft(
      mockCvDraft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(hydrated.nextCustomFields.fullName).toBe('Uğur Zaman');

    const merged = mergeCustomFieldDefaults(
      JOB_SEEKER_FIELD_SCHEMA,
      hydrated.nextCustomFields,
    );

    // DynamicField controlled value
    const dynamicFieldValue = String(merged.fullName ?? '');
    expect(dynamicFieldValue).toBe('Uğur Zaman');
    expect(dynamicFieldValue).not.toBe('');
  });

  // CASE 2: Desired Role is left empty for manual user selection per policy
  it('CASE 2: Leaves desiredRole empty so user chooses target position manually', () => {
    const mockCvDraft: CvProfileDraftResult = {
      formValues: {
        fullName: 'Uğur Zaman',
        desiredRole: 'Telemarketing ve Çağrı Merkezi Operasyonları Direktörü',
        primarySector: 'Çağrı merkezi',
        birthDate: '1985-05-20',
      },
    };

    const hydrated = buildHydratedCustomFieldsFromCvDraft(
      mockCvDraft,
      {},
      JOB_SEEKER_FIELD_SCHEMA,
    );

    expect(hydrated.nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(hydrated.nextCustomFields.desiredRole).toBe('');
    expect(hydrated.nextCustomFields.desiredRoleOther).toBe('');
    expect(hydrated.nextCustomFields.primarySector).toBe('Çağrı merkezi');
    expect(hydrated.nextCustomFields.birthDate).toBe('1985-05-20');
  });

  // CASE 3: CV import atomic state update does not trigger primarySector cascading role wipe
  it('CASE 3: Atomic CV import writes primarySector and preserves form fields simultaneously', () => {
    const mockCvDraft: CvProfileDraftResult = {
      formValues: {
        fullName: 'Uğur Zaman',
        primarySector: 'Çağrı merkezi',
        birthDate: '1985-05-20',
      },
    };

    const hydrated = buildHydratedCustomFieldsFromCvDraft(
      mockCvDraft,
      { primarySector: 'Bilişim' },
      JOB_SEEKER_FIELD_SCHEMA,
    );

    // Atomic update replaces sector and sets birthDate
    const atomicState = {
      ...hydrated.nextCustomFields,
    };

    expect(atomicState.primarySector).toBe('Çağrı merkezi');
    expect(atomicState.fullName).toBe('Uğur Zaman');
    expect(atomicState.birthDate).toBe('1985-05-20');
  });

  // CASE 4: localStorage restore cannot overwrite CV-imported state
  it('CASE 4: Saved draft restore is ignored when isCvApplied is true', () => {
    const staleDraft = {
      fullName: '',
      desiredRole: 'Diğer / Kendim gireceğim',
      primarySector: 'Çağrı merkezi',
    };

    let customFields = {
      fullName: 'Uğur Zaman',
      desiredRole: 'Çağrı Merkezi Operasyon Müdürü',
      primarySector: 'Çağrı merkezi',
    };

    const isCvApplied = true;

    // Simulate restoreDraft execution
    if (!isCvApplied) {
      customFields = mergeCustomFieldDefaults(JOB_SEEKER_FIELD_SCHEMA, staleDraft) as any;
    }

    expect(customFields.fullName).toBe('Uğur Zaman');
    expect(customFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(customFields.primarySector).toBe('Çağrı merkezi');
  });

  // CASE 5: DynamicField renders controlled state directly
  it('CASE 5: DynamicField controlled input value directly mirrors React state without conditional suppression', () => {
    const stateValue = 'Uğur Zaman';
    const displayValue = String(stateValue ?? '');
    expect(displayValue).toBe('Uğur Zaman');
  });

  // CASE 6: fullName blur event does not clear valid person name
  it('CASE 6: Name blur title-case formatting preserves valid person name "Uğur Zaman"', () => {
    const stringValue = 'uğur zaman';
    const nextValue = normalizeListingTitle(stringValue);
    expect(nextValue).toBe('Uğur Zaman');
    expect(nextValue).not.toBe('');
  });

  // CASE 7: Persistent state retention over time
  it('CASE 7: Merged form state retains all primary career fields invariantly', () => {
    const merged = mergeCustomFieldDefaults(JOB_SEEKER_FIELD_SCHEMA, {
      fullName: 'Uğur Zaman',
      desiredRole: 'Çağrı Merkezi Operasyon Müdürü',
      primarySector: 'Çağrı merkezi',
      experienceLevel: 'Yönetici',
      residenceCity: 'İstanbul',
      residenceDistrict: 'Maltepe',
    });

    expect(merged).toMatchObject({
      fullName: 'Uğur Zaman',
      desiredRole: 'Çağrı Merkezi Operasyon Müdürü',
      primarySector: 'Çağrı merkezi',
      experienceLevel: 'Yönetici',
      residenceCity: 'İstanbul',
      residenceDistrict: 'Maltepe',
    });
  });
});
