import { Link } from 'react-router-dom'
import { SectionHead, Callout, StatTile } from '../components/ui'

const HELP = [
  { region: 'United Kingdom', org: 'GamCare', detail: 'National Gambling Helpline — 0808 8020 133, free and 24/7', url: 'https://www.gamcare.org.uk' },
  { region: 'United Kingdom', org: 'GAMSTOP', detail: 'Free self-exclusion from all UK-licensed online gambling', url: 'https://www.gamstop.co.uk' },
  { region: 'United States', org: 'National Council on Problem Gambling', detail: 'Call or text 1-800-GAMBLER, 24/7', url: 'https://www.ncpgambling.org' },
  { region: 'Canada', org: 'ConnexOntario', detail: '1-866-531-2600, free and 24/7', url: 'https://www.connexontario.ca' },
  { region: 'Australia', org: 'Gambling Help Online', detail: '1800 858 858, 24/7', url: 'https://www.gamblinghelponline.org.au' },
  { region: 'International', org: 'Gamblers Anonymous', detail: 'Local meetings worldwide', url: 'https://www.gamblersanonymous.org' },
]

const SIGNS = [
  'Playing with money set aside for rent, bills, food or debt.',
  'Chasing losses — increasing stakes to get back to even rather than because the game is good.',
  'Hiding how much you play, or how much you have lost, from people close to you.',
  'Borrowing money to play, or selling things to fund it.',
  'Feeling restless or irritable when you try to cut down or stop.',
  'Playing to escape low mood, anxiety or stress rather than because you want to.',
  'Needing to risk more money to get the same level of excitement.',
  'Repeatedly promising yourself this is the last session.',
]

export function Responsible() {
  return (
    <div className="section">
      <div className="wrap wrap-read">
        <SectionHead
          as="h1"
          eyebrow="Responsible Play"
          title="The honest version"
          lede="This site teaches poker strategy. It would be dishonest to do that without also being clear about what the game actually does to most people who play it."
        />

        <Callout tone="danger" title="If gambling is causing you harm, start here">
          <p>
            You do not have to be in crisis to ask for help, and you do not have to have lost a
            specific amount. If you have wondered whether you have a problem, that is reason enough
            to talk to someone. The organisations below are free, confidential and independent —
            none of them are affiliated with this site or with any operator.
          </p>
        </Callout>

        <div className="help-list">
          {HELP.map((h) => (
            <a key={h.org} className="help-card" href={h.url} target="_blank" rel="noreferrer noopener">
              <span className="tiny faint">{h.region}</span>
              <b>{h.org}</b>
              <span className="small muted">{h.detail}</span>
            </a>
          ))}
        </div>

        <h2 className="rp-head">Four things that are true at the same time</h2>

        <div className="rp-blocks">
          <div className="rp-block">
            <h3>1. Poker has skill in it. That does not make it safe.</h3>
            <p>
              Poker is genuinely a game of skill over a large sample — that is why this site exists.
              But "skill exists" and "you have enough of it to win after rake" are different claims,
              and most players never establish the second one. The rake alone turns many marginal
              winning strategies into losing ones.
            </p>
          </div>

          <div className="rp-block">
            <h3>2. Variance is much larger than people expect</h3>
            <p>
              A genuinely winning cash-game player at 3bb/100 with a standard deviation of 90bb/100
              can lose money over 50,000 hands without anything having gone wrong. Not "unlucky" —
              statistically normal. Our{' '}
              <Link to="/trainers#bankroll">variance simulator</Link> runs twelve identical winning
              players and several of them finish down.
            </p>
            <p>
              The consequence is that your results over weeks or months tell you very little about
              whether you are good. This is also why the human brain is so badly suited to poker:
              it reads a hot streak as evidence of skill and a cold streak as bad luck, when both
              are just noise.
            </p>
          </div>

          <div className="rp-block">
            <h3>3. Tilt is the largest leak in the game</h3>
            <p>
              Competent players lose more money to emotional decisions after a bad beat than to any
              technical mistake. The reliable fix is not willpower, it is a rule decided in advance:
              a stop-loss you set before you sit down, a maximum session length, and a commitment to
              leave when either is hit.
            </p>
            <p>
              The moment you notice yourself wanting to "get it back", the session is already over.
              That feeling is the signal, not a plan.
            </p>
          </div>

          <div className="rp-block">
            <h3>4. In banked casino games, the house always has the edge</h3>
            <p>
              Ten of the games covered on this site are played against the casino rather than against
              other players. In those games there is no skill edge to find — only a house edge to
              minimise. Correct basic strategy reduces how fast you lose. It does not make the
              expectation positive, and nothing does.
            </p>
            <div className="rp-stats">
              <StatTile value="~2.2%" label="Ultimate Texas Hold'em" hint="House edge with perfect basic strategy" />
              <StatTile value="~5.2%" label="Caribbean Stud" hint="House edge with perfect basic strategy" />
              <StatTile value="99.54%" label="9/6 Jacks or Better" hint="Return with perfect play — still below 100%" />
              <StatTile value=">25%" label="Typical progressive side bet" hint="House edge on most paytables" />
            </div>
          </div>
        </div>

        <h2 className="rp-head">Warning signs</h2>
        <p className="muted">
          These are the patterns clinicians look for. Recognising one or two is not a diagnosis, but
          it is worth taking seriously — particularly if someone close to you has raised it first.
        </p>
        <ul className="warn-list">
          {SIGNS.map((s) => <li key={s}>{s}</li>)}
        </ul>

        <h2 className="rp-head">Practical guardrails</h2>
        <ul className="tick-list tick-list-lg">
          <li><b>Separate the money.</b> Poker money lives in its own account and never mixes with money you need. If you cannot fund it without touching the rest, you cannot fund it.</li>
          <li><b>Set a stop-loss before you sit.</b> Two or three buy-ins, decided in advance, honoured without negotiation.</li>
          <li><b>Set a time limit too.</b> Fatigue costs more than tilt and is harder to notice.</li>
          <li><b>Track everything.</b> Honest records are uncomfortable and are the only way to know whether you are actually winning.</li>
          <li><b>Never play to fix a bad day.</b> Playing to feel better is the single clearest early warning sign.</li>
          <li><b>Use self-exclusion tools.</b> They exist, they work, and using them is not an admission of anything.</li>
        </ul>

        <Callout tone="brass" title="What this site will never do">
          <p>
            Fold Equity has no real-money play, no affiliate links, no casino advertising and no
            sponsorship from any operator. It will not tell you which site to play on or what stakes
            to play. It will not claim a strategy wins. The AI coach is instructed to set a strategy
            question aside entirely and point you here if you describe chasing losses or playing with
            money you cannot afford to lose.
          </p>
          <p>
            If you are under 18, this content is not for you, and in most jurisdictions neither is
            the game.
          </p>
        </Callout>
      </div>
    </div>
  )
}
