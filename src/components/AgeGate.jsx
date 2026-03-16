import { C } from '../constants/colors'

export default function AgeGate({ onAccept, onOpenLegal }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      style={{
        position: 'fixed', inset: 0, background: C.bg, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: "'Outfit',sans-serif",
      }}
    >
      <div style={{
        background: C.sf, borderRadius: 24, padding: '40px 36px',
        maxWidth: 500, width: '100%',
        border: `1px solid ${C.bd}`,
        boxShadow: `0 40px 120px rgba(0,0,0,.85), 0 0 80px ${C.vG}`,
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ fontSize: 52, marginBottom: 16 }}>🔐</div>
        <div id="age-gate-title" style={{ fontSize: 28, fontWeight: 900, color: C.tx, marginBottom: 6, letterSpacing: '0.05em' }}>
          VERD<span style={{ color: C.vio }}>1</span>CT
        </div>
        <div style={{ fontSize: 10, color: C.vio, letterSpacing: '0.35em', fontWeight: 800, textTransform: 'uppercase', marginBottom: 28 }}>
          Prediction Exchange
        </div>

        <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.85, marginBottom: 10 }}>
          VERD1CT involves real financial prediction markets. Access is restricted to users who are <strong style={{ color: C.tx }}>18 years of age or older</strong> and reside in a jurisdiction where prediction markets are permitted.
        </p>
        <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 32 }}>
          By entering, you confirm your age and agree to our{' '}
          <button
            onClick={() => onOpenLegal('tos')}
            style={{ background: 'none', border: 'none', color: C.vio, cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: 0, textDecoration: 'underline' }}
          >Terms of Service</button>
          {' '}and{' '}
          <button
            onClick={() => onOpenLegal('privacy')}
            style={{ background: 'none', border: 'none', color: C.vio, cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: 0, textDecoration: 'underline' }}
          >Privacy Policy</button>.
        </p>

        <button
          onClick={onAccept}
          autoFocus
          style={{
            width: '100%', padding: '16px 0', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg,${C.vio},#5b3fd4)`,
            color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer',
            fontFamily: "'Outfit',sans-serif", letterSpacing: .3,
            boxShadow: `0 8px 30px ${C.vG}`, marginBottom: 12,
          }}
        >
          I am 18 or older — Enter
        </button>

        <p style={{ fontSize: 11, color: C.dim }}>
          If you are under 18 or prediction markets are prohibited in your jurisdiction, please leave now.
        </p>
      </div>
    </div>
  )
}
