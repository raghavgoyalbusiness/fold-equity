import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { SectionHead, Callout, OddsBadge, StatTile } from '../components/ui'
import { RangeGrid } from '../components/RangeGrid'
import { RANGES, expandedRaise, expandedCall, GRID_APPLICABLE_NOTE } from '../data/ranges'
import {
  equityFromFlop, equityFromTurn, potOddsNeeded, bluffBreakEven,
  minDefenceFrequency, DRAWS, fmtOdds,
} from '../lib/poker'
import { useStore, weakAreas } from '../lib/store'
import { buildStudyPlan, type StudyPlan } from '../lib/api'

// ---------------------------------------------------------------------------
// 1. Pot odds & equity trainer (timed drills)
// ---------------------------------------------------------------------------

interface Drill { pot: number; bet: number; outs: number; street: 'flop' | 'turn'; drawName: string }

function makeDrill(): Drill {
  const d = DRAWS[Math.floor(Math.random() * DRAWS.length)]
  const pot = [20, 30, 40, 50, 60, 80, 100][Math.floor(Math.random() * 7)]
  const frac = [0.33, 0.5, 0.66, 0.75, 1][Math.floor(Math.random() * 5)]
  const street = Math.random() < 0.5 ? 'flop' : 'turn'
  return { pot, bet: Math.round(pot * frac), outs: d.outs, street, drawName: d.name }
}

function PotOddsTrainer() {
  const [drill, setDrill] = useState<Drill>(() => makeDrill())
  const [answered, setAnswered] = useState<'call' | 'fold' | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const [timeLeft, setTimeLeft] = useState(15)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | null>(null)

  const needed = potOddsNeeded(drill.pot, drill.bet)
  const equity = drill.street === 'flop' ? equityFromFlop(drill.outs) : equityFromTurn(drill.outs)
  const correct: 'call' | 'fold' = equity >= needed ? 'call' : 'fold'

  const next = useCallback(() => {
    setDrill(makeDrill()); setAnswered(null); setTimeLeft(15)
  }, [])

  const answer = useCallback((choice: 'call' | 'fold') => {
    if (answered) return
    setAnswered(choice)
    setScore((s) => ({ right: s.right + (choice === correct ? 1 : 0), total: s.total + 1 }))
  }, [answered, correct])

  useEffect(() => {
    if (!running || answered) return
    timer.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { answer(correct === 'call' ? 'fold' : 'call'); return 0 } // time-out counts as wrong
        return t - 1
      })
    }, 1000)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [running, answered, answer, correct])

  return (
    <div className="trainer panel" id="pot-odds">
      <div className="trainer-head">
        <div>
          <p className="eyebrow">Trainer 01</p>
          <h3>Pot odds &amp; equity</h3>
          <p className="muted small">
            You face a bet with a draw. Do the pot odds justify a call? Fifteen seconds — at the
            table you get about that long before it becomes a tell.
          </p>
        </div>
        <div className="trainer-score">
          <StatTile value={`${score.right}/${score.total}`} label="Correct" />
        </div>
      </div>

      <div className="drill">
        <div className="drill-row">
          <OddsBadge label="Pot" value={`${drill.pot}bb`} tone="brass" />
          <OddsBadge label="They bet" value={`${drill.bet}bb`} />
          <OddsBadge label="Street" value={drill.street === 'flop' ? 'Flop (2 to come)' : 'Turn (1 to come)'} />
        </div>
        <p className="drill-hand">
          You hold a <b>{drill.drawName.toLowerCase()}</b> — <b className="num">{drill.outs} outs</b>.
        </p>

        {running && !answered && (
          <div className="drill-timer">
            <div className="drill-timer-bar" style={{ width: `${(timeLeft / 15) * 100}%` }} />
            <span className="num tiny">{timeLeft}s</span>
          </div>
        )}

        {!running ? (
          <button className="btn btn-primary" onClick={() => { setRunning(true); next() }}>Start drilling</button>
        ) : (
          <div className="drill-actions">
            <button className="action-btn action-fold" onClick={() => answer('fold')} disabled={!!answered}>Fold</button>
            <button className="action-btn action-call" onClick={() => answer('call')} disabled={!!answered}>Call</button>
          </div>
        )}

        {answered && (
          <div className={`drill-result${answered === correct ? ' is-right' : ' is-wrong'}`}>
            <b>{answered === correct ? 'Correct.' : 'Not quite.'}</b>
            <p className="small">
              You must call <b className="num">{drill.bet}</b> to win{' '}
              <b className="num">{drill.pot + drill.bet}</b>, so you need{' '}
              <b className="num">{needed.toFixed(1)}%</b> equity ({fmtOdds(needed)} against).
              With {drill.outs} outs and {drill.street === 'flop' ? 'two cards' : 'one card'} to come
              you have <b className="num">{equity.toFixed(1)}%</b>.{' '}
              {equity >= needed
                ? 'Equity exceeds the price, so calling is profitable on pot odds alone.'
                : 'Equity falls short of the price — fold, or raise as a semi-bluff. Calling is the worst of the three.'}
            </p>
            <button className="btn btn-ghost btn-sm" onClick={next}>Next drill →</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. Range viewer
// ---------------------------------------------------------------------------

function RangeViewer() {
  const [id, setId] = useState(RANGES[0].id)
  const [hover, setHover] = useState<string | null>(null)
  const range = RANGES.find((r) => r.id === id)!
  const raise = useMemo(() => expandedRaise(range), [range])
  const call = useMemo(() => expandedCall(range), [range])

  return (
    <div className="trainer panel" id="ranges">
      <div className="trainer-head">
        <div>
          <p className="eyebrow">Trainer 02</p>
          <h3>Preflop range viewer</h3>
          <p className="muted small">
            The 13×13 grid, by position. These are teaching baselines — simple enough to memorise
            and close enough to correct to win with.
          </p>
        </div>
      </div>

      <div className="range-tabs">
        {RANGES.map((r) => (
          <button key={r.id} className={`chip${r.id === id ? ' is-on' : ''}`} onClick={() => setId(r.id)}>
            {r.position}
            <span className="chip-count">
              {r.deck === 36 ? '6+' : r.action.startsWith('3-bet') ? '3B' : r.action.startsWith('Defend') ? 'BB' : 'RFI'}
            </span>
          </button>
        ))}
      </div>

      <div className="range-layout">
        <RangeGrid raise={raise} call={range.call ? call : undefined} deck={range.deck ?? 52} onCellHover={setHover} />
        <div className="range-side">
          <h4>{range.position} — {range.action}</h4>
          <p className="tiny faint">{range.gameLabel}</p>
          <p className="small">{range.note}</p>
          {hover && (
            <div className="panel-quiet range-hover">
              <b className="num">{hover}</b>
              <span className="small muted">
                {raise.has(hover) ? ' — raise' : call.has(hover) ? ' — call' : ' — fold'}
              </span>
            </div>
          )}
          <p className="tiny faint">{GRID_APPLICABLE_NOTE}</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. Outs counter
// ---------------------------------------------------------------------------

function OutsCounter() {
  const [outs, setOuts] = useState(9)
  const [pot, setPot] = useState(100)
  const [bet, setBet] = useState(66)

  const flop = equityFromFlop(outs)
  const turn = equityFromTurn(outs)
  const need = potOddsNeeded(pot, bet)

  return (
    <div className="trainer panel" id="outs">
      <div className="trainer-head">
        <div>
          <p className="eyebrow">Trainer 03</p>
          <h3>Outs counter</h3>
          <p className="muted small">
            The "rule of 4 and 2" says multiply outs by 4 on the flop and 2 on the turn. It is a good
            shortcut and it drifts high with many outs — the exact figures are below.
          </p>
        </div>
      </div>

      <div className="outs-controls">
        <label className="slider-row">
          <span className="small">Outs <b className="num">{outs}</b></span>
          <input type="range" min={1} max={21} value={outs} onChange={(e) => setOuts(Number(e.target.value))} />
        </label>
        <label className="slider-row">
          <span className="small">Pot <b className="num">{pot}</b></span>
          <input type="range" min={10} max={300} step={5} value={pot} onChange={(e) => setPot(Number(e.target.value))} />
        </label>
        <label className="slider-row">
          <span className="small">Their bet <b className="num">{bet}</b></span>
          <input type="range" min={5} max={400} step={5} value={bet} onChange={(e) => setBet(Number(e.target.value))} />
        </label>
      </div>

      <div className="outs-results">
        <StatTile value={`${flop.toFixed(1)}%`} label="From the flop" hint={`Rule of 4 says ${outs * 4}%`} />
        <StatTile value={`${turn.toFixed(1)}%`} label="From the turn" hint={`Rule of 2 says ${outs * 2}%`} />
        <StatTile value={`${need.toFixed(1)}%`} label="Equity needed" hint={`${fmtOdds(need)} against`} />
      </div>

      <div className={`outs-verdict ${turn >= need ? 'is-good' : 'is-bad'}`}>
        <b>{turn >= need ? 'Call is profitable on the turn.' : 'Fold, or raise as a semi-bluff.'}</b>
        <span className="small muted">
          {' '}Turn equity {turn.toFixed(1)}% vs {need.toFixed(1)}% required.
          {turn < need && flop >= need && ' Note that from the FLOP this call would be profitable — the street matters enormously.'}
        </span>
      </div>

      <div className="outs-table">
        {DRAWS.map((d) => (
          <div key={d.name} className={`outs-row${d.outs === outs ? ' is-on' : ''}`}>
            <button onClick={() => setOuts(d.outs)}>
              <span>{d.name}</span>
              <span className="num">{d.outs} outs</span>
              <span className="num faint">{equityFromFlop(d.outs).toFixed(0)}% / {equityFromTurn(d.outs).toFixed(0)}%</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. ICM basics
// ---------------------------------------------------------------------------

/** Malmuth-Harville ICM: probability-weighted finish positions. */
function icmEquity(stacks: number[], payouts: number[]): number[] {
  const result = new Array(stacks.length).fill(0)

  const walk = (remaining: number[], idxs: number[], place: number, prob: number) => {
    if (place >= payouts.length || prob < 1e-9) return
    const sum = remaining.reduce((a, b) => a + b, 0)
    if (sum <= 0) return
    for (let i = 0; i < remaining.length; i++) {
      const p = (remaining[i] / sum) * prob
      result[idxs[i]] += p * payouts[place]
      if (place + 1 < payouts.length) {
        const nextStacks = remaining.filter((_, j) => j !== i)
        const nextIdx = idxs.filter((_, j) => j !== i)
        walk(nextStacks, nextIdx, place + 1, p)
      }
    }
  }
  walk([...stacks], stacks.map((_, i) => i), 0, 1)
  return result
}

function ICMTrainer() {
  const [stacks, setStacks] = useState([50, 30, 15, 5])
  const payouts = [50, 30, 20]
  const totalChips = stacks.reduce((a, b) => a + b, 0)
  const equities = useMemo(() => icmEquity(stacks, payouts), [stacks])

  const setStack = (i: number, v: number) => setStacks((s) => s.map((x, j) => (j === i ? v : x)))

  return (
    <div className="trainer panel" id="icm">
      <div className="trainer-head">
        <div>
          <p className="eyebrow">Trainer 04</p>
          <h3>ICM basics</h3>
          <p className="muted small">
            Four players left, prizes of 50 / 30 / 20. Move the stacks and watch what the chips are
            actually worth. This is why correct tournament play is tighter than cash play.
          </p>
        </div>
      </div>

      <div className="icm-grid">
        {stacks.map((s, i) => {
          const chipShare = (s / totalChips) * 100
          const icmShare = equities[i]
          const gap = icmShare - chipShare
          return (
            <div key={i} className="icm-player">
              <div className="icm-player-head">
                <b>Player {i + 1}</b>
                <span className="num">{s} chips</span>
              </div>
              <input
                type="range" min={1} max={80} value={s}
                onChange={(e) => setStack(i, Number(e.target.value))}
                aria-label={`Player ${i + 1} stack`}
              />
              <div className="icm-bars">
                <div className="icm-bar">
                  <span className="tiny faint">Chip share</span>
                  <div className="icm-track"><div className="icm-fill is-chips" style={{ width: `${chipShare}%` }} /></div>
                  <span className="tiny num">{chipShare.toFixed(1)}%</span>
                </div>
                <div className="icm-bar">
                  <span className="tiny faint">Prize equity</span>
                  <div className="icm-track"><div className="icm-fill is-icm" style={{ width: `${icmShare}%` }} /></div>
                  <span className="tiny num">{icmShare.toFixed(1)}%</span>
                </div>
              </div>
              <p className={`tiny ${gap < -0.5 ? 'icm-neg' : gap > 0.5 ? 'icm-pos' : 'faint'}`}>
                {gap > 0.5 ? `Worth ${gap.toFixed(1)}% MORE than their chips suggest` :
                 gap < -0.5 ? `Worth ${Math.abs(gap).toFixed(1)}% LESS than their chips suggest` :
                 'Roughly chip-neutral'}
              </p>
            </div>
          )
        })}
      </div>

      <Callout tone="brass" title="What the numbers are telling you">
        <p>
          The big stack's prize equity is always <i>lower</i> than their chip share, and the short
          stack's is always <i>higher</i>. That is ICM in one line: chips you can win are worth less
          than chips you can lose, because the prize ladder is flatter than the chip distribution.
        </p>
        <p>
          The practical consequence is that a marginal call which is break-even in chips is a{' '}
          <b>losing</b> call in prize money. Near a pay jump, fold hands you would happily stack off
          with in a cash game — especially as a medium stack, who has the most to lose and the least
          to gain from a coin flip.
        </p>
      </Callout>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5. Bankroll calculator + variance simulator
// ---------------------------------------------------------------------------

/** Box-Muller normal sample. */
function gauss(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function BankrollTrainer() {
  const [winRate, setWinRate] = useState(3)      // bb/100
  const [stdDev, setStdDev] = useState(90)       // bb/100
  const [hands, setHands] = useState(50000)
  const [seed, setSeed] = useState(0)

  const runs = useMemo(() => {
    void seed
    const buckets = Math.min(120, Math.max(20, Math.round(hands / 500)))
    const handsPerBucket = hands / buckets
    const out: number[][] = []
    for (let r = 0; r < 12; r++) {
      const path: number[] = [0]
      let bb = 0
      for (let i = 0; i < buckets; i++) {
        const units = handsPerBucket / 100
        bb += winRate * units + gauss() * stdDev * Math.sqrt(units)
        path.push(bb)
      }
      out.push(path)
    }
    return out
  }, [winRate, stdDev, hands, seed])

  const expected = (winRate * hands) / 100
  // 95% confidence interval on the final result.
  const sd = stdDev * Math.sqrt(hands / 100)
  const lo = expected - 1.96 * sd
  const hi = expected + 1.96 * sd
  /**
   * Bankroll for a chosen risk of ruin, in big blinds:
   *   B = σ² · ln(1/r) / (2 · WR)      (σ and WR both per 100 hands)
   * Dropping the ln(1/r) term — as the naive version of this formula does —
   * silently solves for a ~37% risk of ruin and suggests a bankroll less
   * than half the size it should be.
   */
  const RISK_OF_RUIN = 0.05
  const buyinsFor = (r: number) =>
    winRate <= 0 ? 0 : Math.ceil((stdDev * stdDev * Math.log(1 / r)) / (2 * winRate) / 100)
  const suggestedBuyins = buyinsFor(RISK_OF_RUIN)

  const all = runs.flat()
  const min = Math.min(...all, lo)
  const max = Math.max(...all, hi)
  const H = 220, W = 640
  const y = (v: number) => H - ((v - min) / (max - min || 1)) * H
  const x = (i: number, len: number) => (i / (len - 1)) * W

  return (
    <div className="trainer panel" id="bankroll">
      <div className="trainer-head">
        <div>
          <p className="eyebrow">Trainer 05</p>
          <h3>Bankroll &amp; variance simulator</h3>
          <p className="muted small">
            Twelve simulated runs of the same winning player. They all have the same edge. Look at
            how differently they go.
          </p>
        </div>
      </div>

      <div className="outs-controls">
        <label className="slider-row">
          <span className="small">Win rate <b className="num">{winRate} bb/100</b></span>
          <input type="range" min={-2} max={12} step={0.5} value={winRate} onChange={(e) => setWinRate(Number(e.target.value))} />
        </label>
        <label className="slider-row">
          <span className="small">Std deviation <b className="num">{stdDev} bb/100</b></span>
          <input type="range" min={60} max={160} step={5} value={stdDev} onChange={(e) => setStdDev(Number(e.target.value))} />
        </label>
        <label className="slider-row">
          <span className="small">Hands <b className="num">{hands.toLocaleString()}</b></span>
          <input type="range" min={5000} max={300000} step={5000} value={hands} onChange={(e) => setHands(Number(e.target.value))} />
        </label>
      </div>

      <svg className="variance-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Twelve simulated bankroll paths over ${hands} hands`}>
        <line x1="0" y1={y(0)} x2={W} y2={y(0)} className="vc-zero" />
        <line x1="0" y1={y(expected)} x2={W} y2={y(expected)} className="vc-expected" />
        {runs.map((path, i) => (
          <polyline
            key={i}
            className="vc-path"
            style={{ opacity: 0.32 + (i % 4) * 0.12 }}
            points={path.map((v, j) => `${x(j, path.length)},${y(v)}`).join(' ')}
          />
        ))}
      </svg>

      <div className="outs-results">
        <StatTile value={`${expected >= 0 ? '+' : ''}${Math.round(expected)}bb`} label="Expected result" hint={`${winRate} bb/100 over ${hands.toLocaleString()} hands`} />
        <StatTile value={`${Math.round(lo)} to ${Math.round(hi)}`} label="95% of outcomes" hint="±1.96 standard deviations" mono />
        <StatTile value={`${runs.filter((r) => r[r.length - 1] < 0).length}/12`} label="Runs finishing down" hint="Same player, same edge" />
        <StatTile
          value={suggestedBuyins > 0 ? `${Math.min(500, suggestedBuyins)}` : '—'}
          label="Buy-ins for 5% risk of ruin"
          hint={winRate <= 0 ? 'A losing win rate has no safe bankroll — the risk of ruin is 100%' : `σ²·ln(1/0.05)/(2·WR) — a guide, not financial advice`}
        />
      </div>

      <div className="flex-buttons">
        <button className="btn btn-ghost btn-sm" onClick={() => setSeed((s) => s + 1)}>Re-run the simulation</button>
      </div>

      <Callout tone="danger" title="What this actually demonstrates">
        <p>
          Every one of those twelve lines is the same player with the same edge. At a healthy{' '}
          {winRate} bb/100, some of them are still losing after {hands.toLocaleString()} hands.
          A 95% confidence interval that spans {Math.round(lo)} to {Math.round(hi)} big blinds is not
          a rounding error — it is the game.
        </p>
        <p>
          This is why results over a few thousand hands tell you almost nothing about whether you are
          a winning player, and why bankroll discipline is not caution but arithmetic. It is also why
          nothing on this site promises you will win. See{' '}
          <Link to="/responsible-play">Responsible Play</Link>.
        </p>
        <p>
          The bankroll figure above solves <code>σ²·ln(1/r)/(2·WR)</code> for a 5% risk of ruin.
          Accept a 20% risk instead and it drops to{' '}
          <b className="num">{buyinsFor(0.2) || '—'}</b> buy-ins; insist on 1% and it rises to{' '}
          <b className="num">{buyinsFor(0.01) || '—'}</b>. The number is a choice about how much
          risk you are willing to carry, not a fact about the game.
        </p>
      </Callout>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Study plan
// ---------------------------------------------------------------------------

function StudyPlanPanel() {
  const results = useStore((s) => s.quizResults)
  const skill = useStore((s) => s.skill)
  const setSkill = useStore((s) => s.setSkill)
  const clear = useStore((s) => s.clearQuizResults)
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const weak = useMemo(() => weakAreas(results), [results])
  const enough = results.length >= 3

  async function build() {
    setLoading(true); setError(null)
    try { setPlan(await buildStudyPlan(results, weak, skill)) }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div className="trainer panel" id="study-plan">
      <div className="trainer-head">
        <div>
          <p className="eyebrow">Personalised</p>
          <h3>7-day study plan</h3>
          <p className="muted small">
            Complete three game quizzes and the coach builds a week around what you actually got
            wrong — not a generic curriculum.
          </p>
        </div>
        <label className="skill-select">
          <span className="tiny faint">Your level</span>
          <select value={skill} onChange={(e) => setSkill(e.target.value as never)}>
            <option value="new">New to poker</option>
            <option value="casual">Casual</option>
            <option value="serious">Serious</option>
            <option value="pro">Professional</option>
          </select>
        </label>
      </div>

      <div className="plan-status">
        <div className="plan-pips">
          {[0, 1, 2].map((i) => <span key={i} className={`plan-pip${results.length > i ? ' is-on' : ''}`} />)}
        </div>
        <span className="small muted">
          {results.length} quiz{results.length === 1 ? '' : 'zes'} completed
          {!enough && ` — ${3 - results.length} more to unlock`}
        </span>
      </div>

      {results.length > 0 && (
        <ul className="plan-results">
          {results.slice(-6).reverse().map((r, i) => (
            <li key={i} className="small">
              <Link to={`/games/${r.gameSlug}`}>{r.gameName}</Link>
              <b className="num">{r.score}/{r.total}</b>
            </li>
          ))}
        </ul>
      )}

      {weak.length > 0 && (
        <div className="plan-weak">
          <span className="eyebrow">Most-missed topics</span>
          <ul className="tag-list">
            {weak.slice(0, 6).map((w) => (
              <li key={w.topic} className="badge badge-danger">{w.topic} ×{w.misses}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-buttons">
        <button className="btn btn-primary" onClick={build} disabled={!enough || loading}>
          {loading ? 'Building your week…' : 'Build my 7-day plan'}
        </button>
        {!enough && <Link to="/games/no-limit-holdem#quiz" className="btn btn-ghost btn-sm">Take a quiz</Link>}
        {results.length > 0 && <button className="btn btn-quiet btn-sm" onClick={() => { clear(); setPlan(null) }}>Clear results</button>}
      </div>

      {error && <p className="small muted plan-error">{error}</p>}

      {plan && (
        <div className="plan">
          <h4>{plan.headline}</h4>
          <p className="small muted">{plan.diagnosis}</p>
          <ol className="plan-days">
            {plan.days.map((d) => (
              <li key={d.day} className="plan-day">
                <span className="plan-day-num num">Day {d.day}</span>
                <div>
                  <b>{d.focus}</b>
                  <p className="small muted">{d.why}</p>
                  <p className="small">{d.task}</p>
                  <p className="tiny faint">{d.minutes} min · {d.tool}</p>
                </div>
              </li>
            ))}
          </ol>
          <Callout tone="danger" title="Watch for">
            <p>{plan.watchFor}</p>
          </Callout>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

export function Trainers() {
  return (
    <div className="section">
      <div className="wrap wrap-wide">
        <SectionHead
          as="h1"
          eyebrow="Trainers"
          title="Drill the drillable parts"
          lede="Some of poker is judgement under uncertainty. The rest is arithmetic you should not have to think about while someone is waiting on you. These five tools cover the arithmetic."
        />

        <Callout tone="brass" title="The three numbers worth memorising">
          <p>
            <b>Pot odds:</b> cost / (pot + cost) is the equity you need to call.
            A half-pot bet needs {potOddsNeeded(100, 50).toFixed(1)}%; a pot-sized bet needs {potOddsNeeded(100, 100).toFixed(1)}%.
          </p>
          <p>
            <b>Break-even bluff:</b> bet / (bet + pot) is how often a bluff must work.
            Two-thirds pot needs {bluffBreakEven(66, 100).toFixed(1)}%.
          </p>
          <p>
            <b>Minimum defence:</b> pot / (pot + bet) is how often you must continue to stop them
            profitably bluffing you with anything. Against a pot bet that is {minDefenceFrequency(100, 100).toFixed(0)}%.
          </p>
        </Callout>

        <div className="trainers">
          <PotOddsTrainer />
          <RangeViewer />
          <OutsCounter />
          <ICMTrainer />
          <BankrollTrainer />
          <StudyPlanPanel />
        </div>
      </div>
    </div>
  )
}
