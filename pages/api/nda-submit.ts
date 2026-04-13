
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { listing_id, full_name, email, agreed } = req.body
  if (!listing_id || !full_name || !email || !agreed) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Upsert NDA record
  const { error } = await supabase.from('ndas').upsert({
    listing_id,
    user_id: '00000000-0000-0000-0000-000000000000',
    status: 'signed',
    signed_at: new Date().toISOString(),
    esign_reference_id: email,
  }, { onConflict: 'user_id,listing_id', ignoreDuplicates: false })

  if (error) return res.status(500).json({ error: error.message })

  // Set cookie to remember NDA for this listing
  res.setHeader('Set-Cookie', `nda_${listing_id}=${email}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`)
  return res.status(200).json({ ok: true })
}
