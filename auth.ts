import NextAuth from 'next-auth'
import AzureAD from 'next-auth/providers/azure-ad'
import Credentials from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID ?? 'common',
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const supabase = getAnonClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        })

        if (error || !data.user) return null

        return {
          id: data.user.id,
          email: data.user.email ?? '',
          name: data.user.user_metadata?.full_name ?? null,
          image: data.user.user_metadata?.avatar_url ?? null,
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    jwt({ token, user }) {
      if (user) token.userId = user.id
      return token
    },
    session({ session, token }) {
      if (token.userId) (session.user as { id: string }).id = token.userId as string
      return session
    },
  },

  pages: {
    signIn: '/login',
    newUser: '/register',
    error: '/login',
  },
})
