# MTR Pro Series — Website

Comprehensive AV integrator training platform for Microsoft Teams Rooms.

## Prerequisites

Before running the project you need:

1. **Node.js 18 or later** — Download from [nodejs.org](https://nodejs.org/en/download) (choose the LTS installer for Windows)
2. **A Supabase project** — Free at [supabase.com](https://supabase.com)
3. **A Microsoft Azure AD app registration** (for Microsoft SSO — optional for local dev)

---

## Quick Start

### 1. Install Node.js

Download and run the Windows LTS installer from [nodejs.org](https://nodejs.org/en/download).
After installation, open a new terminal and verify:

```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 10.x.x or higher
```

### 2. Install dependencies

```bash
cd C:\Users\jimmyvaughan\mtr-pro-series-website
npm install
```

### 3. Configure environment variables

Copy `.env.local` (already created) and fill in your real values:

```
# Supabase — get from supabase.com → your project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth — generate secret with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# Microsoft Entra ID (Azure AD) — optional for local dev
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=common

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Initialise the database

1. Open your Supabase project → **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run it

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Building for Production

```bash
npm run build
npm start
```

For deployment, Vercel is recommended:

```bash
npm install -g vercel
vercel
```

Set all `.env.local` variables as Vercel environment variables in the dashboard.

---

## Project Structure

```
mtr-pro-series-website/
├── app/                          # Next.js 14 App Router pages
│   ├── (auth)/                   # Login & register pages
│   ├── api/auth/[...nextauth]/   # NextAuth API route
│   ├── certifications/           # Badge/certification catalogue
│   ├── dashboard/                # Learner dashboard
│   ├── glossary/                 # Glossary A-Z + individual terms
│   ├── learning-paths/           # Role-based learning paths
│   ├── programs/                 # Program → Track → Module → Lesson
│   ├── search/                   # Site search
│   ├── globals.css               # Design tokens + base styles
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── layout/                   # Header, footer, sidebars, breadcrumb
│   ├── mdx/                      # KnowledgeCheck, VideoPlayer, GlossaryTerm
│   └── ui/                       # Button, Badge, Progress, Card, Callout…
│
├── content/                      # MDX lesson content files
│   └── programs/
│       └── mtr-foundations/
│           └── tracks/
│               └── mtr-ecosystem/
│                   ├── index.mdx                    # Track 1 overview
│                   └── modules/
│                       └── introduction-to-teams-rooms/
│                           ├── index.mdx            # Module 1.1 overview
│                           └── lessons/
│                               └── what-is-mtr.mdx  # Lesson 1.1.1 (sample)
│
├── lib/
│   ├── content.ts    # MDX file loading utilities
│   ├── supabase.ts   # Supabase client + progress helpers
│   └── utils.ts      # URL builders, formatting helpers
│
├── types/
│   └── content.ts    # TypeScript interfaces for all content types
│
├── supabase/
│   └── schema.sql    # Full database schema (run in Supabase SQL editor)
│
├── .env.local        # Environment variable template (fill in your values)
├── next.config.mjs   # Next.js + MDX configuration
├── tailwind.config.ts
└── tsconfig.json
```

---

## Adding Content

Content lives in `content/programs/` as MDX files. The URL structure mirrors the directory structure:

```
content/programs/[programSlug]/tracks/[trackSlug]/modules/[moduleSlug]/lessons/[lessonSlug].mdx
→ /programs/[programSlug]/tracks/[trackSlug]/modules/[moduleSlug]/lessons/[lessonSlug]
```

### Lesson MDX frontmatter

```yaml
---
lessonId: "LES-1.1.1"
title: "What is MTR?"
description: "Overview of Microsoft Teams Rooms"
programSlug: "mtr-foundations"
trackSlug: "mtr-ecosystem"
moduleSlug: "introduction-to-teams-rooms"
lessonSlug: "what-is-mtr"
duration: 30
contentType: "video-lesson"
difficulty: "beginner"
bloomsLevel: "remember"
personas: ["newcomer", "practitioner"]
learningObjectives:
  - "Define MTR and its role in modern meeting rooms"
prerequisites: []
topicTags: ["mtr-overview", "platform"]
---
```

### Lesson MDX components

```mdx
<VideoPlayer videoId="youtube-video-id" title="What is MTR?" />

<Callout type="tip">Your tip here</Callout>

<KnowledgeCheck
  questions={[
    {
      id: "q1",
      question: "What does MTR stand for?",
      options: ["A", "B", "C", "D"],
      correctIndex: 0,
      explanation: "MTR stands for Microsoft Teams Rooms."
    }
  ]}
/>
```

---

## Curriculum Overview

| Program | Tracks | Hours | Credential |
|---------|--------|-------|------------|
| MTR Foundations | 1–3 | 14–18 hrs | MTR Foundations Badge |
| MTR Systems Integration | 4–6 | 20–26 hrs | MTR Systems Integration Badge |
| MTR Advanced Deployment | 7–9 | 22–28 hrs | MTR Advanced Deployment Badge |
| MTR Practice Leadership | 10–12 | 18–22 hrs | MTR Practice Leader Badge |

**Total: 12 tracks · 159 lessons · 74–94 hours**

Full curriculum architecture is documented in:
`C:\Users\jimmyvaughan\.claude\projects\C--Users-jimmyvaughan--claude\mtr-pro-series\`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Content | MDX (next-mdx-remote/rsc) |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth.js v5 beta (Credentials + Microsoft Entra ID) |
| Icons | Lucide React |
| Search | Fuse.js (client-side) |
| Deployment | Vercel (recommended) |
