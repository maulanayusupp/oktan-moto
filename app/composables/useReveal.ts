// =============================================================================
// Scroll reveal. One shared IntersectionObserver adds `.reveal--in` when an
// element enters the viewport; the transition itself lives in base.scss so no
// animation is defined inline. Honours prefers-reduced-motion (elements are
// simply shown) and degrades to "visible" if IntersectionObserver is missing.
// =============================================================================

export function useReveal(options: { threshold?: number; once?: boolean } = {}) {
  const { threshold = 0.16, once = true } = options
  const targets = new Set<Element>()
  let observer: IntersectionObserver | null = null

  const reveal = (el: Element) => el.classList.add('reveal--in')

  onMounted(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      targets.forEach(reveal)
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          reveal(entry.target)
          if (once) observer?.unobserve(entry.target)
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )

    targets.forEach((el) => observer?.observe(el))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    targets.clear()
  })

  /** Template ref callback: `:ref="observe"` on any element with `.reveal`. */
  const observe = (el: Element | ComponentPublicInstance | null) => {
    if (!el) return
    const node = (el as ComponentPublicInstance).$el ?? el
    if (!(node instanceof Element) || targets.has(node)) return
    targets.add(node)
    observer?.observe(node)
  }

  return { observe }
}
