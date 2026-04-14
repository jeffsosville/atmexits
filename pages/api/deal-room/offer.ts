import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '../../../lib/resend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { deal_room_id, amount, terms_notes, buyer_email } = req.body

  const { error } = await supabase.from('offers').insert({
    deal_room_id, buyer_id: null, amount, status: 'submitted',
    terms_notes: terms_notes || null, submitted_at: new Date().toISOString()
  })
  if (error) return res.status(500).json({ error: error.message })

  // Notify admin
  const { data: room } = await supabase.from('deal_rooms').select('listing_id').eq('id', deal_room_id).single()
  const { data: listing } = room ? await supabase.from('listings_live').select('teaser_location_state,teaser_machine_count,asking_price').eq('id', room.listing_id).single() : { data: null }

  await sendEmail({
    to: 'jeff@atmbrokerage.com',
    subject: 'New offer $' + amount.toLocaleString() + ' — ' + (listing?.teaser_location_state || '') + ' ATM route',
    html: '<h2>New offer submitted</h2>' +
      '<p><strong>Amount:</strong> $' + Number(amount).toLocaleString() + '</p>' +
      '<p><strong>Route:</strong> ' + (listing?.teaser_location_state || '') + ' — ' + (listing?.teaser_machine_count || '?') + ' machines</p>' +
      (listing?.asking_price ? '<p><strong>Asking price:</strong> $' + Number(listing.asking_price).toLocaleString() + '</p>' : '') +
      (terms_notes ? '<p><strong>Terms:</strong> ' + terms_notes + '</p>' : '') +
      '<p><strong>Buyer:</strong> ' + (buyer_email || 'unknown') + '</p>' +
      '<p><a href="https://atmexits.vercel.app/admin-deals">View in admin →</a></p>'
  })

  return res.status(200).json({ ok: true })
}
