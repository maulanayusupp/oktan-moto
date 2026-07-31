# TODO — oktan-moto

Backlog for **OKTAN Superbike Gallery**. Ordered by what would matter most if
this became a real showroom site. Anything that changes behaviour must also
update `CLAUDE.md`, both locales and the compliance pages (see
`CLAUDE.md` § Maintenance rules).

---

## Before this could go live commercially

- [ ] **Replace the placeholder identity.** Real business name, legal entity,
      licence/registration numbers, address, hours. Then remove the demo banner
      from `/compliance` and the `DemoNotice` instances that describe the data as
      illustrative.
- [ ] **Decide on a phone channel.** The site is intentionally e-mail-only right
      now. A real showroom usually wants a published business number and service
      hours; adding one means updating the contact page, the AutoDealer JSON-LD
      (`telephone`) and the contact-channel section of `/compliance`.
- [ ] **Replace all photography with own unit photos.** Current frames are
      freely licensed Wikimedia Commons images of comparable models; CC BY-SA
      carries share-alike obligations. Own photos also remove the "crop of the
      same source" workaround in single-photo galleries.
- [ ] **Replace sample inventory with real stock**, including a real per-unit
      inspection report and verified document status.
- [ ] **Replace sample testimonials** with consented, attributable reviews — or
      delete the section.
- [ ] Confirm the instalment estimator's assumed rate with an actual finance
      partner, or hide the estimator until a partner is signed.

## Content & commerce

- [ ] Inventory management without redeploys — a CMS or headless source
      (Nuxt Content, Sanity, Directus) behind the same `inventory.service` API.
- [ ] Sold / reserved states, with a `sold` badge and an "archive" view instead of
      silently removing units.
- [ ] Trade-in intake flow: guided form (photos, mileage, documents) that
      composes a structured e-mail.
- [ ] Saved/wishlist units alongside the compare tray, sharing the storage layer.
- [ ] Per-unit inspection report as a rendered PDF/print view.
- [ ] Finance: side-by-side comparison of several tenor/DP combinations.
- [ ] Test-ride / viewing booking with real availability instead of free text.

## Engineering

- [ ] **Automated tests.** Unit tests for `inventory`, `enquiry`, `finance`,
      `contact` services (Vitest) and a smoke E2E (Playwright) covering
      filter → detail → mailto: composition.
- [ ] **ESLint + Prettier** with `@nuxt/eslint`, wired into a pre-commit hook.
- [ ] CI: run `pnpm build`, `pnpm typecheck`, `pnpm i18n:check` on every push, and
      `pnpm social:check` against a preview deployment.
- [ ] Image delivery: adopt `@nuxt/image` for responsive AVIF/WebP with automatic
      `srcset`, replacing the hand-rolled `-sm` variants.
- [ ] Enable runtime OG images (`@nuxtjs/og-image` needs the native
      `@takumi-rs/core` renderer) so share cards stop being a build step.
- [ ] Pre-render the catalogue (`nuxt generate`) or add route rules for static
      hosting and cheaper cold starts.
- [ ] Split the WebGL chunk further / consider an `IdleCallback` mount so the 3D
      hero never competes with LCP on slow devices.
- [ ] Measure: Lighthouse + Web Vitals budget, especially CLS around the hero
      poster → canvas swap and the total weight of `public/bikes`.

## 3D scene

- [ ] Add a low-poly rider silhouette option for scale reference.
- [ ] Optional environment map (single small HDR) for more believable metal.
- [ ] Wheel rotation and a subtle suspension idle when the visitor drags.
- [ ] Let each unit's livery drive the hero colour when arriving from a listing.
- [ ] Investigate `WebGPURenderer` when three.js marks it stable for wider
      support.

## Design & UX

- [ ] Light theme option (the palette has enough contrast headroom to support it).
- [ ] Category landing pages (`/inventory/supersport` …) for SEO depth, using the
      existing filter service.
- [ ] Editorial section: buying guides, maintenance-cost explainers, first-big-bike
      advice — the questions this market actually asks.
- [ ] Print stylesheet for unit pages (buyers do print listings).
- [ ] Keyboard shortcut hints for gallery navigation.

## Internationalisation

- [ ] Third locale (e.g. `zh` or `ja`) for regional collectors — the i18n
      structure and `pnpm i18n:check` already support it.
- [ ] Locale-aware price formatting for non-IDR display (informational only).
- [ ] Translate `pnpm i18n:check` output to a machine-readable report for CI.

## Compliance & trust

- [ ] Cookie/consent banner **only if** analytics is ever added — today the site
      sets no tracking storage, and a banner would imply otherwise.
- [ ] Named hosting provider and data location on `/privacy` once deployed.
- [ ] Dispute-resolution clause and jurisdiction detail in `/terms`.
- [ ] Independent accessibility audit (axe + manual screen-reader pass) and a
      published statement with the audit date.
- [ ] Document the retention policy for e-mail enquiries.
