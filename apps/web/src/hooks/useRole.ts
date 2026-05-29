import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase-client';

export function useRole() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(currentUser ?? null);
      }
    };

    void syncUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setUser(currentSession?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isAdmin: isAdmin(user?.email),
    role: isAdmin(user?.email) ? 'admin' : 'user'
  } as const;
}