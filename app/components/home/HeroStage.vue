<script setup lang="ts">
// Home hero. Copy on the left, interactive 3D machine on the right.
//
// The 3D stage is progressive enhancement: the markup ships a real poster image,
// three.js is loaded only on the client after mount, and if WebGL is missing or
// the scene throws, the poster simply stays. Livery swatches recolour the paint
// live via the scene handle.
import { brandConfig } from '~/config/brand.config'
import { liveries } from '~/config/content.config'
import { generalEnquiryLink } from '~/services/whatsapp.service'
import { countByCondition } from '~/services/inventory.service'

const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { ready, failed, mount, setLivery } = useSuperbikeScene()

const canvas = ref<HTMLCanvasElement | null>(null)
const activeLivery = ref(liveries[0]?.id ?? 'ignition')

const current = computed(() => liveries.find((entry) => entry.id === activeLivery.value) ?? liveries[0]!)

const waHref = computed(() => generalEnquiryLink(String(config.public.whatsapp), t('wa.enquiry.general')))

const stats = computed(() => [
  { value: String(brandConfig.stats.unitsListed), label: t('home.hero.statUnits'), icon: 'compare' },
  { value: String(countByCondition('used')), label: t('home.hero.statUsed'), icon: 'odometer' },
  { value: String(countByCondition('new')), label: t('home.hero.statNew'), icon: 'spark' },
])

onMounted(async () => {
  if (canvas.value) await mount(canvas.value, current.value)
})

function pick(id: string) {
  activeLivery.value = id
  setLivery(current.value)
}
</script>

<template>
  <section class="hero">
    <div class="hero__backdrop" aria-hidden="true" />

    <div class="hero__inner container container--wide">
      <div class="hero__copy">
        <p class="eyebrow">{{ $t('home.hero.eyebrow') }}</p>
        <h1 class="hero__title">
          {{ $t('home.hero.titleLead') }}
          <span class="hero__title-accent">{{ $t('home.hero.titleAccent') }}</span>
        </h1>
        <p class="hero__lead">{{ $t('home.hero.lead') }}</p>

        <div class="hero__actions">
          <BaseButton variant="primary" size="lg" icon="arrowRight" :to="localePath('inventory')">
            {{ $t('cta.browseInventory') }}
          </BaseButton>
          <BaseButton variant="ghost" size="lg" icon="whatsapp" icon-leading :href="waHref" external>
            {{ $t('cta.talkToUs') }}
          </BaseButton>
        </div>

        <StatStrip class="hero__stats" :items="stats" />
        <DemoNotice class="hero__notice" />
      </div>

      <div class="hero__stage">
        <div class="hero__canvas-wrap">
          <img
            class="hero__poster"
            :class="{ 'hero__poster--hidden': ready && !failed }"
            src="/editorial/atelier.jpg"
            :alt="$t('home.hero.posterAlt')"
            width="1600"
            height="900"
            fetchpriority="high"
            decoding="async"
          >
          <canvas
            ref="canvas"
            class="hero__canvas"
            :class="{ 'hero__canvas--on': ready && !failed }"
            :aria-label="$t('home.hero.canvasLabel')"
            role="img"
          />

          <div class="hero__hud">
            <p class="hero__hud-line">
              <span class="hero__hud-dot" />
              {{ $t('home.hero.hudLabel') }}
            </p>
            <p v-if="ready && !failed" class="hero__hud-hint">{{ $t('home.hero.dragHint') }}</p>
            <p v-else-if="failed" class="hero__hud-hint">{{ $t('home.hero.fallbackHint') }}</p>
          </div>
        </div>

        <div class="hero__liveries" role="group" :aria-label="$t('home.hero.liveryLabel')">
          <span class="hero__liveries-label">{{ $t('home.hero.liveryLabel') }}</span>
          <div class="hero__swatches">
            <button
              v-for="livery in liveries"
              :key="livery.id"
              class="hero__swatch"
              :class="{ 'hero__swatch--on': activeLivery === livery.id }"
              :style="{ '--swatch': livery.paint }"
              type="button"
              :aria-pressed="activeLivery === livery.id"
              :aria-label="$t(`home.hero.liveries.${livery.id}`)"
              :title="$t(`home.hero.liveries.${livery.id}`)"
              @click="pick(livery.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <svg class="hero__apex" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 118 C 240 118, 420 20, 720 20 S 1200 96, 1440 40" />
    </svg>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  padding-top: calc(var(--header-h) + #{$space-6});
  padding-bottom: $space-8;
  overflow: hidden;
  isolation: isolate;

  @include from($bp-lg) {
    min-height: 100svh;
    display: flex;
    align-items: center;
    padding-bottom: $space-9;
  }
}

// Radial ignition wash + technical grid, both behind the content.
.hero__backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse 60% 50% at 78% 42%, rgba($ignition, 0.16), transparent 70%),
    radial-gradient(ellipse 40% 40% at 12% 8%, rgba($coolant, 0.07), transparent 70%);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    @include tarmac-grid(72px, 0.045);
    mask-image: radial-gradient(ellipse at 60% 40%, #000 10%, transparent 72%);
  }
}

.hero__inner {
  display: grid;
  gap: $space-7;
  align-items: center;

  @include from($bp-lg) {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    gap: $space-6;
  }
}

.hero__copy {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.hero__title {
  font-size: clamp(2.5rem, 7.4vw, 5rem);
  line-height: 0.98;
}

.hero__title-accent {
  display: block;
  color: $ignition;
}

.hero__lead {
  max-width: 48ch;
  color: $titanium;
  font-size: 1.02rem;

  @include from($bp-md) {
    font-size: 1.08rem;
  }
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-2;
}

.hero__stats {
  margin-top: $space-4;
}

.hero__notice {
  max-width: 52ch;
}

// --- 3D stage -----------------------------------------------------------------
.hero__stage {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.hero__canvas-wrap {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 92%, rgba($ignition, 0.14), transparent 62%),
    linear-gradient(180deg, $carbon-900, $carbon-950);
  border: 1px solid $carbon-700;
  @include notch(28px);
  @include aspect(16, 11);

  @include from($bp-md) {
    @include aspect(16, 10);
  }
}

.hero__poster,
.hero__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero__poster {
  object-fit: cover;
  opacity: 0.85;
  transition: opacity $dur-slow $ease-out;
}

.hero__poster--hidden {
  opacity: 0;
}

.hero__canvas {
  opacity: 0;
  touch-action: pan-y;
  cursor: grab;
  transition: opacity $dur-slow $ease-out;

  &:active {
    cursor: grabbing;
  }
}

.hero__canvas--on {
  opacity: 1;
}

.hero__hud {
  position: absolute;
  left: $space-4;
  bottom: $space-4;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  pointer-events: none;
}

.hero__hud-line {
  display: flex;
  align-items: center;
  gap: $space-2;
  font-family: $font-display;
  font-size: 0.68rem;
  font-weight: $fw-semibold;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: $chalk;
}

.hero__hud-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: $volt;
  box-shadow: 0 0 10px rgba($volt, 0.9);
}

.hero__hud-hint {
  font-size: 0.72rem;
  color: $titanium;
}

.hero__liveries {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding: $space-3 $space-4;
  @include panel($carbon-900, 12px);
}

.hero__liveries-label {
  @include eyebrow;
  font-size: 0.64rem;
}

.hero__swatches {
  display: flex;
  gap: $space-2;
}

.hero__swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--swatch);
  border: 2px solid transparent;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.5);
  transition: transform $dur-fast $ease-out, border-color $dur-fast $ease-out;

  @include hover {
    transform: scale(1.1);
  }

  @include focus-visible;
}

.hero__swatch--on {
  border-color: $chalk;
}

.hero__apex {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 90px;
  z-index: -1;
  fill: none;
  stroke: rgba($ignition, 0.35);
  stroke-width: 1.5;
}
</style>
