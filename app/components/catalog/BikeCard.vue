<script setup lang="ts">
// Inventory card. The whole panel is clickable through a stretched link
// (::after) so the compare button inside can stay a real <button> — nesting a
// button inside an <a> would be invalid markup and break keyboard order.
import { smallImage } from '~/utils/format'
import type { BikeView } from '~/types'

const props = withDefaults(defineProps<{ bike: BikeView; index?: number }>(), { index: 0 })

const localePath = useLocalePath()
const { km } = useCurrency()
const { has, toggle, isFull } = useCompare()

const hero = computed(() => props.bike.images[0] ?? '/editorial/atelier.jpg')
const to = computed(() => localePath({ name: 'inventory-slug', params: { slug: props.bike.slug } }))
const inCompare = computed(() => has(props.bike.slug))
const compareDisabled = computed(() => isFull.value && !inCompare.value)
</script>

<template>
  <article class="card">
    <div class="card__media">
      <img
        class="card__image"
        :src="smallImage(hero)"
        :srcset="`${smallImage(hero)} 800w, ${hero} 1600w`"
        sizes="(min-width: 1080px) 33vw, (min-width: 640px) 50vw, 100vw"
        :alt="`${bike.make} ${bike.model} ${bike.year}`"
        loading="lazy"
        decoding="async"
        width="800"
        height="500"
      >
      <span class="card__index numeric">{{ String(index + 1).padStart(2, '0') }}</span>

      <div class="card__flags">
        <BaseBadge :tone="bike.condition === 'new' ? 'volt' : 'outline'">
          {{ $t(bike.conditionKey) }}
        </BaseBadge>
        <BaseBadge tone="muted">{{ $t(bike.categoryKey) }}</BaseBadge>
      </div>

      <button
        class="card__compare"
        :class="{ 'card__compare--on': inCompare }"
        type="button"
        :disabled="compareDisabled"
        :aria-pressed="inCompare"
        :aria-label="inCompare ? $t('compare.remove') : $t('compare.add')"
        :title="compareDisabled ? $t('compare.full') : inCompare ? $t('compare.remove') : $t('compare.add')"
        @click="toggle(bike.slug)"
      >
        <BaseIcon :name="inCompare ? 'check' : 'compare'" :size="16" />
      </button>
    </div>

    <div class="card__body">
      <div class="card__title-row">
        <h3 class="card__title">
          <span class="card__make">{{ bike.make }}</span>
          {{ bike.model }}
        </h3>
        <span class="card__year numeric">{{ bike.year }}</span>
      </div>

      <ul class="card__specs">
        <li><BaseIcon name="piston" :size="14" />{{ bike.engineCc }} cc</li>
        <li><BaseIcon name="bolt" :size="14" />{{ bike.powerHp }} hp</li>
        <li><BaseIcon name="weight" :size="14" />{{ bike.weightKg }} kg</li>
        <li><BaseIcon name="odometer" :size="14" />{{ bike.mileageKm === 0 ? $t('inventory.zeroKm') : km(bike.mileageKm) }}</li>
      </ul>

      <div class="card__footer">
        <PriceTag :value="bike.priceIdr" size="md" />
        <span class="card__cta">
          {{ $t('cta.viewUnit') }}
          <BaseIcon name="arrowRight" :size="16" />
        </span>
      </div>
    </div>

    <NuxtLink class="card__link" :to="to">
      <span class="visually-hidden">{{ bike.make }} {{ bike.model }} {{ bike.year }}</span>
    </NuxtLink>
  </article>
</template>

<style scoped lang="scss">
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  @include panel;
  transition: border-color $dur-base $ease-out, transform $dur-base $ease-out;

  @include hover {
    border-color: rgba($ignition, 0.6);
    transform: translateY(-4px);

    .card__image {
      transform: scale(1.06);
    }

    .card__cta {
      color: $ignition;

      svg {
        transform: translateX(3px);
      }
    }
  }

  &:focus-within {
    border-color: rgba($ignition, 0.6);
  }
}

.card__media {
  position: relative;
  overflow: hidden;
  @include aspect(8, 5);
  background: $carbon-900;
}

.card__image {
  @include cover-image;
  transition: transform $dur-slow $ease-out;
}

.card__index {
  position: absolute;
  top: $space-3;
  left: $space-3;
  font-size: 0.72rem;
  font-weight: $fw-bold;
  letter-spacing: 0.16em;
  color: rgba($chalk, 0.85);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
}

.card__flags {
  position: absolute;
  left: $space-3;
  bottom: $space-3;
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.card__compare {
  position: absolute;
  top: $space-2;
  right: $space-2;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  color: $chalk;
  background: rgba($carbon-950, 0.72);
  border: 1px solid $carbon-600;
  border-radius: $radius-sm;
  backdrop-filter: blur(6px);
  transition: color $dur-fast $ease-out, border-color $dur-fast $ease-out;

  @include hover {
    border-color: $ignition;
    color: $ignition;
  }

  @include focus-visible;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

.card__compare--on {
  color: $volt;
  border-color: rgba($volt, 0.7);
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-4;
  flex: 1;
}

.card__title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $space-3;
}

.card__title {
  font-size: 1.12rem;
  line-height: 1.15;
  text-transform: none;
}

.card__make {
  display: block;
  @include eyebrow;
  font-size: 0.64rem;
  color: $steel;
  margin-bottom: 0.2rem;
}

.card__year {
  font-size: 0.8rem;
  color: $titanium;
}

.card__specs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $space-2;
  font-family: $font-display;
  font-size: 0.78rem;
  color: $titanium;
  border-top: 1px solid $carbon-800;
  border-bottom: 1px solid $carbon-800;
  padding-block: $space-3;

  li {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  svg {
    color: $steel;
  }
}

.card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-3;
  margin-top: auto;
}

.card__cta {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  font-family: $font-display;
  font-size: 0.74rem;
  font-weight: $fw-semibold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $titanium;
  transition: color $dur-fast $ease-out;

  svg {
    transition: transform $dur-fast $ease-out;
  }
}

// Stretched link: covers the card without wrapping the compare button.
.card__link {
  position: absolute;
  inset: 0;
  z-index: 1;

  &:focus-visible {
    @include focus-ring;
  }
}
</style>
