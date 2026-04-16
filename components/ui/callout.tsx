import * as React from 'react'
import { cn } from '@/lib/utils'
import { Info, AlertTriangle, Lightbulb, BookOpen, AlertCircle } from 'lucide-react'

type CalloutVariant = 'info' | 'warning' | 'tip' | 'prerequisite' | 'danger'

interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CalloutVariant
  title?: string
}

const variantConfig: Record<
  CalloutVariant,
  { icon: React.ElementType; classes: string; iconClass: string; defaultTitle: string }
> = {
  info: {
    icon: Info,
    classes: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    defaultTitle: 'Note',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    defaultTitle: 'Warning',
  },
  tip: {
    icon: Lightbulb,
    classes: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    iconClass: 'text-green-600 dark:text-green-400',
    defaultTitle: 'Pro Tip',
  },
  prerequisite: {
    icon: BookOpen,
    classes: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
    iconClass: 'text-purple-600 dark:text-purple-400',
    defaultTitle: 'Prerequisite Knowledge',
  },
  danger: {
    icon: AlertCircle,
    classes: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    defaultTitle: 'Important',
  },
}

export function Callout({ variant = 'info', title, children, className, ...props }: CalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayTitle = title ?? config.defaultTitle

  return (
    <div
      className={cn('flex gap-3 rounded-lg border p-4 my-6', config.classes, className)}
      {...props}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClass)} aria-hidden />
      <div className="flex-1 min-w-0">
        {displayTitle && (
          <p className="font-semibold text-sm mb-1 text-neutral-900 dark:text-neutral-100">
            {displayTitle}
          </p>
        )}
        <div className="text-sm text-neutral-700 dark:text-neutral-300 [&>p]:mb-0">{children}</div>
      </div>
    </div>
  )
}
