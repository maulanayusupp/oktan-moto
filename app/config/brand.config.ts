// =============================================================================
// Brand + showroom identity. PLACEHOLDER DEMO IDENTITY: "OKTAN" is not a
// registered dealership — the address, hours and figures below are illustrative
// sample data for a portfolio build (stated on /compliance and in the footer).
// Swap these values, the inventory and the photography before any real launch.
//
// Structure only: no display copy here. Anything a visitor reads lives in
// i18n/locales/{id,en}.json.
// =============================================================================

export const brandConfig = {
  name: 'OKTAN',
  /** Full legal-ish name used in schema.org + <title> suffixes. */
  longName: 'OKTAN Superbike Gallery',
  /** Wordmark split so the accent can be applied to the tail in BrandLogo. */
  wordmark: { head: 'OKT', tail: 'AN' },
  foundedYear: 2019,
  /** Sample showroom location. */
  city: 'Jakarta Selatan',
  region: 'DKI Jakarta',
  country: 'ID',
  postalCode: '12190',
  streetKey: 'contact.address.street',
  geo: { lat: -6.2416, lng: 106.7991 },
  /** Contact channels. WhatsApp + e-mail come from runtimeConfig at call time. */
  instagram: 'https://www.instagram.com/',
  /** Opening hours in 24h local time, used for copy and schema.org. */
  hours: {
    weekdays: { open: '10:00', close: '19:00' },
    saturday: { open: '10:00', close: '17:00' },
    sunday: null,
  },
  /** Figures shown in the hero counter strip — deliberately verifiable ones. */
  stats: {
    unitsListed: 12,
    inspectionPoints: 60,
    locales: 2,
  },
} as const

export type BrandConfig = typeof brandConfig
