<script setup lang="ts">
// The single button/CTA primitive: renders as <button>, <NuxtLink> or <a>
// depending on the props, so styling never has to be duplicated per element.
// Variants: primary (ignition), ghost (hairline), volt (data actions), plain.
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'volt' | 'plain'
    size?: 'sm' | 'md' | 'lg'
    to?: string
    href?: string
    /** External links open in a new tab with rel=noopener. */
    external?: boolean
    icon?: string
    /** Places the icon after the label (default) or before it. */
    iconLeading?: boolean
    block?: boolean
    disabled?: boolean
    type?: 'button' | 'submit'
    ariaLabel?: string
  }>(),
  { variant: 'primary', size: 'md', type: 'button', iconLeading: false },
)

const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

const bindings = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) {
    return props.external
      ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
      : { href: props.href }
  }
  return { type: props.type, disabled: props.disabled }
})
</script>

<template>
  <component
    :is="tag"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'btn--disabled': disabled }]"
    :aria-label="ariaLabel"
    v-bind="bindings"
  >
    <BaseIcon v-if="icon && iconLeading" :name="icon" :size="size === 'lg' ? 20 : 18" />
    <span class="btn__label"><slot /></span>
    <BaseIcon v-if="icon && !iconLeading" :name="icon" :size="size === 'lg' ? 20 : 18" />
  </component>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  font-family: $font-display;
  font-weight: $fw-semibold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid transparent;
  transition:
    background-color $dur-fast $ease-out,
    border-color $dur-fast $ease-out,
    color $dur-fast $ease-out,
    transform $dur-fast $ease-out;
  @include notch(12px);
  @include focus-visible;

  @include hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

// --- Sizes --------------------------------------------------------------------
.btn--sm {
  padding: 0.42rem 0.85rem;
  font-size: 0.72rem;
}

.btn--md {
  padding: 0.62rem 1.15rem;
  font-size: 0.78rem;
}

.btn--lg {
  padding: 0.85rem 1.5rem;
  font-size: 0.86rem;
}

// --- Variants -----------------------------------------------------------------
.btn--primary {
  background: $ignition;
  color: #fff;

  @include hover {
    background: color-mix(in srgb, $ignition 88%, #fff);
  }
}

.btn--ghost {
  background: transparent;
  border-color: $carbon-600;
  color: $chalk;

  @include hover {
    border-color: $ignition;
    color: $ignition;
  }
}

.btn--volt {
  background: $volt;
  color: $carbon-950;

  @include hover {
    background: color-mix(in srgb, $volt 88%, #fff);
  }
}

.btn--plain {
  padding-inline: 0;
  background: none;
  color: $titanium;
  clip-path: none;

  @include hover {
    color: $chalk;
  }
}

.btn--block {
  width: 100%;
}

.btn--disabled {
  opacity: 0.45;
  pointer-events: none;
}

.btn__label {
  line-height: 1.2;
}
</style>
