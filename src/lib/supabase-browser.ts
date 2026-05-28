import { createClient } from '@supabase/supabase-js';

// Singleton browser client — safe to import in Client Components and lib/supabase.ts re-exports.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
