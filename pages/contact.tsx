import Head from 'next/head'
import Link from 'next/link'

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact | ATM Exits</title>
        <meta name="description" content="Get in touch with ATM Exits about buying or selling an ATM route." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
        <nav style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: '18px', color: '#1a1a1a', textDecoration: 'none' }}>ATM Exits</Link>
          <Link href="/sell" style={{ background: '#2d6a4f', color: '#fff', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>List your route</Link>
        </nav>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 8px' }}>Contact us</h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 40px' }}>Questions about buying or selling an ATM route? We typically respond within one business day.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Email</div>
              <a href="mailto:hello@atmexits.com" style={{ fontSize: '18px', fontWeight: 600, color: '#2d6a4f', textDecoration: 'none' }}>hello@atmexits.com</a>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Sellers</div>
              <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 12px', lineHeight: 1.6 }}>Ready to list your ATM route? Submit through our intake form and we will review within 1-2 business days.</p>
              <Link href="/sell" style={{ color: '#2d6a4f', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Start your listing &rarr;</Link>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Buyers</div>
              <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 12px', lineHeight: 1.6 }}>Browse available routes and sign NDA to access full financials, site lists, and processor details.</p>
              <Link href="/listings" style={{ color: '#2d6a4f', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Browse ATM routes &rarr;</Link>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>About</div>
              <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 12px', lineHeight: 1.6 }}>ATM Exits is the national marketplace for verified ATM route transactions &mdash; 200+ closed deals since 2013.</p>
              <Link href="/why" style={{ color: '#2d6a4f', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>Why ATM Exits &rarr;</Link>
            </div>
          </div>
        </div>
        <footer style={{ borderTop: '1px solid #e5e7eb', padding: '24px 16px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
          &copy; 2026 ATM Exits
        </footer>
      </div>
    </>
  )
}
