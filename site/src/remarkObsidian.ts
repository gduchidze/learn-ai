// Small remark plugins for Obsidian syntax: callouts, wikilinks, and optional bionic reading.
import { resolveLink } from './content'
import { noteHref } from './store'

type Node = { type: string; value?: string; url?: string; children?: Node[]; data?: Record<string, unknown> }

function walk(node: Node, fn: (n: Node, parent?: Node) => void, parent?: Node) {
  fn(node, parent)
  node.children?.forEach((c) => walk(c, fn, node))
}

export function remarkCallouts() {
  return (tree: Node) => walk(tree, (n) => {
    if (n.type !== 'blockquote') return
    const para = n.children?.[0]
    const first = para?.children?.[0]
    if (!para || first?.type !== 'text' || !first.value) return
    const m = first.value.match(/^\[!(\w+)\]([+-]?)\s*([^\n]*)\n?/)
    if (!m) return
    const [, kind, fold, title] = m
    first.value = first.value.slice(m[0].length)
    if (para.children && para.children[1]?.type === 'break') para.children.splice(1, 1)
    n.data = { hName: 'aside', hProperties: { className: `callout callout-${kind.toLowerCase()}`, dataTitle: title || kind, dataFold: fold } }
  })
}

const WIKI = /(!?)\[\[([^\]|#]+)(#[^\]|]*)?(?:\|([^\]]+))?\]\]/g

export function remarkWikilinks() {
  return (tree: Node) => walk(tree, (n) => {
    if (!n.children) return
    n.children = n.children.flatMap((c): Node[] => {
      if (c.type !== 'text' || !c.value?.includes('[[')) return [c]
      const out: Node[] = []
      let last = 0
      for (const m of c.value.matchAll(WIKI)) {
        const [all, , name, , alias] = m
        out.push({ type: 'text', value: c.value.slice(last, m.index) })
        const target = resolveLink(name)
        const label = alias ?? name
        out.push(target
          ? { type: 'link', url: noteHref(target.id), children: [{ type: 'text', value: label }], data: { hProperties: { className: 'wikilink' } } }
          : { type: 'emphasis', children: [{ type: 'text', value: label }] })
        last = (m.index ?? 0) + all.length
      }
      out.push({ type: 'text', value: c.value.slice(last) })
      return out
    })
  })
}

// Bold the first part of each word to give the eye an anchor.
export function remarkBionic() {
  return (tree: Node) => walk(tree, (n, parent) => {
    if (!n.children || parent?.type === 'strong' || n.type === 'strong' || n.type === 'link' || n.type === 'heading') return
    n.children = n.children.flatMap((c): Node[] => {
      if (c.type !== 'text' || !c.value) return [c]
      return c.value.split(/(\s+)/).flatMap((w): Node[] => {
        if (!/^[A-Za-z]{3,}/.test(w)) return [{ type: 'text', value: w }]
        const k = Math.ceil(w.length * 0.45)
        return [{ type: 'strong', children: [{ type: 'text', value: w.slice(0, k) }], data: { hProperties: { className: 'bio' } } }, { type: 'text', value: w.slice(k) }]
      })
    })
  })
}
