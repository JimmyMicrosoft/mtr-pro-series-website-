import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getLesson, getProgram, getTrack, getModule, getAllModules, getAllLessons, getAllLessonParams } from '@/lib/content'
import { LessonSidebar } from '@/components/layout/lesson-sidebar'
import { LessonMetaSidebar } from '@/components/layout/lesson-meta-sidebar'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { VideoPlayer } from '@/components/mdx/video-player'
import { mdxComponents } from '@/components/mdx/mdx-components'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { buildLessonUrl, slugToTitle } from '@/lib/utils'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'

interface Props {
  params: {
    programSlug: string
    trackSlug: string
    moduleSlug: string
    lessonSlug: string
  }
  searchParams: { screen?: string }
}

export async function generateStaticParams() {
  return getAllLessonParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await getLesson(
    params.programSlug, params.trackSlug, params.moduleSlug, params.lessonSlug
  )
  if (!lesson) return { title: 'Lesson Not Found' }
  return {
    title: `${lesson.title} | MTR Pro Series`,
    description: lesson.description,
  }
}

export default async function LessonPage({ params, searchParams }: Props) {
  const { programSlug, trackSlug, moduleSlug, lessonSlug } = params

  const [lesson, program, track, module_] = await Promise.all([
    getLesson(programSlug, trackSlug, moduleSlug, lessonSlug),
    Promise.resolve(getProgram(programSlug)),
    Promise.resolve(getTrack(programSlug, trackSlug)),
    Promise.resolve(getModule(programSlug, trackSlug, moduleSlug)),
  ])

  if (!program) notFound()

  const allModules = getAllModules(programSlug, trackSlug)
  const sidebarModules = allModules.map((mod) => ({
    ...mod,
    lessons: getAllLessons(programSlug, trackSlug, mod.slug),
  }))

  // Load and split MDX into screens on --- dividers
  const lessonPath = path.join(
    process.cwd(), 'content', 'programs', programSlug,
    'tracks', trackSlug, 'modules', moduleSlug, 'lessons', `${lessonSlug}.mdx`
  )
  const rawFile = fs.existsSync(lessonPath) ? fs.readFileSync(lessonPath, 'utf-8') : null
  const { content: mdxContent } = rawFile ? matter(rawFile) : { content: '' }

  const screens = mdxContent
    ? mdxContent.split(/\r?\n---\r?\n/).map((s) => s.trim()).filter(Boolean)
    : []
  const totalScreens = Math.max(screens.length, 1)

  const screenParam = parseInt(searchParams?.screen ?? '0', 10)
  const currentScreen = isNaN(screenParam)
    ? 0
    : Math.min(Math.max(screenParam, 0), totalScreens - 1)
  const activeContent = screens[currentScreen] ?? ''

  const isFirstScreen = currentScreen === 0
  const isLastScreen = currentScreen === totalScreens - 1

  const baseUrl = buildLessonUrl(programSlug, trackSlug, moduleSlug, lessonSlug)
  const screenUrl = (n: number) => n === 0 ? baseUrl : `${baseUrl}?screen=${n}`

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 flex overflow-hidden bg-white dark:bg-neutral-900">

      {/* Left sidebar — track/module/lesson nav */}
      {track && (
        <LessonSidebar
          track={track}
          modules={sidebarModules}
          programSlug={programSlug}
          className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 h-[calc(100vh-4rem)]"
        />
      )}

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Scrollable area — breadcrumb, title, video, active screen content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-6">

            {/* Breadcrumb */}
            <Breadcrumb
              items={[
                { label: 'Programs', href: '/programs' },
                { label: program.title, href: `/programs/${programSlug}` },
                { label: track?.title ?? slugToTitle(trackSlug), href: `/programs/${programSlug}/tracks/${trackSlug}` },
                { label: module_?.title ?? slugToTitle(moduleSlug), href: `/programs/${programSlug}/tracks/${trackSlug}/modules/${moduleSlug}` },
                { label: lesson?.title ?? slugToTitle(lessonSlug) },
              ]}
              className="mb-6"
            />

            {/* Lesson title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
              {lesson?.title ?? slugToTitle(lessonSlug)}
            </h1>

            {/* Video player — first screen only */}
            {lesson?.videoId && isFirstScreen && (
              <VideoPlayer
                videoId={lesson.videoId}
                title={lesson.title}
                className="mb-6"
              />
            )}

            {/* Active screen MDX content */}
            {activeContent ? (
              <div className="prose max-w-none dark:prose-invert">
                <MDXRemote
                  source={activeContent}
                  components={mdxComponents}
                  options={{
                    mdxOptions: {
                      remarkPlugins: [remarkGfm],
                      rehypePlugins: [rehypeSlug, rehypeHighlight],
                    },
                  }}
                />
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 p-12 text-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Lesson content coming soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Fixed navigation bar ── */}
        <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">

            {/* Screen prev / counter / next */}
            <div className="flex items-center justify-between h-14">
              {/* Prev screen */}
              {!isFirstScreen ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={screenUrl(currentScreen - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Link>
                </Button>
              ) : (
                <div />
              )}

              {/* Screen counter */}
              {totalScreens > 1 && (
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Screen {currentScreen + 1} of {totalScreens}
                </span>
              )}

              {/* Next screen */}
              {!isLastScreen ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={screenUrl(currentScreen + 1)}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                <div />
              )}
            </div>

            {/* Lesson prev / next — only on last screen */}
            {isLastScreen && (
              <div className="flex items-start justify-between gap-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                {lesson?.prevLesson ? (
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[160px] sm:max-w-xs">
                      {lesson.prevLesson.title}
                    </span>
                    <Button variant="secondary" size="sm" asChild>
                      <Link
                        href={buildLessonUrl(
                          lesson.prevLesson.programSlug,
                          lesson.prevLesson.trackSlug,
                          lesson.prevLesson.moduleSlug,
                          lesson.prevLesson.slug
                        )}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div />
                )}

                {lesson?.nextLesson ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[160px] sm:max-w-xs">
                      {lesson.nextLesson.title}
                    </span>
                    <Button size="sm" asChild>
                      <Link
                        href={buildLessonUrl(
                          lesson.nextLesson.programSlug,
                          lesson.nextLesson.trackSlug,
                          lesson.nextLesson.moduleSlug,
                          lesson.nextLesson.slug
                        )}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">Track complete</span>
                    <Button size="sm" asChild>
                      <Link href={`/programs/${programSlug}/tracks/${trackSlug}/quiz`}>
                        <ClipboardList className="h-4 w-4 mr-1.5" />
                        Take Track Quiz
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar — desktop only */}
      {lesson && (
        <div className="hidden xl:block w-64 flex-shrink-0 overflow-y-auto p-5 h-[calc(100vh-4rem)] border-l border-neutral-200 dark:border-neutral-700">
          <LessonMetaSidebar lesson={lesson} />
        </div>
      )}
    </div>
  )
}
