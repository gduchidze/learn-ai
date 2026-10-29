import { useCallback, useEffect, useState } from 'react'

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage blocked: keep in-memory */ }
}

export function usePersistent<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback))
  useEffect(() => write(key, value), [key, value])
  return [value, setValue] as const
}

export interface Settings {
  theme: 'light' | 'dark'; fontScale: number; bionic: boolean
  ruler: boolean; chunkMode: boolean; calm: boolean
}
export const defaultSettings: Settings = {
  theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  fontScale: 1, bionic: false, ruler: false, chunkMode: true, calm: false,
}

export interface Progress { done: Record<string, number>; chunks: Record<string, number[]>; days: string[] }
const today = () => new Date().toISOString().slice(0, 10)

export function useProgress() {
  const [p, setP] = usePersistent<Progress>('learnai.progress', { done: {}, chunks: {}, days: [] })
  const touchDay = (days: string[]) => (days.includes(today()) ? days : [...days, today()])

  const toggleDone = useCallback((id: string) => setP((s) => {
    const { [id]: was, ...rest } = s.done
    return { ...s, done: was ? rest : { ...rest, [id]: Date.now() }, days: touchDay(s.days) }
  }), [setP])

  const markChunk = useCallback((id: string, i: number) => setP((s) => {
    const cur = s.chunks[id] ?? []
    return cur.includes(i) ? s : { ...s, chunks: { ...s.chunks, [id]: [...cur, i] }, days: touchDay(s.days) }
  }), [setP])

  const streak = (() => {
    const set = new Set(p.days)
    let n = 0
    const d = new Date()
    if (!set.has(today())) d.setDate(d.getDate() - 1)
    while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1) }
    return n
  })()
  const xp = Object.keys(p.done).length * 50 + Object.values(p.chunks).reduce((a, c) => a + c.length * 5, 0)
  return { progress: p, toggleDone, markChunk, streak, xp }
}

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/')
  useEffect(() => {
    const on = () => { setHash(window.location.hash.slice(1) || '/'); window.scrollTo({ top: 0 }) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return decodeURIComponent(hash)
}
export const noteHref = (id: string) => `#/n/${encodeURIComponent(id)}`
