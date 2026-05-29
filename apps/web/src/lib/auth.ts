import type { Session } from '@supabase/supabase-js';

export const ADMIN_EMAIL = '2212389@dlu.edu.vn';

export type UserRole = 'admin' | 'user';

export const getUserRole = (email?: string | null): UserRole =>
  email === ADMIN_EMAIL ? 'admin' : 'user';

export const getSessionRole = (session: Session | null): UserRole => getUserRole(session?.user.email);

export const isAdmin = (email?: string | null) => email === ADMIN_EMAIL;

export const isAdminEmail = isAdmin;