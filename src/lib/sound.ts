/**
 * Synthesised table sounds — a card landing on felt and a chip clack.
 *
 * Everything is generated with Web Audio rather than shipped as files: two
 * short sounds are not worth a network request, and synthesis lets each hit
 * vary slightly so a twelve-card deal does not sound like a machine gun.
 *
 * Muted by default. Browsers block audio before a user gesture anyway, so the
 * context is created lazily on the first deliberate play.
 */
let ctx: AudioContext | null = null
let muted = true
let lastPlay = 0

export function setMuted(v: boolean) {
  muted = v
  if (!v) ensureContext()
}

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    try { ctx = new AC() } catch { return null }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Short burst of filtered noise — a card sliding onto felt. */
export function playCard(gain = 0.05) {
  if (muted) return
  const c = ensureContext()
  if (!c) return
  // Rate-limit so a full deal is a rustle, not a rattle.
  const now = performance.now()
  if (now - lastPlay < 38) return
  lastPlay = now

  const dur = 0.09
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    // Decaying noise: loud at the moment of contact, gone almost immediately.
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.5)
  }
  const src = c.createBufferSource()
  src.buffer = buf

  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1600 + Math.random() * 900
  bp.Q.value = 0.8

  const g = c.createGain()
  g.gain.value = gain

  src.connect(bp).connect(g).connect(c.destination)
  src.start()
}

/** Clay-on-clay click with a touch of resonance — a chip landing on a stack. */
export function playChip(gain = 0.06) {
  if (muted) return
  const c = ensureContext()
  if (!c) return

  const t = c.currentTime
  const osc = c.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(2100 + Math.random() * 400, t)
  osc.frequency.exponentialRampToValueAtTime(700, t + 0.045)

  const g = c.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075)

  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 500

  osc.connect(hp).connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + 0.08)
}
