/**
 * Verification — identity & trust verification records.
 *
 * Purpose: Prove user/company legitimacy (email, phone, identity, company).
 * Relations: belongs to User (optional Company for company verification).
 * Lifecycle: pending → in_review → approved | rejected → expired
 */
import type { Timestamps, SoftDeletable, IndexDefinition, ValidationRule } from '@/lib/domain/base';
import type { UserId, VerificationId, CompanyId } from '@/lib/domain/ids';

export type VerificationType =
  | 'email'
  | 'phone'
  | 'identity'
  | 'company'
  | 'investor_accreditation';

export type VerificationStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface Verification extends Timestamps, SoftDeletable {
  id: VerificationId;
  userId: UserId;
  companyId: CompanyId | null;
  type: VerificationType;
  status: VerificationStatus;
  documentUrls: string[];
  reviewerId: UserId | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown>;
}

export type CreateVerificationInput = Pick<Verification, 'userId' | 'type'> & {
  companyId?: CompanyId | null;
  documentUrls?: string[];
  metadata?: Record<string, unknown>;
};

export type UpdateVerificationInput = Partial<
  Pick<Verification, 'status' | 'reviewerId' | 'reviewedAt' | 'rejectionReason' | 'expiresAt' | 'documentUrls'>
>;

export interface VerificationFilter {
  userId?: UserId;
  companyId?: CompanyId;
  type?: VerificationType;
  status?: VerificationStatus | VerificationStatus[];
  includeDeleted?: boolean;
}

export const VERIFICATION_INDEXES: IndexDefinition[] = [
  { name: 'verifications_user_id_idx', columns: ['user_id'] },
  { name: 'verifications_company_id_idx', columns: ['company_id'], where: 'company_id IS NOT NULL' },
  { name: 'verifications_status_idx', columns: ['status'] },
  { name: 'verifications_type_status_idx', columns: ['type', 'status'] },
  { name: 'verifications_user_type_unique', columns: ['user_id', 'type'], unique: true, where: "type IN ('email','phone') AND deleted_at IS NULL" },
];

export const VERIFICATION_LIFECYCLE: Record<VerificationStatus, readonly VerificationStatus[]> = {
  pending: ['in_review', 'approved', 'rejected', 'expired'],
  in_review: ['approved', 'rejected'],
  approved: ['expired'],
  rejected: ['pending'],
  expired: ['pending'],
};

export const VERIFICATION_VALIDATION: ValidationRule[] = [
  { field: 'userId', rule: 'required|uuid', message: 'Kullanıcı gerekli.' },
  { field: 'type', rule: 'required|in:email,phone,identity,company,investor_accreditation', message: 'Geçersiz doğrulama tipi.' },
  { field: 'documentUrls', rule: 'array|max:10', message: 'En fazla 10 belge yüklenebilir.' },
];
