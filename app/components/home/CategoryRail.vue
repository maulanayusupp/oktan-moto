<script setup lang="ts">
// Segment shortcuts. Each card links straight into the pre-filtered inventory
// view (the filters live in the URL), so the rail is a real navigation aid
// rather than decoration.
import { categoryCards } from '~/config/content.config'
import { countByCategory } from '~/services/inventory.service'
import type { Category } from '~/types'

const localePath = useLocalePath()

const cards = computed(() =>
  categoryCards.map((card) => ({
    ...card,
    count: countByCategory(card.id as Category),
    to: `${localePath('inventory')}?category=${card.id}`,
  })),
)
</script>

<template>
  <div class="rail">
    <NuxtLink v-for="card in cards" :key="card.id" class="rail__card" :to="card.to">
      <img
        class="rail__image"
        :src="card.image"
        :alt="$t(`category.${card.id}`)"
        width="800"
        height="500"
        loading="lazy"
        decoding="async"
      >
      <span class="rail__scrim" />
      <span class="rail__body">
        <span class="rail__title">{{ $t(`category.${card.id}`) }}</span>
        <span class="rail__meta">
          <span class="numeric">{{ $t('home.categories.count', { count: card.count }) }}</span>
          <BaseIcon name="arrowUpRight" :size="16" />
        </span>
      </span>
    </NuxtLink>
  </div>
</template>

<style scoped lang="scss">
.rail {
  display: grid;
  gap: $space-3;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @include from($bp-md) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.rail__card {
  position: relative;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  min-height: 190px;
  border: 1px solid $carbon-700;
  @include notch(16px);
  @include focus-visible;

  @include from($bp-md) {
    min-height: 250px;
  }

  @include hover {
    border-color: rgba($ignition, 0.55);

    .rail__image {
      transform: scale(1.08);
    }

    .rail__meta svg {
      transform: translate(3px, -3px);
    }
  }
}

.rail__image {
  position: absolute;
  inset: 0;
  @include cover-image;
  transition: transform $dur-slow $ease-out;
}

.rail__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba($carbon-950, 0.25) 20%, rgba($carbon-950, 0.92) 100%);
}

.rail__body {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $space-1;
  padding: $space-4;
  width: 100%;
}

.rail__title {
  font-family: $font-display;
  font-size: 1rem;
  font-weight: $fw-bold;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $chalk;
}

.rail__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.76rem;
  color: $titanium;

  svg {
    color: $ignition;
    transition: transform $dur-fast $ease-out;
  }
}
</style>
