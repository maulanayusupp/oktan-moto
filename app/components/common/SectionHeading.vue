<script setup lang="ts">
// Eyebrow + title + optional lead and trailing action. Every section uses this
// so vertical rhythm and heading levels stay consistent site-wide.
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    level?: 2 | 3
    align?: 'start' | 'center'
  }>(),
  { level: 2, align: 'start' },
)
</script>

<template>
  <div class="heading" :class="`heading--${align}`">
    <div class="heading__text">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <component :is="`h${level}`" class="heading__title">{{ title }}</component>
      <p v-if="lead" class="heading__lead">{{ lead }}</p>
    </div>
    <div v-if="$slots.action" class="heading__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.heading {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-4;
  margin-bottom: $space-6;
}

.heading__text {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  max-width: 62ch;
}

.heading__title {
  margin: 0;
}

.heading__lead {
  color: $titanium;
  font-size: 1rem;

  @include from($bp-md) {
    font-size: 1.05rem;
  }
}

.heading--center {
  flex-direction: column;
  align-items: center;
  text-align: center;

  .heading__text {
    align-items: center;
  }
}
</style>
