import { Link } from 'react-router-dom'
import type { Game } from '../data/types'
import { FAMILY_META, DIFFICULTY_LABEL } from '../data/games'
import { Meter } from './ui'

export function GameCard({ game }: { game: Game }) {
  return (
    <Link to={`/games/${game.slug}`} className="game-card">
      <div className="game-card-top">
        <span className="game-card-family">{FAMILY_META[game.family].short}</span>
        <span className="game-card-structs">
          {game.structures.map((s) => <span key={s} className="game-card-struct">{s}</span>)}
        </span>
      </div>

      <h3 className="game-card-name">{game.name}</h3>
      <p className="game-card-tag">{game.tagline}</p>

      <div className="game-card-meta">
        <div className="game-card-metric">
          <span className="tiny faint">Difficulty</span>
          <Meter value={game.difficulty} label="Difficulty" />
          <span className="tiny muted">{DIFFICULTY_LABEL[game.difficulty]}</span>
        </div>
        <div className="game-card-metric">
          <span className="tiny faint">Bluff potential</span>
          {game.bluffRating === 0 ? (
            <span className="badge badge-danger">None — banked</span>
          ) : (
            <Meter value={game.bluffRating} label="Bluff potential" tone="danger" />
          )}
        </div>
      </div>

      {game.depth === 'full' && <span className="game-card-flag">Full strategy guide</span>}
      {game.banked && <span className="game-card-flag is-banked">You play the house</span>}
    </Link>
  )
}
