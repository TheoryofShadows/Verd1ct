import { useState, useEffect } from 'react'
import { MARKETS } from '../constants/data'

// Simulates live price movement for all markets.
// In production this would be replaced by a WebSocket feed.
export function usePriceSimulator(intervalMs = 4000) {
  const [liveMarkets, setLiveMarkets] = useState(() =>
    MARKETS.map(m => ({ ...m, sp: [...m.sp] }))
  )

  useEffect(() => {
    const id = setInterval(() => {
      setLiveMarkets(prev =>
        prev.map(m => {
          // Random walk: ±0.5–1.5% per tick, clamped to [0.02, 0.98]
          const drift = (Math.random() - 0.48) * 0.022   // slight upward bias
          const newYes = Math.max(0.02, Math.min(0.98, m.yes + drift))
          const newChg = parseFloat(
            Math.max(-15, Math.min(15, m.chg + (Math.random() - 0.5) * 0.4)).toFixed(1)
          )
          // Slide sparkline window: drop oldest, append newest
          const newSp = [...m.sp.slice(1), Math.round(newYes * 100)]
          return { ...m, yes: newYes, chg: newChg, sp: newSp }
        })
      )
    }, intervalMs)

    return () => clearInterval(id)
  }, [intervalMs])

  return liveMarkets
}
