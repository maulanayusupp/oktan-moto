// =============================================================================
// Locale-aware wrappers around the pure formatters in utils/format, so
// components never have to pass the active locale around by hand.
// =============================================================================
import { formatIdr, formatIdrExact, formatKm, formatNumber } from '~/utils/format'

export function useCurrency() {
  const { locale } = useI18n()

  return {
    /** Short form for cards and headings: `Rp 1,25 M`. */
    price: (value: number) => formatIdr(value, locale.value),
    /** Full form for spec tables and messages: `Rp 1.250.000.000`. */
    priceExact: (value: number) => formatIdrExact(value, locale.value),
    km: (value: number) => formatKm(value, locale.value),
    number: (value: number) => formatNumber(value, locale.value),
  }
}
