// =============================================================================
// Shared domain types. Config files describe structure (facts, ids, numbers);
// every human-readable string is an i18n key so both locales stay in lockstep.
// =============================================================================

export type Condition = 'new' | 'used'

/** Showroom segments. Used for filtering and for the category landing copy. */
export type Category = 'supersport' | 'naked' | 'sport-touring' | 'heritage'

export type ServiceHistory = 'full' | 'partial' | 'unknown'

/** One machine in the demo inventory. Prices/mileage are illustrative. */
export interface Bike {
  slug: string
  make: string
  /** Model name as marketed, e.g. "Panigale V4 R". */
  model: string
  year: number
  priceIdr: number
  condition: Condition
  category: Category
  /** Displacement in cc. */
  engineCc: number
  /** i18n key under `spec.layout.*`, e.g. `spec.layout.v4`. */
  engineLayoutKey: string
  powerHp: number
  torqueNm: number
  /** Kerb weight in kg. */
  weightKg: number
  /** Odometer in km; 0 for new units. */
  mileageKm: number
  /** Previous keepers; omitted for new units. */
  owners?: number
  serviceHistory?: ServiceHistory
  /** Indonesian road-tax validity, `YYYY-MM`; omitted for new units. */
  taxValidUntil?: string
  /** i18n key under `colors.*`. */
  colorKey: string
  /** i18n keys under `e.*` — rider aids and electronics. */
  electronicsKeys: readonly string[]
  /** i18n keys under `f.*` — equipment highlights. */
  featureKeys: readonly string[]
  /** Local image paths; first entry is the hero. */
  images: readonly string[]
  featured?: boolean
}

/** A bike plus the figures the inventory service derives from it. */
export interface BikeView extends Bike {
  /** hp per tonne, rounded — the number riders actually compare. */
  powerToWeight: number
  /** Reading time-independent label key: `condition.new` / `condition.used`. */
  conditionKey: string
  categoryKey: string
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'power-desc' | 'year-desc' | 'cc-desc'

export interface InventoryFilters {
  query: string
  condition: Condition | 'all'
  category: Category | 'all'
  /** Inclusive price bounds in IDR; `null` means unbounded. */
  priceMax: number | null
  ccMin: number | null
  sort: SortKey
}

/** Navigation entry. `label` is an i18n key, `to` a route name for localePath. */
export interface NavItem {
  labelKey: string
  routeName: string
}

/** Contact form shape (validated client-side, delivered via WhatsApp/e-mail). */
export interface ContactDraft {
  name: string
  phone: string
  email: string
  interest: string
  message: string
}

export type ContactErrors = Partial<Record<keyof ContactDraft, string>>

/** Photo attribution row produced by `pnpm bikes` (see /credits). */
export interface PhotoCredit {
  asset: string
  file: string
  author: string
  license: string
  licenseUrl: string
  source: string
}
