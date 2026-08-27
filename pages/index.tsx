import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ATM Exits — The Trusted Marketplace for ATM Routes</title>
        <meta name="description" content="Small and mid-size ATM routes for sale. Every listing reviewed, direct to the seller, no buyer fee." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>

        {/* Nav */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.5px' }}>ATM Exits</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/listings" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>Browse</Link>
            <Link href="/sell" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>List route</Link>
            <Link href="/contact" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>Contact</Link>
            <Link href="/sell" style={{ background: '#2d6a4f', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap' }}>
              Get a valuation
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 20px 56px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#2d6a4f', fontSize: '12px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px', marginBottom: '20px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Small and mid-size routes · Direct to the seller
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1.5px', margin: '0 0 20px' }}>
            The only trusted marketplace for verified ATM routes
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 19px)', color: '#6b7280', lineHeight: 1.6, margin: '0 0 32px' }}>
            Every listing reviewed by our team. Buyers gated behind NDA. Deals structured — not wild west.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/listings" style={{ background: '#2d6a4f', color: '#fff', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
              Browse ATM routes →
            </Link>
            <Link href="/sell" style={{ background: '#fff', color: '#2d6a4f', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', border: '2px solid #2d6a4f' }}>
              List your route
            </Link>
          </div>
        </section>

        {/* Trust bar */}
        <section style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '28px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
            {[
              { stat: 'Direct', label: 'Straight to the seller' },
              { stat: 'Reviewed', label: 'Every listing checked before it posts' },
              { stat: 'No fee', label: 'Buyers pay nothing' },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 800, color: '#2d6a4f' }}>{stat}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ maxWidth: '860px', margin: '0 auto', padding: '64px 20px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '40px', textAlign: 'center' }}>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { step: '01', title: 'Sellers apply', body: 'Submit your route details through our intake wizard. We review every listing before it goes live.' },
              { step: '02', title: 'Buyers sign NDA', body: 'Serious buyers sign a mutual NDA before accessing full financials, site lists, or processor details.' },
              { step: '03', title: 'Deals close cleanly', body: 'Messaging, docs, and offers happen inside the deal room. Closing goes through escrow.' },
            ].map(({ step, title, body }) => (
              <div key={step} style={{ padding: '24px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#2d6a4f', marginBottom: '10px', letterSpacing: '1px' }}>{step}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#2d6a4f', color: '#fff', padding: '64px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 12px' }}>
            Know what your route is worth
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.85, margin: '0 0 28px' }}>
            Free valuation on your route. No obligation, no marketplace gate.
          </p>
          <Link href="/sell" style={{ background: '#fff', color: '#2d6a4f', padding: '13px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px' }}>
            Get your free valuation →
          </Link>
        </section>

        {/* Footer */}
        <footer style={{ padding: '28px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#9ca3af', flexWrap: 'wrap', gap: '12px' }}>
          <div>© 2026 ATM Exits</div>
          <div style={{ display: 'flex', gap: '20px' }}>
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
