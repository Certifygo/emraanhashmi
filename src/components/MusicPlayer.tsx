import type { PlaylistTrack } from '../types/playlist'
import { formatClock, getArtistLabel } from '../lib/youtube'
import { PlayerControls } from './PlayerControls'

interface MusicPlayerProps {
  playlistName: string
  coverArtUrl: string | null
  currentTrack: PlaylistTrack | null
  isPlaying: boolean
  isShuffled: boolean
  progressSeconds: number
  durationSeconds: number
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onShuffle: () => void
  onToggleQueue: () => void
  onSeek: (ratio: number) => void
}

function VinylDisc({ artUrl }: { artUrl: string | null }) {
  return (
    <div
      className="relative h-12 w-12 shrink-0 rounded-full bg-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.45)] sm:h-14 sm:w-14"
      aria-hidden
    >
      <div className="absolute inset-[14%] rounded-full border border-white/10" />
      <div className="absolute inset-[24%] rounded-full border border-white/8" />
      <div className="absolute inset-[34%] rounded-full border border-white/6" />
      <div className="absolute inset-[42%] overflow-hidden rounded-full bg-white/10">
        {artUrl ? (
          <img src={artUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80" />
    </div>
  )
}

export function MusicPlayer({
  playlistName,
  coverArtUrl,
  currentTrack,
  isPlaying,
  isShuffled,
  progressSeconds,
  durationSeconds,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onToggleQueue,
  onSeek,
}: MusicPlayerProps) {
  const title = currentTrack?.name ?? playlistName
  const subtitle = currentTrack
    ? getArtistLabel(currentTrack)
    : 'Press play to start'
  const art = currentTrack?.albumArtUrl ?? coverArtUrl
  const duration =
    durationSeconds > 0
      ? durationSeconds
      : currentTrack?.durationMs
        ? currentTrack.durationMs / 1000
        : 0
  const ratio = duration > 0 ? Math.min(1, Math.max(0, progressSeconds / duration)) : 0

  const handleSeek = (clientX: number, target: HTMLElement) => {
    if (duration <= 0) return
    const rect = target.getBoundingClientRect()
    const next = (clientX - rect.left) / rect.width
    onSeek(Math.min(1, Math.max(0, next)))
  }

  return (
    <div className="animate-rise-in w-full max-w-[820px]">
      <div
        className="relative overflow-hidden rounded-full border border-white/15 px-3 py-2.5 shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:px-4 sm:py-3"
        style={{
          background:
            'linear-gradient(105deg, rgba(18,14,12,0.72) 0%, rgba(40,22,14,0.55) 38%, rgba(12,12,14,0.78) 100%)',
          backdropFilter: 'blur(22px) saturate(140%)',
          WebkitBackdropFilter: 'blur(22px) saturate(140%)',
        }}
      >
        {/* Warm amber glow behind the center */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-[42%] h-28 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,140,60,0.28)_0%,transparent_70%)]"
        />

        <div className="relative flex items-center gap-2 sm:gap-3">
          {/* Art + vinyl */}
          <div className="flex shrink-0 items-center">
            {art ? (
              <img
                src={art}
                alt=""
                className="relative z-10 h-12 w-12 rounded-lg object-cover shadow-lg sm:h-14 sm:w-14"
              />
            ) : (
              <div className="relative z-10 h-12 w-12 rounded-lg bg-white/10 sm:h-14 sm:w-14" />
            )}
            <div className="-ml-3 sm:-ml-3.5">
              <div
                className={
                  isPlaying
                    ? 'animate-[vinyl-spin_8s_linear_infinite]'
                    : undefined
                }
              >
                <VinylDisc artUrl={art} />
              </div>
            </div>
          </div>

          {/* Title / artist / progress */}
          <div className="min-w-0 flex-1 pr-1">
            <p className="truncate text-[0.85rem] font-semibold text-white sm:text-[0.95rem]">
              {title}
            </p>
            <p className="truncate text-[0.7rem] text-white/55 sm:text-xs">
              {subtitle}
            </p>
            <div
              className={`mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/20 ${
                duration > 0 ? 'cursor-pointer' : 'cursor-default'
              }`}
              role={duration > 0 ? 'slider' : 'progressbar'}
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={progressSeconds || 0}
              aria-label="Track progress"
              tabIndex={duration > 0 ? 0 : -1}
              onClick={(event) => handleSeek(event.clientX, event.currentTarget)}
              onKeyDown={(event) => {
                if (duration <= 0) return
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
                className="h-full rounded-full bg-white transition-[width] duration-150 ease-out"
                style={{ width: `${ratio * 100}%` }}
              />
            </div>
          </div>

          {/* Controls + time */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <PlayerControls
              compact
              isPlaying={isPlaying}
              isShuffled={isShuffled}
              onPlayPause={onPlayPause}
              onPrevious={onPrevious}
              onNext={onNext}
              onShuffle={onShuffle}
              onToggleQueue={onToggleQueue}
              disableSkip={false}
            />
            <p className="pr-1 text-[0.65rem] text-white/55 tabular-nums sm:text-[0.7rem]">
              {formatClock(progressSeconds)} /{' '}
              {duration > 0 ? formatClock(duration) : '--:--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
