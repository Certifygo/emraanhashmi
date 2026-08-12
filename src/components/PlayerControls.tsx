import { ListMusic, Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react'

interface PlayerControlsProps {
  isPlaying: boolean
  isShuffled: boolean
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onShuffle: () => void
  onToggleQueue: () => void
  disableSkip: boolean
  compact?: boolean
}

export function PlayerControls({
  isPlaying,
  isShuffled,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onToggleQueue,
  disableSkip,
  compact = false,
}: PlayerControlsProps) {
  const iconBtn =
    'rounded-full p-1.5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35 sm:p-2'
  const playBtn =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition hover:scale-105 active:scale-95 sm:h-10 sm:w-10'

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button
        type="button"
        onClick={onPrevious}
        disabled={disableSkip}
        className={iconBtn}
        aria-label="Previous track"
        title="Previous"
      >
        <SkipBack className="h-4 w-4 fill-current" strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={onPlayPause}
        className={playBtn}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" strokeWidth={1.5} />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" strokeWidth={1.5} />
        )}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={disableSkip}
        className={iconBtn}
        aria-label="Next track"
        title="Next"
      >
        <SkipForward className="h-4 w-4 fill-current" strokeWidth={1.5} />
      </button>

      {!compact ? null : (
        <>
          <button
            type="button"
            onClick={onShuffle}
            className={`${iconBtn} ${isShuffled ? 'text-[#1db954]' : 'text-white/70'}`}
            aria-label={isShuffled ? 'Shuffle on' : 'Shuffle off'}
            title="Shuffle"
          >
            <Shuffle className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onToggleQueue}
            className={`${iconBtn} text-white/70`}
            aria-label="Open queue"
            title="Queue"
          >
            <ListMusic className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </>
      )}
    </div>
  )
}
