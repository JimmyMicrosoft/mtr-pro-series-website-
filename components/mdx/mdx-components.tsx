import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Callout } from '@/components/ui/callout'
import { CodeBlock } from '@/components/ui/code-block'
import { KnowledgeCheck, Question, Answer, Explanation } from '@/components/mdx/knowledge-check'
import { VideoPlayer } from '@/components/mdx/video-player'
import { GlossaryTerm } from '@/components/mdx/glossary-term'
import { ExternalLink as ExternalLinkIcon, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Custom MDX Components ────────────────────────────────────────────────────

function ExternalLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 underline underline-offset-2"
      {...props}
    >
      {children}
      <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" aria-hidden />
    </a>
  )
}

function DownloadButton({
  href,
  label,
  filename,
}: {
  href: string
  label: string
  filename?: string
}) {
  return (
    <a
      href={href}
      download={filename ?? true}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
        'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
        'border border-neutral-200 dark:border-neutral-700',
        'hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors'
      )}
    >
      <Download className="h-4 w-4" />
      {label}
    </a>
  )
}

function LabEnvironment({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border-2 border-amber-200 dark:border-amber-800/50 overflow-hidden">
      <div className="bg-amber-50 dark:bg-amber-950/30 px-4 py-3 border-b border-amber-200 dark:border-amber-800/50">
        <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm flex items-center gap-2">
          🔬 {title ?? 'Lab Exercise'}
        </h3>
      </div>
      <div className="p-4 prose prose-sm max-w-none">{children}</div>
    </div>
  )
}

// ─── HTML element overrides ───────────────────────────────────────────────────

function MDXImage({
  src,
  alt,
  width,
  height,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  if (!src) return null
  return (
    <figure className="my-6">
      <Image
        src={src}
        alt={alt ?? ''}
        width={Number(width) || 800}
        height={Number(height) || 450}
        className="rounded-lg w-full h-auto"
        {...(props as object)}
      />
      {alt && (
        <figcaption className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-2 italic">
          {alt}
        </figcaption>
      )}
    </figure>
  )
}

function MDXLink({
  href = '',
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href.startsWith('http') || href.startsWith('//')
  if (isExternal) return <ExternalLink href={href} {...props}>{children}</ExternalLink>
  return (
    <Link href={href} className="text-primary-500 underline underline-offset-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" {...props}>
      {children}
    </Link>
  )
}

function MDXTable({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="w-full text-sm" {...props}>{children}</table>
    </div>
  )
}

// ─── Component map ────────────────────────────────────────────────────────────

export const mdxComponents = {
  // Custom components
  Callout,
  CodeBlock,
  KnowledgeCheck,
  Question,
  Answer,
  Explanation,
  VideoPlayer,
  GlossaryTerm,
  ExternalLink,
  DownloadButton,
  LabEnvironment,

  // HTML overrides
  img:    MDXImage,
  a:      MDXLink,
  table:  MDXTable,
  pre:    ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="rounded-xl overflow-x-auto bg-neutral-900 p-4 my-6 text-sm" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isBlock = className?.includes('language-')
    if (isBlock) return <code className={cn('font-mono text-sm', className)} {...props}>{children}</code>
    return (
      <code className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 text-primary-600 dark:text-primary-300 px-1.5 py-0.5 rounded" {...props}>
        {children}
      </code>
    )
  },
}
