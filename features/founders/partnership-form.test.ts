import { describe, expect, it } from 'vitest';
import {
  getPartnerFormFieldKeys,
  getPartnerFormSchema,
  partnerCoreFieldLabels,
} from '@/features/founders/partnership-form';
import { getListingFormSteps } from '@/features/listings/config/listing-form-steps.config';
import { CATEGORY_IDS } from '@/features/listings/config/listing-type-config';

describe('partner form variants', () => {
  it('uses different fields for seeking and joining', () => {
    const seeking = getPartnerFormFieldKeys('seeking');
    const joining = getPartnerFormFieldKeys('joining');

    expect(seeking).toEqual([
      'sector',
      'sectorOther',
      'projectStage',
      'partnershipType',
      'partnershipTypes',
      'partnershipTypesOther',
      'professionalSkills',
      'professionalSkillsOther',
      'technicalSkills',
      'technicalSkillsOther',
      'tools',
      'toolsOther',
      'expertise',
      'expertiseOther',
      'commitment',
      'equityOffered',
      'contactPhone',
      'contactWhatsapp',
      'contactName',
      'contactEmail',
    ]);
    expect(joining).toEqual([
      'sectors',
      'sectorOther',
      'partnershipType',
      'projectStage',
      'commitment',
      'experience',
      'equityOffered',
      'partnershipTypes',
      'partnershipTypesOther',
      'professionalSkills',
      'professionalSkillsOther',
      'technicalSkills',
      'technicalSkillsOther',
      'tools',
      'toolsOther',
      'expertise',
      'expertiseOther',
      'offeredSkills',
      'offeredSkillsOther',
      'contactPhone',
      'contactWhatsapp',
      'contactName',
      'contactEmail',
    ]);
    expect(seeking).not.toContain('offeredSkills');
    expect(seeking).not.toContain('experience');
    expect(joining).toContain('offeredSkills');
    expect(joining).toContain('experience');
  });

  it('labels joining fields as a profile offer, not a partner search', () => {
    const seeking = getPartnerFormSchema('seeking').fields;
    const joining = getPartnerFormSchema('joining').fields;

    expect(seeking.find((field) => field.key === 'expertise')?.label).toBe('Aranan uzmanlıklar');
    expect(joining.find((field) => field.key === 'expertise')?.label).toBe('Uzmanlık alanları');
    expect(joining.find((field) => field.key === 'partnershipType')?.label).toBe(
      'İlgilendiğim girişim / proje tipi',
    );
    expect(joining.find((field) => field.key === 'offeredSkills')?.label).toBe(
      'Sunduğum yetkinlikler',
    );
    expect(joining.find((field) => field.key === 'equityOffered')?.label).toBe(
      'Hisse beklentisi (%)',
    );
    expect(partnerCoreFieldLabels('seeking').title).toBe('Ortaklık Başlığı');
    expect(partnerCoreFieldLabels('joining').title).toBe('Profil Başlığı');
  });

  it('builds different create steps for joining vs seeking', () => {
    const seeking = getListingFormSteps(CATEGORY_IDS.ortakBul, { partnershipIntent: 'seeking' });
    const joining = getListingFormSteps(CATEGORY_IDS.ortakBul, { partnershipIntent: 'joining' });

    expect(seeking.find((step) => step.id === 'partnership')?.title).toBe('Girişim ve Ortaklık Tipi');
    expect(joining.find((step) => step.id === 'partnership')?.title).toBe('Sunduğum Değer ve Yetkinlikler');
    expect(joining.find((step) => step.id === 'basics')?.title).toBe('Profiliniz');
    expect(joining.find((step) => step.id === 'details')?.coreFields).toEqual([
      'longDescription',
      'city',
    ]);
    expect(seeking.find((step) => step.id === 'basics')?.customFieldKeys).toEqual([
      'sector',
      'projectStage',
      'partnershipType',
      'commitment',
      'equityOffered',
    ]);
    expect(seeking.find((step) => step.id === 'partnership')?.customFieldKeys).toEqual([
      'expertise',
      'expertiseOther',
    ]);
    expect(JSON.stringify(joining)).not.toMatch(/Aranan ortak|Aranan uzmanlık/);
  });
});
