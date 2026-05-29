'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast-provider';

export default function RedirectToast({ href, title, description }: { href: string; title: string; description: string }) {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    toast({ type: 'error', title, description });
    router.replace(href);
  }, [description, href, router, toast, title]);

  return null;
}