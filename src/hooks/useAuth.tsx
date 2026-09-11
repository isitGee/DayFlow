import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import * as authService from '../services/authService';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';

/**
 * AuthProvider / useAuth is provider-agnostic. When VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY are unset (the default), it runs a local demo
 * "session" out of localStorage so the whole app is usable without a
 * backend. When those env vars are set, it delegates to authService.ts
 * (real Supabase auth) instead — no component outside this file needs to
 * know which mode is active.
 */

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isDemoMode: boolean;
  error: string | null;
  signInDemo: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_STORAGE_KEY = 'dayflow-auth-demo';

// Task/goal stores key every row (local or remote) by "who's logged in
// right now." That needs to be known the instant a session exists — not
// only once AppLayout mounts — otherwise anything created before /app
// (e.g. the first task in Onboarding) gets tagged with the wrong user id.
function syncStoreUserId(id: string) {
  useTaskStore.getState().setCurrentUserId(id);
  useGoalStore.getState().setCurrentUserId(id);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function bootstrap() {
      if (!isSupabaseConfigured) {
        const stored = localStorage.getItem(DEMO_STORAGE_KEY);
        if (stored) setUser(JSON.parse(stored));
        setLoading(false);
        return;
      }

      const session = await authService.getSession();
      applySession(session);
      setLoading(false);
      unsubscribe = authService.onAuthStateChange((s) => applySession(s));
    }

    function applySession(session: Awaited<ReturnType<typeof authService.getSession>>) {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const authedUser = {
        id: session.user.id,
        email: session.user.email ?? '',
        name: (session.user.user_metadata?.name as string) ?? session.user.email?.split('@')[0] ?? 'there',
      };
      setUser(authedUser);
      syncStoreUserId(authedUser.id);
    }

    bootstrap();
    return () => unsubscribe?.();
  }, []);

  function signInDemo() {
    const demoUser: AuthUser = { id: 'demo-user', name: 'Alex', email: 'alex@example.com' };
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    syncStoreUserId(demoUser.id);
  }

  async function signIn(email: string, password: string) {
    setError(null);
    if (!isSupabaseConfigured) {
      signInDemo();
      return;
    }
    const { user: authedUser, error: err } = await authService.signInWithPassword(email, password);
    if (err) {
      setError(err);
      return;
    }
    if (authedUser) {
      setUser({ id: authedUser.id, email: authedUser.email ?? '', name: (authedUser.user_metadata?.name as string) ?? email.split('@')[0] });
      syncStoreUserId(authedUser.id);
    }
  }

  async function signUp(email: string, password: string, name: string) {
    setError(null);
    if (!isSupabaseConfigured) {
      signInDemo();
      return;
    }
    const { user: authedUser, error: err } = await authService.signUpWithPassword(email, password, name);
    if (err) {
      setError(err);
      return;
    }
    if (authedUser) {
      setUser({ id: authedUser.id, email: authedUser.email ?? '', name });
      syncStoreUserId(authedUser.id);
    }
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
      signInDemo();
      return;
    }
    const { error: err } = await authService.signInWithGoogle();
    if (err) setError(err);
  }

  async function signOut() {
    if (isSupabaseConfigured) await authService.signOut();
    localStorage.removeItem(DEMO_STORAGE_KEY);
    setUser(null);
    // Clear in-memory task/goal/project data so a different account signing
    // in next (same browser, no page reload) always re-fetches fresh rather
    // than briefly showing whatever the previous account had loaded.
    useTaskStore.getState().resetRemote();
    useGoalStore.getState().resetRemote();
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isDemoMode: !isSupabaseConfigured, error, signInDemo, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
