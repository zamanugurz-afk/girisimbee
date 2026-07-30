import { ConflictError, ForbiddenError, NotFoundError } from '@/lib/domain/errors';
import { now } from '@/lib/domain/factory';
import type { UserId, VerificationId, CompanyId } from '@/lib/domain/ids';
import type { Verification, VerificationType } from '@/features/authentication/types/verification.types';
import type { VerificationRepository } from '@/features/authentication/repositories/verification.repository';
import type { ProfileRepository } from '@/features/profiles/repositories/profile.repository';
import type { CompanyRepository } from '@/features/companies/repositories/company.repository';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';
import type { IVerificationService } from '@/features/authentication/services/auth.service.interface';

const TRUST_TYPES: VerificationType[] = ['identity', 'company', 'investor_accreditation'];

const VERIFICATION_VALIDITY_DAYS = 365;

function computeExpiry(): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + VERIFICATION_VALIDITY_DAYS);
  return expiry.toISOString();
}

export class VerificationService implements IVerificationService {
  constructor(
    private verificationRepo: VerificationRepository,
    private profileRepo: ProfileRepository,
    private companyRepo: CompanyRepository,
  ) {}

  async requestVerification(
    userId: UserId,
    type: string,
    companyId?: CompanyId | null,
  ): Promise<Verification> {
    const verificationType = type as VerificationType;
    if (!TRUST_TYPES.includes(verificationType)) {
      throw new ForbiddenError('Geçersiz doğrulama türü.');
    }

    if (verificationType === 'company' && !companyId) {
      throw new ForbiddenError('Şirket doğrulaması için şirket seçilmelidir.');
    }

    const pending = await this.verificationRepo.findPendingByUserAndType(userId, verificationType);
    if (pending) {
      throw new ConflictError('Bu tür için zaten bekleyen bir doğrulama talebiniz var.');
    }

    return this.verificationRepo.create({
      userId,
      type: verificationType,
      companyId: companyId ?? null,
      documentUrls: [],
    });
  }

  async submitDocuments(verificationId: string, documentUrls: string[]): Promise<void> {
    const id = verificationId as VerificationId;
    const verification = await this.verificationRepo.findById(id);
    if (!verification) throw new NotFoundError('Verification', id);

    if (verification.status !== 'pending' && verification.status !== 'rejected') {
      throw new ForbiddenError('Bu doğrulama talebine belge eklenemez.');
    }

    if (!documentUrls.length) {
      throw new ForbiddenError('En az bir belge yüklemelisiniz.');
    }

    await this.verificationRepo.update(id, {
      documentUrls,
      ...(verification.status === 'rejected' ? { status: 'pending', rejectionReason: null } : {}),
    });
  }

  async approve(verificationId: string, reviewerId: UserId): Promise<void> {
    const id = verificationId as VerificationId;
    const verification = await this.verificationRepo.findById(id);
    if (!verification) throw new NotFoundError('Verification', id);

    await this.verificationRepo.transitionStatus(id, 'approved');
    await this.verificationRepo.update(id, {
      reviewerId,
      reviewedAt: now(),
      expiresAt: computeExpiry(),
      rejectionReason: null,
    });

    await this.applyApprovalSideEffects(verification);
  }

  async reject(verificationId: string, reviewerId: UserId, reason: string): Promise<void> {
    const id = verificationId as VerificationId;
    const verification = await this.verificationRepo.findById(id);
    if (!verification) throw new NotFoundError('Verification', id);

    await this.verificationRepo.transitionStatus(id, 'rejected');
    await this.verificationRepo.update(id, {
      reviewerId,
      reviewedAt: now(),
      rejectionReason: reason,
    });
  }

  listPending(pagination?: PaginationParams): Promise<PaginatedResult<Verification>> {
    return this.verificationRepo.paginate({ status: ['pending', 'in_review'] }, pagination);
  }

  listByUser(userId: UserId): Promise<Verification[]> {
    return this.verificationRepo.findMany({ userId }, { page: 1, limit: 50 }).then((r) => r.data);
  }

  private async applyApprovalSideEffects(verification: Verification): Promise<void> {
    if (verification.type === 'identity') {
      const profile = await this.profileRepo.findByUserId(verification.userId);
      if (profile) await this.profileRepo.update(profile.id, { isVerified: true });
    } else if (verification.type === 'investor_accreditation') {
      const profile = await this.profileRepo.findByUserId(verification.userId);
      if (profile) await this.profileRepo.update(profile.id, { investorVerified: true });
    } else if (verification.type === 'company' && verification.companyId) {
      await this.companyRepo.update(verification.companyId, { isVerified: true });
    }
  }
}

export type { IVerificationService };
