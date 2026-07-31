<script setup lang="ts">
// Home page. Composes the marketing sections; all copy comes from i18n and all
// structure from config, so this file stays a layout document.
import { editorialBlocks, faqIds } from '~/config/content.config'
import { featuredBikes } from '~/services/inventory.service'

const { t } = useI18n()
const localePath = useLocalePath()

// The hero is full-bleed under the fixed header.
definePageMeta({ flushHero: true })

const featured = computed(() => featuredBikes(4))

usePageSeo(() => ({
  title: t('home.meta.title'),
  description: t('home.meta.description'),
  image: '/og-image.jpg',
}))

// FAQ rich result, generated from the same list the accordion renders.
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqIds.map((id) => ({
            '@type': 'Question',
            name: t(`faq.items.${id}.q`),
            acceptedAnswer: { '@type': 'Answer', text: t(`faq.items.${id}.a`) },
          })),
        }),
      ),
    },
  ],
})
</script>

<template>
  <div>
    <HeroStage />

    <MarqueeStrip />

    <section class="section section--grid">
      <div class="container container--wide">
        <SectionHeading
          :eyebrow="$t('home.featured.eyebrow')"
          :title="$t('home.featured.title')"
          :lead="$t('home.featured.lead')"
        >
          <template #action>
            <BaseButton variant="ghost" size="md" icon="arrowRight" :to="localePath('inventory')">
              {{ $t('cta.seeAll') }}
            </BaseButton>
          </template>
        </SectionHeading>

        <BikeGrid :bikes="featured" />
      </div>
    </section>

    <section class="section section--raised">
      <div class="container container--wide">
        <SectionHeading :eyebrow="$t('home.categories.eyebrow')" :title="$t('home.categories.title')" />
        <CategoryRail />
      </div>
    </section>

    <section class="section">
      <div class="container container--wide">
        <SectionHeading
          :eyebrow="$t('home.values.eyebrow')"
          :title="$t('home.values.title')"
          :lead="$t('home.values.lead')"
        />
        <ValueGrid />
      </div>
    </section>

    <section class="section section--raised">
      <div class="container container--wide">
        <SectionHeading
          :eyebrow="$t('home.process.eyebrow')"
          :title="$t('home.process.title')"
          :lead="$t('home.process.lead')"
        />
        <ProcessSteps />
      </div>
    </section>

    <section v-for="block in editorialBlocks" :key="block.id" class="section">
      <div class="container container--wide">
        <EditorialSplit :id="block.id" :image="block.image" :reverse="block.reverse">
          <BaseButton variant="ghost" size="md" icon="arrowRight" :to="localePath('about')">
            {{ $t('cta.aboutUs') }}
          </BaseButton>
        </EditorialSplit>
      </div>
    </section>

    <section class="section section--raised">
      <div class="container container--wide">
        <SectionHeading
          :eyebrow="$t('home.testimonials.eyebrow')"
          :title="$t('home.testimonials.title')"
          :lead="$t('home.testimonials.lead')"
        />
        <TestimonialWall />
        <DemoNotice class="home__notice" message-key="home.testimonials.note" />
      </div>
    </section>

    <section class="section">
      <div class="container">
        <SectionHeading :eyebrow="$t('faq.eyebrow')" :title="$t('faq.title')" :lead="$t('faq.lead')" />
        <FaqAccordion />
      </div>
    </section>

    <CtaBand />
  </div>
</template>

<style scoped lang="scss">
.home__notice {
  margin-top: $space-5;
}
</style>
