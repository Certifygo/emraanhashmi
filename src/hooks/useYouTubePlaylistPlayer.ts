import { useCallback, useEffect, useRef, useState } from 'react'
import type { YTPlayer, YTNamespace } from '../types/youtube-player'

const IFRAME_API_SRC = 'https://www.youtube.com/iframe_api'

function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT) resolve(window.YT)
    }

    if (!document.querySelector('script[data-youtube-iframe-api]')) {
      const script = document.createElement('script')
      script.src = IFRAME_API_SRC
      script.async = true
      script.dataset.youtubeIframeApi = 'true'
      document.body.appendChild(script)
    }
  })
}

interface UseYouTubePlaylistPlayerOptions {
  playlistId: string
}

export function useYouTubePlaylistPlayer({
  playlistId,
}: UseYouTubePlaylistPlayerOptions) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const pollRef = useRef<number | null>(null)

  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [positionSeconds, setPositionSeconds] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [title, setTitle] = useState<string | null>(null)
  const [author, setAuthor] = useState<string | null>(null)
  const [playlistIds, setPlaylistIds] = useState<string[]>([])

  const syncVideoMeta = useCallback((player: YTPlayer) => {
    try {
      const data = player.getVideoData?.() ?? {}
      const id = data.video_id ?? null
      if (id) setVideoId(id)
      if (data.title) setTitle(data.title)
      if (data.author) setAuthor(data.author)
    } catch {
      // getVideoData is unofficial; ignore if missing
    }

    try {
      const duration = player.getDuration()
      if (Number.isFinite(duration) && duration > 0) {
        setDurationSeconds(duration)
      }
    } catch {
      // ignore
    }

    try {
      const list = player.getPlaylist()
      if (Array.isArray(list) && list.length > 0) {
        setPlaylistIds(list)
      }
    } catch {
      // ignore
    }
  }, [])

  const stopPolling = useCallback(() => {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const startPolling = useCallback(() => {
    stopPolling()
    pollRef.current = window.setInterval(() => {
      const player = playerRef.current
      if (!player) return
      try {
        setPositionSeconds(player.getCurrentTime() || 0)
        const duration = player.getDuration()
        if (Number.isFinite(duration) && duration > 0) {
          setDurationSeconds(duration)
        }
        syncVideoMeta(player)
      } catch {
        // ignore transient player errors
      }
    }, 400)
  }, [stopPolling, syncVideoMeta])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })
      if (cancelled || !hostRef.current) return

      const YT = await loadYouTubeIframeApi()
      if (cancelled || !hostRef.current || playerRef.current) return

      const player = new YT.Player(hostRef.current, {
        height: 80,
        width: 300,
        playerVars: {
          listType: 'playlist',
          list: playlistId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return
            playerRef.current = event.target
            event.target.setLoop(true)
            syncVideoMeta(event.target)
            setReady(true)
          },
          onStateChange: (event) => {
            const state = event.data
            const Playing = YT.PlayerState.PLAYING
            const Paused = YT.PlayerState.PAUSED
            const Ended = YT.PlayerState.ENDED
            const Buffering = YT.PlayerState.BUFFERING

            syncVideoMeta(event.target)

            if (state === Playing) {
              setIsPlaying(true)
              startPolling()
            } else if (state === Paused || state === Ended) {
              setIsPlaying(false)
              stopPolling()
              try {
                setPositionSeconds(event.target.getCurrentTime() || 0)
              } catch {
                // ignore
              }
            } else if (state === Buffering) {
              syncVideoMeta(event.target)
            }
          },
        },
      })

      playerRef.current = player
    })()

    return () => {
      cancelled = true
      stopPolling()
      try {
        playerRef.current?.destroy()
      } catch {
        // ignore
      }
      playerRef.current = null
      setReady(false)
      setIsPlaying(false)
    }
  }, [playlistId, startPolling, stopPolling, syncVideoMeta])

  const togglePlay = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    const state = player.getPlayerState()
    const Playing = window.YT?.PlayerState.PLAYING
    if (Playing != null && state === Playing) {
      player.pauseVideo()
      setIsPlaying(false)
    } else {
      player.playVideo()
      setIsPlaying(true)
    }
  }, [])

  const next = useCallback(() => {
    playerRef.current?.nextVideo()
  }, [])

  const previous = useCallback(() => {
    playerRef.current?.previousVideo()
  }, [])

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(Math.max(0, seconds), true)
    setPositionSeconds(Math.max(0, seconds))
  }, [])

  const setShuffle = useCallback((enabled: boolean) => {
    playerRef.current?.setShuffle(enabled)
    setIsShuffled(enabled)
  }, [])

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const nextValue = !prev
      playerRef.current?.setShuffle(nextValue)
      return nextValue
    })
  }, [])

  const playAt = useCallback((index: number) => {
    playerRef.current?.playVideoAt(index)
  }, [])

  const playById = useCallback((videoIdToPlay: string) => {
    const player = playerRef.current
    if (!player) return
    const list = player.getPlaylist() ?? playlistIds
    const index = list.indexOf(videoIdToPlay)
    if (index >= 0) {
      player.playVideoAt(index)
    }
  }, [playlistIds])

  return {
    hostRef,
    ready,
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
    setShuffle,
    toggleShuffle,
    playAt,
    playById,
  }
}
