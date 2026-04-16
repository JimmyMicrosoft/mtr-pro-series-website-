import * as React from 'react'
import { cn } from '@/lib/utils'
import type { DifficultyLevel, PersonaLevel, BloomLevel, ContentType } from '@/types/content'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'difficulty' | 'persona' | 'bloom' | 'content-type' | 'completion'
  value?: DifficultyLevel | PersonaLevel | BloomLevel | ContentType | string
}

const difficultyColors: Record<DifficultyLevel, string> = {
  beginner:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  advanced:     'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  expert:       'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const personaColors: Record<PersonaLevel, string> = {
  newcomer:     'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  practitioner: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  specialist:   'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  expert:       'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

const contentTypeColors: Record<ContentType, string> = {
  video:      'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  lab:        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  reading:    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  assessment: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  mixed:      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

function getColorClass(variant: string, value?: string): string {
  if (!value) return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
  if (variant === 'difficulty' && value in difficultyColors)
    return difficultyColors[value as DifficultyLevel]
  if (variant === 'persona' && value in personaColors)
    return personaColors[value as PersonaLevel]
  if (variant === 'content-type' && value in contentTypeColors)
    return contentTypeColors[value as ContentType]
  return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
}

export function Badge({ className, variant = 'default', value, children, ...props }: BadgeProps) {
  const colorClass = getColorClass(variant, value)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        colorClass,
        className
      )}
      {...props}
    >
      {children ?? value}
    </span>
  )
}
