<script setup lang="ts">
// Privacy notice. Short by design because the site collects almost nothing: no
// analytics, no tracking pixels, no form endpoint. The only stored values are
// the locale cookie and the compare-tray entry in localStorage.
const { t } = useI18n()

definePageMeta({ flushHero: true })

usePageSeo(() => ({
  title: t('privacy.meta.title'),
  description: t('privacy.meta.description'),
  type: 'article',
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="$t('privacy.hero.eyebrow')"
      :title="$t('privacy.hero.title')"
      :lead="$t('privacy.hero.lead')"
      image="/editorial/chassis.jpg"
      compact
    />

    <section class="section">
      <div class="container container--narrow">
        <LegalDocument sections-key="privacy.sections" :updated="$t('privacy.updated')" />
      </div>
    </section>
  </div>
</template>
