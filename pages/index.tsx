import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ATM Exits — The Trusted Marketplace for ATM Routes</title>
        <meta name="description" content="Buy and sell verified ATM routes. Built by ATM Brokerage — 200+ closed transactions, $100M+ in deal volume since 2013." />
      </Head>

      <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>

        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px' }}>ATM Exits</div>
          <div style={{ display: 'flex', gap: '32px', fontSize: '15px', alignItems: 'center' }}>
            <Link href="/listings" style={{ color: '#374151', textDecoration: 'none' }}>Browse routes</Link>
            <Link href="/sell" style={{ color: '#374151', textDecoration: 'none' }}>List your route</Link>
            <Link href="/contact" style={{ color: '#374151', textDecoration: 'none' }}>Contact</Link>
            <Link href="/sell" style={{ background: '#2d6a4f', color: '#fff', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
              Get a valuation →
            </Link>
          </div>
        </nav>

        <section style={{ maxWidth: '760px', margin: '0 auto', padding: '96px 24px 72px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#2d6a4f', fontSize: '13px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px', marginBottom: '24px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            By ATM Brokerage · 200+ closed transactions
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', margin: '0 0 24px' }}>
            The only trusted marketplace for verified ATM routes
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', lineHeight: 1.6, margin: '0 0 40px' }}>
            Every listing reviewed by our team. Buyers gated behind NDA. Deals structured — not wild west.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/listings" style={{ background: '#2d6a4f', color: '#fff', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '16px' }}>
              Browse ATM routes →
            </Link>
            <Link href="/sell" style={{ background: '#fff', color: '#2d6a4f', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '16px', border: '2px solid #2d6a4f' }}>
              List your route
            </Link>
          </div>
        </section>

        <section style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '32px 48px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
            {[
              { stat: '200+', label: 'Closed transactions' },
              { stat: '$100M+', label: 'In deal volume since 2013' },
              { stat: '100%', label: 'Listings reviewed by our team' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#2d6a4f' }}>{stat}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', marginBottom: '48px', textAlign: 'center' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { step: '01', title: 'Sellers apply', body: 'Submit your route details through our intake wizard. We review every listing before it goes live — no junk.' },
              { step: '02', title: 'Buyers sign NDA', body: 'Serious buyers create an account and sign a mutual NDA before accessing full financials, site lists, or processor details.' },
              { step: '03', title: 'Deals close cleanly', body: 'Messaging, docs, and offers happen inside the deal room. Closing goes through escrow. We track every step.' },
            ].map(({ step, title, body }) => (
              <div key={step} style={{ padding: '32px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#2d6a4f', marginBottom: '12px', letterSpacing: '1px' }}>{step}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>{title}</h3>
                <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: '#2d6a4f', color: '#fff', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', margin: '0 0 16px' }}>
            Know what your route is worth
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.85, margin: '0 0 36px' }}>
            Get a free valuation from the team that has closed more ATM route transactions than anyone in the country.
          </p>
          <Link href="/sell" style={{ background: '#fff', color: '#2d6a4f', padding: '14px 36px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '16px' }}>
            Get your free valuation →
          </Link>
        </section>

        <footer style={{ padding: '40px 48px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#9ca3af' }}>
          <div>© 2026 ATM Exits · Built by ATM Brokerage</div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms</Link>
            <Link href="/contact" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</Link>
          </div>
        </footer>

      </div>
    </>
  )
}

export default Home
