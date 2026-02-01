import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ===========================================
// PIXLY - Optimized Route Protection
// Minimal, fast, production-ready middleware
// ===========================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast cookie check - no parsing, just existence
  const isAuthenticated = request.cookies.has('pixly_session');

  // Protected routes: redirect to login if not authenticated
  if (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/profile')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Auth routes: redirect to dashboard if already authenticated
  if (pathname === '/login' || pathname === '/signup') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Landing page: redirect to dashboard if already authenticated
  // This ensures users resume their session instantly without seeing the landing page
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Precise matcher - ONLY run on routes that need protection
// This is critical for performance: middleware won't execute on other routes
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/settings/:path*',
    '/profile/:path*',
    // Auth routes (to redirect if already logged in)
    '/login',
    '/signup',
    // Landing page (to redirect authenticated users to dashboard)
    '/',
  ],
};
