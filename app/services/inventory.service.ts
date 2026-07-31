// =============================================================================
// Inventory service — all catalogue logic in one place: decoration with derived
// figures, search, filtering, sorting, related units and spec-range helpers.
// Pure functions over the config array; components never filter inline.
// =============================================================================
import { inventory, inventoryBySlug } from '~/config/inventory.config'
import { powerToWeight } from '~/utils/format'
import type { Bike, BikeView, Category, InventoryFilters, SortKey } from '~/types'

/** Adds derived fields (power-to-weight, label keys) used across the UI. */
export function decorate(bike: Bike): BikeView {
  return {
    ...bike,
    powerToWeight: powerToWeight(bike.powerHp, bike.weightKg),
    conditionKey: `condition.${bike.condition}`,
    categoryKey: `category.${bike.category}`,
  }
}

export function allBikes(): BikeView[] {
  return inventory.map(decorate)
}

export function findBike(slug: string): BikeView | null {
  const bike = inventoryBySlug[slug]
  return bike ? decorate(bike) : null
}

export function featuredBikes(limit = 4): BikeView[] {
  return allBikes()
    .filter((bike) => bike.featured)
    .slice(0, limit)
}

export function countByCategory(category: Category): number {
  return inventory.filter((bike) => bike.category === category).length
}

export function countByCondition(condition: 'new' | 'used'): number {
  return inventory.filter((bike) => bike.condition === condition).length
}

export const defaultFilters: InventoryFilters = {
  query: '',
  condition: 'all',
  category: 'all',
  priceMax: null,
  ccMin: null,
  sort: 'featured',
}

/** Free-text match over make, model, year and category — accent-insensitive. */
function matchesQuery(bike: Bike, query: string): boolean {
  if (!query.trim()) return true
  const needles = query.toLowerCase().split(/\s+/).filter(Boolean)
  const haystack = [bike.make, bike.model, String(bike.year), bike.category, String(bike.engineCc)]
    .join(' ')
    .toLowerCase()
  return needles.every((needle) => haystack.includes(needle))
}

const sorters: Record<SortKey, (a: BikeView, b: BikeView) => number> = {
  featured: (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || b.priceIdr - a.priceIdr,
  'price-asc': (a, b) => a.priceIdr - b.priceIdr,
  'price-desc': (a, b) => b.priceIdr - a.priceIdr,
  'power-desc': (a, b) => b.powerHp - a.powerHp,
  'year-desc': (a, b) => b.year - a.year,
  'cc-desc': (a, b) => b.engineCc - a.engineCc,
}

export function filterBikes(filters: InventoryFilters): BikeView[] {
  const result = allBikes().filter((bike) => {
    if (filters.condition !== 'all' && bike.condition !== filters.condition) return false
    if (filters.category !== 'all' && bike.category !== filters.category) return false
    if (filters.priceMax !== null && bike.priceIdr > filters.priceMax) return false
    if (filters.ccMin !== null && bike.engineCc < filters.ccMin) return false
    return matchesQuery(bike, filters.query)
  })
  return result.sort(sorters[filters.sort] ?? sorters.featured)
}

/** Same category first, then closest price — never returns the current unit. */
export function relatedBikes(slug: string, limit = 3): BikeView[] {
  const current = findBike(slug)
  if (!current) return featuredBikes(limit)

  return allBikes()
    .filter((bike) => bike.slug !== slug)
    .sort((a, b) => {
      const categoryDelta =
        Number(b.category === current.category) - Number(a.category === current.category)
      if (categoryDelta !== 0) return categoryDelta
      return Math.abs(a.priceIdr - current.priceIdr) - Math.abs(b.priceIdr - current.priceIdr)
    })
    .slice(0, limit)
}

/** Min/max across the catalogue — drives the telemetry bars and price slider. */
export function specRange(key: 'priceIdr' | 'powerHp' | 'engineCc' | 'weightKg' | 'powerToWeight') {
  const values = allBikes().map((bike) => bike[key])
  return { min: Math.min(...values), max: Math.max(...values) }
}

/** Price steps (IDR) offered by the filter panel, derived from real stock. */
export function priceSteps(): number[] {
  const { max } = specRange('priceIdr')
  const steps = [200_000_000, 400_000_000, 600_000_000, 900_000_000, 1_300_000_000]
  return steps.filter((step) => step < max)
}
