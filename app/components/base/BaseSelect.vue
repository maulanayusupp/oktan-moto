<script setup lang="ts">
// Native select, styled. Native is deliberate: it gives correct keyboard and
// mobile behaviour for free, which a custom listbox would have to re-implement.
defineProps<{
  id: string
  label: string
  modelValue: string
  options: readonly { value: string; label: string }[]
  /** Renders the label as a visually-hidden element (compact toolbars). */
  hideLabel?: boolean
  icon?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="select">
    <label class="select__label" :class="{ 'visually-hidden': hideLabel }" :for="id">{{ label }}</label>
    <div class="select__shell">
      <BaseIcon v-if="icon" class="select__icon" :name="icon" :size="16" />
      <select
        :id="id"
        class="select__control"
        :value="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <BaseIcon class="select__chevron" name="chevronDown" :size="16" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.select {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  min-width: 0;
}

.select__label {
  @include eyebrow;
  letter-spacing: 0.16em;
}

.select__shell {
  position: relative;
  display: flex;
  align-items: center;
}

.select__control {
  appearance: none;
  width: 100%;
  padding: 0.62rem 2.2rem 0.62rem 0.85rem;
  background: $carbon-900;
  border: 1px solid $carbon-700;
  border-radius: $radius-sm;
  color: $chalk;
  font-family: $font-display;
  font-size: 0.82rem;
  font-weight: $fw-medium;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: border-color $dur-fast $ease-out;

  &:hover {
    border-color: $carbon-600;
  }

  &:focus-visible {
    outline: none;
    border-color: $ignition;
    @include focus-ring;
  }

  option {
    background: $carbon-850;
    color: $chalk;
  }
}

.select__icon {
  position: absolute;
  left: 0.7rem;
  color: $titanium;
  pointer-events: none;

  ~ .select__control {
    padding-left: 2.2rem;
  }
}

.select__chevron {
  position: absolute;
  right: 0.7rem;
  color: $titanium;
  pointer-events: none;
}
</style>
