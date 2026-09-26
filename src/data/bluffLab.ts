import type { Stage } from './types'

export interface LabAction {
  id: string
  label: string
  kind: 'fold' | 'check' | 'call' | 'bet' | 'raise'
  /** Bet size as a fraction of the pot, where relevant. */
  sizing?: number
  /** 0–100. The grade the AI coach anchors to. */
  score: number
  verdict: string
  /** The maths that justifies the grade. */
  working?: string
}

export interface Scenario {
  id: string
  title: string
  gameSlug: string
  gameLabel: string
  concept: string
  stage: Stage
  street: string
  hero: string[]
  board: string[]
  /** Hole-card count for the table renderer. */
  potBB: number
  stackBB: number
  position: string
  opponentPosition: string
  opponentProfile: string
  history: string[]
  prompt: string
  actions: LabAction[]
  best: string
  /** Shown after the user answers, whatever they chose. */
  debrief: {
    foldEquity: string
    potOdds: string
    range: string
    principle: string
  }
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'lab-1',
    title: 'The blocker river',
    gameSlug: 'no-limit-holdem',
    gameLabel: "No-Limit Hold'em",
    concept: 'Blockers and river polarity',
    stage: 'river',
    street: 'River',
    hero: ['As', '5d'],
    board: ['Qs', 'Js', '7d', '4s', '2h'],
    potBB: 60,
    stackBB: 140,
    position: 'Button',
    opponentPosition: 'Big blind',
    opponentProfile: 'A competent regular. Folds to river aggression more than average and is capable of laying down a made flush.',
    history: [
      'You open 2.5bb on the button, big blind calls.',
      'Flop Q♠ J♠ 7♦ — they check, you bet 1/3 pot, they call.',
      'Turn 4♠ — they check, you check back.',
      'River 2♥ — they check to you.',
    ],
    prompt: 'You hold A♠5♦. Three spades are on the board, and you hold exactly one of the fourth — so you have no flush, just ace-high. But the one spade you do hold is the ace. What do you do?',
    actions: [
      { id: 'a', label: 'Check back', kind: 'check', score: 38,
        verdict: 'Safe but wasteful. Ace-high wins at showdown occasionally, but you are giving up the single best bluffing spot available in this hand.',
        working: 'Ace-high beats only their complete air. Against a range that called a flop bet, that is a small slice.' },
      { id: 'b', label: 'Bet 1/3 pot', kind: 'bet', sizing: 0.33, score: 44,
        verdict: 'Wrong size for the right idea. A small bet gives every king-high and queen-high flush an easy price to call, so you fold out only the hands that were already losing to your ace-high.',
        working: 'Risk 20 to win 60 — it only needs to work 20/(20+60) = 25% of the time, which sounds good until you notice it folds out nothing. They call 20 into an 80 pot needing just 20%. Every spade calls.' },
      { id: 'c', label: 'Bet 3/4 pot', kind: 'bet', sizing: 0.75, score: 82,
        verdict: 'Strong. This is the right idea at a reasonable size. Your A♠ makes the nut flush impossible for them, so every flush they hold is second best and facing a real price.',
        working: 'Risk 45 to win 60 — the bluff needs to work 45/(45+60) = 42.9% of the time.' },
      { id: 'd', label: 'Overbet 1.4x pot', kind: 'bet', sizing: 1.4, score: 94,
        verdict: 'Best. The nut blocker is exactly what licenses a very large bet. You are representing the nut flush, they cannot hold it, and their king- and queen-high flushes now face a bet that their hand simply cannot justify calling.',
        working: 'Risk 84 to win 60 — needs to work 84/(84+60) = 58.3%. That is a high bar, but you block the only hand that never folds, and their range is full of one-pair hands and second-best flushes.' },
      { id: 'e', label: 'Bet all-in', kind: 'bet', sizing: 2.33, score: 61,
        verdict: 'Too much. The extra pressure buys very few additional folds beyond the 1.4x overbet, while risking far more when the occasional slow-played straight or two pair does call.',
        working: 'Risk 140 to win 60 — needs to work 140/(140+60) = 70%. Their range does not fold that often even here.' },
    ],
    best: 'd',
    debrief: {
      foldEquity: 'Their range after calling a small flop bet and checking twice is mostly Q-x, J-x, pocket pairs and a handful of made flushes. Almost none of it wants to face a large bet on a four-flush board. Realistic fold rate against the overbet: 60–70%.',
      potOdds: 'The overbet of 84 into 60 needs to succeed 58.3% of the time. Against this specific opponent profile — a regular who folds to river aggression — that threshold is comfortably cleared.',
      range: 'Crucially, you hold the A♠ — and only the A♠. It is worthless to your own hand, which is exactly what makes it the perfect card to bluff with: every nut-flush combination is removed from their range. When you represent the nuts, they cannot have it.',
      principle: 'Nut blockers license large sizings. Without the A♠ this is a 3/4-pot bet at most; with it, the overbet is the highest-EV action available.',
    },
  },
  {
    id: 'lab-2',
    title: 'The combo draw',
    gameSlug: 'no-limit-holdem',
    gameLabel: "No-Limit Hold'em",
    concept: 'Semi-bluffing with equity',
    stage: 'flop',
    street: 'Flop',
    hero: ['9h', '8h'],
    board: ['Th', '7c', '2h'],
    potBB: 18,
    stackBB: 96,
    position: 'Big blind',
    opponentPosition: 'Cutoff',
    opponentProfile: 'A tight-aggressive regular who continuation-bets most flops and folds to raises somewhat more than they should.',
    history: [
      'Cutoff opens 2.5bb, you defend from the big blind.',
      'Flop T♥ 7♣ 2♥ — you check, they bet 6bb into 12bb.',
    ],
    prompt: 'You hold 9♥8♥ — an open-ended straight draw and a flush draw. No made hand at all. What is the best action?',
    actions: [
      { id: 'a', label: 'Fold', kind: 'fold', score: 4,
        verdict: 'A serious error. You are folding one of the strongest drawing hands possible on this board — a hand that is frequently a favourite against their actual holding.',
        working: 'You have 15 outs: 9 hearts, plus 6 non-heart straight cards (J and 6). That is roughly 54% equity by the river against top pair.' },
      { id: 'b', label: 'Call', kind: 'call', score: 58,
        verdict: 'Fine but passive. Calling keeps their bluffs in and realises your equity, but it gives up all the fold equity that makes this hand so valuable.',
        working: 'Call 6 to win 18: you need 25% equity and have roughly 54%. Profitable, but not maximally so.' },
      { id: 'c', label: 'Raise to ~1.1x pot', kind: 'raise', sizing: 1.1, score: 91,
        verdict: 'Best. This is the textbook semi-bluff. You have two ways to win: they fold now, or you complete one of fifteen outs. Against an opponent who over-folds to raises, both paths are live.',
        working: 'Risk 20 to win 24 — needs to work 45% as a pure bluff. But it is not a pure bluff: when called you still win roughly 54% of the time. The combined EV is strongly positive.' },
      { id: 'd', label: 'Raise all-in', kind: 'raise', sizing: 5.3, score: 34,
        verdict: 'Far too much. You destroy your own fold equity by only getting called by hands that beat you, and you convert a hand that is a favourite into one that is behind exactly when the money goes in.',
        working: 'Jamming 96 into 24 folds out every hand you dominate and gets called by sets and better draws. You realise your equity by raising small, not by shoving.' },
    ],
    best: 'c',
    debrief: {
      foldEquity: 'A tight-aggressive regular c-bets this flop with a wide range — overcards, backdoor draws, small pairs. A raise from the big blind represents sets and two pair credibly, and much of their range folds immediately.',
      potOdds: 'You do not need fold equity for this to be profitable. With 15 outs you have roughly 54% equity by the river. The fold equity is the bonus that turns a good call into a great raise.',
      range: 'Your check-raising range on this board should contain sets (TT, 77, 22), two pair (T7), and exactly these big draws. That balance means your raise cannot be exploited by simply calling wider.',
      principle: 'Semi-bluffs are the most forgiving aggression in poker: you win immediately when they fold and later when you hit. Size them to keep the folds, not to maximise the pot.',
    },
  },
  {
    id: 'lab-3',
    title: 'The Omaha nut blocker',
    gameSlug: 'pot-limit-omaha',
    gameLabel: 'Pot-Limit Omaha',
    concept: 'Bluffing in a four-card game',
    stage: 'river',
    street: 'River',
    hero: ['Ad', '9c', '6s', '3h'],
    board: ['Kd', 'Td', '7d', '4s', '2c'],
    potBB: 84,
    stackBB: 210,
    position: 'Button',
    opponentPosition: 'Big blind',
    opponentProfile: 'A solid PLO regular who understands that non-nut flushes are frequently second best, and who folds them to real pressure.',
    history: [
      'You open pot on the button, big blind calls.',
      'Flop K♦ T♦ 7♦ — they check, you bet half pot, they call.',
      'Turn 4♠ — they check, you check back.',
      'River 2♣ — they check to you.',
    ],
    prompt: 'You hold A♦9♣6♠3♥. Remember the exactly-two rule: one diamond in your hand is NOT a flush. You have ace-high and nothing else. What do you do?',
    actions: [
      { id: 'a', label: 'Check back', kind: 'check', score: 30,
        verdict: 'Too passive. Ace-high essentially never wins a contested PLO pot at showdown, and you are holding the single best bluffing card on the board.',
        working: 'In a four-card game, an opponent who called a flop bet on a monotone board almost always has at least a made flush or a set.' },
      { id: 'b', label: 'Bet 1/3 pot', kind: 'bet', sizing: 0.33, score: 36,
        verdict: 'The wrong size entirely. A small bet on a monotone board gives every flush a trivially cheap call. You are betting into exactly the hands that will not fold to this price.',
        working: 'Bet 28 into 84: they need only 20% equity to call. Any flush calls instantly.' },
      { id: 'c', label: 'Bet pot', kind: 'bet', sizing: 1.0, score: 93,
        verdict: 'Best. The maximum legal bet, and exactly the right one. You hold the A♦ so they cannot have the nut flush. Every king-, queen- and jack-high flush in their range is now facing a pot-sized bet with a hand they know is beatable.',
        working: 'Risk 84 to win 84 — needs to work 50% of the time. Against an opponent who understands non-nut flushes are vulnerable, that threshold is met comfortably.' },
      { id: 'd', label: 'Bet 2/3 pot', kind: 'bet', sizing: 0.66, score: 71,
        verdict: 'Decent, but you are leaving money on the table. When you hold the nut blocker on a monotone board, this is the spot to use the maximum. Pot-limit caps you at pot — take all of it.',
        working: 'Risk 56 to win 84 — needs to work 40%. Lower bar, but it also gives their marginal flushes a price they can talk themselves into paying.' },
    ],
    best: 'c',
    debrief: {
      foldEquity: 'A PLO regular holding the K♦ or Q♦ high flush on a monotone board is acutely aware that the A♦ beats them. Facing a pot-sized bet from a player who has represented strength since the flop, that hand folds a large share of the time.',
      potOdds: 'The pot bet needs to work 50% of the time. Note how much higher this bar is than in Hold\'em — but also how much more reliably the blocker delivers, because PLO ranges contain so many second-best flushes.',
      range: 'You cannot make a flush yourself — the exactly-two rule means one diamond does nothing. That is precisely what makes this the ideal bluff: the card is worthless to your hand and maximally valuable to your story.',
      principle: 'The bare ace of the flush suit is the premier bluffing card in PLO. It costs you nothing and removes the only hand that never folds.',
    },
  },
  {
    id: 'lab-4',
    title: 'The multiway trap',
    gameSlug: 'no-limit-holdem',
    gameLabel: "No-Limit Hold'em",
    concept: 'When bluffing is simply wrong',
    stage: 'river',
    street: 'River',
    hero: ['6c', '5c'],
    board: ['Ah', 'Kd', '9s', '3c', '2d'],
    potBB: 96,
    stackBB: 180,
    position: 'Button',
    opponentPosition: 'Two opponents, both checked',
    opponentProfile: 'One tight regular in the small blind, one loose recreational player in the big blind who has called down light twice already this session.',
    history: [
      'You open 2.5bb on the button. Small blind calls, big blind calls.',
      'Flop A♥ K♦ 9♠ — checks to you, you bet 1/3 pot, both call.',
      'Turn 3♣ — checks to you, you check back.',
      'River 2♦ — both players check to you.',
    ],
    prompt: 'You hold 6♣5♣ on an A-K-9-3-2 board. No pair, no draw — your two cards contribute nothing, so you are effectively playing the board. Both opponents have checked. What do you do?',
    actions: [
      { id: 'a', label: 'Check back', kind: 'check', score: 90,
        verdict: 'Correct. This is the discipline that separates winning players from creative ones. Two players called a flop bet on an ace-king board; at least one of them has an ace. There is no bluff here.',
        working: 'Even if each opponent folds 70% of the time — wildly optimistic here — both fold only 0.70 × 0.70 = 49% of the time.' },
      { id: 'b', label: 'Bet 1/2 pot', kind: 'bet', sizing: 0.5, score: 22,
        verdict: 'A losing bet. You need both players to fold, and one of them is a recreational player who has already shown you twice that they call down light.',
        working: 'Risk 48 to win 96 — needs to work 33%. Against two opponents on an ace-high board where both called the flop, the real success rate is well below that.' },
      { id: 'c', label: 'Bet 3/4 pot', kind: 'bet', sizing: 0.75, score: 12,
        verdict: 'Worse. A larger bet does not fix the structural problem, which is that you need two independent folds from a range that contains aces.',
        working: 'Risk 72 to win 96 — needs to work 42.9%. You are now risking more for a marginally better fold rate against the same unfoldable hands.' },
      { id: 'd', label: 'Bet small to "block"', kind: 'bet', sizing: 0.25, score: 18,
        verdict: 'A blocking bet with a hand that cannot beat anything is a contradiction — there is nothing to protect. You are betting a hand that cannot win, at a price that folds nothing.',
        working: 'Bet 24 into 96: they need 20% equity. Any ace, any king, any nine calls. You have turned a free showdown into a 24bb loss.' },
    ],
    best: 'a',
    debrief: {
      foldEquity: 'This is the entire lesson. Fold equity compounds MULTIPLICATIVELY across opponents. Two players who each fold 70% of the time both fold only 49% of the time. Three players who each fold 70% both — all three fold only 34% of the time.',
      potOdds: 'A half-pot bet needs to work 33% of the time. That sounds achievable until you account for two opponents and a board where an ace, a king or a nine all call comfortably.',
      range: 'Both opponents called a flop continuation bet on A-K-9. That range is dense with aces and kings, and those hands do not fold on a river that changed nothing. The recreational player in particular has told you twice already that they call.',
      principle: 'Multiway pots are roughly four times harder to bluff than heads-up pots, and beginners consistently underestimate this. Checking back is not weak — it is the correct play and the money you do not lose spends exactly the same.',
    },
  },
  {
    id: 'lab-5',
    title: 'The snow',
    gameSlug: 'deuce-to-seven-triple-draw',
    gameLabel: '2-7 Triple Draw',
    concept: 'Bluffing with no board at all',
    stage: 'draw2',
    street: 'After the first draw',
    hero: ['2c', '2d', '3h', '3s', '7d'],
    board: [],
    potBB: 9,
    stackBB: 60,
    position: 'Button',
    opponentPosition: 'Big blind',
    opponentProfile: 'A thinking mixed-game regular who tracks draw counts carefully and is capable of folding a made nine to sustained pat aggression.',
    history: [
      'You raise on the button, big blind calls.',
      'First draw: they take two cards. You stood pat.',
      'They check to you.',
    ],
    prompt: 'You hold 2-2-3-3-7 — two pair, which is a genuinely terrible hand in a lowball game. You already stood pat on the first draw. What now?',
    actions: [
      { id: 'a', label: 'Check and give up', kind: 'check', score: 20,
        verdict: 'You have already paid for the bluff by standing pat. Checking now collects none of it and tells an observant opponent exactly what happened.',
        working: 'Standing pat and then checking is an incoherent story. The information you spent a draw to create is wasted.' },
      { id: 'b', label: 'Bet and keep standing pat', kind: 'bet', sizing: 1.0, score: 92,
        verdict: 'Best. Every condition for a snow is met: heads-up, in position, against an opponent who watches draw counts, holding four of the cards they most need. Commit to the story.',
        working: 'Risk 1 bet to win 9 — it needs to work only 10% of the time in fixed limit. You also hold two deuces and two treys, removing eight of their outs.' },
      { id: 'c', label: 'Break and draw two', kind: 'check', score: 41,
        verdict: 'Honest, but it throws away the hand\'s only asset. Drawing two from 3-2-7 gives you a genuine but modest chance, and it abandons the pat story you already established.',
        working: 'Keeping 7-3-2 and drawing two makes an eight-or-better roughly 9% per draw. Playable, but far worse than a bluff that needs 10% to break even.' },
      { id: 'd', label: 'Bet, then draw one on the next draw', kind: 'bet', sizing: 1.0, score: 29,
        verdict: 'Self-defeating. Betting as a pat hand and then taking a card destroys the story completely. Your opponent will call every future street.',
        working: 'The snow depends entirely on the verifiable act of standing pat. Taking a card after betting is a confession.' },
    ],
    best: 'b',
    debrief: {
      foldEquity: 'Your opponent drew two cards, so they need to improve substantially to beat a made seven. Against a player who stood pat from the first draw and keeps betting, a thinking opponent folds most of their non-premium holdings.',
      potOdds: 'Fixed limit makes this bluff exceptionally cheap. Risking one bet to win nine means it only needs to work about 10% of the time — one of the best prices for a bluff anywhere in poker.',
      range: 'The blockers are the hidden edge. You hold two deuces and two treys — eight of the lowest cards in the deck. Your opponent\'s two-card draw is measurably less likely to complete because you are physically holding their outs.',
      principle: 'The snow is the purest bluff in poker: it is made of information rather than chips. But it depends entirely on being rare. Run it once per session, heads-up, in position, holding their outs.',
    },
  },
]

// ---------------------------------------------------------------------------

export interface Tell { tell: string; means: string; caveat: string }

export const LIVE_TELLS: Tell[] = [
  { tell: 'Reaching for chips before the action arrives', means: 'Usually weakness. The gesture is designed to discourage a bet, which means they would rather not face one.', caveat: 'Strong against recreational players, close to useless against regulars who know the tell exists and use it deliberately.' },
  { tell: 'Sudden stillness after betting', means: 'Often strength. Players with weak hands tend to control their movement; players with strong hands relax and then freeze when the pressure lands.', caveat: 'Individually variable. Establish a baseline for that specific player before acting on it.' },
  { tell: 'Talking during a hand', means: 'Against most recreational players, genuine chattiness correlates with strength — comfortable players talk. Forced or rehearsed speech more often indicates a bluff.', caveat: 'Some players use speech deliberately. Weight it low against anyone experienced.' },
  { tell: 'Glancing at chips immediately after the flop', means: 'They connected. The instinctive check of how much they can bet happens before the conscious decision to hide it.', caveat: 'One of the more reliable physical tells, but it only fires on the flop and only once.' },
  { tell: 'A bet placed forcefully or slammed down', means: 'Usually weakness. Aggression in the physical gesture often substitutes for confidence in the hand.', caveat: 'Some players simply bet that way every time. Baseline first.' },
  { tell: 'Flared nostrils or visible pulse in the neck', means: 'Genuine physiological arousal, which correlates with a big hand far more often than with a bluff.', caveat: 'Also correlates with a big bluff. Read it as "this pot matters to them", not as "they are strong".' },
  { tell: 'Protecting cards more carefully than usual', means: 'They intend to play the hand. A deviation from their normal card handling is worth noting.', caveat: 'A change from baseline, not an absolute. Some players always guard their cards.' },
  { tell: 'An immediate, effortless call', means: 'Usually a medium-strength hand. Genuinely strong hands consider raising; genuinely weak hands consider folding. Neither is instant.', caveat: 'One of the most reliable live reads, and it transfers directly to online timing.' },
]

export const ONLINE_TELLS: Tell[] = [
  { tell: 'Instant call', means: 'A medium-strength hand with an easy decision — typically a bluff-catcher they never intended to fold or raise.', caveat: 'The single most reliable online tell. A strong hand considers raising; a weak one considers folding.' },
  { tell: 'Instant bet on the river', means: 'Frequently a planned bluff. The decision was made on an earlier street, so no deliberation is needed when the moment arrives.', caveat: 'Also consistent with a nutted hand betting for value. Weigh it with the board texture.' },
  { tell: 'Long pause followed by a small bet', means: 'Genuine uncertainty with a marginal hand. They considered checking and chose a size that limits the damage.', caveat: 'Some players use a deliberate delay to represent difficulty. More common at higher stakes.' },
  { tell: 'Long pause followed by a large raise', means: 'Usually genuine strength. Players rarely construct elaborate bluffs slowly — the tank is real deliberation about how much to extract.', caveat: 'Timing-based deception is a real tactic among strong regulars. Discount it against them.' },
  { tell: 'Unusual bet sizing that breaks their own pattern', means: 'A deviation from a player\'s habitual sizing is information. An odd size often accompanies an unusual hand strength.', caveat: 'Track their sizes across a session first. The tell is the deviation, not the size.' },
  { tell: 'Min-raising the river', means: 'Almost always value from a player who wants a call. Very few bluffs choose the smallest possible raise.', caveat: 'At low stakes, occasionally a misclick or a misunderstanding of the interface.' },
  { tell: 'Auto-check button used (instant check)', means: 'They pre-selected the action before seeing the card, which usually means a hand they had already given up on.', caveat: 'Only visible when the check arrives faster than a human reaction. Requires attention.' },
  { tell: 'Sudden change in table count or sitting out', means: 'Tilt or distraction. A player who just added four tables or lost a big pot is playing worse than their baseline.', caveat: 'Environmental rather than hand-specific. Adjust your whole approach, not one decision.' },
]
