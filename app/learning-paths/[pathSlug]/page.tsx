import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock, BookOpen, Award, ChevronRight } from 'lucide-react'
import pathsData from '@/data/learning-paths.json'

const PATHS = Object.fromEntries(pathsData.map((p) => [p.slug, p]))

export async function generateStaticParams() {
  return pathsData.map((p) => ({ pathSlug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { pathSlug: string }
}): Promise<Metadata> {
  const path = PATHS[params.pathSlug]
  if (!path) return { title: 'Not Found' }
  return {
    title: path.pageTitle,
    description: path.subtitle,
  }
}

export default function LearningPathPage({
  params,
}: {
  params: { pathSlug: string }
}) {
  const path = PATHS[params.pathSlug]
  if (!path) notFound()

  const difficultyColor: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  }

  return (
    <div className="container-content py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${difficultyColor[path.difficulty] ?? ''}`}>
            {path.difficulty}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
            {path.persona}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {path.pageTitle}
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-4">
          {path.subtitle}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {path.totalHours}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> {path.steps.length} tracks
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="h-4 w-4" /> Certificate on completion
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Steps */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              About this path
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">{path.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Your learning journey
            </h2>
            <ol className="space-y-4">
              {path.steps.map((step, i) => (
                <li key={step.trackSlug} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 pb-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {step.trackTitle}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                          {step.programTitle} · {step.modules} modules · ~{step.hours} hrs
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {step.description}
                        </p>
                        {step.focus && (
                          <p className="mt-1 text-xs text-primary-600 dark:text-primary-400 font-medium">
                            {step.focus}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/programs/${step.programSlug}/tracks/${step.trackSlug}`}
                        className="flex-shrink-0 text-primary-500 hover:text-primary-600"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Start CTA */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Ready to start?
            </h3>
            <Button asChild className="w-full mb-3">
              <Link href={`/programs/${path.steps[0].programSlug}/tracks/${path.steps[0].trackSlug}`}>
                Begin Track 1 <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button variant="secondary" asChild className="w-full">
              <Link href="/register">Create free account</Link>
            </Button>
          </div>

          {/* Outcomes */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              What you&apos;ll be able to do
            </h3>
            <ul className="space-y-2">
              {path.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="text-primary-500 mt-0.5 flex-shrink-0">✓</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
