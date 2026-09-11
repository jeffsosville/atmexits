import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '../../../lib/supabaseClient'
import { isAdminRequest } from '../../../lib/adminAuth'

const STATUSES = ['open', 'loi_submitted', 'in_diligence', 'closing', 'closed_won', 'closed_lost']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data: rooms, error } = await supabase.from('deal_rooms').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    const deals = await Promise.all((rooms || []).map(async (room: any) => {
      const [{ data: listing }, { data: messages }, { data: offers }] = await Promise.all([
        supabase.from('listings_live').select('slug,teaser_location_state,teaser_machine_count,asking_price').eq('id', room.listing_id).single(),
        supabase.from('messages').select('*').eq('deal_room_id', room.id).order('sent_at'),
        supabase.from('offers').select('*').eq('deal_room_id', room.id).order('submitted_at'),
      ])
      return { ...room, listing: listing || {}, messages: messages || [], offers: offers || [] }
    }))
    return res.status(200).json({ deals })
  }

  if (req.method === 'POST') {
    const { id, status } = req.body || {}
    if (!id || !STATUSES.includes(status)) return res.status(400).json({ error: 'Bad request' })
    const { error } = await supabase.from('deal_rooms').update({ status }).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
