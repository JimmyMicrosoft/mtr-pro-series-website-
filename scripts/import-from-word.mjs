/**
 * Import changes from an edited Word (.docx) file back into MDX lesson files.
 *
 * Reads filled-in video IDs, image URLs, and embedded images from the Word doc
 * and applies them to the corresponding MDX lesson files.
 *
 * Usage:
 *   node scripts/import-from-word.mjs <path-to-docx>             # apply changes
 *   node scripts/import-from-word.mjs <path-to-docx> --dry-run   # preview only
 *
 * What it handles:
 *   🎥  Video ID filled into a Video Placeholder  → adds <VideoPlayer> to MDX + updates videoId frontmatter
 *   📷  Image URL pasted into an Image Placeholder → adds ![...](url) to MDX at the correct position
 *   📷  Image embedded (dropped) into placeholder  → saves to public/images/lessons/ and adds img tag to MDX
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, resolve, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import mammoth from 'mammoth'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR  = resolve(__dirname, '../content/programs')
const IMAGES_DIR   = resolve(__dirname, '../public/images/lessons')

// ── Find a lesson file by its frontmatter id ──────────────────────────────────

const lessonFileCache = new Map()

function buildLessonCache() {
  if (lessonFileCache.size > 0) return
  const programs = readdirSync(CONTENT_DIR).filter((f) => isDir(join(CONTENT_DIR, f)))
  for (const prog of programs) {
    const tracksDir = join(CONTENT_DIR, prog, 'tracks')
    for (const track of ls(tracksDir)) {
      const modulesDir = join(tracksDir, track, 'modules')
      for (const mod of ls(modulesDir)) {
        const lessonsDir = join(modulesDir, mod, 'lessons')
        for (const file of ls(lessonsDir).filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')) {
          const filePath = join(lessonsDir, file)
          try {
            const raw = readFileSync(filePath, 'utf-8')
            const { data } = matter(raw)
            if (data.id) lessonFileCache.set(data.id, filePath)
          } catch { /* skip */ }
        }
      }
    }
  }
}

const isDir = (p) => { try { return statSync(p).isDirectory() } catch { return false } }
const ls = (p) => { try { return readdirSync(p) } catch { return [] } }

// ── Parse sections from raw text ──────────────────────────────────────────────

function parseSections(rawText) {
  const sections = []
  const lines = rawText.split('\n').map((l) => l.trim())
  let current = null

  for (const line of lines) {
    const markerMatch = line.match(/▌\s*LESSON\s*ID:\s*([a-z0-9-]+)/i)
    if (markerMatch) {
      if (current) sections.push(current)
      current = { id: markerMatch[1].trim(), lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) sections.push(current)
  return sections
}

// ── Extract video updates from a lesson section ───────────────────────────────

function extractVideoUpdates(sectionLines) {
  const updates = []

  for (let i = 0; i < sectionLines.length; i++) {
    const line = sectionLines[i]

    if (!line.startsWith('Video ID:')) continue

    const rawId = line.replace(/^Video ID:\s*/, '').replace(/_+/g, '').trim()
    if (!rawId) continue

    // Extract YouTube/Vimeo URL → video ID
    let videoId = rawId
    const ytMatch = rawId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    const viMatch = rawId.match(/vimeo\.com\/(\d+)/)
    if (ytMatch) videoId = ytMatch[1]
    else if (viMatch) videoId = viMatch[1]

    // Look back up to 8 lines for the placeholder ID and platform
    let placeholderId = null
    let platform = 'youtube'
    for (let j = Math.max(0, i - 8); j < i; j++) {
      const idMatch = sectionLines[j].match(/\[id:\s*([^\]]+)\]/)
      if (idMatch) placeholderId = idMatch[1].trim()
      if (/vimeo/i.test(sectionLines[j])) platform = 'vimeo'
    }
    if (viMatch) platform = 'vimeo'

    // Title on the next line
    let title = ''
    if (i + 1 < sectionLines.length && sectionLines[i + 1].startsWith('Title:')) {
      title = sectionLines[i + 1].replace(/^Title:\s*/, '').replace(/_+/g, '').trim()
    }

    updates.push({ videoId, platform, title, placeholderId })
  }

  return updates
}

// ── Extract image URL updates from a lesson section ───────────────────────────

function extractImageUrlUpdates(sectionLines) {
  const updates = []

  for (let i = 0; i < sectionLines.length; i++) {
    const line = sectionLines[i]
    if (!line.includes('Drop image below, or paste URL:')) continue

    // Look ahead up to 5 lines for a URL
    for (let j = i + 1; j < Math.min(i + 6, sectionLines.length); j++) {
      const next = sectionLines[j]
      if (next.startsWith('http://') || next.startsWith('https://')) {
        // Find placeholder ID above
        let placeholderId = null
        for (let k = Math.max(0, i - 4); k <= i; k++) {
          const idMatch = sectionLines[k].match(/\[id:\s*([^\]]+)\]/)
          if (idMatch) placeholderId = idMatch[1].trim()
        }
        updates.push({ url: next, placeholderId })
        break
      }
    }
  }

  return updates
}

// ── Apply changes to an MDX file ──────────────────────────────────────────────

function applyChanges(filePath, videoUpdates, imageUrlUpdates, embeddedImages, dryRun) {
  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  let body = content.trim()
  const changes = []

  // ── Videos ────────────────────────────────────────────────────────────────
  for (const v of videoUpdates) {
    const tag = `<VideoPlayer videoId="${v.videoId}" platform="${v.platform}"${v.title ? ` title="${v.title}"` : ''} />`

    // Replace existing VideoPlayer at the start of the body, or prepend
    if (/^<VideoPlayer\s/.test(body)) {
      body = body.replace(/^<VideoPlayer[^\n]*\n?/, tag + '\n\n')
      changes.push(`Updated existing VideoPlayer → ${v.videoId}`)
    } else {
      body = tag + '\n\n' + body
      changes.push(`Added VideoPlayer at top → ${v.videoId}`)
    }

    // Update frontmatter
    if ('videoId' in data) data.videoId = v.videoId
    if ('videoDuration' in data && data.videoDuration === 0) data.videoDuration = -1
  }

  // ── Image URLs ────────────────────────────────────────────────────────────
  for (const img of imageUrlUpdates) {
    if (!img.placeholderId) continue
    const imgIndexMatch = img.placeholderId.match(/-img-(\d+)$/)
    if (!imgIndexMatch) continue
    const imgIndex = parseInt(imgIndexMatch[1], 10)

    // Find the Nth ## heading and insert after it
    const bodyLines = body.split('\n')
    let h2Count = 0
    let insertAfter = -1
    for (let i = 0; i < bodyLines.length; i++) {
      if (bodyLines[i].startsWith('## ')) {
        h2Count++
        if (h2Count === imgIndex) { insertAfter = i; break }
      }
    }

    const altText = `Image for ${img.placeholderId}`
    const imageMarkdown = `\n![${altText}](${img.url})\n`

    if (insertAfter >= 0) {
      bodyLines.splice(insertAfter + 1, 0, imageMarkdown)
      body = bodyLines.join('\n')
      changes.push(`Added image URL after H2 #${imgIndex} → ${img.url}`)
    } else {
      // Append at end
      body = body + '\n' + imageMarkdown
      changes.push(`Added image URL at end → ${img.url}`)
    }
  }

  // ── Embedded images ───────────────────────────────────────────────────────
  for (const img of embeddedImages) {
    // Find the nearest placeholder ID in the section
    const lessonId = data.id
    const imgDir = join(IMAGES_DIR, lessonId)

    if (!dryRun) mkdirSync(imgDir, { recursive: true })

    const filename = `${img.placeholderId ?? `${lessonId}-img-${img.index}`}.${img.ext}`
    const publicPath = `/images/lessons/${lessonId}/${filename}`
    const absPath = join(imgDir, filename)

    if (!dryRun) writeFileSync(absPath, Buffer.from(img.base64, 'base64'))

    // Insert after the matching H2
    const imgIndexMatch = (img.placeholderId ?? '').match(/-img-(\d+)$/)
    const imgIndex = imgIndexMatch ? parseInt(imgIndexMatch[1], 10) : null
    const altText = img.placeholderId ?? filename
    const imageMarkdown = `\n![${altText}](${publicPath})\n`

    if (imgIndex !== null) {
      const bodyLines = body.split('\n')
      let h2Count = 0
      let insertAfter = -1
      for (let i = 0; i < bodyLines.length; i++) {
        if (bodyLines[i].startsWith('## ')) {
          h2Count++
          if (h2Count === imgIndex) { insertAfter = i; break }
        }
      }
      if (insertAfter >= 0) {
        bodyLines.splice(insertAfter + 1, 0, imageMarkdown)
        body = bodyLines.join('\n')
      } else {
        body = body + '\n' + imageMarkdown
      }
    } else {
      body = body + '\n' + imageMarkdown
    }

    changes.push(`Saved embedded image → ${publicPath}`)
  }

  if (!changes.length) return []

  if (!dryRun) {
    // Rebuild the MDX file preserving frontmatter field order as much as possible
    const newRaw = matter.stringify(body, data)
    writeFileSync(filePath, newRaw, 'utf-8')
  }

  return changes
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const filePath = args.find((a) => !a.startsWith('--'))
  const dryRun = args.includes('--dry-run')

  if (!filePath) {
    console.error('\nUsage: node scripts/import-from-word.mjs <path-to-docx> [--dry-run]\n')
    process.exit(1)
  }

  const absPath = resolve(filePath)
  console.log(`\nImporting: ${absPath}`)
  if (dryRun) console.log('(DRY RUN — no files will be written)\n')

  // Build lesson file cache
  buildLessonCache()
  console.log(`  Indexed ${lessonFileCache.size} lessons\n`)

  // ── Extract embedded images via mammoth ───────────────────────────────────
  const embeddedImagesByLesson = new Map()

  await mammoth.convert(
    { path: absPath },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const base64 = await image.read('base64')
        const ext = (image.contentType ?? 'image/png').split('/')[1]?.split('+')[0] ?? 'png'
        // Store with a placeholder; we'll associate to lessons during text parsing
        const key = `__img_${Date.now()}_${Math.random().toString(36).slice(2)}`
        if (!embeddedImagesByLesson.has('__pending')) embeddedImagesByLesson.set('__pending', [])
        embeddedImagesByLesson.get('__pending').push({ key, base64, ext })
        return { src: key }
      }),
    }
  )

  // ── Extract raw text ──────────────────────────────────────────────────────
  const { value: rawText } = await mammoth.extractRawText({ path: absPath })
  const sections = parseSections(rawText)

  console.log(`  Found ${sections.length} lesson sections in document\n`)

  // ── Process each section ──────────────────────────────────────────────────
  const pending = embeddedImagesByLesson.get('__pending') ?? []
  let pendingImgIdx = 0
  let totalChanges = 0

  for (const section of sections) {
    const { id: lessonId, lines: sectionLines } = section
    const lessonFile = lessonFileCache.get(lessonId)

    if (!lessonFile) {
      console.warn(`  ⚠  No file found for lesson ID: ${lessonId}`)
      continue
    }

    const videoUpdates    = extractVideoUpdates(sectionLines)
    const imageUrlUpdates = extractImageUrlUpdates(sectionLines)

    // Assign pending embedded images to this lesson section
    // (images appear in document order, matching the order of placeholders)
    const embeddedImages = []
    const imgPlaceholderIds = sectionLines
      .map((l) => { const m = l.match(/\[id:\s*([^\]]+?-img-\d+)\]/); return m?.[1] ?? null })
      .filter(Boolean)

    for (const phId of imgPlaceholderIds) {
      if (pendingImgIdx < pending.length) {
        embeddedImages.push({ ...pending[pendingImgIdx], placeholderId: phId, index: pendingImgIdx + 1 })
        pendingImgIdx++
      }
    }

    if (!videoUpdates.length && !imageUrlUpdates.length && !embeddedImages.length) continue

    console.log(`  Lesson: ${lessonId}`)

    const changes = applyChanges(lessonFile, videoUpdates, imageUrlUpdates, embeddedImages, dryRun)
    for (const c of changes) {
      console.log(`    ${dryRun ? '(would) ' : ''}${c}`)
    }

    totalChanges += changes.length
    console.log()
  }

  if (totalChanges === 0) {
    console.log('  No video IDs, image URLs, or embedded images found to import.\n')
    console.log('  Make sure you filled in the "Video ID:" or "URL:" fields in the Word doc.\n')
  } else if (dryRun) {
    console.log(`  ${totalChanges} change(s) detected. Run without --dry-run to apply.\n`)
  } else {
    console.log(`✅ Applied ${totalChanges} change(s) across lesson files.\n`)
  }
}

main().catch((err) => { console.error('\n❌', err.message); process.exit(1) })
