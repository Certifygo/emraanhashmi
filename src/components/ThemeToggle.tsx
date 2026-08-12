import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  mode: 'moon' | 'sun'
  onToggle: () => void
}

export function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  const isMoon = mode === 'moon'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="glass absolute top-5 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition hover:scale-105 hover:bg-white/10 active:scale-95 sm:top-6 sm:right-6 md:right-8"
      aria-label={isMoon ? 'Switch to sun background' : 'Switch to moon background'}
      title={isMoon ? 'Sun' : 'Moon'}
    >
      {isMoon ? (
        <Moon className="h-5 w-5" strokeWidth={1.75} />
      ) : (
        <Sun className="h-5 w-5 text-amber-300" strokeWidth={1.75} />
      )}
    </button>
  )
}
