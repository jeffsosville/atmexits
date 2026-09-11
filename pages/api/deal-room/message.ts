import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '../../../lib/resend'
import { isAdminRequest } from '../../../lib/adminAuth'
import { buyerFromRequest, hasSignedNda, normEmail, escapeHtml } from '../../../lib/buyer'

// Every message belongs to one buyer's private thread (messages.buyer_email).
// - Buyer posts: identity from NDA cookies; must have signed the NDA for this listing.
// - Admin replies (sender_role 'seller'): admin session required; goes to the buyer named in buyer_email.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { deal_room_id, body, sender_role } = req.body || {}
  if (!deal_room_id || typeof body !== 'string' || !body.trim()) return res.status(400).json({ error: 'Missing fields' })

  const { data: room } = await supabase.from('deal_rooms').select('listing_id').eq('id', deal_room_id).single()
  if (!room) return res.status(404).json({ error: 'Deal room not found' })
  const { data: listing } = await supabase.from('listings_live').select('teaser_location_state,teaser_machine_count').eq('id', room.listing_id).single()
  const routeLabel = (listing?.teaser_location_state || '') + ' — ' + (listing?.teaser_machine_count || '?') + ' machines'

  const isAdminReply = sender_role === 'seller'
  let buyerEmail: string
  let senderName: string

  if (isAdminReply) {
    if (!isAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
    buyerEmail = normEmail(req.body.buyer_email)
    if (!buyerEmail) return res.status(400).json({ error: 'Choose which buyer to reply to' })
    senderName = 'ATM Exits'
  } else {
    const buyer = buyerFromRequest(req)
    if (!buyer.email || !(await hasSignedNda(supabase, room.listing_id, buyer.email))) {
      return res.status(401).json({ error: 'Sign the NDA to message about this route' })
    }
    buyerEmail = buyer.email
    senderName = buyer.name
  }

  const { error } = await supabase.from('messages').insert({
    deal_room_id, body: body.trim(), sender_id: null,
    sent_at: new Date().toISOString(), read: false,
    sender_name: senderName,
    sender_role: isAdminReply ? 'seller' : 'buyer',
    buyer_email: buyerEmail,
  })
  if (error) return res.status(500).json({ error: error.message })

  if (!isAdminReply) {
    // Buyer sent a message → notify admin
    await sendEmail({
      to: 'hello@atmexits.com',
      subject: 'New buyer message — ' + (listing?.teaser_location_state || '') + ' ATM route',
      html: '<h2>New message from buyer</h2>' +
        '<p><strong>From:</strong> ' + escapeHtml(senderName) + ' (' + escapeHtml(buyerEmail) + ')</p>' +
        '<p><strong>Route:</strong> ' + escapeHtml(routeLabel) + '</p>' +
        '<p><strong>Message:</strong> ' + escapeHtml(body) + '</p>' +
        '<p><a href="https://atmexits.com/admin-deals">Reply in admin →</a></p>'
    })
  } else {
    // Admin replied → notify that buyer only
    await sendEmail({
      to: buyerEmail,
      subject: 'New reply on your ATM Exits deal room — ' + (listing?.teaser_location_state || '') + ' route',
      html: '<h2>You have a new reply</h2>' +
        '<p>The team at ATM Exits replied to your question about the <strong>' + escapeHtml(routeLabel) + '</strong> route.</p>' +
        '<p style="padding:12px 16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">' + escapeHtml(body) + '</p>' +
        '<p><a href="https://atmexits.com/deal-room/' + deal_room_id + '">View in your deal room →</a></p>'
    })
  }

  return res.status(200).json({ ok: true })
}
