import type {
  CachedPlaylistData,
  SpotifyOEmbedResponse,
  SpotifyPlaylist,
  SpotifyTrack,
} from '../types/spotify'

const PLAYLIST_ID_PATTERN = /playlist[/:]([a-zA-Z0-9]+)/

/** Resolve a public/ asset path for Vite `base: './'` (GitHub Pages safe). */
export function assetUrl(path: string): string {
  const cleaned = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${cleaned}`
}

export function extractPlaylistId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const fromPath = parsed.pathname.match(/\/playlist\/([a-zA-Z0-9]+)/)
    if (fromPath?.[1]) return fromPath[1]
  } catch {
    // Fall through to regex for non-standard strings
  }

  const match = trimmed.match(PLAYLIST_ID_PATTERN)
  return match?.[1] ?? null
}

export function playlistOpenUrl(playlistId: string): string {
  return `https://open.spotify.com/playlist/${playlistId}`
}

export function trackOpenUrl(trackId: string): string {
  return `https://open.spotify.com/track/${trackId}`
}

/** Official Spotify embed URL — supported on static sites without secrets. */
export function playlistEmbedUrl(playlistId: string, theme: 0 | 1 = 0): string {
  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=${theme}`
}

export function trackEmbedUrl(trackId: string, theme: 0 | 1 = 0): string {
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=${theme}`
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function parseOwnerFromTitle(title: string): { name: string; ownerName: string } {
  // oEmbed titles often look like: "Playlist Name · Playlist · Spotify"
  const parts = title.split('·').map((p) => p.trim()).filter(Boolean)
  const name = parts[0] || title || 'Spotify Playlist'
  return { name, ownerName: 'Spotify' }
}

export async function fetchOEmbed(
  playlistUrl: string,
  signal?: AbortSignal,
): Promise<SpotifyOEmbedResponse> {
  const endpoint = new URL('https://open.spotify.com/oembed')
  endpoint.searchParams.set('url', playlistUrl)

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Spotify oEmbed failed (${response.status})`)
  }

  return (await response.json()) as SpotifyOEmbedResponse
}

export async function loadCachedPlaylist(
  signal?: AbortSignal,
): Promise<SpotifyPlaylist | null> {
  try {
    const response = await fetch(assetUrl('playlist-data.json'), {
      method: 'GET',
      signal,
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    })

    if (response.status === 404) return null
    if (!response.ok) return null

    const data = (await response.json()) as CachedPlaylistData
    if (!data?.playlist?.id) return null
    return data.playlist
  } catch {
    return null
  }
}

export function playlistFromOEmbed(
  playlistId: string,
  oembed: SpotifyOEmbedResponse,
): SpotifyPlaylist {
  const { name, ownerName } = parseOwnerFromTitle(oembed.title || 'Playlist')

  return {
    id: playlistId,
    name,
    description: '',
    ownerName: oembed.author_name?.trim() || ownerName,
    spotifyUrl: playlistOpenUrl(playlistId),
    coverArtUrl: oembed.thumbnail_url ?? null,
    tracks: [],
  }
}

export type LoadPlaylistResult =
  | { ok: true; playlist: SpotifyPlaylist; source: 'oembed' | 'cached' }
  | { ok: false; kind: 'invalid_url' | 'unavailable' | 'spotify_unavailable'; message: string }

export async function loadPlaylist(
  spotifyPlaylistUrl: string,
  signal?: AbortSignal,
): Promise<LoadPlaylistResult> {
  const playlistId = extractPlaylistId(spotifyPlaylistUrl)

  if (!playlistId) {
    return {
      ok: false,
      kind: 'invalid_url',
      message:
        'That does not look like a valid Spotify playlist URL. Expected something like https://open.spotify.com/playlist/PLAYLIST_ID',
    }
  }

  const openUrl = playlistOpenUrl(playlistId)

  try {
    const cached = await loadCachedPlaylist(signal)
    if (cached && cached.id === playlistId) {
      return { ok: true, playlist: cached, source: 'cached' }
    }

    // Cached data for a different playlist — still try oEmbed for the configured URL
    const oembed = await fetchOEmbed(openUrl, signal)
    const playlist = playlistFromOEmbed(playlistId, oembed)

    // If cache exists for another id but has tracks and matches URL somehow, ignore it.
    // Prefer oEmbed metadata; attach cached tracks only when IDs match (handled above).
    if (cached && cached.id !== playlistId && cached.tracks.length > 0) {
      // Keep oEmbed playlist without foreign tracks
    }

    return { ok: true, playlist, source: 'oembed' }
  } catch (error) {
    if (signal?.aborted) {
      return {
        ok: false,
        kind: 'unavailable',
        message: 'Playlist request was cancelled.',
      }
    }

    const offline =
      typeof navigator !== 'undefined' && navigator.onLine === false

    if (offline) {
      return {
        ok: false,
        kind: 'spotify_unavailable',
        message:
          'You appear to be offline. Connect to the internet to load playlist details from Spotify.',
      }
    }

    const message =
      error instanceof Error ? error.message : 'Unable to reach Spotify.'

    return {
      ok: false,
      kind: 'unavailable',
      message: `Playlist could not be loaded. ${message}`,
    }
  }
}

export function openInSpotify(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function getArtistLabel(track: SpotifyTrack): string {
  return track.artists.filter(Boolean).join(', ') || 'Unknown artist'
}
