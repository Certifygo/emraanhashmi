import type {
  Playlist,
  PlaylistTrack,
  YouTubeOEmbedResponse,
} from '../types/playlist'

const PLAYLIST_ID_PATTERN = /[?&]list=([a-zA-Z0-9_-]+)/

export function extractPlaylistId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const list = parsed.searchParams.get('list')
    if (list) return list
  } catch {
    // Fall through
  }

  const match = trimmed.match(PLAYLIST_ID_PATTERN)
  return match?.[1] ?? null
}

export function playlistOpenUrl(playlistId: string): string {
  return `https://music.youtube.com/playlist?list=${playlistId}`
}

export function videoOpenUrl(videoId: string): string {
  return `https://music.youtube.com/watch?v=${videoId}`
}

export function videoThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
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

export function getArtistLabel(track: PlaylistTrack): string {
  return track.artists.filter(Boolean).join(', ') || 'Unknown artist'
}

export async function fetchPlaylistOEmbed(
  playlistUrl: string,
  signal?: AbortSignal,
): Promise<YouTubeOEmbedResponse> {
  // oEmbed accepts standard youtube.com playlist URLs
  const playlistId = extractPlaylistId(playlistUrl)
  const canonical = playlistId
    ? `https://www.youtube.com/playlist?list=${playlistId}`
    : playlistUrl

  const endpoint = new URL('https://www.youtube.com/oembed')
  endpoint.searchParams.set('url', canonical)
  endpoint.searchParams.set('format', 'json')

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`YouTube oEmbed failed (${response.status})`)
  }

  return (await response.json()) as YouTubeOEmbedResponse
}

export type LoadPlaylistResult =
  | { ok: true; playlist: Playlist }
  | {
      ok: false
      kind: 'invalid_url' | 'unavailable' | 'youtube_unavailable'
      message: string
    }

export async function loadPlaylist(
  youtubePlaylistUrl: string,
  signal?: AbortSignal,
): Promise<LoadPlaylistResult> {
  const playlistId = extractPlaylistId(youtubePlaylistUrl)

  if (!playlistId) {
    return {
      ok: false,
      kind: 'invalid_url',
      message:
        'That does not look like a valid YouTube Music playlist URL. Expected something like https://music.youtube.com/playlist?list=PLAYLIST_ID',
    }
  }

  try {
    const oembed = await fetchPlaylistOEmbed(youtubePlaylistUrl, signal)
    const playlist: Playlist = {
      id: playlistId,
      name: oembed.title?.trim() || 'YouTube Music Playlist',
      description: '',
      ownerName: oembed.author_name?.trim() || 'YouTube Music',
      url: playlistOpenUrl(playlistId),
      coverArtUrl: oembed.thumbnail_url ?? null,
      tracks: [],
    }
    return { ok: true, playlist }
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
        kind: 'youtube_unavailable',
        message:
          'You appear to be offline. Connect to the internet to load playlist details from YouTube.',
      }
    }

    const message =
      error instanceof Error ? error.message : 'Unable to reach YouTube.'

    return {
      ok: false,
      kind: 'unavailable',
      message: `Playlist could not be loaded. ${message}`,
    }
  }
}

export function trackFromVideoData(
  videoId: string,
  title?: string,
  author?: string,
  durationSeconds?: number,
): PlaylistTrack {
  return {
    id: videoId,
    name: title?.trim() || 'Now playing',
    artists: author?.trim() ? [author.trim()] : ['YouTube Music'],
    albumName: '',
    albumArtUrl: videoThumbnailUrl(videoId),
    durationMs:
      durationSeconds && durationSeconds > 0
        ? Math.floor(durationSeconds * 1000)
        : 0,
    url: videoOpenUrl(videoId),
  }
}
