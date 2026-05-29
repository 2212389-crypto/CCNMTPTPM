import './globals.css';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSessionRole } from '@/lib/auth';
import type { Metadata } from 'next';
import SupabaseProvider from '@/components/supabase-provider';
import SiteHeader from '@/components/site-header';
import ToastProvider from '@/components/toast-provider';
import { Toaster } from 'sonner';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin', 'vietnamese'], variable: '--font-jakarta' });
const mono = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Expense Manager',
  description: 'Expense Manager built with Next.js and Supabase.'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const role = getSessionRole(session);

  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${mono.variable} min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] antialiased`}>
        <SupabaseProvider>
          <ToastProvider>
            <SiteHeader session={session} role={role}>
              {children}
            </SiteHeader>
          </ToastProvider>
        </SupabaseProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
