import { useEffect, useState } from 'react'
import { noteById, sectionById } from './content'
import { defaultSettings, useHashRoute, usePersistent, useProgress, type Settings } from './store'
import { Home } from './components/Home'
import { NoteView } from './components/NoteView'
import { SectionView } from './components/SectionView'
import { TopBar } from './components/TopBar'
import { FocusTimer } from './components/FocusTimer'
import { Search } from './components/Search'
import { Ruler } from './components/Ruler'

export function App() {
  const route = useHashRoute()
  const [settings, setSettings] = usePersistent<Settings>('learnai.settings', defaultSettings)
  const progressApi = useProgress()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const r = document.documentElement
    r.dataset.theme = settings.theme
    r.dataset.calm = String(settings.calm)
    r.style.setProperty('--scale', String(settings.fontScale))
  }, [settings])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen((o) => !o) }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))
  const [, kind, id] = route.match(/^\/(n|s)\/(.+)$/) ?? []
  const note = kind === 'n' ? noteById.get(id) : undefined
  const section = kind === 's' ? sectionById.get(id) : undefined

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <TopBar settings={settings} update={update} xp={progressApi.xp} streak={progressApi.streak} onSearch={() => setSearchOpen(true)} />
      <main id="main">
        {note ? <NoteView key={note.id} note={note} settings={settings} update={update} api={progressApi} />
          : section ? <SectionView section={section} api={progressApi} />
          : <Home api={progressApi} />}
      </main>
      <FocusTimer />
      {settings.ruler && <Ruler />}
      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </>
  )
}
