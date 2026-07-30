// Feature: authentication — Supabase Auth + RBAC
export type {
  UserRole,
  StoredUserRole,
  UserProfile,
  SessionUser,
  AuthState,
  SignUpInput,
  SignInInput,
  ResetPasswordInput,
  UpdatePasswordInput,
} from '@/features/authentication/types/auth.types';

// Domain types (persistence layer — not runtime auth roles)
export type {
  User,
  DomainUserRole,
  UserStatus,
  CreateUserInput,
  UpdateUserInput,
  UserFilter,
} from '@/features/authentication/types/user.types';
export type {
  Verification,
  VerificationType,
  VerificationStatus,
} from '@/features/authentication/types/verification.types';

export {
  AUTH_ROUTES,
  isPublicRoute,
  isProtectedRoute,
  isGuestOnlyRoute,
  loginUrl,
} from '@/features/authentication/constants/routes';

export {
  ROLE_LEVEL,
  ROLE_LABELS,
  STORED_ROLES,
  hasMinimumRole,
  hasAnyRole,
  isStoredRole,
} from '@/features/authentication/constants/roles';

export {
  canAccessRoute,
  requireRole,
  requireAnyRole,
} from '@/features/authentication/lib/authorization';

export {
  fetchSessionUser,
  fetchProfile,
  mapSessionUser,
  signUpWithEmail,
  signInWithEmail,
  signOut,
  requestPasswordReset,
  updatePassword,
  resendVerificationEmail,
} from '@/features/authentication/services/supabase-auth.service';

export type {
  IUserService,
  IAuthService,
  IVerificationService,
  AuthCredentials,
  AuthSession,
} from '@/features/authentication/services/auth.service.interface';

export { AuthProvider } from '@/features/authentication/providers/auth-provider';
export {
  useAuth,
  useSession,
  useUser,
  useRole,
  useAuthorization,
  useRequireAuth,
} from '@/features/authentication/hooks/use-auth';

export { AuthLayout, AuthLink } from '@/features/authentication/components/auth-layout';
export { LoginForm } from '@/features/authentication/components/login-form';
export { RegisterForm } from '@/features/authentication/components/register-form';
export { ForgotPasswordForm } from '@/features/authentication/components/forgot-password-form';
export { ResetPasswordForm } from '@/features/authentication/components/reset-password-form';
export { VerifyEmailPanel } from '@/features/authentication/components/verify-email-panel';
export { AuthMenu } from '@/features/authentication/components/auth-menu';
export { MobileAuthLinks } from '@/features/authentication/components/mobile-auth-links';

export {
  registerSchema,
  forgotPasswordSchema,
  newPasswordSchema,
} from '@/features/authentication/validation/auth.schema';
export { loginSchema } from '@/features/authentication/validation/user.schema';

export { getServerSession } from '@/features/authentication/lib/get-session';

export { createUser, createUserInput } from '@/features/authentication/factories/user.factory';
export { generateMockUser, generateMockUsers } from '@/features/authentication/mock/user.generator';
