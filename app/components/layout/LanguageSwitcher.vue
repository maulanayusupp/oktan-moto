<script setup lang="ts">
// ID/EN switch. Uses switchLocalePath so the visitor stays on the same page,
// and renders real links (crawlable, middle-clickable) rather than JS handlers.
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const options = computed(() =>
  (locales.value as { code: string; name: string }[]).map((entry) => ({
    code: entry.code,
    name: entry.name,
    short: entry.code.toUpperCase(),
    to: switchLocalePath(entry.code as 'id' | 'en'),
  })),
)
</script>

<template>
  <div class="lang" role="group" :aria-label="$t('a11y.languageSwitcher')">
    <BaseIcon class="lang__icon" name="globe" :size="15" />
    <NuxtLink
      v-for="option in options"
      :key="option.code"
      class="lang__option"
      :class="{ 'lang__option--active': option.code === locale }"
      :to="option.to || '/'"
      :aria-current="option.code === locale ? 'true' : undefined"
      :title="option.name"
    >
      {{ option.short }}
    </NuxtLink>
  </div>
</template>

<style scoped lang="scss">
.lang {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  padding: 0.24rem 0.5rem;
  border: 1px solid $carbon-700;
  border-radius: $radius-pill;
}

.lang__icon {
  color: $steel;
  margin-right: 0.15rem;
}

.lang__option {
  padding: 0.16rem 0.4rem;
  font-family: $font-display;
  font-size: 0.7rem;
  font-weight: $fw-semibold;
  letter-spacing: 0.1em;
  color: $steel;
  border-radius: $radius-pill;
  transition: color $dur-fast $ease-out, background-color $dur-fast $ease-out;

  @include hover {
    color: $chalk;
  }

  @include focus-visible;
}

.lang__option--active {
  background: rgba($ignition, 0.16);
  color: $ignition;
}
</style>
