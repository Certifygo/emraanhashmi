import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { playlistConfig } from './config/playlist'
import { Background } from './components/Background'
import { CurrentTime } from './components/CurrentTime'
import { ErrorLine } from './components/ErrorLine'
import { LoadingScreen } from './components/LoadingScreen'
import { MusicPlayer } from './components/MusicPlayer'
import { OpenMusicButton } from './components/OpenMusicButton'
import { InstagramButton } from './components/InstagramButton'
import { StatusScreen } from './components/StatusScreen'
import { ThemeToggle } from './components/ThemeToggle'
import { TrackList } from './components/TrackList'
import { useYouTubePlaylistPlayer } from './hooks/useYouTubePlaylistPlayer'
import { assetUrl } from './lib/assets'
import { loadPlaylist, trackFromVideoData, videoThumbnailUrl } from './lib/youtube'
import type { Playlist, PlaylistTrack } from './types/playlist'

type UiStatus =
  | { kind: 'loading' }
  | { kind: 'ready'; playlist: Playlist }
  | { kind: 'invalid_url'; message: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'youtube_unavailable'; message: string }

type BgMode = 'moon' | 'sun'

const moonBackground =
  playlistConfig.backgroundImages[0] ?? playlistConfig.backgroundImage
const sunBackground =
  playlistConfig.backgroundImages[1] ?? playlistConfig.backgroundImage

function PlaylistExperience({ playlist }: { playlist: Playlist }) {
  const [bgMode, setBgMode] = useState<BgMode>('moon')
  const [queueOpen, setQueueOpen] = useState(false)

  const {
    hostRef,
    isPlaying,
    isShuffled,
    positionSeconds,
    durationSeconds,
    videoId,
    title,
    author,
    playlistIds,
    togglePlay,
    next,
    previous,
    seek,
    toggleShuffle,
    playById,
  } = useYouTubePlaylistPlayer({ playlistId: playlist.id })

  const currentTrack = useMemo(() => {
    if (!videoId) return null
    return trackFromVideoData(videoId, title ?? undefined, author ?? undefined, durationSeconds)
  }, [author, durationSeconds, title, videoId])

  const [queueTitles, setQueueTitles] = useState<Record<string, string>>({})
  const fetchedTitlesRef = useRef<Set<string>>(new Set())

  const queueTracks = useMemo<PlaylistTrack[]>(() => {
    return playlistIds.map((id) => {
      if (id === videoId) {
        return trackFromVideoData(
          id,
          title ?? undefined,
          author ?? undefined,
          durationSeconds,
        )
      }
      return {
        id,
        name: queueTitles[id] ?? 'Song',
        artists: ['YouTube Music'],
        albumName: '',
        albumArtUrl: videoThumbnailUrl(id),
        durationMs: 0,
        url: `https://music.youtube.com/watch?v=${id}`,
      }
    })
  }, [author, durationSeconds, playlistIds, queueTitles, title, videoId])

  useEffect(() => {
    if (!queueOpen || playlistIds.length === 0) return

    let cancelled = false
    const missing = playlistIds.filter(
      (id) => id !== videoId && !fetchedTitlesRef.current.has(id),
    )
    if (missing.length === 0) return

    for (const id of missing) fetchedTitlesRef.current.add(id)

    void (async () => {
      const nextTitles: Record<string, string> = {}
      await Promise.all(
        missing.slice(0, 40).map(async (id) => {
          try {
            const endpoint = new URL('https://www.youtube.com/oembed')
            endpoint.searchParams.set(
              'url',
              `https://www.youtube.com/watch?v=${id}`,
            )
            endpoint.searchParams.set('format', 'json')
            const response = await fetch(endpoint.toString())
            if (!response.ok) return
            const data = (await response.json()) as { title?: string }
            if (data.title) nextTitles[id] = data.title
          } catch {
            // ignore individual failures
          }
        }),
      )
      if (!cancelled && Object.keys(nextTitles).length > 0) {
        setQueueTitles((prev) => ({ ...prev, ...nextTitles }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [playlistIds, queueOpen, videoId])

  const backgroundImage = bgMode === 'moon' ? moonBackground : sunBackground

  // Warm the browser cache so background crossfades stay smooth.
  useEffect(() => {
    for (const path of [moonBackground, sunBackground]) {
      const img = new Image()
      img.src = assetUrl(path)
    }
  }, [])

  useEffect(() => {
    if (!queueOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setQueueOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [queueOpen])

  const handleToggleBgMode = useCallback(() => {
    setBgMode((mode) => (mode === 'moon' ? 'sun' : 'moon'))
  }, [])

  const handlePrevious = useCallback(() => {
    previous()
  }, [previous])

  const handleNext = useCallback(() => {
    next()
  }, [next])

  const handleSeek = useCallback(
    (ratio: number) => {
      if (durationSeconds <= 0) return
      seek(ratio * durationSeconds)
    },
    [durationSeconds, seek],
  )

  const handleSelectTrack = useCallback(
    (trackId: string) => {
      playById(trackId)
      setQueueOpen(false)
    },
    [playById],
  )

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      <Background imagePath={backgroundImage} />
      <CurrentTime />
      <ThemeToggle mode={bgMode} onToggle={handleToggleBgMode} />

      {/* YouTube player host — kept off-screen; audio is driven by the IFrame API */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 -z-10 h-[80px] w-[300px] opacity-[0.01]"
      >
        <div ref={hostRef} />
      </div>

      <main className="relative mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col px-5 pb-28 sm:px-8 md:px-10 md:pb-32 lg:px-14">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 md:pb-8">
          <div className="pointer-events-auto">
            <ErrorLine />
          </div>
          <div className="pointer-events-auto w-full max-w-[920px]">
            <MusicPlayer
              playlistName={playlist.name}
              coverArtUrl={playlist.coverArtUrl}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isShuffled={isShuffled}
              progressSeconds={positionSeconds}
              durationSeconds={durationSeconds}
              onPlayPause={togglePlay}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onShuffle={toggleShuffle}
              onToggleQueue={() => setQueueOpen(true)}
              onSeek={handleSeek}
            />
          </div>

          {playlistConfig.showOpenButton ? (
            <div className="pointer-events-auto flex items-center gap-2.5 md:hidden">
              <OpenMusicButton href={playlist.url} />
              <InstagramButton href="https://www.instagram.com/clickzbyj/" />
            </div>
          ) : null}
        </div>

        {playlistConfig.showOpenButton ? (
          <div className="pointer-events-none absolute right-5 bottom-8 hidden md:right-8 md:block lg:right-10">
            <div className="pointer-events-auto flex items-center gap-2.5">
              <OpenMusicButton href={playlist.url} />
              <InstagramButton href="https://www.instagram.com/clickzbyj/" />
            </div>
          </div>
        ) : null}
      </main>

      <TrackList
        open={queueOpen}
        tracks={queueTracks}
        currentTrackId={videoId}
        playlistName={playlist.name}
        playlistUrl={playlist.url}
        onClose={() => setQueueOpen(false)}
        onSelectTrack={handleSelectTrack}
      />
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState<UiStatus>({ kind: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    void (async () => {
      setStatus({ kind: 'loading' })
      const result = await loadPlaylist(
        playlistConfig.youtubePlaylistUrl,
        controller.signal,
      )

      if (controller.signal.aborted) return

      if (!result.ok) {
        setStatus({ kind: result.kind, message: result.message })
        return
      }

      setStatus({ kind: 'ready', playlist: result.playlist })
    })()

    return () => controller.abort()
  }, [])

  if (status.kind === 'loading') {
    return (
      <>
        <Background imagePath={playlistConfig.backgroundImage} />
        <LoadingScreen />
      </>
    )
  }

  if (status.kind === 'invalid_url') {
    return (
      <>
        <Background imagePath={playlistConfig.backgroundImage} />
        <StatusScreen title="Invalid playlist URL" message={status.message} />
      </>
    )
  }

  if (status.kind === 'youtube_unavailable') {
    return (
      <>
        <Background imagePath={playlistConfig.backgroundImage} />
        <StatusScreen
          title="YouTube unavailable"
          message={status.message}
          actionLabel="Open Source"
          actionHref={playlistConfig.youtubePlaylistUrl}
        />
      </>
    )
  }

  if (status.kind === 'unavailable') {
    return (
      <>
        <Background imagePath={playlistConfig.backgroundImage} />
        <StatusScreen
          title="Playlist unavailable"
          message={status.message}
          actionLabel="Open Source"
          actionHref={playlistConfig.youtubePlaylistUrl}
        />
      </>
    )
  }

  if (status.kind !== 'ready') {
    return (
      <>
        <Background imagePath={playlistConfig.backgroundImage} />
        <StatusScreen
          title="Something went wrong"
          message="The playlist could not be displayed."
        />
      </>
    )
  }

  return <PlaylistExperience playlist={status.playlist} />
}
