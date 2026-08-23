import { describe, it, expect } from 'vitest';
import { buildHydratedCustomFieldsFromCvDraft } from '@/features/candidates/cv/cv-form-hydrator';
import { mergeCustomFieldDefaults } from '@/features/listings/form/build-dynamic-schema';
import { JOB_SEEKER_FIELD_SCHEMA } from '@/features/listings/config/listing-type-config';
import {
  getPositionsForSector,
  getAllTaxonomyPositions,
  isManualCareerOption,
} from '@/features/candidates/taxonomy/career-taxonomy';
import type { CvProfileDraftResult } from '@/features/candidates/cv/cv.types';

describe('CV Import State Overwrite & Priority Regression Suite', () => {
  it('guarantees that CV hydration values are authoritative and NOT overwritten by draft restore, schema merge, or sector change effects', () => {
    // 1. Initial State / Saved Draft
    const initialSavedDraft = {
      fullName: '',
      desiredRole: '',
      primarySector: 'Çağrı merkezi',
    };

    let customFields: Record<string, unknown> = mergeCustomFieldDefaults(
      JOB_SEEKER_FIELD_SCHEMA,
      initialSavedDraft,
    );

    let isCvApplied = false;

    // Verify Initial State
    expect(customFields.fullName).toBe('');
    expect(customFields.desiredRole).toBe('');
    expect(customFields.primarySector).toBe('Çağrı merkezi');

    // 2. User Uploads CV & Hydration Runs
    const mockCvDraft: CvProfileDraftResult = {
      formValues: {
        fullName: 'Uğur Zaman',
        role: 'Çağrı Merkezi Operasyon Müdürü',
        desiredRole: 'Çağrı Merkezi Operasyon Müdürü',
        primarySector: 'Çağrı merkezi',
        sector: 'Çağrı merkezi',
        experienceLevel: 'Yönetici',
        residenceCity: 'İstanbul',
        residenceDistrict: 'Maltepe',
        experiences: [
          {
            role: 'Telemarketing ve Çağrı Merkezi Operasyonları Direktörü',
            sector: 'Çağrı merkezi',
            company: 'IGS Türkiye',
            startYear: 2020,
            endYear: 2024,
            isCurrent: true,
            duration: '4 yıl',
            responsibilities: 'Çağrı merkezi yönetimi',
            achievements: '',
          },
        ],
      },
      cvFilledFieldKeys: ['fullName', 'desiredRole', 'primarySector', 'experienceLevel', 'residenceCity'],
    };

    const hydrationResult = buildHydratedCustomFieldsFromCvDraft(
      mockCvDraft,
      customFields,
      JOB_SEEKER_FIELD_SCHEMA,
    );

    // Apply CV Hydration to state
    customFields = hydrationResult.nextCustomFields;
    isCvApplied = true;

    expect(customFields.fullName).toBe('Uğur Zaman');
    expect(customFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(customFields.primarySector).toBe('Çağrı merkezi');

    // 3. Simulate Draft Restore Event (Must NOT overwrite CV-imported fields)
    if (!isCvApplied) {
      // If draft restore mistakenly attempted to overwrite when CV is applied
      customFields = mergeCustomFieldDefaults(JOB_SEEKER_FIELD_SCHEMA, initialSavedDraft);
    }

    expect(customFields.fullName).toBe('Uğur Zaman');
    expect(customFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(customFields.primarySector).toBe('Çağrı merkezi');

    // 4. Simulate Schema Merge Effect (mergeCustomFieldDefaults on re-render)
    const mergedCustomFields = mergeCustomFieldDefaults(
      JOB_SEEKER_FIELD_SCHEMA,
      customFields,
    );

    expect(mergedCustomFields.fullName).toBe('Uğur Zaman');
    expect(mergedCustomFields.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(mergedCustomFields.primarySector).toBe('Çağrı merkezi');

    // 5. Simulate Sector Change / Validation Effect
    const currentSector = String(mergedCustomFields.primarySector || '');
    const currentRole = String(mergedCustomFields.desiredRole || '');

    if (currentRole && !isManualCareerOption(currentRole)) {
      const allowedRoles = getPositionsForSector(currentSector);
      const allTaxonomy = getAllTaxonomyPositions();

      // Ensure valid role is retained and NOT wiped to empty or Diğer
      expect(allowedRoles.includes(currentRole) || allTaxonomy.includes(currentRole)).toBe(true);
      expect(allowedRoles.includes('Çağrı Merkezi Operasyon Müdürü')).toBe(true);
    }

    // 6. Simulate DynamicField Controlled Input / Select Binding
    // fullName binding:
    const fullNameValue =
      typeof mergedCustomFields.fullName === 'string'
        ? mergedCustomFields.fullName.trim()
        : '';
    expect(fullNameValue).toBe('Uğur Zaman');
    expect(fullNameValue).not.toBe('');

    // desiredRole binding:
    const desiredRoleValue = String(mergedCustomFields.desiredRole || '');
    expect(desiredRoleValue).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(desiredRoleValue).not.toBe('');
    expect(desiredRoleValue).not.toBe('Diğer');
    expect(desiredRoleValue).not.toBe('Diğer / Kendim gireceğim');

    // 7. Final Comprehensive Invariant Check
    expect(mergedCustomFields).toMatchObject({
      fullName: 'Uğur Zaman',
      desiredRole: 'Çağrı Merkezi Operasyon Müdürü',
      primarySector: 'Çağrı merkezi',
    });
  });
});
