<script setup lang="ts">
// Closing conversion band, reused on the home and about pages.
const localePath = useLocalePath()
const { general } = useEnquiry()
</script>

<template>
  <section class="band">
    <img class="band__image" src="/editorial/night-street.jpg" alt="" width="1600" height="900" loading="lazy" decoding="async">
    <div class="band__scrim" />

    <div class="band__inner container">
      <p class="eyebrow">{{ $t('cta.band.eyebrow') }}</p>
      <h2 class="band__title">{{ $t('cta.band.title') }}</h2>
      <p class="band__lead">{{ $t('cta.band.lead') }}</p>
      <div class="band__actions">
        <BaseButton variant="primary" size="lg" icon="mail" icon-leading :href="general">
          {{ $t('cta.emailLong') }}
        </BaseButton>
        <BaseButton variant="ghost" size="lg" icon="arrowRight" :to="localePath('contact')">
          {{ $t('cta.visitShowroom') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.band {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding-block: $space-9;
  border-block: 1px solid $carbon-700;
}

.band__image {
  position: absolute;
  inset: 0;
  @include cover-image;
  z-index: -2;
  filter: saturate(0.55);
}

.band__scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba($carbon-950, 0.96) 10%, rgba($carbon-950, 0.6) 70%),
    radial-gradient(ellipse at 20% 60%, rgba($ignition, 0.2), transparent 60%);
}

.band__inner {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  align-items: flex-start;
}

.band__title {
  max-width: 22ch;
}

.band__lead {
  max-width: 50ch;
  color: $titanium;
}

.band__actions {
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;
  margin-top: $space-2;
}
</style>
