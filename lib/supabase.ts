import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (for client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client factory (for server components / API routes)
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  return createClient(supabaseUrl, serviceKey ?? supabaseAnonKey, {
    auth: { persistSession: false },
  })
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

export async function getLessonProgress(userId: string, lessonId: string) {
  const { data } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()
  return data
}

export async function markLessonComplete(userId: string, lessonId: string) {
  const { error } = await supabase.from('lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    completed: true,
    completed_at: new Date().toISOString(),
  })
  return !error
}

export async function getTrackProgress(userId: string, trackId: string) {
  const { data } = await supabase
    .from('track_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('track_id', trackId)
    .single()
  return data
}

export async function getUserBadges(userId: string) {
  const { data } = await supabase
    .from('badge_awards')
    .select('*')
    .eq('user_id', userId)
    .order('awarded_at', { ascending: false })
  return data ?? []
}
