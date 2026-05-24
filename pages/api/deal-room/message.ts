import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '../../../lib/resend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { deal_room_id, body, sender_name, sender_role, sender_email } = req.body

  const { error } = await supabase.from('messages').insert({
    deal_room_id, body, sender_id: null,
    sent_at: new Date().toISOString(), read: false,
    sender_name: sender_name || 'Buyer',
    sender_role: sender_role || 'buyer',
  })
  if (error) return res.status(500).json({ error: error.message })

  // Look up the listing for this deal room (used by both notification paths)
  const { data: room } = await supabase.from('deal_rooms').select('listing_id').eq('id', deal_room_id).single()
  const { data: listing } = room ? await supabase.from('listings_live').select('teaser_location_state,teaser_machine_count').eq('id', room.listing_id).single() : { data: null }
  const routeLabel = (listing?.teaser_location_state || '') + ' — ' + (listing?.teaser_machine_count || '?') + ' machines'

  if (sender_role !== 'seller') {
    // Buyer sent a message → notify admin
    await sendEmail({
      to: 'jeff@atmbrokerage.com',
      subject: 'New buyer message — ' + (listing?.teaser_location_state || '') + ' ATM route',
      html: '<h2>New message from buyer</h2>' +
        '<p><strong>From:</strong> ' + (sender_name || 'Buyer') + (sender_email ? ' (' + sender_email + ')' : '') + '</p>' +
        '<p><strong>Route:</strong> ' + routeLabel + '</p>' +
        '<p><strong>Message:</strong> ' + body + '</p>' +
        '<p><a href="https://atmexits.vercel.app/admin-deals">Reply in admin →</a></p>'
    })
  } else {
    // Seller (admin) replied → notify the buyer.
    // The buyer's email is stored on the signed NDA for this listing (esign_reference_id).
    let buyerEmail: string | null = null
    if (room?.listing_id) {
      const { data: nda } = await supabase
        .from('ndas')
        .select('esign_reference_id')
        .eq('listing_id', room.listing_id)
        .order('signed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      buyerEmail = nda?.esign_reference_id || null
    }

    if (buyerEmail) {
      await sendEmail({
        to: buyerEmail,
        subject: 'New reply on your ATM Exits deal room — ' + (listing?.teaser_location_state || '') + ' route',
        html: '<h2>You have a new reply</h2>' +
          '<p>The team at ATM Exits replied to your question about the <strong>' + routeLabel + '</strong> route.</p>' +
          '<p style="padding:12px 16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">' + body + '</p>' +
          '<p><a href="https://atmexits.vercel.app/deal-room/' + deal_room_id + '">View in your deal room →</a></p>'
      })
    }
  }

  return res.status(200).json({ ok: true })
}
