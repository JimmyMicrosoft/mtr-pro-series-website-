import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TrackEntry {
  programSlug: string
  programName: string
  trackSlug: string
  trackName: string
}

const TRACKS: TrackEntry[] = [
  { programSlug: 'mtr-foundations',         programName: 'MTR Foundations',          trackSlug: 'mtr-ecosystem',                  trackName: 'The MTR Ecosystem' },
  { programSlug: 'mtr-foundations',         programName: 'MTR Foundations',          trackSlug: 'physical-installation',          trackName: 'Physical Installation' },
  { programSlug: 'mtr-foundations',         programName: 'MTR Foundations',          trackSlug: 'device-configuration',           trackName: 'Device Configuration' },
  { programSlug: 'mtr-systems-integration', programName: 'MTR Systems Integration',  trackSlug: 'network-infrastructure-qos',     trackName: 'Network Infrastructure and QoS' },
  { programSlug: 'mtr-systems-integration', programName: 'MTR Systems Integration',  trackSlug: 'microsoft-365-administration',   trackName: 'Microsoft 365 Administration' },
  { programSlug: 'mtr-systems-integration', programName: 'MTR Systems Integration',  trackSlug: 'av-systems-commissioning',       trackName: 'AV Systems Commissioning' },
  { programSlug: 'mtr-advanced-deployment', programName: 'MTR Advanced Deployment',  trackSlug: 'enterprise-scale-management',    trackName: 'Enterprise Scale Management' },
  { programSlug: 'mtr-advanced-deployment', programName: 'MTR Advanced Deployment',  trackSlug: 'troubleshooting-diagnostics',    trackName: 'Troubleshooting and Diagnostics' },
  { programSlug: 'mtr-advanced-deployment', programName: 'MTR Advanced Deployment',  trackSlug: 'powershell-graph-automation',    trackName: 'PowerShell and Graph Automation' },
  { programSlug: 'mtr-practice-leadership', programName: 'MTR Practice Leadership',  trackSlug: 'project-delivery-lifecycle',     trackName: 'Project Delivery Lifecycle' },
  { programSlug: 'mtr-practice-leadership', programName: 'MTR Practice Leadership',  trackSlug: 'solution-architecture-presales', trackName: 'Solution Architecture and Pre-Sales' },
  { programSlug: 'mtr-practice-leadership', programName: 'MTR Practice Leadership',  trackSlug: 'practice-operations',            trackName: 'Practice Operations' },
]

// Group tracks by program
function groupByProgram(tracks: TrackEntry[]) {
  const map = new Map<string, { programName: string; tracks: TrackEntry[] }>()
  for (const t of tracks) {
    if (!map.has(t.programSlug)) {
      map.set(t.programSlug, { programName: t.programName, tracks: [] })
    }
    map.get(t.programSlug)!.tracks.push(t)
  }
  return map
}

export default function AdminPage() {
  const groups = groupByProgram(TRACKS)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Content Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Export track content as Word documents, edit offline, then import changes back.
        </p>
      </div>

      <div className="space-y-8">
        {Array.from(groups.entries()).map(([programSlug, { programName, tracks }]) => (
          <section key={programSlug}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {programName}
            </h2>
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              {tracks.map((track, idx) => (
                <div
                  key={track.trackSlug}
                  className={`flex items-center justify-between px-5 py-4 ${
                    idx !== tracks.length - 1 ? 'border-b border-neutral-100' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-neutral-900">{track.trackName}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{track.programName}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Export button — direct download link */}
                    <a
                      href={`/api/admin/export?program=${track.programSlug}&track=${track.trackSlug}`}
                      download
                    >
                      <Button variant="secondary" size="sm">
                        Export .docx
                      </Button>
                    </a>

                    {/* Import / Update link */}
                    <Link href={`/admin/tracks/${track.programSlug}/${track.trackSlug}`}>
                      <Button variant="primary" size="sm">
                        Import / Update
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Learn by Role section */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Learn by Role
        </h2>
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-medium text-neutral-900">Learning Paths</p>
              <p className="mt-0.5 text-xs text-neutral-400">8 role-based paths — titles, descriptions, outcomes, steps</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/api/admin/export-roles" download>
                <Button variant="secondary" size="sm">Export .docx</Button>
              </a>
              <Link href="/admin/learning-paths">
                <Button variant="primary" size="sm">Import / Update</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
