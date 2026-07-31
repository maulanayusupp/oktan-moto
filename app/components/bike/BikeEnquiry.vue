<script setup lang="ts">
// Sticky purchase rail: price, availability, WhatsApp handoff (the checkout),
// e-mail fallback and the compare toggle. Everything a buyer needs stays in view
// while they scroll the specs.
import { bikeEnquiryLink, mailtoLink } from '~/services/whatsapp.service'
import { formatIdrExact } from '~/utils/format'
import type { BikeView } from '~/types'

const props = defineProps<{ bike: BikeView }>()

const { t, locale } = useI18n()
const config = useRuntimeConfig()
const route = useRoute()
const { has, toggle, isFull } = useCompare()

const unitUrl = computed(() => `${String(config.public.siteUrl).replace(/\/$/, '')}${route.path}`)

const waHref = computed(() =>
  bikeEnquiryLink({
    phone: String(config.public.whatsapp),
    bike: props.bike,
    url: unitUrl.value,
    locale: locale.value,
    template: t('wa.enquiry.bike'),
  }),
)

const mailHref = computed(() =>
  mailtoLink(
    String(config.public.contactEmail),
    t('unit.mailSubject', { unit: `${props.bike.make} ${props.bike.model}` }),
    t('unit.mailBody', {
      unit: `${props.bike.make} ${props.bike.model} (${props.bike.year})`,
      price: formatIdrExact(props.bike.priceIdr, locale.value),
      url: unitUrl.value,
    }),
  ),
)

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
        <BaseButton variant="primary" size="lg" icon="whatsapp" icon-leading block :href="waHref" external>
          {{ $t('cta.askAboutUnit') }}
        </BaseButton>
        <BaseButton variant="ghost" size="md" icon="mail" icon-leading block :href="mailHref">
          {{ $t('cta.emailUs') }}
        </BaseButton>
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
</style>
