<script setup lang="ts">
// Compliance & disclosure. This is the page that states plainly what this site
// is (a demonstration build), what the data is (sample), what the photography is
// (freely licensed third-party work, credited on /credits), and which
// Indonesian consumer-facing rules a real showroom would have to satisfy.
//
// Keep this page in sync with every feature change: new data, new claims or new
// third-party assets belong here as well as in CLAUDE.md.
const { t } = useI18n()
const localePath = useLocalePath()

definePageMeta({ flushHero: true })

usePageSeo(() => ({
  title: t('compliance.meta.title'),
  description: t('compliance.meta.description'),
  type: 'article',
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="$t('compliance.hero.eyebrow')"
      :title="$t('compliance.hero.title')"
      :lead="$t('compliance.hero.lead')"
      image="/editorial/tank-top.jpg"
      compact
    />

    <section class="section">
      <div class="container container--narrow">
        <DemoNotice class="compliance__banner" tone="panel" icon="alert" message-key="compliance.banner" />

        <LegalDocument sections-key="compliance.sections" :updated="$t('compliance.updated')">
          <div class="compliance__links">
            <BaseButton variant="ghost" size="md" icon="arrowRight" :to="localePath('credits')">
              {{ $t('compliance.seeCredits') }}
            </BaseButton>
            <BaseButton variant="ghost" size="md" icon="arrowRight" :to="localePath('privacy')">
              {{ $t('nav.privacy') }}
            </BaseButton>
            <BaseButton variant="ghost" size="md" icon="arrowRight" :to="localePath('terms')">
              {{ $t('nav.terms') }}
            </BaseButton>
          </div>
        </LegalDocument>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.compliance__banner {
  margin-bottom: $space-6;
}

.compliance__links {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-6;
  padding-top: $space-5;
  border-top: 1px solid $carbon-700;
}
</style>
