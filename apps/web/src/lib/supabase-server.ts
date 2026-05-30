import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

const createFallbackQuery = () => {
  const resolved = Promise.resolve({ data: null, error: null });
  const query: any = {
    select() {
      return query;
    },
    eq() {
      return query;
    },
    order() {
      return query;
    },
    limit() {
      return query;
    },
    in() {
      return query;
    },
    contains() {
      return query;
    },
    ilike() {
      return query;
    },
    insert() {
      return resolved;
    },
    update() {
      return resolved;
    },
    delete() {
      return resolved;
    },
    upsert() {
      return resolved;
    },
    single() {
      return resolved;
    },
    maybeSingle() {
      return resolved;
    },
    then(onfulfilled: any, onrejected: any) {
      return resolved.then(onfulfilled, onrejected);
    },
    catch(onrejected: any) {
      return resolved.catch(onrejected);
    },
    finally(onfinally: any) {
      return resolved.finally(onfinally);
    }
  };

  return query;
};

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

export const createServerSupabaseClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env is missing. Falling back to no-op server client.');
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null })
      },
      from: () => createFallbackQuery()
    } as any;
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: await getCookieMethods()
  });
};
