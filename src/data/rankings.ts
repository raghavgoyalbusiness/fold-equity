import type { RankingSet } from './types'

export interface RankRow {
  rank: number
  name: string
  example: string[]
  note: string
}
export interface RankingTable {
  key: RankingSet
  title: string
  reads: string
  /** Explains the ordering rule so it is learnable, not memorisable. */
  principle: string
  rows: RankRow[]
  footnotes?: string[]
}

const C = (...cards: string[]) => cards

export const RANKINGS: Record<RankingSet, RankingTable> = {
  standard: {
    key: 'standard',
    title: 'Standard high-hand rankings',
    reads: 'Best five cards win. Highest hand takes the pot.',
    principle:
      'The order is pure frequency: the rarer a five-card combination is in a 52-card deck, the higher it ranks. There are 4 royal flushes and 1,302,540 high-card hands, which is the whole explanation.',
    rows: [
      { rank: 1, name: 'Royal flush', example: C('As','Ks','Qs','Js','Ts'), note: 'Ace-high straight flush. 4 ways to make it.' },
      { rank: 2, name: 'Straight flush', example: C('9h','8h','7h','6h','5h'), note: 'Five in sequence, one suit. Ranked by top card.' },
      { rank: 3, name: 'Four of a kind', example: C('Qc','Qd','Qh','Qs','7d'), note: 'Quads. Kicker only matters with a shared board.' },
      { rank: 4, name: 'Full house', example: C('8s','8d','8c','Kh','Kd'), note: 'Trips first, then the pair: 888KK beats 777AA.' },
      { rank: 5, name: 'Flush', example: C('Ad','Jd','9d','6d','3d'), note: 'Five of a suit. Compared card by card from the top.' },
      { rank: 6, name: 'Straight', example: C('Ts','9d','8c','7h','6s'), note: 'A-2-3-4-5 is the wheel and is the lowest straight.' },
      { rank: 7, name: 'Three of a kind', example: C('5h','5d','5c','Ks','9d'), note: 'Called a set with a pocket pair, trips with a board pair.' },
      { rank: 8, name: 'Two pair', example: C('Jh','Jc','4s','4d','Ah'), note: 'Higher pair first, then lower pair, then kicker.' },
      { rank: 9, name: 'One pair', example: C('Ah','Ad','Kc','8s','3d'), note: 'Three kickers, compared in order.' },
      { rank: 10, name: 'High card', example: C('Ks','Qd','9h','6c','2s'), note: 'No pair, no flush, no straight. Wins far more often than beginners expect heads-up.' },
    ],
    footnotes: ['Suits never break ties in poker. Two identical hands split the pot.'],
  },

  shortdeck: {
    key: 'shortdeck',
    title: 'Short Deck (6+) rankings',
    reads: 'Best five cards win — but the order changes because the deck does.',
    principle:
      'Strip the deuces through fives and only 36 cards remain, 9 per suit. Flushes get rarer (fewer cards per suit to pair up with) while full houses get more common (fewer ranks to spread across), so a flush is promoted above a full house. The ranking follows the new frequencies, not tradition.',
    rows: [
      { rank: 1, name: 'Royal flush', example: C('As','Ks','Qs','Js','Ts'), note: 'Still the top.' },
      { rank: 2, name: 'Straight flush', example: C('Jh','Th','9h','8h','7h'), note: 'A-6-7-8-9 is the lowest — the ace plays low against sixes.' },
      { rank: 3, name: 'Four of a kind', example: C('9c','9d','9h','9s','Kd'), note: 'Unchanged.' },
      { rank: 4, name: 'Flush', example: C('Ad','Jd','9d','8d','6d'), note: 'PROMOTED above a full house. Only 9 cards per suit exist.' },
      { rank: 5, name: 'Full house', example: C('Ts','Td','Tc','8h','8d'), note: 'Demoted. Far more frequent in a 36-card deck.' },
      { rank: 6, name: 'Straight', example: C('Js','Td','9c','8h','7s'), note: 'More common than in a full deck — ranks are packed together.' },
      { rank: 7, name: 'Three of a kind', example: C('7h','7d','7c','As','Kd'), note: 'Some rooms also promote trips above a straight — check the house rules.' },
      { rank: 8, name: 'Two pair', example: C('Kh','Kc','8s','8d','Ah'), note: 'Weak here. Two pair is close to a bluff-catcher.' },
      { rank: 9, name: 'One pair', example: C('Ah','Ad','Kc','9s','7d'), note: 'Rarely good at showdown in a multiway pot.' },
      { rank: 10, name: 'High card', example: C('Ks','Qd','9h','8c','6s'), note: 'Almost never wins a contested pot.' },
    ],
    footnotes: [
      'The ace plays both high (A-K-Q-J-T) and low (A-6-7-8-9).',
      'House rules vary on whether trips beat a straight. Ask before the first hand — it changes every set-versus-draw decision.',
    ],
  },

  manila: {
    key: 'manila',
    title: 'Manila rankings (32-card deck)',
    reads: 'Sevens and up only — 32 cards, 8 per suit.',
    principle:
      'Same logic as Short Deck taken further. With only 8 cards per suit, flushes are rarer than full houses, so the flush is promoted. A third promotion appears: three of a kind is rarer than a straight in this deck, so trips beat straights.',
    rows: [
      { rank: 1, name: 'Straight flush', example: C('Js','Ts','9s','8s','7s'), note: 'A-7-8-9-T is the lowest; the ace plays low.' },
      { rank: 2, name: 'Four of a kind', example: C('Tc','Td','Th','Ts','Kd'), note: '' },
      { rank: 3, name: 'Flush', example: C('Ad','Jd','9d','8d','7d'), note: 'Promoted above a full house.' },
      { rank: 4, name: 'Full house', example: C('9s','9d','9c','Jh','Jd'), note: '' },
      { rank: 5, name: 'Three of a kind', example: C('Qh','Qd','Qc','As','9d'), note: 'Promoted above a straight in this deck.' },
      { rank: 6, name: 'Straight', example: C('Js','Td','9c','8h','7s'), note: 'Very common — the ranks are tightly packed.' },
      { rank: 7, name: 'Two pair', example: C('Kh','Kc','9s','9d','Ah'), note: '' },
      { rank: 8, name: 'One pair', example: C('Ah','Ad','Kc','Ts','8d'), note: '' },
      { rank: 9, name: 'High card', example: C('Ks','Qd','Th','8c','7s'), note: '' },
    ],
    footnotes: ['Manila house rules differ widely by room. Confirm the ranking sheet before you sit.'],
  },

  a5low: {
    key: 'a5low',
    title: 'Ace-to-five low rankings',
    reads: 'LOWEST hand wins. Straights and flushes do not count against you. Aces are low.',
    principle:
      'Read the five cards from the top down and take the lower hand. Because straights and flushes are ignored, the only thing that hurts you is a high card or a pair — so the perfect hand is the five lowest distinct ranks.',
    rows: [
      { rank: 1, name: 'The wheel', example: C('5c','4d','3h','2s','Ac'), note: 'Read as 5-4-3-2-A. The nut low. Also a straight, which is irrelevant here.' },
      { rank: 2, name: 'Six-four', example: C('6d','4s','3h','2c','Ad'), note: '6-4-3-2-A.' },
      { rank: 3, name: 'Six-five', example: C('6h','5c','4d','3s','Ah'), note: '6-5-4-3-A.' },
      { rank: 4, name: 'Seven-four', example: C('7s','4h','3d','2c','As'), note: '7-4-3-2-A. In Stud 8 and Omaha 8 this is a lock low most of the time.' },
      { rank: 5, name: 'Seven-five', example: C('7d','5s','4h','3c','Ad'), note: '' },
      { rank: 6, name: 'Seven-six', example: C('7h','6d','5c','4s','2h'), note: 'The worst seven-low.' },
      { rank: 7, name: 'Eight-low', example: C('8c','6h','4d','3s','Ac'), note: 'In split-pot games an eight-low is the qualifying cut-off.' },
      { rank: 8, name: 'Nine-low and worse', example: C('9s','7d','5c','3h','2s'), note: 'Does not qualify in "eight or better" games. No low is awarded.' },
      { rank: 9, name: 'Any pair', example: C('3h','3d','5c','4s','Ah'), note: 'A pair ruins a low hand. Paired boards kill low draws.' },
    ],
    footnotes: [
      'Compare from the highest card down: 8-7-6-5-4 beats 8-7-6-5-3? No — read it the other way. The LOWER top card wins first; if tied, compare the next card down. 8-6-4-3-A beats 8-7-2-A-K… (K makes it a king-low).',
      'In "eight or better" split games, no low is possible on a board with three cards of rank nine or higher.',
    ],
  },

  deuce7low: {
    key: 'deuce7low',
    title: 'Deuce-to-seven (Kansas City) low rankings',
    reads: 'LOWEST hand wins. Straights and flushes COUNT AGAINST you. Aces are always high.',
    principle:
      'This is standard high-hand ranking read upside down. Whatever would be a good high hand is a bad low hand. So the perfect hand is the five lowest cards that make no straight and no flush — 7-5-4-3-2 offsuit.',
    rows: [
      { rank: 1, name: 'Seven-five-four-three-deuce', example: C('7s','5d','4h','3c','2d'), note: 'The number-one hand. Must not be a flush.' },
      { rank: 2, name: 'Seven-six-four-three-deuce', example: C('7h','6s','4d','3c','2h'), note: 'The second nuts.' },
      { rank: 3, name: 'Seven-six-five-three-deuce', example: C('7c','6d','5s','3h','2c'), note: '' },
      { rank: 4, name: 'Seven-six-five-four-deuce', example: C('7d','6h','5s','4c','2d'), note: 'Note the gap: 7-6-5-4-3 would be a straight and is worthless.' },
      { rank: 5, name: 'Eight-six-four-three-deuce', example: C('8s','6d','4h','3c','2s'), note: 'The best eight. Still a strong holding.' },
      { rank: 6, name: 'Any other eight-low', example: C('8h','7d','5c','4s','2h'), note: '8-7 low is the drawing dead-zone — often second best.' },
      { rank: 7, name: 'Nine-low', example: C('9d','7s','5h','3c','2d'), note: 'Marginal. Usually a bluff-catcher heads-up.' },
      { rank: 8, name: 'Ten-low or worse', example: C('Th','8d','6c','4s','2h'), note: 'Rarely wins a bet.' },
      { rank: 9, name: 'Any pair, straight or flush', example: C('6h','6d','4c','3s','2h'), note: 'A pair is a disaster. So is making a straight by accident.' },
    ],
    footnotes: [
      'The ace is ALWAYS high in 2-7. A-2-3-4-5 is an ace-high hand, not a wheel — it is close to worthless.',
      'Because straights count, 7-6-5-4-3 is a straight and loses to a nine-low. Read your hand twice before you stand pat.',
    ],
  },

  badugi: {
    key: 'badugi',
    title: 'Badugi rankings',
    reads: 'FOUR cards, all different suits and all different ranks. Lowest badugi wins. Aces are low.',
    principle:
      'A card is dead if it duplicates the suit or rank of another card you are counting. You count as many live cards as you can — so a four-card badugi always beats any three-card hand, which always beats any two-card hand.',
    rows: [
      { rank: 1, name: 'Four-card badugi — A234', example: C('Ac','2d','3h','4s'), note: 'The nuts. Four ranks, four suits.' },
      { rank: 2, name: 'Four-card badugi — A235', example: C('Ah','2c','3s','5d'), note: 'Compare from the highest card down.' },
      { rank: 3, name: 'Four-card badugi — any 5-high', example: C('5c','3d','2h','As'), note: 'Any four-card five-high is a monster.' },
      { rank: 4, name: 'Four-card badugi — 8-high', example: C('8d','6s','4h','Ac'), note: 'A typical winning hand in a full ring game.' },
      { rank: 5, name: 'Four-card badugi — K-high', example: C('Ks','9h','5d','2c'), note: 'Still beats every three-card hand.' },
      { rank: 6, name: 'Three-card hand', example: C('3h','5h','7d','2s'), note: 'The 5h is dead (duplicate heart). Plays as 7-3-2.' },
      { rank: 7, name: 'Two-card hand', example: C('4c','9c','Jc','2s'), note: 'Three clubs — only one counts. Plays as 4-2.' },
      { rank: 8, name: 'One-card hand', example: C('6d','8d','Td','Kd'), note: 'All one suit. Plays as a 6. Essentially the worst hand possible.' },
    ],
    footnotes: [
      'A 4-card king-high badugi beats a 3-card A-2-3. Card count comes first, always.',
      'Three-card hands are compared like low hands: the lowest top card wins.',
    ],
  },

  badeucey: {
    key: 'badeucey',
    title: 'Badeucey — split pot rankings',
    reads: 'Half the pot to the best Badugi, half to the best deuce-to-seven low (five cards).',
    principle:
      'Two completely different hands are read out of the same five cards. The tension is real: the 2-7 side wants 7-5-4-3-2, while the Badugi side wants four suits — and 7-5-4-3-2 in four suits is only a four-card badugi if one card is a duplicate suit. Scooping is hard, which is the whole game.',
    rows: [
      { rank: 1, name: 'Badugi half', example: C('Ac','2d','3h','4s'), note: 'Ranked exactly as Badugi: A-2-3-4 rainbow is the nuts.' },
      { rank: 2, name: 'Deuce-to-seven half', example: C('7s','5d','4h','3c','2d'), note: 'Ranked exactly as 2-7: aces high, straights and flushes count against.' },
      { rank: 3, name: 'The scoop hand', example: C('7s','5d','4h','3c','2c'), note: '7-5-4-3-2 for the low AND 7-5-4-3 rainbow-ish for the badugi. Rare and enormous.' },
      { rank: 4, name: 'The trap', example: C('Ah','2d','3c','4s','6h'), note: 'Great badugi (A-2-3-4), terrible 2-7 low — the ace is HIGH on that half.' },
    ],
    footnotes: [
      'The ace is low for the Badugi half and high for the 2-7 half. In the same hand. This trips up everyone the first session.',
      'Badeucey always awards both halves — there is no qualifier.',
    ],
  },

  badacey: {
    key: 'badacey',
    title: 'Badacey — split pot rankings',
    reads: 'Half the pot to the best Badugi, half to the best ace-to-five low (five cards).',
    principle:
      'The friendlier sibling of Badeucey. Here the ace is low on both halves, so A-2-3-4 works for the badugi and A-2-3-4-5 works for the low. Scooping is much more achievable, which makes the game more aggressive.',
    rows: [
      { rank: 1, name: 'Badugi half', example: C('Ac','2d','3h','4s'), note: 'Standard Badugi ranking.' },
      { rank: 2, name: 'Ace-to-five half', example: C('5c','4d','3h','2s','Ac'), note: 'The wheel. Straights and flushes ignored.' },
      { rank: 3, name: 'The scoop hand', example: C('Ac','2d','3h','4s','5c'), note: 'A-2-3-4 rainbow badugi plus the wheel. The dream hand.' },
    ],
    footnotes: ['Aces are low on both halves, which is why Badacey scoops far more often than Badeucey.'],
  },

  chinese: {
    key: 'chinese',
    title: 'Chinese Poker rankings and royalties',
    reads: 'Three hands, ranked standard. Back must beat middle, middle must beat front.',
    principle:
      'Standard high-hand rankings apply to each row, but you set the hands yourself — so the real skill is allocation, not luck. Setting a hand out of order ("fouling") loses everything, which is the constraint that makes the game.',
    rows: [
      { rank: 1, name: 'Back hand (5 cards)', example: C('As','Ks','Qs','Js','Ts'), note: 'Must be your strongest row. Standard rankings.' },
      { rank: 2, name: 'Middle hand (5 cards)', example: C('8h','8d','8c','Kh','Kd'), note: 'Must be weaker than the back, stronger than the front.' },
      { rank: 3, name: 'Front hand (3 cards)', example: C('Qc','Qd','9h'), note: 'Three cards only — no straights or flushes count here.' },
      { rank: 4, name: 'Foul', example: C('—'), note: 'Rows out of order. You lose every row automatically, plus any royalties owed.' },
    ],
    footnotes: [
      'Common royalties: trips in front (bonus scales by rank), full house in the middle, quads or better in the back.',
      'Scoring is usually 1 unit per row won, plus a bonus for a "scoop" of all three rows.',
    ],
  },

  paigow: {
    key: 'paigow',
    title: 'Pai Gow Poker rankings',
    reads: 'Standard high-hand rankings, with one joker and one ordering quirk.',
    principle:
      'Seven cards split into a five-card "high" hand and a two-card "low" hand. The high hand must beat the low hand. You must beat BOTH of the dealer\'s hands to win — tie either one and it is a push, which is why the house edge is small but the variance is tiny too.',
    rows: [
      { rank: 1, name: 'Five aces', example: C('As','Ah','Ad','Ac','Jkr'), note: 'Only possible with the joker. The top hand in the game.' },
      { rank: 2, name: 'Royal flush', example: C('As','Ks','Qs','Js','Ts'), note: '' },
      { rank: 3, name: 'Straight flush', example: C('9h','8h','7h','6h','5h'), note: '' },
      { rank: 4, name: 'Four of a kind', example: C('Qc','Qd','Qh','Qs','7d'), note: '' },
      { rank: 5, name: 'Full house', example: C('8s','8d','8c','Kh','Kd'), note: '' },
      { rank: 6, name: 'Flush', example: C('Ad','Jd','9d','6d','3d'), note: '' },
      { rank: 7, name: 'Straight — A-K-Q-J-T high', example: C('As','Kd','Qc','Jh','Ts'), note: '' },
      { rank: 8, name: 'Straight — A-2-3-4-5', example: C('5c','4d','3h','2s','Ac'), note: 'THE QUIRK: the wheel ranks SECOND-highest straight, above K-Q-J-T-9.' },
      { rank: 9, name: 'Three of a kind', example: C('5h','5d','5c','Ks','9d'), note: '' },
      { rank: 10, name: 'Two pair / pair / high card', example: C('Jh','Jc','4s','4d','Ah'), note: 'Two-card low hand can only be a pair or high card.' },
    ],
    footnotes: [
      'The joker is a "bug": it completes straights and flushes, otherwise it counts as an ace.',
      'The wheel ranking above K-high is a genuine rule difference from every other poker game.',
    ],
  },

  videopoker: {
    key: 'videopoker',
    title: 'Video poker pay tables',
    reads: 'Standard rankings — but the PAY TABLE, not the ranking, decides correct play.',
    principle:
      'A video poker machine is a solved maths problem. The return of any hold is the sum of (probability of each outcome × its payout). Because payouts differ between machines, the same five cards can have different correct holds on different pay tables. Always read the pay table before the first hand.',
    rows: [
      { rank: 1, name: 'Royal flush', example: C('As','Ks','Qs','Js','Ts'), note: '800-for-1 at max coin — the entire reason to bet max.' },
      { rank: 2, name: 'Straight flush', example: C('9h','8h','7h','6h','5h'), note: 'Typically 50-for-1.' },
      { rank: 3, name: 'Four of a kind', example: C('Qc','Qd','Qh','Qs','7d'), note: '25-for-1 on Jacks or Better; on Double Double Bonus it depends on the rank AND the kicker.' },
      { rank: 4, name: 'Full house', example: C('8s','8d','8c','Kh','Kd'), note: '9-for-1 on a "9/6" machine. The first number in "9/6".' },
      { rank: 5, name: 'Flush', example: C('Ad','Jd','9d','6d','3d'), note: '6-for-1 on a "9/6" machine. The second number.' },
      { rank: 6, name: 'Straight', example: C('Ts','9d','8c','7h','6s'), note: '4-for-1.' },
      { rank: 7, name: 'Three of a kind', example: C('5h','5d','5c','Ks','9d'), note: '3-for-1.' },
      { rank: 8, name: 'Two pair', example: C('Jh','Jc','4s','4d','Ah'), note: '2-for-1 on Jacks or Better, 1-for-1 on Double Double Bonus.' },
      { rank: 9, name: 'Jacks or better', example: C('Jh','Jd','8c','5s','2d'), note: '1-for-1. A pair of tens or lower pays nothing.' },
    ],
    footnotes: [
      'A "9/6 Jacks or Better" machine returns 99.54% with perfect play. An "8/5" version of the same game returns 97.30%. Same cards, same rankings — a quarter of a percent per hand difference comes purely from the pay table.',
      'Deuces Wild and Double Double Bonus use completely different strategies. Do not carry a Jacks or Better hold sheet to a different machine.',
    ],
  },
}

export const RANKING_ORDER: RankingSet[] = [
  'standard','shortdeck','manila','a5low','deuce7low','badugi','badeucey','badacey','chinese','paigow','videopoker',
]
