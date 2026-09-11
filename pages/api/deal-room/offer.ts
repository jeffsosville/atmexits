import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '../../../lib/resend'
import { buyerFromRequest, hasSignedNda, escapeHtml } from '../../../lib/buyer'

// Offers are private to the buyer who made them (offers.buyer_email).
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { deal_room_id, terms_notes } = req.body || {}
  const amount = Number(req.body?.amount)
  if (!deal_room_id || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Enter a valid offer amount' })

  const { data: room } = await supabase.from('deal_rooms').select('listing_id').eq('id', deal_room_id).single()
  if (!room) return res.status(404).json({ error: 'Deal room not found' })

  const buyer = buyerFromRequest(req)
  if (!buyer.email || !(await hasSignedNda(supabase, room.listing_id, buyer.email))) {
    return res.status(401).json({ error: 'Sign the NDA to make an offer on this route' })
  }

  const { error } = await supabase.from('offers').insert({
    deal_room_id, buyer_id: null, amount, status: 'submitted',
    terms_notes: terms_notes || null, submitted_at: new Date().toISOString(),
    buyer_email: buyer.email,
  })
  if (error) return res.status(500).json({ error: error.message })

  const { data: listing } = await supabase.from('listings_live').select('teaser_location_state,teaser_machine_count,asking_price').eq('id', room.listing_id).single()

  await sendEmail({
    to: 'hello@atmexits.com',
    subject: 'New offer $' + amount.toLocaleString() + ' — ' + (listing?.teaser_location_state || '') + ' ATM route',
    html: '<h2>New offer submitted</h2>' +
      '<p><strong>Amount:</strong> $' + amount.toLocaleString() + '</p>' +
      '<p><strong>Route:</strong> ' + escapeHtml(listing?.teaser_location_state || '') + ' — ' + (listing?.teaser_machine_count || '?') + ' machines</p>' +
      (listing?.asking_price ? '<p><strong>Asking price:</strong> $' + Number(listing.asking_price).toLocaleString() + '</p>' : '') +
      (terms_notes ? '<p><strong>Terms:</strong> ' + escapeHtml(terms_notes) + '</p>' : '') +
      '<p><strong>Buyer:</strong> ' + escapeHtml(buyer.name) + ' (' + escapeHtml(buyer.email) + ')</p>' +
      '<p><a href="https://atmexits.com/admin-deals">View in admin →</a></p>'
  })

  return res.status(200).json({ ok: true })
}
