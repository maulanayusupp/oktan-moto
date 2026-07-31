<script setup lang="ts">
// Docked compare tray (max 3 units). Collapsed it shows thumbnails; expanded it
// shows a spec table with the best value in each row highlighted, and a single
// e-mail action that asks about every selected unit at once.
import { smallImage } from '~/utils/format'

const { t } = useI18n()
const localePath = useLocalePath()
const { bikes, remove, clear } = useCompare()
const { price, km } = useCurrency()
const { forCompare } = useEnquiry()

const expanded = ref(false)

// Rows are declared once; `best: 'min' | 'max'` marks which end wins so the
// highlight logic stays data-driven instead of per-row conditionals.
const rows = computed(() => [
  { key: 'price', label: t('compare.rows.price'), best: 'min' as const, values: bikes.value.map((b) => b.priceIdr), format: (v: number) => price(v) },
  { key: 'power', label: t('compare.rows.power'), best: 'max' as const, values: bikes.value.map((b) => b.powerHp), format: (v: number) => `${v} hp` },
  { key: 'torque', label: t('compare.rows.torque'), best: 'max' as const, values: bikes.value.map((b) => b.torqueNm), format: (v: number) => `${v} Nm` },
  { key: 'weight', label: t('compare.rows.weight'), best: 'min' as const, values: bikes.value.map((b) => b.weightKg), format: (v: number) => `${v} kg` },
  { key: 'ptw', label: t('compare.rows.ptw'), best: 'max' as const, values: bikes.value.map((b) => b.powerToWeight), format: (v: number) => `${v} hp/t` },
  { key: 'cc', label: t('compare.rows.cc'), best: 'max' as const, values: bikes.value.map((b) => b.engineCc), format: (v: number) => `${v} cc` },
  { key: 'year', label: t('compare.rows.year'), best: 'max' as const, values: bikes.value.map((b) => b.year), format: (v: number) => String(v) },
  { key: 'mileage', label: t('compare.rows.mileage'), best: 'min' as const, values: bikes.value.map((b) => b.mileageKm), format: (v: number) => (v === 0 ? t('inventory.zeroKm') : km(v)) },
])

function isBest(row: { best: 'min' | 'max'; values: number[] }, value: number) {
  if (row.values.length < 2) return false
  const target = row.best === 'min' ? Math.min(...row.values) : Math.max(...row.values)
  return value === target
}

const mailHref = computed(() => forCompare(bikes.value))

// Collapse automatically once the tray empties.
watch(bikes, (value) => {
  if (!value.length) expanded.value = false
})
</script>

<template>
  <Transition name="tray">
    <section v-if="bikes.length" class="tray" :aria-label="$t('compare.title')">
      <div class="tray__bar container container--wide">
        <button
          class="tray__toggle"
          type="button"
          :aria-expanded="expanded"
          aria-controls="compare-panel"
          @click="expanded = !expanded"
        >
          <BaseIcon name="compare" :size="18" />
          <span class="tray__title">{{ $t('compare.title') }}</span>
          <span class="tray__count numeric">{{ bikes.length }}/3</span>
          <BaseIcon :name="expanded ? 'chevronDown' : 'chevronUp'" :size="16" />
        </button>

        <ul class="tray__thumbs">
          <li v-for="bike in bikes" :key="bike.slug" class="tray__thumb">
            <img :src="smallImage(bike.images[0] ?? '')" :alt="`${bike.make} ${bike.model}`" width="72" height="45" loading="lazy">
            <button
              class="tray__remove"
              type="button"
              :aria-label="$t('compare.removeUnit', { unit: `${bike.make} ${bike.model}` })"
              @click="remove(bike.slug)"
            >
              <BaseIcon name="close" :size="12" />
            </button>
          </li>
        </ul>

        <div class="tray__actions">
          <BaseButton variant="ghost" size="sm" @click="clear">{{ $t('compare.clear') }}</BaseButton>
          <BaseButton variant="primary" size="sm" icon="mail" icon-leading :href="mailHref">
            {{ $t('compare.ask') }}
          </BaseButton>
        </div>
      </div>

      <div v-show="expanded" id="compare-panel" class="tray__panel">
        <div class="tray__scroll container container--wide">
          <table class="tray__table">
            <caption class="visually-hidden">{{ $t('compare.tableCaption') }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ $t('compare.spec') }}</th>
                <th v-for="bike in bikes" :key="bike.slug" scope="col">
                  <NuxtLink class="tray__link" :to="localePath({ name: 'inventory-slug', params: { slug: bike.slug } })">
                    {{ bike.make }} {{ bike.model }}
                  </NuxtLink>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.key">
                <th scope="row">{{ row.label }}</th>
                <td
                  v-for="(value, index) in row.values"
                  :key="index"
                  class="numeric"
                  :class="{ 'tray__best': isBest(row, value) }"
                >
                  {{ row.format(value) }}
                </td>
              </tr>
            </tbody>
          </table>
          <DemoNotice message-key="compare.note" />
        </div>
      </div>
    </section>
  </Transition>
</template>

<style scoped lang="scss">
.tray {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: $z-drawer;
  background: rgba($carbon-900, 0.96);
  border-top: 1px solid $carbon-600;
  backdrop-filter: blur(14px);
  box-shadow: $shadow-lg;
}

.tray__bar {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex-wrap: wrap;
  padding-block: $space-3;
}

.tray__toggle {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  color: $chalk;
  @include focus-visible;
}

.tray__title {
  font-family: $font-display;
  font-size: 0.76rem;
  font-weight: $fw-semibold;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  @include until($bp-xs) {
    @include visually-hidden;
  }
}

.tray__count {
  font-size: 0.74rem;
  color: $volt;
}

.tray__thumbs {
  display: flex;
  gap: $space-2;
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  @include thin-scrollbar;
}

.tray__thumb {
  position: relative;
  flex: none;

  img {
    width: 72px;
    height: 45px;
    object-fit: cover;
    border: 1px solid $carbon-700;
    border-radius: $radius-xs;
  }
}

.tray__remove {
  position: absolute;
  top: -6px;
  right: -6px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  color: $chalk;
  background: $carbon-800;
  border: 1px solid $carbon-600;
  border-radius: $radius-pill;

  @include hover {
    color: $ignition;
    border-color: $ignition;
  }

  @include focus-visible;
}

.tray__actions {
  display: flex;
  gap: $space-2;
  margin-left: auto;
}

.tray__panel {
  border-top: 1px solid $carbon-800;
  max-height: 52svh;
  overflow-y: auto;
}

.tray__scroll {
  padding-block: $space-4;
  overflow-x: auto;
  @include thin-scrollbar;
}

.tray__table {
  min-width: 520px;
  font-size: 0.86rem;

  th,
  td {
    padding: $space-2 $space-3;
    border-bottom: 1px solid $carbon-800;
    text-align: left;
  }

  thead th {
    @include eyebrow;
    font-size: 0.66rem;
    color: $chalk;
    white-space: nowrap;
  }

  tbody th {
    font-family: $font-body;
    font-weight: $fw-regular;
    color: $titanium;
    white-space: nowrap;
  }

  td {
    color: $chalk;
  }
}

.tray__best {
  color: $volt;
  font-weight: $fw-semibold;
}

.tray__link {
  color: $chalk;
  border-bottom: 1px solid transparent;

  @include hover {
    border-bottom-color: $ignition;
  }

  @include focus-visible;
}

.tray-enter-active,
.tray-leave-active {
  transition: transform $dur-base $ease-out, opacity $dur-base $ease-out;
}

.tray-enter-from,
.tray-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
