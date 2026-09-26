import type { Game } from '../types'

export const PLO: Game = {
  slug: 'pot-limit-omaha',
  name: 'Pot-Limit Omaha',
  short: 'PLO',
  family: 'omaha',
  structures: ['PL'],
  hiLo: 'hi',
  difficulty: 4,
  bluffRating: 4,
  tagline: 'Four cards, six two-card combinations, and nut hands that get beaten constantly.',
  blurb:
    "Omaha looks like Hold'em with extra cards. It is not. You must use exactly two of your four hole cards and exactly three from the board, which means your four cards are really six separate two-card hands. Equities run much closer together, the nuts change on every street, and the pot-limit betting cap is the only thing stopping the game from being pure chaos.",
  players: '2–9',
  deck: '52 cards',
  deal: { hole: 4, board: [3, 1, 1], seats: 6, note: 'Use exactly 2 hole + exactly 3 board' },
  rankingSet: 'standard',
  rankingNote:
    'Standard high-hand rankings apply, but the "exactly two from your hand" rule changes what you actually hold. Four hearts in your hand is not a flush draw — you can only ever use two of them.',
  depth: 'full',
  rules60: [
    { stage: 'preflop', title: 'Four cards each', body: 'Blinds are posted and every player receives four private cards instead of two. Betting begins left of the big blind. The pot-limit cap means the largest legal raise is the size of the pot after your call.' },
    { stage: 'flop', title: 'The flop — and the two-card rule', body: 'Three community cards. From here on, remember the rule that defines the game: you must use EXACTLY two of your four hole cards and EXACTLY three board cards. No more, no fewer.' },
    { stage: 'turn', title: 'The turn', body: 'A fourth community card, and another betting round. Because pots grow geometrically under pot-limit, the turn is usually the street where the stack-to-pot ratio decides whether anyone can fold.' },
    { stage: 'river', title: 'The river', body: 'The final community card. In Omaha the nuts are almost always possible, and someone usually has them — which makes river bluffing a precision instrument rather than a blunt one.' },
    { stage: 'showdown', title: 'Showdown — count it twice', body: 'Make the best five-card hand using exactly two hole cards and exactly three board cards. If the board shows four spades and you hold one spade, you do NOT have a flush. This single rule accounts for most beginner showdown errors.' },
  ],
  strategy: {
    thesis:
      "The whole game is about the nuts and how often you can make them. In Hold'em, top pair is frequently the best hand. In Omaha, top pair is almost never the best hand at showdown in a contested pot. Play hands where all four cards work together, and be far more willing to fold big-but-not-nut holdings than your instincts allow.",
    startingHands: [
      { tier: 'Premium', hands: 'AAKKds, AAJTds, AAKQds, AAQQds, KKQJds ("ds" = double-suited)', action: 'Raise and re-raise. These want to build a pot preflop.', note: 'Double-suited means two suits appear twice in your hand, giving you two separate flush possibilities. AAKKds is roughly a 3:2 favourite against a random hand — a smaller edge than AA in Hold\'em, which tells you a lot about the game.' },
      { tier: 'Strong rundowns', hands: 'JT98ds, KQJTds, T987ds, QJT9ds', action: 'Open from most positions, call raises in position.', note: 'A connected four-card run makes more straights than any other shape. JT98 flops a straight or a wrap draw remarkably often — this is where Omaha equity actually comes from.' },
      { tier: 'Big pairs with support', hands: 'AAxx with a suited ace, KKxx with connectors, QQJT', action: 'Playable, but the side cards decide everything.', note: 'AA72 rainbow is a trap hand. It looks like aces and plays like two dead cards attached to a pair that will be outdrawn. AAKQ double-suited is a monster. Same pair, entirely different hand.' },
      { tier: 'Suited aces', hands: 'A♠K♠xx, A♥Q♥Jx', action: 'Good, because the nut flush is genuinely nut.', note: 'Nut-flush potential is worth far more in Omaha than in Hold\'em because second-best flushes get paid off and then stacked. Non-nut flush draws are a leak, not an asset.' },
      { tier: 'Playable', hands: 'Double-suited connected hands with one gap, medium rundowns, KQJx suited', action: 'Open in position, fold to heavy action.', note: 'These hands want cheap multiway flops and flexibility, not a big preflop pot.' },
      { tier: 'Fold these', hands: 'Any hand with a dangler, three of a kind in your hand, three-card flushes, AA with two low rainbow side cards', action: 'Fold. A "dangler" is a card that does not connect with the other three.', note: 'K-K-K-2 is effectively a two-card hand — you can only use two kings, so the third is dead. Same for three cards of one suit: the third is worthless. Counting your live combinations before you play is the fastest way to improve at Omaha.' },
    ],
    position: {
      heading: 'Position matters more here, not less',
      body:
        "Because equities run so close in Omaha, the ability to control the size of the pot is worth more than it is in Hold'em. A hand with 55% equity is a big favourite in Omaha terms, and the difference between realising that equity and not realising it is almost entirely positional.",
      example:
        "You hold J♠T♠9♥8♥ on the button against a big-blind caller. The flop comes Q♦ 7♣ 2♠. You have a gutshot and two backdoor flush draws — maybe 25% equity. In position you can check behind, see the turn for free, and fire if a 9, T, J or a heart or spade arrives. Out of position, you must either bet into a range that calls or check and face a bet with a hand that cannot continue. The same 25% is worth real money in one seat and almost nothing in the other.",
      bullets: [
        'Open tighter from early position than a Hold\'em player expects — roughly 15% of hands. Weak Omaha hands are much weaker than weak Hold\'em hands.',
        'Multiway pots are the norm, so hands that need to flop the nuts go up in value and hands that need to bluff go down.',
        'The pot-limit cap means you can take a flop more cheaply than in No-Limit. Use that to see flops in position, not out of it.',
      ],
    },
    betSizing: {
      heading: 'Pot-limit geometry decides the hand before the river',
      body:
        "Under pot-limit, a pot-sized bet on each street roughly quadruples the pot. Starting at 3bb preflop, a pot bet on the flop, turn and river gets you to well over 100bb — so full-pot betting on the flop is a commitment decision, not an information-gathering one. Work backwards from the river before you fire the flop.",
      example:
        "Pot is 30 on the flop and you both have 200 behind. Bet pot (30), they call — pot is 90. Bet pot (90), they call — pot is 270 and you have 80 left. You are now committed with whatever you have. If your hand was a bare nut-flush draw, you have just turned a drawing hand into an all-in for your stack on a street where you might be drawing to half the pot. Half-pot and two-thirds sizings keep your options alive.",
      bullets: [
        'Preflop: raise to pot from late position with premium hands; limping is far more defensible in Omaha than in NLHE, especially multiway.',
        'Flop: 50–75% is the workhorse. Full pot is a commitment statement.',
        'Turn: this is where the nuts matter. Bet big with nut hands and nut draws, check almost everything else.',
        'River: polarise hard. Medium-strength hands in Omaha are close to worthless as value bets because callers have the nuts far more often.',
      ],
    },
    streets: [
      {
        heading: 'Preflop — count your combinations',
        body:
          "Four cards contain six two-card combinations. Before you play a hand, ask how many of those six actually do something. A hand where five or six combinations are live is a real hand. A hand where two are live is four cards pretending to be a hand.",
        example:
          "A♥K♥Q♠J♠ has six working combinations: two nut-flush draws, and straight potential from every pairing of A-K-Q-J. Compare A♥K♥7♣2♦: the A-K works, the A♥K♥ suited works, and the 7 and 2 do nothing at all. That is a two-combination hand with a premium-looking face.",
      },
      {
        heading: 'Flop — nut potential over current strength',
        body:
          "The question on an Omaha flop is not 'am I ahead?' but 'what am I drawing to, and is it the nuts?'. A hand that is currently best but drawing dead to improvement is in far more trouble than a hand that is currently behind with a wrap.",
        example:
          "On 9♠8♦2♥ you hold Q♣Q♥J♦T♠. You do not have a pair that matters, but J-T gives you an open-ended wrap: any Q, J, T, 7 or 6 improves you and several of those make the nuts. That hand has more equity than a bare pair of aces here, and much more importantly, it knows what it is drawing to.",
      },
      {
        heading: 'Turn — the nut check',
        body:
          "By the turn, ask one question: if I make my hand, will it be the nuts? Omaha punishes second-best holdings harder than any other variant, because the four-card structure means someone frequently holds the actual nuts and will happily stack you.",
        example:
          "Board is K♠ 9♠ 4♦ 7♠. You hold the Q♠ for a queen-high flush. In Hold'em that is a strong hand. In Omaha, with four players seeing the flop, someone holding the A♠ or J♠ alongside any second spade is extremely likely — and there is no version of this hand where you are happy putting your stack in. Check, call one reasonable bet at most, and be ready to fold to a raise.",
      },
      {
        heading: 'River — the nuts or a fold',
        body:
          "River decisions in Omaha compress toward two outcomes: you have the nuts or near-nuts and you are betting, or you do not and you are looking for a reason to fold. The middle ground that exists in Hold'em — the profitable bluff-catch — is much thinner here because callers show up with genuinely strong hands.",
        example:
          "You hold the second nuts on the river and face a large bet from a tight opponent who has shown no aggression all session. In Hold'em, second nuts is usually a comfortable call. In Omaha, against that specific opponent profile, the nut hand is in their range far more often than a bluff is. This is the fold that separates Omaha players from Hold'em players who moved over.",
      },
    ],
  },
  bluffing: {
    thesis:
      "Bluffing in Omaha is narrower and more technical than in Hold'em. Because everyone holds four cards, someone usually connects with the board, and your opponents' ranges contain far more genuinely strong hands. The bluffs that work are the ones with blockers to the nuts and a credible story — not the ones that rely on scary-looking boards.",
    whenToBluff: {
      heading: 'Bluff when you can block the nuts',
      body:
        "The single most reliable Omaha bluffing condition is holding a card that makes the nut hand impossible for your opponent. With four-card hands, ranges are wide but nut combinations are specific — and removing them changes the calculation far more than in Hold'em.",
      example:
        "The board runs out J♠ 9♠ 4♦ 7♠ 2♣ and you hold the A♠ with three other unrelated cards. You cannot make a flush yourself (you need two spades), but nobody else can hold the nut flush either. A large river bet here is credible, blocks the hand they most want to call with, and puts every king-high and queen-high flush in a genuinely miserable spot.",
      bullets: [
        'The bare ace of the flush suit is the premier Omaha bluffing card. It blocks the nuts without giving you a hand you would rather check.',
        'On a four-straight board, holding the card that completes the nut straight is the same idea.',
        'Blank boards where nobody can have much are far worse for bluffing than they look — your opponent also has nothing to fold that they were not already folding.',
      ],
    },
    semiBluffs: {
      heading: 'Semi-bluffs — where Omaha aggression actually lives',
      body:
        "This is the aggression that pays in PLO. A big wrap plus a flush draw can have more equity than the current best hand, which means betting is not a bluff at all — it is a value bet with extra fold equity attached. The four-card structure creates draws that simply do not exist in Hold'em.",
      example:
        "You hold J♥T♥9♠8♠ on a Q♦7♥2♥ flop. You have a gutshot to the nut straight (any K... no — any 8 or J completes nothing yet), a heart flush draw, and backdoor potential. Now change the flop to Q♦T♠2♥: you hold J♥T♥9♠8♠ for a pair of tens plus a wrap — any K, J, 9 or 8 improves you, which is 16 cards. A thirteen-out-plus wrap combined with a flush draw can run to 20+ outs and be a genuine favourite over top set. Betting that is correct because of the equity, and the folds are a bonus.",
      bullets: [
        'A "wrap" is a straight draw using three or four of your cards around the board cards — up to 20 outs, which does not exist in Hold\'em.',
        'Nut-flush draw plus a pair plus a gutshot is a routine 50%+ equity hand against top set. Get the money in.',
        'Non-nut draws are the trap: a king-high flush draw that completes into a losing hand costs more than it makes.',
      ],
    },
    blockers: {
      heading: 'Blockers do more work in Omaha than anywhere else',
      body:
        "With four cards you hold four blockers instead of two, and the nut hands are far more narrowly defined. Learning to read which specific cards make the nuts impossible for your opponent is the highest-return technical skill in the game.",
      example:
        "Board: 8♦ 7♣ 5♠ 2♥ K♦. The nut straight is 9-6. If you hold a 9 and a 6 yourself but they are the wrong suits to have made anything, you hold the exact cards that block the nut straight — and you should bluff, because the hand your opponent most wants to call with is now one they cannot hold. If instead you hold 9-9-x-x, you block only some of it and should be far more cautious.",
      bullets: [
        'Count nut combinations before bluffing: how many exact two-card holdings make the nuts, and how many do you block?',
        'Blocking the second nuts is worth much less — those hands often were not calling a big bet anyway.',
        'The same reading runs in reverse when you face a bet. If you hold the blocker to the nuts, their bluffing range is wider than it looks and you can call lighter.',
      ],
    },
    boardTexture: {
      heading: 'Board texture in a four-card game',
      body:
        "Omaha boards are almost never dry in the way Hold'em boards can be, because four-card hands connect with far more of the deck. The useful distinction is not wet versus dry — it is whether the nuts are currently available and whether they can change.",
      example:
        "A paired board like K♠K♦7♣ is one of the few genuinely good PLO bluffing textures. Trip kings require a specific card, full houses require specific pairs, and most four-card hands miss it completely. Compare J♠T♦9♣: the nuts is a specific straight, but half the table has a piece of it and someone will call. The paired board is the bluff; the connected board is the trap.",
      bullets: [
        'Paired boards: strong bluffing texture. Few hands connect and the nuts are narrowly defined.',
        'Monotone boards: bluff only with the ace of that suit. Without it, expect a call.',
        'Four-to-a-straight boards: heavy chopping and heavy calling. Poor bluffing texture unless you block the nut card.',
        'Double-paired boards: everyone plays the board or holds a tiny full house. Bluffs get called by hands that beat nothing.',
      ],
    },
    ratios: [
      { sizing: 'Half pot', pot: 'Bet 50 into 100', bluffShare: '20% bluffs / 80% value', why: 'Lower than the Hold\'em equivalent. Omaha callers arrive with stronger ranges, so a bet must be more value-weighted to stay profitable.' },
      { sizing: 'Two-thirds pot', pot: 'Bet 66 into 100', bluffShare: '25% bluffs / 75% value', why: 'The standard PLO river size. Enough to fold out non-nut hands without pricing them in.' },
      { sizing: 'Pot-sized', pot: 'Bet 100 into 100', bluffShare: '30% bluffs / 70% value', why: 'The maximum legal bet. Because it is capped, opponents know exactly the most you can bet — which makes the pot bet a more readable signal than an overbet in No-Limit.' },
      { sizing: 'Multiway pot bet', pot: 'Bet 100 into 100, two callers', bluffShare: '5–10% bluffs', why: 'Against two opponents in a game where everyone holds four cards, bluffing is close to hopeless. Bet the nuts and check the rest.' },
    ],
    targets: {
      heading: 'Target the player who understands nut hands',
      body:
        "The counterintuitive truth of PLO bluffing: the better your opponent, the more bluffable they are. A strong player knows their king-high flush is second best and will fold it. A recreational player does not know, and will call to find out. Most PLO games are full of the second type, which is why PLO is primarily a value-betting game.",
      bullets: [
        'BLUFF: experienced players who fold non-nut hands on scary run-outs. Their discipline is the thing you are exploiting.',
        'BLUFF: players who moved over from Hold\'em recently and are over-folding because they have been shown the nuts three times.',
        'DO NOT BLUFF: anyone who has shown down a non-nut flush. They will do it again.',
        'DO NOT BLUFF: multiway pots, essentially ever. The maths is far worse than in Hold\'em.',
        'DO NOT BLUFF: short stacks. In pot-limit, a short stack is committed much earlier than in No-Limit.',
      ],
      example:
        "In a typical low-stakes PLO game, the highest-EV adjustment is not finding more bluffs. It is betting your nut and near-nut hands larger and more often, because the field calls far too wide — and that same calling tendency is exactly what makes bluffing them unprofitable.",
    },
    pointless: {
      heading: 'Where Omaha bluffs go to die',
      body:
        "PLO punishes reflexive aggression harder than any other common variant. These are the spots where a bluff has close to zero expectation regardless of how good it looks.",
      bullets: [
        'MULTIWAY — the dominant reason PLO bluffs fail. Four-card hands mean each additional opponent is far more likely to hold a real piece than in Hold\'em.',
        'ON WET CONNECTED BOARDS — J-T-9 and 9-8-7 flops connect with nearly every rundown hand at the table.',
        'WITHOUT THE NUT BLOCKER on a flush or straight board — you are betting into exactly the hand that calls.',
        'AGAINST A PLAYER WHO CANNOT FOLD — the most common opponent type in low-stakes PLO. Value-bet them instead.',
        'WHEN YOUR STORY REQUIRES A HAND YOU CANNOT HAVE — remember the exactly-two rule. If the board is four spades and your line represented a flush, an observant opponent knows you needed two spades in hand.',
      ],
    },
  },
  leaks: [
    {
      leak: 'Forgetting the exactly-two rule at showdown',
      why: 'Years of Hold\'em instinct say "four hearts in my hand plus one on the board is a flush". In Omaha it is nothing at all.',
      exploit: 'You put money in drawing dead and do not realise it until the cards are turned over.',
      fix: 'Physically count: two from your hand, three from the board, every time. If the board is 4 spades and you hold one spade, you have no flush.',
    },
    {
      leak: 'Overvaluing bare aces',
      why: 'AA is the best starting hand in Hold\'em, so it feels like the best starting hand here too.',
      exploit: 'Opponents happily call your preflop raise with connected double-suited hands that flop 50%+ equity against you.',
      fix: 'AA72 rainbow is barely better than a random four cards after the flop. AA needs support — a suited ace, a connected side card, or a second pair. Fold the rest to a re-raise.',
    },
    {
      leak: 'Chasing non-nut flushes and straights',
      why: 'A flush is a strong hand in Hold\'em, and the habit transfers.',
      exploit: 'This is the single biggest source of stack transfers in PLO. Your king-high flush pays off the ace-high flush, hand after hand.',
      fix: 'In a multiway PLO pot, plan to fold non-nut flushes to significant turn and river aggression. It will feel wrong. Do it anyway.',
    },
    {
      leak: 'Playing hands with danglers',
      why: 'Three good cards look like a good hand, and the fourth card seems harmless.',
      exploit: 'You are effectively playing a three-card game against opponents playing a four-card game. The equity gap compounds every hand.',
      fix: 'Before calling, name what each of your four cards does. If one of them has no job, the hand is weaker than it looks. Fold it in early position.',
    },
    {
      leak: 'Full-pot betting the flop without a plan',
      why: 'Pot-limit makes the pot bet feel like the natural aggressive action.',
      exploit: 'Opponents with the nuts or a big wrap simply raise, and you are committed with a hand that cannot continue.',
      fix: 'Calculate the geometry first. If pot-betting three streets commits your stack, decide on the flop whether you want your stack in — and if the answer is no, bet 50–60% instead.',
    },
    {
      leak: 'Bluffing multiway',
      why: 'The habit carries over from heads-up Hold\'em pots where bluffs work often.',
      exploit: 'Someone always has a piece. Your bluff is a donation split between three players.',
      fix: 'In three-way-plus PLO pots, bet the nuts and near-nuts, and check everything else. Almost no exceptions at low and mid stakes.',
    },
  ],
  formats: {
    cash: [
      'PLO has far higher variance than Hold\'em because equities run close — a 60/40 favourite is a big edge here. Bankroll requirements are roughly double: budget 50+ buy-ins rather than 25.',
      'Deep stacks amplify nut-hand value enormously. At 200bb, the gap between the nuts and second nuts is the whole game.',
      'Short-stacked PLO is a different game: with 40bb, preflop all-ins dominate and the postflop nut skills barely matter.',
    ],
    tournament: [
      'PLO tournaments reward preflop aggression more than cash games because stacks are shallower relative to the pot-limit cap.',
      'ICM pressure is severe in PLO because busting is so easy — even premium hands are rarely better than a 60% favourite.',
      'Late-stage PLO tournaments compress toward preflop play. Learn which four-card shapes are actually favourites all-in, because the answer surprises Hold\'em players.',
    ],
    headsUp: [
      'Ranges widen dramatically and the nut principle relaxes — second-best hands win far more often heads-up.',
      'Position is even more dominant than in full-ring PLO because every pot is contested and the in-position player controls all three sizing decisions.',
      'Bluffing becomes genuinely viable heads-up, which is the opposite of full-ring PLO. The multiway maths that kills bluffs simply is not present.',
    ],
  },
  quiz: [
    {
      id: 'plo-q1',
      topic: 'the two-card rule',
      spot: 'River. You are deciding whether you have a flush.',
      hero: ['Ah', 'Kh', 'Qh', '2c'],
      board: ['9h', '7h', '4h', '3s', 'Jd'],
      pot: '120',
      stacks: '400 behind',
      question: 'The board shows three hearts and you hold three hearts including the A♥. What is your hand?',
      options: [
        { id: 'a', label: 'The nut flush — you have the A♥' },
        { id: 'b', label: 'The nut flush, using A♥ and K♥' },
        { id: 'c', label: 'A pair of nines' },
        { id: 'd', label: 'No flush and no pair — ace high' },
      ],
      answer: 'b',
      explain: {
        a: 'Right conclusion, wrong reasoning — and the reasoning is what matters. You do not have the nut flush because you hold the A♥; you have it because you can use exactly two hearts (A♥ and K♥) with exactly three board hearts.',
        b: 'Correct, and stated correctly. A♥ + K♥ from your hand, 9♥ 7♥ 4♥ from the board. That is the nut flush. The Q♥ is irrelevant — a third heart in your hand does nothing at all.',
        c: 'You hold no nine. This would be the answer if you were reading the board as in Hold\'em.',
        d: 'This is the mistake in the other direction — assuming the two-card rule blocks you when in fact you have exactly two usable hearts.',
      },
    },
    {
      id: 'plo-q2',
      topic: 'starting hand selection',
      spot: 'You are on the button. Action folds to you.',
      hero: ['As', 'Ad', '7c', '2h'],
      pot: '1.5',
      stacks: '100bb',
      question: 'You hold A♠A♦7♣2♥ — pocket aces, rainbow, with two unconnected low cards. How should you play this?',
      options: [
        { id: 'a', label: 'Raise pot and be happy to get all-in — aces are aces' },
        { id: 'b', label: 'Raise small, but plan to play cautiously postflop' },
        { id: 'c', label: 'Fold — aces without support are unplayable' },
        { id: 'd', label: 'Limp to disguise the hand' },
      ],
      answer: 'b',
      explain: {
        a: "This is the classic Hold'em leak imported into PLO. A♠A♦7♣2♥ is roughly a coin-flip against a good double-suited rundown like J♥T♥9♠8♠ once the money goes in — around 50-55%, not the 80% a Hold'em player expects.",
        b: 'Correct. The hand has real preflop equity and should raise, but the 7 and 2 are danglers and the rainbow means no flush potential. You will flop an overpair that is frequently behind or drawing thin. Raise, take the initiative, and be genuinely willing to fold on wet boards.',
        c: 'Too far. Aces still have the best raw preflop equity and playing from the button with initiative is profitable. The error is in how you play it after the flop, not in playing it.',
        d: "Limping the button folds your positional and initiative advantage for a disguise you do not need. In PLO your hand is disguised by definition — nobody can read four cards.",
      },
    },
    {
      id: 'plo-q3',
      topic: 'nut potential',
      spot: 'Flop decision, three-way pot.',
      hero: ['Kd', 'Td', '8s', '7s'],
      board: ['Qd', 'Jd', '4c'],
      pot: '60',
      stacks: '300 behind',
      question: 'You have a king-high flush draw and an open-ended straight draw. A player bets pot and another calls. What is the best action?',
      options: [
        { id: 'a', label: 'Raise pot — you have a huge combo draw' },
        { id: 'b', label: 'Call — the combined draw has plenty of equity' },
        { id: 'c', label: 'Fold — a non-nut flush draw multiway is a losing proposition' },
        { id: 'd', label: 'Call, and be ready to fold if a diamond arrives and someone fires again' },
      ],
      answer: 'd',
      explain: {
        a: 'Raising a NON-nut flush draw into a bet and a call is how stacks disappear in PLO. The A♦ is unaccounted for — it is not on the board and not in your hand, so either opponent can hold it alongside a second diamond. Build the pot and you are building it for them.',
        b: 'The right action for an incomplete reason. Calling is correct, but "plenty of equity" is exactly the thought that gets stacks in later. The straight draw is genuinely strong — an ace or a nine makes it, and the ace end is the nuts — but the flush draw is second-best at best.',
        c: 'Too tight. K♦T♦ with an open-ended straight draw to the nut straight is a real hand, and the price multiway is reasonable. Folding here gives up genuine equity.',
        d: 'Correct, and honest about which half of the draw is which. Your straight draw is excellent: an ace gives you A-K-Q-J-T, the nuts. Your flush draw is not — with the A♦ live in two opponents\' ranges, a fourth diamond is exactly the card that completes your hand and beats it at the same time. Planning that fold on the flop is what stops this hand costing a stack.',
      },
    },
    {
      id: 'plo-q4',
      topic: 'bluffing with blockers',
      spot: 'River, heads-up, your opponent checks.',
      hero: ['As', '9c', '6d', '3h'],
      board: ['Ks', 'Ts', '7s', '4d', '2c'],
      pot: '200',
      stacks: '600 behind',
      question: 'You have nothing. The board has three spades and you hold the bare A♠. Should you bluff?',
      options: [
        { id: 'a', label: 'No — you have no hand and no draw' },
        { id: 'b', label: 'Yes, bet large — the bare A♠ blocks the nut flush' },
        { id: 'c', label: 'Yes, bet small to get a cheap fold' },
        { id: 'd', label: 'No — they checked, so they are trapping with the nuts' },
      ],
      answer: 'b',
      explain: {
        a: 'Having no hand is the prerequisite for bluffing, not an argument against it. The question is whether the bluff works, and here the blocker makes a strong case.',
        b: 'Correct. This is the textbook PLO bluff. You cannot make a flush yourself — you need two spades — but crucially neither can they make the NUT flush, because you hold the A♠. Every K-high and Q-high flush in their range is now in a miserable spot facing a large bet, and those are exactly the hands that check the river.',
        c: 'A small bet gives their king-high flush an easy price to call. When you hold the nut blocker, size up — the whole point is to make their second-best flush pay a price it cannot afford.',
        d: 'They cannot be trapping with the nut flush, because you are holding the card that makes it. That is precisely why this bluff is good.',
      },
    },
    {
      id: 'plo-q5',
      topic: 'pot-limit geometry',
      spot: 'Flop, heads-up. You are considering how much to bet.',
      hero: ['Ac', 'Ah', 'Kd', 'Qs'],
      board: ['9s', '6h', '2d'],
      pot: '30',
      stacks: '200 behind',
      question: 'You have an overpair on a dry board with 200 behind and a pot of 30. If you bet pot on every street, roughly where do you end up?',
      options: [
        { id: 'a', label: 'All-in on the river with about 270 in the pot' },
        { id: 'b', label: 'Committed by the turn, with a large river bet remaining' },
        { id: 'c', label: 'Comfortably deep on the river with plenty of room' },
        { id: 'd', label: 'All-in on the turn' },
      ],
      answer: 'b',
      explain: {
        a: 'Close but understates it. Pot-limit compounds faster than this — the pot roughly triples each time a pot bet is called.',
        b: 'Correct, and this is the calculation every PLO player should do before firing. Bet 30 into 30, called: pot 90, you have 170 left. Bet 90, called: pot 270, you have 80 left — less than a third of the pot. You are committed by the turn with a bare overpair on a board where a wrap or a set is entirely plausible. Knowing this on the FLOP is what tells you to bet 15-20 instead of 30.',
        c: 'The opposite of what happens. Pot-limit geometry is far steeper than most players coming from No-Limit expect.',
        d: 'Not quite — you would have 80 behind after two pot bets, so the commitment happens on the turn but the chips do not all go in until the river.',
      },
    },
  ],
  seeAlso: ['omaha-hi-lo', 'five-card-plo', 'big-o', 'no-limit-holdem'],
}
