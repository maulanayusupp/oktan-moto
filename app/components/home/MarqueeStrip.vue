<script setup lang="ts">
// Marque names as a continuous strip. Text only — no manufacturer logos, since
// we have no licence to display their trademarks. Duplicated once so the scroll
// loops seamlessly; paused entirely under prefers-reduced-motion.
import { inventory } from '~/config/inventory.config'

const makes = computed(() => [...new Set(inventory.map((bike) => bike.make))])
const strip = computed(() => [...makes.value, ...makes.value])
</script>

<template>
  <div class="marquee" role="marquee" :aria-label="$t('home.marquee.label')">
    <div class="marquee__track">
      <span v-for="(make, index) in strip" :key="`${make}-${index}`" class="marquee__item">
        {{ make }}
        <span class="marquee__sep" aria-hidden="true">/</span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.marquee {
  overflow: hidden;
  border-block: 1px solid $carbon-700;
  background: $carbon-900;
  padding-block: $space-3;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.marquee__track {
  display: flex;
  align-items: center;
  gap: $space-5;
  width: max-content;
  animation: marquee-slide 46s linear infinite;

  @include reduced-motion {
    animation: none;
    flex-wrap: wrap;
    width: auto;
    justify-content: center;
  }
}

.marquee__item {
  display: inline-flex;
  align-items: center;
  gap: $space-5;
  font-family: $font-display;
  font-size: clamp(0.92rem, 1.6vw, 1.2rem);
  font-weight: $fw-semibold;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: $titanium;
  white-space: nowrap;
}

.marquee__sep {
  color: $ignition;
}

@keyframes marquee-slide {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}
</style>
