'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { saveQuizResult } from '@/lib/quiz-progress'
import { CheckCircle2, XCircle, AlertTriangle, Trophy, RotateCcw, ChevronRight } from 'lucide-react'

export interface QuizQuestion {
  id: number
  text: string
  answers: string[]
  correct: number
  explanation: string
}

interface Props {
  trackSlug: string
  trackTitle: string
  programSlug: string
  passingScore?: number
  questions: QuizQuestion[]
  nextTrackHref?: string
}

type Phase = 'question' | 'feedback' | 'results'

export function TrackQuiz({
  trackSlug,
  trackTitle,
  programSlug,
  passingScore = 8,
  questions,
  nextTrackHref,
}: Props) {
  const router = useRouter()
  const [phase, setPhase] = React.useState<Phase>('question')
  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null)
  const [answers, setAnswers] = React.useState<Record<number, number>>({})
  const [result, setResult] = React.useState<{ score: number; passed: boolean } | null>(null)

  const question = questions[currentIdx]
  const isLastQuestion = currentIdx === questions.length - 1
  const isCorrect = selectedAnswer !== null && selectedAnswer === question?.correct

  function handleSubmit() {
    if (selectedAnswer === null) return
    setAnswers((prev) => ({ ...prev, [question.id]: selectedAnswer }))
    setPhase('feedback')
  }

  function handleNext() {
    if (isLastQuestion) {
      // Calculate final score from all recorded answers plus current
      const finalAnswers = { ...answers, [question.id]: selectedAnswer! }
      const score = questions.filter((q) => finalAnswers[q.id] === q.correct).length
      const saved = saveQuizResult(trackSlug, score, passingScore)
      setResult({ score, passed: saved.passed })
      setPhase('results')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setCurrentIdx((i) => i + 1)
      setSelectedAnswer(null)
      setPhase('question')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleRetake() {
    setCurrentIdx(0)
    setSelectedAnswer(null)
    setAnswers({})
    setResult(null)
    setPhase('question')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (phase === 'results' && result) {
    const passed = result.passed
    // Reconstruct final answers (last question was saved in handleNext)
    const finalAnswers = answers
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        {/* Score card */}
        <div className={cn(
          'rounded-2xl border-2 p-8 text-center',
          passed
            ? 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20'
            : 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20'
        )}>
          {passed ? (
            <Trophy className="h-12 w-12 text-green-500 mx-auto mb-3" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          )}
          <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {result.score} / {questions.length}
          </p>
          <p className={cn(
            'text-lg font-semibold mb-3',
            passed ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'
          )}>
            {passed ? 'Track Quiz Passed!' : 'Below Passing Score'}
          </p>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-md mx-auto">
            {passed
              ? `You scored ${result.score}/${questions.length} — you're ready for the next track.`
              : `You scored ${result.score}/${questions.length}. We recommend reviewing the ${trackTitle} lessons before moving on. You can still continue if you'd like.`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {nextTrackHref && (
            <Button
              variant={passed ? 'default' : 'secondary'}
              onClick={() => router.push(nextTrackHref)}
            >
              {passed ? 'Continue to Next Track' : 'Continue Anyway'}
            </Button>
          )}
          <Button variant="ghost" onClick={handleRetake}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Retake Quiz
          </Button>
          <Button variant="ghost" onClick={() => router.push(`/programs/${programSlug}`)}>
            Back to Program
          </Button>
        </div>

        {/* Answer review */}
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Review Answers
          </h2>
          <div className="space-y-4">
            {questions.map((q) => {
              const userAnswer = finalAnswers[q.id]
              const correct = userAnswer === q.correct
              return (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-xl border p-4',
                    correct
                      ? 'border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/10'
                      : 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/10'
                  )}
                >
                  <div className="flex gap-3">
                    {correct
                      ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm mb-2">
                        {q.id}. {q.text}
                      </p>
                      {!correct && (
                        <p className="text-sm text-red-700 dark:text-red-400 mb-1">
                          Your answer: {q.answers[userAnswer] ?? '(not answered)'}
                        </p>
                      )}
                      <p className={cn('text-sm', correct ? 'text-green-700 dark:text-green-400' : 'text-neutral-700 dark:text-neutral-300')}>
                        Correct: {q.answers[q.correct]}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 italic">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Question / Feedback screen ──────────────────────────────────────────────
  if (!question) return null

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress counter */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Question {currentIdx + 1} of {questions.length}
        </span>
        <span className="text-sm text-neutral-400 dark:text-neutral-500">
          Pass mark: {passingScore}/{questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-8">
        <div
          className="h-1.5 bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
        {question.text}
      </p>

      {/* Answer choices */}
      <div className="space-y-3 mb-8">
        {question.answers.map((answer, idx) => {
          let style = 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-700'

          if (phase === 'feedback') {
            if (idx === question.correct) {
              style = 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 font-medium'
            } else if (idx === selectedAnswer && selectedAnswer !== question.correct) {
              style = 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200'
            } else {
              style = 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 opacity-60'
            }
          } else if (selectedAnswer === idx) {
            style = 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 font-medium'
          }

          return (
            <button
              key={idx}
              disabled={phase === 'feedback'}
              onClick={() => setSelectedAnswer(idx)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                style,
                phase === 'feedback' && 'cursor-default'
              )}
            >
              <span className="text-neutral-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
              {answer}
            </button>
          )
        })}
      </div>

      {/* Feedback banner */}
      {phase === 'feedback' && (
        <div className={cn(
          'rounded-xl border p-4 mb-6 flex gap-3',
          isCorrect
            ? 'border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20'
            : 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20'
        )}>
          {isCorrect
            ? <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
          <div>
            <p className={cn(
              'font-semibold text-sm mb-1',
              isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            )}>
              {isCorrect ? 'Correct!' : `Incorrect — the right answer is: ${question.answers[question.correct]}`}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {question.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Action button */}
      {phase === 'question' ? (
        <Button onClick={handleSubmit} disabled={selectedAnswer === null} size="lg">
          Submit Answer
        </Button>
      ) : (
        <Button onClick={handleNext} size="lg">
          {isLastQuestion ? 'See Results' : 'Next Question'}
          <ChevronRight className="h-4 w-4 ml-1.5" />
        </Button>
      )}
    </div>
  )
}
