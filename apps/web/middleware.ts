import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple basic auth or secret header check for admin/backend generation routes
  // In a real application, consider using NextAuth or a proper JWT strategy
  const adminSecret = process.env.ADMIN_SECRET || 'dev-secret';

  // Protect Admin Pages using a query param or cookie in this basic example
  // Try to read secret from cookie (assuming admin logged in previously)
  const cookieSecret = request.cookies.get('admin_secret')?.value;
  // Fallback to Header for API calls
  const headerSecret = request.headers.get('x-admin-secret');

  if (cookieSecret !== adminSecret && headerSecret !== adminSecret) {
    // If accessing an API, return 401 JSON
    if (request.nextUrl.pathname.startsWith('/api/')) {
       return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    // If accessing an admin page, redirect to home
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