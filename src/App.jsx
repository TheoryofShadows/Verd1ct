import { useState, useMemo, useCallback } from 'react'
import { C } from './constants/colors'
import { MARKETS, CATS, LEADERS, LOGS } from './constants/data'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePriceSimulator } from './hooks/usePriceSimulator'
import { formatOdds, ODDS_LABELS } from './utils/odds'
import { useToast } from './components/Toast'
import Card from './components/Card'
import Modal from './components/Modal'
import SellModal from './components/SellModal'
import AgeGate from './components/AgeGate'
import LegalModal from './components/LegalModal'

export default function App() {
  // ── Persistent state ─────────────────────────────────────────────
  const [ageOk, setAgeOk]           = useLocalStorage('verd1ct_age_ok', false)
  const [balance, setBalance]        = useLocalStorage('verd1ct_balance', 2847.50)
  const [positions, setPositions]    = useLocalStorage('verd1ct_positions', [])
  const [following, setFollowing]    = useLocalStorage('verd1ct_following', [])
  const [oddsFormat, setOddsFormat]  = useLocalStorage('verd1ct_odds', 'pct')

  // ── Ephemeral UI state ────────────────────────────────────────────
  const [view, setView]         = useState('markets')
  const [cat, setCat]           = useState('All')
  const [sel, setSel]           = useState(null)      // selected market ID
  const [sellPos, setSellPos]   = useState(null)      // position being sold
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState('vol')
  const [legalType, setLegalType] = useState(null)    // 'tos' | 'privacy'

  const toast = useToast()

  // ── Live prices (simulated — replace with WebSocket in production) ─
  const liveMarkets = usePriceSimulator(4000)

  // ── Selected market (always latest price) ─────────────────────────
  const selMarket = useMemo(
    () => sel != null ? liveMarkets.find(m => m.id === sel) ?? null : null,
    [sel, liveMarkets]
  )

  // ── Portfolio: derive live P&L from current prices ─────────────────
  const positionsWithPnL = useMemo(() =>
    positions.map(p => {
      const mkt = liveMarkets.find(m => m.q === p.mkt)
      if (!mkt) return p
      const cur = Math.round((p.s === 'YES' ? mkt.yes : 1 - mkt.yes) * 100)
      const pnl = parseFloat(((cur - p.avg) / 100 * p.qty).toFixed(2))
      return { ...p, cur, pnl }
    }),
    [positions, liveMarkets]
  )
  const totalPnL = useMemo(
    () => positionsWithPnL.reduce((a, p) => a + p.pnl, 0),
    [positionsWithPnL]
  )

  // ── Market filtering + sorting ─────────────────────────────────────
  const filtered = useMemo(() =>
    liveMarkets.filter(m => {
      const matchCat    = cat === 'All' || m.cat === cat
      const matchSearch = !search || m.q.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    }),
    [liveMarkets, cat, search]
  )

  const sorted = useMemo(() => {
    const copy = [...filtered]
    switch (sortBy) {
      case 'vol':   return copy.sort((a, b) => b.vol - a.vol)
      case 'prob':  return copy.sort((a, b) => Math.abs(a.yes - 0.5) - Math.abs(b.yes - 0.5))
      case 'end':   return copy.sort((a, b) => a.end.localeCompare(b.end))
      case 'alpha': return copy.sort((a, b) => a.q.localeCompare(b.q))
      default:      return copy
    }
  }, [filtered, sortBy])

  const totalVol = MARKETS.reduce((a, m) => a + m.vol, 0)

  // ── Trade handler ──────────────────────────────────────────────────
  const handleTrade = useCallback((market, side, amt, contracts) => {
    const price    = Math.round((side === 'YES' ? market.yes : 1 - market.yes) * 100)
    const fee      = parseFloat((amt * 0.01).toFixed(2))
    const totalOut = parseFloat((amt + fee).toFixed(2))   // stake + fee deducted

    setBalance(prev => parseFloat((prev - totalOut).toFixed(2)))
    setPositions(prev => [
      ...prev,
      { id: Date.now(), mkt: market.q, s: side, qty: contracts, avg: price, cur: price, pnl: 0 },
    ])
    setSel(null)
    toast(`Bought ${contracts} ${side} contracts on "${market.q.slice(0, 40)}…"`, 'success')
  }, [setBalance, setPositions, toast])

  // ── Sell / close position ──────────────────────────────────────────
  const handleSell = useCallback((posId, proceeds) => {
    setPositions(prev => prev.filter(p => p.id !== posId))
    setBalance(prev => parseFloat((prev + proceeds).toFixed(2)))
    setSellPos(null)
    toast(`Position closed — $${proceeds.toFixed(2)} credited`, 'success')
  }, [setPositions, setBalance, toast])

  // ── Follow toggle ──────────────────────────────────────────────────
  const toggleFollow = useCallback((name) => {
    setFollowing(prev => {
      const isFollowing = prev.includes(name)
      toast(isFollowing ? `Unfollowed ${name}` : `Now following ${name}`, 'info')
      return isFollowing ? prev.filter(n => n !== name) : [...prev, name]
    })
  }, [setFollowing, toast])

  // ── Age gate ───────────────────────────────────────────────────────
  if (!ageOk) {
    return (
      <>
        <AgeGate
          onAccept={() => setAgeOk(true)}
          onOpenLegal={(type) => setLegalType(type)}
        />
        {legalType && <LegalModal type={legalType} onClose={() => setLegalType(null)} />}
      </>
    )
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.tx, fontFamily: "'Outfit',-apple-system,sans-serif" }}>

      {/* Ambient rotating mesh gradient */}
      <div aria-hidden="true" style={{
        position: 'fixed', top: '-60%', left: '-60%', width: '220%', height: '220%',
        pointerEvents: 'none', zIndex: 0, opacity: .05,
        background: `conic-gradient(from 0deg at 50% 50%,${C.mint} 0deg,${C.vio} 120deg,${C.sky} 240deg,${C.mint} 360deg)`,
        animation: 'meshSpin 40s linear infinite', filter: 'blur(150px)',
      }} />

      {/* Film grain */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: .012,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />

      {/* SVG glow filter — document-scoped, referenced by Spark */}
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* ═══ HEADER ═══ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: `${C.sf}dd`, backdropFilter: 'blur(20px) saturate(1.5)',
        borderBottom: `1px solid ${C.bd}`,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div aria-hidden="true" style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${C.vio},${C.sky})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: "'JetBrains Mono',monospace", boxShadow: `0 4px 20px ${C.vG}` }}>V1</div>
            <div style={{ lineHeight: 1 }}>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.06em', color: C.tx }}>VERD<span style={{ color: C.vio }}>1</span>CT</span>
              <span style={{ fontSize: 7, color: C.vio, display: 'block', letterSpacing: '0.35em', marginTop: -1, fontWeight: 800, textTransform: 'uppercase' }}>Prediction Exchange</span>
            </div>
          </div>

          {/* Header controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Odds format toggle */}
            <div style={{ display: 'flex', gap: 3, background: C.card, borderRadius: 10, padding: 3, border: `1px solid ${C.bd}` }}>
              {Object.entries(ODDS_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setOddsFormat(key); toast(`Odds: ${label}`, 'info', 1800) }}
                  aria-pressed={oddsFormat === key}
                  aria-label={`Switch to ${label} odds format`}
                  style={{
                    padding: '4px 8px', borderRadius: 7, border: 'none',
                    background: oddsFormat === key ? C.vG : 'transparent',
                    color: oddsFormat === key ? C.vio : C.sub,
                    fontSize: 10, fontWeight: 800, cursor: 'pointer', transition: 'all .15s',
                  }}
                >{label.split(' ')[0]}</button>
              ))}
            </div>

            {/* Balance pill */}
            <div
              role="status"
              aria-label={`Account balance $${balance.toFixed(2)}`}
              style={{ background: C.card, borderRadius: 24, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.bd}` }}
            >
              <div aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 4, background: C.mint, animation: 'pulse 2s infinite', boxShadow: `0 0 8px ${C.mint}` }} />
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>${balance.toFixed(2)}</span>
            </div>

            {/* Avatar */}
            <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 18, background: `linear-gradient(135deg,${C.vio},${C.mint})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: `0 4px 16px ${C.vG}` }}>🎲</div>
          </div>
        </div>
      </header>

      {/* ═══ NAV ═══ */}
      <nav aria-label="Main navigation" style={{ background: C.sf, borderBottom: `1px solid ${C.bd}`, position: 'sticky', top: 57, zIndex: 30 }}>
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
              aria-current={view === n.id ? 'page' : undefined}
              style={{
                background: view === n.id ? C.vG : 'transparent',
                border: view === n.id ? `1px solid rgba(124,90,255,.25)` : '1px solid transparent',
                borderRadius: 10, padding: '7px 16px', cursor: 'pointer',
                color: view === n.id ? C.vio : C.sub,
                fontSize: 12, fontWeight: 800, transition: 'all .2s',
              }}
            >{n.l}</button>
          ))}
        </div>
      </nav>

      {/* ═══ MAIN ═══ */}
      <main id="main-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 100px', position: 'relative', zIndex: 10 }}>

        {/* ── MARKETS ── */}
        {view === 'markets' && (
          <div className="fade-up">
            {/* Search + sort row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search any market…"
                aria-label="Search markets"
                style={{
                  flex: '1 1 220px', padding: '13px 18px', borderRadius: 14,
                  border: `1px solid ${C.bd}`, background: C.card, color: C.tx,
                  fontSize: 15, outline: 'none', fontFamily: "'Outfit',sans-serif", transition: 'all .2s',
                }}
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Sort markets by"
                style={{
                  padding: '13px 16px', borderRadius: 14, border: `1px solid ${C.bd}`,
                  background: C.card, color: C.sub, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', outline: 'none', fontFamily: "'Outfit',sans-serif",
                }}
              >
                <option value="vol">Sort: Volume</option>
                <option value="prob">Sort: Most Uncertain</option>
                <option value="end">Sort: Ending Soon</option>
                <option value="alpha">Sort: A–Z</option>
              </select>
            </div>

            {/* Category pills */}
            <div role="group" aria-label="Filter by category" style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
              {CATS.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  style={{
                    padding: '6px 16px', borderRadius: 24,
                    border: `1px solid ${cat === c ? C.vio : C.bd}`,
                    background: cat === c ? C.vG : 'transparent',
                    color: cat === c ? C.vio : C.sub,
                    fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all .2s',
                  }}
                >{c}</button>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
              {sorted.map((m, i) => (
                <div key={m.id} className={`fade-up stagger-${(i % 4) + 1}`}>
                  <Card m={m} onClick={m => setSel(m.id)} oddsFormat={oddsFormat} />
                </div>
              ))}
            </div>
            {sorted.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: C.sub }}>No markets match your search</div>
            )}
          </div>
        )}

        {/* ── PORTFOLIO ── */}
        {view === 'portfolio' && (
          <div className="fade-up">
            {/* P&L hero */}
            <div style={{ background: `linear-gradient(135deg,${C.card},${C.sf})`, borderRadius: 20, padding: 28, marginBottom: 24, border: `1px solid ${C.bd}`, position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: 60, background: totalPnL >= 0 ? C.mG : C.rG, filter: 'blur(50px)' }} />
              <div style={{ fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4, position: 'relative' }}>Total P&L</div>
              <div
                role="status"
                aria-label={`Total profit and loss ${totalPnL >= 0 ? 'positive' : 'negative'} $${Math.abs(totalPnL).toFixed(2)}`}
                style={{ fontSize: 44, fontWeight: 900, color: totalPnL >= 0 ? C.mint : C.red, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 40px ${totalPnL >= 0 ? C.mG : C.rG}`, position: 'relative' }}
              >
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 6, position: 'relative' }}>
                {positionsWithPnL.length} position{positionsWithPnL.length !== 1 ? 's' : ''} · Instant withdrawal available
              </div>
            </div>

            {/* Positions or empty state */}
            {positionsWithPnL.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: C.sub }}>
                <div aria-hidden="true" style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: C.sub, marginBottom: 8 }}>No positions yet</h3>
                <p style={{ fontSize: 13 }}>Head to Markets and make your first trade.</p>
                <button
                  onClick={() => setView('markets')}
                  style={{ marginTop: 20, padding: '10px 28px', borderRadius: 12, background: C.vG, border: `1px solid ${C.vio}`, color: C.vio, fontWeight: 800, cursor: 'pointer', fontSize: 13 }}
                >Browse Markets</button>
              </div>
            ) : (
              positionsWithPnL.map((p, i) => (
                <div
                  key={p.id}
                  className={`fade-up stagger-${(i % 4) + 1}`}
                  style={{ background: C.card, borderRadius: 16, padding: '16px 20px', marginBottom: 10, border: `1px solid ${C.bd}`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
                >
                  <div style={{ flex: '1 1 180px', minWidth: 120 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.tx, marginBottom: 4, lineHeight: 1.4 }}>{p.mkt}</div>
                    <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 900, background: p.s === 'YES' ? C.mS : C.rS, color: p.s === 'YES' ? C.mint : C.red }}>{p.s}</span>
                  </div>
                  {[
                    { l: 'Qty', v: p.qty },
                    { l: 'Avg', v: `${p.avg}¢` },
                    { l: 'Now', v: `${p.cur}¢`, c: p.cur > p.avg ? C.mint : p.cur < p.avg ? C.red : C.sky },
                  ].map((d, j) => (
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
                  <button
                    onClick={() => setSellPos(p)}
                    aria-label={`Close position on ${p.mkt}`}
                    style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${C.red}`, background: C.rS, color: C.red, fontSize: 11, fontWeight: 900, cursor: 'pointer', transition: 'all .15s', flexShrink: 0 }}
                  >Sell</button>
                </div>
              ))
            )}

            {/* Withdrawal methods */}
            <div className="fade-up stagger-4" style={{ background: C.card, borderRadius: 18, padding: 22, marginTop: 20, border: `1px solid rgba(45,253,178,.15)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span aria-hidden="true" style={{ fontSize: 18 }}>⚡</span>
                <span style={{ fontSize: 15, fontWeight: 900, color: C.mint }}>Instant Withdrawals — Always</span>
              </div>
              <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.8, margin: '0 0 14px' }}>
                Funds never locked. Bank, card, crypto, Apple Pay, Google Pay — under 60 seconds.
              </p>
              <div role="group" aria-label="Withdrawal methods" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: '🏦 Bank',     msg: 'Bank withdrawal — link your account in Account Settings to enable.' },
                  { label: '💳 Card',     msg: 'Instant card withdrawal — add a debit card in Account Settings.'   },
                  { label: '₿ Crypto',   msg: 'Crypto withdrawal — connect a wallet in Account Settings.'         },
                  { label: 'Apple Pay',  msg: 'Apple Pay withdrawal — available on supported iOS devices.'         },
                  { label: 'G Pay',      msg: 'Google Pay withdrawal — available on supported Android devices.'    },
                ].map(({ label, msg }) => (
                  <button
                    key={label}
                    onClick={() => toast(msg, 'info')}
                    style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.bd}`, background: 'transparent', color: C.sub, fontSize: 11, cursor: 'pointer', fontWeight: 700, transition: 'all .15s' }}
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROOF LOG ── */}
        {view === 'proof-log' && (
          <div className="fade-up">
            <div style={{ background: `linear-gradient(135deg,${C.vG},${C.aG})`, borderRadius: 20, padding: 28, marginBottom: 24, border: `1px solid rgba(124,90,255,.2)`, position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, background: C.aG, filter: 'blur(40px)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
                <span aria-hidden="true" style={{ fontSize: 32 }}>🔷</span>
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
              <table style={{ width: '100%', minWidth: 750, borderCollapse: 'separate', borderSpacing: '0 4px' }} aria-label="Resolved markets">
                <thead>
                  <tr>
                    {['Market', 'Result', 'AI', 'Jury', 'Paid Out', 'Proof Hash'].map(h => (
                      <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 9, color: C.dim, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {LOGS.map((r, i) => (
                    <tr key={i} className={`fade-up stagger-${(i % 4) + 1}`}>
                      {[
                        { v: r.mkt,  s: { fontSize: 12, fontWeight: 800, color: C.tx } },
                        { v: r.res,  s: { fontSize: 11, color: C.mint, fontWeight: 700 } },
                        { v: r.ai,   s: { fontSize: 11, color: C.sky } },
                        { v: r.jury, s: { fontSize: 11, color: C.amb } },
                        { v: r.paid, s: { fontSize: 12, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: C.tx } },
                        { v: r.hash, s: { fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.dim } },
                      ].map((cell, j) => (
                        <td key={j} style={{ padding: '14px 16px', background: C.card, ...cell.s, ...(j === 0 ? { borderRadius: '12px 0 0 12px' } : j === 5 ? { borderRadius: '0 12px 12px 0' } : {}) }}>
                          {cell.v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LEADERS ── */}
        {view === 'leaders' && (
          <div className="fade-up">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div aria-hidden="true" style={{ fontSize: 40 }}>🏆</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>Top Predictors</h2>
              <p style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>Follow strategies · Copy trades · Compete</p>
            </div>
            {LEADERS.map((l, i) => {
              const isFollowing = following.includes(l.n)
              return (
                <div
                  key={i}
                  className={`fade-up stagger-${(i % 4) + 1}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: i === 0 ? `linear-gradient(135deg,${C.aG},${C.card})` : C.card, borderRadius: 18, marginBottom: 10, border: `1px solid ${i === 0 ? 'rgba(255,176,32,.2)' : C.bd}` }}
                >
                  <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? C.aG : C.sf, fontSize: 22, boxShadow: i === 0 ? `0 0 20px ${C.aG}` : 'none' }}>{l.av}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.tx }}>{l.n}</div>
                    <div style={{ fontSize: 11, color: C.dim }}><span aria-hidden="true">🔥</span> {l.str} streak</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 10 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: C.mint, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 16px ${C.mG}` }}>{l.roi}</div>
                    <div style={{ fontSize: 9, color: C.dim }}>All-time ROI</div>
                  </div>
                  <button
                    onClick={() => toggleFollow(l.n)}
                    aria-pressed={isFollowing}
                    aria-label={isFollowing ? `Unfollow ${l.n}` : `Follow ${l.n}`}
                    style={{
                      padding: '8px 16px', borderRadius: 10,
                      border: `1px solid ${isFollowing ? C.mint : C.vio}`,
                      background: isFollowing ? C.mS : 'transparent',
                      color: isFollowing ? C.mint : C.vio,
                      fontSize: 11, fontWeight: 900, cursor: 'pointer', transition: 'all .2s',
                    }}
                  >{isFollowing ? '✓ Following' : 'Follow'}</button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── SUPPORT ── */}
        {view === 'support' && (
          <div className="fade-up">
            <div style={{ background: `linear-gradient(135deg,${C.mS},${C.card})`, borderRadius: 20, padding: 28, marginBottom: 24, border: `1px solid rgba(45,253,178,.15)`, position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, background: C.mG, filter: 'blur(40px)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
                <span aria-hidden="true" style={{ fontSize: 32 }}>💬</span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.mint }}>Real Humans. Real Fast.</div>
                  <div style={{ fontSize: 12, color: C.sub }}>47 second avg response · No auto-closed tickets</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { ico: '📞', t: 'Live Phone',  d: 'Talk now',        a: '24/7',     action: () => { window.location.href = 'tel:+18005555500'; toast('Dialing +1 (800) 555-5500…', 'info') } },
                { ico: '💬', t: 'Live Chat',   d: '47s response',    a: '24/7',     action: () => toast('Opening live chat — connecting you to an agent…', 'info') },
                { ico: '📧', t: 'Email',       d: '2hr guaranteed',  a: 'Always',   action: () => { window.location.href = 'mailto:support@verd1ct.io?subject=Support Request'; toast('Opening email client…', 'info') } },
                { ico: '🎥', t: 'Video Call',  d: 'Screen share',    a: '8am–10pm', action: () => toast('Scheduling video call — check your email for a calendar link within 5 min.', 'info') },
              ].map((s, i) => (
                <button
                  key={i}
                  className={`fade-up stagger-${(i % 4) + 1}`}
                  onClick={s.action}
                  style={{ background: C.card, borderRadius: 16, padding: 20, border: `1px solid ${C.bd}`, cursor: 'pointer', transition: 'all .2s', textAlign: 'left', width: '100%' }}
                >
                  <div aria-hidden="true" style={{ fontSize: 26, marginBottom: 10 }}>{s.ico}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.tx }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: C.sub }}>{s.d}</div>
                  <div style={{ fontSize: 10, color: C.mint, fontWeight: 800, marginTop: 4 }}>{s.a}</div>
                </button>
              ))}
            </div>

            <div style={{ background: C.card, borderRadius: 18, padding: 22, marginBottom: 16, border: `1px solid ${C.bd}` }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: C.tx, marginBottom: 14 }}>Dispute Guarantee</div>
              {[
                'All disputes resolved within 24 hours',
                'Every resolution publicly auditable',
                'Wrong? You get 2× the disputed amount',
                'Independent ombudsman for contested markets',
                'Full refund if payout exceeds 48 hours',
              ].map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span aria-hidden="true" style={{ color: C.mint, fontSize: 12 }}>✓</span>
                  <span style={{ fontSize: 12, color: C.sub }}>{g}</span>
                </div>
              ))}
            </div>

            {/* Legal links */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[{ label: 'Terms of Service', type: 'tos' }, { label: 'Privacy Policy', type: 'privacy' }].map(({ label, type }) => (
                <button
                  key={type}
                  onClick={() => setLegalType(type)}
                  style={{ padding: '8px 18px', borderRadius: 10, border: `1px solid ${C.bd}`, background: 'transparent', color: C.sub, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}
                >{label}</button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Trade modal ── */}
      {selMarket && (
        <Modal
          m={selMarket}
          onClose={() => setSel(null)}
          onTrade={handleTrade}
          balance={balance}
          oddsFormat={oddsFormat}
        />
      )}

      {/* ── Sell modal ── */}
      {sellPos && (
        <SellModal
          position={sellPos}
          liveMarkets={liveMarkets}
          onClose={() => setSellPos(null)}
          onSell={handleSell}
        />
      )}

      {/* ── Legal modal ── */}
      {legalType && (
        <LegalModal type={legalType} onClose={() => setLegalType(null)} />
      )}

      {/* ═══ STATUS BAR ═══ */}
      <div
        role="status"
        aria-label="Platform status"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: `${C.sf}ee`, backdropFilter: 'blur(16px) saturate(1.3)',
          borderTop: `1px solid ${C.bd}`, padding: '9px 20px', zIndex: 30,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: C.mint, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 3, background: C.mint, display: 'inline-block', animation: 'pulse 2s infinite', boxShadow: `0 0 6px ${C.mint}` }} />
            LIVE
          </span>
          <span style={{ fontSize: 10, color: C.dim }}>{MARKETS.length} Markets</span>
          <span style={{ fontSize: 10, color: C.dim }}>${totalVol.toFixed(1)}M Volume</span>
          <span style={{ fontSize: 10, color: C.dim }}>47s Avg Resolution</span>
          <span style={{ fontSize: 10, color: C.amb }}><span aria-hidden="true">🔷</span> Mesh: 97.4%</span>
          {/* Legal footer links */}
          <span style={{ fontSize: 10, color: C.dim }}>·</span>
          <button onClick={() => setLegalType('tos')}     style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 10, padding: 0 }}>Terms</button>
          <button onClick={() => setLegalType('privacy')} style={{ background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 10, padding: 0 }}>Privacy</button>
        </div>
      </div>
    </div>
  )
}
