import { useMemo, useState } from 'react'
import { GLOSSARY, CATEGORY_LABEL, GLOSSARY_COUNT, type GlossaryCategory } from '../data/glossary'
import { SectionHead, Empty } from '../components/ui'

const CATS = Object.keys(CATEGORY_LABEL) as GlossaryCategory[]

export function Glossary() {
  const [query, setQuery] = useState('')
  const [cats, setCats] = useState<Set<GlossaryCategory>>(new Set())

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GLOSSARY
      .filter((t) => {
        if (cats.size && !cats.has(t.cat)) return false
        if (!q) return true
        return t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q) || (t.also ?? '').toLowerCase().includes(q)
      })
      .sort((a, b) => {
        // Exact and prefix matches first, then alphabetical.
        if (q) {
          const ar = a.term.toLowerCase().startsWith(q) ? 0 : 1
          const br = b.term.toLowerCase().startsWith(q) ? 0 : 1
          if (ar !== br) return ar - br
        }
        return a.term.localeCompare(b.term)
      })
  }, [query, cats])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof GLOSSARY>()
    for (const t of results) {
      const letter = t.term[0].toUpperCase()
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(t)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [results])

  const toggle = (c: GlossaryCategory) => {
    const next = new Set(cats)
    if (next.has(c)) next.delete(c); else next.add(c)
    setCats(next)
  }

  return (
    <div className="section">
      <div className="wrap wrap-wide">
        <SectionHead
          as="h1"
          eyebrow="Glossary"
          title={`${GLOSSARY_COUNT} terms`}
          lede="Every piece of jargon used on this site, defined without assuming you already know the jargon in the definition."
        />

        <div className="lib-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms and definitions — try 'blocker', 'ICM', 'snow'…"
            aria-label="Search glossary"
            className="lib-input"
          />
        </div>

        <div className="chips" style={{ marginBottom: 26 }}>
          {CATS.map((c) => (
            <button key={c} className={`chip${cats.has(c) ? ' is-on' : ''}`} onClick={() => toggle(c)} aria-pressed={cats.has(c)}>
              {CATEGORY_LABEL[c]}
              <span className="chip-count">{GLOSSARY.filter((t) => t.cat === c).length}</span>
            </button>
          ))}
          {(cats.size > 0 || query) && (
            <button className="btn btn-quiet btn-sm" onClick={() => { setCats(new Set()); setQuery('') }}>Clear</button>
          )}
        </div>

        <p className="muted small" style={{ marginBottom: 24 }}>
          Showing <b className="num">{results.length}</b> of <b className="num">{GLOSSARY_COUNT}</b>
        </p>

        {results.length === 0 ? (
          <Empty title="No matching terms" body="Try a shorter search, or clear the category filters." />
        ) : (
          <div className="glossary">
            {grouped.map(([letter, terms]) => (
              <section key={letter} className="gloss-group">
                <h2 className="gloss-letter" id={`letter-${letter}`}>{letter}</h2>
                <dl className="gloss-list">
                  {terms.map((t) => (
                    <div key={t.term} className="gloss-item">
                      <dt>
                        {t.term}
                        <span className="badge gloss-cat">{CATEGORY_LABEL[t.cat]}</span>
                      </dt>
                      <dd>
                        {t.def}
                        {t.also && <span className="gloss-also tiny faint"> See also: {t.also}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
