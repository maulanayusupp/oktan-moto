<script setup lang="ts">
// Sticky purchase rail: price, availability, the e-mail enquiry (this site's
// checkout) and the compare toggle. Everything a buyer needs stays in view while
// they scroll the specs.
import type { BikeView } from '~/types'

const props = defineProps<{ bike: BikeView }>()

const config = useRuntimeConfig()
const route = useRoute()
const { has, toggle, isFull } = useCompare()
const { email, forBike } = useEnquiry()

const unitUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/, '')}${route.path}`)
const mailHref = computed(() => forBike(props.bike, unitUrl.value))
const inCompare = computed(() => has(props.bike.slug))
</script>

<template>
  <aside class="enquiry">
    <div class="enquiry__panel">
      <BaseBadge :tone="bike.condition === 'new' ? 'volt' : 'outline'">
        {{ $t(bike.conditionKey) }}
      </BaseBadge>

      <PriceTag :value="bike.priceIdr" size="lg" />

      <ul class="enquiry__quick">
        <li>
          <BaseIcon name="mapPin" :size="15" />
          {{ $t('unit.location') }}
        </li>
        <li>
          <BaseIcon name="clock" :size="15" />
          {{ $t('unit.responseTime') }}
        </li>
        <li>
          <BaseIcon name="shield" :size="15" />
          {{ $t('unit.paperwork') }}
        </li>
      </ul>

      <div class="enquiry__actions">
        <BaseButton variant="primary" size="lg" icon="mail" icon-leading block :href="mailHref">
          {{ $t('cta.askAboutUnit') }}
        </BaseButton>
        <p class="enquiry__address">{{ email }}</p>
        <BaseButton
          :variant="inCompare ? 'volt' : 'ghost'"
          size="md"
          :icon="inCompare ? 'check' : 'compare'"
          icon-leading
          block
          :disabled="isFull && !inCompare"
          @click="toggle(bike.slug)"
        >
          {{ inCompare ? $t('compare.inTray') : $t('compare.add') }}
        </BaseButton>
      </div>

      <DemoNotice message-key="unit.enquiryNote" />
    </div>
  </aside>
</template>

<style scoped lang="scss">
.enquiry {
  @include from($bp-lg) {
    position: sticky;
    top: calc(var(--header-h) + #{$space-5});
  }
}

.enquiry__panel {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5;
  @include panel($carbon-850, 24px);
}

.enquiry__quick {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding-block: $space-3;
  border-block: 1px solid $carbon-800;
  font-size: 0.86rem;
  color: $titanium;

  li {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  svg {
    color: $ignition;
  }
}

.enquiry__actions {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.enquiry__address {
  font-family: $font-display;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  color: $titanium;
  text-align: center;
  overflow-wrap: anywhere;
}
</style>
