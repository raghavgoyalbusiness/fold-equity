import { parseCard, SUIT_GLYPH, SUIT_COLOR } from '../lib/poker'

export type CardSize = 'xs' | 'sm' | 'md' | 'lg'

export function PlayingCard({
  code, size = 'md', className = '', title,
}: { code: string | null | undefined; size?: CardSize; className?: string; title?: string }) {
  const card = code ? parseCard(code) : null

  if (!card) {
    return (
      <span className={`pc pc-${size} pc-back ${className}`} title={title ?? 'Face-down card'} aria-label="Face-down card">
        <span className="pc-back-mark" aria-hidden="true" />
      </span>
    )
  }

  const label = `${card.rank === 'T' ? '10' : card.rank} of ${
    { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' }[card.suit]
  }`

  return (
    <span
      className={`pc pc-${size} ${className}`}
      style={{ ['--pc-ink' as string]: SUIT_COLOR[card.suit] }}
      title={title ?? label}
      aria-label={label}
    >
      <span className="pc-rank" aria-hidden="true">{card.rank}</span>
      <span className="pc-suit" aria-hidden="true">{SUIT_GLYPH[card.suit]}</span>
    </span>
  )
}

export function CardRow({
  cards, size = 'md', className = '',
}: { cards: (string | null)[]; size?: CardSize; className?: string }) {
  return (
    <span className={`card-row ${className}`}>
      {cards.map((c, i) => <PlayingCard key={`${c ?? 'x'}-${i}`} code={c} size={size} />)}
    </span>
  )
}
