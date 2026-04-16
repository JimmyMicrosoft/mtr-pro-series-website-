'use client'

import * as React from 'react'
import Link from 'next/link'
import { getAllQuizResults } from '@/lib/quiz-progress'
import { CheckCircle2, AlertTriangle, Circle, ClipboardList } from 'lucide-react'

const ALL_TRACKS = [
  { programSlug: 'mtr-foundations',         trackSlug: 'mtr-ecosystem',                trackTitle: 'The MTR Ecosystem' },
  { programSlug: 'mtr-foundations',         trackSlug: 'physical-installation',         trackTitle: 'Physical Installation' },
  { programSlug: 'mtr-foundations',         trackSlug: 'device-configuration',          trackTitle: 'Device Configuration' },
  { programSlug: 'mtr-systems-integration', trackSlug: 'network-infrastructure-qos',    trackTitle: 'Network Infrastructure and QoS' },
  { programSlug: 'mtr-systems-integration', trackSlug: 'microsoft-365-administration',  trackTitle: 'Microsoft 365 Administration' },
  { programSlug: 'mtr-systems-integration', trackSlug: 'av-systems-commissioning',      trackTitle: 'AV Systems Commissioning' },
  { programSlug: 'mtr-advanced-deployment', trackSlug: 'enterprise-scale-management',   trackTitle: 'Enterprise Scale Management' },
  { programSlug: 'mtr-advanced-deployment', trackSlug: 'troubleshooting-diagnostics',   trackTitle: 'Troubleshooting and Diagnostics' },
  { programSlug: 'mtr-advanced-deployment', trackSlug: 'powershell-graph-automation',   trackTitle: 'PowerShell and Graph Automation' },
  { programSlug: 'mtr-practice-leadership', trackSlug: 'project-delivery-lifecycle',    trackTitle: 'Project Delivery Lifecycle' },
  { programSlug: 'mtr-practice-leadership', trackSlug: 'solution-architecture-presales', trackTitle: 'Solution Architecture and Pre-Sales' },
  { programSlug: 'mtr-practice-leadership', trackSlug: 'practice-operations',           trackTitle: 'Practice Operations' },
]

export function DashboardQuizProgress() {
  const [results, setResults] = React.useState<Record<string, { score: number; passed: boolean }>>({})
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    setResults(getAllQuizResults())
    setLoaded(true)
  }, [])

  if (!loaded) return null

  const passed  = ALL_TRACKS.filter((t) => results[t.trackSlug]?.passed).length
  const attempted = ALL_TRACKS.filter((t) => results[t.trackSlug] && !results[t.trackSlug].passed).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Track Quizzes
        </h2>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {passed}/12 passed
        </span>
      </div>

      <div className="space-y-1.5">
        {ALL_TRACKS.map((track) => {
          const result = results[track.trackSlug]
          const quizHref = `/programs/${track.programSlug}/tracks/${track.trackSlug}/quiz`

          return (
            <Link
              key={track.trackSlug}
              href={quizHref}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
            >
              {result?.passed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : result ? (
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
              )}

              <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 truncate">
                {track.trackTitle}
              </span>

              {result ? (
                <span className={`text-xs font-medium flex-shrink-0 ${result.passed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {result.score}/10
                </span>
              ) : (
                <span className="text-xs text-neutral-400 flex-shrink-0">Not started</span>
              )}
            </Link>
          )
        })}
      </div>

      {attempted > 0 && (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          {attempted} track {attempted === 1 ? 'quiz' : 'quizzes'} recommended for review
        </p>
      )}
    </div>
  )
}
