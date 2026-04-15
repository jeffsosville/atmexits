import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const { error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: 'https://atmexits.vercel.app/seller-portal',
    },
  })

  if (error) {
    console.error('Magic link error:', error)
    return res.status(500).json({ error: error.message })
  }

  return res.status(200).json({ success: true })
}
