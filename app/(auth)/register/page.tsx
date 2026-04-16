'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { BookOpen, CheckCircle2 } from 'lucide-react'

const perks = [
  'Track progress across all 159 lessons',
  'Earn verifiable Open Badge credentials',
  'Access lab environments and exercises',
  'Get personalised learning recommendations',
]

export default function RegisterPage() {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)

    const form = e.currentTarget
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Registration failed.')
      setPending(false)
      return
    }

    // Auto sign-in after successful registration
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      // Account created but sign-in failed — send to login
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
  }

  async function handleMicrosoft() {
    setPending(true)
    await signIn('azure-ad', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start">
        {/* Left — value prop */}
        <div className="hidden md:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white mb-6">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Start your MTR training journey
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Join AV integrators building their Microsoft Teams Rooms expertise with the most comprehensive training platform available.
          </p>
          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="h-5 w-5 text-primary-500 flex-shrink-0" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 md:sr-only">
            Create your account
          </h2>
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
            {/* Microsoft SSO */}
            <button
              onClick={handleMicrosoft}
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="10" height="10" fill="#F25022"/>
                <rect x="11" width="10" height="10" fill="#7FBA00"/>
                <rect y="11" width="10" height="10" fill="#00A4EF"/>
                <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
              </svg>
              Sign up with Microsoft
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-xs text-neutral-400 bg-white dark:bg-neutral-800 px-2">or</div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">First name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    autoComplete="given-name"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Last name</label>
                  <input
                    type="text"
                    name="lastName"
                    autoComplete="family-name"
                    className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Work email</label>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  minLength={8}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Creating account…' : 'Create Free Account'}
              </Button>
            </form>
          </div>
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
