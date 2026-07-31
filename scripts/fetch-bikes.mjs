// =============================================================================
// Asset pipeline — motorcycle photography for the OKTAN demo showroom.
//
// Source: Wikimedia Commons (freely licensed). Every file below was inspected
// visually before being listed here, so a listing's gallery always shows the
// SAME machine. Licence + author + source page are captured per file and
// written to app/config/photo-credits.json, which the /credits page renders —
// CC BY / CC BY-SA require attribution, so that file must ship with the site.
//
// A single grade (slight de-saturation, contrast lift, vignette) is applied to
// every frame so photos from a dozen different photographers read as one
// cohesive gallery instead of a scrapbook.
//
// Run: pnpm bikes   (requires network; commit the resulting JPGs)
//
// Output per shot: public/bikes/<slug>-<n>.jpg      1600×1000 (detail/gallery)
//                  public/bikes/<slug>-<n>-sm.jpg    800×500  (cards, srcset)
//         plus     public/editorial/<name>.jpg      1600×900  (page imagery)
// =============================================================================
import sharp from 'sharp'
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_BIKES = resolve(ROOT, 'public/bikes')
const OUT_EDITORIAL = resolve(ROOT, 'public/editorial')
const CREDITS = resolve(ROOT, 'app/config/photo-credits.json')

const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'oktan-moto-site-build/1.0 (maulanayusupp@gmail.com)'

// --- Listing → verified Commons files -----------------------------------------
// `crop: 'detail'` re-frames the same photo as a tighter three-quarter detail
// so single-photo listings still get a three-frame gallery (honest: it is the
// same image, only cropped).
const UNITS = [
  {
    slug: 'ducati-panigale-v4r',
    shots: [
      { file: 'Ducati Panigale V4 R (3).jpg' },
      { file: 'Ducati Panigale V4 R (1).jpg' },
      { file: 'Ducati Panigale V4 R (3).jpg', crop: 'detail' },
    ],
  },
  {
    slug: 'bmw-s1000rr',
    shots: [
      { file: 'BMW S 1000 RR, left view.jpg' },
      { file: 'BMW S 1000 RR, right view.jpg' },
      { file: 'BMW S 1000 RR, left view.jpg', crop: 'detail' },
    ],
  },
  {
    slug: 'honda-cbr1000rr-r-sp',
    shots: [
      { file: '2024 Honda CBR1000RR-R Fireblade SP.jpg' },
      { file: 'CBR 1000 RR-R SP 2020-mod-2022-12.jpg' },
      { file: '2024 Honda CBR1000RR-R Fireblade SP.jpg', crop: 'detail' },
    ],
  },
  {
    slug: 'yamaha-yzf-r1',
    shots: [
      { file: '2015 Yamaha YZF-R1 crop.JPG' },
      { file: '2015 Yamaha YZF-R1 crop.JPG', crop: 'detail' },
    ],
  },
  {
    slug: 'kawasaki-ninja-zx10r',
    shots: [
      { file: 'Kawasaki Ninja ZX-10R 2025.jpg' },
      { file: 'The frontview of Kawasaki Ninja ZX-10R mid-year 2019.jpg' },
      { file: 'Kawasaki Ninja ZX-10R 2025.jpg', crop: 'detail' },
    ],
  },
  {
    slug: 'aprilia-rsv4-rr',
    shots: [
      { file: 'Aprilia RSV4 RR (2).jpg' },
      { file: 'Aprilia RSV4 RR (3).jpg' },
      { file: 'Aprilia RSV4 RR (1).jpg' },
    ],
  },
  {
    slug: 'ktm-1290-super-duke-r',
    shots: [
      { file: 'KTM 1290 Super Duke R Special Edition MY 2016.jpg' },
      { file: 'KTM 1290 Super Duke R, right view.jpg' },
      { file: 'KTM Super Duke 1290 R (1).jpg' },
    ],
  },
  {
    slug: 'yamaha-mt09',
    shots: [
      { file: '2024 Yamaha MT-09.jpg' },
      { file: '2024 Yamaha MT-09.jpg', crop: 'detail' },
    ],
  },
  {
    slug: 'mv-agusta-brutale-1000-rs',
    shots: [
      { file: '2024 MV Agusta Brutale 1000 RS (2).jpg' },
      { file: '2024 MV Agusta Brutale 1000 RS (1).jpg' },
      { file: '2024 MV Agusta Brutale 1000 RS (2).jpg', crop: 'detail' },
    ],
  },
  {
    slug: 'triumph-street-triple-r',
    shots: [
      { file: 'Triumph Street Triple 675 left.jpg' },
      { file: 'Triumph Street Triple 675 front left threequarter.jpg' },
      { file: 'Triumph Street Triple 675 rear right threequarter alt.jpg' },
    ],
  },
  {
    slug: 'kawasaki-z900rs',
    shots: [
      { file: "Kawasaki Z900RS - Mondial de l'Automobile de Paris 2018 - 001.jpg" },
      { file: "Kawasaki Z900RS - Mondial de l'Automobile de Paris 2018 - 002.jpg" },
      { file: "Kawasaki Z900RS - Mondial de l'Automobile de Paris 2018 - 001.jpg", crop: 'detail' },
    ],
  },
  {
    slug: 'ducati-multistrada-v4s',
    shots: [
      // Only the '25 photo shows this (black) machine — the EICMA frame is a red
      // one, so the third gallery slot is a tighter crop of the same shot.
      { file: "Ducati Multistrada V4 S '25.jpg" },
      { file: "Ducati Multistrada V4 S '25.jpg", crop: 'detail' },
    ],
  },
]

// --- Editorial imagery (page mood, never presented as a listing) --------------
const EDITORIAL = [
  { name: 'apex-rider', file: 'Aprilia RSV4 RF.jpg' },
  { name: 'chassis', file: 'Kawasaki Ninja ZX-10R strip model right 2015 Tokyo Motor Show.jpg' },
  { name: 'tank-top', file: '2014 Triumph Street Triple R matte graphite top.JPG' },
  { name: 'atelier', file: 'Mv Agusta Brutale 1000 RS (2021).jpg' },
  { name: 'heritage', file: 'Kawasaki Z900RS Cafe.jpg' },
  { name: 'night-street', file: '2024 Kawasaki Z900RS ABS in Metallic Diablo Black, left side.jpg' },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const strip = (v) => (v ? String(v).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '')

// Every distinct source file we need.
const files = [...new Set([...UNITS.flatMap((u) => u.shots.map((s) => s.file)), ...EDITORIAL.map((e) => e.file)])]

// One batched imageinfo call (Commons allows 50 titles) — avoids rate limiting.
async function fetchMeta(titles) {
  const url = `${API}?action=query&format=json&titles=${encodeURIComponent(
    titles.map((t) => 'File:' + t).join('|'),
  )}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=2200`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`)
  const data = await res.json()
  const map = new Map()
  for (const page of Object.values(data.query?.pages || {})) {
    const info = page.imageinfo?.[0]
    if (!info) continue
    map.set(page.title.replace(/^File:/, '').replace(/_/g, ' '), {
      src: info.thumburl || info.url,
      author: strip(info.extmetadata?.Artist?.value) || 'Unknown',
      license: strip(info.extmetadata?.LicenseShortName?.value) || 'see source',
      licenseUrl: strip(info.extmetadata?.LicenseUrl?.value),
      page: info.descriptionurl,
    })
  }
  return map
}

// Wikimedia throttles bursts hard (HTTP 429) — pace requests and honour
// Retry-After so a re-run does not get the whole batch rejected.
async function download(src) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(src, { headers: { 'User-Agent': UA } })
      if (res.status === 429) {
        const wait = Number(res.headers.get('retry-after')) * 1000 || 20_000 * (attempt + 1)
        process.stdout.write(`  … throttled, waiting ${Math.round(wait / 1000)}s\n`)
        await sleep(wait)
        continue
      }
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return Buffer.from(await res.arrayBuffer())
    } catch (e) {
      if (attempt === 4) throw e
      await sleep(5_000 * (attempt + 1))
    }
  }
  throw new Error('Gave up downloading ' + src)
}

// A radial vignette + cool shadow wash, sized to the output frame.
function vignette(w, h) {
  return Buffer.from(`<svg width="${w}" height="${h}">
    <defs>
      <radialGradient id="v" cx="50%" cy="46%" r="78%">
        <stop offset="45%" stop-color="#ffffff" stop-opacity="1"/>
        <stop offset="100%" stop-color="#6a6f7d" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#v)"/>
  </svg>`)
}

// Shared grade so a dozen photographers' frames sit together calmly.
async function grade(buf, { width, height, crop }) {
  let img = sharp(buf).rotate()
  if (crop === 'detail') {
    const meta = await img.metadata()
    const w = meta.width ?? width
    const h = meta.height ?? height
    // Tighter re-frame around the machine's centre mass (slightly right/low).
    const cw = Math.round(w * 0.6)
    const ch = Math.round(h * 0.6)
    img = sharp(
      await img
        .extract({
          left: Math.round((w - cw) * 0.55),
          top: Math.round((h - ch) * 0.55),
          width: cw,
          height: ch,
        })
        .toBuffer(),
    )
  }
  return img
    .resize(width, height, { fit: 'cover', position: 'centre', withoutEnlargement: false })
    .modulate({ brightness: 0.98, saturation: 0.93 })
    .linear(1.07, -12)
    .composite([{ input: vignette(width, height), blend: 'multiply' }])
    .jpeg({ quality: 78, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer()
}

async function main() {
  await mkdir(OUT_BIKES, { recursive: true })
  await mkdir(OUT_EDITORIAL, { recursive: true })

  console.log(`Resolving ${files.length} Commons files…`)
  const meta = await fetchMeta(files)
  const missing = files.filter((f) => !meta.has(f.replace(/_/g, ' ')))
  if (missing.length) throw new Error('Commons returned no imageinfo for:\n  ' + missing.join('\n  '))

  const cache = new Map()
  const credits = []
  const force = process.argv.includes('--force')

  const source = async (file) => {
    if (!cache.has(file)) {
      const info = meta.get(file.replace(/_/g, ' '))
      cache.set(file, await download(info.src))
      await sleep(700)
    }
    return cache.get(file)
  }

  // Already-graded frames are reused unless --force, so an interrupted run can
  // resume instead of re-downloading everything (and tripping the rate limit).
  const exists = async (path) => {
    if (force) return false
    try {
      await stat(path)
      return true
    } catch {
      return false
    }
  }

  for (const unit of UNITS) {
    for (let i = 0; i < unit.shots.length; i++) {
      const shot = unit.shots[i]
      const base = `${unit.slug}-${i + 1}`
      const full = resolve(OUT_BIKES, `${base}.jpg`)
      const small = resolve(OUT_BIKES, `${base}-sm.jpg`)
      if (!((await exists(full)) && (await exists(small)))) {
        const buf = await source(shot.file)
        await writeFile(full, await grade(buf, { width: 1600, height: 1000, crop: shot.crop }))
        await writeFile(small, await grade(buf, { width: 800, height: 500, crop: shot.crop }))
      }
      const info = meta.get(shot.file.replace(/_/g, ' '))
      credits.push({
        asset: `/bikes/${base}.jpg`,
        file: shot.file,
        author: info.author,
        license: info.license,
        licenseUrl: info.licenseUrl,
        source: info.page,
      })
      console.log(`  ✓ ${base}.jpg`)
    }
  }

  for (const item of EDITORIAL) {
    const full = resolve(OUT_EDITORIAL, `${item.name}.jpg`)
    const small = resolve(OUT_EDITORIAL, `${item.name}-sm.jpg`)
    if (!((await exists(full)) && (await exists(small)))) {
      const buf = await source(item.file)
      await writeFile(full, await grade(buf, { width: 1600, height: 900 }))
      await writeFile(small, await grade(buf, { width: 800, height: 450 }))
    }
    const info = meta.get(item.file.replace(/_/g, ' '))
    credits.push({
      asset: `/editorial/${item.name}.jpg`,
      file: item.file,
      author: info.author,
      license: info.license,
      licenseUrl: info.licenseUrl,
      source: info.page,
    })
    console.log(`  ✓ editorial/${item.name}.jpg`)
  }

  await writeFile(CREDITS, JSON.stringify({ generatedFrom: 'Wikimedia Commons', items: credits }, null, 2) + '\n')
  console.log(`\n✓ ${credits.length} frames written; credits → app/config/photo-credits.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
