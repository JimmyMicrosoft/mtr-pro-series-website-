'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number           // 0–100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  color?: 'primary' | 'success' | 'warning'
}

const heightClasses = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

const colorClasses = {
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
}

export function Progress({
  value,
  size = 'md',
  showLabel = false,
  label,
  color = 'primary',
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)} {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>}
          {showLabel && (
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 ml-auto">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden',
          heightClasses[size]
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
