import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

export function SectionHead({
  eyebrow, title, lede, id, as = 'h2',
}: { eyebrow?: string; title: string; lede?: string; id?: string; as?: 'h1' | 'h2' }) {
  const H = as
  return (
    <header className="section-head" id={id}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <H className={as === 'h1' ? 'section-h1' : undefined}>{title}</H>
      {lede && <p className="lede">{lede}</p>}
    </header>
  )
}

/** A 1–5 pip meter. Used for difficulty and bluff potential. */
export function Meter({
  value, max = 5, label, tone = 'brass',
}: { value: number; max?: number; label?: string; tone?: 'brass' | 'danger' }) {
  return (
    <span className="meter" role="img" aria-label={`${label ?? 'Rating'}: ${value} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`meter-pip${i < value ? ` is-on is-${tone}` : ''}`} aria-hidden="true" />
      ))}
    </span>
  )
}

export function StatTile({
  value, label, hint, mono = true,
}: { value: ReactNode; label: string; hint?: string; mono?: boolean }) {
  return (
    <div className="stat-tile">
      <div className={`stat-value${mono ? ' num' : ''}`}>{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint faint tiny">{hint}</div>}
    </div>
  )
}

export function OddsBadge({
  label, value, tone = 'neutral',
}: { label: string; value: string; tone?: 'neutral' | 'good' | 'bad' | 'brass' }) {
  return (
    <span className={`odds-badge odds-${tone}`}>
      <span className="odds-label">{label}</span>
      <span className="odds-value num">{value}</span>
    </span>
  )
}

/** Horizontal equity bar — hero share vs villain share. */
export function EquityBar({
  hero, label = 'Your equity', heroLabel = 'You', villainLabel = 'Them',
}: { hero: number; label?: string; heroLabel?: string; villainLabel?: string }) {
  const h = Math.max(0, Math.min(100, hero))
  return (
    <div className="equity">
      <div className="equity-top">
        <span className="small muted">{label}</span>
        <span className="num equity-num">{h.toFixed(1)}%</span>
      </div>
      <div className="equity-track" role="img" aria-label={`${heroLabel} ${h.toFixed(1)} percent, ${villainLabel} ${(100 - h).toFixed(1)} percent`}>
        <div className="equity-fill" style={{ width: `${h}%` }} />
      </div>
      <div className="equity-legend tiny faint">
        <span>{heroLabel}</span><span>{villainLabel}</span>
      </div>
    </div>
  )
}

export function Callout({
  tone = 'brass', title, children,
}: { tone?: 'brass' | 'danger' | 'info'; title?: string; children: ReactNode }) {
  return (
    <aside className={`callout callout-${tone}`}>
      {title && <h4 className="callout-title">{title}</h4>}
      <div className="callout-body">{children}</div>
    </aside>
  )
}

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={it.label}>
          {i > 0 && <span className="crumbs-sep" aria-hidden="true">/</span>}
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty panel">
      <h3>{title}</h3>
      <p className="muted">{body}</p>
    </div>
  )
}
