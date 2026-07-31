// =============================================================================
// Compare tray — shared across pages via useState, capped at three units (the
// most a spec table can show side by side on a phone). Persisted to
// localStorage so the selection survives a reload; the tray itself is a
// component (CompareTray.vue).
// =============================================================================
import { findBike } from '~/services/inventory.service'
import type { BikeView } from '~/types'

const STORAGE_KEY = 'oktan.compare'
export const COMPARE_LIMIT = 3

export function useCompare() {
  const slugs = useState<string[]>('compare-slugs', () => [])
  const hydrated = useState<boolean>('compare-hydrated', () => false)

  // Client-only hydration: localStorage is not available during SSR, and
  // writing before hydration would cause a markup mismatch.
  onMounted(() => {
    if (hydrated.value) return
    hydrated.value = true
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      if (Array.isArray(stored)) {
        slugs.value = stored.filter((slug) => typeof slug === 'string' && findBike(slug)).slice(0, COMPARE_LIMIT)
      }
    } catch {
      slugs.value = []
    }
  })

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs.value))
    } catch {
      // Private-mode or quota errors are non-fatal: the tray still works.
    }
  }

  const bikes = computed<BikeView[]>(() =>
    slugs.value.map((slug) => findBike(slug)).filter((bike): bike is BikeView => bike !== null),
  )

  const isFull = computed(() => slugs.value.length >= COMPARE_LIMIT)
  const has = (slug: string) => slugs.value.includes(slug)

  function toggle(slug: string): 'added' | 'removed' | 'full' {
    if (has(slug)) {
      slugs.value = slugs.value.filter((entry) => entry !== slug)
      persist()
      return 'removed'
    }
    if (isFull.value) return 'full'
    slugs.value = [...slugs.value, slug]
    persist()
    return 'added'
  }

  function remove(slug: string) {
    slugs.value = slugs.value.filter((entry) => entry !== slug)
    persist()
  }

  function clear() {
    slugs.value = []
    persist()
  }

  return { slugs, bikes, isFull, has, toggle, remove, clear, limit: COMPARE_LIMIT }
}
