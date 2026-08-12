#!/usr/bin/env node
/**
 * Optional build-time sync: fetches playlist metadata + tracks via Spotify
 * Client Credentials and writes public/playlist-data.json.
 *
 * Secrets stay in environment variables — never in frontend code.
 *
 * Usage:
 *   export SPOTIFY_CLIENT_ID=...
 *   export SPOTIFY_CLIENT_SECRET=...
 *   npm run sync-playlist
 *
 * Reads the playlist URL from src/config/playlist.ts (spotifyPlaylistUrl).
 */

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function extractPlaylistId(url) {
  try {
    const parsed = new URL(url.trim())
    const match = parsed.pathname.match(/\/playlist\/([a-zA-Z0-9]+)/)
    if (match?.[1]) return match[1]
  } catch {
    // ignore
  }
  const match = url.match(/playlist[/:]([a-zA-Z0-9]+)/)
  return match?.[1] ?? null
}

function readPlaylistUrlFromConfig() {
  const configPath = join(root, 'src/config/playlist.ts')
  const source = readFileSync(configPath, 'utf8')
  const match = source.match(/spotifyPlaylistUrl:\s*['"]([^'"]+)['"]/)
  if (!match?.[1]) {
    throw new Error('Could not find spotifyPlaylistUrl in src/config/playlist.ts')
  }
  return match[1]
}

async function getAccessToken(clientId, clientSecret) {
  const body = new URLSearchParams({ grant_type: 'client_credentials' })
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token request failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  return data.access_token
}

async function fetchAllTracks(playlistId, token) {
  const tracks = []
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=next,items(track(id,name,artists(name),album(name,images),duration_ms,external_urls,preview_url,uri))`

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Tracks request failed (${response.status}): ${text}`)
    }
    const data = await response.json()
    for (const item of data.items ?? []) {
      const track = item?.track
      if (!track?.id) continue
      tracks.push({
        id: track.id,
        name: track.name,
        artists: (track.artists ?? []).map((a) => a.name),
        albumName: track.album?.name ?? '',
        albumArtUrl: track.album?.images?.[0]?.url ?? null,
        durationMs: track.duration_ms ?? 0,
        spotifyUrl:
          track.external_urls?.spotify ??
          `https://open.spotify.com/track/${track.id}`,
        previewUrl: track.preview_url ?? null,
        uri: track.uri,
      })
    }
    url = data.next
  }

  return tracks
}

async function fetchPlaylist(playlistId, token) {
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}?fields=id,name,description,owner(display_name),external_urls,images`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Playlist request failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  const tracks = await fetchAllTracks(playlistId, token)

  return {
    id: data.id,
    name: data.name,
    description: data.description ?? '',
    ownerName: data.owner?.display_name ?? 'Spotify',
    spotifyUrl:
      data.external_urls?.spotify ??
      `https://open.spotify.com/playlist/${playlistId}`,
    coverArtUrl: data.images?.[0]?.url ?? null,
    tracks,
  }
}

async function main() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error(
      'Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET.\n' +
        'Create a Spotify app at https://developer.spotify.com/dashboard\n' +
        'then export both values and re-run npm run sync-playlist.',
    )
    process.exit(1)
  }

  const playlistUrl = readPlaylistUrlFromConfig()
  const playlistId = extractPlaylistId(playlistUrl)

  if (!playlistId) {
    console.error(`Invalid playlist URL in config: ${playlistUrl}`)
    process.exit(1)
  }

  console.log(`Syncing playlist ${playlistId}…`)
  const token = await getAccessToken(clientId, clientSecret)
  const playlist = await fetchPlaylist(playlistId, token)

  const outDir = join(root, 'public')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, 'playlist-data.json')

  writeFileSync(
    outPath,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        playlist,
      },
      null,
      2,
    ),
  )

  console.log(
    `Wrote ${playlist.tracks.length} tracks to public/playlist-data.json`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
