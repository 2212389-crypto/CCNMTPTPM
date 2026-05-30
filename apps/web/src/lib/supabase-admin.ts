import { createClient } from '@supabase/supabase-js';
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

export const createServerAdminSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase admin env is missing. Falling back to no-op admin client.');
    return {
      from: () => createFallbackQuery()
    } as any;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};