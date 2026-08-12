import { useEffect, useState } from 'react'
import { assetUrl } from '../lib/assets'

interface BackgroundProps {
  imagePath: string
}

export function Background({ imagePath }: BackgroundProps) {
  const src = assetUrl(imagePath)
  const [current, setCurrent] = useState(src)
  const [previous, setPrevious] = useState<string | null>(null)

  useEffect(() => {
    if (src === current) return
    setPrevious(current)
    setCurrent(src)
  }, [src, current])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {previous ? (
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${previous}")` }}
        />
      ) : null}
      <div
        key={current}
        className={`absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat ${
          previous ? 'animate-fade-in' : ''
        }`}
        style={{ backgroundImage: `url("${current}")` }}
        onAnimationEnd={() => setPrevious(null)}
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
    </div>
  )
}
