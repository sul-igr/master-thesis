/**
 * Format a uint256 base-unit price string to human-readable form.
 * e.g. formatPrice("1000000", 6) → "1"
 *      formatPrice("1500000", 6) → "1.5"
 *      formatPrice("1000000000000000000", 18) → "1"
 */
export function formatPrice(baseUnits: string, decimals = 18): string {
  if (!baseUnits || baseUnits === '0') return '0'
  const str = baseUnits.padStart(decimals + 1, '0')
  const whole = str.slice(0, str.length - decimals) || '0'
  const frac = str.slice(str.length - decimals).replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : whole
}

/** Format seconds into a human-readable interval string. */
export function formatInterval(seconds?: number): string {
  if (!seconds) return '—'
  if (seconds >= 86400) {
    const days = Math.round(seconds / 86400)
    return days === 1 ? '1 day' : `${days} days`
  }
  if (seconds >= 3600) {
    const hours = Math.round(seconds / 3600)
    return hours === 1 ? '1 hour' : `${hours} hours`
  }
  if (seconds >= 60) {
    const mins = Math.round(seconds / 60)
    return mins === 1 ? '1 minute' : `${mins} minutes`
  }
  return `${seconds}s`
}
