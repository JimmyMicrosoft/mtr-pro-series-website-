import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProgram, getTrack, getModule, getAllLessons } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { LessonCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { formatDuration, slugToTitle } from '@/lib/utils'

interface Props {
  params: { programSlug: string; trackSlug: string; moduleSlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mod = getModule(params.programSlug, params.trackSlug, params.moduleSlug)
  if (!mod) return { title: 'Module Not Found' }
  return { title: mod.title, description: mod.description }
}

export default function ModulePage({ params }: Props) {
  const program = getProgram(params.programSlug)
  const track = getTrack(params.programSlug, params.trackSlug)
  const mod = getModule(params.programSlug, params.trackSlug, params.moduleSlug)
  if (!program) notFound()

  const lessons = getAllLessons(params.programSlug, params.trackSlug, params.moduleSlug)
  const modTitle = mod?.title ?? slugToTitle(params.moduleSlug)
  const modDescription = mod?.description ?? 'This module is currently being developed. Check back soon.'
  const trackTitle = track?.title ?? slugToTitle(params.trackSlug)

  return (
    <div className="container-content py-8">
      <Breadcrumb
        items={[
          { label: 'Programs', href: '/programs' },
          { label: program.title, href: `/programs/${params.programSlug}` },
          { label: trackTitle, href: `/programs/${params.programSlug}/tracks/${params.trackSlug}` },
          { label: modTitle },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        {mod && <Badge variant="difficulty" value={mod.level} className="mb-3" />}
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          {modTitle}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">{modDescription}</p>
        {mod && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Clock className="h-4 w-4" />
            <span>{lessons.length} lessons · {formatDuration(mod.estimatedMinutes)}</span>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Lessons</h2>
      {lessons.length > 0 ? (
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.slug}
              lesson={lesson}
              programSlug={params.programSlug}
              trackSlug={params.trackSlug}
              moduleSlug={params.moduleSlug}
            />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">Content coming soon.</p>
      )}
    </div>
  )
}
