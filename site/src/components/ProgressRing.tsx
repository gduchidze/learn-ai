export function ProgressRing({ value, size = 44, hue }: { value: number; size?: number; hue: number }) {
  const r = size / 2 - 4
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring" aria-label={`${Math.round(value * 100)}% done`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-fill" style={{ stroke: `oklch(68% 0.17 ${hue})` }}
        strokeDasharray={c} strokeDashoffset={c * (1 - value)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  )
}
