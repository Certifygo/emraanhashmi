export interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  nextVideo: () => void
  previousVideo: () => void
  playVideoAt: (index: number) => void
  setShuffle: (shufflePlaylist: boolean) => void
  setLoop: (loopPlaylist: boolean) => void
  getPlayerState: () => number
  getCurrentTime: () => number
  getDuration: () => number
  getPlaylist: () => string[] | null
  getPlaylistIndex: () => number
  getVideoData: () => {
    video_id?: string
    title?: string
    author?: string
  }
  destroy: () => void
}

export interface YTPlayerEvent {
  target: YTPlayer
  data: number
}

export interface YTNamespace {
  Player: new (
    element: HTMLElement | string,
    options: {
      height?: string | number
      width?: string | number
      videoId?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: (event: YTPlayerEvent) => void
        onStateChange?: (event: YTPlayerEvent) => void
        onError?: (event: YTPlayerEvent) => void
      }
    },
  ) => YTPlayer
  PlayerState: {
    UNSTARTED: number
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
    CUED: number
  }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

export {}
