import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GAMES, FAMILY_ORDER, FAMILY_META, STRUCTURE_META, HILO_META, DIFFICULTY_LABEL, GAME_COUNT } from '../data/games'
import type { Family, Structure, HiLo } from '../data/types'
import { GameCard } from '../components/GameCard'
import { SectionHead, Empty } from '../components/ui'

type SortKey = 'name' | 'difficulty' | 'bluff'

export function Library() {
  const [params, setParams] = useSearchParams()
  const [families, setFamilies] = useState<Set<Family>>(new Set())
  const [structures, setStructures] = useState<Set<Structure>>(new Set())
  const [hiLos, setHiLos] = useState<Set<HiLo>>(new Set())
  const [maxDiff, setMaxDiff] = useState(5)
  const [minBluff, setMinBluff] = useState(0)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('name')

  // A ?family= link from the home page pre-selects that filter.
  useEffect(() => {
    const f = params.get('family') as Family | null
    if (f && FAMILY_ORDER.includes(f)) setFamilies(new Set([f]))
  }, [params])

  const toggle = <T,>(set: Set<T>, setter: (s: Set<T>) => void, v: T) => {
    const next = new Set(set)
    if (next.has(v)) next.delete(v); else next.add(v)
    setter(next)
    if (params.get('family')) { params.delete('family'); setParams(params, { replace: true }) }
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = GAMES.filter((g) => {
      if (families.size && !families.has(g.family)) return false
      if (structures.size && !g.structures.some((s) => structures.has(s))) return false
      if (hiLos.size && !hiLos.has(g.hiLo)) return false
      if (g.difficulty > maxDiff) return false
      if (g.bluffRating < minBluff) return false
      if (q && !(`${g.name} ${g.short} ${g.tagline} ${g.blurb}`.toLowerCase().includes(q))) return false
      return true
    })
    return list.sort((a, b) => {
      if (sort === 'difficulty') return a.difficulty - b.difficulty || a.name.localeCompare(b.name)
      if (sort === 'bluff') return b.bluffRating - a.bluffRating || a.name.localeCompare(b.name)
      return a.name.localeCompare(b.name)
    })
  }, [families, structures, hiLos, maxDiff, minBluff, query, sort])

  const active = families.size + structures.size + hiLos.size + (maxDiff < 5 ? 1 : 0) + (minBluff > 0 ? 1 : 0) + (query ? 1 : 0)

  const clear = () => {
    setFamilies(new Set()); setStructures(new Set()); setHiLos(new Set())
    setMaxDiff(5); setMinBluff(0); setQuery('')
    if (params.get('family')) { params.delete('family'); setParams(params, { replace: true }) }
  }

  return (
    <div className="section">
      <div className="wrap wrap-wide">
        <SectionHead
          as="h1"
          eyebrow="Game Library"
          title={`All ${GAME_COUNT} variants`}
          lede="Filter by family, betting structure, how the pot is awarded, difficulty, or how much bluffing is actually worth. Banked casino games are marked — in those, the bluff rating is zero and that is not a judgement, it is arithmetic."
        />

        <div className="lib-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search variants — try 'badugi', 'lowball', 'split pot'…"
            aria-label="Search games"
            className="lib-input"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort by" className="lib-select">
            <option value="name">A–Z</option>
            <option value="difficulty">Easiest first</option>
            <option value="bluff">Most bluffable first</option>
          </select>
        </div>

        <div className="filters">
          <fieldset className="filter-group">
            <legend>Family</legend>
            <div className="chips">
              {FAMILY_ORDER.map((f) => (
                <button
                  key={f}
                  className={`chip${families.has(f) ? ' is-on' : ''}`}
                  onClick={() => toggle(families, setFamilies, f)}
                  aria-pressed={families.has(f)}
                >
                  {FAMILY_META[f].label}
                  <span className="chip-count">{GAMES.filter((g) => g.family === f).length}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>Betting structure</legend>
            <div className="chips">
              {(Object.keys(STRUCTURE_META) as Structure[]).map((s) => (
                <button
                  key={s}
                  className={`chip${structures.has(s) ? ' is-on' : ''}`}
                  onClick={() => toggle(structures, setStructures, s)}
                  aria-pressed={structures.has(s)}
                >
                  {STRUCTURE_META[s]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>How the pot is awarded</legend>
            <div className="chips">
              {(Object.keys(HILO_META) as HiLo[]).map((h) => (
                <button
                  key={h}
                  className={`chip${hiLos.has(h) ? ' is-on' : ''}`}
                  onClick={() => toggle(hiLos, setHiLos, h)}
                  aria-pressed={hiLos.has(h)}
                >
                  {HILO_META[h]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group filter-sliders">
            <legend>Difficulty &amp; bluff potential</legend>
            <label className="slider-row">
              <span className="small">Difficulty up to <b className="num">{maxDiff}</b> <span className="faint">({DIFFICULTY_LABEL[maxDiff]})</span></span>
              <input type="range" min={1} max={5} value={maxDiff} onChange={(e) => setMaxDiff(Number(e.target.value))} />
            </label>
            <label className="slider-row">
              <span className="small">Bluff potential at least <b className="num">{minBluff}</b></span>
              <input type="range" min={0} max={5} value={minBluff} onChange={(e) => setMinBluff(Number(e.target.value))} />
            </label>
          </fieldset>
        </div>

        <div className="lib-status">
          <span className="muted small">
            Showing <b className="num">{results.length}</b> of <b className="num">{GAME_COUNT}</b>
          </span>
          {active > 0 && <button className="btn btn-quiet btn-sm" onClick={clear}>Clear {active} filter{active > 1 ? 's' : ''}</button>}
        </div>

        {results.length === 0 ? (
          <Empty
            title="Nothing matches those filters"
            body="Try widening the difficulty range or clearing a family filter. Every variant in the brief is in here somewhere."
          />
        ) : (
          <div className="grid grid-3">
            {results.map((g) => <GameCard key={g.slug} game={g} />)}
          </div>
        )}
      </div>
    </div>
  )
}
