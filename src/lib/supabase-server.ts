import { createClient } from '@supabase/supabase-js';

// Server-only client — never import this in Client Components.
// Uses the anon key for now; swap for a service-role key + cookie-based auth
// once auth (Task 3 in todo.md) is implemented.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
