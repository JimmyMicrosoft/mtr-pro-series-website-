/**
 * import-learning-paths.mjs
 *
 * Reads an edited learning-paths Word document and updates data/learning-paths.json.
 * The website components read from that JSON file automatically.
 *
 * Usage:
 *   npm run import:roles <path-to-docx>
 *   npm run import:roles <path-to-docx> --dry-run
 */

import mammoth from 'mammoth'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const docxPath = process.argv[2]
const dryRun = process.argv.includes('--dry-run')

if (!docxPath) {
  console.error('\n❌  Usage: npm run import:roles <path-to-docx>\n')
  process.exit(1)
}

if (!fs.existsSync(docxPath)) {
  console.error(`\n❌  File not found: ${docxPath}\n`)
  process.exit(1)
}

// ─── Parse Word doc to plain text ────────────────────────────────────────────
const { value: rawText } = await mammoth.extractRawText({ path: docxPath })
const lines = rawText.split('\n').map((l) => l.trim())

// ─── Helpers ─────────────────────────────────────────────────────────────────
/**
 * Find lines between two markers (exclusive). Returns trimmed non-empty lines.
 * startPattern: regex or string to match the START line
 * endPatterns: array of regex/string — stop at the first match
 */
function extractBetween(allLines, startPattern, endPatterns) {
  const start = allLines.findIndex((l) =>
    startPattern instanceof RegExp ? startPattern.test(l) : l.includes(startPattern)
  )
  if (start === -1) return []
  const slice = allLines.slice(start + 1)
  const end = slice.findIndex((l) =>
    endPatterns.some((p) => (p instanceof RegExp ? p.test(l) : l.includes(p)))
  )
  const result = end === -1 ? slice : slice.slice(0, end)
  return result.filter((l) => l.length > 0)
}

/**
 * Extract a single-value field that appears right after the label line.
 * labelPattern: string or regex matching the label line
 * nextEndPatterns: stop collecting at these lines
 */
function extractField(allLines, labelPattern, nextEndPatterns) {
  const idx = allLines.findIndex((l) =>
    labelPattern instanceof RegExp ? labelPattern.test(l) : l.includes(labelPattern)
  )
  if (idx === -1) return ''
  // Collect lines after the label until we hit an end pattern
  const collected = []
  for (let i = idx + 1; i < allLines.length; i++) {
    const l = allLines[i]
    if (!l) continue
    if (nextEndPatterns && nextEndPatterns.some((p) => (p instanceof RegExp ? p.test(l) : l.includes(p)))) break
    collected.push(l)
  }
  return collected.join(' ').trim()
}

/**
 * Extract a value from a "Label:  Value" inline format.
 */
function extractInline(allLines, prefix) {
  const line = allLines.find((l) => l.startsWith(prefix))
  if (!line) return ''
  return line.slice(prefix.length).trim()
}

// ─── Split doc into path blocks ───────────────────────────────────────────────
// Each path block starts with "PATH N OF M: slug"
const pathBlockStarts = []
lines.forEach((l, i) => {
  if (/^PATH \d+ OF \d+:\s+\S/.test(l)) {
    pathBlockStarts.push(i)
  }
})

if (pathBlockStarts.length === 0) {
  console.error('\n❌  Could not find any PATH blocks in the document. Make sure you are using the exported file.\n')
  process.exit(1)
}

// Load existing data to use as a base (preserves any fields not in the doc)
const dataPath = path.join(ROOT, 'data', 'learning-paths.json')
const existingPaths = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
const existingBySlug = Object.fromEntries(existingPaths.map((p) => [p.slug, p]))

const updatedPaths = []
let changeCount = 0

for (let b = 0; b < pathBlockStarts.length; b++) {
  const blockStart = pathBlockStarts[b]
  const blockEnd = b < pathBlockStarts.length - 1 ? pathBlockStarts[b + 1] : lines.length
  const block = lines.slice(blockStart, blockEnd)

  // Extract slug from header line
  const headerLine = block[0]
  const slugMatch = headerLine.match(/^PATH \d+ OF \d+:\s+(.+)$/)
  if (!slugMatch) {
    console.warn(`  ⚠️  Could not parse slug from: "${headerLine}" — skipping`)
    continue
  }
  const slug = slugMatch[1].trim()

  const existing = existingBySlug[slug]
  if (!existing) {
    console.warn(`  ⚠️  Unknown slug "${slug}" — skipping`)
    continue
  }

  // ── CARD fields ────────────────────────────────────────────────────────
  const cardTitle = extractField(block, 'Card Title:', [
    'Card Description:', 'Hours (number only):', 'Prerequisites:', 'Badge Earned:', 'DETAIL PAGE'
  ])
  const cardDescription = extractField(block, 'Card Description:', [
    'Hours (number only):', 'Prerequisites:', 'Badge Earned:', 'DETAIL PAGE'
  ])
  const hoursLine = extractInline(block, 'Hours (number only):')
  const hours = hoursLine ? parseInt(hoursLine, 10) || existing.hours : existing.hours
  const prerequisites = extractField(block, 'Prerequisites:', [
    'Badge Earned:', 'Hours (number only):', 'DETAIL PAGE'
  ])
  const badge = extractField(block, 'Badge Earned:', ['DETAIL PAGE', 'Page Title:'])

  // ── DETAIL PAGE fields ─────────────────────────────────────────────────
  const detailStart = block.findIndex((l) => l.includes('DETAIL PAGE'))
  const detailBlock = detailStart >= 0 ? block.slice(detailStart) : block

  const pageTitle = extractField(detailBlock, 'Page Title:', [
    'Subtitle', 'Persona', 'Difficulty', 'Total Hours', 'Full Description'
  ])
  const subtitle = extractField(detailBlock, 'Subtitle', [
    'Persona', 'Difficulty', 'Total Hours', 'Full Description'
  ])
  const personaLine = extractInline(detailBlock, 'Persona')
  const persona = personaLine
    ? personaLine.replace(/\(.*?\)/g, '').split(':').pop()?.trim() || existing.persona
    : existing.persona
  const difficultyLine = extractInline(detailBlock, 'Difficulty')
  const difficulty = difficultyLine
    ? difficultyLine.replace(/\(.*?\)/g, '').split(':').pop()?.trim() || existing.difficulty
    : existing.difficulty
  const totalHoursLine = extractInline(detailBlock, 'Total Hours Display')
  const totalHours = totalHoursLine
    ? totalHoursLine.split(':').pop()?.trim() || existing.totalHours
    : existing.totalHours

  const description = extractField(detailBlock, 'Full Description', [
    'Outcomes', 'Steps in this path', 'STEP 1'
  ])

  // ── Outcomes ───────────────────────────────────────────────────────────
  const outcomesStart = detailBlock.findIndex((l) => /^Outcomes/.test(l))
  const stepsStart = detailBlock.findIndex((l) => /^Steps in this path/.test(l))
  let outcomes = existing.outcomes
  if (outcomesStart >= 0) {
    const end = stepsStart >= 0 ? stepsStart : detailBlock.length
    const outcomeLines = detailBlock
      .slice(outcomesStart + 1, end)
      .filter((l) => l.length > 0 && !/^Edit the text/.test(l))
    if (outcomeLines.length > 0) {
      outcomes = outcomeLines
    }
  }

  // ── Steps ──────────────────────────────────────────────────────────────
  const stepStarts = []
  block.forEach((l, i) => {
    if (/^STEP \d+$/.test(l)) stepStarts.push(i)
  })

  const steps = existing.steps.map((existingStep, si) => {
    if (si >= stepStarts.length) return existingStep
    const stepStart = stepStarts[si]
    const stepEnd = si < stepStarts.length - 1 ? stepStarts[si + 1] : block.length
    const stepBlock = block.slice(stepStart, stepEnd).filter((l) => l.length > 0)

    // Track slug line (do not edit marker)
    const trackSlugLine = stepBlock.find((l) => l.includes('Track Slug (do not edit):'))
    const trackSlug = trackSlugLine
      ? trackSlugLine.split(':').pop()?.trim() || existingStep.trackSlug
      : existingStep.trackSlug

    // If slug doesn't match, keep original step unchanged
    if (trackSlug !== existingStep.trackSlug) {
      console.warn(`  ⚠️  Step ${si + 1} in path "${slug}": slug mismatch (expected "${existingStep.trackSlug}", got "${trackSlug}") — keeping original`)
      return existingStep
    }

    const trackTitle = extractField(stepBlock, 'Track Title:', [
      'Program:', 'Modules:', 'Hours:', 'Step Description:', 'Focus Note'
    ])
    const programTitle = extractField(stepBlock, 'Program:', [
      'Modules:', 'Hours:', 'Step Description:', 'Focus Note'
    ])
    const modulesLine = extractInline(stepBlock, 'Modules:')
    const hoursLine = extractInline(stepBlock, 'Hours:')
    const stepDescription = extractField(stepBlock, 'Step Description:', ['Focus Note', 'STEP'])
    const stepFocus = extractField(stepBlock, 'Focus Note', ['STEP', 'PATH'])

    return {
      trackSlug: existingStep.trackSlug,
      trackTitle: trackTitle || existingStep.trackTitle,
      programSlug: existingStep.programSlug,
      programTitle: programTitle || existingStep.programTitle,
      modules: modulesLine ? parseInt(modulesLine, 10) || existingStep.modules : existingStep.modules,
      hours: hoursLine ? parseInt(hoursLine, 10) || existingStep.hours : existingStep.hours,
      description: stepDescription || existingStep.description,
      focus: stepFocus !== undefined ? stepFocus : existingStep.focus,
    }
  })

  // ── Build updated path object ──────────────────────────────────────────
  const updated = {
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

  // Count changes
  const fields = ['cardTitle', 'cardDescription', 'hours', 'prerequisites', 'badge', 'pageTitle', 'subtitle', 'persona', 'difficulty', 'totalHours', 'description']
  for (const f of fields) {
    if (String(updated[f]) !== String(existing[f])) {
      changeCount++
      if (dryRun) console.log(`  ~ [${slug}] ${f}: "${existing[f]}" → "${updated[f]}"`)
    }
  }

  updatedPaths.push(updated)
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n📄  Parsed ${pathBlockStarts.length} paths from document`)
console.log(`✏️   ${changeCount} field change(s) detected`)

if (dryRun) {
  console.log('\n🔍  DRY RUN — no files written. Remove --dry-run to apply.\n')
  process.exit(0)
}

if (changeCount === 0) {
  console.log('\n✅  No changes detected — data/learning-paths.json is already up to date.\n')
  process.exit(0)
}

fs.writeFileSync(dataPath, JSON.stringify(updatedPaths, null, 2) + '\n')
console.log(`\n✅  Updated data/learning-paths.json`)
console.log('   The website will reflect your changes automatically on the next page load.\n')
