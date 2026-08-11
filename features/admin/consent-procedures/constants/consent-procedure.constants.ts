import type {
  ConsentProcedureCategory,
  ConsentProcedureOwner,
  ConsentProcedureStatus,
} from '@/features/admin/consent-procedures/types/consent-procedure.types';

export const CONSENT_PROCEDURE_CATEGORY_LABELS: Record<ConsentProcedureCategory, string> = {
  signup: 'Kayıt / hesap',
  publish: 'İlan yayın',
  job_seeker: 'İş arayan KVKK',
  cookie: 'Çerez',
  evidence: 'Kanıt / belge',
};

export const CONSENT_PROCEDURE_STATUS_LABELS: Record<ConsentProcedureStatus, string> = {
  active: 'Aktif',
  draft: 'Taslak',
  archived: 'Arşiv',
};

export const CONSENT_PROCEDURE_OWNER_LABELS: Record<ConsentProcedureOwner, string> = {
  super_admin: 'Süper yönetici',
  admin: 'Yönetici',
  legal: 'Hukuk / uyum',
};

export const CONSENT_PROCEDURE_CATEGORIES = Object.keys(
  CONSENT_PROCEDURE_CATEGORY_LABELS,
) as ConsentProcedureCategory[];
