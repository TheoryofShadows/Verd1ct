import { useState } from 'react'
import { C } from '../constants/colors'
import Spark from './Spark'
import ConfBar from './ConfBar'

export default function Modal({ m, onClose, onTrade }) {
  const [tab, setTab] = useState('trade')
  const [side, setSide] = useState('YES')
  const [amt, setAmt] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const pr = side === 'YES' ? m.yes : 1 - m.yes
  const contracts = amt ? Math.floor(parseFloat(amt) / pr) : 0
  const profit = contracts - (amt ? parseFloat(amt) : 0)
  const fee = amt ? (parseFloat(amt) * 0.01).toFixed(2) : '0.00'

  function handleConfirm() {
    if (!amt || parseFloat(amt) <= 0) return
    onTrade(m, side, parseFloat(amt), contracts)
    setConfirmed(true)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(16px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.sf, borderRadius: 24, width: '100%', maxWidth: 560,
          maxHeight: '93vh', overflow: 'auto',
          border: `1px solid ${C.bd}`,
          boxShadow: `0 40px 120px rgba(0,0,0,.8), 0 0 80px ${C.vG}`,
        }}
      >
        {/* Title */}
        <div style={{ padding: '22px 26px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>
              {m.ico} {m.cat}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.tx, margin: '8px 0', lineHeight: 1.4, fontFamily: "'Outfit',sans-serif" }}>
              {m.q}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: C.card, border: `1px solid ${C.bd}`, color: C.sub, width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
          >✕</button>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, padding: '18px 26px 14px' }}>
          {[
            { l: 'YES',    v: `${Math.round(m.yes * 100)}¢`,       c: C.mint },
            { l: 'NO',     v: `${Math.round((1 - m.yes) * 100)}¢`, c: C.red  },
            { l: 'Volume', v: `$${m.vol}M`,                         c: C.sky  },
            { l: 'Mesh',   v: `${m.mesh}%`,                         c: C.amb  },
          ].map((s, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: `1px solid ${C.bd}` }}>
              <div style={{ fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ padding: '0 26px 14px' }}>
          <div style={{ background: C.card, borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.bd}` }}>
            <Spark data={m.sp} color={m.chg >= 0 ? C.mint : C.red} w={470} h={56} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.bd}`, padding: '0 26px', gap: 4 }}>
          {[{ k: 'trade', l: '📊 Trade' }, { k: 'mesh', l: '🔷 Proof Mesh' }, { k: 'social', l: '💬 Social' }].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                background: 'none', border: 'none', padding: '10px 18px', cursor: 'pointer',
                color: tab === t.k ? C.vio : C.dim,
                fontSize: 12, fontWeight: 800,
                borderBottom: tab === t.k ? `2.5px solid ${C.vio}` : '2.5px solid transparent',
                fontFamily: "'Outfit',sans-serif", transition: 'all .2s',
              }}
            >{t.l}</button>
          ))}
        </div>

        <div style={{ padding: 26 }}>
          {/* ── TRADE TAB ── */}
          {tab === 'trade' && (
            confirmed ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: C.tx, marginBottom: 6 }}>Trade Executed!</h3>
                <p style={{ color: C.sub, fontSize: 13, marginBottom: 20 }}>
                  {contracts} {side} contracts @ {(pr * 100).toFixed(0)}¢ for ${amt}
                </p>
                <div style={{ background: C.card, borderRadius: 14, padding: 16, textAlign: 'left', marginBottom: 20, border: `1px solid ${C.bd}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: C.dim }}>Fee (1%)</span>
                    <span style={{ fontSize: 12, color: C.amb, fontFamily: "'JetBrains Mono',monospace" }}>${fee}</span>
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
                {/* YES / NO toggle */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {['YES', 'NO'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSide(s)}
                      style={{
                        flex: 1, padding: '16px 0', borderRadius: 14,
                        border: `2.5px solid ${side === s ? (s === 'YES' ? C.mint : C.red) : C.bd}`,
                        background: side === s ? (s === 'YES' ? C.mS : C.rS) : 'transparent',
                        color: side === s ? (s === 'YES' ? C.mint : C.red) : C.dim,
                        fontSize: 18, fontWeight: 900, cursor: 'pointer',
                        fontFamily: "'JetBrains Mono',monospace", transition: 'all .2s',
                        boxShadow: side === s ? `0 0 20px ${s === 'YES' ? C.mG : C.rG}` : 'none',
                      }}
                    >
                      {s} {Math.round((s === 'YES' ? m.yes : 1 - m.yes) * 100)}¢
                    </button>
                  ))}
                </div>

                {/* Amount input */}
                <label style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: 6 }}>
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={amt}
                  onChange={e => setAmt(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: `1px solid ${C.bd}`, background: C.card, color: C.tx,
                    fontSize: 20, fontFamily: "'JetBrains Mono',monospace",
                    outline: 'none', boxSizing: 'border-box', transition: 'border .2s',
                  }}
                />

                {/* Quick amounts */}
                <div style={{ display: 'flex', gap: 6, margin: '12px 0 20px' }}>
                  {[1, 5, 10, 25, 50, 100].map(q => (
                    <button
                      key={q}
                      onClick={() => setAmt(String(q))}
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 8,
                        border: `1px solid ${amt === String(q) ? C.vio : C.bd}`,
                        background: amt === String(q) ? C.vG : 'transparent',
                        color: amt === String(q) ? C.vio : C.dim,
                        fontSize: 12, cursor: 'pointer', fontWeight: 700, transition: 'all .15s',
                      }}
                    >${q}</button>
                  ))}
                </div>

                {/* Order summary */}
                <div style={{ background: C.card, borderRadius: 14, padding: 18, marginBottom: 18, border: `1px solid ${C.bd}` }}>
                  {[
                    { l: 'Contracts',                      v: String(contracts)            },
                    { l: 'Price/contract',                 v: `${(pr * 100).toFixed(0)}¢` },
                    { l: 'Fee (1% flat — no hidden)',      v: `$${fee}`,   c: C.amb        },
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

                {/* Confirm button */}
                <button
                  onClick={handleConfirm}
                  disabled={!amt || parseFloat(amt) <= 0}
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
                  Buy {side} — ${amt || '0'}
                </button>
              </div>
            )
          )}

          {/* ── PROOF MESH TAB ── */}
          {tab === 'mesh' && (
            <div>
              <div style={{ background: `linear-gradient(135deg,${C.vG},${C.aG})`, borderRadius: 18, padding: 22, marginBottom: 18, border: 'solid 1px rgba(124,90,255,.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: 50, background: C.aG, filter: 'blur(30px)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative' }}>
                  <span style={{ fontSize: 26 }}>🔷</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: C.amb, fontFamily: "'Outfit',sans-serif", letterSpacing: .8 }}>PROOF MESH™</span>
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
                  { s: '1', t: 'AI Scrapes Declared Source',   d: 'Real-time monitoring of the named source'           },
                  { s: '2', t: '500 Random Jurors Activated',  d: 'Verified traders, 90%+ accuracy, equally weighted'  },
                  { s: '3', t: 'Cryptographic Proof Published', d: 'Immutable hash at exact resolution moment'          },
                  { s: '4', t: '60-Second Payout',             d: 'Funds released instantly on consensus'              },
                ].map((x, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 3 ? 16 : 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 14, background: C.vG, color: C.vio, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0, boxShadow: `0 0 12px ${C.vG}` }}>{x.s}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.tx }}>{x.t}</div>
                      <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{x.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SOCIAL TAB ── */}
          {tab === 'social' && (
            <div>
              <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.bd}` }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.tx, marginBottom: 14 }}>Live Discussion ({m.chat})</div>
                {[
                  { u: 'DataPulse',  msg: 'Volume spike. Institutions loading YES.',                          t: '2m',  s: 'YES' },
                  { u: 'ZeroDelta',  msg: 'Historical data leans NO. Don\'t chase.',                         t: '8m',  s: 'NO'  },
                  { u: 'SilentEdge', msg: `Proof Mesh at ${m.mesh}% — clean resolution incoming.`,           t: '15m', s: 'YES' },
                ].map((c, i) => (
                  <div key={i} style={{ padding: '12px 0', borderTop: i ? `1px solid ${C.bd}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: C.vio }}>{c.u}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: c.s === 'YES' ? C.mS : C.rS, color: c.s === 'YES' ? C.mint : C.red, fontWeight: 900 }}>{c.s}</span>
                        <span style={{ fontSize: 10, color: C.dim }}>{c.t}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: C.sub, margin: 0, lineHeight: 1.7 }}>{c.msg}</p>
                  </div>
                ))}
              </div>

              {/* Sentiment bar */}
              <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.bd}`, marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.tx, marginBottom: 10 }}>Sentiment</div>
                <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}>
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
