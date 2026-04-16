import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm',
  secondary:
    'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 focus-visible:ring-neutral-400 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700',
  ghost:
    'text-neutral-700 hover:bg-neutral-100 focus-visible:ring-neutral-400 dark:text-neutral-300 dark:hover:bg-neutral-800',
  destructive:
    'bg-error text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm rounded gap-1.5',
  md: 'h-10 px-4 text-sm rounded-md gap-2',
  lg: 'h-12 px-6 text-base rounded-lg gap-2',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
