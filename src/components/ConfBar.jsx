import { C } from '../constants/colors'

export default function ConfBar({ val, color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, color: C.dim, width: 56, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: C.bd, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${val}%`,
          height: '100%',
          background: `linear-gradient(90deg,${color},${color}88)`,
          borderRadius: 3,
          transition: 'width 1s ease-out',
          boxShadow: `0 0 8px ${color}44`,
        }} />
      </div>
      <span style={{
        fontSize: 11,
        fontFamily: "'JetBrains Mono',monospace",
        color: C.sub,
        width: 34,
        textAlign: 'right',
      }}>
        {val}%
      </span>
    </div>
  )
}
