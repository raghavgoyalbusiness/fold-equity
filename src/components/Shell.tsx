import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../lib/store'
import { useScrolled } from '../lib/hooks'
import { GAME_COUNT } from '../data/games'

const NAV = [
  { to: '/games', label: 'Game Library' },
  { to: '/bluff-lab', label: 'Bluff Lab' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/coach', label: 'AI Coach' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/responsible-play', label: 'Responsible Play' },
  { to: '/about', label: 'About' },
]

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="6" y="5" width="13" height="19" rx="2.5" fill="currentColor" opacity=".38" transform="rotate(-11 12.5 14.5)" />
      <rect x="13" y="7" width="13" height="19" rx="2.5" fill="var(--accent)" transform="rotate(9 19.5 16.5)" />
      <path d="M19.5 12.6l3.1 3.6-3.1 3.6-3.1-3.6z" fill="var(--bg)" />
    </svg>
  )
}

export function Header() {
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => { setOpen(false) }, [loc.pathname])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <>
      <header className="site-header" data-scrolled={scrolled} data-open={open}>
        <div className="wrap wrap-wide">
          <Link to="/" className="brand" aria-label="Fold Equity — home">
            <Mark />
            <span className="brand-name">FOLD <em>EQUITY</em></span>
          </Link>

          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-tools">
            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to daylight casino mode' : 'Switch to late-night mode'}
              title={theme === 'dark' ? 'Daylight casino' : 'Late night'}
            >
              {theme === 'dark' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4.2" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M19.1 4.9l-1.5 1.5M6.4 17.6l-1.5 1.5" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a6.9 6.9 0 0 0 11.1 11.1z" />
                </svg>
              )}
            </button>
            <button
              className="icon-btn nav-toggle"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="nav-drawer">
        <nav aria-label="Mobile">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap wrap-wide">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="brand" style={{ marginBottom: 12 }}>
              <Mark />
              <span className="brand-name">FOLD <em>EQUITY</em></span>
            </Link>
            <p className="small muted" style={{ maxWidth: '38ch' }}>
              A strategy academy for every poker variant that exists — {GAME_COUNT} of them.
              Rules, winning strategy and bluff theory, taught on a 3D table.
            </p>
          </div>

          <div className="footer-col">
            <h5>Learn</h5>
            <Link to="/games">Game Library</Link>
            <Link to="/games/no-limit-holdem">No-Limit Hold'em</Link>
            <Link to="/games/pot-limit-omaha">Pot-Limit Omaha</Link>
            <Link to="/games/deuce-to-seven-triple-draw">2-7 Triple Draw</Link>
            <Link to="/glossary">Glossary</Link>
          </div>

          <div className="footer-col">
            <h5>Practise</h5>
            <Link to="/bluff-lab">Bluff Lab</Link>
            <Link to="/trainers#pot-odds">Pot odds trainer</Link>
            <Link to="/trainers#ranges">Range viewer</Link>
            <Link to="/trainers#outs">Outs counter</Link>
            <Link to="/trainers#icm">ICM basics</Link>
            <Link to="/trainers#bankroll">Bankroll & variance</Link>
          </div>

          <div className="footer-col">
            <h5>This site</h5>
            <Link to="/coach">AI Coach</Link>
            <Link to="/about">About &amp; FAQ</Link>
            <Link to="/responsible-play">Responsible Play</Link>
          </div>
        </div>

        <div className="age-notice">
          <span className="age-badge">18+</span>
          <div>
            <b>Educational content only.</b>{' '}
            <span className="muted small">
              Fold Equity teaches poker strategy. There is no real-money play here, no affiliate
              links and no casino advertising of any kind. Nothing on this site is a guarantee of
              results — poker is a long-run edge over short-run variance, and most people who play
              lose money. If gambling is causing you harm, please read our{' '}
              <Link to="/responsible-play">Responsible Play</Link> page.
            </span>
          </div>
        </div>

        <div className="footer-legal">
          <span>© {new Date().getFullYear()} Fold Equity. Educational use only.</span>
          <span>Every game. Every edge. Every bluff.</span>
        </div>
      </div>
    </footer>
  )
}

/** Scrolls to the top on navigation, and to #hash targets when present. */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
