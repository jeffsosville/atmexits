import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '../../lib/resend'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const data = req.body

  const { error } = await supabase.from('listings_pending').insert({
    status: 'submitted',
    machine_count: data.machine_count,
    location_types: data.location_types,
    ownership_type: data.ownership_type,
    processor: data.processor,
    wireless_carrier: data.wireless_carrier,
    gross_monthly_surcharge: data.gross_monthly_surcharge,
    net_monthly_cashflow: data.net_monthly_cashflow,
    asking_price: data.asking_price,
    notes: 'SELLER: ' + data.seller_name + ' | ' + data.seller_email + ' | ' + (data.seller_phone || '') + '\n\n' + (data.notes || ''),
    submitted_at: new Date().toISOString(),
    seller_id: null,
  })

  if (error) return res.status(500).json({ error: error.message })

  // Notify admin
  await sendEmail({
    to: 'jeff@atmbrokerage.com',
    subject: 'New ATM route submission — ' + (data.machine_count || '?') + ' machines',
    html: '<h2>New listing submission</h2>' +
      '<p><strong>Seller:</strong> ' + data.seller_name + ' (' + data.seller_email + ')</p>' +
      '<p><strong>Machines:</strong> ' + (data.machine_count || '—') + '</p>' +
      '<p><strong>Gross monthly:</strong> $' + (data.gross_monthly_surcharge || '—') + '</p>' +
      '<p><strong>Asking price:</strong> $' + (data.asking_price || '—') + '</p>' +
      '<p><a href="https://atmexits.vercel.app/admin">Review in admin →</a></p>'
  })

  return res.status(200).json({ ok: true })
}
