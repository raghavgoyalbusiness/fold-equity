# FOLD EQUITY

**Every game. Every edge. Every bluff.**

A poker strategy academy covering **68 variants** — from No-Limit Hold'em to Badeucey
to Pai Gow — taught on a reusable 3D table. Educational only: no real-money play,
no affiliate links, no casino advertising.

---

## Running it

```bash
npm install
npm run dev
```

- Web: http://127.0.0.1:5227
- API: http://127.0.0.1:5327

The AI features need an Anthropic API key:

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run dev
```

**Without a key everything else still works** — all 68 game pages, the hand-ranking
tables, the five Bluff Lab scenarios and their built-in grading, all five trainers,
and the glossary. The four AI endpoints return a clear 503 and the UI says so
rather than failing silently.

| Script | Does |
|---|---|
| `npm run dev` | Web + API together |
| `npm run build` | Typecheck + production bundle |
| `npm run check` | Typecheck + content integrity checks |
| `npm run check:content` | Content checks only |

## Content integrity checks

The site's whole premise is that its numbers are checkable, so `scripts/check-content.mjs`
checks them rather than trusting them:

1. **Arithmetic in prose** — every `A/(A+B) = C%` claim is recomputed and compared.
2. **Hand evaluation** — every hero+board pair is evaluated; prose that says
   "no flush" or "no made hand" must not be sitting on one. *(This caught a real bug:
   a Bluff Lab scenario said "ace-high" while the hero actually held the nut flush.)*
3. **Quiz integrity** — the answer must be a real option, and every option must carry
   an explanation, including the wrong ones.
4. **Game data** — unique slugs, all `seeAlso` cross-links resolve, and every banked
   game declares `bluffRating: 0`.
5. **Glossary** — no duplicate terms, 200+ minimum.

## Architecture

```
src/
  data/            The content layer — everything is data, not markup
    types.ts       Game, DealPlan, Stage, quiz and strategy shapes
    rankings.ts    11 hand-ranking systems (standard, short deck, manila,
                   A-5 low, 2-7 low, badugi, badeucey, badacey, chinese,
                   pai gow, video poker) — each with its ordering PRINCIPLE,
                   not just the table
    games/         68 games across 8 families; 3 written end to end
    glossary.ts    230 terms
    bluffLab.ts    5 graded scenarios + live and online tells
    ranges.ts      Preflop ranges; percentages are computed, never hardcoded
  three/
    dealPlan.ts    Turns a DealPlan + stage into 3D card positions. One engine
                   handles hole cards, stud up-cards, community boards, double
                   boards, draw discards and Chinese/OFC rows.
    Scene.tsx      Felt, torus rail, overhead lamp, cards, chips, seats
    Table3D.tsx    The WebGL half, lazy-loaded so three.js is its own chunk
    PokerTable.tsx Wrapper: 3D/2D decision, replay controls, viewport gating
  pages/           Home, Library, GamePage, BluffLab, Trainers, Coach,
                   Glossary, Responsible, About
server/
  index.js         Express proxy for the Claude API
  prompts.js       System prompts — the house rules live here
```

### The deal-plan engine

Every game declares a `DealPlan`, and one engine renders it:

```ts
{ hole: 2, board: [3, 1, 1], seats: 6 }                  // Hold'em
{ hole: 4, board: [3, 1, 1], seats: 6 }                  // PLO
{ hole: 7, faceUp: [2, 3, 4, 5], seats: 8 }              // Seven Card Stud
{ hole: 5, draws: 3, seats: 6 }                          // 2-7 Triple Draw
{ hole: 13, rows: [3, 5, 5], seats: 3 }                  // Open Face Chinese
{ hole: 2, board: [3, 1, 1], boards: 2, seats: 6 }       // Double-board
```

Pick a game and the same table re-deals in that game's structure. Hovering any
card, chip or seat explains its role.

## AI features (Claude API)

All four use `claude-opus-5` with adaptive thinking and server-side refusal fallbacks.

| Endpoint | Shape | Notes |
|---|---|---|
| `POST /api/coach` | SSE stream | Context-aware: game, skill level, current hand |
| `POST /api/analyse-hand` | Structured JSON | Parses hand histories *or* plain English, rebuilds on the 3D table, critiques every decision |
| `POST /api/bluff-grade` | Structured JSON | Scores 0–100 on story, fold equity, blockers, sizing, targeting |
| `POST /api/study-plan` | Structured JSON | 7-day plan built from the topics you actually missed |

Structured endpoints use `messages.parse()` with `zodOutputFormat`, so responses are
schema-validated rather than string-parsed.

### The house rules (`server/prompts.js`)

Every prompt carries the same non-negotiables:

1. **Show the maths.** An odds claim without its arithmetic is an opinion.
2. **Label exploitative vs balanced.** They are different claims about different opponents.
3. **Never guarantee results.** A long-run edge over variance, never "this wins".
4. **Educational only.** If a user describes chasing losses or gambling with money they
   cannot lose, set the strategy question aside and point to Responsible Play. That
   overrides everything else.
5. **Banked games have zero bluff value.** Not "low" — zero.

## Deliberate decisions worth knowing

- **Bluff rating 0 is a fact, not an opinion.** The ten house-banked games are marked
  zero throughout — filters, cards, game pages — and the check script enforces it.
- **Three games are written in full** (NLHE, PLO, 2-7 Triple Draw): one community-card
  game, one four-card game, one draw game, chosen so the structural ideas the other
  65 inherit are all covered. The rest have rules, rankings and a strategy primer.
- **Brass is two tokens.** `--accent` for decoration, `--accent-text` for text. Mid-tone
  brass passes AA on the dark theme and fails on the light one.
- **The header is opaque by default.** A transparent sticky header disappears over
  paper on interior pages at scroll 0.
- **`overflow-x: clip`, never `hidden`** on body — `hidden` breaks `position: sticky`.
  Grid blowouts are fixed with `minmax(0, 1fr)` instead.
- **Cards sit at y = 0.252**, just proud of the felt top at 0.24. Below it they render
  *inside* the felt and vanish silently.
- **The rail is a torus.** A solid cylinder covers the felt and swallows every card.
- **WebGL canvases are viewport-gated**, so the Bluff Lab holds one live context
  instead of five.
- **Range percentages are computed at runtime** from the notation, and Short Deck uses
  a 630-combination denominator rather than 1,326.

## Accessibility & motion

- One `h1` per page; skip link; focus-visible rings throughout.
- `prefers-reduced-motion` is respected: cards appear in place rather than dealing,
  the lamp stops swaying, and the hero loop holds still.
- 3D degrades to an illustrated 2D table on low-power and touch devices, with a manual
  override in About → Display settings.
- Four-colour deck so diamonds and hearts stay distinguishable at small sizes.

## 18+ · educational only

No real-money play. No affiliate links. No casino advertising. Most people who gamble
lose money, and the banked games are mathematically guaranteed to do so over time.
