<script setup lang="ts">
// Contact page: channels, the WhatsApp-composing form, and what to bring to a
// viewing. No map embed — a third-party iframe would set cookies we do not
// disclose; we link out to Maps instead.
const { t } = useI18n()

definePageMeta({ flushHero: true })

usePageSeo(() => ({
  title: t('contact.meta.title'),
  description: t('contact.meta.description'),
  image: '/og-image.jpg',
}))

const checklist = ['id', 'budget', 'unit', 'tradeIn'] as const
</script>

<template>
  <div>
    <PageHero
      :eyebrow="$t('contact.hero.eyebrow')"
      :title="$t('contact.hero.title')"
      :lead="$t('contact.hero.lead')"
      image="/editorial/apex-rider.jpg"
      compact
    />

    <section class="section">
      <div class="container container--wide contact">
        <div class="contact__form">
          <SectionHeading
            :eyebrow="$t('contact.form.eyebrow')"
            :title="$t('contact.form.title')"
            :lead="$t('contact.form.lead')"
          />
          <ContactForm />
        </div>

        <aside class="contact__side">
          <ContactChannels />

          <div class="contact__checklist">
            <h2 class="contact__checklist-title">{{ $t('contact.checklist.title') }}</h2>
            <ul>
              <li v-for="item in checklist" :key="item">
                <BaseIcon name="check" :size="15" />
                {{ $t(`contact.checklist.items.${item}`) }}
              </li>
            </ul>
            <p class="contact__checklist-note">{{ $t('contact.checklist.note') }}</p>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.contact {
  display: grid;
  gap: $space-6;

  @include from($bp-lg) {
    grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.95fr);
    gap: $space-7;
    align-items: start;
  }
}

.contact__side {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.contact__checklist {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: $space-5;
  @include panel($carbon-900, 18px);

  ul {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    font-size: 0.9rem;
    color: $titanium;
  }

  li {
    display: flex;
    align-items: flex-start;
    gap: $space-2;
  }

  svg {
    margin-top: 0.25em;
    color: $volt;
    flex: none;
  }
}

.contact__checklist-title {
  @include eyebrow;
  font-size: 0.7rem;
  color: $chalk;
}

.contact__checklist-note {
  font-size: 0.78rem;
  color: $steel;
}
</style>
