'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface VideoUpdate {
  videoId: string
  platform: string
  title: string
  placeholderId?: string | null
}

interface ImageUrlUpdate {
  url: string
  placeholderId?: string | null
}

interface SectionPreview {
  lessonId: string
  videoUpdates: VideoUpdate[]
  imageUrlUpdates: ImageUrlUpdate[]
}

interface ParseResult {
  sections: SectionPreview[]
  totalChanges: number
}

const TRACK_NAMES: Record<string, string> = {
  'mtr-ecosystem':                'The MTR Ecosystem',
  'physical-installation':        'Physical Installation',
  'device-configuration':         'Device Configuration',
  'network-infrastructure-qos':   'Network Infrastructure and QoS',
  'microsoft-365-administration': 'Microsoft 365 Administration',
  'av-systems-commissioning':     'AV Systems Commissioning',
  'enterprise-scale-management':  'Enterprise Scale Management',
  'troubleshooting-diagnostics':  'Troubleshooting and Diagnostics',
  'powershell-graph-automation':  'PowerShell and Graph Automation',
  'project-delivery-lifecycle':   'Project Delivery Lifecycle',
  'solution-architecture-presales': 'Solution Architecture and Pre-Sales',
  'practice-operations':          'Practice Operations',
}

export default function TrackManagePage({
  params,
}: {
  params: { programSlug: string; trackSlug: string }
}) {
  const { programSlug, trackSlug } = params
  const trackName = TRACK_NAMES[trackSlug] ?? trackSlug

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<{ success: boolean; commitsCount: number } | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setParseResult(null)
    setParseError(null)
    setApplyResult(null)
    setApplyError(null)
  }

  async function handleParse() {
    if (!file) return
    setParsing(true)
    setParseResult(null)
    setParseError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? `Parse failed (${res.status})`)
      }

      const data: ParseResult = await res.json()
      setParseResult(data)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setParsing(false)
    }
  }

  async function handleApply() {
    if (!parseResult) return
    setApplying(true)
    setApplyResult(null)
    setApplyError(null)

    try {
      const res = await fetch('/api/admin/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programSlug,
          trackSlug,
          sections: parseResult.sections,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? `Apply failed (${res.status})`)
      }

      const data = await res.json()
      setApplyResult(data)
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setApplying(false)
    }
  }

  const sectionsWithChanges = parseResult?.sections.filter(
    (s) => s.videoUpdates.length > 0 || s.imageUrlUpdates.length > 0
  ) ?? []

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin" className="hover:text-neutral-900 transition-colors">
          Admin
        </Link>
        <span>/</span>
        <span className="text-neutral-900">{trackName}</span>
      </nav>

      <h1 className="mb-1 text-2xl font-bold text-neutral-900">{trackName}</h1>
      <p className="mb-8 text-sm text-neutral-500">{programSlug}</p>

      {/* Export section */}
      <section className="mb-8 rounded-lg border border-neutral-200 p-6">
        <h2 className="mb-1 text-base font-semibold text-neutral-900">Export</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Download the current track content as a Word document. Fill in video IDs and image URLs,
          then import the edited file below.
        </p>
        <a
          href={`/api/admin/export?program=${programSlug}&track=${trackSlug}`}
          download
        >
          <Button variant="secondary">Download .docx</Button>
        </a>
      </section>

      {/* Import section */}
      <section className="rounded-lg border border-neutral-200 p-6">
        <h2 className="mb-1 text-base font-semibold text-neutral-900">Import</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Upload an edited .docx file. The document will be scanned for filled-in video IDs and
          image URLs. Review the detected changes before committing them to GitHub.
        </p>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="text-sm text-neutral-700 file:mr-3 file:cursor-pointer file:rounded file:border file:border-neutral-200 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 file:transition-colors hover:file:bg-neutral-50"
          />
          <Button
            variant="primary"
            onClick={handleParse}
            disabled={!file || parsing}
          >
            {parsing ? 'Parsing...' : 'Parse Document'}
          </Button>
        </div>

        {/* Parse error */}
        {parseError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {parseError}
          </div>
        )}

        {/* Preview of detected changes */}
        {parseResult && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">
                Detected changes:{' '}
                <span className="font-normal text-neutral-500">
                  {parseResult.totalChanges} update{parseResult.totalChanges !== 1 ? 's' : ''} across{' '}
                  {sectionsWithChanges.length} lesson{sectionsWithChanges.length !== 1 ? 's' : ''}
                </span>
              </h3>
            </div>

            {sectionsWithChanges.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No video IDs or image URLs were detected in this document. Make sure the fields in
                the Word doc are filled in.
              </p>
            ) : (
              <div className="space-y-4">
                {sectionsWithChanges.map((section) => (
                  <div
                    key={section.lessonId}
                    className="rounded-md border border-neutral-200 p-4"
                  >
                    <p className="mb-3 text-xs font-mono font-medium text-neutral-600">
                      {section.lessonId}
                    </p>

                    {section.videoUpdates.length > 0 && (
                      <div className="mb-2">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-600">
                          Video IDs
                        </p>
                        <ul className="space-y-1">
                          {section.videoUpdates.map((v, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                              <span className="rounded bg-purple-50 px-1.5 py-0.5 text-xs font-mono text-purple-700">
                                {v.platform}
                              </span>
                              <span className="font-mono">{v.videoId}</span>
                              {v.title && (
                                <span className="text-neutral-400">&mdash; {v.title}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {section.imageUrlUpdates.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Image URLs
                        </p>
                        <ul className="space-y-1">
                          {section.imageUrlUpdates.map((img, i) => (
                            <li key={i} className="text-sm text-neutral-700">
                              <span className="font-mono text-xs text-neutral-400">
                                {img.placeholderId ?? 'unknown'}&nbsp;&rarr;&nbsp;
                              </span>
                              <span className="break-all">{img.url}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Apply button */}
            {sectionsWithChanges.length > 0 && !applyResult && (
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? 'Committing to GitHub...' : 'Apply Changes to GitHub'}
                </Button>
                <p className="mt-2 text-xs text-neutral-400">
                  This will commit the changes directly to your GitHub repository and trigger a
                  Vercel redeploy.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Apply error */}
        {applyError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {applyError}
          </div>
        )}

        {/* Success */}
        {applyResult?.success && (
          <div className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-4">
            <p className="text-sm font-semibold text-green-800">
              Changes committed successfully!
            </p>
            <p className="mt-1 text-sm text-green-700">
              {applyResult.commitsCount} file{applyResult.commitsCount !== 1 ? 's' : ''} updated on
              GitHub. Vercel is now redeploying...
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
