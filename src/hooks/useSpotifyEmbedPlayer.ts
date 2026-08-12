import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  SpotifyEmbedController,
  SpotifyIFrameApi,
} from '../types/spotify-embed'

const IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'

function loadSpotifyIframeApi(): Promise<SpotifyIFrameApi> {
  if (window.__spotifyIframeApi) {
    return Promise.resolve(window.__spotifyIframeApi)
  }

  return new Promise((resolve) => {
    const previous = window.onSpotifyIframeApiReady
    window.onSpotifyIframeApiReady = (api) => {
      window.__spotifyIframeApi = api
      previous?.(api)
      resolve(api)
    }

    if (!document.querySelector('script[data-spotify-iframe-api]')) {
      const script = document.createElement('script')
      script.src = IFRAME_API_SRC
      script.async = true
      script.dataset.spotifyIframeApi = 'true'
      document.body.appendChild(script)
    }
  })
}

export function trackUri(trackId: string): string {
  return `spotify:track:${trackId}`
}

export function playlistUri(playlistId: string): string {
  return `spotify:playlist:${playlistId}`
}

interface UseSpotifyEmbedPlayerOptions {
  initialUri: string
}

export function useSpotifyEmbedPlayer({
  initialUri,
}: UseSpotifyEmbedPlayerOptions) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const loadedUriRef = useRef<string | null>(null)
  const playAfterReadyRef = useRef(false)
  const bootUriRef = useRef(initialUri)

  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [positionMs, setPositionMs] = useState(0)
  const [durationMs, setDurationMs] = useState(0)
  const [playingUri, setPlayingUri] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      // Wait a frame so hostRef is attached after first paint.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })
      if (cancelled || !hostRef.current) return

      const api = await loadSpotifyIframeApi()
      if (cancelled || !hostRef.current || controllerRef.current) return

      api.createController(
        hostRef.current,
        {
          uri: bootUriRef.current,
          width: 300,
          height: 80,
        },
        (controller) => {
          if (cancelled) {
            controller.destroy()
            return
          }

          controllerRef.current = controller
          loadedUriRef.current = bootUriRef.current

          controller.addListener('ready', () => {
            setReady(true)
            if (playAfterReadyRef.current) {
              playAfterReadyRef.current = false
              controller.play()
            }
          })

          controller.addListener('playback_update', (event) => {
            const { isPaused, position, duration, playingURI } = event.data
            setIsPlaying(!isPaused)
            setPositionMs(position ?? 0)
            setDurationMs(duration ?? 0)
            if (playingURI) setPlayingUri(playingURI)
          })
        },
      )
    })()

    return () => {
      cancelled = true
      controllerRef.current?.destroy()
      controllerRef.current = null
      loadedUriRef.current = null
      setReady(false)
      setIsPlaying(false)
    }
  }, [])

  const playUri = useCallback((uri: string) => {
    const controller = controllerRef.current
    if (!controller) {
      bootUriRef.current = uri
      loadedUriRef.current = uri
      playAfterReadyRef.current = true
      setIsPlaying(true)
      return
    }

    if (loadedUriRef.current !== uri) {
      loadedUriRef.current = uri
      controller.loadUri(uri)
    }
    controller.play()
    setIsPlaying(true)
  }, [])

  const togglePlay = useCallback((uri: string) => {
    const controller = controllerRef.current
    if (!controller) {
      bootUriRef.current = uri
      loadedUriRef.current = uri
      playAfterReadyRef.current = true
      setIsPlaying(true)
      return
    }

    if (loadedUriRef.current !== uri) {
      loadedUriRef.current = uri
      controller.loadUri(uri)
      controller.play()
      setIsPlaying(true)
      return
    }

    controller.togglePlay()
  }, [])

  const pause = useCallback(() => {
    controllerRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const seek = useCallback((seconds: number) => {
    controllerRef.current?.seek(Math.max(0, Math.floor(seconds)))
  }, [])

  return {
    hostRef,
    ready,
    isPlaying,
    positionMs,
    durationMs,
    playingUri,
    playUri,
    togglePlay,
    pause,
    seek,
  }
}
