<script setup lang="ts">
// Contact form with a deliberate no-server design: on submit the draft becomes a
// pre-filled e-mail draft that the visitor sends from their own mail client.
// Nothing is posted anywhere, which is exactly what the privacy notice says —
// and it means no data sits on a server we do not operate.
import { emptyDraft, isValid, validateDraft } from '~/services/contact.service'
import type { ContactErrors } from '~/types'

const { t } = useI18n()
const { email, forContact } = useEnquiry()

const draft = ref(emptyDraft())
const errors = ref<ContactErrors>({})
const submitted = ref(false)

const interests = computed(() => [
  { value: '', label: t('contact.form.interestPlaceholder') },
  { value: t('contact.form.interests.buy'), label: t('contact.form.interests.buy') },
  { value: t('contact.form.interests.sell'), label: t('contact.form.interests.sell') },
  { value: t('contact.form.interests.trade'), label: t('contact.form.interests.trade') },
  { value: t('contact.form.interests.service'), label: t('contact.form.interests.service') },
  { value: t('contact.form.interests.other'), label: t('contact.form.interests.other') },
])

// The composed draft, also used as the plain link if JS submission is blocked.
const mailHref = computed(() => forContact(draft.value))

function onSubmit() {
  submitted.value = true
  errors.value = validateDraft(draft.value)
  if (!isValid(errors.value)) {
    // Move focus to the first invalid control for keyboard/screen-reader users.
    const first = Object.keys(errors.value)[0]
    if (first && import.meta.client) document.getElementById(`contact-${first}`)?.focus()
    return
  }
  if (import.meta.client) window.location.href = mailHref.value
}

// Live re-validation once the visitor has attempted a submit.
watch(
  draft,
  () => {
    if (submitted.value) errors.value = validateDraft(draft.value)
  },
  { deep: true },
)
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <div class="form__grid">
      <BaseField
        id="contact-name"
        v-model="draft.name"
        :label="$t('contact.form.name')"
        :placeholder="$t('contact.form.namePlaceholder')"
        :error="errors.name ? $t(errors.name) : undefined"
        autocomplete="name"
        required
      />
      <BaseField
        id="contact-email"
        v-model="draft.email"
        type="email"
        :label="$t('contact.form.email')"
        :placeholder="$t('contact.form.emailPlaceholder')"
        :error="errors.email ? $t(errors.email) : undefined"
        autocomplete="email"
        required
      />
      <BaseField
        id="contact-phone"
        v-model="draft.phone"
        type="tel"
        :label="$t('contact.form.phone')"
        :placeholder="$t('contact.form.phonePlaceholder')"
        :error="errors.phone ? $t(errors.phone) : undefined"
        :hint="$t('contact.form.phoneHint')"
        autocomplete="tel"
      />
      <BaseSelect
        id="contact-interest"
        v-model="draft.interest"
        :label="$t('contact.form.interest')"
        :options="interests"
        icon="compare"
      />
    </div>

    <BaseField
      id="contact-message"
      v-model="draft.message"
      textarea
      :label="$t('contact.form.message')"
      :placeholder="$t('contact.form.messagePlaceholder')"
      :error="errors.message ? $t(errors.message) : undefined"
      required
    />

    <DemoNotice message-key="contact.form.privacyNote" />

    <div class="form__actions">
      <BaseButton type="submit" variant="primary" size="lg" icon="mail" icon-leading>
        {{ $t('contact.form.submit') }}
      </BaseButton>
      <p class="form__address">
        {{ $t('contact.form.orWriteTo') }}
        <a :href="mailHref">{{ email }}</a>
      </p>
    </div>
  </form>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5;
  @include panel($carbon-900, 24px);
}

.form__grid {
  display: grid;
  gap: $space-4;

  @include from($bp-sm) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.form__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-3 $space-4;
}

.form__address {
  font-size: 0.84rem;
  color: $titanium;

  a {
    color: $chalk;
    border-bottom: 1px solid rgba($ignition, 0.6);
    overflow-wrap: anywhere;

    @include hover {
      color: $ignition;
    }

    @include focus-visible;
  }
}
</style>
