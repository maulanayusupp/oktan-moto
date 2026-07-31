<script setup lang="ts">
// Labelled text input / textarea with inline error messaging. Owns the
// label↔control association and aria-invalid/aria-describedby wiring so no form
// has to repeat it.
const props = withDefaults(
  defineProps<{
    id: string
    label: string
    modelValue: string
    type?: 'text' | 'email' | 'tel'
    textarea?: boolean
    rows?: number
    placeholder?: string
    error?: string
    hint?: string
    required?: boolean
    autocomplete?: string
  }>(),
  { type: 'text', rows: 5 },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.error) ids.push(`${props.id}-error`)
  else if (props.hint) ids.push(`${props.id}-hint`)
  return ids.length ? ids.join(' ') : undefined
})

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="field" :class="{ 'field--invalid': Boolean(error) }">
    <label class="field__label" :for="id">
      {{ label }}
      <span v-if="required" class="field__required" aria-hidden="true">*</span>
    </label>

    <textarea
      v-if="textarea"
      :id="id"
      class="field__control field__control--area"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      @input="onInput"
    />
    <input
      v-else
      :id="id"
      class="field__control"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
      @input="onInput"
    >

    <p v-if="error" :id="`${id}-error`" class="field__error">
      <BaseIcon name="alert" :size="14" />
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.field {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.field__label {
  @include eyebrow;
  letter-spacing: 0.16em;
  color: $titanium;
}

.field__required {
  color: $ignition;
}

.field__control {
  width: 100%;
  padding: 0.72rem 0.9rem;
  background: $carbon-900;
  border: 1px solid $carbon-700;
  border-radius: $radius-sm;
  color: $chalk;
  font-size: 0.95rem;
  transition: border-color $dur-fast $ease-out, background-color $dur-fast $ease-out;

  &::placeholder {
    color: $steel;
  }

  &:hover {
    border-color: $carbon-600;
  }

  &:focus {
    outline: none;
    border-color: $ignition;
    background: $carbon-850;
  }
}

.field__control--area {
  resize: vertical;
  min-height: 7rem;
  line-height: 1.6;
}

.field--invalid .field__control {
  border-color: $danger;
}

.field__error {
  display: flex;
  align-items: center;
  gap: $space-1;
  font-size: 0.8rem;
  color: $danger;
}

.field__hint {
  font-size: 0.8rem;
  color: $steel;
}
</style>
