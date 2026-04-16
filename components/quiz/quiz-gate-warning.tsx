'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getQuizResult } from '@/lib/quiz-progress'

interface Props {
  previousTrackSlug: string
  previousTrackTitle: string
  previousTrackHref: string
  quizHref: string
}

export function QuizGateWarning({ previousTrackSlug, previousTrackTitle, previousTrackHref, quizHref }: Props) {
  const [result, setResult] = React.useState<{ score: number; passed: boolean } | null | undefined>(undefined)

  React.useEffect(() => {
    setResult(getQuizResult(previousTrackSlug))
  }, [previousTrackSlug])

  // Still loading from localStorage
  if (result === undefined) return null

  // Quiz passed — show a subtle success note
  if (result?.passed) {
    return (
      <div className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 text-sm text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        <span>
          You passed the <Link href={quizHref} className="font-medium underline underline-offset-2">{previousTrackTitle} quiz</Link> ({result.score}/10).
        </span>
      </div>
    )
  }

  // Quiz attempted but not passed
  if (result && !result.passed) {
    return (
      <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          You scored {result.score}/10 on the{' '}
          <Link href={`${previousTrackHref}`} className="font-medium underline underline-offset-2">{previousTrackTitle}</Link>{' '}
          track quiz. We recommend{' '}
          <Link href={quizHref} className="font-medium underline underline-offset-2">retaking the quiz</Link>{' '}
          before continuing — you can still proceed if you prefer.
        </p>
      </div>
    )
  }

  // Quiz not yet attempted
  return (
    <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-700 dark:text-amber-400">
        We recommend completing the{' '}
        <Link href={quizHref} className="font-medium underline underline-offset-2">{previousTrackTitle} track quiz</Link>{' '}
        before starting this track. You can still proceed if you prefer.
      </p>
    </div>
  )
}
