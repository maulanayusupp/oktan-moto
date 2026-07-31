<script setup lang="ts">
// Instalment estimator. Deliberately labelled as an illustration, not an offer:
// the maths is the flat-rate convention Indonesian multifinance quotes use, and
// finance.service owns it so the component only handles input and display.
import {
  downPaymentRatios,
  estimate,
  indicativeAnnualRate,
  tenors,
} from '~/services/finance.service'

const props = defineProps<{ priceIdr: number }>()

const { priceExact } = useCurrency()

const ratio = ref(downPaymentRatios[1] ?? 0.3)
const months = ref(tenors[1] ?? 24)

const result = computed(() =>
  estimate({
    priceIdr: props.priceIdr,
    downPaymentRatio: ratio.value,
    months: months.value,
    annualRate: indicativeAnnualRate,
  }),
)

const ratePercent = computed(() => Math.round(indicativeAnnualRate * 1000) / 10)
</script>

<template>
  <section class="finance">
    <header class="finance__head">
      <h2 class="finance__title">{{ $t('finance.title') }}</h2>
      <p class="finance__lead">{{ $t('finance.lead') }}</p>
    </header>

    <div class="finance__controls">
      <fieldset class="finance__group">
        <legend class="finance__legend">{{ $t('finance.downPayment') }}</legend>
        <div class="finance__options">
          <button
            v-for="option in downPaymentRatios"
            :key="option"
            class="finance__option"
            :class="{ 'finance__option--on': ratio === option }"
            type="button"
            :aria-pressed="ratio === option"
            @click="ratio = option"
          >
            {{ Math.round(option * 100) }}%
          </button>
        </div>
      </fieldset>

      <fieldset class="finance__group">
        <legend class="finance__legend">{{ $t('finance.tenor') }}</legend>
        <div class="finance__options">
          <button
            v-for="option in tenors"
            :key="option"
            class="finance__option"
            :class="{ 'finance__option--on': months === option }"
            type="button"
            :aria-pressed="months === option"
            @click="months = option"
          >
            {{ option }}{{ $t('finance.monthsShort') }}
          </button>
        </div>
      </fieldset>
    </div>

    <div class="finance__result">
      <p class="finance__monthly">
        <span class="finance__monthly-label">{{ $t('finance.perMonth') }}</span>
        <span class="finance__monthly-value numeric">{{ priceExact(result.monthly) }}</span>
      </p>
      <dl class="finance__breakdown">
        <div>
          <dt>{{ $t('finance.dpAmount') }}</dt>
          <dd class="numeric">{{ priceExact(result.downPayment) }}</dd>
        </div>
        <div>
          <dt>{{ $t('finance.financed') }}</dt>
          <dd class="numeric">{{ priceExact(result.principal) }}</dd>
        </div>
        <div>
          <dt>{{ $t('finance.rate') }}</dt>
          <dd class="numeric">{{ ratePercent }}% {{ $t('finance.flatPerYear') }}</dd>
        </div>
        <div>
          <dt>{{ $t('finance.total') }}</dt>
          <dd class="numeric">{{ priceExact(result.totalPaid) }}</dd>
        </div>
      </dl>
    </div>

    <DemoNotice message-key="finance.disclaimer" tone="panel" icon="alert" />
  </section>
</template>

<style scoped lang="scss">
.finance {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5;
  @include panel($carbon-900, 24px);
}

.finance__head {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.finance__title {
  @include display(clamp(1.3rem, 2.4vw, 1.7rem));
}

.finance__lead {
  font-size: 0.9rem;
  color: $titanium;
}

.finance__controls {
  display: grid;
  gap: $space-4;

  @include from($bp-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.finance__group {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.finance__legend {
  @include eyebrow;
  font-size: 0.66rem;
}

.finance__options {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.finance__option {
  padding: 0.45rem 0.8rem;
  font-family: $font-display;
  font-size: 0.78rem;
  font-weight: $fw-semibold;
  color: $titanium;
  background: $carbon-950;
  border: 1px solid $carbon-700;
  border-radius: $radius-sm;
  transition: border-color $dur-fast $ease-out, color $dur-fast $ease-out;

  @include hover {
    border-color: $carbon-600;
    color: $chalk;
  }

  @include focus-visible;
}

.finance__option--on {
  border-color: $ignition;
  color: $ignition;
  background: rgba($ignition, 0.08);
}

.finance__result {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-4;
  background: $carbon-950;
  border: 1px solid $carbon-800;
  border-radius: $radius-sm;
}

.finance__monthly {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.finance__monthly-label {
  @include eyebrow;
  font-size: 0.64rem;
}

.finance__monthly-value {
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  font-weight: $fw-bold;
  color: $volt;
}

.finance__breakdown {
  display: grid;
  gap: $space-2 $space-4;
  margin: 0;
  font-size: 0.84rem;

  @include from($bp-xs) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  div {
    display: flex;
    justify-content: space-between;
    gap: $space-3;
    padding-block: $space-1;
    border-bottom: 1px solid $carbon-800;
  }

  dt {
    color: $titanium;
  }

  dd {
    margin: 0;
    color: $chalk;
    font-weight: $fw-medium;
  }
}
</style>
