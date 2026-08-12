export interface SpotifyEmbedPlaybackData {
  playingURI?: string
  isPaused: boolean
  isBuffering: boolean
  duration: number
  position: number
}

export interface SpotifyEmbedController {
  loadUri: (
    spotifyUri: string,
    preferVideo?: boolean,
    startAt?: number,
  ) => void
  loadEntity: (
    spotifyUriOrUrl: string,
    preferVideo?: boolean,
    startAt?: number,
  ) => void
  play: () => void
  pause: () => void
  resume: () => void
  togglePlay: () => void
  restart: () => void
  seek: (seconds: number) => void
  destroy: () => void
  addListener: (
    event: 'ready' | 'playback_started' | 'playback_update',
    callback: (event: { data: SpotifyEmbedPlaybackData }) => void,
  ) => void
  removeListener: (
    event: 'ready' | 'playback_started' | 'playback_update',
    callback?: (event: { data: SpotifyEmbedPlaybackData }) => void,
  ) => void
}

export interface SpotifyIFrameApi {
  createController: (
    element: HTMLElement,
    options: {
      uri?: string
      url?: string
      width?: number | string
      height?: number | string
    },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameApi) => void
    __spotifyIframeApi?: SpotifyIFrameApi
  }
}

export {}
