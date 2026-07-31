<script setup lang="ts">
// About page: who runs the showroom, how units are prepared, and an honest
// statement that this build is a demonstration. Milestone years come from
// content.config; every sentence lives in i18n.
import { brandConfig } from '~/config/brand.config'
import { milestones } from '~/config/content.config'

const { t } = useI18n()
const localePath = useLocalePath()
const { observe } = useReveal()

definePageMeta({ flushHero: true })

usePageSeo(() => ({
  title: t('about.meta.title'),
  description: t('about.meta.description'),
  image: '/og-image.jpg',
}))

const stats = computed(() => [
  { value: String(brandConfig.foundedYear), label: t('about.stats.founded'), icon: 'calendar' },
  { value: String(brandConfig.stats.unitsListed), label: t('about.stats.units'), icon: 'compare' },
  { value: String(brandConfig.stats.inspectionPoints), label: t('about.stats.checks'), icon: 'gauge' },
])
</script>

<template>
  <div>
    <PageHero
      :eyebrow="$t('about.hero.eyebrow')"
      :title="$t('about.hero.title')"
      :lead="$t('about.hero.lead')"
      image="/editorial/atelier.jpg"
    >
      <StatStrip :items="stats" />
    </PageHero>

    <section class="section">
      <div class="container container--wide">
        <div class="about__intro">
          <div class="prose">
            <p>{{ $t('about.intro.p1') }}</p>
            <p>{{ $t('about.intro.p2') }}</p>
            <p>{{ $t('about.intro.p3') }}</p>
          </div>
          <aside class="about__card">
            <h2 class="about__card-title">{{ $t('about.principles.title') }}</h2>
            <ul class="about__principles">
              <li v-for="key in ['transparency', 'condition', 'documents', 'noPressure']" :key="key">
                <BaseIcon name="check" :size="16" />
                <span>
                  <strong>{{ $t(`about.principles.${key}.title`) }}</strong>
                  {{ $t(`about.principles.${key}.body`) }}
                </span>
              </li>
            </ul>
            <DemoNotice tone="panel" />
          </aside>
        </div>
      </div>
    </section>

    <section class="section section--raised">
      <div class="container container--wide">
        <SectionHeading :eyebrow="$t('about.timeline.eyebrow')" :title="$t('about.timeline.title')" :lead="$t('about.timeline.lead')" />
        <ol class="timeline">
          <li
            v-for="(item, index) in milestones"
            :key="item.id"
            :ref="observe"
            class="timeline__item reveal"
            :style="{ '--reveal-delay': `${index * 80}ms` }"
          >
            <span class="timeline__year numeric">{{ item.year }}</span>
            <h3 class="timeline__title">{{ $t(`about.timeline.items.${item.id}.title`) }}</h3>
            <p class="timeline__body">{{ $t(`about.timeline.items.${item.id}.body`) }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="section">
      <div class="container container--wide">
        <EditorialSplit id="prep" image="/editorial/heritage.jpg" scope="about.editorial">
          <BaseButton variant="ghost" size="md" icon="arrowRight" :to="localePath('inventory')">
            {{ $t('cta.browseInventory') }}
          </BaseButton>
        </EditorialSplit>
      </div>
    </section>

    <section class="section section--raised">
      <div class="container container--wide">
        <SectionHeading :eyebrow="$t('about.team.eyebrow')" :title="$t('about.team.title')" :lead="$t('about.team.lead')" />
        <div class="about__contact">
          <ContactChannels />
        </div>
      </div>
    </section>

    <CtaBand />
  </div>
</template>

<style scoped lang="scss">
.about__intro {
  display: grid;
  gap: $space-6;

  @include from($bp-lg) {
    grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.9fr);
    gap: $space-7;
  }
}

.about__card {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5;
  @include panel($carbon-850, 22px);
  align-self: start;
}

.about__card-title {
  @include eyebrow;
  font-size: 0.7rem;
  color: $chalk;
}

.about__principles {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  font-size: 0.9rem;
  color: $titanium;

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

  strong {
    display: block;
    color: $chalk;
    font-family: $font-display;
    font-size: 0.86rem;
    letter-spacing: 0.04em;
  }
}

.timeline {
  display: grid;
  gap: $space-5;

  @include from($bp-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include from($bp-lg) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: $space-4;
  }
}

.timeline__item {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  padding-top: $space-4;
  border-top: 1px solid $carbon-700;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 0;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: $volt;
    box-shadow: 0 0 0 4px rgba($volt, 0.14);
  }
}

.timeline__year {
  font-size: 1.15rem;
  font-weight: $fw-bold;
  color: $volt;
}

.timeline__title {
  font-size: 1rem;
  text-transform: none;
}

.timeline__body {
  font-size: 0.88rem;
  color: $titanium;
}

.about__contact {
  max-width: 900px;
}
</style>
