<script setup lang="ts">
// Single SVG icon renderer over utils/iconPaths — no icon font, no sprite.
// Decorative by default (aria-hidden); pass a `label` to expose it to AT.
import { iconPaths } from '~/utils/iconPaths'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    label?: string
    strokeWidth?: number
  }>(),
  { size: 20, strokeWidth: 1.6 },
)

const icon = computed(() => iconPaths[props.name] ?? null)
const box = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <svg
    v-if="icon"
    class="icon"
    :class="{ 'icon--filled': icon.filled }"
    :width="box"
    :height="box"
    viewBox="0 0 24 24"
    :stroke-width="strokeWidth"
    :aria-hidden="label ? undefined : 'true'"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    focusable="false"
  >
    <path v-for="(d, index) in icon.d" :key="index" :d="d" />
  </svg>
</template>

<style scoped lang="scss">
.icon {
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon--filled {
  fill: currentColor;
  stroke: none;
}
</style>
