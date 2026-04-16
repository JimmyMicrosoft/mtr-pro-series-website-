import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock, BookOpen } from 'lucide-react'
import pathsData from '@/data/learning-paths.json'

export const metadata: Metadata = {
  title: 'Learning Paths',
  description: 'Find the MTR training path matched to your role and experience level.',
}

export default function LearningPathsPage() {
  return (
    <div className="container-content py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Learning Paths
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Not sure which program to start with? Choose the path that matches your current role.
          Each path maps to the specific tracks most relevant to your day-to-day work.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {pathsData.map((path) => (
          <Link
            key={path.slug}
            href={`/learning-paths/${path.slug}`}
            className="group flex flex-col p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                {path.cardTitle}
              </h2>
              <Badge variant="persona" value={path.persona as 'newcomer' | 'practitioner' | 'specialist' | 'expert'} className="flex-shrink-0" />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex-1">
              {path.cardDescription}
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{path.hours} hrs</span>
              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {path.cardTracks.length} track group{path.cardTracks.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">🏅 {path.badge}</span>
              <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
