import { auth } from '@/auth'
import mammoth from 'mammoth'

export const dynamic = 'force-dynamic'

// ── Auth guard ────────────────────────────────────────────────────────────────

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return false
  }
  return true
}

// ── Parse sections ────────────────────────────────────────────────────────────

interface Section {
  id: string
  lines: string[]
}

function parseSections(rawText: string): Section[] {
  const sections: Section[] = []
  const lines = rawText.split('\n').map((l) => l.trim())
  let current: Section | null = null

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

// ── Extract video updates ─────────────────────────────────────────────────────

interface VideoUpdate {
  videoId: string
  platform: string
  title: string
  placeholderId: string | null
}

function extractVideoUpdates(sectionLines: string[]): VideoUpdate[] {
  const updates: VideoUpdate[] = []

  for (let i = 0; i < sectionLines.length; i++) {
    const line = sectionLines[i]
    if (!line.startsWith('Video ID:')) continue

    const rawId = line.replace(/^Video ID:\s*/, '').replace(/_+/g, '').trim()
    if (!rawId) continue

    let videoId = rawId
    const ytMatch = rawId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    const viMatch = rawId.match(/vimeo\.com\/(\d+)/)
    if (ytMatch) videoId = ytMatch[1]
    else if (viMatch) videoId = viMatch[1]

    let placeholderId: string | null = null
    let platform = 'youtube'

    for (let j = Math.max(0, i - 8); j < i; j++) {
      const idMatch = sectionLines[j].match(/\[id:\s*([^\]]+)\]/)
      if (idMatch) placeholderId = idMatch[1].trim()
      if (/vimeo/i.test(sectionLines[j])) platform = 'vimeo'
    }
    if (viMatch) platform = 'vimeo'

    let title = ''
    if (i + 1 < sectionLines.length && sectionLines[i + 1].startsWith('Title:')) {
      title = sectionLines[i + 1].replace(/^Title:\s*/, '').replace(/_+/g, '').trim()
    }

    updates.push({ videoId, platform, title, placeholderId })
  }

  return updates
}

// ── Extract image URL updates ─────────────────────────────────────────────────

interface ImageUrlUpdate {
  url: string
  placeholderId: string | null
}

function extractImageUrlUpdates(sectionLines: string[]): ImageUrlUpdate[] {
  const updates: ImageUrlUpdate[] = []

  for (let i = 0; i < sectionLines.length; i++) {
    const line = sectionLines[i]
    if (!line.includes('Drop image below, or paste URL:')) continue

    for (let j = i + 1; j < Math.min(i + 6, sectionLines.length); j++) {
      const next = sectionLines[j]
      if (next.startsWith('http://') || next.startsWith('https://')) {
        let placeholderId: string | null = null
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

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return Response.json({ error: 'No file uploaded (field name must be "file")' }, { status: 400 })
  }

  if (!file.name.endsWith('.docx')) {
    return Response.json({ error: 'File must be a .docx document' }, { status: 400 })
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const { value: rawText } = await mammoth.extractRawText({ buffer })

    const sections = parseSections(rawText)

    const result = sections.map((section) => {
      const videoUpdates = extractVideoUpdates(section.lines)
      const imageUrlUpdates = extractImageUrlUpdates(section.lines)
      return {
        lessonId: section.id,
        videoUpdates,
        imageUrlUpdates,
      }
    })

    const totalChanges = result.reduce(
      (sum, s) => sum + s.videoUpdates.length + s.imageUrlUpdates.length,
      0
    )

    return Response.json({ sections: result, totalChanges })
  } catch (err) {
    console.error('[admin/import] parse error:', err)
    return Response.json({ error: 'Failed to parse document' }, { status: 500 })
  }
}
