import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

/** Only created when env vars are set — avoids crashing the whole app in demo mode */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
