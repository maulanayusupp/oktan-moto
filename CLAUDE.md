# CLAUDE.md — oktan-moto

Working notes for anyone (human or agent) touching this repository. **Read this
before changing code, and update it in the same change** — see
[Maintenance rules](#maintenance-rules).

---

## 1. What this project is

**OKTAN Superbike Gallery** — a marketing + e-commerce site for **new and
pre-owned sportbikes** (motor sport), aimed at the Indonesian market.

- **Brand `OKTAN` is a placeholder.** It is not a registered business. The 12
  units, their prices, mileage, ownership and service histories are
  **illustrative sample data**. This is stated on `/compliance`, in the footer of
  every page, and next to every set of figures via the `DemoNotice` component.
- **Commerce model: WhatsApp handoff, not a cart.** A litre-class motorcycle is
  not a one-click purchase, so every commerce action ends in a pre-filled,
  localised `wa.me` message. There is no checkout, no payment integration and no
  server-side form endpoint.
- **Copy must not over-claim.** Only claims a showroom actually controls
  (inspection, records, paperwork, delivery). No performance promises, no
  manufactured urgency, no fabricated reviews — sample testimonials are labelled
  as samples.

## 2. Stack (verified 2026-08-01)

| Package | Version | Notes |
| --- | --- | --- |
| `nuxt` | 4.5.1 | Node ≥ 20.11, pnpm 9 |
| `vue` | 3.5 (transitive) | Composition API, `<script setup>` |
| `@nuxtjs/i18n` | 10.6.0 | EN + **ID default**, `prefix_except_default` |
| `@nuxtjs/seo` | 5.3.6 | sitemap, robots, schema.org (`ogImage` disabled) |
| `three` | 0.185.1 | dynamic import only, client-side |
| `sass` | 1.102.0 | SCSS is the only styling mechanism |
| `sharp` | 0.34.5 | asset pipeline (pinned for nuxt-og-image's peer range) |
| `favicons` | 7.3.1 | icon rasterisation |
| `typescript` / `vue-tsc` | 5.9.3 / 2.2.10 | `pnpm typecheck` passes clean |

TypeScript is `strict: true`; `typescript.typeCheck` is false in the build (the
gate is the explicit `pnpm typecheck` script).

## 3. Architecture

```
config  →  services  →  composables  →  components  →  pages
(facts)    (logic)      (state)         (markup)       (composition)
```

- **`app/config/*`** — structure and hard facts only: ids, prices, specs, image
  paths, section order, 3D geometry. **No display strings.**
- **`app/services/*`** — pure business logic, no Vue: `inventory` (filter/sort/
  related/ranges), `whatsapp` (deep links), `contact` (validation),
  `finance` (instalment maths).
- **`app/composables/*`** — reactive state and side effects: `usePageSeo`,
  `useInventoryFilters` (URL-synced), `useCompare` (shared tray),
  `useCurrency`, `useReveal`, `useSuperbikeScene` (WebGL).
- **`app/components/*`** — grouped `base/ layout/ common/ home/ catalog/ bike/
  contact/`, registered with `pathPrefix: false`, so `<BaseButton />`,
  `<BikeCard />` etc. resolve by filename.
- **`app/utils/*`** — pure helpers (`format.ts`, `iconPaths.ts`), auto-imported.
  ⚠️ Auto-imports are global: a local `const ratio = …` would shadow
  `utils/format.ts`'s `ratio()` and fail at build time. Name locals distinctly.
- **`i18n/locales/{id,en}.json`** — **every** visible string. 535 leaf keys.
- **`server/api/__sitemap__/urls.ts`** — dynamic sitemap entries for unit pages.

## 4. Styling rules

- **No inline CSS.** The single global entry is `app/assets/scss/main.scss`
  (`tokens → reset → typography → base → utilities`); everything else lives in a
  component's scoped `<style lang="scss">`.
- `_variables.scss` + `_mixins.scss` are injected into every component through
  `_shared.scss` (`vite.css.preprocessorOptions.scss.additionalData`). They must
  stay side-effect free — a real rule in there is duplicated into every sheet.
- **The one allowed `:style` use** is passing a CSS custom property through
  (`--reveal-delay`, `--fill`, `--swatch`); the rule that consumes it is in SCSS.
- Reusable visual patterns are mixins, not copy-paste: `panel()`, `notch()`,
  `tarmac-grid()`, `hatch()`, `focus-visible()`, `thin-scrollbar()`.

### Theme

No logo was supplied, so the palette derives from the brand idea (OKTAN =
high-octane fuel): carbon-black surfaces, titanium text, **ignition orange
`#ff4a17`** for actions and prices, **volt lime `#d4ff4f`** for data highlights
and new-unit flags, **coolant cyan `#3fd8e8`** reserved for telemetry graphics
and the WebGL rim light. Single dark theme. Display face **Chakra Petch**
(headings, all numbers), body face **Sora**. Signature motifs: the cut "notch"
corner, the apex-line SVG curve, telemetry bars, technical grid texture.

## 5. Distinctive features

- **Procedural 3D hero** (`useSuperbikeScene` + `app/config/bike-model.config.ts`)
  — a sportbike built from primitives and extruded side-profile outlines, on a
  lit turntable, drag-to-rotate, with 4 live livery colours. `three` is loaded
  dynamically after mount; a static poster shows first and **stays** if WebGL is
  missing, if the scene throws, or under `prefers-reduced-motion`.
  Geometry is in metres against real reference dimensions (wheelbase 1.44 m,
  tyre Ø 0.62 m, seat 0.83 m) and can be verified without a browser:
  `pnpm bike:profile` renders the side view to `docs/bike-profile.png`.
- **Compare tray** — up to 3 units, persisted in `localStorage`, best value per
  row highlighted, single WhatsApp message covering all selections.
- **Telemetry bars** — each unit's power, power-to-weight, capacity and weight
  benchmarked against the live catalogue range (weight bar inverts, since lower
  is better).
- **Instalment estimator** — flat-rate simulation (the Indonesian multifinance
  convention), labelled as an illustration in the UI and on `/compliance`.
- **URL-synced filters** — condition, category, price ceiling, capacity, sort and
  free-text all live in the query string, so any view is shareable.
- **Photo credits page** — generated from `app/config/photo-credits.json`, which
  the asset script writes. CC BY / CC BY-SA require attribution, so this is a
  licence obligation, not decoration.

## 6. Data & assets

- **Inventory**: 12 units in `app/config/inventory.config.ts` (4 new, 8
  pre-owned; supersport / naked / sport-touring / heritage). Facts live there;
  prose lives at `bikes.<slug>.{tagline,description}` in both locales.
  Performance figures are the manufacturers' published numbers, rounded, using
  **kerb** weights where available.
- **Photography**: freely licensed frames from Wikimedia Commons, downloaded,
  re-graded and written to `public/bikes/` + `public/editorial/` by
  `pnpm bikes`. Every source file was inspected visually before being listed, so
  a listing's gallery always shows the *same* machine; where only one photo of a
  machine exists, extra frames are tighter crops of it (documented in the script
  and on `/credits`). A single grade (slight de-saturation, contrast lift,
  vignette) unifies the mixed sources.
- **Share images**: `pnpm og` composites `public/og-image.jpg` and
  `public/og/<slug>.jpg` (1200×630 raster — crawlers do not render SVG).
- **Icons**: `pnpm favicons` draws the tachometer mark and rasterises it; the
  same geometry is in `BrandLogo.vue`, so tab icon and header logo never diverge.

## 7. Commands

```bash
pnpm dev              # dev server
pnpm build            # authoritative compile gate
pnpm preview          # serve .output
pnpm typecheck        # vue-tsc, must stay clean
pnpm i18n:check       # ID/EN parity, placeholders, unit copy, unescaped "@"
pnpm bikes            # (re)download + grade photography, write photo-credits.json
pnpm og               # render share cards (run after pnpm bikes)
pnpm favicons         # icons + site.webmanifest
pnpm bike:profile     # render the 3D model's side view for review
```

## 8. Gotchas

- **WhatsApp templates use `%token%`**, not vue-i18n `{}` — the message compiler
  would consume `{}` before the service could fill it. Tokens: `%unit% %year%
  %price% %mileage% %url% %list% %name% %phoneNumber% %email% %interest%
  %message%`.
- **A literal `@` in an i18n string must be escaped `{'@'}`** — vue-i18n reads it
  as a linked-message marker. `pnpm i18n:check` fails the build on this.
- **`og:type: product`** is set through `useHead` meta, not `useSeoMeta`, whose
  type union excludes it.
- `nuxt-og-image` runtime rendering is **off** (needs the native `@takumi-rs/core`
  renderer); share images are pre-rendered instead.
- `sharp` is pinned to 0.34.x to satisfy `nuxt-og-image`'s peer range.
- Wikimedia rate-limits bursts (HTTP 429). `pnpm bikes` paces requests, honours
  `Retry-After`, and skips frames already on disk (`--force` to redo).
- Cards use a stretched `::after`-style link overlay so the compare button can
  stay a real `<button>` (a button inside an `<a>` is invalid markup).

## 9. Accessibility

Target WCAG 2.1 AA. Skip link; visible focus rings via the `focus-visible()`
mixin; ARIA on every custom control (`aria-pressed` on toggles, `role="meter"` on
telemetry bars, `aria-expanded`/`aria-controls` on the drawer and tray);
`<details>`-based FAQ so it works without JS; keyboard navigation in the gallery
(←/→); `prefers-reduced-motion` respected by the reveal system, the marquee and
the 3D scene. Contact-form errors move focus to the first invalid field.

## 10. Maintenance rules

On **every** change, in the same commit:

1. Update this file if a rule, dependency, feature or data shape changed.
2. Update **both** `i18n/locales/id.json` and `en.json` for any text change, then
   run `pnpm i18n:check`.
3. Update `/compliance` (and `/privacy` or `/terms` where relevant) if data
   sources, third-party assets, claims or tracking behaviour changed — plus
   `/credits` if photography changed.
4. Record follow-up work in `TODO.md`.
5. Run `pnpm build` **and** `pnpm typecheck` before committing.
6. Commit as **Maulana Yusup Abdullah `<maulanayusupp@gmail.com>`**, with no
   AI-agent trailer, then push.

## 11. Pages

| Route | Purpose |
| --- | --- |
| `/` | Hero (3D), featured units, categories, values, process, editorial, testimonials, FAQ, CTA |
| `/inventory` | Filterable catalogue + ItemList JSON-LD |
| `/inventory/[slug]` | Gallery, prose, telemetry/specs, instalment estimate, enquiry rail, related units, Product JSON-LD |
| `/about` | Story, principles, timeline, preparation editorial, visiting |
| `/contact` | Channels, WhatsApp-composing form, viewing checklist |
| `/compliance` | Demo status, data + photo provenance, consumer law, accessibility |
| `/privacy` | Cookie/localStorage disclosure, no-server form explanation |
| `/terms` | Listing status, pricing, liability, governing law |
| `/credits` | Per-file photo attribution (licence obligation) |
| 404 / error | `app/error.vue`, same chrome as the site |

`id` is served at the root, `en` under `/en`. Every route exists in both locales
(20 URLs per locale in the sitemap: 8 static + 12 units).
