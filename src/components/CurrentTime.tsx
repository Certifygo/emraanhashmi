import { useEffect, useState } from 'react'

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function CurrentTime() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <time
      dateTime={now.toISOString()}
      className="pointer-events-none absolute top-4 left-4 z-30 text-2xl font-semibold tracking-tight text-white tabular-nums drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:top-6 sm:left-6 sm:text-3xl md:left-8 md:text-4xl"
      aria-live="polite"
      aria-atomic="true"
    >
      {formatTime(now)}
    </time>
  )
}
