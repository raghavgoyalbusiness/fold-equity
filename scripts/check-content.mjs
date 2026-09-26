/**
 * Content integrity checks.
 *
 * The site's whole claim is that its numbers are checkable, so they get
 * checked here rather than trusted. Run with `npm run check:content`.
 */
import fs from 'node:fs'
import path from 'node:path'

const SRC = 'src'
let failures = 0
const fail = (msg) => { console.error('  ✗ ' + msg); failures++ }
const read = (f) => fs.readFileSync(f, 'utf8')
const gameFiles = fs.readdirSync(`${SRC}/data/games`).filter((f) => f.endsWith('.ts') && f !== 'index.ts')

// ---------------------------------------------------------------------------
// 1. Arithmetic claims in prose: "A/(A+B) = C%" must actually equal C.
// ---------------------------------------------------------------------------
console.log('\n1. Arithmetic claims in prose')
{
  const files = [
    ...gameFiles.map((f) => `${SRC}/data/games/${f}`),
    `${SRC}/data/bluffLab.ts`,
  ]
  let checked = 0
  const re = /(\d+(?:\.\d+)?)\s*\/\s*\(\s*(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*\)\s*=\s*(\d+(?:\.\d+)?)\s*%/g
  for (const f of files) {
    const text = read(f)
    let m
    while ((m = re.exec(text))) {
      const [, a, b, c, claimed] = m.map(Number)
      const actual = (a / (b + c)) * 100
      checked++
      if (Math.abs(actual - claimed) > 0.65) {
        fail(`${path.basename(f)}: "${m[0]}" — actual ${actual.toFixed(1)}%`)
      }
    }
  }
  console.log(`  ${checked} fraction claims checked`)
}

// ---------------------------------------------------------------------------
// 2. Hand evaluation: prose that says "no flush" must not be sitting on one.
// ---------------------------------------------------------------------------
console.log('\n2. Hero hands vs boards')
{
  const R = '23456789TJQKA'
  const straight = (rs) => {
    const u = [...new Set(rs)].sort((a, b) => b - a)
    if (u.includes(12)) u.push(-1)
    let run = 1
    for (let i = 1; i < u.length; i++) {
      if (u[i] === u[i - 1] - 1) { run++; if (run >= 5) return true } else run = 1
    }
    return false
  }
  const evaluate = (cards) => {
    const ranks = cards.map((c) => R.indexOf(c[0]))
    const bySuit = {}
    cards.forEach((c, i) => { (bySuit[c[1]] ||= []).push(ranks[i]) })
    const flushSuit = Object.keys(bySuit).find((s) => bySuit[s].length >= 5)
    const counts = {}
    ranks.forEach((r) => { counts[r] = (counts[r] || 0) + 1 })
    const p = Object.values(counts)
    if (flushSuit && straight(bySuit[flushSuit])) return 'straight flush'
    if (p.includes(4)) return 'quads'
    if (p.includes(3) && p.filter((x) => x >= 2).length >= 2) return 'full house'
    if (flushSuit) return 'flush'
    if (straight(ranks)) return 'straight'
    if (p.includes(3)) return 'trips'
    if (p.filter((x) => x === 2).length >= 2) return 'two pair'
    if (p.includes(2)) return 'pair'
    return 'high card'
  }

  const files = [`${SRC}/data/bluffLab.ts`, ...gameFiles.map((f) => `${SRC}/data/games/${f}`)]
  let n = 0
  for (const f of files) {
    const text = read(f)
    // PLO uses "exactly two hole cards", so a 4+ card hand is not comparable
    // to a Hold'em evaluation — skip those, they are checked by hand.
    const re = /hero: \[([^\]]*)\][\s\S]{0,420}?board: \[([^\]]*)\]/g
    let m
    while ((m = re.exec(text))) {
      const hero = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]).filter((c) => c !== '?')
      const board = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1])
      if (hero.length !== 2 || board.length < 3) continue
      n++
      const made = evaluate([...hero, ...board])
      const context = text.slice(m.index, m.index + 2600).toLowerCase()
      // If the prose says there is no made hand, there must not be one.
      const claimsNothing = /no pair and no draw|no pair, no draw|you have ace-high|missed everything|contribute nothing|playing the board/.test(context)
      if (claimsNothing && made !== 'high card') {
        fail(`${path.basename(f)}: prose says no made hand, but ${hero.join(' ')} on ${board.join(' ')} makes a ${made.toUpperCase()}`)
      }
      if (/no flush/.test(context) && (made === 'flush' || made === 'straight flush')) {
        fail(`${path.basename(f)}: prose says "no flush", but ${hero.join(' ')} on ${board.join(' ')} makes a ${made.toUpperCase()}`)
      }
    }
  }
  console.log(`  ${n} two-card hero hands evaluated`)
}

// ---------------------------------------------------------------------------
// 3. Quiz integrity: the answer must be a real option, and every option
//    must carry an explanation — including the wrong ones.
// ---------------------------------------------------------------------------
console.log('\n3. Quiz integrity')
{
  let quizzes = 0
  for (const f of gameFiles) {
    const text = read(`${SRC}/data/games/${f}`)
    const re = /id: '([a-z0-9-]+-q\d)'[\s\S]*?options: \[([\s\S]*?)\],\s*answer: '([a-z])',\s*explain: \{([\s\S]*?)\n      \},/g
    let m
    while ((m = re.exec(text))) {
      const [, qid, optBlock, answer, explBlock] = m
      quizzes++
      const ids = [...optBlock.matchAll(/id: '([a-z])'/g)].map((x) => x[1])
      const explained = [...explBlock.matchAll(/^\s*([a-z]):/gm)].map((x) => x[1])
      if (!ids.includes(answer)) fail(`${qid}: answer '${answer}' is not one of [${ids}]`)
      for (const id of ids) if (!explained.includes(id)) fail(`${qid}: option '${id}' has no explanation`)
      for (const id of explained) if (!ids.includes(id)) fail(`${qid}: explanation for '${id}' has no matching option`)
    }
  }
  console.log(`  ${quizzes} quiz questions checked`)
}

// ---------------------------------------------------------------------------
// 4. Game data: unique slugs, valid cross-links, banked games never bluffable.
// ---------------------------------------------------------------------------
console.log('\n4. Game data')
{
  const slugs = new Set()
  const seeAlso = []
  const banked = []
  let games = 0
  for (const f of gameFiles) {
    const text = read(`${SRC}/data/games/${f}`)
    for (const m of text.matchAll(/^\s*slug: '([^']+)'/gm)) {
      if (slugs.has(m[1])) fail(`duplicate slug: ${m[1]}`)
      slugs.add(m[1]); games++
    }
    for (const m of text.matchAll(/seeAlso: \[([^\]]+)\]/g))
      for (const s of m[1].matchAll(/'([^']+)'/g)) seeAlso.push([f, s[1]])
    // Every banked game must declare bluffRating 0.
    for (const m of text.matchAll(/bluffRating: (\d)[\s\S]{0,80}?banked: true/g))
      if (m[1] !== '0') banked.push(`${f}: banked game with bluffRating ${m[1]}`)
  }
  for (const [f, s] of seeAlso) if (!slugs.has(s)) fail(`${f}: seeAlso -> unknown slug "${s}"`)
  for (const b of banked) fail(b)
  console.log(`  ${games} games, ${seeAlso.length} cross-links, all slugs resolve`)
}

// ---------------------------------------------------------------------------
// 5. Glossary: no duplicate terms.
// ---------------------------------------------------------------------------
console.log('\n5. Glossary')
{
  const text = read(`${SRC}/data/glossary.ts`)
  const names = [...text.matchAll(/^  \{ term: '([^']+)'/gm)].map((m) => m[1])
  const dupes = names.filter((n, i) => names.indexOf(n) !== i)
  if (dupes.length) fail(`duplicate terms: ${[...new Set(dupes)].join(', ')}`)
  if (names.length < 200) fail(`only ${names.length} terms — the brief asks for 200+`)
  console.log(`  ${names.length} terms, no duplicates`)
}

console.log(failures === 0 ? '\n✓ all content checks passed\n' : `\n✗ ${failures} problem(s)\n`)
process.exit(failures === 0 ? 0 : 1)
