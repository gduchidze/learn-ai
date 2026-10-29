// Loads every note in the vault's numbered sections at build time.
const raw = import.meta.glob('../../[0-9][0-9]-*/**/*.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>

export interface Chunk { heading: string; body: string; words: number }
export interface Note {
  id: string; section: string; title: string; fileName: string
  aliases: string[]; tags: string[]; tldr: string; minutes: number
  intro: string; chunks: Chunk[]
}
export interface Section { id: string; num: string; title: string; hue: number; notes: Note[] }

const WORDS_PER_MIN = 200
const SECTION_HUES = [262, 200, 150, 28, 340, 95, 190, 45, 310, 12, 230, 125, 280, 170, 60, 0, 215, 300, 140]

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length
const humanize = (s: string) =>
  s.replace(/^\d+-/, '').split('-').map((w) => (w === 'ml' || w === 'ai' ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(' ')

function parseFrontmatter(src: string): { meta: Record<string, string>; body: string } {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { meta: {}, body: src }
  const meta = Object.fromEntries(
    m[1].split('\n').map((l) => l.split(/:(.*)/s)).filter((p) => p.length > 1).map(([k, v]) => [k.trim(), v.trim()]),
  )
  return { meta, body: src.slice(m[0].length) }
}

const parseList = (v = '') => v.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)

function extractTldr(body: string): string {
  const m = body.match(/\*\*In plain words:\*\*\s*([^\n]+)/) ?? body.match(/>\s*\[!success\][^\n]*\n>\s*([^\n]+)/)
  return m ? m[1].replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a).replace(/[*`]/g, '').trim() : ''
}

function splitChunks(body: string): { intro: string; chunks: Chunk[] } {
  const lines = body.split('\n')
  const chunks: Chunk[] = []
  let intro: string[] = []
  let current: { heading: string; lines: string[] } | null = null
  let inFence = false
  for (const line of lines) {
    if (line.startsWith('```')) inFence = !inFence
    if (!inFence && line.startsWith('# ')) continue
    if (!inFence && line.startsWith('## ')) {
      if (current) chunks.push(toChunk(current))
      current = { heading: line.slice(3).replace(/`\[[A-Z]+\]`/g, '').trim(), lines: [] }
    } else if (current) current.lines.push(line)
    else intro = [...intro, line]
  }
  if (current) chunks.push(toChunk(current))
  return { intro: intro.join('\n').trim(), chunks }
}
const toChunk = (c: { heading: string; lines: string[] }): Chunk => {
  const body = c.lines.join('\n').trim()
  return { heading: c.heading, body, words: wordCount(body) }
}

function buildNote(path: string, src: string): Note {
  const rel = path.replace('../../', '')
  const [section, ...rest] = rel.split('/')
  const fileName = rest[rest.length - 1].replace(/\.md$/, '')
  const { meta, body } = parseFrontmatter(src)
  const h1 = body.match(/^# (.+)$/m)?.[1] ?? fileName
  const { intro, chunks } = splitChunks(body)
  return {
    id: rel.replace(/\.md$/, ''), section, fileName,
    title: h1.replace(/^\d+\s*·\s*/, '').trim(),
    aliases: parseList(meta.aliases), tags: parseList(meta.tags),
    tldr: extractTldr(body),
    minutes: Math.max(1, Math.round(wordCount(body) / WORDS_PER_MIN)),
    intro, chunks,
  }
}

const allNotes = Object.entries(raw).map(([p, s]) => buildNote(p, s)).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))

export const sections: Section[] = [...new Set(allNotes.map((n) => n.section))].sort().map((id, i) => ({
  id, num: id.slice(0, 2), title: humanize(id), hue: SECTION_HUES[i % SECTION_HUES.length],
  notes: allNotes.filter((n) => n.section === id),
}))

export const notes = allNotes
export const noteById = new Map(allNotes.map((n) => [n.id, n]))
export const sectionById = new Map(sections.map((s) => [s.id, s]))

const linkIndex = new Map<string, Note>()
for (const n of allNotes) {
  for (const key of [n.fileName, n.title, ...n.aliases]) {
    const k = key.toLowerCase()
    if (!linkIndex.has(k)) linkIndex.set(k, n)
  }
}
export const resolveLink = (name: string) => linkIndex.get(name.trim().toLowerCase())

// Reading order: follows the vault's numbered sections.
export const nextNote = (id: string) => notes[notes.findIndex((n) => n.id === id) + 1]
export const prevNote = (id: string) => notes[notes.findIndex((n) => n.id === id) - 1]
