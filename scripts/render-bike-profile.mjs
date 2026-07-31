// =============================================================================
// Renders the procedural 3D bike's SIDE VIEW to an SVG/PNG, straight from
// app/config/bike-model.config.ts.
//
// Why: the WebGL hero cannot be inspected in CI or from a terminal, but most
// modelling mistakes (wheels sunk into the floor, a squashed tank, a fork that
// misses the axle) are visible in the silhouette. This gives a checkable render
// without a browser, and it reads the same numbers the scene does, so the two
// can never disagree.
//
// Run: pnpm bike:profile   (writes docs/bike-profile.png + .svg by default)
// =============================================================================
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, process.argv[2] ?? 'docs/bike-profile.png')

// The config is plain data, so the object literal can be evaluated directly
// after stripping the TypeScript wrapper.
const source = await readFile(resolve(ROOT, 'app/config/bike-model.config.ts'), 'utf8')
const literal = source
  .slice(source.indexOf('export const bikeModel = ') + 'export const bikeModel = '.length)
  .replace(/\}\s*as const[\s\S]*$/, '}')
const model = new Function(`return ${literal}`)()

const W = 960
const H = 560
const S = 400 // px per metre
const OX = 480 // x = 0 lands mid-canvas
const OY = 500 // ground line
const px = (x) => OX + x * S
const py = (y) => OY - y * S

const PAINT = '#ff4a17'
const ACCENT = '#ffb199'
const CARBON = '#14171d'
const METAL = '#9aa3b0'
const parts = []

// --- Wheels ------------------------------------------------------------------
const { tyre, tube, rearX, frontX } = model.wheels
const outer = tyre + tube
for (const cx of [rearX, frontX]) {
  parts.push(`<circle cx="${px(cx)}" cy="${py(outer)}" r="${outer * S}" fill="#0a0b0d"/>`)
  parts.push(`<circle cx="${px(cx)}" cy="${py(outer)}" r="${tyre * 0.72 * S}" fill="#2b313b"/>`)
  parts.push(`<circle cx="${px(cx)}" cy="${py(outer)}" r="${tyre * 0.6 * S}" fill="none" stroke="#6f7684" stroke-width="3"/>`)
}

// --- Boxes / cylinders -------------------------------------------------------
function box(part, fill) {
  const [x, y] = part.at
  const [w, h] = part.size
  const deg = ((part.rotate ?? 0) * -180) / Math.PI
  return `<rect x="${px(x - w / 2)}" y="${py(y + h / 2)}" width="${w * S}" height="${h * S}" fill="${fill}" transform="rotate(${deg} ${px(x)} ${py(y)})"/>`
}

function tube2d(part, fill) {
  const [x, y] = part.at
  const [r, length] = part.size
  const angle = part.rotate ?? 0
  // Cylinders stand along +y and are rotated about z, matching three.js.
  const dx = -Math.sin(angle) * (length / 2)
  const dy = Math.cos(angle) * (length / 2)
  return `<line x1="${px(x - dx)}" y1="${py(y - dy)}" x2="${px(x + dx)}" y2="${py(y + dy)}" stroke="${fill}" stroke-width="${r * 2 * S}" stroke-linecap="round"/>`
}

const p = model.parts
parts.push(box(p.swingarm, METAL))
parts.push(box(p.railLower, ACCENT))
parts.push(box(p.engineBlock, CARBON))
parts.push(box(p.sump, METAL))
parts.push(tube2d(p.exhaustHeader, METAL))
parts.push(tube2d(p.silencer, METAL))

// --- Bodywork profiles -------------------------------------------------------
const poly = (points, fill, opacity = 1) =>
  `<polygon points="${points.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')}" fill="${fill}" fill-opacity="${opacity}"/>`

parts.push(poly(model.profiles.bellypan.points, PAINT))
parts.push(box(p.railUpper, ACCENT))
parts.push(box(p.cylinderHead, METAL))
parts.push(poly(model.profiles.fairing.points, PAINT))
parts.push(poly(model.profiles.tank.points, PAINT))
parts.push(poly(model.profiles.tail.points, PAINT))
parts.push(poly(model.profiles.mudguard.points, PAINT))
parts.push(box(p.seat, '#0c0e12'))
parts.push(tube2d(p.fork, METAL))
parts.push(poly(model.profiles.screen.points, '#9fdcff', 0.5))

// --- Lights + bar ------------------------------------------------------------
parts.push(`<circle cx="${px(p.handlebar.at[0])}" cy="${py(p.handlebar.at[1])}" r="${0.03 * S}" fill="#0c0e12"/>`)
parts.push(
  `<ellipse cx="${px(p.headlight.at[0])}" cy="${py(p.headlight.at[1])}" rx="${p.headlight.size[0] * 0.6 * S}" ry="${p.headlight.size[0] * 0.9 * S}" fill="#fff0dd"/>`,
)
parts.push(box(p.taillight, '#ff2a10'))

// --- Reference guides --------------------------------------------------------
const wheelbase = (frontX - rearX).toFixed(2)
const guides = `
  <line x1="0" y1="${OY}" x2="${W}" y2="${OY}" stroke="#2a3039" stroke-width="2"/>
  <line x1="${px(rearX)}" y1="${OY + 14}" x2="${px(frontX)}" y2="${OY + 14}" stroke="#3fd8e8" stroke-width="2"/>
  <text x="${px(0)}" y="${OY + 36}" fill="#3fd8e8" font-family="monospace" font-size="14" text-anchor="middle">wheelbase ${wheelbase} m</text>
  <line x1="40" y1="${py(0.83)}" x2="${W - 40}" y2="${py(0.83)}" stroke="#d4ff4f" stroke-width="1" stroke-dasharray="6 6" opacity="0.5"/>
  <text x="46" y="${py(0.83) - 8}" fill="#d4ff4f" font-family="monospace" font-size="13">seat height ref 0.83 m</text>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#06070a"/>
  ${guides}
  ${parts.join('\n  ')}
</svg>`

await writeFile(OUT.replace(/\.png$/, '.svg'), svg)
await sharp(Buffer.from(svg)).png().toFile(OUT)
console.log(`✓ side profile → ${OUT} (wheelbase ${wheelbase} m, tyre Ø ${(outer * 2).toFixed(2)} m)`)
