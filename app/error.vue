<script setup lang="ts">
// Error page (404 + 5xx). Uses the same chrome as the site so a wrong URL still
// looks like OKTAN, and offers the two useful exits: home and the inventory.
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const localePath = useLocalePath()
const { t } = useI18n()

const isNotFound = computed(() => props.error?.statusCode === 404)
const title = computed(() => (isNotFound.value ? t('error.notFound.title') : t('error.generic.title')))
const body = computed(() => (isNotFound.value ? t('error.notFound.body') : t('error.generic.body')))

useHead({ title: () => title.value })
</script>

<template>
  <div class="error-page">
    <AppHeader />
    <main id="main" class="error-page__main">
      <div class="container container--narrow error-page__inner">
        <p class="error-page__code numeric">{{ error?.statusCode ?? 500 }}</p>
        <h1 class="error-page__title">{{ title }}</h1>
        <p class="error-page__body">{{ body }}</p>
        <div class="error-page__actions">
          <BaseButton variant="primary" size="lg" icon="arrowRight" :to="localePath('index')">
            {{ $t('error.backHome') }}
          </BaseButton>
          <BaseButton variant="ghost" size="lg" icon="compare" icon-leading :to="localePath('inventory')">
            {{ $t('cta.browseInventory') }}
          </BaseButton>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.error-page__main {
  flex: 1;
  display: grid;
  place-items: center;
  padding-block: calc(var(--header-h) + #{$space-8}) $space-8;
  background:
    radial-gradient(ellipse 50% 40% at 50% 20%, rgba($ignition, 0.14), transparent 70%),
    $carbon-950;
}

.error-page__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
  text-align: center;
}

.error-page__code {
  font-size: clamp(4rem, 16vw, 9rem);
  font-weight: $fw-bold;
  line-height: 1;
  color: rgba($chalk, 0.09);
}

.error-page__title {
  margin-top: -$space-5;
}

.error-page__body {
  max-width: 46ch;
  color: $titanium;
}

.error-page__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-3;
  margin-top: $space-2;
}
</style>
