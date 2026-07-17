import { createClient } from "@supabase/supabase-js";

const runtimeEnv = window.__MIVIBE_ENV__ ?? {};
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-key";

// Replace with your Supabase project URL and anon key
// Or set via .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
const SUPABASE_URL: string =
  runtimeEnv.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  PLACEHOLDER_URL;
const SUPABASE_ANON_KEY: string =
  runtimeEnv.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  PLACEHOLDER_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isConfigured =
  SUPABASE_URL !== PLACEHOLDER_URL && SUPABASE_ANON_KEY !== PLACEHOLDER_KEY;
