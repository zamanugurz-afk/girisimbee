'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AuthState, SessionUser, SignInInput, SignUpInput } from '@/features/authentication/types/auth.types';
import {
  fetchSessionUser,
  fetchProfile,
  mapSessionUser,
  login as authLogin,
  logout as authLogout,
  signUpWithEmail,
  forgotPassword as authForgotPassword,
  resetPassword as authResetPassword,
  refreshSession as authRefreshSession,
  resendVerificationEmail,
} from '@/features/authentication/services/supabase-auth.service';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

interface AuthContextValue extends AuthState {
  login: (input: SignInInput) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (password: string) => Promise<{ error: string | null }>;
  refreshSession: () => Promise<{ error: string | null }>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsVerification: boolean }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
  /** @deprecated Prefer login() */
  signIn: (input: SignInInput) => Promise<{ error: string | null }>;
  /** @deprecated Prefer logout() */
  signOut: () => Promise<void>;
  /** @deprecated Prefer forgotPassword() */
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  /** @deprecated Prefer resetPassword() */
  setNewPassword: (password: string) => Promise<{ error: string | null }>;
  /** @deprecated Prefer refreshSession() */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const { user: sessionUser, error } = await authRefreshSession(supabase);
    if (!error) {
      setUser(sessionUser);
    }
    return { error };
  }, [supabase]);

  const refresh = useCallback(async () => {
    const sessionUser = await fetchSessionUser(supabase);
    setUser(sessionUser);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function applySession(session: { user: { id: string; email?: string; email_confirmed_at?: string | null } } | null) {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const profile = await fetchProfile(supabase, session.user.id);
      if (!mounted) return;

      setUser(
        mapSessionUser(
          {
            id: session.user.id,
            email: session.user.email,
            email_confirmed_at: session.user.email_confirmed_at,
          },
          profile,
        ),
      );
      setIsLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Token refresh does not change profile data — skip redundant profile fetch.
      if (event === 'TOKEN_REFRESHED') {
        setIsLoading(false);
        return;
      }

      await applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = useCallback(async (input: SignInInput) => {
    const { error } = await authLogin(supabase, input);
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }, [supabase, refresh]);

  const signUp = useCallback(async (input: SignUpInput) => {
    const { data, error } = await signUpWithEmail(supabase, input);
    if (error) return { error: error.message, needsVerification: false };
    const needsVerification = !data.session;
    if (data.session) await refresh();
    return { error: null, needsVerification };
  }, [supabase, refresh]);

  const logout = useCallback(async () => {
    await authLogout(supabase);
    setUser(null);
    window.location.href = AUTH_ROUTES.login;
  }, [supabase]);

  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await authForgotPassword(supabase, email);
    return { error: error?.message ?? null };
  }, [supabase]);

  const resetPassword = useCallback(async (password: string) => {
    const { error } = await authResetPassword(supabase, password);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  }, [supabase, refresh]);

  const resendVerification = useCallback(async (email: string) => {
    const { error } = await resendVerificationEmail(supabase, email);
    return { error: error?.message ?? null };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    forgotPassword,
    resetPassword,
    refreshSession,
    signUp,
    resendVerification,
    signIn: login,
    signOut: logout,
    requestPasswordReset: forgotPassword,
    setNewPassword: resetPassword,
    refresh,
  }), [
    user,
    isLoading,
    login,
    logout,
    forgotPassword,
    resetPassword,
    refreshSession,
    signUp,
    resendVerification,
    refresh,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
