import { useId } from 'react'

export default function Spark({ data, color, w = 80, h = 28 }) {
  // React 18 useId returns strings like ":r0:" — sanitize colons for SVG/CSS safety
  const rawId = useId()
  const gradId = `sg${rawId.replace(/:/g, '_')}`

  if (!data || data.length < 2) return null

  const mn = Math.min(...data)
  const mx = Math.max(...data)
  const rng = mx - mn || 1

  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * h}`)
    .join(' ')

  const ly = h - ((data[data.length - 1] - mn) / rng) * h

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#${gradId})`}
        points={`0,${h} ${pts} ${w},${h}`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
        filter="url(#glow)"
      />
      <circle cx={w} cy={ly} r="3.5" fill={color} />
      <circle cx={w} cy={ly} r="6"   fill={color} opacity=".2" />
    </svg>
  )
}
