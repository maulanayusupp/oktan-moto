<script setup lang="ts">
// Default layout: skip link, fixed header, page slot, footer and the two
// persistent commerce affordances (WhatsApp action + compare tray).
//
// Pages whose first element is a full-bleed hero set `flush` so the main element
// does not add the header offset on top of the hero's own padding.
const route = useRoute()

const flush = computed(() => route.meta.flushHero === true)
</script>

<template>
  <a href="#main" class="skip-link">{{ $t('a11y.skipToContent') }}</a>
  <AppHeader />
  <main id="main" class="layout__main" :class="{ 'layout__main--flush': flush }">
    <slot />
  </main>
  <AppFooter />
  <EmailFab />
  <CompareTray />
</template>
