// =============================================================================
// Editorial structure for the marketing sections: which blocks exist, in what
// order, with which icon and image. Every string is an i18n key — swapping copy
// or adding a locale never means touching this file's shape.
// =============================================================================

/** "Why OKTAN" grid on the home page; copy at `home.values.<id>.{title,body}`. */
export const valueProps: readonly { id: string; icon: string }[] = [
  { id: 'inspection', icon: 'gauge' },
  { id: 'history', icon: 'document' },
  { id: 'pricing', icon: 'tag' },
  { id: 'paperwork', icon: 'shield' },
  { id: 'delivery', icon: 'truck' },
  { id: 'aftercare', icon: 'wrench' },
]

/** Buying journey — four steps, WhatsApp-first (big-ticket, no online cart). */
export const processSteps: readonly { id: string; index: string }[] = [
  { id: 'browse', index: '01' },
  { id: 'inspect', index: '02' },
  { id: 'agree', index: '03' },
  { id: 'handover', index: '04' },
]

/** Segment shortcuts shown on the home page and inventory header. */
export const categoryCards: readonly { id: string; image: string }[] = [
  { id: 'supersport', image: '/bikes/ducati-panigale-v4r-1-sm.jpg' },
  { id: 'naked', image: '/bikes/ktm-1290-super-duke-r-1-sm.jpg' },
  { id: 'sport-touring', image: '/bikes/ducati-multistrada-v4s-1-sm.jpg' },
  { id: 'heritage', image: '/bikes/kawasaki-z900rs-1-sm.jpg' },
]

/** Editorial split blocks: id → image (copy comes from i18n). */
export const editorialBlocks: readonly { id: string; image: string; reverse?: boolean }[] = [
  { id: 'workshop', image: '/editorial/chassis.jpg' },
  { id: 'ride', image: '/editorial/apex-rider.jpg', reverse: true },
]

/** Sample testimonials — clearly labelled as illustrative on the page. */
export const testimonials: readonly { id: string; city: string }[] = [
  { id: 't1', city: 'Jakarta' },
  { id: 't2', city: 'Bandung' },
  { id: 't3', city: 'Surabaya' },
]

/** FAQ order; each id maps to `faq.items.<id>.{q,a}` and feeds FAQPage JSON-LD. */
export const faqIds: readonly string[] = [
  'inspection',
  'documents',
  'testRide',
  'financing',
  'delivery',
  'tradeIn',
  'warranty',
  'foreignBuyer',
]

/** Company timeline on the About page (years are illustrative). */
export const milestones: readonly { id: string; year: string }[] = [
  { id: 'start', year: '2019' },
  { id: 'workshop', year: '2021' },
  { id: 'network', year: '2023' },
  { id: 'digital', year: '2026' },
]

/** Livery options for the interactive 3D showcase (hex is used by WebGL). */
export const liveries: readonly { id: string; paint: string; accent: string }[] = [
  { id: 'ignition', paint: '#ff4a17', accent: '#ffb199' },
  { id: 'volt', paint: '#d4ff4f', accent: '#f2ffc4' },
  { id: 'coolant', paint: '#3fd8e8', accent: '#c9f7fc' },
  { id: 'carbon', paint: '#1b1f26', accent: '#5b6472' },
]
