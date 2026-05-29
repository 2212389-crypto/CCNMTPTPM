import { NextRequest, NextResponse } from 'next/server';

export async function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};