interface ProgressBarProps {
  progress: number
  duration: number
  interactive: boolean
  onSeek?: (ratio: number) => void
  currentLabel: string
  durationLabel: string
  /** Compact mini-player: single centered time under the bar */
  compact?: boolean
  accentClassName?: string
}

export function ProgressBar({
  progress,
  duration,
  interactive,
  onSeek,
  currentLabel,
  durationLabel,
  compact = false,
  accentClassName = 'bg-[#ff6a2b]',
}: ProgressBarProps) {
  const ratio = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0

  const handleSeek = (clientX: number, target: HTMLElement) => {
    if (!interactive || !onSeek || duration <= 0) return
    const rect = target.getBoundingClientRect()
    const next = (clientX - rect.left) / rect.width
    onSeek(Math.min(1, Math.max(0, next)))
  }

  return (
    <div className={`w-full ${compact ? 'min-w-0' : ''}`}>
      {!compact ? (
        <div className="mb-1.5 flex items-center justify-between text-[0.7rem] tracking-wide text-white/55 tabular-nums">
          <span>{currentLabel}</span>
          <span>{durationLabel}</span>
        </div>
      ) : null}

      <div
        className={`group relative h-1.5 w-full rounded-full bg-white/20 ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        }`}
        role={interactive ? 'slider' : 'progressbar'}
        aria-valuemin={0}
        aria-valuemax={duration || 0}
        aria-valuenow={progress || 0}
        aria-label="Track progress"
        tabIndex={interactive ? 0 : -1}
        onClick={(event) => handleSeek(event.clientX, event.currentTarget)}
        onKeyDown={(event) => {
          if (!interactive || !onSeek || duration <= 0) return
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            onSeek(Math.min(1, ratio + 0.05))
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            onSeek(Math.max(0, ratio - 0.05))
          }
        }}
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-150 ease-out ${accentClassName}`}
          style={{ width: `${ratio * 100}%` }}
        />
        {compact ? (
          <div
            className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
            style={{ left: `calc(${ratio * 100}% - 6px)` }}
          />
        ) : null}
      </div>

      {compact ? (
        <p className="mt-1.5 text-center text-[0.7rem] text-white/70 tabular-nums">
          {currentLabel} / {durationLabel}
        </p>
      ) : null}
    </div>
  )
}
