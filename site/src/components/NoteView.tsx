import { useEffect, useMemo, useState } from 'react'
import { nextNote, prevNote, sectionById, type Chunk, type Note } from '../content'
import { Markdown } from '../Markdown'
import { noteHref, type Settings, type useProgress } from '../store'

interface Props { note: Note; settings: Settings; update: (p: Partial<Settings>) => void; api: ReturnType<typeof useProgress> }

const minutesOf = (c: Chunk) => Math.max(1, Math.round(c.words / 200))

export function NoteView({ note, settings, update, api }: Props) {
  const sec = sectionById.get(note.section)!
  const chunks = useMemo<Chunk[]>(() => {
    const intro = note.intro ? [{ heading: 'The gist', body: note.intro, words: note.intro.split(/\s+/).length }] : []
    return [...intro, ...note.chunks]
  }, [note])
  const [i, setI] = useState(0)
  const seen = api.progress.chunks[note.id] ?? []
  const isDone = Boolean(api.progress.done[note.id])
  const finished = i >= chunks.length
  const next = nextNote(note.id)
  const prev = prevNote(note.id)

  const advance = () => {
    api.markChunk(note.id, i)
    if (i === chunks.length - 1 && !isDone) api.toggleDone(note.id)
    setI((x) => Math.min(x + 1, chunks.length))
    window.scrollTo({ top: 0, behavior: settings.calm ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    if (!settings.chunkMode) return
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight' || e.key === 'j') advance()
      if (e.key === 'ArrowLeft' || e.key === 'k') setI((x) => Math.max(0, x - 1))
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  })

  const pct = settings.chunkMode ? Math.min(1, i / chunks.length) : seen.length / Math.max(1, chunks.length)

  return (
    <article className="note" style={{ ['--h' as string]: sec.hue }}>
      <div className="readbar" aria-hidden><span style={{ transform: `scaleX(${pct})` }} /></div>
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href="#/">Trail</a> / <a href={`#/s/${encodeURIComponent(sec.id)}`}>{sec.num} {sec.title}</a>
      </nav>
      <header className="note-head">
        <h1>{note.title}</h1>
        <p className="meta">⏱ {note.minutes} min total · {chunks.length} chunks · {isDone ? '✅ done' : 'not done yet'}</p>
        {note.tldr && <p className="tldr"><span>TL;DR</span>{note.tldr}</p>}
      </header>

      <div className="reader-tools" role="toolbar" aria-label="Reading mode">
        <button aria-pressed={settings.chunkMode} onClick={() => update({ chunkMode: !settings.chunkMode })}>🧩 {settings.chunkMode ? 'Chunk mode' : 'Scroll mode'}</button>
        <button aria-pressed={settings.bionic} onClick={() => update({ bionic: !settings.bionic })}><b>Bi</b>onic</button>
        <button aria-pressed={settings.ruler} onClick={() => update({ ruler: !settings.ruler })}>📏 Ruler</button>
        <button aria-pressed={isDone} onClick={() => api.toggleDone(note.id)}>{isDone ? '✓ Done' : '○ Mark done'}</button>
      </div>

      {settings.chunkMode && (
        <ol className="chunk-dots" aria-label="Chunks">
          {chunks.map((c, k) => (
            <li key={k}>
              <button onClick={() => setI(k)} aria-current={k === i ? 'step' : undefined}
                className={`${seen.includes(k) ? 'seen' : ''} ${k === i ? 'here' : ''}`} title={c.heading}>
                <span className="sr">{c.heading}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {settings.chunkMode ? (
        finished ? (
          <section className="celebrate" aria-live="polite">
            <div className="confetti" aria-hidden>{Array.from({ length: 18 }, (_, k) => <i key={k} style={{ ['--k' as string]: k }} />)}</div>
            <h2>Nice. That’s one thing done.</h2>
            <p>+50 XP. Take a breath. Now say the TL;DR out loud in your own words — that’s how it sticks.</p>
            <div className="end-actions">
              {next && <a className="btn-primary" href={noteHref(next.id)}>Next: {next.title} →</a>}
              <button className="btn-ghost" onClick={() => setI(0)}>Read again</button>
              <a className="btn-ghost" href="#/">Back to trail</a>
            </div>
          </section>
        ) : (
          <section className="chunk" key={i} aria-labelledby="chunk-h">
            <p className="chunk-count">Chunk {i + 1} of {chunks.length} · ~{minutesOf(chunks[i])} min</p>
            <h2 id="chunk-h">{chunks[i].heading}</h2>
            <div className="prose"><Markdown source={chunks[i].body} bionic={settings.bionic} /></div>
            <div className="chunk-nav">
              <button className="btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</button>
              <button className="btn-primary" onClick={advance}>{i === chunks.length - 1 ? 'Finish note ✓' : 'Got it → next chunk'}</button>
            </div>
            <p className="hint">Tip: ← → arrow keys work too.</p>
          </section>
        )
      ) : (
        <div className="scroll-mode">
          {chunks.map((c, k) => (
            <section key={k} className="chunk flat">
              <h2>{c.heading}</h2>
              <div className="prose"><Markdown source={c.body} bionic={settings.bionic} /></div>
              <button className={`chunk-tick ${seen.includes(k) ? 'on' : ''}`} onClick={() => api.markChunk(note.id, k)}>
                {seen.includes(k) ? '✓ Got this part' : '○ I got this part'}
              </button>
            </section>
          ))}
        </div>
      )}

      <footer className="pager">
        {prev ? <a href={noteHref(prev.id)}>← {prev.title}</a> : <span />}
        {next && <a href={noteHref(next.id)}>{next.title} →</a>}
      </footer>
    </article>
  )
}
