import type { Settings } from '../store'

interface Props { settings: Settings; update: (p: Partial<Settings>) => void; xp: number; streak: number; onSearch: () => void }

export function TopBar({ settings, update, xp, streak, onSearch }: Props) {
  return (
    <header className="topbar">
      <a href="#/" className="brand" aria-label="Home"><span className="brand-dot" />learn<b>ai</b></a>
      <button className="search-trigger" onClick={onSearch}>
        <span>Find a topic…</span><kbd>/</kbd>
      </button>
      <div className="stats" aria-label="Your progress">
        <span className="pill" title="Days in a row">🔥 {streak}</span>
        <span className="pill" title="XP: 50 per note, 5 per chunk">⚡ {xp}</span>
      </div>
      <nav className="toggles" aria-label="Reading comfort">
        <button aria-pressed={settings.theme === 'dark'} onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })} title="Theme">{settings.theme === 'dark' ? '☾' : '☀'}</button>
        <button aria-pressed={settings.calm} onClick={() => update({ calm: !settings.calm })} title="Calm mode: no motion, muted colors">◐</button>
        <button onClick={() => update({ fontScale: Math.max(0.85, +(settings.fontScale - 0.1).toFixed(2)) })} title="Smaller text">A−</button>
        <button onClick={() => update({ fontScale: Math.min(1.5, +(settings.fontScale + 0.1).toFixed(2)) })} title="Bigger text">A+</button>
      </nav>
    </header>
  )
}
