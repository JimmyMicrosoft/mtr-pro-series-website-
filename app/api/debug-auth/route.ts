import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Temporary diagnostic route — remove after login is confirmed working
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: 'Missing env vars',
      url: url ? 'set' : 'MISSING',
      key: key ? 'set' : 'MISSING',
    })
  }

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } })
    // Try a simple auth call — will fail gracefully if keys are wrong
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test-diagnostic@example.com',
      password: 'not-a-real-password',
    })

    // "Invalid login credentials" is the expected error — means Supabase is reachable
    // Any other error (network, invalid API key, etc.) indicates a config problem
    return NextResponse.json({
      ok: true,
      supabaseReachable: true,
      expectedError: error?.message ?? null,
      urlPrefix: url.slice(0, 30),
      keyPrefix: key.slice(0, 20),
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      supabaseReachable: false,
      error: String(err),
    })
  }
}
