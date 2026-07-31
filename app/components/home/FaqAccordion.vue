<script setup lang="ts">
// FAQ built on native <details>/<summary>: keyboard accessible and functional
// without JavaScript. The page emits matching FAQPage JSON-LD from the same
// config list, so the markup and the structured data cannot drift apart.
import { faqIds } from '~/config/content.config'
</script>

<template>
  <div class="faq">
    <details v-for="(id, index) in faqIds" :key="id" class="faq__item" :name="'faq'">
      <summary class="faq__summary">
        <span class="faq__index numeric">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="faq__question">{{ $t(`faq.items.${id}.q`) }}</span>
        <BaseIcon class="faq__chevron" name="chevronDown" :size="18" />
      </summary>
      <div class="faq__answer">
        <p>{{ $t(`faq.items.${id}.a`) }}</p>
      </div>
    </details>
  </div>
</template>

<style scoped lang="scss">
.faq {
  display: flex;
  flex-direction: column;
  border-top: 1px solid $carbon-700;
}

.faq__item {
  border-bottom: 1px solid $carbon-700;

  &[open] {
    .faq__chevron {
      transform: rotate(180deg);
      color: $ignition;
    }

    .faq__question {
      color: $chalk;
    }
  }
}

.faq__summary {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding-block: $space-4;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  @include hover {
    .faq__question {
      color: $chalk;
    }
  }

  &:focus-visible {
    @include focus-ring;
  }
}

.faq__index {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  color: $ignition;
}

.faq__question {
  flex: 1;
  font-family: $font-display;
  font-size: 1rem;
  font-weight: $fw-semibold;
  color: $titanium;
  transition: color $dur-fast $ease-out;

  @include from($bp-md) {
    font-size: 1.08rem;
  }
}

.faq__chevron {
  color: $titanium;
  transition: transform $dur-base $ease-out, color $dur-base $ease-out;
}

.faq__answer {
  padding: 0 0 $space-4 calc(#{$space-3} + 1.7rem);
  color: $titanium;
  font-size: 0.94rem;
  max-width: 74ch;
}
</style>
