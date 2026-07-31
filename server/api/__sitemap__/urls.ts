// =============================================================================
// Dynamic sitemap source: the 12 unit detail pages, for both locales.
//
// @nuxtjs/sitemap discovers static routes on its own but cannot know the
// `[slug]` values, so they are enumerated here from the same inventory config
// the pages render from — adding a unit therefore adds its sitemap entries with
// no extra step. Wired up via `sitemap.sources` in nuxt.config.
//
// A plain event handler is used rather than defineSitemapEventHandler: the
// module accepts any endpoint that returns an array of URL entries, and this
// keeps the file free of module-internal type imports.
// =============================================================================
import { defineEventHandler } from 'h3'
import { inventory } from '~~/app/config/inventory.config'

export default defineEventHandler(() =>
  inventory.flatMap((bike) => [
    {
      loc: `/inventory/${bike.slug}`,
      _sitemap: 'id-ID',
      changefreq: 'weekly',
      priority: 0.8,
      images: [{ loc: bike.images[0] ?? '' }],
    },
    {
      loc: `/en/inventory/${bike.slug}`,
      _sitemap: 'en-US',
      changefreq: 'weekly',
      priority: 0.8,
      images: [{ loc: bike.images[0] ?? '' }],
    },
  ]),
)
