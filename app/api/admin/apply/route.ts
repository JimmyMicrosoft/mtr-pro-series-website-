import { auth } from '@/auth'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

export const dynamic = 'force-dynamic'

// ── Auth guard ────────────────────────────────────────────────────────────────

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return false
  }
  return true
}

// ── File helpers ──────────────────────────────────────────────────────────────

const isDir = (p: string) => { try { return statSync(p).isDirectory() } catch { return false } }
const ls = (p: string): string[] => { try { return readdirSync(p) } catch { return [] } }

// ── Build a cache of lessonId → relative file path for a given track ─────────

function buildLessonPathMap(programSlug: string, trackSlug: string, contentDir: string): Map<string, string> {
  const map = new Map<string, string>()
  const modulesDir = join(contentDir, programSlug, 'tracks', trackSlug, 'modules')

  for (const mod of ls(modulesDir).filter((f) => isDir(join(modulesDir, f)))) {
    const lessonsDir = join(modulesDir, mod, 'lessons')
    for (const file of ls(lessonsDir).filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')) {
      const absPath = join(lessonsDir, file)
      try {
        const raw = readFileSync(absPath, 'utf-8')
        const { data } = matter(raw)
        if (data.id) {
          // Store as repo-relative path using forward slashes (GitHub API requirement)
          const relPath = absPath
            .replace(join(process.cwd()) + '/', '')
            .replace(/\\/g, '/')
          map.set(data.id, relPath)
        }
      } catch { /* skip */ }
    }
  }

  return map
}

// ── Apply video and image changes to MDX content ─────────────────────────────

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

function applyChanges(
  rawFileContent: string,
  videoUpdates: VideoUpdate[],
  imageUrlUpdates: ImageUrlUpdate[],
): string {
  const { data, content } = matter(rawFileContent)
  let body = content.trim()

  // ── Videos ────────────────────────────────────────────────────────────────
  for (const v of videoUpdates) {
    const tag = `<VideoPlayer videoId="${v.videoId}" platform="${v.platform}"${v.title ? ` title="${v.title}"` : ''} />`

    if (/^<VideoPlayer\s/.test(body)) {
      body = body.replace(/^<VideoPlayer[^\n]*\n?/, tag + '\n\n')
    } else {
      body = tag + '\n\n' + body
    }

    if ('videoId' in data) data.videoId = v.videoId
  }

  // ── Image URLs ────────────────────────────────────────────────────────────
  for (const img of imageUrlUpdates) {
    if (!img.placeholderId) continue
    const imgIndexMatch = img.placeholderId.match(/-img-(\d+)$/)
    if (!imgIndexMatch) continue
    const imgIndex = parseInt(imgIndexMatch[1], 10)

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
    } else {
      body = body + '\n' + imageMarkdown
    }
  }

  return matter.stringify(body, data)
}

// ── GitHub API helpers ────────────────────────────────────────────────────────

async function getFileSha(owner: string, repo: string, filePath: string, token: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  )

  if (!res.ok) {
    throw new Error(`GitHub GET ${filePath} failed: ${res.status} ${await res.text()}`)
  }

  const json = await res.json() as { sha: string }
  return json.sha
}

async function commitFile(
  owner: string,
  repo: string,
  filePath: string,
  newContent: string,
  sha: string,
  message: string,
  branch: string,
  token: string,
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(newContent).toString('base64'),
        sha,
        branch,
      }),
    }
  )

  if (!res.ok) {
    throw new Error(`GitHub PUT ${filePath} failed: ${res.status} ${await res.text()}`)
  }
}

// ── POST handler ──────────────────────────────────────────────────────────────

interface SectionPayload {
  lessonId: string
  videoUpdates: VideoUpdate[]
  imageUrlUpdates: ImageUrlUpdate[]
}

interface ApplyBody {
  programSlug: string
  trackSlug: string
  sections: SectionPayload[]
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ApplyBody
  try {
    body = await req.json() as ApplyBody
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { programSlug, trackSlug, sections } = body

  if (!programSlug || !trackSlug || !Array.isArray(sections)) {
    return Response.json({ error: 'Missing programSlug, trackSlug or sections' }, { status: 400 })
  }

  // GitHub env vars
  const token  = process.env.GITHUB_TOKEN
  const owner  = process.env.GITHUB_OWNER
  const repo   = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? 'main'

  if (!token || !owner || !repo) {
    return Response.json({ error: 'GitHub env vars not configured (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)' }, { status: 500 })
  }

  const contentDir = join(process.cwd(), 'content', 'programs')
  const lessonMap = buildLessonPathMap(programSlug, trackSlug, contentDir)

  let commitsCount = 0
  const errors: string[] = []

  for (const section of sections) {
    const { lessonId, videoUpdates, imageUrlUpdates } = section

    if (!videoUpdates.length && !imageUrlUpdates.length) continue

    const relPath = lessonMap.get(lessonId)
    if (!relPath) {
      errors.push(`Lesson not found: ${lessonId}`)
      continue
    }

    // Read current file content from disk
    let rawContent: string
    try {
      const absPath = join(process.cwd(), relPath.replace(/\//g, '/'))
      rawContent = readFileSync(absPath, 'utf-8')
    } catch (err) {
      errors.push(`Could not read file for ${lessonId}: ${err instanceof Error ? err.message : String(err)}`)
      continue
    }

    // Apply changes in memory
    const newContent = applyChanges(rawContent, videoUpdates, imageUrlUpdates)

    // Skip if no actual change
    if (newContent === rawContent) continue

    try {
      const sha = await getFileSha(owner, repo, relPath, token)
      await commitFile(
        owner,
        repo,
        relPath,
        newContent,
        sha,
        `Admin CMS: update ${lessonId} (video/image)`,
        branch,
        token,
      )
      commitsCount++
    } catch (err) {
      errors.push(`GitHub commit failed for ${lessonId}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (errors.length > 0 && commitsCount === 0) {
    return Response.json({ error: errors.join('; ') }, { status: 500 })
  }

  return Response.json({
    success: true,
    commitsCount,
    ...(errors.length > 0 ? { warnings: errors } : {}),
  })
}
