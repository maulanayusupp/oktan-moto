<script setup lang="ts">
// Inner-page hero: an editorial photo behind a carbon scrim, with the apex-line
// motif that recurs across the site. Sits under the fixed header, so pages using
// it render inside `.layout__main--flush`.
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    image?: string
    /** Compact variant for legal pages. */
    compact?: boolean
  }>(),
  { image: '/editorial/tank-top.jpg' },
)
</script>

<template>
  <section class="page-hero" :class="{ 'page-hero--compact': compact }">
    <img class="page-hero__image" :src="image" alt="" loading="eager" decoding="async" width="1600" height="900">
    <div class="page-hero__scrim" />
    <svg class="page-hero__apex" viewBox="0 0 1200 320" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-20 300 C 260 300, 380 40, 700 40 S 1080 190, 1220 120" />
    </svg>

    <div class="page-hero__inner container container--wide">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1 class="page-hero__title">{{ title }}</h1>
      <p v-if="lead" class="page-hero__lead">{{ lead }}</p>
      <div v-if="$slots.default" class="page-hero__actions">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 62svh;
  padding-top: calc(var(--header-h) + #{$space-6});
  padding-bottom: $space-7;
  overflow: hidden;
  isolation: isolate;
}

.page-hero--compact {
  min-height: 44svh;
}

.page-hero__image {
  position: absolute;
  inset: 0;
  @include cover-image;
  z-index: -2;
  filter: saturate(0.6);
}

.page-hero__scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgba($carbon-950, 0.92) 0%, rgba($carbon-950, 0.55) 45%, rgba($carbon-950, 0.97) 100%),
    linear-gradient(90deg, rgba($carbon-950, 0.95) 0%, rgba($carbon-950, 0.25) 70%);
}

.page-hero__apex {
  position: absolute;
  inset-inline: 0;
  bottom: -1px;
  height: 42%;
  z-index: -1;
  fill: none;
  stroke: rgba($ignition, 0.5);
  stroke-width: 2;
  opacity: 0.7;
}

.page-hero__inner {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.page-hero__title {
  max-width: 24ch;
}

.page-hero__lead {
  max-width: 56ch;
  color: $titanium;
  font-size: 1.02rem;
}

.page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-2;
}
</style>
