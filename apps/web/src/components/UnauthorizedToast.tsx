'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/toast-provider';

export default function UnauthorizedToast({ enabled }: { enabled: boolean }) {
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;
    toast({ type: 'error', title: 'Bạn không có quyền truy cập', description: 'Bạn đã được chuyển về dashboard.' });
    window.history.replaceState({}, '', '/dashboard');
  }, [enabled, toast]);

  return null;
}