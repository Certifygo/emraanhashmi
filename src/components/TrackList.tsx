import { ExternalLink, X } from 'lucide-react'
import type { PlaylistTrack } from '../types/playlist'
import { getArtistLabel } from '../lib/youtube'

interface TrackListProps {
  open: boolean
  tracks: PlaylistTrack[]
  currentTrackId: string | null
  playlistName: string
  playlistUrl: string
  onClose: () => void
  onSelectTrack: (trackId: string) => void
}

export function TrackList({
  open,
  tracks,
  currentTrackId,
  playlistName,
  playlistUrl,
  onClose,
  onSelectTrack,
}: TrackListProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition"
        aria-label="Close queue panel"
        onClick={onClose}
      />

      <aside
        className="glass animate-sheet-up md:animate-panel-in relative z-10 flex max-h-[82vh] w-full flex-col rounded-t-3xl md:my-6 md:mr-6 md:max-h-[calc(100vh-3rem)] md:w-[min(420px,92vw)] md:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-label="Queue"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[0.7rem] tracking-[0.2em] text-white/45 uppercase">
              Queue
            </p>
            <h2 className="mt-1 line-clamp-1 text-lg font-semibold text-white">
              {playlistName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close queue"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-2 py-2">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center gap-5 px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/8">
                <ExternalLink className="h-6 w-6 text-white/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">
                  Queue not ready yet
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/45">
                  Press play once so YouTube can load the playlist, then open
                  the queue again.
                </p>
              </div>
              <a
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#ff0033] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#ff3355] active:scale-95"
              >
                <ExternalLink className="h-4 w-4" />
                Open in YouTube Music
              </a>
            </div>
          ) : (
            <ul className="space-y-1 pb-3">
              {tracks.map((track, index) => {
                const active = track.id === currentTrackId
                return (
                  <li key={`${track.id}-${index}`}>
                    <button
                      type="button"
                      onClick={() => onSelectTrack(track.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                        active
                          ? 'bg-white/12 ring-1 ring-white/20'
                          : 'hover:bg-white/7'
                      }`}
                      aria-current={active ? 'true' : undefined}
                    >
                      <span className="w-5 shrink-0 text-center text-xs tabular-nums text-white/40">
                        {index + 1}
                      </span>
                      {track.albumArtUrl ? (
                        <img
                          src={track.albumArtUrl}
                          alt=""
                          className="h-11 w-11 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-lg bg-white/10" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-medium ${
                            active ? 'text-[#1db954]' : 'text-white'
                          }`}
                        >
                          {track.name}
                        </p>
                        <p className="truncate text-xs text-white/50">
                          {getArtistLabel(track)}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
