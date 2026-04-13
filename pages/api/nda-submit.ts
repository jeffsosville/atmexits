import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { listing_id, full_name, email, agreed } = req.body
  if (!listing_id || !full_name || !email || !agreed) return res.status(400).json({ error: 'Missing fields' })

  // Insert NDA (ignore duplicates)
  await supabase.from('ndas').insert({
    listing_id, user_id: null, status: 'signed',
    signed_at: new Date().toISOString(), esign_reference_id: email
  })

  // Find existing deal room for this listing first
  const { data: existing } = await supabase
    .from('deal_rooms')
    .select('id')
    .eq('listing_id', listing_id)
    .order('created_at', { ascending: false })
    .limit(1)

  let dealRoomId = existing?.[0]?.id

  // Only create if none exists
  if (!dealRoomId) {
    const { data: newRoom } = await supabase
      .from('deal_rooms')
      .insert({ listing_id, seller_id: null, status: 'open' })
      .select('id')
      .single()
    dealRoomId = newRoom?.id
  }

  if (!dealRoomId) return res.status(500).json({ error: 'Could not create deal room' })

  // Set cookies
  res.setHeader('Set-Cookie', [
    'nda_' + listing_id + '=' + encodeURIComponent(email) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000',
    'buyer_email=' + encodeURIComponent(email) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000',
    'buyer_name=' + encodeURIComponent(full_name) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000',
  ])

  return res.status(200).json({ ok: true, deal_room_id: dealRoomId })
}
