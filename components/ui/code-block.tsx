'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  children: string
  language?: string
  filename?: string
  className?: string
}

export function CodeBlock({ children, language, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative my-6 rounded-xl overflow-hidden border border-neutral-700', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-xs text-neutral-300 font-mono">{filename}</span>
          )}
          {language && (
            <span className="text-xs text-neutral-500 uppercase tracking-wide font-mono">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-4 overflow-x-auto bg-neutral-900 text-sm leading-relaxed">
        <code className="font-mono text-neutral-100 whitespace-pre">{children}</code>
      </pre>
    </div>
  )
}
