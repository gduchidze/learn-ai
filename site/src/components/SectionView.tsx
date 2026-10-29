import type { Section } from '../content'
import { noteHref, type useProgress } from '../store'

export function SectionView({ section, api }: { section: Section; api: ReturnType<typeof useProgress> }) {
  const { done } = api.progress
  return (
    <div className="section-view" style={{ ['--h' as string]: section.hue }}>
      <a href="#/" className="back">← The trail</a>
      <h1><span className="big-num">{section.num}</span>{section.title}</h1>
      <ol className="note-list">
        {section.notes.map((n, i) => (
          <li key={n.id} className={done[n.id] ? 'is-done' : ''}>
            <a href={noteHref(n.id)}>
              <span className="nl-check" aria-label={done[n.id] ? 'Done' : 'Not done'}>{done[n.id] ? '✓' : i + 1}</span>
              <span className="nl-body">
                <strong>{n.title}</strong>
                {n.tldr && <span>{n.tldr}</span>}
              </span>
              <span className="nl-min">{n.minutes}m</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
