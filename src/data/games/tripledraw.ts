import type { Game } from '../types'

export const TRIPLE_DRAW: Game = {
  slug: 'deuce-to-seven-triple-draw',
  name: '2-7 Triple Draw',
  short: '2-7 TD',
  family: 'draw',
  structures: ['FL'],
  hiLo: 'lo',
  difficulty: 4,
  bluffRating: 5,
  tagline: 'Lowest hand wins, straights and flushes hurt you, and the number of cards your opponent draws is the whole story.',
  blurb:
    "Five cards each, three chances to throw cards away, and four betting rounds. You are trying to make the worst possible poker hand — but with a twist that catches everyone out: straights and flushes count AGAINST you and the ace is always high. The perfect hand is 7-5-4-3-2 in mixed suits. Because there is no board, all the information in the game comes from how many cards each player takes, which makes it the purest reading game in the mix.",
  players: '2–6',
  deck: '52 cards',
  deal: { hole: 5, draws: 3, seats: 6, note: 'Draw 3 times · lowest hand wins · aces are HIGH' },
  rankingSet: 'deuce7low',
  rankingNote:
    'Read your hand as if it were a high hand, then take the worst one. A-2-3-4-5 is an ACE-high hand here, not a wheel — the ace never plays low in 2-7.',
  depth: 'full',
  rules60: [
    { stage: 'deal', title: 'Five cards down', body: 'Blinds are posted and every player receives five private cards. There is no community board at any point — everything you know about an opponent comes from their betting and their draws.' },
    { stage: 'draw1', title: 'First betting round, then the first draw', body: 'Bet or fold, then each remaining player discards any number of cards and receives replacements. Standing pat means taking zero cards — a claim that your hand is already made.' },
    { stage: 'draw2', title: 'Second draw', body: 'Another betting round, then a second draw. Betting limits usually double from this point in the standard fixed-limit structure.' },
    { stage: 'draw3', title: 'Third and final draw', body: 'A third betting round, then the last draw. Any player still taking cards after this point is either genuinely behind or telling a story they cannot back up.' },
    { stage: 'showdown', title: 'Showdown — lowest hand wins', body: 'Final betting round, then cards are shown. The LOWEST five-card hand wins, with straights and flushes counting against you and aces always high. 7-5-4-3-2 unsuited is the nuts.' },
  ],
  strategy: {
    thesis:
      "Two things decide 2-7 Triple Draw: the quality of your starting three or four low cards, and your ability to read the number of cards your opponents take. Everything else is execution. A player who folds every hand without a deuce or a trey and pays close attention to draw counts will beat most casual games without ever making a creative play.",
    startingHands: [
      { tier: 'Pat hands', hands: '7-low and 8-low made hands (e.g. 7-5-4-3-2, 8-6-4-3-2)', action: 'Raise, stand pat, and bet every street.', note: 'A made seven is close to unbeatable and should be played fast. Check the hand twice for accidental straights — 7-6-5-4-3 is a straight and is worthless.' },
      { tier: 'One-card draws to a seven', hands: '2-3-4-7, 2-3-5-7, 2-4-5-7', action: 'Raise from any position. This is the premium drawing hand.', note: 'Holding 7-4-3-2 you need any 5, 6 or 8 to make an eight-or-better — twelve cards out of 47, roughly 25.5% per draw.' },
      { tier: 'One-card draws to an eight', hands: '2-3-4-8, 2-3-5-8, 2-4-5-8', action: 'Open from middle position onward, call raises in position.', note: 'Solid but noticeably weaker. Drawing to an eight means the best you can make is a hand that a seven beats — and sevens are common in this game.' },
      { tier: 'Two-card draws to a seven', hands: '2-3-7, 2-4-7, 3-4-7, 2-3-5', action: 'Playable from late position with three draws remaining. Fold with only one draw left.', note: 'With 2-3-7 you need two cards from the 4s, 5s, 6s and 8s without pairing. That lands about 9% of the time on any single draw — the hand survives only because you get three attempts.' },
      { tier: 'Marginal', hands: 'Two-card draws to an eight, three-card draws with 2-3 or 2-7', action: 'Late position and unopened pots only. Fold to a raise.', note: 'Three-card draws are the hands that quietly lose money. They look live and they are not — you will make a nine or worse most of the time.' },
      { tier: 'Fold these', hands: 'Any hand with a pair, any hand containing an ace, any hand with three cards nine or higher', action: 'Fold. The ace is your enemy in this game.', note: 'An ace is the highest card in the deck here. A-2-3-4-5 is not the wheel, it is an ace-high hand, and it loses to every nine-low at the table.' },
    ],
    position: {
      heading: 'Position lets you see the draw before you decide',
      body:
        "In a game with no board, the number of cards an opponent draws is the only public information there is. Acting last means you see that information before you commit chips — and unlike a community card, it cannot be shared. This is a larger positional edge than it is in Hold'em.",
      example:
        "You hold 8-6-4-3-2 — a made eight — on the second draw. If you act first, you have to decide whether to bet without knowing what they did. If you act last and they draw two cards, your made eight is now a huge favourite and you should bet and raise relentlessly. If instead they stand pat, your eight is suddenly a bluff-catcher and you should consider checking or even breaking the hand to draw at a seven. Identical cards, opposite plans, and position is the only thing that told you which.",
      bullets: [
        'The button and cutoff should open far wider than early seats — two-card draws are playable in position and unplayable out of it.',
        'Watch draw counts every hand, even the ones you folded. Building the habit costs nothing and it is the core skill.',
        'Out of position with a marginal made hand, checking is usually better than betting — you want to see their draw before the pot grows.',
      ],
    },
    betSizing: {
      heading: 'Fixed limit means frequency, not size',
      body:
        "2-7 Triple Draw is almost always played fixed-limit, which removes sizing as a lever entirely. Every bet is the same size, so the only decisions are how often to bet, raise, call and fold. That sounds simpler and is actually harder — you cannot buy folds with a big bet, so every bluff has to be earned by the story your draws tell.",
      example:
        "With a made nine on the final street against a one-card draw, the calculation is clean. Pot is 10 big bets and a bet costs 1. If they miss their draw roughly 70% of the time and fold, you win 10 units; the 30% of the time they hit, you lose 1 extra. Betting is clearly correct. Reverse it: if they stood pat and you hold a nine, betting turns a cheap showdown into an expensive one and they will raise you with every seven and eight.",
      bullets: [
        'Limits typically double after the second draw, so pots grow fastest on the last two streets. Plan to be in those streets with the best hand or a real draw.',
        'Raise to build pots with premium draws early, when bets are small and you get three attempts.',
        'A raise on the final street after standing pat is one of the strongest actions in the game. Treat an opponent doing it with genuine respect.',
      ],
    },
    streets: [
      {
        heading: 'Before the first draw — count your low cards',
        body:
          "Look for the deuce. Two-seven is the game's name for a reason: a deuce is the most valuable card in the deck and a hand without one is significantly weaker than the same hand with one. Then count how many cards you would keep — four is premium, three is playable, two is a fold.",
        example:
          "2-3-4-7-K and 3-4-5-8-K look similar. The first keeps 7-4-3-2 and draws one card to a made eight or better. The second keeps 8-5-4-3 and draws one card to a hand that a seven beats — and crucially, its best possible outcome is a hand the first hand routinely beats. Same shape, meaningfully different value.",
      },
      {
        heading: 'First draw — the cheap street',
        body:
          "Bets are small and you have two more draws to come, so this is where speculative hands are worth playing. It is also where most of the free information appears: everyone's first draw count tells you roughly what they started with.",
        example:
          "An opponent who draws three cards on the first draw has at most two low cards. Their range is enormous and weak, and they need to improve twice more to beat a modest made hand. Against that player, a one-card draw to an eight is a favourite and should be raised.",
      },
      {
        heading: 'Second draw — the decision street',
        body:
          "Limits double here in the standard structure, which makes this the street where hands are committed or abandoned. This is also where 'breaking' becomes a real option: discarding from a made hand to draw at a better one.",
        example:
          "You hold a made 10-8-6-4-2 and your opponent stands pat after raising. A ten-low will lose to almost every pat hand they could have. Breaking — throwing the ten and drawing one to make an eight-or-better — converts a hand that is probably drawing dead into one with roughly a 25% chance per draw to win outright. That is the right play, and it feels awful the first time.",
      },
      {
        heading: 'Final draw and the last bet — where the reads pay',
        body:
          "After the third draw everything is decided and only the betting remains. The number of cards each player took across all three draws is now a complete narrative, and it either supports the bet in front of you or it does not.",
        example:
          "Your opponent drew two, then one, then stood pat, and now bets. That is a coherent story of a hand improving into a made low, and it should be believed. Now consider an opponent who stood pat from the very first draw and bet every street: coherent too — unless they are snowing, which is exactly the bluff described below. The distinction is the single most valuable read in the game.",
      },
    ],
  },
  bluffing: {
    thesis:
      "2-7 Triple Draw has the most distinctive bluff in poker: the snow. You stand pat with a hand that has no chance of winning at showdown — often a pair — and bet as though you made a seven. It works because standing pat is a public, verifiable action that cannot be faked after the fact, and because your opponent has to decide whether to call with a hand that beats nothing except a bluff.",
    whenToBluff: {
      heading: 'The snow — standing pat with nothing',
      body:
        "A snow is a bluff made of information rather than chips. When you stand pat on the first or second draw, every opponent must assume you have a made low, because that is what standing pat means. Their drawing hands then have to improve past a hand you do not actually have. The bluff succeeds before the final bet is even made.",
      example:
        "You are dealt 2-2-3-4-7 — a pair of deuces, which is a genuinely bad hand. But you hold two deuces, a trey, a four and a seven: five of the cards your opponents most need. Standing pat and betting represents a made seven perfectly, and because you hold so many of their outs, their one-card draws are measurably less likely to get there. This is the ideal snowing hand: a worthless holding made of valuable cards.",
      bullets: [
        'Snow heads-up, almost never multiway. Every extra opponent is another person who might actually make a hand.',
        'Snow from position, so you see their draw counts before committing to the story.',
        'Snow when you hold their outs — deuces, treys, fours, fives and sevens. A pair of kings is a bad snow because it blocks nothing.',
        'Commit to the story. A snow that gives up on the last street has paid for the bluff and collected none of it.',
      ],
    },
    semiBluffs: {
      heading: 'Betting draws — aggression that is not really a bluff',
      body:
        "With three draws to come, a strong one-card draw is frequently a favourite over a weak made hand. Betting it is not a bluff at all — it is a value bet with fold equity attached, and it is the engine of winning play in this game.",
      example:
        "You hold 7-4-3-2 and draw one card. Against a single opponent drawing two cards, you are a clear favourite: you need any 5, 6 or 8 — twelve cards out of 47, about 25.5% per draw — and with three draws remaining you make an eight or better roughly 59% of the time. Meanwhile they must improve twice. Raising and betting here is correct on pure equity, and the fold equity is free money on top.",
      bullets: [
        'One-card draw to a seven with three draws left: roughly 59% to make an eight-or-better across the three attempts.',
        'One-card draw with only one draw left: about 25% — needs fold equity to justify continuing against real resistance.',
        'Two-card draw to a seven: about 9% per draw. Playable early, hopeless late.',
        'Always bet the draw against an opponent taking more cards than you. The equity is on your side even before they fold.',
      ],
    },
    blockers: {
      heading: 'Blockers are cards, not suits',
      body:
        "There is no board and no flush to block, so blockers in 2-7 work differently: the cards that matter are the low ranks your opponent needs to complete their draw. Holding deuces, treys and fours reduces their outs directly, which makes your bluff both more credible and more likely to survive their draw.",
      example:
        "You are snowing with 2-2-3-3-7. That hand is two pair — worthless at showdown. But it contains two deuces and two treys, which are eight of the lowest, most-needed cards in the deck. An opponent drawing one card to 8-6-5-4 needs a deuce, trey or seven, and you are holding four of those twelve outs. Your bluff is not only well-told, it is mechanically more likely to work.",
      bullets: [
        'Best snowing cards: deuces, treys, fours. Worst: face cards, which block nothing anyone wants.',
        'Holding a pair of low cards is the ideal snow — the hand is worthless AND it removes their outs.',
        'When you face a bet, apply this in reverse: if you hold three deuces yourself, their made low is less likely and you can call wider.',
      ],
    },
    boardTexture: {
      heading: 'There is no board — draw counts are the texture',
      body:
        "Substitute 'draw pattern' for 'board texture' and the usual reasoning applies. The sequence of how many cards each player took is the public information that either supports your story or contradicts it, and it is permanent — unlike a board card, nobody can misremember how many cards you drew.",
      example:
        "Pattern A: you draw one, one, one, and bet the river. That is an honest one-card draw that either got there or did not, and it is a credible bluffing line because your opponent cannot tell which. Pattern B: you draw three, then stand pat, then bet. That is a terrible story — nobody makes a seven from a three-card draw in one attempt, and an observant opponent will call you with anything. The cards you threw away are the argument for your bet.",
      bullets: [
        'Pat from the start: represents a made seven or eight. The strongest story and the classic snow.',
        'One-one-pat: represents a draw that completed. Very credible and the most common winning line.',
        'Three-then-pat: represents nothing plausible. Do not bluff this pattern.',
        'Drawing on the last draw and then betting: almost never believed. Save it for opponents who do not watch.',
      ],
    },
    ratios: [
      { sizing: 'Fixed limit, one bet', pot: 'Bet 1 into 8', bluffShare: 'Bluff far more than in big-bet games', why: 'You are risking 1 to win 8, so the bluff needs to work only 11% of the time. Fixed limit makes bluffs cheap and calls cheap — the result is high frequency on both sides.' },
      { sizing: 'Final street, heads-up', pot: 'Bet 1 into 10', bluffShare: '~9% break-even', why: 'One bet into a large limit pot is close to a free roll. This is why good players bet the last street with almost any hand that cannot win a showdown.' },
      { sizing: 'Bet and three-bet (snow)', pot: '3 bets into 10', bluffShare: '~23% break-even', why: 'Raising a pat hand as a snow risks more and demands more folds — but it also represents the top of your range, which is exactly what a snow is for.' },
      { sizing: 'Multiway, any size', pot: 'Any', bluffShare: 'Close to zero', why: 'Every additional drawing opponent must independently fail. Snowing into two opponents is a donation.' },
    ],
    targets: {
      heading: 'Snow the player who is watching',
      body:
        "A snow only works against someone who noticed you stood pat. Against a player who is not tracking draw counts, the entire mechanism of the bluff is invisible and you are simply betting a pair of deuces into a live hand. This makes 2-7 unusual: the bluff gets BETTER as your opponent gets better, up to a point.",
      bullets: [
        'SNOW: thinking players who track draws and fold made nines to pat aggression. Their discipline is the thing you are monetising.',
        'SNOW: an opponent who has just been shown a pat seven. The memory is doing your work for you.',
        'DO NOT SNOW: anyone who does not watch draw counts. The story lands on nobody.',
        'DO NOT SNOW: multiway pots. Ever.',
        'DO NOT SNOW: a player who stood pat themselves. They have a hand and no reason to believe you.',
        'DO NOT SNOW: twice in one session against the same opponent. The play depends entirely on being rare.',
      ],
      example:
        "The snow is the highest-variance, highest-reputation play in the mix. Run one successfully and show it, and your genuine pat hands get paid for the next two hours. That advertising value is frequently worth more than the pot you won.",
    },
    pointless: {
      heading: 'When the story cannot be told',
      body:
        "A bluff in 2-7 is a claim about a hand you do not have, told through the cards you did or did not take. When the claim is not plausible, no amount of confidence rescues it.",
      bullets: [
        'DRAWING CARDS ON THE FINAL DRAW AND THEN BETTING — you have told them you did not have a hand, and then bet as though you did. Nobody believes it.',
        'SNOWING WITH HIGH CARDS — K-K-Q-J-T stands pat just as convincingly, but blocks none of their outs, so their draws get there at full rate.',
        'MULTIWAY — three opponents each need to miss and fold. The compounding is brutal.',
        'AGAINST A PAT HAND — if they stood pat before you did, your snow is representing a hand they may already have beaten, and they are not folding.',
        'AT LOW STAKES WHERE NOBODY FOLDS — 2-7 is often played in mixed games by recreational players who call to see the snow. Value-bet them instead.',
      ],
    },
  },
  leaks: [
    {
      leak: 'Playing hands with an ace',
      why: "Every other lowball game treats the ace as the best low card. In 2-7 it is the worst card in the deck, and the habit is hard to break.",
      exploit: 'Opponents let you draw to hands that cannot win and take your money on the last street.',
      fix: 'Fold every hand containing an ace before the first draw unless you are stealing from the button. A-2-3-4-5 is an ace-high hand, not a wheel.',
    },
    {
      leak: 'Making a straight without noticing',
      why: 'Five low cards feel like a good low hand, and 7-6-5-4-3 looks perfect until you read it as a straight.',
      exploit: 'You stand pat, bet three streets, and turn over a hand that loses to a nine-low.',
      fix: 'Read every pat hand twice: check for a pair, check for five in sequence, check for five of one suit. Break 7-6-5-4-3 and draw.',
    },
    {
      leak: 'Never breaking a made hand',
      why: 'Discarding from a hand that is already made feels like going backwards.',
      exploit: 'You pay off every pat seven and eight with a ten-low that was never going to win.',
      fix: 'Against a confirmed pat hand with draws remaining, a ten-low is usually drawing dead. Break it and take a real chance at a seven or eight.',
    },
    {
      leak: 'Ignoring draw counts',
      why: 'It requires active attention in a game with long stretches of folding.',
      exploit: "You are playing with no information in a game where draw counts are the only information. Every decision is a guess and your opponents' are not.",
      fix: 'Say the count silently to yourself as each player draws. Within a session it becomes automatic, and it is the single highest-return habit in the game.',
    },
    {
      leak: 'Playing three-card draws',
      why: 'Three low cards look live, and there are three draws to come.',
      exploit: 'You invest small bets repeatedly in a hand that makes a nine or worse most of the time, and fold on the expensive streets.',
      fix: 'Two-card draws in late position, one-card draws anywhere. Three-card draws only in an unopened pot from the button.',
    },
    {
      leak: 'Snowing too often',
      why: 'The play is memorable, dramatic and satisfying when it works.',
      exploit: 'Observant opponents stop believing your pat hands entirely, which costs you value on every genuine seven you make for the rest of the session.',
      fix: 'Roughly once per session, heads-up, from position, holding their outs. The snow is a scalpel and it dulls with use.',
    },
  ],
  formats: {
    cash: [
      '2-7 Triple Draw is usually spread as a fixed-limit game, which keeps variance lower than big-bet formats but makes each individual decision smaller and each edge thinner.',
      'It appears most often inside mixed rotations — HORSE variants, 8-Game and 10-Game — where many opponents are playing it as their weakest game. That is where the money is.',
      'Because bets are fixed, the win rate comes from frequency edges accumulated over thousands of hands rather than from a few large pots.',
    ],
    tournament: [
      'Fixed-limit tournament structures force action as limits rise. Short stacks cannot apply pressure the way they can in No-Limit, so survival strategies work differently — you cannot shove to steal.',
      'With a short stack, prioritise hands that can be made in a single draw. Two- and three-card draws need multiple bets you cannot afford.',
      'Mixed-game tournaments reward playing your strong variants aggressively and your weak ones conservatively. If 2-7 is your best round, that is where to accumulate.',
    ],
    headsUp: [
      'Ranges widen enormously. Two-card draws and hands with a nine become routinely playable because your opponent is drawing too.',
      'Snowing becomes viable much more often — every pot is heads-up by definition, which removes the single biggest argument against it.',
      'Draw-count reading becomes extremely powerful with only one opponent to track, and adjustments should happen within a handful of hands rather than over a session.',
    ],
  },
  quiz: [
    {
      id: '27-q1',
      topic: 'hand reading',
      spot: 'You are deciding whether to stand pat before the final draw.',
      hero: ['7c', '6d', '5h', '4s', '3d'],
      pot: '8 bets',
      stacks: 'Deep',
      question: 'You hold 7-6-5-4-3 in mixed suits. Should you stand pat?',
      options: [
        { id: 'a', label: 'Yes — that is a seven-low, almost the nuts' },
        { id: 'b', label: 'No — that is a straight, which counts against you' },
        { id: 'c', label: 'Yes, and raise — only 7-5-4-3-2 beats it' },
        { id: 'd', label: 'No — you should break it and draw two' },
      ],
      answer: 'b',
      explain: {
        a: 'This is the most common and most expensive mistake in 2-7. Five cards in sequence is a straight, and in deuce-to-seven a straight counts against you — this hand loses to every nine-low at the table.',
        b: 'Correct. 7-6-5-4-3 is a straight. In 2-7 lowball, straights and flushes count against you, so this hand is close to worthless. Break it — discard the 7 or the 3 and draw one card at a genuine low.',
        c: 'The hand is not a seven-low at all. It is a straight, and it loses to hands that look far worse.',
        d: 'Right that you should break, wrong on the mechanics. Discard one card, not two — throwing the 7 leaves 6-5-4-3 drawing to any deuce or eight for a strong low.',
      },
    },
    {
      id: '27-q2',
      topic: 'draw odds',
      spot: 'Before the first draw. You hold 7-4-3-2 plus a king.',
      hero: ['7s', '4h', '3d', '2c', 'Kd'],
      pot: '3 bets',
      stacks: 'Deep',
      question: 'You discard the king and draw one card, with three draws available. Roughly how often will you make an eight-or-better?',
      options: [
        { id: 'a', label: 'About 25%' },
        { id: 'b', label: 'About 40%' },
        { id: 'c', label: 'About 59%' },
        { id: 'd', label: 'About 80%' },
      ],
      answer: 'c',
      explain: {
        a: 'That is the figure for a single draw, not for three. Holding 7-4-3-2 you need any 5, 6 or 8 — twelve cards out of 47 unseen, which is 25.5% on one attempt.',
        b: 'Between the one-draw and three-draw figures. The compounding is steeper than this.',
        c: 'Correct. Each draw is roughly 25.5% to hit one of your twelve outs. Missing all three is about 0.745³ ≈ 41%, so you make an eight-or-better around 59% of the time. That is why a one-card draw to a seven is a premium hand with three draws to come — and a marginal one with a single draw left.',
        d: 'Too optimistic. Twelve outs three times does not compound that far — each miss reshuffles nothing, and you only get three attempts.',
      },
    },
    {
      id: '27-q3',
      topic: 'snowing',
      spot: 'Heads-up, in position, before the first draw. You have a worthless hand.',
      hero: ['2c', '2d', '3h', '3s', '7d'],
      pot: '4 bets',
      stacks: 'Deep',
      question: 'You hold 2-2-3-3-7 — two pair, which is terrible here. Your opponent draws two cards. What is the strongest play?',
      options: [
        { id: 'a', label: 'Draw three and hope to make a low' },
        { id: 'b', label: 'Fold — two pair is unplayable' },
        { id: 'c', label: 'Stand pat and bet every street — snow it' },
        { id: 'd', label: 'Draw one and bet as though you are pat' },
      ],
      answer: 'c',
      explain: {
        a: 'Drawing three from a pair of deuces and a pair of treys gives up the one asset the hand has — the fact that it holds their outs — in exchange for a draw that makes a nine or worse most of the time.',
        b: 'Folding is defensible in a vacuum, but it misses what makes this specific hand special: it is worthless at showdown AND it holds four of the lowest cards in the deck.',
        c: 'Correct, and this is the textbook snow. The hand cannot win a showdown, so its only value is as a bluff. Standing pat represents a made seven perfectly. Crucially, you hold two deuces and two treys — eight of the cards your opponent needs most — so their two-card draw is measurably less likely to get there. Heads-up, in position, holding their outs: every condition for a snow is met.',
        d: 'Drawing one and then betting as if pat is an incoherent story. Your opponent saw you take a card. The whole mechanism of the snow is the verifiable act of standing pat.',
      },
    },
    {
      id: '27-q4',
      topic: 'breaking hands',
      spot: 'Before the final draw. Your opponent has been pat since the first draw and keeps betting.',
      hero: ['Th', '8d', '6c', '4s', '2h'],
      pot: '12 bets',
      stacks: 'Deep',
      question: 'You hold a made 10-8-6-4-2 and your opponent has been pat and betting from the start. What should you do?',
      options: [
        { id: 'a', label: 'Stand pat and call — a made ten has showdown value' },
        { id: 'b', label: 'Stand pat and raise — represent a seven' },
        { id: 'c', label: 'Break: discard the ten and draw one' },
        { id: 'd', label: 'Fold — you are drawing dead' },
      ],
      answer: 'c',
      explain: {
        a: 'A ten-low has showdown value only against a bluff. Against a genuine pat hand it loses to every seven, eight and nine — which is most of what a player who stood pat from the first draw actually holds.',
        b: 'Raising a ten into a confirmed pat hand builds a pot you will usually lose. If they call or re-raise, you have turned a small loss into a large one.',
        c: 'Correct. Discard the ten and you hold 8-6-4-2, drawing one card to any 3, 5 or 7 for a strong low — twelve outs, roughly 25% on this single draw. That is meaningfully better than the small chance a ten-low has of being good against a pat opponent. Breaking a made hand feels wrong and is frequently right.',
        d: 'Not dead — they could be snowing, and you do have a draw available. Folding a made hand with a live break is too passive.',
      },
    },
    {
      id: '27-q5',
      topic: 'reading draw patterns',
      spot: 'Final betting round. You hold a made nine and face a bet.',
      hero: ['9s', '7d', '5c', '4h', '2d'],
      pot: '14 bets',
      stacks: 'Deep',
      question: 'Your opponent drew three cards on the first draw, then stood pat on the second and third, and now bets. Call or fold?',
      options: [
        { id: 'a', label: 'Fold — they stood pat twice, so they have a made low' },
        { id: 'b', label: 'Call — the draw pattern does not support a strong hand' },
        { id: 'c', label: 'Fold — a nine never wins in this game' },
        { id: 'd', label: 'Raise — represent a seven' },
      ],
      answer: 'b',
      explain: {
        a: 'This treats standing pat as proof rather than as a claim. The claim has to be consistent with everything else they did, and here it is not.',
        b: 'Correct, and the reasoning is the whole skill of the game. Drawing THREE cards means they started with at most two low cards. To then stand pat on the second draw, they would need to have caught three perfect cards in one draw — which happens rarely enough that it cannot support their betting frequency. The pattern is far more consistent with a missed draw deciding to snow. A made nine is a comfortable call here.',
        c: 'A nine is a weak hand but it is not a losing one by definition. It beats every bluff, and in a pot this size you only need to be right a small fraction of the time.',
        d: 'Raising turns a good call into a guess. If they do hold a genuine low, you lose two extra bets; if they are snowing, they fold and you win nothing extra. Calling captures the value.',
      },
    },
  ],
  seeAlso: ['badugi', 'a5-triple-draw', 'five-card-draw', 'kansas-city-lowball'],
}
