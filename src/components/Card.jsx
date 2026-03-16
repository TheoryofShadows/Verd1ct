import { useState } from 'react'
import { C } from '../constants/colors'
import Spark from './Spark'

export default function Card({ m, onClick }) {
  const [hovered, setHovered] = useState(false)
  const yP = Math.round(m.yes * 100)
  const nP = 100 - yP

  return (
    <div
      onClick={() => onClick(m)}
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
      {/* Hover glow accent */}
      {hovered && (
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 120, height: 120, borderRadius: '50%',
          background: m.chg >= 0 ? C.mG : C.rG,
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 800 }}>
            {m.ico} {m.cat}
          </span>
          {m.heat === 'fire' && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,45,94,.12)', color: '#ff4d6a', letterSpacing: .3 }}>
              🔥 HOT
            </span>
          )}
          {m.heat === 'up' && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: C.vG, color: C.vio, letterSpacing: .3 }}>
              📈 RISING
            </span>
          )}
        </div>
        <Spark data={m.sp} color={m.chg >= 0 ? C.mint : C.red} />
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
      <div style={{ display: 'flex', height: 6, borderRadius: 4, overflow: 'hidden', background: C.bd, marginBottom: 14 }}>
        <div style={{ width: `${yP}%`, background: `linear-gradient(90deg,${C.mint},${C.mint}aa)`, transition: 'width .5s', boxShadow: `inset 0 0 12px ${C.mint}33` }} />
        <div style={{ flex: 1, background: `linear-gradient(90deg,${C.red}aa,${C.red})`, boxShadow: `inset 0 0 12px ${C.red}33` }} />
      </div>

      {/* Prices */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: C.mint, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 20px ${C.mG}` }}>
            {yP}¢ <span style={{ fontSize: 10, fontWeight: 400, color: C.dim }}>YES</span>
          </span>
          <span style={{ fontSize: 24, fontWeight: 900, color: C.red, fontFamily: "'JetBrains Mono',monospace", textShadow: `0 0 20px ${C.rG}` }}>
            {nP}¢ <span style={{ fontSize: 10, fontWeight: 400, color: C.dim }}>NO</span>
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: m.chg >= 0 ? C.mint : C.red }}>
          {m.chg >= 0 ? '+' : ''}{m.chg}%
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.bd}` }}>
        <span style={{ fontSize: 11, color: C.dim }}>${m.vol}M vol</span>
        <span style={{ fontSize: 11, color: C.amb }}>🔷 Mesh {m.mesh}%</span>
        <span style={{ fontSize: 11, color: C.dim }}>💬 {m.chat}</span>
        <span style={{ fontSize: 11, color: C.dim }}>Ends {m.end}</span>
      </div>
    </div>
  )
}
