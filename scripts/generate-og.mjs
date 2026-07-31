// =============================================================================
// Social share images (Open Graph / Twitter cards).
//
// Crawlers — WhatsApp, Facebook, X, LinkedIn — do not execute JavaScript and do
// not render SVG, so every share image must be a pre-rendered raster file at a
// predictable URL. This script composites:
//
//   public/og-image.jpg        1200×630  site-wide card
//   public/og/<slug>.jpg       1200×630  per-unit card over that unit's hero
//
// Text is drawn as an SVG overlay (rendered by sharp/librsvg with generic
// families, since the site's web fonts are not installed system-wide) and
// composited over the darkened photo.
//
// Run: pnpm og   (after pnpm bikes, since it reads the graded frames)
// =============================================================================
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')
const OUT_OG = resolve(PUBLIC, 'og')

const W = 1200
const H = 630
const CARBON = '#06070a'
const IGNITION = '#ff4a17'
const VOLT = '#d4ff4f'
const CHALK = '#edf1f7'
const TITANIUM = '#98a2b3'

// Units mirrored from inventory.config.ts (kept minimal: slug + display text).
// A card is only rendered for slugs whose hero frame exists on disk.
const UNITS = [
  { slug: 'ducati-panigale-v4r', make: 'Ducati', model: 'Panigale V4 R', year: 2023, price: 'Rp 1,25 M', badge: 'BEKAS' },
  { slug: 'bmw-s1000rr', make: 'BMW Motorrad', model: 'S 1000 RR', year: 2024, price: 'Rp 895 jt', badge: 'BARU' },
  { slug: 'honda-cbr1000rr-r-sp', make: 'Honda', model: 'CBR1000RR-R SP', year: 2022, price: 'Rp 785 jt', badge: 'BEKAS' },
  { slug: 'yamaha-yzf-r1', make: 'Yamaha', model: 'YZF-R1', year: 2016, price: 'Rp 425 jt', badge: 'BEKAS' },
  { slug: 'kawasaki-ninja-zx10r', make: 'Kawasaki', model: 'Ninja ZX-10R', year: 2021, price: 'Rp 465 jt', badge: 'BEKAS' },
  { slug: 'aprilia-rsv4-rr', make: 'Aprilia', model: 'RSV4 RR', year: 2019, price: 'Rp 585 jt', badge: 'BEKAS' },
  { slug: 'ktm-1290-super-duke-r', make: 'KTM', model: '1290 Super Duke R', year: 2021, price: 'Rp 495 jt', badge: 'BEKAS' },
  { slug: 'yamaha-mt09', make: 'Yamaha', model: 'MT-09', year: 2024, price: 'Rp 295 jt', badge: 'BARU' },
  { slug: 'mv-agusta-brutale-1000-rs', make: 'MV Agusta', model: 'Brutale 1000 RS', year: 2024, price: 'Rp 1,05 M', badge: 'BARU' },
  { slug: 'triumph-street-triple-r', make: 'Triumph', model: 'Street Triple R 675', year: 2013, price: 'Rp 165 jt', badge: 'BEKAS' },
  { slug: 'kawasaki-z900rs', make: 'Kawasaki', model: 'Z900RS', year: 2023, price: 'Rp 385 jt', badge: 'BEKAS' },
  { slug: 'ducati-multistrada-v4s', make: 'Ducati', model: 'Multistrada V4 S', year: 2025, price: 'Rp 1,095 M', badge: 'BARU' },
]

const escape = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Wraps a model name onto two lines when it is too long for one. */
function splitTitle(text, limit = 20) {
  if (text.length <= limit) return [text]
  const words = text.split(' ')
  const lines = ['']
  for (const word of words) {
    const candidate = lines[lines.length - 1] ? `${lines[lines.length - 1]} ${word}` : word
    if (candidate.length > limit && lines[lines.length - 1]) lines.push(word)
    else lines[lines.length - 1] = candidate
  }
  return lines.slice(0, 2)
}

/** The tachometer mark, reused from the favicon geometry. */
const mark = (x, y, scale) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M14.1 28.5A19 19 0 1 1 49.9 28.5" fill="none" stroke="${IGNITION}" stroke-width="9" stroke-linecap="round"/>
    <path d="M32 37.5 45.5 22" fill="none" stroke="${VOLT}" stroke-width="7.5" stroke-linecap="round"/>
  </g>`

function overlay({ eyebrow, titleLines, meta, price, badge }) {
  const titleY = titleLines.length > 1 ? 300 : 330
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${CARBON}" stop-opacity="0.97"/>
        <stop offset="55%" stop-color="${CARBON}" stop-opacity="0.82"/>
        <stop offset="100%" stop-color="${CARBON}" stop-opacity="0.35"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#scrim)"/>
    <rect x="0" y="${H - 8}" width="${W}" height="8" fill="${IGNITION}"/>

    ${mark(72, 56, 0.85)}
    <text x="138" y="104" font-family="DejaVu Sans, Verdana, sans-serif" font-size="34" font-weight="bold"
          letter-spacing="6" fill="${CHALK}">OKT<tspan fill="${IGNITION}">AN</tspan></text>

    <text x="74" y="200" font-family="DejaVu Sans, Verdana, sans-serif" font-size="22" letter-spacing="7"
          fill="${TITANIUM}">${escape(eyebrow)}</text>

    ${titleLines
      .map(
        (line, index) =>
          `<text x="74" y="${titleY + index * 74}" font-family="DejaVu Sans, Verdana, sans-serif" font-size="66"
                 font-weight="bold" fill="${CHALK}">${escape(line)}</text>`,
      )
      .join('\n')}

    <text x="74" y="${titleY + titleLines.length * 74 + 26}" font-family="DejaVu Sans, Verdana, sans-serif"
          font-size="28" fill="${TITANIUM}">${escape(meta)}</text>

    <text x="74" y="${H - 74}" font-family="DejaVu Sans, Verdana, sans-serif" font-size="46" font-weight="bold"
          fill="${IGNITION}">${escape(price)}</text>

    ${
      badge
        ? `<rect x="${W - 250}" y="60" width="180" height="48" rx="4" fill="none" stroke="${VOLT}" stroke-width="2"/>
           <text x="${W - 160}" y="92" text-anchor="middle" font-family="DejaVu Sans, Verdana, sans-serif"
                 font-size="24" letter-spacing="4" fill="${VOLT}">${escape(badge)}</text>`
        : ''
    }
  </svg>`)
}

async function card(photoPath, texts) {
  const base = await sharp(photoPath)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.82, saturation: 0.9 })
    .toBuffer()
  return sharp(base).composite([{ input: overlay(texts) }])
}

async function main() {
  await mkdir(OUT_OG, { recursive: true })

  // Site-wide card over the atelier editorial frame.
  const home = await card(resolve(PUBLIC, 'editorial/atelier.jpg'), {
    eyebrow: 'GALERI MOTOR SPORT · JAKARTA',
    titleLines: ['MOTOR SPORT BARU', '& BEKAS PILIHAN'],
    meta: 'Diperiksa · riwayat dicatat · harga terbuka',
    price: 'Konsultasi via WhatsApp',
    badge: 'DEMO',
  })
  await writeFile(resolve(PUBLIC, 'og-image.jpg'), await home.jpeg({ quality: 84, mozjpeg: true }).toBuffer())
  console.log('  ✓ og-image.jpg')

  let count = 0
  for (const unit of UNITS) {
    const hero = resolve(PUBLIC, `bikes/${unit.slug}-1.jpg`)
    try {
      const image = await card(hero, {
        eyebrow: escape(unit.make.toUpperCase()),
        titleLines: splitTitle(unit.model),
        meta: `${unit.year} · ${unit.badge === 'BARU' ? 'Unit baru' : 'Unit bekas terperiksa'}`,
        price: unit.price,
        badge: unit.badge,
      })
      await writeFile(
        resolve(OUT_OG, `${unit.slug}.jpg`),
        await image.jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
      )
      count++
    } catch (error) {
      console.warn(`  ⚠ skipped ${unit.slug}: ${error.message}`)
    }
  }

  console.log(`\n✓ ${count} unit share cards written to public/og/`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
