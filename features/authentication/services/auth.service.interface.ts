import type { UserId } from '@/lib/domain/ids';
import type { User, CreateUserInput, UpdateUserInput } from '@/features/authentication/types/user.types';
import type { PaginatedResult, PaginationParams } from '@/lib/domain/pagination';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  userId: UserId;
  token: string;
  expiresAt: string;
}

export interface IUserService {
  register(input: CreateUserInput): Promise<User>;
  getById(id: UserId): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  update(id: UserId, input: UpdateUserInput): Promise<User>;
  suspend(id: UserId, reason?: string): Promise<User>;
  activate(id: UserId): Promise<User>;
  deactivate(id: UserId): Promise<User>;
  delete(id: UserId): Promise<void>;
}

export interface IAuthService {
  login(credentials: AuthCredentials): Promise<AuthSession>;
  logout(sessionToken: string): Promise<void>;
  validateSession(sessionToken: string): Promise<User | null>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<User>;
}

export interface IVerificationService {
  requestVerification(
    userId: UserId,
    type: string,
    companyId?: import('@/lib/domain/ids').CompanyId | null,
  ): Promise<import('@/features/authentication/types/verification.types').Verification>;
  submitDocuments(verificationId: string, documentUrls: string[]): Promise<void>;
  approve(verificationId: string, reviewerId: UserId): Promise<void>;
  reject(verificationId: string, reviewerId: UserId, reason: string): Promise<void>;
  listPending(pagination?: PaginationParams): Promise<PaginatedResult<import('@/features/authentication/types/verification.types').Verification>>;
  listByUser(userId: UserId): Promise<import('@/features/authentication/types/verification.types').Verification[]>;
}
