// =============================================================================
// Social link-preview gate (WhatsApp, Instagram/Facebook, X, LinkedIn).
//
// These crawlers do not run JavaScript and do not render SVG, so a preview only
// appears when the server-rendered HTML already carries absolute, raster
// og:image URLs. This script asserts exactly what those crawlers need:
//
//   • og:title / og:description / og:url / og:site_name / og:type present
//   • og:image + og:image:secure_url absolute, http(s), raster (.jpg/.png)
//   • og:image:width / height declared, and matching the real file
//   • image reachable, correct content-type, and small enough that WhatsApp
//     still fetches it (it skips large files; ~300 kB is the safe ceiling)
//   • twitter:card = summary_large_image with its own title/description/image
//   • the page is indexable and returns 200 to a crawler user agent
//
// Run against a running server:
//   node scripts/check-social.mjs [baseUrl]         (default http://localhost:3000)
//
// Note: og:image URLs are built from NUXT_PUBLIC_SITE_URL, so when checking a
// local server the image host is the production domain. The script therefore
// verifies the tag is absolute, then re-resolves the path against baseUrl to
// fetch the actual bytes.
// =============================================================================
import sharp from 'sharp'

const BASE = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')

// A WhatsApp-like UA: some hosts treat unknown agents differently.
const UA = 'WhatsApp/2.23.20.0 A'
const MAX_IMAGE_BYTES = 300 * 1024

const ROUTES = [
  '/',
  '/inventory',
  '/inventory/ducati-panigale-v4r',
  '/about',
  '/contact',
  '/compliance',
  '/privacy',
  '/terms',
  '/credits',
  '/en',
  '/en/inventory/bmw-s1000rr',
]

const REQUIRED_OG = [
  'og:title',
  'og:description',
  'og:url',
  'og:site_name',
  'og:type',
  'og:image',
  'og:image:secure_url',
  'og:image:type',
  'og:image:width',
  'og:image:height',
  'og:image:alt',
  'og:locale',
]

const REQUIRED_TWITTER = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']

const failures = []
const notes = []

/** Pulls <meta property|name="…" content="…"> pairs out of raw HTML. */
function readMeta(html) {
  const meta = new Map()
  const re = /<meta\s+([^>]+?)\/?>/gi
  let match
  while ((match = re.exec(html))) {
    const attrs = match[1]
    const key = /(?:property|name)=["']([^"']+)["']/i.exec(attrs)?.[1]
    const content = /content=["']([^"']*)["']/i.exec(attrs)?.[1]
    if (key && content !== undefined) meta.set(key.toLowerCase(), content)
  }
  return meta
}

const imageCache = new Map()

async function checkImage(route, url) {
  if (imageCache.has(url)) return imageCache.get(url)

  // og:image points at the canonical host; fetch the same path from the server
  // under test so this works locally and in CI.
  const path = new URL(url).pathname
  const res = await fetch(`${BASE}${path}`, { headers: { 'User-Agent': UA } })
  if (!res.ok) {
    failures.push(`${route}: og:image ${path} returned HTTP ${res.status}`)
    imageCache.set(url, null)
    return null
  }

  const type = res.headers.get('content-type') ?? ''
  if (!/^image\/(jpeg|png)$/.test(type)) {
    failures.push(`${route}: og:image served as "${type}" — crawlers need image/jpeg or image/png`)
  }

  const bytes = Buffer.from(await res.arrayBuffer())
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    failures.push(
      `${route}: og:image is ${(bytes.byteLength / 1024).toFixed(0)} kB — over the ${MAX_IMAGE_BYTES / 1024} kB ceiling WhatsApp reliably fetches`,
    )
  }

  const meta = await sharp(bytes).metadata()
  const result = { bytes: bytes.byteLength, width: meta.width, height: meta.height, type }
  imageCache.set(url, result)
  return result
}

// robots.txt first: facebookexternalhit (Instagram/Facebook previews) honours
// it, so a stray `Disallow: /` breaks previews while every meta tag looks fine.
{
  const res = await fetch(`${BASE}/robots.txt`, { headers: { 'User-Agent': UA } })
  const text = res.ok ? await res.text() : ''
  if (!res.ok) {
    failures.push(`/robots.txt returned HTTP ${res.status}`)
  } else if (/^\s*Disallow:\s*\/\s*$/im.test(text)) {
    failures.push('/robots.txt disallows the whole site — Instagram/Facebook will refuse to scrape previews')
  } else {
    console.log('  ✓ /robots.txt                       does not block crawlers')
  }
}

for (const route of ROUTES) {
  const res = await fetch(`${BASE}${route}`, { headers: { 'User-Agent': UA } })
  if (!res.ok) {
    failures.push(`${route}: page returned HTTP ${res.status} to a crawler user agent`)
    continue
  }

  const html = await res.text()
  const head = html.slice(0, html.indexOf('</head>') + 7)
  const meta = readMeta(head)

  for (const key of [...REQUIRED_OG, ...REQUIRED_TWITTER]) {
    if (!meta.get(key)) failures.push(`${route}: missing ${key}`)
  }

  const ogImageTags = (head.match(/property=["']og:image["']/gi) ?? []).length
  if (ogImageTags !== 1) {
    failures.push(`${route}: found ${ogImageTags} og:image tags — crawlers use the first, so exactly one is expected`)
  }

  const robots = meta.get('robots') ?? ''
  if (/noindex/i.test(robots)) failures.push(`${route}: marked noindex (${robots})`)

  if (meta.get('twitter:card') !== 'summary_large_image') {
    failures.push(`${route}: twitter:card is "${meta.get('twitter:card')}", expected summary_large_image`)
  }

  const image = meta.get('og:image') ?? ''
  const secure = meta.get('og:image:secure_url') ?? ''

  if (!/^https?:\/\//i.test(image)) failures.push(`${route}: og:image is not absolute ("${image}")`)
  if (!/^https:\/\//i.test(secure)) failures.push(`${route}: og:image:secure_url is not https ("${secure}")`)
  if (/\.svg($|\?)/i.test(image)) failures.push(`${route}: og:image is SVG — crawlers cannot render it`)

  const ogUrl = meta.get('og:url') ?? ''
  if (!/^https?:\/\//i.test(ogUrl)) failures.push(`${route}: og:url is not absolute ("${ogUrl}")`)

  const description = meta.get('og:description') ?? ''
  if (description.length < 40) failures.push(`${route}: og:description is only ${description.length} chars`)
  if (description.length > 300) notes.push(`${route}: og:description is ${description.length} chars — previews truncate`)

  if (image && /^https?:\/\//i.test(image)) {
    const file = await checkImage(route, image)
    if (file) {
      const declaredW = Number(meta.get('og:image:width'))
      const declaredH = Number(meta.get('og:image:height'))
      if (file.width !== declaredW || file.height !== declaredH) {
        failures.push(
          `${route}: og:image is ${file.width}×${file.height} but declares ${declaredW}×${declaredH}`,
        )
      }
      // Facebook/Instagram want at least 200×200, and 1.91:1 for a large card.
      if ((file.width ?? 0) < 600 || (file.height ?? 0) < 315) {
        failures.push(`${route}: og:image ${file.width}×${file.height} is below the 600×315 large-card minimum`)
      }
      const declaredType = meta.get('og:image:type') ?? ''
      if (declaredType !== file.type) {
        failures.push(`${route}: og:image:type says "${declaredType}" but the file is "${file.type}"`)
      }
      console.log(
        `  ✓ ${route.padEnd(34)} ${String(file.width)}×${file.height} ${(file.bytes / 1024).toFixed(0)} kB  ${new URL(image).pathname}`,
      )
    }
  }
}

for (const note of notes) console.warn(`  ⚠ ${note}`)

if (failures.length) {
  console.error(`\n✗ social preview check failed (${failures.length}):\n`)
  for (const failure of failures) console.error(`  • ${failure}`)
  process.exit(1)
}

console.log(`\n✓ social preview check passed for ${ROUTES.length} routes against ${BASE}`)
