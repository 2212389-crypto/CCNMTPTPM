'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { useToast } from '@/components/toast-provider';

export default function ProfileSignOut() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ type: 'success', title: 'Đã đăng xuất', description: 'Bạn đã thoát khỏi tài khoản.' });
    router.push('/login');
  };

  return (
    <button onClick={handleSignOut} className="rounded-full bg-[#1a1d23] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2f3a]">
      Đăng xuất
    </button>
  );
}
