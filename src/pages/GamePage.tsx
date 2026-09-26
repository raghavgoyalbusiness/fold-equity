import { useState, useMemo } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getGame, FAMILY_META, STRUCTURE_META, HILO_META, DIFFICULTY_LABEL, GAMES } from '../data/games'
import { RANKINGS } from '../data/rankings'
import { PokerTable, ReplayControls } from '../three/PokerTable'
import { stagesFor } from '../three/dealPlan'
import { CardRow } from '../components/PlayingCard'
import { Quiz } from '../components/Quiz'
import { CoachChat } from '../components/CoachChat'
import { Meter, Callout, Crumbs, SectionHead } from '../components/ui'
import { balancedBluffShare, minDefenceFrequency } from '../lib/poker'

export function GamePage() {
  const { slug } = useParams()
  const game = getGame(slug)
  const [stage, setStage] = useState(0)
  const [coachOpen, setCoachOpen] = useState(false)

  const stages = useMemo(() => (game ? stagesFor(game.deal) : []), [game])
  const rules = game?.rules60 ?? []

  if (!game) return <Navigate to="/games" replace />

  const ranking = RANKINGS[game.rankingSet]
  const related = (game.seeAlso ?? []).map((s) => GAMES.find((g) => g.slug === s)).filter(Boolean)
  const isShortDeck = game.rankingSet === 'shortdeck'

  return (
    <article className="game-page">
      {/* ---------- header ---------- */}
      <header className="game-hero">
        <div className="wrap wrap-wide">
          <Crumbs items={[{ label: 'Games', to: '/games' }, { label: FAMILY_META[game.family].label, to: `/games?family=${game.family}` }, { label: game.name }]} />

          <div className="game-hero-grid">
            <div className="game-hero-copy">
              <p className="eyebrow">{FAMILY_META[game.family].label} family</p>
              <h1>{game.name}</h1>
              <p className="lede">{game.tagline}</p>
              <p className="muted">{game.blurb}</p>

              <dl className="spec-list">
                <div><dt>Players</dt><dd className="num">{game.players}</dd></div>
                <div><dt>Deck</dt><dd>{game.deck}</dd></div>
                <div><dt>Structure</dt><dd>{game.structures.map((s) => STRUCTURE_META[s]).join(' · ')}</dd></div>
                <div><dt>Pot</dt><dd>{HILO_META[game.hiLo]}</dd></div>
                <div><dt>Difficulty</dt><dd><Meter value={game.difficulty} label="Difficulty" /> <span className="small muted">{DIFFICULTY_LABEL[game.difficulty]}</span></dd></div>
                <div>
                  <dt>Bluff potential</dt>
                  <dd>
                    {game.bluffRating === 0
                      ? <span className="badge badge-danger">Zero — you play the house</span>
                      : <><Meter value={game.bluffRating} label="Bluff potential" tone="danger" /> <span className="small muted">{game.bluffRating}/5</span></>}
                  </dd>
                </div>
              </dl>

              <div className="game-hero-cta">
                <a href="#strategy" className="btn btn-primary">Winning strategy</a>
                <a href="#bluffing" className="btn btn-ghost">{game.banked ? 'Why bluffing fails here' : 'Bluffing chapter'}</a>
              </div>
            </div>

            <div className="game-hero-table">
              <PokerTable
                deal={game.deal}
                seed={game.slug}
                stageIndex={stage}
                showHero
                showAll={stage >= stages.length - 1}
                shortDeck={isShortDeck}
                height="clamp(320px, 46vh, 460px)"
              />
            </div>
          </div>
        </div>
      </header>

      {game.banked && (
        <div className="wrap wrap-read" style={{ marginTop: 28 }}>
          <Callout tone="danger" title="This is a house-banked game">
            <p>
              You play against the casino, not against other players. There is no opponent to fold,
              which means <b>bluffing has exactly zero expected value here</b> — not "low value", zero.
            </p>
            <p>
              What follows teaches correct basic strategy, whose purpose is to <b>minimise the house
              edge</b>. That is a different goal from winning. Played perfectly, these games still lose
              money over time; played badly, they lose money considerably faster.
            </p>
          </Callout>
        </div>
      )}

      {/* ---------- rules in 60 seconds ---------- */}
      <section className="section" id="rules">
        <div className="wrap wrap-wide">
          <SectionHead eyebrow="Rules in 60 seconds" title="How the hand plays" lede="Step through it on the table. Each step re-deals the scene." />

          <div className="rules-layout">
            <div className="rules-table">
              <PokerTable
                deal={game.deal}
                seed={`${game.slug}-rules`}
                stageIndex={stage}
                showHero
                showAll={stage >= stages.length - 1}
                shortDeck={isShortDeck}
                height="clamp(300px, 42vh, 430px)"
              />
              <ReplayControls deal={game.deal} index={stage} setIndex={setStage} />
            </div>

            <ol className="rules-steps">
              {rules.map((r, i) => (
                <li key={r.title}>
                  <button
                    className={`rule-step${i === Math.min(stage, rules.length - 1) ? ' is-active' : ''}`}
                    onClick={() => setStage(Math.min(i, stages.length - 1))}
                  >
                    <span className="rule-num num">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <b>{r.title}</b>
                      <span className="muted small">{r.body}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- hand rankings ---------- */}
      <section className="section" id="rankings">
        <div className="wrap wrap-wide">
          <SectionHead eyebrow="Hand rankings" title={ranking.title} lede={ranking.reads} />

          <div className="ranking-layout">
            <Callout tone="brass" title="Why the order is what it is">
              <p>{ranking.principle}</p>
            </Callout>

            {game.rankingNote && (
              <Callout tone="info" title={`Specific to ${game.name}`}>
                <p>{game.rankingNote}</p>
              </Callout>
            )}
          </div>

          <ol className="rank-table">
            {ranking.rows.map((r) => (
              <li key={r.name} className="rank-row">
                <span className="rank-num num">{r.rank}</span>
                <span className="rank-name">{r.name}</span>
                <span className="rank-cards">
                  {r.example[0] === '—'
                    ? <span className="faint small">n/a</span>
                    : <CardRow cards={r.example} size="sm" />}
                </span>
                <span className="rank-note muted small">{r.note}</span>
              </li>
            ))}
          </ol>

          {ranking.footnotes?.length ? (
            <ul className="footnotes">
              {ranking.footnotes.map((f) => <li key={f} className="small muted">{f}</li>)}
            </ul>
          ) : null}
        </div>
      </section>

      {/* ---------- strategy ---------- */}
      <section className="section section-alt" id="strategy">
        <div className="wrap wrap-wide">
          <SectionHead
            eyebrow="Core winning strategy"
            title={game.banked ? 'Basic strategy — minimising the edge' : 'How to win at this game'}
            lede={game.strategy?.thesis}
          />

          {game.strategy ? (
            <>
              <div className="starting-hands">
                <h3>Starting hands</h3>
                <div className="tier-list">
                  {game.strategy.startingHands.map((t) => (
                    <div key={t.tier} className="tier">
                      <div className="tier-head">
                        <h4>{t.tier}</h4>
                        <code className="tier-hands">{t.hands}</code>
                      </div>
                      <p className="tier-action"><b>{t.action}</b></p>
                      <p className="small muted">{t.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {[game.strategy.position, game.strategy.betSizing].map((b) => (
                <div key={b.heading} className="strat-block">
                  <h3>{b.heading}</h3>
                  <p>{b.body}</p>
                  {b.example && (
                    <div className="worked-example">
                      <span className="eyebrow">Worked example</span>
                      <p>{b.example}</p>
                    </div>
                  )}
                  {b.bullets && <ul className="tick-list">{b.bullets.map((x) => <li key={x}>{x}</li>)}</ul>}
                </div>
              ))}

              <h3 className="streets-head">Street by street</h3>
              <div className="streets">
                {game.strategy.streets.map((s, i) => (
                  <div key={s.heading} className="street">
                    <span className="street-num num">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h4>{s.heading}</h4>
                      <p>{s.body}</p>
                      {s.example && (
                        <div className="worked-example">
                          <span className="eyebrow">Worked example</span>
                          <p>{s.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="primer">
              <ul className="tick-list tick-list-lg">
                {(game.primer ?? []).map((p) => <li key={p}>{p}</li>)}
              </ul>
              <Callout tone="info" title="This page is a rules-and-rankings scaffold">
                <p>
                  The rules, hand rankings and strategy primer above are complete. The full treatment —
                  tiered starting hands, a street-by-street plan, the bluffing chapter, common leaks
                  and a graded quiz — is written out in depth for{' '}
                  <Link to="/games/no-limit-holdem">No-Limit Hold'em</Link>,{' '}
                  <Link to="/games/pot-limit-omaha">Pot-Limit Omaha</Link> and{' '}
                  <Link to="/games/deuce-to-seven-triple-draw">2-7 Triple Draw</Link>.
                  Most of what those pages teach transfers directly.
                </p>
                <p>
                  For anything specific to {game.name}, the coach below is loaded with this game's context.
                </p>
              </Callout>
            </div>
          )}
        </div>
      </section>

      {/* ---------- bluffing ---------- */}
      <section className="section" id="bluffing">
        <div className="wrap wrap-wide">
          <SectionHead
            eyebrow="Bluffing"
            title={game.banked ? 'Bluffing is worth nothing here' : 'The bluffing chapter'}
            lede={game.bluffing?.thesis}
          />

          {game.banked ? (
            <div className="grid grid-2">
              <Callout tone="danger" title="There is nobody to fold">
                <p>
                  A bluff is a bet that makes a better hand fold. In {game.name} the dealer follows a
                  fixed procedure and the paytable does not have feelings. No bet you make changes any
                  outcome. The expected value of a bluff here is not small — it is zero, exactly.
                </p>
              </Callout>
              <Callout tone="brass" title="What to do instead">
                <p>
                  Learn the strategy above until it is automatic, take the lowest-house-edge bet
                  available, skip the side bets, and decide how much you are prepared to lose before
                  you sit down. That is the whole of correct play in a banked game.
                </p>
                <p><Link to="/responsible-play">Read the Responsible Play page →</Link></p>
              </Callout>
            </div>
          ) : game.bluffing ? (
            <>
              <div className="bluff-blocks">
                {[game.bluffing.whenToBluff, game.bluffing.semiBluffs, game.bluffing.blockers, game.bluffing.boardTexture].map((b) => (
                  <div key={b.heading} className="strat-block">
                    <h3>{b.heading}</h3>
                    <p>{b.body}</p>
                    {b.bullets && <ul className="tick-list">{b.bullets.map((x) => <li key={x}>{x}</li>)}</ul>}
                    {b.example && (
                      <div className="worked-example">
                        <span className="eyebrow">Worked example</span>
                        <p>{b.example}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="ratio-block">
                <h3>Bluff-to-value ratios</h3>
                <p className="muted">
                  At the river, a balanced betting range contains a predictable share of bluffs for each
                  size — <code>s / (1 + 2s)</code> where <code>s</code> is the bet as a fraction of the pot.
                  Bet bigger and you can bluff more, because your opponent has to fold more.
                </p>
                <div className="ratio-table" role="table">
                  <div className="ratio-head" role="row">
                    <span>Sizing</span><span>Example</span><span>Balanced mix</span><span>They must defend</span><span>Why</span>
                  </div>
                  {game.bluffing.ratios.map((r) => (
                    <div key={r.sizing} className="ratio-row" role="row">
                      <span className="ratio-size"><b>{r.sizing}</b></span>
                      <span className="num small">{r.pot}</span>
                      <span className="ratio-mix num">{r.bluffShare}</span>
                      <span className="num small">{ratioDefend(r.pot)}</span>
                      <span className="small muted">{r.why}</span>
                    </div>
                  ))}
                </div>
                <p className="tiny faint">
                  Reference points: a half-pot bet supports {balancedBluffShare(0.5).toFixed(0)}% bluffs and must be
                  defended {minDefenceFrequency(50, 100).toFixed(0)}% of the time. A pot-sized bet supports{' '}
                  {balancedBluffShare(1).toFixed(0)}% bluffs and must be defended {minDefenceFrequency(100, 100).toFixed(0)}%.
                </p>
              </div>

              <div className="grid grid-2">
                <Callout tone="brass" title={game.bluffing.targets.heading}>
                  <p>{game.bluffing.targets.body}</p>
                  {game.bluffing.targets.bullets && <ul className="tick-list">{game.bluffing.targets.bullets.map((x) => <li key={x}>{x}</li>)}</ul>}
                  {game.bluffing.targets.example && <p className="small muted">{game.bluffing.targets.example}</p>}
                </Callout>
                <Callout tone="danger" title={game.bluffing.pointless.heading}>
                  <p>{game.bluffing.pointless.body}</p>
                  {game.bluffing.pointless.bullets && <ul className="tick-list">{game.bluffing.pointless.bullets.map((x) => <li key={x}>{x}</li>)}</ul>}
                </Callout>
              </div>
            </>
          ) : (
            <Callout tone="info" title={`Bluff potential: ${game.bluffRating}/5`}>
              <p>
                {game.bluffRating >= 4
                  ? `${game.name} rewards bluffing heavily. The core principles — credible story, a folding range, and blockers to their strongest hands — are set out in full in the bluffing chapters on the three complete guides, and they transfer directly.`
                  : game.bluffRating >= 2
                    ? `${game.name} supports some bluffing, but less than Hold'em. Check the structure: multiway pots, wild cards and split pots all reduce how often a bluff can work.`
                    : `${game.name} offers little bluffing value. Play it as a value game.`}
              </p>
              <p>
                Read the full chapters on <Link to="/games/no-limit-holdem">No-Limit Hold'em</Link>,{' '}
                <Link to="/games/pot-limit-omaha">PLO</Link> and{' '}
                <Link to="/games/deuce-to-seven-triple-draw">2-7 Triple Draw</Link>, or work through
                the <Link to="/bluff-lab">Bluff Lab</Link>.
              </p>
            </Callout>
          )}
        </div>
      </section>

      {/* ---------- leaks ---------- */}
      {game.leaks && (
        <section className="section section-alt" id="leaks">
          <div className="wrap wrap-wide">
            <SectionHead
              eyebrow="Common leaks"
              title="How opponents exploit you"
              lede="Each of these is invisible in a single hand and expensive across a thousand."
            />
            <div className="leaks">
              {game.leaks.map((l) => (
                <div key={l.leak} className="leak">
                  <h4 className="leak-title">{l.leak}</h4>
                  <div className="leak-grid">
                    <div><span className="eyebrow">Why it happens</span><p className="small">{l.why}</p></div>
                    <div><span className="eyebrow">How it is exploited</span><p className="small">{l.exploit}</p></div>
                    <div><span className="eyebrow">The fix</span><p className="small"><b>{l.fix}</b></p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- formats ---------- */}
      {game.formats && (
        <section className="section" id="formats">
          <div className="wrap wrap-wide">
            <SectionHead eyebrow="Format adjustments" title="Cash, tournament and heads-up" lede="The same cards call for different decisions depending on what the chips are worth." />
            <div className="grid grid-3">
              {([['Cash game', game.formats.cash], ['Tournament', game.formats.tournament], ['Heads-up', game.formats.headsUp]] as const).map(([label, items]) => (
                <div key={label} className="panel format-card">
                  <h4>{label}</h4>
                  <ul className="tick-list">{items.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- quiz ---------- */}
      {game.quiz && (
        <section className="section section-alt" id="quiz">
          <div className="wrap wrap-read">
            <SectionHead eyebrow="Interactive quiz" title="Five spots, graded" lede="Every option gets an explanation — including the wrong ones, which is where the learning is." />
            <Quiz questions={game.quiz} gameSlug={game.slug} gameName={game.name} />
          </div>
        </section>
      )}

      {/* ---------- coach ---------- */}
      <section className="section" id="coach">
        <div className="wrap wrap-read">
          <SectionHead
            eyebrow="Ask the Coach"
            title={`Questions about ${game.name}?`}
            lede="The coach is pre-loaded with this game's context — its structure, its rankings and whether bluffing is worth anything in it."
          />
          {coachOpen ? (
            <CoachChat
              compact
              context={{
                gameName: game.name,
                gameFamily: FAMILY_META[game.family].label,
                banked: game.banked,
                page: `${game.name} game page`,
              }}
              suggestions={
                game.banked
                  ? [`What is the house edge in ${game.name}?`, `What is the single biggest basic-strategy mistake here?`, 'Are the side bets ever worth taking?']
                  : [`What are the best starting hands in ${game.name}?`, `When should I bluff in ${game.name}?`, `What is the most common leak in ${game.name}?`]
              }
            />
          ) : (
            <button className="btn btn-primary" onClick={() => setCoachOpen(true)}>
              Ask the Coach about {game.name}
            </button>
          )}
        </div>
      </section>

      {/* ---------- related ---------- */}
      {related.length > 0 && (
        <section className="section-tight">
          <div className="wrap wrap-wide">
            <h3 className="related-head">Related games</h3>
            <div className="related">
              {related.map((g) => (
                <Link key={g!.slug} to={`/games/${g!.slug}`} className="related-card">
                  <b>{g!.name}</b>
                  <span className="small muted">{g!.tagline}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

/** Derive the defence frequency from the "Bet X into Y" example string. */
function ratioDefend(pot: string): string {
  const nums = pot.match(/\d+/g)
  if (!nums || nums.length < 2) return '—'
  const bet = Number(nums[0])
  const size = Number(nums[1])
  if (!bet || !size) return '—'
  return `${minDefenceFrequency(bet, size).toFixed(0)}%`
}
