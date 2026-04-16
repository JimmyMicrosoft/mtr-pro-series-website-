import Link from 'next/link'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'MTR Admin',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-neutral-900 text-lg">MTR Admin</span>
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            &larr; Back to site
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  )
}
