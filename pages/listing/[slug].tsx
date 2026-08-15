import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

type Listing = {
  id: string; slug: string; teaser_machine_count: number | null
  teaser_revenue_range: string | null; teaser_location_state: string | null
  teaser_summary: string | null; asking_price: number | null; full_data: any; featured: boolean
}

const fmt = (n: number | null) => n ? '$' + n.toLocaleString() : null
const inp: any = { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', fontFamily: 'inherit' }

export default function ListingPage({ listing, hasNda, dealRoomId }: { listing: Listing, hasNda: boolean, dealRoomId: string | null }) {
  const [step, setStep] = useState<'gate'|'form'|'done'>(hasNda ? 'done' : 'gate')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fd = listing.full_data || {}

  async function submitNda() {
    if (!name || !email || !agreed) { setError('Please fill in all fields and agree to the NDA.'); return }
    setLoading(true)
    const res = await fetch('/api/nda-submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listing.id, full_name: name, email, agreed }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.deal_room_id) {
        window.location.href = '/deal-room/' + data.deal_room_id
      } else {
        setStep('done')
      }
    } else { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>{listing.teaser_location_state} ATM Route | ATM Exits</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
        <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: '18px', color: '#1a1a1a', textDecoration: 'none' }}>ATM Exits</Link>
          <Link href="/listings" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>Back to listings</Link>
        </nav>

        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 16px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {listing.teaser_location_state && <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '13px', padding: '3px 12px', borderRadius: '20px' }}>{listing.teaser_location_state}</span>}
              {listing.teaser_machine_count && <span style={{ background: '#f0fdf4', color: '#2d6a4f', fontSize: '13px', padding: '3px 12px', borderRadius: '20px', fontWeight: 500 }}>{listing.teaser_machine_count} machines</span>}
              {listing.featured && <span style={{ background: '#2d6a4f', color: '#fff', fontSize: '11px', padding: '3px 12px', borderRadius: '20px', fontWeight: 700 }}>Featured</span>}
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              {listing.teaser_location_state} ATM Route{listing.teaser_machine_count ? ' — ' + listing.teaser_machine_count + ' Machines' : ''}
            </h1>
            {listing.teaser_summary && <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>{listing.teaser_summary}</p>}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
            {listing.teaser_revenue_range && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Monthly revenue</div><div style={{ fontSize: '22px', fontWeight: 700, color: '#2d6a4f' }}>{listing.teaser_revenue_range}</div></div>}
            {listing.asking_price && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Asking price</div><div style={{ fontSize: '22px', fontWeight: 700 }}>{fmt(listing.asking_price)}</div></div>}
          </div>

          {step === 'gate' && (
            <div style={{ background: '#fff', border: '2px solid #2d6a4f', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>&#128274;</div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Sign NDA to access full details</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>Full financials, site list, and processor details unlock after signing our mutual NDA. Takes 30 seconds.</p>
              <button onClick={() => setStep('form')} style={{ background: '#2d6a4f', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Sign NDA to view full details</button>
            </div>
          )}

          {step === 'form' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>Sign mutual NDA</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>Your information is kept confidential and used only to track NDA signatories.</p>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Full name</label>
                <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
                <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" />
              </div>
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0 }} />
                <label htmlFor="agree" style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5, cursor: 'pointer' }}>
                  I agree to keep all information about this listing confidential and not to contact the seller directly or circumvent ATM Exits in any transaction.
                </label>
              </div>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={submitNda} disabled={loading} style={{ background: loading ? '#9ca3af' : '#2d6a4f', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Submitting...' : 'Sign and access details'}
                </button>
                <button onClick={() => setStep('gate')} style={{ background: 'none', border: '1px solid #d1d5db', padding: '12px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#374151' }}>Back</button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px', marginBottom: '16px' }}>
                <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#2d6a4f', fontSize: '12px', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', marginBottom: '20px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>NDA signed — full details unlocked</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
                  {fd.machines && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Machines</div><div style={{ fontSize: '18px', fontWeight: 700 }}>{fd.machines}</div></div>}
                  {fd.gross_monthly && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Gross monthly</div><div style={{ fontSize: '18px', fontWeight: 700, color: '#2d6a4f' }}>{'$' + fd.gross_monthly.toLocaleString()}</div></div>}
                  {fd.net_monthly && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Net monthly</div><div style={{ fontSize: '18px', fontWeight: 700, color: '#2d6a4f' }}>{'$' + fd.net_monthly.toLocaleString()}</div></div>}
                  {fd.processor && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Processor</div><div style={{ fontSize: '16px', fontWeight: 600 }}>{fd.processor}</div></div>}
                  {fd.wireless && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Wireless</div><div style={{ fontSize: '16px', fontWeight: 600 }}>{fd.wireless}</div></div>}
                  {fd.ownership && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Ownership</div><div style={{ fontSize: '16px', fontWeight: 600, textTransform: 'capitalize' as const }}>{fd.ownership}</div></div>}
                </div>
                {listing.asking_price && fd.gross_monthly && (
                  <div style={{ marginTop: '20px', padding: '14px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: '#6b7280' }}>
                    Implied multiple: <strong style={{ color: '#1a1a1a' }}>{(listing.asking_price / (fd.gross_monthly * 12)).toFixed(1)}x revenue</strong>
                    {fd.net_monthly && <span> &middot; <strong style={{ color: '#1a1a1a' }}>{(listing.asking_price / (fd.net_monthly * 12)).toFixed(1)}x cashflow</strong></span>}
                  </div>
                )}
              </div>
              <div style={{ background: '#2d6a4f', borderRadius: '12px', padding: '28px 24px', color: '#fff', textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Ready to move forward?</h3>
                <p style={{ opacity: 0.85, margin: '0 0 18px', fontSize: '14px' }}>Enter the deal room to ask questions, submit an offer, or request more information.</p>
                <a href={'/deal-room/' + dealRoomId} style={{ background: '#fff', color: '#2d6a4f', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', display: 'inline-block', marginBottom: '10px' }}>
                  Enter deal room
                </a>
                <div style={{ opacity: 0.7, fontSize: '12px' }}>Or email us: hello@atmexits.com</div>
              </div>
            </>
          )}
        </div>
        <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px 16px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
          &copy; 2026 ATM Exits
        </footer>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: listing } = await supabase.from('listings_live').select('*').eq('slug', params?.slug as string).eq('status', 'active').single()
  if (!listing) return { notFound: true }
  const hasNda = !!req.cookies['nda_' + listing.id]
  let dealRoomId = null
  if (hasNda) {
    const { data: dr } = await supabase.from('deal_rooms').select('id').eq('listing_id', listing.id).single()
    dealRoomId = dr?.id || null
  }
  return { props: { listing, hasNda, dealRoomId } }
}
