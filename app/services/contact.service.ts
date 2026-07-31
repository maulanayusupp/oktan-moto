// =============================================================================
// Contact-form validation. Returns i18n keys rather than sentences so the same
// rules serve both locales; the component renders whatever key comes back.
//
// There is no server endpoint by design: the form composes a mailto: draft.
// Nothing is transmitted to us until the visitor presses send in their own mail
// client — stated on the form and in the privacy notice.
//
// E-mail is the only contact channel, so it is required; a phone number is
// optional and only validated when the visitor fills it in.
// =============================================================================
import type { ContactDraft, ContactErrors } from '~/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

/** Digits only, so `+62 812-3456-7890` and `0812 3456 7890` both validate. */
function digits(raw: string): string {
  return raw.replace(/\D/g, '')
}

export function emptyDraft(): ContactDraft {
  return { name: '', phone: '', email: '', interest: '', message: '' }
}

export function validateDraft(draft: ContactDraft): ContactErrors {
  const errors: ContactErrors = {}

  if (draft.name.trim().length < 2) errors.name = 'contact.errors.name'

  if (!EMAIL_RE.test(draft.email.trim())) errors.email = 'contact.errors.email'

  // Optional: only checked when something was typed. 9–15 digits covers
  // Indonesian mobile and landline numbers with or without a country prefix.
  const phone = digits(draft.phone)
  if (phone.length > 0 && (phone.length < 9 || phone.length > 15)) {
    errors.phone = 'contact.errors.phone'
  }

  if (draft.message.trim().length < 10) errors.message = 'contact.errors.message'

  return errors
}

export function isValid(errors: ContactErrors): boolean {
  return Object.keys(errors).length === 0
}
