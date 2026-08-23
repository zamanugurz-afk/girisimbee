/**
 * GİRİŞİMBEE — DETERMINISTIC JOB MATCHING ENGINE
 * 
 * Computes multi-dimensional, explainable compatibility scores between
 * a Candidate's Canonical Career Profile and a Job Posting Requirement.
 * 
 * ZERO AI HALLUCINATION — Pure Deterministic Matching with Explainable Evidence.
 */

import type {
  MasterCareerProfile,
  JobPostingRequirement,
  JobMatchResult,
  DimensionMatchScore,
} from './canonical-career-contract';
import { normalizeTrUniversal } from '@/features/candidates/cv/cv-universal-normalizer';

const SENIORITY_LEVELS: Record<string, number> = {
  stajyer: 1,
  junior: 2,
  mid: 3,
  senior: 4,
  lead: 5,
  yonetici: 6,
  direktor: 7,
  c_level: 8,
};

const EDUCATION_LEVELS: Record<string, number> = {
  lise: 1,
  on_lisans: 2,
  onlisans: 2,
  lisans: 3,
  yuksek_lisans: 4,
  yukseklisans: 4,
  doktora: 5,
};

function normalizeToken(t?: string): string {
  return normalizeTrUniversal(t || '').trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Calculates deterministic match between a candidate profile and job requirements.
 */
export function calculateJobMatch(params: {
  candidateProfile: MasterCareerProfile;
  jobRequirement: JobPostingRequirement;
}): JobMatchResult {
  const { candidateProfile, jobRequirement } = params;
  const whyYouMatch: string[] = [];
  const missingQualifications: string[] = [];

  // 1. Role Match (Weight: 25%)
  const candRole = normalizeToken(candidateProfile.primaryRole.value);
  const reqRole = normalizeToken(jobRequirement.requiredRole);
  let roleScore = 0;
  let roleExplanation = '';

  if (candRole === reqRole && candRole.length > 0) {
    roleScore = 100;
    roleExplanation = `Pozisyonunuz "${candidateProfile.primaryRole.value}" ilandaki aranan rolle tam uyumlu.`;
    whyYouMatch.push(`İlanın aradığı "${jobRequirement.requiredRole}" rolü ana unvanınız ile birebir örtüşüyor.`);
  } else if (candRole.includes(reqRole) || reqRole.includes(candRole)) {
    roleScore = 75;
    roleExplanation = `Pozisyonunuz ilandaki role yakın benzerlik gösteriyor.`;
    whyYouMatch.push(`Mevcut rolünüz ("${candidateProfile.primaryRole.value}") aranan pozisyonla yüksek oranda ilişkili.`);
  } else {
    roleScore = 30;
    roleExplanation = `Pozisyonunuz ilanın temel unvanından farklılık gösteriyor.`;
    missingQualifications.push(`Aranan ana unvan "${jobRequirement.requiredRole}", profilinizdeki "${candidateProfile.primaryRole.value}" ile tam örtüşmüyor.`);
  }

  const roleDimension: DimensionMatchScore = {
    score: roleScore,
    weight: 0.25,
    matchedItems: roleScore >= 75 ? [jobRequirement.requiredRole] : [],
    missingItems: roleScore < 75 ? [jobRequirement.requiredRole] : [],
    explanation: roleExplanation,
  };

  // 2. Sector Match (Weight: 15%)
  const candSector = normalizeToken(candidateProfile.primarySector.value);
  const reqSector = normalizeToken(jobRequirement.sector);
  let sectorScore = 0;
  let sectorExplanation = '';

  if (candSector === reqSector && candSector.length > 0) {
    sectorScore = 100;
    sectorExplanation = `Sektör tecrübeniz (${candidateProfile.primarySector.value}) ilanla tam uyumlu.`;
    whyYouMatch.push(`Sektör deneyiminiz (${candidateProfile.primarySector.value}) ilanın sektörel gereksinimini karşılıyor.`);
  } else if (candSector.includes(reqSector) || reqSector.includes(candSector)) {
    sectorScore = 60;
    sectorExplanation = `Sektörler benzerlik taşımaktadır.`;
  } else {
    sectorScore = 20;
    sectorExplanation = `İlanın faaliyet sektörü ile profil sektörünüz farklı.`;
  }

  const sectorDimension: DimensionMatchScore = {
    score: sectorScore,
    weight: 0.15,
    matchedItems: sectorScore >= 60 ? [jobRequirement.sector] : [],
    missingItems: sectorScore < 60 ? [jobRequirement.sector] : [],
    explanation: sectorExplanation,
  };

  // 3. Skills Match (Weight: 25%)
  const candSkills = [
    ...(candidateProfile.skills.value || []),
    ...(candidateProfile.tools.value || []),
  ].map(normalizeToken);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const reqSkill of jobRequirement.requiredSkills) {
    const normReq = normalizeToken(reqSkill);
    if (candSkills.some((cs) => cs === normReq || cs.includes(normReq) || normReq.includes(cs))) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  const totalReq = jobRequirement.requiredSkills.length || 1;
  const skillsScore = Math.round((matchedSkills.length / totalReq) * 100);

  if (matchedSkills.length > 0) {
    whyYouMatch.push(`İlanda aranan ${matchedSkills.length} temel yetkinliğe sahipsiniz: ${matchedSkills.join(', ')}.`);
  }
  if (missingSkills.length > 0) {
    missingQualifications.push(`İlanda aranan şu yetkinlikler profilinizde eksik: ${missingSkills.join(', ')}.`);
  }

  const skillsDimension: DimensionMatchScore = {
    score: skillsScore,
    weight: 0.25,
    matchedItems: matchedSkills,
    missingItems: missingSkills,
    explanation: `${totalReq} temel yetkinlikten ${matchedSkills.length} tanesi eşleşti (%${skillsScore}).`,
  };

  // 4. Experience & Seniority Match (Weight: 15%)
  const candSeniority = normalizeToken(candidateProfile.experienceLevel.value);
  const reqSeniority = normalizeToken(jobRequirement.requiredSeniority);
  const candRank = SENIORITY_LEVELS[candSeniority] || 3;
  const reqRank = SENIORITY_LEVELS[reqSeniority] || 3;

  let expScore = 100;
  if (candRank >= reqRank) {
    expScore = 100;
    whyYouMatch.push(`Kıdem seviyeniz (${candidateProfile.experienceLevel.value}) ilanın beklentisini karşılıyor.`);
  } else if (candRank === reqRank - 1) {
    expScore = 70;
  } else {
    expScore = 40;
    missingQualifications.push(`İlan ${jobRequirement.requiredSeniority} seviyesinde deneyim bekliyor.`);
  }

  const experienceDimension: DimensionMatchScore = {
    score: expScore,
    weight: 0.15,
    matchedItems: [candidateProfile.experienceLevel.value],
    missingItems: candRank < reqRank ? [jobRequirement.requiredSeniority] : [],
    explanation: `Kıdem seviyesi uyumu: %${expScore}`,
  };

  // 5. Education Match (Weight: 10%)
  let eduScore = 100;
  const highestEdu = candidateProfile.educationList[0];
  const candEduRank = highestEdu ? (EDUCATION_LEVELS[normalizeToken(highestEdu.level)] || 3) : 1;
  const reqEduRank = jobRequirement.requiredEducationLevel
    ? (EDUCATION_LEVELS[normalizeToken(jobRequirement.requiredEducationLevel)] || 3)
    : 1;

  if (candEduRank >= reqEduRank) {
    eduScore = 100;
  } else {
    eduScore = 50;
    missingQualifications.push(`İlan asgari ${jobRequirement.requiredEducationLevel || 'Lisans'} eğitimi gerektiriyor.`);
  }

  const educationDimension: DimensionMatchScore = {
    score: eduScore,
    weight: 0.10,
    matchedItems: highestEdu ? [highestEdu.school || highestEdu.level] : [],
    missingItems: candEduRank < reqEduRank ? [jobRequirement.requiredEducationLevel || ''] : [],
    explanation: `Eğitim seviyesi uyumu: %${eduScore}`,
  };

  // 6. Location & Work Model Match (Weight: 10%)
  const candCity = normalizeToken(candidateProfile.residenceCity.value);
  const reqCity = normalizeToken(jobRequirement.location.city);
  let locScore = 0;

  if (jobRequirement.workplacePreference.toLowerCase().includes('uzaktan') || jobRequirement.workplacePreference.toLowerCase().includes('remote')) {
    locScore = 100;
    whyYouMatch.push('İlan uzaktan çalışmayı destekliyor.');
  } else if (candCity === reqCity && candCity.length > 0) {
    locScore = 100;
    whyYouMatch.push(`İkamet konumunuz (${candidateProfile.residenceCity.value}) iş yeri ile aynı şehirde.`);
  } else {
    locScore = 50; // Different city, soft penalty
  }

  const locationDimension: DimensionMatchScore = {
    score: locScore,
    weight: 0.10,
    matchedItems: locScore >= 100 ? [jobRequirement.location.city] : [],
    missingItems: locScore < 100 ? [jobRequirement.location.city] : [],
    explanation: `Konum ve çalışma modeli uyumu: %${locScore}`,
  };

  // Weighted Sum Calculation
  const overall = Math.round(
    roleScore * 0.25 +
    sectorScore * 0.15 +
    skillsScore * 0.25 +
    expScore * 0.15 +
    eduScore * 0.10 +
    locScore * 0.10,
  );

  return {
    jobId: jobRequirement.id,
    userId: candidateProfile.userId,
    overallScore: Math.max(0, Math.min(100, overall)),
    isRecommended: overall >= 65,
    dimensions: {
      role: roleDimension,
      sector: sectorDimension,
      skills: skillsDimension,
      experience: experienceDimension,
      education: educationDimension,
      location: locationDimension,
    },
    whyYouMatch,
    missingQualifications,
    calculatedAt: new Date().toISOString(),
  };
}
