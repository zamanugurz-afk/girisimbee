import type { Repository } from '@/lib/domain/repository';
import type { VerificationId } from '@/lib/domain/ids';
import type {
  Verification,
  CreateVerificationInput,
  UpdateVerificationInput,
  VerificationFilter,
} from '@/features/authentication/types/verification.types';

export interface VerificationRepository
  extends Repository<Verification, VerificationId, CreateVerificationInput, UpdateVerificationInput, VerificationFilter> {
  findPendingByUserAndType(userId: Verification['userId'], type: Verification['type']): Promise<Verification | null>;
  transitionStatus(id: VerificationId, status: Verification['status']): Promise<Verification>;
}
