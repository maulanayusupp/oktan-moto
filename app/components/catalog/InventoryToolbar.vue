<script setup lang="ts">
// Filter + sort toolbar. Owns no filtering logic: it edits the InventoryFilters
// object (v-model) that useInventoryFilters keeps in sync with the URL, and
// inventory.service does the work.
import { priceSteps } from '~/services/inventory.service'
import { formatIdr } from '~/utils/format'
import type { Category, Condition, InventoryFilters, SortKey } from '~/types'

const props = defineProps<{
  modelValue: InventoryFilters
  resultCount: number
  activeCount: number
}>()

const emit = defineEmits<{ 'update:modelValue': [InventoryFilters]; reset: [] }>()

const { t, locale } = useI18n()

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function patch<K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) {
  filters.value = { ...props.modelValue, [key]: value }
}

const conditions: (Condition | 'all')[] = ['all', 'new', 'used']
const categories: (Category | 'all')[] = ['all', 'supersport', 'naked', 'sport-touring', 'heritage']
const ccOptions = [0, 600, 900, 1000, 1200]

const sortOptions = computed(() =>
  (['featured', 'price-asc', 'price-desc', 'power-desc', 'year-desc', 'cc-desc'] as SortKey[]).map((value) => ({
    value,
    label: t(`inventory.sort.${value}`),
  })),
)

const priceOptions = computed(() => [
  { value: '', label: t('inventory.filters.anyPrice') },
  ...priceSteps().map((step) => ({
    value: String(step),
    label: t('inventory.filters.under', { price: formatIdr(step, locale.value) }),
  })),
])

const ccSelectOptions = computed(() =>
  ccOptions.map((cc) => ({
    value: cc === 0 ? '' : String(cc),
    label: cc === 0 ? t('inventory.filters.anyCc') : t('inventory.filters.fromCc', { cc }),
  })),
)
</script>

<template>
  <div class="toolbar">
    <div class="toolbar__search">
      <BaseIcon class="toolbar__search-icon" name="search" :size="17" />
      <label class="visually-hidden" for="inventory-search">{{ $t('inventory.filters.searchLabel') }}</label>
      <input
        id="inventory-search"
        class="toolbar__input"
        type="search"
        :value="modelValue.query"
        :placeholder="$t('inventory.filters.searchPlaceholder')"
        @input="patch('query', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="toolbar__segments" role="group" :aria-label="$t('inventory.filters.conditionLabel')">
      <button
        v-for="option in conditions"
        :key="option"
        class="toolbar__segment"
        :class="{ 'toolbar__segment--on': modelValue.condition === option }"
        type="button"
        :aria-pressed="modelValue.condition === option"
        @click="patch('condition', option)"
      >
        {{ option === 'all' ? $t('inventory.filters.all') : $t(`condition.${option}`) }}
      </button>
    </div>

    <div class="toolbar__chips" role="group" :aria-label="$t('inventory.filters.categoryLabel')">
      <button
        v-for="option in categories"
        :key="option"
        class="toolbar__chip"
        :class="{ 'toolbar__chip--on': modelValue.category === option }"
        type="button"
        :aria-pressed="modelValue.category === option"
        @click="patch('category', option)"
      >
        {{ option === 'all' ? $t('inventory.filters.allCategories') : $t(`category.${option}`) }}
      </button>
    </div>

    <div class="toolbar__selects">
      <BaseSelect
        id="filter-price"
        :label="$t('inventory.filters.priceLabel')"
        :model-value="modelValue.priceMax ? String(modelValue.priceMax) : ''"
        :options="priceOptions"
        icon="tag"
        hide-label
        @update:model-value="patch('priceMax', $event ? Number($event) : null)"
      />
      <BaseSelect
        id="filter-cc"
        :label="$t('inventory.filters.ccLabel')"
        :model-value="modelValue.ccMin ? String(modelValue.ccMin) : ''"
        :options="ccSelectOptions"
        icon="piston"
        hide-label
        @update:model-value="patch('ccMin', $event ? Number($event) : null)"
      />
      <BaseSelect
        id="filter-sort"
        :label="$t('inventory.sortLabel')"
        :model-value="modelValue.sort"
        :options="sortOptions"
        icon="sort"
        hide-label
        @update:model-value="patch('sort', $event as SortKey)"
      />
    </div>

    <div class="toolbar__status">
      <p class="toolbar__count numeric">
        {{ $t('inventory.resultCount', { count: resultCount }) }}
      </p>
      <BaseButton v-if="activeCount > 0" variant="plain" size="sm" icon="close" @click="emit('reset')">
        {{ $t('inventory.filters.reset', { count: activeCount }) }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  display: grid;
  gap: $space-4;
  padding: $space-4;
  @include panel($carbon-900);

  @include from($bp-lg) {
    grid-template-columns: minmax(220px, 1fr) auto;
    grid-template-areas:
      'search segments'
      'chips chips'
      'selects status';
    align-items: center;
    padding: $space-5;
  }
}

.toolbar__search {
  position: relative;
  display: flex;
  align-items: center;

  @include from($bp-lg) {
    grid-area: search;
  }
}

.toolbar__search-icon {
  position: absolute;
  left: 0.8rem;
  color: $steel;
  pointer-events: none;
}

.toolbar__input {
  width: 100%;
  padding: 0.68rem 0.9rem 0.68rem 2.4rem;
  background: $carbon-950;
  border: 1px solid $carbon-700;
  border-radius: $radius-sm;
  color: $chalk;
  font-size: 0.92rem;

  &::placeholder {
    color: $steel;
  }

  &:focus {
    outline: none;
    border-color: $ignition;
  }
}

.toolbar__segments {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: $carbon-950;
  border: 1px solid $carbon-700;
  border-radius: $radius-sm;

  @include from($bp-lg) {
    grid-area: segments;
    justify-self: end;
  }
}

.toolbar__segment {
  flex: 1;
  padding: 0.5rem 0.9rem;
  font-family: $font-display;
  font-size: 0.74rem;
  font-weight: $fw-semibold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $titanium;
  border-radius: $radius-xs;
  transition: background-color $dur-fast $ease-out, color $dur-fast $ease-out;

  @include hover {
    color: $chalk;
  }

  @include focus-visible;
}

.toolbar__segment--on {
  background: $ignition;
  color: #fff;
}

.toolbar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;

  @include from($bp-lg) {
    grid-area: chips;
  }
}

.toolbar__chip {
  padding: 0.4rem 0.8rem;
  font-family: $font-display;
  font-size: 0.72rem;
  font-weight: $fw-medium;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $titanium;
  border: 1px solid $carbon-700;
  border-radius: $radius-pill;
  transition: border-color $dur-fast $ease-out, color $dur-fast $ease-out;

  @include hover {
    border-color: $carbon-600;
    color: $chalk;
  }

  @include focus-visible;
}

.toolbar__chip--on {
  border-color: rgba($volt, 0.7);
  color: $volt;
}

.toolbar__selects {
  display: grid;
  gap: $space-3;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));

  @include from($bp-lg) {
    grid-area: selects;
  }
}

.toolbar__status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;

  @include from($bp-lg) {
    grid-area: status;
    justify-content: flex-end;
  }
}

.toolbar__count {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $titanium;
}
</style>
