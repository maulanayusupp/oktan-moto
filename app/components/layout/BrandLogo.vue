<script setup lang="ts">
// Wordmark + mark. The mark is a tachometer sweep with the needle at redline —
// the same geometry scripts/generate-favicons.mjs draws, so the browser-tab icon
// and the header logo are literally the same shape.
import { brandConfig } from '~/config/brand.config'

withDefaults(defineProps<{ size?: 'sm' | 'md'; markOnly?: boolean }>(), { size: 'md' })
</script>

<template>
  <span class="logo" :class="`logo--${size}`">
    <svg class="logo__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g transform="translate(0 3)">
        <path class="logo__sweep" d="M14.1 25.5A19 19 0 1 1 49.9 25.5" />
        <path class="logo__needle" d="M32 34.5 45.5 19" />
      </g>
    </svg>
    <span v-if="!markOnly" class="logo__word">
      {{ brandConfig.wordmark.head }}<span class="logo__word-accent">{{ brandConfig.wordmark.tail }}</span>
    </span>
  </span>
</template>

<style scoped lang="scss">
.logo {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  color: $chalk;
}

.logo__mark {
  flex: none;
  width: 1.9em;
  height: 1.9em;
  overflow: visible;
}

// Tachometer sweep: an arc left open at the bottom, like a rev counter.
.logo__sweep {
  fill: none;
  stroke: $ignition;
  stroke-width: 8.5;
  stroke-linecap: round;
}

// Needle swung towards redline.
.logo__needle {
  fill: none;
  stroke: $volt;
  stroke-width: 7;
  stroke-linecap: round;
}

.logo__word {
  font-family: $font-display;
  font-weight: $fw-bold;
  font-size: 1.28em;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
}

.logo__word-accent {
  color: $ignition;
}

.logo--sm {
  font-size: 0.82rem;
}

.logo--md {
  font-size: 1rem;
}
</style>
