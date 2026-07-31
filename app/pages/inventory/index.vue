<script setup lang="ts">
// Inventory listing. Filter state lives in the URL (useInventoryFilters) so any
// view can be shared; ItemList JSON-LD describes the visible results.
import { brandConfig } from '~/config/brand.config'
import { countByCondition } from '~/services/inventory.service'

const { t } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const { filters, results, activeCount, reset } = useInventoryFilters()

definePageMeta({ flushHero: true })

const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')

usePageSeo(() => ({
  title: t('inventory.meta.title'),
  description: t('inventory.meta.description'),
  image: '/og-image.jpg',
}))

const stats = computed(() => [
  { value: String(brandConfig.stats.unitsListed), label: t('inventory.stats.total'), icon: 'compare' },
  { value: String(countByCondition('new')), label: t('inventory.stats.new'), icon: 'spark' },
  { value: String(countByCondition('used')), label: t('inventory.stats.used'), icon: 'odometer' },
])

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: t('inventory.meta.title'),
          numberOfItems: results.value.length,
          itemListElement: results.value.map((bike, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}${localePath({ name: 'inventory-slug', params: { slug: bike.slug } })}`,
            name: `${bike.make} ${bike.model} ${bike.year}`,
          })),
        }),
      ),
    },
  ],
})
</script>

<template>
  <div>
    <PageHero
      :eyebrow="$t('inventory.hero.eyebrow')"
      :title="$t('inventory.hero.title')"
      :lead="$t('inventory.hero.lead')"
      image="/editorial/chassis.jpg"
    >
      <StatStrip :items="stats" />
    </PageHero>

    <section class="section">
      <div class="container container--wide inventory">
        <InventoryToolbar
          v-model="filters"
          :result-count="results.length"
          :active-count="activeCount"
          @reset="reset"
        />

        <BikeGrid :bikes="results" />

        <DemoNotice tone="panel" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.inventory {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}
</style>
