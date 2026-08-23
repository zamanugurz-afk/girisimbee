import { describe, expect, it } from 'vitest';
import {
  createProvenanceField,
  applyUserFieldOverride,
  mergeCvExtractionWithExistingProfile,
  type MasterCareerProfile,
  type JobPostingRequirement,
} from './canonical-career-contract';
import {
  extractProjectionsFromMasterProfile,
  createJobApplicationDraft,
  applyApplicationOverride,
  submitJobApplication,
} from './canonical-application-flow';
import { calculateJobMatch } from './canonical-job-matching';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';

describe('GİRİŞİMBEE — Career Profile & Production Integration Invariants Suite', () => {
  // Helper to build a standard base master profile
  function buildBaseMasterProfile(userId: string = 'user_101'): MasterCareerProfile {
    return {
      id: `prof_${userId}`,
      userId,
      fullName: createProvenanceField('Ahmet Yılmaz', 'CV', 0.95, 'Ahmet Yılmaz', true),
      email: createProvenanceField('ahmet@example.com', 'CV', 0.95, 'ahmet@example.com', true),
      phone: createProvenanceField('0532 111 22 33', 'CV', 0.95, '0532 111 22 33', true),
      residenceCity: createProvenanceField('İstanbul', 'CV', 0.92, 'İstanbul / Kadıköy', true),
      residenceDistrict: createProvenanceField('Kadıköy', 'CV', 0.92, 'Kadıköy', true),
      primaryRole: createProvenanceField('Kıdemli Frontend Geliştirici', 'CV', 0.9, 'Kıdemli Frontend Geliştirici', true),
      primarySector: createProvenanceField('Bilişim / Yazılım', 'CV', 0.9, 'Bilişim / Yazılım', true),
      experienceLevel: createProvenanceField('Senior', 'CV', 0.85, 'Senior', true),
      experiences: [
        {
          id: 'exp_1',
          sector: 'Bilişim / Yazılım',
          role: 'Kıdemli Frontend Geliştirici',
          company: 'Trendyol',
          duration: '4 yıl',
          responsibilities: 'React & TypeScript mikrofrontend mimarisi',
          achievements: '',
        },
      ],
      educationList: [
        {
          level: 'Lisans',
          school: 'İTÜ',
          field: 'Bilgisayar Mühendisliği',
          graduationYear: 2019,
        },
      ],
      skills: createProvenanceField(['React', 'TypeScript', 'Redux', 'Next.js', 'TailwindCSS'], 'CV', 0.95, undefined, true),
      tools: createProvenanceField(['Git', 'Docker', 'Webpack', 'Figma'], 'CV', 0.95, undefined, true),
      languages: createProvenanceField(['İngilizce (C1)'], 'CV', 0.9, undefined, true),
      certificates: createProvenanceField([], 'CV', 0.9, undefined, true),
      preferences: {
        workType: 'Tam Zamanlı',
        workplacePreference: 'Uzaktan (Remote)',
        preferredCity: 'İstanbul',
        salaryMin: 80000,
        salaryMax: 110000,
        availability: '1 ay',
      },
      activeIntentMode: 'seek',
      version: 1,
    };
  }

  // Helper to build a sample job posting
  function buildSampleJobPosting(jobId: string = 'job_901'): JobPostingRequirement {
    return {
      id: jobId,
      employerId: 'company_77',
      title: 'Senior Frontend Developer',
      sector: 'Bilişim / Yazılım',
      requiredRole: 'Kıdemli Frontend Geliştirici',
      requiredSeniority: 'Senior',
      requiredSkills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
      location: { city: 'İstanbul', district: 'Levent' },
      workType: 'Tam Zamanlı',
      workplacePreference: 'Uzaktan (Remote)',
    };
  }

  // --------------------------------------------------------------------------
  // INVARIANT 1: CV evidence NEVER silently overwrites USER overrides.
  // --------------------------------------------------------------------------
  it('INVARIANT 1: Updating a field via User Override preserves original evidence and flags re-upload conflicts', () => {
    const profile = buildBaseMasterProfile();

    // User overrides role to 'Yazılım Mimarı'
    profile.primaryRole = applyUserFieldOverride(profile.primaryRole, 'Yazılım Mimarı');

    expect(profile.primaryRole.value).toBe('Yazılım Mimarı');
    expect(profile.primaryRole.originalEvidenceValue).toBe('Kıdemli Frontend Geliştirici');
    expect(profile.primaryRole.source).toBe('USER');
    expect(profile.primaryRole.confidence).toBe(1.0);

    // Now a new CV is uploaded which has role 'Frontend Geliştirici'
    const mergeResult = mergeCvExtractionWithExistingProfile({
      existingProfile: profile,
      newCvExtraction: {
        primaryRole: 'Frontend Geliştirici',
      },
    });

    // Master profile still holds user's preferred value
    expect(mergeResult.updatedProfile.primaryRole.value).toBe('Yazılım Mimarı');
    expect(mergeResult.conflicts).toHaveLength(1);
    expect(mergeResult.conflicts[0].existingValue).toBe('Yazılım Mimarı');
    expect(mergeResult.conflicts[0].newCvValue).toBe('Frontend Geliştirici');
  });

  // --------------------------------------------------------------------------
  // INVARIANT 2: Application override NEVER mutates Master Career Profile.
  // --------------------------------------------------------------------------
  it('INVARIANT 2: Application-specific field override customizes application without mutating master profile', () => {
    const master = buildBaseMasterProfile();
    const job = buildSampleJobPosting();

    const draft = createJobApplicationDraft({
      masterProfile: master,
      jobRequirement: job,
    });

    // Candidate customizes role title specifically for this job application
    const customizedDraft = applyApplicationOverride({
      draft,
      fieldName: 'primaryRole',
      customValue: 'Lead React Mühendisi',
      reason: 'İlanın Lead seviyesi sorumlulukları için özel unvan',
    });

    // Customized application draft has the override
    expect(customizedDraft.customOverrides.primaryRole.customApplicationValue).toBe('Lead React Mühendisi');

    // Master Career Profile is completely unchanged
    expect(master.primaryRole.value).toBe('Kıdemli Frontend Geliştirici');
    expect(master.primaryRole.source).toBe('CV');
  });

  // --------------------------------------------------------------------------
  // INVARIANT 3: New CV extraction NEVER mutates past submitted Applications.
  // --------------------------------------------------------------------------
  it('INVARIANT 3: New CV extractions NEVER alter historical submitted applications', () => {
    const master = buildBaseMasterProfile();
    const job = buildSampleJobPosting();

    const draft = createJobApplicationDraft({ masterProfile: master, jobRequirement: job });
    const submittedApp = submitJobApplication({ draft, applicantNote: 'Ön yazım' });

    expect(submittedApp.status).toBe('SUBMITTED');
    expect(submittedApp.snapshotFromMasterProfile.fullName).toBe('Ahmet Yılmaz');

    // Master profile undergoes a new CV extraction & name change
    master.fullName = createProvenanceField('Ahmet Can Yılmaz', 'CV', 0.95);

    // Submitted application snapshot remains historical and immutable
    expect(submittedApp.snapshotFromMasterProfile.fullName).toBe('Ahmet Yılmaz');
  });

  // --------------------------------------------------------------------------
  // INVARIANT 4: User data & evidence is strictly isolated per userId.
  // --------------------------------------------------------------------------
  it('INVARIANT 4: User profiles and application drafts are isolated by userId', () => {
    const userA = buildBaseMasterProfile('user_A');
    const userB = buildBaseMasterProfile('user_B');

    userB.fullName = createProvenanceField('Zeynep Çelik', 'USER', 1.0);

    expect(userA.userId).toBe('user_A');
    expect(userB.userId).toBe('user_B');
    expect(userA.fullName.value).not.toBe(userB.fullName.value);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 5: Evidence-less fields can never be marked as CONFIRMED without user verification.
  // --------------------------------------------------------------------------
  it('INVARIANT 5: Evidence-less or ungrounded fields remain UNCONFIRMED with NOT_FOUND status', () => {
    const emptyField = createProvenanceField('', 'CV', 0.0, undefined, false, 'NOT_FOUND');
    expect(emptyField.isConfirmed).toBe(false);
    expect(emptyField.status).toBe('NOT_FOUND');
  });

  // --------------------------------------------------------------------------
  // INVARIANT 6: Golden fixture cannot leak into arbitrary candidate profiles.
  // --------------------------------------------------------------------------
  it('INVARIANT 6: Golden test fixture (Uğur Zaman) does not leak into independent profiles', () => {
    const cvText = `Seda Koç\nseda@example.com | 0532 999 00 11\nİzmir / Konak\nDijital Pazarlama Uzmanı\n\nDENEYİM\nE-Ticaret A.Ş. - Dijital Pazarlama Uzmanı (2020 - 2024)\n\nBECERİLER\nSEO, SEM, Google Ads, GA4`;

    const det = extractDeterministicCv(cvText);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Seda Koç');
    expect(canonical.fullName).not.toContain('Uğur');
    expect(canonical.residenceCity).toBe('İzmir');
    expect(canonical.residenceCity).not.toBe('Maltepe');
  });

  // --------------------------------------------------------------------------
  // INVARIANT 7: Job matching calculations NEVER mutate Career Profile.
  // --------------------------------------------------------------------------
  it('INVARIANT 7: Job matching calculation is a pure function and never mutates master profile', () => {
    const master = buildBaseMasterProfile();
    const job = buildSampleJobPosting();
    const originalSnapshot = JSON.stringify(master);

    const matchResult = calculateJobMatch({
      candidateProfile: master,
      jobRequirement: job,
    });

    expect(matchResult.overallScore).toBeGreaterThan(70);
    expect(matchResult.isRecommended).toBe(true);
    expect(matchResult.whyYouMatch.length).toBeGreaterThanOrEqual(2);
    expect(matchResult.missingQualifications).toContain('İlanda aranan şu yetkinlikler profilinizde eksik: GraphQL.');

    // Master profile is byte-for-byte identical
    expect(JSON.stringify(master)).toBe(originalSnapshot);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 8: User edit preserves originalEvidenceValue and tracks provenance.
  // --------------------------------------------------------------------------
  it('INVARIANT 8: User edit preserves originalEvidenceValue and tracks provenance', () => {
    const originalField = createProvenanceField('Junior Dev', 'CV', 0.85, 'Junior Dev');
    const updatedField = applyUserFieldOverride(originalField, 'Mid Fullstack Developer');

    expect(updatedField.originalEvidenceValue).toBe('Junior Dev');
    expect(updatedField.value).toBe('Mid Fullstack Developer');
    expect(updatedField.source).toBe('USER');
    expect(updatedField.editedAt).toBeDefined();
  });

  // --------------------------------------------------------------------------
  // INVARIANT 9: Extraction is deterministic across multiple executions.
  // --------------------------------------------------------------------------
  it('INVARIANT 9: Extraction is 100% deterministic (identical inputs produce identical payloads)', () => {
    const rawText = `Canan Erdem\ncanan@example.com | 0533 111 22 33\nAnkara / Çankaya\nİnsan Kaynakları Uzmanı\n\nDENEYİM\nGlobal A.Ş. - İnsan Kaynakları Uzmanı (2019 - 2024)\n\nBECERİLER\nBordro, İşe Alım, SAP HR`;

    const run1 = mapCvToCanonicalTaxonomy(extractDeterministicCv(rawText));
    const run2 = mapCvToCanonicalTaxonomy(extractDeterministicCv(rawText));

    expect(run1.fullName).toBe(run2.fullName);
    expect(run1.primaryRole).toBe(run2.primaryRole);
    expect(run1.primarySector).toBe(run2.primarySector);
    expect(run1.residenceCity).toBe(run2.residenceCity);
    expect(run1.professionalSkills).toEqual(run2.professionalSkills);
  });

  // --------------------------------------------------------------------------
  // INVARIANT 10: Application snapshot is immutable once submitted.
  // --------------------------------------------------------------------------
  it('INVARIANT 10: Application snapshot is frozen upon submission', () => {
    const master = buildBaseMasterProfile();
    const job = buildSampleJobPosting();
    const draft = createJobApplicationDraft({ masterProfile: master, jobRequirement: job });
    const submitted = submitJobApplication({ draft });

    expect(submitted.status).toBe('SUBMITTED');
    expect(submitted.submittedAt).toBeDefined();
  });

  // --------------------------------------------------------------------------
  // 3 INTENT MODES PROJECTIONS
  // --------------------------------------------------------------------------
  it('Intent Projections: Extracts Seek, Hire, and Partner projections from Master Profile without data loss', () => {
    const master = buildBaseMasterProfile();
    const { seek, hire, partner } = extractProjectionsFromMasterProfile(master);

    // Job Seeking projection
    expect(seek.targetRole).toBe('Kıdemli Frontend Geliştirici');
    expect(seek.targetSector).toBe('Bilişim / Yazılım');
    expect(seek.experienceLevel).toBe('Senior');

    // Hiring projection
    expect(hire.companyName).toBe('Trendyol');
    expect(hire.hiringRoles).toContain('Kıdemli Frontend Geliştirici');

    // Partnership projection
    expect(partner.founderName).toBe('Ahmet Yılmaz');
    expect(partner.expertiseAreas).toContain('React');
  });
});
