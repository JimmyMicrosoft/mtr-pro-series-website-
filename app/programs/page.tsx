import type { Metadata } from 'next'
import { ProgramCard } from '@/components/ui/card'
import { getAllPrograms } from '@/lib/content'

export const metadata: Metadata = {
  title: 'All Programs',
  description: 'Browse all 4 MTR Pro Series training programs — from Foundations to Practice Leadership.',
}

// Static fallback data when no content files exist yet
const STATIC_PROGRAMS = [
  { slug: 'mtr-foundations', title: 'MTR Foundations', description: 'The MTR ecosystem, physical installation, and device configuration — your entry point to professional MTR deployment.', level: 'beginner' as const, order: 1, trackCount: 3, estimatedHoursMin: 14, estimatedHoursMax: 18, credential: 'MTR Foundations Badge', personaPrimary: 'newcomer' as const, personaSecondary: 'practitioner' as const, prerequisites: [], moduleCount: 9, lessonCount: 34, lastUpdated: '2026-04-12', version: '1.0.0', subtitle: 'Newcomer → Practitioner', id: 'PROG-1' },
  { slug: 'mtr-systems-integration', title: 'MTR Systems Integration', description: 'Network infrastructure, Microsoft 365 administration, audio/video systems, and full commissioning workflows.', level: 'intermediate' as const, order: 2, trackCount: 3, estimatedHoursMin: 20, estimatedHoursMax: 26, credential: 'MTR Systems Integration Badge', personaPrimary: 'practitioner' as const, personaSecondary: 'specialist' as const, prerequisites: ['PROG-1'], moduleCount: 9, lessonCount: 42, lastUpdated: '2026-04-12', version: '1.0.0', subtitle: 'Practitioner → Specialist', id: 'PROG-2' },
  { slug: 'mtr-advanced-deployment', title: 'MTR Advanced Deployment', description: 'Enterprise management with MTR Pro Management, Intune, advanced troubleshooting with CQD, and PowerShell/Graph automation.', level: 'advanced' as const, order: 3, trackCount: 3, estimatedHoursMin: 22, estimatedHoursMax: 28, credential: 'MTR Advanced Deployment Badge', personaPrimary: 'specialist' as const, personaSecondary: 'expert' as const, prerequisites: ['PROG-1', 'PROG-2'], moduleCount: 9, lessonCount: 46, lastUpdated: '2026-04-12', version: '1.0.0', subtitle: 'Specialist → Expert', id: 'PROG-3' },
  { slug: 'mtr-practice-leadership', title: 'MTR Practice Leadership', description: 'Project management, solution architecture, pre-sales technical skills, and customer success delivery for practice leaders.', level: 'expert' as const, order: 4, trackCount: 3, estimatedHoursMin: 18, estimatedHoursMax: 22, credential: 'MTR Practice Leader Badge', personaPrimary: 'specialist' as const, personaSecondary: 'expert' as const, prerequisites: ['PROG-1', 'PROG-2', 'PROG-3'], moduleCount: 8, lessonCount: 37, lastUpdated: '2026-04-12', version: '1.0.0', subtitle: 'Specialist / Expert', id: 'PROG-4' },
]

export default function ProgramsPage() {
  const programs = getAllPrograms()
  const displayPrograms = programs.length > 0 ? programs : STATIC_PROGRAMS

  return (
    <div className="container-content py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">All Programs</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          4 progressive programs · 12 tracks · 159 lessons · 74–94 hours of training
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {displayPrograms.map((p) => <ProgramCard key={p.slug} program={p} />)}
      </div>
    </div>
  )
}
