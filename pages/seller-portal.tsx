import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type UserProfile = { id: string; email: string; full_name: string }
type Listing = { id: string; status: string; machine_count: number; asking_price: number; submitted_at: string; gross_monthly_surcharge: number }
type Message = { id: string; body: string; sender_name: string; sender_role: string; sent_at: string }
type DealRoom = { id: string; status: string; listing_id: string; buyer_name: string; buyer_email: string; messages: Message[] }

export default function SellerPortal() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'listings' | 'buyers'>('listings')
  const dataLoaded = useRef(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && !dataLoaded.current) {
        dataLoaded.current = true
        setAuthed(true)
        await loadData(session.user.id, session.user.email!)
      } else if (!session && event === 'SIGNED_OUT') {
        router.replace('/seller-login')
      }
    })

    // Fallback: if no auth event fires within 5s, redirect to login
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.replace('/seller-login')
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function loadData(authUserId: string, authEmail: string) {
    await supabase.from('users').upsert(
      { id: authUserId, email: authEmail, role: 'seller' },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    const { data: user } = await supabase.from('users').select('*').eq('id', authUserId).single()
    setProfile(user || { id: authUserId, email: authEmail, full_name: '' })
    await loadListingsAndRooms(authUserId)
  }

  async function loadListingsAndRooms(sellerId: string) {
    const { data: pending } = await supabase
      .from('listings_pending').select('*').eq('seller_id', sellerId)
      .order('submitted_at', { ascending: false })
    setListings(pending || [])

    const { data: rooms } = await supabase
      .from('deal_rooms').select('*, messages(*)')
      .eq('seller_id', sellerId).order('created_at', { ascending: false })

    if (rooms && rooms.length > 0) {
      const enriched = await Promise.all(rooms.map(async (room: any) => {
        const { data: nda } = await supabase.from('ndas').select('user_id')
          .eq('listing_id', room.listing_id).neq('user_id', sellerId).limit(1).single()
        let buyer_name = 'Anonymous Buyer', buyer_email = ''
        if (nda?.user_id) {
          const { data: buyer } = await supabase.from('users').select('full_name, email').eq('id', nda.user_id).single()
          if (buyer) { buyer_name = buyer.full_name || buyer.email; buyer_email = buyer.email }
        }
        return { ...room, buyer_name, buyer_email,
          messages: (room.messages || []).sort((a: Message, b: Message) =>
            new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()) }
      }))
      setDealRooms(enriched)
    } else setDealRooms([])

    setLoading(false)
  }

  async function sendReply(dealRoomId: string) {
    const body = replyText[dealRoomId]?.trim()
    if (!body || !profile) return
    setSending(dealRoomId)
    await supabase.from('messages').insert({
      deal_room_id: dealRoomId, sender_id: profile.id,
      sender_name: profile.full_name || 'Seller', sender_role: 'seller', body, read: false,
    })
    setReplyText(prev => ({ ...prev, [dealRoomId]: '' }))
    await loadListingsAndRooms(profile.id)
    setSending(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const statusColor = (s: string) => ({
    pending: 'bg-yellow-900 text-yellow-300', approved: 'bg-green-900 text-green-300',
    rejected: 'bg-red-900 text-red-300', active: 'bg-blue-900 text-blue-300',
  }[s] || 'bg-gray-800 text-gray-400')

  // Still waiting for auth
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-lg">Loading your portal...</div>
    </div>
  )

  return (
    <>
      <Head><title>Seller Portal | ATM Exits</title></Head>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-green-400">ATM Exits</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-300 text-sm">Seller Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{profile?.email}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-white transition-colors">Sign out</button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1>
            <p className="text-gray-400 text-sm mt-1">{listings.length} listing{listings.length !== 1 ? 's' : ''} · {dealRooms.length} buyer inquiry{dealRooms.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1 w-fit">
            {(['listings', 'buyers'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>
                {tab === 'buyers' ? `Buyer Inquiries (${dealRooms.length})` : `My Listings (${listings.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'listings' && (
            <div className="space-y-4">
              {listings.length === 0 ? (
                <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
                  <p className="text-gray-400 mb-4">No listings submitted yet.</p>
                  <a href="/sell" className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm transition-colors">List Your ATM Route →</a>
                </div>
              ) : listings.map(listing => (
                <div key={listing.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg">{listing.machine_count} Machine ATM Route</p>
                      <p className="text-gray-400 text-sm">Submitted {new Date(listing.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(listing.status)}`}>{listing.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><p className="text-gray-500 text-xs mb-1">Machines</p><p className="font-medium">{listing.machine_count}</p></div>
                    <div><p className="text-gray-500 text-xs mb-1">Monthly Surcharge</p><p className="font-medium">${listing.gross_monthly_surcharge?.toLocaleString()}</p></div>
                    <div><p className="text-gray-500 text-xs mb-1">Asking Price</p><p className="font-medium text-green-400">${listing.asking_price?.toLocaleString()}</p></div>
                  </div>
                  {listing.status === 'pending' && (
                    <p className="mt-4 text-xs text-yellow-500 bg-yellow-950 rounded-lg px-3 py-2">⏳ Under review by ATM Exits. You'll be notified once approved.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'buyers' && (
            <div className="space-y-6">
              {dealRooms.length === 0 ? (
                <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
                  <p className="text-gray-400">No buyer inquiries yet. They'll appear here after buyers sign an NDA.</p>
                </div>
              ) : dealRooms.map(room => (
                <div key={room.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <div><p className="font-medium">{room.buyer_name}</p><p className="text-sm text-gray-400">{room.buyer_email}</p></div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor(room.status)}`}>{room.status}</span>
                      <p className="text-xs text-gray-600 mt-1">{room.messages.length} messages</p>
                    </div>
                  </div>
                  <div className="px-6 py-4 space-y-3 max-h-72 overflow-y-auto">
                    {room.messages.length === 0 && <p className="text-gray-600 text-sm text-center py-4">No messages yet</p>}
                    {room.messages.map((msg: Message) => (
                      <div key={msg.id} className={`flex ${msg.sender_role === 'seller' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm px-4 py-3 rounded-2xl text-sm ${msg.sender_role === 'seller' ? 'bg-green-700 text-white rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-bl-sm'}`}>
                          <p className="text-xs opacity-60 mb-1">{msg.sender_name} · {new Date(msg.sent_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                          <p>{msg.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
                    <input type="text" value={replyText[room.id] || ''}
                      onChange={e => setReplyText(prev => ({ ...prev, [room.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && sendReply(room.id)}
                      placeholder="Reply to buyer..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                    <button onClick={() => sendReply(room.id)}
                      disabled={sending === room.id || !replyText[room.id]?.trim()}
                      className="px-5 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors">
                      {sending === room.id ? '...' : 'Send'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
