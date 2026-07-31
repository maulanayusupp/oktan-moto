<script setup lang="ts">
// Footer: identity + demo disclaimer, navigation, legal links and contact
// channels. The demo disclaimer is deliberately on every page, not only
// /compliance, so the sample nature of the data is never hidden.
import { brandConfig } from '~/config/brand.config'
import { legalNav, primaryNav } from '~/config/navigation.config'
import { generalEnquiryLink, mailtoLink } from '~/services/whatsapp.service'

const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const email = computed(() => String(config.public.contactEmail))
const waHref = computed(() => generalEnquiryLink(String(config.public.whatsapp), t('wa.enquiry.general')))
const mailHref = computed(() => mailtoLink(email.value, t('contact.mail.subject'), t('contact.mail.body')))
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__top container container--wide">
      <div class="footer__identity">
        <BrandLogo />
        <p class="footer__pitch">{{ $t('footer.pitch') }}</p>
        <p class="footer__demo">
          <BaseIcon name="info" :size="14" />
          {{ $t('common.demoShort') }}
        </p>
      </div>

      <nav class="footer__col" :aria-label="$t('a11y.footerNav')">
        <h2 class="footer__heading">{{ $t('footer.explore') }}</h2>
        <NuxtLink v-for="item in primaryNav" :key="item.routeName" class="footer__link" :to="localePath(item.routeName)">
          {{ $t(item.labelKey) }}
        </NuxtLink>
      </nav>

      <nav class="footer__col" :aria-label="$t('a11y.legalNav')">
        <h2 class="footer__heading">{{ $t('footer.legal') }}</h2>
        <NuxtLink v-for="item in legalNav" :key="item.routeName" class="footer__link" :to="localePath(item.routeName)">
          {{ $t(item.labelKey) }}
        </NuxtLink>
      </nav>

      <div class="footer__col">
        <h2 class="footer__heading">{{ $t('footer.reach') }}</h2>
        <a class="footer__link footer__link--icon" :href="waHref" target="_blank" rel="noopener noreferrer">
          <BaseIcon name="whatsapp" :size="15" />WhatsApp
        </a>
        <a class="footer__link footer__link--icon" :href="mailHref">
          <BaseIcon name="mail" :size="15" />{{ email }}
        </a>
        <p class="footer__address">
          <BaseIcon name="mapPin" :size="15" />
          <span>{{ $t('contact.address.street') }}, {{ brandConfig.city }}</span>
        </p>
        <p class="footer__address">
          <BaseIcon name="clock" :size="15" />
          <span>{{ $t('contact.hours.weekdaysShort') }}</span>
        </p>
      </div>
    </div>

    <div class="footer__bottom container container--wide">
      <p class="footer__copy">© {{ year }} {{ brandConfig.longName }}. {{ $t('footer.rights') }}</p>
      <p class="footer__built">{{ $t('footer.built') }}</p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  margin-top: auto;
  border-top: 1px solid $carbon-700;
  background: $carbon-900;
  padding-top: $space-8;
}

.footer__top {
  display: grid;
  gap: $space-6;
  grid-template-columns: 1fr;

  @include from($bp-sm) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include from($bp-lg) {
    grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
    gap: $space-7;
  }
}

.footer__identity {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  max-width: 34ch;
}

.footer__pitch {
  color: $titanium;
  font-size: 0.92rem;
}

.footer__demo {
  display: flex;
  align-items: flex-start;
  gap: $space-2;
  padding: $space-3;
  font-size: 0.78rem;
  color: $titanium;
  border: 1px solid rgba($ignition, 0.35);
  border-radius: $radius-sm;
  @include hatch;
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  align-items: flex-start;
}

.footer__heading {
  @include eyebrow;
  margin-bottom: $space-2;
  color: $chalk;
}

.footer__link {
  font-size: 0.9rem;
  color: $titanium;
  transition: color $dur-fast $ease-out;

  @include hover {
    color: $ignition;
  }

  @include focus-visible;
}

.footer__link--icon,
.footer__address {
  display: flex;
  align-items: center;
  gap: $space-2;
  font-size: 0.9rem;
  color: $titanium;
}

.footer__address {
  align-items: flex-start;
  line-height: 1.5;
}

.footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: $space-2;
  margin-top: $space-7;
  padding-block: $space-4;
  border-top: 1px solid $carbon-800;
  font-size: 0.78rem;
  color: $steel;
}
</style>
