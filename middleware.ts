import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
