import type { Game, Family, Structure, HiLo } from '../types'
import { NLHE } from './nlhe'
import { PLO } from './plo'
import { TRIPLE_DRAW } from './tripledraw'
import { HOLDEM_GAMES } from './holdem'
import { OMAHA_GAMES } from './omaha'
import { STUD_GAMES } from './stud'
import { DRAW_GAMES } from './draw'
import { CHINESE_GAMES } from './chinese'
import { MIXED_GAMES } from './mixed'
import { HOME_GAMES } from './home'
import { CASINO_GAMES } from './casino'

export const GAMES: Game[] = [
  NLHE, ...HOLDEM_GAMES,
  PLO, ...OMAHA_GAMES,
  ...STUD_GAMES,
  TRIPLE_DRAW, ...DRAW_GAMES,
  ...CHINESE_GAMES,
  ...MIXED_GAMES,
  ...HOME_GAMES,
  ...CASINO_GAMES,
]

export const GAME_BY_SLUG = new Map(GAMES.map((g) => [g.slug, g]))
export const getGame = (slug: string | undefined): Game | undefined =>
  slug ? GAME_BY_SLUG.get(slug) : undefined

export const FAMILY_META: Record<Family, { label: string; short: string; blurb: string }> = {
  holdem:  { label: "Hold'em",  short: "Hold'em", blurb: 'Two hole cards and five shared. The modern default and its many mutations.' },
  omaha:   { label: 'Omaha',    short: 'Omaha',   blurb: 'Four or more hole cards, exactly two of which must play. Nut hands everywhere.' },
  stud:    { label: 'Stud',     short: 'Stud',    blurb: 'No community cards. Most of the deck is dealt face up, so memory is the edge.' },
  draw:    { label: 'Draw',     short: 'Draw',    blurb: 'No board at all. Discard and replace — the number of cards taken is the only read.' },
  chinese: { label: 'Chinese',  short: 'Chinese', blurb: 'Thirteen cards set into rows. Allocation rather than betting.' },
  mixed:   { label: 'Mixed',    short: 'Mixed',   blurb: 'Rotations of several games. Your win rate is set by your worst one.' },
  home:    { label: 'Home',     short: 'Home',    blurb: 'Kitchen-table variants with wild cards, passing and declarations. Rules vary — agree them first.' },
  casino:  { label: 'Casino',   short: 'Banked',  blurb: 'House-banked games. You play the casino, bluffing is worthless, and the goal is to minimise the edge.' },
}

export const FAMILY_ORDER: Family[] = ['holdem','omaha','stud','draw','chinese','mixed','home','casino']

export const STRUCTURE_META: Record<Structure, string> = {
  NL: 'No-Limit', PL: 'Pot-Limit', FL: 'Fixed-Limit', Banked: 'House-Banked', Mixed: 'Mixed / varies',
}
export const HILO_META: Record<HiLo, string> = {
  hi: 'High only', lo: 'Low only', 'hi-lo': 'Split hi-lo', special: 'Special scoring',
}
export const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Beginner', 2: 'Easy', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert',
}

export const familyGames = (f: Family) => GAMES.filter((g) => g.family === f)
export const fullGames = () => GAMES.filter((g) => g.depth === 'full')

export const GAME_COUNT = GAMES.length
export const FAMILY_COUNT = FAMILY_ORDER.length

/** Dev-only integrity checks — bad data should fail loudly, not silently. */
if (import.meta.env.DEV) {
  const seen = new Set<string>()
  for (const g of GAMES) {
    if (seen.has(g.slug)) console.error(`[fold-equity] duplicate game slug: ${g.slug}`)
    seen.add(g.slug)
    if (g.banked && g.bluffRating !== 0)
      console.error(`[fold-equity] banked game ${g.slug} must have bluffRating 0`)
    for (const s of g.seeAlso ?? [])
      if (!seen.has(s) && !GAMES.some((x) => x.slug === s))
        console.error(`[fold-equity] ${g.slug} seeAlso -> unknown slug "${s}"`)
  }
}
