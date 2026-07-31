<script setup lang="ts">
// Root component: locale-driven <html lang> + hreflang alternates, the global
// title template, and the site-wide Organization/LocalBusiness JSON-LD.
import { brandConfig } from '~/config/brand.config'

const head = useLocaleHead()
const { t, locale } = useI18n()
const config = useRuntimeConfig()

const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')

useHead({
  htmlAttrs: { lang: computed(() => String(head.value.htmlAttrs?.lang ?? 'id')) },
  link: computed(() => head.value.link ?? []),
  meta: computed(() => head.value.meta ?? []),
  titleTemplate: (title) =>
    title ? `${title} · ${brandConfig.name}` : `${brandConfig.longName} — ${t('meta.tagline')}`,
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AutoDealer',
          '@id': `${siteUrl}/#dealer`,
          name: brandConfig.longName,
          description: t('meta.description'),
          url: siteUrl,
          image: `${siteUrl}/og-image.jpg`,
          email: String(config.public.contactEmail),
          address: {
            '@type': 'PostalAddress',
            streetAddress: t('contact.address.street'),
            addressLocality: brandConfig.city,
            addressRegion: brandConfig.region,
            postalCode: brandConfig.postalCode,
            addressCountry: brandConfig.country,
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: brandConfig.geo.lat,
            longitude: brandConfig.geo.lng,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              opens: brandConfig.hours.weekdays.open,
              closes: brandConfig.hours.weekdays.close,
            },
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Saturday'],
              opens: brandConfig.hours.saturday.open,
              closes: brandConfig.hours.saturday.close,
            },
          ],
          inLanguage: locale.value === 'id' ? 'id-ID' : 'en-US',
          disambiguatingDescription: t('common.demoShort'),
        }),
      ),
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
