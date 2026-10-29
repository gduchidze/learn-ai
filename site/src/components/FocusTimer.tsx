import { useEffect, useState } from 'react'

const MODES = { focus: 15 * 60, break: 5 * 60 } as const
type Mode = keyof typeof MODES

export function FocusTimer() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('focus')
  const [left, setLeft] = useState<number>(MODES.focus)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    if (left > 0) return
    const nextMode: Mode = mode === 'focus' ? 'break' : 'focus'
    setMode(nextMode)
    setLeft(MODES[nextMode])
    setRunning(false)
    document.title = nextMode === 'break' ? '☕ Break time!' : '🎯 Back to focus'
  }, [left, mode])

  const pct = 1 - left / MODES[mode]
  const label = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
  const reset = (m: Mode) => { setMode(m); setLeft(MODES[m]); setRunning(false) }

  return (
    <div className={`timer ${open ? 'open' : ''} ${mode}`} style={{ ['--p' as string]: pct }}>
      {open && (
        <div className="timer-panel" role="dialog" aria-label="Focus timer">
          <p className="timer-mode">{mode === 'focus' ? '🎯 Focus sprint' : '☕ Real break — stand up'}</p>
          <p className="timer-time" aria-live="polite">{label}</p>
          <div className="timer-btns">
            <button className="btn-primary" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</button>
            <button className="btn-ghost" onClick={() => reset(mode === 'focus' ? 'break' : 'focus')}>Switch</button>
          </div>
        </div>
      )}
      <button className="timer-fab" onClick={() => setOpen((o) => !o)} aria-label={`Focus timer ${label}`}>
        <span>{running ? label : '⏲'}</span>
      </button>
    </div>
  )
}
