<script setup lang="ts">
// Unit detail page: gallery, prose, telemetry/specs, instalment estimate, sticky
// enquiry rail and related units. Emits Product JSON-LD with an Offer so the
// price and availability are machine-readable.
import { findBike, relatedBikes } from '~/services/inventory.service'

const route = useRoute()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const { t, locale } = useI18n()

const slug = computed(() => String(route.params.slug))
const bike = computed(() => findBike(slug.value))

// A missing slug is a real 404, not an empty page.
if (!bike.value) {
  throw createError({ statusCode: 404, statusMessage: 'Unit not found', fatal: true })
}

const unit = computed(() => bike.value!)
const related = computed(() => relatedBikes(slug.value, 3))
const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')
const unitUrl = computed(() => `${siteUrl}${route.path}`)
const title = computed(() => `${unit.value.make} ${unit.value.model} ${unit.value.year}`)

definePageMeta({ flushHero: false })

usePageSeo(() => ({
  title: t('unit.meta.title', { unit: title.value }),
  description: t(`bikes.${unit.value.slug}.tagline`),
  // Per-unit share card rendered by `pnpm og`; falls back to the hero frame.
  image: `/og/${unit.value.slug}.jpg`,
  type: 'product',
}))

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: title.value,
          description: t(`bikes.${unit.value.slug}.description`),
          image: unit.value.images.map((image) => `${siteUrl}${image}`),
          brand: { '@type': 'Brand', name: unit.value.make },
          sku: unit.value.slug,
          itemCondition:
            unit.value.condition === 'new'
              ? 'https://schema.org/NewCondition'
              : 'https://schema.org/UsedCondition',
          offers: {
            '@type': 'Offer',
            url: unitUrl.value,
            price: unit.value.priceIdr,
            priceCurrency: 'IDR',
            availability: 'https://schema.org/InStock',
            itemCondition:
              unit.value.condition === 'new'
                ? 'https://schema.org/NewCondition'
                : 'https://schema.org/UsedCondition',
            seller: { '@type': 'AutoDealer', name: 'OKTAN Superbike Gallery' },
          },
          inLanguage: locale.value === 'id' ? 'id-ID' : 'en-US',
        }),
      ),
    },
  ],
})
</script>

<template>
  <div class="unit">
    <div class="container container--wide unit__top">
      <nav class="unit__breadcrumb" :aria-label="$t('a11y.breadcrumb')">
        <NuxtLink :to="localePath('index')">{{ $t('nav.home') }}</NuxtLink>
        <BaseIcon name="chevronRight" :size="14" />
        <NuxtLink :to="localePath('inventory')">{{ $t('nav.inventory') }}</NuxtLink>
        <BaseIcon name="chevronRight" :size="14" />
        <span aria-current="page">{{ unit.model }}</span>
      </nav>

      <header class="unit__header">
        <div class="unit__headline">
          <div class="unit__flags">
            <BaseBadge :tone="unit.condition === 'new' ? 'volt' : 'outline'">{{ $t(unit.conditionKey) }}</BaseBadge>
            <BaseBadge tone="muted">{{ $t(unit.categoryKey) }}</BaseBadge>
            <BaseBadge tone="ignition">{{ unit.engineCc }} cc</BaseBadge>
          </div>
          <h1 class="unit__title">
            <span class="unit__make">{{ unit.make }}</span>
            {{ unit.model }}
          </h1>
          <p class="unit__tagline">{{ $t(`bikes.${unit.slug}.tagline`) }}</p>
        </div>
      </header>
    </div>

    <div class="container container--wide unit__grid">
      <div class="unit__main">
        <BikeGallery :images="unit.images" :alt="title" />

        <section class="unit__prose">
          <h2 class="unit__section-title">{{ $t('unit.about') }}</h2>
          <p>{{ $t(`bikes.${unit.slug}.description`) }}</p>
        </section>

        <BikeSpecs :bike="unit" />

        <FinanceEstimator :price-idr="unit.priceIdr" />
      </div>

      <BikeEnquiry :bike="unit" />
    </div>

    <section class="section">
      <div class="container container--wide">
        <SectionHeading :eyebrow="$t('unit.related.eyebrow')" :title="$t('unit.related.title')" :level="2">
          <template #action>
            <BaseButton variant="ghost" size="md" icon="arrowRight" :to="localePath('inventory')">
              {{ $t('cta.seeAll') }}
            </BaseButton>
          </template>
        </SectionHeading>
        <BikeGrid :bikes="related" />
      </div>
    </section>

    <CtaBand />
  </div>
</template>

<style scoped lang="scss">
.unit {
  padding-top: $space-6;
}

.unit__top {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.unit__breadcrumb {
  display: flex;
  align-items: center;
  gap: $space-2;
  font-family: $font-display;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $steel;
  flex-wrap: wrap;

  a {
    transition: color $dur-fast $ease-out;

    @include hover {
      color: $ignition;
    }

    @include focus-visible;
  }

  span[aria-current] {
    color: $chalk;
  }
}

.unit__header {
  padding-bottom: $space-5;
  border-bottom: 1px solid $carbon-700;
}

.unit__headline {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.unit__flags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.unit__title {
  font-size: clamp(2rem, 5.4vw, 3.6rem);
  text-transform: none;
}

.unit__make {
  display: block;
  @include eyebrow;
  font-size: 0.76rem;
  color: $ignition;
  margin-bottom: $space-2;
}

.unit__tagline {
  max-width: 62ch;
  color: $titanium;
  font-size: 1.02rem;
}

.unit__grid {
  display: grid;
  gap: $space-6;
  padding-block: $space-6;

  @include from($bp-lg) {
    grid-template-columns: minmax(0, 1.65fr) minmax(300px, 0.9fr);
    gap: $space-7;
  }
}

.unit__main {
  display: flex;
  flex-direction: column;
  gap: $space-6;
  min-width: 0;
}

.unit__prose {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  color: $titanium;
  max-width: 70ch;
}

.unit__section-title {
  @include eyebrow;
  font-size: 0.7rem;
  color: $chalk;
}
</style>
