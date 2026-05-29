import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

const getCookieMethods = async () => {
  const cookieStore = await cookies();

  return {
    getAll: () =>
      cookieStore.getAll().map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        options: {},
      })),
  };
};

export const createServerSupabaseClient = async () =>
  createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: await getCookieMethods(),
    }
  );
