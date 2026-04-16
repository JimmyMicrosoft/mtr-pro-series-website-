import { notFound } from 'next/navigation'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { TrackQuiz } from '@/components/quiz/track-quiz'
import { getProgram, getAllTracks } from '@/lib/content'
import { ClipboardList } from 'lucide-react'

interface Props { params: { programSlug: string; trackSlug: string } }

function getQuizData(programSlug: string, trackSlug: string) {
  try {
    const filePath = join(process.cwd(), 'content', 'programs', programSlug, 'tracks', trackSlug, 'quiz.json')
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = getQuizData(params.programSlug, params.trackSlug)
  if (!quiz) return { title: 'Quiz Not Found' }
  return {
    title: `${quiz.trackTitle} — Track Quiz`,
    robots: { index: false },
  }
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

export default function TrackQuizPage({ params }: Props) {
  const program = getProgram(params.programSlug)
  if (!program) notFound()

  const quiz = getQuizData(params.programSlug, params.trackSlug)
  if (!quiz) notFound()

  // Find the next track for the "Continue" button
  const tracks = getAllTracks(params.programSlug)
  const currentIdx = tracks.findIndex((t) => t.slug === params.trackSlug)
  const nextTrack = tracks[currentIdx + 1]
  const nextTrackHref = nextTrack
    ? `/programs/${params.programSlug}/tracks/${nextTrack.slug}`
    : `/programs/${params.programSlug}`

  return (
    <div className="container-content py-8">
      <Breadcrumb
        items={[
          { label: 'Programs', href: '/programs' },
          { label: program.title, href: `/programs/${params.programSlug}` },
          { label: quiz.trackTitle, href: `/programs/${params.programSlug}/tracks/${params.trackSlug}` },
          { label: 'Track Quiz' },
        ]}
        className="mb-6"
      />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white flex-shrink-0">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {quiz.trackTitle} — Track Quiz
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {quiz.questions.length} questions · Pass mark: {quiz.passingScore}/{quiz.questions.length}
            </p>
          </div>
        </div>
      </div>

      <TrackQuiz
        trackSlug={params.trackSlug}
        trackTitle={quiz.trackTitle}
        programSlug={params.programSlug}
        passingScore={quiz.passingScore}
        questions={quiz.questions}
        nextTrackHref={nextTrackHref}
      />
    </div>
  )
}
