// =============================================================================
// Marudam — Supabase Browser Client
// =============================================================================
// Uses the publishable key for client-side access.
// Never import the service-role key here.
// =============================================================================
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
