import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProgram, getTrack, getAllModules, getAllTracks } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { QuizGateWarning } from '@/components/quiz/quiz-gate-warning'
import { Clock, BookOpen, ChevronRight } from 'lucide-react'
import { cn, slugToTitle } from '@/lib/utils'

interface Props { params: { programSlug: string; trackSlug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const track = getTrack(params.programSlug, params.trackSlug)
  if (!track) return { title: 'Track Not Found' }
  return { title: track.title, description: track.description }
}

export async function generateStaticParams() {
  const params: { programSlug: string; trackSlug: string }[] = []
  const { getAllPrograms } = await import('@/lib/content')
  for (const p of getAllPrograms()) {
    for (const t of getAllTracks(p.slug)) {
      params.push({ programSlug: p.slug, trackSlug: t.slug })
    }
  }
  return params
}

export default function TrackPage({ params }: Props) {
  const program = getProgram(params.programSlug)
  const track = getTrack(params.programSlug, params.trackSlug)
  if (!program) notFound()

  const modules = getAllModules(params.programSlug, params.trackSlug)
  const allTracks = getAllTracks(params.programSlug)
  const currentIdx = allTracks.findIndex((t) => t.slug === params.trackSlug)
  const previousTrack = currentIdx > 0 ? allTracks[currentIdx - 1] : null

  const trackTitle = track?.title ?? slugToTitle(params.trackSlug)
  const trackDescription = track?.description ?? 'This track is currently being developed. Check back soon.'

  return (
    <div className="container-content py-8">
      <Breadcrumb
        items={[
          { label: 'Programs', href: '/programs' },
          { label: program.title, href: `/programs/${params.programSlug}` },
          { label: trackTitle },
        ]}
        className="mb-6"
      />

      {/* Soft gate warning from previous track quiz */}
      {previousTrack && (
        <QuizGateWarning
          previousTrackSlug={previousTrack.slug}
          previousTrackTitle={previousTrack.title ?? slugToTitle(previousTrack.slug)}
          previousTrackHref={`/programs/${params.programSlug}/tracks/${previousTrack.slug}`}
          quizHref={`/programs/${params.programSlug}/tracks/${previousTrack.slug}/quiz`}
        />
      )}

      {/* Track header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {track && <Badge variant="difficulty" value={track.level} />}
          {track?.persona?.map((p) => <Badge key={p} variant="persona" value={p} />)}
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          {trackTitle}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4 max-w-2xl">
          {trackDescription}
        </p>
        {track && (
          <div className="flex flex-wrap gap-5 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {track.moduleCount} modules · {track.lessonCount} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {track.estimatedHoursMin}–{track.estimatedHoursMax} hours
            </span>
          </div>
        )}
      </div>

      {/* Module list */}
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">Modules</h2>
      {modules.length > 0 ? (
        <div className="space-y-3">
          {modules.map((mod, i) => (
            <Link
              key={mod.slug}
              href={`/programs/${params.programSlug}/tracks/${params.trackSlug}/modules/${mod.slug}`}
              className="group flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-bold text-sm flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                  {mod.description}
                </p>
              </div>
              <div className="text-xs text-neutral-400 flex-shrink-0 text-right">
                <div>{mod.lessonCount} lessons</div>
                <div>{mod.estimatedMinutes} min</div>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">Content coming soon.</p>
      )}

    </div>
  )
}
