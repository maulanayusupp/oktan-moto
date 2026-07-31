<script setup lang="ts">
// Grid of BikeCards with staggered reveal. The stagger delay is passed as a CSS
// custom property (the one sanctioned use of :style) — the transition itself is
// defined in base.scss, not inline.
import type { BikeView } from '~/types'

const props = withDefaults(defineProps<{ bikes: BikeView[]; emptyKey?: string }>(), {
  emptyKey: 'inventory.empty',
})

const { observe } = useReveal()

// Cap the stagger so a long list never delays the last card by seconds.
const delay = (index: number) => `${Math.min(index, 5) * 70}ms`
</script>

<template>
  <div>
    <div v-if="props.bikes.length" class="grid">
      <div
        v-for="(bike, index) in props.bikes"
        :key="bike.slug"
        :ref="observe"
        class="grid__item reveal"
        :style="{ '--reveal-delay': delay(index) }"
      >
        <BikeCard :bike="bike" :index="index" />
      </div>
    </div>

    <p v-else class="grid__empty">
      <BaseIcon name="search" :size="18" />
      {{ $t(props.emptyKey) }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.grid {
  @include grid-auto(300px, $space-5);
}

.grid__item {
  display: flex;

  > * {
    flex: 1;
  }
}

.grid__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  padding: $space-8 $space-4;
  border: 1px dashed $carbon-600;
  border-radius: $radius-sm;
  color: $titanium;
  text-align: center;
}
</style>
