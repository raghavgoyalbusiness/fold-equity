export interface CoachContext {
  gameName?: string
  gameFamily?: string
  banked?: boolean
  skill?: string
  hand?: string
  page?: string
}
export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export interface StreamHandlers {
  onDelta: (text: string) => void
  onThinking?: (text: string) => void
  onDone: (info: { stop?: string; model?: string }) => void
  onError: (message: string) => void
}

/** POST /api/coach and read the SSE stream. Returns an abort function. */
export function streamCoach(
  messages: ChatMessage[],
  context: CoachContext,
  h: StreamHandlers,
): () => void {
  const controller = new AbortController()

  ;(async () => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => null)
        h.onError(payload?.message ?? `The coach is unavailable (HTTP ${res.status}).`)
        h.onDone({})
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // SSE frames are separated by a blank line.
        let sep: number
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sep)
          buffer = buffer.slice(sep + 2)

          let event = 'message'
          let data = ''
          for (const line of frame.split('\n')) {
            if (line.startsWith('event: ')) event = line.slice(7).trim()
            else if (line.startsWith('data: ')) data += line.slice(6)
          }
          if (!data) continue

          let parsed: { text?: string; message?: string; stop?: string; model?: string }
          try { parsed = JSON.parse(data) } catch { continue }

          if (event === 'delta' && parsed.text) h.onDelta(parsed.text)
          else if (event === 'thinking' && parsed.text) h.onThinking?.(parsed.text)
          else if (event === 'error') h.onError(parsed.message ?? 'Something went wrong.')
          else if (event === 'done') h.onDone({ stop: parsed.stop, model: parsed.model })
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      h.onError('Could not reach the coach. Is the API server running on port 5327?')
      h.onDone({})
    }
  })()

  return () => controller.abort()
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await res.json().catch(() => null)
  if (!res.ok) throw new Error(payload?.message ?? `Request failed (HTTP ${res.status}).`)
  return payload as T
}

// --- Hand analyser ---------------------------------------------------------

export interface HandAction {
  player: string
  action: string
  amount: number | null
  verdict: 'good' | 'marginal' | 'mistake' | 'n/a'
  reason: string
}
export interface HandStreet {
  street: string
  cards: string[]
  potBefore: number | null
  actions: HandAction[]
  note: string
}
export interface HandAnalysis {
  game: string
  units: string
  heroPosition: string | null
  heroCards: string[]
  seats: number
  effectiveStack: number | null
  streets: HandStreet[]
  finalPot: number | null
  result: string
  summary: string
  biggestMistake: string
  keyLesson: string
  confidence: 'high' | 'medium' | 'low'
  assumptions: string[]
}
export const analyseHand = (text: string) => postJson<HandAnalysis>('/api/analyse-hand', { text })

// --- Bluff grader ----------------------------------------------------------

export interface BluffGrade {
  overall: number
  storyConsistency: number
  foldEquity: number
  blockers: number
  sizing: number
  targeting: number
  verdict: string
  maths: string
  betterLine: string
  style: 'balanced' | 'exploitative' | 'neither'
}
export const gradeBluff = (scenario: unknown, action: unknown) =>
  postJson<BluffGrade>('/api/bluff-grade', { scenario, action })

// --- Study plan ------------------------------------------------------------

export interface StudyDay {
  day: number
  focus: string
  why: string
  task: string
  minutes: number
  tool: string
}
export interface StudyPlan {
  headline: string
  diagnosis: string
  days: StudyDay[]
  watchFor: string
}
export const buildStudyPlan = (results: unknown[], weak: unknown[], skill: string) =>
  postJson<StudyPlan>('/api/study-plan', { results, weak, skill })

// --- Health ----------------------------------------------------------------

export interface Health { ok: boolean; aiEnabled: boolean; model: string }
export async function checkHealth(): Promise<Health | null> {
  try {
    const res = await fetch('/api/health')
    if (!res.ok) return null
    return (await res.json()) as Health
  } catch { return null }
}
