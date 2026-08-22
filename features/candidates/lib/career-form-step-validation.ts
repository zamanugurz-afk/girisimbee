import { findCareerTextQualityIssue } from '@/features/candidates/lib/career-text-quality';
import {
  isManualCareerOption,
  joinSelectedList,
  MANUAL_OPTION,
  MANUAL_OPTION_SHORT,
  needsEducationField,
  parseCareerLanguages,
  parseSelectedList,
  serializeCareerLanguages,
  type CareerLanguageEntry,
} from '@/features/candidates/taxonomy/career-taxonomy';

export function validateCareerManualOther(
  parentValue: unknown,
  otherValue: unknown,
  fieldLabel: string,
): string | null {
  if (!isManualCareerOption(parentValue)) return null;
  return findCareerTextQualityIssue(String(otherValue ?? ''), {
    fieldLabel,
    minLength: 2,
    maxLength: 200,
    required: true,
  });
}

export function validateCareerSkillsStep(customFields: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  const professional = parseSelectedList(customFields.professionalSkills);
  const professionalOther = String(customFields.professionalSkillsOther ?? '').trim();
  const hasManualPro = professional.includes(MANUAL_OPTION);

  if (professional.filter((p) => p !== MANUAL_OPTION).length === 0 && !hasManualPro) {
    errors.professionalSkills = 'En az bir mesleki yetkinlik seçin.';
  }
  if (hasManualPro) {
    const issue = findCareerTextQualityIssue(professionalOther, {
      fieldLabel: 'Mesleki yetkinlik (diğer)',
      minLength: 2,
      maxLength: 200,
      required: true,
    });
    if (issue) errors.professionalSkillsOther = issue;
  }

  const technical = parseSelectedList(customFields.technicalSkills);
  const technicalOther = String(customFields.technicalSkillsOther ?? '').trim();
  if (technical.includes(MANUAL_OPTION)) {
    const issue = findCareerTextQualityIssue(technicalOther, {
      fieldLabel: 'Teknik yetkinlik (diğer)',
      minLength: 2,
      maxLength: 200,
      required: true,
    });
    if (issue) errors.technicalSkillsOther = issue;
  }

  const leadership = String(customFields.leadershipExperience ?? '');
  if (leadership.trim()) {
    const issue = findCareerTextQualityIssue(leadership, {
      fieldLabel: 'Yönetim / liderlik deneyimi',
      minLength: 10,
      maxLength: 4000,
      required: false,
    });
    if (issue) errors.leadershipExperience = issue;
  }

  const selectedTools = parseSelectedList(customFields.tools);
  if (selectedTools.includes(MANUAL_OPTION)) {
    const toolsOther = String(customFields.toolsOther ?? '').trim();
    const issue = findCareerTextQualityIssue(toolsOther, {
      fieldLabel: 'Araç (diğer)',
      minLength: 2,
      maxLength: 200,
      required: true,
    });
    if (issue) errors.toolsOther = issue;
  }

  return errors;
}

/** Merge selected + other into display strings before persist/publish. */
export function materializeCareerSkillsFields(
  customFields: Record<string, unknown>,
): Record<string, unknown> {
  const professional = parseSelectedList(customFields.professionalSkills).filter(
    (p) => p !== MANUAL_OPTION,
  );
  const professionalOther = String(customFields.professionalSkillsOther ?? '').trim();
  if (professionalOther) professional.push(professionalOther);

  const technical = parseSelectedList(customFields.technicalSkills).filter(
    (p) => p !== MANUAL_OPTION,
  );
  const technicalOther = String(customFields.technicalSkillsOther ?? '').trim();
  if (technicalOther) technical.push(technicalOther);

  const tools = parseSelectedList(customFields.tools).filter((item) => item !== MANUAL_OPTION);
  const toolsOther = String(customFields.toolsOther ?? '').trim();
  if (toolsOther) tools.push(toolsOther);

  return {
    ...customFields,
    professionalSkills: joinSelectedList(professional),
    technicalSkills: joinSelectedList(technical),
    tools: joinSelectedList(tools),
  };
}

export function validateCareerEducationStep(
  customFields: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const educationLevel = String(customFields.educationLevel ?? '').trim();
  const educationField = String(customFields.educationField ?? '').trim();
  const educationFieldOther = String(customFields.educationFieldOther ?? '').trim();

  if (needsEducationField(educationLevel) && isManualCareerOption(educationField)) {
    const issue = findCareerTextQualityIssue(educationFieldOther, {
      fieldLabel: 'Bölüm / alan',
      minLength: 2,
      maxLength: 200,
      required: true,
    });
    if (issue) errors.educationField = issue;
  }

  const certs = parseSelectedList(customFields.certificates);
  const certsOther = String(customFields.certificatesOther ?? '').trim();
  if (certs.includes(MANUAL_OPTION)) {
    const issue = findCareerTextQualityIssue(certsOther, {
      fieldLabel: 'Sertifika',
      minLength: 2,
      maxLength: 200,
      required: true,
    });
    if (issue) errors.certificates = issue;
  }

  const languageEntries = parseCareerLanguages(
    customFields.languageEntries ?? customFields.languages,
  );
  for (let i = 0; i < languageEntries.length; i += 1) {
    const entry = languageEntries[i]!;
    if (!entry.language && !entry.level) continue;
    if (!entry.language) {
      errors.languages = `${i + 1}. dil seçilmelidir.`;
      break;
    }
    if (
      (entry.language === MANUAL_OPTION_SHORT || entry.language === MANUAL_OPTION) &&
      !entry.languageOther?.trim()
    ) {
      errors.languages = `${i + 1}. dil adı yazılmalıdır.`;
      break;
    }
    if (entry.languageOther?.trim()) {
      const issue = findCareerTextQualityIssue(entry.languageOther, {
        fieldLabel: 'Dil adı',
        minLength: 2,
        maxLength: 80,
        required: true,
      });
      if (issue) {
        errors.languages = issue;
        break;
      }
    }
    if (!entry.level) {
      errors.languages = `${i + 1}. dil seviyesi seçilmelidir.`;
      break;
    }
  }

  return errors;
}

export function materializeCareerEducationFields(
  customFields: Record<string, unknown>,
): Record<string, unknown> {
  const educationLevel = String(customFields.educationLevel ?? '').trim();
  const educationFieldRaw = String(customFields.educationField ?? '').trim();
  const educationField = !needsEducationField(educationLevel)
    ? ''
    : isManualCareerOption(educationFieldRaw)
      ? String(customFields.educationFieldOther ?? '').trim()
      : educationFieldRaw;

  const certs = parseSelectedList(customFields.certificates).filter((c) => c !== MANUAL_OPTION);
  const certsOther = String(customFields.certificatesOther ?? '').trim();
  if (certsOther) certs.push(certsOther);

  const languageEntries = parseCareerLanguages(
    customFields.languageEntries ?? customFields.languages,
  ) as CareerLanguageEntry[];
  const languages = serializeCareerLanguages(languageEntries);

  return {
    ...customFields,
    educationField,
    certificates: joinSelectedList(certs),
    languages,
    languageEntries,
  };
}

export function validateHireRoleNeedsStep(
  customFields: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const selected = parseSelectedList(customFields.requiredResponsibilities);
  const other = String(customFields.requiredResponsibilitiesOther ?? '').trim();
  const hasManual = selected.includes(MANUAL_OPTION);
  if (selected.filter((item) => item !== MANUAL_OPTION).length === 0 && !hasManual) {
    errors.requiredResponsibilities = 'En az bir temel sorumluluk seçin.';
  }
  if (hasManual) {
    const issue = findCareerTextQualityIssue(other, {
      fieldLabel: 'Temel sorumluluklar',
      minLength: 10,
      maxLength: 400,
      required: true,
    });
    if (issue) errors.requiredResponsibilitiesOther = issue;
  }
  const ach = parseSelectedList(customFields.requiredAchievements);
  const achOther = String(customFields.requiredAchievementsOther ?? '').trim();
  if (ach.includes(MANUAL_OPTION)) {
    const issue = findCareerTextQualityIssue(achOther, {
      fieldLabel: 'Başarı beklentisi',
      minLength: 8,
      maxLength: 400,
      required: true,
    });
    if (issue) errors.requiredAchievementsOther = issue;
  }
  return errors;
}

export function materializeHireRoleNeedsFields(
  customFields: Record<string, unknown>,
): Record<string, unknown> {
  const responsibilities = parseSelectedList(customFields.requiredResponsibilities).filter(
    (item) => item !== MANUAL_OPTION,
  );
  const responsibilitiesOther = String(customFields.requiredResponsibilitiesOther ?? '').trim();
  if (responsibilitiesOther) responsibilities.push(responsibilitiesOther);

  const achievements = parseSelectedList(customFields.requiredAchievements).filter(
    (item) => item !== MANUAL_OPTION,
  );
  const achievementsOther = String(customFields.requiredAchievementsOther ?? '').trim();
  if (achievementsOther) achievements.push(achievementsOther);

  const role = isManualCareerOption(customFields.desiredRole)
    ? String(customFields.desiredRoleOther ?? '').trim()
    : String(customFields.desiredRole ?? '').trim();

  return {
    ...customFields,
    requiredResponsibilities: joinSelectedList(responsibilities),
    requiredAchievements: joinSelectedList(achievements),
    positionTitle: role || String(customFields.positionTitle ?? '').trim(),
    positionTitleOther: isManualCareerOption(customFields.desiredRole)
      ? String(customFields.desiredRoleOther ?? '')
      : customFields.positionTitleOther,
    district: String(customFields.preferredDistrict ?? customFields.district ?? '').trim(),
  };
}

export function validateCareerPreferencesStep(
  customFields: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const sectors = parseSelectedList(customFields.preferredSectors);
  const hasManualSector = sectors.some((item) => isManualCareerOption(item));
  if (sectors.filter((item) => !isManualCareerOption(item)).length === 0 && !hasManualSector) {
    errors.preferredSectors = 'En az bir sektör seçin.';
  }
  if (hasManualSector) {
    const issue = findCareerTextQualityIssue(String(customFields.sectorOther ?? ''), {
      fieldLabel: 'Sektör (diğer)',
      minLength: 2,
      maxLength: 200,
      required: true,
    });
    if (issue) errors.sectorOther = issue;
  }

  const roles = parseSelectedList(customFields.preferredRoles);
  if (roles.some((item) => isManualCareerOption(item))) {
    const issue = findCareerTextQualityIssue(String(customFields.preferredRolesOther ?? ''), {
      fieldLabel: 'Pozisyon (diğer)',
      minLength: 2,
      maxLength: 200,
      required: true,
    });
    if (issue) errors.preferredRolesOther = issue;
  }

  return errors;
}
