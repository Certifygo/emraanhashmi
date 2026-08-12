export interface PlaylistConfig {
  /** YouTube / YouTube Music playlist URL */
  youtubePlaylistUrl: string
  /** Fallback / loading-screen background. */
  backgroundImage: string
  /** Cycle through these after each song (loops). Falls back to `backgroundImage`. */
  backgroundImages: string[]
  showOpenButton: boolean
}

export interface PlaylistTrack {
  id: string
  name: string
  artists: string[]
  albumName: string
  albumArtUrl: string | null
  durationMs: number
  url: string
}

export interface Playlist {
  id: string
  name: string
  description: string
  ownerName: string
  url: string
  coverArtUrl: string | null
  tracks: PlaylistTrack[]
}

export interface YouTubeOEmbedResponse {
  title: string
  thumbnail_url?: string
  author_name?: string
  author_url?: string
  provider_name?: string
  html?: string
}
