<script setup lang="ts">
// Photo credits. Not optional decoration: the gallery photography is used under
// CC BY / CC BY-SA / CC0 / public-domain terms, and the BY variants REQUIRE
// author + licence attribution. The table is generated from
// app/config/photo-credits.json, which `pnpm bikes` writes, so it can never
// fall out of step with the images actually shipped.
import photoCredits from '~/config/photo-credits.json'
import type { PhotoCredit } from '~/types'

const { t } = useI18n()

definePageMeta({ flushHero: true })

usePageSeo(() => ({
  title: t('credits.meta.title'),
  description: t('credits.meta.description'),
  type: 'article',
}))

const items = photoCredits.items as PhotoCredit[]

// Group by source file: one Commons photo can feed several output frames.
const grouped = computed(() => {
  const map = new Map<string, { credit: PhotoCredit; assets: string[] }>()
  for (const item of items) {
    const entry = map.get(item.file)
    if (entry) entry.assets.push(item.asset)
    else map.set(item.file, { credit: item, assets: [item.asset] })
  }
  return [...map.values()]
})

const licences = computed(() => [...new Set(items.map((item) => item.license))].sort())
</script>

<template>
  <div>
    <PageHero
      :eyebrow="$t('credits.hero.eyebrow')"
      :title="$t('credits.hero.title')"
      :lead="$t('credits.hero.lead')"
      image="/editorial/tank-top.jpg"
      compact
    />

    <section class="section">
      <div class="container container--wide credits">
        <div class="prose credits__intro">
          <p>{{ $t('credits.intro') }}</p>
          <p>
            {{ $t('credits.licencesUsed') }}
            <strong>{{ licences.join(' · ') }}</strong>
          </p>
          <p>{{ $t('credits.replaceNote') }}</p>
        </div>

        <div class="credits__scroll">
          <table class="credits__table">
            <caption class="visually-hidden">{{ $t('credits.tableCaption') }}</caption>
            <thead>
              <tr>
                <th scope="col">{{ $t('credits.columns.photo') }}</th>
                <th scope="col">{{ $t('credits.columns.author') }}</th>
                <th scope="col">{{ $t('credits.columns.licence') }}</th>
                <th scope="col">{{ $t('credits.columns.frames') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in grouped" :key="entry.credit.file">
                <th scope="row">
                  <a :href="entry.credit.source" target="_blank" rel="noopener noreferrer nofollow">
                    {{ entry.credit.file }}
                    <BaseIcon name="arrowUpRight" :size="13" />
                  </a>
                </th>
                <td>{{ entry.credit.author }}</td>
                <td>
                  <a
                    v-if="entry.credit.licenseUrl"
                    :href="entry.credit.licenseUrl"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >{{ entry.credit.license }}</a>
                  <span v-else>{{ entry.credit.license }}</span>
                </td>
                <td class="numeric">{{ entry.assets.length }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <DemoNotice tone="panel" message-key="credits.note" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.credits {
  display: flex;
  flex-direction: column;
  gap: $space-5;
}

.credits__intro {
  max-width: 76ch;
}

.credits__scroll {
  overflow-x: auto;
  @include thin-scrollbar;
  @include panel($carbon-900, 0);
  padding: $space-3;
}

.credits__table {
  min-width: 640px;
  font-size: 0.84rem;

  th,
  td {
    padding: $space-2 $space-3;
    text-align: left;
    border-bottom: 1px solid $carbon-800;
    vertical-align: top;
  }

  thead th {
    @include eyebrow;
    font-size: 0.64rem;
    color: $chalk;
    white-space: nowrap;
  }

  tbody th {
    font-family: $font-body;
    font-weight: $fw-regular;
    color: $chalk;
    max-width: 42ch;
  }

  td {
    color: $titanium;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    color: $chalk;
    border-bottom: 1px solid rgba($ignition, 0.5);

    @include hover {
      color: $ignition;
    }

    @include focus-visible;
  }
}
</style>
