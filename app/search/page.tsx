'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, BookOpen, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Stub search data — replace with real index from content files
const SEARCH_INDEX = [
  { title: 'What is MTR?', type: 'lesson', href: '/programs/mtr-foundations/tracks/mtr-ecosystem/modules/introduction-to-teams-rooms/lessons/what-is-mtr', description: 'History and positioning of Microsoft Teams Rooms in the video conferencing market.', level: 'beginner', minutes: 30 },
  { title: 'MTR Windows vs. MTR Android', type: 'lesson', href: '/programs/mtr-foundations/tracks/mtr-ecosystem/modules/introduction-to-teams-rooms/lessons/mtr-windows-vs-android', description: 'Platform differences and feature gaps between the two MTR operating systems.', level: 'beginner', minutes: 30 },
  { title: 'QoS for Teams Rooms', type: 'lesson', href: '/programs/mtr-systems-integration/tracks/network-infrastructure/modules/qos-for-teams-rooms/lessons/dscp-markings', description: 'DSCP markings for audio, video, and sharing traffic in Teams environments.', level: 'intermediate', minutes: 30 },
  { title: 'SkypeSettings.xml Schema', type: 'lesson', href: '/programs/mtr-foundations/tracks/device-configuration/modules/xml-configuration/lessons/skype-settings-schema', description: 'Structure, elements, and validation of the MTR XML configuration file.', level: 'beginner', minutes: 30 },
  { title: 'MTR Foundations', type: 'program', href: '/programs/mtr-foundations', description: 'Complete introduction to the MTR ecosystem, physical installation, and device configuration.', level: 'beginner', minutes: 840 },
  { title: 'The MTR Ecosystem', type: 'track', href: '/programs/mtr-foundations/tracks/mtr-ecosystem', description: 'MTR history, platform comparison, hardware ecosystem, licensing, and the integrator\'s role.', level: 'beginner', minutes: 270 },
]

function SearchResults({ query }: { query: string }) {
  const results = query.length > 1
    ? SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : []

  if (!query) {
    return (
      <div className="text-center py-16 text-neutral-400">
        <Search className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p>Enter a search term to find lessons, tracks, and programs.</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-400">
        <p>No results for <strong className="text-neutral-600 dark:text-neutral-300">&quot;{query}&quot;</strong></p>
        <p className="text-sm mt-2">Try searching for a topic, skill, or tool name.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
      </p>
      <div className="space-y-3">
        {results.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="flex gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                  {item.title}
                </h3>
                <Badge className="capitalize bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-[10px]">
                  {item.type}
                </Badge>
                <Badge variant="difficulty" value={item.level as 'beginner' | 'intermediate' | 'advanced' | 'expert'} />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {item.description}
              </p>
            </div>
            <div className="text-xs text-neutral-400 flex-shrink-0 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {item.minutes < 60 ? `${item.minutes}m` : `${Math.floor(item.minutes / 60)}h`}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = React.useState(searchParams.get('q') ?? '')

  return (
    <div className="container-content py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Search</h1>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lessons, tracks, topics..."
          className="w-full pl-10 pr-4 h-12 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          autoFocus
        />
      </div>
      <React.Suspense>
        <SearchResults query={query} />
      </React.Suspense>
    </div>
  )
}
