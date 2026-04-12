import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const STEPS = [
  'Your info',
  'Machine details',
  'Financials',
  'Processor & wireless',
  'Asking price',
]

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
}

const hintStyle = {
  fontSize: '12px',
  color: '#9ca3af',
  marginTop: '4px',
}

const fieldStyle = {
  marginBottom: '20px',
}

export default function Sell() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    // Step 0 — contact
    full_name: '',
    email: '',
    phone: '',
    // Step 1 — machines
    machine_count: '',
    location_types: '',
    ownership_type: '',
    // Step 2 — financials
    gross_monthly_surcharge: '',
    net_monthly_cashflow: '',
    // Step 3 — processor & wireless
    processor: '',
    wireless_carrier: '',
    // Step 4 — asking price
    asking_price: '',
    notes: '',
  })

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const nextStep = () => {
    setError('')
    if (!validateStep()) return
    setStep((s) => s + 1)
  }

  const prevStep = () => setStep((s) => s - 1)

  const validateStep = () => {
    if (step === 0) {
      if (!form.full_name.trim()) { setError('Please enter your name.'); return false }
      if (!form.email.trim()) { setError('Please enter your email.'); return false }
    }
    if (step === 1) {
      if (!form.machine_count) { setError('Please enter the number of machines.'); return false }
      if (!form.ownership_type) { setError('Please select ownership type.'); return false }
    }
    if (step === 2) {
      if (!form.gross_monthly_surcharge) { setError('Please enter gross monthly surcharge.'); return false }
    }
    return true
  }

  const handleSubmit = async () => {
    setError('')
    if (!validateStep()) return
    setLoading(true)

    try {
      // Save contact to users table first (upsert by email via service role would be ideal,
      // but for now we save directly to listings_pending with seller metadata in notes)
      const { error: insertError } = await supabase
        .from('listings_pending')
        .insert({
          seller_id: null, // placeholder — replaced after auth
          status: 'submitted',
          machine_count: parseInt(form.machine_count) || null,
          location_types: form.location_types || null,
          ownership_type: form.ownership_type || null,
          gross_monthly_surcharge: parseFloat(form.gross_monthly_surcharge) || null,
          net_monthly_cashflow: parseFloat(form.net_monthly_cashflow) || null,
          processor: form.processor || null,
          wireless_carrier: form.wireless_carrier || null,
          asking_price: parseFloat(form.asking_price) || null,
          notes: `SELLER: ${form.full_name} | ${form.email} | ${form.phone}\n\n${form.notes}`,
        })

      if (insertError) throw insertError
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Head><title>Application received — ATM Exits</title></Head>
        <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>✓</div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px' }}>Application received</h1>
            <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: 1.6, margin: '0 0 32px' }}>
              We review every listing before it goes live. You'll hear from us within 1–2 business days.
            </p>
            <a href="/" style={{ color: '#2d6a4f', fontWeight: 600, textDecoration: 'none' }}>← Back to ATM Exits</a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head><title>List your ATM route — ATM Exits</title></Head>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>

        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontWeight: 700, fontSize: '18px', color: '#1a1a1a', textDecoration: 'none' }}>ATM Exits</a>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>Seller application</span>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
            {STEPS.map((label, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ height: '4px', borderRadius: '2px', background: i <= step ? '#2d6a4f' : '#e5e7eb', transition: 'background 0.2s' }} />
                <div style={{ fontSize: '11px', color: i <= step ? '#2d6a4f' : '#9ca3af', marginTop: '6px', fontWeight: i === step ? 600 : 400 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '40px' }}>

            {/* Step 0: Contact */}
            {step === 0 && (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Tell us about yourself</h2>
                <p style={{ color: '#6b7280', margin: '0 0 28px', fontSize: '15px' }}>This stays private — we use it to contact you about your listing.</p>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Full name</label>
                  <input style={inputStyle} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="John Smith" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Phone <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                  <input style={inputStyle} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
                </div>
              </>
            )}

            {/* Step 1: Machine details */}
            {step === 1 && (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Machine details</h2>
                <p style={{ color: '#6b7280', margin: '0 0 28px', fontSize: '15px' }}>Tell us about the ATMs in your route.</p>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Number of machines</label>
                  <input style={inputStyle} type="number" min="1" value={form.machine_count} onChange={e => set('machine_count', e.target.value)} placeholder="e.g. 12" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Location types</label>
                  <input style={inputStyle} value={form.location_types} onChange={e => set('location_types', e.target.value)} placeholder="e.g. bar, gas station, grocery" />
                  <div style={hintStyle}>Separate multiple types with commas</div>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Ownership type</label>
                  <select style={inputStyle} value={form.ownership_type} onChange={e => set('ownership_type', e.target.value)}>
                    <option value="">Select one...</option>
                    <option value="owned">Owned — you own the machines</option>
                    <option value="placed">Placed — machines owned by a third party</option>
                    <option value="mixed">Mixed — combination of both</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 2: Financials */}
            {step === 2 && (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Financial performance</h2>
                <p style={{ color: '#6b7280', margin: '0 0 28px', fontSize: '15px' }}>Use trailing 12-month averages if possible.</p>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Gross monthly surcharge revenue ($)</label>
                  <input style={inputStyle} type="number" min="0" value={form.gross_monthly_surcharge} onChange={e => set('gross_monthly_surcharge', e.target.value)} placeholder="e.g. 8500" />
                  <div style={hintStyle}>Total surcharge collected before any expenses</div>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Net monthly cashflow ($) <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                  <input style={inputStyle} type="number" min="0" value={form.net_monthly_cashflow} onChange={e => set('net_monthly_cashflow', e.target.value)} placeholder="e.g. 5200" />
                  <div style={hintStyle}>After wireless, processing fees, and vault cash costs</div>
                </div>
              </>
            )}

            {/* Step 3: Processor & wireless */}
            {step === 3 && (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Processor & wireless</h2>
                <p style={{ color: '#6b7280', margin: '0 0 28px', fontSize: '15px' }}>This helps qualified buyers understand the route setup.</p>
                <div style={fieldStyle}>
                  <label style={labelStyle}>ATM processor</label>
                  <select style={inputStyle} value={form.processor} onChange={e => set('processor', e.target.value)}>
                    <option value="">Select one...</option>
                    <option value="PAI">PAI (Payment Alliance International)</option>
                    <option value="Nautilus Hyosung">Nautilus Hyosung</option>
                    <option value="Cardtronics">Cardtronics / Alvaria</option>
                    <option value="ATM National">ATM National</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Not sure</option>
                  </select>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Wireless carrier / provider <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                  <select style={inputStyle} value={form.wireless_carrier} onChange={e => set('wireless_carrier', e.target.value)}>
                    <option value="">Select one...</option>
                    <option value="ConnectATM">ConnectATM</option>
                    <option value="Verizon">Verizon</option>
                    <option value="AT&T">AT&T</option>
                    <option value="T-Mobile">T-Mobile</option>
                    <option value="ePay">ePay</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Not sure</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 4: Asking price */}
            {step === 4 && (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Asking price & notes</h2>
                <p style={{ color: '#6b7280', margin: '0 0 28px', fontSize: '15px' }}>We'll review your numbers and reach out if the price needs adjustment before listing.</p>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Asking price ($) <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                  <input style={inputStyle} type="number" min="0" value={form.asking_price} onChange={e => set('asking_price', e.target.value)} placeholder="e.g. 120000" />
                  <div style={hintStyle}>Leave blank if you'd like us to suggest a valuation</div>
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Anything else we should know? <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Reason for selling, contract details, geographic focus, etc."
                  />
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {step > 0 ? (
                <button onClick={prevStep} style={{ background: 'none', border: '1px solid #d1d5db', padding: '10px 24px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', color: '#374151' }}>
                  ← Back
                </button>
              ) : <div />}

              {step < STEPS.length - 1 ? (
                <button onClick={nextStep} style={{ background: '#2d6a4f', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
                  Continue →
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} style={{ background: loading ? '#9ca3af' : '#2d6a4f', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Submitting...' : 'Submit listing →'}
                </button>
              )}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '24px' }}>
            Every listing is reviewed before going live. We typically respond within 1–2 business days.
          </p>
        </div>
      </div>
    </>
  )
}
