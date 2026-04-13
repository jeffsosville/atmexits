import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { listing_id, full_name, email, agreed } = req.body
  if (!listing_id || !full_name || !email || !agreed) return res.status(400).json({ error: 'Missing fields' })

  // Insert NDA record
  const { error: ndaError } = await supabase.from('ndas').insert({
    listing_id, user_id: null, status: 'signed',
    signed_at: new Date().toISOString(), esign_reference_id: email
  })
  if (ndaError && !ndaError.message.includes('duplicate')) return res.status(500).json({ error: ndaError.message })

  // Get or create deal room for this listing
  let { data: dealRoom } = await supabase.from('deal_rooms').select('id').eq('listing_id', listing_id).single()
  if (!dealRoom) {
    const { data: listing } = await supabase.from('listings_live').select('seller_id').eq('id', listing_id).single()
    const { data: newRoom } = await supabase.from('deal_rooms').insert({
      listing_id, seller_id: null, status: 'open'
    }).select('id').single()
    dealRoom = newRoom
  }

  const dealRoomId = dealRoom?.id

  // Set cookies
  res.setHeader('Set-Cookie', [
    'nda_' + listing_id + '=' + encodeURIComponent(email) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000',
    'buyer_email=' + encodeURIComponent(email) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000',
    'buyer_name=' + encodeURIComponent(full_name) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000',
  ])

  return res.status(200).json({ ok: true, deal_room_id: dealRoomId })
}
