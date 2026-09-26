import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CoachChat } from '../components/CoachChat'
import { PokerTable, ReplayControls } from '../three/PokerTable'
import { SectionHead, Callout, OddsBadge } from '../components/ui'
import { CardRow } from '../components/PlayingCard'
import { analyseHand, type HandAnalysis } from '../lib/api'
import { GAMES } from '../data/games'

const SAMPLE = `PokerStars Hand #245789123456: Hold'em No Limit ($0.50/$1.00 USD)
Seat 3: Hero ($100.00 in chips)
Seat 5: Villain ($134.50 in chips)
Hero: posts small blind $0.50
Villain: posts big blind $1.00
*** HOLE CARDS ***
Dealt to Hero [Ah Qd]
Hero: raises $2.00 to $3.00
Villain: calls $2.00
*** FLOP *** [Kc 9h 4s]
Hero: bets $3.50
Villain: calls $3.50
*** TURN *** [Kc 9h 4s] [2d]
Hero: bets $11.00
Villain: calls $11.00
*** RIVER *** [Kc 9h 4s 2d] [7c]
Hero: bets $32.00
Villain: raises $48.00 to $80.00
Hero: folds`

function AnalysedHand({ hand }: { hand: HandAnalysis }) {
  const [stage, setStage] = useState(0)
  const deal = {
    hole: Math.max(2, hand.heroCards.length || 2),
    board: [3, 1, 1],
    seats: Math.max(2, Math.min(hand.seats || 2, 9)),
    note: hand.game,
  }
  // Community cards, in the order the streets reported them.
  const boardCards = hand.streets.flatMap((st) => st.cards)

  return (
    <div className="analysis">
      <div className="analysis-head">
        <div>
          <h3>{hand.game}</h3>
          <p className="muted small">
            {hand.heroPosition ? `Hero in the ${hand.heroPosition}` : 'Position not stated'}
            {hand.effectiveStack != null && ` · ${hand.effectiveStack} ${hand.units} effective`}
          </p>
        </div>
        <span className={`badge ${hand.confidence === 'high' ? 'badge-brass' : 'badge-danger'}`}>
          {hand.confidence} confidence parse
        </span>
      </div>

      <div className="analysis-table">
        <PokerTable
          deal={deal}
          seed="analysis"
          stageIndex={stage}
          showHero
          heroCards={hand.heroCards}
          boardCards={boardCards}
          height="clamp(280px, 40vh, 400px)"
        />
        <ReplayControls deal={deal} index={stage} setIndex={setStage} />
      </div>

      <div className="analysis-cards">
        {hand.heroCards.length > 0 && (
          <div><span className="tiny faint">Hero</span><CardRow cards={hand.heroCards} size="sm" /></div>
        )}
        {hand.finalPot != null && <OddsBadge label="Final pot" value={`${hand.finalPot} ${hand.units}`} tone="brass" />}
      </div>

      <p className="analysis-summary">{hand.summary}</p>

      <ol className="timeline">
        {hand.streets.map((s, i) => (
          <li key={i} className={`timeline-street${i === Math.min(stage, hand.streets.length - 1) ? ' is-active' : ''}`}>
            <button className="timeline-head" onClick={() => setStage(Math.min(i, 4))}>
              <span className="timeline-name">{s.street}</span>
              {s.cards.length > 0 && <CardRow cards={s.cards} size="xs" />}
              {s.potBefore != null && <span className="tiny faint num">pot {s.potBefore}</span>}
            </button>
            <p className="small muted timeline-note">{s.note}</p>
            <ul className="timeline-actions">
              {s.actions.map((a, j) => (
                <li key={j} className={`tl-action is-${a.verdict}`}>
                  <span className="tl-player">{a.player}</span>
                  <span className="tl-act">{a.action}{a.amount != null && <b className="num"> {a.amount}</b>}</span>
                  <span className={`tl-verdict is-${a.verdict}`}>{a.verdict}</span>
                  <span className="small muted tl-reason">{a.reason}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="grid grid-2">
        <Callout tone="danger" title="Biggest mistake">
          <p>{hand.biggestMistake}</p>
        </Callout>
        <Callout tone="brass" title="Key lesson">
          <p>{hand.keyLesson}</p>
        </Callout>
      </div>

      {hand.assumptions.length > 0 && (
        <div className="panel-quiet">
          <span className="eyebrow">Assumptions made</span>
          <ul className="tick-list">{hand.assumptions.map((a) => <li key={a} className="small">{a}</li>)}</ul>
        </div>
      )}
    </div>
  )
}

export function Coach() {
  const [tab, setTab] = useState<'chat' | 'hand'>('chat')
  const [text, setText] = useState('')
  const [hand, setHand] = useState<HandAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gameSlug, setGameSlug] = useState('')

  const game = GAMES.find((g) => g.slug === gameSlug)

  async function run() {
    if (text.trim().length < 12) return
    setLoading(true); setError(null); setHand(null)
    try { setHand(await analyseHand(text)) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="section coach-page">
      <div className="wrap wrap-wide">
        <SectionHead
          as="h1"
          eyebrow="AI Coach"
          title="Describe a hand. Get the truth about it."
          lede="Ask a strategy question, or paste a hand history and have every decision critiqued. The coach shows its arithmetic, says whether a line is balanced or exploitative, and never tells you a strategy wins."
        />

        <div className="coach-tabs">
          <button className={`chip${tab === 'chat' ? ' is-on' : ''}`} onClick={() => setTab('chat')}>Chat</button>
          <button className={`chip${tab === 'hand' ? ' is-on' : ''}`} onClick={() => setTab('hand')}>Hand analyser</button>
          {tab === 'chat' && (
            <select className="lib-select coach-game" value={gameSlug} onChange={(e) => setGameSlug(e.target.value)} aria-label="Load game context">
              <option value="">No game context</option>
              {GAMES.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
            </select>
          )}
        </div>

        {tab === 'chat' ? (
          <div className="coach-full">
            <CoachChat
              context={{
                gameName: game?.name,
                gameFamily: game?.family,
                banked: game?.banked,
                page: 'AI Coach',
              }}
            />
          </div>
        ) : (
          <div className="analyser">
            <div className="analyser-input">
              <label className="eyebrow" htmlFor="hh">Hand history or plain English</label>
              <textarea
                id="hh"
                rows={12}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"Paste a PokerStars or GGPoker hand history, or just describe it:\n\n\"I had ace queen on the button in a $1/$2 game, raised to $6, big blind called. Flop came king nine four rainbow. I bet, he called...\""}
              />
              <div className="flex-buttons">
                <button className="btn btn-primary" onClick={run} disabled={loading || text.trim().length < 12}>
                  {loading ? 'Rebuilding the hand…' : 'Analyse this hand'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setText(SAMPLE)}>Load a sample hand</button>
                {text && <button className="btn btn-quiet btn-sm" onClick={() => { setText(''); setHand(null); setError(null) }}>Clear</button>}
              </div>
              {error && <p className="coach-error">{error}</p>}
            </div>

            {hand && <AnalysedHand hand={hand} />}

            {!hand && !loading && (
              <Callout tone="info" title="What the analyser does">
                <p>
                  It parses the hand into structured data — streets, actions, pot sizes, stack depths —
                  rebuilds it on the 3D table so you can step through it street by street, and gives
                  every decision a verdict of good, marginal or mistake with the reasoning.
                </p>
                <p>
                  Anything it had to infer is listed explicitly under "assumptions", and the parse
                  confidence is stated. It will not invent a stack size you did not give it.
                </p>
              </Callout>
            )}
          </div>
        )}

        <div className="wrap-read" style={{ marginTop: 48, paddingInline: 0 }}>
          <Callout tone="brass" title="How to read the coach's answers">
            <p>
              <b>Balanced</b> means a line that cannot be exploited regardless of opponent — a safe
              default. <b>Exploitative</b> means a deliberate deviation to attack one opponent's
              tendency: higher expected value against them, and exploitable in return if they adjust.
              The coach labels which it is giving you, because they are different claims.
            </p>
            <p>
              Every odds claim comes with its arithmetic. If a number appears without working,
              treat it with suspicion and ask the coach to show it. And remember what the{' '}
              <Link to="/trainers#bankroll">variance simulator</Link> demonstrates: a correct decision
              and a good result are different things.
            </p>
          </Callout>
        </div>
      </div>
    </div>
  )
}
