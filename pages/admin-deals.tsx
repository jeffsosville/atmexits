import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

type Deal = {
  id: string
  status: string
  listing_id: string
  created_at: string
  listing: { slug: string; teaser_location_state: string | null; teaser_machine_count: number | null; asking_price: number | null }
  messages: { id: string; body: string; sent_at: string; sender_name: string; sender_role: string }[]
  offers: { id: string; amount: number; status: string; terms_notes: string | null; submitted_at: string }[]
}

const fmt = (n: number) => '$' + n.toLocaleString()

export default function AdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Deal | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => { fetchDeals() }, [])

  async function fetchDeals() {
    setLoading(true)
    const { data: rooms } = await supabase.from('deal_rooms').select('*').order('created_at', { ascending: false })
    if (!rooms) { setLoading(false); return }

    const enriched = await Promise.all(rooms.map(async (room: any) => {
      const { data: listing } = await supabase.from('listings_live').select('slug,teaser_location_state,teaser_machine_count,asking_price').eq('id', room.listing_id).single()
      const { data: messages } = await supabase.from('messages').select('*').eq('deal_room_id', room.id).order('sent_at')
      const { data: offers } = await supabase.from('offers').select('*').eq('deal_room_id', room.id).order('submitted_at')
      return { ...room, listing: listing || {}, messages: messages || [], offers: offers || [] }
    }))

    setDeals(enriched)
    if (enriched.length > 0 && !selected) setSelected(enriched[0])
    setLoading(false)
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    await fetch('/api/deal-room/message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_room_id: selected.id, body: reply, sender_name: 'ATM Exits', sender_role: 'seller' }),
    })
    setReply('')
    await fetchDeals()
    setSending(false)
  }

  async function updateDealStatus(id: string, status: string) {
    await supabase.from('deal_rooms').update({ status }).eq('id', id)
    fetchDeals()
  }

  const STATUS_COLORS: Record<string, string> = {
    open: '#2d6a4f', loi_submitted: '#3b82f6', in_diligence: '#8b5cf6',
    closing: '#f59e0b', closed_won: '#10b981', closed_lost: '#9ca3af'
  }

  return (
    <>
      <Head><title>Deal Rooms | ATM Exits Admin</title></Head>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>

        <div style={{ background: '#1a1a1a', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>ATM Exits · Deal Rooms</div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/admin" style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'none' }}>Listings</Link>
            <Link href="/admin-deals" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Deal Rooms</Link>
            <Link href="/" style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'none' }}>← Site</Link>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 50px)' }}>

          {/* Sidebar — deal list */}
          <div style={{ width: '300px', background: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {deals.length} Active deal{deals.length !== 1 ? 's' : ''}
            </div>
            {loading ? (
              <div style={{ padding: '24px', color: '#9ca3af', fontSize: '14px' }}>Loading...</div>
            ) : deals.map(deal => (
              <div key={deal.id} onClick={() => setSelected(deal)}
                style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected?.id === deal.id ? '#f0fdf4' : 'transparent' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
                  {deal.listing?.teaser_location_state || 'Unknown'} — {deal.listing?.teaser_machine_count || '?'} machines
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', background: (STATUS_COLORS[deal.status] || '#9ca3af') + '20', color: STATUS_COLORS[deal.status] || '#9ca3af', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                    {deal.status.replace('_', ' ')}
                  </span>
                  {deal.messages.length > 0 && <span style={{ fontSize: '12px', color: '#6b7280' }}>{deal.messages.length} msg</span>}
                  {deal.offers.length > 0 && <span style={{ fontSize: '12px', color: '#2d6a4f', fontWeight: 600 }}>{deal.offers.length} offer{deal.offers.length !== 1 ? 's' : ''}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Main — deal detail */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
            {!selected ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', marginTop: '80px' }}>Select a deal room</div>
            ) : (
              <div style={{ maxWidth: '720px' }}>

                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>
                      {selected.listing?.teaser_location_state} ATM Route — {selected.listing?.teaser_machine_count} machines
                    </h1>
                    {selected.listing?.asking_price && <div style={{ fontSize: '14px', color: '#6b7280' }}>Asking {fmt(selected.listing.asking_price)}</div>}
                  </div>
                  <select value={selected.status} onChange={e => updateDealStatus(selected.id, e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                    <option value="open">Open</option>
                    <option value="loi_submitted">LOI submitted</option>
                    <option value="in_diligence">In diligence</option>
                    <option value="closing">Closing</option>
                    <option value="closed_won">Closed — won</option>
                    <option value="closed_lost">Closed — lost</option>
                  </select>
                </div>

                {/* Offers */}
                {selected.offers.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Offers</div>
                    {selected.offers.map(o => (
                      <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9fafb', borderRadius: '8px', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '20px', color: '#2d6a4f' }}>{fmt(o.amount)}</div>
                          {o.terms_notes && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{o.terms_notes}</div>}
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{new Date(o.submitted_at).toLocaleString()}</div>
                        </div>
                        <span style={{ background: '#f0fdf4', color: '#2d6a4f', padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Messages</div>
                  {selected.messages.length === 0 ? (
                    <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 16px' }}>No messages yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      {selected.messages.map(m => {
                        const isSeller = m.sender_role === 'seller'
                        return (
                          <div key={m.id} style={{ padding: '12px 16px', background: isSeller ? '#f0fdf4' : '#f9fafb', borderRadius: '8px', border: isSeller ? '1px solid #bbf7d0' : '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{m.sender_name || (isSeller ? 'ATM Exits' : 'Buyer')}</span>
                                <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px', borderRadius: '20px', background: isSeller ? '#2d6a4f' : '#e5e7eb', color: isSeller ? '#fff' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {isSeller ? 'Seller' : 'Buyer'}
                                </span>
                              </div>
                              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(m.sent_at).toLocaleString()}</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: 1.5 }}>{m.body}</p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Reply as seller */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#2d6a4f', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reply as Seller</div>
                    <textarea value={reply} onChange={e => setReply(e.target.value)}
                      placeholder="Type your reply to the buyer..."
                      style={{ width: '100%', minHeight: '80px', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '10px' }} />
                    <button onClick={sendReply} disabled={sending || !reply.trim()}
                      style={{ background: sending || !reply.trim() ? '#9ca3af' : '#2d6a4f', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                      {sending ? 'Sending...' : 'Send reply as Seller'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
