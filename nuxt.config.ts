import { fileURLToPath } from 'node:url'

// Inject shared SCSS (tokens + mixins — no CSS output) into every component's
// <style lang="scss"> block. Absolute path so Sass @use always resolves.
const scssShared = fileURLToPath(new URL('./app/assets/scss/_shared.scss', import.meta.url))

// Canonical site URL, no trailing slash (avoids `//og-image.png` when building
// absolute asset URLs). Override per environment with NUXT_PUBLIC_SITE_URL.
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://oktan-moto.vercel.app').replace(/\/$/, '')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', '@nuxtjs/seo'],

  // Name components by filename only (ignore folder prefix) for concise tags.
  components: [{ path: '~/components', pathPrefix: false }],

  // Single centralized SCSS entrypoint. No inline styles anywhere in the app —
  // the only exception is passing CSS custom properties through :style.
  css: ['~/assets/scss/main.scss'],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Sora:wght@300;400;500;600&display=swap',
        },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { name: 'theme-color', content: '#07080a' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  // @nuxtjs/seo site-wide identity (sitemap, robots, schema.org).
  site: {
    url: siteUrl,
    name: 'OKTAN Superbike Gallery',
    description:
      'OKTAN — galeri motor sport baru & bekas pilihan. Setiap unit diperiksa, riwayatnya dicatat, harganya transparan. Konsultasi langsung via WhatsApp.',
    defaultLocale: 'id',
  },

  // Runtime OG-image rendering needs a native renderer (@takumi-rs/core) we do
  // not bundle; OG tags are emitted manually by usePageSeo with pre-rendered
  // raster images (pnpm og). See TODO.md.
  ogImage: { enabled: false },

  i18n: {
    baseUrl: siteUrl,
    strategy: 'prefix_except_default',
    defaultLocale: 'id',
    locales: [
      { code: 'id', language: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json', dir: 'ltr' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
    bundle: {
      // Silences the v10 optimize-directive advisory; we use $t/useI18n only.
      optimizeTranslationDirective: false,
    },
  },

  runtimeConfig: {
    public: {
      siteUrl,
      contactEmail: process.env.NUXT_PUBLIC_CONTACT_EMAIL || 'maulanayusupp@gmail.com',
      whatsapp: process.env.NUXT_PUBLIC_WHATSAPP || '6287822766333',
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "${scssShared}" as *;`,
        },
      },
    },
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },
})
