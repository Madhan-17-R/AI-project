// =============================================================================
// Marudam — Supabase Server Client (Route Handlers)
// =============================================================================
// Creates a server-side Supabase client that reads/writes cookies for session.
// Safe to use in Next.js Route Handlers (app/api/**).
// =============================================================================
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — session refresh handled by middleware
          }
        },
      },
    }
  );
}
