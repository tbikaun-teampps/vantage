// lib/supabase/client.ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Singleton instance for authenticated users
let supabaseClient: SupabaseClient | null = null;

/**
 * Creates or returns the singleton Supabase client for authenticated users
 * Uses standard Supabase session auth with localStorage persistence
 */
export function createClient() {
  // Return existing instance if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  // Create new instance only once
  supabaseClient = createSupabaseClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: "vantage-auth",
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );

  return supabaseClient;
}