import Link from 'next/link'
import { Clock, Target, Wrench, BookOpen, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/types/content'
import { formatDuration } from '@/lib/utils'

interface LessonMetaSidebarProps {
  lesson: Lesson
  className?: string
}

export function LessonMetaSidebar({ lesson, className }: LessonMetaSidebarProps) {
  return (
    <aside className={cn('space-y-6', className)}>
      {/* Meta */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{formatDuration(lesson.estimatedMinutes)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="difficulty" value={lesson.level} />
          <Badge
            className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {lesson.bloomLevel}
          </Badge>
          <Badge variant="content-type" value={lesson.contentType} />
        </div>
        {lesson.personaTags && lesson.personaTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {lesson.personaTags.map((tag) => (
              <Badge key={tag} variant="persona" value={tag} />
            ))}
          </div>
        )}
      </div>

      {/* Learning Objectives */}
      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            <Target className="h-4 w-4 text-primary-500" />
            Learning Objectives
          </div>
          <ul className="space-y-2">
            {lesson.learningObjectives.map((obj, i) => (
              <li key={i} className="flex gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="text-primary-500 font-bold flex-shrink-0">{i + 1}.</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tools */}
      {lesson.tools && lesson.tools.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            <Wrench className="h-4 w-4 text-primary-500" />
            Tools & Resources
          </div>
          <ul className="space-y-1.5">
            {lesson.tools.map((tool, i) => (
              <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex gap-2">
                <span className="text-neutral-400">•</span>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Topic Tags */}
      {lesson.topicTags && lesson.topicTags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            <BookOpen className="h-4 w-4 text-primary-500" />
            Topics
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lesson.topicTags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full px-2.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
