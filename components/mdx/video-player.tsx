'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Play } from 'lucide-react'

interface VideoPlayerProps {
  videoId: string
  platform?: 'youtube' | 'vimeo'
  title?: string
  onComplete?: () => void
  className?: string
}

export function VideoPlayer({
  videoId,
  platform = 'youtube',
  title,
  onComplete,
  className,
}: VideoPlayerProps) {
  const [watched, setWatched] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)

  const embedUrl =
    platform === 'youtube'
      ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`

  function handleMarkWatched() {
    setWatched(true)
    onComplete?.()
  }

  if (!videoId || videoId === 'PLACEHOLDER') {
    return (
      <div
        className={cn(
          'relative aspect-video rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center mb-6',
          className
        )}
      >
        <div className="text-center text-neutral-400">
          <Play className="h-12 w-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Video coming soon</p>
          {title && <p className="text-xs mt-1 opacity-60">{title}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
          {title}
        </h2>
      )}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 animate-pulse">
            <Play className="h-12 w-12 text-neutral-600" />
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title ?? 'Lesson video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoaded(true)}
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Watch the full video before marking complete.
        </p>
        <Button
          variant={watched ? 'ghost' : 'secondary'}
          size="sm"
          onClick={handleMarkWatched}
          className={cn(watched && 'text-green-600 dark:text-green-400')}
        >
          {watched ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
              Watched
            </>
          ) : (
            'Mark as Watched'
          )}
        </Button>
      </div>
    </div>
  )
}
