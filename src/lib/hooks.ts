import { useEffect, useState, useRef, useCallback } from 'react'

/** True when the user has asked for reduced motion. Live-updates. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/**
 * Whether this device should attempt the full 3D scene.
 * Coarse pointer + narrow viewport, low core count, or no WebGL all opt out.
 */
export function useCanRender3D(): boolean | null {
  const [able, setAble] = useState<boolean | null>(null)
  useEffect(() => {
    let ok = true
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      if (!gl) ok = false
    } catch { ok = false }
    const cores = (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 4
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
    const smallTouch = window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 760
    if (cores <= 2 || mem <= 2 || smallTouch) ok = false
    setAble(ok)
  }, [])
  return able
}

export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [threshold])
  return scrolled
}

/** Counts up to `to` once the element is on screen. Respects reduced motion. */
export function useCountUp(to: number, durationMs = 1400) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  const done = useRef(false)

  const attach = useCallback((node: HTMLElement | null) => { ref.current = node }, [])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduced) { setValue(to); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return
      done.current = true
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        // ease-out cubic
        setValue(Math.round(to * (1 - Math.pow(1 - t, 3))))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(node)
    return () => io.disconnect()
  }, [to, durationMs, reduced])

  return { value, attach }
}

/**
 * True once the element has come near the viewport, and stays true.
 * Used to defer mounting WebGL contexts — a page with five tables would
 * otherwise hold five live contexts from first paint.
 */
export function useNearViewport<T extends HTMLElement>(rootMargin = '300px') {
  const [near, setNear] = useState(false)
  const ref = useRef<T | null>(null)

  const attach = useCallback((node: T | null) => {
    ref.current = node
    if (!node || near) return
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNear(true); io.disconnect() }
    }, { rootMargin })
    io.observe(node)
  }, [near, rootMargin])

  return { near, attach }
}
