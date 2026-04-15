import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SellerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in, redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/seller-portal')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/seller-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Seller Login | ATM Exits</title>
      </Head>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Seller Portal</h1>
            <p className="text-gray-400 text-sm">
              Enter your email to receive a secure login link
            </p>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">📬</div>
              <p className="text-white font-medium mb-2">Check your email</p>
              <p className="text-gray-400 text-sm">
                We sent a secure link to <strong className="text-white">{email}</strong>.<br />
                Click it to access your seller portal.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? 'Sending...' : 'Send login link'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-600 mt-6">
            <a href="/" className="hover:text-gray-400">← Back to ATM Exits</a>
          </p>
        </div>
      </div>
    </>
  )
}
