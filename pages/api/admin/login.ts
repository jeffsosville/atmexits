import type { NextApiRequest, NextApiResponse } from 'next'
import { timingSafeEqual } from 'crypto'
import { adminToken } from '../../../lib/adminAuth'

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a), bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { password } = req.body || {}
  const expected = process.env.ADMIN_PASSWORD
  const token = adminToken()
  if (expected && token && typeof password === 'string' && safeEqual(password, expected)) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    res.setHeader('Set-Cookie', `admin_auth=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secure}`)
    return res.status(200).json({ ok: true })
  }
  return res.status(401).json({ error: 'Invalid password' })
}
