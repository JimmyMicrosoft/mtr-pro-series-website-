import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Award, Clock, RefreshCw, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Certifications & Badges',
  description: 'Earn verifiable Open Badge 2.0 credentials as you complete each MTR Pro Series program.',
}

const badges = [
  {
    id: 'foundations',
    title: 'MTR Foundations Badge',
    program: 'Program 1',
    level: 'beginner' as const,
    description: 'Demonstrates proficiency in the MTR ecosystem, physical installation, and device configuration. Earnable after completing all 3 tracks and the Program 1 certification assessment.',
    tracks: 3,
    lessons: 34,
    hours: '14–18',
    renewal: '18 months',
    href: '/programs/mtr-foundations',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'systems-integration',
    title: 'MTR Systems Integration Badge',
    program: 'Program 2',
    level: 'intermediate' as const,
    description: 'Validates network infrastructure, M365 administration, and audio/video commissioning skills for professional MTR deployments.',
    tracks: 3,
    lessons: 42,
    hours: '20–26',
    renewal: '18 months',
    href: '/programs/mtr-systems-integration',
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: 'advanced-deployment',
    title: 'MTR Advanced Deployment Badge',
    program: 'Program 3',
    level: 'advanced' as const,
    description: 'Confirms enterprise management, advanced diagnostics, and automation capabilities for MTR deployments at scale.',
    tracks: 3,
    lessons: 46,
    hours: '22–28',
    renewal: '18 months',
    href: '/programs/mtr-advanced-deployment',
    color: 'from-teal-500 to-teal-700',
  },
  {
    id: 'practice-leader',
    title: 'MTR Practice Leader Badge',
    program: 'Program 4',
    level: 'expert' as const,
    description: 'Recognizes project delivery, solution architecture, pre-sales, and customer success capabilities for MTR practice leaders.',
    tracks: 3,
    lessons: 37,
    hours: '18–22',
    renewal: '18 months',
    href: '/programs/mtr-practice-leadership',
    color: 'from-orange-500 to-orange-700',
  },
  {
    id: 'mtr-pro-certified',
    title: 'MTR Pro Certified',
    program: 'Master Credential',
    level: 'expert' as const,
    description: 'The master credential. Awarded upon completion of all 4 programs and a comprehensive capstone assessment. The highest recognition in the MTR Pro Series.',
    tracks: 12,
    lessons: 159,
    hours: '74–94',
    renewal: '18 months',
    href: '/certifications',
    color: 'from-yellow-500 to-amber-600',
  },
]

const microBadges = [
  { title: 'Audio Specialist', tracks: 'Tracks 1, 2, 3, 6', focus: 'Module 6.2 deep-dive' },
  { title: 'Network Specialist', tracks: 'Tracks 1, 4, 7', focus: 'Modules 4.2, 4.3' },
  { title: 'Microsoft Admin Specialist', tracks: 'Tracks 1, 5, 7, 9', focus: 'Full M365 + automation' },
  { title: 'Support Specialist', tracks: 'Tracks 1, 3, 5, 8', focus: 'Diagnostics mastery' },
  { title: 'Project Delivery Specialist', tracks: 'Tracks 1, 10, 12', focus: 'PM + customer success' },
]

export default function CertificationsPage() {
  return (
    <div className="container-content py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          Certifications & Badges
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Every badge you earn is an Open Badge 2.0 verifiable credential — shareable on LinkedIn,
          Credly, and your professional profile. Badges renew on an 18-month cycle to stay current
          with the Teams Rooms platform.
        </p>
      </div>

      {/* Program badges */}
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Program Badges
      </h2>
      <div className="space-y-4 mb-12">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="flex gap-0 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-800"
          >
            <div className={`w-2 bg-gradient-to-b ${badge.color} flex-shrink-0`} />
            <div className="flex-1 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-1">
                    {badge.program}
                  </p>
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    {badge.title}
                  </h3>
                </div>
                <Badge variant="difficulty" value={badge.level} />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                {badge.description}
              </p>
              <div className="flex flex-wrap gap-5 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{badge.tracks} tracks · {badge.lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {badge.hours} hrs</span>
                <span className="flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> Renews every {badge.renewal}</span>
              </div>
            </div>
            <div className="flex items-center pr-4">
              <Link
                href={badge.href}
                className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
              >
                View <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Micro-badges */}
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
        Specialization Micro-Badges
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {microBadges.map((mb) => (
          <div
            key={mb.title}
            className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
          >
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
              🎯 {mb.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{mb.tracks}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{mb.focus}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
