import { useEffect, useRef } from 'react'

export function Ruler() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const on = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => { if (ref.current) ref.current.style.transform = `translateY(${e.clientY - 22}px)` })
    }
    window.addEventListener('pointermove', on)
    return () => { window.removeEventListener('pointermove', on); cancelAnimationFrame(frame) }
  }, [])
  return <div className="ruler" ref={ref} aria-hidden />
}
