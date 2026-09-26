import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { buildSlots, stagesFor, TABLE_RX, TABLE_RZ } from './dealPlan'
import type { DealPlan } from '../data/types'
import { useReducedMotion, useCanRender3D, useNearViewport } from '../lib/hooks'
import { useStore } from '../lib/store'
import { PlayingCard } from '../components/PlayingCard'

/** three.js is ~900kB — only fetched when a table actually renders. */
const Table3D = lazy(() => import('./Table3D'))

export interface PokerTableProps {
  deal: DealPlan
  seed: string
  /** Controlled stage index. Omit for the ambient looping hero. */
  stageIndex?: number
  loop?: boolean
  showHero?: boolean
  showAll?: boolean
  shortDeck?: boolean
  /** Pin the hero's hole cards / the community board to specific cards. */
  heroCards?: string[]
  boardCards?: string[]
  height?: string
  /** Render the orbit hint and allow dragging. */
  interactive?: boolean
  className?: string
}

export function PokerTable({
  deal, seed, stageIndex, loop = false, showHero = true, showAll = false,
  shortDeck = false, heroCards, boardCards,
  height = 'clamp(340px, 52vh, 560px)', interactive = true, className = '',
}: PokerTableProps) {
  const reduced = useReducedMotion()
  const can3d = useCanRender3D()
  const pref = useStore((s) => s.render3d)
  const [hover, setHover] = useState<string | null>(null)
  const { near, attach } = useNearViewport<HTMLDivElement>()

  const stages = useMemo(() => stagesFor(deal), [deal])
  const [autoStage, setAutoStage] = useState(0)

  // Ambient hero loop: advance a stage every few seconds, then reset.
  useEffect(() => {
    if (!loop || reduced) return
    const id = window.setInterval(() => {
      setAutoStage((s) => (s + 1) % (stages.length + 1))
    }, 2600)
    return () => window.clearInterval(id)
  }, [loop, reduced, stages.length])

  const effectiveStage = stageIndex ?? Math.min(autoStage, stages.length - 1)

  const slots = useMemo(
    () => buildSlots({
      deal, seed: `${seed}-${loop ? Math.floor(effectiveStage / stages.length) : 0}`,
      stageIndex: effectiveStage, showHero, showAll, shortDeck, heroCards, boardCards,
    }),
    [deal, seed, effectiveStage, showHero, showAll, shortDeck, heroCards, boardCards, loop, stages.length],
  )

  const use3d = pref === 'on' || (pref === 'auto' && can3d === true)
  const seats = Math.max(2, Math.min(deal.seats, 9))

  if (can3d === null && pref === 'auto') {
    return <div className={`table-shell ${className}`} style={{ height }} aria-busy="true"><div className="table-loading">Preparing the table…</div></div>
  }

  if (!use3d) {
    return (
      <div className={`table-shell ${className}`} style={{ height }} ref={attach}>
        <Table2D slots={slots} seats={seats} note={deal.note} />
        <p className="table-hud table-hud-static">
          <span className="badge badge-brass">2D table</span>
          <span className="muted small">
            {pref === 'off' ? 'You have turned the 3D scene off.' : 'Simplified for this device — the 3D table is available on desktop.'}
          </span>
        </p>
      </div>
    )
  }

  return (
    <div className={`table-shell ${className}`} style={{ height }} ref={attach}>
      {!near ? (
        <div className="table-loading">Dealing…</div>
      ) : (
      <Suspense fallback={<div className="table-loading">Dealing…</div>}>
        <Table3D
          slots={slots}
          seats={seats}
          reduced={reduced}
          interactive={interactive}
          autoRotate={loop && !reduced}
          onHover={setHover}
        />
      </Suspense>
      )}

      <div className="table-hud" aria-live="polite">
        {hover ? (
          <span className="table-hud-tip">{hover}</span>
        ) : (
          <>
            {deal.note && <span className="badge badge-felt">{deal.note}</span>}
            {interactive && <span className="muted tiny">Drag to orbit · scroll to zoom · hover a card, chip or seat</span>}
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2D fallback — same slot data, projected flat.
// ---------------------------------------------------------------------------

function Table2D({ slots, seats, note }: { slots: ReturnType<typeof buildSlots>; seats: number; note?: string }) {
  const toPct = (x: number, z: number) => ({
    left: `${50 + (x / (TABLE_RX + 1.3)) * 46}%`,
    top: `${50 + (z / (TABLE_RZ + 1.1)) * 40}%`,
  })
  return (
    <div className="table2d" role="img" aria-label={`Illustrated poker table, ${seats} seats. ${note ?? ''}`}>
      <div className="table2d-felt" />
      <div className="table2d-lamp" />
      {Array.from({ length: seats }, (_, i) => {
        const a = Math.PI / 2 + (i / seats) * Math.PI * 2
        const p = toPct((TABLE_RX + 0.5) * Math.cos(a), (TABLE_RZ + 0.5) * Math.sin(a))
        return <div key={i} className={`table2d-seat${i === 0 ? ' is-hero' : ''}`} style={p} />
      })}
      {slots.map((s) => {
        const p = toPct(s.pos[0], s.pos[2])
        return (
          <div key={s.id} className="table2d-card" style={p} title={s.tooltip}>
            <PlayingCard code={s.code} size="xs" />
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Replay controls
// ---------------------------------------------------------------------------

export function ReplayControls({
  deal, index, setIndex,
}: { deal: DealPlan; index: number; setIndex: (n: number) => void }) {
  const stages = useMemo(() => stagesFor(deal), [deal])
  const at = stages[Math.min(index, stages.length - 1)]

  return (
    <div className="replay">
      <div className="replay-bar">
        <button className="btn btn-ghost btn-sm" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
          ← Back
        </button>
        <ol className="replay-steps">
          {stages.map((s, i) => (
            <li key={`${s.key}-${i}`}>
              <button
                className={`replay-step${i === index ? ' is-active' : ''}${i < index ? ' is-done' : ''}`}
                onClick={() => setIndex(i)}
                aria-current={i === index ? 'step' : undefined}
              >
                <span className="replay-dot" aria-hidden="true" />
                <span>{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setIndex(Math.min(stages.length - 1, index + 1))}
          disabled={index >= stages.length - 1}
        >
          Next →
        </button>
      </div>
      <p className="replay-note muted small">{at?.note}</p>
    </div>
  )
}
