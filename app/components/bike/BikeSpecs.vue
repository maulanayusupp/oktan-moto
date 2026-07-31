<script setup lang="ts">
// Spec block for a unit: telemetry bars benchmarked against the whole catalogue,
// a hard-facts table, and the electronics / equipment lists. Ranges come from
// inventory.service so the bars stay correct when stock changes.
import { specRange } from '~/services/inventory.service'
import { formatMonthYear } from '~/utils/format'
import type { BikeView } from '~/types'

const props = defineProps<{ bike: BikeView }>()

const { t } = useI18n()
const { km, priceExact } = useCurrency()

const power = specRange('powerHp')
const weight = specRange('weightKg')
const cc = specRange('engineCc')
const ptw = specRange('powerToWeight')

const bars = computed(() => [
  {
    label: t('spec.power'),
    value: props.bike.powerHp,
    display: `${props.bike.powerHp} hp`,
    min: power.min,
    max: power.max,
    tone: 'ignition' as const,
  },
  {
    label: t('spec.ptw'),
    value: props.bike.powerToWeight,
    display: `${props.bike.powerToWeight} hp/t`,
    min: ptw.min,
    max: ptw.max,
    tone: 'volt' as const,
  },
  {
    label: t('spec.displacement'),
    value: props.bike.engineCc,
    display: `${props.bike.engineCc} cc`,
    min: cc.min,
    max: cc.max,
    tone: 'coolant' as const,
  },
  {
    label: t('spec.weight'),
    value: props.bike.weightKg,
    display: `${props.bike.weightKg} kg`,
    min: weight.min,
    max: weight.max,
    invert: true,
    tone: 'coolant' as const,
  },
])

// Rows are built conditionally: used units carry history fields a new unit
// simply does not have, and empty rows would read as missing data.
const facts = computed(() => {
  const rows: { label: string; value: string; icon: string }[] = [
    { label: t('spec.year'), value: String(props.bike.year), icon: 'calendar' },
    { label: t('spec.engine'), value: t(props.bike.engineLayoutKey), icon: 'piston' },
    { label: t('spec.torque'), value: `${props.bike.torqueNm} Nm`, icon: 'bolt' },
    { label: t('spec.colour'), value: t(props.bike.colorKey), icon: 'palette' },
    {
      label: t('spec.mileage'),
      value: props.bike.mileageKm === 0 ? t('inventory.zeroKm') : km(props.bike.mileageKm),
      icon: 'odometer',
    },
    { label: t('spec.condition'), value: t(props.bike.conditionKey), icon: 'spark' },
    { label: t('spec.priceExact'), value: priceExact(props.bike.priceIdr), icon: 'tag' },
  ]

  if (props.bike.owners) {
    rows.push({ label: t('spec.owners'), value: String(props.bike.owners), icon: 'user' })
  }
  if (props.bike.serviceHistory) {
    rows.push({
      label: t('spec.serviceHistory'),
      value: t(`spec.history.${props.bike.serviceHistory}`),
      icon: 'document',
    })
  }
  if (props.bike.taxValidUntil) {
    rows.push({
      label: t('spec.taxValid'),
      value: formatMonthYear(props.bike.taxValidUntil),
      icon: 'shield',
    })
  }
  return rows
})
</script>

<template>
  <div class="specs">
    <section class="specs__block">
      <h2 class="specs__heading">{{ $t('unit.telemetry') }}</h2>
      <p class="specs__hint">{{ $t('unit.telemetryHint') }}</p>
      <div class="specs__bars">
        <TelemetryBar
          v-for="bar in bars"
          :key="bar.label"
          :label="bar.label"
          :value="bar.value"
          :display="bar.display"
          :min="bar.min"
          :max="bar.max"
          :invert="bar.invert"
          :tone="bar.tone"
        />
      </div>
    </section>

    <section class="specs__block">
      <h2 class="specs__heading">{{ $t('unit.facts') }}</h2>
      <dl class="specs__table">
        <div v-for="row in facts" :key="row.label" class="specs__row">
          <dt>
            <BaseIcon :name="row.icon" :size="14" />
            {{ row.label }}
          </dt>
          <dd class="numeric">{{ row.value }}</dd>
        </div>
      </dl>
      <DemoNotice message-key="unit.specNote" />
    </section>

    <div class="specs__lists">
      <section class="specs__block">
        <h2 class="specs__heading">{{ $t('unit.electronics') }}</h2>
        <ul class="specs__list">
          <li v-for="key in bike.electronicsKeys" :key="key">
            <BaseIcon name="check" :size="14" />{{ $t(key) }}
          </li>
        </ul>
      </section>

      <section class="specs__block">
        <h2 class="specs__heading">{{ $t('unit.equipment') }}</h2>
        <ul class="specs__list">
          <li v-for="key in bike.featureKeys" :key="key">
            <BaseIcon name="check" :size="14" />{{ $t(key) }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.specs {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}

.specs__block {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.specs__heading {
  @include eyebrow;
  font-size: 0.7rem;
  color: $chalk;
}

.specs__hint {
  font-size: 0.8rem;
  color: $steel;
  margin-top: -$space-2;
}

.specs__bars {
  display: grid;
  gap: $space-4;

  @include from($bp-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: $space-4 $space-6;
  }
}

.specs__table {
  margin: 0;
  border-top: 1px solid $carbon-800;
}

.specs__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  padding-block: $space-3;
  border-bottom: 1px solid $carbon-800;

  dt {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: 0.86rem;
    color: $titanium;

    svg {
      color: $steel;
    }
  }

  dd {
    margin: 0;
    font-size: 0.9rem;
    font-weight: $fw-semibold;
    color: $chalk;
    text-align: right;
  }
}

.specs__lists {
  display: grid;
  gap: $space-5;

  @include from($bp-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.specs__list {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  font-size: 0.88rem;
  color: $titanium;

  li {
    display: flex;
    align-items: flex-start;
    gap: $space-2;
  }

  svg {
    margin-top: 0.28em;
    color: $volt;
  }
}
</style>
