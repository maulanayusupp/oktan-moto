<script setup lang="ts">
// Sticky header. Transparent while the page sits at the top (so the 3D hero
// reads full-bleed) and switches to a blurred carbon bar once scrolled. The
// mobile drawer traps nothing — it is a plain panel closed by Escape, route
// change or the toggle, which keeps focus behaviour predictable.
import { primaryNav } from '~/config/navigation.config'

const localePath = useLocalePath()
const route = useRoute()
const { general } = useEnquiry()

const scrolled = ref(false)
const open = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  document.body.classList.remove('no-scroll')
})

// Close on navigation and lock the page behind the drawer.
watch(() => route.fullPath, () => (open.value = false))
watch(open, (value) => {
  if (import.meta.client) document.body.classList.toggle('no-scroll', value)
})
</script>

<template>
  <header class="header" :class="{ 'header--solid': scrolled || open }">
    <div class="header__inner container container--wide">
      <NuxtLink class="header__brand" :to="localePath('index')" :aria-label="$t('a11y.home')">
        <BrandLogo />
      </NuxtLink>

      <nav class="header__nav desktop-only" :aria-label="$t('a11y.primaryNav')">
        <NuxtLink
          v-for="item in primaryNav"
          :key="item.routeName"
          class="header__link"
          :to="localePath(item.routeName)"
        >
          {{ $t(item.labelKey) }}
        </NuxtLink>
      </nav>

      <div class="header__actions">
        <LanguageSwitcher class="desktop-only" />
        <BaseButton
          class="desktop-only"
          variant="primary"
          size="sm"
          icon="mail"
          icon-leading
          :href="general"
        >
          {{ $t('cta.email') }}
        </BaseButton>

        <button
          class="header__toggle mobile-only"
          type="button"
          :aria-expanded="open"
          aria-controls="mobile-nav"
          :aria-label="open ? $t('a11y.closeMenu') : $t('a11y.openMenu')"
          @click="open = !open"
        >
          <BaseIcon :name="open ? 'close' : 'menu'" :size="22" />
        </button>
      </div>
    </div>

    <Transition name="drawer">
      <div v-if="open" id="mobile-nav" class="drawer mobile-only">
        <nav class="drawer__nav" :aria-label="$t('a11y.primaryNav')">
          <NuxtLink
            v-for="(item, index) in primaryNav"
            :key="item.routeName"
            class="drawer__link"
            :to="localePath(item.routeName)"
          >
            <span class="drawer__index numeric">0{{ index + 1 }}</span>
            {{ $t(item.labelKey) }}
          </NuxtLink>
        </nav>

        <div class="drawer__footer">
          <LanguageSwitcher />
          <BaseButton variant="primary" size="md" icon="mail" icon-leading block :href="general">
            {{ $t('cta.email') }}
          </BaseButton>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: $z-header;
  transition: background-color $dur-base $ease-out, border-color $dur-base $ease-out;
  border-bottom: 1px solid transparent;
}

.header--solid {
  background: rgba($carbon-950, 0.86);
  backdrop-filter: blur(14px);
  border-bottom-color: $carbon-700;
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;
  height: var(--header-h);
}

.header__brand {
  @include focus-visible;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: $space-5;
}

.header__link {
  position: relative;
  font-family: $font-display;
  font-size: 0.78rem;
  font-weight: $fw-semibold;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: $titanium;
  padding-block: $space-2;
  transition: color $dur-fast $ease-out;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0.15rem;
    width: 100%;
    height: 1px;
    background: $ignition;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform $dur-base $ease-out;
  }

  @include hover {
    color: $chalk;

    &::after {
      transform: scaleX(1);
    }
  }

  @include focus-visible;

  &.router-link-active {
    color: $chalk;

    &::after {
      transform: scaleX(1);
    }
  }
}

.header__actions {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.header__toggle {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  color: $chalk;
  border: 1px solid $carbon-700;
  border-radius: $radius-sm;
  @include focus-visible;
}

// --- Mobile drawer ------------------------------------------------------------
.drawer {
  border-top: 1px solid $carbon-700;
  background: $carbon-950;
  padding: $space-4 $space-4 $space-6;
  max-height: calc(100dvh - var(--header-h));
  overflow-y: auto;
}

.drawer__nav {
  display: flex;
  flex-direction: column;
}

.drawer__link {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-4 0;
  border-bottom: 1px solid $carbon-800;
  font-family: $font-display;
  font-size: 1.32rem;
  font-weight: $fw-semibold;
  text-transform: uppercase;
  color: $chalk;
  @include focus-visible;

  &.router-link-active {
    color: $ignition;
  }
}

.drawer__index {
  font-size: 0.72rem;
  color: $steel;
  letter-spacing: 0.14em;
}

.drawer__footer {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  margin-top: $space-5;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity $dur-fast $ease-out, transform $dur-base $ease-out;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
