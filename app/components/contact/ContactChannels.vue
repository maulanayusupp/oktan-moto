<script setup lang="ts">
// Contact channels + showroom details. E-mail is the only enquiry channel, so
// it leads. Address and hours come from brand.config, so the footer, this panel
// and the AutoDealer JSON-LD all read from one source.
import { brandConfig } from '~/config/brand.config'

const { email, general } = useEnquiry()

const mapsHref = computed(
  () => `https://www.google.com/maps/search/?api=1&query=${brandConfig.geo.lat},${brandConfig.geo.lng}`,
)
</script>

<template>
  <div class="channels">
    <a class="channels__card channels__card--primary" :href="general">
      <BaseIcon name="mail" :size="24" />
      <span class="channels__label">{{ $t('contact.channels.email') }}</span>
      <span class="channels__value">{{ email }}</span>
      <span class="channels__meta">{{ $t('contact.channels.emailMeta') }}</span>
    </a>

    <div class="channels__card">
      <BaseIcon name="clock" :size="22" />
      <span class="channels__label">{{ $t('contact.channels.hours') }}</span>
      <span class="channels__value">{{ $t('contact.hours.weekdays') }}</span>
      <span class="channels__meta">{{ $t('contact.hours.saturday') }} · {{ $t('contact.hours.sunday') }}</span>
    </div>

    <div class="channels__card">
      <BaseIcon name="mapPin" :size="22" />
      <span class="channels__label">{{ $t('contact.channels.showroom') }}</span>
      <span class="channels__value">{{ $t('contact.address.street') }}</span>
      <span class="channels__meta">{{ brandConfig.city }}, {{ brandConfig.region }} {{ brandConfig.postalCode }}</span>
      <a class="channels__link" :href="mapsHref" target="_blank" rel="noopener noreferrer">
        {{ $t('contact.channels.openMaps') }}
        <BaseIcon name="arrowUpRight" :size="14" />
      </a>
    </div>

    <div class="channels__card">
      <BaseIcon name="info" :size="22" />
      <span class="channels__label">{{ $t('contact.channels.response') }}</span>
      <span class="channels__value">{{ $t('contact.channels.responseValue') }}</span>
      <span class="channels__meta">{{ $t('contact.channels.responseMeta') }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.channels {
  display: grid;
  gap: $space-3;

  @include from($bp-xs) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.channels__card {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  padding: $space-4;
  @include panel($carbon-850, 14px);
  transition: border-color $dur-fast $ease-out;

  > svg {
    color: $ignition;
    margin-bottom: $space-2;
  }

  @include focus-visible;
}

a.channels__card {
  @include hover {
    border-color: rgba($ignition, 0.55);
  }
}

.channels__card--primary {
  background: rgba($ignition, 0.07);
  border-color: rgba($ignition, 0.35);
}

.channels__label {
  @include eyebrow;
  font-size: 0.64rem;
}

.channels__value {
  font-family: $font-display;
  font-size: 0.98rem;
  font-weight: $fw-semibold;
  color: $chalk;
  overflow-wrap: anywhere;
}

.channels__meta {
  font-size: 0.8rem;
  color: $titanium;
}

.channels__link {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  margin-top: $space-2;
  font-family: $font-display;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $ignition;
  align-self: flex-start;

  @include focus-visible;
}
</style>
