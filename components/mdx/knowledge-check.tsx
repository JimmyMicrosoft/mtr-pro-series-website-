'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'

// ─── Sub-components (used in MDX authoring) ──────────────────────────────────
// These render nothing — KnowledgeCheck parses them from its children.

export function Question({ children }: { children?: React.ReactNode }) {
  return null
}
Question.displayName = 'KC_Question'

export function Answer({ children, correct }: { children?: React.ReactNode; correct?: boolean }) {
  return null
}
Answer.displayName = 'KC_Answer'

export function Explanation({ children }: { children?: React.ReactNode }) {
  return null
}
Explanation.displayName = 'KC_Explanation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedQuestion {
  question: React.ReactNode
  answers: { text: React.ReactNode; correct: boolean }[]
  explanation: React.ReactNode
}

// ─── Child parser ─────────────────────────────────────────────────────────────

function parseChildren(children: React.ReactNode): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []
  let current: ParsedQuestion | null = null

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const displayName = (child.type as { displayName?: string }).displayName

    if (displayName === 'KC_Question') {
      if (current) questions.push(current)
      current = {
        question: (child.props as { children?: React.ReactNode }).children,
        answers: [],
        explanation: null,
      }
    } else if (displayName === 'KC_Answer') {
      if (current) {
        const props = child.props as { children?: React.ReactNode; correct?: boolean }
        current.answers.push({
          text: props.children,
          correct: props.correct === true,
        })
      }
    } else if (displayName === 'KC_Explanation') {
      if (current) {
        current.explanation = (child.props as { children?: React.ReactNode }).children
      }
    }
  })

  if (current) questions.push(current)
  return questions
}

// ─── Main component ───────────────────────────────────────────────────────────

interface KnowledgeCheckProps {
  id?: string
  title?: string
  children?: React.ReactNode
}

export function KnowledgeCheck({ children, title = 'Knowledge Check' }: KnowledgeCheckProps) {
  const questions = parseChildren(children)

  const [currentQ, setCurrentQ] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [answers, setAnswers] = React.useState<(number | null)[]>(
    Array(questions.length).fill(null)
  )
  const [showResults, setShowResults] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  if (questions.length === 0) return null

  const q = questions[currentQ]
  const correctIndex = q.answers.findIndex((a) => a.correct)
  const isAnswered = selected !== null

  function handleSelect(index: number) {
    if (submitted) return
    setSelected(index)
  }

  function handleSubmit() {
    if (!isAnswered) return
    const newAnswers = [...answers]
    newAnswers[currentQ] = selected
    setAnswers(newAnswers)
    setSubmitted(true)
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelected(null)
      setSubmitted(false)
    } else {
      setShowResults(true)
    }
  }

  function handleReset() {
    setCurrentQ(0)
    setSelected(null)
    setAnswers(Array(questions.length).fill(null))
    setShowResults(false)
    setSubmitted(false)
  }

  const score = answers.filter((a, i) => {
    const ci = questions[i].answers.findIndex((ans) => ans.correct)
    return a === ci
  }).length

  if (showResults) {
    return (
      <div className="my-8 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="bg-neutral-50 dark:bg-neutral-800 px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title} — Results</h3>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div
              className={cn(
                'text-5xl font-bold mb-2',
                score === questions.length
                  ? 'text-green-500'
                  : score >= questions.length * 0.7
                  ? 'text-amber-500'
                  : 'text-red-500'
              )}
            >
              {score}/{questions.length}
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {score === questions.length
                ? 'Perfect score! Great work.'
                : score >= questions.length * 0.7
                ? 'Good job! Review the questions you missed.'
                : 'Keep studying — revisit the key concepts above.'}
            </p>
          </div>
          <div className="space-y-3 mb-6">
            {questions.map((question, i) => {
              const ci = question.answers.findIndex((a) => a.correct)
              const isCorrect = answers[i] === ci
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg',
                    isCorrect ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
                  )}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {question.question}
                    </p>
                    {!isCorrect && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        Correct: {question.answers[ci]?.text}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Retake
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="my-8 rounded-xl border border-primary-200 dark:border-primary-800/50 overflow-hidden">
      <div className="bg-primary-50 dark:bg-primary-950/30 px-6 py-4 border-b border-primary-200 dark:border-primary-800/50 flex items-center justify-between">
        <h3 className="font-semibold text-primary-900 dark:text-primary-100">{title}</h3>
        <span className="text-sm text-primary-600 dark:text-primary-400">
          {currentQ + 1} / {questions.length}
        </span>
      </div>
      <div className="p-6">
        <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">{q.question}</p>
        <div className="space-y-2 mb-6">
          {q.answers.map((answer, i) => {
            let style =
              'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            if (selected === i && !submitted)
              style = 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
            if (submitted && i === correctIndex)
              style = 'border-green-500 bg-green-50 dark:bg-green-950/20'
            if (submitted && selected === i && i !== correctIndex)
              style = 'border-red-500 bg-red-50 dark:bg-red-950/20'

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={submitted}
                className={cn(
                  'w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors text-sm',
                  style,
                  submitted && 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold',
                    selected === i && !submitted
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-neutral-300 dark:border-neutral-600'
                  )}
                >
                  {submitted && i === correctIndex ? '✓' : String.fromCharCode(65 + i)}
                </span>
                {answer.text}
              </button>
            )
          })}
        </div>

        {submitted && (
          <div
            className={cn(
              'mb-4 p-3 rounded-lg text-sm',
              selected === correctIndex
                ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'
            )}
          >
            <strong>{selected === correctIndex ? 'Correct!' : 'Not quite.'}</strong>{' '}
            {q.explanation}
          </div>
        )}

        <div className="flex gap-2">
          {!submitted ? (
            <Button size="sm" onClick={handleSubmit} disabled={!isAnswered}>
              Submit Answer
            </Button>
          ) : (
            <Button size="sm" onClick={handleNext}>
              {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
