// =============================================================================
// Favicon + web-manifest generator.
//
// The mark is drawn here in SVG — a broken tachometer ring crossed by a throttle
// slash — using the exact same geometry as BrandLogo.vue, so the browser tab and
// the header logo are one shape. The vector is written to public/favicon.svg and
// rasterised by the `favicons` package for the PNG/ICO/Apple sizes.
//
// Run: pnpm favicons   (re-run whenever the palette or the mark changes)
// =============================================================================
import favicons from 'favicons'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')

const CARBON = '#06070a'
const IGNITION = '#ff4a17'
const VOLT = '#d4ff4f'

// 64×64 viewBox, matching BrandLogo: a tachometer sweep (arc open at the bottom)
// with the needle swung to redline. Strokes are heavier than the header version
// so the mark still reads at 16×16.
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
  <rect width="64" height="64" rx="12" fill="${CARBON}"/>
  <g transform="translate(0 3)">
    <path d="M14.1 25.5A19 19 0 1 1 49.9 25.5" fill="none" stroke="${IGNITION}"
          stroke-width="9" stroke-linecap="round"/>
    <path d="M32 34.5 45.5 19" fill="none" stroke="${VOLT}" stroke-width="7.5" stroke-linecap="round"/>
  </g>
</svg>
`

// A flat-background variant for maskable/Apple icons, which crop corners.
const maskableSvg = markSvg.replace('rx="12"', 'rx="0"')

async function main() {
  await mkdir(PUBLIC, { recursive: true })
  await writeFile(resolve(PUBLIC, 'favicon.svg'), markSvg)

  const response = await favicons(Buffer.from(maskableSvg), {
    path: '/',
    appName: 'OKTAN Superbike Gallery',
    appShortName: 'OKTAN',
    appDescription: 'Galeri motor sport baru & bekas — OKTAN',
    background: CARBON,
    theme_color: CARBON,
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    lang: 'id-ID',
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: false,
      favicons: true,
      windows: false,
      yandex: false,
    },
  })

  // Only the files the app actually links from nuxt.config are kept.
  const keep = new Set([
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon-48x48.png',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
  ])

  let written = 0
  for (const image of response.images) {
    if (!keep.has(image.name)) continue
    await writeFile(resolve(PUBLIC, image.name), image.contents)
    written++
  }

  // Hand-written manifest so it references exactly the icons we shipped.
  const manifest = {
    name: 'OKTAN Superbike Gallery',
    short_name: 'OKTAN',
    description: 'Galeri motor sport baru & bekas pilihan.',
    start_url: '/',
    display: 'standalone',
    background_color: CARBON,
    theme_color: CARBON,
    lang: 'id-ID',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
  await writeFile(resolve(PUBLIC, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n')

  console.log(`✓ favicon.svg + ${written} raster icons + site.webmanifest written to public/`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
