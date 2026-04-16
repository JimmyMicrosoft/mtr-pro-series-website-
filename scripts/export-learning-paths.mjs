/**
 * export-learning-paths.mjs
 *
 * Exports all 8 learning paths to a single Word document for content review.
 * Edit the doc, then run: npm run import:roles <path-to-docx>
 *
 * Usage:
 *   npm run export:roles
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from 'docx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

// ─── Colours ────────────────────────────────────────────────────────────────
const BLUE = '1E3A5F'
const LIGHT_BLUE = 'D6E4F0'
const ACCENT = '2563EB'
const GREY_BG = 'F3F4F6'
const WHITE = 'FFFFFF'

// ─── Helpers ────────────────────────────────────────────────────────────────
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: WHITE,
        size: 28,
      }),
    ],
    shading: { type: ShadingType.SOLID, color: BLUE, fill: BLUE },
    indent: { left: 120, right: 120 },
  })
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, bold: true, color: BLUE, size: 24 })],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
    },
  })
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, color: ACCENT, size: 22 })],
  })
}

function label(text) {
  return new TextRun({ text, bold: true, color: BLUE, size: 20 })
}

function value(text) {
  return new TextRun({ text: String(text), size: 20 })
}

function fieldRow(labelText, valueText) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [label(labelText + '  '), value(valueText)],
  })
}

function bodyText(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: String(text), size: 20 })],
  })
}

function bulletItem(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 20 })],
  })
}

function spacer() {
  return new Paragraph({ spacing: { before: 80, after: 80 }, children: [] })
}

function divider() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: LIGHT_BLUE },
    },
    children: [],
  })
}

function infoBox(paragraphs) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
      left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
      right: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
      insideH: { style: BorderStyle.NONE },
      insideV: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: GREY_BG, fill: GREY_BG },
            margins: { top: 100, bottom: 100, left: 160, right: 160 },
            children: paragraphs,
          }),
        ],
      }),
    ],
  })
}

function stepBox(step, index) {
  const lines = [
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({ text: `STEP ${index + 1}`, bold: true, color: WHITE, size: 20 }),
      ],
      shading: { type: ShadingType.SOLID, color: ACCENT, fill: ACCENT },
      indent: { left: 80, right: 80 },
    }),
    new Paragraph({
      spacing: { before: 60, after: 40 },
      children: [
        label('Track Slug (do not edit):  '),
        new TextRun({ text: step.trackSlug, size: 20, color: '888888' }),
      ],
    }),
    fieldRow('Track Title:', step.trackTitle),
    fieldRow('Program:', step.programTitle),
    fieldRow('Modules:', String(step.modules)),
    fieldRow('Hours:', String(step.hours)),
    new Paragraph({
      spacing: { before: 80, after: 40 },
      children: [label('Step Description:')],
    }),
    bodyText(step.description),
    new Paragraph({
      spacing: { before: 80, after: 40 },
      children: [label('Focus Note (optional — shown highlighted under the step):')],
    }),
    bodyText(step.focus || ''),
  ]

  return infoBox(lines)
}

// ─── Main ────────────────────────────────────────────────────────────────────
const dataPath = path.join(ROOT, 'data', 'learning-paths.json')
const paths = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

const sections = []

// ── Cover page ────────────────────────────────────────────────────────────
sections.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 200 },
    children: [new TextRun({ text: 'MTR Pro Series', bold: true, size: 52, color: BLUE })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [new TextRun({ text: 'Learn by Role — Content Review Document', size: 36, color: ACCENT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 20, color: '888888' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: `${paths.length} learning paths`, size: 20, color: '888888' })],
  }),
  spacer(),
  infoBox([
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: 'How to use this document', bold: true, size: 22, color: BLUE })],
    }),
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: 'Edit any text in this document. Fields marked "do not edit" are used as identifiers and must stay exactly as printed.', size: 20 })],
    }),
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: 'When finished, save and run:  npm run import:roles <path-to-this-file>', size: 20, italics: true })],
    }),
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: 'Each path has two sections: CARD (the listing page) and DETAIL PAGE (the full path page).', size: 20 })],
    }),
  ]),
  divider()
)

// ── One section per path ──────────────────────────────────────────────────
for (let i = 0; i < paths.length; i++) {
  const p = paths[i]

  sections.push(
    // Path header
    heading1(`PATH ${i + 1} OF ${paths.length}: ${p.slug}`),
    spacer(),

    // ── CARD SECTION ──────────────────────────────────────────────────
    heading2('CARD  (shown on the Learning Paths listing page)'),
    bodyText('These fields appear on the card that learners see when browsing all paths.'),
    spacer(),

    fieldRow('Path Slug (do not edit):', p.slug),
    spacer(),

    new Paragraph({ spacing: { before: 80, after: 40 }, children: [label('Card Title:')] }),
    bodyText(p.cardTitle),

    new Paragraph({ spacing: { before: 80, after: 40 }, children: [label('Card Description:')] }),
    bodyText(p.cardDescription),

    fieldRow('Hours (number only):', String(p.hours)),
    fieldRow('Prerequisites:', p.prerequisites),

    new Paragraph({ spacing: { before: 80, after: 40 }, children: [label('Badge Earned:')] }),
    bodyText(p.badge),

    spacer(),
    divider(),

    // ── DETAIL PAGE SECTION ───────────────────────────────────────────
    heading2('DETAIL PAGE  (the full learning path page)'),
    bodyText('These fields appear when a learner clicks into the path.'),
    spacer(),

    new Paragraph({ spacing: { before: 80, after: 40 }, children: [label('Page Title:')] }),
    bodyText(p.pageTitle),

    new Paragraph({ spacing: { before: 80, after: 40 }, children: [label('Subtitle (shown under the title in lighter text):')] }),
    bodyText(p.subtitle),

    fieldRow('Persona (newcomer / practitioner / specialist / expert):', p.persona),
    fieldRow('Difficulty (beginner / intermediate / advanced):', p.difficulty),
    fieldRow('Total Hours Display (e.g. ~10 hrs):', p.totalHours),

    new Paragraph({ spacing: { before: 80, after: 40 }, children: [label('Full Description (shown in the "About this path" section):')] }),
    bodyText(p.description),

    spacer(),
    heading3('Outcomes  (What learners will be able to do — one per bullet)'),
    bodyText('Edit the text of each outcome. Do not add or remove bullets — if you need more or fewer outcomes, ask and we will adjust.'),
    spacer(),
    ...p.outcomes.map((o) => bulletItem(o)),

    spacer(),
    heading3('Steps in this path'),
    bodyText('Edit the description and focus note for each step. Track Slug, Track Title, Program, Modules, and Hours are structural — only edit if you know the track has changed.'),
    spacer(),
  )

  for (let j = 0; j < p.steps.length; j++) {
    sections.push(stepBox(p.steps[j], j), spacer())
  }

  // Separator between paths
  if (i < paths.length - 1) {
    sections.push(divider(), spacer())
  }
}

// ─── Build and write doc ─────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 20, color: '1F2937' },
      },
    },
  },
  sections: [{ children: sections }],
})

const outDir = path.join(ROOT, 'exports', 'word')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'learning-paths-review.docx')

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer)
  console.log(`\n✅  Exported to: exports/word/learning-paths-review.docx`)
  console.log(`   ${paths.length} paths · edit content · then run: npm run import:roles <file>\n`)
})
