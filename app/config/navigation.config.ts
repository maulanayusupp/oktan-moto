// =============================================================================
// Navigation structure. Labels are i18n keys; routes are Nuxt route names
// resolved through localePath() so links stay locale-correct.
// =============================================================================
import type { NavItem } from '~/types'

export const primaryNav: readonly NavItem[] = [
  { labelKey: 'nav.home', routeName: 'index' },
  { labelKey: 'nav.inventory', routeName: 'inventory' },
  { labelKey: 'nav.about', routeName: 'about' },
  { labelKey: 'nav.contact', routeName: 'contact' },
]

export const legalNav: readonly NavItem[] = [
  { labelKey: 'nav.compliance', routeName: 'compliance' },
  { labelKey: 'nav.privacy', routeName: 'privacy' },
  { labelKey: 'nav.terms', routeName: 'terms' },
  { labelKey: 'nav.credits', routeName: 'credits' },
]
