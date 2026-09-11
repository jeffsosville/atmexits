import type { NextApiRequest } from 'next'
import type { SupabaseClient } from '@supabase/supabase-js'

export const normEmail = (e: unknown) =>
  typeof e === 'string' ? e.trim().toLowerCase() : ''

export function escapeHtml(s: unknown) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

// Buyer identity comes from the cookies set when they sign an NDA (never from the request body).
export function buyerFromCookies(cookies: Partial<Record<string, string>>) {
  const email = normEmail(cookies.buyer_email ? decodeURIComponent(cookies.buyer_email) : '')
  const name = cookies.buyer_name ? decodeURIComponent(cookies.buyer_name) : 'Buyer'
  return { email, name }
}

export function buyerFromRequest(req: NextApiRequest) {
  return buyerFromCookies(req.cookies)
}

// True if this email has signed the NDA for the listing behind this deal room.
export async function hasSignedNda(supabase: SupabaseClient, listingId: string, email: string) {
  if (!listingId || !email) return false
  const { data } = await supabase.from('ndas').select('esign_reference_id').eq('listing_id', listingId).eq('status', 'signed')
  return (data || []).some((n: any) => normEmail(n.esign_reference_id) === email)
}
