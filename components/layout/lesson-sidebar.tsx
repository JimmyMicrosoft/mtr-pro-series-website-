'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { ChevronDown, CheckCircle2, Circle, Lock } from 'lucide-react'
import type { Track, Module, Lesson } from '@/types/content'

interface SidebarModule extends Module {
  lessons: Lesson[]
}

interface LessonSidebarProps {
  track: Track
  modules: SidebarModule[]
  programSlug: string
  completedLessonIds?: string[]
  className?: string
}

export function LessonSidebar({
  track,
  modules,
  programSlug,
  completedLessonIds = [],
  className,
}: LessonSidebarProps) {
  const pathname = usePathname()
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(
    () => {
      // Auto-expand the module containing the current lesson
      const activeSet = new Set<string>()
      modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => {
          const url = `/programs/${programSlug}/tracks/${track.slug}/modules/${mod.slug}/lessons/${lesson.slug}`
          if (pathname === url) activeSet.add(mod.slug)
        })
      })
      return activeSet
    }
  )

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completedCount = completedLessonIds.length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  function toggleModule(slug: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  return (
    <aside
      className={cn(
        'flex flex-col gap-0 overflow-y-auto',
        'border-r border-neutral-200 dark:border-neutral-700',
        'bg-neutral-50 dark:bg-neutral-900',
        className
      )}
    >
      {/* Track header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-medium mb-1">
          Track
        </p>
        <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
          {track.title}
        </h2>
        <div className="mt-3">
          <Progress value={progressPct} size="sm" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {completedCount} / {totalLessons} lessons complete
          </p>
        </div>
      </div>

      {/* Module list */}
      <nav className="flex-1 py-2">
        {modules.map((mod, modIndex) => {
          const isExpanded = expandedModules.has(mod.slug)
          const modCompleted = mod.lessons.filter((l) =>
            completedLessonIds.includes(l.id)
          ).length

          return (
            <div key={mod.slug}>
              <button
                onClick={() => toggleModule(mod.slug)}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2.5 text-left',
                  'text-sm font-medium transition-colors',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  isExpanded
                    ? 'text-neutral-900 dark:text-neutral-100'
                    : 'text-neutral-600 dark:text-neutral-400'
                )}
              >
                <span className="flex-1 text-xs font-semibold uppercase tracking-wide truncate">
                  {modIndex + 1}. {mod.title}
                </span>
                <span className="text-xs text-neutral-400 flex-shrink-0">
                  {modCompleted}/{mod.lessons.length}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 flex-shrink-0 text-neutral-400 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {isExpanded && (
                <ul className="pb-1">
                  {mod.lessons.map((lesson) => {
                    const lessonUrl = `/programs/${programSlug}/tracks/${track.slug}/modules/${mod.slug}/lessons/${lesson.slug}`
                    const isActive = pathname === lessonUrl
                    const isComplete = completedLessonIds.includes(lesson.id)

                    return (
                      <li key={lesson.slug}>
                        <Link
                          href={lessonUrl}
                          className={cn(
                            'flex items-center gap-2.5 px-4 py-2 pl-7 text-sm transition-colors',
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-medium border-r-2 border-primary-500'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200'
                          )}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0 text-neutral-300 dark:text-neutral-600" />
                          )}
                          <span className="flex-1 leading-snug">{lesson.title}</span>
                          <span className="text-xs text-neutral-400 flex-shrink-0">
                            {lesson.estimatedMinutes}m
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
