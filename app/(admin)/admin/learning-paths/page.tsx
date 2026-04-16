'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LearningPathsAdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseResult, setParseResult] = useState<{
    updatedPaths: Array<Record<string, unknown>>
    changedSlugs: string[]
    totalChanges: number
  } | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [applyResult, setApplyResult] = useState<{ success: boolean; committed: boolean; message?: string } | null>(null)
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
      const res = await fetch('/api/admin/import-roles', { method: 'POST', body: formData })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `Parse failed (${res.status})`)
      }
      setParseResult(await res.json())
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
      const res = await fetch('/api/admin/apply-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedPaths: parseResult.updatedPaths }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `Apply failed (${res.status})`)
      }
      setApplyResult(await res.json())
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/admin" className="hover:text-neutral-900 transition-colors">Admin</Link>
        <span>/</span>
        <span className="text-neutral-900">Learn by Role</span>
      </nav>

      <h1 className="mb-1 text-2xl font-bold text-neutral-900">Learn by Role</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Export all 8 learning paths as a Word document, edit the content, then import the updated file to push changes live.
      </p>

      {/* Export */}
      <section className="mb-8 rounded-lg border border-neutral-200 p-6">
        <h2 className="mb-1 text-base font-semibold text-neutral-900">Export</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Download all 8 learning paths as a single Word document. Edit titles, descriptions,
          outcomes, and step notes, then import the file below.
        </p>
        <a href="/api/admin/export-roles" download>
          <Button variant="secondary">Download .docx</Button>
        </a>
      </section>

      {/* Import */}
      <section className="rounded-lg border border-neutral-200 p-6">
        <h2 className="mb-1 text-base font-semibold text-neutral-900">Import</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Upload your edited .docx file. Review the detected changes, then commit them to GitHub.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileChange}
            className="text-sm text-neutral-700 file:mr-3 file:cursor-pointer file:rounded file:border file:border-neutral-200 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 file:transition-colors hover:file:bg-neutral-50"
          />
          <Button variant="primary" onClick={handleParse} disabled={!file || parsing}>
            {parsing ? 'Parsing...' : 'Parse Document'}
          </Button>
        </div>

        {/* Parse error */}
        {parseError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {parseError}
          </div>
        )}

        {/* Preview */}
        {parseResult && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">
              Detected changes:{' '}
              <span className="font-normal text-neutral-500">
                {parseResult.totalChanges} field update{parseResult.totalChanges !== 1 ? 's' : ''} across{' '}
                {parseResult.changedSlugs.length} path{parseResult.changedSlugs.length !== 1 ? 's' : ''}
              </span>
            </h3>

            {parseResult.changedSlugs.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No changes detected. The imported content matches what is already live.
              </p>
            ) : (
              <ul className="space-y-1 mb-6">
                {parseResult.changedSlugs.map((slug) => (
                  <li key={slug} className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {slug}
                  </li>
                ))}
              </ul>
            )}

            {parseResult.changedSlugs.length > 0 && !applyResult && (
              <div>
                <Button variant="primary" onClick={handleApply} disabled={applying}>
                  {applying ? 'Committing to GitHub...' : 'Apply Changes to GitHub'}
                </Button>
                <p className="mt-2 text-xs text-neutral-400">
                  This will update <code className="font-mono">data/learning-paths.json</code> in your GitHub repository and trigger a Vercel redeploy.
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
            <p className="text-sm font-semibold text-green-800">Changes committed successfully!</p>
            <p className="mt-1 text-sm text-green-700">
              {applyResult.committed
                ? 'learning-paths.json updated on GitHub. Vercel is now redeploying...'
                : applyResult.message}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
