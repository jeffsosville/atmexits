import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  async function login() {
    setLoading(true); setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) { router.push('/admin') } else { setError('Incorrect password') }
    setLoading(false)
  }
  return (
    <>
      <Head><title>Admin Login | ATM Exits</title></Head>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '360px', margin: '0 16px' }}>
          <div style={{ fontWeight: 700, fontSize: '20px', marginBottom: '4px' }}>ATM Exits</div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>Admin access</div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' as const, fontFamily: 'inherit', marginBottom: '12px' }}
            placeholder="Enter admin password" autoFocus />
          {error && <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <button onClick={login} disabled={loading}
            style={{ width: '100%', background: '#2d6a4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </div>
      </div>
    </>
  )
}
