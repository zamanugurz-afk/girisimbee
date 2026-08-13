import { findCareerTextQualityIssue } from '@/features/candidates/lib/career-text-quality';
import {
  isManualCareerOption,
  joinSelectedList,
  MANUAL_OPTION,
  MANUAL_OPTION_SHORT,
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
      maxLength: 1000,
      required: false,
    });
    if (issue) errors.leadershipExperience = issue;
  }

  const tools = String(customFields.tools ?? '');
  if (tools.trim()) {
    const issue = findCareerTextQualityIssue(tools, {
      fieldLabel: 'Araçlar',
      minLength: 2,
      maxLength: 500,
      required: false,
    });
    if (issue) errors.tools = issue;
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

  return {
    ...customFields,
    professionalSkills: joinSelectedList(professional),
    technicalSkills: joinSelectedList(technical),
  };
}

export function validateCareerEducationStep(
  customFields: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const educationField = String(customFields.educationField ?? '').trim();
  const educationFieldOther = String(customFields.educationFieldOther ?? '').trim();

  if (isManualCareerOption(educationField)) {
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
  const educationFieldRaw = String(customFields.educationField ?? '').trim();
  const educationField =
    isManualCareerOption(educationFieldRaw)
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
