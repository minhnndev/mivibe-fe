import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase project URL and anon key
// Or set via .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const isConfigured = SUPABASE_URL !== 'https://placeholder.supabase.co'
