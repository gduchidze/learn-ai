import { notes, sections, sectionById } from '../content'
import { noteHref, type useProgress } from '../store'
import { ProgressRing } from './ProgressRing'

type Api = ReturnType<typeof useProgress>
const QUICK_WIN_MAX_MIN = 4

export function Home({ api }: { api: Api }) {
  const { done } = api.progress
  const next = notes.find((n) => !done[n.id]) ?? notes[0]
  const nextSec = sectionById.get(next.section)!
  const quick = notes.filter((n) => !done[n.id] && n.minutes <= QUICK_WIN_MAX_MIN && n.id !== next.id && n.tldr).slice(0, 3)
  const total = notes.length
  const doneCount = Object.keys(done).length

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-h">
        <p className="eyebrow">AI engineering · {total} notes · zero overwhelm</p>
        <h1 id="hero-h">One <mark>small</mark> thing.<br />Then the next.</h1>
        <p className="lede">No giant syllabus staring at you. Every note is cut into bite-size chunks with a plain-words summary up top. Read one chunk, tick it, feel the progress.</p>
      </section>

      <section className="next-up" style={{ ['--h' as string]: nextSec.hue }} aria-label="Your next step">
        <span className="tag">▶ Your next one thing</span>
        <a href={noteHref(next.id)} className="next-card">
          <span className="next-sec">{nextSec.num} · {nextSec.title}</span>
          <strong>{next.title}</strong>
          {next.tldr && <span className="next-tldr">{next.tldr}</span>}
          <span className="meta">⏱ {next.minutes} min · {next.chunks.length} chunks</span>
          <span className="go" aria-hidden>Start →</span>
        </a>
        {quick.length > 0 && (
          <div className="quick">
            <span className="tag small">Low energy? Quick wins under {QUICK_WIN_MAX_MIN} min</span>
            {quick.map((n) => (
              <a key={n.id} href={noteHref(n.id)} className="quick-item">
                <b>{n.title}</b><span>{n.minutes}m</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="journey" aria-labelledby="journey-h">
        <div className="journey-head">
          <h2 id="journey-h">The trail</h2>
          <p>{doneCount} / {total} notes done. Follow the path top to bottom, or jump anywhere.</p>
        </div>
        <ol className="trail">
          {sections.map((s, i) => {
            const d = s.notes.filter((n) => done[n.id]).length
            const mins = s.notes.reduce((a, n) => a + n.minutes, 0)
            return (
              <li key={s.id} className={`stop ${i % 2 ? 'right' : 'left'}`} style={{ ['--h' as string]: s.hue }}>
                <a href={`#/s/${encodeURIComponent(s.id)}`}>
                  <ProgressRing value={s.notes.length ? d / s.notes.length : 0} hue={s.hue} />
                  <span className="stop-num">{s.num}</span>
                  <span className="stop-body">
                    <strong>{s.title}</strong>
                    <span>{s.notes.length} notes · ~{Math.round(mins / 60 * 10) / 10}h</span>
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="howto" aria-label="How this site helps you focus">
        {[
          ['🧩', 'Chunk mode', 'One section on screen at a time. Nothing else to distract you.'],
          ['🟢', 'Plain words first', 'Every note opens with the gist before the details.'],
          ['⏲', 'Focus timer', '15-minute sprints, then a real break. Bottom-right corner.'],
          ['📏', 'Reading ruler', 'A highlight band follows your cursor so lines don’t blur.'],
          ['𝗕', 'Bionic text', 'Bold word-starts give your eyes anchors.'],
          ['/', 'Jump anywhere', 'Press / to search every note.'],
        ].map(([i, t, d]) => <div key={t} className="howto-item"><span className="howto-i">{i}</span><b>{t}</b><span>{d}</span></div>)}
      </section>
    </div>
  )
}
