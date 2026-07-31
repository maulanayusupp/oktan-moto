// =============================================================================
// WhatsApp service — the checkout for this showroom.
//
// Big-ticket machines are not bought through a cart, so every commerce action
// ends in a WhatsApp thread with a pre-filled, localised message. Message
// templates live in i18n and use %token% placeholders (NOT vue-i18n's `{}`,
// which the message compiler would try to interpolate itself).
// =============================================================================
import type { BikeView, ContactDraft } from '~/types'
import { formatIdrExact, formatKm } from '~/utils/format'

/** Strips everything but digits: `+62 878-2276-6333` → `6287822766333`. */
export function normalisePhone(raw: string): string {
  return raw.replace(/\D/g, '')
}

function fill(template: string, tokens: Record<string, string>): string {
  return Object.entries(tokens).reduce(
    (text, [token, value]) => text.replaceAll(`%${token}%`, value),
    template,
  )
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${normalisePhone(phone)}?text=${encodeURIComponent(message)}`
}

interface BikeEnquiryInput {
  phone: string
  bike: BikeView
  /** Absolute URL of the unit page so the seller lands on the same listing. */
  url: string
  locale: string
  /** `wa.enquiry.bike` template from i18n. */
  template: string
}

/** Pre-filled enquiry for one unit: model, year, price, mileage and the URL. */
export function bikeEnquiryLink({ phone, bike, url, locale, template }: BikeEnquiryInput): string {
  return waLink(
    phone,
    fill(template, {
      unit: `${bike.make} ${bike.model}`,
      year: String(bike.year),
      price: formatIdrExact(bike.priceIdr, locale),
      mileage: formatKm(bike.mileageKm, locale),
      url,
    }),
  )
}

/** Generic "talk to us" link used by the header, footer and floating button. */
export function generalEnquiryLink(phone: string, template: string): string {
  return waLink(phone, template)
}

/** Contact-form handoff: the visitor's draft becomes a ready-to-send message. */
export function contactEnquiryLink(
  phone: string,
  draft: ContactDraft,
  template: string,
): string {
  return waLink(
    phone,
    fill(template, {
      name: draft.name.trim(),
      phoneNumber: draft.phone.trim() || '-',
      email: draft.email.trim() || '-',
      interest: draft.interest.trim() || '-',
      message: draft.message.trim(),
    }),
  )
}

/** Compare-tray handoff: asks about several units in one message. */
export function compareEnquiryLink(
  phone: string,
  bikes: BikeView[],
  template: string,
  locale: string,
): string {
  const list = bikes
    .map((bike, index) => `${index + 1}. ${bike.make} ${bike.model} (${bike.year}) — ${formatIdrExact(bike.priceIdr, locale)}`)
    .join('\n')
  return waLink(phone, fill(template, { list }))
}

/** `mailto:` fallback for visitors who prefer e-mail (no server involved). */
export function mailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
