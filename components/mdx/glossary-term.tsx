'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface GlossaryTermProps {
  term: string
  definition?: string
  slug?: string
  children?: React.ReactNode
}

export function GlossaryTerm({ term, definition, slug, children }: GlossaryTermProps) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const displayText = children ?? term

  return (
    <span className="relative inline-block">
      <span
        className={cn(
          'border-b border-dashed border-primary-400 cursor-help text-inherit',
          'hover:text-primary-600 dark:hover:text-primary-400 transition-colors'
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        aria-describedby={`tooltip-${term}`}
      >
        {displayText}
      </span>

      {showTooltip && definition && (
        <span
          id={`tooltip-${term}`}
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
            'w-64 px-3 py-2 rounded-lg text-xs leading-relaxed',
            'bg-neutral-900 text-neutral-100 dark:bg-neutral-700 dark:text-neutral-100',
            'shadow-lg pointer-events-none animate-fade-in'
          )}
        >
          <strong className="block text-white mb-1">{term}</strong>
          {definition}
          {slug && (
            <Link
              href={`/glossary/${slug}`}
              className="block mt-1 text-primary-300 hover:text-primary-200 pointer-events-auto"
              tabIndex={-1}
            >
              View full definition →
            </Link>
          )}
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-700" />
        </span>
      )}
    </span>
  )
}
