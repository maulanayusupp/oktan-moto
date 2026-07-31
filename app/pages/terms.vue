<script setup lang="ts">
// Terms of use. Covers what the listings are (invitations to discuss, not
// binding offers), how prices are quoted, and the limits of the demonstration
// build.
const { t } = useI18n()

definePageMeta({ flushHero: true })

usePageSeo(() => ({
  title: t('terms.meta.title'),
  description: t('terms.meta.description'),
  type: 'article',
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="$t('terms.hero.eyebrow')"
      :title="$t('terms.hero.title')"
      :lead="$t('terms.hero.lead')"
      image="/editorial/night-street.jpg"
      compact
    />

    <section class="section">
      <div class="container container--narrow">
        <LegalDocument sections-key="terms.sections" :updated="$t('terms.updated')" />
      </div>
    </section>
  </div>
</template>
