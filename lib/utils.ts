import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bMtr\b/g, 'MTR')
    .replace(/\bAv\b/g, 'AV')
    .replace(/\bXml\b/g, 'XML')
    .replace(/\bQos\b/g, 'QoS')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function buildLessonUrl(
  programSlug: string,
  trackSlug: string,
  moduleSlug: string,
  lessonSlug: string
): string {
  return `/programs/${programSlug}/tracks/${trackSlug}/modules/${moduleSlug}/lessons/${lessonSlug}`
}

export function buildModuleUrl(
  programSlug: string,
  trackSlug: string,
  moduleSlug: string
): string {
  return `/programs/${programSlug}/tracks/${trackSlug}/modules/${moduleSlug}`
}

export function buildTrackUrl(programSlug: string, trackSlug: string): string {
  return `/programs/${programSlug}/tracks/${trackSlug}`
}

export function buildProgramUrl(programSlug: string): string {
  return `/programs/${programSlug}`
}
