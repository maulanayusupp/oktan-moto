// =============================================================================
// Contact-form validation. Returns i18n keys rather than sentences so the same
// rules serve both locales; the component renders whatever key comes back.
//
// There is no server endpoint by design: the form composes a WhatsApp message
// or a mailto: draft. Nothing is transmitted to us until the visitor presses
// send in their own app — stated on the form and in the privacy notice.
// =============================================================================
import type { ContactDraft, ContactErrors } from '~/types'
import { normalisePhone } from '~/services/whatsapp.service'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

export function emptyDraft(): ContactDraft {
  return { name: '', phone: '', email: '', interest: '', message: '' }
}

export function validateDraft(draft: ContactDraft): ContactErrors {
  const errors: ContactErrors = {}

  if (draft.name.trim().length < 2) errors.name = 'contact.errors.name'

  const phone = normalisePhone(draft.phone)
  // Indonesian mobile numbers are 9–15 digits once the prefix is normalised.
  if (phone.length < 9 || phone.length > 15) errors.phone = 'contact.errors.phone'

  if (draft.email.trim() && !EMAIL_RE.test(draft.email.trim())) errors.email = 'contact.errors.email'

  if (draft.message.trim().length < 10) errors.message = 'contact.errors.message'

  return errors
}

export function isValid(errors: ContactErrors): boolean {
  return Object.keys(errors).length === 0
}
