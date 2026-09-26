export const RANKS = ['A','K','Q','J','T','9','8','7','6','5','4','3','2'] as const
export type Rank = (typeof RANKS)[number]
export const SUITS = ['s','h','d','c'] as const
export type Suit = (typeof SUITS)[number]

export const SUIT_GLYPH: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }
export const SUIT_NAME: Record<Suit, string> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }
/** Four-colour deck: keeps diamonds and hearts distinguishable at small sizes. */
export const SUIT_COLOR: Record<Suit, string> = { s: 'var(--card-ink)', h: '#B3261E', d: '#1B5FA8', c: '#1E6B41' }

export const rankIndex = (r: string) => RANKS.indexOf(r as Rank)

export interface Card { rank: Rank; suit: Suit; code: string }

/** Parse "As" / "Th" / "9c". Returns null for anything unparseable. */
export function parseCard(code: string): Card | null {
  if (!code || code.length < 2) return null
  const rank = code[0].toUpperCase() as Rank
  const suit = code[1].toLowerCase() as Suit
  if (!RANKS.includes(rank) || !SUITS.includes(suit)) return null
  return { rank, suit, code: rank + suit }
}
export const parseCards = (codes: string[]): Card[] =>
  codes.map(parseCard).filter((c): c is Card => c !== null)

// ---------------------------------------------------------------------------
// 13 x 13 starting-hand grid
// ---------------------------------------------------------------------------

export type HandClass = 'pair' | 'suited' | 'offsuit'
export interface GridHand { label: string; row: number; col: number; cls: HandClass }

/** The canonical grid: pairs on the diagonal, suited above, offsuit below. */
export function buildGrid(): GridHand[] {
  const out: GridHand[] = []
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      const hi = RANKS[Math.min(row, col)]
      const lo = RANKS[Math.max(row, col)]
      if (row === col) out.push({ label: `${hi}${hi}`, row, col, cls: 'pair' })
      else if (col > row) out.push({ label: `${hi}${lo}s`, row, col, cls: 'suited' })
      else out.push({ label: `${hi}${lo}o`, row, col, cls: 'offsuit' })
    }
  }
  return out
}
export const GRID = buildGrid()

/** Number of 4-suit combinations each grid cell represents. */
export const comboCount = (cls: HandClass) => (cls === 'pair' ? 6 : cls === 'suited' ? 4 : 12)
export const TOTAL_COMBOS = 1326

/**
 * Expand range notation into explicit hand labels.
 * Supports: "AA", "AKs", "77+", "ATs+", "A5s-A2s", "T9s-54s".
 */
export function expandRange(notation: string[]): Set<string> {
  const out = new Set<string>()
  for (const raw of notation) {
    const token = raw.trim()
    if (!token) continue

    // Pair-plus: "77+"
    let m = /^([AKQJT2-9])\1\+$/.exec(token)
    if (m) {
      for (let i = rankIndex(m[1]); i >= 0; i--) out.add(RANKS[i] + RANKS[i])
      continue
    }
    // Pair range: "22-55"
    m = /^([AKQJT2-9])\1-([AKQJT2-9])\2$/.exec(token)
    if (m) {
      const a = rankIndex(m[1]), b = rankIndex(m[2])
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.add(RANKS[i] + RANKS[i])
      continue
    }
    // Suited/offsuit plus: "ATs+" — walk the kicker up toward the high card
    m = /^([AKQJT2-9])([AKQJT2-9])([so])\+$/.exec(token)
    if (m) {
      const hi = rankIndex(m[1])
      for (let k = rankIndex(m[2]); k > hi; k--) out.add(m[1] + RANKS[k] + m[3])
      continue
    }
    // Explicit span: "A5s-A2s" or connector run "T9s-54s"
    m = /^([AKQJT2-9])([AKQJT2-9])([so])-([AKQJT2-9])([AKQJT2-9])\3$/.exec(token)
    if (m) {
      const [, h1, k1, sfx, h2, k2] = m
      if (h1 === h2) {
        const a = rankIndex(k1), b = rankIndex(k2)
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.add(h1 + RANKS[i] + sfx)
      } else {
        // Diagonal run: both ranks step together, e.g. T9s down to 54s
        const gap = rankIndex(k1) - rankIndex(h1)
        const from = Math.min(rankIndex(h1), rankIndex(h2))
        const to = Math.max(rankIndex(h1), rankIndex(h2))
        for (let i = from; i <= to; i++) {
          const k = i + gap
          if (k < 13) out.add(RANKS[i] + RANKS[k] + sfx)
        }
      }
      continue
    }
    // Single hand
    if (/^([AKQJT2-9])([AKQJT2-9])([so])?$/.test(token)) { out.add(token); continue }
  }
  return out
}

/** Ranks present in a stripped deck, high to low. */
export const deckRanks = (deckSize: number): Rank[] =>
  deckSize === 36 ? (RANKS.slice(0, 9) as Rank[]) : [...RANKS]

/** Total two-card combinations in a deck of `deckSize` cards. */
export const totalCombos = (deckSize = 52) => (deckSize * (deckSize - 1)) / 2

/**
 * What fraction of all starting combinations a range covers.
 * Pass deckSize 36 for Short Deck, where the denominator is 630, not 1,326.
 */
export function rangePercent(hands: Set<string>, deckSize = 52): number {
  const live = new Set(deckRanks(deckSize))
  let combos = 0
  for (const h of hands) {
    if (!live.has(h[0] as Rank) || !live.has(h[1] as Rank)) continue
    if (h.length === 2) combos += 6
    else combos += h.endsWith('s') ? 4 : 12
  }
  return (combos / totalCombos(deckSize)) * 100
}

// ---------------------------------------------------------------------------
// Odds and equity
// ---------------------------------------------------------------------------

/** Chance of hitting at least one out, from the flop (2 cards to come). */
export function equityFromFlop(outs: number): number {
  const miss = ((47 - outs) / 47) * ((46 - outs) / 46)
  return (1 - miss) * 100
}
/** Chance of hitting an out on the river (1 card to come). */
export const equityFromTurn = (outs: number): number => (outs / 46) * 100

/** Equity needed to call: cost / (pot + cost). */
export const potOddsNeeded = (pot: number, cost: number): number => (cost / (pot + cost)) * 100

/** How often a bluff must succeed to break even: risk / (risk + reward). */
export const bluffBreakEven = (bet: number, pot: number): number => (bet / (bet + pot)) * 100

/** Minimum defence frequency against a bet of `bet` into `pot`. */
export const minDefenceFrequency = (bet: number, pot: number): number => (pot / (pot + bet)) * 100

/**
 * Balanced bluff share of a river betting range for a bet of size s (fraction
 * of pot): s / (1 + 2s). A pot-sized bet supports 1/3 bluffs.
 */
export const balancedBluffShare = (sizing: number): number => (sizing / (1 + 2 * sizing)) * 100

/** Common draw types, with outs counted from the flop. */
export const DRAWS = [
  { name: 'Gutshot straight draw', outs: 4 },
  { name: 'Two overcards', outs: 6 },
  { name: 'Open-ended straight draw', outs: 8 },
  { name: 'Flush draw', outs: 9 },
  { name: 'Flush draw + gutshot', outs: 12 },
  { name: 'Open-ended + two overcards', outs: 14 },
  { name: 'Flush draw + open-ended', outs: 15 },
] as const

export const fmtPct = (n: number, dp = 1) => `${n.toFixed(dp)}%`
export const fmtOdds = (pct: number) => {
  if (pct <= 0) return '—'
  const against = (100 - pct) / pct
  return `${against.toFixed(1)} : 1`
}
