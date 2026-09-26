import { useMemo } from 'react'
import { comboCount, rangePercent, deckRanks, type HandClass } from '../lib/poker'

export interface RangeGridProps {
  raise: Set<string>
  call?: Set<string>
  deck?: 36 | 52
  compact?: boolean
  onCellHover?: (hand: string | null) => void
}

/**
 * The canonical 13x13 starting-hand grid: pairs on the diagonal,
 * suited above it, offsuit below. Short Deck collapses to 9x9.
 */
export function RangeGrid({ raise, call, deck = 52, compact = false, onCellHover }: RangeGridProps) {
  const ranks = useMemo(() => deckRanks(deck), [deck])
  const n = ranks.length

  const cells = useMemo(() => {
    const out: { label: string; cls: HandClass; state: 'raise' | 'call' | 'none' }[] = []
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const hi = ranks[Math.min(row, col)]
        const lo = ranks[Math.max(row, col)]
        const cls: HandClass = row === col ? 'pair' : col > row ? 'suited' : 'offsuit'
        const label = row === col ? `${hi}${hi}` : `${hi}${lo}${cls === 'suited' ? 's' : 'o'}`
        const state = raise.has(label) ? 'raise' : call?.has(label) ? 'call' : 'none'
        out.push({ label, cls, state })
      }
    }
    return out
  }, [ranks, n, raise, call])

  const raisePct = useMemo(() => rangePercent(raise, deck), [raise, deck])
  const callPct = useMemo(() => (call ? rangePercent(call, deck) : 0), [call, deck])

  return (
    <div className="range-wrap">
      <div
        className={`range-grid${compact ? ' is-compact' : ''}`}
        style={{ ['--range-n' as string]: n }}
        role="table"
        aria-label={`Starting hand grid, ${n} by ${n}`}
      >
        {cells.map((c) => (
          <button
            key={c.label}
            type="button"
            className={`range-cell range-${c.state} range-${c.cls}`}
            onMouseEnter={() => onCellHover?.(c.label)}
            onMouseLeave={() => onCellHover?.(null)}
            onFocus={() => onCellHover?.(c.label)}
            onBlur={() => onCellHover?.(null)}
            title={`${c.label} — ${comboCount(c.cls)} combinations — ${
              c.state === 'raise' ? 'raise' : c.state === 'call' ? 'call' : 'fold'
            }`}
          >
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="range-legend">
        <span className="range-key"><i className="range-swatch is-raise" /> Raise <b className="num">{raisePct.toFixed(1)}%</b></span>
        {call && <span className="range-key"><i className="range-swatch is-call" /> Call <b className="num">{callPct.toFixed(1)}%</b></span>}
        <span className="range-key"><i className="range-swatch is-none" /> Fold</span>
        {call && (
          <span className="range-key range-total">
            Total played <b className="num">{(raisePct + callPct).toFixed(1)}%</b>
          </span>
        )}
      </div>
      <p className="tiny faint range-axis">
        Pairs run down the diagonal · suited hands sit above it · offsuit below.
        {deck === 36 && ' Short Deck has no cards below a six, so the grid is 9×9 and percentages use a 630-combination deck.'}
      </p>
    </div>
  )
}
