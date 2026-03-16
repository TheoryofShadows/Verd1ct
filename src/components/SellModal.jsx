import { useState, useEffect, useRef } from 'react'
import { C } from '../constants/colors'

export default function SellModal({ position, liveMarkets, onClose, onSell }) {
  const [confirmed, setConfirmed] = useState(false)
  const closeRef = useRef(null)

  // Focus close button on open; restore focus on close
  useEffect(() => {
    closeRef.current?.focus()
    const prev = document.activeElement
    return () => prev?.focus()
  }, [])

  // Escape to close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const market = liveMarkets.find(m => m.q === position.mkt)
  if (!market) return null

  const curPrice = Math.round((position.s === 'YES' ? market.yes : 1 - market.yes) * 100)
  const currentValue = parseFloat((position.qty * curPrice / 100).toFixed(2))
  const pnl = parseFloat((currentValue - (position.qty * position.avg / 100)).toFixed(2))
  const pnlPct = parseFloat(((pnl / (position.qty * position.avg / 100)) * 100).toFixed(1))

  function handleSell() {
    onSell(position.id, currentValue)
    setConfirmed(true)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-modal-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 1001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.sf, borderRadius: 24, width: '100%', maxWidth: 440,
          padding: 32, border: `1px solid ${C.bd}`,
          boxShadow: `0 40px 120px rgba(0,0,0,.8), 0 0 60px ${C.rG}`,
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {confirmed ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: C.tx, marginBottom: 8 }}>Position Closed</h3>
            <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.7 }}>
              <span style={{ color: C.mint, fontWeight: 800 }}>${currentValue.toFixed(2)}</span> returned to your balance.
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: 24, padding: '10px 32px', borderRadius: 12, background: C.vG, border: `1px solid ${C.vio}`, color: C.vio, fontWeight: 800, cursor: 'pointer', fontSize: 14 }}
            >Done</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 id="sell-modal-title" style={{ fontSize: 18, fontWeight: 900, color: C.tx }}>Close Position</h3>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close"
                style={{ background: C.card, border: `1px solid ${C.bd}`, color: C.sub, width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 16 }}
              >✕</button>
            </div>

            {/* Market question */}
            <p style={{ fontSize: 13, color: C.sub, marginBottom: 20, lineHeight: 1.65 }}>{position.mkt}</p>

            {/* Position summary */}
            <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 20, border: `1px solid ${C.bd}` }}>
              {[
                { l: 'Side',         v: position.s,              c: position.s === 'YES' ? C.mint : C.red },
                { l: 'Contracts',    v: String(position.qty)                                               },
                { l: 'Avg price',    v: `${position.avg}¢`                                                },
                { l: 'Current',      v: `${curPrice}¢`,           c: C.sky                               },
                { l: 'Value now',    v: `$${currentValue.toFixed(2)}`, c: C.tx                            },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < 4 ? 10 : 0 }}>
                  <span style={{ fontSize: 12, color: C.dim }}>{r.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: r.c || C.tx, fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</span>
                </div>
              ))}
              {/* P&L row */}
              <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.tx }}>P&L</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: pnl >= 0 ? C.mint : C.red }}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: pnl >= 0 ? C.mint : C.red, opacity: .7 }}>
                    {pnlPct >= 0 ? '+' : ''}{pnlPct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm sell */}
            <button
              onClick={handleSell}
              style={{
                width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
                background: `linear-gradient(135deg,${C.red},#cc1850)`,
                color: '#fff', fontSize: 15, fontWeight: 900, cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif", letterSpacing: .3,
                boxShadow: `0 8px 28px ${C.rG}`,
              }}
            >
              Sell — Receive ${currentValue.toFixed(2)}
            </button>
            <p style={{ fontSize: 11, color: C.dim, textAlign: 'center', marginTop: 10 }}>
              Proceeds credited instantly to your balance
            </p>
          </>
        )}
      </div>
    </div>
  )
}
