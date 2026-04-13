import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { deal_room_id, body, sender_name, sender_role } = req.body
  const { error } = await supabase.from('messages').insert({
    deal_room_id, body, sender_id: null,
    sent_at: new Date().toISOString(), read: false,
    sender_name: sender_name || 'Buyer',
    sender_role: sender_role || 'buyer',
  })
  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
