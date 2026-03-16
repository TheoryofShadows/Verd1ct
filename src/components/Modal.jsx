import { useState, useEffect, useRef, useCallback } from 'react'
import { C } from '../constants/colors'
import Spark from './Spark'
import ConfBar from './ConfBar'
import { formatOdds } from '../utils/odds'

export default function Modal({ m, onClose, onTrade, balance = Infinity, oddsFormat = 'pct' }) {
  const [tab, setTab]           = useState('trade')
  const [side, setSide]         = useState('YES')
  const [amt, setAmt]           = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [insufficientFunds, setInsufficientFunds] = useState(false)

  const modalRef = useRef(null)

  const pr        = side === 'YES' ? m.yes : 1 - m.yes
  const contracts = amt ? Math.floor(parseFloat(amt) / pr) : 0
  const feeAmt    = amt ? parseFloat((parseFloat(amt) * 0.01).toFixed(2)) : 0
  const totalCost = amt ? parseFloat((parseFloat(amt) * 1.01).toFixed(2)) : 0
  const profit    = contracts - (amt ? parseFloat(amt) : 0)

  // ── Focus trap + keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return

    // Move focus into modal
    const focusable = modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex="0"]:not([tabindex="-1"])'
    )
    focusable[0]?.focus()

    function handleKeyDown(e) {
      // Close on Escape
      if (e.key === 'Escape') { onClose(); return }

      // Focus trap on Tab
      if (e.key === 'Tab' && focusable.length > 0) {
        const first = focusable[0]
        const last  = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus() }
        }
      }

      // Trade keyboard shortcuts (only in trade tab, before confirmation)
      if (tab === 'trade' && !confirmed) {
        if (e.key === 'y' || e.key === 'Y') setSide('YES')
        if (e.key === 'n' || e.key === 'N') setSide('NO')
        if (e.key === 'Enter' && amt && parseFloat(amt) > 0) handleConfirm()
      }
    }

    modal.addEventListener('keydown', handleKeyDown)
    return () => modal.removeEventListener('keydown', handleKeyDown)
  }, [onClose, tab, confirmed, amt]) // eslint-disable-line

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleConfirm = useCallback(() => {
    const parsed = parseFloat(amt)
    if (!parsed || parsed <= 0) return

    // Balance check: total cost includes 1% fee
    if (totalCost > balance) {
      setInsufficientFunds(true)
      setTimeout(() => setInsufficientFunds(false), 2500)
      return
    }

    onTrade(m, side, parsed, contracts)
    setConfirmed(true)
  }, [amt, totalCost, balance, m, side, contracts, onTrade])

  const titleId = `modal-title-${m.id}`

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
      aria-hidden="false"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={e => e.stopPropagation()}
        style={{
          background: C.sf, borderRadius: 24, width: '100%', maxWidth: 560,
          maxHeight: '93vh', overflow: 'auto',
          border: `1px solid ${C.bd}`,
          boxShadow: `0 40px 120px rgba(0,0,0,.8), 0 0 80px ${C.vG}`,
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {/* ── Title ── */}
        <div style={{ padding: '22px 26px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span aria-hidden="true" style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>
              {m.ico} {m.cat}
            </span>
            <h2 id={titleId} style={{ fontSize: 18, fontWeight: 800, color: C.tx, margin: '8px 0', lineHeight: 1.4 }}>
              {m.q}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close trade modal"
            style={{ background: C.card, border: `1px solid ${C.bd}`, color: C.sub, width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
          >✕</button>
        </div>

        {/* ── Stats grid (responsive: 2-col on small, 4-col on wide) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: 10, padding: '18px 26px 14px',
        }}>
          {[
            { l: 'YES',    v: formatOdds(m.yes, oddsFormat),       c: C.mint },
            { l: 'NO',     v: formatOdds(1 - m.yes, oddsFormat),   c: C.red  },
            { l: 'Volume', v: `$${m.vol}M`,                         c: C.sky  },
            { l: 'Mesh',   v: `${m.mesh}%`,                         c: C.amb  },
          ].map((s, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: `1px solid ${C.bd}` }}>
              <div style={{ fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* ── Sparkline ── */}
        <div style={{ padding: '0 26px 14px' }}>
          <div aria-hidden="true" style={{ background: C.card, borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.bd}` }}>
            <Spark data={m.sp} color={m.chg >= 0 ? C.mint : C.red} w={470} h={56} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div role="tablist" style={{ display: 'flex', borderBottom: `1px solid ${C.bd}`, padding: '0 26px', gap: 4 }}>
          {[{ k: 'trade', l: '📊 Trade' }, { k: 'mesh', l: '🔷 Proof Mesh' }, { k: 'social', l: '💬 Social' }].map(t => (
            <button
              key={t.k}
              role="tab"
              aria-selected={tab === t.k}
              aria-controls={`panel-${t.k}`}
              onClick={() => setTab(t.k)}
              style={{
                background: 'none', border: 'none', padding: '10px 18px', cursor: 'pointer',
                color: tab === t.k ? C.vio : C.dim,
                fontSize: 12, fontWeight: 800,
                borderBottom: tab === t.k ? `2.5px solid ${C.vio}` : '2.5px solid transparent',
                fontFamily: "'Outfit',sans-serif", transition: 'color .2s',
              }}
            >{t.l}</button>
          ))}
        </div>

        {/* ── Tab panels ── */}
        <div style={{ padding: 26 }}>

          {/* ──── TRADE TAB ──── */}
          {tab === 'trade' && (
            <div id="panel-trade" role="tabpanel" aria-label="Trade">
              {confirmed ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div aria-hidden="true" style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: C.tx, marginBottom: 6 }}>Trade Executed!</h3>
                  <p style={{ color: C.sub, fontSize: 13, marginBottom: 20 }}>
                    {contracts} {side} contracts @ {(pr * 100).toFixed(0)}¢ for ${amt}
                  </p>
                  <div style={{ background: C.card, borderRadius: 14, padding: 16, textAlign: 'left', marginBottom: 20, border: `1px solid ${C.bd}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: C.dim }}>Fee (1%)</span>
                      <span style={{ fontSize: 12, color: C.amb, fontFamily: "'JetBrains Mono',monospace" }}>${feeAmt.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: C.dim }}>Potential profit</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: C.mint, fontFamily: "'JetBrains Mono',monospace" }}>
                        ${profit > 0 ? profit.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setConfirmed(false); setAmt('') }}
                    style={{ background: `linear-gradient(135deg,${C.vio},#5b3fd4)`, border: 'none', color: '#fff', fontWeight: 800, padding: '12px 32px', borderRadius: 12, cursor: 'pointer', fontSize: 14, boxShadow: `0 8px 30px ${C.vG}` }}
                  >Trade Again</button>
                </div>
              ) : (
                <div>
                  {/* Keyboard hint */}
                  <p aria-live="polite" style={{ fontSize: 10, color: C.dim, textAlign: 'right', marginBottom: 8 }}>
                    Shortcuts: <kbd style={{ background: C.card, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>Y</kbd> YES &nbsp;
                    <kbd style={{ background: C.card, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>N</kbd> NO &nbsp;
                    <kbd style={{ background: C.card, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace' }}>↵</kbd> Buy
                  </p>

                  {/* YES / NO toggle */}
                  <div role="group" aria-label="Select YES or NO" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {['YES', 'NO'].map(s => (
                      <button
                        key={s}
                        aria-pressed={side === s}
                        onClick={() => setSide(s)}
                        style={{
                          flex: 1, padding: '16px 0', borderRadius: 14,
                          border: `2.5px solid ${side === s ? (s === 'YES' ? C.mint : C.red) : C.bd}`,
                          background: side === s ? (s === 'YES' ? C.mS : C.rS) : 'transparent',
                          color: side === s ? (s === 'YES' ? C.mint : C.red) : C.sub,
                          fontSize: 18, fontWeight: 900, cursor: 'pointer',
                          fontFamily: "'JetBrains Mono',monospace", transition: 'all .2s',
                          boxShadow: side === s ? `0 0 20px ${s === 'YES' ? C.mG : C.rG}` : 'none',
                        }}
                      >
                        {s} {formatOdds(s === 'YES' ? m.yes : 1 - m.yes, oddsFormat)}
                      </button>
                    ))}
                  </div>

                  {/* Amount input */}
                  <label htmlFor="trade-amount" style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: 6 }}>
                    Amount ($)
                  </label>
                  <input
                    id="trade-amount"
                    type="number"
                    value={amt}
                    onChange={e => { setAmt(e.target.value); setInsufficientFunds(false) }}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    aria-describedby="balance-hint"
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      border: `1px solid ${insufficientFunds ? C.red : C.bd}`,
                      background: C.card, color: C.tx,
                      fontSize: 20, fontFamily: "'JetBrains Mono',monospace",
                      outline: 'none', boxSizing: 'border-box', transition: 'border .2s',
                    }}
                  />
                  <div id="balance-hint" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: insufficientFunds ? C.red : C.dim }}>
                      {insufficientFunds ? '⚠ Insufficient balance (including 1% fee)' : `Available: $${balance.toFixed(2)}`}
                    </span>
                    {amt && parseFloat(amt) > 0 && (
                      <span style={{ fontSize: 11, color: C.dim }}>Total: ${totalCost.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Quick amounts */}
                  <div role="group" aria-label="Quick amounts" style={{ display: 'flex', gap: 6, margin: '12px 0 20px', flexWrap: 'wrap' }}>
                    {[1, 5, 10, 25, 50, 100].map(q => (
                      <button
                        key={q}
                        onClick={() => { setAmt(String(q)); setInsufficientFunds(false) }}
                        aria-pressed={amt === String(q)}
                        style={{
                          flex: 1, minWidth: 44, padding: '7px 0', borderRadius: 8,
                          border: `1px solid ${amt === String(q) ? C.vio : C.bd}`,
                          background: amt === String(q) ? C.vG : 'transparent',
                          color: amt === String(q) ? C.vio : C.sub,
                          fontSize: 12, cursor: 'pointer', fontWeight: 700, transition: 'all .15s',
                        }}
                      >${q}</button>
                    ))}
                  </div>

                  {/* Order summary */}
                  <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 18, border: `1px solid ${C.bd}` }}>
                    {[
                      { l: 'Contracts',             v: String(contracts)            },
                      { l: 'Price/contract',         v: `${(pr * 100).toFixed(0)}¢` },
                      { l: 'Fee (1% — no hidden)',   v: `$${feeAmt.toFixed(2)}`,  c: C.amb },
                      { l: 'Total cost',             v: `$${totalCost.toFixed(2)}`, c: C.sub },
                    ].map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: C.dim }}>{r.l}</span>
                        <span style={{ fontSize: 12, color: r.c || C.tx, fontFamily: "'JetBrains Mono',monospace" }}>{r.v}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: `1px solid ${C.bd}`, paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.tx }}>Potential profit</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: C.mint, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 16px ${C.mG}` }}>
                        ${profit > 0 ? profit.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>

                  {/* Confirm */}
                  <button
                    onClick={handleConfirm}
                    disabled={!amt || parseFloat(amt) <= 0}
                    aria-disabled={!amt || parseFloat(amt) <= 0}
                    style={{
                      width: '100%', padding: '16px 0', borderRadius: 14, border: 'none',
                      background: !amt || parseFloat(amt) <= 0
                        ? '#222'
                        : side === 'YES'
                          ? `linear-gradient(135deg,${C.mint},#00c890)`
                          : `linear-gradient(135deg,${C.red},#cc1850)`,
                      color: side === 'YES' ? '#000' : '#fff',
                      fontSize: 16, fontWeight: 900,
                      cursor: amt && parseFloat(amt) > 0 ? 'pointer' : 'not-allowed',
                      fontFamily: "'Outfit',sans-serif", letterSpacing: .5,
                      opacity: amt && parseFloat(amt) > 0 ? 1 : 0.35,
                      boxShadow: amt && parseFloat(amt) > 0 ? `0 8px 32px ${side === 'YES' ? C.mG : C.rG}` : 'none',
                      transition: 'all .2s',
                    }}
                  >
                    Buy {side} — ${amt || '0'} {amt && parseFloat(amt) > 0 ? `(+$${feeAmt.toFixed(2)} fee)` : ''}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ──── PROOF MESH TAB ──── */}
          {tab === 'mesh' && (
            <div id="panel-mesh" role="tabpanel" aria-label="Proof Mesh resolution details">
              <div style={{ background: `linear-gradient(135deg,${C.vG},${C.aG})`, borderRadius: 18, padding: 22, marginBottom: 18, border: '1px solid rgba(124,90,255,.2)', position: 'relative', overflow: 'hidden' }}>
                <div aria-hidden="true" style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, background: C.aG, filter: 'blur(30px)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative' }}>
                  <span aria-hidden="true" style={{ fontSize: 26 }}>🔷</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: C.amb, letterSpacing: .8 }}>PROOF MESH™</span>
                </div>
                <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.8, margin: '0 0 18px', position: 'relative' }}>
                  Triple-verified resolution: AI scans official sources, 500 randomly-chosen verified jurors vote equally, cryptographic proof published on-chain. No whales. No ambiguity.
                </p>
                <ConfBar val={m.ai}   color={C.sky} label="AI Analysis" />
                <div style={{ height: 10 }} />
                <ConfBar val={m.mesh} color={C.amb} label="Jury Vote"   />
                <div style={{ height: 10 }} />
                <ConfBar val={99}     color={C.mint} label="Source Trust" />
              </div>

              <div style={{ background: C.card, borderRadius: 14, padding: 16, marginBottom: 14, border: `1px solid ${C.bd}` }}>
                <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Resolution Source</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.tx }}>{m.src}</div>
              </div>

              <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.bd}` }}>
                <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 14 }}>Resolution Pipeline</div>
                {[
                  { s: '1', t: 'AI Scrapes Declared Source',    d: 'Real-time monitoring of the named source'          },
                  { s: '2', t: '500 Random Jurors Activated',   d: 'Verified traders, 90%+ accuracy, equally weighted' },
                  { s: '3', t: 'Cryptographic Proof Published', d: 'Immutable hash at exact resolution moment'         },
                  { s: '4', t: '60-Second Payout',              d: 'Funds released instantly on consensus'             },
                ].map((x, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 3 ? 16 : 0 }}>
                    <div aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 14, background: C.vG, color: C.vio, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0, boxShadow: `0 0 12px ${C.vG}` }}>{x.s}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.tx }}>{x.t}</div>
                      <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{x.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ──── SOCIAL TAB ──── */}
          {tab === 'social' && (
            <div id="panel-social" role="tabpanel" aria-label="Social discussion">
              <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.bd}` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.tx, marginBottom: 14 }}>Live Discussion ({m.chat})</div>
                {[
                  { u: 'DataPulse',  msg: 'Volume spike. Institutions loading YES.',                t: '2m',  s: 'YES' },
                  { u: 'ZeroDelta',  msg: "Historical data leans NO. Don't chase.",                 t: '8m',  s: 'NO'  },
                  { u: 'SilentEdge', msg: `Proof Mesh at ${m.mesh}% — clean resolution incoming.`, t: '15m', s: 'YES' },
                ].map((c, i) => (
                  <div key={i} style={{ padding: '12px 0', borderTop: i ? `1px solid ${C.bd}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.vio }}>{c.u}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span aria-label={`Position: ${c.s}`} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: c.s === 'YES' ? C.mS : C.rS, color: c.s === 'YES' ? C.mint : C.red, fontWeight: 900 }}>{c.s}</span>
                        <span style={{ fontSize: 10, color: C.dim }}>{c.t}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: C.sub, margin: 0, lineHeight: 1.7 }}>{c.msg}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.bd}`, marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.tx, marginBottom: 10 }}>Sentiment</div>
                <div
                  role="meter"
                  aria-label={`${(m.yH / (m.yH + m.nH) * 100).toFixed(0)}% YES sentiment`}
                  aria-valuenow={Math.round(m.yH / (m.yH + m.nH) * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}
                >
                  <div style={{ width: `${m.yH / (m.yH + m.nH) * 100}%`, background: `linear-gradient(90deg,${C.mint},${C.mint}aa)`, boxShadow: `0 0 10px ${C.mG}` }} />
                  <div style={{ flex: 1, background: `linear-gradient(90deg,${C.red}aa,${C.red})`, boxShadow: `0 0 10px ${C.rG}` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: C.mint, fontWeight: 600 }}>{(m.yH / 1000).toFixed(1)}K YES</span>
                  <span style={{ fontSize: 11, color: C.red,  fontWeight: 600 }}>{(m.nH / 1000).toFixed(1)}K NO</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
