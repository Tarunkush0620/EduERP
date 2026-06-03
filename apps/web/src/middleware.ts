import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicPaths = ['/login', '/forgot-password', '/'];

// Role-based route prefixes
const roleRoutes: Record<string, string> = {
  super_admin: '/admin',
  teacher: '/teacher',
  student: '/student',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie/token
  // Note: In production, use httpOnly cookies set by the backend
  // For now, we rely on client-side auth state via Zustand persist
  // The middleware just checks basic path access patterns

  // Protected route patterns
  const isAdminRoute = pathname.startsWith('/admin');
  const isTeacherRoute = pathname.startsWith('/teacher');
  const isStudentRoute = pathname.startsWith('/student');

  if (isAdminRoute || isTeacherRoute || isStudentRoute) {
    // Allow navigation — the client-side auth store handles actual auth checks
    // In production, verify JWT from cookie here
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
