import { useState, useMemo, useCallback } from 'react'
import { C } from './constants/colors'
import { MARKETS, CATS, LEADERS, LOGS } from './constants/data'
import Card from './components/Card'
import Modal from './components/Modal'

export default function App() {
  const [view, setView] = useState('markets')
  const [cat, setCat] = useState('All')
  const [sel, setSel] = useState(null)
  const [search, setSearch] = useState('')
  const [balance, setBalance] = useState(2847.50)
  const [positions, setPositions] = useState([])

  // Called by Modal when a trade is confirmed
  const handleTrade = useCallback((market, side, amt, contracts) => {
    const price = Math.round((side === 'YES' ? market.yes : 1 - market.yes) * 100)
    setBalance(prev => parseFloat((prev - amt).toFixed(2)))
    setPositions(prev => [
      ...prev,
      {
        id:  Date.now(),
        mkt: market.q,
        s:   side,
        qty: contracts,
        avg: price,
        cur: price,
        pnl: 0,
      },
    ])
    setSel(null)
  }, [])

  const filtered = useMemo(() =>
    MARKETS.filter(m => {
      const matchCat    = cat === 'All' || m.cat === cat
      const matchSearch = !search || m.q.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    }),
    [cat, search]
  )

  const totalVol  = MARKETS.reduce((a, m) => a + m.vol, 0)
  const totalPnL  = positions.reduce((a, p) => a + p.pnl, 0)

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.tx, fontFamily: "'Outfit',-apple-system,sans-serif" }}>

      {/* Ambient rotating mesh gradient */}
      <div style={{
        position: 'fixed', top: '-60%', left: '-60%', width: '220%', height: '220%',
        pointerEvents: 'none', zIndex: 0, opacity: .05,
        background: `conic-gradient(from 0deg at 50% 50%,${C.mint} 0deg,${C.vio} 120deg,${C.sky} 240deg,${C.mint} 360deg)`,
        animation: 'meshSpin 40s linear infinite', filter: 'blur(150px)',
      }} />

      {/* Film grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: .012,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />

      {/* SVG filter definitions — document-scoped, used by Spark's filter="url(#glow)" */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* ═══ HEADER ═══ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: `${C.sf}dd`, backdropFilter: 'blur(20px) saturate(1.5)',
        borderBottom: `1px solid ${C.bd}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: `linear-gradient(135deg,${C.vio},${C.sky})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: "'JetBrains Mono',monospace",
              boxShadow: `0 4px 20px ${C.vG}`,
            }}>V1</div>
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', color: C.tx }}>
                VERD<span style={{ color: C.vio }}>1</span>CT
              </span>
              <span style={{ fontSize: 7, color: C.vio, display: 'block', letterSpacing: '0.35em', marginTop: -1, fontWeight: 800, textTransform: 'uppercase' }}>
                Prediction Exchange
              </span>
            </div>
          </div>

          {/* Balance + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: C.card, borderRadius: 24, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.bd}` }}>
              <div style={{ width: 7, height: 7, borderRadius: 4, background: C.mint, animation: 'pulse 2s infinite', boxShadow: `0 0 8px ${C.mint}` }} />
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>
                ${balance.toFixed(2)}
              </span>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: `linear-gradient(135deg,${C.vio},${C.mint})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: `0 4px 16px ${C.vG}` }}>🎲</div>
          </div>
        </div>
      </header>

      {/* ═══ NAV ═══ */}
      <nav style={{ background: C.sf, borderBottom: `1px solid ${C.bd}`, position: 'sticky', top: 57, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          {[
            { id: 'markets',   l: '◎ Markets'   },
            { id: 'portfolio', l: '◈ Portfolio'  },
            { id: 'proof-log', l: '🔷 Proof Log' },
            { id: 'leaders',   l: '🏆 Leaders'   },
            { id: 'support',   l: '💬 Support'   },
          ].map(n => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              style={{
                background: view === n.id ? C.vG : 'transparent',
                border: view === n.id ? `1px solid rgba(124,90,255,.25)` : '1px solid transparent',
                borderRadius: 10, padding: '7px 16px', cursor: 'pointer',
                color: view === n.id ? C.vio : C.dim,
                fontSize: 12, fontWeight: 800, transition: 'all .2s',
              }}
            >{n.l}</button>
          ))}
        </div>
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 100px', position: 'relative', zIndex: 10 }}>

        {/* ── MARKETS ── */}
        {view === 'markets' && (
          <div className="fade-up">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search any market..."
              style={{
                width: '100%', padding: '13px 18px', borderRadius: 14,
                border: `1px solid ${C.bd}`, background: C.card, color: C.tx,
                fontSize: 15, outline: 'none', marginBottom: 18,
                fontFamily: "'Outfit',sans-serif", transition: 'all .2s',
              }}
            />
            <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
              {CATS.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    padding: '6px 16px', borderRadius: 24,
                    border: `1px solid ${cat === c ? C.vio : C.bd}`,
                    background: cat === c ? C.vG : 'transparent',
                    color: cat === c ? C.vio : C.dim,
                    fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all .2s',
                  }}
                >{c}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
              {filtered.map((m, i) => (
                <div key={m.id} className={`fade-up stagger-${(i % 4) + 1}`}>
                  <Card m={m} onClick={setSel} />
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: C.dim }}>No markets match</div>
            )}
          </div>
        )}

        {/* ── PORTFOLIO ── */}
        {view === 'portfolio' && (
          <div className="fade-up">
            {/* P&L header */}
            <div style={{
              background: `linear-gradient(135deg,${C.card},${C.sf})`,
              borderRadius: 20, padding: 28, marginBottom: 24,
              border: `1px solid ${C.bd}`, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, background: C.mG, filter: 'blur(50px)' }} />
              <div style={{ fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4, position: 'relative' }}>Total P&L</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: C.mint, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 40px ${C.mG}`, position: 'relative' }}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 6, position: 'relative' }}>
                {positions.length} position{positions.length !== 1 ? 's' : ''} · Instant withdrawal available
              </div>
            </div>

            {/* Positions list or empty state */}
            {positions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: C.dim }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: C.sub, marginBottom: 8 }}>No positions yet</h3>
                <p style={{ fontSize: 13 }}>Head to Markets and make your first trade.</p>
                <button
                  onClick={() => setView('markets')}
                  style={{
                    marginTop: 20, padding: '10px 28px', borderRadius: 12,
                    background: C.vG, border: `1px solid ${C.vio}`,
                    color: C.vio, fontWeight: 800, cursor: 'pointer', fontSize: 13,
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >Browse Markets</button>
              </div>
            ) : (
              positions.map((p, i) => (
                <div
                  key={p.id}
                  className={`fade-up stagger-${(i % 4) + 1}`}
                  style={{
                    background: C.card, borderRadius: 16, padding: '16px 20px', marginBottom: 10,
                    border: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1 1 180px', minWidth: 120 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.tx, marginBottom: 4 }}>{p.mkt}</div>
                    <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 900, background: p.s === 'YES' ? C.mS : C.rS, color: p.s === 'YES' ? C.mint : C.red }}>{p.s}</span>
                  </div>
                  {[{ l: 'Qty', v: p.qty }, { l: 'Avg', v: `${p.avg}¢` }, { l: 'Now', v: `${p.cur}¢`, c: C.sky }].map((d, j) => (
                    <div key={j} style={{ textAlign: 'center', minWidth: 50 }}>
                      <div style={{ fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: .5 }}>{d.l}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: d.c || C.tx }}>{d.v}</div>
                    </div>
                  ))}
                  <div style={{ textAlign: 'right', minWidth: 70 }}>
                    <div style={{ fontSize: 9, color: C.dim, textTransform: 'uppercase' }}>P&L</div>
                    <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", color: p.pnl >= 0 ? C.mint : C.red, textShadow: `0 0 12px ${p.pnl >= 0 ? C.mG : C.rG}` }}>
                      {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Withdrawal methods */}
            <div style={{ background: C.card, borderRadius: 18, padding: 22, marginTop: 20, border: `1px solid rgba(45,253,178,.15)` }} className="fade-up stagger-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: C.mint }}>Instant Withdrawals — Always</span>
              </div>
              <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.8, margin: '0 0 14px' }}>
                Funds never locked. Bank, card, crypto, Apple Pay, Google Pay — under 60 seconds.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['🏦 Bank', '💳 Card', '₿ Crypto', 'Apple Pay', 'G Pay'].map(method => (
                  <button
                    key={method}
                    style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.bd}`, background: 'transparent', color: C.sub, fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                  >{method}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROOF LOG ── */}
        {view === 'proof-log' && (
          <div className="fade-up">
            <div style={{ background: `linear-gradient(135deg,${C.vG},${C.aG})`, borderRadius: 20, padding: 28, marginBottom: 24, border: `1px solid rgba(124,90,255,.2)`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, background: C.aG, filter: 'blur(40px)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
                <span style={{ fontSize: 32 }}>🔷</span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.amb }}>Proof Mesh™</div>
                  <div style={{ fontSize: 12, color: C.sub }}>Every resolution: public, verifiable, manipulation-proof</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.8, margin: 0, position: 'relative' }}>
                AI + 500-person jury + cryptographic proof. Every cent traceable. No whale override.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 750 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr .8fr 1fr 1fr 1.2fr', padding: '8px 16px', fontSize: 9, color: C.dim, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  <span>Market</span><span>Result</span><span>AI</span><span>Jury</span><span>Paid Out</span><span>Proof Hash</span>
                </div>
                {LOGS.map((r, i) => (
                  <div
                    key={i}
                    className={`fade-up stagger-${(i % 4) + 1}`}
                    style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr .8fr 1fr 1fr 1.2fr', padding: '14px 16px', background: C.card, borderRadius: 12, marginBottom: 4, alignItems: 'center', border: `1px solid ${C.bd}` }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.tx }}>{r.mkt}</span>
                    <span style={{ fontSize: 11, color: C.mint, fontWeight: 700 }}>{r.res}</span>
                    <span style={{ fontSize: 11, color: C.sky }}>{r.ai}</span>
                    <span style={{ fontSize: 11, color: C.amb }}>{r.jury}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: C.tx }}>{r.paid}</span>
                    <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.dim }}>{r.hash}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LEADERS ── */}
        {view === 'leaders' && (
          <div className="fade-up">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 40 }}>🏆</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>Top Predictors</h2>
              <p style={{ fontSize: 13, color: C.dim, marginTop: 4 }}>Follow strategies · Copy trades · Compete</p>
            </div>
            {LEADERS.map((l, i) => (
              <div
                key={i}
                className={`fade-up stagger-${(i % 4) + 1}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: 20,
                  background: i === 0 ? `linear-gradient(135deg,${C.aG},${C.card})` : C.card,
                  borderRadius: 18, marginBottom: 10,
                  border: `1px solid ${i === 0 ? 'rgba(255,176,32,.2)' : C.bd}`,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? C.aG : C.sf, fontSize: 22, boxShadow: i === 0 ? `0 0 20px ${C.aG}` : 'none' }}>
                  {l.av}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: C.tx }}>{l.n}</div>
                  <div style={{ fontSize: 11, color: C.dim }}>🔥 {l.str} streak</div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.mint, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 16px ${C.mG}` }}>{l.roi}</div>
                  <div style={{ fontSize: 9, color: C.dim }}>All-time ROI</div>
                </div>
                <button style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.vio}`, background: 'transparent', color: C.vio, fontSize: 11, fontWeight: 900, cursor: 'pointer' }}>
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── SUPPORT ── */}
        {view === 'support' && (
          <div className="fade-up">
            <div style={{ background: `linear-gradient(135deg,${C.mS},${C.card})`, borderRadius: 20, padding: 28, marginBottom: 24, border: `1px solid rgba(45,253,178,.15)`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, background: C.mG, filter: 'blur(40px)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
                <span style={{ fontSize: 32 }}>💬</span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.mint }}>Real Humans. Real Fast.</div>
                  <div style={{ fontSize: 12, color: C.sub }}>47 second avg response · No auto-closed tickets</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { ico: '📞', t: 'Live Phone', d: 'Talk now',       a: '24/7'     },
                { ico: '💬', t: 'Live Chat',  d: '47s response',   a: '24/7'     },
                { ico: '📧', t: 'Email',      d: '2hr guaranteed', a: 'Always'   },
                { ico: '🎥', t: 'Video Call', d: 'Screen share',   a: '8am–10pm' },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`fade-up stagger-${(i % 4) + 1}`}
                  style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.bd}`, cursor: 'pointer', transition: 'all .2s' }}
                >
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{s.ico}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.tx }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: C.sub }}>{s.d}</div>
                  <div style={{ fontSize: 10, color: C.mint, fontWeight: 800, marginTop: 4 }}>{s.a}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.card, borderRadius: 18, padding: 22, border: `1px solid ${C.bd}` }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: C.tx, marginBottom: 14 }}>Dispute Guarantee</div>
              {[
                'All disputes resolved within 24 hours',
                'Every resolution publicly auditable',
                'Wrong? You get 2× the disputed amount',
                'Independent ombudsman for contested markets',
                'Full refund if payout exceeds 48 hours',
              ].map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: C.mint, fontSize: 12 }}>✓</span>
                  <span style={{ fontSize: 12, color: C.sub }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Trade modal */}
      {sel && <Modal m={sel} onClose={() => setSel(null)} onTrade={handleTrade} />}

      {/* ═══ STATUS BAR ═══ */}
      <div style={{
        position: 'fixed', bottom: 0, insetInline: 0,
        background: `${C.sf}ee`, backdropFilter: 'blur(16px) saturate(1.3)',
        borderTop: `1px solid ${C.bd}`, padding: '9px 20px', zIndex: 30,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: C.mint, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: C.mint, display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: `0 0 6px ${C.mint}` }} />
            LIVE
          </span>
          <span style={{ fontSize: 10, color: C.dim }}>{MARKETS.length} Markets</span>
          <span style={{ fontSize: 10, color: C.dim }}>${totalVol.toFixed(1)}M Volume</span>
          <span style={{ fontSize: 10, color: C.dim }}>47s Avg Resolution</span>
          <span style={{ fontSize: 10, color: C.amb }}>🔷 Mesh: 97.4%</span>
        </div>
      </div>
    </div>
  )
}
