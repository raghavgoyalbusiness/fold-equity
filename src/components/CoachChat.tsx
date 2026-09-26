import { useEffect, useRef, useState, useCallback } from 'react'
import { streamCoach, checkHealth, type ChatMessage, type CoachContext, type Health } from '../lib/api'
import { useStore } from '../lib/store'

const STARTERS = [
  'What is fold equity, in one paragraph?',
  'When should I stop bluffing a player?',
  'Explain pot odds with a worked example.',
  'How do blockers change a river decision?',
]

export function CoachChat({
  context, suggestions = STARTERS, compact = false, seedMessage,
}: {
  context: CoachContext
  suggestions?: string[]
  compact?: boolean
  seedMessage?: string
}) {
  const skill = useStore((s) => s.skill)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [health, setHealth] = useState<Health | null | undefined>(undefined)
  const abortRef = useRef<(() => void) | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const seeded = useRef(false)

  useEffect(() => { checkHealth().then(setHealth) }, [])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  const send = useCallback((text: string) => {
    const content = text.trim()
    if (!content || streaming) return
    setError(null)
    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages([...next, { role: 'assistant', content: '' }])
    setDraft('')
    setStreaming(true)

    abortRef.current = streamCoach(next, { ...context, skill }, {
      onDelta: (chunk) => {
        setMessages((prev) => {
          const copy = [...prev]
          const last = copy[copy.length - 1]
          if (last?.role === 'assistant') copy[copy.length - 1] = { ...last, content: last.content + chunk }
          return copy
        })
      },
      onError: (m) => setError(m),
      onDone: () => {
        setStreaming(false)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          // Drop an empty assistant bubble if the stream failed before any text.
          if (last?.role === 'assistant' && last.content === '') return prev.slice(0, -1)
          return prev
        })
      },
    })
  }, [messages, streaming, context, skill])

  useEffect(() => {
    if (seedMessage && !seeded.current && health?.aiEnabled) {
      seeded.current = true
      send(seedMessage)
    }
  }, [seedMessage, health, send])

  useEffect(() => () => abortRef.current?.(), [])

  const unavailable = health !== undefined && (health === null || !health.aiEnabled)

  return (
    <div className={`coach${compact ? ' is-compact' : ''}`}>
      <div className="coach-log" ref={logRef} aria-live="polite">
        {messages.length === 0 && (
          <div className="coach-intro">
            <p className="lede">
              Ask about any spot, any variant. Describe a hand in plain English or paste a hand history
              and it will be rebuilt and critiqued.
            </p>
            {context.gameName && (
              <p className="small muted">
                Loaded with context for <b>{context.gameName}</b>
                {context.banked && ' — a house-banked game, where bluffing has no value'}.
              </p>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`bubble bubble-${m.role}`}>
            {m.role === 'assistant' && <span className="bubble-who tiny">Coach</span>}
            <div className="bubble-body">
              {m.content
                ? m.content.split('\n').map((line, j) => (line.trim() ? <p key={j}>{line}</p> : null))
                : <span className="coach-typing" aria-label="Thinking"><i /><i /><i /></span>}
            </div>
          </div>
        ))}

        {error && <div className="coach-error">{error}</div>}

        {unavailable && messages.length === 0 && (
          <div className="coach-offline panel-quiet">
            <h4>The coach needs an API key</h4>
            <p className="small muted">
              Set <code>ANTHROPIC_API_KEY</code> in your environment and restart the API server.
              Every other part of the site — all 68 game pages, the trainers, the Bluff Lab
              scenarios and their built-in grading — works without it.
            </p>
          </div>
        )}
      </div>

      {messages.length === 0 && !unavailable && (
        <div className="coach-starters">
          {suggestions.map((s) => (
            <button key={s} className="btn btn-ghost btn-sm" onClick={() => send(s)} disabled={streaming}>{s}</button>
          ))}
        </div>
      )}

      <form
        className="coach-input"
        onSubmit={(e) => { e.preventDefault(); send(draft) }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft) }
          }}
          placeholder={unavailable ? 'Coach unavailable — API key not configured' : 'Describe a hand, or ask a question…'}
          rows={compact ? 2 : 3}
          disabled={streaming || unavailable}
          aria-label="Message the coach"
        />
        <div className="coach-input-row">
          <span className="tiny faint">Enter to send · Shift+Enter for a new line</span>
          {streaming ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { abortRef.current?.(); setStreaming(false) }}>
              Stop
            </button>
          ) : (
            <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim() || unavailable}>Ask</button>
          )}
        </div>
      </form>
    </div>
  )
}
