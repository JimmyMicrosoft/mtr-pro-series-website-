// Client-side quiz progress stored in localStorage.
// Call only from 'use client' components.

export interface QuizResult {
  score: number
  passed: boolean   // score >= passingScore (8)
  attempts: number
  lastAttempt: string  // ISO date string
}

const KEY = (trackSlug: string) => `mtr-quiz-${trackSlug}`

export function getQuizResult(trackSlug: string): QuizResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY(trackSlug))
    return raw ? (JSON.parse(raw) as QuizResult) : null
  } catch {
    return null
  }
}

export function saveQuizResult(trackSlug: string, score: number, passingScore = 8): QuizResult {
  const existing = getQuizResult(trackSlug)
  const result: QuizResult = {
    score,
    passed: score >= passingScore,
    attempts: (existing?.attempts ?? 0) + 1,
    lastAttempt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY(trackSlug), JSON.stringify(result))
  }
  return result
}

export function getAllQuizResults(): Record<string, QuizResult> {
  if (typeof window === 'undefined') return {}
  const results: Record<string, QuizResult> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith('mtr-quiz-')) continue
    try {
      const trackSlug = key.replace('mtr-quiz-', '')
      const raw = localStorage.getItem(key)
      if (raw) results[trackSlug] = JSON.parse(raw) as QuizResult
    } catch { /* skip */ }
  }
  return results
}
