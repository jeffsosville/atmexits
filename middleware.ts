import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin pages and admin API routes require a valid signed admin_auth cookie.
const ADMIN_PAGE = /^\/(admin|admin-deals)(\/|$)/;
const ADMIN_API = /^\/api\/admin(\/|$)/;
const ADMIN_TOKEN_MESSAGE = 'atmexits-admin-v1'; // must match lib/adminAuth.ts

async function expectedAdminToken(): Promise<string | null> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(ADMIN_TOKEN_MESSAGE));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = ADMIN_PAGE.test(pathname);
  const isAdminApi = ADMIN_API.test(pathname) && pathname !== '/api/admin/login';

  if (isAdminPage || isAdminApi) {
    const expected = await expectedAdminToken();
    const got = request.cookies.get('admin_auth')?.value || '';
    if (!expected || !safeEqual(got, expected)) {
      if (isAdminApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const url = request.nextUrl.clone();
      url.pathname = '/admin-login';
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  const requestHeaders = new Headers(request.headers);

  // ATMExits is a single vertical — no hostname routing needed
  requestHeaders.set('x-vertical-slug', 'atm');
  requestHeaders.set('x-vertical-name', 'ATM Exits');
  requestHeaders.set('x-vertical-domain', 'atmexits.com');
  requestHeaders.set('x-vertical-brand-color', '#2d6a4f');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
