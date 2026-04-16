import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Progress } from './progress'
import { Clock, BookOpen, Award, ChevronRight } from 'lucide-react'
import type { Program, Track, Module, Lesson } from '@/types/content'

// ─── Base Card ────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 dark:border-neutral-700',
        'bg-white dark:bg-neutral-800',
        hover && 'transition-shadow hover:shadow-md cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ─── Program Card ─────────────────────────────────────────────────────────────

interface ProgramCardProps {
  program: Program
  progress?: number
}

const programColors = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-teal-500 to-teal-700',
  'from-orange-500 to-orange-700',
]

export function ProgramCard({ program, progress }: ProgramCardProps) {
  const colorIndex = (program.order ?? 1) - 1
  const gradient = programColors[colorIndex % programColors.length]

  return (
    <Link href={`/programs/${program.slug}`} className="block group">
      <Card hover className="overflow-hidden">
        <div className={cn('h-2 bg-gradient-to-r', gradient)} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium uppercase tracking-wide">
                Program {program.order}
              </p>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                {program.title}
              </h3>
            </div>
            <Badge variant="difficulty" value={program.level} className="flex-shrink-0" />
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
            {program.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {program.trackCount} tracks
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {program.estimatedHoursMin}–{program.estimatedHoursMax} hrs
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {program.credential}
            </span>
          </div>

          {progress !== undefined && (
            <Progress value={progress} size="sm" showLabel label="Progress" />
          )}
        </div>
      </Card>
    </Link>
  )
}

// ─── Track Card ───────────────────────────────────────────────────────────────

interface TrackCardProps {
  track: Track
  programSlug: string
  progress?: number
  locked?: boolean
}

export function TrackCard({ track, programSlug, progress, locked = false }: TrackCardProps) {
  const content = (
    <Card hover={!locked} className={cn(locked && 'opacity-60')}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
            {track.title}
          </h3>
          <Badge variant="difficulty" value={track.level} className="flex-shrink-0" />
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
          {track.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span>{track.lessonCount} lessons</span>
          <span>·</span>
          <span>{track.estimatedHoursMin}–{track.estimatedHoursMax} hrs</span>
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} size="sm" />
          </div>
        )}
      </div>
    </Card>
  )

  if (locked) return content
  return (
    <Link href={`/programs/${programSlug}/tracks/${track.slug}`} className="block group">
      {content}
    </Link>
  )
}

// ─── Lesson Card ──────────────────────────────────────────────────────────────

interface LessonCardProps {
  lesson: Lesson
  programSlug: string
  trackSlug: string
  moduleSlug: string
  completed?: boolean
}

export function LessonCard({
  lesson,
  programSlug,
  trackSlug,
  moduleSlug,
  completed = false,
}: LessonCardProps) {
  return (
    <Link
      href={`/programs/${programSlug}/tracks/${trackSlug}/modules/${moduleSlug}/lessons/${lesson.slug}`}
      className="block group"
    >
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-colors',
          'border-neutral-200 dark:border-neutral-700',
          'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
          completed && 'border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20'
        )}
      >
        <div
          className={cn(
            'w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs',
            completed
              ? 'bg-green-500 text-white'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
          )}
        >
          {completed ? '✓' : ''}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate group-hover:text-primary-500 transition-colors">
            {lesson.title}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {lesson.estimatedMinutes} min · {lesson.contentType}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-400 flex-shrink-0 group-hover:text-primary-500 transition-colors" />
      </div>
    </Link>
  )
}
