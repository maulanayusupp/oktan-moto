// =============================================================================
// Inventory filter state, mirrored into the URL query so a filtered view can be
// shared, bookmarked and reloaded (and so a WhatsApp link can point at it).
// Filtering itself lives in inventory.service — this composable only owns state.
// =============================================================================
import { defaultFilters, filterBikes } from '~/services/inventory.service'
import type { Category, Condition, InventoryFilters, SortKey } from '~/types'

const SORTS: SortKey[] = ['featured', 'price-asc', 'price-desc', 'power-desc', 'year-desc', 'cc-desc']
const CONDITIONS: (Condition | 'all')[] = ['all', 'new', 'used']
const CATEGORIES: (Category | 'all')[] = ['all', 'supersport', 'naked', 'sport-touring', 'heritage']

function readQuery(query: Record<string, unknown>): InventoryFilters {
  const str = (key: string) => (typeof query[key] === 'string' ? (query[key] as string) : '')
  const num = (key: string) => {
    const value = Number(str(key))
    return Number.isFinite(value) && value > 0 ? value : null
  }
  const oneOf = <T extends string>(key: string, allowed: T[], fallback: T): T => {
    const value = str(key) as T
    return allowed.includes(value) ? value : fallback
  }

  return {
    query: str('q'),
    condition: oneOf('condition', CONDITIONS, 'all'),
    category: oneOf('category', CATEGORIES, 'all'),
    priceMax: num('max'),
    ccMin: num('cc'),
    sort: oneOf('sort', SORTS, 'featured'),
  }
}

export function useInventoryFilters() {
  const route = useRoute()
  const router = useRouter()

  const filters = ref<InventoryFilters>(readQuery(route.query))

  // Back/forward navigation and category links from other pages must be picked
  // up, so the query is the source of truth in one direction…
  watch(
    () => route.query,
    (query) => {
      const next = readQuery(query)
      if (JSON.stringify(next) !== JSON.stringify(filters.value)) filters.value = next
    },
  )

  // …and the state writes back a clean query (empty values are dropped).
  watch(
    filters,
    (value) => {
      const query: Record<string, string> = {}
      if (value.query.trim()) query.q = value.query.trim()
      if (value.condition !== 'all') query.condition = value.condition
      if (value.category !== 'all') query.category = value.category
      if (value.priceMax) query.max = String(value.priceMax)
      if (value.ccMin) query.cc = String(value.ccMin)
      if (value.sort !== 'featured') query.sort = value.sort
      router.replace({ query })
    },
    { deep: true },
  )

  const results = computed(() => filterBikes(filters.value))

  const activeCount = computed(() => {
    const { query, condition, category, priceMax, ccMin } = filters.value
    return (
      Number(Boolean(query.trim())) +
      Number(condition !== 'all') +
      Number(category !== 'all') +
      Number(priceMax !== null) +
      Number(ccMin !== null)
    )
  })

  function reset() {
    filters.value = { ...defaultFilters }
  }

  return { filters, results, activeCount, reset, SORTS, CONDITIONS, CATEGORIES }
}
