import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SCENARIOS, LIVE_TELLS, ONLINE_TELLS, type Scenario } from '../data/bluffLab'
import { PokerTable } from '../three/PokerTable'
import { stageIndexFor } from '../three/dealPlan'
import { ActionBar } from '../components/ActionBar'
import { SectionHead, Callout, EquityBar, OddsBadge } from '../components/ui'
import { CardRow } from '../components/PlayingCard'
import { gradeBluff, type BluffGrade } from '../lib/api'
import { bluffBreakEven } from '../lib/poker'

const DEAL_FOR = (s: Scenario) => ({
  hole: s.hero.length,
  board: s.board.length ? [3, 1, 1] : undefined,
  draws: s.board.length ? undefined : 3,
  seats: 3,
  note: s.gameLabel,
})

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const [chosen, setChosen] = useState<string | null>(null)
  const [grade, setGrade] = useState<BluffGrade | null>(null)
  const [grading, setGrading] = useState(false)
  const [gradeError, setGradeError] = useState<string | null>(null)

  const picked = scenario.actions.find((a) => a.id === chosen)
  const best = scenario.actions.find((a) => a.id === scenario.best)!
  const deal = DEAL_FOR(scenario)
  // Derive the street from the scenario, not from whether a board exists —
  // otherwise a flop spot renders with all five community cards showing.
  const stageIndex = stageIndexFor(deal, scenario.stage)

  async function choose(id: string) {
    if (chosen) return
    setChosen(id)
    const action = scenario.actions.find((a) => a.id === id)
    if (!action) return
    setGrading(true); setGradeError(null)
    try {
      setGrade(await gradeBluff(scenario, action))
    } catch (e) {
      setGradeError((e as Error).message)
    } finally {
      setGrading(false)
    }
  }

  return (
    <div className="lab-scenario" id={scenario.id}>
      <div className="lab-head">
        <div>
          <p className="eyebrow">{scenario.concept}</p>
          <h3>{scenario.title}</h3>
          <p className="muted small">
            <Link to={`/games/${scenario.gameSlug}`}>{scenario.gameLabel}</Link> · {scenario.street} ·{' '}
            {scenario.position} vs {scenario.opponentPosition}
          </p>
        </div>
        {picked && (
          <span className={`lab-score num${picked.score >= 80 ? ' is-good' : picked.score >= 50 ? ' is-mid' : ' is-bad'}`}>
            {picked.score}
          </span>
        )}
      </div>

      <div className="lab-grid">
        <div className="lab-table">
          <PokerTable
            deal={deal}
            seed={scenario.id}
            stageIndex={stageIndex}
            showHero
            heroCards={scenario.hero}
            boardCards={scenario.board}
            height="clamp(280px, 38vh, 380px)"
          />
        </div>

        <div className="lab-info">
          <div className="lab-cards">
            <div>
              <span className="tiny faint">Your hand</span>
              <CardRow cards={scenario.hero} size="sm" />
            </div>
            {scenario.board.length > 0 && (
              <div>
                <span className="tiny faint">Board</span>
                <CardRow cards={scenario.board} size="sm" />
              </div>
            )}
          </div>

          <div className="lab-badges">
            <OddsBadge label="Pot" value={`${scenario.potBB}bb`} tone="brass" />
            <OddsBadge label="Behind" value={`${scenario.stackBB}bb`} />
          </div>

          <div className="lab-history">
            <span className="eyebrow">How we got here</span>
            <ol>{scenario.history.map((h) => <li key={h} className="small">{h}</li>)}</ol>
          </div>

          <div className="lab-opponent panel-quiet">
            <span className="eyebrow">Opponent</span>
            <p className="small">{scenario.opponentProfile}</p>
          </div>
        </div>
      </div>

      <p className="lab-prompt">{scenario.prompt}</p>

      <ActionBar
        choices={scenario.actions.map((a) => ({ id: a.id, label: a.label, kind: a.kind, sizing: a.sizing }))}
        onChoose={choose}
        chosen={chosen}
        disabled={!!chosen}
        potBB={scenario.potBB}
      />

      {picked && (
        <div className="lab-feedback">
          <div className={`lab-verdict${picked.id === scenario.best ? ' is-best' : ''}`}>
            <div className="lab-verdict-head">
              <span className={`badge ${picked.score >= 80 ? 'badge-brass' : 'badge-danger'}`}>
                {picked.id === scenario.best ? 'Best line' : picked.score >= 60 ? 'Playable' : 'Costly'}
              </span>
              <b>{picked.label}</b>
            </div>
            <p>{picked.verdict}</p>
            {picked.working && (
              <p className="lab-working num-inline"><span className="eyebrow">The maths</span> {picked.working}</p>
            )}
            {picked.id !== scenario.best && (
              <p className="lab-best small">
                <b>Best was:</b> {best.label} — {best.verdict}
              </p>
            )}
          </div>

          <EquityBar hero={picked.score} label="Decision quality" heroLabel="Your line" villainLabel="Left on the table" />

          {picked.sizing != null && (
            <div className="lab-badges">
              <OddsBadge
                label="Break-even fold rate"
                value={`${bluffBreakEven(picked.sizing * scenario.potBB, scenario.potBB).toFixed(1)}%`}
                tone="brass"
              />
              <OddsBadge label="Bet" value={`${Math.round(picked.sizing * scenario.potBB)}bb`} />
              <OddsBadge label="Sizing" value={`${Math.round(picked.sizing * 100)}% pot`} />
            </div>
          )}

          <div className="lab-debrief">
            <div><span className="eyebrow">Fold equity</span><p className="small">{scenario.debrief.foldEquity}</p></div>
            <div><span className="eyebrow">Pot odds</span><p className="small">{scenario.debrief.potOdds}</p></div>
            <div><span className="eyebrow">Their range</span><p className="small">{scenario.debrief.range}</p></div>
            <div><span className="eyebrow">The principle</span><p className="small"><b>{scenario.debrief.principle}</b></p></div>
          </div>

          <div className="lab-ai">
            <span className="eyebrow">AI bluff grade</span>
            {grading && <p className="small muted">Grading across story, fold equity, blockers, sizing and targeting…</p>}
            {gradeError && (
              <p className="small muted">
                {gradeError} The built-in grade above still applies — it is written into the scenario, not generated.
              </p>
            )}
            {grade && (
              <div className="grade">
                <div className="grade-overall">
                  <span className="grade-num num">{grade.overall}</span>
                  <span className="tiny faint">/100</span>
                  <span className={`badge ${grade.style === 'balanced' ? 'badge-brass' : 'badge-felt'}`}>{grade.style}</span>
                </div>
                <div className="grade-bars">
                  {([
                    ['Story', grade.storyConsistency], ['Fold equity', grade.foldEquity],
                    ['Blockers', grade.blockers], ['Sizing', grade.sizing], ['Targeting', grade.targeting],
                  ] as const).map(([label, v]) => (
                    <div key={label} className="grade-bar">
                      <span className="tiny">{label}</span>
                      <div className="grade-track"><div className="grade-fill" style={{ width: `${v}%` }} /></div>
                      <span className="tiny num">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="small">{grade.verdict}</p>
                <p className="small muted"><b>Maths:</b> {grade.maths}</p>
                <p className="small muted"><b>Better line:</b> {grade.betterLine}</p>
              </div>
            )}
          </div>

          <button className="btn btn-ghost btn-sm" onClick={() => { setChosen(null); setGrade(null); setGradeError(null) }}>
            Reset this spot
          </button>
        </div>
      )}
    </div>
  )
}

export function BluffLab() {
  return (
    <div className="section">
      <div className="wrap wrap-wide">
        <SectionHead
          as="h1"
          eyebrow="Bluff Lab"
          title="Five spots. Choose, then find out why."
          lede="Each scenario sits on the 3D table. Pick your action and you get the fold equity, the pot odds, the opponent's range and the principle underneath — plus an AI grade across five dimensions. The built-in grading works whether or not the AI coach is configured."
        />

        <Callout tone="brass" title="The one number that governs every bluff">
          <p>
            A bluff has to work often enough to pay for itself. Risk <code>B</code> to win a pot of
            <code> P</code> and the break-even fold rate is <code>B / (B + P)</code>. Bet two-thirds
            pot and you need folds {bluffBreakEven(66, 100).toFixed(1)}% of the time. Bet the pot and
            you need {bluffBreakEven(100, 100).toFixed(0)}%. Overbet to twice the pot and you need{' '}
            {bluffBreakEven(200, 100).toFixed(1)}%. Everything else in this lab is a way of estimating
            whether your opponent's range will clear that bar.
          </p>
        </Callout>

        <div className="lab-list">
          {SCENARIOS.map((s) => <ScenarioCard key={s.id} scenario={s} />)}
        </div>
      </div>

      <div className="wrap wrap-wide" id="tells">
        <SectionHead
          eyebrow="Tells"
          title="What people give away"
          lede="Tells are tie-breakers, not strategies. Establish a baseline for each player first — the read is always the deviation from their own normal, never an absolute. Against a strong opponent, weight them low: they know the list too."
        />
        <div className="grid grid-2">
          <div className="panel">
            <h3>Live physical tells</h3>
            <div className="tells">
              {LIVE_TELLS.map((t) => (
                <div key={t.tell} className="tell">
                  <b>{t.tell}</b>
                  <p className="small">{t.means}</p>
                  <p className="tiny faint">Caveat: {t.caveat}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <h3>Online timing and sizing tells</h3>
            <div className="tells">
              {ONLINE_TELLS.map((t) => (
                <div key={t.tell} className="tell">
                  <b>{t.tell}</b>
                  <p className="small">{t.means}</p>
                  <p className="tiny faint">Caveat: {t.caveat}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
