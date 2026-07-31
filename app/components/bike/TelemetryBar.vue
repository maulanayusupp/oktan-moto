<script setup lang="ts">
// A single telemetry read-out: label, value and a bar showing where this unit
// sits against the rest of the catalogue. The fill width is passed as a CSS
// custom property so the animation itself stays in SCSS.
import { percent, ratio } from '~/utils/format'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    display: string
    min: number
    max: number
    /** When lower is better (weight), the bar fills from the other end. */
    invert?: boolean
    tone?: 'ignition' | 'volt' | 'coolant'
  }>(),
  { tone: 'ignition' },
)

const fill = computed(() => {
  const r = ratio(props.value, props.min, props.max)
  return percent(props.invert ? 1 - r : r)
})
</script>

<template>
  <div class="telemetry" :class="`telemetry--${tone}`">
    <div class="telemetry__head">
      <span class="telemetry__label">{{ label }}</span>
      <span class="telemetry__value numeric">{{ display }}</span>
    </div>
    <div
      class="telemetry__track"
      role="meter"
      :aria-label="label"
      :aria-valuenow="value"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuetext="display"
    >
      <span class="telemetry__fill" :style="{ '--fill': fill }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.telemetry {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.telemetry__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $space-3;
}

.telemetry__label {
  @include eyebrow;
  font-size: 0.66rem;
}

.telemetry__value {
  font-size: 0.95rem;
  font-weight: $fw-semibold;
  color: $chalk;
}

.telemetry__track {
  position: relative;
  height: 6px;
  background: $carbon-800;
  border-radius: $radius-pill;
  overflow: hidden;
}

.telemetry__fill {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: var(--fill, 0%);
  border-radius: $radius-pill;
  transition: width $dur-slow $ease-out;
}

.telemetry--ignition .telemetry__fill {
  background: linear-gradient(90deg, rgba($ignition, 0.45), $ignition);
}

.telemetry--volt .telemetry__fill {
  background: linear-gradient(90deg, rgba($volt, 0.4), $volt);
}

.telemetry--coolant .telemetry__fill {
  background: linear-gradient(90deg, rgba($coolant, 0.4), $coolant);
}
</style>
