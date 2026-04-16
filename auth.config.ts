import type { NextAuthConfig } from 'next-auth'

// Edge-compatible auth config — no provider imports that use Node.js APIs.
// Used by middleware.ts. Full providers are added in auth.ts.
export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.userId = user.id
      return token
    },
    session({ session, token }) {
      if (token.userId) (session.user as { id?: string }).id = token.userId as string
      return session
    },
  },
} satisfies NextAuthConfig
