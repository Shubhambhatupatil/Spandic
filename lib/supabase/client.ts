import { createBrowserClient } from "@supabase/ssr";

// SPANDIC's public Supabase project settings.
// A publishable key is designed for browser use; never put a service_role/secret key here.
const SPANDIC_SUPABASE_URL = "https://bjzqoehrhnldllzcgacu.supabase.co";
const SPANDIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LTI7UFKMhnGpfeACoKjXdA_QXqnQcW_";

export function createClient() {
  // Environment variables can override these defaults, but deployment setup is not required.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || SPANDIC_SUPABASE_URL;
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    SPANDIC_SUPABASE_PUBLISHABLE_KEY
  ).trim();

  return createBrowserClient(url, key);
}
