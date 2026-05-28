// Barrel re-export so existing 'import { supabase } from "@/lib/supabase"' keeps working.
// Client Components use the browser singleton; Server Components should use createServerClient().
export { supabaseBrowser as supabase } from './supabase-browser';

export type Message = {
  id: string;
  text: string;
  country: string | null;
  country_code: string | null;
  mood: string | null;
  created_at: string;
  sparks: number;
};
