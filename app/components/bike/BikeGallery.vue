<script setup lang="ts">
// Unit gallery: one large frame plus thumbnails, driven by keyboard (←/→) as
// well as clicks. No lightbox — on a phone the full-width frame already fills
// the screen, and a modal would only add a focus trap to maintain.
import { smallImage } from '~/utils/format'

const props = defineProps<{ images: readonly string[]; alt: string }>()

const active = ref(0)

const total = computed(() => props.images.length)
const current = computed(() => props.images[active.value] ?? props.images[0] ?? '')

function step(delta: number) {
  if (!total.value) return
  active.value = (active.value + delta + total.value) % total.value
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') step(1)
  if (event.key === 'ArrowLeft') step(-1)
}
</script>

<template>
  <figure
    class="gallery"
    tabindex="0"
    role="group"
    :aria-label="$t('unit.galleryLabel', { unit: alt })"
    @keydown="onKeydown"
  >
    <div class="gallery__frame">
      <img
        class="gallery__image"
        :src="current"
        :srcset="`${smallImage(current)} 800w, ${current} 1600w`"
        sizes="(min-width: 1080px) 62vw, 100vw"
        :alt="`${alt} — ${active + 1}/${total}`"
        width="1600"
        height="1000"
        decoding="async"
      >

      <button
        v-if="total > 1"
        class="gallery__nav gallery__nav--prev"
        type="button"
        :aria-label="$t('unit.prevImage')"
        @click="step(-1)"
      >
        <BaseIcon name="chevronLeft" :size="20" />
      </button>
      <button
        v-if="total > 1"
        class="gallery__nav gallery__nav--next"
        type="button"
        :aria-label="$t('unit.nextImage')"
        @click="step(1)"
      >
        <BaseIcon name="chevronRight" :size="20" />
      </button>

      <p class="gallery__counter numeric">{{ active + 1 }} / {{ total }}</p>
    </div>

    <div v-if="total > 1" class="gallery__thumbs">
      <button
        v-for="(image, index) in images"
        :key="image + index"
        class="gallery__thumb"
        :class="{ 'gallery__thumb--on': index === active }"
        type="button"
        :aria-label="$t('unit.showImage', { index: index + 1 })"
        :aria-current="index === active ? 'true' : undefined"
        @click="active = index"
      >
        <img :src="smallImage(image)" :alt="''" width="160" height="100" loading="lazy" decoding="async">
      </button>
    </div>

    <figcaption class="gallery__caption">
      <BaseIcon name="info" :size="13" />
      {{ $t('unit.photoNote') }}
    </figcaption>
  </figure>
</template>

<style scoped lang="scss">
.gallery {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin: 0;
  @include focus-visible;
}

.gallery__frame {
  position: relative;
  overflow: hidden;
  background: $carbon-900;
  border: 1px solid $carbon-700;
  @include notch(24px);
  @include aspect(8, 5);
}

.gallery__image {
  @include cover-image;
}

.gallery__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: $chalk;
  background: rgba($carbon-950, 0.62);
  border: 1px solid $carbon-600;
  border-radius: $radius-pill;
  backdrop-filter: blur(6px);
  transition: background-color $dur-fast $ease-out, color $dur-fast $ease-out;

  @include hover {
    background: $ignition;
    border-color: $ignition;
    color: #fff;
  }

  @include focus-visible;
}

.gallery__nav--prev {
  left: $space-3;
}

.gallery__nav--next {
  right: $space-3;
}

.gallery__counter {
  position: absolute;
  right: $space-3;
  bottom: $space-3;
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: $chalk;
  background: rgba($carbon-950, 0.72);
  border-radius: $radius-xs;
}

.gallery__thumbs {
  display: flex;
  gap: $space-2;
  overflow-x: auto;
  padding-bottom: $space-1;
  @include thin-scrollbar;
}

.gallery__thumb {
  flex: none;
  width: 96px;
  border: 1px solid $carbon-700;
  border-radius: $radius-xs;
  overflow: hidden;
  opacity: 0.62;
  transition: opacity $dur-fast $ease-out, border-color $dur-fast $ease-out;

  img {
    width: 100%;
    height: 60px;
    object-fit: cover;
  }

  @include hover {
    opacity: 1;
  }

  @include focus-visible;
}

.gallery__thumb--on {
  opacity: 1;
  border-color: $ignition;
}

.gallery__caption {
  display: flex;
  align-items: center;
  gap: $space-2;
  font-size: 0.74rem;
  color: $steel;

  svg {
    color: $steel;
  }
}
</style>
