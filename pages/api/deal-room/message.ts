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

  // Notify admin when buyer sends message
  if (sender_role !== 'seller') {
    const { data: room } = await supabase.from('deal_rooms').select('listing_id').eq('id', deal_room_id).single()
    const { data: listing } = room ? await supabase.from('listings_live').select('teaser_location_state,teaser_machine_count').eq('id', room.listing_id).single() : { data: null }
    await sendEmail({
      to: 'jeff@atmbrokerage.com',
      subject: 'New buyer message — ' + (listing?.teaser_location_state || '') + ' ATM route',
      html: '<h2>New message from buyer</h2>' +
        '<p><strong>From:</strong> ' + (sender_name || 'Buyer') + (sender_email ? ' (' + sender_email + ')' : '') + '</p>' +
        '<p><strong>Route:</strong> ' + (listing?.teaser_location_state || '') + ' — ' + (listing?.teaser_machine_count || '?') + ' machines</p>' +
        '<p><strong>Message:</strong> ' + body + '</p>' +
        '<p><a href="https://atmexits.vercel.app/admin-deals">Reply in admin →</a></p>'
    })
  }

  return res.status(200).json({ ok: true })
}
