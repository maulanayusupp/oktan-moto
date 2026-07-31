<script setup lang="ts">
// Four-step buying journey, drawn along the apex line. Explicitly ends in a
// WhatsApp conversation because that is how this showroom transacts.
import { processSteps } from '~/config/content.config'

const { observe } = useReveal()
</script>

<template>
  <ol class="steps">
    <li
      v-for="(step, index) in processSteps"
      :key="step.id"
      :ref="observe"
      class="steps__item reveal"
      :style="{ '--reveal-delay': `${index * 90}ms` }"
    >
      <span class="steps__index numeric">{{ step.index }}</span>
      <h3 class="steps__title">{{ $t(`home.process.${step.id}.title`) }}</h3>
      <p class="steps__body">{{ $t(`home.process.${step.id}.body`) }}</p>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.steps {
  display: grid;
  gap: $space-5;
  counter-reset: step;

  @include from($bp-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include from($bp-lg) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: $space-4;
  }
}

.steps__item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding-top: $space-5;
  border-top: 1px solid $carbon-700;

  // Node on the connecting line.
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 0;
    width: 9px;
    height: 9px;
    background: $ignition;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba($ignition, 0.16);
  }
}

.steps__index {
  font-size: 0.74rem;
  font-weight: $fw-bold;
  letter-spacing: 0.2em;
  color: $ignition;
}

.steps__title {
  font-size: 1.04rem;
  text-transform: none;
}

.steps__body {
  font-size: 0.9rem;
  color: $titanium;
}
</style>
