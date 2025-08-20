import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createAuthMiddleware } from '@/lib/auth/middleware';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Define protected routes that require authentication
  const protectedRoutes = ['/api'];
  
  // Skip authentication for login, logout, and health check endpoints
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/health',
    '/api/auth/profile', // Profile is handled by the endpoint itself
  ];

  const { pathname } = request.nextUrl;

  // Check if the path is a public path
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the path is a protected route
  if (protectedRoutes.some(path => pathname.startsWith(path))) {
    // Create authentication middleware
    const authMiddleware = createAuthMiddleware();
    const authResponse = authMiddleware(request);
    
    if (authResponse) {
      return authResponse;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};