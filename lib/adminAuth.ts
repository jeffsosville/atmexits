import { createHmac, timingSafeEqual } from 'crypto'
import type { NextApiRequest } from 'next'

// Signed admin session token. Derived from ADMIN_PASSWORD, so rotating the
// password invalidates every existing admin session.
// Must match the Web Crypto version in middleware.ts.
export const ADMIN_TOKEN_MESSAGE = 'atmexits-admin-v1'

export function adminToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return null
  return createHmac('sha256', secret).update(ADMIN_TOKEN_MESSAGE).digest('hex')
}

export function isAdminRequest(req: NextApiRequest): boolean {
  const expected = adminToken()
  const got = req.cookies.admin_auth
  if (!expected || !got || got.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected))
}
