<script setup lang="ts">
// Price display. Short form by default (`Rp 1,25 M`) with the exact figure kept
// in the title attribute, so cards stay compact without hiding information.
const props = withDefaults(
  defineProps<{ value: number; size?: 'sm' | 'md' | 'lg'; exact?: boolean }>(),
  { size: 'md' },
)

const { price, priceExact } = useCurrency()
const display = computed(() => (props.exact ? priceExact(props.value) : price(props.value)))
</script>

<template>
  <p class="price" :class="`price--${size}`" :title="priceExact(value)">
    <span class="price__value numeric">{{ display }}</span>
    <span class="price__note">{{ $t('inventory.priceNote') }}</span>
  </p>
</template>

<style scoped lang="scss">
.price {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.price__value {
  font-weight: $fw-bold;
  color: $chalk;
  line-height: 1.1;
}

.price__note {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $steel;
}

.price--sm .price__value {
  font-size: 1.05rem;
}

.price--md .price__value {
  font-size: 1.32rem;
}

.price--lg .price__value {
  font-size: clamp(1.8rem, 3.4vw, 2.5rem);
  color: $ignition;
}
</style>
