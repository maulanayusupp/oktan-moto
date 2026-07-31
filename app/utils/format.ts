// =============================================================================
// Pure formatting helpers. No Vue, no i18n instance — locale is always passed
// in explicitly so these stay testable and usable from services.
// =============================================================================

/** Indonesian-market convention: prices are quoted in millions/billions. */
export function formatIdr(value: number, locale = 'id'): string {
  const billions = value / 1_000_000_000
  const millions = value / 1_000_000

  if (billions >= 1) {
    const digits = billions >= 10 ? 2 : 3
    return `Rp ${trimZeros(billions.toFixed(digits), locale)} ${locale === 'id' ? 'M' : 'B'}`
  }
  return `Rp ${trimZeros(millions.toFixed(millions >= 100 ? 0 : 1), locale)} ${locale === 'id' ? 'jt' : 'M'}`
}

/** Full rupiah with thousand separators — used in specs and WhatsApp messages. */
export function formatIdrExact(value: number, locale = 'id'): string {
  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function trimZeros(value: string, locale: string): string {
  const trimmed = value.replace(/\.?0+$/, '')
  return locale === 'id' ? trimmed.replace('.', ',') : trimmed
}

export function formatNumber(value: number, locale = 'id'): string {
  return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(value)
}

/** `18400` → `18.400 km` (id) / `18,400 km` (en). New units read as `0 km`. */
export function formatKm(value: number, locale = 'id'): string {
  return `${formatNumber(value, locale)} km`
}

/** `2027-03` → `03/2027`; safe against malformed input. */
export function formatMonthYear(value: string): string {
  const [year, month] = value.split('-')
  return year && month ? `${month}/${year}` : value
}

/** hp per tonne — the comparison figure riders actually use. */
export function powerToWeight(powerHp: number, weightKg: number): number {
  if (!weightKg) return 0
  return Math.round((powerHp / weightKg) * 1000)
}

/** Clamp helper for the interactive telemetry bars. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Normalises a value into 0…1 for progress bars, guarding a zero range. */
export function ratio(value: number, min: number, max: number): number {
  if (max <= min) return 0
  return clamp((value - min) / (max - min), 0, 1)
}

/** Small-image variant produced by `pnpm bikes` (`-sm` suffix). */
export function smallImage(path: string): string {
  return path.replace(/\.jpg$/, '-sm.jpg')
}

/** Percentage string for CSS custom properties (no inline styling rules). */
export function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}
