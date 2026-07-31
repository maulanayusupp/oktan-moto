<script setup lang="ts">
// Contact form with a deliberate no-server design: on submit the draft becomes a
// pre-filled WhatsApp message (or e-mail draft) that the visitor sends from
// their own app. Nothing is posted anywhere, which is exactly what the privacy
// notice says — and it means no data sits on a server we do not operate.
import { emptyDraft, isValid, validateDraft } from '~/services/contact.service'
import { contactEnquiryLink, mailtoLink } from '~/services/whatsapp.service'
import type { ContactErrors } from '~/types'

const { t } = useI18n()
const config = useRuntimeConfig()

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

function onSubmit() {
  submitted.value = true
  errors.value = validateDraft(draft.value)
  if (!isValid(errors.value)) {
    // Move focus to the first invalid control for keyboard/screen-reader users.
    const first = Object.keys(errors.value)[0]
    if (first && import.meta.client) document.getElementById(`contact-${first}`)?.focus()
    return
  }

  const href = contactEnquiryLink(
    String(config.public.whatsapp),
    draft.value,
    t('wa.enquiry.contact'),
  )
  if (import.meta.client) window.open(href, '_blank', 'noopener,noreferrer')
}

const mailFallback = computed(() =>
  mailtoLink(
    String(config.public.contactEmail),
    t('contact.mail.subject'),
    [
      `${t('contact.form.name')}: ${draft.value.name}`,
      `${t('contact.form.phone')}: ${draft.value.phone}`,
      `${t('contact.form.email')}: ${draft.value.email}`,
      `${t('contact.form.interest')}: ${draft.value.interest}`,
      '',
      draft.value.message,
    ].join('\n'),
  ),
)

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
        id="contact-phone"
        v-model="draft.phone"
        type="tel"
        :label="$t('contact.form.phone')"
        :placeholder="$t('contact.form.phonePlaceholder')"
        :error="errors.phone ? $t(errors.phone) : undefined"
        autocomplete="tel"
        required
      />
      <BaseField
        id="contact-email"
        v-model="draft.email"
        type="email"
        :label="$t('contact.form.email')"
        :placeholder="$t('contact.form.emailPlaceholder')"
        :error="errors.email ? $t(errors.email) : undefined"
        :hint="$t('contact.form.emailHint')"
        autocomplete="email"
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
      <BaseButton type="submit" variant="primary" size="lg" icon="whatsapp" icon-leading>
        {{ $t('contact.form.submit') }}
      </BaseButton>
      <BaseButton variant="ghost" size="lg" icon="mail" icon-leading :href="mailFallback">
        {{ $t('contact.form.emailInstead') }}
      </BaseButton>
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
  gap: $space-3;
}
</style>
