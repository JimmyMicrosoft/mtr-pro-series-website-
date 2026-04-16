import { auth } from '@/auth'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) return false
  return true
}

async function getFileSha(owner: string, repo: string, filePath: string, token: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    { headers: { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' } }
  )
  if (!res.ok) throw new Error(`GitHub GET ${filePath} failed: ${res.status} ${await res.text()}`)
  const json = await res.json() as { sha: string }
  return json.sha
}

async function commitFile(
  owner: string, repo: string, filePath: string, content: string,
  sha: string, message: string, branch: string, token: string
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
        content: Buffer.from(content).toString('base64'),
        sha,
        branch,
      }),
    }
  )
  if (!res.ok) throw new Error(`GitHub PUT ${filePath} failed: ${res.status} ${await res.text()}`)
}

// ── POST handler ────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { updatedPaths: Array<Record<string, unknown>> }
  if (!body?.updatedPaths) {
    return Response.json({ error: 'Missing updatedPaths' }, { status: 400 })
  }

  const token  = process.env.GITHUB_TOKEN
  const owner  = process.env.GITHUB_OWNER
  const repo   = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH ?? 'main'

  if (!token || !owner || !repo) {
    return Response.json({ error: 'GitHub env vars not configured (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO)' }, { status: 500 })
  }

  // Also update the local file so the site reflects changes on the next dev reload
  const localPath = join(process.cwd(), 'data', 'learning-paths.json')
  const currentContent = readFileSync(localPath, 'utf-8')
  const newContent = JSON.stringify(body.updatedPaths, null, 2) + '\n'

  if (newContent === currentContent) {
    return Response.json({ success: true, committed: false, message: 'No changes to commit.' })
  }

  // Commit to GitHub
  const repoFilePath = 'data/learning-paths.json'
  try {
    const sha = await getFileSha(owner, repo, repoFilePath, token)
    await commitFile(owner, repo, repoFilePath, newContent, sha, 'Admin CMS: update learning paths content', branch, token)
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }

  return Response.json({ success: true, committed: true })
}
