// =============================================================================
// Thin composable over enquiry.service: resolves the showroom address from
// runtimeConfig and the localised `mail.*` templates from i18n, so components
// never assemble a mailto: by hand.
// =============================================================================
import {
  bikeEnquiryLink,
  compareEnquiryLink,
  contactEnquiryLink,
  generalEnquiryLink,
  type MailTemplate,
} from '~/services/enquiry.service'
import type { BikeView, ContactDraft } from '~/types'

export function useEnquiry() {
  const { t, locale } = useI18n()
  const config = useRuntimeConfig()

  const email = computed(() => String(config.public.contactEmail))

  const template = (name: 'general' | 'bike' | 'compare' | 'contact'): MailTemplate => ({
    subject: t(`mail.${name}.subject`),
    body: t(`mail.${name}.body`),
  })

  return {
    email,

    /** Generic enquiry — header, footer, floating action, CTA band. */
    general: computed(() => generalEnquiryLink(email.value, template('general'))),

    /** Enquiry about one unit; `url` should be absolute. */
    forBike: (bike: BikeView, url: string) =>
      bikeEnquiryLink({ email: email.value, bike, url, locale: locale.value, template: template('bike') }),

    /** Enquiry covering every unit in the compare tray. */
    forCompare: (bikes: BikeView[]) =>
      compareEnquiryLink(email.value, bikes, template('compare'), locale.value),

    /** Contact-form draft turned into a ready-to-send e-mail. */
    forContact: (draft: ContactDraft) => contactEnquiryLink(email.value, draft, template('contact')),
  }
}
