import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const allItems = [{ label: 'Home', href: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          return (
            <li key={index} className="flex items-center gap-1">
              {index === 0 && <Home className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />}
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'max-w-[200px] truncate',
                    isLast && 'font-medium text-neutral-900 dark:text-neutral-100'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="max-w-[200px] truncate hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
