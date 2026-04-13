
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (req.cookies.admin_auth !== '1') return res.status(401).json({ error: 'Unauthorized' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { id, slug, teaser_machine_count, teaser_revenue_range, teaser_location_state, teaser_summary, asking_price, quality_score, full_data } = req.body

  // Create live listing
  const { error: liveError } = await supabase.from('listings_live').insert({
    pending_id: id,
    slug,
    status: 'active',
    quality_score,
    asking_price,
    teaser_machine_count,
    teaser_revenue_range,
    teaser_location_state,
    teaser_summary,
    full_data: full_data || {},
    featured: false,
  })

  if (liveError) return res.status(500).json({ error: liveError.message })

  // Update pending status
  await supabase.from('listings_pending').update({
    status: 'approved',
    reviewed_at: new Date().toISOString(),
  }).eq('id', id)

  return res.status(200).json({ ok: true })
}
