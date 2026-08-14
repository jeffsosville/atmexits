import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

type Listing = {
  id: string
  slug: string
  teaser_machine_count: number | null
  teaser_revenue_range: string | null
  teaser_location_state: string | null
  teaser_summary: string | null
  asking_price: number | null
  quality_score: number | null
  published_at: string
  featured: boolean
}

const fmt = (n: number | null) => n ? '$' + n.toLocaleString() : null

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('listings_live')
        .select('id,slug,teaser_machine_count,teaser_revenue_range,teaser_location_state,teaser_summary,asking_price,quality_score,published_at,featured')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('published_at', { ascending: false })
      setListings(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <>
      <Head>
        <title>ATM Routes for Sale | ATM Exits</title>
        <meta name="description" content="Browse verified ATM routes for sale. Every listing reviewed by our team." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>

        <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: '18px', color: '#1a1a1a', textDecoration: 'none' }}>ATM Exits</Link>
          <Link href="/sell" style={{ background: '#2d6a4f', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>List your route</Link>
        </nav>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 16px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 6px' }}>ATM routes for sale</h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Every listing verified by our team. Sign NDA to access full financials and site list.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading listings...</div>
          ) : listings.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '48px 20px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>No listings yet</h2>
              <p style={{ color: '#6b7280', margin: '0 0 20px', fontSize: '14px' }}>Be the first to list your ATM route.</p>
              <Link href="/sell" style={{ background: '#2d6a4f', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>List your route →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {listings.map(l => (
                <div key={l.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {l.featured && <span style={{ background: '#2d6a4f', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Featured</span>}
                    {l.teaser_location_state && <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '12px', padding: '2px 10px', borderRadius: '20px' }}>{l.teaser_location_state}</span>}
                    {l.teaser_machine_count && <span style={{ background: '#f0fdf4', color: '#2d6a4f', fontSize: '12px', padding: '2px 10px', borderRadius: '20px', fontWeight: 500 }}>{l.teaser_machine_count} machines</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      {l.teaser_revenue_range && (
                        <div style={{ marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Monthly revenue · </span>
                          <span style={{ fontSize: '20px', fontWeight: 700, color: '#2d6a4f' }}>{l.teaser_revenue_range}</span>
                        </div>
                      )}
                      {l.asking_price && (
                        <div style={{ marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Asking · </span>
                          <span style={{ fontSize: '16px', fontWeight: 700 }}>{fmt(l.asking_price)}</span>
                        </div>
                      )}
                      {l.teaser_summary && <p style={{ fontSize: '13px', color: '#6b7280', margin: '6px 0 0', lineHeight: 1.5 }}>{l.teaser_summary}</p>}
                    </div>
                    <Link href={'/listing/' + l.slug} style={{ background: '#2d6a4f', color: '#fff', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
                      Sign NDA →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '40px', background: '#2d6a4f', borderRadius: '12px', padding: '28px 20px', textAlign: 'center', color: '#fff' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Selling your ATM route?</h3>
            <p style={{ opacity: 0.85, margin: '0 0 18px', fontSize: '14px' }}>Free valuation from the team behind 200+ closed ATM route transactions.</p>
            <Link href="/sell" style={{ background: '#fff', color: '#2d6a4f', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>Get your free valuation →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px 16px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
          © 2026 ATM Exits
        </footer>
      </div>
    </>
  )
}
