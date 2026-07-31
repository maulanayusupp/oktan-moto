<script setup lang="ts">
// Small status chip: condition flags, category labels, demo notices.
withDefaults(
  defineProps<{
    tone?: 'volt' | 'ignition' | 'outline' | 'muted'
    icon?: string
  }>(),
  { tone: 'outline' },
)
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <BaseIcon v-if="icon" :name="icon" :size="13" :stroke-width="1.8" />
    <slot />
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: 0.28em 0.6em;
  font-family: $font-display;
  font-size: 0.66rem;
  font-weight: $fw-semibold;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: $radius-xs;
}

.badge--volt {
  background: rgba($volt, 0.14);
  border-color: rgba($volt, 0.5);
  color: $volt;
}

.badge--ignition {
  background: rgba($ignition, 0.16);
  border-color: rgba($ignition, 0.55);
  color: color-mix(in srgb, $ignition 78%, #fff);
}

.badge--outline {
  border-color: $carbon-600;
  color: $titanium;
}

.badge--muted {
  background: $carbon-800;
  color: $titanium;
}
</style>
