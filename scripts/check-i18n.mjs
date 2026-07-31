// =============================================================================
// Locale parity gate. The project rule is that ID and EN move together on every
// text change, so this script fails the build-time check when they drift.
//
// It verifies:
//   1. both locales expose exactly the same key paths (including array lengths),
//   2. interpolation placeholders {like_this} match per key,
//   3. WhatsApp %token% placeholders match per key,
//   4. every `bikes.<slug>.*` entry exists for every slug in the inventory,
//   5. no unescaped literal "@" (vue-i18n treats it as a linked-message marker).
//
// Run: pnpm i18n:check
// =============================================================================
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LOCALES = ['id', 'en']

const load = async (code) =>
  JSON.parse(await readFile(resolve(ROOT, `i18n/locales/${code}.json`), 'utf8'))

/** Flattens to `a.b.0.c` → string, so arrays are compared element by element. */
function flatten(value, prefix = '', out = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}.${index}`, out))
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out)
    }
  } else {
    out.set(prefix, String(value))
  }
  return out
}

const placeholders = (text) => (text.match(/\{[a-zA-Z0-9_]+\}/g) ?? []).sort().join(',')
const waTokens = (text) => (text.match(/%[a-zA-Z]+%/g) ?? []).sort().join(',')

const errors = []
const warnings = []

const [id, en] = await Promise.all(LOCALES.map(load))
const flat = { id: flatten(id), en: flatten(en) }

// 1. Key parity ---------------------------------------------------------------
for (const [a, b] of [
  ['id', 'en'],
  ['en', 'id'],
]) {
  for (const key of flat[a].keys()) {
    if (!flat[b].has(key)) errors.push(`Key present in ${a} but missing in ${b}: ${key}`)
  }
}

// 2 + 3. Placeholder parity ---------------------------------------------------
for (const key of flat.id.keys()) {
  if (!flat.en.has(key)) continue
  const idText = flat.id.get(key)
  const enText = flat.en.get(key)
  if (placeholders(idText) !== placeholders(enText)) {
    errors.push(`Interpolation mismatch at ${key}: id[${placeholders(idText)}] vs en[${placeholders(enText)}]`)
  }
  if (waTokens(idText) !== waTokens(enText)) {
    errors.push(`WhatsApp token mismatch at ${key}: id[${waTokens(idText)}] vs en[${waTokens(enText)}]`)
  }
}

// 4. Inventory copy coverage --------------------------------------------------
const inventorySource = await readFile(resolve(ROOT, 'app/config/inventory.config.ts'), 'utf8')
const slugs = [...inventorySource.matchAll(/^\s{4}slug: '([^']+)'/gm)].map((match) => match[1])
if (!slugs.length) warnings.push('Could not read any slugs from inventory.config.ts')

for (const slug of slugs) {
  for (const locale of LOCALES) {
    for (const field of ['tagline', 'description']) {
      const key = `bikes.${slug}.${field}`
      if (!flat[locale].has(key)) errors.push(`Missing ${locale} copy: ${key}`)
    }
  }
}

// 5. Unescaped "@" ------------------------------------------------------------
for (const locale of LOCALES) {
  for (const [key, text] of flat[locale]) {
    if (text.includes('@') && !text.includes("{'@'}")) {
      errors.push(`Unescaped "@" in ${locale} at ${key} — vue-i18n reads it as a linked message. Use {'@'}.`)
    }
  }
}

// Report ----------------------------------------------------------------------
const total = flat.id.size
for (const warning of warnings) console.warn(`⚠ ${warning}`)

if (errors.length) {
  console.error(`\n✗ i18n check failed with ${errors.length} problem(s):\n`)
  for (const error of errors) console.error(`  • ${error}`)
  process.exit(1)
}

console.log(`✓ i18n check passed — ${total} leaf keys in lockstep across ${LOCALES.join(', ')} (${slugs.length} units documented).`)
