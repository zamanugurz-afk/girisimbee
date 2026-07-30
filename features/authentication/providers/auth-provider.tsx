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
  signInWithEmail,
  signOut as authSignOut,
  signUpWithEmail,
  requestPasswordReset,
  updatePassword,
  resendVerificationEmail,
} from '@/features/authentication/services/supabase-auth.service';
import { AUTH_ROUTES } from '@/features/authentication/constants/routes';

interface AuthContextValue extends AuthState {
  signIn: (input: SignInInput) => Promise<{ error: string | null }>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsVerification: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  setNewPassword: (password: string) => Promise<{ error: string | null }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const sessionUser = await fetchSessionUser(supabase);
    setUser(sessionUser);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const sessionUser = await fetchSessionUser(supabase);
        if (mounted) setUser(sessionUser);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const sessionUser = await fetchSessionUser(supabase);
      if (mounted) {
        setUser(sessionUser);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(async (input: SignInInput) => {
    const { error } = await signInWithEmail(supabase, input);
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

  const signOut = useCallback(async () => {
    await authSignOut(supabase);
    setUser(null);
    window.location.href = AUTH_ROUTES.login;
  }, [supabase]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await requestPasswordReset(supabase, email);
    return { error: error?.message ?? null };
  }, [supabase]);

  const setNewPassword = useCallback(async (password: string) => {
    const { error } = await updatePassword(supabase, password);
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
    signIn,
    signUp,
    signOut,
    resetPassword,
    setNewPassword,
    resendVerification,
    refresh,
  }), [user, isLoading, signIn, signUp, signOut, resetPassword, setNewPassword, resendVerification, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
