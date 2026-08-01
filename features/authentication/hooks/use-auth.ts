'use client';

import { useAuthContext } from '@/features/authentication/providers/auth-provider';
import type { SessionUser, UserRole } from '@/features/authentication/types/auth.types';
import { hasMinimumRole, hasAnyRole } from '@/features/authentication/constants/roles';
import { canAccessRoute } from '@/features/authentication/lib/authorization';

export function useAuth() {
  const ctx = useAuthContext();
  return {
    user: ctx.user,
    isLoading: ctx.isLoading,
    isAuthenticated: ctx.isAuthenticated,
    login: ctx.login,
    logout: ctx.logout,
    forgotPassword: ctx.forgotPassword,
    resetPassword: ctx.resetPassword,
    refreshSession: ctx.refreshSession,
    signUp: ctx.signUp,
    resendVerification: ctx.resendVerification,
    /** @deprecated Prefer login() */
    signIn: ctx.signIn,
    /** @deprecated Prefer logout() */
    signOut: ctx.signOut,
    /** @deprecated Prefer forgotPassword() */
    requestPasswordReset: ctx.requestPasswordReset,
    /** @deprecated Prefer resetPassword() */
    setNewPassword: ctx.setNewPassword,
    /** @deprecated Prefer refreshSession() */
    refresh: ctx.refresh,
  };
}

export function useSession() {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isAuthenticated };
}

export function useUser(): SessionUser | null {
  return useAuth().user;
}

export function useRole(): UserRole {
  const user = useUser();
  return user?.role ?? 'guest';
}

export function useAuthorization() {
  const role = useRole();

  return {
    role,
    isGuest: role === 'guest',
    isMember: hasMinimumRole(role, 'member'),
    isVerified: hasMinimumRole(role, 'verified'),
    isCompany: hasMinimumRole(role, 'company'),
    isModerator: hasMinimumRole(role, 'moderator'),
    isAdmin: role === 'admin',
    hasMinimumRole: (minimum: UserRole) => hasMinimumRole(role, minimum),
    hasAnyRole: (allowed: UserRole[]) => hasAnyRole(role, allowed),
    canAccessRoute: (pathname: string) => canAccessRoute(role, pathname),
  };
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isAuthenticated, isReady: !isLoading };
}
