import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import type {
  Program,
  Track,
  Module,
  Lesson,
  ProgramFrontmatter,
  TrackFrontmatter,
  ModuleFrontmatter,
  LessonFrontmatter,
} from '@/types/content'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readMdx(filePath: string): { frontmatter: Record<string, unknown>; content: string } | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return { frontmatter: data, content }
  } catch {
    return null
  }
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order)
}

// ─── Programs ────────────────────────────────────────────────────────────────

export function getAllPrograms(): Program[] {
  const programsDir = path.join(CONTENT_ROOT, 'programs')
  if (!fs.existsSync(programsDir)) return []

  const slugs = fs.readdirSync(programsDir).filter((name) => {
    return fs.statSync(path.join(programsDir, name)).isDirectory()
  })

  const programs = slugs
    .map((slug) => {
      const file = readMdx(path.join(programsDir, slug, 'index.mdx'))
      if (!file) return null
      return { ...(file.frontmatter as unknown as ProgramFrontmatter), slug } as Program
    })
    .filter(Boolean) as Program[]

  return sortByOrder(programs)
}

export function getProgram(programSlug: string): Program | null {
  const file = readMdx(path.join(CONTENT_ROOT, 'programs', programSlug, 'index.mdx'))
  if (!file) return null
  return { ...(file.frontmatter as unknown as ProgramFrontmatter), slug: programSlug } as Program
}

// ─── Tracks ──────────────────────────────────────────────────────────────────

export function getAllTracks(programSlug: string): Track[] {
  const tracksDir = path.join(CONTENT_ROOT, 'programs', programSlug, 'tracks')
  if (!fs.existsSync(tracksDir)) return []

  const slugs = fs.readdirSync(tracksDir).filter((name) => {
    return fs.statSync(path.join(tracksDir, name)).isDirectory()
  })

  const tracks = slugs
    .map((slug) => {
      const file = readMdx(path.join(tracksDir, slug, 'index.mdx'))
      if (!file) return null
      return { ...(file.frontmatter as unknown as TrackFrontmatter), slug, programSlug } as Track
    })
    .filter(Boolean) as Track[]

  return sortByOrder(tracks)
}

export function getTrack(programSlug: string, trackSlug: string): Track | null {
  const file = readMdx(
    path.join(CONTENT_ROOT, 'programs', programSlug, 'tracks', trackSlug, 'index.mdx')
  )
  if (!file) return null
  return { ...(file.frontmatter as unknown as TrackFrontmatter), slug: trackSlug, programSlug } as Track
}

// ─── Modules ─────────────────────────────────────────────────────────────────

export function getAllModules(programSlug: string, trackSlug: string): Module[] {
  const modulesDir = path.join(
    CONTENT_ROOT, 'programs', programSlug, 'tracks', trackSlug, 'modules'
  )
  if (!fs.existsSync(modulesDir)) return []

  const slugs = fs.readdirSync(modulesDir).filter((name) => {
    return fs.statSync(path.join(modulesDir, name)).isDirectory()
  })

  const modules = slugs
    .map((slug) => {
      const file = readMdx(path.join(modulesDir, slug, 'index.mdx'))
      if (!file) return null
      return {
        ...(file.frontmatter as unknown as ModuleFrontmatter),
        slug,
        programSlug,
        trackSlug,
      } as Module
    })
    .filter(Boolean) as Module[]

  return sortByOrder(modules)
}

export function getModule(
  programSlug: string,
  trackSlug: string,
  moduleSlug: string
): Module | null {
  const file = readMdx(
    path.join(
      CONTENT_ROOT, 'programs', programSlug, 'tracks', trackSlug, 'modules', moduleSlug, 'index.mdx'
    )
  )
  if (!file) return null
  return {
    ...(file.frontmatter as unknown as ModuleFrontmatter),
    slug: moduleSlug,
    programSlug,
    trackSlug,
  } as Module
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

export function getAllLessons(
  programSlug: string,
  trackSlug: string,
  moduleSlug: string
): Lesson[] {
  const lessonsDir = path.join(
    CONTENT_ROOT,
    'programs', programSlug,
    'tracks', trackSlug,
    'modules', moduleSlug,
    'lessons'
  )
  if (!fs.existsSync(lessonsDir)) return []

  const files = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.mdx'))

  const lessons = files
    .map((filename) => {
      const slug = filename.replace('.mdx', '')
      const file = readMdx(path.join(lessonsDir, filename))
      if (!file) return null
      return {
        ...(file.frontmatter as unknown as LessonFrontmatter),
        slug,
        programSlug,
        trackSlug,
        moduleSlug,
      } as Lesson
    })
    .filter(Boolean) as Lesson[]

  return sortByOrder(lessons)
}

export async function getLesson(
  programSlug: string,
  trackSlug: string,
  moduleSlug: string,
  lessonSlug: string
): Promise<Lesson | null> {
  const filePath = path.join(
    CONTENT_ROOT,
    'programs', programSlug,
    'tracks', trackSlug,
    'modules', moduleSlug,
    'lessons',
    `${lessonSlug}.mdx`
  )
  const file = readMdx(filePath)
  if (!file) return null

  const mdxSource = await serialize(file.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeHighlight],
    },
    parseFrontmatter: false,
  })

  // Build prev/next navigation
  const allLessons = getAllLessons(programSlug, trackSlug, moduleSlug)
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : undefined
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : undefined

  return {
    ...(file.frontmatter as unknown as LessonFrontmatter),
    slug: lessonSlug,
    programSlug,
    trackSlug,
    moduleSlug,
    content: JSON.stringify(mdxSource),
    prevLesson: prevLesson
      ? { slug: prevLesson.slug, title: prevLesson.title, moduleSlug, trackSlug, programSlug }
      : undefined,
    nextLesson: nextLesson
      ? { slug: nextLesson.slug, title: nextLesson.title, moduleSlug, trackSlug, programSlug }
      : undefined,
  } as Lesson
}

// ─── Static params helpers (for generateStaticParams) ────────────────────────

export function getAllLessonParams() {
  const params: {
    programSlug: string
    trackSlug: string
    moduleSlug: string
    lessonSlug: string
  }[] = []

  const programs = getAllPrograms()
  for (const program of programs) {
    const tracks = getAllTracks(program.slug)
    for (const track of tracks) {
      const modules = getAllModules(program.slug, track.slug)
      for (const mod of modules) {
        const lessons = getAllLessons(program.slug, track.slug, mod.slug)
        for (const lesson of lessons) {
          params.push({
            programSlug: program.slug,
            trackSlug: track.slug,
            moduleSlug: mod.slug,
            lessonSlug: lesson.slug,
          })
        }
      }
    }
  }

  return params
}
