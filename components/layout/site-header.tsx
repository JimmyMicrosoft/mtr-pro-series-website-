'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Search, Menu, X, BookOpen, LogOut, LayoutDashboard } from 'lucide-react'

const navLinks = [
  { label: 'Programs', href: '/programs' },
  { label: 'Learning Paths', href: '/learning-paths' },
  { label: 'Certifications', href: '/certifications' },
  { label: 'Glossary', href: '/glossary' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const userMenuRef = React.useRef<HTMLDivElement>(null)

  const isAuthenticated = status === 'authenticated'
  const userName = session?.user?.name ?? session?.user?.email ?? ''
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  // Close user menu on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-[var(--z-header)] w-full',
        'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm',
        'border-b border-neutral-200 dark:border-neutral-700'
      )}
    >
      <div className="container-content flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg text-neutral-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <span className="hidden sm:block">
            MTR <span className="text-primary-500">Pro</span> Series
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'text-primary-500 bg-primary-50 dark:bg-primary-950/30'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="User menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white text-xs font-semibold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-[120px] truncate">
                    {session?.user?.name ?? session?.user?.email}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 animate-fade-in">
          <div className="container-content py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium',
                  pathname.startsWith(link.href)
                    ? 'text-primary-500 bg-primary-50 dark:bg-primary-950/30'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="secondary" size="sm" asChild className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }) }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" size="sm" asChild className="flex-1">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild className="flex-1">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
