import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setMuted } from './sound'

export type Theme = 'dark' | 'light'
export type SkillLevel = 'new' | 'casual' | 'serious' | 'pro'

export interface QuizResult {
  gameSlug: string
  gameName: string
  score: number
  total: number
  /** Topic tags of the questions answered incorrectly — feeds the study plan. */
  weakTopics: string[]
  at: number
}

interface State {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void

  skill: SkillLevel
  setSkill: (s: SkillLevel) => void

  /** User override for the 3D scene. 'auto' respects device capability. */
  render3d: 'auto' | 'on' | 'off'
  setRender3d: (v: 'auto' | 'on' | 'off') => void

  /** Table sounds. Off by default — audio should always be opt-in. */
  sound: boolean
  toggleSound: () => void

  quizResults: QuizResult[]
  addQuizResult: (r: QuizResult) => void
  clearQuizResults: () => void
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),

      skill: 'casual',
      setSkill: (skill) => set({ skill }),

      render3d: 'auto',
      setRender3d: (render3d) => set({ render3d }),

      sound: false,
      toggleSound: () => {
        const next = !get().sound
        set({ sound: next })
        void setMuted(!next)
      },

      quizResults: [],
      addQuizResult: (r) => set({ quizResults: [...get().quizResults, r].slice(-40) }),
      clearQuizResults: () => set({ quizResults: [] }),
    }),
    { name: 'fold-equity' },
  ),
)

/** Weak topics across all quizzes, most-missed first. */
export function weakAreas(results: QuizResult[]): { topic: string; misses: number }[] {
  const counts = new Map<string, number>()
  for (const r of results) for (const t of r.weakTopics) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()]
    .map(([topic, misses]) => ({ topic, misses }))
    .sort((a, b) => b.misses - a.misses)
}
