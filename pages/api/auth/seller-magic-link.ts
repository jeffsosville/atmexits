import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import type { NextApiRequest, NextApiResponse } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
  const siteUrl = isProd ? 'https://atmexits.vercel.app' : 'http://localhost:3000'

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email.toLowerCase().trim(),
    options: {
      redirectTo: `${siteUrl}/seller-portal`,
    },
  })

  if (error || !data?.properties?.action_link) {
    console.error('Magic link error:', error)
    return res.status(500).json({ error: error?.message || 'Failed to generate link' })
  }

  const magicLink = data.properties.action_link

  const { error: emailError } = await resend.emails.send({
    from: 'ATM Exits <hello@atmexits.com>',
    to: email,
    subject: 'Your ATM Exits seller sign-in link',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #16a34a; margin-bottom: 8px;">ATM Exits</h2>
        <p style="color: #111; font-size: 16px; margin-bottom: 24px;">
          Click the button below to sign in to your seller portal. This link expires in 1 hour.
        </p>
        <a href="${magicLink}" style="
          display: inline-block;
          background: #16a34a;
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 24px;
        ">Sign in to Seller Portal →</a>
        <p style="color: #6b7280; font-size: 13px;">
          If you didn't request this, you can safely ignore this email.<br>
          This link can only be used once.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #9ca3af; font-size: 12px;">ATM Exits · atmexits.vercel.app</p>
      </div>
    `,
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    return res.status(500).json({ error: 'Failed to send email' })
  }

  return res.status(200).json({ success: true })
}
