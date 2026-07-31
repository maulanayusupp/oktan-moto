// =============================================================================
// Enquiry service — e-mail is the only contact channel on this site.
//
// Big-ticket machines are not bought through a cart, so every commerce action
// opens a pre-filled, localised e-mail draft (`mailto:`) instead. Nothing is
// posted to a server: the draft opens in the visitor's own mail client and only
// leaves their device when they press send.
//
// Subject/body templates live in i18n under `mail.*` and use %token%
// placeholders — NOT vue-i18n's `{}`, which the message compiler would try to
// interpolate before the service could fill it.
// =============================================================================
import type { BikeView, ContactDraft } from '~/types'
import { formatIdrExact, formatKm } from '~/utils/format'

export interface MailTemplate {
  subject: string
  body: string
}

function fill(template: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce(
    (text, [token, value]) => text.replaceAll(`%${token}%`, value),
    template,
  )
}

/** Builds a `mailto:` URL. Newlines survive as %0A after encoding. */
export function mailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Generic "talk to us" draft used by the header, footer and floating action. */
export function generalEnquiryLink(email: string, template: MailTemplate): string {
  return mailtoLink(email, template.subject, template.body)
}

interface BikeEnquiryInput {
  email: string
  bike: BikeView
  /** Absolute URL of the unit page, so the reply thread has the listing. */
  url: string
  locale: string
  template: MailTemplate
}

/** Pre-filled enquiry for one unit: model, year, price, mileage and the URL. */
export function bikeEnquiryLink({ email, bike, url, locale, template }: BikeEnquiryInput): string {
  const tokens = {
    unit: `${bike.make} ${bike.model}`,
    year: String(bike.year),
    price: formatIdrExact(bike.priceIdr, locale),
    mileage: formatKm(bike.mileageKm, locale),
    url,
  }
  return mailtoLink(email, fill(template.subject, tokens), fill(template.body, tokens))
}

/** Compare-tray handoff: asks about several units in one message. */
export function compareEnquiryLink(
  email: string,
  bikes: BikeView[],
  template: MailTemplate,
  locale: string,
): string {
  const list = bikes
    .map(
      (bike, index) =>
        `${index + 1}. ${bike.make} ${bike.model} (${bike.year}) — ${formatIdrExact(bike.priceIdr, locale)}`,
    )
    .join('\n')
  return mailtoLink(email, template.subject, fill(template.body, { list }))
}

/** Contact-form handoff: the visitor's draft becomes a ready-to-send e-mail. */
export function contactEnquiryLink(
  email: string,
  draft: ContactDraft,
  template: MailTemplate,
): string {
  const tokens = {
    name: draft.name.trim(),
    phone: draft.phone.trim() || '-',
    email: draft.email.trim() || '-',
    interest: draft.interest.trim() || '-',
    message: draft.message.trim(),
  }
  return mailtoLink(email, fill(template.subject, tokens), fill(template.body, tokens))
}
