import { useState, useCallback } from 'react'
import { C } from '../constants/colors'
import Spark from './Spark'
import { formatOdds } from '../utils/odds'

export default function Card({ m, onClick, oddsFormat = 'pct' }) {
  const [hovered, setHovered] = useState(false)

  const yP = Math.round(m.yes * 100)
  const nP = 100 - yP

  const handleClick = useCallback(() => onClick(m), [m, onClick])
  const handleKey   = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(m)
    }
  }, [m, onClick])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open market: ${m.q} — YES ${yP}¢ NO ${nP}¢`}
      onClick={handleClick}
      onKeyDown={handleKey}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? C.chi : C.card,
        border: `1px solid ${hovered ? C.bhi : C.bd}`,
        borderRadius: 20,
        padding: '22px 24px',
        cursor: 'pointer',
        transition: 'all .25s cubic-bezier(.16,1,.3,1)',
        transform: hovered ? 'translateY(-4px) scale(1.005)' : 'none',
        boxShadow: hovered
          ? `0 20px 60px rgba(0,0,0,.5), 0 0 0 1px ${C.bhi}`
          : '0 2px 12px rgba(0,0,0,.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hover glow */}
      {hovered && (
        <div aria-hidden="true" style={{
          position: 'absolute', top: -40, right: -40,
          width: 120, height: 120, borderRadius: '50%',
          background: m.chg >= 0 ? C.mG : C.rG,
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            aria-label={`Category: ${m.cat}`}
            style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 800 }}
          >
            <span aria-hidden="true">{m.ico}</span> {m.cat}
          </span>
          {m.heat === 'fire' && (
            <span
              aria-label="Hot market"
              style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,45,94,.12)', color: '#ff4d6a', letterSpacing: .3 }}
            ><span aria-hidden="true">🔥</span> HOT</span>
          )}
          {m.heat === 'up' && (
            <span
              aria-label="Rising market"
              style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: C.vG, color: C.vio, letterSpacing: .3 }}
            ><span aria-hidden="true">📈</span> RISING</span>
          )}
        </div>
        <div aria-hidden="true">
          <Spark data={m.sp} color={m.chg >= 0 ? C.mint : C.red} />
        </div>
      </div>

      {/* Question */}
      <h3 style={{
        fontSize: 16, fontWeight: 700,
        color: hovered ? '#fff' : C.tx,
        margin: '0 0 16px', lineHeight: 1.5,
        fontFamily: "'Outfit',sans-serif", transition: 'color .2s',
      }}>
        {m.q}
      </h3>

      {/* Price bar */}
      <div
        role="meter"
        aria-label={`YES probability ${yP}%`}
        aria-valuenow={yP}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ display: 'flex', height: 6, borderRadius: 4, overflow: 'hidden', background: C.bd, marginBottom: 14 }}
      >
        <div style={{ width: `${yP}%`, background: `linear-gradient(90deg,${C.mint},${C.mint}aa)`, transition: 'width .5s', boxShadow: `inset 0 0 12px ${C.mint}33` }} />
        <div style={{ flex: 1, background: `linear-gradient(90deg,${C.red}aa,${C.red})`, boxShadow: `inset 0 0 12px ${C.red}33` }} />
      </div>

      {/* Prices */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: oddsFormat === 'pct' ? 24 : 20, fontWeight: 900, color: C.mint, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 20px ${C.mG}` }}>
            {formatOdds(m.yes, oddsFormat)} <span style={{ fontSize: 10, fontWeight: 400, color: C.dim }}>YES</span>
          </span>
          <span style={{ fontSize: oddsFormat === 'pct' ? 24 : 20, fontWeight: 900, color: C.red, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 20px ${C.rG}` }}>
            {formatOdds(1 - m.yes, oddsFormat)} <span style={{ fontSize: 10, fontWeight: 400, color: C.dim }}>NO</span>
          </span>
        </div>
        <span
          aria-label={`Price change ${m.chg >= 0 ? 'up' : 'down'} ${Math.abs(m.chg)}%`}
          style={{ fontSize: 13, fontWeight: 800, color: m.chg >= 0 ? C.mint : C.red }}
        >
          {m.chg >= 0 ? '+' : ''}{m.chg.toFixed(1)}%
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.bd}`, flexWrap: 'wrap', gap: 4 }}>
        <span style={{ fontSize: 11, color: C.dim }}>${m.vol}M vol</span>
        <span style={{ fontSize: 11, color: C.amb }}><span aria-hidden="true">🔷</span> Mesh {m.mesh}%</span>
        <span style={{ fontSize: 11, color: C.dim }}><span aria-hidden="true">💬</span> {m.chat}</span>
        <span style={{ fontSize: 11, color: C.dim }}>Ends {m.end}</span>
      </div>
    </div>
  )
}
