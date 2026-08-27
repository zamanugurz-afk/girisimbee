'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { normalizeAppRole, roleRank } from '@/features/authorization/roles';
import { roleTrace } from '@/features/authorization/lib/role-trace';

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

function preferHigherRole(prev: SessionUser | null, next: SessionUser): SessionUser {
  if (!prev || prev.id !== next.id) {
    roleTrace('preferHigherRole:takeNext', {
      prevRole: prev?.role ?? null,
      nextRole: next.role,
      nextRaw: next.rawRole,
    });
    return next;
  }
  const prevRank = roleRank(prev.role === 'guest' ? 'guest' : normalizeAppRole(prev.role));
  const nextRank = roleRank(next.role === 'guest' ? 'guest' : normalizeAppRole(next.role));
  // Transient profile miss must not downgrade admin / super_admin → user in the header.
  if (prevRank > nextRank && next.role === 'user' && !next.rawRole) {
    roleTrace('preferHigherRole:keepPrev (block downgrade)', {
      prevRole: prev.role,
      nextRole: next.role,
    });
    return {
      ...next,
      role: prev.role,
      rawRole: prev.rawRole ?? prev.role,
    };
  }
  // Never let a later event demote super_admin → user/member.
  if (prev.role === 'super_admin' && next.role !== 'super_admin') {
    roleTrace('preferHigherRole:keepSuperAdmin', {
      prevRole: prev.role,
      nextRole: next.role,
      nextRaw: next.rawRole,
    });
    return {
      ...next,
      role: 'super_admin',
      rawRole: prev.rawRole ?? 'super_admin',
    };
  }
  roleTrace('preferHigherRole:takeNext', {
    prevRole: prev.role,
    nextRole: next.role,
    nextRaw: next.rawRole,
  });
  return next;
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  /** Server-resolved session — keeps header role in sync with dashboard SSR. */
  initialUser?: SessionUser | null;
}) {
  // Lazy: never call createBrowserClient during SSR / static prerender.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const getSupabase = useCallback(() => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }, []);

  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    roleTrace('AuthProvider:initialUser', {
      role: initialUser?.role ?? null,
      rawRole: initialUser?.rawRole ?? null,
      email: initialUser?.email ?? null,
    });
  }, [initialUser]);

  useEffect(() => {
    roleTrace('AuthProvider:userState', {
      role: user?.role ?? null,
      rawRole: user?.rawRole ?? null,
      email: user?.email ?? null,
      isLoading,
    });
  }, [user, isLoading]);

  const refreshSession = useCallback(async () => {
    const supabase = getSupabase();
    const { user: sessionUser, error } = await authRefreshSession(supabase);
    if (!error && sessionUser) {
      setUser((prev) => preferHigherRole(prev, sessionUser));
    } else if (!error) {
      setUser(null);
    }
    return { error };
  }, [getSupabase]);

  const refresh = useCallback(async () => {
    const supabase = getSupabase();
    const sessionUser = await fetchSessionUser(supabase);
    if (sessionUser) {
      setUser((prev) => preferHigherRole(prev, sessionUser));
    } else {
      setUser(null);
    }
  }, [getSupabase]);

  useEffect(() => {
    let mounted = true;
    const hadInitialUser = Boolean(initialUser);
    const supabase = getSupabase();

    async function applySession(
      session: {
        user: {
          id: string;
          email?: string;
          email_confirmed_at?: string | null;
          app_metadata?: Record<string, unknown>;
        };
      } | null,
      options?: { skipIfSameUser?: boolean },
    ) {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Avoid duplicate profiles round-trips when SSR already hydrated the same user.
      if (
        options?.skipIfSameUser
        && userRef.current?.id
        && userRef.current.id === session.user.id
      ) {
        const confirmed = Boolean(session.user.email_confirmed_at);
        const email = session.user.email ?? userRef.current.email;
        if (
          confirmed !== userRef.current.emailVerified
          || (email && email !== userRef.current.email)
        ) {
          setUser((prev) =>
            prev
              ? { ...prev, emailVerified: confirmed, email: email || prev.email }
              : prev,
          );
        }
        setIsLoading(false);
        return;
      }

      const profile = await fetchProfile(supabase, session.user.id);
      if (!mounted) return;

      const next = mapSessionUser(
        {
          id: session.user.id,
          email: session.user.email,
          email_confirmed_at: session.user.email_confirmed_at,
          app_metadata: session.user.app_metadata,
        },
        profile,
      );

      roleTrace('AuthProvider:applySession', {
        eventUserId: session.user.id,
        profileRole: profile?.role ?? null,
        profileRawRole: profile?.rawRole ?? null,
        nextRole: next.role,
        nextRawRole: next.rawRole,
      });

      setUser((prev) => preferHigherRole(prev, next));
      setIsLoading(false);
    }

    // Skip client hydrate when layout already passed a server session — halves profile queries.
    if (!hadInitialUser) {
      void fetchSessionUser(supabase).then((sessionUser) => {
        if (!mounted) return;
        if (sessionUser) {
          setUser((prev) => preferHigherRole(prev, sessionUser));
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    // Implicit recovery links land on Site URL with #…&type=recovery — send user to reset form.
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        if (hashParams.get('type') === 'recovery') {
          const resetPath = AUTH_ROUTES.resetPassword;
          if (!window.location.pathname.startsWith(resetPath)) {
            window.location.replace(`${resetPath}${window.location.hash}`);
            return () => {
              mounted = false;
            };
          }
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Recovery session → reset form only when we are already in a recovery URL context.
      // Never redirect ordinary Google/email SIGNED_IN flows to /sifre-sifirla.
      if (event === 'PASSWORD_RECOVERY') {
        await applySession(session);
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          const hash = window.location.hash;
          const onReset = path.startsWith(AUTH_ROUTES.resetPassword);
          const recoveryContext =
            onReset
            || path.startsWith(AUTH_ROUTES.callback)
            || hash.includes('type=recovery')
            || new URLSearchParams(window.location.search).get('type') === 'recovery';
          if (recoveryContext && !onReset) {
            // Keep hash tokens if present (implicit recovery); session cookies cover PKCE/token_hash.
            const suffix = hash.includes('type=recovery') || hash.includes('access_token')
              ? hash
              : '';
            window.location.assign(`${AUTH_ROUTES.resetPassword}${suffix}`);
          }
        }
        return;
      }

      // Token refresh: keep role, but sync email_confirmed_at for verification badge.
      if (event === 'TOKEN_REFRESHED') {
        if (!userRef.current && session) {
          await applySession(session);
          return;
        }
        if (session?.user && userRef.current) {
          const confirmed = Boolean(session.user.email_confirmed_at);
          const email = session.user.email ?? userRef.current.email;
          if (
            confirmed !== userRef.current.emailVerified
            || (email && email !== userRef.current.email)
          ) {
            setUser((prev) =>
              prev
                ? { ...prev, emailVerified: confirmed, email: email || prev.email }
                : prev,
            );
          }
        }
        setIsLoading(false);
        return;
      }

      if (event === 'INITIAL_SESSION') {
        await applySession(session, { skipIfSameUser: hadInitialUser });
        return;
      }

      await applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [getSupabase, initialUser?.id]);

  const login = useCallback(async (input: SignInInput) => {
    const supabase = getSupabase();
    const { data, error } = await authLogin(supabase, input);
    if (error) return { error: error.message };
    if (!data.session || !data.user) {
      return {
        error:
          'Giriş doğrulandı ama oturum oluşmadı. E-posta doğrulaması gerekebilir veya çerezler engelleniyor olabilir.',
      };
    }

    // Paint auth state immediately — do not await profile refresh or recordLogin.
    if (data.user) {
      setUser((prev) =>
        preferHigherRole(
          prev,
          mapSessionUser(
            {
              id: data.user!.id,
              email: data.user!.email,
              email_confirmed_at: data.user!.email_confirmed_at,
              app_metadata: data.user!.app_metadata as Record<string, unknown> | undefined,
            },
            null,
          ),
        ),
      );
      setIsLoading(false);
    }

    const userId = data.user?.id;
    if (userId) {
      void (async () => {
        try {
          const { getAccountService } = await import('@/lib/persistence/container');
          const { ids } = await import('@/lib/domain/ids');
          await getAccountService().recordLogin(ids.user(userId), {
            browser: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          });
        } catch {
          // Account tables may not be migrated yet — ignore.
        }
      })();
    }

    // Profile/role enrichment happens via onAuthStateChange SIGNED_IN (non-blocking for navigation).
    return { error: null };
  }, [getSupabase]);

  const signUp = useCallback(async (input: SignUpInput) => {
    const supabase = getSupabase();
    const email = input.email.trim().toLowerCase();
    const { data, error } = await signUpWithEmail(supabase, { ...input, email });
    if (error) return { error: error.message, needsVerification: false };
    const needsVerification = !data.session;
    if (data.session) await refresh();
    const userId = data.user?.id;
    if (userId) {
      try {
        const { getAccountService } = await import('@/lib/persistence/container');
        const { ids } = await import('@/lib/domain/ids');
        await getAccountService().bootstrapFromSignup({
          userId: ids.user(userId),
          email,
          firstName: input.firstName,
          lastName: input.lastName,
          username: input.username,
          phone: input.phone,
          emailVerified: Boolean(data.user?.email_confirmed_at),
          consents: input.consents,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
      } catch {
        // Account tables may not be migrated yet — metadata still holds consents.
      }
    }
    return { error: null, needsVerification };
  }, [getSupabase, refresh]);

  const logout = useCallback(async () => {
    const userId = user?.id;
    try {
      if (userId) {
        const { getAccountService } = await import('@/lib/persistence/container');
        await getAccountService().logSecurity({
          userId,
          action: 'logout',
          browser: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        });
      }
    } catch {
      // ignore until security log table exists
    }
    await authLogout(getSupabase());
    setUser(null);
    window.location.href = AUTH_ROUTES.login;
  }, [getSupabase, user?.id]);

  const forgotPassword = useCallback(async (email: string) => {
    const { error } = await authForgotPassword(getSupabase(), email);
    return { error: error?.message ?? null };
  }, [getSupabase]);

  const resetPassword = useCallback(async (password: string) => {
    // Do not refresh/keep session here — caller signs out so /giris is reachable.
    const { error } = await authResetPassword(getSupabase(), password);
    return { error: error?.message ?? null };
  }, [getSupabase]);

  const resendVerification = useCallback(async (email: string) => {
    const { error } = await resendVerificationEmail(getSupabase(), email);
    return { error: error?.message ?? null };
  }, [getSupabase]);

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

const fallbackAuthContext: AuthContextValue = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => ({ error: 'Auth not initialized' }),
  logout: async () => {},
  forgotPassword: async () => ({ error: 'Auth not initialized' }),
  resetPassword: async () => ({ error: 'Auth not initialized' }),
  refreshSession: async () => ({ error: 'Auth not initialized' }),
  signUp: async () => ({ error: 'Auth not initialized', needsVerification: false }),
  resendVerification: async () => ({ error: 'Auth not initialized' }),
  signIn: async () => ({ error: 'Auth not initialized' }),
  signOut: async () => {},
  requestPasswordReset: async () => ({ error: 'Auth not initialized' }),
  setNewPassword: async () => ({ error: 'Auth not initialized' }),
  refresh: async () => {},
};

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  return ctx ?? fallbackAuthContext;
}
