import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Listing = {
  id: string
  business_name: string
  status: string
  asking_price: number
  num_machines: number
  created_at: string
}

type Message = {
  id: string
  content: string
  sender_name: string
  role: string
  created_at: string
}

type DealRoom = {
  id: string
  listing_id: string
  buyer_name: string
  buyer_email: string
  status: string
  messages: Message[]
}

export default function SellerPortal() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/seller-login')
        return
      }
      setUser(session.user)
      loadSellerData(session.user.email!)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/seller-login')
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadSellerData(email: string) {
    // Find their listing by seller_email
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_email', email)
      .order('created_at', { ascending: false })
      .limit(1)

    if (listings && listings.length > 0) {
      const myListing = listings[0]
      setListing(myListing)

      // Load deal rooms for this listing
      const { data: rooms } = await supabase
        .from('deal_rooms')
        .select(`*, messages:deal_messages(*)`)
        .eq('listing_id', myListing.id)
        .order('created_at', { ascending: false })

      setDealRooms(rooms || [])
    }

    setLoading(false)
  }

  async function sendReply(dealRoomId: string) {
    const content = replyText[dealRoomId]?.trim()
    if (!content) return
    setSending(dealRoomId)

    const { error } = await supabase.from('deal_messages').insert({
      deal_room_id: dealRoomId,
      content,
      sender_name: listing?.business_name || 'Seller',
      role: 'seller',
    })

    if (!error) {
      setReplyText(prev => ({ ...prev, [dealRoomId]: '' }))
      await loadSellerData(user.email)
    }
    setSending(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      under_offer: 'bg-blue-100 text-blue-800',
      sold: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading your portal...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Seller Portal | ATM Exits</title>
      </Head>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-green-400">ATM Exits</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-300">Seller Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          {!listing ? (
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <p className="text-gray-400">No listing found for {user?.email}.</p>
              <a href="/sell" className="mt-4 inline-block text-green-400 underline">Submit a listing</a>
            </div>
          ) : (
            <>
              {/* Listing summary */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{listing.business_name}</h2>
                    <p className="text-gray-400 text-sm mt-1">Submitted {new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(listing.status)}`}>
                    {listing.status?.replace('_', ' ') || 'Pending Review'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Machines</span>
                    <p className="font-medium">{listing.num_machines}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Asking Price</span>
                    <p className="font-medium">${listing.asking_price?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Deal Rooms */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Buyer Inquiries ({dealRooms.length})
                </h3>
                {dealRooms.length === 0 ? (
                  <div className="bg-gray-900 rounded-xl p-6 text-center text-gray-500">
                    No buyers have submitted an NDA yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {dealRooms.map(room => (
                      <div key={room.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{room.buyer_name}</p>
                            <p className="text-sm text-gray-400">{room.buyer_email}</p>
                          </div>
                          <span className="text-xs text-gray-500">{room.messages?.length || 0} messages</span>
                        </div>

                        {/* Messages */}
                        <div className="px-6 py-4 space-y-3 max-h-64 overflow-y-auto">
                          {(room.messages || [])
                            .sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((msg: Message) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.role === 'seller' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                                  msg.role === 'seller'
                                    ? 'bg-green-700 text-white'
                                    : 'bg-gray-800 text-gray-200'
                                }`}>
                                  <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                                  <p>{msg.content}</p>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Reply box */}
                        <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
                          <input
                            type="text"
                            value={replyText[room.id] || ''}
                            onChange={e => setReplyText(prev => ({ ...prev, [room.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && sendReply(room.id)}
                            placeholder="Reply to buyer..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                          />
                          <button
                            onClick={() => sendReply(room.id)}
                            disabled={sending === room.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
                          >
                            {sending === room.id ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
