<script setup lang="ts">
// Horizontal figures strip (hero, about page). Values are passed in already
// formatted; the component only handles layout and the hairline separators.
defineProps<{
  items: readonly { value: string; label: string; icon?: string }[]
}>()
</script>

<template>
  <dl class="stats">
    <div v-for="item in items" :key="item.label" class="stats__item">
      <dt class="stats__label">
        <BaseIcon v-if="item.icon" :name="item.icon" :size="14" />
        {{ item.label }}
      </dt>
      <dd class="stats__value numeric">{{ item.value }}</dd>
    </div>
  </dl>
</template>

<style scoped lang="scss">
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $space-4 $space-5;
  margin: 0;

  @include from($bp-sm) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.stats__item {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  padding-left: $space-3;
  border-left: 1px solid $carbon-700;
}

.stats__label {
  display: flex;
  align-items: center;
  gap: $space-1;
  @include eyebrow;
  font-size: 0.66rem;
  letter-spacing: 0.16em;

  svg {
    color: $ignition;
  }
}

.stats__value {
  font-size: clamp(1.35rem, 2.4vw, 1.85rem);
  font-weight: $fw-bold;
  color: $chalk;
  margin: 0;
}
</style>
