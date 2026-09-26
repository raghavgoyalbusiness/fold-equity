import { expandRange } from '../lib/poker'

export interface RangeDef {
  id: string
  position: string
  action: string
  gameSlug: string
  gameLabel: string
  note: string
  /** 52 for a full deck, 36 for Short Deck — changes the combination denominator. */
  deck?: 36 | 52
  /** Hands opened / raised. */
  raise: string[]
  /** Hands called rather than raised, where the distinction applies. */
  call?: string[]
}

/**
 * Reference ranges for 6-max No-Limit Hold'em at 100bb, plus a short-deck set.
 * These are teaching baselines, not solver output — they are deliberately
 * simple enough to memorise and close enough to correct to win with.
 */
export const RANGES: RangeDef[] = [
  {
    id: 'nlhe-utg',
    position: 'Under the gun',
    action: 'Open-raise',
    gameSlug: 'no-limit-holdem',
    gameLabel: "6-max No-Limit Hold'em · 100bb",
    note: 'Roughly 11% of hands — about one in nine. Five players act behind you, so every marginal hand is one someone can re-raise. This is the tightest range at the table and the easiest one to get wrong by loosening.',
    raise: ['77+', 'ATs+', 'KTs+', 'QTs+', 'JTs', 'T9s', '98s', 'AJo+', 'KQo'],
  },
  {
    id: 'nlhe-hj',
    position: 'Hijack',
    action: 'Open-raise',
    gameSlug: 'no-limit-holdem',
    gameLabel: "6-max No-Limit Hold'em · 100bb",
    note: 'Roughly 16%. One fewer player behind, so suited broadways and small pairs become playable.',
    raise: ['55+', 'A9s+', 'A5s-A2s', 'K9s+', 'Q9s+', 'J9s+', 'T9s', '98s', '87s', 'ATo+', 'KJo+'],
  },
  {
    id: 'nlhe-co',
    position: 'Cutoff',
    action: 'Open-raise',
    gameSlug: 'no-limit-holdem',
    gameLabel: "6-max No-Limit Hold'em · 100bb",
    note: 'Roughly 25%. Only the button and blinds act behind, and two of those three are forced to play out of position.',
    raise: ['22+', 'A2s+', 'K7s+', 'Q8s+', 'J8s+', 'T8s', '97s+', '87s', '76s', '65s', 'A9o+', 'KTo+', 'QTo+', 'JTo'],
  },
  {
    id: 'nlhe-btn',
    position: 'Button',
    action: 'Open-raise',
    gameSlug: 'no-limit-holdem',
    gameLabel: "6-max No-Limit Hold'em · 100bb",
    note: 'Roughly 41%. You act last on every postflop street, so you can profitably open almost half your hands. This is where a winning positional strategy actually shows up on the graph.',
    raise: ['22+', 'A2s+', 'K2s+', 'Q5s+', 'J7s+', 'T7s+', '96s+', '86s+', '75s+', '64s+', '54s', 'A2o+', 'K8o+', 'Q9o+', 'J9o+', 'T9o'],
  },
  {
    id: 'nlhe-sb',
    position: 'Small blind',
    action: 'Open-raise (folded to)',
    gameSlug: 'no-limit-holdem',
    gameLabel: "6-max No-Limit Hold'em · 100bb",
    note: 'Roughly 30%, and raise-only — limping the small blind invites the big blind to attack you in a pot you will play out of position for the rest of the hand.',
    raise: ['22+', 'A2s+', 'K5s+', 'Q7s+', 'J8s+', 'T8s', '97s+', '86s+', '76s', '65s', 'A7o+', 'K9o+', 'Q9o+', 'JTo'],
  },
  {
    id: 'nlhe-bb-defend',
    position: 'Big blind',
    action: 'Defend vs a 2.5x button open',
    gameSlug: 'no-limit-holdem',
    gameLabel: "6-max No-Limit Hold'em · 100bb",
    note: 'Roughly 27% defended — 7% as a 3-bet and 21% as a call. You are getting a price, but you will play every street out of position — so the offsuit trash still folds regardless of the discount. The "I already have money in" instinct is the leak here.',
    raise: ['99+', 'ATs+', 'KQs', 'A5s-A4s', 'AQo+'],
    call: ['22-88', 'A2s-A9s', 'K5s+', 'Q7s+', 'J8s+', 'T8s', '97s+', '86s+', '75s+', '65s', '54s', 'A8o-ATo', 'KTo+', 'QTo+', 'JTo'],
  },
  {
    id: 'nlhe-3bet',
    position: 'Button',
    action: '3-bet vs a cutoff open',
    gameSlug: 'no-limit-holdem',
    gameLabel: "6-max No-Limit Hold'em · 100bb",
    note: 'A polarised 3-betting range: premium value plus suited-ace bluffs. The small suited aces block AA and AK, and they make the nut flush and the wheel when called — two ways to win, which is what separates a good 3-bet bluff from a bad one.',
    raise: ['JJ+', 'AQs+', 'AKo', 'A5s-A2s', 'KQs'],
    call: ['22-TT', 'AJs-ATs', 'KJs', 'QJs', 'JTs', 'T9s', '98s', 'AQo'],
  },
  {
    id: 'shortdeck-btn',
    position: 'Button',
    action: 'Open-raise',
    gameSlug: 'short-deck-holdem',
    gameLabel: 'Short Deck (6+) · 36-card deck',
    deck: 36,
    note: 'Remember the deck: there are no cards below a six, so hands like 98s are effectively "low" connectors here. Equities run far closer together than in a 52-card game, which makes late-position stealing both easier and less decisive.',
    raise: ['66+', 'A6s+', 'K6s+', 'Q8s+', 'J8s+', 'T8s', '98s', '87s', 'A9o+', 'KTo+', 'QJo'],
  },
]

export const RANGE_BY_ID = new Map(RANGES.map((r) => [r.id, r]))

export const expandedRaise = (r: RangeDef) => expandRange(r.raise)
export const expandedCall = (r: RangeDef) => (r.call ? expandRange(r.call) : new Set<string>())

/** Games where a 13x13 grid is a meaningful representation at all. */
export const GRID_APPLICABLE_NOTE =
  'A 13x13 grid only describes two-card starting hands. Omaha, Stud, Draw and Chinese games have no equivalent — their starting-hand guidance appears as shape and structure rules on each game page instead.'
