import { memo, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkBionic, remarkCallouts, remarkWikilinks } from './remarkObsidian'

const CALLOUT_ICON: Record<string, string> = {
  success: '🟢', tip: '💡', note: '📝', info: 'ℹ️', warning: '⚠️', danger: '🔥', question: '❓',
  example: '🧪', quote: '💬', abstract: '📌', summary: '📌', important: '⭐', bug: '🐞', failure: '❌',
}

function Callout({ className = '', title, fold, children }: { className?: string; title: string; fold: string; children: ReactNode }) {
  const kind = className.replace(/.*callout-/, '')
  const [open, setOpen] = useState(fold !== '-')
  return (
    <aside className={className}>
      <button className="callout-title" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span aria-hidden>{/^\p{Extended_Pictographic}/u.test(title) ? '' : (CALLOUT_ICON[kind] ?? '📎')}</span>
        <span>{title}</span>
        <span className="callout-chev" aria-hidden>{open ? '–' : '+'}</span>
      </button>
      {open && <div className="callout-body">{children}</div>}
    </aside>
  )
}

function Mermaid({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = 'm' + useId().replace(/:/g, '')
  const [err, setErr] = useState(false)
  useEffect(() => {
    let alive = true
    const dark = document.documentElement.dataset.theme === 'dark'
    import('mermaid').then(async ({ default: m }) => {
      m.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral', fontFamily: 'Atkinson Hyperlegible' })
      const { svg } = await m.render(id, code)
      if (alive && ref.current) ref.current.innerHTML = svg
    }).catch(() => alive && setErr(true))
    return () => { alive = false }
  }, [code, id])
  return err ? <pre><code>{code}</code></pre> : <div className="mermaid" ref={ref} role="img" aria-label="Diagram" />
}

const components: Components = {
  aside: ({ node, children, ...p }) => {
    const props = p as Record<string, string>
    return <Callout className={props.className} title={props['data-title'] ?? ''} fold={props['data-fold'] ?? ''}>{children}</Callout>
  },
  code: ({ className, children }) => {
    const lang = /language-(\w+)/.exec(className ?? '')?.[1]
    if (lang === 'mermaid') return <Mermaid code={String(children).trim()} />
    return <code className={className} data-lang={lang}>{children}</code>
  },
  table: ({ children }) => <div className="table-wrap"><table>{children}</table></div>,
}

function cleanSource(md: string) {
  return md.replace(/`\[(OS|SRC|EX|[A-Z]{2,4})\]`/g, '').replace(/^\s*---\s*$/gm, '')
}

export const Markdown = memo(function Markdown({ source, bionic }: { source: string; bionic: boolean }) {
  const plugins = bionic ? [remarkGfm, remarkCallouts, remarkWikilinks, remarkBionic] : [remarkGfm, remarkCallouts, remarkWikilinks]
  return <ReactMarkdown remarkPlugins={plugins} components={components}>{cleanSource(source)}</ReactMarkdown>
})
