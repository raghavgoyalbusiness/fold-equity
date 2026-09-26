export type Family =
  | 'holdem' | 'omaha' | 'stud' | 'draw'
  | 'chinese' | 'mixed' | 'home' | 'casino'

export type Structure = 'NL' | 'PL' | 'FL' | 'Banked' | 'Mixed'
export type HiLo = 'hi' | 'lo' | 'hi-lo' | 'special'

/** Which hand-ranking table governs this game. */
export type RankingSet =
  | 'standard' | 'shortdeck' | 'manila'
  | 'a5low' | 'deuce7low' | 'badugi'
  | 'badeucey' | 'badacey'
  | 'chinese' | 'paigow' | 'videopoker'

/** Drives how the 3D table deals this game. */
export interface DealPlan {
  /** Cards dealt to each player's hand (face-down unless faceUp says otherwise). */
  hole: number
  /** Indices within the hole deal that arrive face up — Stud games. */
  faceUp?: number[]
  /** Community cards, in street-sized chunks, e.g. [3,1,1] for flop/turn/river. */
  board?: number[]
  /** More than one community board (double-board games). */
  boards?: number
  /** Number of drawing rounds; cards discarded animate off-table. */
  draws?: number
  /** Chinese / OFC row layout, e.g. [3,5,5]. */
  rows?: number[]
  /** Cards discarded after a street, e.g. Crazy Pineapple. */
  discardAfter?: { street: string; count: number }
  /** Seats used by the teaching table. */
  seats: number
  /** Extra label shown in the table HUD. */
  note?: string
}

export interface RuleStep {
  title: string
  body: string
  /** Street key the 3D table should advance to for this step. */
  stage: Stage
}

export type Stage =
  | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
  | 'deal' | 'third' | 'fourth' | 'fifth' | 'sixth' | 'seventh'
  | 'draw1' | 'draw2' | 'draw3' | 'set' | 'reveal'

export interface StrategyBlock {
  heading: string
  body: string
  /** Worked example that makes the claim checkable. */
  example?: string
  bullets?: string[]
}

export interface StartingHandTier {
  tier: string
  hands: string
  action: string
  note: string
}

export interface StrategySection {
  thesis: string
  startingHands: StartingHandTier[]
  position: StrategyBlock
  betSizing: StrategyBlock
  streets: StrategyBlock[]
}

export interface BluffChapter {
  thesis: string
  whenToBluff: StrategyBlock
  semiBluffs: StrategyBlock
  blockers: StrategyBlock
  boardTexture: StrategyBlock
  /** Bluff-to-value ratios by bet size, as fractions of the pot. */
  ratios: { sizing: string; pot: string; bluffShare: string; why: string }[]
  targets: StrategyBlock
  pointless: StrategyBlock
}

export interface Leak {
  leak: string
  why: string
  exploit: string
  fix: string
}

export interface FormatAdjustments {
  cash: string[]
  tournament: string[]
  headsUp: string[]
}

export interface QuizOption { id: string; label: string }
export interface QuizQuestion {
  id: string
  spot: string
  /** Cards shown on the 3D/2D table for this question. */
  hero?: string[]
  board?: string[]
  pot?: string
  stacks?: string
  question: string
  options: QuizOption[]
  answer: string
  /** Keyed by option id — why each choice is right or wrong. */
  explain: Record<string, string>
  /** Skill tag used by the study-plan generator to find weak areas. */
  topic: string
}

export interface Game {
  slug: string
  name: string
  /** Short label for the 3D table HUD and cards. */
  short: string
  family: Family
  structures: Structure[]
  hiLo: HiLo
  /** 1 = easiest to pick up, 5 = hardest to play well. */
  difficulty: 1 | 2 | 3 | 4 | 5
  /** 0 = bluffing is mathematically worthless (banked games). */
  bluffRating: 0 | 1 | 2 | 3 | 4 | 5
  tagline: string
  blurb: string
  players: string
  deck: string
  deal: DealPlan
  rankingSet: RankingSet
  rankingNote?: string
  rules60: RuleStep[]
  /** True for house-banked games: you play the casino, not other players. */
  banked?: boolean
  depth: 'full' | 'scaffold'
  /** Present on fully written pages only. */
  strategy?: StrategySection
  bluffing?: BluffChapter
  leaks?: Leak[]
  formats?: FormatAdjustments
  quiz?: QuizQuestion[]
  /** Scaffold pages get a compact strategy primer instead of the full chapter. */
  primer?: string[]
  seeAlso?: string[]
}
