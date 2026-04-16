import Link from 'next/link'
import { BookOpen } from 'lucide-react'

const footerLinks = {
  'Training': [
    { label: 'All Programs', href: '/programs' },
    { label: 'MTR Foundations', href: '/programs/mtr-foundations' },
    { label: 'Systems Integration', href: '/programs/mtr-systems-integration' },
    { label: 'Advanced Deployment', href: '/programs/mtr-advanced-deployment' },
    { label: 'Practice Leadership', href: '/programs/mtr-practice-leadership' },
  ],
  'Learning Paths': [
    { label: 'Junior Installer', href: '/learning-paths/junior-installer' },
    { label: 'AV Programmer', href: '/learning-paths/av-programmer' },
    { label: 'Remote Support', href: '/learning-paths/remote-support' },
    { label: 'Solutions Architect', href: '/learning-paths/solutions-architect' },
    { label: 'All Paths', href: '/learning-paths' },
  ],
  'Resources': [
    { label: 'Glossary', href: '/glossary' },
    { label: 'Certifications', href: '/certifications' },
    { label: 'Search', href: '/search' },
  ],
  'Account': [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 mt-auto">
      <div className="container-content py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white">
                <BookOpen className="h-4 w-4" />
              </div>
              <span>MTR Pro Series</span>
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Professional Microsoft Teams Rooms training for AV integrators.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-3">
                {group}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} MTR Pro Series. Built for AV integrators, by AV integrators.
          </p>
          <p className="text-xs text-neutral-400">
            Microsoft Teams Rooms® is a trademark of Microsoft Corporation.
          </p>
        </div>
      </div>
    </footer>
  )
}
