export interface PlaylistConfig {
  spotifyPlaylistUrl: string
  /** Fallback / loading-screen background. */
  backgroundImage: string
  /** Cycle through these after each song (loops). Falls back to `backgroundImage`. */
  backgroundImages: string[]
  showTrackList: boolean
  showSpotifyButton: boolean
}

export interface SpotifyImage {
  url: string
  width: number | null
  height: number | null
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: string[]
  albumName: string
  albumArtUrl: string | null
  durationMs: number
  spotifyUrl: string
  previewUrl: string | null
  uri: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  ownerName: string
  spotifyUrl: string
  coverArtUrl: string | null
  tracks: SpotifyTrack[]
}

export type PlaylistLoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; playlist: SpotifyPlaylist; source: 'oembed' | 'cached' }
  | { status: 'invalid_url'; message: string }
  | { status: 'unavailable'; message: string }
  | { status: 'empty'; playlist: SpotifyPlaylist }
  | { status: 'spotify_unavailable'; message: string }

export interface SpotifyOEmbedResponse {
  title: string
  thumbnail_url?: string
  provider_name?: string
  provider_url?: string
  html?: string
  width?: number
  height?: number
  type?: string
  version?: string
  /** Present on some responses as author / owner */
  author_name?: string
  author_url?: string
}

/** Shape written by `npm run sync-playlist` into public/playlist-data.json */
export interface CachedPlaylistData {
  fetchedAt: string
  playlist: SpotifyPlaylist
}
