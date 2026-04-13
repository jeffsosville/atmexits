import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { listing_id, full_name, email, agreed } = req.body
  if (!listing_id || !full_name || !email || !agreed) return res.status(400).json({ error: 'Missing fields' })
  const { error } = await supabase.from('ndas').insert({
    listing_id, user_id: null, status: 'signed',
    signed_at: new Date().toISOString(), esign_reference_id: email
  })
  if (error && !error.message.includes('duplicate')) return res.status(500).json({ error: error.message })
  res.setHeader('Set-Cookie', 'nda_' + listing_id + '=' + encodeURIComponent(email) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000')
  return res.status(200).json({ ok: true })
}
