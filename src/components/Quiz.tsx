import { useState } from 'react'
import type { QuizQuestion } from '../data/types'
import { CardRow } from './PlayingCard'
import { useStore } from '../lib/store'

export function Quiz({ questions, gameSlug, gameName }: { questions: QuizQuestion[]; gameSlug: string; gameName: string }) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)
  const addQuizResult = useStore((s) => s.addQuizResult)

  const q = questions[idx]
  const chosen = picked[q.id]
  const correct = chosen === q.answer
  const answered = chosen != null

  const score = questions.filter((qq) => picked[qq.id] === qq.answer).length

  function choose(optId: string) {
    if (picked[q.id]) return
    setPicked((p) => ({ ...p, [q.id]: optId }))
  }

  function next() {
    if (idx < questions.length - 1) { setIdx(idx + 1); return }
    const weak = questions.filter((qq) => picked[qq.id] !== qq.answer).map((qq) => qq.topic)
    addQuizResult({ gameSlug, gameName, score, total: questions.length, weakTopics: weak, at: Date.now() })
    setDone(true)
  }

  function restart() {
    setPicked({}); setIdx(0); setDone(false)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const weak = questions.filter((qq) => picked[qq.id] !== qq.answer)
    return (
      <div className="quiz panel">
        <div className="quiz-result">
          <div className="quiz-score num">{score}<span className="quiz-score-of">/{questions.length}</span></div>
          <div>
            <h3>{pct >= 80 ? 'Strong.' : pct >= 50 ? 'Solid start.' : 'Worth another pass.'}</h3>
            <p className="muted">
              {pct >= 80
                ? 'You have the core concepts. The next step is applying them under pressure in the Bluff Lab.'
                : pct >= 50
                  ? 'The fundamentals are there. Re-read the sections covering the spots you missed.'
                  : 'Nothing wrong with this — these are genuinely difficult spots. Work through the strategy sections above and come back.'}
            </p>
          </div>
        </div>

        {weak.length > 0 && (
          <div className="quiz-weak">
            <h4>Topics to revisit</h4>
            <ul className="tag-list">
              {[...new Set(weak.map((w) => w.topic))].map((t) => <li key={t} className="badge badge-danger">{t}</li>)}
            </ul>
          </div>
        )}

        <div className="quiz-actions">
          <button className="btn btn-ghost btn-sm" onClick={restart}>Try again</button>
          <a className="btn btn-primary btn-sm" href="/trainers#study-plan">Build a study plan</a>
        </div>
        <p className="tiny faint">Results are stored in this browser only. Complete three quizzes to unlock a personalised 7-day plan.</p>
      </div>
    )
  }

  return (
    <div className="quiz panel">
      <div className="quiz-head">
        <span className="eyebrow">Spot {idx + 1} of {questions.length}</span>
        <div className="quiz-progress" aria-hidden="true">
          {questions.map((qq, i) => (
            <span key={qq.id} className={`quiz-pip${i === idx ? ' is-at' : ''}${picked[qq.id] ? (picked[qq.id] === qq.answer ? ' is-right' : ' is-wrong') : ''}`} />
          ))}
        </div>
      </div>

      <p className="quiz-spot muted small">{q.spot}</p>

      {(q.hero?.length || q.board?.length) && (
        <div className="quiz-cards">
          {q.hero?.length ? (
            <div className="quiz-card-group">
              <span className="tiny faint">Your hand</span>
              <CardRow cards={q.hero.map((c) => (c === '?' ? null : c))} size="sm" />
            </div>
          ) : null}
          {q.board?.length ? (
            <div className="quiz-card-group">
              <span className="tiny faint">Board</span>
              <CardRow cards={q.board} size="sm" />
            </div>
          ) : null}
          <div className="quiz-card-group quiz-card-nums">
            {q.pot && <span className="badge badge-brass">Pot {q.pot}</span>}
            {q.stacks && <span className="badge">{q.stacks}</span>}
          </div>
        </div>
      )}

      <h4 className="quiz-question">{q.question}</h4>

      <ul className="quiz-options">
        {q.options.map((o) => {
          const isPicked = chosen === o.id
          const isAnswer = o.id === q.answer
          const state = !answered ? '' : isAnswer ? ' is-correct' : isPicked ? ' is-wrong' : ' is-dim'
          return (
            <li key={o.id}>
              <button className={`quiz-option${state}`} onClick={() => choose(o.id)} disabled={answered}>
                <span className="quiz-option-key">{o.id.toUpperCase()}</span>
                <span>{o.label}</span>
              </button>
              {answered && (isPicked || isAnswer) && (
                <p className={`quiz-explain${isAnswer ? ' is-correct' : ''}`}>{q.explain[o.id]}</p>
              )}
            </li>
          )
        })}
      </ul>

      {answered && (
        <div className="quiz-foot">
          <span className={`badge ${correct ? 'badge-brass' : 'badge-danger'}`}>
            {correct ? 'Correct' : 'Not this time'}
          </span>
          <button className="btn btn-primary btn-sm" onClick={next}>
            {idx < questions.length - 1 ? 'Next spot →' : 'See results'}
          </button>
        </div>
      )}
    </div>
  )
}
