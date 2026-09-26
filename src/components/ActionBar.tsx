import { useState } from 'react'

export interface ActionChoice {
  id: string
  label: string
  kind: 'fold' | 'check' | 'call' | 'bet' | 'raise'
  sizing?: number
}

export function ActionBar({
  choices, onChoose, disabled, chosen, potBB,
}: {
  choices: ActionChoice[]
  onChoose: (id: string) => void
  disabled?: boolean
  chosen?: string | null
  potBB?: number
}) {
  // The slider is presentational here: it shows what each preset costs in
  // big blinds so the sizing choices stop being abstract.
  const [preview, setPreview] = useState<string | null>(null)
  const active = choices.find((c) => c.id === (preview ?? chosen))
  const amount = active?.sizing && potBB ? Math.round(active.sizing * potBB) : null

  return (
    <div className="action-bar">
      <div className="action-row">
        {choices.map((c) => (
          <button
            key={c.id}
            className={`action-btn action-${c.kind}${chosen === c.id ? ' is-chosen' : ''}`}
            onClick={() => onChoose(c.id)}
            onMouseEnter={() => setPreview(c.id)}
            onMouseLeave={() => setPreview(null)}
            onFocus={() => setPreview(c.id)}
            onBlur={() => setPreview(null)}
            disabled={disabled}
            aria-pressed={chosen === c.id}
          >
            <span className="action-label">{c.label}</span>
            {c.sizing != null && potBB != null && (
              <span className="action-size num">{Math.round(c.sizing * potBB)}bb</span>
            )}
          </button>
        ))}
      </div>

      {potBB != null && (
        <div className="action-slider" aria-hidden="true">
          <div className="action-slider-track">
            <div
              className="action-slider-fill"
              style={{ width: `${Math.min(100, ((active?.sizing ?? 0) / 2.5) * 100)}%` }}
            />
          </div>
          <div className="action-slider-meta tiny faint">
            <span>Pot <b className="num">{potBB}bb</b></span>
            <span>{amount != null ? <>Bet <b className="num">{amount}bb</b> · {Math.round((active!.sizing! ) * 100)}% pot</> : 'Hover an action to price it'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
