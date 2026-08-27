import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const fmt = (n: number) => '$' + n.toLocaleString()
const inp: any = { width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' }

export default function DealRoomPage({ dealRoom, listing, messages: init_msgs, offers: init_offers, buyerEmail, buyerName }: any) {
  const [messages, setMessages] = useState(init_msgs)
  const [offers, setOffers] = useState(init_offers)
  const [msgBody, setMsgBody] = useState('')
  const [offerAmount, setOfferAmount] = useState('')
  const [offerTerms, setOfferTerms] = useState('')
  const [sending, setSending] = useState(false)
  const [submittingOffer, setSubmittingOffer] = useState(false)
  const [tab, setTab] = useState('details')
  const fd = listing.full_data || {}

  async function sendMessage() {
    if (!msgBody.trim()) return
    setSending(true)
    const res = await fetch('/api/deal-room/message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_room_id: dealRoom.id, body: msgBody, sender_name: buyerName, sender_email: buyerEmail }),
    })
    if (res.ok) {
      setMessages((prev: any) => [...prev, { id: Date.now().toString(), body: msgBody, sent_at: new Date().toISOString(), sender_name: buyerName }])
      setMsgBody('')
    }
    setSending(false)
  }

  async function submitOffer() {
    if (!offerAmount) return
    setSubmittingOffer(true)
    const res = await fetch('/api/deal-room/offer', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_room_id: dealRoom.id, amount: parseFloat(offerAmount), terms_notes: offerTerms, buyer_email: buyerEmail }),
    })
    if (res.ok) {
      setOffers((prev: any) => [...prev, { id: Date.now().toString(), amount: parseFloat(offerAmount), status: 'submitted', terms_notes: offerTerms, submitted_at: new Date().toISOString() }])
      setOfferAmount(''); setOfferTerms('')
    }
    setSubmittingOffer(false)
  }

  const tabBtn = (t: string, label: string) => (
    <button onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: tab === t ? 600 : 400, background: tab === t ? '#2d6a4f' : 'transparent', color: tab === t ? '#fff' : '#6b7280' }}>
      {label}
    </button>
  )

  return (
    <>
      <Head><title>Deal Room | ATM Exits</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
        <nav style={{ background: '#1a1a1a', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: '17px', color: '#fff', textDecoration: 'none' }}>ATM Exits</Link>
          <span style={{ fontSize: '12px', color: '#9ca3af', background: '#2a2a2a', padding: '4px 12px', borderRadius: '20px' }}>Deal Room</span>
        </nav>

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 16px' }}>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>
                {listing.teaser_location_state} ATM Route{listing.teaser_machine_count ? ' — ' + listing.teaser_machine_count + ' machines' : ''}
              </h1>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{buyerName} &middot; {buyerEmail}</div>
            </div>
            <span style={{ background: '#f0fdf4', color: '#2d6a4f', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>Active</span>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '6px', flexWrap: 'wrap' }}>
            {tabBtn('details', 'Route details')}
            {tabBtn('messages', 'Messages' + (messages.length > 0 ? ' (' + messages.length + ')' : ''))}
            {tabBtn('offer', 'Submit offer' + (offers.length > 0 ? ' (' + offers.length + ')' : ''))}
          </div>

          {tab === 'details' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                {listing.asking_price && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Asking price</div><div style={{ fontSize: '22px', fontWeight: 700 }}>{fmt(listing.asking_price)}</div></div>}
                {fd.machines && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Machines</div><div style={{ fontSize: '22px', fontWeight: 700 }}>{fd.machines}</div></div>}
                {fd.gross_monthly && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Gross monthly</div><div style={{ fontSize: '22px', fontWeight: 700, color: '#2d6a4f' }}>{'$' + fd.gross_monthly.toLocaleString()}</div></div>}
                {fd.net_monthly && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Net monthly</div><div style={{ fontSize: '22px', fontWeight: 700, color: '#2d6a4f' }}>{'$' + fd.net_monthly.toLocaleString()}</div></div>}
                {fd.processor && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Processor</div><div style={{ fontSize: '16px', fontWeight: 600 }}>{fd.processor}</div></div>}
                {fd.wireless && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Wireless</div><div style={{ fontSize: '16px', fontWeight: 600 }}>{fd.wireless}</div></div>}
                {fd.ownership && <div><div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Ownership</div><div style={{ fontSize: '16px', fontWeight: 600, textTransform: 'capitalize' }}>{fd.ownership}</div></div>}
              </div>
              {listing.asking_price && fd.gross_monthly && (
                <div style={{ padding: '14px', background: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                  Implied multiple: <strong style={{ color: '#1a1a1a' }}>{(listing.asking_price / (fd.gross_monthly * 12)).toFixed(1)}x revenue</strong>
                  {fd.net_monthly && <span> &middot; <strong style={{ color: '#1a1a1a' }}>{(listing.asking_price / (fd.net_monthly * 12)).toFixed(1)}x cashflow</strong></span>}
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setTab('offer')} style={{ background: '#2d6a4f', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Submit an offer</button>
                <button onClick={() => setTab('messages')} style={{ background: 'none', border: '1px solid #d1d5db', padding: '11px 20px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#374151' }}>Ask a question</button>
              </div>
            </div>
          )}

          {tab === 'messages' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px' }}>Messages</h2>
              {messages.length === 0 ? (
                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>No messages yet. Ask a question below.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {messages.map((m: any) => {
                    const isSeller = m.sender_role === 'seller'
                    return (
                      <div key={m.id} style={{ padding: '12px 16px', background: isSeller ? '#f0fdf4' : '#f9fafb', borderRadius: '8px', border: isSeller ? '1px solid #bbf7d0' : '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{m.sender_name || (isSeller ? 'ATM Exits' : 'Buyer')}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, padding: '1px 8px', borderRadius: '20px', background: isSeller ? '#2d6a4f' : '#e5e7eb', color: isSeller ? '#fff' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {isSeller ? 'Seller' : 'Buyer'}
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(m.sent_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: 1.5 }}>{m.body}</p>
                      </div>
                    )
                  })}
                </div>
              )}
              <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Ask a question about this route..." style={{ ...inp, minHeight: '80px', resize: 'vertical', marginBottom: '10px' }} />
              <button onClick={sendMessage} disabled={sending || !msgBody.trim()} style={{ background: sending || !msgBody.trim() ? '#9ca3af' : '#2d6a4f', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                {sending ? 'Sending...' : 'Send message'}
              </button>
            </div>
          )}

          {tab === 'offer' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px' }}>Submit an offer</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 20px' }}>
                {listing.asking_price ? 'Asking price is ' + fmt(listing.asking_price) + '. ' : ''}Offers are non-binding until a Letter of Intent is signed.
              </p>
              {offers.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your offers</div>
                  {offers.map((o: any) => (
                    <div key={o.id} style={{ padding: '14px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '18px' }}>{fmt(o.amount)}</div>
                        {o.terms_notes && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{o.terms_notes}</div>}
                      </div>
                      <span style={{ background: '#f0fdf4', color: '#2d6a4f', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Offer amount ($)</label>
                <input style={inp} type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} placeholder={listing.asking_price ? String(listing.asking_price) : '150000'} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Terms / notes <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                <textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={offerTerms} onChange={e => setOfferTerms(e.target.value)} placeholder="e.g. Cash offer, 30-day close, subject to site verification" />
              </div>
              <button onClick={submitOffer} disabled={submittingOffer || !offerAmount} style={{ background: submittingOffer || !offerAmount ? '#9ca3af' : '#2d6a4f', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                {submittingOffer ? 'Submitting...' : 'Submit offer'}
              </button>
            </div>
          )}

        </div>

        <footer style={{ borderTop: '1px solid #e5e7eb', padding: '20px 16px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
          &copy; 2026 ATM Exits
        </footer>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const id = params?.id as string
  const buyerEmail = req.cookies.buyer_email ? decodeURIComponent(req.cookies.buyer_email) : ''
  const buyerName = req.cookies.buyer_name ? decodeURIComponent(req.cookies.buyer_name) : 'Buyer'
  if (!buyerEmail) return { redirect: { destination: '/listings', permanent: false } }
  const { data: dealRoom } = await supabase.from('deal_rooms').select('*').eq('id', id).single()
  if (!dealRoom) return { notFound: true }
  const { data: listing } = await supabase.from('listings_live').select('*').eq('id', dealRoom.listing_id).single()
  const { data: messages } = await supabase.from('messages').select('*').eq('deal_room_id', id).order('sent_at')
  const { data: offers } = await supabase.from('offers').select('*').eq('deal_room_id', id).order('submitted_at')
  return { props: { dealRoom, listing, messages: messages || [], offers: offers || [], buyerEmail, buyerName } }
}
