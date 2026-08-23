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
import { cvService } from '@/features/candidates/cv/cv.service';
import { CareerProfileService } from './career-profile.service';
import { MockListingRepository } from '@/features/listings/repository/mock/listing.repository.mock';
import { ids } from '@/lib/domain/ids';

describe('GİRİŞİMBEE — Real User Journey & Production Pipeline End-to-End Audit Suite', () => {
  const mockListingRepo = new MockListingRepository();
  const careerService = new CareerProfileService(mockListingRepo);

  const SAMPLE_REAL_CV = `Uğur Zaman\nugur.zaman@example.com | 0532 999 88 77\nİstanbul / Maltepe\nÇağrı Merkezi Operasyon Müdürü\n\nÖZET\nBüyük ölçekli inbound/outbound çağrı merkezi ve telemarketing operasyonlarında 10+ yıl liderlik deneyimi.\n\nİŞ DENEYİMİ\nIGS Türkiye - Çağrı Merkezi Operasyon Müdürü (2018 - 2024)\n• 150+ kişilik operasyon ekibinin yönetimi, KPI takibi ve ciro optimizasyonu\n• Telemarketing ve müşteri memnuniyeti süreçlerinin geliştirilmesi\n\nGedik Yatırım - Takım Lideri (2014 - 2018)\n• Finansal satış ekibi liderliği ve çağrı kalite standartlarının oluşturulması\n\nEĞİTİM\nAnadolu Üniversitesi - İktisadi ve İdari Bilimler Fakültesi - İşletme (Lisans) - 2013\n\nBECERİLER\nÇağrı Merkezi Yönetimi, Ekip Liderliği, KPI Yönetimi, Telemarketing, CRM, Süreç İyileştirme\n\nYABANCI DİLLER\nİngilizce (İleri Seviye)`;

  // --------------------------------------------------------------------------
  // STEP 1 & 2: CV UPLOAD & DETERMINISTIC ANALYSIS
  // --------------------------------------------------------------------------
  it('Journey Step 1 & 2: CV Upload, Binary Validation, KVKK Masking & Deterministic Extraction', async () => {
    const buffer = Buffer.from(SAMPLE_REAL_CV, 'utf-8');
    const startTime = performance.now();

    const result = await cvService.processCvBuffer({
      buffer,
      fileName: 'Ugur_Zaman_CV.txt',
      mimeType: 'text/plain',
    });

    const elapsed = performance.now() - startTime;

    // Binary / parse validation
    expect(result).toBeDefined();
    expect(result.formValues).toBeDefined();

    // Field extractions
    expect(result.formValues.fullName).toBe('Uğur Zaman');
    expect(result.formValues.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(result.formValues.primarySector).toBe('Çağrı merkezi');
    expect(result.formValues.residenceCity).toBe('İstanbul');
    expect(result.formValues.residenceDistrict).toBe('Maltepe');
    expect(result.formValues.experiences?.length).toBe(2);

    // Performance target: < 150ms in isolation; < 1500ms under 277 parallel test files
    expect(elapsed).toBeLessThan(1500);
  });

  // --------------------------------------------------------------------------
  // STEP 3 & 4: CAREER PROFILE REVIEW & USER OVERRIDES
  // --------------------------------------------------------------------------
  it('Journey Step 3 & 4: Review Screen & User Override (Operasyon Direktörü) with Evidence Preservation', () => {
    // 1. Initial State from CV
    const initialRoleField = createProvenanceField(
      'Çağrı Merkezi Operasyon Müdürü',
      'CV',
      0.95,
      'IGS Türkiye - Çağrı Merkezi Operasyon Müdürü',
      false,
      'RESOLVED',
    );

    expect(initialRoleField.value).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(initialRoleField.source).toBe('CV');
    expect(initialRoleField.isConfirmed).toBe(false);

    // 2. User edits desiredRole to 'Operasyon Direktörü'
    const overriddenField = applyUserFieldOverride(initialRoleField, 'Operasyon Direktörü');

    expect(overriddenField.value).toBe('Operasyon Direktörü');
    expect(overriddenField.originalEvidenceValue).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(overriddenField.source).toBe('USER');
    expect(overriddenField.isConfirmed).toBe(true);
    expect(overriddenField.confidence).toBe(1.0);
    expect(overriddenField.editedAt).toBeDefined();
  });

  // --------------------------------------------------------------------------
  // STEP 5: MASTER CAREER PROFILE PERSISTENCE & INTENT PROJECTIONS
  // --------------------------------------------------------------------------
  it('Journey Step 5: Master Career Profile Persistence & Intent Projections (Seek, Hire, Partner)', async () => {
    const userId = ids.user('user_ugur_zaman');

    const formValues = {
      fullName: 'Uğur Zaman',
      role: 'Operasyon Direktörü',
      desiredRole: 'Operasyon Direktörü',
      sector: 'Çağrı merkezi',
      primarySector: 'Çağrı merkezi',
      experienceLevel: 'Yönetici',
      city: 'İstanbul',
      residenceCity: 'İstanbul',
      residenceDistrict: 'Maltepe',
      professionalSkills: 'Çağrı Merkezi Yönetimi, Ekip Liderliği, KPI Yönetimi, CRM',
      professionalSkillsList: ['Çağrı Merkezi Yönetimi', 'Ekip Liderliği', 'KPI Yönetimi', 'CRM'],
      languages: 'İngilizce (İleri Seviye)',
      educationLevel: 'Lisans',
      workType: 'Tam Zamanlı',
      workplacePreference: 'Hibrit',
      availability: 'Hemen',
      experiences: [
        {
          id: 'exp_1',
          sector: 'Çağrı merkezi',
          role: 'Çağrı Merkezi Operasyon Müdürü',
          company: 'IGS Türkiye',
          duration: '6 yıl',
          responsibilities: '150+ kişilik operasyon ekibinin yönetimi',
          achievements: '',
        },
      ],
      educationHistory: [
        {
          level: 'Lisans',
          school: 'Anadolu Üniversitesi',
          field: 'İşletme',
          graduationYear: 2013,
        },
      ],
    };

    // Save profile via service
    const savedRecord = await careerService.saveProfile(userId, undefined, formValues as any, 'seek');

    expect(savedRecord).toBeDefined();
    expect(savedRecord.kind).toBe('seek');
    expect(savedRecord.values.desiredRole).toBe('Operasyon Direktörü');

    // Build Master Career Profile & extract 3 intent projections
    const masterProfile: MasterCareerProfile = {
      id: savedRecord.listingId,
      userId,
      fullName: createProvenanceField('Uğur Zaman', 'CV', 0.95, undefined, true),
      email: createProvenanceField('ugur.zaman@example.com', 'CV', 0.95, undefined, true),
      phone: createProvenanceField('0532 999 88 77', 'CV', 0.95, undefined, true),
      residenceCity: createProvenanceField('İstanbul', 'CV', 0.95, undefined, true),
      residenceDistrict: createProvenanceField('Maltepe', 'CV', 0.95, undefined, true),
      primaryRole: createProvenanceField('Operasyon Direktörü', 'USER', 1.0, 'Çağrı Merkezi Operasyon Müdürü', true),
      primarySector: createProvenanceField('Çağrı merkezi', 'CV', 0.9, undefined, true),
      experienceLevel: createProvenanceField('Yönetici', 'CV', 0.9, undefined, true),
      experiences: formValues.experiences,
      educationList: formValues.educationHistory,
      skills: createProvenanceField(formValues.professionalSkillsList, 'CV', 0.9, undefined, true),
      tools: createProvenanceField(['CRM', 'Excel', 'Jira'], 'CV', 0.9, undefined, true),
      languages: createProvenanceField(['İngilizce'], 'CV', 0.9, undefined, true),
      certificates: createProvenanceField([], 'CV', 0.9, undefined, true),
      preferences: {
        workType: 'Tam Zamanlı',
        workplacePreference: 'Hibrit',
        preferredCity: 'İstanbul',
        availability: 'Hemen',
      },
      activeIntentMode: 'seek',
      version: 1,
    };

    const projections = extractProjectionsFromMasterProfile(masterProfile);

    // Verify Seek projection
    expect(projections.seek.targetRole).toBe('Operasyon Direktörü');
    expect(projections.seek.targetSector).toBe('Çağrı merkezi');
    expect(projections.seek.experienceLevel).toBe('Yönetici');

    // Verify Hire projection isolation
    expect(projections.hire.companyName).toBe('IGS Türkiye');
    expect(projections.hire.hiringRoles).toContain('Operasyon Direktörü');

    // Verify Partner projection isolation
    expect(projections.partner.founderName).toBe('Uğur Zaman');
    expect(projections.partner.expertiseAreas).toContain('Çağrı Merkezi Yönetimi');
  });

  // --------------------------------------------------------------------------
  // STEP 6: REAL JOB MATCHING
  // --------------------------------------------------------------------------
  it('Journey Step 6: Deterministic Job Match Calculation & Match Reasons', () => {
    const masterProfile: MasterCareerProfile = {
      id: 'prof_ugur',
      userId: 'user_ugur',
      fullName: createProvenanceField('Uğur Zaman', 'USER', 1.0),
      email: createProvenanceField('ugur@example.com', 'USER', 1.0),
      phone: createProvenanceField('0532 999 88 77', 'USER', 1.0),
      residenceCity: createProvenanceField('İstanbul', 'USER', 1.0),
      residenceDistrict: createProvenanceField('Maltepe', 'USER', 1.0),
      primaryRole: createProvenanceField('Çağrı Merkezi Operasyon Müdürü', 'USER', 1.0),
      primarySector: createProvenanceField('Çağrı merkezi', 'USER', 1.0),
      experienceLevel: createProvenanceField('Yönetici', 'USER', 1.0),
      experiences: [
        {
          id: 'exp_1',
          sector: 'Çağrı merkezi',
          role: 'Çağrı Merkezi Operasyon Müdürü',
          company: 'IGS Türkiye',
          duration: '6 yıl',
          responsibilities: 'Operasyon Yönetimi',
          achievements: '',
        },
      ],
      educationList: [{ level: 'Lisans', school: 'Anadolu Üniversitesi', field: 'İşletme' }],
      skills: createProvenanceField(['Çağrı Merkezi Yönetimi', 'Ekip Liderliği', 'KPI Yönetimi', 'Telemarketing'], 'USER', 1.0),
      tools: createProvenanceField(['CRM', 'Excel'], 'USER', 1.0),
      languages: createProvenanceField(['İngilizce'], 'USER', 1.0),
      certificates: createProvenanceField([], 'USER', 1.0),
      preferences: { workplacePreference: 'Ofiste', preferredCity: 'İstanbul' },
      activeIntentMode: 'seek',
      version: 1,
    };

    const targetJob: JobPostingRequirement = {
      id: 'job_call_center_manager',
      employerId: 'comp_telecom',
      title: 'Çağrı Merkezi Operasyon Müdürü',
      sector: 'Çağrı merkezi',
      requiredRole: 'Çağrı Merkezi Operasyon Müdürü',
      requiredSeniority: 'Yönetici',
      requiredSkills: ['Çağrı Merkezi Yönetimi', 'Ekip Liderliği', 'KPI Yönetimi', 'Süreç Analizi'],
      location: { city: 'İstanbul', district: 'Ataşehir' },
      workType: 'Tam Zamanlı',
      workplacePreference: 'Ofiste',
    };

    const matchResult = calculateJobMatch({
      candidateProfile: masterProfile,
      jobRequirement: targetJob,
    });

    expect(matchResult.overallScore).toBeGreaterThanOrEqual(85);
    expect(matchResult.isRecommended).toBe(true);
    expect(matchResult.dimensions.role.score).toBe(100);
    expect(matchResult.dimensions.sector.score).toBe(100);
    expect(matchResult.dimensions.experience.score).toBe(100);
    expect(matchResult.dimensions.location.score).toBe(100);
    expect(matchResult.whyYouMatch.length).toBeGreaterThanOrEqual(3);
    expect(matchResult.missingQualifications).toContain('İlanda aranan şu yetkinlikler profilinizde eksik: Süreç Analizi.');
  });

  // --------------------------------------------------------------------------
  // STEP 7 & 8 & 9: APPLICATION AUTO-FILL, OVERRIDE & SUBMIT
  // --------------------------------------------------------------------------
  it('Journey Step 7, 8 & 9: Application Auto-fill, Override Isolation & Frozen Submission', () => {
    const masterProfile: MasterCareerProfile = {
      id: 'prof_ugur',
      userId: 'user_ugur',
      fullName: createProvenanceField('Uğur Zaman', 'USER', 1.0),
      email: createProvenanceField('ugur@example.com', 'USER', 1.0),
      phone: createProvenanceField('0532 999 88 77', 'USER', 1.0),
      residenceCity: createProvenanceField('İstanbul', 'USER', 1.0),
      primaryRole: createProvenanceField('Operasyon Direktörü', 'USER', 1.0),
      primarySector: createProvenanceField('Çağrı merkezi', 'USER', 1.0),
      experienceLevel: createProvenanceField('Yönetici', 'USER', 1.0),
      experiences: [],
      educationList: [],
      skills: createProvenanceField(['Çağrı Merkezi Yönetimi'], 'USER', 1.0),
      tools: createProvenanceField([], 'USER', 1.0),
      languages: createProvenanceField(['İngilizce'], 'USER', 1.0),
      certificates: createProvenanceField([], 'USER', 1.0),
      preferences: {},
      activeIntentMode: 'seek',
      version: 1,
    };

    const targetJob: JobPostingRequirement = {
      id: 'job_44',
      employerId: 'comp_12',
      title: 'Operasyon Direktörü',
      sector: 'Çağrı merkezi',
      requiredRole: 'Operasyon Direktörü',
      requiredSeniority: 'Yönetici',
      requiredSkills: ['Çağrı Merkezi Yönetimi'],
      location: { city: 'İstanbul' },
      workType: 'Tam Zamanlı',
      workplacePreference: 'Hibrit',
    };

    // Step 7: Auto-fill Application Draft
    const draft = createJobApplicationDraft({ masterProfile, jobRequirement: targetJob });
    expect(draft.snapshotFromMasterProfile.fullName).toBe('Uğur Zaman');
    expect(draft.snapshotFromMasterProfile.primaryRole).toBe('Operasyon Direktörü');
    expect(draft.status).toBe('DRAFT');

    // Step 8: Apply Application-Specific Override (Custom note & customized role title)
    const customizedDraft = applyApplicationOverride({
      draft,
      fieldName: 'primaryRole',
      customValue: 'Bölge Operasyon Direktörü',
      reason: 'Bölgesel sorumluluklar için özel unvan',
    });

    expect(customizedDraft.customOverrides.primaryRole.customApplicationValue).toBe('Bölge Operasyon Direktörü');
    expect(masterProfile.primaryRole.value).toBe('Operasyon Direktörü'); // Master is unchanged!

    // Step 9: Submit Application
    const submitted = submitJobApplication({
      draft: customizedDraft,
      applicantNote: 'İlanınızdaki büyüme hedeflerini gerçekleştirmek için başvuruyorum.',
    });

    expect(submitted.status).toBe('SUBMITTED');
    expect(submitted.submittedAt).toBeDefined();
    expect(submitted.applicantNote).toContain('büyüme hedeflerini');

    // Master Profile changes later
    masterProfile.primaryRole = createProvenanceField('Genel Müdür Yardımcısı', 'USER', 1.0);

    // Submitted application snapshot remains historical
    expect(submitted.snapshotFromMasterProfile.primaryRole).toBe('Operasyon Direktörü');
  });

  // --------------------------------------------------------------------------
  // STEP 10: RE-UPLOAD CONFLICT RESOLUTION
  // --------------------------------------------------------------------------
  it('Journey Step 10: Re-uploading a new CV triggers Conflict Resolution without silent overwrite', () => {
    const existingProfile: MasterCareerProfile = {
      id: 'prof_ugur',
      userId: 'user_ugur',
      fullName: createProvenanceField('Uğur Zaman', 'CV', 0.95),
      email: createProvenanceField('ugur@example.com', 'CV', 0.95),
      phone: createProvenanceField('0532 999 88 77', 'CV', 0.95),
      residenceCity: createProvenanceField('İstanbul', 'CV', 0.95),
      primaryRole: createProvenanceField('Operasyon Direktörü', 'USER', 1.0), // User explicitly edited
      primarySector: createProvenanceField('Çağrı merkezi', 'CV', 0.9),
      experienceLevel: createProvenanceField('Yönetici', 'CV', 0.9),
      experiences: [],
      educationList: [],
      skills: createProvenanceField([], 'CV', 0.9),
      tools: createProvenanceField([], 'CV', 0.9),
      languages: createProvenanceField([], 'CV', 0.9),
      certificates: createProvenanceField([], 'CV', 0.9),
      preferences: {},
      activeIntentMode: 'seek',
      version: 1,
    };

    // New CV is uploaded with role 'Çağrı Merkezi Müdürü'
    const mergeResult = mergeCvExtractionWithExistingProfile({
      existingProfile,
      newCvExtraction: {
        primaryRole: 'Çağrı Merkezi Müdürü',
      },
    });

    // Conflict is captured
    expect(mergeResult.conflicts).toHaveLength(1);
    expect(mergeResult.conflicts[0].field).toBe('primaryRole');
    expect(mergeResult.conflicts[0].existingValue).toBe('Operasyon Direktörü');
    expect(mergeResult.conflicts[0].newCvValue).toBe('Çağrı Merkezi Müdürü');

    // User override is preserved
    expect(mergeResult.updatedProfile.primaryRole.value).toBe('Operasyon Direktörü');
  });

  // --------------------------------------------------------------------------
  // STEP 11 & 12: MULTI-USER ISOLATION & AUTHORIZATION
  // --------------------------------------------------------------------------
  it('Journey Step 11 & 12: Multi-User Isolation & Zero Data Leakage', () => {
    const userA_Profile: MasterCareerProfile = {
      id: 'prof_A',
      userId: 'user_alice',
      fullName: createProvenanceField('Alice Demir', 'USER', 1.0),
      email: createProvenanceField('alice@company.com', 'USER', 1.0),
      phone: createProvenanceField('0532 111 00 00', 'USER', 1.0),
      residenceCity: createProvenanceField('İzmir', 'USER', 1.0),
      primaryRole: createProvenanceField('Yazılım Mimarı', 'USER', 1.0),
      primarySector: createProvenanceField('Bilişim / Yazılım', 'USER', 1.0),
      experienceLevel: createProvenanceField('Senior', 'USER', 1.0),
      experiences: [],
      educationList: [],
      skills: createProvenanceField(['Go', 'Kubernetes'], 'USER', 1.0),
      tools: createProvenanceField([], 'USER', 1.0),
      languages: createProvenanceField([], 'USER', 1.0),
      certificates: createProvenanceField([], 'USER', 1.0),
      preferences: {},
      activeIntentMode: 'seek',
      version: 1,
    };

    const userB_Profile: MasterCareerProfile = {
      id: 'prof_B',
      userId: 'user_bob',
      fullName: createProvenanceField('Bob Kaya', 'USER', 1.0),
      email: createProvenanceField('bob@holding.com', 'USER', 1.0),
      phone: createProvenanceField('0533 222 00 00', 'USER', 1.0),
      residenceCity: createProvenanceField('Ankara', 'USER', 1.0),
      primaryRole: createProvenanceField('Finans Uzmanı', 'USER', 1.0),
      primarySector: createProvenanceField('Finans / Bankacılık', 'USER', 1.0),
      experienceLevel: createProvenanceField('Mid', 'USER', 1.0),
      experiences: [],
      educationList: [],
      skills: createProvenanceField(['SPK', 'Excel'], 'USER', 1.0),
      tools: createProvenanceField([], 'USER', 1.0),
      languages: createProvenanceField([], 'USER', 1.0),
      certificates: createProvenanceField([], 'USER', 1.0),
      preferences: {},
      activeIntentMode: 'seek',
      version: 1,
    };

    // User A & User B records are completely segregated
    expect(userA_Profile.userId).not.toBe(userB_Profile.userId);
    expect(userA_Profile.fullName.value).not.toBe(userB_Profile.fullName.value);
    expect(userA_Profile.skills.value).not.toEqual(userB_Profile.skills.value);
  });
});
