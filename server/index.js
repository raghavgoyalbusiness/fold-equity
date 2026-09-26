import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { COACH_SYSTEM, HAND_ANALYSER_SYSTEM, BLUFF_GRADER_SYSTEM, STUDY_PLAN_SYSTEM } from './prompts.js'

const PORT = Number(process.env.PORT ?? 5327)
const MODEL = process.env.FE_MODEL ?? 'claude-opus-5'

const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
const client = new Anthropic()

const app = express()
app.use(express.json({ limit: '1mb' }))

/** Opus 5: adaptive thinking on, plus server-side refusal fallbacks. */
const BASE = {
  model: MODEL,
  thinking: { type: 'adaptive', display: 'summarized' },
  betas: ['server-side-fallback-2026-07-01'],
  fallbacks: 'default',
}

const NO_KEY = {
  error: 'ai_unavailable',
  message:
    'The AI coach needs an Anthropic API key. Set ANTHROPIC_API_KEY in the environment and restart the API server — everything else on the site works without it.',
}

function fail(res, err) {
  if (err instanceof Anthropic.AuthenticationError) {
    return res.status(401).json({ error: 'auth', message: 'The Anthropic API key was rejected. Check ANTHROPIC_API_KEY.' })
  }
  if (err instanceof Anthropic.RateLimitError) {
    return res.status(429).json({ error: 'rate_limit', message: 'Rate limited by the Anthropic API. Wait a moment and try again.' })
  }
  if (err instanceof Anthropic.APIError) {
    return res.status(err.status ?? 502).json({ error: 'api', message: err.message })
  }
  console.error('[fold-equity]', err)
  return res.status(500).json({ error: 'server', message: String(err?.message ?? err) })
}

// ---------------------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiEnabled: hasKey, model: MODEL })
})

// ---------------------------------------------------------------------------
// Coach chat — streamed over SSE so the reply appears as it is written.
// ---------------------------------------------------------------------------

app.post('/api/coach', async (req, res) => {
  if (!hasKey) return res.status(503).json(NO_KEY)

  const { messages = [], context = {} } = req.body ?? {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'bad_request', message: 'messages[] is required.' })
  }

  const contextLines = [
    context.gameName && `Game being studied: ${context.gameName}${context.gameFamily ? ` (${context.gameFamily} family)` : ''}.`,
    context.banked && 'This is a HOUSE-BANKED game. Bluffing has zero expected value here.',
    context.skill && `Learner's stated level: ${context.skill}.`,
    context.hand && `Hand currently on the 3D table: ${context.hand}.`,
    context.page && `They are reading: ${context.page}.`,
  ].filter(Boolean)

  const system = contextLines.length
    ? `${COACH_SYSTEM}\n\nCURRENT CONTEXT\n${contextLines.join('\n')}`
    : COACH_SYSTEM

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)

  // Detecting hang-up must listen on the RESPONSE, not the request.
  let aborted = false
  res.on('close', () => { aborted = true })

  try {
    const stream = client.beta.messages.stream({
      ...BASE,
      max_tokens: 64000,
      system,
      messages: messages
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content })),
    })

    for await (const event of stream) {
      if (aborted) break
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') send('delta', { text: event.delta.text })
        else if (event.delta.type === 'thinking_delta') send('thinking', { text: event.delta.thinking })
      } else if (event.type === 'content_block_start' && event.content_block.type === 'thinking') {
        send('thinking_start', {})
      }
    }

    if (!aborted) {
      const final = await stream.finalMessage()
      if (final.stop_reason === 'refusal') {
        send('error', {
          message:
            'The model declined to answer that one. Rephrase it as a strategy question and I will pick it back up.',
        })
      }
      send('done', { stop: final.stop_reason, model: final.model })
    }
  } catch (err) {
    console.error('[fold-equity] coach', err)
    if (!aborted) send('error', { message: err?.message ?? 'Something went wrong talking to the model.' })
  } finally {
    if (!aborted) res.end()
  }
})

// ---------------------------------------------------------------------------
// Hand analyser — structured JSON so the 3D table can rebuild the hand.
// ---------------------------------------------------------------------------

const CardCode = z.string().describe('Two characters: rank then suit, e.g. "Ah", "Td", "7c".')

const ActionSchema = z.object({
  player: z.string().describe('Player label, e.g. "Hero", "BTN", "Villain".'),
  action: z.enum(['fold', 'check', 'call', 'bet', 'raise', 'all-in', 'post', 'draw', 'stand pat']),
  amount: z.number().nullable().describe('Amount in the stated units, or null if not given.'),
  verdict: z.enum(['good', 'marginal', 'mistake', 'n/a']),
  reason: z.string().describe('One or two sentences. Include the arithmetic for any odds claim.'),
})

const StreetSchema = z.object({
  street: z.string().describe('preflop | flop | turn | river, or the stud/draw equivalent.'),
  cards: z.array(CardCode).describe('Community or newly exposed cards on this street. Empty if none.'),
  potBefore: z.number().nullable(),
  actions: z.array(ActionSchema),
  note: z.string().describe('What actually mattered on this street.'),
})

const HandSchema = z.object({
  game: z.string().describe('The variant, e.g. "No-Limit Hold\'em".'),
  units: z.string().describe('"big blinds" or "chips" or the currency used.'),
  heroPosition: z.string().nullable(),
  heroCards: z.array(CardCode),
  seats: z.number().int().describe('Number of players dealt in. Best estimate if not stated.'),
  effectiveStack: z.number().nullable(),
  streets: z.array(StreetSchema),
  finalPot: z.number().nullable(),
  result: z.string().describe('What happened at the end, as stated or inferred.'),
  summary: z.string().describe('Two or three sentences on how the hand went.'),
  biggestMistake: z.string().describe('The single most costly decision, and what to do instead. "None" if the hand was played well.'),
  keyLesson: z.string().describe('One transferable principle.'),
  confidence: z.enum(['high', 'medium', 'low']).describe('How confident you are in the parse, given how complete the input was.'),
  assumptions: z.array(z.string()).describe('Anything you had to infer because it was not stated.'),
})

app.post('/api/analyse-hand', async (req, res) => {
  if (!hasKey) return res.status(503).json(NO_KEY)
  const { text } = req.body ?? {}
  if (typeof text !== 'string' || text.trim().length < 12) {
    return res.status(400).json({ error: 'bad_request', message: 'Paste a hand history or describe the hand in a sentence or two.' })
  }

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: HAND_ANALYSER_SYSTEM,
      messages: [{ role: 'user', content: `Parse and critique this hand:\n\n${text.slice(0, 20000)}` }],
      output_config: { format: zodOutputFormat(HandSchema, 'hand_analysis') },
    })
    if (!response.parsed_output) {
      return res.status(502).json({ error: 'parse_failed', message: 'The model could not produce a structured reading of that hand. Try adding the positions and the board.' })
    }
    res.json(response.parsed_output)
  } catch (err) { fail(res, err) }
})

// ---------------------------------------------------------------------------
// Bluff grader
// ---------------------------------------------------------------------------

const GradeSchema = z.object({
  overall: z.number().int().min(0).max(100),
  storyConsistency: z.number().int().min(0).max(100),
  foldEquity: z.number().int().min(0).max(100),
  blockers: z.number().int().min(0).max(100),
  sizing: z.number().int().min(0).max(100),
  targeting: z.number().int().min(0).max(100),
  verdict: z.string().describe('Two or three sentences. Lead with the judgement.'),
  maths: z.string().describe('The arithmetic: break-even fold percentage, pot odds, equity where relevant.'),
  betterLine: z.string().describe('What a stronger action would have been, or confirmation that this was the best one.'),
  style: z.enum(['balanced', 'exploitative', 'neither']).describe('Whether the chosen action is a balanced baseline play or an exploitative deviation.'),
})

app.post('/api/bluff-grade', async (req, res) => {
  if (!hasKey) return res.status(503).json(NO_KEY)
  const { scenario, action } = req.body ?? {}
  if (!scenario || !action) {
    return res.status(400).json({ error: 'bad_request', message: 'scenario and action are both required.' })
  }

  const brief = `
GAME: ${scenario.gameLabel}
CONCEPT UNDER TEST: ${scenario.concept}
STREET: ${scenario.street}
HERO CARDS: ${(scenario.hero ?? []).join(' ') || 'n/a'}
BOARD: ${(scenario.board ?? []).join(' ') || 'no board in this game'}
POT: ${scenario.potBB}bb    EFFECTIVE STACK: ${scenario.stackBB}bb
HERO POSITION: ${scenario.position}
OPPONENT: ${scenario.opponentPosition} — ${scenario.opponentProfile}
HISTORY:
${(scenario.history ?? []).map((h) => `  - ${h}`).join('\n')}

THE PLAYER CHOSE: ${action.label}${action.sizing ? ` (${Math.round(action.sizing * 100)}% of pot = ${Math.round(action.sizing * scenario.potBB)}bb)` : ''}

Grade this decision.`.trim()

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: BLUFF_GRADER_SYSTEM,
      messages: [{ role: 'user', content: brief }],
      output_config: { format: zodOutputFormat(GradeSchema, 'bluff_grade') },
    })
    if (!response.parsed_output) {
      return res.status(502).json({ error: 'parse_failed', message: 'Could not grade that decision. The built-in grade is still shown below.' })
    }
    res.json(response.parsed_output)
  } catch (err) { fail(res, err) }
})

// ---------------------------------------------------------------------------
// Study plan
// ---------------------------------------------------------------------------

const PlanSchema = z.object({
  headline: z.string().describe('One sentence naming the single biggest gap.'),
  diagnosis: z.string().describe('Two or three sentences on the pattern across their results.'),
  days: z.array(z.object({
    day: z.number().int().min(1).max(7),
    focus: z.string().describe('Short title, under 8 words.'),
    why: z.string().describe('One sentence linking it to a topic they missed.'),
    task: z.string().describe('A concrete, checkable exercise.'),
    minutes: z.number().int().min(10).max(60),
    tool: z.string().describe('The site page or trainer to use, or "none".'),
  })).length(7),
  watchFor: z.string().describe('The failure mode most likely to undo the week.'),
})

app.post('/api/study-plan', async (req, res) => {
  if (!hasKey) return res.status(503).json(NO_KEY)
  const { results = [], weak = [], skill = 'casual' } = req.body ?? {}
  if (!Array.isArray(results) || results.length < 3) {
    return res.status(400).json({ error: 'not_enough_data', message: 'Complete at least three game quizzes first — the plan is built from what you actually missed.' })
  }

  const brief = `
LEARNER LEVEL: ${skill}

QUIZ RESULTS
${results.map((r) => `  - ${r.gameName}: ${r.score}/${r.total}`).join('\n')}

TOPICS MISSED (most frequent first)
${weak.length ? weak.map((w) => `  - ${w.topic} (missed ${w.misses}x)`).join('\n') : '  - none recorded'}

Build the 7-day plan.`.trim()

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: STUDY_PLAN_SYSTEM,
      messages: [{ role: 'user', content: brief }],
      output_config: { format: zodOutputFormat(PlanSchema, 'study_plan') },
    })
    if (!response.parsed_output) {
      return res.status(502).json({ error: 'parse_failed', message: 'Could not build a plan from those results.' })
    }
    res.json(response.parsed_output)
  } catch (err) { fail(res, err) }
})

// ---------------------------------------------------------------------------

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[fold-equity] API on http://127.0.0.1:${PORT}  model=${MODEL}  ai=${hasKey ? 'enabled' : 'DISABLED (no ANTHROPIC_API_KEY)'}`)
})
