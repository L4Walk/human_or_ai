import { NextRequest, NextResponse } from 'next/server';
import { auth } from './app/auth';
import { Role } from './prisma/enums';

export async function middleware(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const headers = await request.headers;
  
  // Public paths accessible to anyone
  const publicPaths = ['/', '/login', '/register', '/api/register'];
  if (publicPaths.includes(nextUrl.pathname)) {
    return NextResponse.next();
  }
  
  // Content view pages are public
  if (nextUrl.pathname.startsWith('/content/') && !nextUrl.pathname.includes('/create')) {
    return NextResponse.next();
  }
  
  // API routes for content viewing
  if (nextUrl.pathname.startsWith('/api/contents') && request.method === 'GET') {
    return NextResponse.next();
  }

  // Get the user session
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === Role.ADMIN;
  
  // Protected paths - require login
  const authRequiredPaths = ['/content/create', '/api/contents', '/api/votes'];
  const isAuthRequiredPath = authRequiredPaths.some(path => {
    return nextUrl.pathname.startsWith(path);
  });
  
  if (isAuthRequiredPath && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl.origin));
  }
  
  // Admin only paths
  const adminPaths = ['/admin'];
  const isAdminPath = adminPaths.some(path => {
    return nextUrl.pathname.startsWith(path);
  });
  
  if (isAdminPath && !isAdmin) {
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }
  
  // Content creation - requires login
  if (nextUrl.pathname === '/content/create' && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl.origin));
  }
  
  // Content modification/deletion - requires login and ownership or admin role
  if ((nextUrl.pathname.startsWith('/api/contents') && (request.method === 'PUT' || request.method === 'DELETE')) && !isLoggedIn) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  
  return NextResponse.next();
}

// Skip middleware for these paths
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};