import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DashboardQuizProgress } from '@/components/quiz/dashboard-quiz-progress'
import { Award, BookOpen, Clock, ArrowRight, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your MTR Pro Series learning dashboard.',
}

// Static placeholder — replace with real Supabase data via server component
const mockProgress = [
  { programTitle: 'MTR Foundations', programSlug: 'mtr-foundations', progress: 23, lastLesson: 'MTR Windows vs. MTR Android', lastLessonHref: '/programs/mtr-foundations/tracks/mtr-ecosystem/modules/introduction-to-teams-rooms/lessons/mtr-windows-vs-android' },
]

const mockBadges: { title: string; earned: boolean }[] = [
  { title: 'MTR Foundations Badge', earned: false },
  { title: 'MTR Systems Integration Badge', earned: false },
]

export default function DashboardPage() {
  return (
    <div className="container-content py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
          Welcome back
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Continue where you left off.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — in progress + continue */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              In Progress
            </h2>
            {mockProgress.length > 0 ? (
              <div className="space-y-3">
                {mockProgress.map((p) => (
                  <div
                    key={p.programSlug}
                    className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {p.programTitle}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Last: {p.lastLesson}
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={p.lastLessonHref}>
                          Resume <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                    <Progress value={p.progress} size="sm" showLabel />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 p-8 text-center">
                <BookOpen className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  You haven&apos;t started any programs yet.
                </p>
                <Button asChild>
                  <Link href="/programs">Browse Programs</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Recommended */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Recommended Next
            </h2>
            <Link
              href="/programs/mtr-foundations/tracks/mtr-ecosystem/modules/introduction-to-teams-rooms/lessons/what-is-mtr"
              className="group flex items-center gap-4 p-4 rounded-xl border border-primary-200 dark:border-primary-800/50 bg-primary-50 dark:bg-primary-950/20 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white flex-shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                  Lesson 1.1.1: What is MTR?
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  MTR Foundations · Track 1 · 30 min
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* Right column — quiz progress + badges */}
        <div className="space-y-6">
          {/* Track Quizzes */}
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <DashboardQuizProgress />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Badges
            </h2>
            <div className="space-y-2">
              {mockBadges.map((b) => (
                <div
                  key={b.title}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    b.earned
                      ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20'
                      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 opacity-50'
                  }`}
                >
                  <Award className={`h-5 w-5 flex-shrink-0 ${b.earned ? 'text-amber-500' : 'text-neutral-400'}`} />
                  <span className={`text-sm font-medium ${b.earned ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500'}`}>
                    {b.title}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/certifications"
              className="mt-3 text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
            >
              View all certifications <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
