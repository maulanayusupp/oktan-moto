<script setup lang="ts">
// "Why OKTAN" grid. Structure from content.config, copy from i18n; claims are
// kept to things a showroom actually controls (checks, records, paperwork) —
// no performance promises.
import { valueProps } from '~/config/content.config'

const { observe } = useReveal()
</script>

<template>
  <div class="values">
    <article
      v-for="(item, index) in valueProps"
      :key="item.id"
      :ref="observe"
      class="values__card reveal"
      :style="{ '--reveal-delay': `${index * 60}ms` }"
    >
      <span class="values__icon">
        <BaseIcon :name="item.icon" :size="22" />
      </span>
      <h3 class="values__title">{{ $t(`home.values.${item.id}.title`) }}</h3>
      <p class="values__body">{{ $t(`home.values.${item.id}.body`) }}</p>
      <span class="values__index numeric" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
    </article>
  </div>
</template>

<style scoped lang="scss">
.values {
  @include grid-auto(280px, $space-4);
}

.values__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-5;
  overflow: hidden;
  @include panel($carbon-850);
  transition: border-color $dur-base $ease-out, background-color $dur-base $ease-out;

  @include hover {
    border-color: rgba($ignition, 0.5);
    background: $carbon-800;
  }
}

.values__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: $ignition;
  border: 1px solid rgba($ignition, 0.35);
  border-radius: $radius-sm;
  background: rgba($ignition, 0.07);
}

.values__title {
  font-size: 1.06rem;
  text-transform: none;
}

.values__body {
  font-size: 0.9rem;
  color: $titanium;
}

.values__index {
  position: absolute;
  right: $space-4;
  top: $space-3;
  font-size: 1.6rem;
  font-weight: $fw-bold;
  color: rgba($chalk, 0.05);
  letter-spacing: 0.04em;
}
</style>
