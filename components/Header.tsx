import Link from 'next/link'

export default function Header() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', borderBottom: '1px solid #e5e7eb', fontFamily: 'system-ui, sans-serif' }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px', color: '#1a1a1a', textDecoration: 'none' }}>
        ATM Exits
      </Link>
      <div style={{ display: 'flex', gap: '32px', fontSize: '15px', alignItems: 'center' }}>
        <Link href="/listings" style={{ color: '#374151', textDecoration: 'none' }}>Browse routes</Link>
        <Link href="/sell" style={{ color: '#374151', textDecoration: 'none' }}>List your route</Link>
        <Link href="/contact" style={{ color: '#374151', textDecoration: 'none' }}>Contact</Link>
        <Link href="/sell" style={{ background: '#2d6a4f', color: '#fff', padding: '8px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
          Get a valuation →
        </Link>
      </div>
    </nav>
  )
}
