import { auth } from '@/auth'
import mammoth from 'mammoth'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) return false
  return true
}

// ── Parsing helpers ────────────────────────────────────────────────────────────

function extractField(block: string[], labelPattern: string | RegExp, endPatterns: (string | RegExp)[]): string {
  const idx = block.findIndex((l) =>
    labelPattern instanceof RegExp ? labelPattern.test(l) : l.includes(labelPattern)
  )
  if (idx === -1) return ''
  const collected: string[] = []
  for (let i = idx + 1; i < block.length; i++) {
    const l = block[i]
    if (!l) continue
    if (endPatterns.some((p) => (p instanceof RegExp ? p.test(l) : l.includes(p)))) break
    collected.push(l)
  }
  return collected.join(' ').trim()
}

function extractInline(block: string[], prefix: string): string {
  const line = block.find((l) => l.startsWith(prefix))
  if (!line) return ''
  return line.slice(prefix.length).trim()
}

function parsePath(block: string[], existing: Record<string, unknown>) {
  // ── CARD fields ────────────────────────────────────────────────────────────
  const cardTitle = extractField(block, 'Card Title:', ['Card Description:', 'Hours (number only):', 'DETAIL PAGE'])
  const cardDescription = extractField(block, 'Card Description:', ['Hours (number only):', 'Prerequisites:', 'DETAIL PAGE'])
  const hoursRaw = extractInline(block, 'Hours (number only):')
  const hours = hoursRaw ? parseInt(hoursRaw, 10) || existing.hours : existing.hours
  const prerequisites = extractField(block, 'Prerequisites:', ['Badge Earned:', 'DETAIL PAGE'])
  const badge = extractField(block, 'Badge Earned:', ['DETAIL PAGE', 'Page Title:'])

  // ── DETAIL PAGE fields ─────────────────────────────────────────────────────
  const detailStart = block.findIndex((l) => l.includes('DETAIL PAGE'))
  const db = detailStart >= 0 ? block.slice(detailStart) : block

  const pageTitle = extractField(db, 'Page Title:', ['Subtitle', 'Persona', 'Difficulty', 'Full Description'])
  const subtitle = extractField(db, 'Subtitle', ['Persona', 'Difficulty', 'Total Hours', 'Full Description'])
  const personaRaw = extractInline(db, 'Persona')
  const persona = personaRaw ? (personaRaw.replace(/\(.*?\)/g, '').split(':').pop()?.trim() || existing.persona) : existing.persona
  const difficultyRaw = extractInline(db, 'Difficulty')
  const difficulty = difficultyRaw ? (difficultyRaw.replace(/\(.*?\)/g, '').split(':').pop()?.trim() || existing.difficulty) : existing.difficulty
  const totalHoursRaw = extractInline(db, 'Total Hours Display')
  const totalHours = totalHoursRaw ? (totalHoursRaw.split(':').pop()?.trim() || existing.totalHours) : existing.totalHours
  const description = extractField(db, 'Full Description', ['Outcomes', 'Steps in this path', 'STEP 1'])

  // ── Outcomes ───────────────────────────────────────────────────────────────
  const outStart = db.findIndex((l) => /^Outcomes/.test(l))
  const stepsStart = db.findIndex((l) => /^Steps in this path/.test(l))
  let outcomes = existing.outcomes as string[]
  if (outStart >= 0) {
    const end = stepsStart >= 0 ? stepsStart : db.length
    const outLines = db.slice(outStart + 1, end).filter((l) => l.length > 0 && !/^Edit the text/.test(l))
    if (outLines.length > 0) outcomes = outLines
  }

  // ── Steps ──────────────────────────────────────────────────────────────────
  const stepStarts: number[] = []
  block.forEach((l, i) => { if (/^STEP \d+$/.test(l)) stepStarts.push(i) })

  const existingSteps = existing.steps as Array<{
    trackSlug: string; trackTitle: string; programSlug: string; programTitle: string
    modules: number; hours: number; description: string; focus: string
  }>

  const steps = existingSteps.map((es, si) => {
    if (si >= stepStarts.length) return es
    const sStart = stepStarts[si]
    const sEnd = si < stepStarts.length - 1 ? stepStarts[si + 1] : block.length
    const sb = block.slice(sStart, sEnd).filter((l) => l.length > 0)

    const slugLine = sb.find((l) => l.includes('Track Slug (do not edit):'))
    const trackSlug = slugLine ? slugLine.split(':').pop()?.trim() || es.trackSlug : es.trackSlug
    if (trackSlug !== es.trackSlug) return es // mismatch — keep original

    const trackTitle = extractField(sb, 'Track Title:', ['Program:', 'Modules:', 'Step Description:', 'Focus Note'])
    const programTitle = extractField(sb, 'Program:', ['Modules:', 'Hours:', 'Step Description:', 'Focus Note'])
    const modulesRaw = extractInline(sb, 'Modules:')
    const stepHoursRaw = extractInline(sb, 'Hours:')
    const stepDesc = extractField(sb, 'Step Description:', ['Focus Note', 'STEP'])
    const stepFocus = extractField(sb, 'Focus Note', ['STEP', 'PATH'])

    return {
      trackSlug: es.trackSlug,
      trackTitle: trackTitle || es.trackTitle,
      programSlug: es.programSlug,
      programTitle: programTitle || es.programTitle,
      modules: modulesRaw ? parseInt(modulesRaw, 10) || es.modules : es.modules,
      hours: stepHoursRaw ? parseInt(stepHoursRaw, 10) || es.hours : es.hours,
      description: stepDesc || es.description,
      focus: stepFocus !== '' ? stepFocus : es.focus,
    }
  })

  return {
    ...existing,
    cardTitle: cardTitle || existing.cardTitle,
    cardDescription: cardDescription || existing.cardDescription,
    hours,
    prerequisites: prerequisites || existing.prerequisites,
    badge: badge || existing.badge,
    pageTitle: pageTitle || existing.pageTitle,
    subtitle: subtitle || existing.subtitle,
    persona: persona || existing.persona,
    difficulty: difficulty || existing.difficulty,
    totalHours: totalHours || existing.totalHours,
    description: description || existing.description,
    outcomes,
    steps,
  }
}

function countChanges(updated: Record<string, unknown>, existing: Record<string, unknown>): number {
  let n = 0
  const fields = ['cardTitle', 'cardDescription', 'hours', 'prerequisites', 'badge', 'pageTitle', 'subtitle', 'persona', 'difficulty', 'totalHours', 'description']
  for (const f of fields) {
    if (String(updated[f]) !== String(existing[f])) n++
  }
  const updatedOutcomes = updated.outcomes as string[]
  const existingOutcomes = existing.outcomes as string[]
  if (JSON.stringify(updatedOutcomes) !== JSON.stringify(existingOutcomes)) n++

  const updatedSteps = updated.steps as Array<Record<string, unknown>>
  const existingSteps = existing.steps as Array<Record<string, unknown>>
  for (let i = 0; i < existingSteps.length; i++) {
    const us = updatedSteps[i]
    const es = existingSteps[i]
    if (!us || !es) continue
    if (us.description !== es.description || us.focus !== es.focus || us.trackTitle !== es.trackTitle) n++
  }
  return n
}

// ── POST handler ────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file uploaded' }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const { value: rawText } = await mammoth.extractRawText({ buffer })
  const lines = rawText.split('\n').map((l) => l.trim())

  // Split into path blocks
  const blockStarts: number[] = []
  lines.forEach((l, i) => { if (/^PATH \d+ OF \d+:\s+\S/.test(l)) blockStarts.push(i) })

  if (blockStarts.length === 0) {
    return Response.json({ error: 'No PATH blocks found — make sure you are uploading the exported file.' }, { status: 400 })
  }

  // Load existing data
  const dataPath = join(process.cwd(), 'data', 'learning-paths.json')
  const existingPaths = JSON.parse(readFileSync(dataPath, 'utf-8')) as Array<Record<string, unknown>>
  const bySlug = Object.fromEntries(existingPaths.map((p) => [p.slug as string, p]))

  const updatedPaths: Array<Record<string, unknown>> = []
  const changedSlugs: string[] = []
  let totalChanges = 0

  for (let b = 0; b < blockStarts.length; b++) {
    const start = blockStarts[b]
    const end = b < blockStarts.length - 1 ? blockStarts[b + 1] : lines.length
    const block = lines.slice(start, end)

    const slugMatch = block[0].match(/^PATH \d+ OF \d+:\s+(.+)$/)
    if (!slugMatch) continue
    const slug = slugMatch[1].trim()

    const existing = bySlug[slug]
    if (!existing) continue

    const updated = parsePath(block, existing)
    const changes = countChanges(updated, existing)

    updatedPaths.push(updated)
    if (changes > 0) {
      changedSlugs.push(slug)
      totalChanges += changes
    }
  }

  // Fill in any paths that weren't in the doc (keep as-is)
  for (const p of existingPaths) {
    const slug = p.slug as string
    if (!updatedPaths.find((u) => u.slug === slug)) {
      updatedPaths.push(p)
    }
  }

  return Response.json({ updatedPaths, changedSlugs, totalChanges })
}
