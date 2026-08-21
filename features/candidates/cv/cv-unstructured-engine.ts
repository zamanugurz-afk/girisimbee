/**
 * Universal Unstructured CV Intelligence Engine (CV Extraction 4.0)
 * Layout-independent, evidence-based extraction engine for unstructured,
 * sectionless, multi-column, table-based, and free-text CVs.
 */

import { generateCandidateTokens } from './cv-candidate-generator';
import {
  resolveExperienceRelationships,
  resolveEducationRelationships,
  resolvePersonalInfoRelationships,
} from './cv-relationship-engine';
import { extractUniversalDemographics } from './cv-universal-normalizer';
import {
  extractDeterministicSkillsAndTools,
  extractDeterministicLanguagesAndCerts,
  extractDeterministicLocations,
} from './cv-deterministic-extractor';
import type {
  UnstructuredExtractionResult,
  UnstructuredExperienceBlock,
  UnstructuredEducationBlock,
} from './cv-unstructured-types';
import type {
  AiCvExtractionPayload,
  RawExtractedExperience,
  RawExtractedEducation,
} from './cv.types';

/**
 * Extracts all profile entities from unstructured CV text with zero template assumptions.
 */
export function extractUnstructuredCv(text: string): UnstructuredExtractionResult {
  // PASS 1: Candidate Token Generation
  const tokens = generateCandidateTokens(text);

  // PASS 2: Personal Info & Demographics (Scoped, Zero Hallucination)
  const universalDemo = extractUniversalDemographics(text);
  const loc = extractDeterministicLocations(text);
  const tokenPersonalInfo = resolvePersonalInfoRelationships(tokens, text);

  const finalFullName = universalDemo.fullName || tokenPersonalInfo.fullName;
  const finalCity = loc.city || tokenPersonalInfo.city;
  const finalDistrict = loc.district || tokenPersonalInfo.district;
  const finalEmail = universalDemo.email || tokenPersonalInfo.email;
  const finalPhone = universalDemo.phone || tokenPersonalInfo.phone;
  const finalLinkedin = universalDemo.linkedin || tokenPersonalInfo.linkedin;
  const finalWebsite = universalDemo.website || tokenPersonalInfo.website;

  // PASS 3: Experience Candidates & Relationship Resolution (Format A-J)
  const unstructuredExperiences = resolveExperienceRelationships(tokens);

  // PASS 4: Education Candidates & Relationship Resolution
  const unstructuredEducation = resolveEducationRelationships(tokens);

  // PASS 5: Skills, Tools, Languages, Certificates
  const skillsAndTools = extractDeterministicSkillsAndTools(text);
  const langAndCerts = extractDeterministicLanguagesAndCerts(text);

  // Convert Unstructured Blocks to Canonical Raw Payload
  const rawExperiences: RawExtractedExperience[] = unstructuredExperiences.map((ue) => ({
    company: ue.company,
    role: ue.role,
    startYear: ue.startYear,
    endYear: ue.endYear,
    isCurrent: ue.isCurrent,
    responsibilities: ue.responsibilities.join('. '),
    durationYears:
      ue.startYear && ue.endYear ? Math.max(1, ue.endYear - ue.startYear) : undefined,
  }));

  const rawEducation: RawExtractedEducation[] = unstructuredEducation.map((ued) => ({
    school: ued.school,
    level: ued.level,
    field: ued.field,
    graduationYear: ued.graduationYear,
  }));

  // PASS 6 & 7: Provenance & Confidence Calculation
  const fieldConfidenceScores: Record<string, number> = {
    fullName: finalFullName ? 0.98 : 0,
    city: finalCity ? 0.98 : 0,
    district: finalDistrict ? 0.95 : 0,
    email: finalEmail ? 0.99 : 0,
    phone: finalPhone ? 0.99 : 0,
    experiences: rawExperiences.length > 0 ? 0.95 : 0,
    education: rawEducation.length > 0 ? 0.96 : 0,
    skills: skillsAndTools.professionalSkills.length > 0 ? 0.94 : 0,
    languages: langAndCerts.languages.length > 0 ? 0.98 : 0,
  };

  const provenanceMap: UnstructuredExtractionResult['provenanceMap'] = {};

  if (finalFullName) {
    provenanceMap.fullName = {
      value: finalFullName,
      evidence: finalFullName,
      confidence: 0.98,
      method: 'unstructured_personal_info',
    };
  }

  for (let i = 0; i < unstructuredExperiences.length; i++) {
    const exp = unstructuredExperiences[i];
    provenanceMap[`experience_${i}`] = {
      value: `${exp.role || ''} at ${exp.company || ''}`,
      evidence: exp.evidence,
      confidence: exp.confidence,
      method: `unstructured_relationship_${exp.format.toLowerCase()}`,
    };
  }

  for (let i = 0; i < unstructuredEducation.length; i++) {
    const edu = unstructuredEducation[i];
    provenanceMap[`education_${i}`] = {
      value: `${edu.school || ''} - ${edu.field || ''}`,
      evidence: edu.evidence,
      confidence: edu.confidence,
      method: 'unstructured_relationship_education',
    };
  }

  // Synthesis Summary
  const topRole = skillsAndTools.roles[0] || rawExperiences[0]?.role || '';
  const totalYears = rawExperiences.reduce((sum, e) => {
    return sum + (e.startYear && e.endYear ? Math.max(1, e.endYear - e.startYear) : 1);
  }, 0);

  const summary =
    topRole && finalCity
      ? `${finalCity} lokasyonunda ${totalYears > 0 ? `${totalYears} yıllık ` : ''}${topRole} deneyimine sahip profesyonel profil.`
      : '';

  return {
    experiences: rawExperiences,
    roles: skillsAndTools.roles,
    sectors: skillsAndTools.sectors,
    skills: [
      ...new Set([...skillsAndTools.professionalSkills, ...skillsAndTools.technicalSkills]),
    ],
    tools: skillsAndTools.tools,
    education: rawEducation,
    languages: langAndCerts.languages,
    certificates: langAndCerts.certificates,
    locations: [finalCity, finalDistrict].filter(Boolean) as string[],
    summary,
    fullName: finalFullName,
    gender: universalDemo.gender,
    birthDate: universalDemo.birthDate,
    email: finalEmail,
    phone: finalPhone,
    linkedin: finalLinkedin,
    website: finalWebsite,
    nationality: universalDemo.nationality,
    address: universalDemo.address,
    ambiguousItems: [],
    unstructuredExperiences,
    unstructuredEducation,
    personalInfo: {
      fullName: finalFullName,
      city: finalCity,
      district: finalDistrict,
      email: finalEmail,
      phone: finalPhone,
      linkedin: finalLinkedin,
      website: finalWebsite,
      address: universalDemo.address,
      gender: universalDemo.gender,
      birthDate: universalDemo.birthDate,
      birthYear: universalDemo.birthYear,
      nationality: universalDemo.nationality,
      evidence: tokenPersonalInfo.evidence,
      confidence: tokenPersonalInfo.confidence,
    },
    fieldConfidenceScores,
    provenanceMap,
  };
}
