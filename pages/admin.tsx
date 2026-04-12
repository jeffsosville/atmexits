import { useEffect, useState } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabaseClient'

type Listing = {
  id: string
  status: string
  machine_count: number | null
  gross_monthly_surcharge: number | null
  net_monthly_cashflow: number | null
  location_types: string | null
  ownership_type: string | null
  processor: string | null
  wireless_carrier: string | null
  asking_price: number | null
  notes: string | null
  submitted_at: string
  quality_score: number | null
  admin_notes: string | null
}

const STATUS_COLORS: Record<string, string> = {
  submitted: '#f59e0b',
  under_review: '#3b82f6',
  approved: '#10b981',
  rejected: '#ef4444',
  needs_edits: '#8b5cf6',
  draft: '#9ca3af',
}

const fmt = (n: number | null) =>
  n ? `$${n.toLocaleString()}` : '—'

export default function Admin() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Listing | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [qualityScore, setQualityScore] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('submitted')

  useEffect(() => { fetchListings() }, [filter])

  async function fetchListings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings_pending')
      .select('*')
      .eq('status', filter)
      .order('submitted_at', { ascending: false })
    if (!error && data) setListings(data)
    setLoading(false)
  }

  function openDetail(listing: Listing) {
    setSelected(listing)
    setAdminNotes(listing.admin_notes || '')
    setQualityScore(listing.quality_score?.toString() || '')
  }

  async function updateStatus(id: string, newStatus: string) {
    setSaving(true)
    await supabase
      .from('listings_pending')
      .update({
        status: newStatus,
        admin_notes: adminNotes,
        quality_score: qualityScore ? parseInt(qualityScore) : null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
    setSaving(false)
    setSelected(null)
    fetchListings()
  }

  // Parse seller info from notes field
  function parseSellerInfo(notes: string | null) {
    if (!notes) return { name: '—', email: '—', phone: '—', notes: '' }
    const match = notes.match(/^SELLER: (.+?) \| (.+?) \| (.*?)\n\n?([\s\S]*)$/)
    if (!match) return { name: '—', email: '—', phone: '—', notes: notes }
    return { name: match[1], email: match[2], phone: match[3] || '—', notes: match[4] }
  }

  const FILTERS = ['submitted', 'under_review', 'approved', 'rejected', 'needs_edits']

  return (
    <>
      <Head><title>Admin — ATM Exits</title></Head>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>

        {/* Header */}
        <div style={{ background: '#1a1a1a', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>ATM Exits · Admin</div>
          <a href="/" style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'none' }}>← Back to site</a>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>

          {/* Sidebar */}
          <div style={{ width: '280px', background: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto' }}>
            {/* Filter tabs */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Status</div>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: f === filter ? 600 : 400, background: f === filter ? '#f0fdf4' : 'transparent', color: f === filter ? '#2d6a4f' : '#374151', marginBottom: '2px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[f], marginRight: '8px' }} />
                  {f.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                </button>
              ))}
            </div>

            {/* Listing list */}
            {loading ? (
              <div style={{ padding: '24px', color: '#9ca3af', fontSize: '14px' }}>Loading...</div>
            ) : listings.length === 0 ? (
              <div style={{ padding: '24px', color: '#9ca3af', fontSize: '14px' }}>No listings with this status.</div>
            ) : listings.map(l => {
              const seller = parseSellerInfo(l.notes)
              return (
                <div key={l.id} onClick={() => openDetail(l)} style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected?.id === l.id ? '#f0fdf4' : 'transparent' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>{seller.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{l.machine_count ? `${l.machine_count} machines` : 'Machines: —'} · {fmt(l.gross_monthly_surcharge)}/mo</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{new Date(l.submitted_at).toLocaleDateString()}</div>
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            {!selected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: '15px' }}>
                Select a listing to review
              </div>
            ) : (() => {
              const seller = parseSellerInfo(selected.notes)
              return (
                <div style={{ maxWidth: '720px' }}>
                  {/* Status badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <span style={{ background: STATUS_COLORS[selected.status] + '20', color: STATUS_COLORS[selected.status], padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                      {selected.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>Submitted {new Date(selected.submitted_at).toLocaleString()}</span>
                  </div>

                  {/* Seller info */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>Seller</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      {[['Name', seller.name], ['Email', seller.email], ['Phone', seller.phone]].map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>{l}</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Route details */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>Route details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      {[
                        ['Machines', selected.machine_count?.toString() || '—'],
                        ['Ownership', selected.ownership_type || '—'],
                        ['Location types', selected.location_types || '—'],
                        ['Processor', selected.processor || '—'],
                        ['Wireless', selected.wireless_carrier || '—'],
                        ['Asking price', fmt(selected.asking_price)],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>{l}</div>
                          <div style={{ fontSize: '14px', fontWeight: 500 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financials */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>Financials</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Gross monthly surcharge</div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#2d6a4f' }}>{fmt(selected.gross_monthly_surcharge)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Net monthly cashflow</div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#2d6a4f' }}>{fmt(selected.net_monthly_cashflow)}</div>
                      </div>
                    </div>
                    {selected.gross_monthly_surcharge && selected.asking_price && (
                      <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
                        Implied multiple: <strong style={{ color: '#1a1a1a' }}>{(selected.asking_price / (selected.gross_monthly_surcharge * 12)).toFixed(1)}x revenue</strong>
                        {selected.net_monthly_cashflow && <> · <strong style={{ color: '#1a1a1a' }}>{(selected.asking_price / (selected.net_monthly_cashflow * 12)).toFixed(1)}x cashflow</ strong></>}
                      </div>
                    )}
                  </div>

                  {/* Seller notes */}
                  {seller.notes && (
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>Seller notes</div>
                      <div style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{seller.notes}</div>
                    </div>
                  )}

                  {/* Admin section */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>Admin review</div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Quality score (1–10)</label>
                      <input
                        type="number" min="1" max="10"
                        value={qualityScore}
                        onChange={e => setQualityScore(e.target.value)}
                        placeholder="e.g. 7"
                        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '120px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Admin notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        placeholder="Internal notes about this listing..."
                        style={{ width: '100%', minHeight: '80px', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => updateStatus(selected.id, 'approved')} disabled={saving} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      Approve →
                    </button>
                    <button onClick={() => updateStatus(selected.id, 'needs_edits')} disabled={saving} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      Request edits
                    </button>
                    <button onClick={() => updateStatus(selected.id, 'under_review')} disabled={saving} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      Mark reviewing
                    </button>
                    <button onClick={() => updateStatus(selected.id, 'rejected')} disabled={saving} style={{ background: '#fff', color: '#ef4444', border: '1px solid #ef4444', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      Reject
                    </button>
                  </div>

                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </>
  )
}
