import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { deal_room_id, amount, terms_notes, buyer_email } = req.body
  const { error } = await supabase.from('offers').insert({
    deal_room_id, buyer_id: null, amount, status: 'submitted',
    terms_notes: terms_notes || null, submitted_at: new Date().toISOString()
  })
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
