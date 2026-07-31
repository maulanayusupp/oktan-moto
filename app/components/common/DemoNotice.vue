<script setup lang="ts">
// Reusable honesty notice. Used wherever illustrative numbers appear (listing
// prices, finance estimator, testimonials) and on /compliance. Keeping it a
// component means the wording can never drift between places.
withDefaults(
  defineProps<{
    /** i18n key of the body text. */
    messageKey?: string
    tone?: 'inline' | 'panel'
    icon?: string
  }>(),
  { messageKey: 'common.demoNotice', tone: 'inline', icon: 'info' },
)
</script>

<template>
  <p class="notice" :class="`notice--${tone}`">
    <BaseIcon :name="icon" :size="15" />
    <span><slot>{{ $t(messageKey) }}</slot></span>
  </p>
</template>

<style scoped lang="scss">
.notice {
  display: flex;
  align-items: flex-start;
  gap: $space-2;
  font-size: 0.8rem;
  line-height: 1.55;
  color: $titanium;

  svg {
    margin-top: 0.15em;
    color: $ignition;
  }
}

.notice--panel {
  padding: $space-4;
  border: 1px solid rgba($ignition, 0.32);
  border-radius: $radius-sm;
  background: rgba($ignition, 0.05);
}
</style>
