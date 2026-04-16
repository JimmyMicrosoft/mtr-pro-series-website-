// ─────────────────────────────────────────────────────────────────────────────
// MTR Pro Series — Content Type Definitions
// Mirrors Phase 4 metadata schema exactly
// ─────────────────────────────────────────────────────────────────────────────

export type PersonaLevel = 'newcomer' | 'practitioner' | 'specialist' | 'expert'
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type ContentType = 'video' | 'lab' | 'reading' | 'assessment' | 'mixed'

export interface ProgramFrontmatter {
  id: string                    // e.g. "PROG-1"
  slug: string                  // e.g. "mtr-foundations"
  title: string
  subtitle: string
  description: string
  level: DifficultyLevel
  personaPrimary: PersonaLevel
  personaSecondary: PersonaLevel
  trackCount: number
  moduleCount: number
  lessonCount: number
  estimatedHoursMin: number
  estimatedHoursMax: number
  credential: string            // badge name
  prerequisites: string[]       // program IDs
  lastUpdated: string           // ISO date
  version: string               // semver
  order: number
}

export interface TrackFrontmatter {
  id: string                    // e.g. "TRK-1"
  slug: string
  title: string
  description: string
  programId: string
  programSlug: string
  level: DifficultyLevel
  persona: PersonaLevel[]
  estimatedHoursMin: number
  estimatedHoursMax: number
  prerequisites: string[]       // track IDs
  moduleCount: number
  lessonCount: number
  order: number
  lastUpdated: string
  version: string
}

export interface ModuleFrontmatter {
  id: string                    // e.g. "MOD-1.1"
  slug: string
  title: string
  description: string
  programId: string
  programSlug: string
  trackId: string
  trackSlug: string
  level: DifficultyLevel
  estimatedMinutes: number
  lessonCount: number
  prerequisites: string[]       // module IDs
  order: number
  lastUpdated: string
  version: string
}

export interface LessonFrontmatter {
  id: string                    // e.g. "LES-1.1.1"
  slug: string
  title: string
  description: string
  programId: string
  programSlug: string
  trackId: string
  trackSlug: string
  moduleId: string
  moduleSlug: string
  level: DifficultyLevel
  bloomLevel: BloomLevel
  estimatedMinutes: number
  contentType: ContentType
  personaTags: PersonaLevel[]
  technologyTags: string[]
  topicTags: string[]
  vendorTags: string[]
  prerequisites: string[]       // lesson IDs
  learningObjectives: string[]
  tools: string[]
  videoId?: string              // YouTube or Vimeo ID
  order: number
  lastUpdated: string
  version: string
}

export interface GlossaryEntryFrontmatter {
  term: string
  slug: string
  shortDefinition: string
  category: string
  relatedTerms: string[]
  appearsInLessons: string[]    // lesson IDs
  lastUpdated: string
}

// ─── Hydrated content objects (frontmatter + derived fields) ─────────────────

export interface Program extends ProgramFrontmatter {
  tracks?: Track[]
}

export interface Track extends TrackFrontmatter {
  modules?: Module[]
}

export interface Module extends ModuleFrontmatter {
  lessons?: Lesson[]
}

export interface Lesson extends LessonFrontmatter {
  content?: string              // serialized MDX
  nextLesson?: LessonNavItem
  prevLesson?: LessonNavItem
}

export interface LessonNavItem {
  slug: string
  title: string
  moduleSlug: string
  trackSlug: string
  programSlug: string
}

// ─── Learning paths ──────────────────────────────────────────────────────────

export interface LearningPath {
  slug: string
  title: string
  persona: PersonaLevel
  role: string
  description: string
  estimatedHours: number
  tracks: string[]              // track IDs in order
  programIds: string[]
}

// ─── Badge / certification ───────────────────────────────────────────────────

export interface Badge {
  id: string
  slug: string
  title: string
  description: string
  programId?: string
  specialization?: string
  requirements: string[]
  estimatedHours: number
  validityMonths: number
  imageUrl: string
}
