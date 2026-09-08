import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Thin wrapper around supabase-js auth calls. Kept separate from
 * hooks/useAuth.tsx so the hook only has to decide *which* implementation
 * to use (demo vs. Supabase) rather than knowing about supabase-js itself.
 */

export interface AuthResult {
  user: User | null;
  error: string | null;
}

function requireClient() {
  if (!supabase) throw new Error('authService called without a configured Supabase client');
  return supabase;
}

export async function getSession(): Promise<Session | null> {
  const client = requireClient();
  const { data, error } = await client.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function signUpWithPassword(email: string, password: string, name: string): Promise<AuthResult> {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  return { user: data.user, error: error?.message ?? null };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  return { user: data.user, error: error?.message ?? null };
}

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const client = requireClient();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/app/today` },
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const client = requireClient();
  await client.auth.signOut();
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  const client = requireClient();
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
