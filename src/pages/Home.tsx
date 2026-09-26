import { Link } from 'react-router-dom'
import { PokerTable } from '../three/PokerTable'
import { GAMES, GAME_COUNT, FAMILY_ORDER, FAMILY_META, familyGames, fullGames } from '../data/games'
import { GLOSSARY_COUNT } from '../data/glossary'
import { SCENARIOS } from '../data/bluffLab'
import { GameCard } from '../components/GameCard'
import { SectionHead, StatTile, Callout } from '../components/ui'
import { useCountUp } from '../lib/hooks'

const HERO_DEAL = { hole: 2, board: [3, 1, 1], seats: 6, note: "No-Limit Hold'em" }

function Ticker() {
  const games = useCountUp(GAME_COUNT)
  const terms = useCountUp(GLOSSARY_COUNT)
  const families = useCountUp(FAMILY_ORDER.length)
  const full = useCountUp(fullGames().length)

  return (
    <div className="ticker" ref={games.attach as never}>
      <StatTile value={games.value} label="Variants covered" hint="Every game in the brief, each with its own page" />
      <StatTile value={families.value} label="Game families" hint="Hold'em, Omaha, Stud, Draw, Chinese, Mixed, Home, Banked" />
      <StatTile value={full.value} label="Full strategy guides" hint="Complete bluff chapters, leaks and graded quizzes" />
      <StatTile value={terms.value} label="Glossary terms" hint="Searchable, cross-linked" />
      <span ref={terms.attach as never} />
      <span ref={families.attach as never} />
      <span ref={full.attach as never} />
    </div>
  )
}

export function Home() {
  const featured = ['no-limit-holdem', 'pot-limit-omaha', 'deuce-to-seven-triple-draw']
    .map((s) => GAMES.find((g) => g.slug === s)!)

  return (
    <>
      <section className="hero">
        <div className="hero-table">
          <PokerTable
            deal={HERO_DEAL}
            seed="fold-equity-hero"
            loop
            showHero
            height="min(74vh, 660px)"
            interactive
          />
        </div>

        <div className="hero-copy wrap">
          <p className="eyebrow rise">A poker strategy academy</p>
          <h1 className="hero-title rise">
            Every game.<br />Every edge.<br /><em>Every bluff.</em>
          </h1>
          <p className="lede hero-lede rise">
            {GAME_COUNT} poker variants, from No-Limit Hold'em to Badeucey to Pai Gow —
            each with its rules, its hand rankings, its winning strategy and an honest
            account of when bluffing works and when it is worth nothing at all.
          </p>
          <div className="hero-cta rise">
            <Link to="/games" className="btn btn-primary">Pick your game</Link>
            <Link to="/bluff-lab" className="btn btn-ghost">Enter the Bluff Lab</Link>
          </div>
          <p className="hero-note tiny faint rise">
            Educational only · no real-money play · 18+
          </p>
        </div>

        <div className="hero-fade" aria-hidden="true" />
      </section>

      <section className="section-tight">
        <div className="wrap"><Ticker /></div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead
            eyebrow="Start here"
            title="Three games, written end to end"
            lede="Every variant on this site has its rules and hand rankings. These three have the whole thing: starting hands, position, bet sizing, a street-by-street plan, a full bluffing chapter, the leaks that cost you money, format adjustments and a graded quiz."
          />
          <div className="grid grid-3">
            {featured.map((g) => <GameCard key={g.slug} game={g} />)}
          </div>
        </div>
      </section>

      <section className="section section-families">
        <div className="wrap">
          <SectionHead
            eyebrow="The library"
            title="Eight families, one table"
            lede="The same 3D table teaches every game. Pick a variant and it re-deals in that game's structure — two hole cards for Hold'em, four for Omaha, up-and-down cards for Stud, thirteen for Chinese, discards flying off-table for Draw."
          />
          <div className="family-grid">
            {FAMILY_ORDER.map((f) => {
              const games = familyGames(f)
              return (
                <Link key={f} to={`/games?family=${f}`} className="family-card">
                  <div className="family-card-head">
                    <h3>{FAMILY_META[f].label}</h3>
                    <span className="family-count num">{games.length}</span>
                  </div>
                  <p className="small muted">{FAMILY_META[f].blurb}</p>
                  <p className="family-examples tiny faint">
                    {games.slice(0, 4).map((g) => g.short).join(' · ')}
                    {games.length > 4 && ` · +${games.length - 4} more`}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid grid-2 home-split">
          <div>
            <SectionHead
              eyebrow="Bluff Lab"
              title="Learn the decision, not the outcome"
              lede={`${SCENARIOS.length} scenarios on the 3D table. Choose bet, check, fold or raise, then see the fold equity, the pot odds and the opponent's range that made your choice right or wrong — plus an AI grade across five dimensions.`}
            />
            <ul className="tick-list">
              <li>The break-even maths for every sizing, shown in full</li>
              <li>Why multiway bluffs fail four times more often than heads-up ones</li>
              <li>Blockers, board texture and bluff-to-value ratios</li>
              <li>Live physical tells and online timing tells</li>
            </ul>
            <Link to="/bluff-lab" className="btn btn-primary">Open the Bluff Lab</Link>
          </div>

          <div>
            <SectionHead
              eyebrow="Trainers"
              title="Drill the parts that are drillable"
              lede="Some of poker is judgement. The rest is arithmetic you should not have to think about at the table."
            />
            <ul className="tick-list">
              <li>Pot odds and equity, on a timer</li>
              <li>Preflop range viewer — 13×13, by position</li>
              <li>Outs counter with the real percentages</li>
              <li>ICM basics: why tournament play is tighter</li>
              <li>Bankroll calculator with a variance simulator</li>
            </ul>
            <Link to="/trainers" className="btn btn-ghost">Open the trainers</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap wrap-read">
          <Callout tone="danger" title="Where bluffing is worth exactly nothing">
            <p>
              Ten of the {GAME_COUNT} games here are house-banked — Three Card Poker, Caribbean Stud,
              Ultimate Texas Hold'em, Let It Ride, Pai Gow, Mississippi Stud, Four Card Poker and
              three video poker machines. In those games you play against the casino, not against a
              person. There is nobody to fold, so bluffing has zero expected value, and no strategy
              makes the expectation positive.
            </p>
            <p>
              Those pages teach correct basic strategy anyway, because the gap between good and bad
              play is real: perfect play on a 9/6 Jacks or Better machine returns 99.54%, and the
              8/5 version of the same game returns 97.30%. That is worth knowing. It is still a
              losing game.
            </p>
            <p>
              <Link to="/games?family=casino">See the banked games →</Link>
            </p>
          </Callout>
        </div>
      </section>

      <section className="section cta-band">
        <div className="wrap center">
          <h2>Ask the coach anything</h2>
          <p className="lede" style={{ margin: '0 auto', maxWidth: '58ch' }}>
            Describe a hand in plain English, or paste a hand history from PokerStars or GGPoker.
            It gets rebuilt on the 3D table and every decision gets critiqued — with the maths shown
            and each line labelled as balanced or exploitative.
          </p>
          <div className="hero-cta" style={{ justifyContent: 'center', marginTop: 26 }}>
            <Link to="/coach" className="btn btn-primary">Open the AI Coach</Link>
            <Link to="/games" className="btn btn-ghost">Browse all {GAME_COUNT} games</Link>
          </div>
        </div>
      </section>
    </>
  )
}
