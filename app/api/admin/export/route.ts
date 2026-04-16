import { auth } from '@/auth'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

export const dynamic = 'force-dynamic'

// ── Auth guard ────────────────────────────────────────────────────────────────

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return false
  }
  return true
}

// ── File helpers ──────────────────────────────────────────────────────────────

const isDir = (p: string) => { try { return statSync(p).isDirectory() } catch { return false } }
const ls = (p: string): string[] => { try { return readdirSync(p) } catch { return [] } }
const cap = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

// ── Border helpers ────────────────────────────────────────────────────────────

function noBorder() {
  return { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
}

function solidBorder(color: string, size = 4) {
  return { style: BorderStyle.SINGLE, size, color }
}

function boxedTable({ borderColor, fill, margins = {}, children }: {
  borderColor: string
  fill: string
  margins?: Record<string, number>
  children: (Paragraph | Table)[]
}) {
  const b = solidBorder(borderColor)
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: b, bottom: b, left: b, right: b, insideHorizontal: noBorder(), insideVertical: noBorder() },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill, color: 'auto' },
        margins: { top: 100, bottom: 100, left: 180, right: 180, ...margins },
        children,
      })],
    })],
  })
}

// ── Inline formatting ─────────────────────────────────────────────────────────

function inlineRuns(raw: string): TextRun[] {
  let text = raw
    .replace(/<GlossaryTerm[^>]*>([^<]+)<\/GlossaryTerm>/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')

  const runs: TextRun[] = []
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+?)`)/g
  let lastIdx = 0
  let m: RegExpExecArray | null

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > lastIdx) runs.push(new TextRun({ text: text.slice(lastIdx, m.index) }))
    if (m[2]) runs.push(new TextRun({ text: m[2], bold: true }))
    else if (m[3]) runs.push(new TextRun({ text: m[3], italics: true }))
    else if (m[4]) runs.push(new TextRun({
      text: m[4],
      font: { name: 'Courier New' },
      size: 18,
      shading: { type: ShadingType.CLEAR, fill: 'F3F4F6', color: 'auto' },
    }))
    lastIdx = m.index + m[0].length
  }

  if (lastIdx < text.length) runs.push(new TextRun({ text: text.slice(lastIdx) }))
  return runs.length ? runs : [new TextRun({ text })]
}

// ── Placeholder builders ──────────────────────────────────────────────────────

function videoPlaceholder(lessonId: string, idx: number, suggestion = ''): (Paragraph | Table)[] {
  const children: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({ text: '🎥  VIDEO', bold: true, color: '7C3AED', size: 20 }),
        new TextRun({ text: `  [id: ${lessonId}-vid-${idx}]`, color: '9CA3AF', size: 16 }),
      ],
    }),
  ]
  if (suggestion) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `Suggestion: ${suggestion}`, italics: true, color: '6B7280', size: 18 })],
      spacing: { before: 40 },
    }))
  }
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Platform (circle one):  youtube  /  vimeo', size: 18, color: '374151' })],
      spacing: { before: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Video ID:  ___________________________________', size: 18, color: '374151' })],
      spacing: { before: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Title:  ______________________________________', size: 18, color: '374151' })],
      spacing: { before: 60 },
    }),
  )
  return [
    boxedTable({ borderColor: '7C3AED', fill: 'F5F3FF', children }),
    new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
  ]
}

function imagePlaceholder(lessonId: string, idx: number, suggestion = ''): (Paragraph | Table)[] {
  const children: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({ text: '📷  IMAGE', bold: true, color: '0078D4', size: 20 }),
        new TextRun({ text: `  [id: ${lessonId}-img-${idx}]`, color: '9CA3AF', size: 16 }),
      ],
    }),
  ]
  if (suggestion) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `Suggestion: ${suggestion}`, italics: true, color: '6B7280', size: 18 })],
      spacing: { before: 40 },
    }))
  }
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '→ Drop image below, or paste URL:', size: 18, color: '374151' })],
      spacing: { before: 60 },
    }),
    new Paragraph({ text: '', spacing: { before: 160 } }),
    new Paragraph({ text: '', spacing: { before: 160 } }),
  )
  return [
    boxedTable({ borderColor: '0078D4', fill: 'EFF6FF', children }),
    new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
  ]
}

// ── Component renderers ───────────────────────────────────────────────────────

function calloutBox(type: string, bodyLines: string[]): (Paragraph | Table)[] {
  const styles: Record<string, { border: string; fill: string; label: string; text: string }> = {
    tip:     { border: '10B981', fill: 'ECFDF5', label: '💡 TIP',       text: '065F46' },
    warning: { border: 'F59E0B', fill: 'FFFBEB', label: '⚠️  WARNING',   text: '92400E' },
    info:    { border: '0078D4', fill: 'EFF6FF', label: 'ℹ️  NOTE',      text: '1E40AF' },
    note:    { border: '0078D4', fill: 'EFF6FF', label: 'ℹ️  NOTE',      text: '1E40AF' },
    danger:  { border: 'EF4444', fill: 'FEF2F2', label: '🚫 IMPORTANT', text: '991B1B' },
  }
  const s = styles[type] ?? styles.info

  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: s.label, bold: true, color: s.text, size: 18 })],
      spacing: { after: 60 },
    }),
    ...bodyLines
      .filter(Boolean)
      .map((l) => new Paragraph({
        children: inlineRuns(l),
        spacing: { before: 40, after: 40 },
      })),
  ]

  return [
    boxedTable({ borderColor: s.border, fill: s.fill, children }),
    new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
  ]
}

function knowledgeCheckBox(kcLines: string[]): (Paragraph | Table)[] {
  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: '🧠  KNOWLEDGE CHECK', bold: true, color: 'B45309', size: 18 })],
      spacing: { after: 80 },
    }),
  ]

  let accumQ = ''
  let collectingQ = false
  let accumExp = ''
  let collectingExp = false

  for (const raw of kcLines) {
    const l = raw.trim()
    if (!l || l === '<KnowledgeCheck>' || l.startsWith('<KnowledgeCheck ') || l === '</KnowledgeCheck>') continue

    const qAttr = l.match(/<Question\s+text="([^"]+)"/)
    if (qAttr) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Q: ', bold: true }), new TextRun({ text: qAttr[1] })],
        spacing: { before: 100, after: 40 },
      }))
      continue
    }

    if (l === '<Question>' || l === '<Question >') { collectingQ = true; accumQ = ''; continue }
    if (collectingQ) {
      if (l === '</Question>') {
        collectingQ = false
        if (accumQ.trim()) children.push(new Paragraph({
          children: [new TextRun({ text: 'Q: ', bold: true }), new TextRun({ text: accumQ.trim() })],
          spacing: { before: 100, after: 40 },
        }))
        accumQ = ''
      } else {
        accumQ += ' ' + l
      }
      continue
    }

    if (l.startsWith('<Answer')) {
      const correct = /\bcorrect\b/.test(l)
      const text = l.replace(/<Answer[^>]*>/, '').replace(/<\/Answer>/, '').trim()
      if (text) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: correct ? '✓  ' : '○  ', bold: correct, color: correct ? '059669' : '374151' }),
            new TextRun({ text, bold: correct, color: correct ? '059669' : '374151' }),
          ],
          indent: { left: 360 },
          spacing: { before: 40, after: 40 },
        }))
      }
      continue
    }
    if (l === '</Answer>') continue

    if (l.startsWith('<Explanation>') || l === '<Explanation>') {
      collectingExp = true
      accumExp = l.replace('<Explanation>', '').replace('</Explanation>', '').trim()
      if (l.includes('</Explanation>')) {
        collectingExp = false
        if (accumExp) children.push(new Paragraph({
          children: [
            new TextRun({ text: 'Explanation: ', bold: true, italics: true, size: 18, color: '6B7280' }),
            new TextRun({ text: accumExp, italics: true, size: 18, color: '6B7280' }),
          ],
          spacing: { before: 80, after: 40 },
        }))
        accumExp = ''
      }
      continue
    }
    if (collectingExp) {
      if (l.includes('</Explanation>')) {
        accumExp += ' ' + l.replace('</Explanation>', '').trim()
        collectingExp = false
        if (accumExp.trim()) children.push(new Paragraph({
          children: [
            new TextRun({ text: 'Explanation: ', bold: true, italics: true, size: 18, color: '6B7280' }),
            new TextRun({ text: accumExp.trim(), italics: true, size: 18, color: '6B7280' }),
          ],
          spacing: { before: 80, after: 40 },
        }))
        accumExp = ''
      } else {
        accumExp += ' ' + l
      }
      continue
    }

    if (l.startsWith('<') || l.startsWith('/>') || l === '>') continue

    if (l) {
      children.push(new Paragraph({
        children: [new TextRun({ text: l, size: 20 })],
        indent: { left: 200 },
        spacing: { before: 30, after: 30 },
      }))
    }
  }

  return [
    boxedTable({ borderColor: 'F59E0B', fill: 'FFFBEB', children }),
    new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
  ]
}

function markdownTable(tableLines: string[]): (Paragraph | Table)[] {
  const rows = tableLines.filter((l) => !/^\|[-:\s|]+\|$/.test(l))
  if (!rows.length) return []

  const docRows = rows.map((row, rowIdx) => {
    const cells = row.split('|').slice(1, -1).map((c) => c.trim())
    return new TableRow({
      tableHeader: rowIdx === 0,
      children: cells.map((cellText) => new TableCell({
        shading: rowIdx === 0 ? { type: ShadingType.CLEAR, fill: 'F9FAFB', color: 'auto' } : undefined,
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ children: inlineRuns(cellText) })],
      })),
    })
  })

  return [
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: docRows }),
    new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
  ]
}

function codeBlock(code: string): (Paragraph | Table)[] {
  const lines = code.split('\n')
  return [
    boxedTable({
      borderColor: 'D1D5DB',
      fill: '1F2937',
      margins: { top: 100, bottom: 100, left: 200, right: 200 },
      children: lines.map((l) => new Paragraph({
        children: [new TextRun({ text: l || ' ', font: { name: 'Courier New' }, size: 18, color: 'D1FAE5' })],
        spacing: { before: 20, after: 20 },
      })),
    }),
    new Paragraph({ text: '', spacing: { before: 80, after: 80 } }),
  ]
}

function lessonMarker(id: string): (Paragraph | Table)[] {
  return [
    boxedTable({
      borderColor: '111827',
      fill: '111827',
      margins: { top: 80, bottom: 80, left: 200, right: 200 },
      children: [new Paragraph({
        children: [new TextRun({
          text: `▌ LESSON ID: ${id}`,
          bold: true,
          color: 'F9FAFB',
          size: 18,
          font: { name: 'Courier New' },
        })],
      })],
    }),
    new Paragraph({ text: '', spacing: { before: 60, after: 60 } }),
  ]
}

// ── MDX body → docx elements ──────────────────────────────────────────────────

function parseBody(mdx: string, lessonId: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []
  const lines = mdx.split('\n')
  const hasMediaComments = /\{\/\*[\s\S]*?MEDIA:/i.test(mdx)
  let i = 0
  let imgCount = 0
  let vidCount = 0

  function collectComponent(startLine: string, closingTag?: string): string {
    let text = startLine
    if (!startLine.includes('/>') && !startLine.includes(closingTag ?? '</XXX>')) {
      i++
      while (i < lines.length) {
        const l = lines[i].trim()
        text += ' ' + l
        if (l.includes('/>') || (closingTag && l.includes(closingTag))) break
        i++
      }
    }
    return text
  }

  while (i < lines.length) {
    const raw = lines[i]
    const trimmed = raw.trim()

    if (!trimmed) { i++; continue }

    // JSX/MDX comments
    if (trimmed.startsWith('{/*')) {
      const commentLines = [trimmed]
      if (!trimmed.includes('*/}')) {
        i++
        while (i < lines.length) {
          const cl = lines[i].trim()
          commentLines.push(cl)
          i++
          if (cl.includes('*/}')) break
        }
      } else {
        i++
      }
      const full = commentLines.join(' ')
      if (/MEDIA:/i.test(full)) {
        const isVideo = /video|mp4|youtube|vimeo|screencast/i.test(full)
        const suggestion = full
          .replace(/\{\/\*\s*/g, '')
          .replace(/\*\/\}/g, '')
          .replace(/MEDIA:\s*[\w-]+\s*[—–-]?\s*/i, '')
          .replace(/Width:\s*\d+px.*$/i, '')
          .replace(/Filename:\s*\S+.*$/i, '')
          .replace(/Format:\s*\w+.*$/i, '')
          .replace(/\s+/g, ' ')
          .trim()
        if (isVideo) {
          vidCount++
          elements.push(...videoPlaceholder(lessonId, vidCount, suggestion))
        } else {
          imgCount++
          elements.push(...imagePlaceholder(lessonId, imgCount, suggestion))
        }
      }
      continue
    }

    // Horizontal rule
    if (trimmed === '---') {
      elements.push(new Paragraph({
        children: [new TextRun({ text: '' })],
        border: { bottom: solidBorder('E5E7EB', 3) },
        spacing: { before: 160, after: 160 },
      }))
      i++; continue
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      elements.push(new Paragraph({ text: trimmed.slice(5), heading: HeadingLevel.HEADING_4, spacing: { before: 160, after: 60 } }))
      i++; continue
    }
    if (trimmed.startsWith('### ')) {
      elements.push(new Paragraph({ text: trimmed.slice(4), heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 } }))
      i++; continue
    }
    if (trimmed.startsWith('## ')) {
      elements.push(new Paragraph({ text: trimmed.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 80 } }))
      if (!hasMediaComments) {
        imgCount++
        elements.push(...imagePlaceholder(lessonId, imgCount))
      }
      i++; continue
    }
    if (trimmed.startsWith('# ')) {
      elements.push(new Paragraph({ text: trimmed.slice(2), heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 100 } }))
      i++; continue
    }

    // Bullet list
    if (/^[-*] /.test(trimmed)) {
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) {
        const nested = lines[i].startsWith('  ') || lines[i].startsWith('\t')
        const text = lines[i].trim().replace(/^[-*] /, '')
        elements.push(new Paragraph({
          children: [new TextRun({ text: nested ? '        ◦   ' : '•   ' }), ...inlineRuns(text)],
          indent: { left: nested ? 720 : 400, hanging: 360 },
          spacing: { before: 40, after: 40 },
        }))
        i++
      }
      continue
    }

    // Numbered list
    if (/^\d+\. /.test(trimmed)) {
      let num = 1
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) {
        const text = lines[i].trim().replace(/^\d+\. /, '')
        elements.push(new Paragraph({
          children: [new TextRun({ text: `${num}.   ` }), ...inlineRuns(text)],
          indent: { left: 400, hanging: 360 },
          spacing: { before: 40, after: 40 },
        }))
        i++; num++
      }
      continue
    }

    // Markdown table
    if (trimmed.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      elements.push(...markdownTable(tableLines))
      continue
    }

    // Code fence
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      elements.push(...codeBlock(codeLines.join('\n')))
      continue
    }

    // <Callout>
    if (trimmed.startsWith('<Callout')) {
      const typeMatch = trimmed.match(/type="([^"]+)"/)
      const calloutType = typeMatch?.[1] ?? 'info'
      const bodyLines: string[] = []
      i++
      while (i < lines.length && !lines[i].includes('</Callout>')) {
        bodyLines.push(lines[i].trim())
        i++
      }
      i++
      elements.push(...calloutBox(calloutType, bodyLines))
      continue
    }

    // <KnowledgeCheck>
    if (trimmed.startsWith('<KnowledgeCheck')) {
      const kcLines = [trimmed]
      i++
      while (i < lines.length && !lines[i].trim().startsWith('</KnowledgeCheck>')) {
        kcLines.push(lines[i])
        i++
      }
      kcLines.push('</KnowledgeCheck>')
      i++
      elements.push(...knowledgeCheckBox(kcLines))
      continue
    }

    // <LabEnvironment>
    if (trimmed.startsWith('<LabEnvironment')) {
      const titleMatch = trimmed.match(/title="([^"]+)"/)
      const labTitle = titleMatch?.[1] ?? 'Lab Exercise'
      const labLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('</LabEnvironment>')) {
        labLines.push(lines[i].trim())
        i++
      }
      i++
      elements.push(...calloutBox('warning', [`🔬 ${labTitle}`, ...labLines]))
      continue
    }

    // <DownloadButton>
    if (trimmed.startsWith('<DownloadButton')) {
      const componentText = collectComponent(trimmed, '</DownloadButton>')
      i++
      const labelMatch = componentText.match(/label="([^"]+)"/)
      const sizeMatch = componentText.match(/sizeKb=\{?(\d+)\}?/)
      elements.push(new Paragraph({
        children: [
          new TextRun({ text: '📥  Download: ', bold: true, color: '0078D4' }),
          new TextRun({ text: labelMatch?.[1] ?? 'File' }),
          sizeMatch ? new TextRun({ text: `  (${sizeMatch[1]} KB)`, italics: true, color: '9CA3AF', size: 18 }) : new TextRun({ text: '' }),
        ],
        spacing: { before: 80, after: 80 },
      }))
      continue
    }

    // <VideoPlayer>
    if (trimmed.startsWith('<VideoPlayer')) {
      const componentText = collectComponent(trimmed)
      i++
      const vidIdMatch = componentText.match(/videoId="([^"]+)"/)
      const titleMatch = componentText.match(/title="([^"]+)"/)
      if (vidIdMatch && vidIdMatch[1] && vidIdMatch[1] !== 'PLACEHOLDER') {
        elements.push(new Paragraph({
          children: [
            new TextRun({ text: '🎥  Video: ', bold: true, color: '7C3AED' }),
            new TextRun({ text: vidIdMatch[1] }),
            titleMatch ? new TextRun({ text: `  — ${titleMatch[1]}`, italics: true, color: '6B7280' }) : new TextRun({ text: '' }),
          ],
          spacing: { before: 80, after: 80 },
        }))
      }
      continue
    }

    // Skip other JSX tags
    if ((trimmed.startsWith('<') && (trimmed.endsWith('>') || trimmed.endsWith('/>'))) ||
        trimmed.startsWith('</') || trimmed === '/>') {
      i++; continue
    }

    // Regular paragraph
    elements.push(new Paragraph({
      children: inlineRuns(trimmed),
      spacing: { before: 80, after: 80 },
    }))
    i++
  }

  return elements
}

// ── Track / program titles ────────────────────────────────────────────────────

const TRACK_TITLES: Record<string, string> = {
  'mtr-ecosystem':                'Track 1: The MTR Ecosystem',
  'physical-installation':        'Track 2: Physical Installation',
  'device-configuration':         'Track 3: Device Configuration',
  'network-infrastructure-qos':   'Track 4: Network Infrastructure and QoS',
  'microsoft-365-administration': 'Track 5: Microsoft 365 Administration',
  'av-systems-commissioning':     'Track 6: AV Systems Commissioning',
  'enterprise-scale-management':  'Track 7: Enterprise Scale Management',
  'troubleshooting-diagnostics':  'Track 8: Troubleshooting and Diagnostics',
  'powershell-graph-automation':  'Track 9: PowerShell and Graph Automation',
  'project-delivery-lifecycle':   'Track 10: Project Delivery Lifecycle',
  'solution-architecture-presales': 'Track 11: Solution Architecture and Pre-Sales',
  'practice-operations':          'Track 12: Practice Operations',
}

const PROGRAM_TITLES: Record<string, string> = {
  'mtr-foundations':         'Program 1: MTR Foundations',
  'mtr-systems-integration': 'Program 2: MTR Systems Integration',
  'mtr-advanced-deployment': 'Program 3: MTR Advanced Deployment',
  'mtr-practice-leadership': 'Program 4: MTR Practice Leadership',
}

const trackTitle  = (s: string) => TRACK_TITLES[s]   ?? s.split('-').map(cap).join(' ')
const programTitle = (s: string) => PROGRAM_TITLES[s] ?? s.split('-').map(cap).join(' ')

// ── Quiz section builder ──────────────────────────────────────────────────────

interface QuizQuestion {
  id: number
  text: string
  answers: string[]
  correct: number
  explanation: string
}

interface QuizData {
  questions: QuizQuestion[]
  passingScore: number
}

function buildQuizSection(quizData: QuizData): (Paragraph | Table)[] {
  const { questions, passingScore } = quizData
  const children: (Paragraph | Table)[] = []

  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      children: [new TextRun({ text: '🧠  TRACK QUIZ', bold: true, color: '7C3AED', size: 32 })],
      spacing: { before: 0, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `${questions.length} questions  •  Pass mark: ${passingScore}/${questions.length}  •  Edit questions and answers below, then return this document`, size: 18, color: '6B7280' })],
      spacing: { before: 0, after: 200 },
    }),
  )

  const borderConfig = { style: BorderStyle.SINGLE, size: 4, color: '7C3AED' }
  const noBorderStyle = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }

  for (const q of questions) {
    const answerRows = q.answers.map((answer, idx) => {
      const isCorrect = idx === q.correct
      return new Paragraph({
        children: [
          new TextRun({ text: isCorrect ? `✓  ${String.fromCharCode(65 + idx)}.  ` : `    ${String.fromCharCode(65 + idx)}.  `, bold: isCorrect, color: isCorrect ? '059669' : '374151', size: 18 }),
          new TextRun({ text: answer, bold: isCorrect, color: isCorrect ? '059669' : '374151', size: 18 }),
        ],
        indent: { left: 360 },
        spacing: { before: 40, after: 40 },
      })
    })

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: borderConfig, bottom: borderConfig, left: borderConfig, right: borderConfig, insideHorizontal: noBorderStyle, insideVertical: noBorderStyle },
        rows: [new TableRow({
          children: [new TableCell({
            shading: { type: ShadingType.CLEAR, fill: 'F5F3FF', color: 'auto' },
            margins: { top: 100, bottom: 100, left: 200, right: 200 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Q${q.id}.  `, bold: true, color: '7C3AED', size: 20 }),
                  new TextRun({ text: q.text, bold: true, size: 20 }),
                ],
                spacing: { after: 80 },
              }),
              ...answerRows,
              new Paragraph({
                children: [new TextRun({ text: `Explanation: ${q.explanation}`, italics: true, size: 17, color: '6B7280' })],
                spacing: { before: 80, after: 0 },
              }),
            ],
          })],
        })],
      }),
      new Paragraph({ text: '', spacing: { before: 100, after: 0 } }),
    )
  }

  return children
}

// ── Lesson data types ─────────────────────────────────────────────────────────

interface LessonData {
  id: string
  title: string
  moduleTitle: string
  lessonIndex: number
  module: number
  duration: number
  difficulty: string
  bloomLevel: string
  contentTypes: string[]
  objectives: string[]
  body: string
}

// ── Document builder ──────────────────────────────────────────────────────────

async function buildTrackDocument(programSlug: string, tSlug: string, lessons: LessonData[], contentDir: string) {
  const children: (Paragraph | Table)[] = []
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  // Cover
  children.push(
    new Paragraph({ children: [new TextRun({ text: 'MTR Pro Series', bold: true, size: 28, color: '0078D4' })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
    new Paragraph({ children: [new TextRun({ text: programTitle(programSlug), size: 22, color: '6B7280' })], alignment: AlignmentType.CENTER, spacing: { after: 80 } }),
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: trackTitle(tSlug) })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: `${lessons.length} lessons  •  Exported ${today}`, size: 18, color: '9CA3AF' })], alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
  )

  // Table of contents
  children.push(new Paragraph({ children: [new TextRun({ text: 'Contents', bold: true, size: 24 })], spacing: { before: 200, after: 120 } }))
  let lastModule: string | null = null
  for (const l of lessons) {
    if (l.moduleTitle !== lastModule) {
      lastModule = l.moduleTitle
      children.push(new Paragraph({
        children: [new TextRun({ text: l.moduleTitle ?? '', bold: true, size: 20, color: '374151' })],
        spacing: { before: 120, after: 40 },
      }))
    }
    children.push(new Paragraph({
      children: [
        new TextRun({ text: '    ' }),
        new TextRun({ text: `${l.lessonIndex}. `, color: '9CA3AF', size: 18 }),
        new TextRun({ text: l.title ?? '', size: 18 }),
        new TextRun({ text: `  [${l.id}]`, color: 'D1D5DB', size: 16 }),
      ],
      spacing: { before: 40, after: 40 },
    }))
  }

  // Lessons
  for (let li = 0; li < lessons.length; li++) {
    const lesson = lessons[li]

    if (li > 0) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    children.push(...lessonMarker(lesson.id))

    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: lesson.title ?? '' })], spacing: { before: 0, after: 80 } }),
      new Paragraph({ children: [new TextRun({ text: lesson.moduleTitle ?? '', italics: true, color: '6B7280', size: 18 })], spacing: { before: 0, after: 160 } }),
    )

    const metaLine = [
      `Duration: ${lesson.duration ?? 0} min`,
      `Difficulty: ${cap(lesson.difficulty ?? '')}`,
      `Bloom Level: ${cap(lesson.bloomLevel ?? '')}`,
      `Type: ${(lesson.contentTypes ?? []).join(', ')}`,
    ].join('   |   ')

    const objParagraphs: Paragraph[] = (lesson.objectives ?? []).length > 0 ? [
      new Paragraph({ children: [new TextRun({ text: 'Learning Objectives:', bold: true, size: 18 })], spacing: { before: 80, after: 40 } }),
      ...(lesson.objectives ?? []).map((obj) => new Paragraph({
        children: [new TextRun({ text: '•   ', size: 18 }), new TextRun({ text: obj, size: 18 })],
        indent: { left: 360, hanging: 320 },
        spacing: { before: 30, after: 30 },
      })),
    ] : []

    children.push(
      boxedTable({
        borderColor: 'D1D5DB',
        fill: 'F9FAFB',
        children: [
          new Paragraph({ children: [new TextRun({ text: metaLine, size: 18, color: '374151' })] }),
          ...objParagraphs,
        ],
      }),
      new Paragraph({ text: '', spacing: { before: 160, after: 0 } }),
    )

    children.push(...videoPlaceholder(lesson.id, 1))
    children.push(...parseBody(lesson.body ?? '', lesson.id))
  }

  // Quiz section
  try {
    const quizPath = join(contentDir, programSlug, 'tracks', tSlug, 'quiz.json')
    const quizData = JSON.parse(readFileSync(quizPath, 'utf-8')) as QuizData
    children.push(...buildQuizSection(quizData))
  } catch { /* no quiz file — skip */ }

  return new Document({
    creator: 'MTR Pro Series Export',
    title: `${trackTitle(tSlug)} — Content Review`,
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
          paragraph: { spacing: { line: 276, lineRule: 'auto' } },
        },
        heading1: { run: { font: 'Calibri', bold: true, size: 32, color: '111827' } },
        heading2: { run: { font: 'Calibri', bold: true, size: 26, color: '1D4ED8' } },
        heading3: { run: { font: 'Calibri', bold: true, size: 22, color: '374151' } },
        heading4: { run: { font: 'Calibri', bold: true, size: 20, color: '6B7280' } },
        title:    { run: { font: 'Calibri', bold: true, size: 48, color: '111827' } },
      },
    },
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } },
      },
      children,
    }],
  })
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  if (!(await checkAdmin())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const programSlug = searchParams.get('program')
  const trackSlug = searchParams.get('track')

  if (!programSlug || !trackSlug) {
    return Response.json({ error: 'Missing program or track query param' }, { status: 400 })
  }

  // Content dir is relative to project root (process.cwd() in Next.js)
  const contentDir = join(process.cwd(), 'content', 'programs')
  const tracksDir = join(contentDir, programSlug, 'tracks')
  const modulesDir = join(tracksDir, trackSlug, 'modules')

  const moduleSlugs = ls(modulesDir).filter((f) => isDir(join(modulesDir, f)))

  if (!moduleSlugs.length) {
    return Response.json({ error: 'Track not found or has no modules' }, { status: 404 })
  }

  const lessons: LessonData[] = []

  for (const mSlug of moduleSlugs) {
    // Read module title
    let moduleTitle = mSlug
    try {
      const moduleIndexPath = join(modulesDir, mSlug, 'index.mdx')
      const moduleRaw = readFileSync(moduleIndexPath, 'utf-8')
      const { data: moduleData } = matter(moduleRaw)
      moduleTitle = moduleData.title ?? mSlug
    } catch { /* use slug as fallback */ }

    const lessonsDir = join(modulesDir, mSlug, 'lessons')
    const lessonFiles = ls(lessonsDir).filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')

    for (const file of lessonFiles) {
      try {
        const raw = readFileSync(join(lessonsDir, file), 'utf-8')
        const { data, content } = matter(raw)
        if (!data.id) continue
        lessons.push({
          id: data.id,
          title: data.title ?? file.replace('.mdx', ''),
          moduleTitle,
          lessonIndex: data.lessonIndex ?? 0,
          module: data.module ?? 0,
          duration: data.duration ?? 0,
          difficulty: data.difficulty ?? '',
          bloomLevel: data.bloomLevel ?? '',
          contentTypes: data.contentTypes ?? [],
          objectives: data.objectives ?? [],
          body: content.trim(),
        })
      } catch { /* skip malformed files */ }
    }
  }

  if (!lessons.length) {
    return Response.json({ error: 'No lessons found for this track' }, { status: 404 })
  }

  // Sort by module order then lesson index
  lessons.sort((a, b) => (a.module - b.module) || (a.lessonIndex - b.lessonIndex))

  try {
    const doc = await buildTrackDocument(programSlug, trackSlug, lessons, contentDir)
    const buffer = await Packer.toBuffer(doc)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${programSlug}--${trackSlug}.docx"`,
      },
    })
  } catch (err) {
    console.error('[admin/export] build error:', err)
    return Response.json({ error: 'Failed to build document' }, { status: 500 })
  }
}
