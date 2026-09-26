import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHead, Callout } from '../components/ui'
import { GAME_COUNT, FAMILY_ORDER, fullGames } from '../data/games'
import { GLOSSARY_COUNT } from '../data/glossary'
import { SCENARIOS } from '../data/bluffLab'
import { useStore } from '../lib/store'

const FAQ = [
  {
    q: 'Will this make me a winning player?',
    a: "No site can promise that, and any that does is selling something. What strategy study reliably does is remove the mistakes that are costing you money — folding too little, bluffing the wrong people, calling without the price. Whether what remains is a winning edge after rake depends on you, your games and a sample size much larger than most players ever accumulate. The variance simulator on the Trainers page shows exactly how large.",
  },
  {
    q: 'Why does every page insist on showing the arithmetic?',
    a: "Because a claim about fold equity without its numbers is an opinion, and opinions are how bad habits spread. If a page says a bluff needs to work 40% of the time, it shows you that 66/(66+100) = 39.8%. You can check it, and more importantly you can redo it at the table with different numbers.",
  },
  {
    q: 'What is the difference between balanced and exploitative advice?',
    a: "A balanced (GTO-style) strategy cannot be exploited no matter what your opponent does — it is a safe default, not the highest-earning option. An exploitative strategy deliberately deviates to attack a specific opponent's tendency: it earns more against them and can be punished if they adjust. Both are useful. Confusing them is not, which is why every page and the AI coach say which one they are giving you.",
  },
  {
    q: 'Why do the casino games have a bluff rating of zero?',
    a: "Because that is the correct number. In Three Card Poker, Caribbean Stud, Ultimate Texas Hold'em, Let It Ride, Pai Gow Poker, Mississippi Stud, Four Card Poker and video poker, you play against the house. The dealer follows a fixed published procedure and the paytable has no opinion about your bet. There is nobody to fold, so a bluff changes nothing. Those pages teach basic strategy to minimise the house edge instead — a different and more honest goal.",
  },
  {
    q: 'Three games are written in full. What about the other 65?',
    a: `Every one of the ${GAME_COUNT} variants has its own page with the rules stepped out on the 3D table, the correct hand-ranking table for that game (there are eleven different ranking systems across the site), and a strategy primer. ${fullGames().length} of them — No-Limit Hold'em, Pot-Limit Omaha and 2-7 Triple Draw — additionally have the complete treatment: tiered starting hands, position, bet sizing, a street-by-street plan, a full bluffing chapter with bluff-to-value ratios, six common leaks, cash/tournament/heads-up adjustments and a five-spot graded quiz. Those three were chosen deliberately: one community-card game, one four-card game and one draw game, which between them cover the structural ideas the other sixty-five inherit.`,
  },
  {
    q: 'Do I need the AI coach for the site to work?',
    a: 'No. Every game page, all the hand rankings, the five Bluff Lab scenarios and their built-in grading, all five trainers and the glossary work with no API key at all. The AI layer adds four things on top: the coach chat, the hand-history analyser, a second opinion on your Bluff Lab decisions, and the personalised study plan. Without a key those four say so plainly rather than failing silently.',
  },
  {
    q: 'Where does the strategy content come from?',
    a: 'It is written from established poker theory — pot odds, minimum defence frequency, blockers, range advantage, ICM — and every quantitative claim on the site is one you can verify with the arithmetic shown beside it. Where a rule varies between card rooms (short deck trips-versus-straight, Manila rankings, Chicago high-or-low spade, home-game wild cards) the page says so and tells you to confirm locally, because those genuinely differ and getting it wrong is expensive.',
  },
  {
    q: 'Can I use this to count cards or beat the casino?',
    a: 'No, and nothing here attempts it. The banked-game pages teach published basic strategy, which is the mathematically correct way to play a negative-expectation game. That reduces the rate at which you lose. It does not and cannot make the expectation positive.',
  },
]

export function About() {
  const [open, setOpen] = useState<number | null>(0)
  const render3d = useStore((s) => s.render3d)
  const setRender3d = useStore((s) => s.setRender3d)
  const sound = useStore((s) => s.sound)
  const toggleSound = useStore((s) => s.toggleSound)

  return (
    <div className="section">
      <div className="wrap wrap-read">
        <SectionHead
          as="h1"
          eyebrow="About"
          title="What this is"
          lede="Fold Equity is a strategy academy covering every poker variant that exists — how each one is played, how it is won, and where bluffing has value versus where it has none at all."
        />

        <div className="about-stats">
          <div><b className="num">{GAME_COUNT}</b><span>variants, each with its own page</span></div>
          <div><b className="num">{FAMILY_ORDER.length}</b><span>families, from Hold'em to house-banked</span></div>
          <div><b className="num">11</b><span>different hand-ranking systems</span></div>
          <div><b className="num">{SCENARIOS.length}</b><span>graded Bluff Lab scenarios</span></div>
          <div><b className="num">{GLOSSARY_COUNT}</b><span>glossary terms</span></div>
        </div>

        <h2 className="rp-head">The rules this site holds itself to</h2>
        <ul className="tick-list tick-list-lg">
          <li><b>No strategy guarantees a win.</b> Poker is a long-run edge over short-run variance. Every page is written that way, and the AI coach is instructed to refuse the framing.</li>
          <li><b>Every claim carries a "why" and a worked example.</b> If a page tells you to do something, it shows you the hand where it matters.</li>
          <li><b>Show the maths.</b> Pot odds, break-even fold rates and bluff-to-value ratios are printed with their arithmetic, not asserted.</li>
          <li><b>Name the strategy type.</b> Balanced or exploitative — they are different claims about different opponents.</li>
          <li><b>Be honest about banked games.</b> Bluffing is worth zero. Basic strategy minimises losses; it does not create a winning game.</li>
          <li><b>No real-money links, no affiliates, no casino advertising.</b> There is nothing to sell you here.</li>
        </ul>

        <h2 className="rp-head">Frequently asked</h2>
        <div className="faq">
          {FAQ.map((f, i) => (
            <div key={f.q} className={`faq-item${open === i ? ' is-open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span>{f.q}</span>
                <span className="faq-icon" aria-hidden="true" />
              </button>
              {open === i && <div className="faq-a"><p>{f.a}</p></div>}
            </div>
          ))}
        </div>

        <h2 className="rp-head">Display settings</h2>
        <div className="panel">
          <h4>3D table</h4>
          <p className="small muted">
            The 3D scene is enabled automatically on capable devices and replaced with an illustrated
            2D table on low-power phones. You can override that here. Motion throughout the site
            respects your system's reduced-motion setting — with it on, cards appear in place rather
            than dealing.
          </p>
          <div className="chips" style={{ marginTop: 14 }}>
            {(['auto', 'on', 'off'] as const).map((v) => (
              <button key={v} className={`chip${render3d === v ? ' is-on' : ''}`} onClick={() => setRender3d(v)} aria-pressed={render3d === v}>
                {v === 'auto' ? 'Automatic' : v === 'on' ? 'Always 3D' : 'Always 2D'}
              </button>
            ))}
          </div>

          <h4 style={{ marginTop: 24 }}>Table sounds</h4>
          <p className="small muted">
            Cards landing on felt and chips clacking, synthesised rather than sampled so no
            audio files are downloaded. <b>Off by default</b> — sound should always be something
            you choose. The toggle is also in the header on every page.
          </p>
          <div className="chips" style={{ marginTop: 14 }}>
            <button className={`chip${sound ? ' is-on' : ''}`} onClick={toggleSound} aria-pressed={sound}>
              {sound ? 'Sounds on' : 'Sounds off'}
            </button>
          </div>
        </div>

        <Callout tone="danger" title="18+ · educational only">
          <p>
            This site exists to teach poker strategy. It offers no real-money play and links to no
            gambling operator. Most people who gamble lose money, and the games on the banked pages
            are mathematically guaranteed to do so over time.
          </p>
          <p>
            If gambling is causing harm to you or someone you know, the{' '}
            <Link to="/responsible-play">Responsible Play</Link> page lists free, confidential and
            independent support organisations.
          </p>
        </Callout>
      </div>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="section">
      <div className="wrap wrap-read center">
        <p className="eyebrow">Folded</p>
        <h1>That page isn't in the deck</h1>
        <p className="lede">
          The hand you were looking for has been mucked. Try the game library — all {GAME_COUNT}{' '}
          variants are in there.
        </p>
        <div className="hero-cta" style={{ justifyContent: 'center', marginTop: 28 }}>
          <Link to="/games" className="btn btn-primary">Game Library</Link>
          <Link to="/" className="btn btn-ghost">Back to the table</Link>
        </div>
      </div>
    </div>
  )
}
