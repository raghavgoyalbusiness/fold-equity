import type { DealPlan, Stage } from '../data/types'
import { RANKS, SUITS } from '../lib/poker'

export interface StageStep { key: Stage; label: string; note: string }

export interface CardSlot {
  id: string
  /** Card code, or null when the card is face down and unknown to the viewer. */
  code: string | null
  pos: [number, number, number]
  rot: [number, number, number]
  faceUp: boolean
  /** Seconds to wait before this card flies in. */
  delay: number
  role: 'hole' | 'board' | 'up' | 'row' | 'discard'
  seat?: number
  tooltip: string
}

export const TABLE_RX = 4.15
export const TABLE_RZ = 2.55
const SEAT_INSET = 0.78
export const DECK_ORIGIN: [number, number, number] = [0, 0.42, -0.05]

/** Seat 0 sits nearest the camera; seats run clockwise from there. */
export function seatAngle(i: number, n: number): number {
  return Math.PI / 2 + (i / n) * Math.PI * 2
}
export function seatPos(i: number, n: number, inset = SEAT_INSET): [number, number] {
  const a = seatAngle(i, n)
  return [(TABLE_RX - inset) * Math.cos(a), (TABLE_RZ - inset) * Math.sin(a)]
}

// ---------------------------------------------------------------------------
// Deterministic sample deal — the same game always shows the same cards, so
// screenshots, quizzes and the annotation panel stay in sync.
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

/** A shuffled deck, optionally stripped for short-deck games. */
export function sampleDeck(seed: string, lowestRankIndex = 12): string[] {
  const rnd = mulberry32(hashSeed(seed))
  const deck: string[] = []
  for (let r = 0; r <= lowestRankIndex; r++) for (const s of SUITS) deck.push(RANKS[r] + s)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

// ---------------------------------------------------------------------------
// Stage sequence
// ---------------------------------------------------------------------------

const BOARD_LABELS = ['Flop', 'Turn', 'River', 'Fifth card', 'Sixth card']
const STUD_STAGES: Stage[] = ['third', 'fourth', 'fifth', 'sixth', 'seventh']
const STUD_LABELS = ['Third street', 'Fourth street', 'Fifth street', 'Sixth street', 'Seventh street']

export function stagesFor(deal: DealPlan): StageStep[] {
  // Draw games
  if (deal.draws) {
    const out: StageStep[] = [{ key: 'deal', label: 'The deal', note: 'Cards down, first betting round.' }]
    const keys: Stage[] = ['draw1', 'draw2', 'draw3']
    for (let i = 0; i < Math.min(deal.draws, 3); i++)
      out.push({ key: keys[i], label: `Draw ${i + 1}`, note: 'Discards fly off-table; replacements arrive.' })
    out.push({ key: 'showdown', label: 'Showdown', note: 'Hands are compared.' })
    return out
  }
  // Chinese / OFC
  if (deal.rows) {
    return [
      { key: 'deal', label: 'The deal', note: 'Cards arrive.' },
      { key: 'set', label: 'Set the rows', note: 'Back, middle and front are arranged.' },
      { key: 'reveal', label: 'Reveal', note: 'Rows are turned face up.' },
      { key: 'showdown', label: 'Scoring', note: 'Rows are compared one by one.' },
    ]
  }
  // Stud
  if (deal.faceUp?.length) {
    const out: StageStep[] = []
    const n = Math.min(deal.hole, 7)
    for (let i = 0; i < Math.min(n - 2, 5); i++)
      out.push({ key: STUD_STAGES[i], label: STUD_LABELS[i], note: 'A card, then a betting round.' })
    out.push({ key: 'showdown', label: 'Showdown', note: 'Best five of seven.' })
    return out
  }
  // Community-card games
  const out: StageStep[] = [{ key: 'preflop', label: 'Preflop', note: 'Hole cards and the first betting round.' }]
  const chunks = deal.board ?? [3, 1, 1]
  const keys: Stage[] = ['flop', 'turn', 'river', 'showdown', 'showdown']
  chunks.forEach((_, i) => {
    out.push({ key: keys[Math.min(i, 2)], label: BOARD_LABELS[i] ?? `Card ${i + 1}`, note: 'Community card, then betting.' })
  })
  out.push({ key: 'showdown', label: 'Showdown', note: 'Hands are compared.' })
  return out
}

// ---------------------------------------------------------------------------
// Slot layout
// ---------------------------------------------------------------------------

const CARD_W = 0.42
const TABLE_Y = 0.252 // just proud of the felt top (0.24) — below it the cards vanish inside the felt

interface BuildOpts {
  deal: DealPlan
  seed: string
  /** How many stages into the sequence we are (0-based). */
  stageIndex: number
  /** Reveal seat 0's cards. Off for the ambient hero loop. */
  showHero?: boolean
  /** Reveal every player's hole cards (showdown / teaching). */
  showAll?: boolean
  shortDeck?: boolean
  /** Replace seat 0's sampled hole cards with these specific cards. */
  heroCards?: string[]
  /** Replace the sampled community cards with these specific cards. */
  boardCards?: string[]
}

/** Index into stagesFor(deal) for a named stage. Falls back to the last. */
export function stageIndexFor(deal: DealPlan, stage: Stage): number {
  const stages = stagesFor(deal)
  const i = stages.findIndex((s) => s.key === stage)
  return i === -1 ? stages.length - 1 : i
}

export function buildSlots(opts: BuildOpts): CardSlot[] {
  const { deal, seed, stageIndex, showHero = true, showAll = false, shortDeck = false,
          heroCards, boardCards } = opts
  const deck = sampleDeck(seed, shortDeck ? 8 : 12)
  const stages = stagesFor(deal)
  const stage = stages[Math.min(stageIndex, stages.length - 1)]
  const seats = Math.max(2, Math.min(deal.seats, 9))
  const slots: CardSlot[] = []
  let d = 0 // deck cursor
  let delay = 0
  const step = 0.11

  const isShowdown = stage.key === 'showdown'

  // ---- Chinese / OFC: rows in front of each seat -------------------------
  if (deal.rows) {
    const rows = deal.rows
    for (let s = 0; s < seats; s++) {
      const [sx, sz] = seatPos(s, seats, 1.15)
      const a = seatAngle(s, seats)
      const faceCam = -a + Math.PI / 2
      rows.forEach((count, ri) => {
        for (let c = 0; c < count; c++) {
          const off = (c - (count - 1) / 2) * (CARD_W + 0.035)
          const depth = (ri - (rows.length - 1) / 2) * 0.60
          const x = sx + off * Math.cos(faceCam) - depth * Math.sin(faceCam)
          const z = sz + off * Math.sin(faceCam) + depth * Math.cos(faceCam)
          const code = deck[d++]
          const up = stageIndex >= 2 || (s === 0 && showHero && stageIndex >= 1)
          slots.push({
            id: `row-${s}-${ri}-${c}`,
            code: up ? code : null,
            pos: [x, TABLE_Y, z],
            rot: [-Math.PI / 2, 0, -faceCam],
            faceUp: up,
            delay: (delay += step * 0.5),
            role: 'row',
            seat: s,
            tooltip: `${['Front (3 cards)', 'Middle (5 cards)', 'Back (5 cards)'][ri] ?? `Row ${ri + 1}`} — seat ${s + 1}. The back must beat the middle, and the middle must beat the front.`,
          })
        }
      })
    }
    return slots
  }

  // ---- Hole cards (and Stud up-cards) ------------------------------------
  const holeCount = Math.min(deal.hole, 7)
  const isStud = !!deal.faceUp?.length
  // In stud, only cards up to the current street exist.
  const dealtPerSeat = isStud ? Math.min(holeCount, stageIndex + 3) : holeCount

  for (let c = 0; c < dealtPerSeat; c++) {
    for (let s = 0; s < seats; s++) {
      const [sx, sz] = seatPos(s, seats)
      const a = seatAngle(s, seats)
      const faceCam = -a + Math.PI / 2
      const spread = CARD_W * 0.62
      const off = (c - (dealtPerSeat - 1) / 2) * spread
      const x = sx + off * Math.cos(faceCam)
      const z = sz + off * Math.sin(faceCam)
      const sampled = deck[d++]
      // A scenario or analysed hand can pin the hero's exact cards.
      const code = s === 0 && heroCards?.[c] ? heroCards[c] : sampled

      const studUp = isStud && (deal.faceUp ?? []).includes(c + 1)
      const heroVisible = s === 0 && showHero
      const up = studUp || showAll || isShowdown || heroVisible

      slots.push({
        id: `hole-${s}-${c}`,
        code: up ? code : null,
        pos: [x, TABLE_Y + (studUp ? 0.004 : 0), z],
        rot: [-Math.PI / 2, 0, -faceCam + (up ? 0 : 0)],
        faceUp: up,
        delay: (delay += step),
        role: studUp ? 'up' : 'hole',
        seat: s,
        tooltip: studUp
          ? `Seat ${s + 1}, up-card ${c + 1}. Exposed cards are public information — tracking which ranks are already dead is the core skill in Stud.`
          : s === 0
            ? `Your hole card ${c + 1} of ${holeCount}. ${deal.note ?? 'Private to you.'}`
            : `Seat ${s + 1} hole card — face down. You never see this until showdown.`,
      })
    }
  }

  // ---- Discards (draw games) ---------------------------------------------
  if (deal.draws && stageIndex >= 1 && !isShowdown) {
    const discards = Math.min(2, stageIndex)
    for (let i = 0; i < discards; i++) {
      slots.push({
        id: `discard-${i}`,
        code: null,
        pos: [TABLE_RX + 0.95 + i * 0.16, TABLE_Y + i * 0.012, TABLE_RZ * 0.5 + i * 0.1],
        rot: [-Math.PI / 2, 0, 0.5 + i * 0.3],
        faceUp: false,
        delay: (delay += step),
        role: 'discard',
        tooltip: 'Discarded card. In draw games the number of cards each player throws away is the only public information there is — watch it every hand.',
      })
    }
  }

  // ---- Community board(s) -------------------------------------------------
  if (deal.board?.length) {
    const boards = deal.boards ?? 1
    const chunks = deal.board
    const revealed = Math.max(0, Math.min(stageIndex, chunks.length))
    const total = chunks.reduce((a, b) => a + b, 0)

    for (let b = 0; b < boards; b++) {
      const zRow = boards === 1 ? 0 : (b - (boards - 1) / 2) * 0.82
      let idx = 0
      for (let ci = 0; ci < chunks.length; ci++) {
        const live = isShowdown || ci < revealed
        for (let k = 0; k < chunks[ci]; k++) {
          const off = (idx - (total - 1) / 2) * (CARD_W + 0.09)
          const sampled = deck[d++]
          const code = boards === 1 && boardCards?.[idx] ? boardCards[idx] : sampled
          if (live) {
            slots.push({
              id: `board-${b}-${idx}`,
              code,
              pos: [off, TABLE_Y, zRow],
              rot: [-Math.PI / 2, 0, 0],
              faceUp: true,
              delay: (delay += step),
              role: 'board',
              tooltip: `${BOARD_LABELS[ci] ?? 'Community card'}${boards > 1 ? ` · board ${b + 1}` : ''} — shared by every player.${boards > 1 ? ' Each board is worth half the pot.' : ''}`,
            })
          }
          idx++
        }
      }
    }
  }

  return slots
}

/** Chip stacks at each seat, scaled so the HUD reads as a real table. */
export function chipStacks(seats: number): { seat: number; pos: [number, number]; count: number; color: string; label: string }[] {
  const palette = [
    { color: '#B3261E', label: '5' },
    { color: '#1B4E7A', label: '10' },
    { color: '#1E6B41', label: '25' },
    { color: '#3B3B40', label: '100' },
  ]
  return Array.from({ length: seats }, (_, s) => {
    const [x, z] = seatPos(s, seats, 0.28)
    const p = palette[s % palette.length]
    return { seat: s, pos: [x, z] as [number, number], count: 4 + ((s * 3) % 7), color: p.color, label: p.label }
  })
}
