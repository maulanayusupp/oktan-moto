<script setup lang="ts">
// Floating WhatsApp action. Present on every page because it is the checkout —
// hidden while the compare tray is open so the two never overlap on mobile.
import { generalEnquiryLink } from '~/services/whatsapp.service'

const { t } = useI18n()
const config = useRuntimeConfig()
const { bikes } = useCompare()

const href = computed(() => generalEnquiryLink(String(config.public.whatsapp), t('wa.enquiry.general')))
</script>

<template>
  <a
    v-show="bikes.length === 0"
    class="fab"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="$t('cta.whatsappLong')"
  >
    <BaseIcon name="whatsapp" :size="24" />
    <span class="fab__label">{{ $t('cta.whatsapp') }}</span>
  </a>
</template>

<style scoped lang="scss">
.fab {
  position: fixed;
  right: $space-4;
  bottom: $space-4;
  z-index: $z-sticky;
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: 0.8rem 1rem;
  background: $ignition;
  color: #fff;
  box-shadow: $shadow-md;
  transition: transform $dur-fast $ease-out, background-color $dur-fast $ease-out;
  @include notch(14px);
  @include focus-visible($volt);

  @include hover {
    transform: translateY(-2px);
  }

  @include from($bp-md) {
    right: $space-6;
    bottom: $space-6;
  }
}

.fab__label {
  font-family: $font-display;
  font-size: 0.76rem;
  font-weight: $fw-semibold;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  @include until($bp-xs) {
    @include visually-hidden;
  }
}
</style>
