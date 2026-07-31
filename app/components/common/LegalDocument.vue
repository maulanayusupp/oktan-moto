<script setup lang="ts">
// Renders a legal/compliance document from an i18n array of
// `{ heading, body[] }` sections, so the same markup serves /compliance,
// /privacy and /terms and both locales stay structurally identical.
interface LegalSection {
  heading: string
  body: string[]
}

const props = defineProps<{
  /** i18n key holding the section array, e.g. `compliance.sections`. */
  sectionsKey: string
  updated: string
}>()

const { tm, rt } = useI18n()

const sections = computed<LegalSection[]>(() => {
  const raw = tm(props.sectionsKey) as unknown
  if (!Array.isArray(raw)) return []
  return raw.map((section) => {
    const entry = section as { heading: unknown; body: unknown }
    const body = Array.isArray(entry.body) ? entry.body : []
    return {
      heading: rt(entry.heading as string),
      body: body.map((line) => rt(line as string)),
    }
  })
})
</script>

<template>
  <article class="legal">
    <p class="legal__updated">
      <BaseIcon name="calendar" :size="14" />
      {{ $t('legal.lastUpdated', { date: updated }) }}
    </p>

    <div class="prose">
      <section v-for="(section, index) in sections" :key="index" class="legal__section">
        <h2 :id="`section-${index + 1}`">
          <span class="legal__number numeric">{{ String(index + 1).padStart(2, '0') }}</span>
          {{ section.heading }}
        </h2>
        <p v-for="(line, lineIndex) in section.body" :key="lineIndex">{{ line }}</p>
      </section>
    </div>

    <slot />
  </article>
</template>

<style scoped lang="scss">
.legal {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.legal__updated {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-family: $font-display;
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $steel;
}

.legal__section {
  scroll-margin-top: calc(var(--header-h) + #{$space-5});
}

.legal__number {
  display: inline-block;
  margin-right: $space-2;
  color: $ignition;
  font-size: 0.8em;
}
</style>
