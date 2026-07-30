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
    signIn: ctx.signIn,
    signUp: ctx.signUp,
    signOut: ctx.signOut,
    resetPassword: ctx.resetPassword,
    setNewPassword: ctx.setNewPassword,
    resendVerification: ctx.resendVerification,
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
