import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '../../../lib/supabaseClient'
import { isAdminRequest } from '../../../lib/adminAuth'

const STATUSES = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_edits']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const status = String(req.query.status || 'submitted')
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Bad status' })
    const { data, error } = await supabase
      .from('listings_pending').select('*').eq('status', status)
      .order('submitted_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ listings: data || [] })
  }

  if (req.method === 'POST') {
    const { id, status, admin_notes, quality_score } = req.body || {}
    if (!id || !STATUSES.includes(status)) return res.status(400).json({ error: 'Bad request' })
    const { error } = await supabase.from('listings_pending').update({
      status,
      admin_notes: admin_notes ?? null,
      quality_score: quality_score ? parseInt(quality_score, 10) : null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
