<script setup lang="ts">
// Image + text block used for the workshop and riding stories. `reverse` flips
// the column order on desktop so consecutive blocks alternate.
const props = withDefaults(
  defineProps<{
    id: string
    image: string
    reverse?: boolean
    /** i18n prefix, defaults to `home.editorial`. */
    scope?: string
  }>(),
  { scope: 'home.editorial' },
)

const { tm, rt, t } = useI18n()

const points = computed(() => {
  const raw = tm(`${props.scope}.${props.id}.points`) as unknown
  return Array.isArray(raw) ? raw.map((line) => rt(line as string)) : []
})

const heading = computed(() => t(`${props.scope}.${props.id}.title`))
const body = computed(() => t(`${props.scope}.${props.id}.body`))
const eyebrow = computed(() => t(`${props.scope}.${props.id}.eyebrow`))
</script>

<template>
  <div class="split" :class="{ 'split--reverse': reverse }">
    <figure class="split__media">
      <img
        :src="image"
        :alt="heading"
        width="1600"
        height="900"
        loading="lazy"
        decoding="async"
      >
      <span class="split__frame" aria-hidden="true" />
    </figure>

    <div class="split__body">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2 class="split__title">{{ heading }}</h2>
      <p class="split__text">{{ body }}</p>
      <ul v-if="points.length" class="split__points">
        <li v-for="point in points" :key="point">
          <BaseIcon name="check" :size="15" />{{ point }}
        </li>
      </ul>
      <div v-if="$slots.default" class="split__actions">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.split {
  display: grid;
  gap: $space-5;
  align-items: center;

  @include from($bp-md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $space-7;
  }
}

.split--reverse {
  @include from($bp-md) {
    .split__media {
      order: 2;
    }
  }
}

.split__media {
  position: relative;
  margin: 0;
  overflow: hidden;
  @include notch(26px);
  @include aspect(4, 3);

  img {
    @include cover-image;
  }
}

// Offset hairline frame — the recurring "panel gap" detail.
.split__frame {
  position: absolute;
  inset: $space-3;
  border: 1px solid rgba($chalk, 0.14);
  pointer-events: none;
}

.split__body {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.split__title {
  max-width: 26ch;
}

.split__text {
  color: $titanium;
  max-width: 52ch;
}

.split__points {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  font-size: 0.9rem;
  color: $chalk;

  li {
    display: flex;
    align-items: flex-start;
    gap: $space-2;
  }

  svg {
    margin-top: 0.25em;
    color: $volt;
  }
}

.split__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-2;
}
</style>
