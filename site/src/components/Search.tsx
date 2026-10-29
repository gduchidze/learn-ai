import { useEffect, useMemo, useRef, useState } from 'react'
import { notes, sectionById } from '../content'
import { noteHref } from '../store'

const MAX_RESULTS = 12

export function Search({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => input.current?.focus(), [])

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return notes.slice(0, MAX_RESULTS)
    return notes
      .map((n) => {
        const hay = [n.title, ...n.aliases].join(' ').toLowerCase()
        const score = hay.startsWith(t) ? 3 : hay.includes(t) ? 2 : n.tldr.toLowerCase().includes(t) ? 1 : 0
        return { n, score }
      })
      .filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS).map((r) => r.n)
  }, [q])

  const go = (id: string) => { window.location.hash = noteHref(id).slice(1); onClose() }

  return (
    <div className="search-backdrop" onClick={onClose}>
      <div className="search" role="dialog" aria-label="Search notes" onClick={(e) => e.stopPropagation()}>
        <input ref={input} value={q} placeholder="Type a topic: kv cache, rag, agents…" aria-label="Search"
          onChange={(e) => { setQ(e.target.value); setSel(0) }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
            if (e.key === 'Enter' && results[sel]) go(results[sel].id)
          }} />
        <ul>
          {results.map((n, k) => {
            const s = sectionById.get(n.section)!
            return (
              <li key={n.id}>
                <button className={k === sel ? 'sel' : ''} onMouseEnter={() => setSel(k)} onClick={() => go(n.id)} style={{ ['--h' as string]: s.hue }}>
                  <span className="sr-sec">{s.num}</span><b>{n.title}</b><span className="sr-min">{n.minutes}m</span>
                </button>
              </li>
            )
          })}
          {results.length === 0 && <li className="empty">Nothing yet. Try a shorter word.</li>}
        </ul>
      </div>
    </div>
  )
}
