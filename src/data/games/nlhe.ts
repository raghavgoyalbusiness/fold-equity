import type { Game } from '../types'

export const NLHE: Game = {
  slug: 'no-limit-holdem',
  name: "No-Limit Hold'em",
  short: 'NLHE',
  family: 'holdem',
  structures: ['NL'],
  hiLo: 'hi',
  difficulty: 3,
  bluffRating: 5,
  tagline: 'The default game of the modern era, and the most bluffable form of poker ever devised.',
  blurb:
    "Two cards each, five shared, and the freedom to bet everything you have at any moment. That last part is what separates No-Limit from every other variant: the threat of your whole stack is a weapon you carry on every street, whether or not you use it.",
  players: '2–10',
  deck: '52 cards',
  deal: { hole: 2, board: [3, 1, 1], seats: 6 },
  rankingSet: 'standard',
  depth: 'full',
  rules60: [
    { stage: 'preflop', title: 'Blinds and the deal', body: 'Two players post forced bets — the small blind and the big blind. Everyone receives two private cards. Action starts left of the big blind and moves clockwise: fold, call, or raise.' },
    { stage: 'flop', title: 'The flop', body: 'Three community cards are turned face up at once. They belong to everybody. A new betting round begins with the first active player left of the button.' },
    { stage: 'turn', title: 'The turn', body: 'A fourth community card. Another betting round. Pots are usually decided here — this is the street where the stack-to-pot ratio collapses and commitment decisions get made.' },
    { stage: 'river', title: 'The river', body: 'The fifth and final community card. Last betting round. No more cards are coming, so every hand is now exactly what it is — there are no draws left, only made hands and bluffs.' },
    { stage: 'showdown', title: 'Showdown', body: 'Make the best five-card hand using any combination of your two cards and the five on the board. You may use both, one, or neither — "playing the board" is legal and splits the pot.' },
  ],
  strategy: {
    thesis:
      "Hold'em rewards two things above everything else: acting last, and being the player who can put in the final bet. Almost every other piece of strategy is downstream of those two. If you only fixed one thing about your game, tighten up from early position and widen up on the button — that single change is worth more than every fancy bluff you will ever run.",
    startingHands: [
      { tier: 'Premium', hands: 'AA, KK, QQ, AKs, AKo', action: 'Raise from any seat. Re-raise over opens. Happy to get all-in for 100bb.', note: "These are roughly the top 2.6% of hands. They play well because they flop top pair or better often and rarely face a hand that dominates them." },
      { tier: 'Strong', hands: 'JJ, TT, AQs, AJs, KQs, AQo', action: 'Open from any seat. Re-raise against late-position opens, call against early ones.', note: 'Strong but dominatable. AQo against a UTG open is exactly the hand that makes top pair and loses to AK. Position decides whether you raise or fold it.' },
      { tier: 'Pairs 99–22', hands: '99, 88, 77, 66, 55, 44, 33, 22', action: 'Open from middle position onward. Call raises only when stacks are deep enough to set-mine.', note: 'You flop a set about 1 in 8.5 times (11.8%). You need roughly 10-to-1 implied odds to call a raise purely to set-mine, which means at least 15bb behind for every 1.5bb you put in.' },
      { tier: 'Suited broadway & connectors', hands: 'KJs, QJs, JTs, T9s, 98s, 87s, KTs, QTs', action: 'Open from middle position, cutoff and button. Fold most of these to early-position opens at full ring.', note: 'Their value is not the flush — suited only adds about 2.5% equity. Their value is that they make straights and two pair in ways your opponent cannot see coming, and they can fold easily when they miss.' },
      { tier: 'Suited aces', hands: 'A5s, A4s, A3s, A2s', action: 'Excellent re-raise bluffs. Open from the cutoff and button.', note: 'The ace blocks AA and AK, so your opponent is measurably less likely to hold a premium. They also make the nut flush and the wheel — two ways to get paid when the bluff gets called.' },
      { tier: 'Fold these', hands: 'K2o–K9o, Q2o–Q8o, J2o–J7o, any unsuited card below ten with a gap', action: 'Fold. Everywhere. Every time.', note: "These are the hands that quietly drain a bankroll. They make second-best pairs and no draws. If you fold every offsuit hand below KTo for a month, your win rate will go up without you learning a single new concept." },
    ],
    position: {
      heading: 'Position is equity you do not have to pay for',
      body:
        "Acting last means you see what everyone else does before you commit a chip. You can check behind to see a free card, you can size your bet knowing whether they showed strength, and you can bluff with information instead of hope. The button is the most profitable seat at the table and the small blind is the least — and that gap has nothing to do with the cards.",
      example:
        "Take T9s. Against a typical button opening range it holds about 38% raw equity. From the big blind you will realise maybe 80% of that equity, because you act first on every street and have to guess. On the button you realise something closer to 115% of it, because you get to control the pot size and apply pressure when they show weakness. Same two cards, same raw equity, wildly different expected value. That difference is the entire case for positional play.",
      bullets: [
        'Open roughly 15% of hands from under the gun, 25% from the cutoff, and 45%+ from the button at 6-max.',
        'Against an out-of-position caller you can c-bet more often — they have to act first with an undefined range.',
        'The blinds are not "already invested". They are gone. Treat every big-blind defence as a fresh decision.',
      ],
    },
    betSizing: {
      heading: 'Size to the board, not to your hand',
      body:
        "The single biggest sizing tell in live poker is a player who bets big with strong hands and small with weak ones. Fix that by letting the board choose the size. On boards where your range is far stronger than theirs, bet small with everything. On boards where equities run close, bet big with a polarised range or check the whole thing.",
      example:
        "You raise from the button, the big blind calls, and the flop comes K♠ 7♦ 2♣. You hold far more kings than they do — they would have re-raised most of their AK and KK preflop, and they defended with connectors and small pairs. So you bet 25% of the pot with your entire range. It costs you almost nothing when it fails, and it folds out every 5-4 suited and every pocket three. Now change the flop to 9♥ 8♥ 5♠. Their calling range connects hard, yours does not. Here you check most hands and bet 70%+ only with the top and bottom of your range — sets, two pair, and your nut-flush draws as semi-bluffs.",
      bullets: [
        'Preflop open: 2.2–2.5x at 6-max online, 3x+ live, plus one big blind for each limper.',
        'Small c-bet (25–33%) on dry, static, high-card boards where you hold a range advantage.',
        'Large bet (66–100%) on dynamic, connected, low boards — and be prepared to check far more of your range there.',
        'Overbet (110%+) only on rivers where your range is capped in their eyes and yours is not.',
      ],
    },
    streets: [
      {
        heading: 'Preflop — the cheapest street to get right',
        body:
          "Preflop mistakes are small individually and enormous in aggregate, because you play the street every single hand. Build a range chart for each position and follow it for a month. Boredom is the price of a win rate.",
        example:
          "You open 2.5bb from the cutoff with A♦5♦ and the button 3-bets to 8bb. Calling out of position against a strong range is marginal. 4-betting to around 22bb is often better: the ace blocks AA and AK, and if they call you still have the nut-flush and wheel draws. Two ways to win beats one way to hope.",
      },
      {
        heading: 'Flop — decide what kind of hand you have',
        body:
          "Every flopped hand is one of four things: value that wants money in, a draw that wants a cheap card or fold equity, a bluff-catcher that wants a small pot, or air that wants to fold. Name it before you act. Most flop errors are a bluff-catcher being played like value.",
        example:
          "You hold A♣J♦ on J♠ 8♥ 4♣. That is top pair with a good kicker — genuinely strong. On J♠ T♥ 9♣ the same hand is a bluff-catcher, because every straight and two-pair combination in their range beats you and almost nothing worse will pay three streets. Identical cards, different category, different plan.",
      },
      {
        heading: 'Turn — the street that costs the most',
        body:
          "The turn is where stack-to-pot ratios collapse and where most losing players give away their edge. A second barrel should have a reason: either the card improved your range more than theirs, or you picked up equity, or their flop-calling range is now visibly weak. 'I bet the flop so I bet the turn' is not a reason.",
        example:
          "Flop K♠7♦2♣, you c-bet small and get called. The turn is the 5♥ — a genuine blank that changed nothing. Your opponent's range is still full of pocket pairs and weak kings that will not fold to a second small bet. Now the turn is the Q♥ instead: it adds queens, it adds heart draws to your range, and it puts a second overcard on the board. That is a card worth firing a bigger second barrel on.",
      },
      {
        heading: 'River — pure polarity',
        body:
          "There are no more draws. Every hand is either strong enough to bet for value or weak enough that betting only makes sense as a bluff. The middle of your range — second pair, weak top pair — should check almost always. Betting a bluff-catcher is the most common and most expensive river mistake in the game.",
        example:
          "Pot is 100 and you bet 66 as a bluff. You are risking 66 to win 100, so the bluff must work 66 / (66 + 100) = 39.8% of the time to break even. If you think this particular opponent folds about half the time here, it is clearly profitable. If you think they fold one time in four, you are lighting money on fire — no matter how good the story was.",
      },
    ],
  },
  bluffing: {
    thesis:
      "A bluff is a business proposition, not a personality trait. You are offering your opponent a price to fold, and the question is only ever whether enough of their range can accept it. Three conditions have to line up: your line has to credibly contain value hands, their range has to contain hands that cannot call, and ideally you should hold cards that make their strongest holdings less likely.",
    whenToBluff: {
      heading: 'The three conditions',
      body:
        "Bluff when all three are true, and be very suspicious of yourself when only one is. Most losing bluffs fail the second condition: the opponent simply does not have enough folding hands left, and no amount of confidence changes that.",
      bullets: [
        'CREDIBILITY — could you be here with a value hand? If you called the flop and turn passively then jammed the river, ask what value hand plays that way. If none does, neither should your bluff.',
        'FOLDING RANGE — does their range actually contain hands that fold? After they call two streets on a wet board, a large share of what is left is made hands. A third barrel needs them to have arrived with air, and often they did not.',
        'BLOCKERS OR EQUITY — do you hold cards that reduce their strong combinations, or do you still have outs? A bluff with neither is a pure coin-flip against their discipline.',
      ],
      example:
        "You raise preflop, c-bet a K-7-2 flop, and barrel a 5 turn. The river is the A♠ and you hold A♥Q♥ — you have showdown value, which is exactly the hand you should NOT bluff with. Now hold Q♥J♥ instead: no showdown value, and the Q and J block some of their K-Q and K-J. That is the hand that should fire.",
    },
    semiBluffs: {
      heading: 'Semi-bluffs — two ways to win',
      body:
        "A semi-bluff is a bet with a hand that is probably behind now but can improve. It wins immediately when they fold and wins later when it hits. That second path is why semi-bluffing is the most forgiving aggression in poker and where beginners should spend their bluffing budget.",
      example:
        "You hold 9♥8♥ on a K♥6♥2♠ flop. You have nine hearts to complete the flush, giving you roughly 35% equity to win by the river against a typical top-pair hand. If you bet 60% of the pot and they fold 40% of the time, you collect the pot outright almost half the time — and when they do call, you still win better than a third of those. Compare that to the same bet with 9♣8♣, which wins only when they fold. Same bet, dramatically different expectation.",
      bullets: [
        'Flush draw: 9 outs ≈ 36% by the river from the flop, 19% from the turn.',
        'Open-ended straight draw: 8 outs ≈ 32% by the river from the flop, 17% from the turn.',
        'Gutshot: 4 outs ≈ 17% by the river from the flop. Thin — needs real fold equity to justify barrelling.',
        'Combo draw (flush + straight): 15 outs ≈ 54% — you are often a favourite and should be raising, not calling.',
      ],
    },
    blockers: {
      heading: 'Blockers — removing their good hands',
      body:
        "Every card you hold is a card they cannot hold. When you choose which hands to bluff with, prefer the ones that remove the strongest parts of their range and keep the weakest parts intact. This is a small edge per hand and an enormous one over a year.",
      example:
        "The board is Q♠ J♠ 7♦ 4♠ 2♥ and you are considering a large river bluff. Holding the A♠ is close to ideal: it makes the nut flush impossible for them, so every flush they could have is one you can credibly represent beating. Holding K♠ is good too. Holding 9♦8♦ is bad — it blocks nothing they would fold with anyway, and worse, it blocks some of the missed straight draws you actually want them to still hold and fold.",
      bullets: [
        'Good bluff blockers remove value hands: the A♠ on a spade board, the A on an ace-high board, a K on a K-high board.',
        'Bad bluff cards "unblock" — they remove the busted draws you want them to be holding.',
        'The same logic runs in reverse when calling: if you hold the A♠, they have fewer nut flushes, so call wider.',
      ],
    },
    boardTexture: {
      heading: 'Board texture decides who is allowed to bet',
      body:
        "Boards are either static — the winner is unlikely to change — or dynamic, where the best hand on the turn is often not the best hand on the river. Static boards favour small, frequent bets. Dynamic boards favour big bets, big folds, and far more checking.",
      example:
        "K♦ 7♣ 2♠ is about as static as poker gets. Top pair now is almost certainly top pair at showdown, so the preflop raiser can bet 25% with their entire range and nobody can do much about it. 9♥ 8♥ 7♠ is the opposite: straights, flushes and two pairs are all live, the caller's range hits it harder than the raiser's, and the correct frequency for the preflop raiser to bet is far lower. Betting your whole range on that flop because 'I raised preflop' is a leak with a name: auto-c-betting.",
      bullets: [
        'Ace-high and king-high dry boards: the preflop raiser has a big range advantage. Bet small, bet often.',
        'Middling connected boards (T-9-8, 8-7-6): the caller has the advantage. Check a lot.',
        'Paired boards: fewer value hands exist for everyone, so bluffs get more credit. Good barrelling spots.',
        'Monotone boards: everyone slows down. Bluffs need the relevant suit blocker to be worth running.',
      ],
    },
    ratios: [
      { sizing: 'Small — 1/3 pot', pot: 'Bet 33 into 100', bluffShare: '20% bluffs / 80% value', why: 'They only need to win 25% of the time to call, so they call very wide. A small bet cannot carry many bluffs.' },
      { sizing: 'Medium — 1/2 pot', pot: 'Bet 50 into 100', bluffShare: '25% bluffs / 75% value', why: 'They need 25% equity; their minimum defence frequency is 67%. The standard workhorse sizing.' },
      { sizing: 'Two-thirds pot', pot: 'Bet 66 into 100', bluffShare: '29% bluffs / 71% value', why: 'Their minimum defence frequency drops to 60%. More folds means more bluffs are supportable.' },
      { sizing: 'Pot-sized', pot: 'Bet 100 into 100', bluffShare: '33% bluffs / 67% value', why: 'They need 33% equity and must defend 50%. A third of your betting range can be air.' },
      { sizing: 'Overbet — 2x pot', pot: 'Bet 200 into 100', bluffShare: '40% bluffs / 60% value', why: 'They must defend only 33%, so you can run many more bluffs — but your value hands must genuinely be near-nutted.' },
    ],
    targets: {
      heading: 'Who to bluff, and who never to bluff',
      body:
        "Bluffing is a transaction that requires a willing counterparty. Against a player who folds too much, your bluffs print money and your thin value bets do not. Against a calling station, the reverse is exactly true — and the correct adjustment is to stop bluffing entirely and bet your medium-strength hands for three streets.",
      bullets: [
        'BLUFF: tight-aggressive regulars who fold to river aggression, players who visibly hate variance, anyone who has just lost a big pot and wants to go home even.',
        'BLUFF: short-stacked players in a tournament near a pay jump, where a call risks their tournament life.',
        'DO NOT BLUFF: the player who has called down with ace-high twice already. They have told you.',
        'DO NOT BLUFF: anyone who is drunk, tilted, or playing for entertainment. They call to see what you had.',
        'DO NOT BLUFF: a short stack who is already pot-committed. They are not making a decision, they are announcing one.',
      ],
      example:
        "The single most profitable adjustment in low-stakes poker is not a better bluff. It is noticing that three of the eight players at the table never fold, and simply never bluffing those three again while value-betting them one street thinner.",
    },
    pointless: {
      heading: 'When bluffing is simply wrong',
      body:
        "There are spots where a bluff has close to zero expectation regardless of how well it is constructed. Recognising them is worth more than any advanced technique, because the money you do not lose spends exactly the same as the money you win.",
      bullets: [
        'MULTIWAY POTS — against three opponents, each needs to fold. If each folds 70% of the time, all three fold only 34% of the time. Bluffing multiway is roughly four times harder than heads-up and beginners consistently underestimate this.',
        'AGAINST A COMMITTED SHORT STACK — someone with 12bb who has put in 6 is calling. There is no decision to influence.',
        'ON BOARDS THAT SMASH THEIR RANGE — you raised, they called from the big blind, the flop is 7-6-5 with two hearts. That board belongs to them.',
        'WHEN YOUR STORY IS INCOHERENT — if no value hand plays the way you just played, an observant opponent will call with anything.',
        'AT MICRO STAKES, ROUTINELY — at the lowest levels, opponents call too much across the board. Tight, aggressive, value-heavy poker beats those games. Save the artistry for when it is needed.',
      ],
    },
  },
  leaks: [
    {
      leak: 'Defending the big blind far too wide',
      why: "The discount on the big blind is real but small, and it does not compensate for playing every street out of position with a weak range.",
      exploit: 'Observant opponents simply raise more hands from late position, knowing you will call and then fold on the flop.',
      fix: 'Defend against a 2.5x open with roughly the top 40% of hands at 6-max, and fold the offsuit trash regardless of the price. Losing 1bb cleanly beats losing 6bb slowly.',
    },
    {
      leak: 'Never folding top pair',
      why: 'Top pair feels strong because it is the hand you hoped to make. It is a one-pair hand, and by the river one pair loses most large pots.',
      exploit: 'Good players value-bet three streets against you with two pair and better, and stop bluffing you entirely.',
      fix: 'Before the river, ask what worse hand can call a bet. If the honest answer is "nothing", check. If they raise, believe them until they show you otherwise.',
    },
    {
      leak: 'Auto-c-betting every flop',
      why: 'It works for a while against passive players, which is exactly what makes it stick as a habit.',
      exploit: 'Anyone paying attention floats you in position with any two cards and takes the pot on the turn.',
      fix: 'Check your whole range on boards that favour the caller. On 8-7-6 two-tone from the big blind, checking most of your range is not weak — it is correct.',
    },
    {
      leak: 'Sizing tells — big with strong, small with weak',
      why: 'It feels natural to protect a big hand and to risk less with a weak one. It is also completely transparent.',
      exploit: "Your opponents stop paying you off on your large bets and raise you off your small ones. You have handed them a free readout of your hand strength.",
      fix: 'Pick sizes based on board texture, then use the same size with your entire range on that texture. Track your own sizes for a session and see how well they correlate with hand strength.',
    },
    {
      leak: 'Playing too many offsuit broadway hands from early position',
      why: 'AJo and KQo look strong in a vacuum. Against an early-position calling range they are dominated constantly.',
      exploit: "Opponents 3-bet you relentlessly from late position and you either fold too much or call and play a dominated hand out of position.",
      fix: 'Fold AJo and KQo under the gun at full ring. They are fine on the button. The card quality did not change — the number of players left to act did.',
    },
    {
      leak: 'Chasing draws without the price',
      why: 'The draw is visible and exciting; the pot odds calculation is invisible and boring.',
      exploit: 'Aware opponents simply bet large with their made hands, charging you more than your equity is worth, every single time.',
      fix: 'A flush draw on the turn is roughly 19% to hit. Against a pot-sized bet you need 33%. That is not close — fold, or raise as a semi-bluff. Calling is the worst of the three options.',
    },
  ],
  formats: {
    cash: [
      'Stacks reset every hand, so you can play a pure chip-EV strategy — the chips you win are worth exactly what the chips you risk are worth.',
      'Deep stacks (150bb+) raise the value of implied-odds hands: suited connectors and small pairs go up, offsuit big cards go down.',
      'Table selection is the largest single edge available. Two hours of choosing a better table beats twenty hours of studying solver outputs.',
    ],
    tournament: [
      'Chips have diminishing value — the chips you can win are worth less than the chips you can lose. That is ICM, and it makes correct play measurably tighter than cash-game play near pay jumps.',
      'Rising blinds force action. As your stack drops below 20bb, the push-fold chart replaces post-flop skill and should be memorised.',
      'Bubble play is the highest-leverage spot in the tournament: medium stacks must fold hands they would happily play in a cash game, because busting costs a guaranteed pay jump.',
    ],
    headsUp: [
      'Every hand is a blind-versus-blind battle, so ranges widen enormously. The button open range heads-up is 80%+ of hands.',
      'Position alternates every hand, which means aggression compounds. The player who fires more barrels usually wins over a long match.',
      'Reads matter more than charts because the sample size against one opponent builds fast. Adjust within twenty hands, not two hundred.',
    ],
  },
  quiz: [
    {
      id: 'nlhe-q1',
      topic: 'pot odds',
      spot: 'Cash game, 100bb effective. You hold 9♥8♥ on the turn with a flush draw.',
      hero: ['9h', '8h'],
      board: ['Kh', '6h', '2s', 'Jc'],
      pot: '100',
      stacks: '380 behind',
      question: 'Your opponent bets 100 into a pot of 100. You have nine hearts to the nut-ish flush and nothing else. What is the correct play on pure pot odds?',
      options: [
        { id: 'a', label: 'Call — a flush draw is always worth one bet' },
        { id: 'b', label: 'Fold — you are not getting the right price' },
        { id: 'c', label: 'Raise to 300 as a semi-bluff' },
        { id: 'd', label: 'Call, then bluff the river if you miss' },
      ],
      answer: 'b',
      explain: {
        a: 'Wrong. "Always worth one bet" is the single most expensive habit in low-stakes poker. A turn flush draw has nine outs out of 46 unseen cards — about 19.6% to hit on the river.',
        b: 'Correct on pure pot odds. You must call 100 to win 200, so you need 100/(100+200) = 33.3% equity. You have 19.6%. That is a large gap, and with no implied odds guaranteed it is a clear fold.',
        c: 'This can be right with sufficient fold equity, but the question asks about pure pot odds. As a pure equity call it fails — and raising with 19.6% needs them to fold roughly 40% of the time to break even.',
        d: 'This compounds the error: you make a mathematically losing call and then plan to invest more money into a spot where you will have missed.',
      },
    },
    {
      id: 'nlhe-q2',
      topic: 'bluff frequency',
      spot: 'River decision. Pot is 100, you have 400 behind.',
      hero: ['Qh', 'Jh'],
      board: ['Ks', '7d', '2c', '5h', 'As'],
      pot: '100',
      stacks: '400 behind',
      question: 'You missed everything and are considering a bluff of 66 into 100. How often must this bluff work to break even?',
      options: [
        { id: 'a', label: 'About 66% of the time' },
        { id: 'b', label: 'About 50% of the time' },
        { id: 'c', label: 'About 40% of the time' },
        { id: 'd', label: 'About 33% of the time' },
      ],
      answer: 'c',
      explain: {
        a: 'This confuses the bet size with the required success rate. You are not risking 66% of anything — you are risking 66 chips to win the 100 already there.',
        b: 'That would be the answer for a pot-sized bet, where you risk 100 to win 100.',
        c: 'Correct. Risk / (risk + reward) = 66 / (66 + 100) = 39.8%. If this opponent folds more than about four times in ten, the bluff is profitable. The Q and J also block some of their K-Q and K-J, which helps.',
        d: 'That would be the answer for a half-pot bet: 50 / (50 + 100) = 33%.',
      },
    },
    {
      id: 'nlhe-q3',
      topic: 'board texture',
      spot: "You raised from the button, big blind called. 6-max, 100bb.",
      hero: ['Ad', 'Qc'],
      board: ['9h', '8h', '7s'],
      pot: '6',
      stacks: '97 behind',
      question: 'The flop comes 9♥ 8♥ 7♠ and the big blind checks. What is the best default action with A♦Q♣?',
      options: [
        { id: 'a', label: 'Bet 75% of the pot — you have two overcards' },
        { id: 'b', label: 'Bet 25% of the pot with your whole range' },
        { id: 'c', label: 'Check back' },
        { id: 'd', label: 'Bet 33% and plan to barrel every turn' },
      ],
      answer: 'c',
      explain: {
        a: 'Two overcards are not a reason to bet into the one board texture that smashes a big-blind defending range. You have no pair and no real draw, while every straight, two pair and set is far more likely in their range than yours.',
        b: 'Small range-bets work on dry high-card boards where you hold the range advantage. This is the opposite board — you have a range DISadvantage here.',
        c: 'Correct. A♦Q♣ has no pair and not even a gutshot — you would need BOTH a jack and a ten to make a straight, which is a runner-runner. Meanwhile this flop connects with 9-8, 8-7, T-9, 6-5, J-T and every set far more often than it connects with a button opening range. Checking back keeps the pot small, keeps your checking range protected, and lets you see a turn for free.',
        d: 'Barrelling a board that belongs to your opponent is how stacks disappear. There is no turn card that turns A-Q into a hand that wants three streets here.',
      },
    },
    {
      id: 'nlhe-q4',
      topic: 'blockers',
      spot: 'River, heads-up, you are considering a large bluff.',
      hero: ['?', '?'],
      board: ['Qs', 'Js', '7d', '4s', '2h'],
      pot: '180',
      stacks: '500 behind',
      question: 'You will bluff big on this three-spade board. Which holding makes the BEST bluff?',
      options: [
        { id: 'a', label: 'A♠ 5♦ — you hold the ace of spades' },
        { id: 'b', label: '9♦ 8♦ — a busted straight draw' },
        { id: 'c', label: 'T♥ 9♥ — an open-ended draw that missed' },
        { id: 'd', label: 'K♣ Q♦ — you have a pair of queens' },
      ],
      answer: 'a',
      explain: {
        a: 'Correct. The A♠ makes it impossible for your opponent to hold the nut flush, so every flush you are representing is one they cannot have. You also hold no cards that block their busted draws — you want them to still be holding those, because those are the hands that fold.',
        b: 'A reasonable bluff candidate, but it blocks nothing in their value range. Worse, 9-8 removes some of the missed straight draws you actually want them to hold.',
        c: 'Same problem as the 9-8, and it blocks the T-9 and 9-8 hands that would have folded.',
        d: 'Never bluff with showdown value. A pair of queens beats every busted draw in their range — check and let them bluff into you.',
      },
    },
    {
      id: 'nlhe-q5',
      topic: 'multiway',
      spot: 'Three-way pot on the river. Both opponents have checked to you.',
      hero: ['7c', '6c'],
      board: ['Ah', 'Kd', '9s', '4c', '2d'],
      pot: '240',
      stacks: '600 behind',
      question: 'You have no pair and no draw — your two cards contribute nothing, so you are playing the board. Both opponents check. Should you bluff 160 into 240?',
      options: [
        { id: 'a', label: 'Yes — two checks means two weak hands' },
        { id: 'b', label: 'No — you need both players to fold, which is much harder than it looks' },
        { id: 'c', label: 'Yes, but bet small — 60 into 240' },
        { id: 'd', label: 'Yes — the ace-king board is scary enough to fold out anything' },
      ],
      answer: 'b',
      explain: {
        a: 'A check is not a fold. On an A-K-9-4-2 board, plenty of players check a weak ace to induce or to avoid a raise — and a weak ace is not folding to one bet.',
        b: 'Correct, and the maths is brutal. If each opponent folds 70% of the time, both fold only 0.70 × 0.70 = 49% of the time. Needing 160/(160+240) = 40% success is closer than it looks, but on an ace-high board where either player can hold an ace, the real fold rate is far below 70% each. Multiway bluffing needs a much better board than this.',
        c: 'A small bet on the river gives both players a cheap price to call with any pair. You get the worst of both worlds — no folds and no value.',
        d: 'The board is scary in the abstract, but two players saw it and chose to check rather than fold. Someone has a piece of it.',
      },
    },
  ],
  seeAlso: ['pot-limit-omaha', 'short-deck-holdem', 'limit-holdem', 'pineapple'],
}
