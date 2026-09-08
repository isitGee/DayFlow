import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * `supabase` is null whenever VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are
 * not set, which is the default for local demo mode. Every service that
 * talks to Supabase (authService, taskService) checks `isSupabaseConfigured`
 * first and falls back to local/demo behavior otherwise — see
 * src/hooks/useAuth.tsx and src/store/taskStore.ts for the fallback logic.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
