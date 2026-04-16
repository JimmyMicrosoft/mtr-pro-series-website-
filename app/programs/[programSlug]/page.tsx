import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProgram, getAllTracks, getAllPrograms } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { TrackCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, BookOpen, Award, ChevronRight } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface Props { params: { programSlug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const program = getProgram(params.programSlug)
  if (!program) return { title: 'Program Not Found' }
  return {
    title: program.title,
    description: program.description,
  }
}

export async function generateStaticParams() {
  return getAllPrograms().map((p) => ({ programSlug: p.slug }))
}

export default function ProgramPage({ params }: Props) {
  const program = getProgram(params.programSlug)
  if (!program) notFound()

  const tracks = getAllTracks(params.programSlug)
  const totalMinutes = program.estimatedHoursMin * 60

  return (
    <div className="container-content py-8">
      <Breadcrumb
        items={[{ label: 'Programs', href: '/programs' }, { label: program.title }]}
        className="mb-6"
      />

      {/* Program header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-white/20 text-white border-white/30">Program {program.order}</Badge>
          <Badge variant="difficulty" value={program.level} className="border-0" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-3">{program.title}</h1>
        <p className="text-primary-100 text-lg mb-6 max-w-2xl">{program.description}</p>
        <div className="flex flex-wrap gap-6 text-sm text-primary-100 mb-6">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> {program.trackCount} tracks · {program.lessonCount} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {program.estimatedHoursMin}–{program.estimatedHoursMax} hours
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="h-4 w-4" /> {program.credential}
          </span>
        </div>
        {tracks.length > 0 && (
          <Button asChild className="bg-white text-primary-600 hover:bg-primary-50">
            <Link href={`/programs/${params.programSlug}/tracks/${tracks[0].slug}`}>
              Start Track 1 <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Track list */}
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
        Tracks in this program
      </h2>
      {tracks.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tracks.map((track) => (
            <TrackCard key={track.slug} track={track} programSlug={params.programSlug} />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">Content coming soon.</p>
      )}
    </div>
  )
}
