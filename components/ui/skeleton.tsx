import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700',
        className
      )}
      {...props}
    />
  )
}

export function LessonPageSkeleton() {
  return (
    <div className="flex gap-6 p-6">
      <div className="w-72 flex-shrink-0 space-y-3">
        <Skeleton className="h-6 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="flex-1 space-y-4">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}
