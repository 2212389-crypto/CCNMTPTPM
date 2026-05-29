import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { isAdmin } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (req.nextUrl.pathname.startsWith('/admin') && (!session || !isAdmin(session.user.email))) {
    return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*']
};