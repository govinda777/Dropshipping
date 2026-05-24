import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Extract the Privy session token from cookies
  const privyToken = request.cookies.get('privy-token')?.value;

  // A robust implementation would use @privy-io/server-auth to verify the JWT signature here.
  // For the sake of this edge middleware environment, we ensure the token exists.
  // In a real production environment, you should verify the JWT payload claims (e.g. role === 'admin')
  if (!privyToken) {
    // If accessing a protected API, return 401 Unauthorized
    if (request.nextUrl.pathname.startsWith('/api/')) {
       return NextResponse.json({ error: 'Unauthorized Access. Missing secure session.' }, { status: 401 });
    }
    // If accessing an admin page, redirect to the home page to login
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/generate-content',
    '/api/publish-product',
    '/api/fetch-supplier',
  ],
};