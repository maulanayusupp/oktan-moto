// =============================================================================
// Per-page SEO. One call sets title, description, canonical, robots, Open Graph
// and Twitter tags with ABSOLUTE image URLs — crawlers (WhatsApp, Facebook,
// X, LinkedIn) reject relative paths and never render SVG, so share images are
// always pre-rendered raster files (see `pnpm og`).
// =============================================================================
import { brandConfig } from '~/config/brand.config'

export interface PageSeoInput {
  title: string
  description: string
  /** Site-root-relative or absolute; defaults to the home share card. */
  image?: string
  /** `website` for landing pages, `product` for a unit, `article` for legal. */
  type?: 'website' | 'product' | 'article'
  /** Set true on pages that should not be indexed. */
  noindex?: boolean
}

export function usePageSeo(input: PageSeoInput | (() => PageSeoInput)) {
  const config = useRuntimeConfig()
  const { locale } = useI18n()
  const route = useRoute()

  const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')
  const resolved = computed(() => (typeof input === 'function' ? input() : input))

  const absolute = (path: string) => (path.startsWith('http') ? path : `${siteUrl}${path}`)
  const canonical = computed(() => absolute(route.path))
  const image = computed(() => absolute(resolved.value.image ?? '/og-image.jpg'))
  const imageType = computed(() => (image.value.endsWith('.png') ? 'image/png' : 'image/jpeg'))

  useSeoMeta({
    title: () => resolved.value.title,
    description: () => resolved.value.description,
    robots: () => (resolved.value.noindex ? 'noindex, nofollow' : 'index, follow'),

    ogType: () => resolved.value.type ?? 'website',
    ogTitle: () => `${resolved.value.title} · ${brandConfig.longName}`,
    ogDescription: () => resolved.value.description,
    ogUrl: () => canonical.value,
    ogSiteName: brandConfig.longName,
    ogLocale: () => (locale.value === 'id' ? 'id_ID' : 'en_US'),
    ogImage: () => image.value,
    ogImageSecureUrl: () => image.value,
    ogImageType: () => imageType.value,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: () => resolved.value.title,

    twitterCard: 'summary_large_image',
    twitterTitle: () => resolved.value.title,
    twitterDescription: () => resolved.value.description,
    twitterImage: () => image.value,
    twitterImageAlt: () => resolved.value.title,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
  })

  return { canonical, image }
}
