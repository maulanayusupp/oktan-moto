<script setup lang="ts">
// Illustrative testimonials. The heading and the notice below the cards both say
// these are samples — writing fake reviews as if they were real would be
// misleading, and the point here is the layout, not the claim.
import { testimonials } from '~/config/content.config'

const { observe } = useReveal()
</script>

<template>
  <div class="wall">
    <blockquote
      v-for="(item, index) in testimonials"
      :key="item.id"
      :ref="observe"
      class="wall__card reveal"
      :style="{ '--reveal-delay': `${index * 80}ms` }"
    >
      <BaseIcon class="wall__mark" name="quote" :size="26" />
      <p class="wall__text">{{ $t(`home.testimonials.${item.id}.quote`) }}</p>
      <footer class="wall__meta">
        <cite class="wall__author">{{ $t(`home.testimonials.${item.id}.author`) }}</cite>
        <span class="wall__city">{{ item.city }} · {{ $t(`home.testimonials.${item.id}.unit`) }}</span>
      </footer>
    </blockquote>
  </div>
</template>

<style scoped lang="scss">
.wall {
  @include grid-auto(290px, $space-4);
}

.wall__card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin: 0;
  padding: $space-5;
  @include panel($carbon-850);
}

.wall__mark {
  color: rgba($ignition, 0.7);
}

.wall__text {
  font-size: 0.96rem;
  color: $chalk;
  line-height: 1.62;
}

.wall__meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-top: auto;
  padding-top: $space-3;
  border-top: 1px solid $carbon-800;
}

.wall__author {
  font-family: $font-display;
  font-size: 0.86rem;
  font-weight: $fw-semibold;
  font-style: normal;
  letter-spacing: 0.06em;
  color: $chalk;
}

.wall__city {
  font-size: 0.76rem;
  color: $steel;
}
</style>
