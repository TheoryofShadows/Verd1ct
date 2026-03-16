/**
 * Formats a probability [0,1] into the user's preferred odds display.
 * @param {number} prob   - probability in [0,1]
 * @param {'pct'|'american'|'decimal'} format
 * @returns {string}
 */
export function formatOdds(prob, format) {
  if (!prob || prob <= 0) return '—'
  switch (format) {
    case 'american':
      if (prob >= 0.5) {
        return `-${Math.round((prob / (1 - prob)) * 100)}`
      }
      return `+${Math.round(((1 - prob) / prob) * 100)}`
    case 'decimal':
      return (1 / prob).toFixed(2)
    case 'pct':
    default:
      return `${Math.round(prob * 100)}¢`
  }
}

/** Human-readable suffix for each odds format shown in the UI */
export const ODDS_LABELS = {
  pct:      '¢ cents',
  american: 'American',
  decimal:  'Decimal',
}
