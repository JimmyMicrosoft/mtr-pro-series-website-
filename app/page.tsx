import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { ProgramCard } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAllPrograms } from '@/lib/content'
import {
  ArrowRight, BookOpen, Clock, Award, Users,
  CheckCircle2, Zap, Target, BarChart3
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'MTR Pro Series — AV Integrator Training for Microsoft Teams Rooms',
  description:
    'The complete, role-based training platform for AV integrators deploying Microsoft Teams Rooms. 12 tracks, 159 lessons, 74–94 hours of professional-grade content.',
}

const learningPaths = [
  { role: 'Junior Installer', persona: 'newcomer' as const, href: '/learning-paths/junior-installer', tracks: 2, hours: 10 },
  { role: 'Lead Installer', persona: 'practitioner' as const, href: '/learning-paths/lead-installer', tracks: 4, hours: 22 },
  { role: 'AV Programmer', persona: 'practitioner' as const, href: '/learning-paths/av-programmer', tracks: 5, hours: 30 },
  { role: 'Remote Support L1/L2', persona: 'practitioner' as const, href: '/learning-paths/remote-support', tracks: 4, hours: 24 },
  { role: 'Solutions Architect', persona: 'expert' as const, href: '/learning-paths/solutions-architect', tracks: 12, hours: 80 },
  { role: 'Pre-Sales Engineer', persona: 'specialist' as const, href: '/learning-paths/pre-sales-engineer', tracks: 4, hours: 28 },
]

const stats = [
  { label: 'Tracks', value: '12', icon: BookOpen },
  { label: 'Lessons', value: '159', icon: Target },
  { label: 'Training Hours', value: '74–94', icon: Clock },
  { label: 'Certifications', value: '4', icon: Award },
]

const whyItems = [
  { title: 'Role-Based Learning Paths', description: 'Content mapped to 10 real AV integrator roles — from junior installer to solutions architect.' },
  { title: 'Bloom\'s Taxonomy Aligned', description: 'Every lesson is designed to the right cognitive level — from recall to creation.' },
  { title: 'Hands-On Labs', description: 'Real M365 admin tasks, PowerShell scripts, network configs, and DSP integration labs.' },
  { title: 'Built with Microsoft Guidance', description: 'Content developed in alignment with Microsoft\'s official MTR documentation, best practices, and deployment frameworks.' },
  { title: 'Certification Badges', description: 'Earn verifiable Open Badge 2.0 credentials for each program you complete.' },
  { title: 'Always Current', description: '18-month renewal cycle keeps content aligned with the fast-moving MTR platform.' },
]

export default async function HomePage() {
  const programs = await Promise.resolve(getAllPrograms())

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-primary-950 to-neutral-900 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-400 via-transparent to-transparent" />
        <div className="container-content relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-primary-500/20 text-primary-300 border border-primary-500/30">
                Microsoft Teams Rooms
              </Badge>
              <Badge className="bg-white/10 text-neutral-300 border border-white/20">
                AV Integrator Training
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
              The complete MTR training platform{' '}
              <span className="text-primary-400">for AV integrators</span>
            </h1>
            <p className="text-lg text-neutral-300 mb-8 leading-relaxed max-w-2xl">
              Master the full Microsoft Teams Rooms lifecycle — from site survey and cable infrastructure
              through enterprise deployment, scripting, and managed service delivery.
              Built by integrators, for integrators.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/programs">
                  Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/learning-paths">Find Your Path</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="container-content py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="h-6 w-6 text-primary-500 mx-auto mb-1" />
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="container-content">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              4 Progressive Programs
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Each program builds on the last — start at your level and progress from newcomer to enterprise architect.
            </p>
          </div>
          {programs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {programs.map((p) => <ProgramCard key={p.slug} program={p} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { slug: 'mtr-foundations', title: 'MTR Foundations', description: 'The MTR ecosystem, physical installation, and device configuration. Your entry point to professional MTR deployment.', level: 'beginner' as const, order: 1, trackCount: 3, estimatedHoursMin: 14, estimatedHoursMax: 18, credential: 'MTR Foundations Badge', personaPrimary: 'newcomer' as const, personaSecondary: 'practitioner' as const, prerequisites: [], moduleCount: 9, lessonCount: 34, lastUpdated: '2026-04-12', version: '1.0.0', subtitle: '', id: 'PROG-1' },
                { slug: 'mtr-systems-integration', title: 'MTR Systems Integration', description: 'Network infrastructure, M365 administration, audio/video systems, and commissioning at the professional level.', level: 'intermediate' as const, order: 2, trackCount: 3, estimatedHoursMin: 20, estimatedHoursMax: 26, credential: 'MTR Systems Integration Badge', personaPrimary: 'practitioner' as const, personaSecondary: 'specialist' as const, prerequisites: ['PROG-1'], moduleCount: 9, lessonCount: 42, lastUpdated: '2026-04-12', version: '1.0.0', subtitle: '', id: 'PROG-2' },
                { slug: 'mtr-advanced-deployment', title: 'MTR Advanced Deployment', description: 'Enterprise management, advanced troubleshooting, and PowerShell/Graph API automation at scale.', level: 'advanced' as const, order: 3, trackCount: 3, estimatedHoursMin: 22, estimatedHoursMax: 28, credential: 'MTR Advanced Deployment Badge', personaPrimary: 'specialist' as const, personaSecondary: 'expert' as const, prerequisites: ['PROG-1', 'PROG-2'], moduleCount: 9, lessonCount: 46, lastUpdated: '2026-04-12', version: '1.0.0', subtitle: '', id: 'PROG-3' },
                { slug: 'mtr-practice-leadership', title: 'MTR Practice Leadership', description: 'Project management, solution architecture, pre-sales, and customer success for practice leaders.', level: 'expert' as const, order: 4, trackCount: 3, estimatedHoursMin: 18, estimatedHoursMax: 22, credential: 'MTR Practice Leader Badge', personaPrimary: 'specialist' as const, personaSecondary: 'expert' as const, prerequisites: ['PROG-1', 'PROG-2', 'PROG-3'], moduleCount: 8, lessonCount: 37, lastUpdated: '2026-04-12', version: '1.0.0', subtitle: '', id: 'PROG-4' },
              ].map((p) => <ProgramCard key={p.slug} program={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Learning Paths ───────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container-content">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              Learn by Role
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Not sure where to start? Follow a curated path matched to your role and experience level.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningPaths.map((path) => (
              <Link
                key={path.href}
                href={path.href}
                className="group flex items-start gap-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                      {path.role}
                    </span>
                    <Badge variant="persona" value={path.persona} />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {path.tracks} tracks · ~{path.hours} hrs
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button variant="secondary" asChild>
              <Link href="/learning-paths">View All Learning Paths</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why MTR Pro Series ───────────────────────────────────────────── */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="container-content">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
              Built for professionals. At professional depth.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyItems.map((item) => (
              <div key={item.title} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-primary-500 text-white">
        <div className="container-content text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to level up your MTR practice?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Create a free account and start with MTR Foundations today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              asChild
            >
              <Link href="/programs/mtr-foundations">
                Browse MTR Foundations <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
