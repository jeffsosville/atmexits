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
      const [{ data: listing }, { data: messages }, { data: offers }, { data: ndas }] = await Promise.all([
        supabase.from('listings_live').select('slug,teaser_location_state,teaser_machine_count,asking_price').eq('id', room.listing_id).single(),
        supabase.from('messages').select('*').eq('deal_room_id', room.id).order('sent_at'),
        supabase.from('offers').select('*').eq('deal_room_id', room.id).order('submitted_at'),
        supabase.from('ndas').select('esign_reference_id,signed_at').eq('listing_id', room.listing_id).eq('status', 'signed').order('signed_at'),
      ])
      // One entry per buyer: everyone who signed the NDA, plus anyone with messages/offers
      const buyers: Record<string, { email: string; name: string | null; nda_signed_at: string | null }> = {}
      const add = (email: string | null, name: string | null = null, nda: string | null = null) => {
        const key = (email || '').trim().toLowerCase()
        if (!key) return
        const b = buyers[key] || (buyers[key] = { email: key, name: null, nda_signed_at: null })
        if (name && !b.name) b.name = name
        if (nda && !b.nda_signed_at) b.nda_signed_at = nda
      }
      for (const n of ndas || []) add(n.esign_reference_id, null, n.signed_at)
      for (const m of messages || []) add(m.buyer_email, m.sender_role === 'buyer' ? m.sender_name : null)
      for (const o of offers || []) add(o.buyer_email)
      return { ...room, listing: listing || {}, messages: messages || [], offers: offers || [], buyers: Object.values(buyers) }
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
